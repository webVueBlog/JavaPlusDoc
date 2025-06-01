---
title: JVM内存区域
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## JVM内存区域

JVM内存：

线程私有 Thread Local

```java
程序计数器PC：指向虚拟机字节码指令的位置, 唯一一个无OOM的区域

虚拟机栈VM Stack: 虚拟机栈和线程的生命周期相同；一个线程中，每调用一个方法创建一个栈帧（Stack Frame）；

栈帧的结构：本地变量表 Local Variable, 操作数栈 Operand Stank， 对运行时常理池的引用 Runtime Constant Pool Reference 

异常：线程请求的栈深度大于JVM所允许的深度 StackOverflowError；若JVM允许动态扩展，若无法申请到足够内存OutOfMemoryError

本地方法栈：Native Method Stack ; 异常：线程请求的栈深度大于JVM所允许的深度StackOverflowError； 若JVM允许动态扩展，若无法申请到足够内存OutOfMemoryError

```

线程共享 Thread Shared

```java
方法区（永久代） Method Area: 运行时常量池 Runtime Constant Pool

类实例区（java堆）Objects : 新生代 eden，from survivor, to survivor ; 老年代，异常 OutOfMemoryError

```

直接内存 Direct Memory

```java
不受JVM GC管理
```

JVM 内存区域主要分为线程私有区域【程序计数器、虚拟机栈、本地方法区】、线程共享区
域【JAVA 堆、方法区】、直接内存。

线程私有数据区域生命周期与线程相同, 依赖用户线程的启动/结束 而 创建/销毁(在 Hotspot
VM 内, 每个线程都与操作系统的本地线程直接映射, 因此这部分内存区域的存/否跟随本地线程的
生/死对应)。

线程共享区域随虚拟机的启动/关闭而创建/销毁。
直接内存并不是 JVM 运行时数据区的一部分, 但也会被频繁的使用: 在 JDK 1.4 引入的 NIO 提
供了基于 Channel 与 Buffer 的 IO 方式, 它可以使用 Native 函数库直接分配堆外内存, 然后使用
DirectByteBuffer 对象作为这块内存的引用进行操作(详见: Java I/O 扩展), 这样就避免了在 Java
堆和 Native 堆中来回复制数据, 因此在一些场景中可以显著提高性能。


