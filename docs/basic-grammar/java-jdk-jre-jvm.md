> 💫 甜心，保持规律的作息，这样学习效果会更好呢～

---
title: Java、JDK、JRE、JVM详解与演示
author: 哪吒
date: '2024-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

# Java、JDK、JRE、JVM详解与演示

## 概述

在Java开发中，经常会遇到Java、JDK、JRE、JVM这几个概念，它们之间既有联系又有区别。本文将详细讲解这些概念，并通过图表和代码演示帮助理解。

## 1. 基本概念

### 1.1 Java

**Java** 是一种面向对象的编程语言，具有以下特点：
- **跨平台性**："一次编写，到处运行"（Write Once, Run Anywhere）
- **面向对象**：支持封装、继承、多态
- **安全性**：内置安全机制
- **多线程**：支持并发编程
- **自动内存管理**：垃圾回收机制

### 1.2 JVM（Java Virtual Machine）

**JVM** 是Java虚拟机，是Java程序运行的核心环境：

```
┌─────────────────────────────────────┐
│              JVM 架构                │
├─────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐   │
│  │   类加载器   │  │   执行引擎   │   │
│  │ ClassLoader │  │Execution Eng│   │
│  └─────────────┘  └─────────────┘   │
│  ┌─────────────────────────────────┐ │
│  │         运行时数据区域            │ │
│  │ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ │ │
│  │ │方法区│ │ 堆  │ │虚拟机│ │本地方│ │ │
│  │ │     │ │     │ │ 栈  │ │法栈 │ │ │
│  │ └─────┘ └─────┘ └─────┘ └─────┘ │ │
│  └─────────────────────────────────┘ │
│  ┌─────────────────────────────────┐ │
│  │         本地方法接口             │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**JVM的主要功能：**
- 加载和执行字节码文件
- 内存管理和垃圾回收
- 提供运行时环境
- 实现跨平台特性

### 1.3 JRE（Java Runtime Environment）

**JRE** 是Java运行时环境，包含运行Java程序所需的所有组件：

```
┌─────────────────────────────────────┐
│                JRE                  │
├─────────────────────────────────────┤
│  ┌─────────────────────────────────┐ │
│  │              JVM                │ │
│  │  ┌─────────┐ ┌─────────────────┐│ │
│  │  │类加载器 │ │   执行引擎       ││ │
│  │  └─────────┘ └─────────────────┘│ │
│  │  ┌─────────────────────────────┐ │ │
│  │  │      运行时数据区域          │ │ │
│  │  └─────────────────────────────┘ │ │
│  └─────────────────────────────────┘ │
│  ┌─────────────────────────────────┐ │
│  │          Java类库               │ │
│  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐│ │
│  │  │java.│ │java.│ │java.│ │java.││ │
│  │  │lang │ │util │ │io   │ │net  ││ │
│  │  └─────┘ └─────┘ └─────┘ └─────┘│ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**JRE包含：**
- JVM（Java虚拟机）
- Java核心类库
- 支持文件

### 1.4 JDK（Java Development Kit）

**JDK** 是Java开发工具包，包含开发Java程序所需的所有工具：

