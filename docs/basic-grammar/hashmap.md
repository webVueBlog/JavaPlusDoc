---
title: HashMap详解
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## HashMap详解

Java 的 HashMap，包括 hash 方法的原理、HashMap 的扩容机制、HashMap 的加载因子为什么是 0.75 而不是 0.6、0.8，以及 HashMap 为什么是线程不安全的

HashMap 是 Java 中常用的数据结构之一，用于存储键值对。在 HashMap 中，每个键都映射到一个唯一的值，可以通过键来快速访问对应的值，算法时间复杂度可以达到 O(1)。

1）增加元素：

将一个键值对（元素）添加到 HashMap 中，可以使用 put() 方法。例如，将名字和年龄作为键值对添加到 HashMap 中：

```
HashMap<String, Integer> map = new HashMap<>();
map.put("aa", 20);
map.put("bb", 25);
```

2）删除元素：

从 HashMap 中删除一个键值对，可以使用 remove() 方法。例如，删除名字为 "aa" 的键值对：

```
map.remove("aa");
```

3）修改元素：

修改 HashMap 中的一个键值对，可以使用 put() 方法。例如，将名字为 "bb" 的年龄修改为 30：

```
map.put("bb", 30);
```

为什么和添加元素的方法一样呢？是因为 HashMap 的键是唯一的，所以再次 put 的时候会覆盖掉之前的键值对。

4）查找元素：

从 HashMap 中查找一个键对应的值，可以使用 get() 方法。例如，查找名字为 "bb" 的年龄：

```
int age = map.get("bb");
```

在实际应用中，HashMap 可以用于缓存、索引等场景。例如，可以将用户 ID 作为键，用户信息作为值，将用户信息缓存到 HashMap 中，以便快速查找。又如，可以将关键字作为键，文档 ID 列表作为值，将文档索引缓存到 HashMap 中，以便快速搜索文档。

HashMap 的实现原理是基于哈希表的，它的底层是一个数组，数组的每个位置可能是一个链表或红黑树，也可能只是一个键值对。当添加一个键值对时，HashMap 会根据键的哈希值计算出该键对应的数组下标（索引），然后将键值对插入到对应的位置。

## hash 方法的原理

简单了解 HashMap 后，我们来讨论第一个问题：hash 方法的原理，对吃透 HashMap 会大有帮助。

来看一下 hash 方法的源码（JDK 8 中的 HashMap）：

```
static final int hash(Object key) {
    int h;
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}
```

将 key 的 hashCode 值进行处理，得到最终的哈希值。

new 一个 HashMap，并通过 put 方法添加一个元素。

```
HashMap<String, String> map = new HashMap<>();
map.put("BB", "AA");
```

来看一下 put 方法的源码。

```
public V put(K key, V value) {
    return putVal(hash(key), key, value, false, true);
}
```

hash 方法的作用

HashMap 的底层是通过数组的形式实现的，初始大小是 16

也就是说，HashMap 在添加第一个元素的时候，需要通过键的哈希码在大小为 16 的数组中确定一个位置（索引），怎么确定呢？

画了一副图，16 个方格子（可以把它想象成一个一个桶），每个格子都有一个编号，对应大小为 16 的数组下标（索引）。

通过这个与运算 (n - 1) & hash，其中变量 n 为数组的长度，变量 hash 就是通过 hash() 方法计算后的结果。

hash 方法对计算键值对的位置起到了至关重要的作用。

```
static final int hash(Object key) {
    int h;
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}
```

1. 参数 key：需要计算哈希码的键值。
2. key == null ? 0 : (h = key.hashCode()) ^ (h >>> 16)：这是一个三目运算符，如果键值为 null，则哈希码为 0（依旧是说如果键为 null，则存放在第一个位置）；否则，通过调用hashCode()方法获取键的哈希码，并将其与右移 16 位的哈希码进行异或运算。
3. ^ 运算符：异或运算符是 Java 中的一种位运算符，它用于将两个数的二进制位进行比较，如果相同则为 0，不同则为 1。
4. h >>> 16：将哈希码向右移动 16 位，相当于将原来的哈希码分成了两个 16 位的部分。
5. 最终返回的是经过异或运算后得到的哈希码值。

