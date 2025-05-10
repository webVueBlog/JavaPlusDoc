---
title: 接口和内部类
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## 接口和内部类

接口通过 interface 关键字来定义

1）接口中定义的变量会在编译的时候自动加上 public static final 修饰符

2）没有使用 private、default 或者 static 关键字修饰的方法是隐式抽象的

3）从 Java 8 开始，接口中允许有静态方法

4）接口中允许定义 default 方法

我们还应该知道：

1）接口不允许直接实例化，否则编译器会报错。

2）接口可以是空的，既可以不定义变量，也可以不定义方法。最典型的例子就是 Serializable 接口，在 java.io 包下。

3）不要在定义接口的时候使用 final 关键字，否则会报编译错误，因为接口就是为了让子类实现的，而 final 阻止了这种行为。

4）接口的抽象方法不能是 private、protected 或者 final，否则编译器都会报错。

5）接口的变量是隐式 public static final（常量），所以其值无法改变。

### 接口的三种模式

1）策略模式

策略模式的思想是，针对一组算法，将每一种算法封装到具有共同接口的实现类中，接口的设计者可以在不影响调用者的情况下对算法做出改变。

2）适配器模式

适配器模式的思想是，针对调用者的需求对原有的接口进行转接。生活当中最常见的适配器就是HDMI（英语：High Definition Multimedia Interface，中文：高清多媒体接口）线，可以同时发送音频和视频信号。

3）工厂模式

所谓的工厂模式理解起来也不难，就是什么工厂生产什么，比如说宝马工厂生产宝马，奔驰工厂生产奔驰，A 级学院毕业 A 级教练，C 级学院毕业 C 级教练。


### 简单总结一下抽象类和接口的区别。

在 Java 中，通过关键字 abstract 定义的类叫做抽象类。Java 是一门面向对象的语言，因此所有的对象都是通过类来描述的；但反过来，并不是所有的类都是用来描述对象的，抽象类就是其中的一种。

接口（英文：Interface），在 Java 中是一个抽象类型，是抽象方法的集合；接口通过关键字 interface 来定义。接口与抽象类的不同之处在于：

1、抽象类可以有方法体的方法，但接口没有（Java 8 以前）。

2、接口中的成员变量隐式为 static final，但抽象类不是的。

3、一个类可以实现多个接口，但只能继承一个抽象类。

## 成员内部类、局部内部类、匿名内部类、静态内部类

在 Java 中，可以将一个类定义在另外一个类里面或者一个方法里面，这样的类叫做内部类。

一般来说，内部类分为成员内部类、局部内部类、匿名内部类和静态内部类。

1）成员内部类

成员内部类是最常见的内部类

内部类可以随心所欲地访问外部类的成员，但外部类想要访问内部类的成员，就不那么容易了，必须先创建一个成员内部类的对象，再通过这个对象来访问

这也就意味着，如果想要在静态方法中访问成员内部类的时候，就必须先得创建一个外部类的对象，因为内部类是依附于外部类的。

	public class Wanger {
		int age = 18;
		private String name = "实时";
		static double money = 1;

		public Wanger () {
			new Wangxiaoer().print();
		}

		class Wangxiaoer {
			int age = 81;

			public void print() {
				System.out.println(name);
				System.out.println(money);
			}
		}
	}


	public class Wanger {
		int age = 18;
		private String name = "啊啊";
		static double money = 1;

		public Wanger () {
			new Wangxiaoer().print();
		}

		public static void main(String[] args) {
			Wanger wanger = new Wanger();
			Wangxiaoer xiaoer = wanger.new Wangxiaoer();
			xiaoer.print();
		}

		class Wangxiaoer {
			int age = 81;

			public void print() {
				System.out.println(name);
				System.out.println(money);
			}
		}
	}


局部内部类是定义在一个方法或者一个作用域里面的类，所以局部内部类的生命周期仅限于作用域内。

匿名内部类是我们平常用得最多的，尤其是启动多线程的时候，会经常用到，并且 IDE 也会帮我们自动生成。

	public class ThreadDemo {
		public static void main(String[] args) {
			Thread t = new Thread(new Runnable() {
				@Override
				public void run() {
					System.out.println(Thread.currentThread().getName());
				}
			});
			t.start();
		}
	}

匿名内部类是唯一一种没有构造方法的类。

静态内部类和成员内部类类似，只是多了一个 static 关键字。




