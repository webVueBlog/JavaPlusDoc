
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

```
/**
* 解密方法
*
* @param encryptedData 要解密的字符串
* @param keyBytes 解密密钥
* @param ivs 自定义对称解密算法初始向量 iv
* @return 解密后的字节数组
*/
// 解密函数，使用自定义的IV
private static byte[] decryptOfDiyIV(byte[] encryptedData, byte[] keyBytes, byte[] ivs) {
  // 声明一个字节数组，用于存储解密后的数据
  byte[] encryptedText = null;
  try {
    // 初始化密钥
    init(keyBytes);
    // 初始化解密模式，使用自定义的IV
    cipher.init(Cipher.DECRYPT_MODE, key, new IvParameterSpec(ivs));
    // 执行解密操作
    encryptedText = cipher.doFinal(encryptedData);
  } catch (Exception e) {
    // 打印异常信息
    log.info(e);
    log.error(e.getMessage());
  }
  // 返回解密后的数据
  return encryptedText;
}
```






