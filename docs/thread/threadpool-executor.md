---
title: 深入浅出Java线程池ThreadPoolExecutor
author: 哪吒
date: '2023-05-15'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## Java线程池原理

在高并发环境下，频繁创建和销毁线程会带来极大的性能开销。线程池通过复用已创建的线程，可以显著提高系统性能。Java中的`ThreadPoolExecutor`是线程池的核心实现类，它提供了强大的线程池管理功能。

### 为什么需要线程池

* **降低资源消耗**：通过复用已创建的线程，减少线程创建和销毁的开销
* **提高响应速度**：任务到达时，无需等待线程创建即可立即执行
* **提高线程的可管理性**：统一管理线程，避免无限制创建线程导致的系统崩溃
* **提供更多更强大的功能**：如延时执行、定期执行、监控等

## ThreadPoolExecutor核心参数

`ThreadPoolExecutor`构造函数有7个参数，每个参数都对线程池的行为有重要影响：

```java
public ThreadPoolExecutor(
    int corePoolSize,                 // 核心线程数
    int maximumPoolSize,              // 最大线程数
    long keepAliveTime,               // 线程空闲时间
    TimeUnit unit,                    // 时间单位
    BlockingQueue<Runnable> workQueue, // 工作队列
    ThreadFactory threadFactory,      // 线程工厂
    RejectedExecutionHandler handler  // 拒绝策略
)
```

### 核心参数详解

#### 1. corePoolSize（核心线程数）

线程池中应该保持活跃的线程数量，即使它们处于空闲状态。只有当`allowCoreThreadTimeOut`设置为true时，核心线程在空闲超时后才会被回收。

#### 2. maximumPoolSize（最大线程数）

线程池允许创建的最大线程数。当工作队列已满且活动线程数小于最大线程数时，线程池会创建新线程来处理任务。

#### 3. keepAliveTime（线程空闲时间）

当线程数大于核心线程数时，多余的空闲线程在终止前等待新任务的最长时间。

#### 4. unit（时间单位）

`keepAliveTime`参数的时间单位，如`TimeUnit.SECONDS`、`TimeUnit.MILLISECONDS`等。

#### 5. workQueue（工作队列）

用于保存等待执行的任务的阻塞队列。常用的队列有：

* **ArrayBlockingQueue**：基于数组的有界阻塞队列，按FIFO原则对元素进行排序
* **LinkedBlockingQueue**：基于链表的阻塞队列，按FIFO排序，吞吐量通常高于ArrayBlockingQueue
* **SynchronousQueue**：不存储元素的阻塞队列，每个插入操作必须等待另一个线程调用移除操作
* **PriorityBlockingQueue**：具有优先级的无界阻塞队列
* **DelayQueue**：用于延迟执行任务的无界阻塞队列

#### 6. threadFactory（线程工厂）

用于创建新线程的工厂。通过自定义ThreadFactory，可以给线程设置有意义的名称、设置守护状态或优先级等。

#### 7. handler（拒绝策略）

当线程池和工作队列都已满时，对新提交任务的处理策略。Java提供了四种标准拒绝策略：

* **AbortPolicy**：默认策略，抛出RejectedExecutionException异常
* **CallerRunsPolicy**：在调用者线程中执行任务，有反馈调节机制
* **DiscardPolicy**：直接丢弃新任务，不做任何处理
* **DiscardOldestPolicy**：丢弃队列头部（最旧）的任务，然后重试执行当前任务

## 线程池工作原理

![线程池工作流程](./img.png)

### 线程池执行流程

1. **提交任务**：当任务被提交到线程池时
2. **核心线程处理**：如果运行的线程数少于核心线程数，则创建新线程来处理任务，即使其他线程是空闲的
3. **工作队列缓存**：如果运行的线程数等于或多于核心线程数，则将任务加入工作队列而不是创建新线程
4. **创建临时线程**：如果工作队列已满，且运行的线程数少于最大线程数，则创建新线程来处理任务
5. **触发拒绝策略**：如果工作队列已满，且运行的线程数等于或多于最大线程数，则根据拒绝策略处理该任务

### 线程池状态

`ThreadPoolExecutor`使用一个原子整数`ctl`同时记录线程池状态和工作线程数量：

* **RUNNING**：接受新任务并处理队列中的任务
* **SHUTDOWN**：不接受新任务，但处理队列中的任务
* **STOP**：不接受新任务，不处理队列中的任务，中断正在执行的任务
* **TIDYING**：所有任务已终止，工作线程数为0，线程转换到此状态后会调用`terminated()`方法
* **TERMINATED**：`terminated()`方法执行完成

## 常见线程池类型

Java通过`Executors`工厂类提供了几种预定义的线程池配置：

### 1. FixedThreadPool

```java
ExecutorService fixedThreadPool = Executors.newFixedThreadPool(int nThreads);
```

特点：
* 核心线程数等于最大线程数，即线程数固定
* 使用无界队列LinkedBlockingQueue
* 适用于负载较重的服务器，固定线程数有助于防止资源耗尽

### 2. CachedThreadPool

```java
ExecutorService cachedThreadPool = Executors.newCachedThreadPool();
```

特点：
* 核心线程数为0，最大线程数为Integer.MAX_VALUE
* 使用SynchronousQueue，不存储任务
* 线程空闲60秒后回收
* 适用于执行大量短期异步任务的程序

### 3. SingleThreadExecutor

```java
ExecutorService singleThreadExecutor = Executors.newSingleThreadExecutor();
```

特点：
* 核心线程数和最大线程数都为1
* 使用无界队列LinkedBlockingQueue
* 适用于需要保证顺序执行各个任务的应用场景

### 4. ScheduledThreadPool

```java
ScheduledExecutorService scheduledThreadPool = Executors.newScheduledThreadPool(int corePoolSize);
```

