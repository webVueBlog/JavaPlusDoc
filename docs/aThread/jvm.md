---
title: jvm基础知识
author: 哪吒
date: '2023-06-15'
---

# JVM基础知识

## 1. JVM概述

### 1.1 什么是JVM

Java虚拟机（Java Virtual Machine，JVM）是Java程序的运行环境，它是Java实现"一次编译，到处运行"的核心。JVM负责将Java字节码转换为特定平台的机器码，并提供内存管理、垃圾回收、安全检查等功能。

### 1.2 JVM的作用

1. **平台无关性**：屏蔽底层操作系统的差异
2. **内存管理**：自动分配和回收内存
3. **安全性**：提供安全的执行环境
4. **性能优化**：即时编译优化、热点代码优化

### 1.3 JVM、JRE、JDK的关系

```
JDK (Java Development Kit)
├── JRE (Java Runtime Environment)
│   ├── JVM (Java Virtual Machine)
│   └── Java类库
└── 开发工具 (javac、jar、javadoc等)
```

- **JVM**：Java虚拟机，负责执行字节码
- **JRE**：Java运行环境，包含JVM和Java类库
- **JDK**：Java开发工具包，包含JRE和开发工具

## 2. JVM架构

### 2.1 JVM整体架构

```
┌─────────────────────────────────────────────────────────┐
│                    Java应用程序                          │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                   类加载子系统                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│  │  启动类加载器 │ │  扩展类加载器 │ │ 应用程序加载器 │      │
│  └─────────────┘ └─────────────┘ └─────────────┘      │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                    运行时数据区                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│  │    方法区    │ │     堆      │ │   Java栈    │      │
│  └─────────────┘ └─────────────┘ └─────────────┘      │
│  ┌─────────────┐ ┌─────────────┐                      │
│  │   PC寄存器   │ │   本地方法栈  │                      │
│  └─────────────┘ └─────────────┘                      │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                    执行引擎                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│  │   解释器     │ │  即时编译器   │ │  垃圾回收器   │      │
│  └─────────────┘ └─────────────┘ └─────────────┘      │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                   本地方法接口                           │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                   本地方法库                            │
└─────────────────────────────────────────────────────────┘
```

### 2.2 主要组成部分

1. **类加载子系统**：负责加载、链接和初始化类
2. **运行时数据区**：JVM管理的内存区域
3. **执行引擎**：负责执行字节码
4. **本地方法接口**：与本地方法库交互
5. **本地方法库**：本地方法的具体实现

## 3. JVM内存模型

### 3.1 运行时数据区详解

#### 3.1.1 程序计数器（PC Register）

```java
public class PCRegisterExample {
    public static void main(String[] args) {
        int a = 1;  // PC指向这条指令
        int b = 2;  // 执行完上一条后，PC指向这条指令
        int c = a + b; // PC继续指向下一条指令
    }
}
```

**特点：**
- 线程私有，每个线程都有自己的PC寄存器
- 存储当前线程执行的字节码指令地址
- 唯一不会发生OutOfMemoryError的内存区域

#### 3.1.2 Java虚拟机栈（JVM Stack）

```java
public class StackExample {
    public static void main(String[] args) {
        method1(); // 栈帧1
    }
    
    public static void method1() {
        int localVar = 10; // 局部变量存储在栈帧中
        method2(); // 栈帧2
    }
    
    public static void method2() {
        String str = "Hello"; // 局部变量
        // 方法执行完毕，栈帧出栈
    }
}
```

**栈帧结构：**
```
┌─────────────────────────────────┐
│            栈帧 (Stack Frame)    │
├─────────────────────────────────┤
│         局部变量表               │
├─────────────────────────────────┤
│         操作数栈                │
├─────────────────────────────────┤
│       动态链接                  │
├─────────────────────────────────┤
│       方法返回地址               │
└─────────────────────────────────┘
```

**特点：**
- 线程私有
- 存储局部变量、操作数栈、动态链接、方法返回地址
- 可能抛出StackOverflowError和OutOfMemoryError

#### 3.1.3 本地方法栈（Native Method Stack）

```java
public class NativeMethodExample {
    // 本地方法声明
    public native void nativeMethod();
    
    static {
        // 加载本地库
        System.loadLibrary("nativelib");
    }
    
    public static void main(String[] args) {
        NativeMethodExample example = new NativeMethodExample();
        example.nativeMethod(); // 调用本地方法
    }
}
```

**特点：**
- 为本地方法服务
- 与Java虚拟机栈类似，但服务于native方法

#### 3.1.4 堆（Heap）

```java
public class HeapExample {
    private String instanceVar; // 实例变量存储在堆中
    
    public static void main(String[] args) {
        // 对象存储在堆中
        HeapExample obj1 = new HeapExample();
        HeapExample obj2 = new HeapExample();
        
        // 数组也存储在堆中
        int[] array = new int[1000];
        
        // 字符串常量池（在堆中）
        String str1 = "Hello";
        String str2 = new String("World");
    }
}
```

**堆内存结构（Java 8之前）：**
```
┌─────────────────────────────────────────────────────────┐
│                        堆内存                            │
├─────────────────────────────────────────────────────────┤
│                      新生代 (Young Generation)           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│  │    Eden     │ │ Survivor S0 │ │ Survivor S1 │      │
│  │    Space    │ │             │ │             │      │
│  └─────────────┘ └─────────────┘ └─────────────┘      │
├─────────────────────────────────────────────────────────┤
│                      老年代 (Old Generation)            │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                      永久代 (Permanent Generation)       │
│                    (Java 8之前)                        │
└─────────────────────────────────────────────────────────┘
```

**堆内存结构（Java 8及之后）：**
```
┌─────────────────────────────────────────────────────────┐
│                        堆内存                            │
├─────────────────────────────────────────────────────────┤
│                      新生代 (Young Generation)           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│  │    Eden     │ │ Survivor S0 │ │ Survivor S1 │      │
│  │    Space    │ │             │ │             │      │
│  └─────────────┘ └─────────────┘ └─────────────┘      │
├─────────────────────────────────────────────────────────┤
│                      老年代 (Old Generation)            │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                      元空间 (Metaspace)                 │
│                    (Java 8及之后)                      │
└─────────────────────────────────────────────────────────┘
```

**特点：**
- 线程共享
- 存储对象实例和数组
- 垃圾回收的主要区域
- 可能抛出OutOfMemoryError

#### 3.1.5 方法区（Method Area）

