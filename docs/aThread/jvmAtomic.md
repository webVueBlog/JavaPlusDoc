---
title: java原子操作类实现原理
author: 哪吒
date: '2023-06-15'
---

# java原子操作类实现原理

## 1. 原子操作概述

### 1.1 什么是原子操作

原子操作是指不会被线程调度机制打断的操作，这种操作一旦开始，就一直运行到结束，中间不会有任何线程切换。在多线程环境中，原子操作能够保证数据的一致性和线程安全性。

```java
public class AtomicOperationExample {
    
    public static void main(String[] args) throws InterruptedException {
        demonstrateNonAtomicOperation();
        demonstrateAtomicOperation();
    }
    
    // 非原子操作示例
    private static void demonstrateNonAtomicOperation() throws InterruptedException {
        System.out.println("=== 非原子操作演示 ===");
        
        Counter nonAtomicCounter = new Counter();
        
        // 创建多个线程同时操作计数器
        Thread[] threads = new Thread[10];
        for (int i = 0; i < threads.length; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < 1000; j++) {
                    nonAtomicCounter.increment(); // 非原子操作
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
        
        System.out.println("非原子操作结果: " + nonAtomicCounter.getValue());
        System.out.println("期望结果: 10000");
    }
    
    // 原子操作示例
    private static void demonstrateAtomicOperation() throws InterruptedException {
        System.out.println("\n=== 原子操作演示 ===");
        
        AtomicCounter atomicCounter = new AtomicCounter();
        
        // 创建多个线程同时操作原子计数器
        Thread[] threads = new Thread[10];
        for (int i = 0; i < threads.length; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < 1000; j++) {
                    atomicCounter.increment(); // 原子操作
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
        
        System.out.println("原子操作结果: " + atomicCounter.getValue());
        System.out.println("期望结果: 10000");
    }
}

// 非原子计数器
class Counter {
    private int value = 0;
    
    public void increment() {
        value++; // 非原子操作：读取 -> 计算 -> 写入
    }
    
    public int getValue() {
        return value;
    }
}

// 原子计数器
class AtomicCounter {
    private java.util.concurrent.atomic.AtomicInteger value = 
        new java.util.concurrent.atomic.AtomicInteger(0);
    
    public void increment() {
        value.incrementAndGet(); // 原子操作
    }
    
    public int getValue() {
        return value.get();
    }
}
```

### 3.4 字段更新器原子类

字段更新器原子类允许对普通类的volatile字段进行原子操作，无需修改原有类的结构。

```java
import java.util.concurrent.atomic.*;

public class AtomicFieldUpdaterExample {
    
    public static void main(String[] args) throws InterruptedException {
        demonstrateAtomicIntegerFieldUpdater();
        demonstrateAtomicLongFieldUpdater();
        demonstrateAtomicReferenceFieldUpdater();
    }
    
    // AtomicIntegerFieldUpdater演示
    private static void demonstrateAtomicIntegerFieldUpdater() throws InterruptedException {
        System.out.println("=== AtomicIntegerFieldUpdater演示 ===");
        
        // 创建字段更新器
        AtomicIntegerFieldUpdater<Student> scoreUpdater = 
            AtomicIntegerFieldUpdater.newUpdater(Student.class, "score");
        
        Student student = new Student("Alice", 85);
        System.out.println("初始学生信息: " + student);
        
        // 原子更新分数
        int oldScore = scoreUpdater.getAndAdd(student, 10);
        System.out.println("getAndAdd(10) - 旧分数: " + oldScore + ", 新分数: " + student.getScore());
        
        // CAS操作
        boolean casResult = scoreUpdater.compareAndSet(student, 95, 100);
        System.out.println("CAS(95->100)成功: " + casResult + ", 当前分数: " + student.getScore());
        
        // 多线程更新演示
        Student sharedStudent = new Student("Bob", 0);
        Thread[] threads = new Thread[10];
        
        for (int i = 0; i < threads.length; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < 100; j++) {
                    scoreUpdater.incrementAndGet(sharedStudent);
                }
            });
        }
        
        for (Thread thread : threads) {
            thread.start();
        }
        
        for (Thread thread : threads) {
            thread.join();
        }
        
        System.out.println("多线程更新后分数: " + sharedStudent.getScore());
        System.out.println("期望分数: 1000");
    }
    
    // AtomicLongFieldUpdater演示
    private static void demonstrateAtomicLongFieldUpdater() {
        System.out.println("\n=== AtomicLongFieldUpdater演示 ===");
        
        AtomicLongFieldUpdater<Account> balanceUpdater = 
            AtomicLongFieldUpdater.newUpdater(Account.class, "balance");
        
        Account account = new Account("12345", 1000L);
        System.out.println("初始账户: " + account);
        
        // 存款操作
        long newBalance = balanceUpdater.addAndGet(account, 500L);
        System.out.println("存款500后余额: " + newBalance);
        
        // 取款操作（使用CAS确保余额充足）
        long currentBalance = balanceUpdater.get(account);
        long withdrawAmount = 200L;
        
        if (currentBalance >= withdrawAmount) {
            boolean success = balanceUpdater.compareAndSet(account, currentBalance, currentBalance - withdrawAmount);
            if (success) {
                System.out.println("取款" + withdrawAmount + "成功，余额: " + account.getBalance());
            } else {
                System.out.println("取款失败：余额已被其他操作修改");
            }
        } else {
            System.out.println("取款失败：余额不足");
        }
    }
    
    // AtomicReferenceFieldUpdater演示
    private static void demonstrateAtomicReferenceFieldUpdater() {
        System.out.println("\n=== AtomicReferenceFieldUpdater演示 ===");
        
        AtomicReferenceFieldUpdater<Order, OrderStatus> statusUpdater = 
            AtomicReferenceFieldUpdater.newUpdater(Order.class, OrderStatus.class, "status");
        
        Order order = new Order("ORDER-001", OrderStatus.PENDING);
        System.out.println("初始订单: " + order);
        
        // 状态转换：PENDING -> PROCESSING
        boolean success1 = statusUpdater.compareAndSet(order, OrderStatus.PENDING, OrderStatus.PROCESSING);
        System.out.println("状态转换(PENDING->PROCESSING)成功: " + success1 + ", 当前状态: " + order.getStatus());
        
        // 状态转换：PROCESSING -> COMPLETED
        boolean success2 = statusUpdater.compareAndSet(order, OrderStatus.PROCESSING, OrderStatus.COMPLETED);
        System.out.println("状态转换(PROCESSING->COMPLETED)成功: " + success2 + ", 当前状态: " + order.getStatus());
        
        // 尝试非法状态转换：COMPLETED -> PENDING（应该失败）
        boolean success3 = statusUpdater.compareAndSet(order, OrderStatus.COMPLETED, OrderStatus.PENDING);
        System.out.println("状态转换(COMPLETED->PENDING)成功: " + success3 + ", 当前状态: " + order.getStatus());
    }
}

// 学生类
class Student {
    private final String name;
    public volatile int score; // 必须是public volatile字段
    
    public Student(String name, int score) {
        this.name = name;
        this.score = score;
    }
    
    public String getName() {
        return name;
    }
    
    public int getScore() {
        return score;
    }
    
    @Override
    public String toString() {
        return "Student{name='" + name + "', score=" + score + "}";
    }
}

// 账户类
class Account {
    private final String accountNumber;
    public volatile long balance; // 必须是public volatile字段
    
    public Account(String accountNumber, long balance) {
        this.accountNumber = accountNumber;
        this.balance = balance;
    }
    
    public String getAccountNumber() {
        return accountNumber;
    }
    
    public long getBalance() {
        return balance;
    }
    
    @Override
    public String toString() {
        return "Account{accountNumber='" + accountNumber + "', balance=" + balance + "}";
    }
}

// 订单状态枚举
enum OrderStatus {
    PENDING, PROCESSING, COMPLETED, CANCELLED
}

// 订单类
class Order {
    private final String orderId;
    public volatile OrderStatus status; // 必须是public volatile字段
    
    public Order(String orderId, OrderStatus status) {
        this.orderId = orderId;
        this.status = status;
    }
    
    public String getOrderId() {
        return orderId;
    }
    
    public OrderStatus getStatus() {
        return status;
    }
    
    @Override
    public String toString() {
        return "Order{orderId='" + orderId + "', status=" + status + "}";
    }
}
```

