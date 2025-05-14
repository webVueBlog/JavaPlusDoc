---
title: PC网站实现微信扫码登录功能
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## PC网站实现微信扫码登录功能

加群联系作者vx：xiaoda0423

仓库地址：<https://webvueblog.github.io/JavaPlusDoc/>

<https://1024bat.cn/>

在 Java PC 网站中实现 **微信扫码登录功能**，一般包括以下几个核心步骤：

* * *

### 🧩 一、整体流程

1.  PC 页面点击“微信扫码登录”
1.  后端生成一个带有 `state` 的二维码 URL，返回给前端展示
1.  用户使用微信扫描二维码并授权登录
1.  微信服务器回调你的服务（通过 redirect_uri）并返回 `code`
1.  后端用 `code` 换取 `access_token` 和 `openid`
1.  后端根据 `openid` 查找或注册用户，建立登录态（如生成 JWT/token）

### 📦 二、准备工作

#### ✅ 注册微信公众号平台账号

登录微信开放平台
申请**网站应用**，设置：

-   授权回调域名（如：`yourdomain.com`）
-   获取 AppID 和 AppSecret

### 🔧 三、核心代码实现

#### 1️⃣ 获取二维码链接

```
public String buildQrConnectUrl(String state) {
    String appId = "yourAppId";
    String redirectUri = URLEncoder.encode("https://yourdomain.com/wechat/callback", StandardCharsets.UTF_8);
    return String.format(
        "https://open.weixin.qq.com/connect/qrconnect?appid=%s&redirect_uri=%s&response_type=code&scope=snsapi_login&state=%s#wechat_redirect",
        appId, redirectUri, state
    );
}
```

前端拿这个 URL 去渲染二维码（可用 JavaScript + qrcode.js）

#### 2️⃣ 微信回调接口（code 换 token）

```
@GetMapping("/wechat/callback")
public void wechatCallback(@RequestParam String code, @RequestParam String state, HttpServletResponse response) {
    String appId = "yourAppId";
    String appSecret = "yourAppSecret";
    
    // Step1: 获取 access_token
    String tokenUrl = String.format(
        "https://api.weixin.qq.com/sns/oauth2/access_token?appid=%s&secret=%s&code=%s&grant_type=authorization_code",
        appId, appSecret, code
    );

    String tokenResponse = restTemplate.getForObject(tokenUrl, String.class);
    JSONObject json = JSON.parseObject(tokenResponse);

    String accessToken = json.getString("access_token");
    String openId = json.getString("openid");

    // Step2: 获取用户信息（可选）
    String userInfoUrl = String.format(
        "https://api.weixin.qq.com/sns/userinfo?access_token=%s&openid=%s",
        accessToken, openId
    );

    String userInfoResponse = restTemplate.getForObject(userInfoUrl, String.class);
    JSONObject userInfo = JSON.parseObject(userInfoResponse);

    // Step3: 业务逻辑（查找/注册用户，设置 session/JWT）
    User user = userService.loginOrRegisterByOpenId(openId, userInfo);

    // Step4: 登录成功，跳转回原页面 + token
    response.sendRedirect("/login/success?token=" + jwtService.generateToken(user));
}
```

* * *

#### 3️⃣ 前端页面轮询（或用 WebSocket）

扫码后微信授权完成，你的系统需要通知前端“扫码成功”。

实现方式：

-   使用 `state` 存 redis（标记为“登录中”）
-   前端轮询 `/check-login?state=xxx`
-   登录完成后，状态标记为“已登录”，带上登录信息

#### 3️⃣ 前端页面轮询（或用 WebSocket）

扫码后微信授权完成，你的系统需要通知前端“扫码成功”。

实现方式：

-   使用 `state` 存 redis（标记为“登录中”）
-   前端轮询 `/check-login?state=xxx`
-   登录完成后，状态标记为“已登录”，带上登录信息


### 📌 四、安全建议

-   `state` 必须随机生成（防止 CSRF）
-   微信授权接口调用频率有限，注意做容错处理
-   对微信返回信息签名校验（可选）
-   最终登录态建议使用 JWT + HttpOnly Cookie 管理


**Spring Boot 实现微信扫码登录** 的项目结构

## 🏗️ 项目结构概览

```
src/
└── main/
    └── java/
        └── com/example/wechatlogin/
            ├── controller/
            │   └── WeChatLoginController.java
            ├── service/
            │   ├── WeChatLoginService.java
            │   └── UserService.java
            ├── dto/
            │   └── WeChatUserInfo.java
            └── util/
                └── JwtUtil.java
```


