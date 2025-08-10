# JVM线程同步机制

## 1. 线程同步概述

### 1.1 为什么需要线程同步

在多线程环境中，当多个线程同时访问共享资源时，可能会出现数据不一致的问题。线程同步机制确保在任意时刻，只有一个线程能够访问共享资源，从而保证数据的一致性和程序的正确性。

```java
// 不安全的计数器示例
public class UnsafeCounter {
    private int count = 0;
    
    public void increment() {
        count++; // 非原子操作，存在线程安全问题
    }
    
    public int getCount() {
        return count;
    }
}

// 测试线程安全问题
public class CounterTest {
    public static void main(String[] args) throws InterruptedException {
        UnsafeCounter counter = new UnsafeCounter();
        
        // 创建1000个线程，每个线程执行1000次increment
        Thread[] threads = new Thread[1000];
        for (int i = 0; i < 1000; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < 1000; j++) {
                    counter.increment();
                }
            });
            threads[i].start();
        }
        
        // 等待所有线程完成
        for (Thread thread : threads) {
            thread.join();
        }
        
        // 期望结果是1000000，但实际结果可能小于这个值
        System.out.println("最终计数: " + counter.getCount());
    }
}
```

### 1.2 Java内存模型（JMM）

Java内存模型定义了线程如何通过内存进行交互，以及数据在何时对其他线程可见。

```java
/**
 * Java内存模型示例
 * 演示可见性问题
 */
public class VisibilityExample {
    private boolean flag = false;
    private int value = 0;
    
    // 写线程
    public void writer() {
        value = 42;        // 1. 写入value
        flag = true;       // 2. 写入flag
    }
    
    // 读线程
    public void reader() {
        if (flag) {        // 3. 读取flag
            // 由于重排序，这里可能读到value = 0
            System.out.println("Value: " + value); // 4. 读取value
        }
    }
}
```

## 2. synchronized关键字

### 2.1 synchronized基本用法

`synchronized`是Java中最基本的同步机制，可以用于方法和代码块。

```java
/**
 * synchronized的三种使用方式
 */
public class SynchronizedExample {
    private int count = 0;
    private final Object lock = new Object();
    
    // 1. 同步实例方法（锁定当前对象）
    public synchronized void incrementMethod() {
        count++;
    }
    
    // 2. 同步静态方法（锁定Class对象）
    public static synchronized void staticMethod() {
        System.out.println("静态同步方法");
    }
    
    // 3. 同步代码块
    public void incrementBlock() {
        synchronized (this) {
            count++;
        }
    }
    
    // 4. 使用自定义锁对象
    public void incrementWithCustomLock() {
        synchronized (lock) {
            count++;
        }
    }
    
    public synchronized int getCount() {
        return count;
    }
}
```

### 2.2 synchronized的实现原理

```java
/**
 * synchronized底层实现分析
 * 使用javap -c命令查看字节码
 */
public class SynchronizedPrinciple {
    private int value = 0;
    
    // 同步方法：使用ACC_SYNCHRONIZED标志
    public synchronized void syncMethod() {
        value++;
    }
    
    // 同步代码块：使用monitorenter和monitorexit指令
    public void syncBlock() {
        synchronized (this) {
            value++;
        }
    }
    
    /**
     * 字节码分析：
     * syncMethod():
     *   flags: ACC_PUBLIC, ACC_SYNCHRONIZED
     * 
     * syncBlock():
     *   monitorenter  // 获取锁
     *   iload_0
     *   dup
     *   getfield #2   // value字段
     *   iconst_1
     *   iadd
     *   putfield #2
     *   monitorexit   // 释放锁
     */
}
```

### 2.3 锁升级机制

```java
/**
 * JVM锁优化：偏向锁 -> 轻量级锁 -> 重量级锁
 */
public class LockUpgradeExample {
    private int count = 0;
    
    // 偏向锁：只有一个线程访问
    public synchronized void biasedLock() {
        count++; // 第一次访问，JVM会尝试使用偏向锁
    }
    
    // 轻量级锁：少量线程竞争
    public void lightweightLock() {
        synchronized (this) {
            count++; // 有竞争时，升级为轻量级锁
        }
    }
    
    // 重量级锁：激烈竞争
    public void heavyweightLock() {
        synchronized (this) {
            try {
                Thread.sleep(100); // 长时间持有锁，可能升级为重量级锁
                count++;
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }
}
```

## 3. volatile关键字

### 3.1 volatile的作用

`volatile`关键字保证变量的可见性和有序性，但不保证原子性。

```java
/**
 * volatile关键字示例
 */
public class VolatileExample {
    // 不使用volatile的情况
    private boolean stopFlag = false;
    
    // 使用volatile保证可见性
    private volatile boolean volatileStopFlag = false;
    
    // 演示可见性问题
    public void demonstrateVisibility() {
        // 工作线程
        Thread worker = new Thread(() -> {
            int count = 0;
            // 可能无法看到主线程对stopFlag的修改
            while (!stopFlag) {
                count++;
            }
            System.out.println("工作线程停止，计数: " + count);
        });
        
        worker.start();
        
        try {
            Thread.sleep(1000);
            stopFlag = true; // 主线程修改标志
            System.out.println("主线程设置停止标志");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
    
    // 使用volatile解决可见性问题
    public void demonstrateVolatileVisibility() {
        Thread worker = new Thread(() -> {
            int count = 0;
            // volatile保证能够看到主线程的修改
            while (!volatileStopFlag) {
                count++;
            }
            System.out.println("Volatile工作线程停止，计数: " + count);
        });
        
        worker.start();
        
        try {
            Thread.sleep(1000);
            volatileStopFlag = true; // 修改volatile变量
            System.out.println("主线程设置volatile停止标志");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
```

### 3.2 volatile的内存语义

```java
/**
 * volatile的happens-before规则
 */
public class VolatileMemorySemantics {
    private int normalVar = 0;
    private volatile boolean volatileVar = false;
    
    // 写线程
    public void writer() {
        normalVar = 42;        // 1. 普通写
        volatileVar = true;    // 2. volatile写
    }
    
    // 读线程
    public void reader() {
        if (volatileVar) {     // 3. volatile读
            // 由于volatile的happens-before规则
            // 这里一定能看到normalVar = 42
            System.out.println("Normal var: " + normalVar); // 4. 普通读
        }
    }
    
    /**
     * volatile的内存屏障：
     * 1. 在volatile写之前插入StoreStore屏障
     * 2. 在volatile写之后插入StoreLoad屏障
     * 3. 在volatile读之后插入LoadLoad屏障
     * 4. 在volatile读之后插入LoadStore屏障
     */
}
```

### 3.3 双重检查锁定模式

```java
/**
 * 使用volatile实现线程安全的单例模式
 */
public class Singleton {
    // 必须使用volatile，防止指令重排序
    private static volatile Singleton instance;
    
    private Singleton() {
        // 私有构造函数
    }
    
    public static Singleton getInstance() {
        if (instance == null) {                    // 第一次检查
            synchronized (Singleton.class) {
                if (instance == null) {            // 第二次检查
                    instance = new Singleton();   // 可能发生指令重排序
                }
            }
        }
        return instance;
    }
    
    /**
     * 为什么需要volatile？
     * new Singleton()包含三个步骤：
     * 1. 分配内存空间
     * 2. 初始化对象
     * 3. 将instance指向分配的内存
     * 
     * 如果发生重排序（1->3->2），其他线程可能看到未初始化的对象
     */
}
```

