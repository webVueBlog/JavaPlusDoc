---
title: Iterator和Iterable的区别
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## Iterator和Iterable的区别

在 Java 中，我们对 List 进行遍历的时候，主要有这么三种方式。

第一种：for 循环。

第二种：迭代器。

第三种：for-each。

第一种我们略过，第二种用的是 Iterator，第三种看起来是 for-each，其实背后也是 Iterator，看一下反编译后的代码就明白了。

for-each 只不过是个语法糖，让我们开发者在遍历 List 的时候可以写更少的代码，更简洁明了。

Iterator 是个接口，JDK 1.2 的时候就有了，用来改进 Enumeration 接口：

1. 允许删除元素（增加了 remove 方法）
2. 优化了方法名（Enumeration 中是 hasMoreElements 和 nextElement，不简洁）

```
public interface Iterator<E> {
    // 判断集合中是否存在下一个对象
    boolean hasNext();
    // 返回集合中的下一个对象，并将访问指针移动一位
    E next();
    // 删除集合中调用next()方法返回的对象
    default void remove() {
        throw new UnsupportedOperationException("remove");
    }
}
```

JDK 1.8 时，Iterable 接口中新增了 forEach 方法。该方法接受一个 Consumer 对象作为参数，用于对集合中的每个元素执行指定的操作。该方法的实现方式是使用 for-each 循环遍历集合中的元素，对于每个元素，调用 Consumer 对象的 accept 方法执行指定的操作。

```
default void forEach(Consumer<? super T> action) {
    Objects.requireNonNull(action);
    for (T t : this) {
        action.accept(t);
    }
}
```










