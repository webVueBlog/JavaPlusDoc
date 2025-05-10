---
title: 深入解析Java泛型
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## 深入解析Java泛型

Java 在 1.5 时增加了泛型机制

```
class Arraylist {
    private Object[] objs;
    private int i = 0;
    public void add(Object obj) {
        objs[i++] = obj;
    }
    
    public Object get(int i) {
        return objs[i];
    }
}
```

1. Arraylist 可以存放任何类型的数据（既可以存字符串，也可以混入日期），因为所有类都继承自 Object 类。
2. 从 Arraylist 取出数据的时候需要强制类型转换，因为编译器并不能确定你取的是字符串还是日期。

1）类型参数化

泛型的本质是参数化类型，也就是说，在定义类、接口或方法时，可以使用一个或多个类型参数来表示参数化类型。

2）类型擦除

在 Java 的泛型机制中，有两个重要的概念：类型擦除和通配符。

泛型在编译时会将泛型类型擦除，将泛型类型替换成 Object 类型。这是为了向后兼容，避免对原有的 Java 代码造成影响。

3）通配符

通配符用于表示某种未知的类型，例如 List<?> 表示一个可以存储任何类型对象的 List，但是不能对其中的元素进行添加操作。通配符可以用来解决类型不确定的情况，例如在方法参数或返回值中使用。

