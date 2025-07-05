---
title: java锁实现原理
author: 哪吒
date: '2023-06-15'
---

# Java锁实现原理

## 1. 锁的基础概念

### 1.1 什么是锁

锁是一种同步机制，用于控制多个线程对共享资源的访问。在Java中，锁确保在任意时刻只有一个线程能够访问被保护的代码段或资源。

```java
public class LockBasicDemo {
    private int count = 0;
    private final Object lock = new Object();
    
    // 使用synchronized关键字加锁
    public synchronized void incrementSync() {
        count++;
    }
    
    // 使用synchronized代码块
    public void incrementBlock() {
        synchronized (lock) {
            count++;
        }
    }
    
    public static void main(String[] args) throws InterruptedException {
        LockBasicDemo demo = new LockBasicDemo();
        
        // 创建多个线程并发访问
        Thread[] threads = new Thread[10];
        for (int i = 0; i < 10; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < 1000; j++) {
                    demo.incrementSync();
                }
            });
            threads[i].start();
        }
        
        // 等待所有线程完成
        for (Thread thread : threads) {
            thread.join();
        }
        
        System.out.println("Final count: " + demo.count);
    }
}
```

## 3. ReentrantLock实现原理

### 3.1 ReentrantLock基本使用

```java
import java.util.concurrent.locks.ReentrantLock;
import java.util.concurrent.locks.Condition;

public class ReentrantLockDemo {
    private final ReentrantLock lock = new ReentrantLock();
    private final Condition condition = lock.newCondition();
    private int count = 0;
    private boolean ready = false;
    
    // 基本的加锁解锁
    public void increment() {
        lock.lock();
        try {
            count++;
            System.out.println(Thread.currentThread().getName() + ": " + count);
        } finally {
            lock.unlock();
        }
    }
    
    // 可重入性演示
    public void reentrantDemo() {
        lock.lock();
        try {
            System.out.println("First lock acquired");
            nestedLock();
        } finally {
            lock.unlock();
        }
    }
    
    private void nestedLock() {
        lock.lock(); // 同一线程再次获取锁
        try {
            System.out.println("Nested lock acquired");
        } finally {
            lock.unlock();
        }
    }
    
    // 条件变量使用
    public void producer() {
        lock.lock();
        try {
            while (!ready) {
                System.out.println("Producer waiting...");
                condition.await();
            }
            System.out.println("Producer working...");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            lock.unlock();
        }
    }
    
    public void consumer() {
        lock.lock();
        try {
            ready = true;
            System.out.println("Consumer ready, signaling producer");
            condition.signal();
        } finally {
            lock.unlock();
        }
    }
    
    public static void main(String[] args) throws InterruptedException {
        ReentrantLockDemo demo = new ReentrantLockDemo();
        
        // 测试基本功能
        Thread[] threads = new Thread[3];
        for (int i = 0; i < 3; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < 3; j++) {
                    demo.increment();
                }
            }, "Thread-" + i);
            threads[i].start();
        }
        
        for (Thread thread : threads) {
            thread.join();
        }
        
        // 测试可重入性
        System.out.println("\n=== 可重入性测试 ===");
        demo.reentrantDemo();
        
        // 测试条件变量
        System.out.println("\n=== 条件变量测试 ===");
        Thread producer = new Thread(demo::producer, "Producer");
        Thread consumer = new Thread(demo::consumer, "Consumer");
        
        producer.start();
        Thread.sleep(1000); // 确保producer先启动
        consumer.start();
        
        producer.join();
        consumer.join();
    }
}
```

### 3.2 公平锁与非公平锁

```java
import java.util.concurrent.locks.ReentrantLock;

public class FairLockDemo {
    private final ReentrantLock fairLock = new ReentrantLock(true);    // 公平锁
    private final ReentrantLock unfairLock = new ReentrantLock(false); // 非公平锁
    
    public void testFairLock() {
        System.out.println("=== 公平锁测试 ===");
        testLock(fairLock, "Fair");
    }
    
    public void testUnfairLock() {
        System.out.println("\n=== 非公平锁测试 ===");
        testLock(unfairLock, "Unfair");
    }
    
    private void testLock(ReentrantLock lock, String type) {
        Thread[] threads = new Thread[5];
        
        for (int i = 0; i < 5; i++) {
            final int threadId = i;
            threads[i] = new Thread(() -> {
                for (int j = 0; j < 3; j++) {
                    lock.lock();
                    try {
                        System.out.println(type + " Lock - Thread " + threadId + 
                                         " acquired lock, iteration " + j);
                        Thread.sleep(100);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    } finally {
                        lock.unlock();
                    }
                }
            }, "Thread-" + i);
        }
        
        for (Thread thread : threads) {
            thread.start();
        }
        
        for (Thread thread : threads) {
            try {
                thread.join();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }
    
    public static void main(String[] args) {
        FairLockDemo demo = new FairLockDemo();
        demo.testFairLock();
        demo.testUnfairLock();
    }
}
```

### 3.3 AQS（AbstractQueuedSynchronizer）原理