## 4. Lock接口和AQS

### 4.1 ReentrantLock基本用法

```java
import java.util.concurrent.locks.ReentrantLock;
import java.util.concurrent.locks.Condition;

/**
 * ReentrantLock使用示例
 */
public class ReentrantLockExample {
    private final ReentrantLock lock = new ReentrantLock();
    private final Condition condition = lock.newCondition();
    private int count = 0;
    private boolean ready = false;
    
    // 基本加锁操作
    public void increment() {
        lock.lock();
        try {
            count++;
        } finally {
            lock.unlock(); // 必须在finally中释放锁
        }
    }
    
    // 尝试加锁
    public boolean tryIncrement() {
        if (lock.tryLock()) {
            try {
                count++;
                return true;
            } finally {
                lock.unlock();
            }
        }
        return false;
    }
    
    // 可中断的锁
    public void interruptibleIncrement() throws InterruptedException {
        lock.lockInterruptibly();
        try {
            count++;
        } finally {
            lock.unlock();
        }
    }
    
    // 使用Condition进行线程通信
    public void waitForReady() throws InterruptedException {
        lock.lock();
        try {
            while (!ready) {
                condition.await(); // 等待条件满足
            }
            System.out.println("条件已满足，继续执行");
        } finally {
            lock.unlock();
        }
    }
    
    public void setReady() {
        lock.lock();
        try {
            ready = true;
            condition.signalAll(); // 通知等待的线程
        } finally {
            lock.unlock();
        }
    }
    
    public int getCount() {
        lock.lock();
        try {
            return count;
        } finally {
            lock.unlock();
        }
    }
}
```

### 4.2 ReadWriteLock读写锁

```java
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.HashMap;
import java.util.Map;

/**
 * 读写锁示例：缓存实现
 */
public class CacheWithReadWriteLock<K, V> {
    private final Map<K, V> cache = new HashMap<>();
    private final ReadWriteLock lock = new ReentrantReadWriteLock();
    
    // 读操作：可以并发执行
    public V get(K key) {
        lock.readLock().lock();
        try {
            return cache.get(key);
        } finally {
            lock.readLock().unlock();
        }
    }
    
    // 写操作：独占执行
    public void put(K key, V value) {
        lock.writeLock().lock();
        try {
            cache.put(key, value);
        } finally {
            lock.writeLock().unlock();
        }
    }
    
    // 删除操作：独占执行
    public V remove(K key) {
        lock.writeLock().lock();
        try {
            return cache.remove(key);
        } finally {
            lock.writeLock().unlock();
        }
    }
    
    // 获取缓存大小：读操作
    public int size() {
        lock.readLock().lock();
        try {
            return cache.size();
        } finally {
            lock.readLock().unlock();
        }
    }
    
    // 清空缓存：写操作
    public void clear() {
        lock.writeLock().lock();
        try {
            cache.clear();
        } finally {
            lock.writeLock().unlock();
        }
    }
}
```

### 4.3 AQS原理简介

```java
import java.util.concurrent.locks.AbstractQueuedSynchronizer;

/**
 * 基于AQS实现的简单互斥锁
 */
public class SimpleMutex {
    
    // 内部同步器
    private static class Sync extends AbstractQueuedSynchronizer {
        
        // 尝试获取锁
        @Override
        protected boolean tryAcquire(int arg) {
            // 使用CAS操作，将state从0设置为1
            return compareAndSetState(0, 1);
        }
        
        // 尝试释放锁
        @Override
        protected boolean tryRelease(int arg) {
            // 检查当前线程是否持有锁
            if (getState() == 0) {
                throw new IllegalMonitorStateException();
            }
            // 释放锁
            setState(0);
            return true;
        }
        
        // 检查是否持有锁
        @Override
        protected boolean isHeldExclusively() {
            return getState() == 1;
        }
    }
    
    private final Sync sync = new Sync();
    
    public void lock() {
        sync.acquire(1);
    }
    
    public boolean tryLock() {
        return sync.tryAcquire(1);
    }
    
    public void unlock() {
        sync.release(1);
    }
    
    public boolean isLocked() {
        return sync.isHeldExclusively();
    }
}
```

## 5. 原子类（Atomic Classes）

### 5.1 基本原子类

```java
import java.util.concurrent.atomic.*;

/**
 * 原子类使用示例
 */
public class AtomicExample {
    // 原子整数
    private final AtomicInteger atomicInt = new AtomicInteger(0);
    
    // 原子长整数
    private final AtomicLong atomicLong = new AtomicLong(0L);
    
    // 原子布尔值
    private final AtomicBoolean atomicBoolean = new AtomicBoolean(false);
    
    // 原子引用
    private final AtomicReference<String> atomicRef = new AtomicReference<>("initial");
    
    public void demonstrateAtomicOperations() {
        // 基本操作
        int oldValue = atomicInt.get();
        int newValue = atomicInt.incrementAndGet(); // 原子递增
        
        // CAS操作
        boolean success = atomicInt.compareAndSet(newValue, newValue + 10);
        
        // 原子更新
        int result = atomicInt.updateAndGet(x -> x * 2);
        
        // 原子累加
        int accumulated = atomicInt.accumulateAndGet(5, Integer::sum);
        
        System.out.println("原子操作结果: " + atomicInt.get());
    }
    
    // 线程安全的计数器
    public void safeIncrement() {
        atomicInt.incrementAndGet();
    }
    
    // 线程安全的状态切换
    public boolean toggleState() {
        return atomicBoolean.compareAndSet(false, true) || 
               atomicBoolean.compareAndSet(true, false);
    }
    
    // 线程安全的引用更新
    public void updateReference(String newValue) {
        atomicRef.set(newValue);
    }
}
```

### 5.2 原子数组

```java
import java.util.concurrent.atomic.AtomicIntegerArray;

/**
 * 原子数组示例
 */
public class AtomicArrayExample {
    private final AtomicIntegerArray atomicArray;
    
    public AtomicArrayExample(int size) {
        this.atomicArray = new AtomicIntegerArray(size);
    }
    
    // 原子地更新数组元素
    public void updateElement(int index, int value) {
        atomicArray.set(index, value);
    }
    
    // 原子地递增数组元素
    public int incrementElement(int index) {
        return atomicArray.incrementAndGet(index);
    }
    
    // 原子地比较并设置
    public boolean compareAndSetElement(int index, int expect, int update) {
        return atomicArray.compareAndSet(index, expect, update);
    }
    
    // 获取数组元素
    public int getElement(int index) {
        return atomicArray.get(index);
    }
    
    // 获取数组长度
    public int length() {
        return atomicArray.length();
    }
}
```

### 5.3 字段更新器

