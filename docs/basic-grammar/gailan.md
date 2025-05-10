---
title: List与Set与Queue与Map
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## List与Set与Queue与Map

Java 集合框架可以分为两条大的支线：

①、Collection，主要由 List、Set、Queue 组成：

List 代表有序、可重复的集合，典型代表就是封装了动态数组的 ArrayList 和封装了链表的 LinkedList；

Set 代表无序、不可重复的集合，典型代表就是 HashSet 和 TreeSet；

Queue 代表队列，典型代表就是双端队列 ArrayDeque，以及优先级队列 PriorityQueue。

②、Map，代表键值对的集合，典型代表就是 HashMap。

## List

List 的特点是存取有序，可以存放重复的元素，可以用下标对元素进行操作。

1）ArrayList

```
// 创建一个集合
ArrayList<String> list = new ArrayList<String>();
// 添加元素
list.add("aa");
list.add("bb");
list.add("cc");

// 遍历集合 for 循环
for (int i = 0; i < list.size(); i++) {
    String s = list.get(i);
    System.out.println(s);
}
// 遍历集合 for each
for (String s : list) {
    System.out.println(s);
}

// 删除元素
list.remove(1);
// 遍历集合
for (String s : list) {
    System.out.println(s);
}

// 修改元素
list.set(1, "dd");
// 遍历集合
for (String s : list) {
    System.out.println(s);
}
```
- ArrayList 是由数组实现的，支持随机存取，也就是可以通过下标直接存取元素；
- 从尾部插入和删除元素会比较快捷，从中间插入和删除元素会比较低效，因为涉及到数组元素的复制和移动；
- 如果内部数组的容量不足时会自动扩容，因此当元素非常庞大的时候，效率会比较低。

2）LinkedList

同样先来一段 LinkedList 的增删改查，和 ArrayList 几乎没什么差别。

```
// 创建一个集合
LinkedList<String> list = new LinkedList<String>();
// 添加元素
list.add("aa");
list.add("bb");
list.add("cc");

// 遍历集合 for 循环
for (int i = 0; i < list.size(); i++) {
    String s = list.get(i);
    System.out.println(s);
}
// 遍历集合 for each
for (String s : list) {
    System.out.println(s);
}

// 删除元素
list.remove(1);
// 遍历集合
for (String s : list) {
    System.out.println(s);
}

// 修改元素
list.set(1, "dd");
// 遍历集合
for (String s : list) {
    System.out.println(s);
}
```

- LinkedList 是由双向链表实现的，不支持随机存取，只能从一端开始遍历，直到找到需要的元素后返回；
- 任意位置插入和删除元素都很方便，因为只需要改变前一个节点和后一个节点的引用即可，不像 ArrayList 那样需要复制和移动数组元素；
- 因为每个元素都存储了前一个和后一个节点的引用，所以相对来说，占用的内存空间会比 ArrayList 多一些。

3）Vector 和 Stack

List 的实现类还有一个 Vector，是一个元老级的类，比 ArrayList 出现得更早。ArrayList 和 Vector 非常相似，只不过 Vector 是线程安全的，像 get、set、add 这些方法都加了 synchronized 关键字，就导致执行效率会比较低，所以现在已经很少用了。

我就不写太多代码了，只看一下 add 方法的源码就明白了。

```java
public synchronized boolean add(E e) {
    elementData[elementCount++] = e;
    return true;
}
```

这种加了同步方法的类，注定会被淘汰掉，就像StringBuilder 取代 StringBuffer那样。JDK 源码也说了：

如果不需要线程安全，建议使用 ArrayList 代替 Vector。

Stack 是 Vector 的一个子类，本质上也是由动态数组实现的，只不过还实现了先进后出的功能（在 get、set、add 方法的基础上追加了 pop「返回并移除栈顶的元素」、peek「只返回栈顶元素」等方法），所以叫栈。

下面是这两个方法的源码，增删改查我就不写了，和 ArrayList 和 LinkedList 几乎一样。

不过，由于 Stack 执行效率比较低（方法上同样加了 synchronized 关键字），就被双端队列 ArrayDeque 取代了

## Set

