---
title: jvm线程
author: 哪吒
date: '2023-06-15'
---

# jvm线程

JVM线程是Java并发编程的基础，理解JVM线程的实现原理对于编写高性能、线程安全的Java应用程序至关重要。本文将深入探讨JVM线程的底层实现机制、线程模型、状态管理和调度策略。

## 1. JVM线程模型概述

### 1.1 线程的定义与重要性

在JVM中，线程是程序执行的最小单位，每个线程都有自己的程序计数器、虚拟机栈和本地方法栈，但共享堆内存和方法区。

```java
public class ThreadBasicDemo {
    public static void main(String[] args) {
        // 主线程信息
        Thread mainThread = Thread.currentThread();
        System.out.println("主线程名称: " + mainThread.getName());
        System.out.println("主线程ID: " + mainThread.getId());
        System.out.println("主线程状态: " + mainThread.getState());
        System.out.println("主线程优先级: " + mainThread.getPriority());
        
        // 创建新线程
        Thread workerThread = new Thread(() -> {
            System.out.println("工作线程: " + Thread.currentThread().getName());
            System.out.println("工作线程ID: " + Thread.currentThread().getId());
        }, "WorkerThread");
        
        workerThread.start();
        
        try {
            workerThread.join(); // 等待工作线程完成
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
```

### 1.2 JVM线程与操作系统线程的关系

JVM线程的实现依赖于底层操作系统的线程模型：

1. **一对一模型（1:1）**：每个Java线程对应一个操作系统线程
2. **多对一模型（N:1）**：多个Java线程映射到一个操作系统线程
3. **多对多模型（M:N）**：多个Java线程映射到多个操作系统线程

现代JVM主要采用一对一模型，这样可以充分利用多核处理器的优势。

```java
import java.lang.management.ManagementFactory;
import java.lang.management.ThreadMXBean;

public class ThreadModelDemo {
    public static void main(String[] args) {
        ThreadMXBean threadMXBean = ManagementFactory.getThreadMXBean();
        
        System.out.println("当前JVM中的线程数: " + threadMXBean.getThreadCount());
        System.out.println("峰值线程数: " + threadMXBean.getPeakThreadCount());
        System.out.println("守护线程数: " + threadMXBean.getDaemonThreadCount());
        
        // 获取所有线程信息
        long[] threadIds = threadMXBean.getAllThreadIds();
        for (long threadId : threadIds) {
            System.out.println("线程ID: " + threadId + ", 线程名: " + 
                threadMXBean.getThreadInfo(threadId).getThreadName());
        }
    }
}
```

## 2. 线程的内存模型

### 2.1 线程私有内存区域

每个线程都有自己的私有内存区域：

```java
public class ThreadMemoryDemo {
    // 实例变量 - 存储在堆中，线程共享
    private int sharedVariable = 0;
    
    public void demonstrateThreadMemory() {
        // 局部变量 - 存储在线程私有的虚拟机栈中
        int localVariable = 100;
        
        Thread thread1 = new Thread(() -> {
            // 每个线程都有自己的局部变量副本
            int threadLocal = localVariable + 1;
            System.out.println("Thread1 - threadLocal: " + threadLocal);
            
            // 但共享实例变量
            synchronized (this) {
                sharedVariable++;
                System.out.println("Thread1 - sharedVariable: " + sharedVariable);
            }
        });
        
        Thread thread2 = new Thread(() -> {
            int threadLocal = localVariable + 2;
            System.out.println("Thread2 - threadLocal: " + threadLocal);
            
            synchronized (this) {
                sharedVariable++;
                System.out.println("Thread2 - sharedVariable: " + sharedVariable);
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
    
    public static void main(String[] args) {
        new ThreadMemoryDemo().demonstrateThreadMemory();
    }
}
```

### 2.2 程序计数器（PC Register）

程序计数器是线程私有的内存区域，用于存储当前线程正在执行的字节码指令的地址。

```java
public class PCRegisterDemo {
    public static void main(String[] args) {
        Runnable task = () -> {
            for (int i = 0; i < 5; i++) {
                System.out.println(Thread.currentThread().getName() + 
                    " - 执行第 " + i + " 次循环");
                
                // 每个线程都有自己的程序计数器
                // 记录当前执行到哪一条字节码指令
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        };
        
        Thread thread1 = new Thread(task, "Thread-1");
        Thread thread2 = new Thread(task, "Thread-2");
        
        thread1.start();
        thread2.start();
    }
}
```

### 2.3 虚拟机栈（JVM Stack）

虚拟机栈是线程私有的，用于存储局部变量、操作数栈、动态链接和方法返回地址。