### 3.5 高性能原子类（Java 8+）

```java
import java.util.concurrent.atomic.*;
import java.util.concurrent.ThreadLocalRandom;

public class HighPerformanceAtomicExample {
    
    public static void main(String[] args) throws InterruptedException {
        demonstrateLongAdder();
        demonstrateLongAccumulator();
        demonstrateDoubleAdder();
        demonstrateDoubleAccumulator();
        performanceComparison();
    }
    
    // LongAdder演示
    private static void demonstrateLongAdder() {
        System.out.println("=== LongAdder演示 ===");
        
        LongAdder longAdder = new LongAdder();
        
        // 基本操作
        longAdder.add(10);
        longAdder.increment();
        longAdder.add(5);
        
        System.out.println("LongAdder当前值: " + longAdder.sum());
        System.out.println("LongAdder字符串表示: " + longAdder.toString());
        
        // 重置
        longAdder.reset();
        System.out.println("重置后值: " + longAdder.sum());
        
        // 求和并重置
        longAdder.add(100);
        long sumAndReset = longAdder.sumThenReset();
        System.out.println("sumThenReset结果: " + sumAndReset + ", 当前值: " + longAdder.sum());
    }
    
    // LongAccumulator演示
    private static void demonstrateLongAccumulator() {
        System.out.println("\n=== LongAccumulator演示 ===");
        
        // 求最大值的累加器
        LongAccumulator maxAccumulator = new LongAccumulator(Long::max, Long.MIN_VALUE);
        
        maxAccumulator.accumulate(10);
        maxAccumulator.accumulate(5);
        maxAccumulator.accumulate(20);
        maxAccumulator.accumulate(15);
        
        System.out.println("最大值累加器结果: " + maxAccumulator.get());
        
        // 求乘积的累加器
        LongAccumulator productAccumulator = new LongAccumulator((x, y) -> x * y, 1);
        
        productAccumulator.accumulate(2);
        productAccumulator.accumulate(3);
        productAccumulator.accumulate(4);
        
        System.out.println("乘积累加器结果: " + productAccumulator.get());
        
        // 自定义操作：计算平方和
        LongAccumulator squareSumAccumulator = new LongAccumulator((sum, value) -> sum + value * value, 0);
        
        squareSumAccumulator.accumulate(1); // 1^2 = 1
        squareSumAccumulator.accumulate(2); // 2^2 = 4
        squareSumAccumulator.accumulate(3); // 3^2 = 9
        
        System.out.println("平方和累加器结果: " + squareSumAccumulator.get()); // 1 + 4 + 9 = 14
    }
    
    // DoubleAdder演示
    private static void demonstrateDoubleAdder() {
        System.out.println("\n=== DoubleAdder演示 ===");
        
        DoubleAdder doubleAdder = new DoubleAdder();
        
        doubleAdder.add(3.14);
        doubleAdder.add(2.71);
        doubleAdder.add(1.41);
        
        System.out.println("DoubleAdder当前值: " + doubleAdder.sum());
        
        // 重置
        double sumBeforeReset = doubleAdder.sumThenReset();
        System.out.println("sumThenReset结果: " + sumBeforeReset + ", 当前值: " + doubleAdder.sum());
    }
    
    // DoubleAccumulator演示
    private static void demonstrateDoubleAccumulator() {
        System.out.println("\n=== DoubleAccumulator演示 ===");
        
        // 求平均值的累加器（简化版）
        DoubleAccumulator avgAccumulator = new DoubleAccumulator((avg, value) -> (avg + value) / 2, 0.0);
        
        avgAccumulator.accumulate(10.0);
        avgAccumulator.accumulate(20.0);
        avgAccumulator.accumulate(30.0);
        
        System.out.println("平均值累加器结果: " + avgAccumulator.get());
        
        // 求最小值的累加器
        DoubleAccumulator minAccumulator = new DoubleAccumulator(Double::min, Double.MAX_VALUE);
        
        minAccumulator.accumulate(3.14);
        minAccumulator.accumulate(2.71);
        minAccumulator.accumulate(1.41);
        minAccumulator.accumulate(4.67);
        
        System.out.println("最小值累加器结果: " + minAccumulator.get());
    }
    
    // 性能比较
    private static void performanceComparison() throws InterruptedException {
        System.out.println("\n=== 性能比较 ===");
        
        final int THREAD_COUNT = 10;
        final int OPERATIONS_PER_THREAD = 1000000;
        
        // AtomicLong性能测试
        AtomicLong atomicLong = new AtomicLong(0);
        long startTime = System.currentTimeMillis();
        
        Thread[] atomicThreads = new Thread[THREAD_COUNT];
        for (int i = 0; i < THREAD_COUNT; i++) {
            atomicThreads[i] = new Thread(() -> {
                for (int j = 0; j < OPERATIONS_PER_THREAD; j++) {
                    atomicLong.incrementAndGet();
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
        System.out.println("AtomicLong耗时: " + atomicTime + "ms, 结果: " + atomicLong.get());
        
        // LongAdder性能测试
        LongAdder longAdder = new LongAdder();
        startTime = System.currentTimeMillis();
        
        Thread[] adderThreads = new Thread[THREAD_COUNT];
        for (int i = 0; i < THREAD_COUNT; i++) {
            adderThreads[i] = new Thread(() -> {
                for (int j = 0; j < OPERATIONS_PER_THREAD; j++) {
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
        System.out.println("性能提升: " + (atomicTime / (double) adderTime) + "倍");
        
        // 高竞争环境下的性能测试
        demonstrateHighContentionPerformance();
    }
    
    // 高竞争环境性能测试
    private static void demonstrateHighContentionPerformance() throws InterruptedException {
        System.out.println("\n--- 高竞争环境性能测试 ---");
        
        final int THREAD_COUNT = 50;
        final int OPERATIONS_PER_THREAD = 100000;
        
        // AtomicLong在高竞争环境下
        AtomicLong atomicLong = new AtomicLong(0);
        long startTime = System.currentTimeMillis();
        
        Thread[] atomicThreads = new Thread[THREAD_COUNT];
        for (int i = 0; i < THREAD_COUNT; i++) {
            atomicThreads[i] = new Thread(() -> {
                for (int j = 0; j < OPERATIONS_PER_THREAD; j++) {
                    atomicLong.addAndGet(ThreadLocalRandom.current().nextInt(1, 10));
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
        System.out.println("高竞争AtomicLong耗时: " + atomicTime + "ms");
        
        // LongAdder在高竞争环境下
        LongAdder longAdder = new LongAdder();
        startTime = System.currentTimeMillis();
        
        Thread[] adderThreads = new Thread[THREAD_COUNT];
        for (int i = 0; i < THREAD_COUNT; i++) {
            adderThreads[i] = new Thread(() -> {
                for (int j = 0; j < OPERATIONS_PER_THREAD; j++) {
                    longAdder.add(ThreadLocalRandom.current().nextInt(1, 10));
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
        System.out.println("高竞争LongAdder耗时: " + adderTime + "ms");
        System.out.println("高竞争环境性能提升: " + (atomicTime / (double) adderTime) + "倍");
    }
}
```

## 4. 底层实现原理

### 4.1 Unsafe类的作用

原子操作类的底层实现依赖于`sun.misc.Unsafe`类，它提供了直接操作内存的能力。

