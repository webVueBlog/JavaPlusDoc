---
title: 缓冲流
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## 缓冲流

Java 的缓冲流是对字节流和字符流的一种封装，通过在内存中开辟缓冲区来提高 I/O 操作的效率。Java 通过 BufferedInputStream 和 BufferedOutputStream 来实现字节流的缓冲，通过 BufferedReader 和 BufferedWriter 来实现字符流的缓冲。

缓冲流的工作原理是将数据先写入缓冲区中，当缓冲区满时再一次性写入文件或输出流，或者当缓冲区为空时一次性从文件或输入流中读取一定量的数据。这样可以减少系统的 I/O 操作次数，提高系统的 I/O 效率，从而提高程序的运行效率。

### 01、字节缓冲流

BufferedInputStream 和 BufferedOutputStream 属于字节缓冲流，强化了字节流 InputStream 和 OutputStream。

### 1）构造方法

* BufferedInputStream(InputStream in) ：创建一个新的缓冲输入流，注意参数类型为InputStream。
* BufferedOutputStream(OutputStream out)： 创建一个新的缓冲输出流，注意参数类型为OutputStream。

```
// 创建字节缓冲输入流，先声明字节流
FileInputStream fps = new FileInputStream(b.txt);
BufferedInputStream bis = new BufferedInputStream(fps)

// 创建字节缓冲输入流（一步到位）
BufferedInputStream bis = new BufferedInputStream(new FileInputStream("b.txt"));

// 创建字节缓冲输出流（一步到位）
BufferedOutputStream bos = new BufferedOutputStream(new FileOutputStream("b.txt"));
```

3）为什么字节缓冲流会这么快？

传统的 Java IO 是阻塞模式的，它的工作状态就是“读/写，等待，读/写，等待。。。。。。”

字节缓冲流解决的就是这个问题：一次多读点多写点，减少读写的频率，用空间换时间。

* 减少系统调用次数：在使用字节缓冲流时，数据不是立即写入磁盘或输出流，而是先写入缓冲区，当缓冲区满时再一次性写入磁盘或输出流。这样可以减少系统调用的次数，从而提高 I/O 操作的效率。
* 减少磁盘读写次数：在使用字节缓冲流时，当需要读取数据时，缓冲流会先从缓冲区中读取数据，如果缓冲区中没有足够的数据，则会一次性从磁盘或输入流中读取一定量的数据。同样地，当需要写入数据时，缓冲流会先将数据写入缓冲区，如果缓冲区满了，则会一次性将缓冲区中的数据写入磁盘或输出流。这样可以减少磁盘读写的次数，从而提高 I/O 操作的效率。
* 提高数据传输效率：在使用字节缓冲流时，由于数据是以块的形式进行传输，因此可以减少数据传输的次数，从而提高数据传输的效率。

### 02、字符缓冲流

BufferedReader 类继承自 Reader 类，提供了一些便捷的方法，例如 readLine() 方法可以一次读取一行数据，而不是一个字符一个字符地读取。

BufferedWriter 类继承自 Writer 类，提供了一些便捷的方法，例如 newLine() 方法可以写入一个系统特定的行分隔符。

1）构造方法

* BufferedReader(Reader in) ：创建一个新的缓冲输入流，注意参数类型为Reader。
* BufferedWriter(Writer out)： 创建一个新的缓冲输出流，注意参数类型为Writer。

2）字符缓冲流特有方法

字符缓冲流的基本方法与普通字符流调用方式一致，这里不再赘述，我们来看字符缓冲流特有的方法。

* BufferedReader：String readLine(): 读一行数据，读取到最后返回 null
* BufferedWriter：newLine(): 换行，由系统定义换行符。

```
// 创建map集合,保存文本数据,键为序号,值为文字
HashMap<String, String> lineMap = new HashMap<>();

// 创建流对象  源
BufferedReader br = new BufferedReader(new FileReader("logs/test.log"));
//目标
BufferedWriter bw = new BufferedWriter(new FileWriter("logs/test1.txt"));

// 读取数据
String line;
while ((line = br.readLine())!=null) {
    // 解析文本
    if (line.isEmpty()) {
        continue;
    }
    String[] split = line.split(Pattern.quote("."));
    // 保存到集合
    lineMap.put(split[0], split[1]);
}
// 释放资源
br.close();

// 遍历map集合
for (int i = 1; i <= lineMap.size(); i++) {
    String key = String.valueOf(i);
    // 获取map中文本
    String value = lineMap.get(key);
    // 写出拼接文本
    bw.write(key+"."+value);
    // 写出换行
    bw.newLine();
}
// 释放资源
bw.close();
```







