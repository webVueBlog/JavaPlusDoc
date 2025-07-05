---
title: java多线程编程技巧
author: 哪吒
date: '2023-06-15'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

# Java多线程编程技巧

## 1. 线程创建与管理技巧

### 1.1 优雅的线程创建方式

#### 使用Lambda表达式简化线程创建

```java
public class ThreadCreationTips {
    
    public static void main(String[] args) {
        // 传统方式
        Thread thread1 = new Thread(new Runnable() {
            @Override
            public void run() {
                System.out.println("传统方式创建线程");
            }
        });
        
        // Lambda表达式方式（推荐）
        Thread thread2 = new Thread(() -> {
            System.out.println("Lambda方式创建线程");
        });
        
        // 方法引用方式
        Thread thread3 = new Thread(ThreadCreationTips::doWork);
        
        // 带名称的线程（便于调试）
        Thread namedThread = new Thread(() -> {
            System.out.println("当前线程：" + Thread.currentThread().getName());
        }, "MyWorkerThread");
        
        thread1.start();
        thread2.start();
        thread3.start();
        namedThread.start();
    }
    
    private static void doWork() {
        System.out.println("方法引用方式创建线程");
    }
}
```

#### 线程工厂模式

```java
public class CustomThreadFactory implements ThreadFactory {
    private final AtomicInteger threadNumber = new AtomicInteger(1);
    private final String namePrefix;
    private final boolean daemon;
    private final int priority;
    
    public CustomThreadFactory(String namePrefix, boolean daemon, int priority) {
        this.namePrefix = namePrefix;
        this.daemon = daemon;
        this.priority = priority;
    }
    
    @Override
    public Thread newThread(Runnable r) {
        Thread t = new Thread(r, namePrefix + "-" + threadNumber.getAndIncrement());
        t.setDaemon(daemon);
        t.setPriority(priority);
        
        // 设置未捕获异常处理器
        t.setUncaughtExceptionHandler((thread, ex) -> {
            System.err.println("线程 " + thread.getName() + " 发生异常：" + ex.getMessage());
            ex.printStackTrace();
        });
        
        return t;
    }
    
    // 使用示例
    public static void main(String[] args) {
        ThreadFactory factory = new CustomThreadFactory("Worker", false, Thread.NORM_PRIORITY);
        
        for (int i = 0; i < 3; i++) {
            Thread thread = factory.newThread(() -> {
                System.out.println("执行任务 - " + Thread.currentThread().getName());
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            });
            thread.start();
        }
    }
}
```

### 1.2 线程状态监控技巧

```java
public class ThreadMonitoringTips {
    
    /**
     * 监控线程状态变化
     */
    public static void monitorThreadState(Thread thread) {
        new Thread(() -> {
            Thread.State lastState = null;
            while (thread.isAlive() || thread.getState() != Thread.State.TERMINATED) {
                Thread.State currentState = thread.getState();
                if (currentState != lastState) {
                    System.out.println("线程 " + thread.getName() + 
                        " 状态变化：" + lastState + " -> " + currentState);
                    lastState = currentState;
                }
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }, "StateMonitor").start();
    }
    
    /**
     * 获取线程详细信息
     */
    public static void printThreadInfo(Thread thread) {
        System.out.println("=== 线程信息 ===");
        System.out.println("名称：" + thread.getName());
        System.out.println("ID：" + thread.getId());
        System.out.println("状态：" + thread.getState());
        System.out.println("优先级：" + thread.getPriority());
        System.out.println("是否守护线程：" + thread.isDaemon());
        System.out.println("是否存活：" + thread.isAlive());
        System.out.println("是否被中断：" + thread.isInterrupted());
        System.out.println("线程组：" + thread.getThreadGroup().getName());
    }
    
    public static void main(String[] args) throws InterruptedException {
        Thread worker = new Thread(() -> {
            try {
                System.out.println("开始工作");
                Thread.sleep(3000);
                System.out.println("工作完成");
            } catch (InterruptedException e) {
                System.out.println("工作被中断");
                Thread.currentThread().interrupt();
            }
        }, "WorkerThread");
        
        // 开始监控
        monitorThreadState(worker);
        
        // 启动线程
        worker.start();
        
        // 打印线程信息
        Thread.sleep(500);
        printThreadInfo(worker);
        
        // 等待线程完成
        worker.join();
    }
}
```

## 2. 线程同步技巧

### 2.1 锁的高级使用技巧

#### 读写锁优化并发性能

```java
public class ReadWriteLockTips {
    private final ReadWriteLock lock = new ReentrantReadWriteLock();
    private final Lock readLock = lock.readLock();
    private final Lock writeLock = lock.writeLock();
    private final Map<String, String> cache = new HashMap<>();
    
    /**
     * 读操作（支持并发）
     */
    public String get(String key) {
        readLock.lock();
        try {
            System.out.println("读取数据：" + key + " - 线程：" + Thread.currentThread().getName());
            Thread.sleep(100); // 模拟读取耗时
            return cache.get(key);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return null;
        } finally {
            readLock.unlock();
        }
    }
    
    /**
     * 写操作（独占）
     */
    public void put(String key, String value) {
        writeLock.lock();
        try {
            System.out.println("写入数据：" + key + "=" + value + " - 线程：" + Thread.currentThread().getName());
            Thread.sleep(200); // 模拟写入耗时
            cache.put(key, value);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            writeLock.unlock();
        }
    }
    
    /**
     * 锁降级示例
     */
    public String getOrCompute(String key, Supplier<String> supplier) {
        readLock.lock();
        try {
            String value = cache.get(key);
            if (value != null) {
                return value;
            }
        } finally {
            readLock.unlock();
        }
        
        // 需要写入，获取写锁
        writeLock.lock();
        try {
            // 双重检查
            String value = cache.get(key);
            if (value == null) {
                value = supplier.get();
                cache.put(key, value);
            }
            
            // 锁降级：在释放写锁之前获取读锁
            readLock.lock();
            return value;
        } finally {
            writeLock.unlock();
        }
        // 注意：这里读锁还没有释放，需要在外部释放
    }
    
    public static void main(String[] args) throws InterruptedException {
        ReadWriteLockTips cache = new ReadWriteLockTips();
        
        // 启动多个读线程
        for (int i = 0; i < 3; i++) {
            new Thread(() -> {
                for (int j = 0; j < 3; j++) {
                    cache.get("key" + j);
                }
            }, "Reader-" + i).start();
        }
        
        // 启动写线程
        new Thread(() -> {
            for (int i = 0; i < 3; i++) {
                cache.put("key" + i, "value" + i);
            }
        }, "Writer").start();
        
        Thread.sleep(5000);
    }
}
```

#### 条件变量的巧妙使用

