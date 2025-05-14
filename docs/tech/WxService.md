---
title: 微信服务类
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## 微信服务类


### 结构

>   1. im-pc 是聊天客户端，支持打包成exe 和 h5网页。
>   2. im-server 是服务端代码，集成了ruoyi的模块。

### 优势

1. PC端支持docx,xlsx,pdf，txt在线打开
2. 手机app端支持使用系统自动软件打开office，pdf附件
3. 支持图片右键复制为blob类型
4. 附件图标支持office类型图标
5. 支持ARM平台linux打包deb类型安装包

> 1. 多终端支持：PC(windows、linux、mac、web)
> 2. 手机（安卓、IOS、H5、小程序）；
> 3. 上传支持两种方案(直接存服务器和minio)； 聊天记录存储在mongoDB； 支持国产化部署，服务端已对接到snowy开源项目（分支版本）。

```java
    //微信快捷登录
    /**
     * 获取微信授权信息
     * 
     * @param code 微信授权码
     * @param operatorId 运营商ID
     * @return 微信应用授权信息
     * @throws Exception 如果获取过程中发生异常
     */
    //根据code和operatorId获取微信授权信息
    public WXAppAuthVO getCode(String code,String operatorId) throws Exception {
        //获取appid和secret
        String appid = wxConfigBean.getMaps().get(operatorId).getAppid();
        String secret = wxConfigBean.getMaps().get(operatorId).getSecret();

        //发送 code 到微信服务器换取 session_key
        StringBuilder url = new StringBuilder()
                .append("https://api.weixin.qq.com/sns/jscode2session")
                .append("?appid=").append(appid)
                .append("&secret=").append(secret)
                .append("&js_code=").append(code)
                .append("&grant_type=authorization_code");

        //创建URL对象
        URL urlGet = new URL(url.toString());
        //打开连接
        HttpURLConnection con = (HttpURLConnection) urlGet.openConnection();
        //设置请求方法为GET
        con.setRequestMethod("GET");
        //获取输入流
        BufferedReader in = new BufferedReader(new InputStreamReader(
                con.getInputStream()));
        //读取输入流
        String inputLine;
        //创建StringBuffer对象，用于存储响应数据
        StringBuffer response = new StringBuffer();
        //循环读取输入流
        while ((inputLine = in.readLine()) != null) {
            //将读取的数据添加到StringBuffer对象中
            response.append(inputLine);
        }
        //关闭输入流
        in.close();
        //打印响应数据
        log.info("response:{}",GsonUtils.getJsonFromObject(response));
        //反序列化数据
        return GsonUtils.getObjectFromJson(response.toString(), WXAppAuthVO.class);
    }
    
    /**
     * 获取微信用户登录信息
     *
     * @param loginReq 登录请求对象
     * @return 更新后的登录请求对象
     * @throws Exception 如果获取过程中发生异常
     */
    public LoginReq getLoginInfo(LoginReq loginReq) throws Exception {
        //根据 code 和 operatorId 获取微信授权信息
        WXAppAuthVO wxAppAuthVO = getWxCode(loginReq.getCode(),loginReq.getOperatorId());
        //获取 session_key
        String sessionKey = wxAppAuthVO.getSession_key();
        //使用 session_key 对 encryptedData 进行解密
        String decryptedData = WeChatUtil.decryptData(loginReq.getEncryptedData(),sessionKey,loginReq.getIv());
        log.info("==>解析数据 {}",decryptedData);
        //解密后得到的数据包含了 用户的手机号，以及 unionId（如果用户已绑定公众号） // 解析响应结果
        WxUserInfo wxUserInfo = GsonUtils.getObjectFromJson(decryptedData, WxUserInfo.class);
        //返回 openid 和手机号等信息
        loginReq.setWxOpenId(wxAppAuthVO.getOpenid());
        loginReq.setMobile(wxUserInfo.getPurePhoneNumber());
        return loginReq;
    }
    
    
```





