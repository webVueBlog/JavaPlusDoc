---
title: 用户登录认证服务
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## 用户登录认证服务

```java
    /**
     * 发送短信
     * 该方法用于发送短信验证码
     *
     * @param mobile 接收短信的手机号
     * @param smsCode 短信验证码
     * @return 发送是否成功
     */
    // 发送短信
    public boolean sendSms(String mobile, String smsCode) throws ClientException {
        try {
            // 创建DefaultProfile对象，用于初始化IAcsClient
            DefaultProfile profile = DefaultProfile.getProfile(regionId, accessKeyId, accessKeySecret);
            IAcsClient client = new DefaultAcsClient(profile);

            // 创建API请求并设置参数
            CommonRequest request = createRequest(mobile, smsCode);

            // 发送请求并获取响应
            CommonResponse response = client.getCommonResponse(request);

            // 将响应数据转换为JsonObject对象
            JsonObject result =  GsonUtils.getObjectFromJson(response.getData(), JsonObject.class);
            // 打印发送短信结果
            log.info("==>发送短信结果 {}",GsonUtils.getJsonFromObject(result));
            // 判断发送短信结果是否为"OK"
            return "\"OK\"".equals(result.get("Code").toString());
        } catch (Exception e) {
            // 打印发送短信异常
            log.error("发送短信异常: {}", e.getMessage(), e);
        }
        // 发送短信失败，返回false
        return false;
    }
    
    /**
     * 创建短信发送请求
     * 该方法用于创建并配置短信发送的请求对象
     *
     * @param mobile 接收短信的手机号
     * @param smsCode 短信验证码
     * @return 配置好的CommonRequest对象
     */
    // 创建一个CommonRequest对象，用于发送短信
    private CommonRequest createRequest(String mobile, String smsCode) {
        // 创建一个CommonRequest对象
        CommonRequest request = new CommonRequest();
        // 设置请求方法为POST
        request.setMethod(MethodType.POST);
        // 设置请求域名
        request.setDomain(domain);
        // 设置请求版本
        request.setVersion(action);
        // 设置请求动作
        request.setAction(sendSms);
        // 设置请求参数RegionId
        request.putQueryParameter("RegionId", regionId);
        // 设置请求参数PhoneNumbers
        request.putQueryParameter("PhoneNumbers", mobile);
        // 设置请求参数SignName
        request.putQueryParameter("SignName", signName);
        // 设置请求参数TemplateCode
        request.putQueryParameter("TemplateCode", templateCode);
        // 设置请求参数TemplateParam
        request.putQueryParameter("TemplateParam", "{\"code\":\"" + smsCode + "\"}");
        // 返回CommonRequest对象
        return request;
    }
```