```java
public class ConditionTips {
    private final Lock lock = new ReentrantLock();
    private final Condition notEmpty = lock.newCondition();
    private final Condition notFull = lock.newCondition();
    private final Queue<String> queue = new LinkedList<>();
    private final int capacity;
    
    public ConditionTips(int capacity) {
        this.capacity = capacity;
    }
    
    /**
     * 生产者
     */
    public void produce(String item) throws InterruptedException {
        lock.lock();
        try {
            // 等待队列不满
            while (queue.size() >= capacity) {
                System.out.println("队列已满，生产者等待...");
                notFull.await();
            }
            
            queue.offer(item);
            System.out.println("生产：" + item + "，队列大小：" + queue.size());
            
            // 通知消费者
            notEmpty.signalAll();
        } finally {
            lock.unlock();
        }
    }
    
    /**
     * 消费者
     */
    public String consume() throws InterruptedException {
        lock.lock();
        try {
            // 等待队列不空
            while (queue.isEmpty()) {
                System.out.println("队列为空，消费者等待...");
                notEmpty.await();
            }
            
            String item = queue.poll();
            System.out.println("消费：" + item + "，队列大小：" + queue.size());
            
            // 通知生产者
            notFull.signalAll();
            return item;
        } finally {
            lock.unlock();
        }
    }
    
    /**
     * 带超时的消费
     */
    public String consumeWithTimeout(long timeout, TimeUnit unit) throws InterruptedException {
        lock.lock();
        try {
            long deadline = System.nanoTime() + unit.toNanos(timeout);
            
            while (queue.isEmpty()) {
                if (!notEmpty.awaitUntil(new Date(System.currentTimeMillis() + unit.toMillis(timeout)))) {
                    System.out.println("消费超时");
                    return null;
                }
            }
            
            String item = queue.poll();
            System.out.println("消费：" + item);
            notFull.signalAll();
            return item;
        } finally {
            lock.unlock();
        }
    }
    
    public static void main(String[] args) throws InterruptedException {
        ConditionTips buffer = new ConditionTips(3);
        
        // 启动生产者
        Thread producer = new Thread(() -> {
            try {
                for (int i = 0; i < 10; i++) {
                    buffer.produce("Item-" + i);
                    Thread.sleep(500);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }, "Producer");
        
        // 启动消费者
        Thread consumer = new Thread(() -> {
            try {
                for (int i = 0; i < 10; i++) {
                    buffer.consume();
                    Thread.sleep(1000);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }, "Consumer");
        
        producer.start();
        consumer.start();
        
        producer.join();
        consumer.join();
    }
}
```

### 2.2 原子操作技巧

#### 原子类的高效使用

```java
public class AtomicTips {
    private final AtomicInteger counter = new AtomicInteger(0);
    private final AtomicReference<String> status = new AtomicReference<>("INIT");
    private final AtomicBoolean flag = new AtomicBoolean(false);
    
    /**
     * 原子递增与条件更新
     */
    public void atomicOperations() {
        // 原子递增
        int newValue = counter.incrementAndGet();
        System.out.println("递增后的值：" + newValue);
        
        // 条件更新（CAS操作）
        boolean updated = status.compareAndSet("INIT", "RUNNING");
        System.out.println("状态更新成功：" + updated + "，当前状态：" + status.get());
        
        // 原子更新并获取旧值
        int oldValue = counter.getAndUpdate(x -> x * 2);
        System.out.println("更新前的值：" + oldValue + "，更新后的值：" + counter.get());
    }
    
    /**
     * 自定义原子操作
     */
    public void customAtomicOperation() {
        // 使用updateAndGet进行复杂计算
        int result = counter.updateAndGet(current -> {
            // 复杂的业务逻辑
            if (current < 100) {
                return current + 10;
            } else {
                return current / 2;
            }
        });
        System.out.println("自定义操作结果：" + result);
    }
    
    /**
     * 原子数组操作
     */
    public static void atomicArrayExample() {
        AtomicIntegerArray array = new AtomicIntegerArray(10);
        
        // 并发更新数组元素
        IntStream.range(0, 10).parallel().forEach(i -> {
            array.set(i, i * i);
            System.out.println("设置 array[" + i + "] = " + array.get(i));
        });
        
        // 原子累加
        int sum = IntStream.range(0, array.length())
            .map(array::get)
            .sum();
        System.out.println("数组元素总和：" + sum);
    }
    
    public static void main(String[] args) {
        AtomicTips tips = new AtomicTips();
        
        // 启动多个线程进行并发操作
        for (int i = 0; i < 5; i++) {
            new Thread(() -> {
                tips.atomicOperations();
                tips.customAtomicOperation();
            }, "Worker-" + i).start();
        }
        
        atomicArrayExample();
    }
}
```

#### LongAdder高性能计数器

```java
public class LongAdderTips {
    private final LongAdder counter = new LongAdder();
    private final LongAccumulator accumulator = new LongAccumulator(Long::max, Long.MIN_VALUE);
    
    /**
     * 高性能计数
     */
    public void performanceCount() {
        // LongAdder在高并发下性能优于AtomicLong
        counter.increment();
        counter.add(5);
        
        System.out.println("当前计数：" + counter.sum());
    }
    
    /**
     * 自定义累加器
     */
    public void customAccumulator(long value) {
        // 累加器会保持最大值
        accumulator.accumulate(value);
        System.out.println("当前最大值：" + accumulator.get());
    }
    
    /**
     * 性能对比测试
     */
    public static void performanceComparison() {
        int threadCount = 10;
        int operationsPerThread = 100000;
        
        // AtomicLong测试
        AtomicLong atomicLong = new AtomicLong();
        long startTime = System.currentTimeMillis();
        
        Thread[] threads1 = new Thread[threadCount];
        for (int i = 0; i < threadCount; i++) {
            threads1[i] = new Thread(() -> {
                for (int j = 0; j < operationsPerThread; j++) {
                    atomicLong.incrementAndGet();
                }
            });
            threads1[i].start();
        }
        
        for (Thread thread : threads1) {
            try {
                thread.join();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
        
        long atomicTime = System.currentTimeMillis() - startTime;
        System.out.println("AtomicLong耗时：" + atomicTime + "ms，结果：" + atomicLong.get());
        
        // LongAdder测试
        LongAdder longAdder = new LongAdder();
        startTime = System.currentTimeMillis();
        
        Thread[] threads2 = new Thread[threadCount];
        for (int i = 0; i < threadCount; i++) {
            threads2[i] = new Thread(() -> {
                for (int j = 0; j < operationsPerThread; j++) {
                    longAdder.increment();
                }
            });
            threads2[i].start();
        }
        
        for (Thread thread : threads2) {
            try {
                thread.join();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
        
        long adderTime = System.currentTimeMillis() - startTime;
        System.out.println("LongAdder耗时：" + adderTime + "ms，结果：" + longAdder.sum());
        System.out.println("性能提升：" + ((double)(atomicTime - adderTime) / atomicTime * 100) + "%");
    }
    
    public static void main(String[] args) {
        LongAdderTips tips = new LongAdderTips();
        
        // 并发计数测试
        for (int i = 0; i < 5; i++) {
            new Thread(() -> {
                for (int j = 0; j < 10; j++) {
                    tips.performanceCount();
                    tips.customAccumulator(ThreadLocalRandom.current().nextLong(1, 100));
                }
            }).start();
        }
        
        // 性能对比
        performanceComparison();
    }
}
```

## 3. 并发集合使用技巧

### 3.1 ConcurrentHashMap高级用法

