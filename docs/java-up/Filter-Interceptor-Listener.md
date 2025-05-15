---
title: 过滤器、拦截器、监听器
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## 过滤器、拦截器、监听器

<!-- TOC -->
  * [过滤器、拦截器、监听器](#过滤器拦截器监听器)
  * [拦截器](#拦截器)
<!-- TOC -->

1. 过滤器（Filter）：当有一堆请求，只希望符合预期的请求进来。
2. 拦截器（Interceptor）：想要干涉预期的请求。
3. 监听器（Listener）：想要监听这些请求具体做了什么。

过滤器是在请求进入容器后，但还没有进入 Servlet 之前进行预处理的。

拦截器是在请求进入控制器（Controller） 之前进行预处理的。

虚线内就是过滤器和拦截器的作用范围：

过滤器依赖于 Servlet 容器，而拦截器依赖于 Spring 的 IoC 容器，因此可以通过注入的方式获取容器当中的对象。

监听器用于监听 Web 应用中某些对象的创建、销毁、增加、修改、删除等动作，然后做出相应的处理。

EE 过滤器

1. 过滤敏感词汇（防止sql注入）
2. 设置字符编码
3. URL级别的权限访问控制
4. 压缩响应信息

过滤器的创建和销毁都由 Web 服务器负责，Web 应用程序启动的时候，创建过滤器对象，为后续的请求过滤做好准备。

过滤器可以有很多个，一个个过滤器组合起来就成了 FilterChain，也就是过滤器链。

在 Spring 中，过滤器都默认继承了 OncePerRequestFilter，顾名思义，OncePerRequestFilter 的作用就是确保一次请求只通过一次过滤器，而不重复执行。

通过继承 OncePerRequestFilter 来实现 JWT 登录授权过滤的。

```
public class JwtAuthenticationTokenFilter extends OncePerRequestFilter {
	@Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        // 从客户端请求中获取 JWT
        String authHeader = request.getHeader(this.tokenHeader);
        // 该 JWT 是我们规定的格式，以 tokenHead 开头
        if (authHeader != null && authHeader.startsWith(this.tokenHead)) {
            // The part after "Bearer "
            String authToken = authHeader.substring(this.tokenHead.length());
            // 从 JWT 中获取用户名
            String username = jwtTokenUtil.getUserNameFromToken(authToken);
            LOGGER.info("checking username:{}", username);

            // SecurityContextHolder 是 SpringSecurity 的一个工具类
            // 保存应用程序中当前使用人的安全上下文
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // 根据用户名获取登录用户信息
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
                // 验证 token 是否过期
                if (jwtTokenUtil.validateToken(authToken, userDetails)) {
                    // 将登录用户保存到安全上下文中
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(userDetails,
                            null, userDetails.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        }
        chain.doFilter(request, response);
    }
}
```

我们利用 Spring Initializr 来新建一个 Web 项目 codingmore-filter-interceptor-listener。

添加一个过滤器 MyFilter ：

```
@WebFilter(urlPatterns = "/*", filterName = "myFilter")
public class MyFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        Filter.super.init(filterConfig);
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        long start = System.currentTimeMillis();
        chain.doFilter(request,response);
        System.out.println("Execute cost="+(System.currentTimeMillis()-start));
    }

    @Override
    public void destroy() {
        Filter.super.destroy();
    }
}
```

@WebFilter 注解用于将一个类声明为过滤器，urlPatterns 属性用来指定过滤器的 URL 匹配模式，filterName 用来定义过滤器的名字。

MyFilter 过滤器的逻辑非常简单，重写了 Filter 的三个方法，在 doFilter 方法中加入了时间戳的记录。

然后我们在项目入口类上加上 @ServletComponentScan 注解，这样过滤器就会自动注册。

启动服务器，访问任意的 URL。

## 拦截器

1. 登录验证，判断用户是否登录
2. 权限验证，判断用户是否有权限访问资源，如校验token
3. 日志记录，记录请求操作日志（用户ip，访问时间等），以便统计请求访问量
4. 处理cookie、本地化、国际化、主题等
5. 性能监控，监控请求处理时长等

我们来写一个简单的拦截器 LoggerInterceptor：

```
@Slf4j
public class LoggerInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        log.info("preHandle{}...",request.getRequestURI());
        return true;
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
        HandlerInterceptor.super.postHandle(request, response, handler, modelAndView);
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        HandlerInterceptor.super.afterCompletion(request, response, handler, ex);
    }
}
```

一个拦截器必须实现 HandlerInterceptor 接口，preHandle 方法是 Controller 方法调用前执行，postHandle 是 Controller 方法正常返回后执行，afterCompletion 方法无论 Controller 方法是否抛异常都会执行。

只有 preHandle 返回 true 的话，其他两个方法才会执行。

如果 preHandle 返回 false 的话，表示不需要调用Controller方法继续处理了，通常在认证或者安全检查失败时直接返回错误响应。

再来一个 InterceptorConfig 对拦截器进行配置：

```
@Configuration
public class InterceptorConfig implements WebMvcConfigurer {
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new LoggerInterceptor()).addPathPatterns("/**");
    }
}
```

@Configuration 注解用于定义配置类，干掉了以往 Spring 繁琐的 xml 配置文件。

