---
title: 文件流
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## 文件流

在 IO 操作中，文件的操作相对来说是比较复杂的，但也是使用频率最高的部分，我们几乎所有的项目中几乎都躺着一个叫做 FileUtil 或者 FileUtils 的工具类。

java.io.File 类是专门对文件进行操作的类，注意只能对文件本身进行操作，不能对文件内容进行操作，想要操作内容，必须借助输入输出流。

File 类是文件和目录的抽象表示，主要用于文件和目录的创建、查找和删除等操作。

怎么理解上面两句话？其实很简单！

第一句是说 File 跟流无关，File 类不能对文件进行读和写，也就是输入和输出！

第二句是说 File 可以表示D:\\文件目录1与D:\\文件目录1\\文件.txt，前者是文件夹（Directory，或者叫目录）后者是文件(file)，File 类就是用来操作它俩的。

## File 构造方法

在 Java 中，一切皆是对象，File 类也不例外，不论是哪个对象都应该从该对象的构造说起，所以我们来分析分析File类的构造方法。

比较常用的构造方法有三个：

1、 File(String pathname) ：通过给定的路径来创建新的 File 实例。

2、 File(String parent, String child) ：从父路径（字符串）和子路径创建新的 File 实例。

3、 File(File parent, String child) ：从父路径（File）和子路径名字符串创建新的 File 实例。

代码如下：

```
// 文件路径名
String path = "/Users/username/123.txt";
File file1 = new File(path);
// 文件路径名
String path2 = "/Users/username/1/2.txt";
File file2 = new File(path2); -------------相当于/Users/username/1/2.txt
// 通过父路径和子路径字符串
String parent = "/Users/username/aaa";
String child = "bbb.txt";
File file3 = new File(parent, child); --------相当于/Users/username/aaa/bbb.txt
// 通过父级File对象和子路径字符串
File parentDir = new File("/Users/username/aaa");
String child = "bbb.txt";
File file4 = new File(parentDir, child); --------相当于/Users/username/aaa/bbb.txt
```

注意，macOS 路径使用正斜杠（/）作为路径分隔符，而 Windows 路径使用反斜杠（\）作为路径分隔符。所以在遇到路径分隔符的时候，不要直接去写/或者\。

Java 中提供了一个跨平台的方法来获取路径分隔符，即使用 File.separator，这个属性会根据操作系统自动返回正确的路径分隔符。

File 类的注意点：

* 一个 File 对象代表硬盘中实际存在的一个文件或者目录。
* File 类的构造方法不会检验这个文件或目录是否真实存在，因此无论该路径下是否存在文件或者目录，都不影响 File 对象的创建。

## File 常用方法

File 的常用方法主要分为获取功能、获取绝对路径和相对路径、判断功能、创建删除功能的方法。

### 1）获取功能的方法

1、getAbsolutePath() ：返回此 File 的绝对路径。

2、getPath() ：结果和 getAbsolutePath 一致。

3、getName() ：返回文件名或目录名。

4、length() ：返回文件长度，以字节为单位。

```
File f = new File("/Users/username/aaa/bbb.java");
System.out.println("文件绝对路径:"+f.getAbsolutePath());
System.out.println("文件构造路径:"+f.getPath());
System.out.println("文件名称:"+f.getName());
System.out.println("文件长度:"+f.length()+"字节");

File f2 = new File("/Users/username/aaa");
System.out.println("目录绝对路径:"+f2.getAbsolutePath());
System.out.println("目录构造路径:"+f2.getPath());
System.out.println("目录名称:"+f2.getName());
System.out.println("目录长度:"+f2.length());
```

注意：length() 表示文件的长度，File 对象表示目录的时候，返回值并无意义。

### 2）绝对路径和相对路径

绝对路径是从文件系统的根目录开始的完整路径，它描述了一个文件或目录在文件系统中的确切位置。在 Windows 系统中，绝对路径通常以盘符（如 C:）开始，例如 "C:\Program Files\Java\jdk1.8.0_291\bin\java.exe"。在 macOS 和 Linux 系统中，绝对路径通常以斜杠（/）开始，例如 "/usr/local/bin/python3"。

