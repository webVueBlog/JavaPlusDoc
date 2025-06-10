---
title: 物联网redis
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## 物联网redis

RedisConfig 是一个 Spring 配置类，主要用于配置连接 Redis 数据库并提供 RedisTemplate，它支持 Redis 作为实时缓存的备份存储。这段代码通过配置 Redis 连接池、主机地址、端口、密码、数据库索引等信息，确保应用能够连接到 Redis 并进行高效的缓存操作。

### 主要功能：

配置 Redis 连接参数：

通过 @Value 注解从配置文件中获取 Redis 相关的参数，如 Redis 主机地址、端口号、密码、数据库索引、超时时间等。

创建 Redis 连接工厂：

使用 JedisConnectionFactory 创建 Redis 连接工厂，连接到 Redis 实例并设置连接的各种参数，包括主机、端口、密码、数据库索引和超时时间。

配置 Redis 连接池：

使用 JedisPoolConfig 配置 Redis 连接池的相关参数，如最大空闲连接数 (maxIdle) 和最小空闲连接数 (minIdle)。连接池的使用有助于提升 Redis 连接的复用效率，避免每次都创建新的连接。

创建 RedisTemplate：

使用配置好的连接工厂来创建 RedisTemplate，这是 Spring 数据库操作的核心类之一，封装了对 Redis 的常见操作，如存取数据等。RedisTemplate 提供了对 Redis 数据库进行各种操作的 API。

日志输出：

配置过程中，输出日志，记录 Redis 主机地址、端口号等关键信息，用于调试和监控。

静态缓存设置：

Redis 主机、端口、数据库索引和密码构成的字符串，可能用于后续跟踪或缓存标识。

1. 字段注入：

         使用 @Value 注解，从配置文件中读取 Redis 的相关配置信息并赋值给类的成员变量：
         host：Redis 主机地址。
         port：Redis 端口号。
         timeout：Redis 连接超时时间。
         password：Redis 密码。
         database：选择的 Redis 数据库索引。
         maxIdle：连接池的最大空闲连接数。
         minIdle：连接池的最小空闲连接数。

使用 `@ConfigurationProperties` 进行批量注入：

使用 `@ConfigurationProperties(prefix = "xx.xx.redis")` 来代替逐一的 `@Value` 注入，简化了代码，提升了可扩展性。当有新的 Redis 配置项时，只需要在配置文件中新增对应字段，而不需要修改代码。

避免日志中输出敏感信息：

在日志中避免打印 Redis 密码。在设置 `rtCacheId` 时，如果密码存在，使用 "****" 来替代真实的密码，这样可以避免将敏感信息泄露到日志中。

配置创建方法：

将连接工厂和连接池的创建逻辑提取到 `createJedisConnectionFactory()` 和 `createJedisPoolConfig()` 方法中，减少了重复代码，使得代码更加清晰和可维护。

连接池配置优化：

创建 `JedisPoolConfig` 时将 `maxIdle` 和 `minIdle` 提取到单独的方法中，使得该部分配置更加清晰。

静态字段的使用：

rtCacheId 保留了静态变量，但请注意，在多线程环境下使用静态字段需要确保线程安全性。如果没有特殊需求，静态字段的使用应尽量避免。如果需要保证唯一标识，可以考虑使用单例模式或其他机制。

可扩展性：

使用 `@ConfigurationProperties` 提高了类的可扩展性，方便以后扩展 `Redis` 配置项。

简化日志记录：

日志记录中仅包含 `Redis` 主机和端口，避免了敏感信息的暴露，同时对配置进行清晰描述。

## 创建并配置一个 RedisTemplate 实例

```
redisTemplate.opsForValue().set("user:123:loginStatus", "active");
String status = redisTemplate.opsForValue().get("user:123:loginStatus");

// 消息发送

// 获取返回结果

// 获取实时数据
```

实现了一个探测接口，用于获取 接入探测信息。虽然它能够完成任务，但在可维护性、性能、安全性、日志记录等方面仍有一些优化空间。以下是对该代码的优化建议以及优化后的代码：

## 优化建议：

### 日志增强：

目前的日志输出过于简单，特别是请求参数部分，可能导致日志过于冗长。应该合理处理日志级别和敏感信息。

### 异常处理改进：

异常捕获过于宽泛，捕获了所有异常。可以根据具体情况捕获特定的异常类型，例如 JsonProcessingException。

### 方法拆分：

info() 方法中的逻辑比较复杂，特别是与时间格式化、数据封装相关的部分，可以拆分成单独的辅助方法，减少方法复杂度。

### 简化对象创建：

ProbeInfo 对象的创建逻辑比较简单，直接使用构造函数来简化代码。不要重复设置相同属性。

### 配置文件值的优化：

配置文件中获取 spring.application.name 值的方式可以优化。建议使用 @ConfigurationProperties 代替 @Value，可以更方便地管理配置。

### 线程安全：

SimpleDateFormat 在多线程中是非线程安全的，考虑使用 `ThreadLocal<SimpleDateFormat>` 来保证线程安全。








