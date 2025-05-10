---
title: 时间复杂度
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## 时间复杂度

学习 ArrayList、LinkedList 的时候，会比较两者在增删改查时的执行效率，而时间复杂度是衡量执行效率的一个重要标准。

1）O(1)

代码的执行时间，和数据规模 n 没有多大关系。

2）O(n)

时间复杂度和数据规模 n 是线性关系。换句话说，数据规模增大 K 倍，代码执行的时间就大致增加 K 倍。

3）O(logn)

时间复杂度和数据规模 n 是对数关系。换句话说，数据规模大幅增加时，代码执行的时间只有少量增加。

4）平方时间复杂度 O(n^2)

当我们对一个数组进行嵌套循环时，它的时间复杂度就是平方时间复杂度 O(n^2)。

5）指数时间复杂度 O(2^n)

当我们递归求解一个问题时，每一次递归都会分成两个子问题，这种情况下，它的时间复杂度就是指数时间复杂度 O(2^n)。