```java
public class MethodAreaExample {
    // 类变量（静态变量）存储在方法区
    private static String staticVar = "Static Variable";
    
    // 常量存储在方法区
    private static final String CONSTANT = "Constant Value";
    
    // 方法信息存储在方法区
    public void instanceMethod() {
        System.out.println("Instance method");
    }
    
    public static void staticMethod() {
        System.out.println("Static method");
    }
}
```

**方法区存储内容：**
- 类信息（类名、访问修饰符、父类信息等）
- 方法信息（方法名、返回类型、参数信息、字节码等）
- 字段信息（字段名、类型、访问修饰符等）
- 静态变量
- 常量池
- 即时编译器编译后的代码

**特点：**
- 线程共享
- 存储类级别的信息
- Java 8之前称为永久代，Java 8及之后称为元空间

### 3.2 内存分配示例

```java
public class MemoryAllocationExample {
    // 类变量 - 存储在方法区
    private static int classVar = 100;
    
    // 实例变量 - 存储在堆中（对象的一部分）
    private int instanceVar = 200;
    
    public static void main(String[] args) {
        // 局部变量 - 存储在栈中
        int localVar = 300;
        
        // 对象 - 存储在堆中
        MemoryAllocationExample obj = new MemoryAllocationExample();
        
        // 数组 - 存储在堆中
        int[] array = new int[10];
        
        // 字符串字面量 - 存储在字符串常量池（堆中）
        String str1 = "Hello";
        
        // 字符串对象 - 存储在堆中
        String str2 = new String("World");
        
        // 调用方法
        obj.methodCall(localVar);
    }
    
    public void methodCall(int param) {
        // 方法参数和局部变量 - 存储在栈中
        int methodLocal = param + instanceVar;
        
        // 创建新对象 - 存储在堆中
        Object tempObj = new Object();
    }
}
```

## 4. 垃圾回收（Garbage Collection）

### 4.1 垃圾回收概述

垃圾回收是JVM自动管理内存的机制，负责回收不再使用的对象所占用的内存空间。

### 4.2 对象存活判断

#### 4.2.1 引用计数法

```java
public class ReferenceCountingExample {
    private ReferenceCountingExample reference;
    
    public static void main(String[] args) {
        ReferenceCountingExample obj1 = new ReferenceCountingExample();
        ReferenceCountingExample obj2 = new ReferenceCountingExample();
        
        // 循环引用问题
        obj1.reference = obj2;
        obj2.reference = obj1;
        
        // 即使obj1和obj2不再被外部引用，
        // 但它们相互引用，引用计数不为0
        obj1 = null;
        obj2 = null;
        
        // 引用计数法无法回收这种循环引用的对象
    }
}
```

**问题：** 无法解决循环引用问题

#### 4.2.2 可达性分析算法

```java
public class ReachabilityAnalysisExample {
    private static ReachabilityAnalysisExample staticRef; // GC Root
    private ReachabilityAnalysisExample instanceRef;
    
    public static void main(String[] args) {
        // main方法的局部变量是GC Root
        ReachabilityAnalysisExample obj1 = new ReachabilityAnalysisExample();
        ReachabilityAnalysisExample obj2 = new ReachabilityAnalysisExample();
        ReachabilityAnalysisExample obj3 = new ReachabilityAnalysisExample();
        
        // 建立引用关系
        obj1.instanceRef = obj2;
        obj2.instanceRef = obj3;
        
        // obj1可达（通过局部变量）
        // obj2可达（通过obj1.instanceRef）
        // obj3可达（通过obj2.instanceRef）
        
        obj1 = null; // 断开引用链
        
        // 现在obj1、obj2、obj3都不可达，可以被回收
        System.gc(); // 建议进行垃圾回收
    }
}
```

**GC Roots包括：**
- 虚拟机栈中的引用
- 方法区中静态属性引用的对象
- 方法区中常量引用的对象
- 本地方法栈中JNI引用的对象
- JVM内部引用
- 同步锁持有的对象
- JVM内部的JMXBean、JVMTI中注册的回调、本地代码缓存等

### 4.3 垃圾回收算法

#### 4.3.1 标记-清除算法（Mark-Sweep）

```java
/**
 * 标记-清除算法示例
 * 
 * 阶段1：标记阶段
 * ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
 * │ A ✓ │ │ B ✗ │ │ C ✓ │ │ D ✗ │ │ E ✓ │
 * └─────┘ └─────┘ └─────┘ └─────┘ └─────┘
 * 
 * 阶段2：清除阶段
 * ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
 * │ A ✓ │ │     │ │ C ✓ │ │     │ │ E ✓ │
 * └─────┘ └─────┘ └─────┘ └─────┘ └─────┘
 * 
 * 问题：产生内存碎片
 */
public class MarkSweepExample {
    public static void demonstrateFragmentation() {
        // 创建大量小对象
        List<Object> objects = new ArrayList<>();
        for (int i = 0; i < 1000; i++) {
            objects.add(new Object());
        }
        
        // 清除一半对象，模拟标记-清除
        for (int i = 0; i < objects.size(); i += 2) {
            objects.set(i, null);
        }
        
        // 此时内存中存在碎片
        // 尝试分配大对象可能失败
        try {
            byte[] largeArray = new byte[1024 * 1024]; // 1MB
        } catch (OutOfMemoryError e) {
            System.out.println("内存碎片导致大对象分配失败");
        }
    }
}
```

**优点：** 实现简单
**缺点：** 产生内存碎片，效率不高

#### 4.3.2 标记-复制算法（Mark-Copy）

```java
/**
 * 标记-复制算法示例
 * 
 * 原始内存区域：
 * ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
 * │ A ✓ │ │ B ✗ │ │ C ✓ │ │ D ✗ │ │ E ✓ │
 * └─────┘ └─────┘ └─────┘ └─────┘ └─────┘
 * 
 * 复制后的内存区域：
 * ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
 * │ A ✓ │ │ C ✓ │ │ E ✓ │ │     │ │     │
 * └─────┘ └─────┘ └─────┘ └─────┘ └─────┘
 */
public class MarkCopyExample {
    public static void demonstrateCopying() {
        // 模拟新生代的Eden区
        List<Object> edenSpace = new ArrayList<>();
        
        // 创建对象
        for (int i = 0; i < 100; i++) {
            edenSpace.add(new Object());
        }
        
        // 模拟GC：将存活对象复制到Survivor区
        List<Object> survivorSpace = new ArrayList<>();
        
        // 假设只有一半对象存活
        for (int i = 0; i < edenSpace.size(); i += 2) {
            Object obj = edenSpace.get(i);
            if (obj != null) {
                survivorSpace.add(obj); // 复制存活对象
            }
        }
        
        // 清空Eden区
        edenSpace.clear();
        
        System.out.println("复制算法完成，存活对象数量：" + survivorSpace.size());
    }
}
```

