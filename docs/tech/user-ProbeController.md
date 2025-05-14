---
title: 探测控制
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://github.com/user-attachments/assets/51a2d7c4-49e0-4413-8756-34f8910fb0e8">

## 探测控制

1. 使用@Api注解，tags为"探测接口"，value为"探测接口"
2. 使用@Slf4j注解，用于日志记录
3. 使用@RestController注解，表示该类是一个RESTful风格的控制器

```java

// 使用@RequestMapping注解，指定该类中所有方法的请求路径为"/probe"，produces指定返回的数据类型为"application/json;text/html;charset=utf-8;"
public RestRet info(@RequestBody String reqJson, HttpServletRequest request) {
    //探测信息成功
}
```















