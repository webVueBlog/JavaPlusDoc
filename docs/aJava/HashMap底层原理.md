# HashMap底层原理

## 概述

HashMap是Java中最常用的数据结构之一，基于哈希表实现，提供O(1)的平均查找、插入和删除性能。本文深入分析HashMap的底层实现原理，包括数据结构、哈希算法、扩容机制、红黑树优化等核心技术。

## HashMap基本结构

### 核心属性

```
public class HashMap<K,V> extends AbstractMap<K,V>
    implements Map<K,V>, Cloneable, Serializable {
    
    // 默认初始容量 16
    static final int DEFAULT_INITIAL_CAPACITY = 1 << 4;
    
    // 最大容量
    static final int MAXIMUM_CAPACITY = 1 << 30;
    
    // 默认负载因子
    static final float DEFAULT_LOAD_FACTOR = 0.75f;
    
    // 链表转红黑树的阈值
    static final int TREEIFY_THRESHOLD = 8;
    
    // 红黑树转链表的阈值
    static final int UNTREEIFY_THRESHOLD = 6;
    
    // 最小树化容量
    static final int MIN_TREEIFY_CAPACITY = 64;
    
    // 存储数据的数组
    transient Node<K,V>[] table;
    
    // 键值对数量
    transient int size;
    
    // 结构修改次数
    transient int modCount;
    
    // 扩容阈值
    int threshold;
    
    // 负载因子
    final float loadFactor;
}
```

### Node节点结构

```
static class Node<K,V> implements Map.Entry<K,V> {
    final int hash;    // 哈希值
    final K key;       // 键
    V value;           // 值
    Node<K,V> next;    // 下一个节点
    
    Node(int hash, K key, V value, Node<K,V> next) {
        this.hash = hash;
        this.key = key;
        this.value = value;
        this.next = next;
    }
    
    public final K getKey()        { return key; }
    public final V getValue()      { return value; }
    public final String toString() { return key + "=" + value; }
    
    public final int hashCode() {
        return Objects.hashCode(key) ^ Objects.hashCode(value);
    }
    
    public final V setValue(V newValue) {
        V oldValue = value;
        value = newValue;
        return oldValue;
    }
    
    public final boolean equals(Object o) {
        if (o == this)
            return true;
        if (o instanceof Map.Entry) {
            Map.Entry<?,?> e = (Map.Entry<?,?>)o;
            if (Objects.equals(key, e.getKey()) &&
                Objects.equals(value, e.getValue()))
                return true;
        }
        return false;
    }
}
```

## 哈希算法

### hash()方法实现

```
static final int hash(Object key) {
    int h;
    // key为null时返回0，否则计算hashCode并进行扰动
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}
```

**扰动函数设计原理：**
1. 获取key的hashCode值
2. 将hashCode的高16位与低16位进行异或运算
3. 目的：让高位也参与到索引计算中，减少哈希冲突

### 索引计算

```
// 计算数组索引
int index = (table.length - 1) & hash;
```

**为什么使用位运算：**
- HashMap的容量总是2的幂次方
- `(n-1) & hash` 等价于 `hash % n`，但位运算更快
- 例如：容量16，n-1=15(1111)，与任何hash值相与都能得到0-15的索引

### 哈希冲突解决

HashMap使用**链地址法**解决哈希冲突：

```
// JDK 1.8之前：纯链表结构
// 数组 + 链表

// JDK 1.8及之后：数组 + 链表 + 红黑树
// 当链表长度超过8且数组长度大于64时，链表转换为红黑树
```

## 核心方法实现

### put()方法

```
public V put(K key, V value) {
    return putVal(hash(key), key, value, false, true);
}

final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
               boolean evict) {
    Node<K,V>[] tab; Node<K,V> p; int n, i;
    
    // 1. 如果table为空或长度为0，进行初始化
    if ((tab = table) == null || (n = tab.length) == 0)
        n = (tab = resize()).length;
    
    // 2. 计算索引，如果该位置为空，直接插入
    if ((p = tab[i = (n - 1) & hash]) == null)
        tab[i] = newNode(hash, key, value, null);
    else {
        Node<K,V> e; K k;
        
        // 3. 如果key已存在，记录该节点
        if (p.hash == hash &&
            ((k = p.key) == key || (key != null && key.equals(k))))
            e = p;
        
        // 4. 如果是红黑树节点，调用红黑树插入方法
        else if (p instanceof TreeNode)
            e = ((TreeNode<K,V>)p).putTreeVal(this, tab, hash, key, value);
        
        // 5. 链表处理
        else {
            for (int binCount = 0; ; ++binCount) {
                // 遍历到链表末尾，插入新节点
                if ((e = p.next) == null) {
                    p.next = newNode(hash, key, value, null);
                    // 链表长度达到阈值，转换为红黑树
                    if (binCount >= TREEIFY_THRESHOLD - 1)
                        treeifyBin(tab, hash);
                    break;
                }
                // 找到相同key，跳出循环
                if (e.hash == hash &&
                    ((k = e.key) == key || (key != null && key.equals(k))))
                    break;
                p = e;
            }
        }
        
        // 6. 如果key已存在，更新value
        if (e != null) {
            V oldValue = e.value;
            if (!onlyIfAbsent || oldValue == null)
                e.value = value;
            afterNodeAccess(e);
            return oldValue;
        }
    }
    
    ++modCount;
    // 7. 检查是否需要扩容
    if (++size > threshold)
        resize();
    afterNodeInsertion(evict);
    return null;
}
```

