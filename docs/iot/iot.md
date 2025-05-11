---
title: 物联网iot
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## 物联网iot

类 AppListener 是一个 `Spring Boot` 应用的监听器，主要用于在应用程序启动并准备就绪后执行一些初始化操作。它实现了 `ApplicationListener<ApplicationReadyEvent>` 接口，监听 Spring Boot 应用的启动事件，并在应用完全启动后执行逻辑。

### 作用：

AppListener 监听应用启动事件（`ApplicationReadyEvent`），并在应用启动完成后执行以下操作：

* 启动一个 TCP 服务端 JT808 进行监听。
* 启动一个独立线程，定期同步实时信息到缓存。

### 过程：

初始化和依赖注入：

* 使用 @Autowired 注解注入了 类的实例，这些组件在应用启动后将被用于执行具体任务。
* 日志对象 logger 用于记录应用运行时的信息，使用了 SLF4J 和 Logback 来输出日志。

监听 `ApplicationReadyEvent`：

onApplicationEvent 方法在应用启动完成并准备就绪后被调用。

启动 `TCP` 服务端：

在 `onApplicationEvent` 方法中，首先通过创建一个新的线程 Thread 来启动 TCP 服务端监听 。

同步实时信息到缓存：

另一个线程 用于定期将实时信息同步到缓存。该线程会在 while(true) 无限循环中运行，不断调用  方法同步数据。
每次同步后，记录同步操作的耗时，并休眠 毫秒再进行下一次同步。

异常处理：

* 在整个过程中，异常被捕获并打印日志（logger.error），如果有任何异常，程序会尝试输出错误信息，并在 `onApplicationEvent` 方法的最外层捕获异常来确保应用能捕获到初始化过程中的错误。
* 如果捕获到异常，应用会退出（调用 `System.exit(0)`）。

总结：

AppListener 的作用是当 Spring Boot 应用启动完成后，自动启动一些后台服务，比如：

* 启动 TCP 服务端监听客户端连接。
* 定期同步实时信息到缓存中。 这些任务是应用启动后需要进行的初始化操作。