```java
public class JVMStackDemo {
    
    public static void main(String[] args) {
        new JVMStackDemo().demonstrateStack();
    }
    
    public void demonstrateStack() {
        // 每个方法调用都会在虚拟机栈中创建一个栈帧
        int localVar = 10; // 局部变量存储在栈帧中
        
        System.out.println("方法开始执行，局部变量: " + localVar);
        
        // 递归调用会在栈中创建多个栈帧
        recursiveMethod(5);
        
        System.out.println("方法执行结束");
    }
    
    private void recursiveMethod(int depth) {
        if (depth <= 0) {
            return;
        }
        
        // 每次递归调用都会创建新的栈帧
        int currentDepth = depth;
        System.out.println("递归深度: " + currentDepth + 
            ", 线程: " + Thread.currentThread().getName());
        
        recursiveMethod(depth - 1);
    }
}
```

## 3. 线程状态与生命周期

### 3.1 Java线程状态

Java线程有六种状态，定义在Thread.State枚举中：

```java
import java.util.concurrent.TimeUnit;

public class ThreadStateDemo {
    
    public static void main(String[] args) throws InterruptedException {
        // 1. NEW状态 - 线程创建但未启动
        Thread newThread = new Thread(() -> {
            try {
                Thread.sleep(2000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }, "NewThread");
        
        System.out.println("创建后的状态: " + newThread.getState()); // NEW
        
        // 2. RUNNABLE状态 - 线程正在运行或准备运行
        newThread.start();
        System.out.println("启动后的状态: " + newThread.getState()); // RUNNABLE
        
        // 3. TIMED_WAITING状态 - 线程等待指定时间
        Thread.sleep(100);
        System.out.println("睡眠中的状态: " + newThread.getState()); // TIMED_WAITING
        
        // 4. WAITING状态演示
        Object lock = new Object();
        Thread waitingThread = new Thread(() -> {
            synchronized (lock) {
                try {
                    lock.wait(); // 进入WAITING状态
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        }, "WaitingThread");
        
        waitingThread.start();
        Thread.sleep(100);
        System.out.println("等待中的状态: " + waitingThread.getState()); // WAITING
        
        // 5. BLOCKED状态演示
        Object blockLock = new Object();
        Thread blockingThread = new Thread(() -> {
            synchronized (blockLock) {
                try {
                    Thread.sleep(3000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        }, "BlockingThread");
        
        Thread blockedThread = new Thread(() -> {
            synchronized (blockLock) { // 尝试获取已被占用的锁
                System.out.println("获得锁");
            }
        }, "BlockedThread");
        
        blockingThread.start();
        Thread.sleep(100);
        blockedThread.start();
        Thread.sleep(100);
        System.out.println("阻塞中的状态: " + blockedThread.getState()); // BLOCKED
        
        // 唤醒等待线程
        synchronized (lock) {
            lock.notify();
        }
        
        // 等待所有线程结束
        newThread.join();
        waitingThread.join();
        blockingThread.join();
        blockedThread.join();
        
        // 6. TERMINATED状态 - 线程执行完毕
        System.out.println("结束后的状态: " + newThread.getState()); // TERMINATED
    }
}
```

### 3.2 线程状态转换图

```java
public class ThreadStateTransitionDemo {
    
    public static void main(String[] args) {
        System.out.println("=== 线程状态转换演示 ===");
        
        // 创建状态监控线程
        Thread monitorThread = new Thread(() -> {
            Thread targetThread = Thread.currentThread();
            
            while (!Thread.currentThread().isInterrupted()) {
                try {
                    Thread.sleep(500);
                    System.out.println("当前状态: " + targetThread.getState());
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        });
        
        // 创建被监控的线程
        Thread targetThread = new Thread(() -> {
            try {
                System.out.println("线程开始执行");
                
                // RUNNABLE -> TIMED_WAITING
                Thread.sleep(1000);
                
                // TIMED_WAITING -> RUNNABLE
                System.out.println("睡眠结束，继续执行");
                
                // 同步块演示
                synchronized (ThreadStateTransitionDemo.class) {
                    Thread.sleep(1000);
                }
                
                System.out.println("线程执行完毕");
                
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                System.out.println("线程被中断");
            }
        }, "TargetThread");
        
        // 启动监控
        monitorThread.start();
        
        try {
            Thread.sleep(100);
            System.out.println("目标线程创建后状态: " + targetThread.getState());
            
            targetThread.start();
            targetThread.join();
            
            System.out.println("目标线程结束后状态: " + targetThread.getState());
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            monitorThread.interrupt();
        }
    }
}
```