```java
import java.util.concurrent.locks.AbstractQueuedSynchronizer;

// 自定义同步器示例
public class CustomLock {
    private final Sync sync = new Sync();
    
    // 基于AQS的自定义同步器
    private static class Sync extends AbstractQueuedSynchronizer {
        // 尝试获取锁
        @Override
        protected boolean tryAcquire(int arg) {
            // 使用CAS操作尝试将state从0设置为1
            if (compareAndSetState(0, 1)) {
                setExclusiveOwnerThread(Thread.currentThread());
                return true;
            }
            return false;
        }
        
        // 尝试释放锁
        @Override
        protected boolean tryRelease(int arg) {
            if (getState() == 0) {
                throw new IllegalMonitorStateException();
            }
            setExclusiveOwnerThread(null);
            setState(0);
            return true;
        }
        
        // 是否被当前线程独占
        @Override
        protected boolean isHeldExclusively() {
            return getExclusiveOwnerThread() == Thread.currentThread();
        }
    }
    
    public void lock() {
        sync.acquire(1);
    }
    
    public void unlock() {
        sync.release(1);
    }
    
    public boolean tryLock() {
        return sync.tryAcquire(1);
    }
    
    public static void main(String[] args) throws InterruptedException {
        CustomLock lock = new CustomLock();
        int count = 0;
        
        Thread[] threads = new Thread[5];
        for (int i = 0; i < 5; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < 1000; j++) {
                    lock.lock();
                    try {
                        // count++; // 这里需要使用volatile或其他同步机制
                        System.out.println(Thread.currentThread().getName() + " working");
                    } finally {
                        lock.unlock();
                    }
                }
            }, "Thread-" + i);
            threads[i].start();
        }
        
        for (Thread thread : threads) {
            thread.join();
        }
    }
}
```

## 4. 读写锁（ReadWriteLock）

### 4.1 ReentrantReadWriteLock使用

```java
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.HashMap;
import java.util.Map;

public class ReadWriteLockDemo {
    private final Map<String, String> cache = new HashMap<>();
    private final ReentrantReadWriteLock rwLock = new ReentrantReadWriteLock();
    private final ReentrantReadWriteLock.ReadLock readLock = rwLock.readLock();
    private final ReentrantReadWriteLock.WriteLock writeLock = rwLock.writeLock();
    
    // 读操作
    public String get(String key) {
        readLock.lock();
        try {
            System.out.println(Thread.currentThread().getName() + " reading: " + key);
            Thread.sleep(100); // 模拟读操作耗时
            return cache.get(key);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return null;
        } finally {
            readLock.unlock();
        }
    }
    
    // 写操作
    public void put(String key, String value) {
        writeLock.lock();
        try {
            System.out.println(Thread.currentThread().getName() + " writing: " + key + "=" + value);
            Thread.sleep(200); // 模拟写操作耗时
            cache.put(key, value);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            writeLock.unlock();
        }
    }
    
    // 锁降级示例
    public String getAndUpdate(String key, String newValue) {
        writeLock.lock();
        try {
            String oldValue = cache.get(key);
            cache.put(key, newValue);
            
            // 锁降级：在持有写锁的情况下获取读锁
            readLock.lock();
            try {
                writeLock.unlock(); // 释放写锁
                // 现在只持有读锁
                System.out.println("Lock downgrade: " + key + " updated from " + oldValue + " to " + newValue);
                return oldValue;
            } finally {
                readLock.unlock();
            }
        } finally {
            // 确保写锁被释放（如果还持有的话）
            if (rwLock.isWriteLockedByCurrentThread()) {
                writeLock.unlock();
            }
        }
    }
    
    public static void main(String[] args) throws InterruptedException {
        ReadWriteLockDemo demo = new ReadWriteLockDemo();
        
        // 初始化一些数据
        demo.put("key1", "value1");
        demo.put("key2", "value2");
        
        // 创建多个读线程
        Thread[] readers = new Thread[5];
        for (int i = 0; i < 5; i++) {
            readers[i] = new Thread(() -> {
                for (int j = 0; j < 3; j++) {
                    String value = demo.get("key1");
                    System.out.println(Thread.currentThread().getName() + " got: " + value);
                }
            }, "Reader-" + i);
        }
        
        // 创建写线程
        Thread writer = new Thread(() -> {
            for (int i = 0; i < 3; i++) {
                demo.put("key1", "newValue" + i);
            }
        }, "Writer");
        
        // 启动所有线程
        for (Thread reader : readers) {
            reader.start();
        }
        writer.start();
        
        // 等待所有线程完成
        for (Thread reader : readers) {
            reader.join();
        }
        writer.join();
        
        // 测试锁降级
        System.out.println("\n=== 锁降级测试 ===");
        demo.getAndUpdate("key1", "finalValue");
    }
}
```

### 4.2 StampedLock（JDK 8+）

