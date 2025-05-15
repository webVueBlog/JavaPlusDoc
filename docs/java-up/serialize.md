---
title: 序列化和反序列化
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## 序列化和反序列化

Java 的序列流（ObjectInputStream 和 ObjectOutputStream）是一种可以将 Java 对象序列化和反序列化的流。

序列化是指将一个对象转换为一个字节序列（包含对象的数据、对象的类型和对象中存储的属性等信息），以便在网络上传输或保存到文件中，或者在程序之间传递。在 Java 中，序列化通过实现 java.io.Serializable 接口来实现，只有实现了 Serializable 接口的对象才能被序列化。

反序列化是指将一个字节序列转换为一个对象，以便在程序中使用。

### 01、ObjectOutputStream

java.io.ObjectOutputStream 继承自 OutputStream 类，因此可以将序列化后的字节序列写入到文件、网络等输出流中。

来看 ObjectOutputStream 的构造方法： ObjectOutputStream(OutputStream out)

该构造方法接收一个 OutputStream 对象作为参数，用于将序列化后的字节序列输出到指定的输出流中。

```
FileOutputStream fos = new FileOutputStream("file.txt");
ObjectOutputStream oos = new ObjectOutputStream(fos);
```

一个对象要想序列化，必须满足两个条件:

* 该类必须实现java.io.Serializable 接口，否则会抛出NotSerializableException 。
* 该类的所有字段都必须是可序列化的。如果一个字段不需要序列化，则需要使用transient 关键字进行修饰。

```
public class Employee implements Serializable {
    public String name;
    public String address;
    public transient int age; // transient瞬态修饰成员,不会被序列化
}
```

### 02、ObjectInputStream

ObjectInputStream 可以读取 ObjectOutputStream 写入的字节流，并将其反序列化为相应的对象（包含对象的数据、对象的类型和对象中存储的属性等信息）。

说简单点就是，序列化之前是什么样子，反序列化后就是什么样子。

来看一下构造方法：ObjectInputStream(InputStream in) ： 创建一个指定 InputStream 的 ObjectInputStream。

其中，ObjectInputStream 的 readObject 方法用来读取指定文件中的对象

```
String filename = "logs/person.dat"; // 待反序列化的文件名
try (FileInputStream fileIn = new FileInputStream(filename);
     ObjectInputStream in = new ObjectInputStream(fileIn)) {
     // 从指定的文件输入流中读取对象并反序列化
     Object obj = in.readObject();
     // 将反序列化后的对象强制转换为指定类型
     Person p = (Person) obj;
     // 打印反序列化后的对象信息
     System.out.println("Deserialized Object: " + p);
} catch (IOException | ClassNotFoundException e) {
     e.printStackTrace();
}
```

我们首先指定了待反序列化的文件名（前面通过 ObjectOutputStream 序列化后的文件），然后创建了一个 FileInputStream 对象和一个 ObjectInputStream 对象。接着我们调用 ObjectInputStream 的 readObject 方法来读取指定文件中的对象，并将其强制转换为 Person 类型。最后我们打印了反序列化后的对象信息。

### 03、Kryo

实际开发中，很少使用 JDK 自带的序列化和反序列化，这是因为：

1. 可移植性差：Java 特有的，无法跨语言进行序列化和反序列化。
2. 性能差：序列化后的字节体积大，增加了传输/保存成本。
3. 安全问题：攻击者可以通过构造恶意数据来实现远程代码执行，从而对系统造成严重的安全威胁。相关阅读：Java 反序列化漏洞之殇 。

Kryo 是一个优秀的 Java 序列化和反序列化库，具有高性能、高效率和易于使用和扩展等特点，有效地解决了 JDK 自带的序列化机制的痛点。















