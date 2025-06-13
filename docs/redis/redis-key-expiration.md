---
title: Redis中的key过期问题解决方案
author: 哪吒
date: '2023-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## Redis中的key过期问题解决方案

Redis作为高性能的内存数据库，被广泛应用于缓存、会话管理、计数器等场景。在使用Redis过程中，key的过期问题是一个常见的挑战，本文将详细介绍Redis key过期的原理、常见问题及解决方案。

## 1. Redis key过期机制原理

### 1.1 过期策略

Redis采用两种策略来处理过期的key：

#### 1.1.1 定期删除

Redis默认每隔100ms随机抽取一部分设置了过期时间的key进行检查，如果发现已过期则删除。这种策略是一种折中方案，避免了每次都扫描全部key带来的性能问题。

```
# redis.conf 配置
hz 10  # 默认每秒执行10次定期删除
```

#### 1.1.2 惰性删除

当客户端尝试访问某个key时，Redis会检查该key是否已过期，如果过期则删除并返回空值。这种方式只有在访问key时才会触发过期检查，节省了CPU资源，但可能导致过期key长时间占用内存。

### 1.2 内存淘汰机制

当Redis内存使用达到上限时，会触发内存淘汰机制，根据配置的策略删除部分key：

1. **noeviction**: 不删除任何key，新写入操作会报错
2. **allkeys-lru**: 删除最近最少使用的key（常用）
3. **allkeys-random**: 随机删除key
4. **volatile-lru**: 在设置了过期时间的key中，删除最近最少使用的key
5. **volatile-random**: 在设置了过期时间的key中，随机删除key
6. **volatile-ttl**: 在设置了过期时间的key中，删除剩余寿命最短的key
7. **allkeys-lfu**: 删除使用频率最少的key（Redis 4.0新增）
8. **volatile-lfu**: 在设置了过期时间的key中，删除使用频率最少的key（Redis 4.0新增）

```
# redis.conf 配置
maxmemory 2gb  # 设置最大内存
maxmemory-policy allkeys-lru  # 设置淘汰策略
```

## 2. Redis key过期常见问题

### 2.1 缓存雪崩

**问题**: 大量key在同一时间点过期，导致大量请求直接访问数据库，可能使数据库瞬间崩溃。

**场景示例**: 系统在某个时间点批量设置了大量缓存，且过期时间相同，如电商系统在活动开始前预热商品数据，所有缓存设置为活动结束时间过期。

### 2.2 缓存击穿

**问题**: 某个热点key过期，导致大量并发请求直接访问数据库。

**场景示例**: 一个高访问量的商品详情页缓存突然过期，大量用户同时请求该商品信息。

### 2.3 缓存穿透

**问题**: 请求查询一个不存在的数据，导致请求直接落到数据库上。

**场景示例**: 恶意用户不断请求不存在的商品ID，每次请求都会查询数据库。

### 2.4 主从复制中的过期问题

**问题**: 在主从架构中，从节点不会主动过期key，只有当主节点过期一个key时，才会向从节点发送del命令。

**场景示例**: 如果主节点宕机，从节点提升为主节点，可能会出现已过期但未删除的key。

## 3. Redis key过期问题解决方案

### 3.1 缓存雪崩解决方案

#### 3.1.1 过期时间添加随机值

为缓存设置过期时间时增加一个随机值，避免大量缓存同时过期。

```java
// 设置过期时间为10-15分钟之间的随机值
long timeout = 10 + new Random().nextInt(5);
redisTemplate.opsForValue().set(key, value, timeout, TimeUnit.MINUTES);
```

#### 3.1.2 缓存预热

系统启动时或定时任务中提前加载热点数据到缓存。

```java
@PostConstruct
public void preloadCache() {
    List<Product> hotProducts = productService.findHotProducts();
    for (Product product : hotProducts) {
        String key = "product:" + product.getId();
        redisTemplate.opsForValue().set(key, JSON.toJSONString(product), 
            getRandomExpireTime(), TimeUnit.MINUTES);
    }
}
```

#### 3.1.3 多级缓存

使用本地缓存+分布式缓存的多级缓存架构。