### get()方法

```
public V get(Object key) {
    Node<K,V> e;
    return (e = getNode(hash(key), key)) == null ? null : e.value;
}

final Node<K,V> getNode(int hash, Object key) {
    Node<K,V>[] tab; Node<K,V> first, e; int n; K k;
    
    // 1. 检查table是否为空，计算索引位置
    if ((tab = table) != null && (n = tab.length) > 0 &&
        (first = tab[(n - 1) & hash]) != null) {
        
        // 2. 检查第一个节点
        if (first.hash == hash &&
            ((k = first.key) == key || (key != null && key.equals(k))))
            return first;
        
        // 3. 如果有后续节点
        if ((e = first.next) != null) {
            // 红黑树查找
            if (first instanceof TreeNode)
                return ((TreeNode<K,V>)first).getTreeNode(hash, key);
            
            // 链表查找
            do {
                if (e.hash == hash &&
                    ((k = e.key) == key || (key != null && key.equals(k))))
                    return e;
            } while ((e = e.next) != null);
        }
    }
    return null;
}
```

### remove()方法

```
public V remove(Object key) {
    Node<K,V> e;
    return (e = removeNode(hash(key), key, null, false, true)) == null ?
        null : e.value;
}

final Node<K,V> removeNode(int hash, Object key, Object value,
                           boolean matchValue, boolean movable) {
    Node<K,V>[] tab; Node<K,V> p; int n, index;
    
    // 1. 检查table和目标位置
    if ((tab = table) != null && (n = tab.length) > 0 &&
        (p = tab[index = (n - 1) & hash]) != null) {
        
        Node<K,V> node = null, e; K k; V v;
        
        // 2. 检查第一个节点
        if (p.hash == hash &&
            ((k = p.key) == key || (key != null && key.equals(k))))
            node = p;
        
        // 3. 查找目标节点
        else if ((e = p.next) != null) {
            if (p instanceof TreeNode)
                node = ((TreeNode<K,V>)p).getTreeNode(hash, key);
            else {
                do {
                    if (e.hash == hash &&
                        ((k = e.key) == key ||
                         (key != null && key.equals(k)))) {
                        node = e;
                        break;
                    }
                    p = e;
                } while ((e = e.next) != null);
            }
        }
        
        // 4. 删除节点
        if (node != null && (!matchValue || (v = node.value) == value ||
                             (value != null && value.equals(v)))) {
            if (node instanceof TreeNode)
                ((TreeNode<K,V>)node).removeTreeNode(this, tab, movable);
            else if (node == p)
                tab[index] = node.next;
            else
                p.next = node.next;
            ++modCount;
            --size;
            afterNodeRemoval(node);
            return node;
        }
    }
    return null;
}
```

## 扩容机制

### resize()方法