```java
import java.util.concurrent.atomic.AtomicIntegerFieldUpdater;
import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;

/**
 * 字段更新器示例
 */
public class FieldUpdaterExample {
    // 必须是volatile字段
    private volatile int volatileInt = 0;
    private volatile String volatileString = "initial";
    
    // 创建字段更新器
    private static final AtomicIntegerFieldUpdater<FieldUpdaterExample> INT_UPDATER =
        AtomicIntegerFieldUpdater.newUpdater(FieldUpdaterExample.class, "volatileInt");
    
    private static final AtomicReferenceFieldUpdater<FieldUpdaterExample, String> STRING_UPDATER =
        AtomicReferenceFieldUpdater.newUpdater(FieldUpdaterExample.class, String.class, "volatileString");
    
    // 原子地更新整数字段
    public void updateIntField(int newValue) {
        INT_UPDATER.set(this, newValue);
    }
    
    // 原子地递增整数字段
    public int incrementIntField() {
        return INT_UPDATER.incrementAndGet(this);
    }
    
    // 原子地更新字符串字段
    public void updateStringField(String newValue) {
        STRING_UPDATER.set(this, newValue);
    }
    
    // 原子地比较并设置字符串字段
    public boolean compareAndSetStringField(String expect, String update) {
        return STRING_UPDATER.compareAndSet(this, expect, update);
    }
    
    public int getIntField() {
        return volatileInt;
    }
    
    public String getStringField() {
        return volatileString;
    }
}
```

## 6. 并发集合

### 6.1 ConcurrentHashMap

```java
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.LongAdder;

/**
 * ConcurrentHashMap使用示例
 */
public class ConcurrentHashMapExample {
    private final ConcurrentHashMap<String, Integer> concurrentMap = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, LongAdder> counterMap = new ConcurrentHashMap<>();
    
    // 线程安全的put操作
    public void putValue(String key, Integer value) {
        concurrentMap.put(key, value);
    }
    
    // 原子的putIfAbsent操作
    public Integer putIfAbsent(String key, Integer value) {
        return concurrentMap.putIfAbsent(key, value);
    }
    
    // 原子的replace操作
    public boolean replaceValue(String key, Integer oldValue, Integer newValue) {
        return concurrentMap.replace(key, oldValue, newValue);
    }
    
    // 原子的compute操作
    public Integer computeValue(String key) {
        return concurrentMap.compute(key, (k, v) -> {
            if (v == null) {
                return 1;
            } else {
                return v + 1;
            }
        });
    }
    
    // 高效的计数器实现
    public void incrementCounter(String key) {
        counterMap.computeIfAbsent(key, k -> new LongAdder()).increment();
    }
    
    public long getCounterValue(String key) {
        LongAdder adder = counterMap.get(key);
        return adder != null ? adder.sum() : 0;
    }
    
    // 批量操作
    public void batchUpdate() {
        concurrentMap.forEach((key, value) -> {
            concurrentMap.put(key, value * 2);
        });
    }
}
```

### 6.2 阻塞队列

```java
import java.util.concurrent.*;

/**
 * 阻塞队列示例：生产者-消费者模式
 */
public class BlockingQueueExample {
    private final BlockingQueue<String> queue = new ArrayBlockingQueue<>(10);
    
    // 生产者
    public class Producer implements Runnable {
        @Override
        public void run() {
            try {
                for (int i = 0; i < 20; i++) {
                    String item = "Item-" + i;
                    queue.put(item); // 阻塞式放入
                    System.out.println("生产: " + item);
                    Thread.sleep(100);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }
    
    // 消费者
    public class Consumer implements Runnable {
        @Override
        public void run() {
            try {
                while (true) {
                    String item = queue.take(); // 阻塞式取出
                    System.out.println("消费: " + item);
                    Thread.sleep(200);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }
    
    public void startProducerConsumer() {
        // 启动生产者和消费者
        new Thread(new Producer()).start();
        new Thread(new Consumer()).start();
    }
    
    // 使用不同类型的阻塞队列
    public void demonstrateDifferentQueues() {
        // 有界队列
        BlockingQueue<String> boundedQueue = new ArrayBlockingQueue<>(5);
        
        // 无界队列
        BlockingQueue<String> unboundedQueue = new LinkedBlockingQueue<>();
        
        // 优先级队列
        BlockingQueue<Integer> priorityQueue = new PriorityBlockingQueue<>();
        
        // 延迟队列
        BlockingQueue<Delayed> delayQueue = new DelayQueue<>();
        
        // 同步队列
        BlockingQueue<String> synchronousQueue = new SynchronousQueue<>();
    }
}
```

## 7. 线程池和Executor框架

### 7.1 ThreadPoolExecutor详解

```java
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * 线程池详细配置示例
 */
public class ThreadPoolExample {
    
    // 自定义线程工厂
    private static class CustomThreadFactory implements ThreadFactory {
        private final AtomicInteger threadNumber = new AtomicInteger(1);
        private final String namePrefix;
        
        public CustomThreadFactory(String namePrefix) {
            this.namePrefix = namePrefix;
        }
        
        @Override
        public Thread newThread(Runnable r) {
            Thread thread = new Thread(r, namePrefix + "-thread-" + threadNumber.getAndIncrement());
            thread.setDaemon(false);
            thread.setPriority(Thread.NORM_PRIORITY);
            return thread;
        }
    }
    
    // 自定义拒绝策略
    private static class CustomRejectedExecutionHandler implements RejectedExecutionHandler {
        @Override
        public void rejectedExecution(Runnable r, ThreadPoolExecutor executor) {
            System.err.println("任务被拒绝: " + r.toString());
            // 可以选择记录日志、抛出异常或其他处理方式
        }
    }
    
    public void createCustomThreadPool() {
        ThreadPoolExecutor executor = new ThreadPoolExecutor(
            2,                                    // 核心线程数
            4,                                    // 最大线程数
            60L,                                  // 空闲线程存活时间
            TimeUnit.SECONDS,                     // 时间单位
            new LinkedBlockingQueue<>(10),        // 工作队列
            new CustomThreadFactory("MyPool"),    // 线程工厂
            new CustomRejectedExecutionHandler()  // 拒绝策略
        );
        
        // 提交任务
        for (int i = 0; i < 20; i++) {
            final int taskId = i;
            executor.submit(() -> {
                System.out.println("执行任务 " + taskId + ", 线程: " + Thread.currentThread().getName());
                try {
                    Thread.sleep(2000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            });
        }
        
        // 关闭线程池
        executor.shutdown();
        try {
            if (!executor.awaitTermination(60, TimeUnit.SECONDS)) {
                executor.shutdownNow();
            }
        } catch (InterruptedException e) {
            executor.shutdownNow();
        }
    }
    
    // 预定义线程池
    public void demonstratePredefinedPools() {
        // 固定大小线程池
        ExecutorService fixedPool = Executors.newFixedThreadPool(4);
        
        // 缓存线程池
        ExecutorService cachedPool = Executors.newCachedThreadPool();
        
        // 单线程池
        ExecutorService singlePool = Executors.newSingleThreadExecutor();
        
        // 定时任务线程池
        ScheduledExecutorService scheduledPool = Executors.newScheduledThreadPool(2);
        
        // 工作窃取线程池（Java 8+）
        ExecutorService workStealingPool = Executors.newWorkStealingPool();
    }
}
```

### 7.2 CompletableFuture异步编程

