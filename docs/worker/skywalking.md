---
title: 用SkyWalking监控Java服务
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## 用SkyWalking监控Java服务

SkyWalking Agent，只需要启动Java程序的时候加几个参数，就能对Java服务进行可视化监控啦

![img_58.png](./img_58.png)

下载

直接到SkyWalking的官网下载APM即可，官网地址：https://skywalking.apache.org/

下载完成后解压，得到这个文件夹：

![img_59.png](./img_59.png)

SkyWalking的后端服务配置文件在 apache-skywalking-apm-bin/webapp 目录下，主要修改一下服务端口号，默认是8080，如果与你的项目端口不冲突的话，可以忽略这一步

![img_60.png](./img_60.png)

## 启动SkyWalking后端服务

Windows的话，直接运行apache-skywalking-apm-bin/bin目录下的 startup.bat 就好了，其他系统可以运行sh那个。Windows打开后会出现两个黑色的框框，不用管他，最小化就好，这时我们需要的SkyWalking后端服务实际已经启动了。

## 验证

使用浏览器打开 localhost:18080，如果访问正常，说明服务已正常启动。 

## 启动Java项目和SkyWalking Agent

SkyWalking使用了比较简单的jar包agent方式进行客户端启动，Java服务启动命令添加以下参数

`-javaagent:F:\skywalking-agent\skywalking-agent.jar -Dskywalking.agent.service_name=demo -Dskywalking.collector.backend_service=localhost:11800`

参数说明：

1. -javaagent后添加skywalking-agent.jar的本地路径，哦，对了，这个agent jar包也是从SkyWalking的官网下载就可以
2. skywalking.agent.service_name，该Java服务在SkyWalking后端服务中的显示名称=
3. skywalking.collector.backend_service，SkyWalking的后端服务地址，如果你像我一样修改了配置文件的话，这里就应该是 localhost:11800

查看服务相关监控

使用浏览器访问 localhost:18080

点击Service Name，打开服务监控面板，其中Overview中记录了服务的一些基本监控指标，例如：Service Apdex，请求成功率，平均响应时间等

除了服务响应信息，SkyWalking还可以用来监控JVM。 选择Instance，并点击节点链接打开详情

打开后的Overview是单个节点的服务响应信息

选择JVM后，就是常见的JVM指标啦

![img_61.png](./img_61.png)





