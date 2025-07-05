---
title: java线程池实现原理
author: 哪吒
date: '2023-06-15'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

# Java线程池实现原理

## 1. 线程池概述

### 1.1 什么是线程池

线程池（Thread Pool）是一种多线程处理形式，预先创建若干个线程，这些线程在没有任务处理时处于等待状态，当有任务来临时分配给其中的一个线程来处理，当处理完后又回到等待状态等待下一个任务。

### 1.2 为什么要使用线程池

```
传统方式创建线程的问题：
┌─────────────────────────────────────┐
│  每次需要执行任务时创建新线程        │
│  ↓                                 │
│  线程执行完任务后被销毁              │
│  ↓                                 │
│  频繁创建和销毁线程开销大            │
│  ↓                                 │
│  无法控制线程数量，可能导致系统崩溃   │
└─────────────────────────────────────┘

线程池的优势：
┌─────────────────────────────────────┐
│  ✓ 降低资源消耗                     │
│  ✓ 提高响应速度                     │
│  ✓ 提高线程的可管理性                │
│  ✓ 提供更多更强大的功能              │
└─────────────────────────────────────┘
```

## 2. 线程池核心参数

### 2.1 ThreadPoolExecutor构造参数

```java
public ThreadPoolExecutor(int corePoolSize,
                          int maximumPoolSize,
                          long keepAliveTime,
                          TimeUnit unit,
                          BlockingQueue<Runnable> workQueue,
                          ThreadFactory threadFactory,
                          RejectedExecutionHandler handler)
```

### 2.2 参数详解

| 参数 | 说明 | 作用 |
|------|------|------|
| **corePoolSize** | 核心线程数 | 线程池中始终保持的线程数量 |
| **maximumPoolSize** | 最大线程数 | 线程池中允许的最大线程数量 |
| **keepAliveTime** | 线程空闲时间 | 非核心线程空闲时的存活时间 |
| **unit** | 时间单位 | keepAliveTime的时间单位 |
| **workQueue** | 工作队列 | 存储等待执行任务的队列 |
| **threadFactory** | 线程工厂 | 创建新线程的工厂 |
| **handler** | 拒绝策略 | 当线程池和队列都满时的处理策略 |

### 2.3 参数关系图解

```
线程池执行流程：
┌─────────────────────────────────────────────────────────┐
│                    提交任务                              │
│                      ↓                                 │
│              核心线程数是否已满？                        │
│                ↙        ↘                              │
│              否          是                             │
│              ↓           ↓                             │
│          创建核心线程    工作队列是否已满？               │
│          执行任务        ↙        ↘                     │
│                        否          是                   │
│                        ↓           ↓                   │
│                    加入队列    最大线程数是否已满？       │
│                              ↙        ↘                │
│                            否          是               │
│                            ↓           ↓               │
│                      创建非核心线程   执行拒绝策略       │
│                      执行任务                           │
└─────────────────────────────────────────────────────────┘
```

## 3. 工作队列类型

### 3.1 常用队列类型

```java
// 1. ArrayBlockingQueue - 有界队列
BlockingQueue<Runnable> queue1 = new ArrayBlockingQueue<>(100);

// 2. LinkedBlockingQueue - 无界队列（默认Integer.MAX_VALUE）
BlockingQueue<Runnable> queue2 = new LinkedBlockingQueue<>();

// 3. SynchronousQueue - 同步队列
BlockingQueue<Runnable> queue3 = new SynchronousQueue<>();

// 4. PriorityBlockingQueue - 优先级队列
BlockingQueue<Runnable> queue4 = new PriorityBlockingQueue<>();

// 5. DelayQueue - 延迟队列
BlockingQueue<Runnable> queue5 = new DelayQueue<>();
```

### 3.2 队列特性对比

| 队列类型 | 容量 | 特点 | 适用场景 |
|----------|------|------|----------|
| **ArrayBlockingQueue** | 有界 | 基于数组，FIFO | 资源有限，需要控制内存使用 |
| **LinkedBlockingQueue** | 无界 | 基于链表，FIFO | 任务量不确定，但要避免拒绝 |
| **SynchronousQueue** | 0 | 直接传递 | 任务量大，希望直接处理 |
| **PriorityBlockingQueue** | 无界 | 优先级排序 | 任务有优先级要求 |
| **DelayQueue** | 无界 | 延迟执行 | 定时任务场景 |