## 4. 线程调度机制

### 4.1 线程优先级

JVM使用线程优先级来影响线程调度，但具体的调度策略依赖于操作系统。

```java
public class ThreadPriorityDemo {
    
    public static void main(String[] args) {
        System.out.println("=== 线程优先级演示 ===");
        
        // 创建不同优先级的线程
        Thread lowPriorityThread = new Thread(() -> {
            for (int i = 0; i < 10; i++) {
                System.out.println("低优先级线程: " + i);
                try {
                    Thread.sleep(10);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }, "LowPriorityThread");
        
        Thread normalPriorityThread = new Thread(() -> {
            for (int i = 0; i < 10; i++) {
                System.out.println("普通优先级线程: " + i);
                try {
                    Thread.sleep(10);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }, "NormalPriorityThread");
        
        Thread highPriorityThread = new Thread(() -> {
            for (int i = 0; i < 10; i++) {
                System.out.println("高优先级线程: " + i);
                try {
                    Thread.sleep(10);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }, "HighPriorityThread");
        
        // 设置优先级
        lowPriorityThread.setPriority(Thread.MIN_PRIORITY);     // 1
        normalPriorityThread.setPriority(Thread.NORM_PRIORITY); // 5
        highPriorityThread.setPriority(Thread.MAX_PRIORITY);    // 10
        
        System.out.println("低优先级: " + lowPriorityThread.getPriority());
        System.out.println("普通优先级: " + normalPriorityThread.getPriority());
        System.out.println("高优先级: " + highPriorityThread.getPriority());
        
        // 启动线程
        lowPriorityThread.start();
        normalPriorityThread.start();
        highPriorityThread.start();
        
        try {
            lowPriorityThread.join();
            normalPriorityThread.join();
            highPriorityThread.join();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
```

### 4.2 线程调度策略

```java
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class ThreadSchedulingDemo {
    
    public static void main(String[] args) {
        System.out.println("=== 线程调度策略演示 ===");
        
        // 1. 抢占式调度演示
        demonstratePreemptiveScheduling();
        
        // 2. 时间片轮转演示
        demonstrateTimeSlicing();
        
        // 3. 协作式调度演示
        demonstrateCooperativeScheduling();
    }
    
    // 抢占式调度
    private static void demonstratePreemptiveScheduling() {
        System.out.println("\n--- 抢占式调度 ---");
        
        Thread cpuIntensiveThread = new Thread(() -> {
            long startTime = System.currentTimeMillis();
            while (System.currentTimeMillis() - startTime < 2000) {
                // CPU密集型任务
                Math.sqrt(Math.random());
            }
            System.out.println("CPU密集型线程完成");
        }, "CPUIntensiveThread");
        
        Thread ioThread = new Thread(() -> {
            try {
                for (int i = 0; i < 5; i++) {
                    System.out.println("IO线程执行: " + i);
                    Thread.sleep(200); // 模拟IO操作
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }, "IOThread");
        
        cpuIntensiveThread.start();
        ioThread.start();
        
        try {
            cpuIntensiveThread.join();
            ioThread.join();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
    
    // 时间片轮转
    private static void demonstrateTimeSlicing() {
        System.out.println("\n--- 时间片轮转 ---");
        
        for (int i = 0; i < 3; i++) {
            final int threadId = i;
            Thread thread = new Thread(() -> {
                for (int j = 0; j < 10; j++) {
                    System.out.println("线程" + threadId + " - 执行" + j);
                    // 主动让出CPU，模拟时间片结束
                    Thread.yield();
                }
            }, "Thread-" + i);
            
            thread.start();
        }
    }
    
    // 协作式调度
    private static void demonstrateCooperativeScheduling() {
        System.out.println("\n--- 协作式调度 ---");
        
        Object lock = new Object();
        
        Thread producer = new Thread(() -> {
            synchronized (lock) {
                for (int i = 0; i < 5; i++) {
                    System.out.println("生产者生产: " + i);
                    lock.notify(); // 通知消费者
                    try {
                        if (i < 4) lock.wait(); // 等待消费者
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            }
        }, "Producer");
        
        Thread consumer = new Thread(() -> {
            synchronized (lock) {
                for (int i = 0; i < 5; i++) {
                    try {
                        lock.wait(); // 等待生产者
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                    System.out.println("消费者消费: " + i);
                    lock.notify(); // 通知生产者
                }
            }
        }, "Consumer");
        
        producer.start();
        consumer.start();
        
        try {
            producer.join();
            consumer.join();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
```