```java
public class ConcurrentHashMapTips {
    private final ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, LongAdder> counters = new ConcurrentHashMap<>();
    
    /**
     * 原子操作方法
     */
    public void atomicOperations() {
        // 原子递增
        map.compute("count", (key, val) -> val == null ? 1 : val + 1);
        
        // 条件更新
        map.computeIfAbsent("init", k -> 0);
        map.computeIfPresent("count", (k, v) -> v * 2);
        
        // 合并操作
        map.merge("total", 10, Integer::sum);
        
        System.out.println("当前map状态：" + map);
    }
    
    /**
     * 高效计数器实现
     */
    public void efficientCounter(String key) {
        // 使用LongAdder作为值，避免CAS竞争
        counters.computeIfAbsent(key, k -> new LongAdder()).increment();
    }
    
    /**
     * 批量操作
     */
    public void batchOperations() {
        // 并行遍历
        map.forEach(1, (key, value) -> {
            System.out.println("处理：" + key + " = " + value);
        });
        
        // 并行搜索
        String result = map.search(1, (key, value) -> {
            return value > 5 ? key : null;
        });
        System.out.println("搜索结果：" + result);
        
        // 并行归约
        Integer sum = map.reduce(1, 
            (key, value) -> value,  // 转换函数
            Integer::sum);          // 归约函数
        System.out.println("所有值的和：" + sum);
    }
    
    /**
     * 分段锁演示
     */
    public void segmentLockDemo() {
        // ConcurrentHashMap内部使用分段锁，可以并发写入不同段
        int threadCount = 10;
        Thread[] threads = new Thread[threadCount];
        
        for (int i = 0; i < threadCount; i++) {
            final int threadId = i;
            threads[i] = new Thread(() -> {
                for (int j = 0; j < 100; j++) {
                    String key = "thread-" + threadId + "-key-" + j;
                    map.put(key, threadId * 100 + j);
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
        
        System.out.println("最终map大小：" + map.size());
    }
    
    public static void main(String[] args) {
        ConcurrentHashMapTips tips = new ConcurrentHashMapTips();
        
        // 并发操作测试
        for (int i = 0; i < 5; i++) {
            new Thread(() -> {
                tips.atomicOperations();
                tips.efficientCounter("counter-" + Thread.currentThread().getName());
            }).start();
        }
        
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        tips.batchOperations();
        tips.segmentLockDemo();
        
        // 打印计数器结果
        tips.counters.forEach((key, adder) -> {
            System.out.println(key + ": " + adder.sum());
        });
    }
}
```

### 3.2 阻塞队列的巧妙应用

```java
public class BlockingQueueTips {
    
    /**
     * 优先级队列实现任务调度
     */
    public static class PriorityTaskScheduler {
        private final PriorityBlockingQueue<Task> taskQueue = new PriorityBlockingQueue<>();
        private final ExecutorService executor = Executors.newFixedThreadPool(3);
        private volatile boolean running = true;
        
        public static class Task implements Comparable<Task> {
            private final String name;
            private final int priority;
            private final Runnable action;
            
            public Task(String name, int priority, Runnable action) {
                this.name = name;
                this.priority = priority;
                this.action = action;
            }
            
            @Override
            public int compareTo(Task other) {
                // 优先级高的任务先执行（数字越小优先级越高）
                return Integer.compare(this.priority, other.priority);
            }
            
            public void execute() {
                System.out.println("执行任务：" + name + "，优先级：" + priority);
                action.run();
            }
        }
        
        public void start() {
            // 启动任务处理线程
            for (int i = 0; i < 3; i++) {
                executor.submit(() -> {
                    while (running || !taskQueue.isEmpty()) {
                        try {
                            Task task = taskQueue.poll(1, TimeUnit.SECONDS);
                            if (task != null) {
                                task.execute();
                            }
                        } catch (InterruptedException e) {
                            Thread.currentThread().interrupt();
                            break;
                        }
                    }
                });
            }
        }
        
        public void submitTask(String name, int priority, Runnable action) {
            taskQueue.offer(new Task(name, priority, action));
        }
        
        public void shutdown() {
            running = false;
            executor.shutdown();
        }
    }
    
    /**
     * 延迟队列实现定时任务
     */
    public static class DelayedTaskScheduler {
        private final DelayQueue<DelayedTask> delayQueue = new DelayQueue<>();
        private final ExecutorService executor = Executors.newSingleThreadExecutor();
        private volatile boolean running = true;
        
        public static class DelayedTask implements Delayed {
            private final String name;
            private final long executeTime;
            private final Runnable action;
            
            public DelayedTask(String name, long delayMs, Runnable action) {
                this.name = name;
                this.executeTime = System.currentTimeMillis() + delayMs;
                this.action = action;
            }
            
            @Override
            public long getDelay(TimeUnit unit) {
                long remaining = executeTime - System.currentTimeMillis();
                return unit.convert(remaining, TimeUnit.MILLISECONDS);
            }
            
            @Override
            public int compareTo(Delayed other) {
                return Long.compare(this.executeTime, ((DelayedTask) other).executeTime);
            }
            
            public void execute() {
                System.out.println("执行延迟任务：" + name + "，当前时间：" + 
                    new SimpleDateFormat("HH:mm:ss").format(new Date()));
                action.run();
            }
        }
        
        public void start() {
            executor.submit(() -> {
                while (running || !delayQueue.isEmpty()) {
                    try {
                        DelayedTask task = delayQueue.take();
                        task.execute();
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            });
        }
        
        public void scheduleTask(String name, long delayMs, Runnable action) {
            delayQueue.offer(new DelayedTask(name, delayMs, action));
        }
        
        public void shutdown() {
            running = false;
            executor.shutdown();
        }
    }
    
    /**
     * 交换器实现数据交换
     */
    public static void exchangerExample() {
        Exchanger<String> exchanger = new Exchanger<>();
        
        // 生产者线程
        Thread producer = new Thread(() -> {
            try {
                for (int i = 0; i < 3; i++) {
                    String data = "Data-" + i;
                    System.out.println("生产者准备交换：" + data);
                    String received = exchanger.exchange(data);
                    System.out.println("生产者收到：" + received);
                    Thread.sleep(1000);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }, "Producer");
        
        // 消费者线程
        Thread consumer = new Thread(() -> {
            try {
                for (int i = 0; i < 3; i++) {
                    String response = "Response-" + i;
                    System.out.println("消费者准备交换：" + response);
                    String received = exchanger.exchange(response);
                    System.out.println("消费者收到：" + received);
                    Thread.sleep(1500);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
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
    
    public static void main(String[] args) throws InterruptedException {
        // 优先级任务调度器测试
        PriorityTaskScheduler scheduler = new PriorityTaskScheduler();
        scheduler.start();
        
        // 提交不同优先级的任务
        scheduler.submitTask("低优先级任务1", 3, () -> {
            try { Thread.sleep(500); } catch (InterruptedException e) {}
        });
        scheduler.submitTask("高优先级任务", 1, () -> {
            try { Thread.sleep(300); } catch (InterruptedException e) {}
        });
        scheduler.submitTask("中优先级任务", 2, () -> {
            try { Thread.sleep(400); } catch (InterruptedException e) {}
        });
        scheduler.submitTask("低优先级任务2", 3, () -> {
            try { Thread.sleep(200); } catch (InterruptedException e) {}
        });
        
        Thread.sleep(3000);
        scheduler.shutdown();
        
        // 延迟任务调度器测试
        DelayedTaskScheduler delayScheduler = new DelayedTaskScheduler();
        delayScheduler.start();
        
        System.out.println("当前时间：" + new SimpleDateFormat("HH:mm:ss").format(new Date()));
        delayScheduler.scheduleTask("任务1", 2000, () -> System.out.println("任务1执行完成"));
        delayScheduler.scheduleTask("任务2", 1000, () -> System.out.println("任务2执行完成"));
        delayScheduler.scheduleTask("任务3", 3000, () -> System.out.println("任务3执行完成"));
        
        Thread.sleep(5000);
        delayScheduler.shutdown();
        
        // 交换器示例
         System.out.println("\n=== 交换器示例 ===");
         exchangerExample();
     }
 }
 ```

