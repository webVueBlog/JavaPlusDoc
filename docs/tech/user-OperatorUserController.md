---
title: 用户控制
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://github.com/user-attachments/assets/afcaa7cf-2f01-4cf4-8bbe-9e0f5af57699">

## 用户控制

```java
    public RestRetO getMyInfo(HttpServletRequest request) {
        // todo 创建时间
    }

    public RestRet logout(HttpServletRequest request) {
    
    }

    public RestRet getMyCouponInfo(String state, HttpServletRequest request) {
    
    }

    public RestRet getMyAccountInfo(HttpServletRequest request) {
    
    }

    public RestRetO getMyAccountInout(@RequestBody AccountInoutBO accountInoutBO, HttpServletRequest request) {
    
    }

    public RestRet getMyDepositInfo(HttpServletRequest request) {
    
    }

    public RestRetO getMyDepositInout(@RequestBody CashFlowBO cashFlowBO, HttpServletRequest request) {
        //资金流水， 关于押金流水类型
    }

    public RestRet getMyPointsInfo(HttpServletRequest request) {
        //根据用户id查询我的积分
    }
    
    //积分明细
    public RestRetO getMyPointsInout(@RequestBody PointsInoutBO pointsInoutBO, HttpServletRequest request) {
        //pageQuery
        //setOrderDetailInfo
    }

    public RestRet unlockDeposit(HttpServletRequest request) {

    }

    public RestRet getCityByOrg(HttpServletRequest request) {
        //查询特定的城市信息
        //return RestRet.createSuccess("查询城市列表成功!", GsonUtils.getJsonFromObject(xxxInfoService.aggregateCity(xxxInfoBO)));
    }

    public RestRetO getIdCardNoFromImage(@ApiParam("身份证照片")
                                         @RequestParam("imageUrl") String imageUrl,
                                         @ApiParam("是否正面(true/false)")
                                         @RequestParam("front") Boolean front,
                                         HttpServletRequest request) {
        //身份证图片识别
    }
    
    
```

![img_1.png](./img_1.png)

