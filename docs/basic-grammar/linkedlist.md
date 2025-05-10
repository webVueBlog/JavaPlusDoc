---
title: LinkedList详解
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## LinkedList详解

申请一个默认大小的数组，随着数据量的增大扩容？要知道扩容是需要重新复制数组的，很耗时间。

关键是，数组还有一个弊端就是，假如现在有 500 万张票据，现在要从中间删除一个票据，就需要把 250 万张票据往前移动一格。

链表这门内功大致分为三个层次：

- 第一层叫做“单向链表”，我只有一个后指针，指向下一个数据；
- 第二层叫做“双向链表”，我有两个指针，后指针指向下一个数据，前指针指向上一个数据。
- 第三层叫做“二叉树”，把后指针去掉，换成左右指针。

主要是一个私有的静态内部类，叫 Node，也就是节点。

```
/**
 * 链表中的节点类。
 */
private static class Node<E> {
    E item; // 节点中存储的元素
    Node<E> next; // 指向下一个节点的指针
    Node<E> prev; // 指向上一个节点的指针

    /**
     * 构造一个新的节点。
     *
     * @param prev 前一个节点
     * @param element 节点中要存储的元素
     * @param next 后一个节点
     */
    Node(Node<E> prev, E element, Node<E> next) {
        this.item = element; // 存储元素
        this.next = next; // 设置下一个节点
        this.prev = prev; // 设置上一个节点
    }
}
```

```
/**
 * 链表中的节点类。
 */
private static class Node<E> {
    E item; // 节点中存储的元素
    Node<E> next; // 指向下一个节点的指针
    Node<E> prev; // 指向上一个节点的指针

    /**
     * 构造一个新的节点。
     *
     * @param prev 前一个节点
     * @param element 节点中要存储的元素
     * @param next 后一个节点
     */
    Node(Node<E> prev, E element, Node<E> next) {
        this.item = element; // 存储元素
        this.next = next; // 设置下一个节点
        this.prev = prev; // 设置上一个节点
    }
}
```

    LinkedList<String> list = new LinkedList();

add 方法内部其实调用的是 linkLast 方法：

* addFirst() 方法将元素添加到第一位；
* addLast() 方法将元素添加到末尾。
* addFirst 内部其实调用的是 linkFirst

删的招式还挺多的：

* remove()：删除第一个节点
* remove(int)：删除指定位置的节点
* remove(Object)：删除指定元素的节点
* removeFirst()：删除第一个节点
* removeLast()：删除最后一个节点

remove(int) 内部其实调用的是 unlink 方法。

元素为 null 的时候，必须使用 == 来判断；元素为非 null 的时候，要使用 equals 来判断。

removeFirst 内部调用的是 unlinkFirst 方法：

* 可以调用 set() 方法来更新元素：
* indexOf(Object)：查找某个元素所在的位置
* get(int)：查找某个位置上的元素
* getFirst() 方法用于获取第一个元素；
* getLast() 方法用于获取最后一个元素；
* poll() 和 pollFirst() 方法用于删除并返回第一个元素（两个方法尽管名字不同，但方法体是完全相同的）；
* pollLast() 方法用于删除并返回最后一个元素；
* peekFirst() 方法用于返回但不删除第一个元素。

你在玩一款游戏，游戏中有一个道具栏，你需要不断地往里面添加、删除道具。如果你使用的是我的师兄 ArrayList，那么每次添加、删除道具时都需要将后面的道具向后移动或向前移动，这样就会非常耗费时间。但是如果你使用的是我 LinkedList，那么只需要将新道具插入到链表中的指定位置，或者将要删除的道具从链表中删除即可，这样就可以快速地完成道具栏的更新。

除了游戏中的道具栏，我 LinkedList 还可以用于实现 LRU（Least Recently Used）缓存淘汰算法。LRU 缓存淘汰算法是一种常用的缓存淘汰策略，它的基本思想是，当缓存空间不够时，优先淘汰最近最少使用的缓存数据。在实现 LRU 缓存淘汰算法时，你可以使用我 LinkedList 来存储缓存数据，每次访问缓存数据时，将该数据从链表中删除并移动到链表的头部，这样链表的尾部就是最近最少使用的缓存数据，当缓存空间不够时，只需要将链表尾部的缓存数据淘汰即可。