## 4. 线程中断与异常处理技巧

### 4.1 优雅的线程中断处理

```java
public class InterruptionTips {
    
    /**
     * 正确的中断处理方式
     */
    public static class InterruptibleTask implements Runnable {
        private volatile boolean running = true;
        
        @Override
        public void run() {
            try {
                while (running && !Thread.currentThread().isInterrupted()) {
                    // 执行业务逻辑
                    doWork();
                    
                    // 检查中断状态
                    if (Thread.interrupted()) {
                        System.out.println("检测到中断信号，准备退出");
                        break;
                    }
                }
            } catch (InterruptedException e) {
                System.out.println("线程被中断：" + e.getMessage());
                // 重新设置中断状态
                Thread.currentThread().interrupt();
            } finally {
                cleanup();
                System.out.println("线程清理完成");
            }
        }
        
        private void doWork() throws InterruptedException {
            // 模拟可中断的工作
            System.out.println("执行工作 - " + Thread.currentThread().getName());
            Thread.sleep(1000); // 这里会响应中断
        }
        
        private void cleanup() {
            // 清理资源
            System.out.println("清理资源");
        }
        
        public void stop() {
            running = false;
        }
    }
    
    /**
     * 带超时的中断处理
     */
    public static class TimeoutInterruptTask {
        private final CountDownLatch latch = new CountDownLatch(1);
        
        public boolean executeWithTimeout(long timeoutMs) {
            Thread worker = new Thread(() -> {
                try {
                    // 模拟长时间运行的任务
                    for (int i = 0; i < 10; i++) {
                        if (Thread.currentThread().isInterrupted()) {
                            System.out.println("任务被中断");
                            return;
                        }
                        Thread.sleep(500);
                        System.out.println("处理步骤：" + (i + 1));
                    }
                    System.out.println("任务完成");
                } catch (InterruptedException e) {
                    System.out.println("任务被中断：" + e.getMessage());
                    Thread.currentThread().interrupt();
                } finally {
                    latch.countDown();
                }
            });
            
            worker.start();
            
            try {
                // 等待任务完成或超时
                boolean completed = latch.await(timeoutMs, TimeUnit.MILLISECONDS);
                if (!completed) {
                    System.out.println("任务超时，中断执行");
                    worker.interrupt();
                    // 再等待一段时间确保线程退出
                    latch.await(1000, TimeUnit.MILLISECONDS);
                }
                return completed;
            } catch (InterruptedException e) {
                worker.interrupt();
                Thread.currentThread().interrupt();
                return false;
            }
        }
    }
    
    /**
     * 中断传播示例
     */
    public static void interruptPropagationExample() {
        Thread parentThread = new Thread(() -> {
            Thread childThread = new Thread(() -> {
                try {
                    System.out.println("子线程开始工作");
                    Thread.sleep(5000);
                    System.out.println("子线程工作完成");
                } catch (InterruptedException e) {
                    System.out.println("子线程被中断");
                    Thread.currentThread().interrupt();
                }
            }, "ChildThread");
            
            childThread.start();
            
            try {
                System.out.println("父线程等待子线程");
                childThread.join();
                System.out.println("父线程完成");
            } catch (InterruptedException e) {
                System.out.println("父线程被中断，中断子线程");
                childThread.interrupt();
                Thread.currentThread().interrupt();
            }
        }, "ParentThread");
        
        parentThread.start();
        
        // 2秒后中断父线程
        try {
            Thread.sleep(2000);
            parentThread.interrupt();
            parentThread.join();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
    
    public static void main(String[] args) throws InterruptedException {
        // 基本中断处理
        System.out.println("=== 基本中断处理 ===");
        Thread task1 = new Thread(new InterruptibleTask(), "Task1");
        task1.start();
        
        Thread.sleep(3000);
        task1.interrupt();
        task1.join();
        
        // 超时中断处理
        System.out.println("\n=== 超时中断处理 ===");
        TimeoutInterruptTask timeoutTask = new TimeoutInterruptTask();
        boolean completed = timeoutTask.executeWithTimeout(3000);
        System.out.println("任务是否完成：" + completed);
        
        // 中断传播
        System.out.println("\n=== 中断传播 ===");
        interruptPropagationExample();
    }
}
```

### 4.2 线程异常处理最佳实践

