---
title: LinkedHashMap详解
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## LinkedHashMap详解

假如我们需要一个按照插入顺序来排列的键值对集合，那 HashMap 就无能为力了。那该怎么办呢？

LinkedHashMap。

为了提高查找效率，HashMap 在插入的时候对键做了一次哈希算法，这就导致插入的元素是无序的。

比如说默认大小为 16 的 HashMap，如果 put 了 4 个键值对，可能下标是 0、4、9、11，那这样的话，在遍历 HashMap 的时候，就不一定能按照插入顺序来了。

那怎么保证键值对的插入顺序呢？

LinkedHashMap 就是为这个需求应运而生的。LinkedHashMap 继承了 HashMap，所以 HashMap 有的关于键值对的功能，它也有了。

在此基础上，LinkedHashMap 内部追加了双向链表，来维护元素的插入顺序。注意下面代码中的 before 和 after，它俩就是用来维护当前元素的前一个元素和后一个元素的顺序的。

就是 null 会插入到 HashMap 的第一位。

虽然 null 最后一位 put 进去的，但在遍历输出的时候，跑到了第一位。

对比看一下 LinkedHashMap。

null 在最后一位插入，在最后一位输出。

输出结果可以再次证明，HashMap 是无序的，LinkedHashMap 是可以维持插入顺序的。

要想搞清楚，就需要深入研究一下 LinkedHashMap 的源码。LinkedHashMap 并未重写 HashMap 的 put() 方法，而是重写了 put() 方法需要调用的内部方法 newNode()。

这是 HashMap 的。

```
Node<K,V> newNode(int hash, K key, V value, Node<K,V> next) {
    return new Node<>(hash, key, value, next);
}
```

曾提到 LinkedHashMap.Entry 继承了 HashMap.Node，并且追加了两个字段 before 和 after，用来维持键值对的关系。

在 LinkedHashMap 中，链表中的节点顺序是按照插入顺序维护的。当使用 put() 方法向 LinkedHashMap 中添加键值对时，会将新节点插入到链表的尾部，并更新 before 和 after 属性，以保证链表的顺序关系——由 linkNodeLast() 方法来完成

LinkedHashMap 在添加第一个元素的时候，会把 head 赋值为第一个元素，等到第二个元素添加进来的时候，会把第二个元素的 before 赋值为第一个元素，第一个元素的 afer 赋值为第二个元素。

### 访问顺序

LinkedHashMap 不仅能够维持插入顺序，还能够维持访问顺序。访问包括调用 get() 方法、remove() 方法和 put() 方法。

要维护访问顺序，需要我们在声明 LinkedHashMap 的时候指定三个参数。

LinkedHashMap<String, String> map = new LinkedHashMap<>(16, .75f, true);

第一个参数和第二个参数，看过 HashMap 的同学们应该很熟悉了，指的是初始容量和负载因子。

第三个参数如果为 true 的话，就表示 LinkedHashMap 要维护访问顺序；否则，维护插入顺序。默认是 false。

也就是说，最不经常访问的放在头部，这就有意思了

## LRU 缓存

我们可以使用 LinkedHashMap 来实现 LRU 缓存，LRU 是 Least Recently Used 的缩写，即最近最少使用，是一种常用的页面置换算法，选择最近最久未使用的页面予以淘汰。

```
/**
 * 自定义的 MyLinkedHashMap 类，继承了 Java 中内置的 LinkedHashMap<K, V> 类。
 * 用于实现一个具有固定大小的缓存，当缓存达到最大容量时，会自动移除最早加入的元素，以腾出空间给新的元素。
 *
 * @param <K> 键的类型
 * @param <V> 值的类型
 */
public class MyLinkedHashMap<K, V> extends LinkedHashMap<K, V> {

    private static final int MAX_ENTRIES = 5; // 表示 MyLinkedHashMap 中最多存储的键值对数量

    /**
     * 构造方法，使用 super() 调用了父类的构造函数，并传递了三个参数：initialCapacity、loadFactor 和 accessOrder。
     *
     * @param initialCapacity 初始容量
     * @param loadFactor      负载因子
     * @param accessOrder     访问顺序
     */
    public MyLinkedHashMap(int initialCapacity, float loadFactor, boolean accessOrder) {
        super(initialCapacity, loadFactor, accessOrder);
    }

    /**
     * 重写父类的 removeEldestEntry() 方法，用于指示是否应该移除最早加入的元素。
     * 如果返回 true，那么将删除最早加入的元素。
     *
     * @param eldest 最早加入的元素
     * @return 如果当前 MyLinkedHashMap 中元素的数量大于 MAX_ENTRIES，返回 true，否则返回 false。
     */
    @Override
    protected boolean removeEldestEntry(Map.Entry eldest) {
        return size() > MAX_ENTRIES;
    }

}
```

由于 LinkedHashMap 要维护双向链表，所以 LinkedHashMap 在插入、删除操作的时候，花费的时间要比 HashMap 多一些。

这也是没办法的事，对吧，欲戴皇冠必承其重嘛。既然想要维护元素的顺序，总要付出点代价才行。

简单总结一下吧。

首先，我们知道 HashMap 是一种常用的哈希表数据结构，它可以快速地进行键值对的查找和插入操作。但是，HashMap 本身并不保证键值对的顺序，如果我们需要按照插入顺序或访问顺序来遍历键值对，就需要使用 LinkedHashMap 了。

LinkedHashMap 继承自 HashMap，它在 HashMap 的基础上，增加了一个双向链表来维护键值对的顺序。这个链表可以按照插入顺序或访问顺序排序，它的头节点表示最早插入或访问的元素，尾节点表示最晚插入或访问的元素。这个链表的作用就是让 LinkedHashMap 可以保持键值对的顺序，并且可以按照顺序遍历键值对。

LinkedHashMap 还提供了两个构造方法来指定排序方式，分别是按照插入顺序排序和按照访问顺序排序。在按照访问顺序排序的情况下，每次访问一个键值对，都会将该键值对移到链表的尾部，以保证最近访问的元素在最后面。如果需要删除最早加入的元素，可以通过重写 removeEldestEntry() 方法来实现。

总之，LinkedHashMap 通过维护一个双向链表来保持键值对的顺序，可以按照插入顺序或访问顺序来遍历键值对。如果你需要按照顺序来遍历键值对，那么 LinkedHashMap 就是你的不二选择了！

