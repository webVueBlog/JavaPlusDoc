---
title: jvm
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## jvm

(1) 基本概念：

JVM 是可运行 Java 代码的假想计算机 ，包括一套字节码指令集、一组寄存器、一个栈、
一个垃圾回收，堆 和 一个存储方法域。JVM 是运行在操作系统之上的，它与硬件没有直接
的交互。

java代码的执行：代码编译为class，javac；装载class，ClassLoader；执行class，解释执行，编译执行，client compiler，server compiler。

内存管理：内存空间，方法区，堆，方法栈，本地方法栈，pc寄存器；内存分片，堆上分配，TLAB分配，栈上分配；

内存回收：算法 Copy Mark-Sweep， Mark-Compact；Sun JDK 分代回收 GC参数，G1

分代回收：新生代可用的GC 串行copying，并行回收copying，并行copying；  Minor GC 触发机制以及日志格式；
旧生代可用的GC： 串行 Mark-Sweep-Compact ，并行 Compacting， 并发 Mark-Sweep
Full GC 触发机制以及日志格式

内存状况分析：jconsole，visualvm，jstat，jmap，mat

线程资源同步和交互机制：

线程资源同步：线程资源执行机制；线程资源同步机制： Synchronized的实现机制，lock/unlock的实现机制

线程交互机制：Object.wait/notify/notifyAll, Thread.join, Thread.sleep, Thread.yield, Thread.interrupt；  并发包提供的交互机制： semaphore，CountdownLatch

线程状态以及分析方法：jstack、 tda

(2) 运行过程：

我们都知道Java源文件，通过编译器，能够生产相应的.Class文件，也就是字节码文件，而字节码文件又通过Java虚拟机中的解释器，编译成特定机器上的机器码。

也就是如下：

① Java 源文件—->编译器—->字节码文件

② 字节码文件—->JVM—->机器码

每一种平台的解释器是不同的，但是实现的虚拟机是相同的，这也就是 Java 为什么能够
跨平台的原因了 ，当一个程序从开始运行，这时虚拟机就开始实例化了，多个程序启动就会
存在多个虚拟机实例。程序退出或者关闭，则虚拟机实例消亡，多个虚拟机实例之间数据不
能共享。


运行时数据区 Runtime Data Area

方法区 Method Area （共享）   虚拟机栈 VM Stack （私有）  本地方法栈 Native Method Stack （私有）  程序计数器 Program Counter Register （私有）

堆 Heap （共享）

执行引擎：即时编译器 JIT  垃圾收集器 GC

本地库接口，本地方法库