```
┌─────────────────────────────────────┐
│                JDK                  │
├─────────────────────────────────────┤
│  ┌─────────────────────────────────┐ │
│  │              JRE                │ │
│  │  ┌─────────────────────────────┐ │ │
│  │  │             JVM             │ │ │
│  │  └─────────────────────────────┘ │ │
│  │  ┌─────────────────────────────┐ │ │
│  │  │          Java类库           │ │ │
│  │  └─────────────────────────────┘ │ │
│  └─────────────────────────────────┘ │
│  ┌─────────────────────────────────┐ │
│  │           开发工具              │ │
│  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐│ │
│  │  │javac│ │java │ │javap│ │jdb  ││ │
│  │  │编译器│ │解释器│ │反编译│ │调试器││ │
│  │  └─────┘ └─────┘ └─────┘ └─────┘│ │
│  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐│ │
│  │  │jar  │ │javah│ │jstat│ │jmap ││ │
│  │  │打包 │ │头文件│ │监控 │ │内存 ││ │
│  │  └─────┘ └─────┘ └─────┘ └─────┘│ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**JDK包含：**
- JRE（Java运行时环境）
- 编译器（javac）
- 调试器（jdb）
- 文档生成器（javadoc）
- 打包工具（jar）
- 其他开发工具

## 2. 关系图解

### 2.1 包含关系

```
┌─────────────────────────────────────────────────────┐
│                      JDK                            │
│  ┌─────────────────────────────────────────────────┐│
│  │                    JRE                          ││
│  │  ┌─────────────────────────────────────────────┐││
│  │  │                  JVM                        │││
│  │  │                                             │││
│  │  │  Java程序在这里运行                          │││
│  │  │                                             │││
│  │  └─────────────────────────────────────────────┘││
│  │  Java类库 + 支持文件                            ││
│  └─────────────────────────────────────────────────┘│
│  开发工具（javac, java, javadoc, jar等）             │
└─────────────────────────────────────────────────────┘
```

### 2.2 工作流程

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Java源码   │───▶│   字节码    │───▶│   机器码    │
│  (.java)   │    │  (.class)   │    │            │
└─────────────┘    └─────────────┘    └─────────────┘
       │                  │                  │
       ▼                  ▼                  ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    javac    │    │     JVM     │    │   操作系统   │
│   (JDK)     │    │   (JRE)     │    │            │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 3. 代码演示

### 3.1 Java程序示例

创建一个简单的Java程序来演示整个过程：

```java
// HelloJava.java
public class HelloJava {
    public static void main(String[] args) {
        System.out.println("Hello, Java World!");
        
        // 演示JVM信息
        System.out.println("Java版本: " + System.getProperty("java.version"));
        System.out.println("JVM名称: " + System.getProperty("java.vm.name"));
        System.out.println("JVM版本: " + System.getProperty("java.vm.version"));
        System.out.println("操作系统: " + System.getProperty("os.name"));
        
        // 演示内存信息
        Runtime runtime = Runtime.getRuntime();
        long maxMemory = runtime.maxMemory();
        long totalMemory = runtime.totalMemory();
        long freeMemory = runtime.freeMemory();
        
        System.out.println("最大内存: " + maxMemory / 1024 / 1024 + " MB");
        System.out.println("总内存: " + totalMemory / 1024 / 1024 + " MB");
        System.out.println("空闲内存: " + freeMemory / 1024 / 1024 + " MB");
    }
}
```

### 3.2 编译和运行过程

```bash
# 1. 使用JDK中的javac编译Java源码
javac HelloJava.java

# 2. 生成字节码文件HelloJava.class
# 可以使用javap查看字节码
javap -c HelloJava

# 3. 使用JRE中的java命令运行程序
java HelloJava
```

### 3.3 JVM内存演示

```java
public class JVMMemoryDemo {
    public static void main(String[] args) {
        // 演示堆内存
        System.out.println("=== 堆内存演示 ===");
        
        // 创建对象（存储在堆中）
        String str1 = new String("Hello");
        String str2 = new String("World");
        
        System.out.println("创建对象后:");
        printMemoryInfo();
        
        // 演示垃圾回收
        str1 = null;
        str2 = null;
        System.gc(); // 建议进行垃圾回收
        
        System.out.println("垃圾回收后:");
        printMemoryInfo();
        
        // 演示方法区（元空间）
        System.out.println("\n=== 方法区演示 ===");
        Class<?> clazz = JVMMemoryDemo.class;
        System.out.println("类名: " + clazz.getName());
        System.out.println("类加载器: " + clazz.getClassLoader());
        
        // 演示栈内存
        System.out.println("\n=== 栈内存演示 ===");
        recursiveMethod(5);
    }
    
    private static void printMemoryInfo() {
        Runtime runtime = Runtime.getRuntime();
        long total = runtime.totalMemory();
        long free = runtime.freeMemory();
        long used = total - free;
        
        System.out.println("总内存: " + total / 1024 / 1024 + " MB");
        System.out.println("已用内存: " + used / 1024 / 1024 + " MB");
        System.out.println("空闲内存: " + free / 1024 / 1024 + " MB");
    }
    
    private static void recursiveMethod(int depth) {
        System.out.println("递归深度: " + depth + " (栈帧)");
        if (depth > 0) {
            recursiveMethod(depth - 1);
        }
    }
}
```

## 4. JVM内存结构详解

### 4.1 内存区域划分

```
┌─────────────────────────────────────────────────────┐
│                   JVM内存结构                        │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────────────────┐│
│  │    方法区        │  │           堆内存             ││
│  │  (Method Area)  │  │          (Heap)             ││
│  │                 │  │                             ││
│  │ • 类信息        │  │  ┌─────────────────────────┐ ││
│  │ • 常量池        │  │  │       新生代 (Young)     │ ││
│  │ • 静态变量      │  │  │  ┌─────┐ ┌─────┐ ┌─────┐│ ││
│  │                 │  │  │  │Eden │ │ S0  │ │ S1  ││ ││
│  └─────────────────┘  │  │  └─────┘ └─────┘ └─────┘│ ││
│                       │  └─────────────────────────┘ ││
│  ┌─────────────────┐  │  ┌─────────────────────────┐ ││
│  │   程序计数器     │  │  │       老年代 (Old)       │ ││
│  │     (PC)        │  │  │                         │ ││
│  └─────────────────┘  │  └─────────────────────────┘ ││
│                       └─────────────────────────────┘│
│  ┌─────────────────┐  ┌─────────────────────────────┐│
│  │   虚拟机栈       │  │      本地方法栈              ││
│  │  (VM Stack)     │  │  (Native Method Stack)     ││
│  │                 │  │                             ││
│  │ • 局部变量表    │  │ • 本地方法调用               ││
│  │ • 操作数栈      │  │                             ││
│  │ • 动态链接      │  │                             ││
│  │ • 方法出口      │  │                             ││
│  └─────────────────┘  └─────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

