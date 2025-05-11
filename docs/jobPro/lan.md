---
title: 多语言国际化
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## 多语言国际化


## 🌍 一、Java 后端国际化方案核心概念

| 模块                            | 说明                                               |
| ----------------------------- | ------------------------------------------------ |
| 资源文件 `messages_xx.properties` | 存放不同语言的文本内容（英文、中文、西班牙语等）                         |
| `Locale` 区域识别                 | 根据请求中的语言标识（如 `Accept-Language`、`lang` 参数）来选择语言资源 |
| 国际化接口支持                       | 所有返回文案可动态切换语言                                    |
| 与前端协作                         | 接收前端语言标识，如 `lang=en-US`，返回对应语言的提示/文案



## 🗂️ 二、资源文件结构（以 Spring Boot 为例）

```
src/main/resources/
├── messages.properties          # 默认中文
├── messages_en.properties       # 英文
├── messages_es.properties       # 西班牙语
```


### 示例内容：

`messages.properties`

```
user.login.success=登录成功
user.login.fail=用户名或密码错误
```

`messages_en.properties`

```
user.login.success=Login successful
user.login.fail=Incorrect username or password
```


## ⚙️ 三、Spring Boot 国际化配置

### 1. 配置 `MessageSource` Bean

```
@Configuration
public class I18nConfig {

    @Bean
    public MessageSource messageSource() {
        ReloadableResourceBundleMessageSource messageSource = new ReloadableResourceBundleMessageSource();
        messageSource.setBasename("classpath:messages"); // messages*.properties
        messageSource.setDefaultEncoding("UTF-8");
        return messageSource;
    }

    @Bean
    public LocaleResolver localeResolver() {
        // 支持从请求中获取语言参数（?lang=en_US）
        SessionLocaleResolver slr = new SessionLocaleResolver();
        slr.setDefaultLocale(Locale.SIMPLIFIED_CHINESE);
        return slr;
    }

    @Bean
    public LocaleChangeInterceptor localeChangeInterceptor() {
        LocaleChangeInterceptor interceptor = new LocaleChangeInterceptor();
        interceptor.setParamName("lang"); // 从参数 lang 解析语言
        return interceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(localeChangeInterceptor());
    }
}
```


## 🧠 四、使用国际化消息

### 注入 `MessageSource` 获取翻译

```
@Autowired
private MessageSource messageSource;

public String getMessage(String code, Locale locale) {
    return messageSource.getMessage(code, null, locale);
}
```

或在控制器中：

```
@GetMapping("/login")
public ResponseEntity<?> login(@RequestParam String lang) {
    Locale locale = LocaleContextHolder.getLocale(); // 自动从请求参数或 header 获取
    String msg = messageSource.getMessage("user.login.success", null, locale);
    return ResponseEntity.ok(Map.of("msg", msg));
}
```


## 📦 五、前端如何传语言？

| 前端方式         | 示例                                  |
| ------------ | ----------------------------------- |
| URL 参数       | `https://api.xxx.com/login?lang=en` |
| Header 头     | `Accept-Language: en-US`            |
| JWT / Cookie | 后台从 Token 中读取语言偏好


## 🔌 六、进阶功能（可选）

| 功能      | 描述                                 |
| ------- | ---------------------------------- |
| 动态多语言维护 | 文案从数据库或后台配置平台维护                    |
| 国际化组件化  | 国际化返回结构：`code + message` 统一封装      |
| 校验提示国际化 | 使用 `@Validated` 时错误提示也可国际化         |
| 异常提示国际化 | ExceptionMessageResolver 支持多语言错误处理


## 📋 七、结合跨境业务建议

| 场景      | 建议                         |
| ------- | -------------------------- |
| 多语言后台系统 | 配置 `语言切换按钮`，通过 lang 参数调用接口 |
| 多国家独立站  | 每个站点配置语言偏好，支持用户语言回显        |
| 多语言邮件模板 | 后端发送通知邮件时，按用户语言选择模板


## ✅ 总结

| 技术点          | 是否可配合                      |
| ------------ | -------------------------- |
| Spring Boot  | ✅ 完美支持国际化（i18n）配置          |
| 前后端分离        | ✅ 提供语言标识字段，服务端按需响应多语言      |
| 跨境电商/SaaS 场景 | ✅ 支持多语言商品名、订单状态、支付文案、后台提示等


























