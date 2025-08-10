---
title: linux线程基础
author: 哪吒
date: '2023-06-15'
---

# Linux线程基础

## 1. 线程概念与特性

### 1.1 什么是线程

线程（Thread）是操作系统能够进行运算调度的最小单位，它被包含在进程之中，是进程中的实际运作单位。一个进程可以包含多个线程，这些线程共享进程的资源，如内存空间、文件描述符等。

```c
#include <pthread.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

// 线程函数示例
void* thread_function(void* arg) {
    int thread_id = *(int*)arg;
    printf("线程 %d 正在运行\n", thread_id);
    
    // 模拟工作
    for(int i = 0; i < 5; i++) {
        printf("线程 %d: 工作步骤 %d\n", thread_id, i + 1);
        sleep(1);
    }
    
    printf("线程 %d 完成工作\n", thread_id);
    return NULL;
}
```

### 1.2 线程与进程的区别

| 特性 | 进程 | 线程 |
|------|------|------|
| 资源占用 | 独立的内存空间 | 共享进程内存空间 |
| 创建开销 | 较大 | 较小 |
| 通信方式 | IPC（管道、消息队列等） | 共享内存、信号量 |
| 切换开销 | 较大 | 较小 |
| 独立性 | 高度独立 | 相互依赖 |

### 1.3 线程的优势

- **并发执行**：多个线程可以同时执行不同的任务
- **资源共享**：线程间可以方便地共享数据
- **响应性**：提高程序的响应速度
- **经济性**：创建和切换开销小

## 2. POSIX线程（pthread）

### 2.1 pthread库简介

POSIX线程（pthread）是Linux系统中标准的线程API，提供了创建、管理和同步线程的函数。

```c
// 编译时需要链接pthread库
// gcc -o program program.c -lpthread
```

### 2.2 线程创建与管理

#### 创建线程

```c
#include <pthread.h>
#include <stdio.h>
#include <stdlib.h>

int main() {
    pthread_t thread1, thread2;
    int thread1_id = 1, thread2_id = 2;
    int result;
    
    // 创建线程1
    result = pthread_create(&thread1, NULL, thread_function, &thread1_id);
    if (result != 0) {
        printf("创建线程1失败\n");
        exit(1);
    }
    
    // 创建线程2
    result = pthread_create(&thread2, NULL, thread_function, &thread2_id);
    if (result != 0) {
        printf("创建线程2失败\n");
        exit(1);
    }
    
    printf("主线程：已创建两个工作线程\n");
    
    // 等待线程完成
    pthread_join(thread1, NULL);
    pthread_join(thread2, NULL);
    
    printf("主线程：所有线程已完成\n");
    return 0;
}
```

#### 线程属性设置

```c
#include <pthread.h>

void create_detached_thread() {
    pthread_t thread;
    pthread_attr_t attr;
    
    // 初始化线程属性
    pthread_attr_init(&attr);
    
    // 设置为分离状态
    pthread_attr_setdetachstate(&attr, PTHREAD_CREATE_DETACHED);
    
    // 设置栈大小
    size_t stack_size = 1024 * 1024; // 1MB
    pthread_attr_setstacksize(&attr, stack_size);
    
    // 创建线程
    pthread_create(&thread, &attr, thread_function, NULL);
    
    // 销毁属性对象
    pthread_attr_destroy(&attr);
}
```

## 3. 线程同步机制

### 3.1 互斥锁（Mutex）

互斥锁用于保护共享资源，确保同一时间只有一个线程可以访问临界区。

