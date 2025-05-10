---
title: Comparable和Comparator
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## Comparable和Comparator

Comparable 和 Comparator 是 Java 的两个接口，从名字上我们就能够读出来它们俩的相似性：以某种方式来比较两个对象。

如果一个类实现了 Comparable 接口（只需要干一件事，重写 compareTo() 方法），就可以按照自己制定的规则将由它创建的对象进行比较。

Comparator 接口的定义相比较于 Comparable 就复杂的多了，不过，核心的方法只有两个

第一个方法 compare(T o1, T o2) 的返回值可能为负数，零或者正数，代表的意思是第一个对象小于、等于或者大于第二个对象。

第二个方法 equals(Object obj) 需要传入一个 Object 作为参数，并判断该 Object 是否和 Comparator 保持一致。

## Comparable 和 Comparator 两者之间的区别：

1. 一个类实现了 Comparable 接口，意味着该类的对象可以直接进行比较（排序），但比较（排序）的方式只有一种，很单一。
2. 一个类如果想要保持原样，又需要进行不同方式的比较（排序），就可以定制比较器（实现 Comparator 接口）。
3. Comparable 接口在 java.lang 包下，而 Comparator 接口在 java.util 包下，算不上是亲兄弟，但可以称得上是表（堂）兄弟。

举个不恰当的例子。我想从洛阳出发去北京看长城，体验一下好汉的感觉，要么坐飞机，要么坐高铁；但如果是孙悟空的话，翻个筋斗就到了。我和孙悟空之间有什么区别呢？

孙悟空自己实现了 Comparable 接口（他那年代也没有飞机和高铁，没得选），而我可以借助 Comparator 接口（现代化的交通工具）。