**优点：** 没有内存碎片，效率高
**缺点：** 浪费一半内存空间

#### 4.3.3 标记-整理算法（Mark-Compact）

```java
/**
 * 标记-整理算法示例
 * 
 * 标记阶段：
 * ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
 * │ A ✓ │ │ B ✗ │ │ C ✓ │ │ D ✗ │ │ E ✓ │
 * └─────┘ └─────┘ └─────┘ └─────┘ └─────┘
 * 
 * 整理阶段：
 * ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
 * │ A ✓ │ │ C ✓ │ │ E ✓ │ │     │ │     │
 * └─────┘ └─────┘ └─────┘ └─────┘ └─────┘
 */
public class MarkCompactExample {
    public static void demonstrateCompaction() {
        // 模拟老年代内存
        Object[] memory = new Object[100];
        
        // 分配对象，模拟内存碎片
        for (int i = 0; i < memory.length; i++) {
            if (i % 3 != 0) { // 模拟部分对象存活
                memory[i] = new Object();
            }
        }
        
        // 标记-整理：将存活对象向前移动
        int writeIndex = 0;
        for (int readIndex = 0; readIndex < memory.length; readIndex++) {
            if (memory[readIndex] != null) {
                memory[writeIndex] = memory[readIndex];
                if (writeIndex != readIndex) {
                    memory[readIndex] = null; // 清除原位置
                }
                writeIndex++;
            }
        }
        
        System.out.println("整理完成，存活对象数量：" + writeIndex);
        System.out.println("连续可用空间：" + (memory.length - writeIndex));
    }
}
```

**优点：** 没有内存碎片，不浪费内存
**缺点：** 需要移动对象，效率较低

### 4.4 分代收集算法

```java
public class GenerationalGCExample {
    // 模拟不同生命周期的对象
    private static List<Object> longLivedObjects = new ArrayList<>(); // 长期存活
    
    public static void main(String[] args) {
        // 创建一些长期存活的对象（会进入老年代）
        for (int i = 0; i < 10; i++) {
            longLivedObjects.add(new Object());
        }
        
        // 模拟应用程序运行
        for (int generation = 0; generation < 100; generation++) {
            createShortLivedObjects(); // 创建短期对象
            
            if (generation % 10 == 0) {
                // 模拟Minor GC
                System.out.println("执行Minor GC - 清理新生代");
            }
            
            if (generation % 50 == 0) {
                // 模拟Major GC
                System.out.println("执行Major GC - 清理老年代");
            }
        }
    }
    
    private static void createShortLivedObjects() {
        // 创建短期存活的对象（在新生代被回收）
        List<Object> tempObjects = new ArrayList<>();
        for (int i = 0; i < 1000; i++) {
            tempObjects.add(new Object());
        }
        // 方法结束后，tempObjects变为不可达，等待GC回收
    }
}
```

**分代假设：**
1. 大部分对象都是朝生夕死的
2. 熬过越多次垃圾收集过程的对象就越难以消亡

### 4.5 常见垃圾收集器

#### 4.5.1 Serial收集器

```java
/**
 * Serial收集器特点：
 * - 单线程收集
 * - 收集时必须暂停所有工作线程（Stop The World）
 * - 适用于客户端应用
 * 
 * JVM参数：-XX:+UseSerialGC
 */
public class SerialGCExample {
    public static void main(String[] args) {
        // 设置较小的堆内存以便观察GC
        // -Xms10m -Xmx10m -XX:+UseSerialGC -XX:+PrintGC
        
        List<byte[]> objects = new ArrayList<>();
        
        try {
            while (true) {
                // 不断创建对象，触发GC
                objects.add(new byte[1024 * 1024]); // 1MB
                Thread.sleep(100);
            }
        } catch (OutOfMemoryError | InterruptedException e) {
            System.out.println("程序结束");
        }
    }
}
```

#### 4.5.2 Parallel收集器

```java
/**
 * Parallel收集器特点：
 * - 多线程并行收集
 * - 关注吞吐量
 * - 适用于服务端应用
 * 
 * JVM参数：-XX:+UseParallelGC
 */
public class ParallelGCExample {
    public static void main(String[] args) {
        // JVM参数：-XX:+UseParallelGC -XX:ParallelGCThreads=4
        
        // 创建多个线程模拟高并发场景
        for (int i = 0; i < 4; i++) {
            new Thread(() -> {
                List<Object> objects = new ArrayList<>();
                for (int j = 0; j < 10000; j++) {
                    objects.add(new Object());
                    if (j % 1000 == 0) {
                        objects.clear(); // 定期清理，触发GC
                    }
                }
            }, "Worker-" + i).start();
        }
    }
}
```

#### 4.5.3 CMS收集器

```java
/**
 * CMS (Concurrent Mark Sweep) 收集器特点：
 * - 并发收集，低延迟
 * - 使用标记-清除算法
 * - 适用于对响应时间要求高的应用
 * 
 * JVM参数：-XX:+UseConcMarkSweepGC
 */
public class CMSGCExample {
    private static volatile boolean running = true;
    
    public static void main(String[] args) throws InterruptedException {
        // JVM参数：-XX:+UseConcMarkSweepGC -XX:+PrintGCDetails
        
        // 启动后台线程持续分配对象
        Thread allocatorThread = new Thread(() -> {
            List<Object> objects = new ArrayList<>();
            while (running) {
                objects.add(new Object());
                if (objects.size() > 10000) {
                    objects.clear();
                }
                try {
                    Thread.sleep(1);
                } catch (InterruptedException e) {
                    break;
                }
            }
        });
        
        allocatorThread.start();
        
        // 主线程模拟业务处理
        for (int i = 0; i < 100; i++) {
            // 模拟业务处理，对延迟敏感
            long start = System.currentTimeMillis();
            
            // 模拟业务逻辑
            Thread.sleep(50);
            
            long end = System.currentTimeMillis();
            System.out.println("业务处理耗时：" + (end - start) + "ms");
        }
        
        running = false;
        allocatorThread.join();
    }
}
```

#### 4.5.4 G1收集器

