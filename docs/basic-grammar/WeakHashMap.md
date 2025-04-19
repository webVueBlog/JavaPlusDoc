---
title: 详解WeakHashMap
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## 详解WeakHashMap

在Java中，我们一般都会使用到Map，比如HashMap这样的具体实现。更高级一点，我们可能会使用WeakHashMap。

WeakHashMap其实和HashMap大多数行为是一样的，只是WeakHashMap不会阻止GC回收key对象（不是value），那么WeakHashMap是怎么做到的呢。

在开始WeakHashMap之前，我们先要对弱引用有一定的了解。

在Java中，有四种引用类型

1. 强引用(Strong Reference)，我们正常编码时默认的引用类型，强应用之所以为强，是因为如果一个对象到GC Roots强引用可到达，就可以阻止GC回收该对象
2. 软引用（Soft Reference）阻止GC回收的能力相对弱一些，如果是软引用可以到达，那么这个对象会停留在内存更时间上长一些。当内存不足时垃圾回收器才会回收这些软引用可到达的对象
3. 弱引用（WeakReference）无法阻止GC回收，如果一个对象时弱引用可到达，那么在下一个GC回收执行时，该对象就会被回收掉。
4. 虚引用（Phantom Reference）十分脆弱，它的唯一作用就是当其指向的对象被回收之后，自己被加入到引用队列，用作记录该引用指向的对象已被销毁

这其中还有一个概念叫做引用队列(Reference Queue)

1. 一般情况下，一个对象标记为垃圾（并不代表回收了）后，会加入到引用队列。
2. 对于虚引用来说，它指向的对象会只有被回收后才会加入引用队列，所以可以用作记录该引用指向的对象是否回收。

WeakHashMap如何不阻止对象回收呢

源码所示，

1. WeakHashMap的Entry继承了WeakReference。
2. 其中Key作为了WeakReference指向的对象
3. 因此WeakHashMap利用了WeakReference的机制来实现不阻止GC回收Key

### 如何删除被回收的key数据呢

关于WeakHashMap有这样的描述，当key不再引用时，其对应的key/value也会被移除。

那么是如何移除的呢，这里我们通常有两种假设策略

1. 当对象被回收的时候，进行通知
2. WeakHashMap轮询处理时效的Entry

而WeakHashMap采用的是轮询的形式，在其put/get/size等方法调用的时候都会预先调用一个poll的方法，来检查并删除失效的Entry

为什么没有使用看似更好的通知呢，我想是因为在Java中没有一个可靠的通知回调，比如大家常说的finalize方法，其实也不是标准的，不同的JVM可以实现不同，甚至是不调用这个方法。

注意：System.gc()并不一定可以工作,建议使用Android Studio的Force GC