```java
import java.util.concurrent.locks.StampedLock;

public class StampedLockDemo {
    private double x, y;
    private final StampedLock sl = new StampedLock();
    
    // 写操作
    public void write(double newX, double newY) {
        long stamp = sl.writeLock();
        try {
            x = newX;
            y = newY;
            System.out.println(Thread.currentThread().getName() + " wrote: (" + x + ", " + y + ")");
        } finally {
            sl.unlockWrite(stamp);
        }
    }
    
    // 乐观读
    public double distanceFromOrigin() {
        long stamp = sl.tryOptimisticRead();
        double curX = x, curY = y;
        
        if (!sl.validate(stamp)) {
            // 乐观读失败，升级为悲观读锁
            stamp = sl.readLock();
            try {
                curX = x;
                curY = y;
                System.out.println(Thread.currentThread().getName() + " upgraded to read lock");
            } finally {
                sl.unlockRead(stamp);
            }
        } else {
            System.out.println(Thread.currentThread().getName() + " optimistic read succeeded");
        }
        
        return Math.sqrt(curX * curX + curY * curY);
    }
    
    // 悲观读
    public double distanceFromOriginPessimistic() {
        long stamp = sl.readLock();
        try {
            System.out.println(Thread.currentThread().getName() + " pessimistic read");
            return Math.sqrt(x * x + y * y);
        } finally {
            sl.unlockRead(stamp);
        }
    }
    
    // 读锁升级为写锁
    public void moveIfAtOrigin(double newX, double newY) {
        long stamp = sl.readLock();
        try {
            while (x == 0.0 && y == 0.0) {
                // 尝试将读锁升级为写锁
                long ws = sl.tryConvertToWriteLock(stamp);
                if (ws != 0L) {
                    // 升级成功
                    stamp = ws;
                    x = newX;
                    y = newY;
                    System.out.println(Thread.currentThread().getName() + " upgraded to write lock and moved to (" + x + ", " + y + ")");
                    break;
                } else {
                    // 升级失败，释放读锁，获取写锁
                    sl.unlockRead(stamp);
                    stamp = sl.writeLock();
                    System.out.println(Thread.currentThread().getName() + " acquired write lock directly");
                }
            }
        } finally {
            sl.unlock(stamp);
        }
    }
    
    public static void main(String[] args) throws InterruptedException {
        StampedLockDemo demo = new StampedLockDemo();
        
        // 写线程
        Thread writer = new Thread(() -> {
            for (int i = 0; i < 5; i++) {
                demo.write(i, i * 2);
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        }, "Writer");
        
        // 乐观读线程
        Thread optimisticReader = new Thread(() -> {
            for (int i = 0; i < 10; i++) {
                double distance = demo.distanceFromOrigin();
                System.out.println("Distance: " + distance);
                try {
                    Thread.sleep(50);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        }, "OptimisticReader");
        
        // 悲观读线程
        Thread pessimisticReader = new Thread(() -> {
            for (int i = 0; i < 5; i++) {
                double distance = demo.distanceFromOriginPessimistic();
                System.out.println("Pessimistic Distance: " + distance);
                try {
                    Thread.sleep(150);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        }, "PessimisticReader");
        
        writer.start();
        optimisticReader.start();
        pessimisticReader.start();
        
        writer.join();
        optimisticReader.join();
        pessimisticReader.join();
        
        // 测试锁升级
        System.out.println("\n=== 锁升级测试 ===");
        demo.write(0, 0); // 重置为原点
        demo.moveIfAtOrigin(10, 20);
    }
}
```

## 5. 锁的性能比较与分析

### 5.1 不同锁的性能测试

```java
import java.util.concurrent.locks.ReentrantLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.concurrent.locks.StampedLock;

public class LockPerformanceTest {
    private static final int THREAD_COUNT = 10;
    private static final int ITERATIONS = 100000;
    
    private int synchronizedCounter = 0;
    private int reentrantLockCounter = 0;
    private int readWriteLockCounter = 0;
    private int stampedLockCounter = 0;
    
    private final Object syncLock = new Object();
    private final ReentrantLock reentrantLock = new ReentrantLock();
    private final ReentrantReadWriteLock rwLock = new ReentrantReadWriteLock();
    private final StampedLock stampedLock = new StampedLock();
    
    // synchronized性能测试
    public void testSynchronized() throws InterruptedException {
        long startTime = System.currentTimeMillis();
        
        Thread[] threads = new Thread[THREAD_COUNT];
        for (int i = 0; i < THREAD_COUNT; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < ITERATIONS; j++) {
                    synchronized (syncLock) {
                        synchronizedCounter++;
                    }
                }
            });
            threads[i].start();
        }
        
        for (Thread thread : threads) {
            thread.join();
        }
        
        long endTime = System.currentTimeMillis();
        System.out.println("Synchronized: " + (endTime - startTime) + "ms, Counter: " + synchronizedCounter);
    }
    
    // ReentrantLock性能测试
    public void testReentrantLock() throws InterruptedException {
        long startTime = System.currentTimeMillis();
        
        Thread[] threads = new Thread[THREAD_COUNT];
        for (int i = 0; i < THREAD_COUNT; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < ITERATIONS; j++) {
                    reentrantLock.lock();
                    try {
                        reentrantLockCounter++;
                    } finally {
                        reentrantLock.unlock();
                    }
                }
            });
            threads[i].start();
        }
        
        for (Thread thread : threads) {
            thread.join();
        }
        
        long endTime = System.currentTimeMillis();
        System.out.println("ReentrantLock: " + (endTime - startTime) + "ms, Counter: " + reentrantLockCounter);
    }
    
    // ReadWriteLock性能测试（写操作）
    public void testReadWriteLock() throws InterruptedException {
        long startTime = System.currentTimeMillis();
        
        Thread[] threads = new Thread[THREAD_COUNT];
        for (int i = 0; i < THREAD_COUNT; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < ITERATIONS; j++) {
                    rwLock.writeLock().lock();
                    try {
                        readWriteLockCounter++;
                    } finally {
                        rwLock.writeLock().unlock();
                    }
                }
            });
            threads[i].start();
        }
        
        for (Thread thread : threads) {
            thread.join();
        }
        
        long endTime = System.currentTimeMillis();
        System.out.println("ReadWriteLock: " + (endTime - startTime) + "ms, Counter: " + readWriteLockCounter);
    }
    
    // StampedLock性能测试
    public void testStampedLock() throws InterruptedException {
        long startTime = System.currentTimeMillis();
        
        Thread[] threads = new Thread[THREAD_COUNT];
        for (int i = 0; i < THREAD_COUNT; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < ITERATIONS; j++) {
                    long stamp = stampedLock.writeLock();
                    try {
                        stampedLockCounter++;
                    } finally {
                        stampedLock.unlockWrite(stamp);
                    }
                }
            });
            threads[i].start();
        }
        
        for (Thread thread : threads) {
            thread.join();
        }
        
        long endTime = System.currentTimeMillis();
        System.out.println("StampedLock: " + (endTime - startTime) + "ms, Counter: " + stampedLockCounter);
    }
    
    public static void main(String[] args) throws InterruptedException {
        LockPerformanceTest test = new LockPerformanceTest();
        
        System.out.println("=== 锁性能测试 (" + THREAD_COUNT + " threads, " + ITERATIONS + " iterations each) ===");
        
        test.testSynchronized();
        test.testReentrantLock();
        test.testReadWriteLock();
        test.testStampedLock();
    }
}
```