## 4. 拒绝策略

### 4.1 内置拒绝策略

```java
// 1. AbortPolicy - 抛出异常（默认）
RejectedExecutionHandler abort = new ThreadPoolExecutor.AbortPolicy();

// 2. CallerRunsPolicy - 调用者运行
RejectedExecutionHandler caller = new ThreadPoolExecutor.CallerRunsPolicy();

// 3. DiscardPolicy - 丢弃任务
RejectedExecutionHandler discard = new ThreadPoolExecutor.DiscardPolicy();

// 4. DiscardOldestPolicy - 丢弃最老任务
RejectedExecutionHandler discardOldest = new ThreadPoolExecutor.DiscardOldestPolicy();
```

### 4.2 自定义拒绝策略

```java
public class CustomRejectedExecutionHandler implements RejectedExecutionHandler {
    @Override
    public void rejectedExecution(Runnable r, ThreadPoolExecutor executor) {
        // 记录日志
        System.err.println("任务被拒绝: " + r.toString());
        
        // 可以选择：
        // 1. 保存到数据库或文件
        // 2. 发送到消息队列
        // 3. 降级处理
        // 4. 通知监控系统
        
        // 示例：保存到备用队列
        saveToBackupQueue(r);
    }
    
    private void saveToBackupQueue(Runnable task) {
        // 实现备用处理逻辑
        System.out.println("任务已保存到备用队列");
    }
}
```

## 5. 线程池状态

### 5.1 线程池生命周期

```
线程池状态转换图：
┌─────────────────────────────────────────────────────────┐
│                                                         │
│    RUNNING ──────shutdown()─────→ SHUTDOWN              │
│       │                              │                 │
│       │                              │                 │
│  shutdownNow()                   队列为空且             │
│       │                        活跃线程为0              │
│       ↓                              ↓                 │
│     STOP ──────队列为空且─────→ TIDYING ──terminated()─→│
│              活跃线程为0              │                 │
│                                      ↓                 │
│                                 TERMINATED              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 5.2 状态详解

```java
// 线程池状态常量
private static final int RUNNING    = -1 << COUNT_BITS;  // 接受新任务，处理队列任务
private static final int SHUTDOWN   =  0 << COUNT_BITS;  // 不接受新任务，处理队列任务
private static final int STOP       =  1 << COUNT_BITS;  // 不接受新任务，不处理队列任务
private static final int TIDYING    =  2 << COUNT_BITS;  // 所有任务终止，线程数为0
private static final int TERMINATED =  3 << COUNT_BITS;  // terminated()方法执行完成
```

## 6. 核心源码分析

### 6.1 execute方法源码分析

```java
public void execute(Runnable command) {
    if (command == null)
        throw new NullPointerException();
    
    // 获取当前线程池状态和线程数
    int c = ctl.get();
    
    // 1. 如果当前线程数 < 核心线程数，创建核心线程
    if (workerCountOf(c) < corePoolSize) {
        if (addWorker(command, true))
            return;
        c = ctl.get();
    }
    
    // 2. 如果线程池运行中且任务成功加入队列
    if (isRunning(c) && workQueue.offer(command)) {
        int recheck = ctl.get();
        // 双重检查：如果线程池不是运行状态，移除任务并拒绝
        if (!isRunning(recheck) && remove(command))
            reject(command);
        // 如果没有工作线程，创建一个
        else if (workerCountOf(recheck) == 0)
            addWorker(null, false);
    }
    // 3. 队列满了，尝试创建非核心线程
    else if (!addWorker(command, false))
        // 创建失败，执行拒绝策略
        reject(command);
}
```

### 6.2 addWorker方法分析

```java
private boolean addWorker(Runnable firstTask, boolean core) {
    retry:
    for (;;) {
        int c = ctl.get();
        int rs = runStateOf(c);
        
        // 检查线程池状态
        if (rs >= SHUTDOWN &&
            ! (rs == SHUTDOWN &&
               firstTask == null &&
               ! workQueue.isEmpty()))
            return false;
        
        for (;;) {
            int wc = workerCountOf(c);
            // 检查线程数是否超限
            if (wc >= CAPACITY ||
                wc >= (core ? corePoolSize : maximumPoolSize))
                return false;
            // CAS增加线程数
            if (compareAndIncrementWorkerCount(c))
                break retry;
            c = ctl.get();
            if (runStateOf(c) != rs)
                continue retry;
        }
    }
    
    boolean workerStarted = false;
    boolean workerAdded = false;
    Worker w = null;
    try {
        // 创建Worker
        w = new Worker(firstTask);
        final Thread t = w.thread;
        if (t != null) {
            final ReentrantLock mainLock = this.mainLock;
            mainLock.lock();
            try {
                // 再次检查线程池状态
                int rs = runStateOf(ctl.get());
                if (rs < SHUTDOWN ||
                    (rs == SHUTDOWN && firstTask == null)) {
                    if (t.isAlive())
                        throw new IllegalThreadStateException();
                    // 添加到工作线程集合
                    workers.add(w);
                    int s = workers.size();
                    if (s > largestPoolSize)
                        largestPoolSize = s;
                    workerAdded = true;
                }
            } finally {
                mainLock.unlock();
            }
            if (workerAdded) {
                // 启动线程
                t.start();
                workerStarted = true;
            }
        }
    } finally {
        if (!workerStarted)
            addWorkerFailed(w);
    }
    return workerStarted;
}
```

### 6.3 Worker内部类

```java
private final class Worker extends AbstractQueuedSynchronizer implements Runnable {
    final Thread thread;
    Runnable firstTask;
    volatile long completedTasks;
    
