---
title: Java方法
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

## Java方法

实例方法、静态方法与抽象方法的区别与应用

什么是方法？如何声明方法？方法有哪几种？什么是实例方法？什么是静态方法？什么是抽象方法？什么是本地方法？

01、Java中的方法是什么？

方法用来实现代码的可重用性，我们编写一次方法，并多次使用它。通过增加或者删除方法中的一部分代码，就可以提高整体代码的可读性。

02、如何声明方法？

方法的声明反映了方法的一些信息，比如说可见性、返回类型、方法名和参数。

03、方法有哪几种？

方法可以分为两种，一种叫标准类库方法，一种叫用户自定义方法。

05、什么是静态方法？

相应的，有 static 关键字修饰的方法就叫做静态方法。

06、什么是抽象方法？

没有方法体的方法被称为抽象方法，它总是在抽象类中声明。

### Java可变参数详解

	public static void main(String[] args) {
		print("想");
		print("想", "啊");
		print("想", "啊", "的");
		print("想", "啊", "的", "啊");
	}

	public static void print(String... strs) {
		for (String s : strs)
			System.out.print(s);
		System.out.println();
	}









