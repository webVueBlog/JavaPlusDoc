---
title: Java多线程入门
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## Java多线程入门

* 进程，是对运行时程序的封装，是系统进行资源调度和分配的基本单位，实现了操作系统的并发。
* 线程，是进程的子任务，是 CPU 调度和分派的基本单位，实现了进程内部的并发。

## 进程和线程

❤1、线程在进程下进行

（单独的英雄角色、野怪、小兵肯定不能运行）

❤2、进程之间不会相互影响，主线程结束将会导致整个进程结束

（两把游戏之间不会有联系和影响。你的水晶被推掉，你这把游戏就结束了）

❤3、不同的进程数据很难共享

（两把游戏之间很难有联系，有联系的情况比如上把的敌人这把又匹配到了）

❤4、同进程下的不同线程之间数据很容易共享

（你开的那一把游戏，你可以看到每个玩家的状态——生死，也可以看到每个玩家的出装等等）

❤5、进程使用内存地址可以限定使用量

（开的房间模式，决定了你可以设置有多少人进，当房间满了后，其他人就进不去了，除非有人退出房间，其他人才能进）

## 创建线程的三种方式

继承 Thread 类

♠①：创建一个类继承 Thread 类，并重写 run 方法。

实现 Runnable 接口

♠②：创建一个类实现 Runnable 接口，并重写 run 方法。

实现 Callable 接口

♠③：实现 Callable 接口，重写 call 方法，这种方式可以通过 FutureTask 获取任务执行的返回值。

## 关于线程的一些疑问

❤1、为什么要重写 run 方法？

这是因为默认的run()方法不会做任何事情。

为了让线程执行一些实际的任务，我们需要提供自己的run()方法实现，这就需要重写run()方法。

## ❤2、run 方法和 start 方法有什么区别？

* run()：封装线程执行的代码，直接调用相当于调用普通方法。
* start()：启动线程，然后由 JVM 调用此线程的 run() 方法。

## ❤3、通过继承 Thread 的方法和实现 Runnable 接口的方式创建多线程，哪个好？

实现 Runable 接口好，原因有两个：

* ♠①、避免了 Java 单继承的局限性，Java 不支持多重继承，因此如果我们的类已经继承了另一个类，就不能再继承 Thread 类了。
* ♠②、适合多个相同的程序代码去处理同一资源的情况，把线程、代码和数据有效的分离，更符合面向对象的设计思想。Callable 接口与 Runnable 非常相似，但可以返回一个结果。

## 控制线程的其他方法

1）sleep()

使当前正在执行的线程暂停指定的毫秒数，也就是进入休眠的状态。

需要注意的是，sleep 的时候要对异常进行处理。

```
try {//sleep会发生异常要显示处理
    Thread.sleep(20);//暂停20毫秒
} catch (InterruptedException e) {
    e.printStackTrace();
}
```

2）join()

等待这个线程执行完才会轮到后续线程得到 cpu 的执行权，使用这个也要捕获异常。

```
//创建MyRunnable类
MyRunnable mr = new MyRunnable();
//创建Thread类的有参构造,并设置线程名
Thread t1 = new Thread(mr, "张飞");
Thread t2 = new Thread(mr, "貂蝉");
Thread t3 = new Thread(mr, "吕布");
//启动线程
t1.start();
try {
    t1.join(); //等待t1执行完才会轮到t2，t3抢
} catch (InterruptedException e) {
    e.printStackTrace();
}
t2.start();
t3.start();
```

3）setDaemon()

将此线程标记为守护线程，准确来说，就是服务其他的线程，像 Java 中的垃圾回收线程，就是典型的守护线程。

```
//创建MyRunnable类
MyRunnable mr = new MyRunnable();
//创建Thread类的有参构造,并设置线程名
Thread t1 = new Thread(mr, "张飞");
Thread t2 = new Thread(mr, "貂蝉");
Thread t3 = new Thread(mr, "吕布");

t1.setDaemon(true);
t2.setDaemon(true);

//启动线程
t1.start();
t2.start();
t3.start();
```

如果其他线程都执行完毕，main 方法（主线程）也执行完毕，JVM 就会退出，也就是停止运行。如果 JVM 都停止运行了，守护线程自然也就停止了。

4）yield()

yield() 方法是一个静态方法，用于暗示当前线程愿意放弃其当前的时间片，允许其他线程执行。然而，它只是向线程调度器提出建议，调度器可能会忽略这个建议。具体行为取决于操作系统和 JVM 的线程调度策略。

```java
class YieldExample {
    public static void main(String[] args) {
        Thread thread1 = new Thread(YieldExample::printNumbers, "刘备");
        Thread thread2 = new Thread(YieldExample::printNumbers, "关羽");

        thread1.start();
        thread2.start();
    }

    private static void printNumbers() {
        for (int i = 1; i <= 5; i++) {
            System.out.println(Thread.currentThread().getName() + ": " + i);

            // 当 i 是偶数时，当前线程暂停执行
            if (i % 2 == 0) {
                System.out.println(Thread.currentThread().getName() + " 让出控制权...");
                Thread.yield();
            }
        }
    }
}
```

## 小结

![img.png](./img.png)