```java
import sun.misc.Unsafe;
import java.lang.reflect.Field;

public class UnsafeExample {
    
    private static final Unsafe unsafe;
    private static final long valueOffset;
    
    static {
        try {
            // 通过反射获取Unsafe实例
            Field field = Unsafe.class.getDeclaredField("theUnsafe");
            field.setAccessible(true);
            unsafe = (Unsafe) field.get(null);
            
            // 获取value字段的内存偏移量
            valueOffset = unsafe.objectFieldOffset(UnsafeExample.class.getDeclaredField("value"));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
    
    private volatile int value = 0;
    
    public static void main(String[] args) {
        demonstrateUnsafeOperations();
        demonstrateCustomAtomicInteger();
    }
    
    // Unsafe操作演示
    private static void demonstrateUnsafeOperations() {
        System.out.println("=== Unsafe操作演示 ===");
        
        UnsafeExample example = new UnsafeExample();
        
        // 直接内存读取
        int currentValue = unsafe.getIntVolatile(example, valueOffset);
        System.out.println("当前值: " + currentValue);
        
        // 直接内存写入
        unsafe.putIntVolatile(example, valueOffset, 42);
        System.out.println("设置后值: " + example.value);
        
        // CAS操作
        boolean casResult = unsafe.compareAndSwapInt(example, valueOffset, 42, 100);
        System.out.println("CAS(42->100)成功: " + casResult + ", 当前值: " + example.value);
        
        // 获取并增加
        int oldValue = unsafe.getAndAddInt(example, valueOffset, 10);
        System.out.println("getAndAdd(10) - 旧值: " + oldValue + ", 新值: " + example.value);
    }
    
    // 自定义原子整数实现
    private static void demonstrateCustomAtomicInteger() {
        System.out.println("\n=== 自定义原子整数演示 ===");
        
        CustomAtomicInteger customAtomic = new CustomAtomicInteger(0);
        
        System.out.println("初始值: " + customAtomic.get());
        
        customAtomic.set(50);
        System.out.println("设置后: " + customAtomic.get());
        
        int incrementResult = customAtomic.incrementAndGet();
        System.out.println("incrementAndGet: " + incrementResult);
        
        boolean casResult = customAtomic.compareAndSet(51, 100);
        System.out.println("compareAndSet(51->100): " + casResult + ", 当前值: " + customAtomic.get());
    }
}

// 自定义原子整数类
class CustomAtomicInteger {
    private static final Unsafe unsafe;
    private static final long valueOffset;
    
    static {
        try {
            Field field = Unsafe.class.getDeclaredField("theUnsafe");
            field.setAccessible(true);
            unsafe = (Unsafe) field.get(null);
            valueOffset = unsafe.objectFieldOffset(CustomAtomicInteger.class.getDeclaredField("value"));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
    
    private volatile int value;
    
    public CustomAtomicInteger(int initialValue) {
        this.value = initialValue;
    }
    
    public final int get() {
        return value;
    }
    
    public final void set(int newValue) {
        value = newValue;
    }
    
    public final boolean compareAndSet(int expect, int update) {
        return unsafe.compareAndSwapInt(this, valueOffset, expect, update);
    }
    
    public final int getAndIncrement() {
        return unsafe.getAndAddInt(this, valueOffset, 1);
    }
    
    public final int incrementAndGet() {
        return unsafe.getAndAddInt(this, valueOffset, 1) + 1;
    }
    
    public final int addAndGet(int delta) {
        return unsafe.getAndAddInt(this, valueOffset, delta) + delta;
    }
}
```

### 4.2 内存模型与可见性

```java
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

public class MemoryModelExample {
    
    public static void main(String[] args) throws InterruptedException {
        demonstrateVolatileVsAtomic();
        demonstrateMemoryOrdering();
        demonstrateHappensBefore();
    }
    
    // volatile与原子类的可见性比较
    private static void demonstrateVolatileVsAtomic() throws InterruptedException {
        System.out.println("=== volatile与原子类可见性比较 ===");
        
        VolatileCounter volatileCounter = new VolatileCounter();
        AtomicCounter atomicCounter = new AtomicCounter();
        
        // 测试volatile的可见性
        Thread volatileWriter = new Thread(() -> {
            for (int i = 0; i < 1000; i++) {
                volatileCounter.increment();
                try {
                    Thread.sleep(1);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        });
        
        Thread volatileReader = new Thread(() -> {
            int lastValue = 0;
            for (int i = 0; i < 100; i++) {
                int currentValue = volatileCounter.getValue();
                if (currentValue != lastValue) {
                    System.out.println("Volatile读取到新值: " + currentValue);
                    lastValue = currentValue;
                }
                try {
                    Thread.sleep(10);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        });
        
        volatileWriter.start();
        volatileReader.start();
        
        Thread.sleep(2000);
        
        System.out.println("Volatile最终值: " + volatileCounter.getValue());
        System.out.println("Atomic最终值: " + atomicCounter.getValue());
    }
    
    // 内存排序演示
    private static void demonstrateMemoryOrdering() {
        System.out.println("\n=== 内存排序演示 ===");
        
        MemoryOrderingExample example = new MemoryOrderingExample();
        
        // 启动多个线程进行读写操作
        for (int i = 0; i < 5; i++) {
            final int threadId = i;
            new Thread(() -> {
                example.writeData(threadId, "Data-" + threadId);
            }).start();
            
            new Thread(() -> {
                String data = example.readData(threadId);
                if (data != null) {
                    System.out.println("线程" + threadId + "读取到: " + data);
                }
            }).start();
        }
        
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
    
    // happens-before关系演示
    private static void demonstrateHappensBefore() {
        System.out.println("\n=== happens-before关系演示 ===");
        
        HappensBeforeExample example = new HappensBeforeExample();
        
        Thread producer = new Thread(() -> {
            example.produce("重要数据");
        });
        
        Thread consumer = new Thread(() -> {
            String data = example.consume();
            System.out.println("消费者获取到: " + data);
        });
        
        producer.start();
        
        try {
            Thread.sleep(100); // 确保生产者先执行
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        consumer.start();
        
        try {
            producer.join();
            consumer.join();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}

// volatile计数器
class VolatileCounter {
    private volatile int value = 0;
    
    public void increment() {
        value++; // 注意：这不是原子操作
    }
    
    public int getValue() {
        return value;
    }
}

// 原子计数器
class AtomicCounter {
    private final AtomicInteger value = new AtomicInteger(0);
    
    public void increment() {
        value.incrementAndGet();
    }
    
    public int getValue() {
        return value.get();
    }
}

// 内存排序示例
class MemoryOrderingExample {
    private final AtomicReference<String>[] data = new AtomicReference[10];
    private final AtomicInteger writeIndex = new AtomicInteger(0);
    
    public MemoryOrderingExample() {
        for (int i = 0; i < data.length; i++) {
            data[i] = new AtomicReference<>();
        }
    }
    
    public void writeData(int index, String value) {
        if (index < data.length) {
            data[index].set(value);
            writeIndex.set(index + 1); // 原子操作确保可见性
        }
    }
    
    public String readData(int index) {
        if (index < writeIndex.get() && index < data.length) {
            return data[index].get();
        }
        return null;
    }
}

// happens-before关系示例
class HappensBeforeExample {
    private volatile String data;
    private final AtomicInteger flag = new AtomicInteger(0);
    
    public void produce(String value) {
        data = value; // 写入数据
        flag.set(1); // 原子操作建立happens-before关系
        System.out.println("生产者设置数据: " + value);
    }
    
    public String consume() {
        while (flag.get() == 0) {
            // 等待数据准备就绪
            Thread.yield();
        }
        return data; // 由于happens-before关系，这里能看到最新的data值
    }
}
```

## 5. 性能分析与优化

### 5.1 性能特点分析

