---
title: NIO比IO强在哪
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## NIO比IO强在哪

![img.png](./img.png)

传统 IO 基于字节流或字符流（如 `FileInputStream、BufferedReader` 等）进行文件读写，以及使用 `Socket` 和 `ServerSocket` 进行网络传输。

NIO 使用通道（`Channel`）和缓冲区（`Buffer`）进行文件操作，以及使用 `SocketChannel` 和 `ServerSocketChannel` 进行网络传输。

传统 IO 采用阻塞式模型，对于每个连接，都需要创建一个独立的线程来处理读写操作。当一个线程在等待 I/O 操作时，无法执行其他任务。这会导致大量线程的创建和销毁，以及上下文切换，降低了系统性能。

NIO 使用非阻塞模型，允许线程在等待 I/O 时执行其他任务。这种模式通过使用选择器（`Selector`）来监控多个通道（`Channel`）上的 I/O 事件，实现了更高的性能和可伸缩性。

### 01、NIO 和传统 IO 在操作文件时的差异

JDK 1.4 中，`java.nio.*`包引入新的 Java I/O 库，其目的是提高速度。实际上，“旧”的 I/O 包已经使用 `NIO重新实现过`，即使我们不显式的使用 NIO 编程，也能从中受益。

nio 翻译成 `no-blocking io` 或者 `new `io 都无所谓啦，都说得通~
在《Java 编程思想》读到“即使我们不显式的使用 NIO 编程，也能从中受益”的时候，我是挺在意的，所以：我们测试一下使用 NIO 复制文件和传统 IO 复制文件 的性能：

```java
public class SimpleFileTransferTest {

    // 使用传统的 I/O 方法传输文件
    private long transferFile(File source, File des) throws IOException {
        long startTime = System.currentTimeMillis();

        if (!des.exists())
            des.createNewFile();

        // 创建输入输出流
        BufferedInputStream bis = new BufferedInputStream(new FileInputStream(source));
        BufferedOutputStream bos = new BufferedOutputStream(new FileOutputStream(des));

        // 使用数组传输数据
        byte[] bytes = new byte[1024 * 1024];
        int len;
        while ((len = bis.read(bytes)) != -1) {
            bos.write(bytes, 0, len);
        }

        long endTime = System.currentTimeMillis();
        return endTime - startTime;
    }

    // 使用 NIO 方法传输文件
    private long transferFileWithNIO(File source, File des) throws IOException {
        long startTime = System.currentTimeMillis();

        if (!des.exists())
            des.createNewFile();

        // 创建随机存取文件对象
        RandomAccessFile read = new RandomAccessFile(source, "rw");
        RandomAccessFile write = new RandomAccessFile(des, "rw");

        // 获取文件通道
        FileChannel readChannel = read.getChannel();
        FileChannel writeChannel = write.getChannel();

        // 创建并使用 ByteBuffer 传输数据
        ByteBuffer byteBuffer = ByteBuffer.allocate(1024 * 1024);
        while (readChannel.read(byteBuffer) > 0) {
            byteBuffer.flip();
            writeChannel.write(byteBuffer);
            byteBuffer.clear();
        }

        // 关闭文件通道
        writeChannel.close();
        readChannel.close();
        long endTime = System.currentTimeMillis();
        return endTime - startTime;
    }

    public static void main(String[] args) throws IOException {
        SimpleFileTransferTest simpleFileTransferTest = new SimpleFileTransferTest();
        File sourse = new File("[电影天堂www.dygod.cn]猜火车-cd1.rmvb");
        File des = new File("io.avi");
        File nio = new File("nio.avi");

        // 比较传统的 I/O 和 NIO 传输文件的时间
        long time = simpleFileTransferTest.transferFile(sourse, des);
        System.out.println(time + "：普通字节流时间");

        long timeNio = simpleFileTransferTest.transferFileWithNIO(sourse, nio);
        System.out.println(timeNio + "：NIO时间");
    }
}
```

对于较小的文件，NIO 和普通 IO 之间的性能差异可能不会非常明显，因为文件本身较小，复制过程较快。
对于较大的文件，使用 NIO 的性能可能会明显优于普通 IO。因为 NIO 使用了更高效的缓冲区和通道机制，可以在内存中进行更快的数据传输。

文件越大的情况下，竟然普通字节流（传统 IO）的速度更快，那还要 NIO 做什么呢？况且 NIO 的学习成本也比传统 IO 要高一些。

那这意味着我们可以不使用/学习 NIO 了吗？

答案是否定的，IO 操作往往在两个场景下会用到：

1. 文件 IO
2. 网络 IO

而 NIO 的魅力主要体现在网络中！

NIO（New I/O）的设计目标是解决传统 `I/O（BIO，Blocking I/O）`在处理大量并发连接时的性能瓶颈。传统 I/O 在网络通信中主要使用阻塞式 I/O，为每个连接分配一个线程。当连接数量增加时，系统性能将受到严重影响，线程资源成为关键瓶颈。而 NIO 提供了非阻塞 I/O 和 I/O 多路复用，可以在单个线程中处理多个并发连接，从而在网络传输中显著提高性能。

以下是 NIO 在网络传输中优于传统 I/O 的原因：

①、NIO 支持非阻塞 I/O，这意味着在执行 I/O 操作时，线程不会被阻塞。这使得在网络传输中可以有效地管理大量并发连接（`数千甚至数百万`）。而在操作文件时，这个优势没有那么明显，因为文件读写通常不涉及大量并发操作。

②、NIO 支持 I/O 多路复用，这意味着一个线程可以同时监视多个通道（如套接字），并在 I/O 事件（如可读、可写）准备好时处理它们。这大大提高了网络传输中的性能，因为单个线程可以高效地管理多个并发连接。操作文件时这个优势也无法提现出来。

③、NIO 提供了 `ByteBuffer` 类，可以高效地管理缓冲区。这在网络传输中很重要，因为数据通常是以字节流的形式传输。操作文件的时候，虽然也有缓冲区，但优势仍然不够明显。

### 02、NIO 和传统 IO 在网络传输中的差异

1. 传统 I/O 采用阻塞式模型，线程在 I/O 操作期间无法执行其他任务。NIO 使用非阻塞模型，允许线程在等待 I/O 时执行其他任务，通过选择器（`Selector`）监控多个通道（`Channel`）上的 I/O 事件，提高性能和可伸缩性。
2. 传统 I/O 使用基于字节流或字符流的类（如 `FileInputStream`、`BufferedReader` 等）进行文件读写。NIO 使用通道（`Channel`）和缓冲区（`Buffer`）进行文件操作，NIO 在性能上的优势并不大。
3. 传统 I/O 使用 `Socket` 和 `ServerSocket` 进行网络传输，存在阻塞问题。NIO 提供了 `SocketChannel` 和 `ServerSocketChannel`，支持非阻塞网络传输，提高了并发处理能力。





