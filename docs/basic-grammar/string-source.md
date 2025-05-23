---
title: 深入解读String类
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## 深入解读String类

什么字符串常量池了、字符串不可变性了、字符串拼接了、字符串长度限制了等等

### String 类的声明

第一，String 类是 final 的，意味着它不能被子类继承。

第二，String 类实现了 Serializable 接口，意味着它可以序列化

第三，String 类实现了 Comparable 接口，意味着最好不要用‘==’来比较两个字符串是否相等，而应该用 compareTo() 方法去比较。

因为 == 是用来比较两个对象的地址

如果只是说比较字符串内容的话，可以使用 String 类的 equals 方法

第四，String 和 StringBuffer、StringBuilder 一样，都实现了 CharSequence 接口，所以它们仨属于近亲。由于 String 是不可变的，所以遇到字符串拼接的时候就可以考虑一下 String 的另外两个好兄弟，StringBuffer 和 StringBuilder，它俩是可变的。

### String 底层为什么由 char 数组优化为 byte 数组

第五，Java 9 以前，String 是用 char 型数组实现的，之后改成了 byte 型数组实现，并增加了 coder 来表示编码。这样做的好处是在 Latin1 字符为主的程序里，可以把 String 占用的内存减少一半。当然，天下没有免费的午餐，这个改进在节省内存的同时引入了编码检测的开销。

> Latin1（Latin-1）是一种单字节字符集（即每个字符只使用一个字节的编码方式），也称为 ISO-8859-1（国际标准化组织 8859-1），它包含了西欧语言中使用的所有字符，包括英语、法语、德语、西班牙语、葡萄牙语、意大利语等等。在 Latin1 编码中，每个字符使用一个 8 位（即一个字节）的编码，可以表示 256 种不同的字符，其中包括 ASCII 字符集中的所有字符，即 0x00 到 0x7F，以及其他西欧语言中的特殊字符，例如 é、ü、ñ 等等。由于 Latin1 只使用一个字节表示一个字符，因此在存储和传输文本时具有较小的存储空间和较快的速度

从 char[] 到 byte[]，最主要的目的是节省字符串占用的内存空间。内存占用减少带来的另外一个好处，就是 GC 次数也会减少。

GC，也就是垃圾回收

jmap -histo:live pid | head -n 10 命令就可以查看到堆内对象示例的统计信息、ClassLoader 的信息以及 finalizer 队列等。

Java 的对象基本上都在堆上。

pid 就是进程号，可以通过 ps -ef | grep java 命令查看

其中 String 对象有 17638 个，占用了 423312 个字节的内存

由于 Java 8 的 String 内部实现仍然是 char[]，所以我们可以看到内存占用排在第 1 位的就是 char 数组。

char[] 对象有 17673 个，占用了 1621352 个字节的内存，排在第一位。

那也就是说优化 String 节省内存空间是非常有必要的，如果是去优化一个使用频率没有 String 这么高的类，就没什么必要，对吧？

众所周知，char 类型的数据在 JVM 中是占用两个字节的，并且使用的是 UTF-8 编码，其值范围在 '\u0000'（0）和 '\uffff'（65,535）（包含）之间。

也就是说，使用 char[] 来表示 String 就会导致，即使 String 中的字符只用一个字节就能表示，也得占用两个字节。

当然了，仅仅将 char[] 优化为 byte[] 是不够的，还要配合 Latin-1 的编码方式，该编码方式是用单个字节来表示字符的，这样就比 UTF-8 编码节省了更多的空间。

换句话说，对于：

String name = "jesk";

这样的，使用 Latin-1 编码，占用 4 个字节就够了。

但对于：

String name = "哈哈";

这种，木的办法，只能使用 UTF16 来编码。

针对 JDK 9 的 String 源码里，为了区别编码方式，追加了一个 coder 字段来区分。

也就是说，从 char[] 到 byte[]，中文是两个字节，纯英文是一个字节，在此之前呢，中文是两个字节，英文也是两个字节。

### String 类的 hashCode 方法

第六，每一个字符串都会有一个 hash 值，这个哈希值在很大概率是不会重复的，因此 String 很适合来作为 HashMap

hashCode 方法首先检查是否已经计算过哈希码，如果已经计算过，则直接返回缓存的哈希码。否则，方法将使用一个循环遍历字符串的所有字符，并使用一个乘法和加法的组合计算哈希码。

这种计算方法被称为“31 倍哈希法”。计算完成后，将得到的哈希值存储在 hash 成员变量中，以便下次调用 hashCode 方法时直接返回该值，而不需要重新计算。这是一种缓存优化，称为“惰性计算”。


### String 类的 substring 方法

String 类中还有一个方法比较常用 substring，用来截取字符串的

### String 类的 indexOf 方法

indexOf 方法用于查找一个子字符串在原字符串中第一次出现的位置，并返回该位置的索引。

### String 类的其他方法

①、比如说 length() 用于返回字符串长度。

②、比如说 isEmpty() 用于判断字符串是否为空。

③、比如说 charAt() 用于返回指定索引处的字符。

④、比如说 valueOf() 用于将其他类型的数据转换为字符串。

### 为什么Java字符串是不可变的？

比如说 String 的不可变性。

- String 类被 final 关键字修饰，所以它不会有子类，这就意味着没有子类可以重写它的方法，改变它的行为。
- String 类的数据存储在 char[] 数组中，而这个数组也被 final 关键字修饰了，这就表示 String 对象是没法被修改的，只要初始化一次，值就确定了。

第一，可以保证 String 对象的安全性，避免被篡改，毕竟像密码这种隐私信息一般就是用字符串存储的。

第二，保证哈希值不会频繁变更。毕竟要经常作为哈希表的键值，经常变更的话，哈希表的性能就会很差劲。

第三，可以实现字符串常量池，Java 会将相同内容的字符串存储在字符串常量池中。这样，具有相同内容的字符串变量可以指向同一个 String 对象，节省内存空间。

“由于字符串的不可变性，String 类的一些方法实现最终都返回了新的字符串对象。”

“就拿 substring() 方法来说。”

substring() 方法用于截取字符串，最终返回的都是 new 出来的新字符串对象。

“还有 concat() 方法。”

concat() 方法用于拼接字符串，不管编码是否一致，最终也返回的是新的字符串对象。

“这就意味着，不管是截取、拼接，还是替换，都不是在原有的字符串上进行的，而是重新生成了新的字符串对象。也就是说，这些操作执行过后，原来的字符串对象并没有发生改变。”


