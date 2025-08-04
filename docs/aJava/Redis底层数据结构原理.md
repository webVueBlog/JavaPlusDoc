# Redis底层数据结构原理

## 概述

Redis是一个高性能的键值存储数据库，其卓越的性能很大程度上得益于其精心设计的底层数据结构。本文深入分析Redis的核心数据结构实现原理，包括SDS、链表、字典、跳跃表、整数集合、压缩列表等。

## Redis对象系统

### 对象类型与编码

Redis使用对象来表示数据库中的键和值，每个对象都由一个redisObject结构表示：

```
typedef struct redisObject {
    unsigned type:4;        // 类型
    unsigned encoding:4;    // 编码
    unsigned lru:24;        // LRU时间
    int refcount;          // 引用计数
    void *ptr;             // 指向底层实现数据结构的指针
} robj;
```

**五种对象类型：**
- REDIS_STRING（字符串）
- REDIS_LIST（列表）
- REDIS_HASH（哈希）
- REDIS_SET（集合）
- REDIS_ZSET（有序集合）

## 简单动态字符串（SDS）

### SDS结构定义

```
struct sdshdr {
    unsigned int len;       // 记录buf数组中已使用字节的数量
    unsigned int free;      // 记录buf数组中未使用字节的数量
    char buf[];            // 字节数组，用于保存字符串
};
```

### SDS优势

**1. 常数复杂度获取字符串长度**
```
// C字符串获取长度：O(N)
size_t strlen(const char *s);

// SDS获取长度：O(1)
size_t sdslen(const sds s) {
    struct sdshdr *sh = (void*)(s-(sizeof(struct sdshdr)));
    return sh->len;
}
```

**2. 杜绝缓冲区溢出**
- SDS API会自动检查空间是否足够
- 不足时自动扩展空间

**3. 减少修改字符串时的内存重分配次数**
- **空间预分配**：扩展SDS时，不仅分配必须空间，还分配额外未使用空间
- **惰性空间释放**：缩短SDS时，不立即释放多出的字节

**4. 二进制安全**
- 使用len属性判断字符串结束
- 可以保存任意格式的二进制数据

### SDS空间分配策略

```
sds sdsMakeRoomFor(sds s, size_t addlen) {
    struct sdshdr *sh, *newsh;
    size_t free = sdsavail(s);
    size_t len, newlen;
    
    if (free >= addlen) return s;
    
    len = sdslen(s);
    sh = (void*) (s-(sizeof(struct sdshdr)));
    newlen = (len+addlen);
    
    // 空间预分配策略
    if (newlen < SDS_MAX_PREALLOC)
        newlen *= 2;  // 小于1MB时，分配2倍空间
    else
        newlen += SDS_MAX_PREALLOC;  // 大于1MB时，额外分配1MB
    
    newsh = zrealloc(sh, sizeof(struct sdshdr)+newlen+1);
    newsh->free = newlen - len;
    return newsh->buf;
}
```

## 链表（LinkedList）

### 链表节点结构

```
typedef struct listNode {
    struct listNode *prev;  // 前置节点
    struct listNode *next;  // 后置节点
    void *value;           // 节点的值
} listNode;

typedef struct list {
    listNode *head;        // 表头节点
    listNode *tail;        // 表尾节点
    void *(*dup)(void *ptr);     // 节点值复制函数
    void (*free)(void *ptr);     // 节点值释放函数
    int (*match)(void *ptr, void *key);  // 节点值对比函数
    unsigned long len;     // 链表所包含的节点数量
} list;
```

### 链表特性

- **双端**：获取前置和后置节点的复杂度都是O(1)
- **无环**：表头节点的prev指针和表尾节点的next指针都指向NULL
- **带表头指针和表尾指针**：获取表头和表尾节点的复杂度为O(1)
- **带链表长度计数器**：获取链表长度的复杂度为O(1)
- **多态**：使用void*指针保存节点值，可以保存各种不同类型的值

## 字典（Dictionary）

### 哈希表结构

```
typedef struct dictht {
    dictEntry **table;     // 哈希表数组
    unsigned long size;    // 哈希表大小
    unsigned long sizemask; // 哈希表大小掩码，用于计算索引值
    unsigned long used;    // 该哈希表已有节点的数量
} dictht;

typedef struct dictEntry {
    void *key;            // 键
    union {
        void *val;
        uint64_t u64;
        int64_t s64;
        double d;
    } v;                  // 值
    struct dictEntry *next; // 指向下个哈希表节点，形成链表
} dictEntry;

typedef struct dict {
    dictType *type;       // 类型特定函数
    void *privdata;       // 私有数据
    dictht ht[2];         // 哈希表
    long rehashidx;       // rehash索引，当rehash不在进行时，值为-1
    int iterators;        // 目前正在运行的安全迭代器的数量
} dict;
```