这短短的一行代码，汇聚不少计算机巨佬们的聪明才智。

理论上，哈希值（哈希码）是一个 int 类型，范围从-2147483648 到 2147483648。

前后加起来大概 40 亿的映射空间，只要哈希值映射得比较均匀松散，一般是不会出现哈希碰撞（哈希冲突会降低 HashMap 的效率）。

但问题是一个 40 亿长度的数组，内存是放不下的。HashMap 扩容之前的数组初始大小只有 16，所以这个哈希值是不能直接拿来用的，用之前要和数组的长度做与运算，用得到的值来访问数组下标才行。

取模运算 VS 取余运算 VS 与运算

取模运算（Modulo Operation）和取余运算（Remainder Operation）从严格意义上来讲，是两种不同的运算方式，它们在计算机中的实现也不同。

在 Java 中，通常使用 % 运算符来表示取余，用 Math.floorMod() 来表示取模。

- 当操作数都是正数的话，取模运算和取余运算的结果是一样的。
- 只有当操作数出现负数的情况，结果才会有所不同。
- 取模运算的商向负无穷靠近；取余运算的商向 0 靠近。这是导致它们两个在处理有负数情况下，结果不同的根本原因。
- 当数组的长度是 2 的 n 次方，或者 n 次幂，或者 n 的整数倍时，取模运算/取余运算可以用位运算来代替，效率更高，毕竟计算机本身只认二进制嘛。

```
int a = -7;
int b = 3;

// a 对 b 取余
int remainder = a % b;
// a 对 b 取模
int modulus = Math.floorMod(a, b);

System.out.println("数字: a = " + a + ", b = " + b);
System.out.println("取余 (%): " + remainder);
System.out.println("取模 (Math.floorMod): " + modulus);

// 改变 a 和 b 的正负情况
a = 7;
b = -3;

remainder = a % b;
modulus = Math.floorMod(a, b);

System.out.println("\n数字: a = " + a + ", b = " + b);
System.out.println("取余 (%): " + remainder);
System.out.println("取模 (Math.floorMod): " + modulus);
```

hash 方法的主要作用是将 key 的 hashCode 值进行处理，得到最终的哈希值。由于 key 的 hashCode 值是不确定的，可能会出现哈希冲突，因此需要将哈希值通过一定的算法映射到 HashMap 的实际存储位置上。

hash 方法的原理是，先获取 key 对象的 hashCode 值，然后将其高位与低位进行异或操作，得到一个新的哈希值。为什么要进行异或操作呢？因为对于 hashCode 的高位和低位，它们的分布是比较均匀的，如果只是简单地将它们加起来或者进行位运算，容易出现哈希冲突，而异或操作可以避免这个问题。

然后将新的哈希值取模（mod），得到一个实际的存储位置。这个取模操作的目的是将哈希值映射到桶（Bucket）的索引上，桶是 HashMap 中的一个数组，每个桶中会存储着一个链表（或者红黑树），装载哈希值相同的键值对（没有相同哈希值的话就只存储一个键值对）。

总的来说，HashMap 的 hash 方法就是将 key 对象的 hashCode 值进行处理，得到最终的哈希值，并通过一定的算法映射到实际的存储位置上。这个过程决定了 HashMap 内部键值对的查找效率。

## HashMap 的扩容机制

数组一旦初始化后大小就无法改变了，所以就有了 ArrayList这种“动态数组”，可以自动扩容。

