---
title: SpringBoot整合Redis缓存
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## SpringBoot整合Redis缓存

目前用的是 macOS，直接执行 brew install redis 就可以完成安装了。

完成安装后执行 redis-server 就可以启动 Redis 服务了。

## Redis 数据类型

Redis支持五种数据类型：string（字符串），hash（哈希），list（列表），set（集合）及zset(sorted set：有序集合)。

1）string

string 是 Redis 最基本的数据类型，一个key对应一个value。

我们可以通过 AnotherRedisDesktopManager 客户端来练习一下基本的 set、get 命令

2）hash

Redis hash 是一个键值对集合，值可以看成是一个 Map。

3）list

list 是一个简单的字符串列表，按照插入顺序排序。

4）set

set 是 string 类型的无序集合，不允许有重复的元素。

5）sorted set

sorted set 是 string 类型的有序集合，不允许有重复的元素。

## Spring Boot 整合 Redis

第一步，在 pom.xml 文件中添加 Redis 的 starter。

第二步，在 application.yml 文件中添加 Redis 的配置信息

第三步，在测试类中添加代码。

RedisTemplate 和 StringRedisTemplate 都是 Spring Data Redis 提供的模板类，可以对 Redis 进行操作，后者针对键值对都是 String 类型的数据，前者可以是任何类型的对象。

RedisTemplate 和 StringRedisTemplate 除了提供 opsForValue 方法来操作字符串之外，还提供了以下方法：

1. opsForList：操作 list
2. opsForSet：操作 set
3. opsForZSet：操作有序 set
4. opsForHash：操作 hash

通过 @Cacheable、@CachePut、@CacheEvict、@EnableCaching 等注解就可以轻松使用 Redis 做缓存了。

1）@EnableCaching，开启缓存功能。

2）@Cacheable，调用方法前，去缓存中找，找到就返回，找不到就执行方法，并将返回值放到缓存中。

3）@CachePut，方法调用前不会去缓存中找，无论如何都会执行方法，执行完将返回值放到缓存中。

4）@CacheEvict，清理缓存中的一个或多个记录。

```
@EnableCaching
@Configuration
public class RedisConfig extends CachingConfigurerSupport {

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory redisConnectionFactory) {
        RedisTemplate<String, Object> redisTemplate = new RedisTemplate<>();
        redisTemplate.setConnectionFactory(redisConnectionFactory);

        // 通过 Jackson 组件进行序列化
        RedisSerializer<Object> serializer = redisSerializer();

        // key 和 value
        // 一般来说， redis-key采用字符串序列化；
        // redis-value采用json序列化， json的体积小，可读性高，不需要实现serializer接口。
        redisTemplate.setKeySerializer(new StringRedisSerializer());
        redisTemplate.setValueSerializer(serializer);

        redisTemplate.setHashKeySerializer(new StringRedisSerializer());
        redisTemplate.setHashValueSerializer(serializer);

        redisTemplate.afterPropertiesSet();
        return redisTemplate;
    }

    @Bean
    public RedisSerializer<Object> redisSerializer() {
        //创建JSON序列化器
        Jackson2JsonRedisSerializer<Object> serializer = new Jackson2JsonRedisSerializer<>(Object.class);
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
        // objectMapper.enableDefaultTyping()被弃用
        objectMapper.activateDefaultTyping(
                LaissezFaireSubTypeValidator.instance,
                ObjectMapper.DefaultTyping.NON_FINAL,
                JsonTypeInfo.As.WRAPPER_ARRAY);
        serializer.setObjectMapper(objectMapper);
        return serializer;
    }

}
```

第四步，在标签更新接口中添加 @CachePut 注解，也就是说方法执行前不会去缓存中找，但方法执行完会将返回值放入缓存中。

