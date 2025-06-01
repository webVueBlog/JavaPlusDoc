---
title: Nginx环境配置
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## Nginx环境配置

* 停止：docker stop Nginx
* 重启：docker restart Nginx
* 删除服务：docker rm Nginx
* 删除镜像：docker rmi Nginx
* 进入服务：docker exec -it Nginx /bin/bash
* 配置文件：nginx - conf/html/logs/ssl(opens new window)

# 一、基础安装

```
docker run \
--restart always \
--name Nginx \
-d \
-p 80:80 \
nginx

```

## 轮询和权值 (负载均衡)

```
upstream myserver{
    server localhost:8088;
    server localhost:8083;
}

server{
    listen 8004;
    server_name localhost;
    location / {
        proxy_pass http://myserver;
    }
}



upstream myserver{
    server localhost:8088 weight=10;
    server localhost:8083 weight=2;
}

server{
    listen 8004;
    server_name localhost;
    location / {
        proxy_pass http://myserver;
    }
}
```

重定向分类：

1. 301 永久性重定向：永久移动到新的URL上，搜索引擎会更新索引。
2. 302 临时性重定向：暂时移动到新的URL上，搜索引擎不会更新索引。

301 永久性重定向

```
if ($host ~ '^b.com'){
    return 301 https://b.cn;
}
```

302 临时性重定向

```
if ($host ~ '^b.com'){
    return 302 https://b.cn;
}
```

```
location ^~ /api/ {
    proxy_pass http://127.0.0.1:8080/api/;
    add_header 'Access-Control-Allow-Origin' $http_origin;
    add_header 'Access-Control-Allow-Credentials' 'true';
    add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
    add_header Access-Control-Allow-Headers '*';
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Credentials' 'true';
        add_header 'Access-Control-Allow-Origin' $http_origin;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
        add_header 'Access-Control-Max-Age' 1728000;
        add_header 'Content-Type' 'text/plain; charset=utf-8';
        add_header 'Content-Length' 0;
        return 204;
    }
}
```

