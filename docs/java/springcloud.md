
## 微服务

### 用户网关

- bean实体类(阿里，微信请求类)
- config配置
- constants常量
- controller控制层
- enums枚举
- filter过滤
- interceptor拦截 feign拦截
- kafka处理事件
- listener监听
- model (不同服务下的如：user目录下bo业务类，entity实体类，vo视图类)
- service服务
- util工具类

UserGatewayApp

1. 启用Swagger2 @EnableSwagger2
2. 启用FeignClients @EnableFeignClients
3. 启用DiscoveryClient @EnableDiscoveryClient
4. Spring Boot应用程序启动类 @SpringBootApplication
   排除SecurityAutoConfiguration和DataSourceAutoConfiguration 
   exclude ={ SecurityAutoConfiguration.class,DataSourceAutoConfiguration.class}
   扫描指定包下的类
   scanBasePackages = {}










