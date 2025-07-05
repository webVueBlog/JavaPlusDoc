---
title: java并发容器实现原理
author: 哪吒
date: '2023-06-15'
---

# Java并发容器实现原理

## 1. 并发容器概述

### 1.1 为什么需要并发容器

在多线程环境下，传统的集合类（如ArrayList、HashMap等）不是线程安全的，直接使用会导致数据不一致、死循环等问题。虽然可以使用Collections.synchronizedXxx()方法包装，但性能较差。

```java
// 传统同步方式 - 性能较差
List<String> syncList = Collections.synchronizedList(new ArrayList<>());
Map<String, String> syncMap = Collections.synchronizedMap(new HashMap<>());

// 并发容器 - 高性能
List<String> concurrentList = new CopyOnWriteArrayList<>();
Map<String, String> concurrentMap = new ConcurrentHashMap<>();
```

### 1.2 并发容器的分类

1. **并发Map**：ConcurrentHashMap、ConcurrentSkipListMap
2. **并发List**：CopyOnWriteArrayList
3. **并发Set**：CopyOnWriteArraySet、ConcurrentSkipListSet
4. **阻塞队列**：ArrayBlockingQueue、LinkedBlockingQueue、PriorityBlockingQueue等
5. **非阻塞队列**：ConcurrentLinkedQueue

## 2. ConcurrentHashMap实现原理

### 2.1 JDK 1.7 vs JDK 1.8的区别

**JDK 1.7：分段锁（Segment）**
```java
// JDK 1.7 结构示意
public class ConcurrentHashMap<K,V> {
    // Segment数组，每个Segment包含一个HashEntry数组
    final Segment<K,V>[] segments;
    
    static final class Segment<K,V> extends ReentrantLock {
        transient volatile HashEntry<K,V>[] table;
        transient int count;
    }
}
```

**JDK 1.8：CAS + synchronized**
```java
// JDK 1.8 结构示意
public class ConcurrentHashMap<K,V> {
    // Node数组
    transient volatile Node<K,V>[] table;
    
    static class Node<K,V> {
        final int hash;
        final K key;
        volatile V val;
        volatile Node<K,V> next;
    }
}
```

### 2.2 JDK 1.8 ConcurrentHashMap详解

#### 2.2.1 put操作实现

```java
public class ConcurrentHashMapDemo {
    public static void main(String[] args) {
        ConcurrentHashMap<String, String> map = new ConcurrentHashMap<>();
        
        // 多线程并发put
        for (int i = 0; i < 10; i++) {
            final int index = i;
            new Thread(() -> {
                map.put("key" + index, "value" + index);
                System.out.println(Thread.currentThread().getName() + 
                    " put key" + index);
            }, "Thread-" + i).start();
        }
    }
}
```

#### 2.2.2 核心实现机制

```java
// put操作的核心逻辑（简化版）
final V putVal(K key, V value, boolean onlyIfAbsent) {
    if (key == null || value == null) throw new NullPointerException();
    int hash = spread(key.hashCode());
    int binCount = 0;
    for (Node<K,V>[] tab = table;;) {
        Node<K,V> f; int n, i, fh;
        if (tab == null || (n = tab.length) == 0)
            tab = initTable();  // 初始化表
        else if ((f = tabAt(tab, i = (n - 1) & hash)) == null) {
            // 位置为空，使用CAS插入
            if (casTabAt(tab, i, null, new Node<K,V>(hash, key, value, null)))
                break;
        }
        else if ((fh = f.hash) == MOVED)
            tab = helpTransfer(tab, f);  // 协助扩容
        else {
            V oldVal = null;
            synchronized (f) {  // 锁定头节点
                // 链表或红黑树操作
                if (tabAt(tab, i) == f) {
                    if (fh >= 0) {
                        // 链表操作
                        binCount = 1;
                        for (Node<K,V> e = f;; ++binCount) {
                            K ek;
                            if (e.hash == hash &&
                                ((ek = e.key) == key ||
                                 (ek != null && key.equals(ek)))) {
                                oldVal = e.val;
                                if (!onlyIfAbsent)
                                    e.val = value;
                                break;
                            }
                            Node<K,V> pred = e;
                            if ((e = e.next) == null) {
                                pred.next = new Node<K,V>(hash, key, value, null);
                                break;
                            }
                        }
                    }
                    else if (f instanceof TreeBin) {
                        // 红黑树操作
                        Node<K,V> p;
                        binCount = 2;
                        if ((p = ((TreeBin<K,V>)f).putTreeVal(hash, key, value)) != null) {
                            oldVal = p.val;
                            if (!onlyIfAbsent)
                                p.val = value;
                        }
                    }
                }
            }
            if (binCount != 0) {
                if (binCount >= TREEIFY_THRESHOLD)
                    treeifyBin(tab, i);  // 转换为红黑树
                if (oldVal != null)
                    return oldVal;
                break;
            }
        }
    }
    addCount(1L, binCount);
    return null;
}
```