特点：
* 核心线程数固定，最大线程数为Integer.MAX_VALUE
* 使用DelayedWorkQueue
* 适用于需要定期执行任务的场景

## 线程池的正确使用

### 线程池大小设置

线程池大小的设置需要考虑多种因素：

* **CPU密集型任务**：线程数 = CPU核心数 + 1
* **IO密集型任务**：线程数 = CPU核心数 * (1 + 平均等待时间/平均工作时间)

一个简单的经验公式：线程数 = CPU核心数 * (1 + 等待时间/计算时间)

### 避免使用Executors创建线程池

虽然`Executors`提供了便捷的工厂方法，但在生产环境中应避免直接使用，原因如下：

* **FixedThreadPool和SingleThreadExecutor**：使用无界队列LinkedBlockingQueue，可能导致OOM
* **CachedThreadPool**：最大线程数为Integer.MAX_VALUE，可能创建大量线程导致OOM
* **ScheduledThreadPool**：最大线程数为Integer.MAX_VALUE，可能创建大量线程导致OOM

建议直接使用`ThreadPoolExecutor`构造函数，明确指定各个参数。

## 线程池监控

`ThreadPoolExecutor`提供了多种方法来监控线程池的运行状态：

```java
// 获取线程池当前线程数
int getPoolSize()

// 获取活动线程数
int getActiveCount()

// 获取完成任务数
long getCompletedTaskCount()

// 获取任务总数
long getTaskCount()

// 获取队列中等待执行的任务数
int getQueue().size()
```

可以通过继承`ThreadPoolExecutor`并重写`beforeExecute`、`afterExecute`和`terminated`方法来添加自定义监控逻辑。

## 线程池最佳实践

1. **根据业务场景，合理设置线程池参数**
2. **使用有界队列，防止OOM**
3. **根据任务类型（CPU密集型、IO密集型）设置合适的线程数**
4. **为线程池里的线程指定有意义的名称，方便问题排查**
5. **根据实际情况实现自定义拒绝策略**
6. **关注线程池的监控指标，及时调整参数**
7. **优雅关闭线程池**：先调用`shutdown()`，再调用`awaitTermination()`等待任务执行完成

## 实际应用案例

### 案例一：自定义线程池

```java
// 创建自定义线程池
ThreadPoolExecutor executor = new ThreadPoolExecutor(
    // 核心线程数
    Runtime.getRuntime().availableProcessors(),
    // 最大线程数
    Runtime.getRuntime().availableProcessors() * 2,
    // 线程空闲时间
    60L,
    // 时间单位
    TimeUnit.SECONDS,
    // 工作队列
    new ArrayBlockingQueue<>(1000),
    // 线程工厂
    new ThreadFactory() {
        private final AtomicInteger threadNumber = new AtomicInteger(1);
        @Override
        public Thread newThread(Runnable r) {
            Thread t = new Thread(r, "custom-thread-" + threadNumber.getAndIncrement());
            // 设置为非守护线程
            t.setDaemon(false);
            // 设置线程优先级
            t.setPriority(Thread.NORM_PRIORITY);
            return t;
        }
    },
    // 拒绝策略
    new ThreadPoolExecutor.CallerRunsPolicy()
);

// 提交任务
executor.execute(() -> {
    System.out.println("任务正在执行...");
});

// 关闭线程池
executor.shutdown();
```

### 案例二：处理异步任务结果

```java
// 创建线程池
ExecutorService executor = new ThreadPoolExecutor(
    5, 10, 60L, TimeUnit.SECONDS,
    new LinkedBlockingQueue<>(100),
    Executors.defaultThreadFactory(),
    new ThreadPoolExecutor.AbortPolicy());

// 提交有返回值的任务
Future<String> future = executor.submit(() -> {
    // 模拟耗时操作
    Thread.sleep(1000);
    return "任务执行结果";
});

try {
    // 获取任务执行结果，最多等待2秒
    String result = future.get(2, TimeUnit.SECONDS);
    System.out.println("获取到结果: " + result);
} catch (InterruptedException e) {
    // 当前线程被中断
    Thread.currentThread().interrupt();
} catch (ExecutionException e) {
    // 任务执行异常
    e.getCause().printStackTrace();
} catch (TimeoutException e) {
    // 获取结果超时
    future.cancel(true);
} finally {
    // 关闭线程池
    executor.shutdown();
}
```

## 常见问题与解决方案

### 1. 线程池任务堆积问题

**问题**：任务提交速度远大于处理速度，导致队列堆积。

**解决方案**：
* 增加线程池核心线程数和最大线程数
* 使用更高效的任务处理逻辑
* 对任务进行分流，使用多个线程池处理不同类型的任务
* 实现合适的拒绝策略，避免系统崩溃

### 2. 线程池内存泄漏

**问题**：线程池中的线程持有外部对象引用，导致对象无法被垃圾回收。

**解决方案**：
* 避免使用ThreadLocal存储大量数据
* 任务完成后清理ThreadLocal
* 使用弱引用或软引用持有外部对象

### 3. 线程池死锁

**问题**：线程池中的任务相互依赖，导致死锁。

**解决方案**：
* 避免在线程池中提交依赖当前线程池处理结果的任务
* 对于相互依赖的任务，使用不同的线程池处理
* 使用CompletableFuture等工具处理任务依赖关系

## 总结

线程池是Java并发编程中非常重要的工具，合理使用线程池可以显著提高应用程序的性能和稳定性。在实际应用中，需要根据业务场景和系统资源合理配置线程池参数，并做好监控和调优工作。

通过本文的学习，我们深入了解了`ThreadPoolExecutor`的工作原理、核心参数、常见线程池类型以及最佳实践，希望能够帮助大家在实际开发中更好地使用线程池。