---
title: java线程池使用
author: 哪吒
date: '2023-06-15'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

# Java线程池使用指南

## 1. 线程池基础使用

### 1.1 创建线程池的方式

#### 方式一：使用Executors工具类（不推荐）

```java
// 1. 固定大小线程池
ExecutorService fixedPool = Executors.newFixedThreadPool(5);

// 2. 缓存线程池
ExecutorService cachedPool = Executors.newCachedThreadPool();

// 3. 单线程池
ExecutorService singlePool = Executors.newSingleThreadExecutor();

// 4. 定时任务线程池
ScheduledExecutorService scheduledPool = Executors.newScheduledThreadPool(3);
```

**为什么不推荐使用Executors？**

```
问题分析：
┌─────────────────────────────────────────────────────────┐
│  newFixedThreadPool & newSingleThreadExecutor          │
│  ↓                                                     │
│  使用LinkedBlockingQueue（无界队列）                    │
│  ↓                                                     │
│  可能导致内存溢出（OOM）                                │
│                                                         │
│  newCachedThreadPool                                    │
│  ↓                                                     │
│  最大线程数为Integer.MAX_VALUE                          │
│  ↓                                                     │
│  可能创建大量线程导致系统崩溃                            │
└─────────────────────────────────────────────────────────┘
```

#### 方式二：手动创建ThreadPoolExecutor（推荐）

```java
public class ThreadPoolFactory {
    
    /**
     * 创建标准线程池
     */
    public static ThreadPoolExecutor createStandardPool() {
        return new ThreadPoolExecutor(
            5,                                      // 核心线程数
            10,                                     // 最大线程数
            60L,                                    // 空闲时间
            TimeUnit.SECONDS,                       // 时间单位
            new ArrayBlockingQueue<>(100),          // 工作队列
            new ThreadFactory() {                   // 线程工厂
                private final AtomicInteger threadNumber = new AtomicInteger(1);
                @Override
                public Thread newThread(Runnable r) {
                    Thread t = new Thread(r, "CustomPool-" + threadNumber.getAndIncrement());
                    t.setDaemon(false);  // 设置为用户线程
                    t.setPriority(Thread.NORM_PRIORITY);
                    return t;
                }
            },
            new ThreadPoolExecutor.CallerRunsPolicy() // 拒绝策略
        );
    }
}
```

## 2. 常用线程池类型及应用场景

### 2.1 CPU密集型任务线程池

```java
public class CPUIntensiveThreadPool {
    
    /**
     * CPU密集型任务线程池配置
     * 核心线程数 = CPU核心数 + 1
     */
    public static ThreadPoolExecutor createCPUIntensivePool() {
        int corePoolSize = Runtime.getRuntime().availableProcessors() + 1;
        return new ThreadPoolExecutor(
            corePoolSize,
            corePoolSize,
            0L,
            TimeUnit.MILLISECONDS,
            new LinkedBlockingQueue<>(50),
            new ThreadFactory() {
                private final AtomicInteger threadNumber = new AtomicInteger(1);
                @Override
                public Thread newThread(Runnable r) {
                    Thread t = new Thread(r, "CPU-Pool-" + threadNumber.getAndIncrement());
                    t.setDaemon(false);
                    return t;
                }
            },
            new ThreadPoolExecutor.AbortPolicy()
        );
    }
    
    // 使用示例：计算密集型任务
    public static void main(String[] args) {
        ThreadPoolExecutor executor = createCPUIntensivePool();
        
        // 提交计算任务
        for (int i = 0; i < 10; i++) {
            final int taskId = i;
            executor.submit(() -> {
                long result = fibonacci(35); // 计算斐波那契数列
                System.out.println("任务" + taskId + "计算结果：" + result + 
                    " - 线程：" + Thread.currentThread().getName());
            });
        }
        
        shutdownGracefully(executor);
    }
    
    private static long fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
    
    private static void shutdownGracefully(ExecutorService executor) {
        executor.shutdown();
        try {
            if (!executor.awaitTermination(60, TimeUnit.SECONDS)) {
                executor.shutdownNow();
            }
        } catch (InterruptedException e) {
            executor.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }
}
```

### 2.2 IO密集型任务线程池

