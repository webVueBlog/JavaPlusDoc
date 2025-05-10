---
title: ArrayList和LinkedList的区别
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## ArrayList和LinkedList的区别

### 01、ArrayList 是如何实现的？

ArrayList 实现了 List 接口，继承了 AbstractList 抽象类。

底层是基于数组实现的，并且实现了动态扩容（当需要添加新元素时，如果 elementData 数组已满，则会自动扩容，新的容量将是原来的 1.5 倍）

ArrayList 还实现了 Cloneable 接口，这表明 ArrayList 是支持拷贝的。ArrayList 内部的确也重写了 Object 类的 clone() 方法。

ArrayList 还实现了 Serializable 接口

内部也是空的，标记“实现了这个接口的类支持序列化”。序列化是什么意思呢？Java 的序列化是指，将对象转换成以字节序列的形式来表示，这些字节序中包含了对象的字段和方法。序列化后的对象可以被写到数据库、写到文件，也可用于网络传输。

ArrayList 不想像数组这样活着，它想能屈能伸，所以它实现了动态扩容。一旦在添加元素的时候，发现容量用满了 s == elementData.length，就按照原来数组的 1.5 倍（oldCapacity >> 1）进行扩容。扩容之后，再将原有的数组复制到新分配的内存地址上 Arrays.copyOf(elementData, newCapacity)。

### 02、LinkedList 是如何实现的？

LinkedList 是一个继承自 AbstractSequentialList 的双向链表，因此它也可以被当作堆栈、队列或双端队列进行操作。

LinkedList 内部定义了一个 Node 节点，它包含 3 个部分：元素内容 item，前引用 prev 和后引用 next。

LinkedList 还实现了 Cloneable 接口，这表明 LinkedList 是支持拷贝的。

LinkedList 还实现了 Serializable 接口，这表明 LinkedList 是支持序列化的。

和 ArrayList 相比，LinkedList 没有实现 RandomAccess 接口，这是因为 LinkedList 存储数据的内存地址是不连续的，所以不支持随机访问。

### 03、新增元素时究竟谁快？

1）ArrayList

ArrayList 新增元素有两种情况，一种是直接将元素添加到数组末尾，一种是将元素插入到指定位置。

先检查插入的位置是否在合理的范围之内，然后判断是否需要扩容，再把该位置以后的元素复制到新添加元素的位置之后，最后通过索引将元素添加到指定的位置。

2）LinkedList

LinkedList 新增元素也有两种情况，一种是直接将元素添加到队尾，一种是将元素插入到指定位置。

先检查插入的位置是否在合理的范围之内，然后判断插入的位置是否是队尾，如果是，添加到队尾；否则执行 linkBefore() 方法。

在执行 linkBefore() 方法之前，会调用 node() 方法查找指定位置上的元素，这一步是需要遍历 LinkedList 的。如果插入的位置靠前前半段，就从队头开始往后找；否则从队尾往前找。也就是说，如果插入的位置越靠近 LinkedList 的中间位置，遍历所花费的时间就越多。

找到指定位置上的元素（参数succ）之后，就开始执行 linkBefore() 方法，先将 succ 的前一个节点（prev）存放到临时变量 pred 中，然后生成新的 Node 节点（newNode），并将 succ 的前一个节点变更为 newNode，如果 pred 为 null，说明插入的是队头，所以 first 为新节点；否则将 pred 的后一个节点变更为 newNode。

经过源码分析以后，：“好像 ArrayList 在新增元素的时候效率并不一定比 LinkedList 低啊！”

当两者的起始长度是一样的情况下：

如果是从集合的头部新增元素，ArrayList 花费的时间应该比 LinkedList 多，因为需要对头部以后的元素进行复制。

如果是从集合的中间位置新增元素，ArrayList 花费的时间搞不好要比 LinkedList 少，因为 LinkedList 需要遍历。

如果是从集合的尾部新增元素，ArrayList 花费的时间应该比 LinkedList 少，因为数组是一段连续的内存空间，也不需要复制数组；而链表需要创建新的对象，前后引用也要重新排列。

ArrayList 花费的时间比 LinkedList 要少一些。