```java
import java.util.concurrent.atomic.*;
import java.util.concurrent.*;

public class PerformanceAnalysisExample {
    
    public static void main(String[] args) throws InterruptedException {
        analyzeContentionImpact();
        analyzeCacheLineEffect();
        analyzeMemoryFootprint();
    }
    
    // 竞争程度对性能的影响
    private static void analyzeContentionImpact() throws InterruptedException {
        System.out.println("=== 竞争程度对性能的影响分析 ===");
        
        int[] threadCounts = {1, 2, 4, 8, 16, 32};
        final int OPERATIONS_PER_THREAD = 1000000;
        
        for (int threadCount : threadCounts) {
            // AtomicLong测试
            AtomicLong atomicLong = new AtomicLong(0);
            long startTime = System.nanoTime();
            
            Thread[] threads = new Thread[threadCount];
            for (int i = 0; i < threadCount; i++) {
                threads[i] = new Thread(() -> {
                    for (int j = 0; j < OPERATIONS_PER_THREAD; j++) {
                        atomicLong.incrementAndGet();
                    }
                });
            }
            
            for (Thread thread : threads) {
                thread.start();
            }
            
            for (Thread thread : threads) {
                thread.join();
            }
            
            long atomicTime = System.nanoTime() - startTime;
            
            // LongAdder测试
            LongAdder longAdder = new LongAdder();
            startTime = System.nanoTime();
            
            threads = new Thread[threadCount];
            for (int i = 0; i < threadCount; i++) {
                threads[i] = new Thread(() -> {
                    for (int j = 0; j < OPERATIONS_PER_THREAD; j++) {
                        longAdder.increment();
                    }
                });
            }
            
            for (Thread thread : threads) {
                thread.start();
            }
            
            for (Thread thread : threads) {
                thread.join();
            }
            
            long adderTime = System.nanoTime() - startTime;
            
            System.out.printf("线程数: %2d, AtomicLong: %8.2fms, LongAdder: %8.2fms, 性能比: %.2f\n",
                threadCount, atomicTime / 1_000_000.0, adderTime / 1_000_000.0, 
                (double) atomicTime / adderTime);
        }
    }
    
    // 缓存行效应分析
    private static void analyzeCacheLineEffect() throws InterruptedException {
        System.out.println("\n=== 缓存行效应分析 ===");
        
        final int THREAD_COUNT = 4;
        final int OPERATIONS_PER_THREAD = 10000000;
        
        // 紧密排列的原子变量（可能在同一缓存行）
        AtomicLong[] tightArray = new AtomicLong[THREAD_COUNT];
        for (int i = 0; i < THREAD_COUNT; i++) {
            tightArray[i] = new AtomicLong(0);
        }
        
        long startTime = System.nanoTime();
        Thread[] tightThreads = new Thread[THREAD_COUNT];
        
        for (int i = 0; i < THREAD_COUNT; i++) {
            final int index = i;
            tightThreads[i] = new Thread(() -> {
                for (int j = 0; j < OPERATIONS_PER_THREAD; j++) {
                    tightArray[index].incrementAndGet();
                }
            });
        }
        
        for (Thread thread : tightThreads) {
            thread.start();
        }
        
        for (Thread thread : tightThreads) {
            thread.join();
        }
        
        long tightTime = System.nanoTime() - startTime;
        
        // 填充分离的原子变量（避免伪共享）
        PaddedAtomicLong[] paddedArray = new PaddedAtomicLong[THREAD_COUNT];
        for (int i = 0; i < THREAD_COUNT; i++) {
            paddedArray[i] = new PaddedAtomicLong();
        }
        
        startTime = System.nanoTime();
        Thread[] paddedThreads = new Thread[THREAD_COUNT];
        
        for (int i = 0; i < THREAD_COUNT; i++) {
            final int index = i;
            paddedThreads[i] = new Thread(() -> {
                for (int j = 0; j < OPERATIONS_PER_THREAD; j++) {
                    paddedArray[index].incrementAndGet();
                }
            });
        }
        
        for (Thread thread : paddedThreads) {
            thread.start();
        }
        
        for (Thread thread : paddedThreads) {
            thread.join();
        }
        
        long paddedTime = System.nanoTime() - startTime;
        
        System.out.printf("紧密排列耗时: %.2fms\n", tightTime / 1_000_000.0);
        System.out.printf("填充分离耗时: %.2fms\n", paddedTime / 1_000_000.0);
        System.out.printf("性能提升: %.2f倍\n", (double) tightTime / paddedTime);
    }
    
    // 内存占用分析
    private static void analyzeMemoryFootprint() {
        System.out.println("\n=== 内存占用分析 ===");
        
        Runtime runtime = Runtime.getRuntime();
        
        // 测试AtomicInteger内存占用
        runtime.gc();
        long beforeAtomic = runtime.totalMemory() - runtime.freeMemory();
        
        AtomicInteger[] atomicInts = new AtomicInteger[1000000];
        for (int i = 0; i < atomicInts.length; i++) {
            atomicInts[i] = new AtomicInteger(i);
        }
        
        runtime.gc();
        long afterAtomic = runtime.totalMemory() - runtime.freeMemory();
        
        System.out.println("AtomicInteger数组内存占用: " + (afterAtomic - beforeAtomic) / 1024 / 1024 + "MB");
        
        // 测试普通int数组内存占用
        atomicInts = null; // 释放引用
        runtime.gc();
        long beforeInt = runtime.totalMemory() - runtime.freeMemory();
        
        int[] ints = new int[1000000];
        for (int i = 0; i < ints.length; i++) {
            ints[i] = i;
        }
        
        runtime.gc();
        long afterInt = runtime.totalMemory() - runtime.freeMemory();
        
        System.out.println("int数组内存占用: " + (afterInt - beforeInt) / 1024 / 1024 + "MB");
        System.out.println("内存开销比例: " + (double)(afterAtomic - beforeAtomic) / (afterInt - beforeInt));
    }
}

// 填充的原子长整型（避免伪共享）
class PaddedAtomicLong {
    // 前填充
    private long p1, p2, p3, p4, p5, p6, p7;
    private final AtomicLong value = new AtomicLong(0);
    // 后填充
    private long p8, p9, p10, p11, p12, p13, p14;
    
    public long incrementAndGet() {
        return value.incrementAndGet();
    }
    
    public long get() {
        return value.get();
    }
}
```

## 6. 最佳实践与注意事项

### 6.1 选择合适的原子类

