---
title: Redis缓存系统常见应用场景
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## Redis缓存系统常见应用场景

## 📦 一、Redis 缓存系统常见应用场景

| 场景     | 示例               |
| ------ | ---------------- |
| 热门商品缓存 | 电商首页、详情页秒开       |
| 订单信息缓存 | 避免频繁访问数据库        |
| 登录态存储  | Token、Session 缓存 |
| 接口幂等校验 | 基于 Redis 保证请求唯一  |
| 防刷频控   | 限制单位时间内的请求次数



## 🔥 二、热点缓存（高频数据缓存）

### ✅ 目标：

避免对数据库频繁查询相同数据，使用 Redis 缓存住热点。

### 示例代码：

```
public Product getProduct(Long productId) {
    String cacheKey = "product:" + productId;
    String json = redisTemplate.opsForValue().get(cacheKey);
    
    if (StringUtils.hasText(json)) {
        return JSON.parseObject(json, Product.class);
    }

    // 查询数据库
    Product product = productMapper.selectById(productId);
    if (product != null) {
        redisTemplate.opsForValue().set(cacheKey, JSON.toJSONString(product), 10, TimeUnit.MINUTES);
    }
    return product;
}
```


## 🚫 三、缓存穿透（查询不存在的数据）

### ✅ 场景：

恶意请求大量不存在的 key，缓存未命中，数据库压力骤增。

### ✅ 解决方案：

#### ✅ 1. 布隆过滤器（Bloom Filter）

-   将所有合法 ID 加入布隆过滤器，非法请求直接拦截。

```
if (!bloomFilter.contains(id)) {
    return null; // 无效请求
}
```

#### ✅ 2. 缓存空值

-   将查询结果为 `null` 也缓存一段时间，避免频繁打数据库。

```
if (product == null) {
    redisTemplate.opsForValue().set(cacheKey, "", 2, TimeUnit.MINUTES);
}
```


## 🧊 四、缓存雪崩（大面积缓存同时过期）

### ✅ 场景：

缓存集中在某一时刻过期，导致短时间大量请求打到数据库。

### ✅ 解决方案：

| 方法      | 描述                            |
| ------- | ----------------------------- |
| 缓存过期加随机 | 给过期时间增加随机值，避免同时失效             |
| 数据预热    | 启动时或定时预加载关键数据到缓存              |
| 多级缓存    | 本地缓存 + 分布式缓存（如 Guava + Redis） |

```
// 设置过期时间随机值 10-15 分钟
long timeout = 10 + new Random().nextInt(5);
redisTemplate.opsForValue().set(key, value, timeout, TimeUnit.MINUTES);
```


## 🔐 五、缓存击穿（单个热点数据失效）

### ✅ 场景：

某个高并发访问的 key 刚好失效，大量请求同时打到数据库。

### ✅ 解决方案：

#### ✅ 1. 分布式锁保护（推荐使用 Redisson）

```
RLock lock = redissonClient.getLock("lock:product:" + id);
if (lock.tryLock()) {
    try {
        // 查询数据库并写入缓存
    } finally {
        lock.unlock();
    }
} else {
    // 其他线程睡眠等待缓存
    Thread.sleep(50);
    return redisTemplate.opsForValue().get(cacheKey);
}
```

#### ✅ 2. 本地互斥锁（Guava / Caffeine 本地缓存配合）


## 🧠 六、封装模板（伪代码）

可以将缓存逻辑封装成统一的工具类或注解方式（配合 AOP）：

```
public <T> T queryWithCache(String keyPrefix, Long id, Function<Long, T> dbFallback) {
    String key = keyPrefix + id;
    String json = redis.get(key);
    if (StringUtils.hasText(json)) {
        return parse(json);
    }

    // 加锁防击穿
    RLock lock = redisson.getLock("lock:" + key);
    lock.lock();

    try {
        // 二次检查缓存
        json = redis.get(key);
        if (StringUtils.hasText(json)) {
            return parse(json);
        }

        // 查数据库
        T data = dbFallback.apply(id);
        if (data == null) {
            redis.set(key, "", 2, TimeUnit.MINUTES); // 缓存空值
        } else {
            redis.set(key, toJson(data), 10, TimeUnit.MINUTES);
        }
        return data;
    } finally {
        lock.unlock();
    }
}
```


## ✅ 七、建议的技术选型

| 技术组件  | 推荐工具                                  |
| ----- | ------------------------------------- |
| 缓存客户端 | `Spring Data Redis` + `Lettuce`       |
| 分布式锁  | `Redisson`                            |
| 本地缓存  | `Caffeine`（支持淘汰 + 异步刷新）               |
| 布隆过滤器 | `Guava BloomFilter` / RedisBitmap 实现  |
| 可视化监控 | `RedisInsight`、`Prometheus + Grafana`


## 📌 八、附加功能推荐

-   定时刷新热点缓存（配合异步线程池）
-   缓存预加载、预热机制
-   缓存版本号控制（缓存双写一致性）
-   接口缓存（AOP + 注解）


## 🧠 一、IOC（控制反转，Inversion of Control）

### ✅ 作用：

把对象的创建和依赖关系交给 Spring 容器统一管理，而不是由我们手动 `new`。

### ✅ 理解方式：

原来我们是自己控制对象的创建，现在是**反转给容器**来帮我们创建和注入。

### ✅ 举例：

```
@Component
public class UserService {
    @Autowired
    private OrderService orderService;
}
```

### ✅ 本质：

-   IoC 容器会扫描 `@Component` 注解的类，将其放入容器
-   然后通过 `@Autowired` 自动注入所需依赖