### 2.3 扩容机制

```java
public class ConcurrentHashMapResizeDemo {
    public static void main(String[] args) {
        ConcurrentHashMap<Integer, String> map = new ConcurrentHashMap<>(4);
        
        // 观察扩容过程
        for (int i = 0; i < 20; i++) {
            map.put(i, "value" + i);
            System.out.println("Size: " + map.size() + 
                ", Capacity: " + getCapacity(map));
        }
    }
    
    // 通过反射获取容量（仅用于演示）
    private static int getCapacity(ConcurrentHashMap<?, ?> map) {
        try {
            Field tableField = ConcurrentHashMap.class.getDeclaredField("table");
            tableField.setAccessible(true);
            Object[] table = (Object[]) tableField.get(map);
            return table == null ? 0 : table.length;
        } catch (Exception e) {
            return -1;
        }
    }
}
```

## 3. CopyOnWriteArrayList实现原理

### 3.1 写时复制机制

CopyOnWriteArrayList采用写时复制（Copy-On-Write）策略，读操作不加锁，写操作时复制整个数组。

```java
public class CopyOnWriteArrayListDemo {
    public static void main(String[] args) throws InterruptedException {
        CopyOnWriteArrayList<String> list = new CopyOnWriteArrayList<>();
        
        // 添加初始数据
        list.add("item1");
        list.add("item2");
        list.add("item3");
        
        // 读线程 - 不加锁，性能高
        Thread readerThread = new Thread(() -> {
            for (int i = 0; i < 10; i++) {
                System.out.println("Reader: " + list);
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        });
        
        // 写线程 - 写时复制
        Thread writerThread = new Thread(() -> {
            for (int i = 0; i < 5; i++) {
                list.add("newItem" + i);
                System.out.println("Writer added: newItem" + i);
                try {
                    Thread.sleep(200);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        });
        
        readerThread.start();
        writerThread.start();
        
        readerThread.join();
        writerThread.join();
    }
}
```

### 3.2 核心实现源码分析

```java
// CopyOnWriteArrayList的add方法实现
public boolean add(E e) {
    final ReentrantLock lock = this.lock;
    lock.lock();  // 写操作加锁
    try {
        Object[] elements = getArray();
        int len = elements.length;
        Object[] newElements = Arrays.copyOf(elements, len + 1);  // 复制数组
        newElements[len] = e;  // 添加新元素
        setArray(newElements);  // 设置新数组
        return true;
    } finally {
        lock.unlock();
    }
}

// 读操作不加锁
public E get(int index) {
    return get(getArray(), index);
}

private E get(Object[] a, int index) {
    return (E) a[index];
}
```

### 3.3 适用场景分析

