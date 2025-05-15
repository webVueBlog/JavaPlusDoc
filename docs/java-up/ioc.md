---
title: SpringIoC扫盲
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## SpringIoC扫盲

控制反转就是把创建和管理 bean 的过程转移给了第三方。而这个第三方，就是 Spring IoC Container，对于 IoC 来说，最重要的就是容器。

容器负责创建、配置和管理 bean，也就是它管理着 bean 的生命，控制着 bean 的依赖注入。

通俗点讲，因为项目中每次创建对象是很麻烦的，所以我们使用 Spring IoC 容器来管理这些对象，需要的时候你就直接用，不用管它是怎么来的、什么时候要销毁，只管用就好了。

举个例子，就好像父母没时间管孩子，就把小朋友交给托管所，就安心的去上班而不用管孩子了。托儿所，就是第三方容器，负责管理小朋友的吃喝玩乐；父母，相当于程序员，只管接送孩子，不用管他们吃喝。

等下，bean 又是什么？

Bean 其实就是包装了的 Object，无论是控制反转还是依赖注入，它们的主语都是 object，而 bean 就是由第三方包装好了的 object（想一下别人送礼物给你的时候都是要包装一下的，自己造的就免了）。

Bean 是 Spring 的主角，有种说法叫 Spring 就是面向 bean 的编程（Bean Oriented Programming, BOP）。

### 深入理解 IoC

这里用经典 class Rectangle 来举例：

两个变量：长和宽

自动生成 set() 方法和 toString() 方法

注意 ⚠️：一定要生成 set() 方法，因为 Spring IoC 就是通过这个 set() 方法注入的；toString() 方法是为了我们方便打印查看。

	public class Rectangle {
		private int width;
		private int length;

		public Rectangle() {
			System.out.println("Hello World!");
		}


		public void setWidth(int widTth) {
			this.width = widTth;
		}

		public void setLength(int length) {
			this.length = length;
		}

		@Override
		public String toString() {
			return "Rectangle{" +
					"width=" + width +
					", length=" + length +
					'}';
		}
	}


嗯，其实这个就是「解藕」的过程！

其实这就是 IoC 给属性赋值的实现方法，我们把「创建对象的过程」转移给了 set() 方法，而不是靠自己去 new，就不是自己创建的了。

这里我所说的“自己创建”，指的是直接在对象内部来 new，是程序主动创建对象的正向的过程；这里使用 set() 方法，是别人（test）给我的；而 IoC 是用它的容器来创建、管理这些对象的，其实也是用的这个 set() 方法，不信，你把这个这个方法去掉或者改个名字试试？

几个关键问题：

何为控制，控制的是什么？

答：是 bean 的创建、管理的权利，控制 bean 的整个生命周期。

何为反转，反转了什么？

答：把这个权利交给了 Spring 容器，而不是自己去控制，就是反转。由之前的自己主动创建对象，变成现在被动接收别人给我们的对象的过程，这就是反转。

举个生活中的例子，主动投资和被动投资。

自己炒股、选股票的人就是主动投资，主动权掌握在自己的手中；而买基金的人就是被动投资，把主动权交给了基金经理，除非你把这个基金卖了，否则具体选哪些投资产品都是基金经理决定的

## 为何

那么为什么要用 IoC 这种思想呢？换句话说，IoC 能给我们带来什么好处？

答：解藕。