### 4.2 内存分配演示

```java
public class MemoryAllocationDemo {
    // 静态变量 - 存储在方法区
    private static String staticVar = "存储在方法区";
    
    // 实例变量 - 存储在堆中
    private String instanceVar = "存储在堆中";
    
    public static void main(String[] args) {
        // 局部变量 - 存储在栈中
        int localVar = 100;
        
        // 对象引用 - 存储在栈中，对象本身存储在堆中
        MemoryAllocationDemo demo = new MemoryAllocationDemo();
        
        // 字符串常量 - 存储在字符串常量池（方法区）
        String str1 = "Hello";
        String str2 = "Hello"; // 指向同一个常量池中的对象
        
        // 新建字符串对象 - 存储在堆中
        String str3 = new String("Hello");
        
        System.out.println("str1 == str2: " + (str1 == str2)); // true
        System.out.println("str1 == str3: " + (str1 == str3)); // false
        System.out.println("str1.equals(str3): " + str1.equals(str3)); // true
        
        // 调用方法 - 在栈中创建新的栈帧
        demo.methodCall(localVar);
    }
    
    private void methodCall(int param) {
        // 方法参数和局部变量都存储在当前栈帧中
        String localStr = "方法内局部变量";
        System.out.println("参数值: " + param);
        System.out.println("局部变量: " + localStr);
        System.out.println("实例变量: " + this.instanceVar);
        System.out.println("静态变量: " + staticVar);
    }
}
```

## 5. 垃圾回收演示

```java
public class GarbageCollectionDemo {
    public static void main(String[] args) {
        System.out.println("=== 垃圾回收演示 ===");
        
        // 创建大量对象
        for (int i = 0; i < 100000; i++) {
            String str = new String("对象" + i);
            // 对象创建后立即失去引用，成为垃圾回收的候选
        }
        
        System.out.println("创建对象后:");
        printGCInfo();
        
        // 手动触发垃圾回收
        System.gc();
        
        // 等待垃圾回收完成
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        
        System.out.println("垃圾回收后:");
        printGCInfo();
    }
    
    private static void printGCInfo() {
        Runtime runtime = Runtime.getRuntime();
        long total = runtime.totalMemory();
        long free = runtime.freeMemory();
        long used = total - free;
        
        System.out.println("总内存: " + formatMemory(total));
        System.out.println("已用内存: " + formatMemory(used));
        System.out.println("空闲内存: " + formatMemory(free));
        System.out.println("内存使用率: " + String.format("%.2f%%", (double) used / total * 100));
        System.out.println("─────────────────────────────");
    }
    
    private static String formatMemory(long bytes) {
        return String.format("%.2f MB", bytes / 1024.0 / 1024.0);
    }
}
```

## 6. 总结

### 6.1 关键区别

| 组件 | 用途 | 包含内容 | 使用场景 |
|------|------|----------|----------|
| **Java** | 编程语言 | 语法规范、API | 编写程序 |
| **JVM** | 运行环境 | 虚拟机、内存管理、垃圾回收 | 运行字节码 |
| **JRE** | 运行时环境 | JVM + 核心类库 | 运行Java程序 |
| **JDK** | 开发工具包 | JRE + 开发工具 | 开发Java程序 |

### 6.2 实际应用

```
开发阶段：需要JDK
┌─────────────────────────────────────┐
│ 编写代码 → 编译 → 测试 → 调试 → 打包 │
│   IDE      javac    java    jdb   jar │
└─────────────────────────────────────┘

生产阶段：只需要JRE
┌─────────────────────────────────────┐
│        部署 → 运行 → 监控           │
│              java    jstat          │
└─────────────────────────────────────┘
```

### 6.3 最佳实践

1. **开发环境**：安装完整的JDK
2. **生产环境**：可以只安装JRE以节省空间
3. **版本管理**：确保开发和生产环境使用相同版本
4. **内存调优**：根据应用需求调整JVM参数
5. **监控工具**：使用JDK提供的工具监控应用性能

通过以上详细的讲解和演示，相信你已经对Java、JDK、JRE、JVM有了深入的理解。这些概念是Java开发的基础，掌握它们对于成为一名优秀的Java开发者至关重要。