```java
public class CopyOnWriteScenarioDemo {
    public static void main(String[] args) {
        // 适用场景：读多写少
        CopyOnWriteArrayList<String> eventListeners = new CopyOnWriteArrayList<>();
        
        // 注册监听器（写操作较少）
        eventListeners.add("EmailListener");
        eventListeners.add("SMSListener");
        eventListeners.add("LogListener");
        
        // 模拟事件触发（读操作频繁）
        for (int i = 0; i < 1000; i++) {
            // 遍历所有监听器处理事件
            for (String listener : eventListeners) {
                // 处理事件
                processEvent(listener, "Event-" + i);
            }
        }
    }
    
    private static void processEvent(String listener, String event) {
        // 模拟事件处理
        System.out.println(listener + " processing " + event);
    }
}
```

## 4. 阻塞队列实现原理

### 4.1 ArrayBlockingQueue

基于数组的有界阻塞队列，使用ReentrantLock和Condition实现阻塞。

```java
public class ArrayBlockingQueueDemo {
    public static void main(String[] args) {
        ArrayBlockingQueue<String> queue = new ArrayBlockingQueue<>(3);
        
        // 生产者线程
        Thread producer = new Thread(() -> {
            try {
                for (int i = 0; i < 10; i++) {
                    String item = "Item-" + i;
                    queue.put(item);  // 队列满时阻塞
                    System.out.println("Produced: " + item + 
                        ", Queue size: " + queue.size());
                    Thread.sleep(100);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        
        // 消费者线程
        Thread consumer = new Thread(() -> {
            try {
                for (int i = 0; i < 10; i++) {
                    String item = queue.take();  // 队列空时阻塞
                    System.out.println("Consumed: " + item + 
                        ", Queue size: " + queue.size());
                    Thread.sleep(300);  // 消费较慢
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        
        producer.start();
        consumer.start();
    }
}
```

### 4.2 LinkedBlockingQueue

基于链表的可选有界阻塞队列，读写使用不同的锁，性能更好。

```java
public class LinkedBlockingQueueDemo {
    public static void main(String[] args) throws InterruptedException {
        // 无界队列（实际上有界，最大容量为Integer.MAX_VALUE）
        LinkedBlockingQueue<Task> taskQueue = new LinkedBlockingQueue<>();
        
        // 工作线程池
        List<Thread> workers = new ArrayList<>();
        for (int i = 0; i < 3; i++) {
            Thread worker = new Thread(new Worker(taskQueue), "Worker-" + i);
            workers.add(worker);
            worker.start();
        }
        
        // 提交任务
        for (int i = 0; i < 10; i++) {
            taskQueue.offer(new Task("Task-" + i));
        }
        
        // 等待一段时间后停止
        Thread.sleep(5000);
        
        // 停止工作线程
        for (Thread worker : workers) {
            worker.interrupt();
        }
    }
    
    static class Task {
        private final String name;
        
        public Task(String name) {
            this.name = name;
        }
        
        public void execute() {
            System.out.println(Thread.currentThread().getName() + 
                " executing " + name);
            try {
                Thread.sleep(1000);  // 模拟任务执行
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
        
        @Override
        public String toString() {
            return name;
        }
    }
    
    static class Worker implements Runnable {
        private final LinkedBlockingQueue<Task> taskQueue;
        
        public Worker(LinkedBlockingQueue<Task> taskQueue) {
            this.taskQueue = taskQueue;
        }
        
        @Override
        public void run() {
            try {
                while (!Thread.currentThread().isInterrupted()) {
                    Task task = taskQueue.take();  // 阻塞获取任务
                    task.execute();
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                System.out.println(Thread.currentThread().getName() + " stopped");
            }
        }
    }
}
```

### 4.3 PriorityBlockingQueue

基于优先级堆的无界阻塞队列，元素按优先级排序。