```java
public class IOIntensiveThreadPool {
    
    /**
     * IO密集型任务线程池配置
     * 核心线程数 = CPU核心数 * 2
     */
    public static ThreadPoolExecutor createIOIntensivePool() {
        int corePoolSize = Runtime.getRuntime().availableProcessors() * 2;
        return new ThreadPoolExecutor(
            corePoolSize,
            corePoolSize * 2,
            60L,
            TimeUnit.SECONDS,
            new LinkedBlockingQueue<>(200),
            new ThreadFactory() {
                private final AtomicInteger threadNumber = new AtomicInteger(1);
                @Override
                public Thread newThread(Runnable r) {
                    Thread t = new Thread(r, "IO-Pool-" + threadNumber.getAndIncrement());
                    t.setDaemon(false);
                    return t;
                }
            },
            new ThreadPoolExecutor.CallerRunsPolicy()
        );
    }
    
    // 使用示例：文件读写任务
    public static void main(String[] args) {
        ThreadPoolExecutor executor = createIOIntensivePool();
        
        // 提交IO任务
        for (int i = 0; i < 20; i++) {
            final int taskId = i;
            executor.submit(() -> {
                try {
                    // 模拟文件读写操作
                    Thread.sleep(1000); // 模拟IO等待
                    System.out.println("任务" + taskId + "完成文件操作 - 线程：" + 
                        Thread.currentThread().getName());
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            });
        }
        
        shutdownGracefully(executor);
    }
    
    private static void shutdownGracefully(ExecutorService executor) {
        executor.shutdown();
        try {
            if (!executor.awaitTermination(60, TimeUnit.SECONDS)) {
                executor.shutdownNow();
            }
        } catch (InterruptedException e) {
            executor.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }
}
 ```

### 2.3 定时任务线程池

```java
public class ScheduledThreadPoolExample {
    
    public static void main(String[] args) throws InterruptedException {
        ScheduledThreadPoolExecutor scheduler = new ScheduledThreadPoolExecutor(
            3,
            new ThreadFactory() {
                private final AtomicInteger threadNumber = new AtomicInteger(1);
                @Override
                public Thread newThread(Runnable r) {
                    Thread t = new Thread(r, "Scheduler-" + threadNumber.getAndIncrement());
                    t.setDaemon(false);
                    return t;
                }
            }
        );
        
        // 1. 延迟执行任务
        scheduler.schedule(() -> {
            System.out.println("延迟3秒执行的任务 - " + new Date());
        }, 3, TimeUnit.SECONDS);
        
        // 2. 固定频率执行任务
        ScheduledFuture<?> fixedRateTask = scheduler.scheduleAtFixedRate(() -> {
            System.out.println("每2秒执行一次的任务 - " + new Date());
        }, 1, 2, TimeUnit.SECONDS);
        
        // 3. 固定延迟执行任务
        ScheduledFuture<?> fixedDelayTask = scheduler.scheduleWithFixedDelay(() -> {
            System.out.println("上次执行完成后延迟1秒再执行 - " + new Date());
            try {
                Thread.sleep(500); // 模拟任务执行时间
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }, 1, 1, TimeUnit.SECONDS);
        
        // 运行10秒后停止
        Thread.sleep(10000);
        fixedRateTask.cancel(false);
        fixedDelayTask.cancel(false);
        
        scheduler.shutdown();
    }
}
```

## 3. 线程池监控与管理

### 3.1 线程池状态监控

