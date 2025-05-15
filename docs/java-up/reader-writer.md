---
title: 字符流
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## 字符流

![img_3.png](./img_3.png)

字符流是一种用于读取和写入字符数据的输入输出流。与字节流不同，字符流以字符为单位读取和写入数据，而不是以字节为单位。常用来处理文本信息。

如果用字节流直接读取中文，可能会遇到乱码问题

```
//FileInputStream为操作文件的字符输入流
FileInputStream inputStream = new FileInputStream("a.txt");//内容为“aa是傻 X”

int len;
while ((len=inputStream.read())!=-1){
    System.out.print((char)len);
}
```

字符流 = 字节流 + 编码表

01、字符输入流（Reader）

java.io.Reader是字符输入流的超类（父类），它定义了字符输入流的一些共性方法：

* 1、close()：关闭此流并释放与此流相关的系统资源。
* 2、read()：从输入流读取一个字符。
* 3、read(char[] cbuf)：从输入流中读取一些字符，并将它们存储到字符数组 cbuf中

FileReader 是 Reader 的子类，用于从文件中读取字符数据。它的主要特点如下：

可以通过构造方法指定要读取的文件路径。

每次可以读取一个或多个字符。

可以读取 Unicode 字符集中的字符，通过指定字符编码来实现字符集的转换。

1）FileReader构造方法

* 1、FileReader(File file)：创建一个新的 FileReader，参数为File对象。
* 2、FileReader(String fileName)：创建一个新的 FileReader，参数为文件名。

```
// 使用File对象创建流对象
File file = new File("a.txt");
FileReader fr = new FileReader(file);

// 使用文件名称创建流对象
FileReader fr = new FileReader("b.txt");
```

2）FileReader读取字符数据

①、读取字符：read方法，每次可以读取一个字符，返回读取的字符（转为 int 类型），当读取到文件末尾时，返回-1。

②、读取指定长度的字符：read(char[] cbuf, int off, int len)，并将其存储到字符数组中。其中，cbuf 表示存储读取结果的字符数组，off 表示存储结果的起始位置，len 表示要读取的字符数。

02、字符输出流（Writer）

java.io.Writer 是字符输出流类的超类（父类），可以将指定的字符信息写入到目的地，来看它定义的一些共性方法：

* 1、write(int c) 写入单个字符。
* 2、write(char[] cbuf) 写入字符数组。
* 3、write(char[] cbuf, int off, int len) 写入字符数组的一部分，off为开始索引，len为字符个数。
* 4、write(String str) 写入字符串。
* 5、write(String str, int off, int len) 写入字符串的某一部分，off 指定要写入的子串在 str 中的起始位置，len 指定要写入的子串的长度。
* 6、flush() 刷新该流的缓冲。
* 7、close() 关闭此流，但要先刷新它。

java.io.FileWriter 类是 Writer 的子类，用来将字符写入到文件。

1）FileWriter 构造方法

1. FileWriter(File file)： 创建一个新的 FileWriter，参数为要读取的File对象。
2. FileWriter(String fileName)： 创建一个新的 FileWriter，参数为要读取的文件的名称。

2）FileWriter写入数据

①、写入字符：write(int b) 方法，每次可以写出一个字符

②、写入字符数组：write(char[] cbuf) 方法，将指定字符数组写入输出流。

③、写入指定字符数组：write(char[] cbuf, int off, int len) 方法，将指定字符数组的一部分写入输出流。

④、写入字符串：write(String str) 方法，将指定字符串写入输出流。

⑤、写入指定字符串：write(String str, int off, int len) 方法，将指定字符串的一部分写入输出流。

3）关闭close和刷新flush

因为 FileWriter 内置了缓冲区 ByteBuffer，所以如果不关闭输出流，就无法把字符写入到文件中。

但是关闭了流对象，就无法继续写数据了。如果我们既想写入数据，又想继续使用流，就需要 flush 方法了。

flush ：刷新缓冲区，流对象可以继续使用。

close ：先刷新缓冲区，然后通知系统释放资源。流对象不可以再被使用了。

4）FileWriter的续写和换行

5）文本文件复制

Writer 和 Reader 是 Java I/O 中用于字符输入输出的抽象类，它们提供了一系列方法用于读取和写入字符数据。它们的区别在于 Writer 用于将字符数据写入到输出流中，而 Reader 用于从输入流中读取字符数据。

Writer 和 Reader 的常用子类有 FileWriter、FileReader，可以将字符流写入和读取到文件中。

在使用 Writer 和 Reader 进行字符输入输出时，需要注意字符编码的问题。