```java
public class PriorityBlockingQueueDemo {
    public static void main(String[] args) throws InterruptedException {
        PriorityBlockingQueue<PriorityTask> queue = new PriorityBlockingQueue<>();
        
        // 添加不同优先级的任务
        queue.offer(new PriorityTask("Low Priority Task", 1));
        queue.offer(new PriorityTask("High Priority Task", 10));
        queue.offer(new PriorityTask("Medium Priority Task", 5));
        queue.offer(new PriorityTask("Urgent Task", 20));
        
        // 按优先级处理任务
        while (!queue.isEmpty()) {
            PriorityTask task = queue.take();
            System.out.println("Processing: " + task);
            Thread.sleep(500);
        }
    }
    
    static class PriorityTask implements Comparable<PriorityTask> {
        private final String name;
        private final int priority;
        
        public PriorityTask(String name, int priority) {
            this.name = name;
            this.priority = priority;
        }
        
        @Override
        public int compareTo(PriorityTask other) {
            // 优先级高的排在前面
            return Integer.compare(other.priority, this.priority);
        }
        
        @Override
        public String toString() {
            return name + " (Priority: " + priority + ")";
        }
    }
}
```

## 5. 非阻塞队列 - ConcurrentLinkedQueue

### 5.1 无锁实现原理

ConcurrentLinkedQueue使用CAS操作实现无锁的并发队列。

```java
public class ConcurrentLinkedQueueDemo {
    public static void main(String[] args) throws InterruptedException {
        ConcurrentLinkedQueue<String> queue = new ConcurrentLinkedQueue<>();
        
        // 多个生产者线程
        List<Thread> producers = new ArrayList<>();
        for (int i = 0; i < 3; i++) {
            final int producerId = i;
            Thread producer = new Thread(() -> {
                for (int j = 0; j < 5; j++) {
                    String item = "Producer-" + producerId + "-Item-" + j;
                    queue.offer(item);
                    System.out.println("Offered: " + item);
                    try {
                        Thread.sleep(100);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    }
                }
            });
            producers.add(producer);
            producer.start();
        }
        
        // 多个消费者线程
        List<Thread> consumers = new ArrayList<>();
        for (int i = 0; i < 2; i++) {
            final int consumerId = i;
            Thread consumer = new Thread(() -> {
                for (int j = 0; j < 7; j++) {
                    String item = queue.poll();
                    if (item != null) {
                        System.out.println("Consumer-" + consumerId + 
                            " polled: " + item);
                    } else {
                        System.out.println("Consumer-" + consumerId + 
                            " found empty queue");
                        j--; // 重试
                    }
                    try {
                        Thread.sleep(150);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    }
                }
            });
            consumers.add(consumer);
            consumer.start();
        }
        
        // 等待所有线程完成
        for (Thread producer : producers) {
            producer.join();
        }
        for (Thread consumer : consumers) {
            consumer.join();
        }
        
        System.out.println("Remaining items in queue: " + queue.size());
    }
}
```

### 5.2 CAS操作示例

```java
// ConcurrentLinkedQueue的offer方法核心逻辑（简化版）
public boolean offer(E e) {
    checkNotNull(e);
    final Node<E> newNode = new Node<E>(e);
    
    for (Node<E> t = tail, p = t;;) {
        Node<E> q = p.next;
        if (q == null) {
            // p是最后一个节点，尝试CAS链接新节点
            if (p.casNext(null, newNode)) {
                // 成功链接，可能需要更新tail
                if (p != t)
                    casTail(t, newNode);
                return true;
            }
        }
        else if (p == q) {
            // 遇到哨兵节点，重新开始
            p = (t != (t = tail)) ? t : head;
        }
        else {
            // 向前推进
            p = (p != t && t != (t = tail)) ? t : q;
        }
    }
}
```

## 6. ConcurrentSkipListMap实现原理

### 6.1 跳表数据结构

ConcurrentSkipListMap基于跳表（Skip List）实现，提供有序的并发Map。