```java
import java.util.concurrent.atomic.*;

public class BestPracticesExample {
    
    public static void main(String[] args) {
        demonstrateProperAtomicSelection();
        demonstrateCommonPitfalls();
        demonstrateOptimizationTechniques();
    }
    
    // 正确选择原子类
    private static void demonstrateProperAtomicSelection() {
        System.out.println("=== 正确选择原子类 ===");
        
        // 1. 简单计数器：优先使用LongAdder
        System.out.println("\n1. 计数器场景:");
        LongAdder counter = new LongAdder();
        System.out.println("推荐使用LongAdder进行高并发计数");
        
        // 2. 需要精确值的场景：使用AtomicLong
        System.out.println("\n2. 需要精确值场景:");
        AtomicLong preciseCounter = new AtomicLong(0);
        System.out.println("需要实时精确值时使用AtomicLong");
        
        // 3. 复杂累积操作：使用LongAccumulator
        System.out.println("\n3. 复杂累积操作:");
        LongAccumulator maxTracker = new LongAccumulator(Long::max, Long.MIN_VALUE);
        System.out.println("复杂累积逻辑使用LongAccumulator");
        
        // 4. 对象引用更新：使用AtomicReference
        System.out.println("\n4. 对象引用更新:");
        AtomicReference<String> configRef = new AtomicReference<>("default-config");
        System.out.println("对象引用的原子更新使用AtomicReference");
        
        // 5. 解决ABA问题：使用AtomicStampedReference
        System.out.println("\n5. 解决ABA问题:");
        AtomicStampedReference<String> stampedRef = new AtomicStampedReference<>("initial", 0);
        System.out.println("需要版本控制时使用AtomicStampedReference");
    }
    
    // 常见陷阱
    private static void demonstrateCommonPitfalls() {
        System.out.println("\n=== 常见陷阱与解决方案 ===");
        
        // 陷阱1：复合操作不是原子的
        System.out.println("\n陷阱1: 复合操作不是原子的");
        AtomicInteger atomicInt = new AtomicInteger(0);
        
        // 错误做法
        System.out.println("错误: if (atomicInt.get() == 0) atomicInt.set(1);");
        
        // 正确做法
        boolean success = atomicInt.compareAndSet(0, 1);
        System.out.println("正确: compareAndSet(0, 1) = " + success);
        
        // 陷阱2：过度使用原子类
        System.out.println("\n陷阱2: 过度使用原子类");
        demonstrateOveruseOfAtomics();
        
        // 陷阱3：忽略ABA问题
        System.out.println("\n陷阱3: 忽略ABA问题");
        demonstrateABAProblemSolution();
        
        // 陷阱4：性能误解
        System.out.println("\n陷阱4: 性能误解");
        demonstratePerformanceMisconceptions();
    }
    
    // 过度使用原子类的问题
    private static void demonstrateOveruseOfAtomics() {
        // 错误：为每个字段都使用原子类
        class BadExample {
            private AtomicInteger x = new AtomicInteger(0);
            private AtomicInteger y = new AtomicInteger(0);
            private AtomicReference<String> name = new AtomicReference<>("default");
            
            // 这样的操作仍然不是原子的
            public void badUpdate() {
                x.incrementAndGet();
                y.incrementAndGet();
                name.set("updated");
            }
        }
        
        // 正确：使用适当的同步机制
        class GoodExample {
            private int x = 0;
            private int y = 0;
            private String name = "default";
            
            public synchronized void goodUpdate() {
                x++;
                y++;
                name = "updated";
            }
        }
        
        System.out.println("避免为每个字段都使用原子类，考虑整体同步策略");
    }
    
    // ABA问题解决方案
    private static void demonstrateABAProblemSolution() {
        // 使用版本号解决ABA问题
        AtomicStampedReference<String> versionedRef = new AtomicStampedReference<>("A", 0);
        
        // 模拟ABA操作
        int[] stampHolder = new int[1];
        String value = versionedRef.get(stampHolder);
        int stamp = stampHolder[0];
        
        // 即使值被改回"A"，版本号也会不同
        versionedRef.compareAndSet("A", "B", stamp, stamp + 1);
        versionedRef.compareAndSet("B", "A", stamp + 1, stamp + 2);
        
        // 原始的CAS操作会失败，因为版本号已经改变
        boolean success = versionedRef.compareAndSet(value, "C", stamp, stamp + 1);
        System.out.println("使用版本号避免ABA问题，CAS成功: " + success);
    }
    
    // 性能误解
    private static void demonstratePerformanceMisconceptions() {
        System.out.println("误解1: 原子类总是比synchronized快");
        System.out.println("事实: 在低竞争环境下原子类更快，高竞争时synchronized可能更好");
        
        System.out.println("\n误解2: 所有原子操作性能相同");
        System.out.println("事实: 不同操作有不同的性能特征");
        
        // 演示不同操作的性能差异
        AtomicLong atomicLong = new AtomicLong(0);
        
        long startTime = System.nanoTime();
        for (int i = 0; i < 1000000; i++) {
            atomicLong.get();
        }
        long getTime = System.nanoTime() - startTime;
        
        startTime = System.nanoTime();
        for (int i = 0; i < 1000000; i++) {
            atomicLong.incrementAndGet();
        }
        long incrementTime = System.nanoTime() - startTime;
        
        startTime = System.nanoTime();
        for (int i = 0; i < 1000000; i++) {
            atomicLong.compareAndSet(i, i + 1);
        }
        long casTime = System.nanoTime() - startTime;
        
        System.out.printf("get操作: %.2fms, increment操作: %.2fms, CAS操作: %.2fms\n",
            getTime / 1_000_000.0, incrementTime / 1_000_000.0, casTime / 1_000_000.0);
    }
    
    // 优化技术
    private static void demonstrateOptimizationTechniques() {
        System.out.println("\n=== 优化技术 ===");
        
        // 技术1：批量操作
        System.out.println("\n技术1: 批量操作");
        demonstrateBatchOperations();
        
        // 技术2：减少竞争
        System.out.println("\n技术2: 减少竞争");
        demonstrateContentionReduction();
        
        // 技术3：选择合适的数据结构
        System.out.println("\n技术3: 选择合适的数据结构");
        demonstrateDataStructureSelection();
    }
    
    // 批量操作优化
    private static void demonstrateBatchOperations() {
        LongAdder adder = new LongAdder();
        
        // 不好的做法：频繁的小操作
        long startTime = System.nanoTime();
        for (int i = 0; i < 1000000; i++) {
            adder.increment();
        }
        long individualTime = System.nanoTime() - startTime;
        
        // 更好的做法：批量操作
        adder.reset();
        startTime = System.nanoTime();
        for (int i = 0; i < 10000; i++) {
            adder.add(100); // 批量添加
        }
        long batchTime = System.nanoTime() - startTime;
        
        System.out.printf("单个操作: %.2fms, 批量操作: %.2fms, 性能提升: %.2f倍\n",
            individualTime / 1_000_000.0, batchTime / 1_000_000.0, 
            (double) individualTime / batchTime);
    }
    
    // 减少竞争
    private static void demonstrateContentionReduction() {
        System.out.println("使用ThreadLocal减少竞争:");
        
        // 使用ThreadLocal进行本地累积，最后合并
        ThreadLocal<Long> localCounter = ThreadLocal.withInitial(() -> 0L);
        AtomicLong globalCounter = new AtomicLong(0);
        
        // 在线程本地累积
        localCounter.set(localCounter.get() + 100);
        
        // 定期合并到全局计数器
        globalCounter.addAndGet(localCounter.get());
        localCounter.set(0L);
        
        System.out.println("ThreadLocal策略可以显著减少竞争");
    }
    
    // 数据结构选择
    private static void demonstrateDataStructureSelection() {
        System.out.println("根据使用模式选择数据结构:");
        
        // 频繁更新，偶尔读取：使用LongAdder
        LongAdder frequentUpdate = new LongAdder();
        System.out.println("频繁更新场景: 使用LongAdder");
        
        // 频繁读取，偶尔更新：使用AtomicLong
        AtomicLong frequentRead = new AtomicLong(0);
        System.out.println("频繁读取场景: 使用AtomicLong");
        
        // 复杂状态管理：考虑使用锁
        System.out.println("复杂状态管理: 考虑使用ReentrantLock");
    }
}
```

## 7. 总结

Java原子操作类是并发编程中的重要工具，它们基于CAS机制提供了高性能的线程安全操作。通过本文的深入分析，我们了解了：

### 7.1 核心要点

1. **CAS机制**：原子操作的核心，提供了无锁的线程安全保证
2. **分类体系**：基本类型、数组类型、引用类型、字段更新器、高性能类型
3. **底层实现**：依赖Unsafe类直接操作内存
4. **性能特征**：在不同竞争程度下表现不同

### 7.2 使用建议

1. **选择合适的类型**：根据具体场景选择最适合的原子类
2. **避免常见陷阱**：注意复合操作、ABA问题、过度使用等
3. **性能优化**：考虑批量操作、减少竞争、合适的数据结构
4. **测试验证**：在实际环境中测试性能表现

### 7.3 发展趋势

随着硬件和JVM的发展，原子操作类的性能和功能还在不断改进。Java 9+引入的VarHandle提供了更灵活的内存访问方式，未来可能会有更多高性能的并发工具出现。