```java
// 使用Caffeine作为本地缓存
private LoadingCache<String, Product> localCache = Caffeine.newBuilder()
    .maximumSize(1000)
    .expireAfterWrite(5, TimeUnit.MINUTES)
    .build(key -> getFromRedis(key));

private Product getFromRedis(String key) {
    String json = redisTemplate.opsForValue().get(key);
    return JSON.parseObject(json, Product.class);
}
```

### 3.2 缓存击穿解决方案

#### 3.2.1 使用分布式锁

使用分布式锁确保同一时间只有一个请求去查询数据库和更新缓存。

```java
public Product getProduct(Long id) {
    String key = "product:" + id;
    String json = redisTemplate.opsForValue().get(key);
    if (StringUtils.hasText(json)) {
        return JSON.parseObject(json, Product.class);
    }
    
    // 使用Redisson分布式锁
    RLock lock = redissonClient.getLock("lock:product:" + id);
    try {
        if (lock.tryLock(5, 30, TimeUnit.SECONDS)) {
            try {
                // 双重检查
                json = redisTemplate.opsForValue().get(key);
                if (StringUtils.hasText(json)) {
                    return JSON.parseObject(json, Product.class);
                }
                
                // 查询数据库
                Product product = productMapper.selectById(id);
                if (product != null) {
                    redisTemplate.opsForValue().set(key, JSON.toJSONString(product), 
                        getRandomExpireTime(), TimeUnit.MINUTES);
                }
                return product;
            } finally {
                lock.unlock();
            }
        } else {
            // 获取锁失败，短暂休眠后重试获取缓存
            Thread.sleep(100);
            json = redisTemplate.opsForValue().get(key);
            if (StringUtils.hasText(json)) {
                return JSON.parseObject(json, Product.class);
            }
            return null;
        }
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        return null;
    }
}
```

#### 3.2.2 热点数据永不过期

对于极热点数据，可以设置永不过期，而是通过后台异步更新缓存。

```java
// 设置热点数据永不过期
redisTemplate.opsForValue().set("hotspot:product:" + id, value);

// 后台定时任务更新缓存
@Scheduled(fixedRate = 300000) // 每5分钟执行一次
public void refreshHotspotCache() {
    Set<String> keys = redisTemplate.keys("hotspot:product:*");
    for (String key : keys) {
        Long id = Long.valueOf(key.split(":")[2]);
        Product product = productMapper.selectById(id);
        if (product != null) {
            redisTemplate.opsForValue().set(key, JSON.toJSONString(product));
        }
    }
}
```

### 3.3 缓存穿透解决方案

#### 3.3.1 缓存空值

对于不存在的数据，也缓存一个空值，但过期时间较短。

```java
public Product getProduct(Long id) {
    String key = "product:" + id;
    String json = redisTemplate.opsForValue().get(key);
    
    if (json != null) {
        if (json.isEmpty()) {
            // 空值缓存命中
            return null;
        }
        return JSON.parseObject(json, Product.class);
    }
    
    // 查询数据库
    Product product = productMapper.selectById(id);
    if (product == null) {
        // 缓存空值，过期时间短
        redisTemplate.opsForValue().set(key, "", 2, TimeUnit.MINUTES);
        return null;
    } else {
        redisTemplate.opsForValue().set(key, JSON.toJSONString(product), 
            getRandomExpireTime(), TimeUnit.MINUTES);
        return product;
    }
}
```

#### 3.3.2 布隆过滤器

使用布隆过滤器快速判断key是否存在，避免对不存在的数据进行查询。

```java
// 初始化布隆过滤器
private BloomFilter<Long> bloomFilter = BloomFilter.create(
    Funnels.longFunnel(),
    10000000,  // 预计元素数量
    0.01       // 误判率
);

// 加载所有商品ID到布隆过滤器
@PostConstruct
public void initBloomFilter() {
    List<Long> allProductIds = productMapper.selectAllIds();
    for (Long id : allProductIds) {
        bloomFilter.put(id);
    }
}

public Product getProduct(Long id) {
    // 布隆过滤器判断
    if (!bloomFilter.mightContain(id)) {
        return null; // ID不存在，直接返回
    }
    
    // 继续查询缓存和数据库
    // ...
}
```

### 3.4 主从复制中的过期问题解决方案

#### 3.4.1 合理配置主从参数