### 5.2 读写场景性能比较

```java
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.concurrent.locks.StampedLock;
import java.util.Random;

public class ReadWritePerformanceTest {
    private static final int READER_COUNT = 8;
    private static final int WRITER_COUNT = 2;
    private static final int OPERATIONS = 10000;
    
    private volatile int data = 0;
    private final Object syncLock = new Object();
    private final ReentrantReadWriteLock rwLock = new ReentrantReadWriteLock();
    private final StampedLock stampedLock = new StampedLock();
    private final Random random = new Random();
    
    // synchronized读写测试
    public void testSynchronizedReadWrite() throws InterruptedException {
        long startTime = System.currentTimeMillis();
        
        Thread[] readers = new Thread[READER_COUNT];
        Thread[] writers = new Thread[WRITER_COUNT];
        
        // 创建读线程
        for (int i = 0; i < READER_COUNT; i++) {
            readers[i] = new Thread(() -> {
                for (int j = 0; j < OPERATIONS; j++) {
                    synchronized (syncLock) {
                        int value = data; // 读操作
                        // 模拟读操作耗时
                        try {
                            Thread.sleep(0, 1000); // 1微秒
                        } catch (InterruptedException e) {
                            Thread.currentThread().interrupt();
                        }
                    }
                }
            }, "SyncReader-" + i);
        }
        
        // 创建写线程
        for (int i = 0; i < WRITER_COUNT; i++) {
            writers[i] = new Thread(() -> {
                for (int j = 0; j < OPERATIONS; j++) {
                    synchronized (syncLock) {
                        data = random.nextInt(1000); // 写操作
                        // 模拟写操作耗时
                        try {
                            Thread.sleep(0, 5000); // 5微秒
                        } catch (InterruptedException e) {
                            Thread.currentThread().interrupt();
                        }
                    }
                }
            }, "SyncWriter-" + i);
        }
        
        // 启动所有线程
        for (Thread reader : readers) reader.start();
        for (Thread writer : writers) writer.start();
        
        // 等待完成
        for (Thread reader : readers) reader.join();
        for (Thread writer : writers) writer.join();
        
        long endTime = System.currentTimeMillis();
        System.out.println("Synchronized ReadWrite: " + (endTime - startTime) + "ms");
    }
    
    // ReadWriteLock读写测试
    public void testReadWriteLock() throws InterruptedException {
        long startTime = System.currentTimeMillis();
        
        Thread[] readers = new Thread[READER_COUNT];
        Thread[] writers = new Thread[WRITER_COUNT];
        
        // 创建读线程
        for (int i = 0; i < READER_COUNT; i++) {
            readers[i] = new Thread(() -> {
                for (int j = 0; j < OPERATIONS; j++) {
                    rwLock.readLock().lock();
                    try {
                        int value = data; // 读操作
                        // 模拟读操作耗时
                        Thread.sleep(0, 1000); // 1微秒
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    } finally {
                        rwLock.readLock().unlock();
                    }
                }
            }, "RWReader-" + i);
        }
        
        // 创建写线程
        for (int i = 0; i < WRITER_COUNT; i++) {
            writers[i] = new Thread(() -> {
                for (int j = 0; j < OPERATIONS; j++) {
                    rwLock.writeLock().lock();
                    try {
                        data = random.nextInt(1000); // 写操作
                        // 模拟写操作耗时
                        Thread.sleep(0, 5000); // 5微秒
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    } finally {
                        rwLock.writeLock().unlock();
                    }
                }
            }, "RWWriter-" + i);
        }
        
        // 启动所有线程
        for (Thread reader : readers) reader.start();
        for (Thread writer : writers) writer.start();
        
        // 等待完成
        for (Thread reader : readers) reader.join();
        for (Thread writer : writers) writer.join();
        
        long endTime = System.currentTimeMillis();
        System.out.println("ReadWriteLock: " + (endTime - startTime) + "ms");
    }
    
    // StampedLock读写测试
    public void testStampedLock() throws InterruptedException {
        long startTime = System.currentTimeMillis();
        
        Thread[] readers = new Thread[READER_COUNT];
        Thread[] writers = new Thread[WRITER_COUNT];
        
        // 创建读线程（使用乐观读）
        for (int i = 0; i < READER_COUNT; i++) {
            readers[i] = new Thread(() -> {
                for (int j = 0; j < OPERATIONS; j++) {
                    long stamp = stampedLock.tryOptimisticRead();
                    int value = data;
                    
                    if (!stampedLock.validate(stamp)) {
                        // 乐观读失败，使用悲观读
                        stamp = stampedLock.readLock();
                        try {
                            value = data;
                        } finally {
                            stampedLock.unlockRead(stamp);
                        }
                    }
                    
                    // 模拟读操作耗时
                    try {
                        Thread.sleep(0, 1000); // 1微秒
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    }
                }
            }, "StampedReader-" + i);
        }
        
        // 创建写线程
        for (int i = 0; i < WRITER_COUNT; i++) {
            writers[i] = new Thread(() -> {
                for (int j = 0; j < OPERATIONS; j++) {
                    long stamp = stampedLock.writeLock();
                    try {
                        data = random.nextInt(1000); // 写操作
                        // 模拟写操作耗时
                        Thread.sleep(0, 5000); // 5微秒
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    } finally {
                        stampedLock.unlockWrite(stamp);
                    }
                }
            }, "StampedWriter-" + i);
        }
        
        // 启动所有线程
        for (Thread reader : readers) reader.start();
        for (Thread writer : writers) writer.start();
        
        // 等待完成
        for (Thread reader : readers) reader.join();
        for (Thread writer : writers) writer.join();
        
        long endTime = System.currentTimeMillis();
        System.out.println("StampedLock: " + (endTime - startTime) + "ms");
    }
    
    public static void main(String[] args) throws InterruptedException {
        ReadWritePerformanceTest test = new ReadWritePerformanceTest();
        
        System.out.println("=== 读写场景性能测试 (" + READER_COUNT + " readers, " + WRITER_COUNT + " writers, " + OPERATIONS + " operations each) ===");
        
        test.testSynchronizedReadWrite();
        test.testReadWriteLock();
        test.testStampedLock();
    }
}
```

