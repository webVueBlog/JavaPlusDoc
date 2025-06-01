---
title: Buffer和Channel
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## Buffer和Channel

* 可简单认为：IO 是面向流的处理，NIO 是面向块(缓冲区)的处理
* 面向流的 I/O 系统一次一个字节地处理数据。
* 一个面向块(缓冲区)的 I/O 系统以块的形式处理数据。

NIO 主要有两个核心部分组成：

* Buffer 缓冲区
* Channel 通道

在 NIO 中，并不是以流的方式来处理数据的，而是以 buffer 缓冲区和 Channel 通道配合使用来处理数据的。

简单理解一下：

可以把 Channel 通道比作铁路，buffer 缓冲区比作成火车(运载着货物)

而我们的 NIO 就是通过 Channel 通道运输着存储数据的 Buffer 缓冲区的来实现数据的处理！

要时刻记住：Channel 不与数据打交道，它只负责运输数据。与数据打交道的是 Buffer 缓冲区

* Channel-->运输
* Buffer-->数据

相对于传统 IO 而言，流是单向的。对于 NIO 而言，有了 Channel 通道这个概念，我们的读写都是双向的(铁路上的火车能从广州去北京、自然就能从北京返还到广州)！

## Buffer 缓冲区

Buffer 是缓冲区的抽象类：

其中 ByteBuffer 是用得最多的实现类(在通道中读写字节数据)。

![img_1.png](./img_1.png)

读取缓冲区的数据/写数据到缓冲区中

![img_2.png](./img_2.png)

Buffer 类维护了 4 个核心变量来提供关于其所包含的数组信息。它们是：

1. 容量 Capacity 缓冲区能够容纳的数据元素的最大数量。容量在缓冲区创建时被设定，并且永远不能被改变。(不能被改变的原因也很简单，底层是数组嘛)
2. 上界 Limit 缓冲区里的数据的总数，代表了当前缓冲区中一共有多少数据。
3. 位置 Position 下一个要被读或写的元素的位置。Position 会自动由相应的 get()和 put()函数更新。
4. 标记 Mark 一个备忘位置。用于记录上一次读写的位置。

首先展示一下是如何创建缓冲区的，核心变量的值是怎么变化的。

## Channel 通道

Channel 通道只负责传输数据、不直接操作数据。操作数据都是通过 Buffer 缓冲区来进行操作！通常，通道可以分为两大类：文件通道和套接字通道。

FileChannel：用于文件 I/O 的通道，支持文件的读、写和追加操作。FileChannel 允许在文件的任意位置进行数据传输，支持文件锁定以及内存映射文件等高级功能。FileChannel 无法设置为非阻塞模式，因此它只适用于阻塞式文件操作。

SocketChannel：用于 TCP 套接字 I/O 的通道。SocketChannel 支持非阻塞模式，可以与 Selector一起使用，实现高效的网络通信。SocketChannel 允许连接到远程主机，进行数据传输。

与之匹配的有ServerSocketChannel：用于监听 TCP 套接字连接的通道。与 SocketChannel 类似，ServerSocketChannel 也支持非阻塞模式，并可以与 Selector 一起使用。ServerSocketChannel 负责监听新的连接请求，接收到连接请求后，可以创建一个新的 SocketChannel 以处理数据传输。

DatagramChannel：用于 UDP 套接字 I/O 的通道。DatagramChannel 支持非阻塞模式，可以发送和接收数据报包，适用于无连接的、不可靠的网络通信。