## ⚙️ 二、AOP（面向切面编程，Aspect Oriented Programming）

### ✅ 作用：

将**与业务无关的通用逻辑**（如日志、事务、权限）从业务代码中抽离出来，形成切面统一管理。

### ✅ 应用场景：

-   日志打印
-   方法调用监控
-   权限校验
-   接口防刷
-   异常统一处理

### ✅ 示例代码：

```
@Aspect
@Component
public class LogAspect {

    @Before("execution(* com.example.service.*.*(..))")
    public void logBefore(JoinPoint joinPoint) {
        System.out.println("调用方法：" + joinPoint.getSignature().getName());
    }
}
```


## 🧩 三、事务管理（Transaction Management）

### ✅ 作用：

保证数据库操作的一致性、隔离性等事务特性。

### ✅ 使用方式：

只需加上一个注解即可实现事务的开启和回滚。

```
@Service
public class OrderService {

    @Transactional
    public void createOrder() {
        // 操作订单表
        // 操作库存表
        // 如果出错自动回滚
    }
}
```

### ✅ 事务传播机制（核心内容）：

-   `REQUIRED`：默认，当前有事务就加入，否则新建一个
-   `REQUIRES_NEW`：强制新建事务
-   `NESTED`：嵌套事务（可以独立回滚）

## 📦 总结：Spring 三大特性作用表

| 特性     | 简称  | 功能                   |
| ------ | --- | -------------------- |
| 控制反转   | IoC | 统一管理 Bean 的生命周期和依赖注入 |
| 面向切面编程 | AOP | 抽离日志、事务、权限等公共逻辑      |
| 声明式事务  | Tx  | 让数据库操作更安全、可控

Spring 中的事务功能（@Transactional）

## ✅ 一、事务生效的必要条件

| 条件                           | 说明                                              |
| ---------------------------- | ----------------------------------------------- |
| 1. 方法必须被 **Spring 容器管理的类调用** | 即类上必须被 `@Service`、`@Component`、`@Repository` 标注 |
| 2. 方法必须通过 **代理对象** 调用        | Spring 事务是基于 AOP 实现的，需要经过代理                     |
| 3. 方法必须是 **`public` 访问级别**   | 因为 Spring 默认使用 JDK 或 CGLIB 动态代理，私有方法无法被代理拦截     |
| 4. 有真正的 **数据库操作**，并被连接管理     | Spring 的事务本质是对数据库连接的事务控制                        |
| 5. 抛出的异常类型需匹配默认策略            | 默认只回滚 **运行时异常（RuntimeException）及其子类**



## ❌ 二、事务失效的常见情况（重点！）

### 🧨 场景 1：**方法内部自调用**，事务不生效

```
@Transactional
public void methodA() {
    methodB(); // ⚠️ 同类内部调用，不会经过代理，事务失效
}

@Transactional
public void methodB() {
    // 数据库操作
}
```

✅ 解决方式：使用代理对象调用，如通过 AopContext.currentProxy() 或将方法拆到新类中。


### 🧨 场景 2：**方法不是 `public`**，事务不生效

```
@Transactional
void createOrder() {
    // ⚠️ 非 public 方法，不会被代理，事务失效
}
```

✅ 正确写法：

```
@Transactional
public void createOrder() {
    // 生效 ✅
}
```



### 🧨 场景 3：**异常被 catch 了，事务不会回滚**

```
@Transactional
public void process() {
    try {
        // 这里会报错
        int a = 1 / 0;
    } catch (Exception e) {
        log.error("异常", e);
        // ⚠️ 捕获了异常，事务不会自动回滚
    }
}
```

✅ 正确处理方式：

-   抛出异常让事务感知
-   或手动触发回滚：

```
catch (Exception e) {
    TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
}
```


### 🧨 场景 4：**抛出的是检查异常，事务不会回滚**

默认 Spring 只对 **RuntimeException 及其子类** 自动回滚。

```
@Transactional
public void save() throws Exception { // 抛出的是 checked exception
    throw new Exception("checked 异常"); // ⚠️ 默认不会回滚
}
```

✅ 正确做法：

```
@Transactional(rollbackFor = Exception.class) // 手动指定回滚策略
public void save() throws Exception {
    throw new Exception("checked 异常");
}
```


### 🧨 场景 5：**数据库未开启事务支持** 或 非数据库操作

例如：

-   操作 Redis、MQ，不受事务控制
-   使用了数据库但某些 ORM 配置没有启用事务（如 MyBatis 没有开启事务管理器）

✅ 正确做法：检查是否使用了 `DataSourceTransactionManager`，以及操作是否真正落到了数据库连接上。


## 🧠 三、事务失效的图解总结

| 失效原因                   | 说明              |
| ---------------------- | --------------- |
| 自调用                    | 未经过代理，不会触发事务切面  |
| 非 `public` 方法          | Spring AOP 无法代理 |
| 异常被 `catch`            | 事务未感知到异常        |
| 抛出 `checked exception` | 默认不会回滚          |
| 不操作数据库                 | 没有真正事务          |
| Redis、MQ 操作            | 不受数据库事务控制


## 🎯 四、如何确保事务生效？

-   `@Transactional` 一般加在 **`public` 的业务方法上**

-   保证方法是通过 **代理对象** 调用的（不是 this.xx()）

-   明确异常抛出并让 Spring 能感知（或者加 `rollbackFor`）

-   日志调试建议打开：

    ```
    logging:
      level:
        org.springframework.transaction: DEBUG
    ```














