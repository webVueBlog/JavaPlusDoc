---
title: 掌握运算符
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读


## 掌握运算符

### 01、算术运算符

	int a = 10;
	float c = 3.0f;
	double d = 3.0;
	System.out.println(a / c); // 3.3333333
	System.out.println(a / d); // 3.3333333333333335
	System.out.println(a % c); // 1.0
	System.out.println(a % d); // 1.0

需要注意的是，当浮点数除以 0 的时候，结果为 Infinity 或者 NaN。

	System.out.println(10.0 / 0.0); // Infinity
	System.out.println(0.0 / 0.0); // NaN

Infinity 的中文意思是无穷大，NaN 的中文意思是这不是一个数字（Not a Number）。

当整数除以 0 的时候（10 / 0），会抛出异常：

	Exception in thread "main" java.lang.ArithmeticException: / by zero
		at com.itwanger.eleven.ArithmeticOperator.main(ArithmeticOperator.java:32)

所以整数在进行除法运算时，需要先判断除数是否为 0，以免程序抛出异常。

算术运算符中还有两种特殊的运算符，自增运算符（++）和自减运算符（--），它们也叫做一元运算符，只有一个操作数。

	int x = 10;
	System.out.println(x++);//10 (11)  
	System.out.println(++x);//12  
	System.out.println(x--);//12 (11)  
	System.out.println(--x);//10

	int x = 10;
	int y = ++x;
	System.out.println(y + " " + x);// 11 11

	x = 10;
	y = x++;
	System.out.println(y + " " + x);// 10 11

### 02、关系运算符

关系运算符用来比较两个操作数，返回结果为 true 或者 false。

### 03、位运算符

在学习位运算符之前，需要先学习一下二进制，因为位运算符操作的不是整型数值（int、long、short、char、byte）本身，而是整型数值对应的二进制。

因为我们日常接触的都是十进制，位运算的时候需要先转成二进制

为了提高程序的性能，会在一些地方使用位运算。比如说，HashMap 在计算哈希值的时候：

	static final int hash(Object key) {
		int h;
		return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
	}

10<<2 等于 10 乘以 2 的 2 次方；10<<3 等于 10 乘以 2 的 3 次方。

10>>2 等于 10 除以 2 的 2 次方；20>>2 等于 20 除以 2 的 2 次方。

### 04、逻辑运算符

逻辑与运算符（&&）：多个条件中只要有一个为 false 结果就为 false。

逻辑或运算符（||）：多个条件只要有一个为 true 结果就为 true。

逻辑非运算符（!）：用来反转条件的结果，如果条件为 true，则逻辑非运算符将得到 false。

单逻辑与运算符（&）：很少用，因为不管第一个条件为 true 还是 false，依然会检查第二个。

单逻辑或运算符（|）：也会检查第二个条件。

也就是说，& 和 | 性能不如 && 和 ||，但用法一样

### 05、赋值运算符

结果非常大的时候，尽量提前使用相应的类型进行赋值。

### 06、三元运算符

如果 ? 前面的条件为 true，则结果为 : 前的值，否则为 : 后的值。