```c
#include <pthread.h>
#include <stdio.h>
#include <unistd.h>

// 全局变量和互斥锁
int shared_counter = 0;
pthread_mutex_t counter_mutex = PTHREAD_MUTEX_INITIALIZER;

void* increment_counter(void* arg) {
    int thread_id = *(int*)arg;
    
    for(int i = 0; i < 100000; i++) {
        // 加锁
        pthread_mutex_lock(&counter_mutex);
        
        // 临界区：修改共享变量
        shared_counter++;
        
        // 解锁
        pthread_mutex_unlock(&counter_mutex);
    }
    
    printf("线程 %d 完成计数\n", thread_id);
    return NULL;
}

int main() {
    pthread_t threads[3];
    int thread_ids[3] = {1, 2, 3};
    
    // 创建多个线程
    for(int i = 0; i < 3; i++) {
        pthread_create(&threads[i], NULL, increment_counter, &thread_ids[i]);
    }
    
    // 等待所有线程完成
    for(int i = 0; i < 3; i++) {
        pthread_join(threads[i], NULL);
    }
    
    printf("最终计数值: %d\n", shared_counter);
    
    // 销毁互斥锁
    pthread_mutex_destroy(&counter_mutex);
    return 0;
}
```

### 3.2 条件变量（Condition Variable）

条件变量用于线程间的条件同步，允许线程等待特定条件的发生。

```c
#include <pthread.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

// 生产者-消费者模型
#define BUFFER_SIZE 10

int buffer[BUFFER_SIZE];
int buffer_count = 0;
int in = 0, out = 0;

pthread_mutex_t buffer_mutex = PTHREAD_MUTEX_INITIALIZER;
pthread_cond_t buffer_not_full = PTHREAD_COND_INITIALIZER;
pthread_cond_t buffer_not_empty = PTHREAD_COND_INITIALIZER;

// 生产者线程
void* producer(void* arg) {
    int producer_id = *(int*)arg;
    
    for(int i = 0; i < 20; i++) {
        pthread_mutex_lock(&buffer_mutex);
        
        // 等待缓冲区不满
        while(buffer_count == BUFFER_SIZE) {
            printf("生产者 %d: 缓冲区满，等待...\n", producer_id);
            pthread_cond_wait(&buffer_not_full, &buffer_mutex);
        }
        
        // 生产数据
        int item = i + producer_id * 100;
        buffer[in] = item;
        in = (in + 1) % BUFFER_SIZE;
        buffer_count++;
        
        printf("生产者 %d: 生产了 %d，缓冲区数量: %d\n", 
               producer_id, item, buffer_count);
        
        // 通知消费者
        pthread_cond_signal(&buffer_not_empty);
        pthread_mutex_unlock(&buffer_mutex);
        
        usleep(100000); // 0.1秒
    }
    
    return NULL;
}

// 消费者线程
void* consumer(void* arg) {
    int consumer_id = *(int*)arg;
    
    for(int i = 0; i < 20; i++) {
        pthread_mutex_lock(&buffer_mutex);
        
        // 等待缓冲区不空
        while(buffer_count == 0) {
            printf("消费者 %d: 缓冲区空，等待...\n", consumer_id);
            pthread_cond_wait(&buffer_not_empty, &buffer_mutex);
        }
        
        // 消费数据
        int item = buffer[out];
        out = (out + 1) % BUFFER_SIZE;
        buffer_count--;
        
        printf("消费者 %d: 消费了 %d，缓冲区数量: %d\n", 
               consumer_id, item, buffer_count);
        
        // 通知生产者
        pthread_cond_signal(&buffer_not_full);
        pthread_mutex_unlock(&buffer_mutex);
        
        usleep(150000); // 0.15秒
    }
    
    return NULL;
}
```

### 3.3 读写锁（Read-Write Lock）

读写锁允许多个读者同时访问，但写者独占访问。

```c
#include <pthread.h>
#include <stdio.h>
#include <unistd.h>

// 共享数据和读写锁
int shared_data = 0;
pthread_rwlock_t data_rwlock = PTHREAD_RWLOCK_INITIALIZER;

// 读者线程
void* reader(void* arg) {
    int reader_id = *(int*)arg;
    
    for(int i = 0; i < 5; i++) {
        // 获取读锁
        pthread_rwlock_rdlock(&data_rwlock);
        
        printf("读者 %d: 读取数据 = %d\n", reader_id, shared_data);
        sleep(1);
        
        // 释放读锁
        pthread_rwlock_unlock(&data_rwlock);
        
        sleep(1);
    }
    
    return NULL;
}

// 写者线程
void* writer(void* arg) {
    int writer_id = *(int*)arg;
    
    for(int i = 0; i < 3; i++) {
        // 获取写锁
        pthread_rwlock_wrlock(&data_rwlock);
        
        shared_data += 10;
        printf("写者 %d: 写入数据 = %d\n", writer_id, shared_data);
        sleep(2);
        
        // 释放写锁
        pthread_rwlock_unlock(&data_rwlock);
        
        sleep(2);
    }
    
    return NULL;
}
```