```java
public class ThreadPoolMonitor {
    
    /**
     * 创建可监控的线程池
     */
    public static ThreadPoolExecutor createMonitorablePool() {
        return new ThreadPoolExecutor(
            5, 10, 60L, TimeUnit.SECONDS,
            new ArrayBlockingQueue<>(100),
            new ThreadFactory() {
                private final AtomicInteger threadNumber = new AtomicInteger(1);
                @Override
                public Thread newThread(Runnable r) {
                    Thread t = new Thread(r, "Monitor-Pool-" + threadNumber.getAndIncrement());
                    t.setDaemon(false);
                    return t;
                }
            },
            new ThreadPoolExecutor.CallerRunsPolicy()
        ) {
            @Override
            protected void beforeExecute(Thread t, Runnable r) {
                super.beforeExecute(t, r);
                System.out.println("任务开始执行 - 线程：" + t.getName());
            }
            
            @Override
            protected void afterExecute(Runnable r, Throwable t) {
                super.afterExecute(r, t);
                if (t != null) {
                    System.err.println("任务执行异常：" + t.getMessage());
                } else {
                    System.out.println("任务执行完成");
                }
            }
            
            @Override
            protected void terminated() {
                super.terminated();
                System.out.println("线程池已终止");
            }
        };
    }
    
    /**
     * 打印线程池状态信息
     */
    public static void printPoolStatus(ThreadPoolExecutor executor) {
        System.out.println("\n=== 线程池状态信息 ===");
        System.out.println("核心线程数：" + executor.getCorePoolSize());
        System.out.println("最大线程数：" + executor.getMaximumPoolSize());
        System.out.println("当前线程数：" + executor.getPoolSize());
        System.out.println("活跃线程数：" + executor.getActiveCount());
        System.out.println("队列中任务数：" + executor.getQueue().size());
        System.out.println("已完成任务数：" + executor.getCompletedTaskCount());
        System.out.println("总任务数：" + executor.getTaskCount());
        System.out.println("是否关闭：" + executor.isShutdown());
        System.out.println("是否终止：" + executor.isTerminated());
        System.out.println("========================\n");
    }
}
```

### 3.2 线程池异常处理

```java
public class ThreadPoolExceptionHandling {
    
    /**
     * 创建带异常处理的线程池
     */
    public static ThreadPoolExecutor createSafeThreadPool() {
        return new ThreadPoolExecutor(
            5, 10, 60L, TimeUnit.SECONDS,
            new ArrayBlockingQueue<>(50),
            new ThreadFactory() {
                private final AtomicInteger threadNumber = new AtomicInteger(1);
                @Override
                public Thread newThread(Runnable r) {
                    Thread t = new Thread(r, "Safe-Pool-" + threadNumber.getAndIncrement());
                    t.setDaemon(false);
                    // 设置未捕获异常处理器
                    t.setUncaughtExceptionHandler((thread, ex) -> {
                        System.err.println("线程 " + thread.getName() + " 发生未捕获异常：" + ex.getMessage());
                        ex.printStackTrace();
                    });
                    return t;
                }
            },
            new ThreadPoolExecutor.CallerRunsPolicy()
        );
    }
    
    /**
     * 安全任务包装器
     */
    public static Runnable wrapTask(Runnable task) {
        return () -> {
            try {
                task.run();
            } catch (Exception e) {
                System.err.println("任务执行异常：" + e.getMessage());
                e.printStackTrace();
                // 可以在这里添加异常上报逻辑
            }
        };
    }
    
    public static void main(String[] args) {
        ThreadPoolExecutor executor = createSafeThreadPool();
        
        // 提交可能抛异常的任务
        executor.submit(wrapTask(() -> {
            System.out.println("正常任务执行");
        }));
        
        executor.submit(wrapTask(() -> {
            throw new RuntimeException("模拟任务异常");
        }));
        
        // 使用Future处理异常
        Future<?> future = executor.submit(() -> {
            throw new RuntimeException("Future异常");
        });
        
        try {
            future.get();
        } catch (ExecutionException e) {
            System.err.println("通过Future捕获异常：" + e.getCause().getMessage());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        executor.shutdown();
    }
}
```

## 4. 最佳实践与注意事项

### 4.1 线程池参数配置指南

```java
public class ThreadPoolConfigGuide {
    
    /**
     * 根据任务类型配置线程池
     */
    public static class ThreadPoolConfigurator {
        
        // CPU密集型任务配置
        public static ThreadPoolExecutor forCPUIntensive() {
            int processors = Runtime.getRuntime().availableProcessors();
            return new ThreadPoolExecutor(
                processors,                    // 核心线程数 = CPU核心数
                processors,                    // 最大线程数 = CPU核心数
                0L, TimeUnit.MILLISECONDS,     // 无空闲时间
                new ArrayBlockingQueue<>(processors * 2), // 队列大小适中
                new ThreadPoolExecutor.AbortPolicy()
            );
        }
        
        // IO密集型任务配置
        public static ThreadPoolExecutor forIOIntensive() {
            int processors = Runtime.getRuntime().availableProcessors();
            return new ThreadPoolExecutor(
                processors * 2,                // 核心线程数 = CPU核心数 * 2
                processors * 4,                // 最大线程数 = CPU核心数 * 4
                60L, TimeUnit.SECONDS,         // 空闲60秒回收
                new LinkedBlockingQueue<>(1000), // 较大的队列
                new ThreadPoolExecutor.CallerRunsPolicy()
            );
        }
        
        // 混合型任务配置
        public static ThreadPoolExecutor forMixed() {
            int processors = Runtime.getRuntime().availableProcessors();
            return new ThreadPoolExecutor(
                processors + 1,                // 核心线程数 = CPU核心数 + 1
                processors * 2,                // 最大线程数 = CPU核心数 * 2
                60L, TimeUnit.SECONDS,
                new ArrayBlockingQueue<>(200),
                new ThreadPoolExecutor.CallerRunsPolicy()
            );
        }
    }
}
```

