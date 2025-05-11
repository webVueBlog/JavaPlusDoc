---
title: Linux常用命令
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## Linux常用命令

查询磁盘占用

du -ah / | sort -rh | head -n 10

防火墙命令

```shell
# 添加
firewall-cmd --zone=public --add-port=6379/tcp --permanent    （--permanent永久生效，没有此参数重启后失效）

# 重新载入
firewall-cmd --reload

# 查看端口是否开放
firewall-cmd --zone= public --query-port=80/tcp

# 删除已开放的端口
firewall-cmd --zone= public --remove-port=80/tcp --permanent

```