```java
/**
 * G1 (Garbage First) 收集器特点：
 * - 低延迟，可预测的停顿时间
 * - 将堆分为多个Region
 * - 优先回收垃圾最多的Region
 * 
 * JVM参数：-XX:+UseG1GC
 */
public class G1GCExample {
    public static void main(String[] args) {
        // JVM参数：-XX:+UseG1GC -XX:MaxGCPauseMillis=200 -XX:+PrintGCDetails
        
        // 创建不同大小的对象，测试G1的Region管理
        List<Object> smallObjects = new ArrayList<>();
        List<Object> largeObjects = new ArrayList<>();
        
        for (int i = 0; i < 1000; i++) {
            // 小对象
            smallObjects.add(new byte[1024]); // 1KB
            
            // 大对象（超过Region大小的一半）
            if (i % 100 == 0) {
                largeObjects.add(new byte[1024 * 1024]); // 1MB
            }
            
            // 定期清理部分对象
            if (i % 200 == 0) {
                smallObjects.subList(0, smallObjects.size() / 2).clear();
            }
        }
        
        System.out.println("G1GC测试完成");
    }
}
```

## 5. 类加载机制

### 5.1 类加载过程

类加载过程包括：**加载 → 验证 → 准备 → 解析 → 初始化**

```java
public class ClassLoadingExample {
    // 静态变量在准备阶段分配内存并设置默认值
    // 在初始化阶段执行初始化
    private static int staticVar = 100;
    
    // 静态代码块在初始化阶段执行
    static {
        System.out.println("静态代码块执行，staticVar = " + staticVar);
        staticVar = 200;
    }
    
    // 实例变量在对象创建时初始化
    private int instanceVar = 300;
    
    // 构造方法在对象创建时执行
    public ClassLoadingExample() {
        System.out.println("构造方法执行，instanceVar = " + instanceVar);
    }
    
    public static void main(String[] args) {
        System.out.println("main方法开始执行");
        
        // 第一次使用类时触发类加载
        System.out.println("staticVar = " + ClassLoadingExample.staticVar);
        
        // 创建对象
        ClassLoadingExample obj = new ClassLoadingExample();
    }
}
```

**输出结果：**
```
main方法开始执行
静态代码块执行，staticVar = 100
staticVar = 200
构造方法执行，instanceVar = 300
```

### 5.2 类加载器

#### 5.2.1 类加载器层次结构

```java
public class ClassLoaderExample {
    public static void main(String[] args) {
        // 获取当前类的类加载器
        ClassLoader classLoader = ClassLoaderExample.class.getClassLoader();
        System.out.println("当前类的类加载器：" + classLoader);
        
        // 获取父类加载器
        ClassLoader parent = classLoader.getParent();
        System.out.println("父类加载器：" + parent);
        
        // 获取祖父类加载器（启动类加载器）
        ClassLoader grandParent = parent.getParent();
        System.out.println("祖父类加载器：" + grandParent); // null表示启动类加载器
        
        // 查看系统类的类加载器
        ClassLoader stringClassLoader = String.class.getClassLoader();
        System.out.println("String类的类加载器：" + stringClassLoader); // null表示启动类加载器
        
        // 查看扩展类的类加载器
        try {
            Class<?> zipFileClass = Class.forName("java.util.zip.ZipFile");
            System.out.println("ZipFile类的类加载器：" + zipFileClass.getClassLoader());
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
    }
}
```

#### 5.2.2 双亲委派模型

```java
public class ParentDelegationExample {
    public static void main(String[] args) {
        // 演示双亲委派模型
        try {
            // 尝试加载系统类
            Class<?> stringClass = Class.forName("java.lang.String");
            System.out.println("String类加载器：" + stringClass.getClassLoader());
            
            // 尝试加载应用程序类
            Class<?> currentClass = Class.forName("ParentDelegationExample");
            System.out.println("当前类加载器：" + currentClass.getClassLoader());
            
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
    }
}

/**
 * 自定义类加载器示例
 */
class CustomClassLoader extends ClassLoader {
    private String classPath;
    
    public CustomClassLoader(String classPath) {
        this.classPath = classPath;
    }
    
    @Override
    protected Class<?> findClass(String name) throws ClassNotFoundException {
        try {
            // 读取类文件字节码
            byte[] classData = loadClassData(name);
            if (classData != null) {
                // 定义类
                return defineClass(name, classData, 0, classData.length);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        throw new ClassNotFoundException(name);
    }
    
    private byte[] loadClassData(String className) {
        // 实际实现中应该从文件系统或网络加载类文件
        // 这里只是示例
        return null;
    }
    
    public static void demonstrateCustomClassLoader() {
        CustomClassLoader customLoader = new CustomClassLoader("/custom/classes");
        
        try {
            // 使用自定义类加载器加载类
            Class<?> customClass = customLoader.loadClass("com.example.CustomClass");
            System.out.println("自定义类加载器：" + customClass.getClassLoader());
            
        } catch (ClassNotFoundException e) {
            System.out.println("类未找到：" + e.getMessage());
        }
    }
}
```

### 5.3 类初始化时机

```java
class Parent {
    static {
        System.out.println("Parent类静态代码块");
    }
    
    public static int parentStaticVar = 1;
    
    static {
        System.out.println("Parent类静态代码块2，parentStaticVar = " + parentStaticVar);
    }
}

class Child extends Parent {
    static {
        System.out.println("Child类静态代码块");
    }
    
    public static int childStaticVar = 2;
}

public class ClassInitializationExample {
    public static void main(String[] args) {
        System.out.println("=== 测试1：访问父类静态变量 ===");
        System.out.println(Parent.parentStaticVar);
        
        System.out.println("\n=== 测试2：访问子类静态变量 ===");
        System.out.println(Child.childStaticVar);
        
        System.out.println("\n=== 测试3：创建子类实例 ===");
        Child child = new Child();
    }
}
```

**类初始化的触发条件：**
 1. 创建类的实例
 2. 访问类的静态变量（除了final常量）
 3. 调用类的静态方法
 4. 反射调用类
 5. 初始化子类时，父类还没有初始化
 6. JVM启动时指定的主类

## 6. JVM性能调优

### 6.1 JVM参数配置

#### 6.1.1 堆内存参数

