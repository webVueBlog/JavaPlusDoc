---
title: 双端队列ArrayDeque详解
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## 双端队列ArrayDeque详解

Java 里有一个叫做Stack的类，却没有叫做Queue的类（它只是个接口名字，和类还不一样）。

先创建了一个 ArrayDeque 对象，然后使用 push 方法向栈中添加了三个元素。接着使用 peek 方法获取栈顶元素，使用 pop 方法弹出栈顶元素，使用 pop 和 push 方法修改栈顶元素，使用迭代器查找元素在栈中的位置。

ArrayDeque 又实现了 Deque 接口（Deque 又实现了 Queue 接口）：

在使用 LinkedList 作为队列时，可以使用 offer() 方法将元素添加到队列的末尾，使用 poll() 方法从队列的头部删除元素，使用迭代器或者 poll() 方法依次遍历元素。

## 栈和队列

要讲栈和队列，首先要讲Deque接口。Deque的含义是“double ended queue”，即双端队列，它既可以当作栈使用，也可以当作队列使用。下表列出了Deque与Queue相对应的接口：

    Queue Method	Equivalent Deque Method	说明
    add(e)	addLast(e)	向队尾插入元素，失败则抛出异常
    offer(e)	offerLast(e)	向队尾插入元素，失败则返回false
    remove()	removeFirst()	获取并删除队首元素，失败则抛出异常
    poll()	pollFirst()	获取并删除队首元素，失败则返回null
    element()	getFirst()	获取但不删除队首元素，失败则抛出异常
    peek()	peekFirst()	获取但不删除队首元素，失败则返回null

    Stack Method	Equivalent Deque Method	说明
    push(e)	addFirst(e)	向栈顶插入元素，失败则抛出异常
    无	offerFirst(e)	向栈顶插入元素，失败则返回false
    pop()	removeFirst()	获取并删除栈顶元素，失败则抛出异常
    无	pollFirst()	获取并删除栈顶元素，失败则返回null
    peek()	getFirst()	获取但不删除栈顶元素，失败则抛出异常
    无	peekFirst()	获取但不删除栈顶元素，失败则返回null

以下是一些使用 ArrayDeque 的场景：

1. 管理任务队列：如果需要实现一个任务队列，可以使用 ArrayDeque 来存储任务元素。在队列头部添加新任务元素，从队列尾部取出任务进行处理，可以保证任务按照先进先出的顺序执行。
2. 实现栈：ArrayDeque 可以作为栈的实现方式，支持 push、pop、peek 等操作，可以用于需要后进先出的场景。
3. 实现缓存：在需要缓存一定数量的数据时，可以使用 ArrayDeque。当缓存的数据量超过容量时，可以从队列头部删除最老的数据，从队列尾部添加新的数据。
4. 实现事件处理器：ArrayDeque 可以作为事件处理器的实现方式，支持从队列头部获取事件进行处理，从队列尾部添加新的事件。

简单总结一下吧。

ArrayDeque 是 Java 标准库中的一种双端队列实现，底层基于数组实现。与 LinkedList 相比，ArrayDeque 的性能更优，因为它使用连续的内存空间存储元素，可以更好地利用 CPU 缓存，在大多数情况下也更快。

为什么这么说呢？

因为ArrayDeque 的底层实现是数组，而 LinkedList 的底层实现是链表。数组是一段连续的内存空间，而链表是由多个节点组成的，每个节点存储数据和指向下一个节点的指针。因此，在使用 LinkedList 时，需要频繁进行内存分配和释放，而 ArrayDeque 在创建时就一次性分配了连续的内存空间，不需要频繁进行内存分配和释放，这样可以更好地利用 CPU 缓存，提高访问效率。

现代计算机CPU对于数据的局部性有很强的依赖，如果需要访问的数据在内存中是连续存储的，那么就可以利用CPU的缓存机制，提高访问效率。而当数据存储在不同的内存块里时，每次访问都需要从内存中读取，效率会受到影响。

当然了，使用 ArrayDeque 时，数组复制操作也是需要考虑的性能消耗之一。

当 ArrayDeque 的元素数量超过了初始容量时，会触发扩容操作。扩容操作会创建一个新的数组，并将原有元素复制到新数组中。扩容操作的时间复杂度为 O(n)。

不过，ArrayDeque 的扩容策略（当 ArrayDeque 中的元素数量达到数组容量时，就需要进行扩容操作，扩容时会将数组容量扩大为原来的两倍）可以在一定程度上减少数组复制的次数和时间消耗，同时保证 ArrayDeque 的性能和空间利用率。

ArrayDeque 不仅支持常见的队列操作，如添加元素、删除元素、获取队列头部元素、获取队列尾部元素等。同时，它还支持栈操作，如 push、pop、peek 等。这使得 ArrayDeque 成为一种非常灵活的数据结构，可以用于各种场景的数据存储和处理。

```
最新的java17有变动，扩容代码变成了小于64是，此次扩容两个，否则扩容1.5倍
private void grow(int needed) {
// overflow-conscious code
final int oldCapacity = elements.length;
int newCapacity;
// Double capacity if small; else grow by 50%
int jump = (oldCapacity < 64) ? (oldCapacity + 2) : (oldCapacity >> 1);
if (jump < needed
|| (newCapacity = (oldCapacity + jump)) - MAX_ARRAY_SIZE > 0)
newCapacity = newCapacity(needed, jump);
final Object[] es = elements = Arrays.copyOf(elements, newCapacity);
// Exceptionally, here tail == head needs to be disambiguated
if (tail < head || (tail == head && es[head] != null)) {
// wrap around; slide first leg forward to end of array
int newSpace = newCapacity - oldCapacity;
System.arraycopy(es, head,
es, head + newSpace,
oldCapacity - head);
for (int i = head, to = (head += newSpace); i < to; i++)
es[i] = null;
}
}
```