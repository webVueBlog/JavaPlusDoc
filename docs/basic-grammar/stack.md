---
title: 栈Stack详解
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## 栈Stack详解

讲真，Stack 这个类在 Java 应用中并不常用，但栈这个数据结构在整个计算机体系中却十分重要。

栈（stack），有些地方喜欢称呼它为堆栈，我就很不喜欢，很容易和 heap（堆）搞混

* push，中文释义有很多种，我个人更喜欢叫它“压入”，非常形象。当我们要把一个元素放入栈的顶部，这个动作就叫做 push。
* pop，同样的，我个人更喜欢叫它“弹出”，带有很强烈的动画效果，有没有？当我们要从栈中移除一个元素时，这个动作就叫做 pop。

栈是一种非常有用的数据结构，它的特点是后进先出，可以用来反转一串字符、实现计算器、浏览器的后退按钮等等。

推荐使用 ArrayDeque 来代替 Stack，因为 ArrayDeque 是非线程安全的，性能更好。