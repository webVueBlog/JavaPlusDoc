---
title: 入门教程
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

## 入门教程

Redis 针对不同的操作系统有不同的安装方式

Windows

下载地址如下：

https://github.com/MicrosoftArchive/redis/releases

我们这里选择第二种，MSI 的方式 MySQL 的时候讲过了，我们换一种口味。

打开命令行，进入到当前解压后的目录，输入启动命令：

redis-server redis.windows.conf

macOS 可以直接通过 Homebrew（戳链接了解）来安装 Redis，非常方便。

如果有 warp 终端（戳链接了解）的话，会更加智能，直接问它“如何安装 Redis”它就会告诉你安装步骤。


CentOS 默认的仓库中可能不包含 Redis，因此需要启用 EPEL（Extra Packages for Enterprise Linux）仓库。


sudo yum install epel-release

安装 Redis：


sudo yum install redis

启动 Redis 服务：


sudo systemctl start redis

设置开机启动：


sudo systemctl enable redis

查看 Redis 服务状态：


service redis status


设置开机启动：


sudo systemctl enable redis

查看 Redis 服务状态：


redis-cli ping

## Redis 的数据结构


Redis 有 5 种基础数据结构，String、Hash、List、Set、SortedSet，也是学 Redis 必须掌握的。除此之外，还有 HyperLogLog、Geo、Pub/Sub，算是高级数据结构了。

String 结构使用非常广泛，比如说把用户的登陆信息转成 JSON 字符串后缓存起来，等需要取出的时候再反序列化一次。

在项目中添加 Gson（用于序列化和反序列化用户信息） 依赖

	<dependency>
		<groupId>com.google.code.gson</groupId>
		<artifactId>gson</artifactId>
		<version>2.8.6</version>
		<scope>compile</scope>
	</dependency>

Jedis jedis = new Jedis("localhost", 6379);