### 4.2 常见问题与解决方案

```java
public class ThreadPoolTroubleshooting {
    
    /**
     * 问题1：线程池任务积压
     * 解决方案：动态调整线程池大小
     */
    public static class DynamicThreadPool {
        private final ThreadPoolExecutor executor;
        private final ScheduledExecutorService monitor;
        
        public DynamicThreadPool(ThreadPoolExecutor executor) {
            this.executor = executor;
            this.monitor = Executors.newSingleThreadScheduledExecutor();
            startMonitoring();
        }
        
        private void startMonitoring() {
            monitor.scheduleAtFixedRate(() -> {
                int queueSize = executor.getQueue().size();
                int activeCount = executor.getActiveCount();
                int corePoolSize = executor.getCorePoolSize();
                int maxPoolSize = executor.getMaximumPoolSize();
                
                // 队列积压严重，增加线程
                if (queueSize > 100 && activeCount >= corePoolSize * 0.8) {
                    int newCoreSize = Math.min(corePoolSize + 1, maxPoolSize);
                    if (newCoreSize > corePoolSize) {
                        executor.setCorePoolSize(newCoreSize);
                        System.out.println("增加核心线程数至：" + newCoreSize);
                    }
                }
                
                // 队列空闲，减少线程
                if (queueSize < 10 && activeCount < corePoolSize * 0.5 && corePoolSize > 2) {
                    executor.setCorePoolSize(corePoolSize - 1);
                    System.out.println("减少核心线程数至：" + (corePoolSize - 1));
                }
            }, 0, 30, TimeUnit.SECONDS);
        }
    }
    
    /**
     * 问题2：任务执行时间过长
     * 解决方案：任务超时控制
     */
    public static class TimeoutTaskExecutor {
        private final ThreadPoolExecutor executor;
        
        public TimeoutTaskExecutor(ThreadPoolExecutor executor) {
            this.executor = executor;
        }
        
        public <T> T executeWithTimeout(Callable<T> task, long timeout, TimeUnit unit) 
                throws InterruptedException, ExecutionException, TimeoutException {
            Future<T> future = executor.submit(task);
            try {
                return future.get(timeout, unit);
            } catch (TimeoutException e) {
                future.cancel(true); // 取消任务
                throw e;
            }
        }
    }
}
```

### 4.3 性能优化建议

```
线程池性能优化清单：

1. 参数配置优化
   ✓ 根据任务类型选择合适的核心线程数
   ✓ 设置合理的最大线程数和队列大小
   ✓ 选择适当的拒绝策略

2. 任务设计优化
   ✓ 避免任务执行时间过长
   ✓ 合理拆分大任务
   ✓ 避免任务间的强依赖关系

3. 监控与调优
   ✓ 定期监控线程池状态
   ✓ 记录任务执行时间
   ✓ 根据监控数据调整参数

4. 资源管理
   ✓ 及时关闭线程池
   ✓ 避免创建过多线程池
   ✓ 合理设置线程优先级
```

## 5. 总结

Java线程池是并发编程的重要工具，正确使用线程池可以：

- **提高性能**：减少线程创建和销毁的开销
- **控制资源**：限制并发线程数量，避免系统资源耗尽
- **提高响应性**：复用线程，快速响应任务请求
- **便于管理**：统一管理线程生命周期

**关键要点**：
1. 避免使用`Executors`创建线程池，推荐手动创建`ThreadPoolExecutor`
2. 根据任务类型（CPU密集型/IO密集型）合理配置参数
3. 实施有效的监控和异常处理机制
4. 注意线程池的优雅关闭
5. 定期评估和调优线程池配置

通过遵循这些最佳实践，可以充分发挥线程池的优势，构建高性能、稳定的并发应用程序。