原子操作类是现代Java并发编程的基石，掌握其原理和最佳实践对于编写高性能、线程安全的应用程序至关重要。

### 1.2 原子操作的重要性

在多线程环境中，普通的读-修改-写操作不是原子的，可能导致数据竞争和不一致的结果。原子操作类提供了线程安全的操作，避免了使用锁带来的性能开销。

## 2. CAS（Compare-And-Swap）机制

### 2.1 CAS原理

CAS是原子操作类的核心实现机制，它包含三个操作数：
- 内存位置（V）
- 预期原值（A）
- 新值（B）

CAS操作的逻辑是：如果内存位置V的值等于预期原值A，则将该位置更新为新值B，否则不做任何操作。整个过程是原子的。

```java
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

public class CASMechanismExample {
    
    public static void main(String[] args) {
        demonstrateCASOperation();
        demonstrateABAProblems();
        demonstrateCASPerformance();
    }
    
    // CAS操作演示
    private static void demonstrateCASOperation() {
        System.out.println("=== CAS操作演示 ===");
        
        AtomicInteger atomicInt = new AtomicInteger(10);
        
        // CAS成功的情况
        boolean success1 = atomicInt.compareAndSet(10, 20);
        System.out.println("CAS(10->20)成功: " + success1 + ", 当前值: " + atomicInt.get());
        
        // CAS失败的情况
        boolean success2 = atomicInt.compareAndSet(10, 30);
        System.out.println("CAS(10->30)成功: " + success2 + ", 当前值: " + atomicInt.get());
        
        // 正确的CAS操作
        boolean success3 = atomicInt.compareAndSet(20, 30);
        System.out.println("CAS(20->30)成功: " + success3 + ", 当前值: " + atomicInt.get());
    }
    
    // ABA问题演示
    private static void demonstrateABAProblems() {
        System.out.println("\n=== ABA问题演示 ===");
        
        AtomicReference<String> atomicRef = new AtomicReference<>("A");
        
        // 模拟ABA问题
        Thread thread1 = new Thread(() -> {
            String original = atomicRef.get();
            System.out.println("Thread1读取原值: " + original);
            
            // 模拟一些处理时间
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            
            // 尝试CAS操作
            boolean success = atomicRef.compareAndSet(original, "C");
            System.out.println("Thread1 CAS(A->C)成功: " + success + ", 当前值: " + atomicRef.get());
        });
        
        Thread thread2 = new Thread(() -> {
            try {
                Thread.sleep(100); // 确保thread1先读取
                
                // 执行A->B->A的操作
                atomicRef.compareAndSet("A", "B");
                System.out.println("Thread2执行A->B, 当前值: " + atomicRef.get());
                
                atomicRef.compareAndSet("B", "A");
                System.out.println("Thread2执行B->A, 当前值: " + atomicRef.get());
                
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        
        thread1.start();
        thread2.start();
        
        try {
            thread1.join();
            thread2.join();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
    
    // CAS性能演示
    private static void demonstrateCASPerformance() {
        System.out.println("\n=== CAS性能演示 ===");
        
        final int THREAD_COUNT = 10;
        final int OPERATIONS_PER_THREAD = 100000;
        
        // 使用synchronized的计数器
        SynchronizedCounter syncCounter = new SynchronizedCounter();
        long startTime = System.currentTimeMillis();
        
        Thread[] syncThreads = new Thread[THREAD_COUNT];
        for (int i = 0; i < THREAD_COUNT; i++) {
            syncThreads[i] = new Thread(() -> {
                for (int j = 0; j < OPERATIONS_PER_THREAD; j++) {
                    syncCounter.increment();
                }
            });
        }
        
        for (Thread thread : syncThreads) {
            thread.start();
        }
        
        try {
            for (Thread thread : syncThreads) {
                thread.join();
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        long syncTime = System.currentTimeMillis() - startTime;
        System.out.println("Synchronized耗时: " + syncTime + "ms, 结果: " + syncCounter.getValue());
        
        // 使用CAS的计数器
        AtomicInteger casCounter = new AtomicInteger(0);
        startTime = System.currentTimeMillis();
        
        Thread[] casThreads = new Thread[THREAD_COUNT];
        for (int i = 0; i < THREAD_COUNT; i++) {
            casThreads[i] = new Thread(() -> {
                for (int j = 0; j < OPERATIONS_PER_THREAD; j++) {
                    casCounter.incrementAndGet();
                }
            });
        }
        
        for (Thread thread : casThreads) {
            thread.start();
        }
        
        try {
            for (Thread thread : casThreads) {
                thread.join();
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        long casTime = System.currentTimeMillis() - startTime;
        System.out.println("CAS耗时: " + casTime + "ms, 结果: " + casCounter.get());
        System.out.println("性能提升: " + (syncTime / (double) casTime) + "倍");
    }
}

// 使用synchronized的计数器
class SynchronizedCounter {
    private int value = 0;
    
    public synchronized void increment() {
        value++;
    }
    
    public synchronized int getValue() {
        return value;
    }
}
```

### 2.2 CAS的优缺点

**优点：**
- 无锁操作，避免了线程阻塞
- 性能较高，特别是在低竞争环境下
- 避免了死锁问题

**缺点：**
- ABA问题：值被改变后又改回原值
- 循环时间长开销大：高竞争环境下可能导致大量自旋
- 只能保证一个共享变量的原子操作

## 3. 原子类的分类

### 3.1 基本类型原子类

```java
import java.util.concurrent.atomic.*;

public class BasicAtomicTypesExample {
    
    public static void main(String[] args) {
        demonstrateAtomicInteger();
        demonstrateAtomicLong();
        demonstrateAtomicBoolean();
    }
    
    // AtomicInteger演示
    private static void demonstrateAtomicInteger() {
        System.out.println("=== AtomicInteger演示 ===");
        
        AtomicInteger atomicInt = new AtomicInteger(0);
        
        // 基本操作
        System.out.println("初始值: " + atomicInt.get());
        
        // 设置值
        atomicInt.set(10);
        System.out.println("设置后: " + atomicInt.get());
        
        // 获取并设置
        int oldValue = atomicInt.getAndSet(20);
        System.out.println("getAndSet - 旧值: " + oldValue + ", 新值: " + atomicInt.get());
        
        // 增加操作
        int incrementResult = atomicInt.incrementAndGet();
        System.out.println("incrementAndGet: " + incrementResult);
        
        int getAndIncrement = atomicInt.getAndIncrement();
        System.out.println("getAndIncrement - 返回值: " + getAndIncrement + ", 当前值: " + atomicInt.get());
        
        // 加法操作
        int addResult = atomicInt.addAndGet(5);
        System.out.println("addAndGet(5): " + addResult);
        
        // CAS操作
        boolean casResult = atomicInt.compareAndSet(27, 30);
        System.out.println("compareAndSet(27->30): " + casResult + ", 当前值: " + atomicInt.get());
        
        // 弱CAS操作（可能虚假失败）
        boolean weakCasResult = atomicInt.weakCompareAndSet(30, 35);
        System.out.println("weakCompareAndSet(30->35): " + weakCasResult + ", 当前值: " + atomicInt.get());
    }
    
    // AtomicLong演示
    private static void demonstrateAtomicLong() {
        System.out.println("\n=== AtomicLong演示 ===");
        
        AtomicLong atomicLong = new AtomicLong(1000000000L);
        
        System.out.println("初始值: " + atomicLong.get());
        
        // 大数值操作
        long result = atomicLong.addAndGet(2000000000L);
        System.out.println("addAndGet(2000000000): " + result);
        
        // 减法操作
        long decrementResult = atomicLong.decrementAndGet();
        System.out.println("decrementAndGet: " + decrementResult);
        
        // 自定义操作（Java 8+）
        long updateResult = atomicLong.updateAndGet(value -> value * 2);
        System.out.println("updateAndGet(value * 2): " + updateResult);
        
        // 累加操作
        long accumulateResult = atomicLong.accumulateAndGet(1000, (current, update) -> current + update);
        System.out.println("accumulateAndGet(1000, +): " + accumulateResult);
    }
    
    // AtomicBoolean演示
    private static void demonstrateAtomicBoolean() {
        System.out.println("\n=== AtomicBoolean演示 ===");
        
        AtomicBoolean atomicBoolean = new AtomicBoolean(false);
        
        System.out.println("初始值: " + atomicBoolean.get());
        
        // 设置值
        atomicBoolean.set(true);
        System.out.println("设置后: " + atomicBoolean.get());
        
        // 获取并设置
        boolean oldValue = atomicBoolean.getAndSet(false);
        System.out.println("getAndSet - 旧值: " + oldValue + ", 新值: " + atomicBoolean.get());
        
        // CAS操作
        boolean casResult = atomicBoolean.compareAndSet(false, true);
        System.out.println("compareAndSet(false->true): " + casResult + ", 当前值: " + atomicBoolean.get());
        
        // 实际应用：一次性开关
        demonstrateOnceFlag();
    }
    
    // 一次性标志演示
    private static void demonstrateOnceFlag() {
        System.out.println("\n--- 一次性标志演示 ---");
        
        OnceFlag onceFlag = new OnceFlag();
        
        // 多个线程尝试执行
        for (int i = 0; i < 5; i++) {
            final int threadId = i;
            new Thread(() -> {
                if (onceFlag.tryExecute()) {
                    System.out.println("线程 " + threadId + " 成功执行了一次性操作");
                } else {
                    System.out.println("线程 " + threadId + " 未能执行（已被其他线程执行）");
                }
            }).start();
        }
        
        try {
            Thread.sleep(1000); // 等待所有线程完成
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}

// 一次性标志类
class OnceFlag {
    private final AtomicBoolean executed = new AtomicBoolean(false);
    
    public boolean tryExecute() {
        return executed.compareAndSet(false, true);
    }
    
    public boolean isExecuted() {
        return executed.get();
    }
}
```

