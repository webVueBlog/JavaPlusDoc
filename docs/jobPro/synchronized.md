---
title: synchronized和lock有什么区别
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## synchronized和lock有什么区别

synchronized和lock他们都是锁的实现，进行并发控制，synchronized它是一个关键字，而lock它是一个接口，lock接口下有多个实现类，如ReentrantLock，ReentrantReadWriteLock等。synchronized是非公平锁，ReentrantLock是可重入锁，也是公平锁，公平锁和非公平锁的区别是，公平锁是按照线程请求的顺序来分配锁，而非公平锁是随机分配的。

在Java中，`synchronized`和`Lock`都是用于实现线程同步的机制，但它们有一些关键的区别：

1. **使用方式**：
    - `synchronized`是Java关键字，可以用于方法或代码块。当用于方法时，整个方法会被同步；当用于代码块时，只有代码块内的代码会被同步。
    - `Lock`是一个接口，需要显式地创建对象，并且需要手动获取和释放锁。

2. **锁的粒度**：
    - `synchronized`的锁是对象级别的，即一个对象只能有一个线程可以访问。
    - `Lock`的锁可以是对象级别的，也可以是更细粒度的，比如ReentrantLock可以锁住代码块中的某个变量。

3. **锁的释放**：
    - `synchronized`的锁会在方法执行完毕或者抛出异常时自动释放。
    - `Lock`的锁需要显式地调用`unlock()`方法释放。

4. **锁的获取**：
    - `synchronized`的锁获取是自动的，不需要显式地调用方法。
    - `Lock`的锁获取需要显式地调用`lock()`方法。

5. **锁的公平性**：
    - `synchronized`的锁是非公平的，即先请求锁的线程不一定会先获得锁。
    - `Lock`的实现可以是公平的，也可以是非公平的，这取决于具体的`Lock`实现。

6. **异常处理**：
    - `synchronized`的锁在发生异常时，会自动释放锁。
    - `Lock`的锁在发生异常时，需要手动释放锁，否则会导致锁无法释放，其他线程无法获得锁。

7. **可中断性**：
    - `synchronized`的锁是不可中断的，即一旦线程获得锁，除非释放锁，否则线程会一直阻塞。
    - `Lock`的锁是可中断的，可以通过`lockInterruptibly()`方法获取锁，如果线程在等待锁的过程中被中断，会抛出`InterruptedException`。

8. **可重入性**：
    - `synchronized`的锁是可重入的，即一个线程可以多次获得同一个锁。
    - `Lock`的锁也是可重入的，但需要显式地调用`lock()`方法获取锁。

可重入性是指一个线程可以多次获得同一个锁，而不会导致死锁。

总的来说，`synchronized`和`Lock`都可以用于实现线程同步，但`Lock`提供了更多的灵活性和控制，可以更好地满足复杂的同步需求。

```java
public class SynchronizedExample {
private int count = 0;

    public synchronized void increment() {
        count++;
    }

    public void incrementWithLock() {
        ReentrantLock lock = new ReentrantLock();
        lock.lock();
        try {
            count++;
        } finally {
            lock.unlock();
        }
    }
}
```