```java
public class ConcurrentSkipListMapDemo {
    public static void main(String[] args) throws InterruptedException {
        ConcurrentSkipListMap<Integer, String> skipListMap = new ConcurrentSkipListMap<>();
        
        // 多线程并发插入
        List<Thread> threads = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            final int threadId = i;
            Thread thread = new Thread(() -> {
                for (int j = 0; j < 10; j++) {
                    int key = threadId * 10 + j;
                    skipListMap.put(key, "Value-" + key);
                    System.out.println(Thread.currentThread().getName() + 
                        " put: " + key + " -> Value-" + key);
                }
            }, "Thread-" + i);
            threads.add(thread);
            thread.start();
        }
        
        // 等待所有线程完成
        for (Thread thread : threads) {
            thread.join();
        }
        
        // 验证有序性
        System.out.println("\nOrdered entries:");
        skipListMap.entrySet().forEach(entry -> 
            System.out.println(entry.getKey() + " -> " + entry.getValue()));
        
        // 范围查询
        System.out.println("\nRange query (15-25):");
        skipListMap.subMap(15, 26).entrySet().forEach(entry -> 
            System.out.println(entry.getKey() + " -> " + entry.getValue()));
    }
}
```

### 6.2 跳表的优势

```java
public class SkipListAdvantageDemo {
    public static void main(String[] args) {
        ConcurrentSkipListMap<String, Integer> scoreMap = new ConcurrentSkipListMap<>();
        
        // 添加学生成绩
        scoreMap.put("Alice", 95);
        scoreMap.put("Bob", 87);
        scoreMap.put("Charlie", 92);
        scoreMap.put("David", 78);
        scoreMap.put("Eve", 89);
        
        // 按字母顺序遍历
        System.out.println("Students in alphabetical order:");
        scoreMap.entrySet().forEach(entry -> 
            System.out.println(entry.getKey() + ": " + entry.getValue()));
        
        // 获取第一个和最后一个
        System.out.println("\nFirst student: " + scoreMap.firstKey());
        System.out.println("Last student: " + scoreMap.lastKey());
        
        // 范围查询
        System.out.println("\nStudents from 'B' to 'D':");
        scoreMap.subMap("B", "E").entrySet().forEach(entry -> 
            System.out.println(entry.getKey() + ": " + entry.getValue()));
    }
}
```

## 7. 性能比较分析

### 7.1 并发容器性能测试