```
@Controller
@Api(tags = "标签")
@RequestMapping("/postTag")
public class PostTagController {

    @Autowired
    private IPostTagService postTagService;
    @Autowired
    private IPostTagRelationService postTagRelationService;

    @RequestMapping(value = "/update", method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation("修改标签")
    @CachePut(value = "codingmore", key = "'codingmore:postag:'+#postAddTagParam.postTagId")
    public ResultObject<String> update(@Valid PostTagParam postAddTagParam) {
        if (postAddTagParam.getPostTagId() == null) {
            return ResultObject.failed("标签id不能为空");
        }
        PostTag postTag = postTagService.getById(postAddTagParam.getPostTagId());
        if (postTag == null) {
            return ResultObject.failed("标签不存在");
        }
        QueryWrapper<PostTag> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("description", postAddTagParam.getDescription());
        int count = postTagService.count(queryWrapper);
        if (count > 0) {
            return ResultObject.failed("标签名称已存在");
        }
        BeanUtils.copyProperties(postAddTagParam, postTag);
        return ResultObject.success(postTagService.updateById(postTag) ? "修改成功" : "修改失败");
    }
}
```

## 使用 Redis 连接池

Redis 是基于内存的数据库，本来是为了提高程序性能的，但如果不使用 Redis 连接池的话，建立连接、断开连接就需要消耗大量的时间。

用了连接池，就可以实现在客户端建立多个连接，需要的时候从连接池拿，用完了再放回去，这样就节省了连接建立、断开的时间。

要使用连接池，我们得先了解 Redis 的客户端，常用的有两种：Jedis 和 Lettuce。

1. Jedis：Spring Boot 1.5.x 版本时默认的 Redis 客户端，实现上是直接连接 Redis Server，如果在多线程环境下是非线程安全的，这时候要使用连接池为每个 jedis 实例增加物理连接；
2. Lettuce：Spring Boot 2.x 版本后默认的 Redis 客户端，基于 Netty 实现，连接实例可以在多个线程间并发访问，一个连接实例不够的情况下也可以按需要增加连接实例。

1）Lettuce

第一步，修改 application-dev.yml，添加 Lettuce 连接池配置（pool 节点）。

```
spring:
    redis:
        lettuce:
          pool:
            max-active: 8 # 连接池最大连接数
            max-idle: 8 # 连接池最大空闲连接数
            min-idle: 0 # 连接池最小空闲连接数
            max-wait: -1ms # 连接池最大阻塞等待时间，负值表示没有限制
```

第二步，在 pom.xml 文件中添加 commons-pool2 依赖，否则会在启动的时候报 ClassNotFoundException 的错。这是因为 Spring Boot 2.x 里默认没启用连接池。

添加 commons-pool2 依赖

重新启动服务，在 RedisConfig 类的 redisTemplate 方法里对 redisTemplate 打上断点，debug 模式下可以看到连接池的配置信息（redisConnectionFactory→clientConfiguration→poolConfig）。

2）Jedis

第一步，在 pom.xml 文件中添加 Jedis 依赖，去除 Lettuce 默认依赖。

第二步，修改 application-dev.yml，添加 Jedis 连接池配置。

启动服务后，观察 redisTemplate 的 clientConfiguration 节点，可以看到它的值已经变成 DefaultJedisClientConfiguration 对象了。

当然了，也可以不配置 Jedis 客户端的连接池，走默认的连接池配置。因为 Jedis 客户端默认增加了连接池的依赖包，在 pom.xml 文件中点开 Jedis 客户端依赖可以查看到。

## 自由操作 Redis

Spring Cache 虽然提供了操作 Redis 的便捷方法，比如我们前面演示的 @CachePut 注解，但注解提供的操作非常有限，比如说它只能保存返回值到缓存中，而返回值并不一定是我们想要保存的结果。

与其保存这个返回给客户端的 JSON 信息，我们更想保存的是更新后的标签。那该怎么自由地操作 Redis 呢？

```
public interface RedisService {

    /**
     * 保存属性
     */
    void set(String key, Object value);

    /**
     * 获取属性
     */
    Object get(String key);

    /**
     * 删除属性
     */
    Boolean del(String key);

    ...


}
```