```java
public class ThreadExceptionHandling {
    
    /**
     * 自定义未捕获异常处理器
     */
    public static class CustomUncaughtExceptionHandler implements Thread.UncaughtExceptionHandler {
        @Override
        public void uncaughtException(Thread t, Throwable e) {
            System.err.println("线程 " + t.getName() + " 发生未捕获异常：");
            e.printStackTrace();
            
            // 记录日志
            logException(t, e);
            
            // 根据异常类型决定是否重启线程
            if (shouldRestartThread(e)) {
                restartThread(t);
            }
        }
        
        private void logException(Thread thread, Throwable exception) {
            // 实际项目中应该使用日志框架
            System.err.println("[ERROR] Thread: " + thread.getName() + 
                ", Exception: " + exception.getClass().getSimpleName() + 
                ", Message: " + exception.getMessage());
        }
        
        private boolean shouldRestartThread(Throwable exception) {
            // 根据异常类型决定是否重启
            return !(exception instanceof InterruptedException || 
                    exception instanceof ThreadDeath);
        }
        
        private void restartThread(Thread failedThread) {
            System.out.println("重启线程：" + failedThread.getName());
            // 这里可以实现线程重启逻辑
        }
    }
    
    /**
     * 线程池异常处理
     */
    public static class ThreadPoolExceptionDemo {
        private final ThreadPoolExecutor executor;
        
        public ThreadPoolExceptionDemo() {
            this.executor = new ThreadPoolExecutor(
                2, 4, 60L, TimeUnit.SECONDS,
                new LinkedBlockingQueue<>(10),
                new CustomThreadFactory("Worker", false, Thread.NORM_PRIORITY),
                new ThreadPoolExecutor.CallerRunsPolicy()
            );
            
            // 设置线程池的异常处理
            setupExceptionHandling();
        }
        
        private void setupExceptionHandling() {
            // 重写afterExecute方法处理异常
            ThreadPoolExecutor customExecutor = new ThreadPoolExecutor(
                2, 4, 60L, TimeUnit.SECONDS,
                new LinkedBlockingQueue<>(10)
            ) {
                @Override
                protected void afterExecute(Runnable r, Throwable t) {
                    super.afterExecute(r, t);
                    if (t != null) {
                        System.err.println("任务执行异常：" + t.getMessage());
                        t.printStackTrace();
                    }
                    
                    // 如果是Future任务，需要调用get()来获取异常
                    if (t == null && r instanceof Future<?>) {
                        try {
                            ((Future<?>) r).get();
                        } catch (ExecutionException ee) {
                            System.err.println("Future任务异常：" + ee.getCause().getMessage());
                            ee.getCause().printStackTrace();
                        } catch (InterruptedException ie) {
                            Thread.currentThread().interrupt();
                        }
                    }
                }
            };
        }
        
        /**
         * 安全的任务提交
         */
        public void submitSafeTask(Runnable task) {
            executor.submit(() -> {
                try {
                    task.run();
                } catch (Exception e) {
                    System.err.println("任务执行异常：" + e.getMessage());
                    e.printStackTrace();
                    // 这里可以添加重试逻辑或其他处理
                }
            });
        }
        
        /**
         * 带返回值的安全任务提交
         */
        public <T> Future<T> submitSafeCallable(Callable<T> task) {
            return executor.submit(() -> {
                try {
                    return task.call();
                } catch (Exception e) {
                    System.err.println("Callable任务异常：" + e.getMessage());
                    e.printStackTrace();
                    throw new RuntimeException("任务执行失败", e);
                }
            });
        }
        
        public void shutdown() {
            executor.shutdown();
        }
    }
    
    /**
     * 异常恢复策略
     */
    public static class ExceptionRecoveryStrategy {
        private final int maxRetries;
        private final long retryDelayMs;
        
        public ExceptionRecoveryStrategy(int maxRetries, long retryDelayMs) {
            this.maxRetries = maxRetries;
            this.retryDelayMs = retryDelayMs;
        }
        
        public <T> T executeWithRetry(Callable<T> task) throws Exception {
            Exception lastException = null;
            
            for (int attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    return task.call();
                } catch (Exception e) {
                    lastException = e;
                    System.err.println("第 " + attempt + " 次尝试失败：" + e.getMessage());
                    
                    if (attempt < maxRetries) {
                        try {
                            Thread.sleep(retryDelayMs * attempt); // 指数退避
                        } catch (InterruptedException ie) {
                            Thread.currentThread().interrupt();
                            throw new RuntimeException("重试被中断", ie);
                        }
                    }
                }
            }
            
            throw new RuntimeException("重试 " + maxRetries + " 次后仍然失败", lastException);
        }
    }
    
    public static void main(String[] args) throws InterruptedException {
        // 设置全局未捕获异常处理器
        Thread.setDefaultUncaughtExceptionHandler(new CustomUncaughtExceptionHandler());
        
        // 测试未捕获异常
        Thread faultyThread = new Thread(() -> {
            System.out.println("线程开始执行");
            throw new RuntimeException("模拟运行时异常");
        }, "FaultyThread");
        
        faultyThread.start();
        faultyThread.join();
        
        // 测试线程池异常处理
        ThreadPoolExceptionDemo poolDemo = new ThreadPoolExceptionDemo();
        
        // 提交会抛异常的任务
        poolDemo.submitSafeTask(() -> {
            throw new RuntimeException("任务异常");
        });
        
        // 提交正常任务
        poolDemo.submitSafeTask(() -> {
            System.out.println("正常任务执行");
        });
        
        Thread.sleep(2000);
        poolDemo.shutdown();
        
        // 测试异常恢复策略
        ExceptionRecoveryStrategy recovery = new ExceptionRecoveryStrategy(3, 1000);
        
        try {
            String result = recovery.executeWithRetry(() -> {
                // 模拟不稳定的服务
                if (Math.random() < 0.7) {
                    throw new RuntimeException("服务暂时不可用");
                }
                return "成功结果";
            });
            System.out.println("最终结果：" + result);
        } catch (Exception e) {
            System.err.println("最终失败：" + e.getMessage());
        }
    }
}
```

## 5. 性能优化与调试技巧

### 5.1 线程性能监控