```java
public class ConcurrentContainerPerformanceTest {
    private static final int THREAD_COUNT = 10;
    private static final int OPERATIONS_PER_THREAD = 10000;
    
    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== 并发容器性能测试 ===");
        
        // 测试ConcurrentHashMap
        testConcurrentHashMap();
        
        // 测试CopyOnWriteArrayList
        testCopyOnWriteArrayList();
        
        // 测试阻塞队列
        testBlockingQueues();
    }
    
    private static void testConcurrentHashMap() throws InterruptedException {
        System.out.println("\n--- ConcurrentHashMap vs Synchronized HashMap ---");
        
        // 测试ConcurrentHashMap
        ConcurrentHashMap<Integer, String> concurrentMap = new ConcurrentHashMap<>();
        long startTime = System.currentTimeMillis();
        
        List<Thread> threads = new ArrayList<>();
        for (int i = 0; i < THREAD_COUNT; i++) {
            final int threadId = i;
            Thread thread = new Thread(() -> {
                for (int j = 0; j < OPERATIONS_PER_THREAD; j++) {
                    int key = threadId * OPERATIONS_PER_THREAD + j;
                    concurrentMap.put(key, "value" + key);
                    concurrentMap.get(key);
                }
            });
            threads.add(thread);
            thread.start();
        }
        
        for (Thread thread : threads) {
            thread.join();
        }
        
        long concurrentTime = System.currentTimeMillis() - startTime;
        System.out.println("ConcurrentHashMap time: " + concurrentTime + "ms");
        
        // 测试Synchronized HashMap
        Map<Integer, String> syncMap = Collections.synchronizedMap(new HashMap<>());
        startTime = System.currentTimeMillis();
        
        threads.clear();
        for (int i = 0; i < THREAD_COUNT; i++) {
            final int threadId = i;
            Thread thread = new Thread(() -> {
                for (int j = 0; j < OPERATIONS_PER_THREAD; j++) {
                    int key = threadId * OPERATIONS_PER_THREAD + j;
                    syncMap.put(key, "value" + key);
                    syncMap.get(key);
                }
            });
            threads.add(thread);
            thread.start();
        }
        
        for (Thread thread : threads) {
            thread.join();
        }
        
        long syncTime = System.currentTimeMillis() - startTime;
        System.out.println("Synchronized HashMap time: " + syncTime + "ms");
        System.out.println("Performance improvement: " + 
            String.format("%.2f", (double) syncTime / concurrentTime) + "x");
    }
    
    private static void testCopyOnWriteArrayList() throws InterruptedException {
        System.out.println("\n--- CopyOnWriteArrayList vs Synchronized ArrayList ---");
        
        // 读多写少场景测试
        CopyOnWriteArrayList<String> cowList = new CopyOnWriteArrayList<>();
        List<String> syncList = Collections.synchronizedList(new ArrayList<>());
        
        // 预填充数据
        for (int i = 0; i < 1000; i++) {
            cowList.add("item" + i);
            syncList.add("item" + i);
        }
        
        // 测试CopyOnWriteArrayList（90%读，10%写）
        long startTime = System.currentTimeMillis();
        List<Thread> threads = new ArrayList<>();
        
        for (int i = 0; i < THREAD_COUNT; i++) {
            Thread thread = new Thread(() -> {
                for (int j = 0; j < OPERATIONS_PER_THREAD; j++) {
                    if (j % 10 == 0) {
                        // 10%写操作
                        cowList.add("newItem" + j);
                    } else {
                        // 90%读操作
                        if (!cowList.isEmpty()) {
                            cowList.get(j % cowList.size());
                        }
                    }
                }
            });
            threads.add(thread);
            thread.start();
        }
        
        for (Thread thread : threads) {
            thread.join();
        }
        
        long cowTime = System.currentTimeMillis() - startTime;
        System.out.println("CopyOnWriteArrayList time: " + cowTime + "ms");
        
        // 测试Synchronized ArrayList
        startTime = System.currentTimeMillis();
        threads.clear();
        
        for (int i = 0; i < THREAD_COUNT; i++) {
            Thread thread = new Thread(() -> {
                for (int j = 0; j < OPERATIONS_PER_THREAD; j++) {
                    if (j % 10 == 0) {
                        // 10%写操作
                        syncList.add("newItem" + j);
                    } else {
                        // 90%读操作
                        synchronized (syncList) {
                            if (!syncList.isEmpty()) {
                                syncList.get(j % syncList.size());
                            }
                        }
                    }
                }
            });
            threads.add(thread);
            thread.start();
        }
        
        for (Thread thread : threads) {
            thread.join();
        }
        
        long syncTime = System.currentTimeMillis() - startTime;
        System.out.println("Synchronized ArrayList time: " + syncTime + "ms");
        System.out.println("Performance improvement: " + 
            String.format("%.2f", (double) syncTime / cowTime) + "x");
    }
    
    private static void testBlockingQueues() throws InterruptedException {
        System.out.println("\n--- ArrayBlockingQueue vs LinkedBlockingQueue ---");
        
        // 测试ArrayBlockingQueue
        ArrayBlockingQueue<String> arrayQueue = new ArrayBlockingQueue<>(1000);
        long startTime = System.currentTimeMillis();
        
        Thread producer1 = new Thread(() -> {
            try {
                for (int i = 0; i < OPERATIONS_PER_THREAD; i++) {
                    arrayQueue.put("item" + i);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        
        Thread consumer1 = new Thread(() -> {
            try {
                for (int i = 0; i < OPERATIONS_PER_THREAD; i++) {
                    arrayQueue.take();
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        
        producer1.start();
        consumer1.start();
        producer1.join();
        consumer1.join();
        
        long arrayTime = System.currentTimeMillis() - startTime;
        System.out.println("ArrayBlockingQueue time: " + arrayTime + "ms");
        
        // 测试LinkedBlockingQueue
        LinkedBlockingQueue<String> linkedQueue = new LinkedBlockingQueue<>();
        startTime = System.currentTimeMillis();
        
        Thread producer2 = new Thread(() -> {
            try {
                for (int i = 0; i < OPERATIONS_PER_THREAD; i++) {
                    linkedQueue.put("item" + i);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        
        Thread consumer2 = new Thread(() -> {
            try {
                for (int i = 0; i < OPERATIONS_PER_THREAD; i++) {
                    linkedQueue.take();
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        
        producer2.start();
        consumer2.start();
        producer2.join();
        consumer2.join();
        
        long linkedTime = System.currentTimeMillis() - startTime;
        System.out.println("LinkedBlockingQueue time: " + linkedTime + "ms");
    }
}
```