HashMap 的底层用的也是数组。向 HashMap 里不停地添加元素，当数组无法装载更多元素时，就需要对数组进行扩容，以便装入更多的元素；除此之外，容量的提升也会相应地提高查询效率，因为“桶（坑）”更多了嘛，原来需要通过链表存储的（查询的时候需要遍历），扩容后可能就有自己专属的“坑位”了（直接就能查出来）。

当然了，数组是无法自动扩容的，所以如果要扩容的话，就需要新建一个大的数组，然后把之前小的数组的元素复制过去，并且要重新计算哈希值和重新分配桶（重新散列），这个过程也是挺耗时的。

### resize 方法

HashMap 的扩容是通过 resize 方法来实现的，JDK 8 中融入了红黑树（链表长度超过 8 的时候，会将链表转化为红黑树来提高查询效率），对于新手来说，可能比较难理解。

为了减轻大家的学习压力，就还使用 JDK 7 的源码，搞清楚了 JDK 7 的，再看 JDK 8 的就会轻松很多。

来看 Java7 的 resize 方法源码，我加了注释：

```
// newCapacity为新的容量
void resize(int newCapacity) {
    // 小数组，临时过度下
    Entry[] oldTable = table;
    // 扩容前的容量
    int oldCapacity = oldTable.length;
    // MAXIMUM_CAPACITY 为最大容量，2 的 30 次方 = 1<<30
    if (oldCapacity == MAXIMUM_CAPACITY) {
        // 容量调整为 Integer 的最大值 0x7fffffff（十六进制）=2 的 31 次方-1
        threshold = Integer.MAX_VALUE;
        return;
    }

    // 初始化一个新的数组（大容量）
    Entry[] newTable = new Entry[newCapacity];
    // 把小数组的元素转移到大数组中
    transfer(newTable, initHashSeedAsNeeded(newCapacity));
    // 引用新的大数组
    table = newTable;
    // 重新计算阈值
    threshold = (int)Math.min(newCapacity * loadFactor, MAXIMUM_CAPACITY + 1);
}
```

注意，e.next = newTable[i]，也就是使用了单链表的头插入方式，同一位置上新元素总会被放在链表的头部位置；这样先放在一个索引上的元素最终会被放到链表的尾部，这就会导致在旧数组中同一个链表上的元素，通过重新计算索引位置后，有可能被放到了新数组的不同位置上。

为了解决这个问题，Java 8 做了很大的优化（讲扩容的时候会讲到）。

Java 8 扩容

JDK 8 的扩容源代码：

