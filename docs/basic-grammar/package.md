---
title: Java中的包
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## Java中的包

在 Java 虚拟机执行的时候，JVM 只看完整类名，因此，只要包名不同，类就不同。

位于同一个包的类，可以访问包作用域的字段和方法。

不用public、protected、private修饰的字段和方法就是包作用域。

	package hello;

	public class Person {
		// 包作用域:
		void hello() {
			System.out.println("Hello!");
		}
	}

### 导入包

第一种，直接写出完整类名

第二种写法是用import语句

还有一种import static的语法


Java 内建的package机制是为了避免class命名冲突；

JDK 的核心类使用java.lang包，编译器会自动导入；