## 8. 最佳实践与选择指南

### 8.1 容器选择决策树

```java
public class ContainerSelectionGuide {
    public static void main(String[] args) {
        System.out.println("=== 并发容器选择指南 ===");
        
        // Map类型选择
        System.out.println("\n--- Map类型选择 ---");
        System.out.println("1. 需要排序 -> ConcurrentSkipListMap");
        System.out.println("2. 高并发读写 -> ConcurrentHashMap");
        System.out.println("3. 简单同步 -> Collections.synchronizedMap()");
        
        // List类型选择
        System.out.println("\n--- List类型选择 ---");
        System.out.println("1. 读多写少 -> CopyOnWriteArrayList");
        System.out.println("2. 频繁修改 -> Collections.synchronizedList()");
        System.out.println("3. 单线程 -> ArrayList");
        
        // Queue类型选择
        System.out.println("\n--- Queue类型选择 ---");
        System.out.println("1. 生产者-消费者模式 -> BlockingQueue");
        System.out.println("   - 有界队列 -> ArrayBlockingQueue");
        System.out.println("   - 无界队列 -> LinkedBlockingQueue");
        System.out.println("   - 优先级队列 -> PriorityBlockingQueue");
        System.out.println("2. 高性能无锁 -> ConcurrentLinkedQueue");
        
        demonstrateSelectionCriteria();
    }
    
    private static void demonstrateSelectionCriteria() {
        System.out.println("\n=== 实际应用场景示例 ===");
        
        // 场景1：缓存系统
        System.out.println("\n场景1：缓存系统");
        ConcurrentHashMap<String, Object> cache = new ConcurrentHashMap<>();
        cache.put("user:123", new User("Alice"));
        System.out.println("推荐：ConcurrentHashMap - 高并发读写性能");
        
        // 场景2：事件监听器
        System.out.println("\n场景2：事件监听器");
        CopyOnWriteArrayList<EventListener> listeners = new CopyOnWriteArrayList<>();
        listeners.add(new EmailListener());
        listeners.add(new LogListener());
        System.out.println("推荐：CopyOnWriteArrayList - 读多写少，遍历安全");
        
        // 场景3：任务队列
        System.out.println("\n场景3：任务队列");
        LinkedBlockingQueue<Runnable> taskQueue = new LinkedBlockingQueue<>();
        taskQueue.offer(() -> System.out.println("执行任务"));
        System.out.println("推荐：LinkedBlockingQueue - 生产者消费者模式");
        
        // 场景4：排行榜
        System.out.println("\n场景4：排行榜");
        ConcurrentSkipListMap<Integer, String> leaderboard = new ConcurrentSkipListMap<>(
            Collections.reverseOrder());
        leaderboard.put(100, "Player1");
        leaderboard.put(95, "Player2");
        System.out.println("推荐：ConcurrentSkipListMap - 需要排序的并发Map");
    }
    
    static class User {
        private String name;
        public User(String name) { this.name = name; }
        @Override
        public String toString() { return "User{name='" + name + "'}"; }
    }
    
    interface EventListener {
        void onEvent(String event);
    }
    
    static class EmailListener implements EventListener {
        @Override
        public void onEvent(String event) {
            System.out.println("Email notification: " + event);
        }
    }
    
    static class LogListener implements EventListener {
        @Override
        public void onEvent(String event) {
            System.out.println("Log event: " + event);
        }
    }
}
```

