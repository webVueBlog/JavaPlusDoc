---
title: jvm线程通信原理
author: 哪吒
date: '2023-06-15'
---

# jvm线程通信原理

JVM线程通信是多线程编程的核心概念，理解线程间如何安全、高效地交换数据和协调工作对于构建高质量的并发应用程序至关重要。本文将深入探讨JVM中各种线程通信机制的实现原理和最佳实践。

## 1. 线程通信概述

### 1.1 线程通信的定义与重要性

线程通信是指多个线程之间交换信息、协调执行顺序和共享资源的机制。在JVM中，线程通信主要通过共享内存模型实现。

```

## 5. ThreadLocal机制

### 5.1 ThreadLocal基本原理

`ThreadLocal`为每个线程提供独立的变量副本，实现线程间的数据隔离。

```java
public class ThreadLocalDemo {
    // ThreadLocal变量，每个线程都有自己的副本
    private static final ThreadLocal<Integer> threadLocalValue = new ThreadLocal<Integer>() {
        @Override
        protected Integer initialValue() {
            return 0; // 初始值
        }
    };
    
    private static final ThreadLocal<String> threadLocalName = ThreadLocal.withInitial(() -> "DefaultName");
    
    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== ThreadLocal演示 ===");
        
        // 创建多个线程，每个线程操作自己的ThreadLocal变量
        Thread[] threads = new Thread[3];
        
        for (int i = 0; i < 3; i++) {
            final int threadId = i;
            threads[i] = new Thread(() -> {
                // 设置当前线程的ThreadLocal值
                threadLocalValue.set(threadId * 100);
                threadLocalName.set("Thread-" + threadId);
                
                System.out.println(Thread.currentThread().getName() + 
                    " 设置值: " + threadLocalValue.get() + ", 名称: " + threadLocalName.get());
                
                // 模拟一些工作
                for (int j = 0; j < 3; j++) {
                    int currentValue = threadLocalValue.get();
                    threadLocalValue.set(currentValue + 1);
                    
                    System.out.println(Thread.currentThread().getName() + 
                        " 当前值: " + threadLocalValue.get());
                    
                    try {
                        Thread.sleep(100);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
                
                // 清理ThreadLocal，避免内存泄漏
                threadLocalValue.remove();
                threadLocalName.remove();
                
            }, "Worker-" + i);
        }
        
        // 启动所有线程
        for (Thread thread : threads) {
            thread.start();
        }
        
        // 等待所有线程完成
        for (Thread thread : threads) {
            thread.join();
        }
        
        // 演示ThreadLocal的继承性
        demonstrateInheritableThreadLocal();
    }
    
    private static final InheritableThreadLocal<String> inheritableThreadLocal = 
        new InheritableThreadLocal<String>() {
            @Override
            protected String initialValue() {
                return "Parent Value";
            }
            
            @Override
            protected String childValue(String parentValue) {
                return parentValue + " -> Child";
            }
        };
    
    private static void demonstrateInheritableThreadLocal() throws InterruptedException {
        System.out.println("\n=== InheritableThreadLocal演示 ===");
        
        // 在主线程中设置值
        inheritableThreadLocal.set("Main Thread Value");
        System.out.println("主线程值: " + inheritableThreadLocal.get());
        
        // 创建子线程
        Thread childThread = new Thread(() -> {
            System.out.println("子线程继承的值: " + inheritableThreadLocal.get());
            
            // 子线程修改值
            inheritableThreadLocal.set("Child Thread Modified Value");
            System.out.println("子线程修改后的值: " + inheritableThreadLocal.get());
            
            // 创建孙线程
            Thread grandChildThread = new Thread(() -> {
                System.out.println("孙线程继承的值: " + inheritableThreadLocal.get());
            }, "GrandChild");
            
            grandChildThread.start();
            try {
                grandChildThread.join();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }, "Child");
        
        childThread.start();
        childThread.join();
        
        // 主线程的值不受子线程影响
        System.out.println("主线程最终值: " + inheritableThreadLocal.get());
        
        inheritableThreadLocal.remove();
    }
}
```

### 5.2 ThreadLocal内存泄漏问题

```java
import java.lang.ref.WeakReference;
import java.util.concurrent.TimeUnit;

public class ThreadLocalMemoryLeak {
    
    // 模拟大对象
    static class LargeObject {
        private final byte[] data = new byte[1024 * 1024]; // 1MB
        private final String name;
        
        public LargeObject(String name) {
            this.name = name;
        }
        
        @Override
        public String toString() {
            return "LargeObject{name='" + name + "', size=1MB}";
        }
    }
    
    private static final ThreadLocal<LargeObject> threadLocal = new ThreadLocal<>();
    
    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== ThreadLocal内存泄漏演示 ===");
        
        // 演示正确使用ThreadLocal
        demonstrateCorrectUsage();
        
        // 演示内存泄漏风险
        demonstrateMemoryLeakRisk();
        
        // 演示WeakReference的使用
        demonstrateWeakReference();
    }
    
    private static void demonstrateCorrectUsage() throws InterruptedException {
        System.out.println("\n--- 正确使用ThreadLocal ---");
        
        Thread worker = new Thread(() -> {
            try {
                // 设置ThreadLocal值
                LargeObject obj = new LargeObject("CorrectUsage");
                threadLocal.set(obj);
                
                System.out.println("设置ThreadLocal: " + threadLocal.get());
                
                // 模拟工作
                Thread.sleep(1000);
                
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            } finally {
                // 重要：清理ThreadLocal，避免内存泄漏
                threadLocal.remove();
                System.out.println("ThreadLocal已清理");
            }
        }, "CorrectWorker");
        
        worker.start();
        worker.join();
        
        // 建议进行垃圾回收
        System.gc();
        Thread.sleep(100);
    }
    
    private static void demonstrateMemoryLeakRisk() throws InterruptedException {
        System.out.println("\n--- 内存泄漏风险演示 ---");
        
        Thread riskyWorker = new Thread(() -> {
            // 设置ThreadLocal值但不清理
            LargeObject obj = new LargeObject("RiskyUsage");
            threadLocal.set(obj);
            
            System.out.println("设置ThreadLocal: " + threadLocal.get());
            
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            
            // 注意：这里没有调用threadLocal.remove()
            // 在线程池环境中，这可能导致内存泄漏
            System.out.println("线程结束，但ThreadLocal未清理");
        }, "RiskyWorker");
        
        riskyWorker.start();
        riskyWorker.join();
        
        // 即使线程结束，ThreadLocal的值可能仍然存在
        System.gc();
        Thread.sleep(100);
    }
    
    private static void demonstrateWeakReference() {
        System.out.println("\n--- WeakReference演示 ---");
        
        LargeObject strongRef = new LargeObject("StrongReference");
        WeakReference<LargeObject> weakRef = new WeakReference<>(strongRef);
        
        System.out.println("创建强引用和弱引用");
        System.out.println("弱引用对象: " + weakRef.get());
        
        // 移除强引用
        strongRef = null;
        
        // 强制垃圾回收
        System.gc();
        
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        // 检查弱引用对象是否被回收
        if (weakRef.get() == null) {
            System.out.println("弱引用对象已被垃圾回收");
        } else {
            System.out.println("弱引用对象仍然存在: " + weakRef.get());
        }
    }
}
```

## 6. Condition接口

### 6.1 Condition基本使用

`Condition`接口提供了比`wait/notify`更灵活的线程协调机制。

```java
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.ReentrantLock;
import java.util.LinkedList;
import java.util.Queue;

public class ConditionDemo {
    private final ReentrantLock lock = new ReentrantLock();
    private final Condition notEmpty = lock.newCondition();
    private final Condition notFull = lock.newCondition();
    
    private final Queue<String> queue = new LinkedList<>();
    private final int capacity = 5;
    