```java
public class HeapParametersExample {
    public static void main(String[] args) {
        // 获取JVM内存信息
        Runtime runtime = Runtime.getRuntime();
        
        long maxMemory = runtime.maxMemory(); // 最大可用内存
        long totalMemory = runtime.totalMemory(); // 当前JVM内存总量
        long freeMemory = runtime.freeMemory(); // 当前JVM空闲内存
        long usedMemory = totalMemory - freeMemory; // 已使用内存
        
        System.out.println("=== JVM内存信息 ===");
        System.out.println("最大内存: " + (maxMemory / 1024 / 1024) + "MB");
        System.out.println("总内存: " + (totalMemory / 1024 / 1024) + "MB");
        System.out.println("空闲内存: " + (freeMemory / 1024 / 1024) + "MB");
        System.out.println("已使用内存: " + (usedMemory / 1024 / 1024) + "MB");
        
        // 获取垃圾收集器信息
        java.lang.management.ManagementFactory.getGarbageCollectorMXBeans()
            .forEach(gcBean -> {
                System.out.println("GC名称: " + gcBean.getName());
                System.out.println("GC次数: " + gcBean.getCollectionCount());
                System.out.println("GC时间: " + gcBean.getCollectionTime() + "ms");
            });
    }
}
```

**常用堆内存参数：**
```bash
# 设置初始堆大小为512MB
-Xms512m

# 设置最大堆大小为2GB
-Xmx2g

# 设置新生代大小为256MB
-Xmn256m

# 设置新生代与老年代的比例（1:2）
-XX:NewRatio=2

# 设置Eden区与Survivor区的比例（8:1:1）
-XX:SurvivorRatio=8

# 设置对象进入老年代的年龄阈值
-XX:MaxTenuringThreshold=15
```

#### 6.1.2 垃圾收集器参数

```java
public class GCParametersExample {
    public static void main(String[] args) {
        // 模拟不同的内存分配模式
        demonstrateYoungGeneration();
        demonstrateOldGeneration();
    }
    
    // 模拟年轻代频繁分配
    private static void demonstrateYoungGeneration() {
        System.out.println("=== 年轻代分配测试 ===");
        for (int i = 0; i < 1000; i++) {
            // 创建短生命周期对象
            byte[] temp = new byte[1024 * 10]; // 10KB
            if (i % 100 == 0) {
                System.out.println("已分配对象: " + (i + 1));
            }
        }
    }
    
    // 模拟老年代分配
    private static void demonstrateOldGeneration() {
        System.out.println("\n=== 老年代分配测试 ===");
        java.util.List<byte[]> longLivedObjects = new java.util.ArrayList<>();
        
        for (int i = 0; i < 100; i++) {
            // 创建长生命周期对象
            byte[] longLived = new byte[1024 * 100]; // 100KB
            longLivedObjects.add(longLived);
            
            if (i % 20 == 0) {
                System.out.println("长期对象数量: " + longLivedObjects.size());
            }
        }
    }
}
```

**垃圾收集器选择参数：**
```bash
# 使用Serial收集器（适合单核CPU）
-XX:+UseSerialGC

# 使用Parallel收集器（适合多核CPU，关注吞吐量）
-XX:+UseParallelGC
-XX:ParallelGCThreads=4

# 使用CMS收集器（适合低延迟要求）
-XX:+UseConcMarkSweepGC
-XX:+CMSParallelRemarkEnabled
-XX:CMSInitiatingOccupancyFraction=70

# 使用G1收集器（适合大堆内存）
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200
-XX:G1HeapRegionSize=16m
```

#### 6.1.3 JIT编译器参数

```java
public class JITCompilerExample {
    private static final int ITERATIONS = 100000;
    
    public static void main(String[] args) {
        // 热身阶段，触发JIT编译
        System.out.println("=== JIT编译优化演示 ===");
        
        long startTime = System.currentTimeMillis();
        
        // 第一次执行（解释执行）
        for (int i = 0; i < ITERATIONS; i++) {
            calculateSum(i);
        }
        
        long interpretedTime = System.currentTimeMillis() - startTime;
        System.out.println("解释执行时间: " + interpretedTime + "ms");
        
        // 第二次执行（JIT编译后）
        startTime = System.currentTimeMillis();
        
        for (int i = 0; i < ITERATIONS; i++) {
            calculateSum(i);
        }
        
        long compiledTime = System.currentTimeMillis() - startTime;
        System.out.println("编译执行时间: " + compiledTime + "ms");
        System.out.println("性能提升: " + (interpretedTime / (double) compiledTime) + "倍");
    }
    
    // 热点方法，会被JIT编译器优化
    private static long calculateSum(int n) {
        long sum = 0;
        for (int i = 0; i <= n; i++) {
            sum += i;
        }
        return sum;
    }
}
```

**JIT编译器参数：**
```bash
# 设置方法调用次数阈值（触发JIT编译）
-XX:CompileThreshold=10000

# 禁用JIT编译器（仅解释执行）
-Xint

# 仅使用JIT编译器（不解释执行）
-Xcomp

# 混合模式（默认）
-Xmixed

# 打印JIT编译信息
-XX:+PrintCompilation
```

### 6.2 内存泄漏分析

#### 6.2.1 常见内存泄漏场景

```java
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public class MemoryLeakExamples {
    
    // 场景1：静态集合持有对象引用
    private static List<Object> staticList = new ArrayList<>();
    
    public static void demonstrateStaticCollectionLeak() {
        System.out.println("=== 静态集合内存泄漏演示 ===");
        
        for (int i = 0; i < 10000; i++) {
            // 不断向静态集合添加对象，但从不清理
            staticList.add(new LargeObject("Object-" + i));
        }
        
        System.out.println("静态集合大小: " + staticList.size());
        // 解决方案：定期清理或使用弱引用
        // staticList.clear();
    }
    
    // 场景2：监听器未注销
    private List<EventListener> listeners = new ArrayList<>();
    
    public void demonstrateListenerLeak() {
        System.out.println("\n=== 监听器内存泄漏演示 ===");
        
        for (int i = 0; i < 1000; i++) {
            EventListener listener = new EventListener("Listener-" + i);
            listeners.add(listener);
            // 问题：监听器注册后从未注销
        }
        
        System.out.println("监听器数量: " + listeners.size());
        // 解决方案：及时注销监听器
        // listeners.clear();
    }
    
    // 场景3：线程局部变量未清理
    private static ThreadLocal<LargeObject> threadLocal = new ThreadLocal<>();
    
    public static void demonstrateThreadLocalLeak() {
        System.out.println("\n=== ThreadLocal内存泄漏演示 ===");
        
        Thread thread = new Thread(() -> {
            // 设置ThreadLocal变量
            threadLocal.set(new LargeObject("ThreadLocal-Object"));
            
            // 模拟业务处理
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            
            // 问题：线程结束前未清理ThreadLocal
            // 解决方案：threadLocal.remove();
        });
        
        thread.start();
        try {
            thread.join();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
    
    // 场景4：缓存无限增长
    private static Map<String, Object> cache = new ConcurrentHashMap<>();
    
    public static void demonstrateCacheLeak() {
        System.out.println("\n=== 缓存内存泄漏演示 ===");
        
        for (int i = 0; i < 5000; i++) {
            String key = "cache-key-" + i;
            // 不断向缓存添加数据，但从不清理
            cache.put(key, new LargeObject(key));
        }
        
        System.out.println("缓存大小: " + cache.size());
        // 解决方案：使用LRU缓存或定期清理
    }
    
    public static void main(String[] args) {
        demonstrateStaticCollectionLeak();
        
        MemoryLeakExamples example = new MemoryLeakExamples();
        example.demonstrateListenerLeak();
        
        demonstrateThreadLocalLeak();
        demonstrateCacheLeak();
        
        // 建议进行垃圾回收
        System.gc();
        
        // 打印内存使用情况
        Runtime runtime = Runtime.getRuntime();
        long usedMemory = runtime.totalMemory() - runtime.freeMemory();
        System.out.println("\n当前内存使用: " + (usedMemory / 1024 / 1024) + "MB");
    }
}

// 模拟大对象
class LargeObject {
    private String name;
    private byte[] data = new byte[1024 * 10]; // 10KB
    
    public LargeObject(String name) {
        this.name = name;
    }
    
    @Override
    public String toString() {
        return "LargeObject{name='" + name + "'}";
    }
}

// 模拟事件监听器
class EventListener {
    private String name;
    
    public EventListener(String name) {
        this.name = name;
    }
    
    @Override
    public String toString() {
        return "EventListener{name='" + name + "'}";
    }
}
```

