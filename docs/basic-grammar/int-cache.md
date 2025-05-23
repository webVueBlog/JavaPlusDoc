---
title: 基本数据类型缓存池剖析
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">


## 基本数据类型缓存池剖析

### new Integer(18) 与 Integer.valueOf(18) 的区别是什么？”

- new Integer(18) 每次都会新建一个对象;
- Integer.valueOf(18) 会使⽤用缓存池中的对象，多次调用只会取同⼀一个对象的引用。

new 出来的是不同的对象，地址不同。

基本数据类型的包装类除了 Float 和 Double 之外，其他六个包装器类（Byte、Short、Integer、Long、Character、Boolean）都有常量缓存池。

- Byte：-128~127，也就是所有的 byte 值
- Short：-128~127
- Long：-128~127
- Character：\u0000 - \u007F
- Boolean：true 和 false

拿 Integer 来举例子，Integer 类内部中内置了 256 个 Integer 类型的缓存数据，当使用的数据范围在 -128~127 之间时，会直接返回常量池中数据的引用，而不是创建对象，超过这个范围时会创建新的对象。

Integer.IntegerCache 这个内部类的原因

当我们通过 Integer.valueOf() 方法获取整数对象时，会先检查该整数是否在 IntegerCache 中，如果在，则返回缓存中的对象，否则创建一个新的对象并缓存起来。

需要注意的是，如果使用 new Integer() 创建对象，即使值在 -128 到 127 范围内，也不会被缓存，每次都会创建新的对象。因此，推荐使用 Integer.valueOf() 方法获取整数对象。

> 静态代码块通常用来初始化一些静态变量，它会优先于 main() 方法执行。

在静态代码块中，low 为 -128，也就是缓存池的最小值；high 默认为 127，也就是缓存池的最大值，共计 256 个。

可以在 JVM 启动的时候，通过 -XX:AutoBoxCacheMax=NNN 来设置缓存池的大小，当然了，不能无限大，最大到 Integer.MAX_VALUE -129

难理解的是 assert Integer.IntegerCache.high >= 127;

assert 是 Java 中的一个关键字，寓意是断言，为了方便调试程序，并不是发布程序的组成部分。

默认情况下，断言是关闭的，可以在命令行运行 Java 程序的时候加上 -ea 参数打开断言。

假设手动设置的缓存池大小为 126，显然不太符合缓存池的预期值 127

在 Java 中，针对一些基本数据类型（如 Integer、Long、Boolean 等），Java 会在程序启动时创建一些常用的对象并缓存在内存中，以提高程序的性能和节省内存开销。这些常用对象被缓存在一个固定的范围内，超出这个范围的值会被重新创建新的对象。

使用数据类型缓存池可以有效提高程序的性能和节省内存开销，但需要注意的是，在特定的业务场景下，缓存池可能会带来一些问题，例如缓存池中的对象被不同的线程同时修改，导致数据错误等问题。因此，在实际开发中，需要根据具体的业务需求来决定是否使用数据类型缓存池。