### 哈希算法

```
// 使用字典设置的哈希函数，计算键key的哈希值
hash = dict->type->hashFunction(key);

// 使用哈希表的sizemask属性和哈希值，计算出索引值
index = hash & dict->ht[x].sizemask;
```

### 解决键冲突

Redis使用**链地址法**解决键冲突：
- 每个哈希表节点都有一个next指针
- 多个哈希表节点可以用next指针构成一个单向链表
- 新节点总是添加到链表的表头位置（O(1)复杂度）

### rehash过程

**触发条件：**
- 负载因子 = ht[0].used / ht[0].size
- 扩展：负载因子 >= 1（无BGSAVE/BGREWRITEAOF时）或 >= 5
- 收缩：负载因子 < 0.1

**渐进式rehash步骤：**

```
int dictRehash(dict *d, int n) {
    int empty_visits = n * 10; // 最大空桶访问数
    
    if (!dictIsRehashing(d)) return 0;
    
    while(n-- && d->ht[0].used != 0) {
        dictEntry *de, *nextde;
        
        // 跳过空桶
        while(d->ht[0].table[d->rehashidx] == NULL) {
            d->rehashidx++;
            if (--empty_visits == 0) return 1;
        }
        
        de = d->ht[0].table[d->rehashidx];
        // 将链表中的所有节点迁移到ht[1]
        while(de) {
            uint64_t h;
            nextde = de->next;
            h = dictHashKey(d, de->key) & d->ht[1].sizemask;
            de->next = d->ht[1].table[h];
            d->ht[1].table[h] = de;
            d->ht[0].used--;
            d->ht[1].used++;
            de = nextde;
        }
        d->ht[0].table[d->rehashidx] = NULL;
        d->rehashidx++;
    }
    
    // 检查是否完成rehash
    if (d->ht[0].used == 0) {
        zfree(d->ht[0].table);
        d->ht[0] = d->ht[1];
        _dictReset(&d->ht[1]);
        d->rehashidx = -1;
        return 0;
    }
    return 1;
}
```

## 跳跃表（Skip List）

### 跳跃表结构

```
typedef struct zskiplistNode {
    sds ele;                           // 成员对象
    double score;                      // 分值
    struct zskiplistNode *backward;    // 后退指针
    struct zskiplistLevel {
        struct zskiplistNode *forward; // 前进指针
        unsigned long span;           // 跨度
    } level[];                        // 层
} zskiplistNode;

typedef struct zskiplist {
    struct zskiplistNode *header, *tail; // 表头节点和表尾节点
    unsigned long length;                // 表中节点的数量
    int level;                          // 表中层数最大的节点的层数
} zskiplist;
```

### 跳跃表特性

**1. 层级结构**
- 每个节点包含多个层
- 每层包含前进指针和跨度
- 层数随机生成（1-32层）

**2. 查找过程**
```
zskiplistNode *zslSearch(zskiplist *zsl, double score, sds ele) {
    zskiplistNode *x;
    int i;
    
    x = zsl->header;
    // 从最高层开始查找
    for (i = zsl->level-1; i >= 0; i--) {
        while (x->level[i].forward &&
               (x->level[i].forward->score < score ||
                (x->level[i].forward->score == score &&
                 sdscmp(x->level[i].forward->ele, ele) < 0)))
        {
            x = x->level[i].forward;
        }
    }
    
    x = x->level[0].forward;
    if (x && score == x->score && sdscmp(x->ele, ele) == 0) {
        return x;
    }
    return NULL;
}
```

**3. 层数生成算法**
```
int zslRandomLevel(void) {
    int level = 1;
    while ((random()&0xFFFF) < (ZSKIPLIST_P * 0xFFFF))
        level += 1;
    return (level<ZSKIPLIST_MAXLEVEL) ? level : ZSKIPLIST_MAXLEVEL;
}
```

## 整数集合（IntSet）

### 整数集合结构

```
typedef struct intset {
    uint32_t encoding; // 编码方式
    uint32_t length;   // 集合包含的元素数量
    int8_t contents[]; // 保存元素的数组
} intset;
```

