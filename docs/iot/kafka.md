---
title: 物联网kafka
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## 物联网kafka

KafkaEventHandle 类是一个处理 Kafka 消息的服务类，它使用了 Spring Kafka 的 @KafkaListener 注解来监听来自 Kafka 的消息，并处理不同类型的事件。该类的主要功能是处理 两个主题的消息，并执行相应的业务逻辑。

关键功能和过程：

监听 Kafka 消息：

* `@KafkaListener(topics ="${xxx}", containerFactory = "kafkaEventConsumerFactory")` 用于监听 xxx 主题的消息。
* `@KafkaListener(topics ="xxx", containerFactory = "kafkaEventConsumerFactory")` 用于监听 xxx 主题的消息。

**处理定向事件** 原始数据 存储内存

`ack.acknowledge();` //手动提交偏移量

**处理广播事件**

根据 eventId 判断事件类型

**消息确认与偏移量提交**：

每个方法的最后都会调用 ack.acknowledge() 来手动提交偏移量，确保消息被成功处理后才提交。

1. 定义处理定向事件的方法
2. 定义处理广播事件的方法
3. 处理设备上线事件
4. 清除设备相关的数据
5. 记录处理耗时的日志

CassandraConfig 类是一个 Spring 配置类，用于配置连接到 Cassandra 数据库的相关设置，提供 Cassandra 数据库集群和会话（Session）的配置。主要用途是连接到 Cassandra 备份数据库），并通过 Spring 的 @Bean 注解将 Cassandra 集群和会话对象作为 Spring 的 Bean 提供给其他组件使用。

主要功能：

1. 配置 Cassandra 集群连接：

* 通过注入 Cassandra 数据库连接的配置参数（如 IP、端口、用户名和密码），配置一个 Cassandra 集群连接实例。
* 使用 PoolingOptions 设置 Cassandra 连接池的相关参数。

2. 创建 Cassandra 会话：

* 使用配置好的集群连接实例来创建一个 Session 对象，代表与 Cassandra 集群的一个会话。
* Session 提供执行查询的能力，可以与 Cassandra 数据库交互。

3. Cassandra 集群的连接配置（getCasandraCluster() 方法）：

* 创建一个 PoolingOptions 对象，配置 Cassandra 连接池的连接数量。
* 设置每个主机的核心连接数为 2（setCoreConnectionsPerHost）。
* 设置每个主机的最大连接数为 4（setMaxConnectionsPerHost）。
* 根据是否提供了用户名和密码，动态创建 Cluster 对象：
* 如果没有用户名和密码，直接通过 IP 和端口连接。
* 如果有用户名和密码，则使用 withCredentials 方法提供凭证进行连接。
* 返回配置好的 Cluster 对象，并记录日志，输出 Cassandra 集群的名称。
* 记录当前 Cassandra 连接的相关信息（IP、端口、用户名、密码）。

4. Cassandra 会话配置（getCasandraClusterSession() 方法）：

* 通过传入的 Cluster 对象，创建 Session 会话对象，表示与 Cassandra 集群的连接。
* 输出集群的信息，包括所有连接的节点信息和集群中的所有键空间（KeyspaceMetadata）。
* 返回创建好的 Session 对象，供应用程序执行查询操作。

## 存储在数据库中的数据流程：

数据结构：

* 数据存储在 Cassandra 数据库中，主要由 表（Table） 和 键空间（Keyspace） 构成。
* 键空间（Keyspace）：相当于关系型数据库中的数据库，用于组织表。
* 表（Table）：包含实际存储的数据，表由行（Row）和列（Column）组成。
* 在这个配置类中，代码并没有显式地定义表的结构，而是配置了与 Cassandra 的连接和会话，表结构的设计应该在其他部分的代码或数据库中进行。

实现了连接到 Cassandra 集群并配置相关的 Session 和 Cluster。

1. 定义 Cassandra Cluster 的连接池和连接配置
2. 定义 Cassandra Session Bean
3. 打印 Cassandra 集群的元数据，包括节点信息和键空间

## 优化这段代码可以从以下几个方面着手：

1. 日志优化：日志输出可以更加结构化，且提高可读性。
2. 异常处理：增加必要的异常处理，避免 Cassandra 连接配置失败时程序崩溃。
3. 简化代码：减少重复的代码，优化配置项的读取。
4. 连接池优化：根据业务需求，进一步细化连接池配置。
5. 配置项优化：减少硬编码，并确保代码可扩展性。
6. 性能考虑：避免静态字段用于存储敏感信息（如 msgPersitId）。

```
创建 Cassandra 集群连接池配置 Bean
根据配置创建 Cluster 对象。
创建 Cassandra Session 对象。
打印 Cassandra 集群的元数据，包括节点信息和键空间。
```

优化这段 Kafka 生产者配置代码可以从以下几个方面着手：

1. 提升代码可维护性和扩展性：简化冗余的配置，确保参数可扩展。
2. 日志输出：增加日志输出，帮助调试和生产环境监控。
3. 错误处理：增加配置读取失败的处理逻辑，避免出现未定义的配置项。
4. 性能优化：尽量减少不必要的操作，优化配置的创建过程。
5. 代码结构清晰：分离配置项和具体配置方法，使得每个方法职责单一，便于维护。


KafkaPConfig 类是一个 Spring 配置类，主要用于配置 Kafka 生产者（Producer），使得应用能够通过 Kafka 发送消息。它包含了 Kafka 生产者的基本配置，如 Kafka 集群地址、重试次数、批处理大小、延迟发送时间、缓冲区大小等。通过这段配置，应用能够向 Kafka 集群发送 消息或其他类型的消息。

## 主要功能：

配置 Kafka 生产者的连接参数：

通过 @Value 注解从配置文件中读取 Kafka 的相关配置，如 Kafka 集群的服务器地址、重试次数、批量大小、延迟时间、缓冲区大小等。

定义 Kafka 生产者配置（producerConfigs() 方法）：

使用 Kafka 提供的 ProducerConfig 类来配置生产者的各项参数，包括重试次数、批量大小、延迟时间等，以确保消息发送的高效性和稳定性。

创建 Kafka 生产者工厂（producerFactory() 方法）：

使用 DefaultKafkaProducerFactory 创建 Kafka 生产者工厂，该工厂用于创建 Kafka 生产者实例。

创建 KafkaTemplate：

KafkaTemplate 是 Spring Kafka 提供的用于与 Kafka 进行交互的高层抽象类。通过 @Bean 注解将其注册到 Spring 容器中，使得应用可以通过它发送消息到 Kafka 集群。



