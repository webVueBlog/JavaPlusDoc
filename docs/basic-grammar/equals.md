---
title: 如何比较两个字符串相等
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

## 如何比较两个字符串相等

“==”操作符用于比较两个对象的地址是否相等。

.equals() 方法用于比较两个对象的内容是否相等。

JDK 8 比 JDK 17 更容易懂一些：首先判断两个对象是否为同一个对象，如果是，则返回 true。接着，判断对象是否为 String 类型，如果不是，则返回 false。如果对象为 String 类型，则比较两个字符串的长度是否相等，如果长度不相等，则返回 false。如果长度相等，则逐个比较每个字符是否相等，如果都相等，则返回 true，否则返回 false。

如果要进行两个字符串对象的内容比较

Objects.equals() 这个静态方法的优势在于不需要在调用之前判空。

如果直接使用 a.equals(b)，则需要在调用之前对 a 进行判空，否则可能会抛出空指针 java.lang.NullPointerException。Objects.equals() 用起来就完全没有这个担心。

tring 类的 .contentEquals()

.contentEquals() 的优势在于可以将字符串与任何的字符序列（StringBuffer、StringBuilder、String、CharSequence）进行比较。

### 拼接字符串

循环体内，拼接字符串最好使用 StringBuilder 的 append() 方法，而不是 + 号操作符。原因就在于循环体内如果用 + 号操作符的话，就会产生大量的 StringBuilder 对象，不仅占用了更多的内存空间，还会让 Java 虚拟机不停的进行垃圾回收，从而降低了程序的性能。”

“和 + 号操作符相比，concat() 方法在遇到字符串为 null 的时候，会抛出 NullPointerException，而“+”号操作符会把 null 当做是“null”字符串来处理。”

如果拼接的字符串是一个空字符串（""），那么 concat 的效率要更高一点,毕竟不需要 new StringBuilder 对象。

如果拼接的字符串非常多，concat() 的效率就会下降，因为创建的字符串对象越来越多。

“实际的工作中，org.apache.commons.lang3.StringUtils 的 join() 方法也经常用来进行字符串拼接。”

### 拆分字符串

由于英文逗点属于特殊符号，所以在使用 split() 方法的时候，就需要使用正则表达式 \\. 而不能直接使用 .。





