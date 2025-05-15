---
title: SpringBoot整合Quartz
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## SpringBoot整合Quartz

开源任务调度框架。

在使用 Quartz 之前，让我们先来搞清楚 4 个核心概念：

1. Job：任务，要执行的具体内容。
2. JobDetail：任务详情，Job 是它要执行的内容，同时包含了这个任务调度的策略和方案。
3. Trigger：触发器，可以通过 Cron 表达式来指定任务执行的时间。
4. Scheduler：调度器，可以注册多个 JobDetail 和 Trigger，用来调度、暂停和删除任务。

## 整合 Quartz

Quartz 存储任务的方式有两种，一种是使用内存，另外一种是使用数据库。内存在程序重启后就丢失了，所以我们这次使用数据库的方式来进行任务的持久化。

第一步，在 pom.xml 文件中添加 Quartz 的 starter。

```
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-quartz</artifactId>
    <version>2.6.7</version>
</dependency>
```

第二步，在 application.yml 添加 Quartz 相关配置，配置说明直接看注释。

```html
spring:
  quartz:
    job-store-type: jdbc # 默认为内存 memory 的方式，这里我们使用数据库的形式
    wait-for-jobs-to-complete-on-shutdown: true # 关闭时等待任务完成
    overwrite-existing-jobs: true # 可以覆盖已有的任务
    jdbc:
      initialize-schema: never # 是否自动使用 SQL 初始化 Quartz 表结构
    properties: # quartz原生配置
      org:
        quartz:
          scheduler:
            instanceName: scheduler # 调度器实例名称
            instanceId: AUTO # 调度器实例ID自动生成
          # JobStore 相关配置
          jobStore:
            class: org.quartz.impl.jdbcjobstore.JobStoreTX # JobStore 实现类
            driverDelegateClass: org.quartz.impl.jdbcjobstore.StdJDBCDelegate # 使用完全兼容JDBC的驱动
            tablePrefix: QRTZ_ # Quartz 表前缀
            useProperties: false # 是否将JobDataMap中的属性转为字符串存储
          # 线程池相关配置
          threadPool:
            threadCount: 25 # 线程池大小。默认为 10 。
            threadPriority: 5 # 线程优先级
            class: org.quartz.simpl.SimpleThreadPool # 指定线程池实现类，对调度器提供固定大小的线程池
```

Quartz 默认使用的是内存的方式来存储任务，为了持久化，我们这里改为 JDBC 的形式，并且指定 spring.quartz.jdbc.initialize-schema=never，这样我们可以手动创建数据表。因为该值的另外两个选项ALWAYS和EMBEDDED都不太符合我们的要求：

* ALWAYS：每次都初始化
* EMBEDDED：只初始化嵌入式数据库，比如说 H2、HSQL

剩下的就是对 Quartz 的 scheduler、jobStore 和 threadPool 配置。

第三步，创建任务调度的接口 IScheduleService，定义三个方法，分别是通过 Cron 表达式来调度任务、指定时间来调度任务，以及取消任务。

第四步，创建任务调度业务实现类 ScheduleServiceImpl，通过Scheduler、CronTrigger、JobDetail的API来实现对应的方法。

第五步，定义好要执行的任务，继承 QuartzJobBean 类，实现 executeInternal 方法，这里只定义一个定时发布文章的任务。

第六步，发布文章的接口里 PostsServiceImpl 添加定时发布的任务调度方法。

查看 Quartz 的数据表 qrtz_cron_triggers，发现任务已经添加进来了。

qrtz_job_details 表里也可以查看具体的任务详情。

文章定时发布的时间到了之后，在日志里也可以看到 Quartz 的执行日志。