#### 6.2.2 内存泄漏检测工具

```java
import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.MemoryUsage;

public class MemoryMonitoringExample {
    
    public static void main(String[] args) {
        // 启动内存监控
        startMemoryMonitoring();
        
        // 模拟内存使用
        simulateMemoryUsage();
    }
    
    private static void startMemoryMonitoring() {
        System.out.println("=== 内存监控启动 ===");
        
        // 创建监控线程
        Thread monitorThread = new Thread(() -> {
            MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
            
            while (!Thread.currentThread().isInterrupted()) {
                try {
                    // 获取堆内存使用情况
                    MemoryUsage heapUsage = memoryBean.getHeapMemoryUsage();
                    
                    long used = heapUsage.getUsed();
                    long max = heapUsage.getMax();
                    double usagePercent = (double) used / max * 100;
                    
                    System.out.printf("堆内存使用: %d MB / %d MB (%.2f%%)%n",
                        used / 1024 / 1024, max / 1024 / 1024, usagePercent);
                    
                    // 内存使用率过高时发出警告
                    if (usagePercent > 80) {
                        System.out.println("⚠️ 警告：内存使用率过高！");
                    }
                    
                    Thread.sleep(2000); // 每2秒监控一次
                    
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        });
        
        monitorThread.setDaemon(true);
        monitorThread.start();
    }
    
    private static void simulateMemoryUsage() {
        List<byte[]> memoryConsumer = new ArrayList<>();
        
        try {
            for (int i = 0; i < 100; i++) {
                // 分配10MB内存
                byte[] chunk = new byte[10 * 1024 * 1024];
                memoryConsumer.add(chunk);
                
                System.out.println("分配内存块: " + (i + 1));
                Thread.sleep(1000);
                
                // 模拟释放部分内存
                if (i % 10 == 0 && !memoryConsumer.isEmpty()) {
                    memoryConsumer.remove(0);
                    System.out.println("释放内存块");
                }
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } catch (OutOfMemoryError e) {
            System.out.println("❌ 内存溢出: " + e.getMessage());
        }
    }
}
```

**内存分析工具：**
```bash
# 生成堆转储文件
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=/path/to/heapdump.hprof

# 使用jmap生成堆转储
jmap -dump:format=b,file=heap.hprof <pid>

# 使用jstat监控GC
jstat -gc <pid> 1s

# 使用jvisualvm进行可视化分析
jvisualvm
```

### 6.3 性能优化最佳实践

#### 6.3.1 对象创建优化

```java
public class ObjectCreationOptimization {
    
    // 对象池示例
    private static final Queue<StringBuilder> stringBuilderPool = 
        new java.util.concurrent.ConcurrentLinkedQueue<>();
    
    public static void main(String[] args) {
        demonstrateStringOptimization();
        demonstrateObjectPooling();
        demonstrateArrayOptimization();
    }
    
    // 字符串拼接优化
    private static void demonstrateStringOptimization() {
        System.out.println("=== 字符串拼接优化 ===");
        
        long startTime = System.currentTimeMillis();
        
        // 低效方式：String拼接
        String result1 = "";
        for (int i = 0; i < 10000; i++) {
            result1 += "item" + i;
        }
        
        long stringTime = System.currentTimeMillis() - startTime;
        System.out.println("String拼接耗时: " + stringTime + "ms");
        
        startTime = System.currentTimeMillis();
        
        // 高效方式：StringBuilder
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 10000; i++) {
            sb.append("item").append(i);
        }
        String result2 = sb.toString();
        
        long sbTime = System.currentTimeMillis() - startTime;
        System.out.println("StringBuilder耗时: " + sbTime + "ms");
        System.out.println("性能提升: " + (stringTime / (double) sbTime) + "倍");
    }
    
    // 对象池优化
    private static void demonstrateObjectPooling() {
        System.out.println("\n=== 对象池优化 ===");
        
        long startTime = System.currentTimeMillis();
        
        // 不使用对象池
        for (int i = 0; i < 10000; i++) {
            StringBuilder sb = new StringBuilder();
            sb.append("test").append(i);
            // StringBuilder被丢弃，等待GC
        }
        
        long noPoolTime = System.currentTimeMillis() - startTime;
        System.out.println("不使用对象池耗时: " + noPoolTime + "ms");
        
        startTime = System.currentTimeMillis();
        
        // 使用对象池
        for (int i = 0; i < 10000; i++) {
            StringBuilder sb = borrowStringBuilder();
            sb.append("test").append(i);
            returnStringBuilder(sb);
        }
        
        long poolTime = System.currentTimeMillis() - startTime;
        System.out.println("使用对象池耗时: " + poolTime + "ms");
        System.out.println("性能提升: " + (noPoolTime / (double) poolTime) + "倍");
    }
    
    private static StringBuilder borrowStringBuilder() {
        StringBuilder sb = stringBuilderPool.poll();
        if (sb == null) {
            sb = new StringBuilder();
        } else {
            sb.setLength(0); // 清空内容
        }
        return sb;
    }
    
    private static void returnStringBuilder(StringBuilder sb) {
        if (sb.capacity() < 1024) { // 避免池中对象过大
            stringBuilderPool.offer(sb);
        }
    }
    
    // 数组优化
    private static void demonstrateArrayOptimization() {
        System.out.println("\n=== 数组优化 ===");
        
        long startTime = System.currentTimeMillis();
        
        // 使用ArrayList动态扩容
        List<Integer> list = new ArrayList<>();
        for (int i = 0; i < 100000; i++) {
            list.add(i);
        }
        
        long listTime = System.currentTimeMillis() - startTime;
        System.out.println("ArrayList耗时: " + listTime + "ms");
        
        startTime = System.currentTimeMillis();
        
        // 预分配容量
        List<Integer> preAllocatedList = new ArrayList<>(100000);
        for (int i = 0; i < 100000; i++) {
            preAllocatedList.add(i);
        }
        
        long preAllocTime = System.currentTimeMillis() - startTime;
        System.out.println("预分配ArrayList耗时: " + preAllocTime + "ms");
        System.out.println("性能提升: " + (listTime / (double) preAllocTime) + "倍");
    }
}
```