## 🎯 1. Controller - 控制层

```
@RestController
@RequestMapping("/wechat")
public class WeChatLoginController {

    @Autowired
    private WeChatLoginService weChatLoginService;

    @GetMapping("/qr-url")
    public Map<String, String> getQrUrl() {
        String state = UUID.randomUUID().toString();
        String qrUrl = weChatLoginService.buildQrUrl(state);
        // 可将 state 缓存到 Redis（未登录状态）
        return Map.of("qrUrl", qrUrl, "state", state);
    }

    @GetMapping("/callback")
    public void callback(@RequestParam String code, @RequestParam String state, HttpServletResponse response) throws IOException {
        String token = weChatLoginService.handleCallback(code, state);
        // 登录成功后跳转页面
        response.sendRedirect("https://your-pc-site.com/login-success?token=" + token);
    }

    @GetMapping("/check-login")
    public ResponseEntity<?> checkLogin(@RequestParam String state) {
        // 查询是否登录成功
        Optional<String> token = weChatLoginService.checkLoginStatus(state);
        return token.map(t -> ResponseEntity.ok(Map.of("token", t)))
                    .orElse(ResponseEntity.status(202).build());
    }
}
```


## 🧠 2. Service - 核心逻辑封装

```
@Service
public class WeChatLoginService {

    private final String appId = "yourAppId";
    private final String appSecret = "yourAppSecret";

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    public String buildQrUrl(String state) {
        String redirectUri = URLEncoder.encode("https://yourdomain.com/wechat/callback", StandardCharsets.UTF_8);
        return String.format(
            "https://open.weixin.qq.com/connect/qrconnect?appid=%s&redirect_uri=%s&response_type=code&scope=snsapi_login&state=%s#wechat_redirect",
            appId, redirectUri, state
        );
    }

    public String handleCallback(String code, String state) {
        String tokenUrl = String.format(
            "https://api.weixin.qq.com/sns/oauth2/access_token?appid=%s&secret=%s&code=%s&grant_type=authorization_code",
            appId, appSecret, code
        );

        JSONObject tokenJson = JSON.parseObject(restTemplate.getForObject(tokenUrl, String.class));
        String openId = tokenJson.getString("openid");
        String accessToken = tokenJson.getString("access_token");

        String userInfoUrl = String.format(
            "https://api.weixin.qq.com/sns/userinfo?access_token=%s&openid=%s",
            accessToken, openId
        );

        JSONObject userInfoJson = JSON.parseObject(restTemplate.getForObject(userInfoUrl, String.class));
        WeChatUserInfo userInfo = userInfoJson.toJavaObject(WeChatUserInfo.class);

        // 登录或注册
        String userId = userService.loginOrRegister(openId, userInfo);

        // 生成 token
        String token = jwtUtil.generateToken(userId);

        // 缓存 state-token 映射
        redisTemplate.opsForValue().set("wechat_login:" + state, token, Duration.ofMinutes(2));

        return token;
    }

    public Optional<String> checkLoginStatus(String state) {
        String token = redisTemplate.opsForValue().get("wechat_login:" + state);
        return Optional.ofNullable(token);
    }
}
```

## 📄 3. DTO - 微信用户信息

```
@Data
public class WeChatUserInfo {
    private String openid;
    private String nickname;
    private String sex;
    private String province;
    private String city;
    private String headimgurl;
}
```

## 👤 4. UserService - 模拟用户注册/登录逻辑

```
@Service
public class UserService {

    // 示例：真实场景中应连接数据库
    private final Map<String, String> fakeDb = new ConcurrentHashMap<>();

    public String loginOrRegister(String openId, WeChatUserInfo userInfo) {
        return fakeDb.computeIfAbsent(openId, k -> UUID.randomUUID().toString());
    }
}
```

## 🔐 5. JwtUtil - 简单 JWT 工具类（可替换为 jjwt）

```
@Component
public class JwtUtil {
    private final String secretKey = "yourSecretKey";

    public String generateToken(String userId) {
        return Jwts.builder()
                .setSubject(userId)
                .setIssuedAt(new Date())
                .setExpiration(Date.from(Instant.now().plus(Duration.ofHours(2))))
                .signWith(SignatureAlgorithm.HS256, secretKey)
                .compact();
    }
}
```


## ⚙️ 6. 配置推荐

```
spring:
  redis:
    host: localhost
    port: 6379
  jackson:
    date-format: yyyy-MM-dd HH:mm:ss
    time-zone: Asia/Shanghai
```

```
@Configuration
public class RestTemplateConfig {
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
```





















