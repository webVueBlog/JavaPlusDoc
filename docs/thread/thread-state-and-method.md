---
title: Java线程的6种状态
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## Java线程的6种状态

在操作系统中，线程被视为轻量级的进程，所以线程状态其实和进程状态是一致的。

![img_4.png](./img_4.png)

操作系统的线程主要有以下三个状态：

1. 就绪状态(ready)：线程正在等待使用 CPU，经调度程序调用之后进入 running 状态。
2. 执行状态(running)：线程正在使用 CPU。
3. 等待状态(waiting): 线程经过等待事件的调用或者正在等待其他资源（如 I/O）。

然后我们来看 Java 线程的 6 个状态：

```
// Thread.State 源码
public enum State {
    NEW,
    RUNNABLE,
    BLOCKED,
    WAITING,
    TIMED_WAITING,
    TERMINATED;
}
```

## NEW

处于 NEW 状态的线程此时尚未启动。这里的尚未启动指的是还没调用 Thread 实例的start()方法。

```
private void testStateNew() {
    Thread thread = new Thread(() -> {});
    System.out.println(thread.getState()); // 输出 NEW
}
```

从上面可以看出，只是创建了线程而并没有调用 start 方法，此时线程处于 NEW 状态。

## 关于 start 的两个引申问题

1. 反复调用同一个线程的 start 方法是否可行？
2. 假如一个线程执行完毕（此时处于 TERMINATED 状态），再次调用这个线程的 start 方法是否可行？

要分析这两个问题，我们先来看看start()的源码：

```
// 使用synchronized关键字保证这个方法是线程安全的
public synchronized void start() {
    // threadStatus != 0 表示这个线程已经被启动过或已经结束了
    // 如果试图再次启动这个线程，就会抛出IllegalThreadStateException异常
    if (threadStatus != 0)
        throw new IllegalThreadStateException();

    // 将这个线程添加到当前线程的线程组中
    group.add(this);

    // 声明一个变量，用于记录线程是否启动成功
    boolean started = false;
    try {
        // 使用native方法启动这个线程
        start0();
        // 如果没有抛出异常，那么started被设为true，表示线程启动成功
        started = true;
    } finally {
        // 在finally语句块中，无论try语句块中的代码是否抛出异常，都会执行
        try {
            // 如果线程没有启动成功，就从线程组中移除这个线程
            if (!started) {
                group.threadStartFailed(this);
            }
        } catch (Throwable ignore) {
            // 如果在移除线程的过程中发生了异常，我们选择忽略这个异常
        }
    }
}
```

## 线程状态的转换

根据上面关于线程状态的介绍我们可以得到下面的线程状态转换图：

![img_5.png](./img_5.png)

## 线程中断

在某些情况下，我们在线程启动后发现并不需要它继续执行下去时，需要中断线程。目前在 Java 里还没有安全方法来直接停止线程，但是 Java 提供了线程中断机制来处理需要中断线程的情况。

线程中断机制是一种协作机制。需要注意，通过中断操作并不能直接终止一个线程，而是通知需要被中断的线程自行处理。

简单介绍下 Thread 类里提供的关于线程中断的几个方法：

* Thread.interrupt()：中断线程。这里的中断线程并不会立即停止线程，而是设置线程的中断状态为 true（默认是 flase）；
* Thread.isInterrupted()：测试当前线程是否被中断。
* Thread.interrupted()：检测当前线程是否被中断，与 isInterrupted() 方法不同的是，这个方法如果发现当前线程被中断，会清除线程的中断状态。

在线程中断机制里，当其他线程通知需要被中断的线程后，线程中断的状态被设置为 true，但是具体被要求中断的线程要怎么处理，完全由被中断线程自己决定，可以在合适的时机中断请求，也可以完全不处理继续执行下去。

## 小结

本文详细解析了 Java 线程的 6 种状态 — 新建、运行、阻塞、等待、定时等待和终止，以及这些状态之间的切换过程。



