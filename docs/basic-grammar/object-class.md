---
title: 万物皆对象
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## 万物皆对象

面向对象编程（OOP）

OOP 的英文全称是 Object Oriented Programming，要理解它的话，就要先理解面向对象，要想理解面向对象的话，就要先理解面向过程，因为一开始没有面向对象的编程语言，都是面向过程。

1）自己买食材，豆腐皮啊、肉啊、蒜苔啊等等，自己动手做。

2）到饭店去，只需要对老板喊一声，“来份小碗汤。”

第一种就是面向过程，第二种就是面向对象。

面向对象是模块化的，我做我的，你做你的，我需要你做的话，我就告诉你一声。我不需要知道你到底怎么做，只看功劳不看苦劳。

不过，如果追到底的话，面向对象的底层其实还是面向过程，只不过把面向过程进行了抽象化，封装成了类，方便我们的调用。

### 类

对象可以是现实中看得见的任何物体，比如说，一只特立独行的猪；也可以是想象中的任何虚拟物体，比如说能七十二变的孙悟空。

Java 通过类（class）来定义这些物体，这些物体有什么状态，通过字段来定义，比如说比如说猪的颜色是纯色还是花色；这些物体有什么行为，通过方法来定义，比如说猪会吃，会睡觉。

成员变量有时候也叫做实例变量，在编译时不占用内存空间，在运行时获取内存，也就是说，只有在对象实例化（new Person()）后，字段才会获取到内存，这也正是它被称作“实例”变量的原因。

“怎么没有构造方法呢？”

Person 类的源码文件（.java）中没看到，但在反编译后的字节码文件（.class）中是可以看得到的。

public Person(){} 就是默认的构造方法，因为是空的构造方法（方法体中没有内容），所以可以缺省。

### new 一个对象

创建 Java 对象时，需要用到 new 关键字。

所有对象在创建的时候都会在堆内存中分配空间。

创建对象的时候，需要一个 main() 方法作为入口， main() 方法可以在当前类中，也可以在另外一个类中。

	public class PersonTest {
		public static void main(String[] args) {
			Person person = new Person();
		}
	}

	class Person {
		private String name;
		private int age;
		private int sex;

		private void eat() {}
		private void sleep() {}
		private void dadoudou() {}
	}



### 初始化对象

因为 Person 对象没有初始化，因此输出了 String 的默认值 null，int 的默认值 0。

那怎么初始化 Person 对象（对字段赋值）呢？

第一种：通过对象的引用变量。

第二种：通过方法初始化。

第三种：通过构造方法初始化。

匿名对象意味着没有引用变量，它只能在创建的时候被使用一次。

可以直接通过匿名对象调用方法

### 关于 Object 类

Object 主要提供了 11 个方法

对象比较：

①、public native int hashCode() ：native 方法，用于返回对象的哈希码。

②、public boolean equals(Object obj)：用于比较 2 个对象的内存地址是否相等。


对象拷贝：

protected native Object clone() throws CloneNotSupportedException：naitive 方法，返回此对象的一个副本。默认实现只做浅拷贝，且类必须实现 Cloneable 接口。

Object 本身没有实现 Cloneable 接口，所以在不重写 clone 方法的情况下直接直接调用该方法会发生 CloneNotSupportedException 异常。

对象转字符串：

public String toString()：返回对象的字符串表示。默认实现返回类名@哈希码的十六进制表示，但通常会被重写以返回更有意义的信息。

也可以交给 Lombok，使用 @Data 注解，它会自动生成 toString 方法。

多线程调度：

每个对象都可以调用 Object 的 wait/notify 方法来实现等待/通知机制。

	public class WaitNotifyDemo {
		public static void main(String[] args) {
			Object lock = new Object();
			new Thread(() -> {
				synchronized (lock) {
					System.out.println("线程1：我要等待");
					try {
						lock.wait();
					} catch (InterruptedException e) {
						e.printStackTrace();
					}
					System.out.println("线程1：我被唤醒了");
				}
			}).start();
			new Thread(() -> {
				synchronized (lock) {
					System.out.println("线程2：我要唤醒");
					lock.notify();
					System.out.println("线程2：我已经唤醒了");
				}
			}).start();
		}
	}


线程 1 先执行，它调用了 lock.wait() 方法，然后进入了等待状态。

线程 2 后执行，它调用了 lock.notify() 方法，然后线程 1 被唤醒了。

public final native Class<?> getClass()：用于获取对象的类信息，如类名。

垃圾回收：

protected void finalize() throws Throwable：当垃圾回收器决定回收对象占用的内存时调用此方法。用于清理资源，但 Java 不推荐使用，因为它不可预测且容易导致问题，Java 9 开始已被弃用。


### 关于对象一些小知识

1）抽象的历程

2）对象具有接口

3）访问权限修饰符

4）组合

5）继承

6）多态
