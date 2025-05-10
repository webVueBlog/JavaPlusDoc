---
title: StringBuilder和StringBuffer
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## StringBuilder和StringBuffer

StringBuilder

### StringBuffer和StringBuilder的区别

由于字符串是不可变的，所以当遇到字符串拼接（尤其是使用+号操作符）的时候，就需要考量性能的问题，你不能毫无顾虑地生产太多 String 对象，对珍贵的内存造成不必要的压力。

Java 就设计了一个专门用来解决此问题的 StringBuffer 类。

由于 StringBuffer 操作字符串的方法加了 synchronized 关键字进行了同步，主要是考虑到多线程环境下的安全问题，所以如果在非多线程环境下，执行效率就会比较低，因为加了没必要的锁。

于是 Java 就给 StringBuffer “生了个兄弟”，名叫 StringBuilder，说，“孩子，你别管线程安全了，你就在单线程环境下使用，这样效率会高得多，如果要在多线程环境下修改字符串，你到时候可以使用 ThreadLocal 来避免多线程冲突。”

实际开发中，StringBuilder 的使用频率也是远高于 StringBuffer，甚至可以这么说，StringBuilder 完全取代了 StringBuffer。

### StringBuilder的使用

javap 和字节码

可以看到 Java 编译器将字符串拼接操作（+）转换为了 StringBuilder 对象的 append 方法，然后再调用 StringBuilder 对象的 toString 方法返回拼接后的字符串。

### StringBuilder的内部实现

在 StringBuilder 对象创建时，会为 value 分配一定的内存空间（初始容量 16），用于存储字符串。

	/**
	 * The value is used for character storage.
	 */
	char[] value;


	/**
	 * Constructs a string builder with no characters in it and an
	 * initial capacity of 16 characters.
	 */
	public StringBuilder() {
		super(16);
	}

随着字符串的拼接，value 数组的长度会不断增加，因此在 StringBuilder 对象的实现中，value 数组的长度是可以动态扩展的，就像ArrayList那样。

实际上是调用了 AbstractStringBuilder 中的 append(String str) 方法。在 AbstractStringBuilder 中，append(String str) 方法会检查当前字符序列中的字符是否够用，如果不够用则会进行扩容，并将指定字符串追加到字符序列的末尾。

append(String str) 方法将指定字符串追加到当前字符序列中。如果指定字符串为 null，则追加字符串 "null"；否则会检查指定字符串的长度，然后根据当前字符序列中的字符数和指定字符串的长度来判断是否需要扩容。

如果需要扩容，则会调用 ensureCapacityInternal(int minimumCapacity) 方法。扩容之后，将指定字符串的字符拷贝到字符序列中。


### tringBuilder的 reverse 方法

- 如果指定的最小容量大于当前容量，则新容量为两倍的旧容量加上 2。为什么要加 2 呢？对于非常小的字符串（比如空的或只有一个字符的 StringBuilder），仅仅将容量加倍可能仍然不足以容纳更多的字符。在这种情况下，+ 2 提供了一个最小的增长量，确保即使对于很小的初始容量，扩容后也能至少添加一些字符而不需要立即再次扩容。
- 如果指定的最小容量小于等于当前容量，则不会进行扩容，直接返回当前对象。

在进行扩容之前，ensureCapacityInternal(int minimumCapacity) 方法会先检查当前字符序列的容量是否足够，如果不足就会调用 expandCapacity(int minimumCapacity) 方法进行扩容。expandCapacity(int minimumCapacity) 方法首先计算出新容量，然后使用 Arrays.copyOf(char[] original, int newLength) 方法将原字符数组扩容到新容量的大小。

StringBuilder 还提供了一个 reverse 方法，用于反转当前字符序列中的字符。







