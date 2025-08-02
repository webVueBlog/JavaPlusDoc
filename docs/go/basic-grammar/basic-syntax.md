# GO语言基础语法

## 1. 程序结构

### 1.1 包声明
每个GO程序都必须属于一个包，包名通常与目录名相同。

```go
package main
```

### 1.2 导入包
使用`import`关键字导入其他包：

```go
import "fmt"
import "os"

// 或者使用括号导入多个包
import (
    "fmt"
    "os"
    "strings"
)
```

### 1.3 main函数
程序的入口点：

```go
func main() {
    fmt.Println("Hello, Go!")
}
```

## 2. 基本语法规则

### 2.1 语句结束
GO语言不需要分号结尾，但可以使用分号：

```go
fmt.Println("Hello")  // 推荐
fmt.Println("Hello"); // 也可以
```

### 2.2 注释
支持单行和多行注释：

```go
// 这是单行注释

/*
这是多行注释
可以跨越多行
*/
```

### 2.3 代码块
使用大括号定义代码块：

```go
func main() {
    if x > 0 {
        fmt.Println("Positive")
    }
}
```

## 3. 变量声明

### 3.1 使用var关键字
```go
var name string = "Go"
var age int = 25
var isStudent bool = true
```

### 3.2 类型推断
```go
var name = "Go"        // 自动推断为string
var age = 25          // 自动推断为int
var isStudent = true  // 自动推断为bool
```

### 3.3 短变量声明
```go
name := "Go"
age := 25
isStudent := true
```

### 3.4 批量声明
```go
var (
    name string = "Go"
    age  int    = 25
    city string = "Beijing"
)
```

## 4. 常量

### 4.1 常量声明
```go
const Pi = 3.14159
const (
    StatusOK = 200
    StatusNotFound = 404
)
```

### 4.2 iota枚举
```go
const (
    Sunday = iota    // 0
    Monday           // 1
    Tuesday          // 2
    Wednesday        // 3
)
```

## 5. 基本数据类型

### 5.1 整数类型
```go
var a int = 10        // 平台相关
var b int32 = 20      // 32位
var c int64 = 30      // 64位
var d uint = 40       // 无符号整数
```

### 5.2 浮点数类型
```go
var a float32 = 3.14
var b float64 = 3.14159265359
```

### 5.3 布尔类型
```go
var a bool = true
var b bool = false
```

### 5.4 字符串类型
```go
var str string = "Hello, Go!"
var multiLine = `这是一个
多行字符串`
```

### 5.5 复数类型
```go
var c complex64 = 3 + 4i
var d complex128 = 5 + 6i
```

## 6. 运算符

### 6.1 算术运算符
```go
a := 10
b := 3

sum := a + b      // 13
diff := a - b     // 7
product := a * b  // 30
quotient := a / b // 3
remainder := a % b // 1
```

### 6.2 比较运算符
```go
a := 10
b := 20

fmt.Println(a == b)  // false
fmt.Println(a != b)  // true
fmt.Println(a < b)   // true
fmt.Println(a > b)   // false
fmt.Println(a <= b)  // true
fmt.Println(a >= b)  // false
```

### 6.3 逻辑运算符
```go
a := true
b := false

fmt.Println(a && b)  // false
fmt.Println(a || b)  // true
fmt.Println(!a)      // false
```

## 7. 控制结构

### 7.1 if语句
```go
if x > 0 {
    fmt.Println("Positive")
} else if x < 0 {
    fmt.Println("Negative")
} else {
    fmt.Println("Zero")
}
```

### 7.2 for循环
```go
// 传统for循环
for i := 0; i < 10; i++ {
    fmt.Println(i)
}

// while风格
i := 0
for i < 10 {
    fmt.Println(i)
    i++
}

// 无限循环
for {
    fmt.Println("Infinite loop")
    break
}
```

### 7.3 range循环
```go
// 遍历数组
numbers := []int{1, 2, 3, 4, 5}
for index, value := range numbers {
    fmt.Printf("Index: %d, Value: %d\n", index, value)
}

// 只获取值
for _, value := range numbers {
    fmt.Println(value)
}

// 只获取索引
for index := range numbers {
    fmt.Println(index)
}
```

## 8. 函数基础

### 8.1 函数声明
```go
func add(a int, b int) int {
    return a + b
}

// 参数类型相同时可以简写
func multiply(a, b int) int {
    return a * b
}
```

### 8.2 多返回值
```go
func divide(a, b int) (int, error) {
    if b == 0 {
        return 0, fmt.Errorf("division by zero")
    }
    return a / b, nil
}
```

### 8.3 命名返回值
```go
func getPerson() (name string, age int) {
    name = "Alice"
    age = 25
    return // 裸返回
}
```

## 9. 完整示例

```go
package main

import "fmt"

func main() {
    // 变量声明
    name := "Go"
    age := 10
    
    // 条件判断
    if age > 5 {
        fmt.Printf("%s is %d years old\n", name, age)
    }
    
    // 循环
    for i := 0; i < 3; i++ {
        fmt.Printf("Count: %d\n", i)
    }
    
    // 函数调用
    result := add(10, 20)
    fmt.Printf("Sum: %d\n", result)
}

func add(a, b int) int {
    return a + b
}
```

## 10. 最佳实践

1. **命名规范**：
   - 使用驼峰命名法
   - 包名使用小写
   - 导出的函数和变量首字母大写

2. **代码格式**：
   - 使用`gofmt`格式化代码
   - 保持一致的缩进

3. **错误处理**：
   - 始终检查错误返回值
   - 使用有意义的错误信息

4. **注释**：
   - 为导出的函数添加注释
   - 使用清晰的注释说明复杂逻辑 