## 4. 线程池实现

### 4.1 简单线程池设计

```c
#include <pthread.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

#define MAX_THREADS 4
#define MAX_QUEUE 100

// 任务结构
typedef struct {
    void (*function)(void* arg);
    void* argument;
} task_t;

// 线程池结构
typedef struct {
    pthread_t threads[MAX_THREADS];
    task_t task_queue[MAX_QUEUE];
    int queue_front;
    int queue_rear;
    int queue_size;
    int shutdown;
    
    pthread_mutex_t queue_mutex;
    pthread_cond_t queue_not_empty;
    pthread_cond_t queue_not_full;
} thread_pool_t;

thread_pool_t pool;

// 工作线程函数
void* worker_thread(void* arg) {
    while(1) {
        pthread_mutex_lock(&pool.queue_mutex);
        
        // 等待任务
        while(pool.queue_size == 0 && !pool.shutdown) {
            pthread_cond_wait(&pool.queue_not_empty, &pool.queue_mutex);
        }
        
        // 检查是否需要关闭
        if(pool.shutdown) {
            pthread_mutex_unlock(&pool.queue_mutex);
            break;
        }
        
        // 取出任务
        task_t task = pool.task_queue[pool.queue_front];
        pool.queue_front = (pool.queue_front + 1) % MAX_QUEUE;
        pool.queue_size--;
        
        // 通知可以添加新任务
        pthread_cond_signal(&pool.queue_not_full);
        pthread_mutex_unlock(&pool.queue_mutex);
        
        // 执行任务
        task.function(task.argument);
    }
    
    return NULL;
}

// 初始化线程池
void thread_pool_init() {
    pool.queue_front = 0;
    pool.queue_rear = 0;
    pool.queue_size = 0;
    pool.shutdown = 0;
    
    pthread_mutex_init(&pool.queue_mutex, NULL);
    pthread_cond_init(&pool.queue_not_empty, NULL);
    pthread_cond_init(&pool.queue_not_full, NULL);
    
    // 创建工作线程
    for(int i = 0; i < MAX_THREADS; i++) {
        pthread_create(&pool.threads[i], NULL, worker_thread, NULL);
    }
    
    printf("线程池初始化完成，创建了 %d 个工作线程\n", MAX_THREADS);
}

// 添加任务到线程池
void thread_pool_add_task(void (*function)(void*), void* argument) {
    pthread_mutex_lock(&pool.queue_mutex);
    
    // 等待队列不满
    while(pool.queue_size == MAX_QUEUE) {
        pthread_cond_wait(&pool.queue_not_full, &pool.queue_mutex);
    }
    
    // 添加任务
    pool.task_queue[pool.queue_rear].function = function;
    pool.task_queue[pool.queue_rear].argument = argument;
    pool.queue_rear = (pool.queue_rear + 1) % MAX_QUEUE;
    pool.queue_size++;
    
    // 通知工作线程
    pthread_cond_signal(&pool.queue_not_empty);
    pthread_mutex_unlock(&pool.queue_mutex);
}

// 示例任务函数
void example_task(void* arg) {
    int task_id = *(int*)arg;
    printf("执行任务 %d，线程ID: %lu\n", task_id, pthread_self());
    sleep(2); // 模拟工作
    printf("任务 %d 完成\n", task_id);
}
```

## 5. 线程安全与最佳实践

### 5.1 线程安全的概念

线程安全是指在多线程环境下，程序能够正确地处理多个线程同时访问共享资源的情况。

### 5.2 常见的线程安全问题

#### 竞态条件（Race Condition）