    Worker(Runnable firstTask) {
        setState(-1); // 禁止中断直到runWorker
        this.firstTask = firstTask;
        this.thread = getThreadFactory().newThread(this);
    }
    
    public void run() {
        runWorker(this);
    }
    
    // AQS方法实现
    protected boolean isHeldExclusively() {
        return getState() != 0;
    }
    
    protected boolean tryAcquire(int unused) {
        if (compareAndSetState(0, 1)) {
            setExclusiveOwnerThread(Thread.currentThread());
            return true;
        }
        return false;
    }
    
    protected boolean tryRelease(int unused) {
        setExclusiveOwnerThread(null);
        setState(0);
        return true;
    }
}
```

### 6.4 runWorker方法

```java
final void runWorker(Worker w) {
    Thread wt = Thread.currentThread();
    Runnable task = w.firstTask;
    w.firstTask = null;
    w.unlock(); // 允许中断
    boolean completedAbruptly = true;
    try {
        // 循环获取任务执行
        while (task != null || (task = getTask()) != null) {
            w.lock();
            // 检查线程池状态，决定是否中断
            if ((runStateAtLeast(ctl.get(), STOP) ||
                 (Thread.interrupted() &&
                  runStateAtLeast(ctl.get(), STOP))) &&
                !wt.isInterrupted())
                wt.interrupt();
            try {
                beforeExecute(wt, task);
                Throwable thrown = null;
                try {
                    task.run(); // 执行任务
                } catch (RuntimeException x) {
                    thrown = x; throw x;
                } catch (Error x) {
                    thrown = x; throw x;
                } catch (Throwable x) {
                    thrown = x; throw new Error(x);
                } finally {
                    afterExecute(task, thrown);
                }
            } finally {
                task = null;
                w.completedTasks++;
                w.unlock();
            }
        }
        completedAbruptly = false;
    } finally {
        processWorkerExit(w, completedAbruptly);
    }
}
```

## 7. 实际应用示例

### 7.1 基础使用示例

```java
public class ThreadPoolExample {
    public static void main(String[] args) {
        // 创建线程池
        ThreadPoolExecutor executor = new ThreadPoolExecutor(
            2,                                    // 核心线程数
            4,                                    // 最大线程数
            60L,                                  // 空闲时间
            TimeUnit.SECONDS,                     // 时间单位
            new ArrayBlockingQueue<>(10),         // 工作队列
            new ThreadFactory() {                 // 线程工厂
                private AtomicInteger threadNumber = new AtomicInteger(1);
                @Override
                public Thread newThread(Runnable r) {
                    Thread t = new Thread(r, "MyThread-" + threadNumber.getAndIncrement());
                    t.setDaemon(false);
                    return t;
                }
            },
            new ThreadPoolExecutor.CallerRunsPolicy() // 拒绝策略
        );
        
        // 提交任务
        for (int i = 0; i < 20; i++) {
            final int taskId = i;
            executor.execute(() -> {
                System.out.println("执行任务 " + taskId + 
                    " - 线程: " + Thread.currentThread().getName());
                try {
                    Thread.sleep(2000); // 模拟任务执行
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
}
```

### 7.2 监控线程池状态

```java
public class ThreadPoolMonitor {
    private final ThreadPoolExecutor executor;
    private final ScheduledExecutorService monitor;
    
    public ThreadPoolMonitor(ThreadPoolExecutor executor) {
        this.executor = executor;
        this.monitor = Executors.newScheduledThreadPool(1);
    }
    
    public void startMonitoring() {
        monitor.scheduleAtFixedRate(() -> {
            System.out.println("=== 线程池状态监控 ===");
            System.out.println("核心线程数: " + executor.getCorePoolSize());
            System.out.println("最大线程数: " + executor.getMaximumPoolSize());
            System.out.println("当前线程数: " + executor.getPoolSize());
            System.out.println("活跃线程数: " + executor.getActiveCount());
            System.out.println("队列大小: " + executor.getQueue().size());
            System.out.println("已完成任务数: " + executor.getCompletedTaskCount());
            System.out.println("总任务数: " + executor.getTaskCount());
            System.out.println("是否关闭: " + executor.isShutdown());
            System.out.println("是否终止: " + executor.isTerminated());
            System.out.println("========================\n");
        }, 0, 5, TimeUnit.SECONDS);
    }
    
    public void stopMonitoring() {
        monitor.shutdown();
    }
}
```

### 7.3 优雅关闭线程池

```java
public class GracefulShutdown {
    public static void shutdownThreadPool(ExecutorService executor) {
        executor.shutdown(); // 不再接受新任务
        
        try {
            // 等待已提交任务完成
            if (!executor.awaitTermination(60, TimeUnit.SECONDS)) {
                System.out.println("强制关闭线程池");
                executor.shutdownNow(); // 强制关闭
                
                // 等待任务响应中断
                if (!executor.awaitTermination(60, TimeUnit.SECONDS)) {
                    System.err.println("线程池未能正常关闭");
                }
            }
        } catch (InterruptedException e) {
            System.out.println("关闭过程被中断，强制关闭");
            executor.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }
}
```

## 8. 最佳实践

### 8.1 参数配置建议

```java
public class ThreadPoolBestPractices {
    
    // CPU密集型任务
    public static ThreadPoolExecutor createCpuIntensivePool() {
        int cpuCount = Runtime.getRuntime().availableProcessors();
        return new ThreadPoolExecutor(
            cpuCount,                           // 核心线程数 = CPU核数
            cpuCount,                           // 最大线程数 = CPU核数
            0L, TimeUnit.MILLISECONDS,          // 无需保持空闲线程
            new LinkedBlockingQueue<>(100),     // 有界队列
            new ThreadFactory() {
                private AtomicInteger counter = new AtomicInteger(1);
                @Override
                public Thread newThread(Runnable r) {
                    return new Thread(r, "CPU-Worker-" + counter.getAndIncrement());
                }
            },
            new ThreadPoolExecutor.CallerRunsPolicy()
        );
    }
    
    // IO密集型任务
    public static ThreadPoolExecutor createIoIntensivePool() {
        int cpuCount = Runtime.getRuntime().availableProcessors();
        return new ThreadPoolExecutor(
            cpuCount * 2,                       // 核心线程数 = CPU核数 * 2
            cpuCount * 4,                       // 最大线程数 = CPU核数 * 4
            60L, TimeUnit.SECONDS,              // 空闲线程保持60秒
            new LinkedBlockingQueue<>(200),     // 较大的队列
            new ThreadFactory() {
                private AtomicInteger counter = new AtomicInteger(1);
                @Override
                public Thread newThread(Runnable r) {
                    Thread t = new Thread(r, "IO-Worker-" + counter.getAndIncrement());
                    t.setDaemon(false);
                    return t;
                }
            },
            new ThreadPoolExecutor.CallerRunsPolicy()
        );
    }
    
    // 混合型任务
    public static ThreadPoolExecutor createMixedPool() {
        int cpuCount = Runtime.getRuntime().availableProcessors();
        return new ThreadPoolExecutor(
            cpuCount + 1,                       // 核心线程数 = CPU核数 + 1
            cpuCount * 2 + 1,                   // 最大线程数 = (CPU核数 + 1) * 2
            60L, TimeUnit.SECONDS,
            new ArrayBlockingQueue<>(150),
            Executors.defaultThreadFactory(),
            new ThreadPoolExecutor.AbortPolicy()
        );
    }
}
```

### 8.2 常见问题和解决方案

```java
public class ThreadPoolTroubleshooting {
    
    // 问题1：内存泄漏
    public static void avoidMemoryLeak() {
        ThreadPoolExecutor executor = new ThreadPoolExecutor(
            2, 4, 60L, TimeUnit.SECONDS,
            new LinkedBlockingQueue<>(10),  // 使用有界队列
            Executors.defaultThreadFactory(),
            new ThreadPoolExecutor.CallerRunsPolicy()
        );
        
        // 确保在应用关闭时正确关闭线程池
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            System.out.println("关闭线程池...");
            GracefulShutdown.shutdownThreadPool(executor);
        }));
    }
    
    // 问题2：任务执行异常处理
    public static class SafeThreadPoolExecutor extends ThreadPoolExecutor {
        public SafeThreadPoolExecutor(int corePoolSize, int maximumPoolSize,
                                    long keepAliveTime, TimeUnit unit,
                                    BlockingQueue<Runnable> workQueue) {
            super(corePoolSize, maximumPoolSize, keepAliveTime, unit, workQueue);
        }
        
        @Override
        protected void afterExecute(Runnable r, Throwable t) {
            super.afterExecute(r, t);
            if (t == null && r instanceof Future<?>) {
                try {
                    ((Future<?>) r).get();
                } catch (CancellationException ce) {
                    t = ce;
                } catch (ExecutionException ee) {
                    t = ee.getCause();
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                }
            }
            if (t != null) {
                System.err.println("任务执行异常: " + t.getMessage());
                t.printStackTrace();
                // 可以添加告警、日志记录等
            }
        }
    }
    
    // 问题3：线程池大小动态调整
    public static void dynamicAdjustment(ThreadPoolExecutor executor) {
        // 监控系统负载，动态调整线程池大小
        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
        scheduler.scheduleAtFixedRate(() -> {
            double cpuUsage = getCpuUsage(); // 获取CPU使用率
            int queueSize = executor.getQueue().size();
            
            if (cpuUsage > 0.8 && queueSize > 50) {
                // CPU使用率高且队列积压，增加线程
                int currentMax = executor.getMaximumPoolSize();
                executor.setMaximumPoolSize(Math.min(currentMax + 2, 20));
                System.out.println("增加最大线程数到: " + executor.getMaximumPoolSize());
            } else if (cpuUsage < 0.3 && queueSize < 10) {
                // CPU使用率低且队列空闲，减少线程
                int currentMax = executor.getMaximumPoolSize();
                int coreSize = executor.getCorePoolSize();
                executor.setMaximumPoolSize(Math.max(currentMax - 1, coreSize));
                System.out.println("减少最大线程数到: " + executor.getMaximumPoolSize());
            }
        }, 0, 30, TimeUnit.SECONDS);
    }
    
    private static double getCpuUsage() {
        // 简化的CPU使用率获取，实际应用中可以使用JMX
        return Math.random();
    }
}
```

## 9. 总结

### 9.1 核心要点

1. **理解参数含义**：正确配置核心线程数、最大线程数、队列大小等参数
2. **选择合适队列**：根据业务场景选择有界或无界队列
3. **制定拒绝策略**：根据业务需求选择或自定义拒绝策略
4. **监控线程池状态**：实时监控线程池的运行状态和性能指标
5. **优雅关闭**：确保应用关闭时正确关闭线程池

### 9.2 性能调优建议

```
调优步骤：
1. 分析任务特性（CPU密集型 vs IO密集型）
2. 确定合理的线程数量
3. 选择合适的队列类型和大小
4. 配置适当的拒绝策略
5. 添加监控和告警
6. 压力测试验证配置
7. 根据监控数据持续优化
```

### 9.3 注意事项

- **避免使用Executors工具类**：推荐手动创建ThreadPoolExecutor
- **合理设置队列大小**：避免无界队列导致内存溢出
- **处理任务异常**：重写afterExecute方法处理任务执行异常
- **线程池复用**：避免频繁创建和销毁线程池
- **资源清理**：确保线程池正确关闭，避免资源泄漏

通过深入理解线程池的实现原理和最佳实践，可以更好地利用线程池提升应用性能和稳定性。