```java
public class ThreadPerformanceMonitoring {
    
    /**
     * 线程性能监控器
     */
    public static class ThreadPerformanceMonitor {
        private final ThreadMXBean threadMXBean;
        private final MemoryMXBean memoryMXBean;
        private final ScheduledExecutorService scheduler;
        
        public ThreadPerformanceMonitor() {
            this.threadMXBean = ManagementFactory.getThreadMXBean();
            this.memoryMXBean = ManagementFactory.getMemoryMXBean();
            this.scheduler = Executors.newScheduledThreadPool(1);
            
            // 启用线程CPU时间测量
            if (threadMXBean.isThreadCpuTimeSupported()) {
                threadMXBean.setThreadCpuTimeEnabled(true);
            }
        }
        
        /**
         * 开始监控
         */
        public void startMonitoring(long intervalSeconds) {
            scheduler.scheduleAtFixedRate(this::printThreadStats, 
                0, intervalSeconds, TimeUnit.SECONDS);
        }
        
        /**
         * 打印线程统计信息
         */
        private void printThreadStats() {
            System.out.println("\n=== 线程性能统计 ===");
            System.out.println("活跃线程数：" + threadMXBean.getThreadCount());
            System.out.println("守护线程数：" + threadMXBean.getDaemonThreadCount());
            System.out.println("峰值线程数：" + threadMXBean.getPeakThreadCount());
            System.out.println("总启动线程数：" + threadMXBean.getTotalStartedThreadCount());
            
            // 内存使用情况
            MemoryUsage heapUsage = memoryMXBean.getHeapMemoryUsage();
            System.out.println("堆内存使用：" + formatBytes(heapUsage.getUsed()) + 
                "/" + formatBytes(heapUsage.getMax()));
            
            // 检查死锁
            long[] deadlockedThreads = threadMXBean.findDeadlockedThreads();
            if (deadlockedThreads != null) {
                System.err.println("检测到死锁线程：" + Arrays.toString(deadlockedThreads));
            }
            
            // 显示CPU使用率最高的线程
            showTopCpuThreads(5);
        }
        
        /**
         * 显示CPU使用率最高的线程
         */
        private void showTopCpuThreads(int topN) {
            long[] threadIds = threadMXBean.getAllThreadIds();
            List<ThreadCpuInfo> threadCpuInfos = new ArrayList<>();
            
            for (long threadId : threadIds) {
                ThreadInfo threadInfo = threadMXBean.getThreadInfo(threadId);
                if (threadInfo != null) {
                    long cpuTime = threadMXBean.getThreadCpuTime(threadId);
                    threadCpuInfos.add(new ThreadCpuInfo(threadInfo.getThreadName(), cpuTime));
                }
            }
            
            threadCpuInfos.sort((a, b) -> Long.compare(b.cpuTime, a.cpuTime));
            
            System.out.println("\nCPU使用率最高的 " + topN + " 个线程：");
            threadCpuInfos.stream()
                .limit(topN)
                .forEach(info -> System.out.println(info.threadName + ": " + 
                    formatNanos(info.cpuTime)));
        }
        
        private static class ThreadCpuInfo {
            final String threadName;
            final long cpuTime;
            
            ThreadCpuInfo(String threadName, long cpuTime) {
                this.threadName = threadName;
                this.cpuTime = cpuTime;
            }
        }
        
        private String formatBytes(long bytes) {
            if (bytes < 1024) return bytes + " B";
            if (bytes < 1024 * 1024) return (bytes / 1024) + " KB";
            return (bytes / (1024 * 1024)) + " MB";
        }
        
        private String formatNanos(long nanos) {
            return (nanos / 1_000_000) + " ms";
        }
        
        public void shutdown() {
            scheduler.shutdown();
        }
    }
    
    /**
     * 线程池性能监控
     */
    public static class ThreadPoolMonitor {
        private final ThreadPoolExecutor executor;
        private final ScheduledExecutorService monitor;
        
        public ThreadPoolMonitor(ThreadPoolExecutor executor) {
            this.executor = executor;
            this.monitor = Executors.newScheduledThreadPool(1);
        }
        
        public void startMonitoring(long intervalSeconds) {
            monitor.scheduleAtFixedRate(this::printPoolStats, 
                0, intervalSeconds, TimeUnit.SECONDS);
        }
        
        private void printPoolStats() {
            System.out.println("\n=== 线程池性能统计 ===");
            System.out.println("核心线程数：" + executor.getCorePoolSize());
            System.out.println("最大线程数：" + executor.getMaximumPoolSize());
            System.out.println("当前线程数：" + executor.getPoolSize());
            System.out.println("活跃线程数：" + executor.getActiveCount());
            System.out.println("历史最大线程数：" + executor.getLargestPoolSize());
            System.out.println("已完成任务数：" + executor.getCompletedTaskCount());
            System.out.println("总任务数：" + executor.getTaskCount());
            System.out.println("队列大小：" + executor.getQueue().size());
            
            // 计算线程池利用率
            double utilization = (double) executor.getActiveCount() / executor.getPoolSize();
            System.out.println("线程池利用率：" + String.format("%.2f%%", utilization * 100));
            
            // 检查是否需要调整线程池大小
            if (executor.getQueue().size() > executor.getCorePoolSize() * 2) {
                System.out.println("⚠️ 队列积压严重，建议增加线程数");
            }
            
            if (utilization < 0.5 && executor.getPoolSize() > executor.getCorePoolSize()) {
                System.out.println("💡 线程利用率较低，可以考虑减少线程数");
            }
        }
        
        public void shutdown() {
            monitor.shutdown();
        }
    }
    
    public static void main(String[] args) throws InterruptedException {
        // 启动性能监控
        ThreadPerformanceMonitor monitor = new ThreadPerformanceMonitor();
        monitor.startMonitoring(3);
        
        // 创建测试线程池
        ThreadPoolExecutor executor = new ThreadPoolExecutor(
            2, 8, 60L, TimeUnit.SECONDS,
            new LinkedBlockingQueue<>(20)
        );
        
        ThreadPoolMonitor poolMonitor = new ThreadPoolMonitor(executor);
        poolMonitor.startMonitoring(2);
        
        // 提交一些测试任务
        for (int i = 0; i < 20; i++) {
            final int taskId = i;
            executor.submit(() -> {
                try {
                    // 模拟CPU密集型任务
                    long start = System.currentTimeMillis();
                    while (System.currentTimeMillis() - start < 2000) {
                        Math.sqrt(Math.random());
                    }
                    System.out.println("任务 " + taskId + " 完成");
                } catch (Exception e) {
                    e.printStackTrace();
                }
            });
        }
        
        // 运行10秒后关闭
        Thread.sleep(10000);
        
        executor.shutdown();
         monitor.shutdown();
         poolMonitor.shutdown();
     }
 }
 ```

### 5.2 死锁检测与预防