这样的结论和预期的是不是不太相符？ArrayList 在添加元素的时候如果不涉及到扩容，性能在两种情况下（中间位置新增元素、尾部新增元素）比 LinkedList 好很多，只有头部新增元素的时候比 LinkedList 差，因为数组复制的原因。

### 04、删除元素时究竟谁快？

1）ArrayList

ArrayList 删除元素的时候，有两种方式，一种是直接删除元素（remove(Object)），需要直先遍历数组，找到元素对应的索引；一种是按照索引删除元素（remove(int)）。

两个方法是一样的，它们最后调用的都是 fastRemove(Object, int) 方法。

从源码可以看得出，只要删除的不是最后一个元素，都需要重新移动数组。删除的元素位置越靠前，代价就越大。

2）LinkedList

LinkedList 删除元素的时候，有四种常用的方式：

remove(int)，删除指定位置上的元素

先检查索引，再调用 node(int) 方法（ 前后半段遍历，和新增元素操作一样）找到节点 Node，然后调用 unlink(Node) 解除节点的前后引用，同时更新前节点的后引用和后节点的前引用

remove(Object)，直接删除元素

也是先前后半段遍历，找到要删除的元素后调用 unlink(Node)。

removeFirst()，删除第一个节点

删除第一个节点就不需要遍历了，只需要把第二个节点更新为第一个节点即可。

removeLast()，删除最后一个节点

删除最后一个节点和删除第一个节点类似，只需要把倒数第二个节点更新为最后一个节点即可。

可以看得出，LinkedList 在删除比较靠前和比较靠后的元素时，非常高效，但如果删除的是中间位置的元素，效率就比较低了。

1. 从集合头部删除元素时，ArrayList 花费的时间比 LinkedList 多很多；
2. 从集合中间位置删除元素时，ArrayList 花费的时间比 LinkedList 少很多；
3. 从集合尾部删除元素时，ArrayList 花费的时间比 LinkedList 少一点。

### 05、遍历元素时究竟谁快？

1）ArrayList

遍历 ArrayList 找到某个元素的话，通常有两种形式：

get(int)，根据索引找元素

由于 ArrayList 是由数组实现的，所以根据索引找元素非常的快，一步到位。

indexOf(Object)，根据元素找索引

根据元素找索引的话，就需要遍历整个数组了，从头到尾依次找。

2）LinkedList

遍历 LinkedList 找到某个元素的话，通常也有两种形式：

get(int)，找指定位置上的元素

既然需要调用 node(int) 方法，就意味着需要前后半段遍历了。

indexOf(Object)，找元素所在的位置

需要遍历整个链表，和 ArrayList 的 indexOf() 类似。

那在我们对集合遍历的时候，通常有两种做法，一种是使用 for 循环，一种是使用迭代器（Iterator）。

如果使用的是 for 循环，可想而知 LinkedList 在 get 的时候性能会非常差，因为每一次外层的 for 循环，都要执行一次 node(int) 方法进行前后半段的遍历。

遍历 LinkedList 的时候，千万不要使用 for 循环，要使用迭代器。

也就是说，for 循环遍历的时候，ArrayList 花费的时间远小于 LinkedList；迭代器遍历的时候，两者性能差不多。

### 06、两者的使用场景

当需要频繁随机访问元素的时候，例如读取大量数据并进行处理或者需要对数据进行排序或查找的场景，可以使用 ArrayList。例如一个学生管理系统，需要对学生列表进行排序或查找操作，可以使用 ArrayList 存储学生信息，以便快速访问和处理。

当需要频繁插入和删除元素的时候，例如实现队列或栈，或者需要在中间插入或删除元素的场景，可以使用 LinkedList。例如一个实时聊天系统，需要实现一个消息队列，可以使用 LinkedList 存储消息，以便快速插入和删除消息。

在一些特殊场景下，可能需要同时支持随机访问和插入/删除操作。例如一个在线游戏系统，需要实现一个玩家列表，需要支持快速查找和遍历玩家，同时也需要支持玩家的加入和离开。在这种情况下，可以使用 LinkedList 和 ArrayList 的组合，例如使用 LinkedList 存储玩家，以便快速插入和删除玩家，同时使用 ArrayList 存储玩家列表，以便快速查找和遍历玩家。