#### 6.3.2 GC调优策略

```java
public class GCTuningExample {
    
    public static void main(String[] args) {
        demonstrateGenerationalGC();
        demonstrateGCMonitoring();
    }
    
    // 分代GC优化
    private static void demonstrateGenerationalGC() {
        System.out.println("=== 分代GC优化演示 ===");
        
        // 创建短生命周期对象（应该在年轻代被回收）
        for (int i = 0; i < 1000; i++) {
            createShortLivedObjects();
            
            if (i % 100 == 0) {
                System.out.println("已处理批次: " + (i / 100 + 1));
                // 建议进行Minor GC
                System.gc();
            }
        }
        
        // 创建长生命周期对象（会进入老年代）
        List<Object> longLivedObjects = new ArrayList<>();
        for (int i = 0; i < 100; i++) {
            longLivedObjects.add(new LargeObject("Long-lived-" + i));
        }
        
        System.out.println("长期对象创建完成: " + longLivedObjects.size());
    }
    
    private static void createShortLivedObjects() {
        // 创建临时对象
        List<Object> tempObjects = new ArrayList<>();
        for (int i = 0; i < 100; i++) {
            tempObjects.add(new Object());
        }
        // 方法结束后，tempObjects变为不可达
    }
    
    // GC监控
    private static void demonstrateGCMonitoring() {
        System.out.println("\n=== GC监控演示 ===");
        
        // 获取GC信息
        ManagementFactory.getGarbageCollectorMXBeans().forEach(gcBean -> {
            System.out.println("GC收集器: " + gcBean.getName());
            System.out.println("收集次数: " + gcBean.getCollectionCount());
            System.out.println("收集时间: " + gcBean.getCollectionTime() + "ms");
            System.out.println("管理的内存池: " + gcBean.getMemoryPoolNames());
            System.out.println("---");
        });
    }
}
```

## 7. JVM故障诊断

### 7.1 常见JVM问题

#### 7.1.1 OutOfMemoryError分析

```java
public class OutOfMemoryErrorExample {
    
    public static void main(String[] args) {
        System.out.println("=== OutOfMemoryError演示 ===");
        
        // 演示不同类型的OOM
        try {
            demonstrateHeapOOM();
        } catch (OutOfMemoryError e) {
            System.out.println("捕获到堆内存溢出: " + e.getMessage());
        }
        
        try {
            demonstrateStackOverflow();
        } catch (StackOverflowError e) {
            System.out.println("捕获到栈溢出: " + e.getMessage());
        }
    }
    
    // 堆内存溢出
    private static void demonstrateHeapOOM() {
        System.out.println("\n--- 堆内存溢出演示 ---");
        List<byte[]> list = new ArrayList<>();
        
        try {
            while (true) {
                // 不断分配大对象
                byte[] array = new byte[1024 * 1024]; // 1MB
                list.add(array);
                System.out.println("已分配对象数量: " + list.size());
            }
        } catch (OutOfMemoryError e) {
            System.out.println("堆内存不足，已分配: " + list.size() + " MB");
            throw e;
        }
    }
    
    // 栈溢出
    private static void demonstrateStackOverflow() {
        System.out.println("\n--- 栈溢出演示 ---");
        recursiveMethod(0);
    }
    
    private static void recursiveMethod(int depth) {
        System.out.println("递归深度: " + depth);
        // 无限递归导致栈溢出
        recursiveMethod(depth + 1);
    }
}
```

#### 7.1.2 死锁检测

```java
import java.lang.management.ManagementFactory;
import java.lang.management.ThreadInfo;
import java.lang.management.ThreadMXBean;

public class DeadlockDetectionExample {
    private static final Object lock1 = new Object();
    private static final Object lock2 = new Object();
    
    public static void main(String[] args) {
        System.out.println("=== 死锁检测演示 ===");
        
        // 启动死锁检测
        startDeadlockDetection();
        
        // 创建可能导致死锁的线程
        createDeadlockThreads();
        
        // 主线程等待
        try {
            Thread.sleep(5000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
    
    private static void startDeadlockDetection() {
        Thread detectionThread = new Thread(() -> {
            ThreadMXBean threadBean = ManagementFactory.getThreadMXBean();
            
            while (!Thread.currentThread().isInterrupted()) {
                try {
                    // 检测死锁
                    long[] deadlockedThreads = threadBean.findDeadlockedThreads();
                    
                    if (deadlockedThreads != null) {
                        System.out.println("\n🚨 检测到死锁！");
                        
                        ThreadInfo[] threadInfos = threadBean.getThreadInfo(deadlockedThreads);
                        for (ThreadInfo threadInfo : threadInfos) {
                            System.out.println("死锁线程: " + threadInfo.getThreadName());
                            System.out.println("线程状态: " + threadInfo.getThreadState());
                            System.out.println("阻塞对象: " + threadInfo.getLockName());
                            System.out.println("持有锁的线程: " + threadInfo.getLockOwnerName());
                            System.out.println("---");
                        }
                        break;
                    }
                    
                    Thread.sleep(1000);
                    
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        });
        
        detectionThread.setDaemon(true);
        detectionThread.start();
    }
    
    private static void createDeadlockThreads() {
        // 线程1：先获取lock1，再获取lock2
        Thread thread1 = new Thread(() -> {
            synchronized (lock1) {
                System.out.println("Thread1获取了lock1");
                
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
                
                System.out.println("Thread1尝试获取lock2");
                synchronized (lock2) {
                    System.out.println("Thread1获取了lock2");
                }
            }
        }, "DeadlockThread-1");
        
        // 线程2：先获取lock2，再获取lock1
        Thread thread2 = new Thread(() -> {
            synchronized (lock2) {
                System.out.println("Thread2获取了lock2");
                
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
                
                System.out.println("Thread2尝试获取lock1");
                synchronized (lock1) {
                    System.out.println("Thread2获取了lock1");
                }
            }
        }, "DeadlockThread-2");
        
        thread1.start();
        thread2.start();
    }
}
```

