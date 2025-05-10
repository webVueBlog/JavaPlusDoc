---
title: 抽象类
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## 抽象类

01、定义抽象类

定义抽象类的时候需要用到关键字 abstract，放在 class 关键字前，就像下面这样。


	abstract class AbstractPlayer {
	}

02、抽象类的特征

抽象类是不能实例化的，尝试通过 new 关键字实例化的话，编译器会报错，提示“类是抽象的，不能实例化”。

虽然抽象类不能实例化，但可以有子类。子类通过 extends 关键字来继承抽象类。

如果一个类定义了一个或多个抽象方法，那么这个类必须是抽象类。

第二处在尝试定义 abstract 的方法上，提示“抽象方法所在的类不是抽象的”

抽象类派生的子类必须实现父类中定义的抽象方法。比如说，抽象类 AbstractPlayer 中定义了 play() 方法，子类 BasketballPlayer 中就必须实现。


如果没有实现的话，编译器会提示“子类必须实现抽象方法”

### 对于抽象类我们简单总结一下：

1、抽象类不能被实例化。

2、抽象类应该至少有一个抽象方法，否则它没有任何意义。

3、抽象类中的抽象方法没有方法体。

4、抽象类的子类必须给出父类中的抽象方法的具体实现，除非该子类也是抽象类。



