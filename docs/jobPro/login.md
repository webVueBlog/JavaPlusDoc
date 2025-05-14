---
title: 完整的用户注册登录系统
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## 完整的用户注册登录系统

完整的用户注册/登录系统，支持 密码、验证码、第三方登录（微信、支付宝、GitHub），这也是常见的用户认证体系。

## 🧩 一、模块化用户登录功能结构

```
用户认证模块
├── 账号密码登录（传统登录）
├── 验证码登录（短信、邮箱验证码）
├── 第三方登录
│   ├── 微信登录（扫码、公众号、小程序）
│   ├── 支付宝登录（扫码/授权）
│   └── GitHub 登录（OAuth2）
├── 注册流程（支持邀请码）
├── 用户资料补充 / 修改
├── 登录态管理（JWT / Token / Session）
└── 安全控制（风控、设备校验、防暴力破解）
```

🔐 二、账号密码登录

✅ 接口流程

* 用户提交手机号/邮箱 + 密码
* 
* 服务端验证账号密码
* 
* 验证通过后生成登录 token（JWT / Session）
* 
* 返回给前端保存（如保存在 Cookie）


### 🔧 示例代码

```
@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest request) {
    User user = userService.findByUsername(request.getUsername());

    if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("账号或密码错误");
    }

    String token = jwtUtil.generateToken(user.getId());
    return ResponseEntity.ok(Map.of("token", token));
}
```


## 📩 三、验证码登录（短信/邮箱）

### ✅ 流程说明

1.  用户输入手机号/邮箱请求验证码
1.  后端生成验证码并通过短信/邮件发送
1.  用户输入验证码登录
1.  验证通过后注册或登录，生成 token

### 🔧 核心点

-   验证码缓存：使用 Redis 缓存验证码，有效期如 5 分钟
-   发送接口：接入阿里云短信、腾讯云短信、SendGrid、SMTP 邮件等


## 🌐 四、第三方登录（OAuth2）

| 平台     | 关键步骤                                                               |
| ------ | ------------------------------------------------------------------ |
| 微信     | 获取二维码 -> 用户扫码授权 -> 获取 code -> 换 access_token -> 获取 openid/userinfo |
| 支付宝    | 同上                                                                 |
| GitHub | GitHub 授权页 -> 获取 code -> 换 access_token -> 拉用户信息


### 🔧 示例：GitHub OAuth2 登录流程

```
@GetMapping("/github/callback")
public void githubCallback(@RequestParam String code, HttpServletResponse response) throws IOException {
    // 用 code 换取 access_token
    String accessToken = githubService.getAccessToken(code);
    
    // 用 access_token 获取用户信息
    GitHubUser user = githubService.getUserInfo(accessToken);
    
    // 登录或注册用户
    String userId = userService.loginOrRegisterByGitHub(user);
    
    // 返回 JWT
    String token = jwtUtil.generateToken(userId);
    response.sendRedirect("/login-success?token=" + token);
}
```


## 🧾 五、注册接口建议

支持：

-   账号密码注册
-   验证码注册
-   第三方授权后补全资料注册

可以加入：

-   图形验证码（防刷）
-   邀请码 / 渠道来源标记
-   注册来源追踪（Web、H5、小程序）



## 🧰 六、技术栈推荐

| 组件    | 推荐                                            |
| ----- | --------------------------------------------- |
| 框架    | Spring Boot + Spring Security                 |
| 密码加密  | BCryptPasswordEncoder                         |
| Token | JWT（jjwt）或 Spring Security OAuth2             |
| 数据库   | MySQL + MyBatis Plus                          |
| 验证码   | Redis + 自定义验证码组件                              |
| 邮件    | Spring Mail                                   |
| 第三方登录 | 手动集成 OAuth2（或用 Spring Social / OAuth2 Client）


