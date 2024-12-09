---
title: this与super关键字static
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

## this与super关键字static

调用当前类的方法；

this() 可以调用当前类的构造方法；

this 可以作为参数在方法中传递；

this 可以作为参数在构造方法中传递；

this 可以作为方法的返回值，返回当前类的对象。

“super 关键字的用法主要有三种。”

指向父类对象；

调用父类的方法；

super() 可以调用父类的构造方法。

### static

如果在声明变量的时候使用了 static 关键字，那么这个变量就被称为静态变量。静态变量只在类加载的时候获取一次内存空间，这使得静态变量很节省内存空间。

“静态方法有以下这些特征。”

静态方法属于这个类而不是这个类的对象；

调用静态方法的时候不需要创建这个类的对象；

静态方法可以访问静态变量。


	public class StaticBlock {
		static {
			System.out.println("静态代码块");
		}

		public static void main(String[] args) {
			System.out.println("main 方法");
		}
	}

“静态代码块通常用来初始化一些静态变量，它会优先于 main() 方法执行。”

既然静态代码块先于 main() 方法执行，那没有 main() 方法的 Java 类能执行成功吗？


“Java 1.6 是可以的，但 Java 7 开始就无法执行了。”

“静态代码块在初始集合的时候，真的非常有用。在实际的项目开发中，通常使用静态代码块来加载配置文件到内存当中。”


	public class Singleton {
		private Singleton() {}

		private static class SingletonHolder {
			public static final Singleton instance = new Singleton();
		}

		public static Singleton getInstance() {
			return SingletonHolder.instance;
		}
	}

“需要注意的是。第一，静态内部类不能访问外部类的所有成员变量；第二，静态内部类可以访问外部类的所有静态变量，包括私有静态变量。第三，外部类不能声明为 static。”

## final 关键字


“被 final 修饰的变量无法重新赋值。换句话说，final 变量一旦初始化，就无法更改。”


“被 final 修饰的方法不能被重写。如果我们在设计一个类的时候，认为某些方法不应该被重写，就应该把它设计成 final 的。”


### 为什么 String 类要设计成 final 吗？


为了实现字符串常量池

为了线程安全

为了 HashCode 的不可变性


## instanceof关键字


用意也非常简单，判断对象是否符合指定的类型，结果要么是 true，要么是 false。在反序列化的时候，instanceof 操作符还是蛮常用的，因为这时候我们不太确定对象属不属于指定的类型，如果不进行判断的话，就容易抛出 ClassCastException 异常。

先用 instanceof 进行类型判断，然后再把 obj 强制转换成我们期望的类型再进行使用。