## 6. 死锁检测与预防

### 6.1 死锁示例与检测

```java
import java.util.concurrent.locks.ReentrantLock;
import java.lang.management.ManagementFactory;
import java.lang.management.ThreadMXBean;
import java.lang.management.ThreadInfo;

public class DeadlockDemo {
    private final ReentrantLock lock1 = new ReentrantLock();
    private final ReentrantLock lock2 = new ReentrantLock();
    
    // 可能导致死锁的方法1
    public void method1() {
        lock1.lock();
        try {
            System.out.println(Thread.currentThread().getName() + " acquired lock1");
            Thread.sleep(100);
            
            lock2.lock();
            try {
                System.out.println(Thread.currentThread().getName() + " acquired lock2");
            } finally {
                lock2.unlock();
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            lock1.unlock();
        }
    }
    
    // 可能导致死锁的方法2
    public void method2() {
        lock2.lock();
        try {
            System.out.println(Thread.currentThread().getName() + " acquired lock2");
            Thread.sleep(100);
            
            lock1.lock();
            try {
                System.out.println(Thread.currentThread().getName() + " acquired lock1");
            } finally {
                lock1.unlock();
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            lock2.unlock();
        }
    }
    
    // 死锁检测
    public static void detectDeadlock() {
        ThreadMXBean threadBean = ManagementFactory.getThreadMXBean();
        long[] deadlockedThreads = threadBean.findDeadlockedThreads();
        
        if (deadlockedThreads != null) {
            ThreadInfo[] threadInfos = threadBean.getThreadInfo(deadlockedThreads);
            System.out.println("\n=== 检测到死锁 ===");
            for (ThreadInfo threadInfo : threadInfos) {
                System.out.println("线程名: " + threadInfo.getThreadName());
                System.out.println("线程状态: " + threadInfo.getThreadState());
                System.out.println("锁名: " + threadInfo.getLockName());
                System.out.println("锁拥有者: " + threadInfo.getLockOwnerName());
                System.out.println("---");
            }
        } else {
            System.out.println("未检测到死锁");
        }
    }
    
    public static void main(String[] args) throws InterruptedException {
        DeadlockDemo demo = new DeadlockDemo();
        
        Thread t1 = new Thread(() -> {
            demo.method1();
        }, "Thread-1");
        
        Thread t2 = new Thread(() -> {
            demo.method2();
        }, "Thread-2");
        
        // 启动死锁检测线程
        Thread detector = new Thread(() -> {
            while (true) {
                try {
                    Thread.sleep(1000);
                    detectDeadlock();
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }, "DeadlockDetector");
        detector.setDaemon(true);
        detector.start();
        
        t1.start();
        t2.start();
        
        // 等待一段时间后强制结束
        Thread.sleep(5000);
        System.out.println("强制结束程序");
        System.exit(0);
    }
}
```

### 6.2 死锁预防策略

