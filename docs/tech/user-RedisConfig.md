---
title: useRedis配置
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## useRedis配置

```java
    @Bean(name = "xxxRedisTemplate")
    public RedisTemplate<String, String> redisTemplate() {
    
    }

@Data
// 注解，用于自动生成getter和setter方法
@Component
// 注解，将类标记为Spring组件，使其成为Spring容器管理的Bean
@RefreshScope
@ConfigurationProperties(prefix = "wx.configs") // 配置 文件的前缀
public class WXConfigBean {
    // 定义一个Map类型的变量，用于存储微信配置信息
    private Map<String , WXConfig> maps;
}

@Data
public class WXConfig {
    // 微信公众号的appid
    private String appid;
    // 微信公众号的secret
    private String secret;
}

@Data
@Component
@RefreshScope
@ConfigurationProperties(prefix = "ali.configs") // 配置 文件的前缀
public class AliConfigBean {
    private Map<String , AliConfig> maps;
}


@Data
@ToString
public class AliConfig {
    private String operatorName; //运营商名称
    private String appid; //应用id
    private String privateKey;  //私钥
    private String publicKey; //公钥
    private String appCertPath; //应用证书路径
    private String publicCertPath; //公钥证书路径
    private String rootCertPath; //根证书路径
    private String serviceId; //服务id
    private String aseKey; //ase密钥
}

```