```java
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * CompletableFuture异步编程示例
 */
public class CompletableFutureExample {
    private final ExecutorService executor = Executors.newFixedThreadPool(4);
    
    // 基本异步操作
    public void basicAsyncOperations() {
        // 异步执行
        CompletableFuture<String> future1 = CompletableFuture.supplyAsync(() -> {
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            return "Hello";
        }, executor);
        
        // 链式操作
        CompletableFuture<String> future2 = future1
            .thenApply(s -> s + " World")
            .thenApply(String::toUpperCase);
        
        // 异步回调
        future2.thenAccept(result -> {
            System.out.println("结果: " + result);
        });
    }
    
    // 组合多个异步操作
    public void combineAsyncOperations() {
        CompletableFuture<String> future1 = CompletableFuture.supplyAsync(() -> {
            sleep(1000);
            return "Hello";
        });
        
        CompletableFuture<String> future2 = CompletableFuture.supplyAsync(() -> {
            sleep(2000);
            return "World";
        });
        
        // 等待两个任务都完成
        CompletableFuture<String> combinedFuture = future1.thenCombine(future2, (s1, s2) -> s1 + " " + s2);
        
        // 任意一个完成即可
        CompletableFuture<String> eitherFuture = future1.applyToEither(future2, s -> "First: " + s);
        
        // 等待所有任务完成
        CompletableFuture<Void> allOf = CompletableFuture.allOf(future1, future2);
        
        // 等待任意一个任务完成
        CompletableFuture<Object> anyOf = CompletableFuture.anyOf(future1, future2);
    }
    
    // 异常处理
    public void handleExceptions() {
        CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
            if (Math.random() > 0.5) {
                throw new RuntimeException("随机异常");
            }
            return "成功";
        })
        .handle((result, throwable) -> {
            if (throwable != null) {
                return "处理异常: " + throwable.getMessage();
            }
            return result;
        })
        .exceptionally(throwable -> {
            return "异常恢复: " + throwable.getMessage();
        });
        
        future.thenAccept(System.out::println);
    }
    
    private void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
```

## 8. 线程安全的设计模式

### 8.1 不变性模式

```java
import java.util.Collections;
import java.util.List;
import java.util.ArrayList;

/**
 * 不变性模式：通过不可变对象实现线程安全
 */
public final class ImmutablePerson {
    private final String name;
    private final int age;
    private final List<String> hobbies;
    
    public ImmutablePerson(String name, int age, List<String> hobbies) {
        this.name = name;
        this.age = age;
        // 防御性复制
        this.hobbies = Collections.unmodifiableList(new ArrayList<>(hobbies));
    }
    
    public String getName() {
        return name;
    }
    
    public int getAge() {
        return age;
    }
    
    public List<String> getHobbies() {
        return hobbies; // 返回不可变视图
    }
    
    // 修改操作返回新对象
    public ImmutablePerson withAge(int newAge) {
        return new ImmutablePerson(this.name, newAge, new ArrayList<>(this.hobbies));
    }
    
    public ImmutablePerson addHobby(String hobby) {
        List<String> newHobbies = new ArrayList<>(this.hobbies);
        newHobbies.add(hobby);
        return new ImmutablePerson(this.name, this.age, newHobbies);
    }
}
```

### 8.2 线程局部存储模式

```java
import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * ThreadLocal使用示例
 */
public class ThreadLocalExample {
    
    // SimpleDateFormat不是线程安全的，使用ThreadLocal解决
    private static final ThreadLocal<SimpleDateFormat> DATE_FORMAT = 
        ThreadLocal.withInitial(() -> new SimpleDateFormat("yyyy-MM-dd HH:mm:ss"));
    
    // 用户上下文
    private static final ThreadLocal<UserContext> USER_CONTEXT = new ThreadLocal<>();
    
    public static class UserContext {
        private String userId;
        private String userName;
        
        public UserContext(String userId, String userName) {
            this.userId = userId;
            this.userName = userName;
        }
        
        // getters and setters
        public String getUserId() { return userId; }
        public String getUserName() { return userName; }
    }
    
    // 线程安全的日期格式化
    public static String formatDate(Date date) {
        return DATE_FORMAT.get().format(date);
    }
    
    // 设置用户上下文
    public static void setUserContext(String userId, String userName) {
        USER_CONTEXT.set(new UserContext(userId, userName));
    }
    
    // 获取当前用户
    public static UserContext getCurrentUser() {
        return USER_CONTEXT.get();
    }
    
    // 清理ThreadLocal（重要：防止内存泄漏）
    public static void clearContext() {
        USER_CONTEXT.remove();
    }
    
    // 使用示例
    public void demonstrateThreadLocal() {
        // 在不同线程中设置不同的用户上下文
        Thread thread1 = new Thread(() -> {
            setUserContext("001", "Alice");
            System.out.println("Thread 1 - User: " + getCurrentUser().getUserName());
            System.out.println("Thread 1 - Date: " + formatDate(new Date()));
            clearContext();
        });
        
        Thread thread2 = new Thread(() -> {
            setUserContext("002", "Bob");
            System.out.println("Thread 2 - User: " + getCurrentUser().getUserName());
            System.out.println("Thread 2 - Date: " + formatDate(new Date()));
            clearContext();
        });
        
        thread1.start();
        thread2.start();
    }
}
```

## 9. 性能优化和最佳实践

### 9.1 锁优化技巧

```java
/**
 * 锁优化最佳实践
 */
public class LockOptimization {
    private final Object lock1 = new Object();
    private final Object lock2 = new Object();
    private volatile boolean flag = false;
    
    // 1. 减小锁的粒度
    private int count1 = 0;
    private int count2 = 0;
    
    // 不好的做法：粗粒度锁
    public synchronized void badIncrement() {
        count1++;
        count2++;
    }
    
    // 好的做法：细粒度锁
    public void goodIncrement() {
        synchronized (lock1) {
            count1++;
        }
        synchronized (lock2) {
            count2++;
        }
    }
    
    // 2. 减少锁的持有时间
    public void optimizedMethod() {
        // 准备工作（不需要锁）
        String data = prepareData();
        
        // 只在必要时加锁
        synchronized (this) {
            // 快速完成临界区操作
            updateSharedState(data);
        }
        
        // 后续处理（不需要锁）
        postProcess();
    }
    
    // 3. 锁分离
    private final Object readLock = new Object();
    private final Object writeLock = new Object();
    
    public void separatedLockRead() {
        synchronized (readLock) {
            // 读操作
        }
    }
    
    public void separatedLockWrite() {
        synchronized (writeLock) {
            // 写操作
        }
    }
    
    // 4. 避免不必要的同步
    public void avoidUnnecessarySync() {
        // 使用双重检查锁定模式
        if (!flag) {
            synchronized (this) {
                if (!flag) {
                    // 初始化操作
                    flag = true;
                }
            }
        }
    }
    
    private String prepareData() { return "data"; }
    private void updateSharedState(String data) { /* update */ }
    private void postProcess() { /* process */ }
}
```

### 9.2 无锁编程

```java
import java.util.concurrent.atomic.AtomicReference;

/**
 * 无锁数据结构示例：无锁栈
 */
public class LockFreeStack<T> {
    private final AtomicReference<Node<T>> top = new AtomicReference<>();
    
    private static class Node<T> {
        final T data;
        final Node<T> next;
        
        Node(T data, Node<T> next) {
            this.data = data;
            this.next = next;
        }
    }
    
    // 无锁push操作
    public void push(T item) {
        Node<T> newNode = new Node<>(item, null);
        Node<T> currentTop;
        
        do {
            currentTop = top.get();
            newNode.next = currentTop;
        } while (!top.compareAndSet(currentTop, newNode));
    }
    
    // 无锁pop操作
    public T pop() {
        Node<T> currentTop;
        Node<T> newTop;
        
        do {
            currentTop = top.get();
            if (currentTop == null) {
                return null;
            }
            newTop = currentTop.next;
        } while (!top.compareAndSet(currentTop, newTop));
        
        return currentTop.data;
    }
    
    public boolean isEmpty() {
        return top.get() == null;
    }
}
```