### 3.2 数组类型原子类

```java
import java.util.concurrent.atomic.*;
import java.util.Arrays;

public class AtomicArrayExample {
    
    public static void main(String[] args) throws InterruptedException {
        demonstrateAtomicIntegerArray();
        demonstrateAtomicLongArray();
        demonstrateAtomicReferenceArray();
    }
    
    // AtomicIntegerArray演示
    private static void demonstrateAtomicIntegerArray() throws InterruptedException {
        System.out.println("=== AtomicIntegerArray演示 ===");
        
        AtomicIntegerArray atomicArray = new AtomicIntegerArray(10);
        
        // 初始化数组
        for (int i = 0; i < atomicArray.length(); i++) {
            atomicArray.set(i, i * 10);
        }
        
        System.out.println("初始数组: " + arrayToString(atomicArray));
        
        // 多线程操作数组
        Thread[] threads = new Thread[5];
        for (int i = 0; i < threads.length; i++) {
            final int threadId = i;
            threads[i] = new Thread(() -> {
                for (int j = 0; j < atomicArray.length(); j++) {
                    // 原子地增加数组元素
                    int newValue = atomicArray.addAndGet(j, threadId + 1);
                    System.out.println("线程" + threadId + "更新索引" + j + "为: " + newValue);
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
        
        System.out.println("最终数组: " + arrayToString(atomicArray));
        
        // CAS操作
        boolean casResult = atomicArray.compareAndSet(0, atomicArray.get(0), 999);
        System.out.println("CAS操作成功: " + casResult + ", 索引0的值: " + atomicArray.get(0));
    }
    
    // AtomicLongArray演示
    private static void demonstrateAtomicLongArray() {
        System.out.println("\n=== AtomicLongArray演示 ===");
        
        long[] initialArray = {1000000000L, 2000000000L, 3000000000L};
        AtomicLongArray atomicLongArray = new AtomicLongArray(initialArray);
        
        System.out.println("初始数组: " + arrayToString(atomicLongArray));
        
        // 各种操作
        long oldValue = atomicLongArray.getAndSet(1, 5000000000L);
        System.out.println("getAndSet索引1 - 旧值: " + oldValue + ", 新值: " + atomicLongArray.get(1));
        
        long incrementResult = atomicLongArray.incrementAndGet(2);
        System.out.println("incrementAndGet索引2: " + incrementResult);
        
        // 使用函数式操作（Java 8+）
        long updateResult = atomicLongArray.updateAndGet(0, value -> value / 2);
        System.out.println("updateAndGet索引0(除以2): " + updateResult);
        
        System.out.println("最终数组: " + arrayToString(atomicLongArray));
    }
    
    // AtomicReferenceArray演示
    private static void demonstrateAtomicReferenceArray() {
        System.out.println("\n=== AtomicReferenceArray演示 ===");
        
        AtomicReferenceArray<String> atomicRefArray = new AtomicReferenceArray<>(5);
        
        // 初始化
        for (int i = 0; i < atomicRefArray.length(); i++) {
            atomicRefArray.set(i, "Item-" + i);
        }
        
        System.out.println("初始数组: " + refArrayToString(atomicRefArray));
        
        // 原子更新
        String oldRef = atomicRefArray.getAndSet(2, "Updated-Item-2");
        System.out.println("getAndSet索引2 - 旧值: " + oldRef + ", 新值: " + atomicRefArray.get(2));
        
        // CAS操作
        boolean casResult = atomicRefArray.compareAndSet(0, "Item-0", "CAS-Updated-Item-0");
        System.out.println("CAS操作成功: " + casResult + ", 索引0的值: " + atomicRefArray.get(0));
        
        // 函数式更新
        String updateResult = atomicRefArray.updateAndGet(1, value -> value.toUpperCase());
        System.out.println("updateAndGet索引1(转大写): " + updateResult);
        
        System.out.println("最终数组: " + refArrayToString(atomicRefArray));
    }
    
    // 辅助方法：将AtomicIntegerArray转换为字符串
    private static String arrayToString(AtomicIntegerArray array) {
        int[] result = new int[array.length()];
        for (int i = 0; i < array.length(); i++) {
            result[i] = array.get(i);
        }
        return Arrays.toString(result);
    }
    
    // 辅助方法：将AtomicLongArray转换为字符串
    private static String arrayToString(AtomicLongArray array) {
        long[] result = new long[array.length()];
        for (int i = 0; i < array.length(); i++) {
            result[i] = array.get(i);
        }
        return Arrays.toString(result);
    }
    
    // 辅助方法：将AtomicReferenceArray转换为字符串
    private static String refArrayToString(AtomicReferenceArray<String> array) {
        String[] result = new String[array.length()];
        for (int i = 0; i < array.length(); i++) {
            result[i] = array.get(i);
        }
        return Arrays.toString(result);
    }
}
```

### 3.3 引用类型原子类