### 8.2 性能优化技巧

```java
public class PerformanceOptimizationTips {
    public static void main(String[] args) {
        System.out.println("=== 并发容器性能优化技巧 ===");
        
        // 技巧1：合理设置初始容量
        optimizeInitialCapacity();
        
        // 技巧2：减少锁竞争
        reduceLockContention();
        
        // 技巧3：批量操作
        batchOperations();
    }
    
    private static void optimizeInitialCapacity() {
        System.out.println("\n--- 技巧1：合理设置初始容量 ---");
        
        // 不好的做法：使用默认容量
        ConcurrentHashMap<String, String> map1 = new ConcurrentHashMap<>();
        
        // 好的做法：预估容量
        int expectedSize = 10000;
        ConcurrentHashMap<String, String> map2 = new ConcurrentHashMap<>(
            expectedSize, 0.75f, Runtime.getRuntime().availableProcessors());
        
        System.out.println("预估容量可以减少扩容操作，提高性能");
    }
    
    private static void reduceLockContention() {
        System.out.println("\n--- 技巧2：减少锁竞争 ---");
        
        ConcurrentHashMap<String, AtomicLong> counters = new ConcurrentHashMap<>();
        
        // 使用原子类减少锁竞争
        String key = "counter";
        counters.putIfAbsent(key, new AtomicLong(0));
        
        // 多线程安全的计数器
        for (int i = 0; i < 10; i++) {
            new Thread(() -> {
                AtomicLong counter = counters.get(key);
                for (int j = 0; j < 1000; j++) {
                    counter.incrementAndGet();
                }
            }).start();
        }
        
        System.out.println("使用原子类可以减少锁竞争");
    }
    
    private static void batchOperations() {
        System.out.println("\n--- 技巧3：批量操作 ---");
        
        LinkedBlockingQueue<String> queue = new LinkedBlockingQueue<>();
        
        // 批量添加
        List<String> batch = Arrays.asList("item1", "item2", "item3");
        queue.addAll(batch);
        
        // 批量移除
        List<String> result = new ArrayList<>();
        queue.drainTo(result, 10);
        
        System.out.println("批量操作可以减少锁获取次数：" + result);
    }
}
```

## 9. 总结

### 9.1 核心要点

1. **ConcurrentHashMap**：JDK 1.8使用CAS + synchronized，性能优异
2. **CopyOnWriteArrayList**：写时复制，适合读多写少场景
3. **阻塞队列**：生产者-消费者模式的首选，支持阻塞操作
4. **非阻塞队列**：高性能无锁实现，适合高并发场景
5. **ConcurrentSkipListMap**：有序的并发Map，基于跳表实现

### 9.2 选择建议

| 场景 | 推荐容器 | 原因 |
|------|----------|------|
| 高并发缓存 | ConcurrentHashMap | 读写性能优异 |
| 事件监听器 | CopyOnWriteArrayList | 读多写少，遍历安全 |
| 任务队列 | LinkedBlockingQueue | 生产者消费者模式 |
| 排行榜 | ConcurrentSkipListMap | 需要排序 |
| 高性能队列 | ConcurrentLinkedQueue | 无锁实现 |

### 9.3 性能考虑

1. **内存开销**：CopyOnWrite容器内存开销较大
2. **写性能**：CopyOnWrite容器写性能较差
3. **读性能**：ConcurrentHashMap读性能最优
4. **扩容成本**：预设合理初始容量
5. **锁竞争**：选择合适的并发级别

通过合理选择和使用并发容器，可以显著提高多线程应用的性能和稳定性。关键是要根据具体的使用场景和性能要求来选择最适合的容器类型。


