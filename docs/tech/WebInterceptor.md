---
title: 拦截器
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://github.com/user-attachments/assets/e04b7c6b-6522-4bf5-8832-26b6f6a2ddca">

## 拦截器

```java
public interface HandlerInterceptor {
    // 在请求处理之前进行调用（Controller方法调用之前）
    default boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        return true;
    }

    // 请求处理之后进行调用，但是在视图被渲染之前（Controller方法调用之后）
    default void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, @Nullable ModelAndView modelAndView) throws Exception {
    }

    // 在整个请求结束之后被调用，也就是在DispatcherServlet渲染了对应的视图之后执行（主要是用于进行资源清理工作）
    default void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, @Nullable Exception ex) throws Exception {
    }
}

```

```java
@RefreshScope//开启配置文件的热加载
@Configuration//配置类
public class WebAppConfigure extends WebMvcConfigurationSupport {
    @Value("${gateway.url.firewall}")
    String firewallList;

    private final String path = "/";

    // 使用@Lazy注解，表示延迟加载，即在使用该bean时才进行初始化
    @Lazy
    // 使用@Autowired注解，表示自动注入该bean
    @Autowired
    // 声明一个SentinelWebInterceptor类型的成员变量
    private SentinelWebInterceptor sentinelWebInterceptor;

    @Bean   //把我们的拦截器注入为bean
    public HandlerInterceptor getWebInterceptor() {
        return new WebInterceptor();
    }
}
```