```java
import java.util.concurrent.locks.ReentrantLock;
import java.util.concurrent.TimeUnit;
import java.util.Random;

public class DeadlockPreventionDemo {
    private final ReentrantLock lock1 = new ReentrantLock();
    private final ReentrantLock lock2 = new ReentrantLock();
    private final Random random = new Random();
    
    // 策略1: 锁排序 - 始终按相同顺序获取锁
    public void lockOrderingStrategy() {
        // 为锁分配唯一ID，始终按ID顺序获取
        ReentrantLock firstLock = System.identityHashCode(lock1) < System.identityHashCode(lock2) ? lock1 : lock2;
        ReentrantLock secondLock = System.identityHashCode(lock1) < System.identityHashCode(lock2) ? lock2 : lock1;
        
        firstLock.lock();
        try {
            System.out.println(Thread.currentThread().getName() + " acquired first lock");
            Thread.sleep(100);
            
            secondLock.lock();
            try {
                System.out.println(Thread.currentThread().getName() + " acquired second lock");
                // 执行业务逻辑
            } finally {
                secondLock.unlock();
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            firstLock.unlock();
        }
    }
    
    // 策略2: 超时机制
    public void timeoutStrategy() {
        try {
            if (lock1.tryLock(1000, TimeUnit.MILLISECONDS)) {
                try {
                    System.out.println(Thread.currentThread().getName() + " acquired lock1");
                    
                    if (lock2.tryLock(1000, TimeUnit.MILLISECONDS)) {
                        try {
                            System.out.println(Thread.currentThread().getName() + " acquired lock2");
                            // 执行业务逻辑
                        } finally {
                            lock2.unlock();
                        }
                    } else {
                        System.out.println(Thread.currentThread().getName() + " failed to acquire lock2, backing off");
                    }
                } finally {
                    lock1.unlock();
                }
            } else {
                System.out.println(Thread.currentThread().getName() + " failed to acquire lock1, backing off");
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
    
    // 策略3: 回退策略
    public void backoffStrategy() {
        boolean acquired = false;
        int attempts = 0;
        
        while (!acquired && attempts < 5) {
            try {
                if (lock1.tryLock()) {
                    try {
                        System.out.println(Thread.currentThread().getName() + " acquired lock1");
                        
                        if (lock2.tryLock()) {
                            try {
                                System.out.println(Thread.currentThread().getName() + " acquired lock2");
                                // 执行业务逻辑
                                acquired = true;
                            } finally {
                                lock2.unlock();
                            }
                        } else {
                            System.out.println(Thread.currentThread().getName() + " failed to acquire lock2, backing off");
                        }
                    } finally {
                        lock1.unlock();
                    }
                }
                
                if (!acquired) {
                    attempts++;
                    // 随机回退时间，避免活锁
                    Thread.sleep(random.nextInt(100) + 50);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }
        
        if (!acquired) {
            System.out.println(Thread.currentThread().getName() + " failed to acquire locks after " + attempts + " attempts");
        }
    }
    
    public static void main(String[] args) throws InterruptedException {
        DeadlockPreventionDemo demo = new DeadlockPreventionDemo();
        
        System.out.println("=== 锁排序策略测试 ===");
        Thread[] orderingThreads = new Thread[5];
        for (int i = 0; i < 5; i++) {
            orderingThreads[i] = new Thread(demo::lockOrderingStrategy, "OrderingThread-" + i);
            orderingThreads[i].start();
        }
        for (Thread t : orderingThreads) {
            t.join();
        }
        
        System.out.println("\n=== 超时策略测试 ===");
        Thread[] timeoutThreads = new Thread[5];
        for (int i = 0; i < 5; i++) {
            timeoutThreads[i] = new Thread(demo::timeoutStrategy, "TimeoutThread-" + i);
            timeoutThreads[i].start();
        }
        for (Thread t : timeoutThreads) {
            t.join();
        }
        
        System.out.println("\n=== 回退策略测试 ===");
        Thread[] backoffThreads = new Thread[5];
        for (int i = 0; i < 5; i++) {
            backoffThreads[i] = new Thread(demo::backoffStrategy, "BackoffThread-" + i);
            backoffThreads[i].start();
        }
        for (Thread t : backoffThreads) {
            t.join();
        }
    }
}
```

## 7. 锁的最佳实践

### 7.1 锁的选择指南

```java
import java.util.concurrent.locks.ReentrantLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.concurrent.locks.StampedLock;

public class LockSelectionGuide {
    
    // 场景1: 简单的互斥访问 - 使用synchronized
    private int simpleCounter = 0;
    
    public synchronized void incrementSimple() {
        simpleCounter++;
    }
    
    // 场景2: 需要可中断、超时、公平性 - 使用ReentrantLock
    private final ReentrantLock advancedLock = new ReentrantLock(true); // 公平锁
    private int advancedCounter = 0;
    
    public void incrementAdvanced() throws InterruptedException {
        if (advancedLock.tryLock(1000, java.util.concurrent.TimeUnit.MILLISECONDS)) {
            try {
                advancedCounter++;
            } finally {
                advancedLock.unlock();
            }
        } else {
            System.out.println("Failed to acquire lock within timeout");
        }
    }
    
    // 场景3: 读多写少 - 使用ReadWriteLock
    private final ReentrantReadWriteLock rwLock = new ReentrantReadWriteLock();
    private String data = "initial";
    
    public String readData() {
        rwLock.readLock().lock();
        try {
            // 模拟读操作
            Thread.sleep(10);
            return data;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return null;
        } finally {
            rwLock.readLock().unlock();
        }
    }
    
    public void writeData(String newData) {
        rwLock.writeLock().lock();
        try {
            // 模拟写操作
            Thread.sleep(50);
            data = newData;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            rwLock.writeLock().unlock();
        }
    }
    
    // 场景4: 读操作极其频繁，写操作很少 - 使用StampedLock
    private final StampedLock stampedLock = new StampedLock();
    private double x = 0.0, y = 0.0;
    
    public double calculateDistance() {
        long stamp = stampedLock.tryOptimisticRead();
        double curX = x, curY = y;
        
        if (!stampedLock.validate(stamp)) {
            // 乐观读失败，使用悲观读
            stamp = stampedLock.readLock();
            try {
                curX = x;
                curY = y;
            } finally {
                stampedLock.unlockRead(stamp);
            }
        }
        
        return Math.sqrt(curX * curX + curY * curY);
    }
    
    public void updateCoordinates(double newX, double newY) {
        long stamp = stampedLock.writeLock();
        try {
            x = newX;
            y = newY;
        } finally {
            stampedLock.unlockWrite(stamp);
        }
    }
    
    public static void main(String[] args) {
        LockSelectionGuide guide = new LockSelectionGuide();
        
        System.out.println("锁选择指南:");
        System.out.println("1. 简单互斥访问 -> synchronized");
        System.out.println("2. 需要高级功能(超时、中断、公平性) -> ReentrantLock");
        System.out.println("3. 读多写少场景 -> ReentrantReadWriteLock");
        System.out.println("4. 读操作极其频繁 -> StampedLock");
    }
}
```

### 7.2 锁优化技巧

