---
title: 积分控制
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://github.com/user-attachments/assets/afcaa7cf-2f01-4cf4-8bbe-9e0f5af57699">

## 积分控制


```java
    @ApiOperation(value = "积分商品查询", notes = "积分商品查询")
    public RestRetO getPointsWares(HttpServletRequest request) throws Exception {
    }

    @ApiOperation(value = "积分商品兑换", notes = "积分商品兑换")
    public RestRetO getPointsExchange(@RequestParam("waresId") String waresId, HttpServletRequest request) throws Exception {
        
    }

    @ApiOperation(value = "积分记录分页查询", notes = "积分记录分页查询")
    public RestRetO getPointsExchangeHis(@RequestBody PointsInoutBO pointsInoutBO, HttpServletRequest request) throws Exception {
        // 手机号 + 身份证号
    }
```