```
final Node<K,V>[] resize() {
    Node<K,V>[] oldTab = table;
    int oldCap = (oldTab == null) ? 0 : oldTab.length;
    int oldThr = threshold;
    int newCap, newThr = 0;
    
    // 1. 计算新容量和新阈值
    if (oldCap > 0) {
        // 已达到最大容量
        if (oldCap >= MAXIMUM_CAPACITY) {
            threshold = Integer.MAX_VALUE;
            return oldTab;
        }
        // 容量翻倍
        else if ((newCap = oldCap << 1) < MAXIMUM_CAPACITY &&
                 oldCap >= DEFAULT_INITIAL_CAPACITY)
            newThr = oldThr << 1;
    }
    else if (oldThr > 0)
        newCap = oldThr;
    else {
        // 初始化
        newCap = DEFAULT_INITIAL_CAPACITY;
        newThr = (int)(DEFAULT_LOAD_FACTOR * DEFAULT_INITIAL_CAPACITY);
    }
    
    if (newThr == 0) {
        float ft = (float)newCap * loadFactor;
        newThr = (newCap < MAXIMUM_CAPACITY && ft < (float)MAXIMUM_CAPACITY ?
                  (int)ft : Integer.MAX_VALUE);
    }
    
    threshold = newThr;
    Node<K,V>[] newTab = (Node<K,V>[])new Node[newCap];
    table = newTab;
    
    // 2. 数据迁移
    if (oldTab != null) {
        for (int j = 0; j < oldCap; ++j) {
            Node<K,V> e;
            if ((e = oldTab[j]) != null) {
                oldTab[j] = null;
                
                // 只有一个节点
                if (e.next == null)
                    newTab[e.hash & (newCap - 1)] = e;
                
                // 红黑树
                else if (e instanceof TreeNode)
                    ((TreeNode<K,V>)e).split(this, newTab, j, oldCap);
                
                // 链表
                else {
                    Node<K,V> loHead = null, loTail = null;
                    Node<K,V> hiHead = null, hiTail = null;
                    Node<K,V> next;
                    
                    do {
                        next = e.next;
                        // 原索引
                        if ((e.hash & oldCap) == 0) {
                            if (loTail == null)
                                loHead = e;
                            else
                                loTail.next = e;
                            loTail = e;
                        }
                        // 原索引 + oldCap
                        else {
                            if (hiTail == null)
                                hiHead = e;
                            else
                                hiTail.next = e;
                            hiTail = e;
                        }
                    } while ((e = next) != null);
                    
                    // 放置到新数组
                    if (loTail != null) {
                        loTail.next = null;
                        newTab[j] = loHead;
                    }
                    if (hiTail != null) {
                        hiTail.next = null;
                        newTab[j + oldCap] = hiHead;
                    }
                }
            }
        }
    }
    return newTab;
}
```

### 扩容优化

**JDK 1.8的扩容优化：**

```
// 扩容时，元素要么在原位置，要么在原位置+oldCap
// 通过 (e.hash & oldCap) 判断：
// - 结果为0：保持原索引
// - 结果为1：新索引 = 原索引 + oldCap

// 例如：oldCap = 16, newCap = 32
// hash = 5:  5 & 16 = 0, 新索引 = 5
// hash = 21: 21 & 16 = 16, 新索引 = 5 + 16 = 21
```

## 红黑树优化

### TreeNode结构

```
static final class TreeNode<K,V> extends LinkedHashMap.Entry<K,V> {
    TreeNode<K,V> parent;  // 父节点
    TreeNode<K,V> left;    // 左子节点
    TreeNode<K,V> right;   // 右子节点
    TreeNode<K,V> prev;    // 前驱节点（维护插入顺序）
    boolean red;           // 颜色
    
    TreeNode(int hash, K key, V val, Node<K,V> next) {
        super(hash, key, val, next);
    }
    
    // 返回根节点
    final TreeNode<K,V> root() {
        for (TreeNode<K,V> r = this, p;;) {
            if ((p = r.parent) == null)
                return r;
            r = p;
        }
    }
}
```

### 链表转红黑树

```
final void treeifyBin(Node<K,V>[] tab, int hash) {
    int n, index; Node<K,V> e;
    
    // 如果数组长度小于64，优先扩容而不是树化
    if (tab == null || (n = tab.length) < MIN_TREEIFY_CAPACITY)
        resize();
    else if ((e = tab[index = (n - 1) & hash]) != null) {
        TreeNode<K,V> hd = null, tl = null;
        
        // 1. 将链表节点转换为树节点
        do {
            TreeNode<K,V> p = replacementTreeNode(e, null);
            if (tl == null)
                hd = p;
            else {
                p.prev = tl;
                tl.next = p;
            }
            tl = p;
        } while ((e = e.next) != null);
        
        // 2. 构建红黑树
        if ((tab[index] = hd) != null)
            hd.treeify(tab);
    }
}
```

### 红黑树查找

```
final TreeNode<K,V> getTreeNode(int h, Object k) {
    return ((parent != null) ? root() : this).find(h, k, null);
}

final TreeNode<K,V> find(int h, Object k, Class<?> kc) {
    TreeNode<K,V> p = this;
    do {
        int ph, dir; K pk;
        TreeNode<K,V> pl = p.left, pr = p.right, q;
        
        // 根据hash值比较
        if ((ph = p.hash) > h)
            p = pl;
        else if (ph < h)
            p = pr;
        
        // hash相等，比较key
        else if ((pk = p.key) == k || (k != null && k.equals(pk)))
            return p;
        
        // hash相等但key不等，继续查找
        else if (pl == null)
            p = pr;
        else if (pr == null)
            p = pl;
        
        // 使用Comparable接口比较
        else if ((kc != null ||
                  (kc = comparableClassFor(k)) != null) &&
                 (dir = compareComparables(kc, k, pk)) != 0)
            p = (dir < 0) ? pl : pr;
        
        // 递归查找
        else if ((q = pr.find(h, k, kc)) != null)
            return q;
        else
            p = pl;
    } while (p != null);
    return null;
}
```

## 线程安全问题