确保主节点及时过期key并同步到从节点。

```
# redis.conf 主节点配置
hz 20  # 提高定期删除频率
```

#### 3.4.2 监控过期key情况

定期检查Redis中过期key的数量，及时发现异常。

```bash
# 监控过期key数量
redis-cli info stats | grep expired_keys
```

## 4. 最佳实践

### 4.1 统一的缓存访问模板

封装一个统一的缓存访问模板，集成各种解决方案。

```java
public class CacheTemplate {
    
    private RedisTemplate<String, String> redisTemplate;
    private RedissonClient redissonClient;
    private BloomFilter<Long> bloomFilter;
    
    public <T> T queryWithCache(String keyPrefix, Long id, Class<T> clazz, Function<Long, T> dbFallback) {
        // 布隆过滤器判断
        if (bloomFilter != null && !bloomFilter.mightContain(id)) {
            return null;
        }
        
        String key = keyPrefix + id;
        String json = redisTemplate.opsForValue().get(key);
        
        // 缓存命中
        if (json != null) {
            if (json.isEmpty()) {
                return null; // 空值缓存
            }
            return JSON.parseObject(json, clazz);
        }
        
        // 分布式锁防击穿
        RLock lock = redissonClient.getLock("lock:" + key);
        try {
            if (lock.tryLock(5, 30, TimeUnit.SECONDS)) {
                try {
                    // 双重检查
                    json = redisTemplate.opsForValue().get(key);
                    if (json != null) {
                        return json.isEmpty() ? null : JSON.parseObject(json, clazz);
                    }
                    
                    // 查询数据库
                    T data = dbFallback.apply(id);
                    if (data == null) {
                        // 缓存空值
                        redisTemplate.opsForValue().set(key, "", 2, TimeUnit.MINUTES);
                    } else {
                        // 缓存数据，添加随机过期时间
                        long timeout = 10 + new Random().nextInt(5);
                        redisTemplate.opsForValue().set(key, JSON.toJSONString(data), 
                            timeout, TimeUnit.MINUTES);
                    }
                    return data;
                } finally {
                    lock.unlock();
                }
            } else {
                // 获取锁失败，短暂休眠后重试获取缓存
                Thread.sleep(100);
                json = redisTemplate.opsForValue().get(key);
                if (json != null) {
                    return json.isEmpty() ? null : JSON.parseObject(json, clazz);
                }
                return null;
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return null;
        }
    }
}
```

### 4.2 定期更新策略

对于某些重要数据，可以采用定期更新策略，避免过期问题。

```java
@Scheduled(fixedRate = 600000) // 每10分钟执行一次
public void refreshImportantCache() {
    List<Product> importantProducts = productService.findImportantProducts();
    for (Product product : importantProducts) {
        String key = "product:" + product.getId();
        redisTemplate.opsForValue().set(key, JSON.toJSONString(product), 
            getRandomExpireTime(), TimeUnit.MINUTES);
    }
}
```

### 4.3 监控和告警

设置Redis监控和告警机制，及时发现过期相关问题。

```java
@Scheduled(fixedRate = 300000) // 每5分钟执行一次
public void monitorRedisExpiration() {
    Long expiredKeys = redisTemplate.execute((RedisCallback<Long>) connection -> 
        connection.info().getProperty("expired_keys"));
    
    if (expiredKeys > THRESHOLD) {
        // 触发告警
        alertService.sendAlert("Redis过期key数量异常: " + expiredKeys);
    }
}
```

## 5. 总结

Redis key过期问题是使用Redis缓存系统时必须面对的挑战，通过理解Redis的过期机制原理，针对不同场景采用合适的解决方案，可以有效避免缓存雪崩、击穿和穿透等问题，提高系统的稳定性和性能。

关键解决方案包括：

1. 为过期时间添加随机值，避免同时过期
2. 使用分布式锁防止缓存击穿
3. 缓存空值和使用布隆过滤器防止缓存穿透
4. 采用多级缓存架构提高系统弹性
5. 对热点数据进行特殊处理，如永不过期+后台更新
6. 建立完善的监控和告警机制

通过这些方案的组合应用，可以构建一个健壮的Redis缓存系统，有效解决key过期带来的各种问题。