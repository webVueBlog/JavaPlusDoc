---
title: 阿里相关功能服务类
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## 阿里相关功能服务类

model文件

bo业务实体类

entity数据库实体类

vo视图实体类

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AliDecryptMobileReq {
	// 运营商ID
	private String operatorId;
	// 加密数据
	private String encryptData;
	// 签名
	private String sign;
}

@Getter
@AllArgsConstructor
public enum LoginChannelEnum {
    // 微信登录渠道，code为1，desc为"微信"
    WX(1, "微信"),
    // 阿里登录渠道，code为2，desc为"阿里"
    ALI(2, "阿里")
    ;

    // 登录渠道的编码
    private int code;
    // 登录渠道的描述
    private String desc;

    // 根据编码获取登录渠道枚举
    public static LoginChannelEnum getEnum(Integer code) {
        // 如果编码不为空
        if (Objects.nonNull(code)) {
            // 遍历所有登录渠道枚举
            for (LoginChannelEnum lce : LoginChannelEnum.values()) {
                // 如果编码匹配
                if (lce.getCode() == code) {
                    // 返回匹配的登录渠道枚举
                    return lce;
                }
            }
        }
        // 如果编码为空，返回微信登录渠道枚举
        return WX;
    }
}

```