## 10. 总结

JVM线程同步机制是Java并发编程的核心，掌握以下要点：

### 核心概念

- **Java内存模型**：理解可见性、有序性、原子性
- **synchronized**：最基本的同步机制，了解锁升级过程
- **volatile**：保证可见性和有序性，适用于状态标志
- **Lock接口**：提供更灵活的锁机制
- **原子类**：无锁的线程安全操作

### 最佳实践

1. **优先使用不可变对象**
2. **合理选择同步机制**：根据场景选择synchronized、Lock或原子类
3. **减小锁的粒度和持有时间**
4. **避免死锁**：统一加锁顺序，使用超时机制
5. **正确使用ThreadLocal**：注意内存泄漏问题
6. **合理配置线程池**：根据任务特性选择合适的线程池

### 性能考虑

- **锁竞争**：减少锁竞争，提高并发性能
- **上下文切换**：减少不必要的线程切换
- **内存可见性**：合理使用volatile和final
- **无锁编程**：在适当场景使用CAS操作

通过深入理解这些机制和最佳实践，可以编写出高效、安全的多线程Java程序。

```java

提交任务1后 - 核心线程数: 2, 当前线程数: 1, 队列大小: 0
任务1开始执行，线程: CustomThread-1
任务2开始执行，线程: CustomThread-2
提交任务2后 - 核心线程数: 2, 当前线程数: 2, 队列大小: 0
提交任务3后 - 核心线程数: 2, 当前线程数: 2, 队列大小: 1
提交任务4后 - 核心线程数: 2, 当前线程数: 2, 队列大小: 2
提交任务5后 - 核心线程数: 2, 当前线程数: 3, 队列大小: 2
提交任务6后 - 核心线程数: 2, 当前线程数: 4, 队列大小: 2
任务被拒绝: java.util.concurrent.FutureTask@3b9a45b3, 当前线程数: 4, 队列大小: 2
提交任务7后 - 核心线程数: 2, 当前线程数: 4, 队列大小: 2
任务6开始执行，线程: CustomThread-4
任务被拒绝: java.util.concurrent.FutureTask@7699a589, 当前线程数: 4, 队列大小: 2
提交任务8后 - 核心线程数: 2, 当前线程数: 4, 队列大小: 2
任务5开始执行，线程: CustomThread-3
任务5执行完成
任务1执行完成
任务3开始执行，线程: CustomThread-3
任务6执行完成
任务4开始执行，线程: CustomThread-1
任务2执行完成
任务3执行完成
任务4执行完成

初始状态: RUNNING
提交任务后: RUNNING
调用shutdown后: TIDYING
最终状态: TERMINATED

import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class Main1 {
    public static void demonstrateStates() {
        ThreadPoolExecutor executor = new ThreadPoolExecutor(
                2, 4, 60L, TimeUnit.SECONDS,
                new LinkedBlockingQueue<>(10)
        );

        System.out.println("初始状态: " + getPoolState(executor));

        // 提交任务
        for (int i = 0; i < 3; i++) {
            executor.submit(() -> {
                try {
                    Thread.sleep(2000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            });
        }

        System.out.println("提交任务后: " + getPoolState(executor));

        // 关闭线程池
        executor.shutdown();
        System.out.println("调用shutdown后: " + getPoolState(executor));

        try {
            executor.awaitTermination(5, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        System.out.println("最终状态: " + getPoolState(executor));
    }

// 获取线程池的状态
    private static String getPoolState(ThreadPoolExecutor executor) {
        // 如果线程池已经终止
        if (executor.isTerminated()) {
            // 返回TERMINATED
            return "TERMINATED";
        // 如果线程池正在终止
        } else if (executor.isTerminating()) {
            // 返回TIDYING
            return "TIDYING";
        // 如果线程池已经关闭
        } else if (executor.isShutdown()) {
            // 返回SHUTDOWN
            return "SHUTDOWN";
        // 如果线程池正在运行
        } else {
            // 返回RUNNING
            return "RUNNING";
        }
    }

    public static void main(String[] args) {
        demonstrateStates();
    }
}



import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class Main2 {
    // 基本用法示例
    public static void basicUsage() {
        // 创建一个固定大小为3的线程池
        ExecutorService executor = Executors.newFixedThreadPool(3);

        // 提交10个任务
        for (int i = 1; i <= 10; i++) {
            final int taskId = i;
            // 提交任务到线程池
            executor.submit(() -> {
                System.out.println("任务" + taskId + "开始执行，线程: " + Thread.currentThread().getName());
                try {
                    Thread.sleep(2000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
                System.out.println("任务" + taskId + "执行完成");
            });
        }

        // 关闭线程池
        executor.shutdown();
        try {
            // 等待所有任务完成，最多等待15秒
            if (!executor.awaitTermination(15, TimeUnit.SECONDS)) {
                // 如果15秒内任务未完成，则强制关闭线程池
                executor.shutdownNow();
            }
        } catch (InterruptedException e) {
            // 如果等待过程中被中断，则强制关闭线程池
            executor.shutdownNow();
        }
    }

    // 批量处理任务示例
    public static void batchProcessing() {
        // 创建一个固定大小为4的线程池
        ExecutorService executor = Executors.newFixedThreadPool(4);

        // 模拟批量数据处理
        String[] data = {"数据1", "数据2", "数据3", "数据4", "数据5", "数据6", "数据7", "数据8"};

        // 创建一个CompletableFuture数组，用于存储每个任务的Future对象
        CompletableFuture<Void>[] futures = new CompletableFuture[data.length];

        // 提交任务到线程池
        for (int i = 0; i < data.length; i++) {
            final String item = data[i];
            futures[i] = CompletableFuture.runAsync(() -> {
                System.out.println("处理" + item + "，线程: " + Thread.currentThread().getName());
                try {
                    Thread.sleep(1000); // 模拟处理时间
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
                System.out.println(item + "处理完成");
            }, executor);
        }

        // 等待所有任务完成
        CompletableFuture.allOf(futures).join();
        System.out.println("所有数据处理完成");

        // 关闭线程池
        executor.shutdown();
    }

    public static void main(String[] args) {
        System.out.println("=== 基本用法 ===");
        basicUsage();

        System.out.println("\n=== 批量处理 ===");
        batchProcessing();
    }
}

"C:\Program Files\Java\jdk1.8.0_351\bin\java.exe" "-javaagent:D:\software\IntelliJ IDEA 2024.1.7\lib\idea_rt.jar=53209:D:\software\IntelliJ IDEA 2024.1.7\bin" -Dfile.encoding=UTF-8 -classpath "C:\Program Files\Java\jdk1.8.0_351\jre\lib\charsets.jar;C:\Program Files\Java\jdk1.8.0_351\jre\lib\deploy.jar;C:\Program Files\Java\jdk1.8.0_351\jre\lib\ext\access-bridge-64.jar;C:\Program Files\Java\jdk1.8.0_351\jre\lib\ext\cldrdata.jar;C:\Program Files\Java\jdk1.8.0_351\jre\lib\ext\dnsns.jar;C:\Program Files\Java\jdk1.8.0_351\jre\lib\ext\jaccess.jar;C:\Program Files\Java\jdk1.8.0_351\jre\lib\ext\jfxrt.jar;C:\Program Files\Java\jdk1.8.0_351\jre\lib\ext\localedata.jar;C:\Program Files\Java\jdk1.8.0_351\jre\lib\ext\nashorn.jar;C:\Program Files\Java\jdk1.8.0_351\jre\lib\ext\sunec.jar;C:\Program Files\Java\jdk1.8.0_351\jre\lib\ext\sunjce_provider.jar;C:\Program Files\Java\jdk1.8.0_351\jre\lib\ext\sunmscapi.jar;C:\Program Files\Java\jdk1.8.0_351\jre\lib\ext\sunpkcs11.jar;C:\Program Files\Java\jdk1.8.0_351\jre\lib\ext\zipfs.jar;C:\Program Files\Java\jdk1.8.0_351\jre\lib\javaws.jar;C:\Program Files\Java\jdk1.8.0_351\jre\lib\jce.jar;C:\Program Files\Java\jdk1.8.0_351\jre\lib\jfr.jar;C:\Program Files\Java\jdk1.8.0_351\jre\lib\jfxswt.jar;C:\Program Files\Java\jdk1.8.0_351\jre\lib\jsse.jar;C:\Program Files\Java\jdk1.8.0_351\jre\lib\management-agent.jar;C:\Program Files\Java\jdk1.8.0_351\jre\lib\plugin.jar;C:\Program Files\Java\jdk1.8.0_351\jre\lib\resources.jar;C:\Program Files\Java\jdk1.8.0_351\jre\lib\rt.jar;D:\pei-pei-zhuanshu\pei-pei-class-1\out\production\pei-pei-class-1" Main2
=== 基本用法 ===
任务1开始执行，线程: pool-1-thread-1
任务3开始执行，线程: pool-1-thread-3
任务2开始执行，线程: pool-1-thread-2
任务3执行完成
任务1执行完成
任务2执行完成
任务5开始执行，线程: pool-1-thread-1
任务4开始执行，线程: pool-1-thread-3
任务6开始执行，线程: pool-1-thread-2
任务4执行完成
任务7开始执行，线程: pool-1-thread-3
任务5执行完成
任务8开始执行，线程: pool-1-thread-1
任务6执行完成
任务9开始执行，线程: pool-1-thread-2
任务7执行完成
任务9执行完成
任务10开始执行，线程: pool-1-thread-3
任务8执行完成
任务10执行完成

=== 批量处理 ===
处理数据3，线程: pool-2-thread-3
处理数据4，线程: pool-2-thread-4
处理数据2，线程: pool-2-thread-2
处理数据1，线程: pool-2-thread-1
数据1处理完成
数据3处理完成
处理数据6，线程: pool-2-thread-3
数据4处理完成
数据2处理完成
处理数据7，线程: pool-2-thread-4
处理数据5，线程: pool-2-thread-1
处理数据8，线程: pool-2-thread-2
数据7处理完成
数据8处理完成
数据6处理完成
数据5处理完成
所有数据处理完成

进程已结束，退出代码为 0


import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class Main3 {
    // 动态线程创建示例
    public static void dynamicThreadCreation() {
        // 创建一个缓存线程池，线程池中线程的数量会根据需要动态增加或减少
        ExecutorService executor = Executors.newCachedThreadPool();

        // 第一批任务 - 快速提交
        System.out.println("提交第一批任务...");
        for (int i = 1; i <= 5; i++) {
            final int taskId = i;
            // 提交任务到线程池，任务是一个Lambda表达式，表示一个Runnable对象
            executor.submit(() -> {
                System.out.println("任务" + taskId + "开始执行，线程: " + Thread.currentThread().getName());
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
                System.out.println("任务" + taskId + "执行完成");
            });
        }

        try {
            Thread.sleep(3000); // 等待第一批任务完成
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        // 第二批任务 - 延迟提交，观察线程复用
        System.out.println("\n提交第二批任务...");
        for (int i = 6; i <= 10; i++) {
            final int taskId = i;
            executor.submit(() -> {
                System.out.println("任务" + taskId + "开始执行，线程: " + Thread.currentThread().getName());
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
                System.out.println("任务" + taskId + "执行完成");
            });
        }

        // 关闭线程池
        executor.shutdown();
        try {
            // 等待所有任务完成，最多等待10秒
            if (!executor.awaitTermination(10, TimeUnit.SECONDS)) {
                // 如果等待超时，则强制关闭线程池
                executor.shutdownNow();
            }
        } catch (InterruptedException e) {
            // 如果等待过程中被中断，则强制关闭线程池
            executor.shutdownNow();
        }
    }

    // 突发任务处理示例
    public static void burstTaskHandling() {
        // 创建一个缓存线程池，线程池中线程的数量会根据需要动态增加或减少
        ExecutorService executor = Executors.newCachedThreadPool();

        // 模拟突发的大量短任务
        System.out.println("模拟突发任务处理...");
        for (int i = 1; i <= 20; i++) {
            final int taskId = i;
            // 提交任务到线程池，任务是一个Lambda表达式，表示一个Runnable对象
            executor.submit(() -> {
                System.out.println("突发任务" + taskId + "，线程: " + Thread.currentThread().getName());
                try {
                    Thread.sleep(500); // 短任务
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            });

            // 快速提交任务
            try {
                Thread.sleep(50);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }

        // 关闭线程池
        executor.shutdown();
        try {
            // 等待所有任务完成，最多等待10秒
            if (!executor.awaitTermination(10, TimeUnit.SECONDS)) {
                // 如果等待超时，则强制关闭线程池
                executor.shutdownNow();
            }
        } catch (InterruptedException e) {
            // 如果等待过程中被中断，则强制关闭线程池
            executor.shutdownNow();
        }
    }

    public static void main(String[] args) {
        System.out.println("=== 动态线程创建 ===");
        dynamicThreadCreation();

        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        System.out.println("\n=== 突发任务处理 ===");
        burstTaskHandling();
    }
}

=== 动态线程创建 ===
提交第一批任务...
任务1开始执行，线程: pool-1-thread-1
任务2开始执行，线程: pool-1-thread-2
任务4开始执行，线程: pool-1-thread-4
任务5开始执行，线程: pool-1-thread-5
任务3开始执行，线程: pool-1-thread-3
任务5执行完成
任务4执行完成
任务3执行完成
任务2执行完成
任务1执行完成

提交第二批任务...
任务7开始执行，线程: pool-1-thread-2
任务9开始执行，线程: pool-1-thread-5
任务10开始执行，线程: pool-1-thread-4
任务8开始执行，线程: pool-1-thread-3
任务6开始执行，线程: pool-1-thread-1
任务7执行完成
任务6执行完成
任务8执行完成
任务9执行完成
任务10执行完成

=== 突发任务处理 ===
模拟突发任务处理...
突发任务1，线程: pool-2-thread-1
突发任务2，线程: pool-2-thread-2
突发任务3，线程: pool-2-thread-3
突发任务4，线程: pool-2-thread-4
突发任务5，线程: pool-2-thread-5
突发任务6，线程: pool-2-thread-6
突发任务7，线程: pool-2-thread-7
突发任务8，线程: pool-2-thread-8
突发任务9，线程: pool-2-thread-9
突发任务10，线程: pool-2-thread-2
突发任务11，线程: pool-2-thread-1
突发任务12，线程: pool-2-thread-3
突发任务13，线程: pool-2-thread-4
突发任务14，线程: pool-2-thread-5
突发任务15，线程: pool-2-thread-6
突发任务16，线程: pool-2-thread-7
突发任务17，线程: pool-2-thread-8
突发任务18，线程: pool-2-thread-9
突发任务19，线程: pool-2-thread-2
突发任务20，线程: pool-2-thread-1


public class Main7 {
    // 共享变量
    private static int sharedVariable = 0;
    // 标志位
    private static boolean flag = false;

    // 展示内存模型
    public static void demonstrateMemoryModel() {
        // 线程1：写入数据
        Thread writer = new Thread(() -> {
            System.out.println("Writer: 开始写入数据");
            sharedVariable = 42;
            flag = true;
            System.out.println("Writer: 数据写入完成");
        }, "Writer-Thread");

        // 线程2：读取数据
        Thread reader = new Thread(() -> {
            System.out.println("Reader: 开始读取数据");
            while (!flag) {
                // 等待flag变为true
                Thread.yield();
            }
            System.out.println("Reader: 读取到的值 = " + sharedVariable);
        }, "Reader-Thread");

        reader.start();
        try {
            Thread.sleep(100); // 确保reader先启动
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        writer.start();

        try {
            writer.join();
            reader.join();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {
        demonstrateMemoryModel();
    }
}

Reader: 开始读取数据
Writer: 开始写入数据
Writer: 数据写入完成
Reader: 读取到的值 = 42


import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.ReentrantLock;

public class Main9 {
    // 实践1：缩小锁的范围
    public static class OptimizedCounter {
        private final Object lock = new Object();
        private int count = 0;

        // 不好的做法：锁的范围太大
        public void badIncrement() {
            synchronized (lock) {
                // 耗时的非关键操作
                doSomeExpensiveWork();
                count++;
                // 更多非关键操作
                doMoreWork();
            }
        }

        // 好的做法：只锁关键部分
        public void goodIncrement() {
            // 非关键操作在锁外执行
            doSomeExpensiveWork();

            synchronized (lock) {
                count++; // 只锁必要的操作
            }

            doMoreWork();
        }

        public int getCount() {
            synchronized (lock) {
                return count;
            }
        }

        private void doSomeExpensiveWork() {
            // 模拟耗时操作
            try {
                Thread.sleep(10);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }

        private void doMoreWork() {
            // 模拟其他工作
        }
    }

    // 实践2：避免锁嵌套，防止死锁
    public static class DeadlockAvoidance {
        private final Object lock1 = new Object();
        private final Object lock2 = new Object();

        // 危险：可能导致死锁
        public void dangerousMethod1() {
            synchronized (lock1) {
                System.out.println("获得lock1");
                synchronized (lock2) {
                    System.out.println("获得lock2");
                    // 执行操作
                }
            }
        }

        public void dangerousMethod2() {
            synchronized (lock2) {
                System.out.println("获得lock2");
                synchronized (lock1) {
                    System.out.println("获得lock1");
                    // 执行操作
                }
            }
        }

        // 安全：使用固定的锁顺序
        private final Object firstLock = lock1;
        private final Object secondLock = lock2;

        public void safeMethod1() {
            synchronized (firstLock) {
                synchronized (secondLock) {
                    // 执行操作
                    System.out.println("安全方法1执行");
                }
            }
        }

        public void safeMethod2() {
            synchronized (firstLock) {
                synchronized (secondLock) {
                    // 执行操作
                    System.out.println("安全方法2执行");
                }
            }
        }
    }

    // 实践3：使用tryLock避免无限等待
    public static class TimeoutLocking {
        private final ReentrantLock lock = new ReentrantLock();
        private final List<String> data = new ArrayList<>();

        public boolean addWithTimeout(String item, long timeout, TimeUnit unit) {
            try {
                if (lock.tryLock(timeout, unit)) {
                    try {
                        data.add(item);
                        System.out.println("成功添加: " + item);
                        return true;
                    } finally {
                        lock.unlock();
                    }
                } else {
                    System.out.println("获取锁超时，放弃添加: " + item);
                    return false;
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return false;
            }
        }

        public void simulateContention() {
            // 模拟锁竞争
            Thread holder = new Thread(() -> {
                lock.lock();
                try {
                    System.out.println("长时间持有锁...");
                    Thread.sleep(3000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                } finally {
                    lock.unlock();
                    System.out.println("释放锁");
                }
            });

            Thread waiter = new Thread(() -> {
                try {
                    Thread.sleep(100); // 确保holder先获得锁
                    addWithTimeout("测试项", 1, TimeUnit.SECONDS);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            });

            holder.start();
            waiter.start();

            try {
                holder.join();
                waiter.join();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }

    public static void main(String[] args) {
        // 打印锁范围优化演示
        System.out.println("=== 锁范围优化演示 ===");
        // 创建一个OptimizedCounter对象
        OptimizedCounter counter = new OptimizedCounter();

        // 获取当前时间
        long start = System.currentTimeMillis();
        // 创建一个包含5个线程的数组
        Thread[] threads = new Thread[5];
        // 循环创建5个线程
        for (int i = 0; i < threads.length; i++) {
            // 创建一个线程，并执行goodIncrement方法
            threads[i] = new Thread(() -> {
                for (int j = 0; j < 3; j++) {
                    counter.goodIncrement();
                }
            });
            // 启动线程
            threads[i].start();
        }

        // 循环等待所有线程执行完毕
        for (Thread thread : threads) {
            try {
                thread.join();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }

        // 获取当前时间
        long end = System.currentTimeMillis();
        // 打印最终计数和耗时
        System.out.println("最终计数: " + counter.getCount() + ", 耗时: " + (end - start) + "ms");

        // 打印死锁避免演示
        System.out.println("\n=== 死锁避免演示 ===");
        // 创建一个DeadlockAvoidance对象
        DeadlockAvoidance avoidance = new DeadlockAvoidance();
        // 调用safeMethod1和safeMethod2方法
        avoidance.safeMethod1();
        avoidance.safeMethod2();

        // 打印超时锁演示
        System.out.println("\n=== 超时锁演示 ===");
        // 创建一个TimeoutLocking对象
        TimeoutLocking timeoutLocking = new TimeoutLocking();
        // 调用simulateContention方法
        timeoutLocking.simulateContention();
    }
}

=== 锁范围优化演示 ===
最终计数: 15, 耗时: 74ms

=== 死锁避免演示 ===
安全方法1执行
安全方法2执行

=== 超时锁演示 ===
长时间持有锁...
获取锁超时，放弃添加: 测试项
释放锁

import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class Main10 {
    // 实践1：合理配置线程池参数
    public static class ThreadPoolFactory {

        // CPU密集型任务的线程池
        public static ThreadPoolExecutor createCpuIntensivePool() {
            // 核心线程数设置为CPU核心数
            int corePoolSize = Runtime.getRuntime().availableProcessors();
            // 最大线程数设置为CPU核心数
            int maximumPoolSize = corePoolSize;
            // 线程空闲时间设置为0
            long keepAliveTime = 0L;

            // 创建线程池
            return new ThreadPoolExecutor(
                    corePoolSize,
                    maximumPoolSize,
                    keepAliveTime,
                    TimeUnit.MILLISECONDS,
                    new LinkedBlockingQueue<>(100),
                    new CustomThreadFactory("CPU-Worker"),
                    new ThreadPoolExecutor.CallerRunsPolicy()
            );
        }

        // IO密集型任务的线程池
        public static ThreadPoolExecutor createIoIntensivePool() {
            // 核心线程数设置为CPU核心数的两倍
            int corePoolSize = Runtime.getRuntime().availableProcessors() * 2;
            // 最大线程数设置为CPU核心数的四倍
            int maximumPoolSize = corePoolSize * 2;
            // 线程空闲时间设置为60秒
            long keepAliveTime = 60L;

            // 创建线程池
            return new ThreadPoolExecutor(
                    corePoolSize,
                    maximumPoolSize,
                    keepAliveTime,
                    TimeUnit.SECONDS,
                    new LinkedBlockingQueue<>(200),
                    new CustomThreadFactory("IO-Worker"),
                    new ThreadPoolExecutor.CallerRunsPolicy()
            );
        }

        // 自定义线程工厂
        static class CustomThreadFactory implements ThreadFactory {
            private final AtomicInteger threadNumber = new AtomicInteger(1);
            private final String namePrefix;

            CustomThreadFactory(String namePrefix) {
                this.namePrefix = namePrefix;
            }

            @Override
            public Thread newThread(Runnable r) {
                // 创建线程
                Thread t = new Thread(r, namePrefix + "-" + threadNumber.getAndIncrement());
                t.setDaemon(false);
                t.setPriority(Thread.NORM_PRIORITY);

                // 设置异常处理器
                t.setUncaughtExceptionHandler((thread, ex) -> {
                    System.err.println("线程 " + thread.getName() + " 发生异常: " + ex.getMessage());
                    ex.printStackTrace();
                });

                return t;
            }
        }
    }

    // 实践2：正确处理任务异常
    public static class TaskExceptionHandling {

        public static void demonstrateExceptionHandling() {
            // 创建线程池
            ThreadPoolExecutor executor = ThreadPoolFactory.createCpuIntensivePool();

            // 方法1：使用Future捕获异常
            Future<?> future = executor.submit(() -> {
                // 模拟任务异常
                if (Math.random() > 0.5) {
                    throw new RuntimeException("模拟任务异常");
                }
                System.out.println("任务正常完成");
            });

            try {
                // 获取任务结果
                future.get(5, TimeUnit.SECONDS);
                System.out.println("任务成功完成");
            } catch (ExecutionException e) {
                // 任务执行异常
                System.err.println("任务执行异常: " + e.getCause().getMessage());
            } catch (TimeoutException e) {
                // 任务执行超时
                System.err.println("任务执行超时");
                future.cancel(true);
            } catch (InterruptedException e) {
                // 中断线程
                Thread.currentThread().interrupt();
            }

            // 方法2：在任务内部处理异常
            executor.submit(() -> {
                try {
                    // 可能抛出异常的代码
                    if (Math.random() > 0.5) {
                        throw new RuntimeException("内部异常");
                    }
                    System.out.println("内部异常处理：任务正常完成");
                } catch (Exception e) {
                    // 捕获到异常
                    System.err.println("内部异常处理：捕获到异常 - " + e.getMessage());
                    // 记录日志、发送告警等
                }
            });

            // 优雅关闭
            executor.shutdown();
            try {
                // 等待线程池关闭
                if (!executor.awaitTermination(5, TimeUnit.SECONDS)) {
                    executor.shutdownNow();
                }
            } catch (InterruptedException e) {
                executor.shutdownNow();
                Thread.currentThread().interrupt();
            }
        }
    }

    // 实践3：监控线程池状态
    public static class ThreadPoolMonitoring {

        public static void monitorThreadPool() {
            // 创建线程池
            ThreadPoolExecutor executor = ThreadPoolFactory.createIoIntensivePool();

            // 启动监控线程
            ScheduledExecutorService monitor = Executors.newSingleThreadScheduledExecutor();
            monitor.scheduleAtFixedRate(() -> {
                System.out.println("=== 线程池状态 ===");
                System.out.println("核心线程数: " + executor.getCorePoolSize());
                System.out.println("当前线程数: " + executor.getPoolSize());
                System.out.println("活跃线程数: " + executor.getActiveCount());
                System.out.println("队列大小: " + executor.getQueue().size());
                System.out.println("已完成任务数: " + executor.getCompletedTaskCount());
                System.out.println("总任务数: " + executor.getTaskCount());
                System.out.println();
            }, 0, 1, TimeUnit.SECONDS);

            // 提交一些任务
            for (int i = 0; i < 20; i++) {
                final int taskId = i;
                executor.submit(() -> {
                    try {
                        System.out.println("执行任务 " + taskId);
                        Thread.sleep(2000); // 模拟IO操作
                        System.out.println("完成任务 " + taskId);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    }
                });
            }

            // 运行5秒后关闭
            try {
                Thread.sleep(5000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }

            monitor.shutdown();
            executor.shutdown();

            try {
                // 等待线程池关闭
                executor.awaitTermination(10, TimeUnit.SECONDS);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }

    public static void main(String[] args) {
        System.out.println("=== 异常处理演示 ===");
        TaskExceptionHandling.demonstrateExceptionHandling();

        System.out.println("\n=== 线程池监控演示 ===");
        ThreadPoolMonitoring.monitorThreadPool();
    }
}

=== 异常处理演示 ===
任务执行异常: 模拟任务异常
内部异常处理：任务正常完成

=== 线程池监控演示 ===
=== 线程池状态 ===
核心线程数: 64
当前线程数: 0
活跃线程数: 0
队列大小: 0
已完成任务数: 0
总任务数: 0

执行任务 0
执行任务 1
执行任务 4
执行任务 3
执行任务 6
执行任务 7
执行任务 2
执行任务 5
执行任务 8
执行任务 9
执行任务 10
执行任务 11
执行任务 12
执行任务 13
执行任务 19
执行任务 15
执行任务 16
执行任务 17
执行任务 18
执行任务 14
=== 线程池状态 ===
核心线程数: 64
当前线程数: 20
活跃线程数: 20
队列大小: 0
已完成任务数: 0
总任务数: 20

完成任务 6
完成任务 11
完成任务 4
完成任务 8
完成任务 16
完成任务 12
完成任务 3
完成任务 13
完成任务 7
完成任务 0
完成任务 10
完成任务 1
完成任务 2
完成任务 5
=== 线程池状态 ===
核心线程数: 64
当前线程数: 20
活跃线程数: 6
队列大小: 0
已完成任务数: 14
完成任务 15
完成任务 9
完成任务 19
总任务数: 20

完成任务 17
完成任务 18
完成任务 14
=== 线程池状态 ===
核心线程数: 64
当前线程数: 20
活跃线程数: 0
队列大小: 0
已完成任务数: 20
总任务数: 20

=== 线程池状态 ===
核心线程数: 64
当前线程数: 20
活跃线程数: 0
队列大小: 0
已完成任务数: 20
总任务数: 20


```