```java
public class DeadlockDetectionAndPrevention {
    
    /**
     * 死锁检测器
     */
    public static class DeadlockDetector {
        private final ThreadMXBean threadMXBean;
        private final ScheduledExecutorService scheduler;
        
        public DeadlockDetector() {
            this.threadMXBean = ManagementFactory.getThreadMXBean();
            this.scheduler = Executors.newScheduledThreadPool(1);
        }
        
        /**
         * 开始死锁检测
         */
        public void startDetection(long intervalSeconds) {
            scheduler.scheduleAtFixedRate(this::detectDeadlock, 
                0, intervalSeconds, TimeUnit.SECONDS);
        }
        
        /**
         * 检测死锁
         */
        private void detectDeadlock() {
            long[] deadlockedThreads = threadMXBean.findDeadlockedThreads();
            if (deadlockedThreads != null) {
                System.err.println("\n🚨 检测到死锁！");
                ThreadInfo[] threadInfos = threadMXBean.getThreadInfo(deadlockedThreads);
                
                for (ThreadInfo threadInfo : threadInfos) {
                    System.err.println("死锁线程：" + threadInfo.getThreadName());
                    System.err.println("线程状态：" + threadInfo.getThreadState());
                    System.err.println("阻塞对象：" + threadInfo.getLockName());
                    System.err.println("持有锁的线程：" + threadInfo.getLockOwnerName());
                    
                    // 打印堆栈跟踪
                    StackTraceElement[] stackTrace = threadInfo.getStackTrace();
                    for (StackTraceElement element : stackTrace) {
                        System.err.println("\t" + element.toString());
                    }
                    System.err.println();
                }
                
                // 可以在这里添加死锁恢复逻辑
                handleDeadlock(deadlockedThreads);
            }
        }
        
        /**
         * 处理死锁
         */
        private void handleDeadlock(long[] deadlockedThreads) {
            System.err.println("尝试恢复死锁...");
            // 实际项目中可以实现更复杂的恢复策略
            // 比如中断某些线程、记录日志、发送告警等
        }
        
        public void shutdown() {
            scheduler.shutdown();
        }
    }
    
    /**
     * 有序锁获取 - 预防死锁
     */
    public static class OrderedLocking {
        private static final Object lock1 = new Object();
        private static final Object lock2 = new Object();
        
        // 为锁分配唯一ID，确保按顺序获取
        private static final int LOCK1_ID = System.identityHashCode(lock1);
        private static final int LOCK2_ID = System.identityHashCode(lock2);
        
        /**
         * 按顺序获取锁，避免死锁
         */
        public static void safeOperation() {
            Object firstLock = LOCK1_ID < LOCK2_ID ? lock1 : lock2;
            Object secondLock = LOCK1_ID < LOCK2_ID ? lock2 : lock1;
            
            synchronized (firstLock) {
                System.out.println(Thread.currentThread().getName() + " 获取第一个锁");
                
                try {
                    Thread.sleep(100); // 模拟工作
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return;
                }
                
                synchronized (secondLock) {
                    System.out.println(Thread.currentThread().getName() + " 获取第二个锁");
                    // 执行需要两个锁的操作
                    System.out.println(Thread.currentThread().getName() + " 执行关键操作");
                }
            }
        }
    }
    
    /**
     * 超时锁获取 - 预防死锁
     */
    public static class TimeoutLocking {
        private final ReentrantLock lock1 = new ReentrantLock();
        private final ReentrantLock lock2 = new ReentrantLock();
        
        /**
         * 使用超时机制获取锁
         */
        public boolean performOperation(long timeoutMs) {
            boolean lock1Acquired = false;
            boolean lock2Acquired = false;
            
            try {
                // 尝试获取第一个锁
                lock1Acquired = lock1.tryLock(timeoutMs, TimeUnit.MILLISECONDS);
                if (!lock1Acquired) {
                    System.out.println("获取lock1超时");
                    return false;
                }
                
                System.out.println(Thread.currentThread().getName() + " 获取lock1");
                
                // 尝试获取第二个锁
                lock2Acquired = lock2.tryLock(timeoutMs, TimeUnit.MILLISECONDS);
                if (!lock2Acquired) {
                    System.out.println("获取lock2超时");
                    return false;
                }
                
                System.out.println(Thread.currentThread().getName() + " 获取lock2");
                
                // 执行需要两个锁的操作
                Thread.sleep(100);
                System.out.println(Thread.currentThread().getName() + " 执行操作完成");
                
                return true;
                
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return false;
            } finally {
                // 按相反顺序释放锁
                if (lock2Acquired) {
                    lock2.unlock();
                    System.out.println(Thread.currentThread().getName() + " 释放lock2");
                }
                if (lock1Acquired) {
                    lock1.unlock();
                    System.out.println(Thread.currentThread().getName() + " 释放lock1");
                }
            }
        }
    }
    
    /**
     * 银行家算法 - 死锁预防
     */
    public static class BankersAlgorithm {
        private final int[][] allocation;  // 已分配资源
        private final int[][] max;        // 最大需求
        private final int[] available;    // 可用资源
        private final int processes;      // 进程数
        private final int resources;      // 资源类型数
        
        public BankersAlgorithm(int processes, int resources) {
            this.processes = processes;
            this.resources = resources;
            this.allocation = new int[processes][resources];
            this.max = new int[processes][resources];
            this.available = new int[resources];
        }
        
        /**
         * 检查系统是否处于安全状态
         */
        public boolean isSafeState() {
            int[][] need = calculateNeed();
            boolean[] finished = new boolean[processes];
            int[] work = available.clone();
            
            int count = 0;
            while (count < processes) {
                boolean found = false;
                
                for (int p = 0; p < processes; p++) {
                    if (!finished[p] && canAllocate(need[p], work)) {
                        // 模拟进程完成，释放资源
                        for (int r = 0; r < resources; r++) {
                            work[r] += allocation[p][r];
                        }
                        finished[p] = true;
                        found = true;
                        count++;
                        break;
                    }
                }
                
                if (!found) {
                    return false; // 无法找到安全序列
                }
            }
            
            return true; // 找到安全序列
        }
        
        private int[][] calculateNeed() {
            int[][] need = new int[processes][resources];
            for (int i = 0; i < processes; i++) {
                for (int j = 0; j < resources; j++) {
                    need[i][j] = max[i][j] - allocation[i][j];
                }
            }
            return need;
        }
        
        private boolean canAllocate(int[] need, int[] available) {
            for (int i = 0; i < resources; i++) {
                if (need[i] > available[i]) {
                    return false;
                }
            }
            return true;
        }
        
        /**
         * 请求资源
         */
        public synchronized boolean requestResources(int processId, int[] request) {
            // 检查请求是否超过需求
            int[][] need = calculateNeed();
            for (int i = 0; i < resources; i++) {
                if (request[i] > need[processId][i]) {
                    System.out.println("请求超过最大需求");
                    return false;
                }
            }
            
            // 检查请求是否超过可用资源
            for (int i = 0; i < resources; i++) {
                if (request[i] > available[i]) {
                    System.out.println("请求超过可用资源");
                    return false;
                }
            }
            
            // 尝试分配资源
            for (int i = 0; i < resources; i++) {
                available[i] -= request[i];
                allocation[processId][i] += request[i];
            }
            
            // 检查是否仍处于安全状态
            if (isSafeState()) {
                System.out.println("资源分配成功，系统仍处于安全状态");
                return true;
            } else {
                // 回滚分配
                for (int i = 0; i < resources; i++) {
                    available[i] += request[i];
                    allocation[processId][i] -= request[i];
                }
                System.out.println("资源分配会导致不安全状态，拒绝分配");
                return false;
            }
        }
    }
    
    public static void main(String[] args) throws InterruptedException {
        // 启动死锁检测
        DeadlockDetector detector = new DeadlockDetector();
        detector.startDetection(2);
        
        // 测试有序锁获取
        System.out.println("=== 测试有序锁获取 ===");
        for (int i = 0; i < 3; i++) {
            new Thread(() -> OrderedLocking.safeOperation(), "Thread-" + i).start();
        }
        
        Thread.sleep(2000);
        
        // 测试超时锁获取
        System.out.println("\n=== 测试超时锁获取 ===");
        TimeoutLocking timeoutLocking = new TimeoutLocking();
        
        for (int i = 0; i < 3; i++) {
            final int threadId = i;
            new Thread(() -> {
                boolean success = timeoutLocking.performOperation(1000);
                System.out.println("Thread-" + threadId + " 操作" + (success ? "成功" : "失败"));
            }, "TimeoutThread-" + i).start();
        }
        
        Thread.sleep(3000);
        detector.shutdown();
    }
}
```

### 5.3 调试技巧

