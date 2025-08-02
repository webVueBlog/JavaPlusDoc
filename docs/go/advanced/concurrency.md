# GO语言并发编程

## 1. 并发编程概述

GO语言通过Goroutine和Channel提供了强大的并发编程能力，遵循"通过通信来共享内存，而不是通过共享内存来通信"的设计理念。

### 1.1 并发 vs 并行
- **并发**：多个任务交替执行
- **并行**：多个任务同时执行

## 2. Goroutine

### 2.1 什么是Goroutine
Goroutine是GO语言的轻量级线程，由GO运行时管理，比传统线程更轻量。

### 2.2 创建Goroutine
```go
package main

import (
    "fmt"
    "time"
)

func sayHello(name string) {
    fmt.Printf("Hello, %s!\n", name)
}

func main() {
    // 启动一个Goroutine
    go sayHello("Alice")
    
    // 主Goroutine继续执行
    fmt.Println("Main function")
    
    // 等待一下让Goroutine有机会执行
    time.Sleep(time.Second)
}
```

### 2.3 多个Goroutine
```go
func main() {
    for i := 0; i < 5; i++ {
        go func(id int) {
            fmt.Printf("Goroutine %d\n", id)
        }(i)
    }
    
    time.Sleep(time.Second)
}
```

### 2.4 Goroutine的生命周期
```go
func worker(id int, jobs <-chan int, results chan<- int) {
    for j := range jobs {
        fmt.Printf("Worker %d processing job %d\n", id, j)
        time.Sleep(time.Millisecond * 500)
        results <- j * 2
    }
}

func main() {
    jobs := make(chan int, 100)
    results := make(chan int, 100)
    
    // 启动3个worker
    for w := 1; w <= 3; w++ {
        go worker(w, jobs, results)
    }
    
    // 发送工作
    for j := 1; j <= 9; j++ {
        jobs <- j
    }
    close(jobs)
    
    // 收集结果
    for a := 1; a <= 9; a++ {
        <-results
    }
}
```

## 3. Channel（通道）

### 3.1 创建Channel
```go
// 无缓冲通道
ch := make(chan int)

// 有缓冲通道
ch := make(chan int, 10)
```

### 3.2 发送和接收
```go
func main() {
    ch := make(chan string)
    
    // 启动Goroutine发送数据
    go func() {
        ch <- "Hello from goroutine"
    }()
    
    // 主Goroutine接收数据
    msg := <-ch
    fmt.Println(msg)
}
```

### 3.3 通道方向
```go
// 只发送通道
func sendOnly(ch chan<- int) {
    ch <- 42
}

// 只接收通道
func receiveOnly(ch <-chan int) {
    value := <-ch
    fmt.Println(value)
}

// 双向通道
func bidirectional(ch chan int) {
    ch <- 42
    value := <-ch
    fmt.Println(value)
}
```

### 3.4 通道关闭
```go
func producer(ch chan int) {
    for i := 0; i < 5; i++ {
        ch <- i
    }
    close(ch) // 关闭通道
}

func consumer(ch chan int) {
    for value := range ch { // 遍历通道直到关闭
        fmt.Println("Received:", value)
    }
}

func main() {
    ch := make(chan int)
    go producer(ch)
    consumer(ch)
}
```

## 4. Select语句

### 4.1 基本用法
```go
func main() {
    ch1 := make(chan string)
    ch2 := make(chan string)
    
    go func() {
        time.Sleep(time.Second)
        ch1 <- "one"
    }()
    
    go func() {
        time.Sleep(time.Second * 2)
        ch2 <- "two"
    }()
    
    for i := 0; i < 2; i++ {
        select {
        case msg1 := <-ch1:
            fmt.Println("Received", msg1)
        case msg2 := <-ch2:
            fmt.Println("Received", msg2)
        case <-time.After(time.Second * 3):
            fmt.Println("Timeout")
        }
    }
}
```

### 4.2 非阻塞选择
```go
func main() {
    ch := make(chan string)
    
    select {
    case msg := <-ch:
        fmt.Println("Received:", msg)
    default:
        fmt.Println("No message received")
    }
}
```

## 5. 同步原语

### 5.1 WaitGroup
```go
import "sync"

func worker(id int, wg *sync.WaitGroup) {
    defer wg.Done() // 确保在函数结束时调用Done()
    
    fmt.Printf("Worker %d starting\n", id)
    time.Sleep(time.Second)
    fmt.Printf("Worker %d done\n", id)
}

func main() {
    var wg sync.WaitGroup
    
    for i := 1; i <= 5; i++ {
        wg.Add(1)
        go worker(i, &wg)
    }
    
    wg.Wait() // 等待所有Goroutine完成
    fmt.Println("All workers completed")
}
```