```
final Node<K,V>[] resize() {
    Node<K,V>[] oldTab = table; // 获取原来的数组 table
    int oldCap = (oldTab == null) ? 0 : oldTab.length; // 获取数组长度 oldCap
    int oldThr = threshold; // 获取阈值 oldThr
    int newCap, newThr = 0;
    if (oldCap > 0) { // 如果原来的数组 table 不为空
        if (oldCap >= MAXIMUM_CAPACITY) { // 超过最大值就不再扩充了，就只好随你碰撞去吧
            threshold = Integer.MAX_VALUE;
            return oldTab;
        }
        else if ((newCap = oldCap << 1) < MAXIMUM_CAPACITY && // 没超过最大值，就扩充为原来的2倍
                 oldCap >= DEFAULT_INITIAL_CAPACITY)
            newThr = oldThr << 1; // double threshold
    }
    else if (oldThr > 0) // initial capacity was placed in threshold
        newCap = oldThr;
    else { // zero initial threshold signifies using defaults
        newCap = DEFAULT_INITIAL_CAPACITY;
        newThr = (int)(DEFAULT_LOAD_FACTOR * DEFAULT_INITIAL_CAPACITY);
    }
    // 计算新的 resize 上限
    if (newThr == 0) {
        float ft = (float)newCap * loadFactor;
        newThr = (newCap < MAXIMUM_CAPACITY && ft < (float)MAXIMUM_CAPACITY ?
                  (int)ft : Integer.MAX_VALUE);
    }
    threshold = newThr; // 将新阈值赋值给成员变量 threshold
    @SuppressWarnings({"rawtypes","unchecked"})
        Node<K,V>[] newTab = (Node<K,V>[])new Node[newCap]; // 创建新数组 newTab
    table = newTab; // 将新数组 newTab 赋值给成员变量 table
    if (oldTab != null) { // 如果旧数组 oldTab 不为空
        for (int j = 0; j < oldCap; ++j) { // 遍历旧数组的每个元素
            Node<K,V> e;
            if ((e = oldTab[j]) != null) { // 如果该元素不为空
                oldTab[j] = null; // 将旧数组中该位置的元素置为 null，以便垃圾回收
                if (e.next == null) // 如果该元素没有冲突
                    newTab[e.hash & (newCap - 1)] = e; // 直接将该元素放入新数组
                else if (e instanceof TreeNode) // 如果该元素是树节点
                    ((TreeNode<K,V>)e).split(this, newTab, j, oldCap); // 将该树节点分裂成两个链表
                else { // 如果该元素是链表
                    Node<K,V> loHead = null, loTail = null; // 低位链表的头结点和尾结点
                    Node<K,V> hiHead = null, hiTail = null; // 高位链表的头结点和尾结点
                    Node<K,V> next;
                    do { // 遍历该链表
                        next = e.next;
                        if ((e.hash & oldCap) == 0) { // 如果该元素在低位链表中
                            if (loTail == null) // 如果低位链表还没有结点
                                loHead = e; // 将该元素作为低位链表的头结点
                            else
                                loTail.next = e; // 如果低位链表已经有结点，将该元素加入低位链表的尾部
                            loTail = e; // 更新低位链表的尾结点
                        }
                        else { // 如果该元素在高位链表中
                            if (hiTail == null) // 如果高位链表还没有结点
                                hiHead = e; // 将该元素作为高位链表的头结点
                            else
                                hiTail.next = e; // 如果高位链表已经有结点，将该元素加入高位链表的尾部
                            hiTail = e; // 更新高位链表的尾结点
                        }
                    } while ((e = next) != null); //
                    if (loTail != null) { // 如果低位链表不为空
                        loTail.next = null; // 将低位链表的尾结点指向 null，以便垃圾回收
                        newTab[j] = loHead; // 将低位链表作为新数组对应位置的元素
                    }
                    if (hiTail != null) { // 如果高位链表不为空
                        hiTail.next = null; // 将高位链表的尾结点指向 null，以便垃圾回收
                        newTab[j + oldCap] = hiHead; // 将高位链表作为新数组对应位置的元素
                    }
                }
            }
        }
    }
    return newTab; // 返回新数组
}
```

当我们往 HashMap 中不断添加元素时，HashMap 会自动进行扩容操作（条件是元素数量达到负载因子（load factor）乘以数组长度时），以保证其存储的元素数量不会超出其容量限制。

在进行扩容操作时，HashMap 会先将数组的长度扩大一倍，然后将原来的元素重新散列到新的数组中。

由于元素的位置是通过 key 的 hash 和数组长度进行与运算得到的，因此在数组长度扩大后，元素的位置也会发生一些改变。一部分索引不变，另一部分索引为“原索引+旧容量”。

## 加载因子为什么是 0.75

加载因子（或者叫负载因子），那么这个问题我们来讨论为什么加载因子是 0.75 而不是 0.6、0.8。

我们知道，HashMap 是用数组+链表/红黑树实现的，我们要想往 HashMap 中添加数据（元素/键值对）或者取数据，就需要确定数据在数组中的下标（索引）。

先把数据的键进行一次 hash：

```
static final int hash(Object key) {
    int h;
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}
```

再做一次取模运算确定下标：

i = (n - 1) & hash

那这样的过程容易产生两个问题：

* 数组的容量过小，经过哈希计算后的下标，容易出现冲突；
* 数组的容量过大，导致空间利用率不高。

加载因子是用来表示 HashMap 中数据的填满程度：

