---
title: dubbo-bug
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## dubbo-bug

某天运营反馈，点了⼀次保存，但是后台出现了3条数据，我当时就想，不应该啊，这代码我⼏万年没
动了，我当时就叫他先别操作了，保留⼀下现场，我去排查⼀下。

dubbo的xml配置⽅式改成了注解的⽅式。

其实dubbo配置的⽅式有很多种，⼤家⽤的最多的就是xml配置的⽅式，如果不需要重试次数，我们会
加上重试次数为0，因为他默认是有多次的。

dubbo版本：2.6.2

```
<dubbo:reference id="testService"
interface="heiidea.trade.service.sdk.interfice.TestService" retries="0"/>
```

或者使⽤注解的⽅式

```
@Reference(retries =0)
```

采⽤@Reference注解配置重试次数

⾸先是都找到了dubbo重试的代码位置（启动dubbo项⽬，到调⽤接⼝时，F5进⼊⽅法，会跳转到
InvokerInvocationHandler中的invoke⽅法中，继续跟踪进⼊MockClusterInvoker中的invoke⽅法，然后
进⼊AbstractClusterInvoker中的invoke⽅法中，这⾥主要是拿到配置的负载均衡策略，后⾯会到
FailoverClusterInvoker的doInvoke⽅法中）。

重点来了，这⾥会获取配置的retries值，可以看到上⾯配置的是0，但是取出来居然是null

所以会返回defaultValue，加上本身调⽤的那⼀次，计算之后就会为3

所以可以发现，采⽤@Reference注解的形式配置retries为0时，dubbo重试次数为2次（3中包含本身调
⽤的那次）。

后⾯是采⽤ dubbo:reference 标签的⽅式：

```
<dubbo:reference id="testService"
interface="heiidea.trade.service.sdk.interfice.TestService" retries="0"/>

protocol="dubbo" check="false" retries="0" timeout="3000"/>

```

⽅式如上，在获取属性的时候，可以看到获得的值为0，和注解形式配置的⼀致

```
所以可以发现，采⽤ dubbo:reference 标签形式配置retries为0时，dubbo重试次数为0（1为本身调⽤的
那次）。
```

加上本身调⽤的那⼀次，计算之后就会为1

## 原因分析

⾸先是@Reference注解形式：

dubbo会把每个接⼝先解析为ReferenceBean，加上ReferenceBean实现了FactoryBean接⼝，所以在注
⼊的时候，会调⽤getObject⽅法，⽣成代理对象。

但是这不是关键，因为到这⼀步时，所有的属性都已经加载完成，所以需要找到dubbo解析注解中属性
的代码位置。

dubbo会使⽤⾃定义驱动器ReferenceAnnotationBeanPostProcessor来注⼊属性，⽽具体执⾏注⼊的代
码位置是在ReferenceAnnotationBeanPostProcessor类的postProcessPropertyValues⽅法中调⽤inject
⽅法执⾏的。

重点来了，因为采⽤标签时，是采⽤@Autowired注解注⼊，所以是采⽤spring原⽣⽅式注⼊，⽽在采⽤
@Reference注解时，注⼊时会⾛到dubbo⾃⼰的ReferenceAnnotationBeanPostProcessor中私有内部
类ReferenceFieldElement的inject⽅法中，然后调⽤buildReferenceBean创建ReferenceBean。

离原因越来越近了，在该⽅法中可以看到beanBuilder中的retries值还是0，说明到这⼀步还没有被解析
为null

继续往下⾛，调⽤build⽅法中的configureBean时，在第⼀步preConfigureBean中⽅法，在该⽅法中会
创建AnnotationPropertyValuesAdapter对象，在该对象构造⽅法中会调⽤adapt⽅法，然后⾛到
AnnotationUtils中的getAttributes⽅法中，有⼀个关键⽅法nullSafeEquals，该⽅法会传⼊当前属性值和
默认值。

如果相等，则会忽略掉该属性，然后将符合条件的属性放⼊actualAttributes这个map中，⽽我们的
retries属性是0，和默认值⼀致，所以map中不会保存retries属性的值，只有timeout属性，因此出现了
后⾯获取的值为null。

注解⽅式debug告⼀段落。


标签形式⾛到inject时，会和注解形式有所不同，采⽤该标签时，dubbo会使⽤⾃定义的名
称空间解析器去解析，很容易理解，spring也不知道它⾃定义标签⾥⾯那些玩意⼉是什么意思，所以
dubbo会继承spring的。

NamespaceHandlerSupport，采⽤⾃定义的DubboNamespaceHandler解析器来解析的标签

然后调⽤该类中的parse⽅法进⾏解析，⽽解析retries的地⽅就是获取class（此时的class就是上图绿⾊
标明的ReferenceBean的class，其⽗类中有好多好多set⽅法，其中就包含setRetries⽅法）中所有的⽅
法，过滤出set开头的⽅法，然后切割出属性名，放⼊属性池中，可以看到此处解析出的值为0，并不为
null

## 小结

解析重试次数Retries

1. @Reference注解形式：采⽤dubbo⾃⼰的驱动器ReferenceAnnotationBeanPostProcessor来注⼊属性，
2. 在ReferenceAnnotationBeanPostProcessor类的postProcessPropertyValues⽅法中调⽤inject⽅法执⾏的。

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">