Set 的特点是存取无序，不可以存放重复的元素，不可以用下标对元素进行操作，和 List 有很多不同。

1）HashSet

HashSet 其实是由 HashMap 实现的，只不过值由一个固定的 Object 对象填充，而键用于操作。

实际开发中，HashSet 并不常用，比如，如果我们需要按照顺序存储一组元素，那么 ArrayList 和 LinkedList 可能更适合；如果我们需要存储键值对并根据键进行查找，那么 HashMap 可能更适合。

HashSet 主要用于去重，比如，我们需要统计一篇文章中有多少个不重复的单词，就可以使用 HashSet 来实现。

```
// 创建一个 HashSet 对象
HashSet<String> set = new HashSet<>();

// 添加元素
set.add("aa");
set.add("bb");
set.add("cc");
set.add("bb");

// 输出 HashSet 的元素个数
System.out.println("HashSet size: " + set.size()); // output: 3

// 遍历 HashSet
for (String s : set) {
    System.out.println(s);
}
```

2）LinkedHashSet

LinkedHashSet 虽然继承自 HashSet

这是 LinkedHashSet 的无参构造方法：

```
public LinkedHashSet() {
    super(16, .75f, true);
}
```

super 的意思是它将调用父类的 HashSet 的一个有参构造方法：

```java
HashSet(int initialCapacity, float loadFactor, boolean dummy) {
    map = new LinkedHashMap<>(initialCapacity, loadFactor);
}
```

来看一段 LinkedHashSet 的增删改查吧。

```
LinkedHashSet<String> set = new LinkedHashSet<>();

// 添加元素
set.add("aa");
set.add("bb");
set.add("cc");

// 删除元素
set.remove("bb");

// 修改元素
set.remove("aa");
set.add("dd");

// 查找元素
boolean hasChenQingYang = set.contains("陈清扬");
System.out.println("set包含陈清扬吗？" + hasChenQingYang);
```

LinkedHashSet 是一种基于哈希表实现的 Set 接口，它继承自 HashSet，并且使用链表维护了元素的插入顺序。因此，它既具有 HashSet 的快速查找、插入和删除操作的优点，又可以维护元素的插入顺序

3）TreeSet

TreeSet 是由 TreeMap 实现的，只不过同样操作的键位，值由一个固定的 Object 对象填充。

TreeSet 是一种基于红黑树实现的有序集合，它实现了 SortedSet 接口，可以自动对集合中的元素进行排序。按照键的自然顺序或指定的比较器顺序进行排序。

需要注意的是，TreeSet 不允许插入 null 元素，否则会抛出 NullPointerException 异常。

总体上来说，Set 集合不是关注的重点，因为底层都是由 Map 实现的，为什么要用 Map 实现呢？

因为 Map 的键不允许重复、无序

## Queue

Queue，也就是队列，通常遵循先进先出（FIFO）的原则，新元素插入到队列的尾部，访问元素返回队列的头部。

1）ArrayDeque

从名字上可以看得出，ArrayDeque 是一个基于数组实现的双端队列，为了满足可以同时在数组两端插入或删除元素的需求，数组必须是循环的，也就是说数组的任何一点都可以被看作是起点或者终点。

head 指向队首的第一个有效的元素，tail 指向队尾第一个可以插入元素的空位，因为是循环数组，所以 head 不一定从是从 0 开始，tail 也不一定总是比 head 大。

LinkedList 一般应该归在 List 下，只不过，它也实现了 Deque 接口，可以作为队列来使用。等于说，LinkedList 同时实现了 Stack、Queue、PriorityQueue 的所有功能。

换句话说，LinkedList 和 ArrayDeque 都是 Java 集合框架中的双向队列（deque），它们都支持在队列的两端进行元素的插入和删除操作。不过，LinkedList 和 ArrayDeque 在实现上有一些不同：