加载因子 = 填入哈希表中的数据个数 / 哈希表的长度

这就意味着：

* 加载因子越小，填满的数据就越少，哈希冲突的几率就减少了，但浪费了空间，而且还会提高扩容的触发几率；
* 加载因子越大，填满的数据就越多，空间利用率就高，但哈希冲突的几率就变大了。

这就必须在“哈希冲突”与“空间利用率”两者之间有所取舍，尽量保持平衡，谁也不碍着谁。

我们知道，HashMap 是通过拉链法来解决哈希冲突的。

为了减少哈希冲突发生的概率，当 HashMap 的数组长度达到一个临界值的时候，就会触发扩容，扩容后会将之前小数组中的元素转移到大数组中，这是一个相当耗时的操作。

这个临界值由什么来确定呢？

临界值 = 初始容量 * 加载因子

一开始，HashMap 的容量是 16：

static final int DEFAULT_INITIAL_CAPACITY = 1 << 4; // aka 16

加载因子是 0.75：

static final float DEFAULT_LOAD_FACTOR = 0.75f;

也就是说，当 16*0.75=12 时，会触发扩容机制。

为什么加载因子会选择 0.75 呢？为什么不是 0.8、0.6 呢？

这跟统计学里的一个很重要的原理——泊松分布有关。

是时候上维基百科了：

> 泊松分布，是一种统计与概率学里常见到的离散概率分布，由法国数学家西莫恩·德尼·泊松在 1838 年时提出。它会对随机事件的发生次数进行建模，适用于涉及计算在给定的时间段、距离、面积等范围内发生随机事件的次数的应用情形。

HashMap 的加载因子（load factor，直译为加载因子，意译为负载因子）是指哈希表中填充元素的个数与桶的数量的比值，当元素个数达到负载因子与桶的数量的乘积时，就需要进行扩容。这个值一般选择 0.75，是因为这个值可以在时间和空间成本之间做到一个折中，使得哈希表的性能达到较好的表现。

如果负载因子过大，填充因子较多，那么哈希表中的元素就会越来越多地聚集在少数的桶中，这就导致了冲突的增加，这些冲突会导致查找、插入和删除操作的效率下降。同时，这也会导致需要更频繁地进行扩容，进一步降低了性能。

如果负载因子过小，那么桶的数量会很多，虽然可以减少冲突，但是在空间利用上面也会有浪费，因此选择 0.75 是为了取得一个平衡点，即在时间和空间成本之间取得一个比较好的平衡点。

总之，选择 0.75 这个值是为了在时间和空间成本之间达到一个较好的平衡点，既可以保证哈希表的性能表现，又能够充分利用空间。

## 线程不安全

三方面原因：

1. 多线程下扩容会死循环
2. 多线程下 put 会导致元素丢失
3. put 和 get 并发时会导致 get 到 null

### 1）多线程下扩容会死循环

HashMap 是通过拉链法来解决哈希冲突的，也就是当哈希冲突时，会将相同哈希值的键值对通过链表的形式存放起来。

JDK 7 时，采用的是头部插入的方式来存放链表的，也就是下一个冲突的键值对会放在上一个键值对的前面。扩容的时候就有可能导致出现环形链表，造成死循环。

resize 方法的源码：

```
// newCapacity为新的容量
void resize(int newCapacity) {
    // 小数组，临时过度下
    Entry[] oldTable = table;
    // 扩容前的容量
    int oldCapacity = oldTable.length;
    // MAXIMUM_CAPACITY 为最大容量，2 的 30 次方 = 1<<30
    if (oldCapacity == MAXIMUM_CAPACITY) {
        // 容量调整为 Integer 的最大值 0x7fffffff（十六进制）=2 的 31 次方-1
        threshold = Integer.MAX_VALUE;
        return;
    }

    // 初始化一个新的数组（大容量）
    Entry[] newTable = new Entry[newCapacity];
    // 把小数组的元素转移到大数组中
    transfer(newTable, initHashSeedAsNeeded(newCapacity));
    // 引用新的大数组
    table = newTable;
    // 重新计算阈值
    threshold = (int)Math.min(newCapacity * loadFactor, MAXIMUM_CAPACITY + 1);
}
```

