---
title: MySQL和Redis的数据一致性
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## MySQL和Redis的数据一致性

实时一致性方案：采用“先写 MySQL，再删除 Redis”的策略，这种情况虽然也会存在两者不一致，但是需要满足的条件有点苛刻，所以是满足实时性条件下，能尽量满足一致性的最优解。

最终一致性方案：采用“先写 MySQL，通过 Binlog，异步更新 Redis”，可以通过 Binlog，结合消息队列异步更新 Redis，是最终一致性的最优解。

```
spring:
  datasource:    
    type: com.alibaba.druid.pool.DruidDataSource
    druid:
      #初始化连接池大小
      initial-size: 5
      #配置最小连接数
      min-idle: 5
      #配置最大连接数
      max-active: 200
      #配置连接等待超时时间
      max-wait: 60000
      #配置间隔多久才进行一次检测，检测需要关闭的空闲连接，单位是毫秒
      time-between-eviction-runs-millis: 60000
      #配置一个连接在池中最小生存的时间，单位是毫秒
      min-evictable-idle-time-millis: 300000
      #测试连接
      validation-query: SELECT 1 FROM DUAL
      #申请连接的时候检测，建议配置为true，不影响性能，并且保证安全
      test-while-idle: true
      #获取连接时执行检测，建议关闭，影响性能
      test-on-borrow: false
      #归还连接时执行检测，建议关闭，影响性能
      test-on-return: false
      #是否开启PSCache，PSCache对支持游标的数据库性能提升巨大，oracle建议开启，mysql下建议关闭
      pool-prepared-statements: false
      #开启poolPreparedStatements后生效
      max-pool-prepared-statement-per-connection-size: 20
      #配置扩展插件，常用的插件有=>stat:监控统计  log4j:日志  wall:防御sql注入
      filters: stat,wall,slf4j
      #打开mergeSql功能；慢SQL记录
      connection-properties: druid.stat.mergeSql\=true;druid.stat.slowSqlMillis\=5000
      #配置DruidStatFilter
      web-stat-filter:
        enabled: true
        url-pattern: "/*"
        exclusions: "*.js,*.gif,*.jpg,*.bmp,*.png,*.css,*.ico,/druid/*"
      #配置DruidStatViewServlet
      stat-view-servlet:
        url-pattern: "/druid/*"
        #登录名
        login-username: root
        #登录密码
        login-password: root
```