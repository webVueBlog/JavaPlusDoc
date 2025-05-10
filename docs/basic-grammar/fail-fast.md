---
title: Java的foreach循环陷阱
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## Java的foreach循环陷阱

为什么阿里的 Java 开发手册里会强制不要在 foreach 里进行元素的删除操作？

fail-fast 是一种通用的系统设计思想，一旦检测到可能会发生错误，就立马抛出异常，程序将不再往下执行。

一旦检测到 a 为 null，就立马抛出异常，让调用者来决定这种情况下该怎么处理，下一步 a.toString() 就不会执行了——避免更严重的错误出现。

很多时候，我们会把 fail-fast 归类为 Java 集合框架的一种错误检测机制，但其实 fail-fast 并不是 Java 集合框架特有的机制。

for-each 删除元素报错

之所以我们把 fail-fast 放在集合框架篇里介绍，是因为问题比较容易再现。

## 为什么不能在foreach里执行删除操作？

因为 foreach 循环是基于迭代器实现的，而迭代器在遍历集合时会维护一个 expectedModCount 属性来记录集合被修改的次数。如果在 foreach 循环中执行删除操作会导致 expectedModCount 属性值与实际的 modCount 属性值不一致，从而导致迭代器的 hasNext() 和 next() 方法抛出 ConcurrentModificationException 异常。

为了避免这种情况，应该使用迭代器的 remove() 方法来删除元素，该方法会在删除元素后更新迭代器状态，确保循环的正确性。如果需要在循环中删除元素，应该使用迭代器的 remove() 方法，而不是集合自身的 remove() 方法。
