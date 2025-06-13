---
title: Nginx优化与防盗链
author: 哪吒
date: '2023-05-20'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

# Nginx优化与防盗链

## 一、Nginx性能优化

### 1.1 基础优化

#### 1.1.1 worker进程优化

```nginx
# 设置worker进程数量，通常设置为CPU核心数
worker_processes auto;

# 绑定worker进程到指定CPU，避免进程切换带来的开销
worker_cpu_affinity auto;

# 每个worker进程可以打开的最大文件描述符数量
worker_rlimit_nofile 65535;
```

#### 1.1.2 事件处理优化

```nginx
events {
    # 使用epoll事件驱动模型，Linux系统下效率最高
    use epoll;
    
    # 每个worker进程的最大连接数
    worker_connections 10240;
    
    # 尽可能接受所有新连接
    multi_accept on;
}
```

#### 1.1.3 HTTP基础优化

```nginx
http {
    # 开启高效文件传输模式
    sendfile on;
    
    # 减少网络报文段的数量
    tcp_nopush on;
    
    # 提高网络包的传输效率
    tcp_nodelay on;
    
    # 设置客户端连接保持活动的超时时间
    keepalive_timeout 60;
    
    # 设置请求头的超时时间
    client_header_timeout 10;
    
    # 设置请求体的超时时间
    client_body_timeout 10;
    
    # 响应超时时间
    send_timeout 10;
    
    # 读取请求体的缓冲区大小
    client_body_buffer_size 128k;
    
    # 读取请求头的缓冲区大小
    client_header_buffer_size 32k;
    
    # 上传文件大小限制
    client_max_body_size 10m;
}
```

### 1.2 静态资源优化

#### 1.2.1 Gzip压缩

```nginx
http {
    # 开启gzip压缩
    gzip on;
    
    # 压缩的最小文件大小，小于这个值不压缩
    gzip_min_length 1k;
    
    # 压缩缓冲区大小
    gzip_buffers 4 16k;
    
    # 压缩HTTP版本
    gzip_http_version 1.1;
    
    # 压缩级别，1-9，级别越高压缩率越高，但CPU消耗也越大
    gzip_comp_level 6;
    
    # 需要压缩的MIME类型
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
    
    # 是否在响应头中添加Vary: Accept-Encoding
    gzip_vary on;
    
    # IE6及以下禁用gzip
    gzip_disable "MSIE [1-6]\.";
}
```

#### 1.2.2 静态资源缓存

```nginx
server {
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        # 缓存时间设置
        expires 7d;
        
        # 添加缓存控制头
        add_header Cache-Control "public, max-age=604800";
    }
    
    # 针对不同类型文件设置不同的缓存策略
    location ~* \.(html|htm)$ {
        expires 1h;
        add_header Cache-Control "public, max-age=3600";
    }
}
```

### 1.3 负载均衡优化

#### 1.3.1 高级负载均衡配置

```nginx
upstream backend {
    # 使用IP哈希算法，确保同一客户端请求总是发送到同一服务器
    ip_hash;
    
    # 后端服务器列表
    server 192.168.1.10:8080 weight=5 max_fails=3 fail_timeout=30s;
    server 192.168.1.11:8080 weight=3 max_fails=3 fail_timeout=30s;
    server 192.168.1.12:8080 weight=2 max_fails=3 fail_timeout=30s;
    
    # 备用服务器，只有当所有主服务器都不可用时才使用
    server 192.168.1.13:8080 backup;
    
    # 保持长连接的数量
    keepalive 32;
}

server {
    location / {
        proxy_pass http://backend;
        
        # 设置代理请求头
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 超时设置
        proxy_connect_timeout 5s;
        proxy_send_timeout 10s;
        proxy_read_timeout 10s;
        
        # 启用HTTP/1.1
        proxy_http_version 1.1;
        
        # 设置连接为长连接
        proxy_set_header Connection "";
    }
}
```

#### 1.3.2 健康检查

```nginx
http {
    # 定义健康检查间隔和参数
    upstream backend {
        server 192.168.1.10:8080 max_fails=3 fail_timeout=30s;
        server 192.168.1.11:8080 max_fails=3 fail_timeout=30s;
        
        # 被动健康检查：max_fails表示允许请求失败的次数，fail_timeout表示失败后暂停的时间
    }
}
```

## 二、Nginx防盗链配置

### 2.1 基于HTTP Referer的防盗链