相对路径是相对于当前工作目录的路径，它描述了一个文件或目录与当前工作目录之间的位置关系。在 Java 中，相对路径通常是相对于当前 Java 程序所在的目录，例如 "config/config.properties"。如果当前工作目录是 "/Users/username/project"，那么相对路径 "config/config.properties" 就表示 "/Users/username/project/config/config.properties"。

### 注意：

在 Windows 操作系统中，文件系统默认是不区分大小写的，即在文件系统中，文件名和路径的大小写可以混合使用。例如，"C:\Users\username\Documents\example.txt" 和 "C:\Users\Username\Documents\Example.txt" 表示的是同一个文件。但是，Windows 操作系统提供了一个区分大小写的选项，可以在格式化磁盘时选择启用，这样文件系统就会区分大小写。

在 macOS 和 Linux 等 Unix 系统中，文件系统默认是区分大小写的。例如，在 macOS 系统中，"/Users/username/Documents/example.txt" 和 "/Users/username/Documents/Example.txt" 表示的是两个不同的文件。

```
// 绝对路径示例
File absoluteFile = new File("/Users/username/example/test.txt");
System.out.println("绝对路径：" + absoluteFile.getAbsolutePath());

// 相对路径示例
File relativeFile = new File("example/test.txt");
System.out.println("相对路径：" + relativeFile.getPath());
```

### 3）判断功能的方法

1、 exists() ：判断文件或目录是否存在。

2、 isDirectory() ：判断是否为目录。

3、isFile() ：判断是否为文件。

```
File file = new File("/Users/username/example");

// 判断文件或目录是否存在
if (file.exists()) {
    System.out.println("文件或目录存在");
} else {
    System.out.println("文件或目录不存在");
}

// 判断是否是目录
if (file.isDirectory()) {
    System.out.println("是目录");
} else {
    System.out.println("不是目录");
}

// 判断是否是文件
if (file.isFile()) {
    System.out.println("是文件");
} else {
    System.out.println("不是文件");
}
```

### 4）创建、删除功能的方法

1. createNewFile() ：文件不存在，创建一个新的空文件并返回true，文件存在，不创建文件并返回false。
2. delete() ：删除文件或目录。如果是目录，只有目录为空才能删除。
3. mkdir() ：只能创建一级目录，如果父目录不存在，则创建失败。返回 true 表示创建成功，返回 false 表示创建失败。
4. mkdirs() ：可以创建多级目录，如果父目录不存在，则会一并创建。返回 true 表示创建成功，返回 false 表示创建失败或目录已经存在。

开发中一般用mkdirs();

```
// 创建文件
File file = new File("/Users/username/example/test.txt");
if (file.createNewFile()) {
    System.out.println("创建文件成功：" + file.getAbsolutePath());
} else {
    System.out.println("创建文件失败：" + file.getAbsolutePath());
}

// 删除文件
if (file.delete()) {
    System.out.println("删除文件成功：" + file.getAbsolutePath());
} else {
    System.out.println("删除文件失败：" + file.getAbsolutePath());
}

// 创建多级目录
File directory = new File("/Users/username/example/subdir1/subdir2");
if (directory.mkdirs()) {
    System.out.println("创建目录成功：" + directory.getAbsolutePath());
} else {
    System.out.println("创建目录失败：" + directory.getAbsolutePath());
}
```

### 5）目录的遍历

1. String[] list() ：返回一个 String 数组，表示该 File 目录中的所有子文件或目录。
2. File[] listFiles() ：返回一个 File 数组，表示该 File 目录中的所有的子文件或目录。

### RandomAccessFile

RandomAccessFile 是 Java 中一个非常特殊的类，它既可以用来读取文件，也可以用来写入文件。与其他 IO 类（如 FileInputStream 和 FileOutputStream）不同，RandomAccessFile 允许您跳转到文件的任何位置，从那里开始读取或写入。这使得它特别适用于需要在文件中随机访问数据的场景，如数据库系统。
