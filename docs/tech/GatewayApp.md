---
title: GatewayApp
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## GatewayApp

```java
// 启用Swagger2
@EnableSwagger2
// 启用FeignClients
@EnableFeignClients
// 启用DiscoveryClient
@EnableDiscoveryClient
// Spring Boot应用程序启动类
@SpringBootApplication(
        // 排除SecurityAutoConfiguration和DataSourceAutoConfiguration
        exclude ={ SecurityAutoConfiguration.class,DataSourceAutoConfiguration.class},
        // 扫描指定包下的类
        scanBasePackages = {"com.xxx"})
```