### 7.2 JVM调试工具

```java
import java.lang.management.*;
import java.util.List;

public class JVMDiagnosticTools {
    
    public static void main(String[] args) {
        printJVMInfo();
        printMemoryInfo();
        printThreadInfo();
        printGCInfo();
    }
    
    // 打印JVM基本信息
    private static void printJVMInfo() {
        System.out.println("=== JVM基本信息 ===");
        
        RuntimeMXBean runtimeBean = ManagementFactory.getRuntimeMXBean();
        
        System.out.println("JVM名称: " + runtimeBean.getVmName());
        System.out.println("JVM版本: " + runtimeBean.getVmVersion());
        System.out.println("JVM供应商: " + runtimeBean.getVmVendor());
        System.out.println("启动时间: " + new java.util.Date(runtimeBean.getStartTime()));
        System.out.println("运行时间: " + (runtimeBean.getUptime() / 1000) + "秒");
        
        List<String> inputArguments = runtimeBean.getInputArguments();
        System.out.println("JVM参数:");
        inputArguments.forEach(arg -> System.out.println("  " + arg));
    }
    
    // 打印内存信息
    private static void printMemoryInfo() {
        System.out.println("\n=== 内存信息 ===");
        
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
        
        // 堆内存
        MemoryUsage heapUsage = memoryBean.getHeapMemoryUsage();
        System.out.println("堆内存:");
        printMemoryUsage(heapUsage);
        
        // 非堆内存
        MemoryUsage nonHeapUsage = memoryBean.getNonHeapMemoryUsage();
        System.out.println("非堆内存:");
        printMemoryUsage(nonHeapUsage);
        
        // 内存池信息
        System.out.println("内存池详情:");
        List<MemoryPoolMXBean> memoryPools = ManagementFactory.getMemoryPoolMXBeans();
        memoryPools.forEach(pool -> {
            System.out.println("  " + pool.getName() + ":");
            printMemoryUsage(pool.getUsage());
        });
    }
    
    private static void printMemoryUsage(MemoryUsage usage) {
        if (usage != null) {
            System.out.println("    初始: " + (usage.getInit() / 1024 / 1024) + "MB");
            System.out.println("    已使用: " + (usage.getUsed() / 1024 / 1024) + "MB");
            System.out.println("    已提交: " + (usage.getCommitted() / 1024 / 1024) + "MB");
            System.out.println("    最大: " + (usage.getMax() / 1024 / 1024) + "MB");
        }
    }
    
    // 打印线程信息
    private static void printThreadInfo() {
        System.out.println("\n=== 线程信息 ===");
        
        ThreadMXBean threadBean = ManagementFactory.getThreadMXBean();
        
        System.out.println("当前线程数: " + threadBean.getThreadCount());
        System.out.println("守护线程数: " + threadBean.getDaemonThreadCount());
        System.out.println("峰值线程数: " + threadBean.getPeakThreadCount());
        System.out.println("总启动线程数: " + threadBean.getTotalStartedThreadCount());
        
        // 获取所有线程信息
        long[] threadIds = threadBean.getAllThreadIds();
        ThreadInfo[] threadInfos = threadBean.getThreadInfo(threadIds);
        
        System.out.println("\n线程详情:");
        for (ThreadInfo threadInfo : threadInfos) {
            if (threadInfo != null) {
                System.out.println("  线程名: " + threadInfo.getThreadName());
                System.out.println("  线程状态: " + threadInfo.getThreadState());
                System.out.println("  CPU时间: " + threadBean.getThreadCpuTime(threadInfo.getThreadId()) / 1000000 + "ms");
                System.out.println("  ---");
            }
        }
    }
    
    // 打印GC信息
    private static void printGCInfo() {
        System.out.println("\n=== 垃圾收集信息 ===");
        
        List<GarbageCollectorMXBean> gcBeans = ManagementFactory.getGarbageCollectorMXBeans();
        
        gcBeans.forEach(gcBean -> {
            System.out.println("GC收集器: " + gcBean.getName());
            System.out.println("  收集次数: " + gcBean.getCollectionCount());
            System.out.println("  收集时间: " + gcBean.getCollectionTime() + "ms");
            System.out.println("  平均收集时间: " + 
                (gcBean.getCollectionCount() > 0 ? 
                    gcBean.getCollectionTime() / gcBean.getCollectionCount() : 0) + "ms");
            
            String[] memoryPoolNames = gcBean.getMemoryPoolNames();
            System.out.println("  管理的内存池:");
            for (String poolName : memoryPoolNames) {
                System.out.println("    " + poolName);
            }
            System.out.println("  ---");
        });
    }
}
```

## 8. 总结

JVM作为Java程序的运行环境，其深入理解对于Java开发者至关重要。本文档涵盖了JVM的核心概念：

### 8.1 关键知识点

1. **JVM架构**：理解类加载子系统、运行时数据区、执行引擎等组件
2. **内存模型**：掌握堆、栈、方法区等内存区域的作用和特点
3. **垃圾回收**：了解GC算法、收集器选择和调优策略
4. **类加载机制**：理解双亲委派模型和类初始化过程
5. **性能调优**：掌握JVM参数配置和性能优化技巧
6. **故障诊断**：学会使用工具分析和解决JVM问题

### 8.2 最佳实践

1. **合理配置JVM参数**：根据应用特点选择合适的堆大小和GC收集器
2. **避免内存泄漏**：及时清理不需要的对象引用
3. **优化对象创建**：使用对象池、预分配等技术减少GC压力
4. **监控JVM状态**：定期检查内存使用、GC频率等指标
5. **选择合适的数据结构**：根据使用场景选择最优的集合类型

### 8.3 持续学习

JVM技术在不断发展，建议持续关注：
- 新版本JVM的特性和改进
- 新的垃圾收集器（如ZGC、Shenandoah）
- JVM性能分析工具的使用
- 微服务架构下的JVM调优策略

通过深入理解JVM原理和实践经验的积累，能够更好地开发高性能、稳定的Java应用程序。