```java
public class ThreadDebuggingTips {
    
    /**
     * 线程转储分析
     */
    public static class ThreadDumpAnalyzer {
        
        /**
         * 生成线程转储
         */
        public static void generateThreadDump() {
            ThreadMXBean threadMXBean = ManagementFactory.getThreadMXBean();
            ThreadInfo[] threadInfos = threadMXBean.dumpAllThreads(true, true);
            
            System.out.println("\n=== 线程转储 ===");
            for (ThreadInfo threadInfo : threadInfos) {
                System.out.println("线程名称: " + threadInfo.getThreadName());
                System.out.println("线程ID: " + threadInfo.getThreadId());
                System.out.println("线程状态: " + threadInfo.getThreadState());
                
                if (threadInfo.getLockName() != null) {
                    System.out.println("等待锁: " + threadInfo.getLockName());
                }
                
                if (threadInfo.getLockOwnerName() != null) {
                    System.out.println("锁持有者: " + threadInfo.getLockOwnerName());
                }
                
                System.out.println("堆栈跟踪:");
                for (StackTraceElement element : threadInfo.getStackTrace()) {
                    System.out.println("\t" + element.toString());
                }
                
                System.out.println("---");
            }
        }
        
        /**
         * 分析线程状态分布
         */
        public static void analyzeThreadStates() {
            ThreadMXBean threadMXBean = ManagementFactory.getThreadMXBean();
            long[] threadIds = threadMXBean.getAllThreadIds();
            
            Map<Thread.State, Integer> stateCount = new HashMap<>();
            
            for (long threadId : threadIds) {
                ThreadInfo threadInfo = threadMXBean.getThreadInfo(threadId);
                if (threadInfo != null) {
                    Thread.State state = threadInfo.getThreadState();
                    stateCount.put(state, stateCount.getOrDefault(state, 0) + 1);
                }
            }
            
            System.out.println("\n=== 线程状态分布 ===");
            stateCount.forEach((state, count) -> 
                System.out.println(state + ": " + count + " 个线程"));
        }
    }
    
    /**
     * 线程本地变量调试
     */
    public static class ThreadLocalDebugging {
        private static final ThreadLocal<String> threadLocalValue = new ThreadLocal<>();
        private static final ThreadLocal<Map<String, Object>> threadLocalMap = 
            ThreadLocal.withInitial(HashMap::new);
        
        /**
         * 设置线程本地变量
         */
        public static void setThreadLocalValue(String value) {
            threadLocalValue.set(value);
            System.out.println(Thread.currentThread().getName() + " 设置值: " + value);
        }
        
        /**
         * 获取线程本地变量
         */
        public static String getThreadLocalValue() {
            String value = threadLocalValue.get();
            System.out.println(Thread.currentThread().getName() + " 获取值: " + value);
            return value;
        }
        
        /**
         * 清理线程本地变量（重要！）
         */
        public static void cleanupThreadLocal() {
            threadLocalValue.remove();
            threadLocalMap.remove();
            System.out.println(Thread.currentThread().getName() + " 清理ThreadLocal");
        }
        
        /**
         * 监控ThreadLocal内存泄漏
         */
        public static void monitorThreadLocalMemory() {
            // 在实际项目中，可以使用JVM参数或工具来监控
            // -XX:+PrintGCDetails -XX:+PrintGCTimeStamps
            System.out.println("监控ThreadLocal内存使用情况...");
            
            // 模拟内存泄漏检测
            Runtime runtime = Runtime.getRuntime();
            long usedMemory = runtime.totalMemory() - runtime.freeMemory();
            System.out.println("当前内存使用: " + (usedMemory / 1024 / 1024) + " MB");
        }
    }
    
    /**
     * 并发问题重现工具
     */
    public static class ConcurrencyIssueReproducer {
        private int counter = 0;
        private final Object lock = new Object();
        
        /**
         * 重现竞态条件
         */
        public void reproduceRaceCondition(int threadCount, int incrementsPerThread) {
            CountDownLatch startLatch = new CountDownLatch(1);
            CountDownLatch endLatch = new CountDownLatch(threadCount);
            
            for (int i = 0; i < threadCount; i++) {
                new Thread(() -> {
                    try {
                        startLatch.await(); // 等待所有线程准备就绪
                        
                        for (int j = 0; j < incrementsPerThread; j++) {
                            // 故意不加锁，重现竞态条件
                            counter++;
                        }
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    } finally {
                        endLatch.countDown();
                    }
                }, "RaceThread-" + i).start();
            }
            
            System.out.println("开始重现竞态条件...");
            startLatch.countDown(); // 同时启动所有线程
            
            try {
                endLatch.await();
                System.out.println("期望结果: " + (threadCount * incrementsPerThread));
                System.out.println("实际结果: " + counter);
                System.out.println("是否存在竞态条件: " + (counter != threadCount * incrementsPerThread));
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
        
        /**
         * 压力测试工具
         */
        public static void stressTest(Runnable task, int threadCount, int duration) {
            System.out.println("开始压力测试: " + threadCount + " 个线程，持续 " + duration + " 秒");
            
            AtomicLong operationCount = new AtomicLong(0);
            AtomicBoolean running = new AtomicBoolean(true);
            
            // 启动工作线程
            for (int i = 0; i < threadCount; i++) {
                new Thread(() -> {
                    while (running.get()) {
                        try {
                            task.run();
                            operationCount.incrementAndGet();
                        } catch (Exception e) {
                            System.err.println("压力测试异常: " + e.getMessage());
                        }
                    }
                }, "StressThread-" + i).start();
            }
            
            // 运行指定时间后停止
            try {
                Thread.sleep(duration * 1000L);
                running.set(false);
                
                Thread.sleep(1000); // 等待线程结束
                
                long totalOps = operationCount.get();
                double opsPerSecond = (double) totalOps / duration;
                
                System.out.println("压力测试结果:");
                System.out.println("总操作数: " + totalOps);
                System.out.println("每秒操作数: " + String.format("%.2f", opsPerSecond));
                
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }
    
    public static void main(String[] args) throws InterruptedException {
        // 生成线程转储
        ThreadDumpAnalyzer.generateThreadDump();
        
        // 分析线程状态
        ThreadDumpAnalyzer.analyzeThreadStates();
        
        // 测试ThreadLocal
        System.out.println("\n=== ThreadLocal测试 ===");
        for (int i = 0; i < 3; i++) {
            final int threadId = i;
            new Thread(() -> {
                ThreadLocalDebugging.setThreadLocalValue("Value-" + threadId);
                ThreadLocalDebugging.getThreadLocalValue();
                ThreadLocalDebugging.cleanupThreadLocal();
            }, "TLThread-" + i).start();
        }
        
        Thread.sleep(2000);
        
        // 重现竞态条件
        System.out.println("\n=== 竞态条件重现 ===");
        ConcurrencyIssueReproducer reproducer = new ConcurrencyIssueReproducer();
        reproducer.reproduceRaceCondition(10, 1000);
        
        // 压力测试
        System.out.println("\n=== 压力测试 ===");
        ConcurrencyIssueReproducer.stressTest(() -> {
            // 模拟简单操作
            Math.sqrt(Math.random());
        }, 5, 3);
    }
}
```

## 6. 最佳实践总结

### 6.1 线程安全编程原则

1. **最小化共享状态**
   - 尽量使用不可变对象
   - 减少共享变量的使用
   - 使用线程本地变量（ThreadLocal）

2. **正确使用同步机制**
   - 选择合适的同步工具（synchronized、Lock、原子类等）
   - 避免过度同步导致性能问题
   - 注意锁的粒度和范围

3. **避免常见陷阱**
   - 死锁预防（有序获取锁、超时机制）
   - 活锁和饥饿问题
   - 内存可见性问题（volatile关键字）

### 6.2 性能优化建议

1. **线程池配置**
   - CPU密集型：线程数 = CPU核心数 + 1
   - IO密集型：线程数 = CPU核心数 × (1 + IO等待时间/CPU计算时间)
   - 合理设置队列大小和拒绝策略

2. **减少上下文切换**
   - 使用合适的线程数量
   - 减少锁竞争
   - 使用无锁数据结构

3. **内存优化**
   - 及时清理ThreadLocal
   - 避免创建过多短生命周期线程
   - 使用对象池减少GC压力

### 6.3 调试和监控

1. **日志记录**
   - 记录线程创建和销毁
   - 记录锁获取和释放
   - 记录异常和错误

2. **监控指标**
   - 线程数量和状态
   - 线程池利用率
   - 死锁检测
   - CPU和内存使用率

3. **工具使用**
   - JConsole、VisualVM等JVM监控工具
   - 线程转储分析
   - 性能分析工具（JProfiler、Async Profiler等）

### 6.4 代码规范

1. **命名规范**
   - 线程和线程池使用有意义的名称
   - 锁对象使用描述性名称

2. **异常处理**
   - 设置未捕获异常处理器
   - 正确处理InterruptedException
   - 在finally块中清理资源

3. **文档和注释**
   - 说明线程安全性
   - 记录同步策略
   - 标注可能的并发问题

通过掌握这些Java多线程编程技巧，可以编写出更加高效、安全和可维护的并发程序。记住，多线程编程需要谨慎对待，充分的测试和监控是确保程序正确性的关键。