```java
import java.util.concurrent.atomic.*;

public class AtomicReferenceExample {
    
    public static void main(String[] args) {
        demonstrateAtomicReference();
        demonstrateAtomicStampedReference();
        demonstrateAtomicMarkableReference();
    }
    
    // AtomicReference演示
    private static void demonstrateAtomicReference() {
        System.out.println("=== AtomicReference演示 ===");
        
        AtomicReference<Person> atomicPerson = new AtomicReference<>();
        
        // 初始设置
        Person initialPerson = new Person("Alice", 25);
        atomicPerson.set(initialPerson);
        System.out.println("初始人员: " + atomicPerson.get());
        
        // 原子更新
        Person newPerson = new Person("Bob", 30);
        Person oldPerson = atomicPerson.getAndSet(newPerson);
        System.out.println("getAndSet - 旧值: " + oldPerson + ", 新值: " + atomicPerson.get());
        
        // CAS操作
        Person anotherPerson = new Person("Charlie", 35);
        boolean casResult = atomicPerson.compareAndSet(newPerson, anotherPerson);
        System.out.println("CAS操作成功: " + casResult + ", 当前值: " + atomicPerson.get());
        
        // 函数式更新
        Person updatedPerson = atomicPerson.updateAndGet(person -> 
            new Person(person.getName(), person.getAge() + 1));
        System.out.println("updateAndGet(年龄+1): " + updatedPerson);
        
        // 累加操作
        Person accumulatedPerson = atomicPerson.accumulateAndGet(
            new Person("Suffix", 5),
            (current, update) -> new Person(
                current.getName() + "-" + update.getName(),
                current.getAge() + update.getAge()
            )
        );
        System.out.println("accumulateAndGet: " + accumulatedPerson);
    }
    
    // AtomicStampedReference演示（解决ABA问题）
    private static void demonstrateAtomicStampedReference() {
        System.out.println("\n=== AtomicStampedReference演示 ===");
        
        AtomicStampedReference<String> atomicStampedRef = 
            new AtomicStampedReference<>("Initial", 0);
        
        // 获取当前值和版本号
        int[] stampHolder = new int[1];
        String currentValue = atomicStampedRef.get(stampHolder);
        System.out.println("当前值: " + currentValue + ", 版本号: " + stampHolder[0]);
        
        // 带版本号的CAS操作
        boolean casResult1 = atomicStampedRef.compareAndSet(
            "Initial", "Updated", 0, 1);
        System.out.println("CAS(Initial->Updated, 0->1)成功: " + casResult1);
        
        // 获取更新后的值和版本号
        currentValue = atomicStampedRef.get(stampHolder);
        System.out.println("更新后值: " + currentValue + ", 版本号: " + stampHolder[0]);
        
        // 使用错误版本号的CAS操作（应该失败）
        boolean casResult2 = atomicStampedRef.compareAndSet(
            "Updated", "Failed", 0, 2);
        System.out.println("CAS(Updated->Failed, 0->2)成功: " + casResult2);
        
        // 使用正确版本号的CAS操作
        boolean casResult3 = atomicStampedRef.compareAndSet(
            "Updated", "Success", 1, 2);
        System.out.println("CAS(Updated->Success, 1->2)成功: " + casResult3);
        
        // 最终状态
        currentValue = atomicStampedRef.get(stampHolder);
        System.out.println("最终值: " + currentValue + ", 版本号: " + stampHolder[0]);
        
        // 演示ABA问题的解决
        demonstrateABASolution();
    }
    
    // ABA问题解决方案演示
    private static void demonstrateABASolution() {
        System.out.println("\n--- ABA问题解决方案 ---");
        
        AtomicStampedReference<String> atomicStampedRef = 
            new AtomicStampedReference<>("A", 0);
        
        Thread thread1 = new Thread(() -> {
            int[] stampHolder = new int[1];
            String value = atomicStampedRef.get(stampHolder);
            int stamp = stampHolder[0];
            
            System.out.println("Thread1读取: 值=" + value + ", 版本=" + stamp);
            
            try {
                Thread.sleep(1000); // 模拟处理时间
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            
            // 尝试CAS操作
            boolean success = atomicStampedRef.compareAndSet(value, "C", stamp, stamp + 1);
            System.out.println("Thread1 CAS(A->C)成功: " + success);
        });
        
        Thread thread2 = new Thread(() -> {
            try {
                Thread.sleep(100); // 确保thread1先读取
                
                // 执行A->B->A操作，但版本号会变化
                atomicStampedRef.compareAndSet("A", "B", 0, 1);
                System.out.println("Thread2执行A->B");
                
                atomicStampedRef.compareAndSet("B", "A", 1, 2);
                System.out.println("Thread2执行B->A");
                
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        
        thread1.start();
        thread2.start();
        
        try {
            thread1.join();
            thread2.join();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        int[] finalStampHolder = new int[1];
        String finalValue = atomicStampedRef.get(finalStampHolder);
        System.out.println("最终状态: 值=" + finalValue + ", 版本=" + finalStampHolder[0]);
    }
    
    // AtomicMarkableReference演示
    private static void demonstrateAtomicMarkableReference() {
        System.out.println("\n=== AtomicMarkableReference演示 ===");
        
        AtomicMarkableReference<String> atomicMarkableRef = 
            new AtomicMarkableReference<>("Initial", false);
        
        // 获取当前值和标记
        boolean[] markHolder = new boolean[1];
        String currentValue = atomicMarkableRef.get(markHolder);
        System.out.println("当前值: " + currentValue + ", 标记: " + markHolder[0]);
        
        // 带标记的CAS操作
        boolean casResult1 = atomicMarkableRef.compareAndSet(
            "Initial", "Marked", false, true);
        System.out.println("CAS(Initial->Marked, false->true)成功: " + casResult1);
        
        // 获取更新后的值和标记
        currentValue = atomicMarkableRef.get(markHolder);
        System.out.println("更新后值: " + currentValue + ", 标记: " + markHolder[0]);
        
        // 仅尝试设置标记
        boolean markResult = atomicMarkableRef.attemptMark("Marked", false);
        System.out.println("attemptMark(false)成功: " + markResult);
        
        // 检查是否被标记
        boolean isMarked = atomicMarkableRef.isMarked();
        System.out.println("当前是否被标记: " + isMarked);
        
        // 实际应用：逻辑删除
        demonstrateLogicalDeletion();
    }
    
    // 逻辑删除演示
    private static void demonstrateLogicalDeletion() {
        System.out.println("\n--- 逻辑删除演示 ---");
        
        LogicalDeletionList<String> list = new LogicalDeletionList<>();
        
        // 添加元素
        list.add("Element1");
        list.add("Element2");
        list.add("Element3");
        
        System.out.println("添加元素后: " + list.getActiveElements());
        
        // 逻辑删除
        boolean deleted = list.logicalDelete("Element2");
        System.out.println("逻辑删除Element2成功: " + deleted);
        System.out.println("活跃元素: " + list.getActiveElements());
        System.out.println("所有元素: " + list.getAllElements());
    }
}

// Person类
class Person {
    private final String name;
    private final int age;
    
    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }
    
    public String getName() {
        return name;
    }
    
    public int getAge() {
        return age;
    }
    
    @Override
    public String toString() {
        return "Person{name='" + name + "', age=" + age + "}";
    }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        Person person = (Person) obj;
        return age == person.age && java.util.Objects.equals(name, person.name);
    }
    
    @Override
    public int hashCode() {
        return java.util.Objects.hash(name, age);
    }
}

// 逻辑删除列表
class LogicalDeletionList<T> {
    private final java.util.List<AtomicMarkableReference<T>> elements = 
        new java.util.concurrent.CopyOnWriteArrayList<>();
    
    public void add(T element) {
        elements.add(new AtomicMarkableReference<>(element, false));
    }
    
    public boolean logicalDelete(T element) {
        for (AtomicMarkableReference<T> ref : elements) {
            boolean[] markHolder = new boolean[1];
            T value = ref.get(markHolder);
            
            if (!markHolder[0] && element.equals(value)) {
                return ref.attemptMark(value, true);
            }
        }
        return false;
    }
    
    public java.util.List<T> getActiveElements() {
        java.util.List<T> activeElements = new java.util.ArrayList<>();
        for (AtomicMarkableReference<T> ref : elements) {
            boolean[] markHolder = new boolean[1];
            T value = ref.get(markHolder);
            if (!markHolder[0]) {
                activeElements.add(value);
            }
        }
        return activeElements;
    }
    
    public java.util.List<T> getAllElements() {
        java.util.List<T> allElements = new java.util.ArrayList<>();
        for (AtomicMarkableReference<T> ref : elements) {
            boolean[] markHolder = new boolean[1];
            T value = ref.get(markHolder);
            allElements.add(value);
        }
        return allElements;
    }
}
```


