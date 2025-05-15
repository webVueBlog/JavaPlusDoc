---
title: 字节流
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## 字节流

我们必须得明确一点，一切文件（文本、视频、图片）的数据都是以二进制的形式存储的，传输时也是。所以，字节流可以传输任意类型的文件数据。

### 字节输出流（OutputStream）

java.io.OutputStream 是字节输出流的超类（父类），我们来看一下它定义的一些共性方法：

1、 close() ：关闭此输出流并释放与此流相关联的系统资源。

2、 flush() ：刷新此输出流并强制缓冲区的字节被写入到目的地。

3、 write(byte[] b)：将 b.length 个字节从指定的字节数组写入此输出流。

4、 write(byte[] b, int off, int len) ：从指定的字节数组写入 len 字节到此输出流，从偏移量 off开始。 也就是说从off个字节数开始一直到len个字节结束

### FileOutputStream类

OutputStream 有很多子类，我们从最简单的一个子类 FileOutputStream 开始。看名字就知道是文件输出流，用于将数据写入到文件。

1）FileOutputStream 的构造方法

1、使用文件名创建 FileOutputStream 对象。

```
String fileName = "example.txt";
FileOutputStream fos = new FileOutputStream(fileName);
```

以上代码使用文件名 "example.txt" 创建一个 FileOutputStream 对象，将数据写入到该文件中。如果文件不存在，则创建一个新文件；如果文件已经存在，则覆盖原有文件。

2、使用文件对象创建 FileOutputStream 对象。

```
File file = new File("example.txt");
FileOutputStream fos = new FileOutputStream(file);
```

2）FileOutputStream 写入字节数据

使用 FileOutputStream 写入字节数据主要通过 write 方法：

```
write(int b)
write(byte[] b)
write(byte[] b,int off,int len)  //从`off`索引开始，`len`个字节
```

①、写入字节：write(int b) 方法，每次可以写入一个字节

②、写入字节数组：write(byte[] b)

③、写入指定长度字节数组：write(byte[] b, int off, int len)

```
String fileName = "example.txt";
boolean append = true;
FileOutputStream fos = new FileOutputStream(fileName, append);
```

```
// 使用文件名称创建流对象
FileOutputStream fos = new FileOutputStream("fos.txt",true);     
// 字符串转换为字节数组
byte[] b = "abcde".getBytes();
// 写出从索引2开始，2个字节。索引2是c，两个字节，也就是cd。
fos.write(b);
// 关闭资源
fos.close();


```

### 字节输入流（InputStream）

java.io.InputStream 是字节输入流的超类（父类），我们来看一下它的一些共性方法：

1、close() ：关闭此输入流并释放与此流相关的系统资源。

2、int read()： 从输入流读取数据的下一个字节。

3、read(byte[] b)： 该方法返回的 int 值代表的是读取了多少个字节，读到几个返回几个，读取不到返回-1

### FileInputStream类

InputStream 有很多子类，我们从最简单的一个子类 FileInputStream 开始。看名字就知道是文件输入流，用于将数据从文件中读取数据。

### 1）FileInputStream的构造方法

1、FileInputStream(String name)：创建一个 FileInputStream 对象，并打开指定名称的文件进行读取。文件名由 name 参数指定。如果文件不存在，将会抛出 FileNotFoundException 异常。

2、FileInputStream(File file)：创建一个 FileInputStream 对象，并打开指定的 File 对象表示的文件进行读取。

```
// 创建一个 FileInputStream 对象
FileInputStream fis = new FileInputStream("test.txt");

// 读取文件内容
int data;
while ((data = fis.read()) != -1) {
    System.out.print((char) data);
}

// 关闭输入流
fis.close();
```

### 2）FileInputStream读取字节数据

①、读取字节：read()方法会读取一个字节并返回其整数表示。如果已经到达文件的末尾，则返回 -1。如果在读取时发生错误，则会抛出 IOException 异常。

②、使用字节数组读取：read(byte[] b) 方法会从输入流中最多读取 b.length 个字节，并将它们存储到缓冲区数组 b 中。

3）字节流FileInputstream复制图片

原理很简单，就是把图片信息读入到字节输入流中，再通过字节输出流写入到文件中。

```
// 创建一个 FileInputStream 对象以读取原始图片文件
FileInputStream fis = new FileInputStream("original.jpg");

// 创建一个 FileOutputStream 对象以写入复制后的图片文件
FileOutputStream fos = new FileOutputStream("copy.jpg");

// 创建一个缓冲区数组以存储读取的数据
byte[] buffer = new byte[1024];
int count;

// 读取原始图片文件并将数据写入复制后的图片文件
while ((count = fis.read(buffer)) != -1) {
    fos.write(buffer, 0, count);
}

// 关闭输入流和输出流
fis.close();
fos.close();
```