- 底层实现方式不同：LinkedList 是基于链表实现的，而 ArrayDeque 是基于数组实现的。
- 随机访问的效率不同：由于底层实现方式的不同，LinkedList 对于随机访问的效率较低，时间复杂度为 O(n)，而 ArrayDeque 可以通过下标随机访问元素，时间复杂度为 O(1)。
- 迭代器的效率不同：LinkedList 对于迭代器的效率比较低，因为需要通过链表进行遍历，时间复杂度为 O(n)，而 ArrayDeque 的迭代器效率比较高，因为可以直接访问数组中的元素，时间复杂度为 O(1)。
- 内存占用不同：由于 LinkedList 是基于链表实现的，它在存储元素时需要额外的空间来存储链表节点，因此内存占用相对较高，而 ArrayDeque 是基于数组实现的，内存占用相对较低。

因此，在选择使用 LinkedList 还是 ArrayDeque 时，需要根据具体的业务场景和需求来选择。如果需要在双向队列的两端进行频繁的插入和删除操作，并且需要随机访问元素，可以考虑使用 ArrayDeque；如果需要在队列中间进行频繁的插入和删除操作，可以考虑使用 LinkedList。

在使用 LinkedList 作为队列时，可以使用 offer() 方法将元素添加到队列的末尾，使用 poll() 方法从队列的头部删除元素。另外，由于 LinkedList 是链表结构，不支持随机访问元素，因此不能使用下标访问元素，需要使用迭代器或者 poll() 方法依次遍历元素。

3）PriorityQueue

PriorityQueue 是一种优先级队列，它的出队顺序与元素的优先级有关，执行 remove 或者 poll 方法，返回的总是优先级最高的元素。

要想有优先级，元素就需要实现 Comparable 接口或者 Comparator 接口

通过实现 Comparator 接口按照年龄姓名排序的优先级队列


## Map

Map 保存的是键值对，键要求保持唯一性，值可以重复。

1）HashMap

HashMap 实现了 Map 接口，可以根据键快速地查找对应的值——通过哈希函数将键映射到哈希表中的一个索引位置，从而实现快速访问。

HashMap 的特点：

- HashMap 中的键和值都可以为 null。如果键为 null，则将该键映射到哈希表的第一个位置。
- 可以使用迭代器或者 forEach 方法遍历 HashMap 中的键值对。
- HashMap 有一个初始容量和一个负载因子。初始容量是指哈希表的初始大小，负载因子是指哈希表在扩容之前可以存储的键值对数量与哈希表大小的比率。默认的初始容量是 16，负载因子是 0.75。

2）LinkedHashMap

HashMap 已经非常强大了，但它是无序的。如果我们需要一个有序的 Map，就要用到 LinkedHashMap。LinkedHashMap 是 HashMap 的子类，它使用链表来记录插入/访问元素的顺序。

LinkedHashMap 可以看作是 HashMap + LinkedList 的合体，它使用了哈希表来存储数据，又用了双向链表来维持顺序。

```
// 创建一个 LinkedHashMap，插入的键值对为 aa bb cc
LinkedHashMap<String, String> linkedHashMap = new LinkedHashMap<>();
linkedHashMap.put("aa", "cenzhong");
linkedHashMap.put("bb", "wanger");
linkedHashMap.put("cc", "chenqingyang");

// 遍历 LinkedHashMap
for (String key : linkedHashMap.keySet()) {
    String value = linkedHashMap.get(key);
    System.out.println(key + " 对应的值为：" + value);
}
```

HashMap 没有维持键值对的插入顺序，对吧？

3）TreeMap

TreeMap 实现了 SortedMap 接口，可以自动将键按照自然顺序或指定的比较器顺序排序，并保证其元素的顺序。内部使用红黑树来实现键的排序和查找。

与 HashMap 不同的是，TreeMap 会按照键的顺序来进行排序。

```html
// 创建一个 TreeMap 对象
Map<String, String> treeMap = new TreeMap<>();

// 向 TreeMap 中添加键值对
treeMap.put("c", "cat");
treeMap.put("a", "apple");
treeMap.put("b", "banana");

// 遍历 TreeMap
for (Map.Entry<String, String> entry : treeMap.entrySet()) {
    System.out.println(entry.getKey() + ": " + entry.getValue());
}
```

来看输出结果：

```html
a: apple
b: banana
c: cat

```

默认情况下，已经按照键的自然顺序排过了。