transfer 方法用来转移，将小数组的元素拷贝到新的数组中。

```
void transfer(Entry[] newTable, boolean rehash) {
    // 新的容量
    int newCapacity = newTable.length;
    // 遍历小数组
    for (Entry<K,V> e : table) {
        while(null != e) {
            // 拉链法，相同 key 上的不同值
            Entry<K,V> next = e.next;
            // 是否需要重新计算 hash
            if (rehash) {
                e.hash = null == e.key ? 0 : hash(e.key);
            }
            // 根据大数组的容量，和键的 hash 计算元素在数组中的下标
            int i = indexFor(e.hash, newCapacity);

            // 同一位置上的新元素被放在链表的头部
            e.next = newTable[i];

            // 放在新的数组上
            newTable[i] = e;

            // 链表上的下一个元素
            e = next;
        }
    }
}
```

注意 e.next = newTable[i] 和 newTable[i] = e 这两行代码，它们会将同一位置上的新元素放在链表的头部。

### 2）多线程下 put 会导致元素丢失

正常情况下，当发生哈希冲突时，HashMap 是这样的：

但多线程同时执行 put 操作时，如果计算出来的索引位置是相同的，那会造成前一个 key 被后一个 key 覆盖，从而导致元素的丢失。

### 3）put 和 get 并发时会导致 get 到 null

HashMap 是线程不安全的主要是因为它在进行插入、删除和扩容等操作时可能会导致链表的结构发生变化，从而破坏了 HashMap 的不变性。具体来说，如果在一个线程正在遍历 HashMap 的链表时，另外一个线程对该链表进行了修改（比如添加了一个节点），那么就会导致链表的结构发生变化，从而破坏了当前线程正在进行的遍历操作，可能导致遍历失败或者出现死循环等问题。

为了解决这个问题，Java 提供了线程安全的 HashMap 实现类 ConcurrentHashMap。ConcurrentHashMap 内部采用了分段锁（Segment），将整个 Map 拆分为多个小的 HashMap，每个小的 HashMap 都有自己的锁，不同的线程可以同时访问不同的小 Map，从而实现了线程安全。在进行插入、删除和扩容等操作时，只需要锁住当前小 Map，不会对整个 Map 进行锁定，提高了并发访问的效率。

## 小结

HashMap 是 Java 中最常用的集合之一，它是一种键值对存储的数据结构，可以根据键来快速访问对应的值。以下是对 HashMap 的总结：

1. HashMap 采用数组+链表/红黑树的存储结构，能够在 O(1)的时间复杂度内实现元素的添加、删除、查找等操作。
2. HashMap 是线程不安全的，因此在多线程环境下需要使用ConcurrentHashMap来保证线程安全。
3. HashMap 的扩容机制是通过扩大数组容量和重新计算 hash 值来实现的，扩容时需要重新计算所有元素的 hash 值，因此在元素较多时扩容会影响性能。
4. 在 Java 8 中，HashMap 的实现引入了拉链法、树化等机制来优化大量元素存储的情况，进一步提升了性能。
5. HashMap 中的 key 是唯一的，如果要存储重复的 key，则后面的值会覆盖前面的值。
6. HashMap 的初始容量和加载因子都可以设置，初始容量表示数组的初始大小，加载因子表示数组的填充因子。一般情况下，初始容量为 16，加载因子为 0.75。
7. HashMap 在遍历时是无序的，因此如果需要有序遍历，可以使用TreeMap。

综上所述，HashMap 是一种高效的数据结构，具有快速查找和插入元素的能力，但需要注意线程安全和性能问题。






















