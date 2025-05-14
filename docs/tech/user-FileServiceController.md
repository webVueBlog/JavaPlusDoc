---
title: 文件服务
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## 文件服务

```java
@ApiOperation(value = "文件上传", notes = "文件上传")
public RestRetO uploadFile(@RequestPart @RequestParam("file")
                           MultipartFile file,
                           @ApiParam("存储类型(0-标准、1-低频访问)")
                           @RequestParam("sType")
                           Integer sType) {

}


```