```java
import java.util.concurrent.locks.ReentrantLock;

public class LockOptimizationTips {
    private final ReentrantLock lock = new ReentrantLock();
    private int counter = 0;
    
    // 技巧1: 减少锁的持有时间
    public void badExample() {
        lock.lock();
        try {
            // 不好的做法：在锁内进行耗时操作
            counter++;
            expensiveOperation(); // 耗时操作
            counter++;
        } finally {
            lock.unlock();
        }
    }
    
    public void goodExample() {
        // 好的做法：将耗时操作移到锁外
        expensiveOperation(); // 耗时操作移到锁外
        
        lock.lock();
        try {
            counter++;
            counter++;
        } finally {
            lock.unlock();
        }
    }
    
    // 技巧2: 减少锁的粒度
    private final ReentrantLock lock1 = new ReentrantLock();
    private final ReentrantLock lock2 = new ReentrantLock();
    private int counter1 = 0;
    private int counter2 = 0;
    
    public void coarseGrainedLock() {
        // 粗粒度锁：一个锁保护多个资源
        lock.lock();
        try {
            counter1++;
            counter2++;
        } finally {
            lock.unlock();
        }
    }
    
    public void fineGrainedLock() {
        // 细粒度锁：每个资源使用独立的锁
        lock1.lock();
        try {
            counter1++;
        } finally {
            lock1.unlock();
        }
        
        lock2.lock();
        try {
            counter2++;
        } finally {
            lock2.unlock();
        }
    }
    
    // 技巧3: 使用tryLock避免阻塞
    public boolean tryIncrementWithTimeout() {
        try {
            if (lock.tryLock(100, java.util.concurrent.TimeUnit.MILLISECONDS)) {
                try {
                    counter++;
                    return true;
                } finally {
                    lock.unlock();
                }
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        return false;
    }
    
    // 技巧4: 锁分离
    private final ReentrantLock readLock = new ReentrantLock();
    private final ReentrantLock writeLock = new ReentrantLock();
    private volatile boolean dataReady = false;
    
    public void readOperation() {
        readLock.lock();
        try {
            if (dataReady) {
                // 执行读操作
                System.out.println("Reading data...");
            }
        } finally {
            readLock.unlock();
        }
    }
    
    public void writeOperation() {
        writeLock.lock();
        try {
            // 执行写操作
            dataReady = true;
            System.out.println("Writing data...");
        } finally {
            writeLock.unlock();
        }
    }
    
    private void expensiveOperation() {
        try {
            Thread.sleep(100); // 模拟耗时操作
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
    
    public static void main(String[] args) {
        LockOptimizationTips tips = new LockOptimizationTips();
        
        System.out.println("锁优化技巧:");
        System.out.println("1. 减少锁的持有时间");
        System.out.println("2. 减少锁的粒度");
        System.out.println("3. 使用tryLock避免阻塞");
        System.out.println("4. 锁分离");
        System.out.println("5. 避免在锁内调用其他同步方法");
        System.out.println("6. 使用并发容器替代同步容器");
    }
}
```

## 8. 总结

Java锁机制是并发编程的核心，本文详细介绍了：

### 8.1 核心要点

1. **synchronized关键字**
   - 基于对象头和Monitor实现
   - 支持锁升级（偏向锁→轻量级锁→重量级锁）
   - JVM自动优化（锁消除、锁粗化、适应性自旋）

2. **ReentrantLock显式锁**
   - 基于AQS（AbstractQueuedSynchronizer）实现
   - 支持可重入、公平/非公平、可中断、超时等高级特性
   - 需要手动释放锁，使用try-finally确保释放

3. **读写锁机制**
   - ReentrantReadWriteLock：读读共享，读写互斥，写写互斥
   - StampedLock：支持乐观读，性能更优
   - 适用于读多写少的场景

4. **性能与选择**
   - synchronized：简单场景，JVM优化好
   - ReentrantLock：需要高级功能时
   - ReadWriteLock：读多写少场景
   - StampedLock：读操作极其频繁的场景

### 8.2 最佳实践

1. **锁的选择原则**
   - 优先使用synchronized，除非需要高级功能
   - 读多写少场景使用读写锁
   - 避免过度使用锁，考虑无锁数据结构

2. **性能优化策略**
   - 减少锁的持有时间
   - 减少锁的粒度
   - 避免在锁内进行耗时操作
   - 使用tryLock避免无限等待

3. **死锁预防**
   - 锁排序：始终按相同顺序获取锁
   - 超时机制：使用tryLock设置超时
   - 回退策略：获取失败时主动释放已持有的锁

### 8.3 发展趋势

1. **无锁编程**：使用原子类、CAS操作
2. **并发容器**：ConcurrentHashMap、CopyOnWriteArrayList等
3. **异步编程**：CompletableFuture、响应式编程
4. **虚拟线程**：Project Loom带来的轻量级线程

理解和掌握Java锁机制对于编写高性能、线程安全的并发程序至关重要。在实际开发中，应根据具体场景选择合适的锁机制，并遵循最佳实践来避免常见的并发问题。

### 1.2 锁的分类

1. **悲观锁 vs 乐观锁**
   - 悲观锁：假设会发生并发冲突，每次访问都加锁
   - 乐观锁：假设不会发生冲突，只在更新时检查

2. **公平锁 vs 非公平锁**
   - 公平锁：按照请求锁的顺序获取锁
   - 非公平锁：不保证获取锁的顺序

3. **可重入锁 vs 不可重入锁**
   - 可重入锁：同一线程可以多次获取同一把锁
   - 不可重入锁：同一线程不能多次获取同一把锁

4. **独享锁 vs 共享锁**
   - 独享锁：只能被一个线程持有（如写锁）
   - 共享锁：可以被多个线程同时持有（如读锁）

