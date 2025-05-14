---
title: 交易服务
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://github.com/user-attachments/assets/51a2d7c4-49e0-4413-8756-34f8910fb0e8">

## 交易服务

交易服务

统一下单

統一退款申请

統一解冻

余额支付

余额提现

活动现金余额提现

分账入网申请

```java
@ApiOperation(value = "统一下单xxx")
public RestRet unifiedOrder(@RequestBody UnifiedOrderReq req, HttpServletRequest request) {
    
}

@ApiOperation(value = "統一退款xxx申请")
public RestRet unifiedRefund(@RequestBody RefundReq req,  HttpServletRequest request) {
    
}


@ApiOperation(value = "統一解冻xxx（免押）")
public RestRet unifiedFreeze(@RequestBody FreezeReq req, HttpServletRequest request) {
    
}

@ApiOperation(value = "余额xxx支付", notes = "余额xxx支付")
public RestRetO accountPayOrder(@RequestBody AccountPayBO accountPayBO, HttpServletRequest request, HttpServletResponse response) {
}

@ApiOperation(value = "余额xx提现", notes = "余额xx提现(退款)")
public RestRet balanceWithdrawal(@RequestBody AccountPayBO accountPayBO, HttpServletRequest request) {
    
}

@ApiOperation(value = "活动现金xx余额提现", notes = "活动现金xx余额提现")
public RestRet planCashTaking(@RequestBody AccountPayBO accountPayBO, HttpServletRequest request) {
    
}


@ApiOperation(value = "分账入网xx申请", notes = "分账入网xx申请")
public RestRet upsert(@RequestBody DivideEnterNetBO bo, HttpServletRequest request) {
    
}
```