### 编码类型

- **INTSET_ENC_INT16**：int16_t类型的整数值（-32768 ~ 32767）
- **INTSET_ENC_INT32**：int32_t类型的整数值
- **INTSET_ENC_INT64**：int64_t类型的整数值

### 升级过程

```
static intset *intsetUpgradeAndAdd(intset *is, int64_t value) {
    uint8_t curenc = intrev32ifbe(is->encoding);
    uint8_t newenc = _intsetValueEncoding(value);
    int length = intrev32ifbe(is->length);
    int prepend = value < 0 ? 1 : 0;
    
    // 设置新编码并调整大小
    is->encoding = intrev32ifbe(newenc);
    is = intsetResize(is, intrev32ifbe(is->length)+1);
    
    // 从后往前移动元素
    while(length--)
        _intsetSet(is, length+prepend, _intsetGetEncoded(is, length, curenc));
    
    // 添加新元素
    if (prepend)
        _intsetSet(is, 0, value);
    else
        _intsetSet(is, intrev32ifbe(is->length), value);
    
    is->length = intrev32ifbe(intrev32ifbe(is->length)+1);
    return is;
}
```

## 压缩列表（ZipList）

### 压缩列表结构

```
<zlbytes> <zltail> <zllen> <entry1> <entry2> ... <entryN> <zlend>
```

- **zlbytes**：记录整个压缩列表占用的内存字节数
- **zltail**：记录压缩列表表尾节点距离起始地址的偏移量
- **zllen**：记录压缩列表包含的节点数量
- **entryX**：列表节点
- **zlend**：特殊值0xFF，标记压缩列表的末端

### 压缩列表节点结构

```
<prevlen> <encoding> <entry-data>
```

**prevlen编码：**
- 前一节点长度小于254字节：使用1字节保存
- 前一节点长度大于等于254字节：使用5字节保存

**encoding编码：**
- 字节数组编码：00、01、10开头
- 整数编码：11开头

### 连锁更新问题

当插入或删除节点时，可能引发连锁更新：

```
// 示例：连续多个长度为253字节的节点
// 插入一个长度大于254字节的节点时
// 会导致后续节点的prevlen从1字节变为5字节
// 可能引发连锁反应
```

## 对象编码选择

### 字符串对象编码

```
robj *createStringObject(const char *ptr, size_t len) {
    if (len <= OBJ_ENCODING_EMBSTR_SIZE_LIMIT)
        return createEmbeddedStringObject(ptr, len);  // embstr编码
    else
        return createRawStringObject(ptr, len);       // raw编码
}

robj *createStringObjectFromLongLong(long long value) {
    if (value >= 0 && value < OBJ_SHARED_INTEGERS)
        return shared.integers[value];  // 共享整数对象
    else
        return createObject(OBJ_STRING, sdsfromlonglong(value));
}
```

### 列表对象编码转换

```
void listTypeConvert(robj *subject, int enc) {
    if (subject->encoding == OBJ_ENCODING_ZIPLIST) {
        // ziplist转换为linkedlist
        unsigned char *zl = subject->ptr;
        unsigned char *p = ziplistIndex(zl, 0);
        list *l = listCreate();
        
        while (p != NULL) {
            unsigned char *vstr;
            unsigned int vlen;
            long long vlong;
            
            if (ziplistGet(p, &vstr, &vlen, &vlong)) {
                robj *obj;
                if (vstr) {
                    obj = createStringObject((char*)vstr, vlen);
                } else {
                    obj = createStringObjectFromLongLong(vlong);
                }
                listAddNodeTail(l, obj);
            }
            p = ziplistNext(zl, p);
        }
        
        subject->ptr = l;
        subject->encoding = OBJ_ENCODING_LINKEDLIST;
        zfree(zl);
    }
}
```

## 内存优化策略

### 1. 共享对象