## 2. synchronized实现原理

### 2.1 synchronized的使用方式

```java
public class SynchronizedDemo {
    private int count = 0;
    private static int staticCount = 0;
    
    // 1. 修饰实例方法
    public synchronized void instanceMethod() {
        count++;
        System.out.println("Instance method: " + count);
    }
    
    // 2. 修饰静态方法
    public static synchronized void staticMethod() {
        staticCount++;
        System.out.println("Static method: " + staticCount);
    }
    
    // 3. 修饰代码块
    public void blockMethod() {
        synchronized (this) {
            count++;
            System.out.println("Block method: " + count);
        }
    }
    
    // 4. 修饰静态代码块
    public void staticBlockMethod() {
        synchronized (SynchronizedDemo.class) {
            staticCount++;
            System.out.println("Static block method: " + staticCount);
        }
    }
    
    public static void main(String[] args) throws InterruptedException {
        SynchronizedDemo demo = new SynchronizedDemo();
        
        // 测试不同的synchronized使用方式
        Thread t1 = new Thread(() -> {
            for (int i = 0; i < 5; i++) {
                demo.instanceMethod();
                SynchronizedDemo.staticMethod();
                demo.blockMethod();
                demo.staticBlockMethod();
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        });
        
        Thread t2 = new Thread(() -> {
            for (int i = 0; i < 5; i++) {
                demo.instanceMethod();
                SynchronizedDemo.staticMethod();
                demo.blockMethod();
                demo.staticBlockMethod();
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        });
        
        t1.start();
        t2.start();
        t1.join();
        t2.join();
    }
}
```

### 2.2 synchronized的底层实现

#### 2.2.1 对象头和Monitor

```java
public class ObjectHeaderDemo {
    private final Object lock = new Object();
    
    public void demonstrateObjectHeader() {
        synchronized (lock) {
            // 在这个代码块中，lock对象的对象头会被修改
            // Mark Word会存储指向Monitor对象的指针
            System.out.println("Inside synchronized block");
            
            // 可以通过JOL（Java Object Layout）工具查看对象头信息
            // System.out.println(ClassLayout.parseInstance(lock).toPrintable());
        }
    }
    
    public static void main(String[] args) {
        ObjectHeaderDemo demo = new ObjectHeaderDemo();
        demo.demonstrateObjectHeader();
    }
}
```

#### 2.2.2 锁升级过程

```java
public class LockUpgradeDemo {
    private int count = 0;
    
    public void demonstrateLockUpgrade() {
        // 1. 无锁状态 -> 偏向锁
        // 当第一个线程访问时，会升级为偏向锁
        synchronized (this) {
            count++;
            System.out.println("First access - Biased Lock");
        }
        
        // 2. 偏向锁 -> 轻量级锁
        // 当有第二个线程竞争时，会升级为轻量级锁
        Thread t1 = new Thread(() -> {
            synchronized (this) {
                count++;
                System.out.println("Second thread - Lightweight Lock");
            }
        });
        t1.start();
        
        try {
            t1.join();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        // 3. 轻量级锁 -> 重量级锁
        // 当竞争激烈时，会升级为重量级锁
        Thread[] threads = new Thread[10];
        for (int i = 0; i < 10; i++) {
            threads[i] = new Thread(() -> {
                synchronized (this) {
                    count++;
                    try {
                        Thread.sleep(10); // 增加竞争
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    }
                }
            });
            threads[i].start();
        }
        
        for (Thread thread : threads) {
            try {
                thread.join();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
        
        System.out.println("Final count: " + count);
    }
    
    public static void main(String[] args) {
        LockUpgradeDemo demo = new LockUpgradeDemo();
        demo.demonstrateLockUpgrade();
    }
}
```

### 2.3 synchronized的性能优化

```java
public class SynchronizedOptimizationDemo {
    private int count = 0;
    private final Object lock = new Object();
    
    // 锁消除示例
    public void lockElimination() {
        // JVM会检测到这个StringBuffer只在方法内部使用
        // 不会被其他线程访问，因此会消除synchronized
        StringBuffer sb = new StringBuffer();
        sb.append("Hello");
        sb.append(" World");
        System.out.println(sb.toString());
    }
    
    // 锁粗化示例
    public void lockCoarsening() {
        // 原本的细粒度锁
        synchronized (lock) {
            count++;
        }
        synchronized (lock) {
            count++;
        }
        synchronized (lock) {
            count++;
        }
        
        // JVM会将上述代码优化为：
        // synchronized (lock) {
        //     count++;
        //     count++;
        //     count++;
        // }
    }
    
    // 适应性自旋示例
    public void adaptiveSpinning() {
        Thread[] threads = new Thread[5];
        
        for (int i = 0; i < 5; i++) {
            threads[i] = new Thread(() -> {
                synchronized (lock) {
                    // 短时间持有锁，适合自旋等待
                    count++;
                    System.out.println(Thread.currentThread().getName() + ": " + count);
                }
            }, "Thread-" + i);
        }
        
        for (Thread thread : threads) {
            thread.start();
        }
        
        for (Thread thread : threads) {
            try {
                thread.join();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }
    
    public static void main(String[] args) {
        SynchronizedOptimizationDemo demo = new SynchronizedOptimizationDemo();
        
        System.out.println("=== 锁消除演示 ===");
        demo.lockElimination();
        
        System.out.println("\n=== 锁粗化演示 ===");
        demo.lockCoarsening();
        
        System.out.println("\n=== 适应性自旋演示 ===");
        demo.adaptiveSpinning();
    }
}
```