### 5.2 Mutex（互斥锁）
```go
type SafeCounter struct {
    mu    sync.Mutex
    count int
}

func (c *SafeCounter) Increment() {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.count++
}

func (c *SafeCounter) GetCount() int {
    c.mu.Lock()
    defer c.mu.Unlock()
    return c.count
}

func main() {
    counter := SafeCounter{}
    
    for i := 0; i < 1000; i++ {
        go counter.Increment()
    }
    
    time.Sleep(time.Second)
    fmt.Println("Count:", counter.GetCount())
}
```

### 5.3 RWMutex（读写锁）
```go
type DataStore struct {
    mu    sync.RWMutex
    data  map[string]string
}

func (ds *DataStore) Set(key, value string) {
    ds.mu.Lock()
    defer ds.mu.Unlock()
    ds.data[key] = value
}

func (ds *DataStore) Get(key string) (string, bool) {
    ds.mu.RLock()
    defer ds.mu.RUnlock()
    value, exists := ds.data[key]
    return value, exists
}
```

## 6. Context包

### 6.1 基本用法
```go
import "context"

func worker(ctx context.Context) {
    for {
        select {
        case <-ctx.Done():
            fmt.Println("Worker cancelled")
            return
        default:
            fmt.Println("Working...")
            time.Sleep(time.Millisecond * 500)
        }
    }
}

func main() {
    ctx, cancel := context.WithCancel(context.Background())
    
    go worker(ctx)
    
    time.Sleep(time.Second * 2)
    cancel() // 取消所有子Goroutine
    
    time.Sleep(time.Second)
}
```

### 6.2 超时控制
```go
func main() {
    ctx, cancel := context.WithTimeout(context.Background(), time.Second*2)
    defer cancel()
    
    go func() {
        time.Sleep(time.Second * 3)
        fmt.Println("This won't be printed")
    }()
    
    <-ctx.Done()
    fmt.Println("Context cancelled due to timeout")
}
```

## 7. 并发模式

### 7.1 生产者-消费者模式
```go
func producer(ch chan<- int) {
    for i := 0; i < 10; i++ {
        ch <- i
        time.Sleep(time.Millisecond * 100)
    }
    close(ch)
}

func consumer(id int, ch <-chan int, wg *sync.WaitGroup) {
    defer wg.Done()
    for value := range ch {
        fmt.Printf("Consumer %d: %d\n", id, value)
    }
}

func main() {
    ch := make(chan int, 5)
    var wg sync.WaitGroup
    
    go producer(ch)
    
    for i := 0; i < 3; i++ {
        wg.Add(1)
        go consumer(i, ch, &wg)
    }
    
    wg.Wait()
}
```

### 7.2 工作池模式
```go
func worker(id int, jobs <-chan int, results chan<- int) {
    for j := range jobs {
        fmt.Printf("Worker %d processing job %d\n", id, j)
        time.Sleep(time.Millisecond * 500)
        results <- j * 2
    }
}

func main() {
    const numJobs = 10
    const numWorkers = 3
    
    jobs := make(chan int, numJobs)
    results := make(chan int, numJobs)
    
    // 启动workers
    for w := 1; w <= numWorkers; w++ {
        go worker(w, jobs, results)
    }
    
    // 发送jobs
    for j := 1; j <= numJobs; j++ {
        jobs <- j
    }
    close(jobs)
    
    // 收集结果
    for a := 1; a <= numJobs; a++ {
        <-results
    }
}
```

## 8. 常见陷阱和最佳实践

### 8.1 避免Goroutine泄漏
```go
// 错误示例
func leakyFunction() {
    go func() {
        for {
            // 无限循环，没有退出条件
        }
    }()
}

// 正确示例
func correctFunction() {
    done := make(chan bool)
    go func() {
        defer close(done)
        for {
            select {
            case <-done:
                return
            default:
                // 工作
            }
        }
    }()
    
    // 在适当的时候关闭done通道
    time.Sleep(time.Second)
    close(done)
}
```

### 8.2 避免竞态条件
```go
// 错误示例
var counter int

func increment() {
    counter++ // 竞态条件
}

// 正确示例
var counter int
var mu sync.Mutex

func increment() {
    mu.Lock()
    defer mu.Unlock()
    counter++
}
```

### 8.3 使用缓冲通道避免死锁
```go
// 可能导致死锁
ch := make(chan int)
ch <- 1 // 阻塞，因为没有接收者

// 使用缓冲通道
ch := make(chan int, 1)
ch <- 1 // 不会阻塞
```

## 9. 性能考虑

### 9.1 Goroutine开销
- 每个Goroutine大约占用2KB内存
- 可以轻松创建数百万个Goroutine

### 9.2 通道性能
- 无缓冲通道适合同步
- 有缓冲通道适合异步通信
- 避免在热点路径中使用通道

### 9.3 锁的性能
- 优先使用RWMutex进行读多写少的场景
- 考虑使用原子操作替代锁
- 避免锁的嵌套 