### 并发问题

**1. 数据丢失**
```
// 两个线程同时put，可能导致数据丢失
Thread1: put("key1", "value1")
Thread2: put("key2", "value2")
// 如果hash冲突，后执行的可能覆盖前面的
```

**2. 死循环（JDK 1.7）**
```
// JDK 1.7的扩容过程中，并发操作可能导致链表形成环
// JDK 1.8通过改进扩容算法解决了这个问题
```

**3. 数据不一致**
```
// 扩容过程中的读操作可能读到不一致的数据
```

### 解决方案

**1. Collections.synchronizedMap()**
```
Map<String, String> map = Collections.synchronizedMap(new HashMap<>());
// 在每个方法上加synchronized，性能较差
```

**2. ConcurrentHashMap**
```
Map<String, String> map = new ConcurrentHashMap<>();
// 使用分段锁（JDK 1.7）或CAS+synchronized（JDK 1.8）
```

**3. ThreadLocal**
```
ThreadLocal<Map<String, String>> threadLocalMap = 
    ThreadLocal.withInitial(HashMap::new);
// 每个线程独立的HashMap实例
```

## 性能优化

### 1. 初始容量设置

```
// 根据预期元素数量设置初始容量
int expectedSize = 1000;
int initialCapacity = (int) (expectedSize / 0.75f) + 1;
Map<String, String> map = new HashMap<>(initialCapacity);
```

### 2. 负载因子选择

```
// 默认负载因子0.75是时间和空间的折中
// 更小的负载因子：更少冲突，更多内存
// 更大的负载因子：更多冲突，更少内存
Map<String, String> map = new HashMap<>(16, 0.6f);
```

### 3. key的hashCode优化

```
public class OptimizedKey {
    private final String value;
    private final int hashCode;
    
    public OptimizedKey(String value) {
        this.value = value;
        this.hashCode = value.hashCode(); // 缓存hashCode
    }
    
    @Override
    public int hashCode() {
        return hashCode; // 直接返回缓存值
    }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (!(obj instanceof OptimizedKey)) return false;
        OptimizedKey other = (OptimizedKey) obj;
        return Objects.equals(value, other.value);
    }
}
```

## 实际应用场景

### 1. 缓存实现

```
public class LRUCache<K, V> extends LinkedHashMap<K, V> {
    private final int capacity;
    
    public LRUCache(int capacity) {
        super(capacity, 0.75f, true);
        this.capacity = capacity;
    }
    
    @Override
    protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
        return size() > capacity;
    }
}
```

### 2. 计数器

```
public class Counter {
    private final Map<String, Integer> counts = new HashMap<>();
    
    public void increment(String key) {
        counts.merge(key, 1, Integer::sum);
    }
    
    public int getCount(String key) {
        return counts.getOrDefault(key, 0);
    }
}
```

### 3. 索引构建

```
public class InvertedIndex {
    private final Map<String, Set<Integer>> index = new HashMap<>();
    
    public void addDocument(int docId, String content) {
        String[] words = content.split("\\s+");
        for (String word : words) {
            index.computeIfAbsent(word.toLowerCase(), 
                k -> new HashSet<>()).add(docId);
        }
    }
    
    public Set<Integer> search(String word) {
        return index.getOrDefault(word.toLowerCase(), 
            Collections.emptySet());
    }
}
```

## 版本演进

### JDK 1.7 vs JDK 1.8

| 特性 | JDK 1.7 | JDK 1.8 |
|------|---------|----------|
| 数据结构 | 数组+链表 | 数组+链表+红黑树 |
| 插入方式 | 头插法 | 尾插法 |
| 扩容优化 | 重新计算hash | 位运算优化 |
| 树化阈值 | 无 | 链表长度>8且数组长度>64 |
| 并发安全 | 可能死循环 | 避免了死循环 |

### 关键改进

**1. 红黑树优化**
- 最坏情况下查找时间复杂度从O(n)降到O(logn)
- 避免了恶意hash攻击

**2. 扩容优化**
- 避免重新计算hash值
- 保持链表顺序，避免死循环

**3. hash函数优化**
- 高16位参与运算，减少冲突

## 总结

HashMap的高效性能源于其精心设计的实现：

1. **哈希算法**：扰动函数减少冲突，位运算提高性能
2. **动态扩容**：保持合适的负载因子，优化的扩容算法
3. **红黑树优化**：解决链表过长的性能问题
4. **内存布局**：紧凑的数据结构，良好的缓存局部性

理解HashMap的底层原理，有助于我们：
- 正确使用HashMap，避免性能陷阱
- 设计高质量的hashCode方法
- 选择合适的初始容量和负载因子
- 在并发场景下选择合适的替代方案

HashMap作为Java集合框架的核心组件，其设计思想和优化技巧值得深入学习和借鉴。