    public static void main(String[] args) {
        ConditionDemo demo = new ConditionDemo();
        
        // 创建生产者线程
        for (int i = 0; i < 2; i++) {
            final int producerId = i;
            new Thread(() -> {
                try {
                    for (int j = 0; j < 10; j++) {
                        demo.produce("Producer-" + producerId + "-Item-" + j);
                        Thread.sleep(200);
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }, "Producer-" + i).start();
        }
        
        // 创建消费者线程
        for (int i = 0; i < 3; i++) {
            new Thread(() -> {
                try {
                    while (true) {
                        String item = demo.consume();
                        if (item != null) {
                            Thread.sleep(300);
                        }
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }, "Consumer-" + i).start();
        }
    }
    
    public void produce(String item) throws InterruptedException {
        lock.lock();
        try {
            // 队列满时等待
            while (queue.size() == capacity) {
                System.out.println(Thread.currentThread().getName() + " 等待队列空闲...");
                notFull.await(); // 等待notFull条件
            }
            
            queue.offer(item);
            System.out.println(Thread.currentThread().getName() + " 生产: " + item + 
                ", 队列大小: " + queue.size());
            
            notEmpty.signal(); // 通知消费者队列不为空
            
        } finally {
            lock.unlock();
        }
    }
    
    public String consume() throws InterruptedException {
        lock.lock();
        try {
            // 队列空时等待
            while (queue.isEmpty()) {
                System.out.println(Thread.currentThread().getName() + " 等待数据...");
                notEmpty.await(); // 等待notEmpty条件
            }
            
            String item = queue.poll();
            System.out.println(Thread.currentThread().getName() + " 消费: " + item + 
                ", 队列大小: " + queue.size());
            
            notFull.signal(); // 通知生产者队列不满
            
            return item;
            
        } finally {
            lock.unlock();
        }
    }
}
```

### 6.2 多条件协调

```java
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.ReentrantLock;

public class MultiConditionDemo {
    private final ReentrantLock lock = new ReentrantLock();
    private final Condition conditionA = lock.newCondition();
    private final Condition conditionB = lock.newCondition();
    private final Condition conditionC = lock.newCondition();
    
    private volatile int state = 0; // 0: A, 1: B, 2: C
    
    public static void main(String[] args) {
        MultiConditionDemo demo = new MultiConditionDemo();
        
        // 线程A
        new Thread(() -> {
            for (int i = 0; i < 5; i++) {
                demo.printA();
            }
        }, "Thread-A").start();
        
        // 线程B
        new Thread(() -> {
            for (int i = 0; i < 5; i++) {
                demo.printB();
            }
        }, "Thread-B").start();
        
        // 线程C
        new Thread(() -> {
            for (int i = 0; i < 5; i++) {
                demo.printC();
            }
        }, "Thread-C").start();
    }
    
    public void printA() {
        lock.lock();
        try {
            while (state != 0) {
                conditionA.await();
            }
            
            System.out.println(Thread.currentThread().getName() + ": A");
            state = 1;
            conditionB.signal();
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            lock.unlock();
        }
    }
    
    public void printB() {
        lock.lock();
        try {
            while (state != 1) {
                conditionB.await();
            }
            
            System.out.println(Thread.currentThread().getName() + ": B");
            state = 2;
            conditionC.signal();
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            lock.unlock();
        }
    }
    
    public void printC() {
        lock.lock();
        try {
            while (state != 2) {
                conditionC.await();
            }
            
            System.out.println(Thread.currentThread().getName() + ": C");
            state = 0;
            conditionA.signal();
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            lock.unlock();
        }
    }
}
```

## 7. 高级同步工具

### 7.1 CountDownLatch

`CountDownLatch`允许一个或多个线程等待其他线程完成操作。

```java
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

public class CountDownLatchDemo {
    
    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== CountDownLatch演示 ===");
        
        // 演示基本用法
        demonstrateBasicUsage();
        
        // 演示超时等待
        demonstrateTimeoutWait();
        
        // 演示多阶段任务协调
        demonstrateMultiPhaseCoordination();
    }
    
    private static void demonstrateBasicUsage() throws InterruptedException {
        System.out.println("\n--- 基本用法演示 ---");
        
        int workerCount = 3;
        CountDownLatch startSignal = new CountDownLatch(1); // 开始信号
        CountDownLatch doneSignal = new CountDownLatch(workerCount); // 完成信号
        
        // 创建工作线程
        for (int i = 0; i < workerCount; i++) {
            final int workerId = i;
            new Thread(() -> {
                try {
                    System.out.println("工作线程" + workerId + " 准备就绪，等待开始信号...");
                    startSignal.await(); // 等待开始信号
                    
                    // 模拟工作
                    System.out.println("工作线程" + workerId + " 开始工作");
                    Thread.sleep((workerId + 1) * 1000);
                    System.out.println("工作线程" + workerId + " 完成工作");
                    
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                } finally {
                    doneSignal.countDown(); // 通知完成
                }
            }, "Worker-" + i).start();
        }
        
        Thread.sleep(1000);
        System.out.println("主线程发出开始信号");
        startSignal.countDown(); // 发出开始信号
        
        System.out.println("主线程等待所有工作线程完成...");
        doneSignal.await(); // 等待所有工作线程完成
        System.out.println("所有工作线程已完成");
    }
    
    private static void demonstrateTimeoutWait() throws InterruptedException {
        System.out.println("\n--- 超时等待演示 ---");
        
        CountDownLatch latch = new CountDownLatch(2);
        
        // 快速完成的任务
        new Thread(() -> {
            try {
                Thread.sleep(1000);
                System.out.println("快速任务完成");
                latch.countDown();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }, "FastTask").start();
        
        // 慢速任务
        new Thread(() -> {
            try {
                Thread.sleep(5000); // 5秒
                System.out.println("慢速任务完成");
                latch.countDown();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }, "SlowTask").start();
        
        // 等待3秒
        boolean completed = latch.await(3, TimeUnit.SECONDS);
        if (completed) {
            System.out.println("所有任务在超时前完成");
        } else {
            System.out.println("等待超时，剩余任务数: " + latch.getCount());
        }
    }
    
    private static void demonstrateMultiPhaseCoordination() throws InterruptedException {
        System.out.println("\n--- 多阶段任务协调演示 ---");
        
        int taskCount = 3;
        CountDownLatch phase1Latch = new CountDownLatch(taskCount);
        CountDownLatch phase2Latch = new CountDownLatch(taskCount);
        
        for (int i = 0; i < taskCount; i++) {
            final int taskId = i;
            new Thread(() -> {
                try {
                    // 阶段1
                    System.out.println("任务" + taskId + " 执行阶段1");
                    Thread.sleep(1000 + taskId * 500);
                    System.out.println("任务" + taskId + " 完成阶段1");
                    phase1Latch.countDown();
                    
                    // 等待所有任务完成阶段1
                    phase1Latch.await();
                    
                    // 阶段2
                    System.out.println("任务" + taskId + " 执行阶段2");
                    Thread.sleep(800 + taskId * 300);
                    System.out.println("任务" + taskId + " 完成阶段2");
                    phase2Latch.countDown();
                    
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }, "Task-" + i).start();
        }
        
        phase1Latch.await();
        System.out.println("所有任务完成阶段1，开始阶段2");
        
        phase2Latch.await();
        System.out.println("所有任务完成阶段2");
    }
}
```

### 7.2 CyclicBarrier

`CyclicBarrier`允许一组线程互相等待，直到到达某个公共屏障点。

```java
import java.util.concurrent.BrokenBarrierException;
import java.util.concurrent.CyclicBarrier;
import java.util.Random;

public class CyclicBarrierDemo {
    
    public static void main(String[] args) {
        System.out.println("=== CyclicBarrier演示 ===");
        
        // 演示基本用法
        demonstrateBasicUsage();
        
        // 演示可重用性
        demonstrateReusability();
        
        // 演示屏障动作
        demonstrateBarrierAction();
    }
    
    private static void demonstrateBasicUsage() {
        System.out.println("\n--- 基本用法演示 ---");
        
        int participantCount = 3;
        CyclicBarrier barrier = new CyclicBarrier(participantCount);
        
        for (int i = 0; i < participantCount; i++) {
            final int participantId = i;
            new Thread(() -> {
                try {
                    Random random = new Random();
                    
                    // 模拟准备工作
                    int prepTime = 1000 + random.nextInt(2000);
                    System.out.println("参与者" + participantId + " 开始准备，需要" + prepTime + "ms");
                    Thread.sleep(prepTime);
                    
                    System.out.println("参与者" + participantId + " 准备完成，等待其他参与者...");
                    barrier.await(); // 等待所有参与者到达屏障
                    
                    System.out.println("参与者" + participantId + " 开始执行后续任务");
                    
                } catch (InterruptedException | BrokenBarrierException e) {
                    Thread.currentThread().interrupt();
                    System.err.println("参与者" + participantId + " 被中断: " + e.getMessage());
                }
            }, "Participant-" + i).start();
        }
        
        try {
            Thread.sleep(5000); // 等待演示完成
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
    
    private static void demonstrateReusability() {
        System.out.println("\n--- 可重用性演示 ---");
        
        int participantCount = 2;
        CyclicBarrier barrier = new CyclicBarrier(participantCount);
        
        for (int i = 0; i < participantCount; i++) {
            final int participantId = i;
            new Thread(() -> {
                try {
                    for (int round = 1; round <= 3; round++) {
                        System.out.println("参与者" + participantId + " 第" + round + "轮准备");
                        Thread.sleep(1000);
                        
                        System.out.println("参与者" + participantId + " 第" + round + "轮到达屏障");
                        barrier.await(); // 等待其他参与者
                        
                        System.out.println("参与者" + participantId + " 第" + round + "轮继续执行");
                        Thread.sleep(500);
                    }
                } catch (InterruptedException | BrokenBarrierException e) {
                    Thread.currentThread().interrupt();
                    System.err.println("参与者" + participantId + " 异常: " + e.getMessage());
                }
            }, "ReusableParticipant-" + i).start();
        }
        
        try {
            Thread.sleep(8000); // 等待演示完成
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
    
    private static void demonstrateBarrierAction() {
        System.out.println("\n--- 屏障动作演示 ---");
        
        int participantCount = 3;
        
        // 定义屏障动作
        Runnable barrierAction = () -> {
            System.out.println("*** 所有参与者已到达屏障，执行屏障动作 ***");
            System.out.println("*** 屏障动作：汇总结果、清理资源等 ***");
        };
        
        CyclicBarrier barrier = new CyclicBarrier(participantCount, barrierAction);
        
        for (int i = 0; i < participantCount; i++) {
            final int participantId = i;
            new Thread(() -> {
                try {
                    System.out.println("参与者" + participantId + " 开始工作");
                    Thread.sleep(1000 + participantId * 500);
                    
                    System.out.println("参与者" + participantId + " 完成工作，到达屏障");
                    barrier.await(); // 最后一个到达的线程会执行屏障动作
                    
                    System.out.println("参与者" + participantId + " 屏障后继续执行");
                    
                } catch (InterruptedException | BrokenBarrierException e) {
                    Thread.currentThread().interrupt();
                    System.err.println("参与者" + participantId + " 异常: " + e.getMessage());
                }
            }, "ActionParticipant-" + i).start();
        }
        
        try {
            Thread.sleep(5000); // 等待演示完成
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
```

### 7.3 Semaphore

`Semaphore`控制同时访问特定资源的线程数量。

```java
import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;

public class SemaphoreDemo {
    
    public static void main(String[] args) {
        System.out.println("=== Semaphore演示 ===");
        
        // 演示资源池管理
        demonstrateResourcePool();
        
        // 演示公平性
        demonstrateFairness();
        
        // 演示批量获取
        demonstrateBulkAcquisition();
    }
    
    private static void demonstrateResourcePool() {
        System.out.println("\n--- 资源池管理演示 ---");
        
        // 模拟数据库连接池，最多3个连接
        Semaphore connectionPool = new Semaphore(3);
        
        // 创建10个客户端线程
        for (int i = 0; i < 10; i++) {
            final int clientId = i;
            new Thread(() -> {
                try {
                    System.out.println("客户端" + clientId + " 请求数据库连接...");
                    
                    // 获取连接
                    connectionPool.acquire();
                    System.out.println("客户端" + clientId + " 获得数据库连接，剩余连接: " + 
                        connectionPool.availablePermits());
                    
                    // 模拟数据库操作
                    Thread.sleep(2000 + (int)(Math.random() * 1000));
                    
                    System.out.println("客户端" + clientId + " 释放数据库连接");
                    
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                } finally {
                    connectionPool.release(); // 释放连接
                }
            }, "Client-" + i).start();
        }
        
        try {
            Thread.sleep(15000); // 等待演示完成
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
    
    private static void demonstrateFairness() {
        System.out.println("\n--- 公平性演示 ---");
        
        // 公平信号量
        Semaphore fairSemaphore = new Semaphore(1, true);
        
        for (int i = 0; i < 5; i++) {
            final int threadId = i;
            new Thread(() -> {
                try {
                    for (int j = 0; j < 2; j++) {
                        System.out.println("线程" + threadId + " 第" + (j+1) + "次请求许可");
                        fairSemaphore.acquire();
                        
                        System.out.println("线程" + threadId + " 第" + (j+1) + "次获得许可");
                        Thread.sleep(1000);
                        
                        fairSemaphore.release();
                        System.out.println("线程" + threadId + " 第" + (j+1) + "次释放许可");
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }, "FairThread-" + i).start();
        }
        
        try {
            Thread.sleep(12000); // 等待演示完成
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
    
    private static void demonstrateBulkAcquisition() {
        System.out.println("\n--- 批量获取演示 ---");
        
        Semaphore semaphore = new Semaphore(5);
        
        // 小任务 - 需要1个许可
        for (int i = 0; i < 3; i++) {
            final int taskId = i;
            new Thread(() -> {
                try {
                    System.out.println("小任务" + taskId + " 请求1个许可");
                    semaphore.acquire(1);
                    
                    System.out.println("小任务" + taskId + " 获得许可，执行中...");
                    Thread.sleep(2000);
                    
                    semaphore.release(1);
                    System.out.println("小任务" + taskId + " 完成，释放1个许可");
                    
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }, "SmallTask-" + i).start();
        }
        
        // 大任务 - 需要3个许可
        new Thread(() -> {
            try {
                Thread.sleep(1000); // 延迟启动
                System.out.println("大任务请求3个许可");
                
                boolean acquired = semaphore.tryAcquire(3, 5, TimeUnit.SECONDS);
                if (acquired) {
                    System.out.println("大任务获得3个许可，执行中...");
                    Thread.sleep(3000);
                    
                    semaphore.release(3);
                    System.out.println("大任务完成，释放3个许可");
                } else {
                    System.out.println("大任务获取许可超时");
                }
                
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }, "BigTask").start();
        
        try {
            Thread.sleep(10000); // 等待演示完成
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
```java
public class ThreadCommunicationBasic {
    // 共享变量 - 线程间通信的基础
    private static volatile boolean flag = false;
    private static int sharedData = 0;
    
    public static void main(String[] args) {
        // 生产者线程
        Thread producer = new Thread(() -> {
            for (int i = 0; i < 5; i++) {
                sharedData = i;
                System.out.println("生产者设置数据: " + sharedData);
                flag = true; // 通知消费者数据已准备好
                
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }, "Producer");
        
        // 消费者线程
        Thread consumer = new Thread(() -> {
            while (true) {
                if (flag) {
                    System.out.println("消费者读取数据: " + sharedData);
                    flag = false; // 重置标志
                }
                
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }, "Consumer");
        
        producer.start();
        consumer.start();
        
        try {
            producer.join();
            consumer.interrupt();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
```

### 1.2 线程通信的挑战

线程通信面临的主要挑战包括：

1. **数据竞争**：多个线程同时访问共享数据
2. **可见性问题**：一个线程的修改对其他线程不可见
3. **原子性问题**：操作不是原子的，可能被中断
4. **有序性问题**：指令重排序导致的执行顺序问题

```java
import java.util.concurrent.atomic.AtomicInteger;

public class ThreadCommunicationChallenges {
    // 演示数据竞争问题
    private static int counter = 0;
    private static AtomicInteger atomicCounter = new AtomicInteger(0);
    
    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== 数据竞争演示 ===");
        
        // 创建多个线程同时修改共享变量
        Thread[] threads = new Thread[10];
        
        for (int i = 0; i < 10; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < 1000; j++) {
                    counter++; // 非原子操作，存在数据竞争
                    atomicCounter.incrementAndGet(); // 原子操作，线程安全
                }
            });
        }
        
        // 启动所有线程
        for (Thread thread : threads) {
            thread.start();
        }
        
        // 等待所有线程完成
        for (Thread thread : threads) {
            thread.join();
        }
        
        System.out.println("普通计数器结果: " + counter); // 可能小于10000
        System.out.println("原子计数器结果: " + atomicCounter.get()); // 总是10000
        
        // 演示可见性问题
        demonstrateVisibilityProblem();
    }
    
    private static volatile boolean stopFlag = false;
    
    private static void demonstrateVisibilityProblem() {
        System.out.println("\n=== 可见性问题演示 ===");
        
        Thread worker = new Thread(() -> {
            int count = 0;
            while (!stopFlag) {
                count++;
            }
            System.out.println("工作线程停止，计数: " + count);
        });
        
        worker.start();
        
        try {
            Thread.sleep(1000);
            stopFlag = true; // 由于volatile关键字，这个修改对工作线程可见
            System.out.println("主线程设置停止标志");
            
            worker.join();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
```

## 2. wait/notify机制

### 2.1 wait/notify基本原理

`wait/notify`是Java中最基础的线程通信机制，基于对象监视器（Monitor）实现。

```java
public class WaitNotifyDemo {
    private final Object lock = new Object();
    private boolean dataReady = false;
    private String data;
    
    public static void main(String[] args) {
        WaitNotifyDemo demo = new WaitNotifyDemo();
        
        // 消费者线程
        Thread consumer = new Thread(() -> {
            demo.consume();
        }, "Consumer");
        
        // 生产者线程
        Thread producer = new Thread(() -> {
            demo.produce();
        }, "Producer");
        
        consumer.start();
        producer.start();
        
        try {
            consumer.join();
            producer.join();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
    
    public void consume() {
        synchronized (lock) {
            while (!dataReady) {
                try {
                    System.out.println("消费者等待数据...");
                    lock.wait(); // 释放锁并等待
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return;
                }
            }
            
            System.out.println("消费者获得数据: " + data);
            dataReady = false;
            lock.notify(); // 通知生产者
        }
    }
    
    public void produce() {
        synchronized (lock) {
            try {
                Thread.sleep(2000); // 模拟数据准备时间
                data = "重要数据 - " + System.currentTimeMillis();
                dataReady = true;
                
                System.out.println("生产者准备好数据: " + data);
                lock.notify(); // 通知消费者
                
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }
}
```

### 2.2 生产者-消费者模式实现

```java
import java.util.LinkedList;
import java.util.Queue;

public class ProducerConsumerPattern {
    private final Queue<Integer> buffer = new LinkedList<>();
    private final int capacity = 5;
    private final Object lock = new Object();
    
    public static void main(String[] args) {
        ProducerConsumerPattern pattern = new ProducerConsumerPattern();
        
        // 创建多个生产者
        for (int i = 0; i < 2; i++) {
            final int producerId = i;
            new Thread(() -> {
                try {
                    for (int j = 0; j < 10; j++) {
                        pattern.produce(producerId * 10 + j);
                        Thread.sleep(100);
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }, "Producer-" + i).start();
        }
        
        // 创建多个消费者
        for (int i = 0; i < 3; i++) {
            new Thread(() -> {
                try {
                    while (true) {
                        Integer item = pattern.consume();
                        if (item != null) {
                            Thread.sleep(200);
                        }
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }, "Consumer-" + i).start();
        }
    }
    
    public void produce(int item) throws InterruptedException {
        synchronized (lock) {
            // 缓冲区满时等待
            while (buffer.size() == capacity) {
                System.out.println(Thread.currentThread().getName() + " 等待缓冲区空闲...");
                lock.wait();
            }
            
            buffer.offer(item);
            System.out.println(Thread.currentThread().getName() + " 生产: " + item + 
                ", 缓冲区大小: " + buffer.size());
            
            lock.notifyAll(); // 通知所有等待的消费者
        }
    }
    
    public Integer consume() throws InterruptedException {
        synchronized (lock) {
            // 缓冲区空时等待
            while (buffer.isEmpty()) {
                System.out.println(Thread.currentThread().getName() + " 等待数据...");
                lock.wait();
            }
            
            Integer item = buffer.poll();
            System.out.println(Thread.currentThread().getName() + " 消费: " + item + 
                ", 缓冲区大小: " + buffer.size());
            
            lock.notifyAll(); // 通知所有等待的生产者
            return item;
        }
    }
}
```

### 2.3 wait/notify的陷阱与最佳实践

```java
public class WaitNotifyBestPractices {
    private final Object lock = new Object();
    private boolean condition = false;
    
    public static void main(String[] args) {
        WaitNotifyBestPractices demo = new WaitNotifyBestPractices();
        
        // 演示虚假唤醒问题
        demo.demonstrateSpuriousWakeup();
        
        // 演示notify vs notifyAll
        demo.demonstrateNotifyVsNotifyAll();
    }
    
    // 正确的wait使用方式 - 使用while循环
    public void correctWaitUsage() {
        synchronized (lock) {
            while (!condition) { // 使用while而不是if
                try {
                    lock.wait();
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return;
                }
            }
            // 处理业务逻辑
            System.out.println("条件满足，执行业务逻辑");
        }
    }
    
    // 错误的wait使用方式 - 使用if
    public void incorrectWaitUsage() {
        synchronized (lock) {
            if (!condition) { // 错误：使用if可能导致虚假唤醒问题
                try {
                    lock.wait();
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return;
                }
            }
            // 可能在条件不满足时执行
            System.out.println("可能在条件不满足时执行");
        }
    }
    
    private void demonstrateSpuriousWakeup() {
        System.out.println("=== 虚假唤醒演示 ===");
        
        Thread waiter1 = new Thread(() -> {
            synchronized (lock) {
                while (!condition) {
                    try {
                        System.out.println("线程1开始等待");
                        lock.wait();
                        System.out.println("线程1被唤醒，检查条件: " + condition);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        return;
                    }
                }
                System.out.println("线程1执行业务逻辑");
            }
        }, "Waiter-1");
        
        Thread waiter2 = new Thread(() -> {
            synchronized (lock) {
                while (!condition) {
                    try {
                        System.out.println("线程2开始等待");
                        lock.wait();
                        System.out.println("线程2被唤醒，检查条件: " + condition);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        return;
                    }
                }
                System.out.println("线程2执行业务逻辑");
            }
        }, "Waiter-2");
        
        Thread notifier = new Thread(() -> {
            try {
                Thread.sleep(2000);
                synchronized (lock) {
                    condition = true;
                    System.out.println("设置条件为true并通知所有等待线程");
                    lock.notifyAll();
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }, "Notifier");
        
        waiter1.start();
        waiter2.start();
        notifier.start();
        
        try {
            waiter1.join();
            waiter2.join();
            notifier.join();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
    
    private void demonstrateNotifyVsNotifyAll() {
        System.out.println("\n=== notify vs notifyAll 演示 ===");
        
        final Object notifyLock = new Object();
        final boolean[] ready = {false};
        
        // 创建多个等待线程
        for (int i = 0; i < 3; i++) {
            final int threadId = i;
            new Thread(() -> {
                synchronized (notifyLock) {
                    while (!ready[0]) {
                        try {
                            System.out.println("线程" + threadId + "开始等待");
                            notifyLock.wait();
                            System.out.println("线程" + threadId + "被唤醒");
                        } catch (InterruptedException e) {
                            Thread.currentThread().interrupt();
                            return;
                        }
                    }
                    System.out.println("线程" + threadId + "执行完成");
                }
            }, "Worker-" + i).start();
        }
        
        // 通知线程
        new Thread(() -> {
            try {
                Thread.sleep(2000);
                synchronized (notifyLock) {
                    ready[0] = true;
                    System.out.println("使用notifyAll()唤醒所有等待线程");
                    notifyLock.notifyAll(); // 使用notifyAll确保所有线程都被唤醒
                    // 如果使用notify()，可能只有一个线程被唤醒
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }, "Notifier").start();
    }
}
```

## 3. 管道通信

### 3.1 PipedInputStream/PipedOutputStream

管道通信提供了一种基于流的线程间通信方式。

```java
import java.io.*;

public class PipeStreamCommunication {
    
    public static void main(String[] args) {
        try {
            // 创建管道流
            PipedOutputStream outputStream = new PipedOutputStream();
            PipedInputStream inputStream = new PipedInputStream(outputStream);
            
            // 写入线程
            Thread writer = new Thread(() -> {
                try (PrintWriter writer1 = new PrintWriter(outputStream, true)) {
                    for (int i = 0; i < 5; i++) {
                        String message = "消息 " + i + " - " + System.currentTimeMillis();
                        writer1.println(message);
                        System.out.println("发送: " + message);
                        Thread.sleep(1000);
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }, "Writer");
            
            // 读取线程
            Thread reader = new Thread(() -> {
                try (BufferedReader reader1 = new BufferedReader(new InputStreamReader(inputStream))) {
                    String line;
                    while ((line = reader1.readLine()) != null) {
                        System.out.println("接收: " + line);
                    }
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }, "Reader");
            
            writer.start();
            reader.start();
            
            writer.join();
            reader.join();
            
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

### 3.2 PipedReader/PipedWriter

```java
import java.io.*;

public class PipeCharacterCommunication {
    
    public static void main(String[] args) {
        try {
            // 创建字符管道
            PipedWriter pipedWriter = new PipedWriter();
            PipedReader pipedReader = new PipedReader(pipedWriter);
            
            // 生产者线程
            Thread producer = new Thread(() -> {
                try {
                    for (int i = 0; i < 10; i++) {
                        String data = "数据包-" + i + "\n";
                        pipedWriter.write(data);
                        pipedWriter.flush();
                        System.out.println("生产者发送: " + data.trim());
                        Thread.sleep(500);
                    }
                } catch (IOException | InterruptedException e) {
                    e.printStackTrace();
                } finally {
                    try {
                        pipedWriter.close();
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            }, "Producer");
            
            // 消费者线程
            Thread consumer = new Thread(() -> {
                try (BufferedReader reader = new BufferedReader(pipedReader)) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        System.out.println("消费者接收: " + line);
                        // 模拟处理时间
                        Thread.sleep(200);
                    }
                } catch (IOException | InterruptedException e) {
                    e.printStackTrace();
                }
            }, "Consumer");
            
            producer.start();
            consumer.start();
            
            producer.join();
            consumer.join();
            
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

## 4. 共享内存通信

### 4.1 volatile关键字

`volatile`关键字确保变量的可见性和有序性。

```java
public class VolatileCommunication {
    // volatile确保多线程间的可见性
    private static volatile boolean running = true;
    private static volatile int counter = 0;
    
    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== volatile可见性演示 ===");
        
        // 工作线程
        Thread worker = new Thread(() -> {
            int localCounter = 0;
            while (running) {
                localCounter++;
                if (localCounter % 100000000 == 0) {
                    System.out.println("工作线程运行中... 计数: " + localCounter);
                }
            }
            counter = localCounter;
            System.out.println("工作线程停止，最终计数: " + localCounter);
        }, "Worker");
        
        worker.start();
        
        // 主线程等待3秒后停止工作线程
        Thread.sleep(3000);
        running = false; // volatile变量的修改立即对工作线程可见
        System.out.println("主线程设置停止标志");
        
        worker.join();
        System.out.println("最终计数器值: " + counter);
        
        // 演示volatile的有序性
        demonstrateVolatileOrdering();
    }
    
    private static volatile boolean flag = false;
    private static int data = 0;
    
    private static void demonstrateVolatileOrdering() throws InterruptedException {
        System.out.println("\n=== volatile有序性演示 ===");
        
        Thread writer = new Thread(() -> {
            data = 42; // 普通变量写入
            flag = true; // volatile变量写入，建立happens-before关系
            System.out.println("写入线程完成");
        }, "Writer");
        
        Thread reader = new Thread(() -> {
            while (!flag) {
                // 等待flag变为true
                Thread.yield();
            }
            // 由于volatile的happens-before语义，这里能看到data=42
            System.out.println("读取线程看到data: " + data);
        }, "Reader");
        
        reader.start();
        Thread.sleep(100); // 确保reader先启动
        writer.start();
        
        writer.join();
        reader.join();
    }
}
```

### 4.2 原子类通信

```java
import java.util.concurrent.atomic.*;

public class AtomicCommunication {
    private static final AtomicInteger atomicCounter = new AtomicInteger(0);
    private static final AtomicReference<String> atomicMessage = new AtomicReference<>("");
    private static final AtomicBoolean atomicFlag = new AtomicBoolean(false);
    
    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== 原子类通信演示 ===");
        
        // 创建多个生产者线程
        Thread[] producers = new Thread[3];
        for (int i = 0; i < 3; i++) {
            final int producerId = i;
            producers[i] = new Thread(() -> {
                for (int j = 0; j < 5; j++) {
                    // 原子性地增加计数器
                    int count = atomicCounter.incrementAndGet();
                    
                    // 原子性地更新消息
                    String message = "Producer-" + producerId + "-Message-" + j;
                    atomicMessage.set(message);
                    
                    System.out.println("生产者" + producerId + " 发送消息: " + message + 
                        ", 总计数: " + count);
                    
                    try {
                        Thread.sleep(100);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            }, "Producer-" + i);
        }
        
        // 消费者线程
        Thread consumer = new Thread(() -> {
            int lastCount = 0;
            while (!atomicFlag.get() || atomicCounter.get() > lastCount) {
                int currentCount = atomicCounter.get();
                if (currentCount > lastCount) {
                    String message = atomicMessage.get();
                    System.out.println("消费者接收: " + message + ", 计数: " + currentCount);
                    lastCount = currentCount;
                }
                
                try {
                    Thread.sleep(50);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
            System.out.println("消费者完成，最终计数: " + atomicCounter.get());
        }, "Consumer");
        
        // 启动所有线程
        for (Thread producer : producers) {
            producer.start();
        }
        consumer.start();
        
        // 等待生产者完成
        for (Thread producer : producers) {
            producer.join();
        }
        
        // 设置完成标志
        atomicFlag.set(true);
        consumer.join();
        
        // 演示CAS操作
        demonstrateCASOperation();
    }
    
    private static void demonstrateCASOperation() {
        System.out.println("\n=== CAS操作演示 ===");
        
        AtomicInteger casCounter = new AtomicInteger(0);
        
        Thread[] threads = new Thread[5];
        for (int i = 0; i < 5; i++) {
            final int threadId = i;
            threads[i] = new Thread(() -> {
                for (int j = 0; j < 3; j++) {
                    int expected, newValue;
                    do {
                        expected = casCounter.get();
                        newValue = expected + 1;
                        System.out.println("线程" + threadId + " 尝试CAS: " + expected + " -> " + newValue);
                    } while (!casCounter.compareAndSet(expected, newValue));
                    
                    System.out.println("线程" + threadId + " CAS成功: " + newValue);
                    
                    try {
                        Thread.sleep(100);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            }, "CAS-Thread-" + i);
        }
        
        for (Thread thread : threads) {
            thread.start();
        }
        
        try {
            for (Thread thread : threads) {
                thread.join();
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        System.out.println("CAS最终结果: " + casCounter.get());
    }
}
```

## 8. 性能比较与分析

### 8.1 不同通信机制的性能测试

```java
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.ReentrantLock;

public class CommunicationPerformanceTest {
    
    private static final int THREAD_COUNT = 4;
    private static final int OPERATIONS_PER_THREAD = 100000;
    
    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== 线程通信性能测试 ===");
        
        // 测试wait/notify
        testWaitNotify();
        
        // 测试Condition
        testCondition();
        
        // 测试CountDownLatch
        testCountDownLatch();
        
        // 测试Semaphore
        testSemaphore();
        
        // 测试AtomicInteger
        testAtomicInteger();
        
        // 测试volatile
        testVolatile();
    }
    
    private static void testWaitNotify() throws InterruptedException {
        System.out.println("\n--- wait/notify性能测试 ---");
        
        final Object lock = new Object();
        final AtomicInteger counter = new AtomicInteger(0);
        
        long startTime = System.currentTimeMillis();
        
        Thread[] threads = new Thread[THREAD_COUNT];
        for (int i = 0; i < THREAD_COUNT; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < OPERATIONS_PER_THREAD; j++) {
                    synchronized (lock) {
                        counter.incrementAndGet();
                        lock.notify();
                        if (counter.get() < THREAD_COUNT * OPERATIONS_PER_THREAD) {
                            try {
                                lock.wait();
                            } catch (InterruptedException e) {
                                Thread.currentThread().interrupt();
                                break;
                            }
                        }
                    }
                }
            });
        }
        
        for (Thread thread : threads) {
            thread.start();
        }
        
        for (Thread thread : threads) {
            thread.join();
        }
        
        long endTime = System.currentTimeMillis();
        System.out.println("wait/notify耗时: " + (endTime - startTime) + "ms, 计数器值: " + counter.get());
    }
    
    private static void testCondition() throws InterruptedException {
        System.out.println("\n--- Condition性能测试 ---");
        
        final ReentrantLock lock = new ReentrantLock();
        final Condition condition = lock.newCondition();
        final AtomicInteger counter = new AtomicInteger(0);
        
        long startTime = System.currentTimeMillis();
        
        Thread[] threads = new Thread[THREAD_COUNT];
        for (int i = 0; i < THREAD_COUNT; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < OPERATIONS_PER_THREAD; j++) {
                    lock.lock();
                    try {
                        counter.incrementAndGet();
                        condition.signal();
                        if (counter.get() < THREAD_COUNT * OPERATIONS_PER_THREAD) {
                            condition.await();
                        }
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        break;
                    } finally {
                        lock.unlock();
                    }
                }
            });
        }
        
        for (Thread thread : threads) {
            thread.start();
        }
        
        for (Thread thread : threads) {
            thread.join();
        }
        
        long endTime = System.currentTimeMillis();
        System.out.println("Condition耗时: " + (endTime - startTime) + "ms, 计数器值: " + counter.get());
    }
    
    private static void testCountDownLatch() throws InterruptedException {
        System.out.println("\n--- CountDownLatch性能测试 ---");
        
        long startTime = System.currentTimeMillis();
        
        for (int i = 0; i < OPERATIONS_PER_THREAD; i++) {
            CountDownLatch latch = new CountDownLatch(THREAD_COUNT);
            
            for (int j = 0; j < THREAD_COUNT; j++) {
                new Thread(() -> {
                    // 模拟工作
                    latch.countDown();
                }).start();
            }
            
            latch.await();
        }
        
        long endTime = System.currentTimeMillis();
        System.out.println("CountDownLatch耗时: " + (endTime - startTime) + "ms");
    }
    
    private static void testSemaphore() throws InterruptedException {
        System.out.println("\n--- Semaphore性能测试 ---");
        
        final Semaphore semaphore = new Semaphore(1);
        final AtomicInteger counter = new AtomicInteger(0);
        
        long startTime = System.currentTimeMillis();
        
        Thread[] threads = new Thread[THREAD_COUNT];
        for (int i = 0; i < THREAD_COUNT; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < OPERATIONS_PER_THREAD; j++) {
                    try {
                        semaphore.acquire();
                        counter.incrementAndGet();
                        semaphore.release();
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            });
        }
        
        for (Thread thread : threads) {
            thread.start();
        }
        
        for (Thread thread : threads) {
            thread.join();
        }
        
        long endTime = System.currentTimeMillis();
        System.out.println("Semaphore耗时: " + (endTime - startTime) + "ms, 计数器值: " + counter.get());
    }
    
    private static void testAtomicInteger() throws InterruptedException {
        System.out.println("\n--- AtomicInteger性能测试 ---");
        
        final AtomicInteger counter = new AtomicInteger(0);
        
        long startTime = System.currentTimeMillis();
        
        Thread[] threads = new Thread[THREAD_COUNT];
        for (int i = 0; i < THREAD_COUNT; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < OPERATIONS_PER_THREAD; j++) {
                    counter.incrementAndGet();
                }
            });
        }
        
        for (Thread thread : threads) {
            thread.start();
        }
        
        for (Thread thread : threads) {
            thread.join();
        }
        
        long endTime = System.currentTimeMillis();
        System.out.println("AtomicInteger耗时: " + (endTime - startTime) + "ms, 计数器值: " + counter.get());
    }
    
    private static void testVolatile() throws InterruptedException {
        System.out.println("\n--- volatile性能测试 ---");
        
        final VolatileCounter counter = new VolatileCounter();
        
        long startTime = System.currentTimeMillis();
        
        Thread[] threads = new Thread[THREAD_COUNT];
        for (int i = 0; i < THREAD_COUNT; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < OPERATIONS_PER_THREAD; j++) {
                    synchronized (counter) {
                        counter.increment();
                    }
                }
            });
        }
        
        for (Thread thread : threads) {
            thread.start();
        }
        
        for (Thread thread : threads) {
            thread.join();
        }
        
        long endTime = System.currentTimeMillis();
        System.out.println("volatile耗时: " + (endTime - startTime) + "ms, 计数器值: " + counter.getValue());
    }
    
    static class VolatileCounter {
        private volatile int value = 0;
        
        public void increment() {
            value++;
        }
        
        public int getValue() {
            return value;
        }
    }
}
```

### 8.2 内存使用分析

```java
import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.MemoryUsage;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.CyclicBarrier;
import java.util.concurrent.Semaphore;

public class MemoryUsageAnalysis {
    
    private static final MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
    
    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== 内存使用分析 ===");
        
        // 分析ThreadLocal内存使用
        analyzeThreadLocalMemory();
        
        // 分析同步工具内存使用
        analyzeSynchronizationToolsMemory();
        
        // 分析大量线程的内存影响
        analyzeMassiveThreadsMemory();
    }
    
    private static void analyzeThreadLocalMemory() throws InterruptedException {
        System.out.println("\n--- ThreadLocal内存分析 ---");
        
        printMemoryUsage("初始状态");
        
        // 创建大量ThreadLocal
        ThreadLocal<byte[]>[] threadLocals = new ThreadLocal[1000];
        for (int i = 0; i < threadLocals.length; i++) {
            threadLocals[i] = new ThreadLocal<>();
        }
        
        printMemoryUsage("创建1000个ThreadLocal后");
        
        // 在多个线程中使用ThreadLocal
        Thread[] threads = new Thread[10];
        for (int i = 0; i < threads.length; i++) {
            final int threadId = i;
            threads[i] = new Thread(() -> {
                for (ThreadLocal<byte[]> tl : threadLocals) {
                    tl.set(new byte[1024]); // 1KB数据
                }
                
                try {
                    Thread.sleep(2000); // 保持线程活跃
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
                
                // 清理ThreadLocal
                for (ThreadLocal<byte[]> tl : threadLocals) {
                    tl.remove();
                }
            }, "MemoryTestThread-" + threadId);
        }
        
        for (Thread thread : threads) {
            thread.start();
        }
        
        Thread.sleep(1000);
        printMemoryUsage("线程使用ThreadLocal后");
        
        for (Thread thread : threads) {
            thread.join();
        }
        
        System.gc();
        Thread.sleep(1000);
        printMemoryUsage("线程结束并GC后");
    }
    
    private static void analyzeSynchronizationToolsMemory() {
        System.out.println("\n--- 同步工具内存分析 ---");
        
        printMemoryUsage("创建同步工具前");
        
        // 创建大量同步工具
        CountDownLatch[] latches = new CountDownLatch[1000];
        CyclicBarrier[] barriers = new CyclicBarrier[1000];
        Semaphore[] semaphores = new Semaphore[1000];
        
        for (int i = 0; i < 1000; i++) {
            latches[i] = new CountDownLatch(1);
            barriers[i] = new CyclicBarrier(2);
            semaphores[i] = new Semaphore(1);
        }
        
        printMemoryUsage("创建3000个同步工具后");
        
        // 清理引用
        for (int i = 0; i < 1000; i++) {
            latches[i] = null;
            barriers[i] = null;
            semaphores[i] = null;
        }
        
        System.gc();
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        printMemoryUsage("清理引用并GC后");
    }
    
    private static void analyzeMassiveThreadsMemory() throws InterruptedException {
        System.out.println("\n--- 大量线程内存分析 ---");
        
        printMemoryUsage("创建线程前");
        
        // 创建大量线程
        Thread[] threads = new Thread[100];
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch endLatch = new CountDownLatch(threads.length);
        
        for (int i = 0; i < threads.length; i++) {
            final int threadId = i;
            threads[i] = new Thread(() -> {
                try {
                    startLatch.await();
                    
                    // 模拟工作
                    Thread.sleep(2000);
                    
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                } finally {
                    endLatch.countDown();
                }
            }, "MassiveThread-" + threadId);
        }
        
        for (Thread thread : threads) {
            thread.start();
        }
        
        printMemoryUsage("创建100个线程后");
        
        startLatch.countDown();
        endLatch.await();
        
        printMemoryUsage("线程执行完成后");
        
        // 等待线程结束
        for (Thread thread : threads) {
            thread.join();
        }
        
        System.gc();
        Thread.sleep(1000);
        printMemoryUsage("线程结束并GC后");
    }
    
    private static void printMemoryUsage(String phase) {
        MemoryUsage heapUsage = memoryBean.getHeapMemoryUsage();
        MemoryUsage nonHeapUsage = memoryBean.getNonHeapMemoryUsage();
        
        System.out.printf("%s:\n", phase);
        System.out.printf("  堆内存: 已用 %d MB / 最大 %d MB\n", 
            heapUsage.getUsed() / 1024 / 1024, 
            heapUsage.getMax() / 1024 / 1024);
        System.out.printf("  非堆内存: 已用 %d MB / 最大 %d MB\n", 
            nonHeapUsage.getUsed() / 1024 / 1024, 
            nonHeapUsage.getMax() / 1024 / 1024);
        System.out.println();
    }
}
```

## 9. 最佳实践与选择指南

### 9.1 通信机制选择决策树

```java
public class CommunicationMechanismSelector {
    
    public enum CommunicationScenario {
        PRODUCER_CONSUMER,
        MASTER_WORKER,
        PIPELINE,
        BARRIER_SYNCHRONIZATION,
        RESOURCE_POOL,
        EVENT_NOTIFICATION,
        DATA_SHARING
    }
    
    public static String selectMechanism(CommunicationScenario scenario, 
                                        int threadCount, 
                                        boolean needTimeout,
                                        boolean needFairness,
                                        boolean highPerformance) {
        
        switch (scenario) {
            case PRODUCER_CONSUMER:
                if (highPerformance) {
                    return "推荐: ConcurrentLinkedQueue + AtomicInteger\n" +
                           "原因: 无锁实现，高并发性能好";
                } else {
                    return "推荐: BlockingQueue (ArrayBlockingQueue/LinkedBlockingQueue)\n" +
                           "原因: 内置阻塞机制，使用简单";
                }
                
            case MASTER_WORKER:
                if (needTimeout) {
                    return "推荐: CountDownLatch + CompletableFuture\n" +
                           "原因: 支持超时等待和异步处理";
                } else {
                    return "推荐: CountDownLatch\n" +
                           "原因: 简单的一次性同步";
                }
                
            case PIPELINE:
                return "推荐: CyclicBarrier\n" +
                       "原因: 支持多阶段同步，可重用";
                
            case BARRIER_SYNCHRONIZATION:
                if (threadCount > 10) {
                    return "推荐: CountDownLatch\n" +
                           "原因: 大量线程时性能更好";
                } else {
                    return "推荐: CyclicBarrier\n" +
                           "原因: 可重用，支持屏障动作";
                }
                
            case RESOURCE_POOL:
                if (needFairness) {
                    return "推荐: Semaphore(fair=true)\n" +
                           "原因: 保证公平性";
                } else {
                    return "推荐: Semaphore(fair=false)\n" +
                           "原因: 性能更好";
                }
                
            case EVENT_NOTIFICATION:
                if (highPerformance) {
                    return "推荐: volatile + CAS\n" +
                           "原因: 无锁，性能最佳";
                } else {
                    return "推荐: Condition\n" +
                           "原因: 精确控制，支持多条件";
                }
                
            case DATA_SHARING:
                if (threadCount <= 4) {
                    return "推荐: ThreadLocal\n" +
                           "原因: 避免共享，无同步开销";
                } else {
                    return "推荐: ConcurrentHashMap + AtomicReference\n" +
                           "原因: 高并发安全共享";
                }
                
            default:
                return "推荐: 根据具体需求选择合适的机制";
        }
    }
    
    public static void main(String[] args) {
        System.out.println("=== 线程通信机制选择指南 ===");
        
        // 示例场景分析
        System.out.println("\n场景1: 高性能生产者-消费者");
        System.out.println(selectMechanism(CommunicationScenario.PRODUCER_CONSUMER, 
            4, false, false, true));
        
        System.out.println("\n场景2: 需要超时的主从模式");
        System.out.println(selectMechanism(CommunicationScenario.MASTER_WORKER, 
            8, true, false, false));
        
        System.out.println("\n场景3: 公平的资源池");
        System.out.println(selectMechanism(CommunicationScenario.RESOURCE_POOL, 
            10, false, true, false));
        
        System.out.println("\n场景4: 大量线程的屏障同步");
        System.out.println(selectMechanism(CommunicationScenario.BARRIER_SYNCHRONIZATION, 
            50, false, false, false));
    }
}
```

### 9.2 性能优化技巧

```java
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.LongAdder;

public class PerformanceOptimizationTips {
    
    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== 性能优化技巧演示 ===");
        
        // 技巧1: 使用LongAdder替代AtomicLong
        demonstrateLongAdderOptimization();
        
        // 技巧2: 减少锁竞争
        demonstrateLockContentionReduction();
        
        // 技巧3: 批量操作
        demonstrateBatchOperations();
        
        // 技巧4: 合理使用ThreadLocal
        demonstrateThreadLocalOptimization();
    }
    
    private static void demonstrateLongAdderOptimization() throws InterruptedException {
        System.out.println("\n--- 技巧1: LongAdder vs AtomicLong ---");
        
        int threadCount = 8;
        int operationsPerThread = 100000;
        
        // 测试AtomicLong
        AtomicInteger atomicCounter = new AtomicInteger(0);
        long startTime = System.currentTimeMillis();
        
        Thread[] atomicThreads = new Thread[threadCount];
        for (int i = 0; i < threadCount; i++) {
            atomicThreads[i] = new Thread(() -> {
                for (int j = 0; j < operationsPerThread; j++) {
                    atomicCounter.incrementAndGet();
                }
            });
        }
        
        for (Thread thread : atomicThreads) {
            thread.start();
        }
        for (Thread thread : atomicThreads) {
            thread.join();
        }
        
        long atomicTime = System.currentTimeMillis() - startTime;
        System.out.println("AtomicInteger耗时: " + atomicTime + "ms, 结果: " + atomicCounter.get());
        
        // 测试LongAdder
        LongAdder longAdder = new LongAdder();
        startTime = System.currentTimeMillis();
        
        Thread[] adderThreads = new Thread[threadCount];
        for (int i = 0; i < threadCount; i++) {
            adderThreads[i] = new Thread(() -> {
                for (int j = 0; j < operationsPerThread; j++) {
                    longAdder.increment();
                }
            });
        }
        
        for (Thread thread : adderThreads) {
            thread.start();
        }
        for (Thread thread : adderThreads) {
            thread.join();
        }
        
        long adderTime = System.currentTimeMillis() - startTime;
        System.out.println("LongAdder耗时: " + adderTime + "ms, 结果: " + longAdder.sum());
        System.out.println("性能提升: " + ((double)(atomicTime - adderTime) / atomicTime * 100) + "%");
    }
    
    private static void demonstrateLockContentionReduction() throws InterruptedException {
        System.out.println("\n--- 技巧2: 减少锁竞争 ---");
        
        // 粗粒度锁 vs 细粒度锁
        System.out.println("粗粒度锁 vs 细粒度锁:");
        
        // 粗粒度锁示例
        CoarseGrainedCounter coarseCounter = new CoarseGrainedCounter();
        testCounter("粗粒度锁", coarseCounter);
        
        // 细粒度锁示例
        FineGrainedCounter fineCounter = new FineGrainedCounter();
        testCounter("细粒度锁", fineCounter);
    }
    
    private static void testCounter(String name, Counter counter) throws InterruptedException {
        int threadCount = 4;
        int operationsPerThread = 50000;
        
        long startTime = System.currentTimeMillis();
        
        Thread[] threads = new Thread[threadCount];
        for (int i = 0; i < threadCount; i++) {
            final int threadId = i;
            threads[i] = new Thread(() -> {
                for (int j = 0; j < operationsPerThread; j++) {
                    if (threadId % 2 == 0) {
                        counter.incrementA();
                    } else {
                        counter.incrementB();
                    }
                }
            });
        }
        
        for (Thread thread : threads) {
            thread.start();
        }
        for (Thread thread : threads) {
            thread.join();
        }
        
        long endTime = System.currentTimeMillis();
        System.out.println(name + "耗时: " + (endTime - startTime) + "ms, A=" + 
            counter.getA() + ", B=" + counter.getB());
    }
    
    interface Counter {
        void incrementA();
        void incrementB();
        int getA();
        int getB();
    }
    
    static class CoarseGrainedCounter implements Counter {
        private int a = 0;
        private int b = 0;
        
        @Override
        public synchronized void incrementA() {
            a++;
        }
        
        @Override
        public synchronized void incrementB() {
            b++;
        }
        
        @Override
        public synchronized int getA() {
            return a;
        }
        
        @Override
        public synchronized int getB() {
            return b;
        }
    }
    
    static class FineGrainedCounter implements Counter {
        private final Object lockA = new Object();
        private final Object lockB = new Object();
        private int a = 0;
        private int b = 0;
        
        @Override
        public void incrementA() {
            synchronized (lockA) {
                a++;
            }
        }
        
        @Override
        public void incrementB() {
            synchronized (lockB) {
                b++;
            }
        }
        
        @Override
        public int getA() {
            synchronized (lockA) {
                return a;
            }
        }
        
        @Override
        public int getB() {
            synchronized (lockB) {
                return b;
            }
        }
    }
    
    private static void demonstrateBatchOperations() throws InterruptedException {
        System.out.println("\n--- 技巧3: 批量操作 ---");
        
        Semaphore semaphore = new Semaphore(10);
        
        // 单个获取 vs 批量获取
        long startTime = System.currentTimeMillis();
        
        // 单个获取测试
        Thread singleThread = new Thread(() -> {
            try {
                for (int i = 0; i < 1000; i++) {
                    semaphore.acquire();
                    // 模拟工作
                    Thread.sleep(1);
                    semaphore.release();
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        
        singleThread.start();
        singleThread.join();
        
        long singleTime = System.currentTimeMillis() - startTime;
        System.out.println("单个获取耗时: " + singleTime + "ms");
        
        // 批量获取测试
        startTime = System.currentTimeMillis();
        
        Thread batchThread = new Thread(() -> {
            try {
                for (int i = 0; i < 100; i++) {
                    semaphore.acquire(10); // 批量获取
                    // 模拟批量工作
                    Thread.sleep(10);
                    semaphore.release(10); // 批量释放
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        
        batchThread.start();
        batchThread.join();
        
        long batchTime = System.currentTimeMillis() - startTime;
        System.out.println("批量获取耗时: " + batchTime + "ms");
        System.out.println("性能提升: " + ((double)(singleTime - batchTime) / singleTime * 100) + "%");
    }
    
    private static void demonstrateThreadLocalOptimization() throws InterruptedException {
        System.out.println("\n--- 技巧4: ThreadLocal优化 ---");
        
        // 使用ThreadLocal避免同步
        ThreadLocal<StringBuilder> threadLocalBuilder = ThreadLocal.withInitial(StringBuilder::new);
        
        int threadCount = 4;
        int operationsPerThread = 100000;
        
        long startTime = System.currentTimeMillis();
        
        Thread[] threads = new Thread[threadCount];
        for (int i = 0; i < threadCount; i++) {
            final int threadId = i;
            threads[i] = new Thread(() -> {
                StringBuilder sb = threadLocalBuilder.get();
                for (int j = 0; j < operationsPerThread; j++) {
                    sb.append("Thread-").append(threadId).append("-").append(j).append(";");
                    if (j % 1000 == 0) {
                        sb.setLength(0); // 清空，避免内存过大
                    }
                }
                threadLocalBuilder.remove(); // 清理
            });
        }
        
        for (Thread thread : threads) {
            thread.start();
        }
        for (Thread thread : threads) {
            thread.join();
        }
        
        long endTime = System.currentTimeMillis();
        System.out.println("ThreadLocal StringBuilder耗时: " + (endTime - startTime) + "ms");
        
        // 对比：使用同步的StringBuilder
        StringBuilder syncBuilder = new StringBuilder();
        startTime = System.currentTimeMillis();
        
        Thread[] syncThreads = new Thread[threadCount];
        for (int i = 0; i < threadCount; i++) {
            final int threadId = i;
            syncThreads[i] = new Thread(() -> {
                for (int j = 0; j < operationsPerThread; j++) {
                    synchronized (syncBuilder) {
                        syncBuilder.append("Thread-").append(threadId).append("-").append(j).append(";");
                        if (j % 1000 == 0) {
                            syncBuilder.setLength(0);
                        }
                    }
                }
            });
        }
        
        for (Thread thread : syncThreads) {
            thread.start();
        }
        for (Thread thread : syncThreads) {
            thread.join();
        }
        
        long syncTime = System.currentTimeMillis() - startTime;
        System.out.println("同步StringBuilder耗时: " + syncTime + "ms");
        System.out.println("ThreadLocal性能提升: " + ((double)(syncTime - (endTime - startTime)) / syncTime * 100) + "%");
    }
}
```

## 10. 总结

### 10.1 核心要点

1. **通信机制分类**
   - **等待/通知机制**: `wait/notify`、`Condition`
   - **管道通信**: `PipedInputStream/OutputStream`
   - **共享内存**: `volatile`、原子类、`ThreadLocal`
   - **高级同步工具**: `CountDownLatch`、`CyclicBarrier`、`Semaphore`

2. **性能特点**
   - **无锁机制**: 原子类、`volatile` - 性能最佳
   - **轻量级锁**: `Condition`、`Semaphore` - 平衡性能和功能
   - **重量级锁**: `synchronized`、`wait/notify` - 功能完整但性能较低

3. **适用场景**
   - **生产者-消费者**: `BlockingQueue`、`Condition`
   - **主从模式**: `CountDownLatch`、`CompletableFuture`
   - **屏障同步**: `CyclicBarrier`、`CountDownLatch`
   - **资源池**: `Semaphore`
   - **数据隔离**: `ThreadLocal`

### 10.2 最佳实践

1. **选择原则**
   - 优先考虑无锁方案（原子类、`volatile`）
   - 根据场景选择合适的同步工具
   - 考虑性能、可维护性和复杂度的平衡

2. **性能优化**
   - 减少锁的粒度和持有时间
   - 使用`LongAdder`替代高竞争的`AtomicLong`
   - 合理使用`ThreadLocal`避免共享
   - 批量操作减少同步开销

3. **注意事项**
   - 避免死锁和活锁
   - 正确处理中断
   - 及时清理`ThreadLocal`
   - 合理设置超时时间

### 10.3 发展趋势

1. **响应式编程**: `CompletableFuture`、`RxJava`
2. **协程支持**: `Project Loom`
3. **更高效的并发原语**: `VarHandle`、`Stamped Lock`
4. **内存模型优化**: 更好的缓存一致性

JVM线程通信是并发编程的核心，掌握各种通信机制的原理和适用场景，能够帮助开发者构建高效、可靠的并发应用程序。随着Java平台的不断发展，新的并发工具和优化技术将继续涌现，为开发者提供更强大的并发编程能力。


