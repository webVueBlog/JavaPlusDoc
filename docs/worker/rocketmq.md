---
title: 安装RocketMQ
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## 安装RocketMQ

准备工作

开通端口

```shell
firewall-cmd --zone=public --add-port=9876/tcp --permanent
firewall-cmd --zone=public --add-port=10911/tcp --permanent
firewall-cmd --zone=public --add-port=19876/tcp --permanent
firewall-cmd --reload

```

创建目录

```shell
mkdir -p /home/docker/rocketmq/namesrv/logs
mkdir -p /home/docker/rocketmq/broker1/conf
mkdir -p /home/docker/rocketmq/broker1/logs
mkdir -p /home/docker/rocketmq/broker1/store

```

创建配置文件

```shell
cd /home/docker/rocketmq/broker1/conf
touch broker.conf
vim broker.conf

```

配置文件

```shell
# 所属集群名称，如果节点较多可以配置多个
brokerClusterName = DefaultCluster
#broker名称，master和slave使用相同的名称，表明他们的主从关系
brokerName = broker1
#0表示Master，大于0表示不同的slave
brokerId = 0
#表示几点做消息删除动作，默认是凌晨4点
deleteWhen = 04
#在磁盘上保留消息的时长，单位是小时
fileReservedTime = 48
#有三个值：SYNC_MASTER，ASYNC_MASTER，SLAVE；同步和异步表示Master和Slave之间同步数据的机制；
brokerRole = ASYNC_MASTER
#刷盘策略，取值为：ASYNC_FLUSH，SYNC_FLUSH表示同步刷盘和异步刷盘；SYNC_FLUSH消息写入磁盘后才返回成功状态，ASYNC_FLUSH不需要；
flushDiskType = ASYNC_FLUSH
# 设置broker节点所在服务器的ip地址（**这个非常重要,主从模式下，从节点会根据主节点的brokerIP2来同步数据，如果不配置，主从无法同步，brokerIP1设置为自己外网能访问的ip，服务器双网卡情况下必须配置，比如阿里云这种，主节点需要配置ip1和ip2，从节点只需要配置ip1即可）
# 此ip由使用环境决定 本机使用 127 局域网使用 192 外网使用 外网ip
brokerIP1 = 192.168.1.71
#nameServer地址，分号分割
namesrvAddr = 127.0.0.1:9876
#Broker 对外服务的监听端口,
listenPort = 10911
#是否允许Broker自动创建Topic
autoCreateTopicEnable = true
#是否允许 Broker 自动创建订阅组
autoCreateSubscriptionGroup = true
#linux开启epoll
useEpollNativeSelector = true

```

分配权限（最重要） 为所有目录包括子目录分配读写权限 没有写权限无法存储 会报错无法启动

```shell
chmod -R 777 /docker/rocketmq

chmod -R 777 /home/docker/rocketmq/namesrv/logs
```

docker-compose

docker-compose.yaml

```shell
version: "3"
services:
  mqnamesrv:
    image: apache/rocketmq:4.9.3
    container_name: mqnamesrv
    ports:
      - "9876:9876"
    environment:
      JAVA_OPT: -server -Xms512m -Xmx512m
    command: sh mqnamesrv
    volumes:
      - /home/docker/rocketmq/namesrv/logs:/home/rocketmq/logs/rocketmqlogs
    network_mode: "host"

  mqbroker1:
    image: apache/rocketmq:4.9.3
    container_name: mqbroker1
    ports:
      - "10911:10911"
      - "10909:10909"
      - "10912:10912"
    environment:
      JAVA_OPT_EXT: -server -Xms512M -Xmx512M -Xmn256m
    command: sh mqbroker -c /home/rocketmq/rocketmq-4.9.3/conf/broker.conf
    depends_on:
      - mqnamesrv
    volumes:
      - /home/docker/rocketmq/broker1/conf/broker.conf:/home/rocketmq/rocketmq-4.9.3/conf/broker.conf
      - /home/docker/rocketmq/broker1/logs:/home/rocketmq/logs/rocketmqlogs
      - /home/docker/rocketmq/broker1/store:/home/rocketmq/store
    network_mode: "host"

  mqconsole:
    image: styletang/rocketmq-console-ng
    container_name: mqconsole
    ports:
      - "19876:19876"
    environment:
      JAVA_OPTS: -Dserver.port=19876 -Drocketmq.namesrv.addr=127.0.0.1:9876 -Dcom.rocketmq.sendMessageWithVIPChannel=false
    depends_on:
      - mqnamesrv
    network_mode: "host"

```

启动服务

docker-compose up -d mqnamesrv mqbroker1 mqconsole

访问控制台：http://ip:19876/#/