```
// Redis预创建0-9999的整数对象
struct sharedObjectsStruct {
    robj *crlf, *ok, *err, *emptybulk, *czero, *cone, *cnegone, *pong, *space,
    *colon, *nullbulk, *nullmultibulk, *queued,
    *emptymultibulk, *wrongtypeerr, *nokeyerr, *syntaxerr, *sameobjecterr,
    *outofrangeerr, *noscripterr, *loadingerr, *slowscripterr, *bgsaveerr,
    *masterdownerr, *roslaveerr, *execaborterr, *noautherr, *noreplicaserr,
    *busykeyerr, *oomerr, *plus, *messagebulk, *pmessagebulk, *subscribebulk,
    *unsubscribebulk, *psubscribebulk, *punsubscribebulk, *del, *rpop, *lpop,
    *lpush, *emptyscan, *minstring, *maxstring,
    *select[REDIS_SHARED_SELECT_CMDS],
    *integers[REDIS_SHARED_INTEGERS],
    *mbulkhdr[REDIS_SHARED_BULKHDR_LEN],
    *bulkhdr[REDIS_SHARED_BULKHDR_LEN];
} shared;
```

### 2. 引用计数

```
void incrRefCount(robj *o) {
    o->refcount++;
}

void decrRefCount(robj *o) {
    if (o->refcount <= 0) {
        switch(o->type) {
        case OBJ_STRING: freeStringObject(o); break;
        case OBJ_LIST: freeListObject(o); break;
        case OBJ_SET: freeSetObject(o); break;
        case OBJ_ZSET: freeZsetObject(o); break;
        case OBJ_HASH: freeHashObject(o); break;
        default: redisPanic("Unknown object type"); break;
        }
        zfree(o);
    } else {
        o->refcount--;
    }
}
```

### 3. 对象空转时长

```
// 计算对象的空转时长
unsigned long long estimateObjectIdleTime(robj *o) {
    unsigned long long lruclock = LRU_CLOCK();
    if (lruclock >= o->lru) {
        return (lruclock - o->lru) * LRU_CLOCK_RESOLUTION;
    } else {
        return (lruclock + (LRU_CLOCK_MAX - o->lru)) *
                LRU_CLOCK_RESOLUTION;
    }
}
```

## 性能分析

### 时间复杂度对比

| 操作 | SDS | C字符串 | 链表 | 跳跃表 | 哈希表 |
|------|-----|---------|------|--------|--------|
| 获取长度 | O(1) | O(N) | O(1) | - | - |
| 查找 | O(N) | O(N) | O(N) | O(logN) | O(1) |
| 插入 | O(N) | O(N) | O(1) | O(logN) | O(1) |
| 删除 | O(N) | O(N) | O(1) | O(logN) | O(1) |
| 范围查询 | - | - | O(N) | O(logN) | - |

### 空间复杂度分析

**SDS空间预分配：**
- 小于1MB：分配2倍空间
- 大于1MB：额外分配1MB
- 平均空间利用率：约50%

**跳跃表空间开销：**
- 平均每个节点层数：1/(1-p) ≈ 1.33（p=0.25）
- 额外指针开销：约33%

## 实际应用场景

### 1. 缓存系统

```
# 使用Redis作为缓存
import redis

r = redis.Redis(host='localhost', port=6379, db=0)

# 字符串缓存
r.setex('user:1001', 3600, json.dumps(user_data))
user_data = json.loads(r.get('user:1001'))

# 哈希缓存
r.hset('user:1001', 'name', 'John')
r.hset('user:1001', 'age', 30)
user_info = r.hgetall('user:1001')
```

### 2. 排行榜系统

```
# 使用有序集合实现排行榜
# 添加分数
r.zadd('leaderboard', {'player1': 1000, 'player2': 1500})

# 获取排行榜
top_players = r.zrevrange('leaderboard', 0, 9, withscores=True)

# 获取玩家排名
rank = r.zrevrank('leaderboard', 'player1')
```

### 3. 消息队列

```
# 使用列表实现消息队列
# 生产者
r.lpush('task_queue', json.dumps(task_data))

# 消费者
while True:
    task = r.brpop('task_queue', timeout=1)
    if task:
        process_task(json.loads(task[1]))
```

## 总结

Redis的高性能源于其精心设计的底层数据结构：

1. **SDS**：提供了比C字符串更高效的字符串操作
2. **链表**：支持快速的插入和删除操作
3. **字典**：提供O(1)的查找性能，通过渐进式rehash保证性能稳定
4. **跳跃表**：在有序数据上提供O(logN)的查找性能
5. **整数集合**：为小整数集合提供紧凑的存储
6. **压缩列表**：为小数据量提供内存高效的存储

这些数据结构的巧妙组合和优化，使Redis能够在保持高性能的同时，提供丰富的数据类型和操作，成为现代应用架构中不可或缺的组件。

理解这些底层原理，有助于我们更好地使用Redis，选择合适的数据类型，优化应用性能，并在遇到问题时能够深入分析和解决。