```c
// 不安全的代码示例
int global_counter = 0;

void* unsafe_increment(void* arg) {
    for(int i = 0; i < 100000; i++) {
        // 这里存在竞态条件
        global_counter++; // 非原子操作
    }
    return NULL;
}

// 安全的代码示例
pthread_mutex_t safe_mutex = PTHREAD_MUTEX_INITIALIZER;
int safe_counter = 0;

void* safe_increment(void* arg) {
    for(int i = 0; i < 100000; i++) {
        pthread_mutex_lock(&safe_mutex);
        safe_counter++; // 受保护的操作
        pthread_mutex_unlock(&safe_mutex);
    }
    return NULL;
}
```

#### 死锁（Deadlock）

```c
// 可能导致死锁的代码
pthread_mutex_t mutex1 = PTHREAD_MUTEX_INITIALIZER;
pthread_mutex_t mutex2 = PTHREAD_MUTEX_INITIALIZER;

void* thread1_func(void* arg) {
    pthread_mutex_lock(&mutex1);
    printf("线程1获得mutex1\n");
    sleep(1);
    
    pthread_mutex_lock(&mutex2); // 可能死锁
    printf("线程1获得mutex2\n");
    
    pthread_mutex_unlock(&mutex2);
    pthread_mutex_unlock(&mutex1);
    return NULL;
}

void* thread2_func(void* arg) {
    pthread_mutex_lock(&mutex2);
    printf("线程2获得mutex2\n");
    sleep(1);
    
    pthread_mutex_lock(&mutex1); // 可能死锁
    printf("线程2获得mutex1\n");
    
    pthread_mutex_unlock(&mutex1);
    pthread_mutex_unlock(&mutex2);
    return NULL;
}

// 避免死锁的方法：统一加锁顺序
void* safe_thread1_func(void* arg) {
    pthread_mutex_lock(&mutex1); // 总是先锁mutex1
    pthread_mutex_lock(&mutex2); // 再锁mutex2
    
    // 执行工作
    
    pthread_mutex_unlock(&mutex2);
    pthread_mutex_unlock(&mutex1);
    return NULL;
}
```

### 5.3 最佳实践

1. **最小化锁的范围**：只在必要时加锁，尽快释放
2. **避免嵌套锁**：减少死锁的可能性
3. **使用RAII模式**：确保资源正确释放
4. **优先使用高级同步原语**：如条件变量、读写锁
5. **线程局部存储**：减少共享数据

```c
// 线程局部存储示例
__thread int thread_local_var = 0;

void* thread_function(void* arg) {
    int thread_id = *(int*)arg;
    
    // 每个线程都有自己的副本
    thread_local_var = thread_id * 100;
    
    printf("线程 %d 的局部变量: %d\n", thread_id, thread_local_var);
    return NULL;
}
```

## 6. 性能优化与调试

### 6.1 性能监控

```c
#include <sys/time.h>

// 性能计时器
double get_time() {
    struct timeval tv;
    gettimeofday(&tv, NULL);
    return tv.tv_sec + tv.tv_usec / 1000000.0;
}

void* performance_test_thread(void* arg) {
    double start_time = get_time();
    
    // 执行工作
    for(int i = 0; i < 1000000; i++) {
        // 模拟计算
    }
    
    double end_time = get_time();
    printf("线程执行时间: %.6f 秒\n", end_time - start_time);
    
    return NULL;
}
```

### 6.2 调试技巧

```bash
# 使用gdb调试多线程程序
gdb ./program
(gdb) set scheduler-locking on  # 锁定调度器
(gdb) info threads              # 查看所有线程
(gdb) thread 2                  # 切换到线程2
(gdb) bt                        # 查看调用栈

# 使用valgrind检测线程问题
valgrind --tool=helgrind ./program
valgrind --tool=drd ./program
```

## 7. 总结

Linux线程编程是系统编程的重要组成部分，掌握以下要点：

- **基础概念**：理解线程与进程的区别
- **POSIX线程**：熟练使用pthread API
- **同步机制**：正确使用互斥锁、条件变量、读写锁
- **线程安全**：避免竞态条件和死锁
- **性能优化**：合理设计线程架构
- **调试技巧**：使用专业工具定位问题

通过实践这些概念和技术，可以编写出高效、安全的多线程程序。