```nginx
server {
    # 图片防盗链
    location ~* \.(gif|jpg|jpeg|png|bmp|swf|webp)$ {
        # 允许的来源域名
        valid_referers none blocked server_names *.example.com example.* www.example.org/galleries/;
        
        # 如果referer不是上面指定的，则返回403
        if ($invalid_referer) {
            return 403;
        }
        
        # 或者返回一个默认的防盗链图片
        # if ($invalid_referer) {
        #     rewrite ^/ /images/forbidden.jpg break;
        # }
        
        root /path/to/your/files;
    }
    
    # 视频防盗链
    location ~* \.(mp4|avi|mkv|wmv|flv)$ {
        valid_referers none blocked server_names *.example.com example.*;
        if ($invalid_referer) {
            return 403;
        }
        root /path/to/your/videos;
    }
}
```

### 2.2 基于Cookie的防盗链

```nginx
server {
    location ~* \.(gif|jpg|jpeg|png|bmp|swf)$ {
        # 检查cookie
        if ($http_cookie !~ "authorized=yes") {
            return 403;
        }
        root /path/to/your/files;
    }
}
```

### 2.3 基于签名的防盗链（安全哈希）

```nginx
server {
    # 需要安装第三方模块：ngx_http_secure_link_module
    location /secure/ {
        # 验证链接的有效性
        secure_link $arg_md5,$arg_expires;
        secure_link_md5 "$secure_link_expires$uri$remote_addr secret_key";
        
        # 如果链接无效或过期
        if ($secure_link = "") {
            return 403;
        }
        
        # 如果链接已过期
        if ($secure_link = "0") {
            return 410; # Gone
        }
        
        # 正常处理请求
        root /path/to/your/secure/files;
    }
}
```

### 2.4 替换盗链图片

```nginx
server {
    location ~* \.(gif|jpg|jpeg|png|bmp|swf)$ {
        valid_referers none blocked server_names *.example.com example.*;
        
        # 如果是盗链，则返回自定义的图片
        if ($invalid_referer) {
            # 可以是透明图片或水印图片
            rewrite ^/.*$ /images/watermark.png break;
        }
        
        root /path/to/your/files;
        expires 7d;
    }
}
```

## 三、实际应用案例

### 3.1 静态网站优化配置

```nginx
server {
    listen 80;
    server_name www.example.com;
    root /var/www/html;
    index index.html;
    
    # 静态资源优化
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 7d;
        add_header Cache-Control "public, max-age=604800";
        
        # 防盗链配置
        valid_referers none blocked server_names *.example.com example.*;
        if ($invalid_referer) {
            return 403;
        }
    }
    
    # Gzip压缩
    gzip on;
    gzip_min_length 1k;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
    gzip_vary on;
    
    # 安全相关头信息
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Frame-Options SAMEORIGIN;
}
```

### 3.2 API服务器优化配置

```nginx
server {
    listen 80;
    server_name api.example.com;
    
    # API请求限流
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    
    location /api/ {
        # 应用限流
        limit_req zone=api_limit burst=20 nodelay;
        
        # 代理到后端服务
        proxy_pass http://backend_api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # 超时设置
        proxy_connect_timeout 5s;
        proxy_send_timeout 10s;
        proxy_read_timeout 10s;
        
        # CORS设置
        add_header 'Access-Control-Allow-Origin' 'https://www.example.com';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
        
        # 预检请求处理
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }
}
```

## 四、常见问题与解决方案

### 4.1 防盗链失效问题

1. **Referer头被伪造**：
   - 解决方案：结合IP限制、时间戳和签名机制增强防盗链安全性
   - 使用secure_link模块实现基于签名的防盗链

2. **移动端浏览器不发送Referer**：
   - 解决方案：配置valid_referers包含none选项，允许没有Referer的请求

3. **CDN缓存导致防盗链失效**：
   - 解决方案：确保CDN配置与Nginx防盗链策略一致，或在CDN层实现防盗链

### 4.2 性能优化问题

1. **过度压缩导致CPU使用率高**：
   - 解决方案：调整gzip_comp_level到适当级别（通常4-6），或对大文件使用预压缩

2. **缓存策略不当**：
   - 解决方案：根据资源更新频率设置合理的缓存时间，使用版本号或哈希值处理更新

3. **连接数限制**：
   - 解决方案：调整worker_connections和系统的文件描述符限制

## 五、最佳实践建议

1. **定期更新Nginx版本**，获取最新的安全补丁和性能改进

2. **使用监控工具**（如Prometheus + Grafana）监控Nginx性能指标

3. **结合多种防盗链机制**，不要仅依赖单一方法

4. **针对不同类型的资源采用不同的优化策略**

5. **测试配置变更**，使用`nginx -t`验证配置，并在生产环境应用前在测试环境验证

6. **记录详细的访问日志**，便于分析访问模式和潜在的盗链行为

7. **定期审查防盗链规则**，确保它们不会阻止合法访问

8. **考虑使用CDN**，分担源站压力并提供额外的防盗链保护