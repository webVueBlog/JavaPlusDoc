---
title: 面试了一位华为的运维程序员
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## 面试了一位华为的运维程序员

加群联系作者vx：xiaoda0423

仓库地址：<https://webvueblog.github.io/JavaPlusDoc/>

<https://1024bat.cn/>

<https://github.com/webVueBlog/fastapi_plus>

<https://webvueblog.github.io/JavaPlusDoc/>

![1747398531175.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/910a42c0866944828050590a08aa1c0b~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5oiR5piv5ZOq5ZCS:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTQ1MTAxMTA4MTI0OTE3NSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1748148710&x-orig-sign=qKUomqA5tCDkjtLqHJ3sfEQIDyw%3D)

![c107163de49f6fc1cbd68a89b3efbb7.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/e80abd3e725f4df2bd88d1048e95abd1~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5oiR5piv5ZOq5ZCS:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTQ1MTAxMTA4MTI0OTE3NSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1748148710&x-orig-sign=Ea0%2Fa2UV%2Fy4bYaECd7qbFI2wAX0%3D)

![6327739dd05338076e9df089567c865.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/d288677a72d5439fbb382c242ca14f84~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5oiR5piv5ZOq5ZCS:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTQ1MTAxMTA4MTI0OTE3NSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1748148710&x-orig-sign=7v6Y2IND67CYYhkbNaFhr8A2gRw%3D)

![14bb523191893f5cdd95664610aed22.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/ae94d9aa64c04a8b9b13b08a6d56d270~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5oiR5piv5ZOq5ZCS:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTQ1MTAxMTA4MTI0OTE3NSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1748148710&x-orig-sign=CYzSjy6dzN4wMQLaA7a6QZBSFYE%3D)

## ✅ 一、使用 Nginx 或 Apache 配置反向代理与负载均衡

### 🔹 Nginx 配置（推荐用于现代部署）

#### 1. 安装 Nginx（以 CentOS 为例）：

    sudo yum install nginx -y
    sudo systemctl enable nginx
    sudo systemctl start nginx

#### 2. 配置反向代理 `/etc/nginx/conf.d/ops_dashboard.conf`

    server {
        listen 80;
        server_name your-domain.com;

        location / {
            root /path/to/frontend;  # 替换成 index.html 所在目录
            index index.html;
            try_files $uri $uri/ /index.html;
        }

        location /api/ {
            proxy_pass http://127.0.0.1:5000;  # Flask 后端
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
    }

#### 3. 负载均衡（如多个 Flask 后端）：

    upstream backend {
        server 127.0.0.1:5000;
        server 127.0.0.1:5001;
    }

    server {
        listen 80;
        server_name your-domain.com;

        location /api/ {
            proxy_pass http://backend;
        }
    }

***

### 🔹 Apache 配置（如果你已有 Apache 环境）

#### 1. 启用模块（仅首次）：

    a2enmod proxy
    a2enmod proxy_http
    a2enmod headers

#### 2. 配置 `/etc/apache2/sites-available/ops_dashboard.conf`：

    <VirtualHost *:80>
        ServerName your-domain.com

        DocumentRoot /var/www/html/frontend

        <Directory /var/www/html/frontend>
            Options Indexes FollowSymLinks
            AllowOverride All
            Require all granted
        </Directory>

        ProxyPreserveHost On
        ProxyPass /api/ http://127.0.0.1:5000/api/
        ProxyPassReverse /api/ http://127.0.0.1:5000/api/
    </VirtualHost>

***

## ✅ 二、系统内核性能优化建议（sysctl.conf）

编辑 `/etc/sysctl.conf` 添加如下配置，然后执行 `sysctl -p` 生效：

    # 提高文件句柄数量
    fs.file-max = 1048576

    # TCP 优化
    net.core.somaxconn = 65535
    net.ipv4.tcp_max_syn_backlog = 8192
    net.ipv4.tcp_syncookies = 1
    net.ipv4.tcp_tw_reuse = 1

    # 减少 TIME_WAIT 数量
    net.ipv4.tcp_fin_timeout = 15
    net.ipv4.tcp_keepalive_time = 600

    # 禁用 ICMP 重定向（安全）
    net.ipv4.conf.all.accept_redirects = 0
    net.ipv4.conf.all.send_redirects = 0

### 🧱 同时配置 limits.conf 提高资源上限

编辑 `/etc/security/limits.conf`：

    * soft nofile 1048576
    * hard nofile 1048576
    * soft nproc 65535
    * hard nproc 65535

***

## ✅ 三、禁用无用服务（CentOS/RHEL 系统）

使用 `systemctl` 查看并关闭不必要服务：

    # 查看开机启动服务
    systemctl list-unit-files --type=service | grep enabled

    # 禁用示例服务
    sudo systemctl disable bluetooth.service
    sudo systemctl disable firewalld.service
    sudo systemctl disable cups.service
    sudo systemctl disable avahi-daemon.service

⚠️ 注意：关闭前请确认该服务对你当前服务器是否必要。

*   **CPU**：总、分核、时间分布、核数

*   **内存**：物理内存、Swap、buffers、cached

*   **磁盘**：分区使用＋分盘 IO 统计

*   **网络**：每个网卡的收发流量统计

*   **总览接口** `/api/monitor` 返回结构化 JSON

*   **导出接口** `/api/export` 将关键指标写入 Excel

## ✅ 1. 部署流程与发布新版本

### 🚀 常见部署流程（DevOps 流水线）

1.  **代码构建**

    *   使用 GitLab CI / Jenkins / GitHub Actions 自动拉取代码，执行构建任务（如 Maven、Webpack）

2.  **打包发布**

    *   构建成 Docker 镜像，推送至私有仓库（Harbor）
    *   或打成压缩包 / JAR 包通过 SCP 分发

3.  **部署发布**

    *   使用 Ansible / Shell 脚本部署到服务器
    *   或使用 K8s、Docker Compose 编排发布服务
    *   热部署使用 `soft reload`，灰度发布使用 Nginx + 标签策略（如 Istio）

4.  **回滚机制**

    *   保留最近几次构建包 / 镜像
    *   支持快速一键回滚

***

## ✅ 2. 配置开机自启服务（多种方式）

### ✅ Systemd（CentOS 7+/Ubuntu 16+ 推荐）

    sudo vim /etc/systemd/system/myapp.service

<!---->

    [Unit]
    Description=My Flask Dashboard
    After=network.target

    [Service]
    User=root
    WorkingDirectory=/opt/monitor-dashboard
    ExecStart=/usr/bin/python3 /opt/monitor-dashboard/app.py
    Restart=always

    [Install]
    WantedBy=multi-user.target

<!---->

    sudo systemctl daemon-reexec
    sudo systemctl enable myapp
    sudo systemctl start myapp

***

## ✅ 3. 系统资源优化措施（CPU、内存、IO、网络）

| 资源项     | 优化措施示例                                       |
| ------- | -------------------------------------------- |
| **CPU** | 合理线程池配置（如 gunicorn、Java executor）、避免死循环、热点缓存 |
| **内存**  | 使用 jemalloc / G1 GC（JVM）、释放无用缓存、定时重启长生命周期服务  |
| **磁盘**  | 配置 `logrotate`、监控 `/var/log`、定期清理缓存          |
| **IO**  | 使用 SSD、开启 `noatime`、尽量使用内存缓存而非磁盘中转           |
| **网络**  | 内部流量走内网、使用 CDN 加速、调优 MTU / TCP 参数            |

> 可使用 `vmstat` / `iostat` / `nmon` / `htop` / `free -m` 等实时查看资源瓶颈

***

## ✅ 4. 常用的监控系统（及部署经验）

### 🧠 主流监控方案：

| 工具/平台                    | 功能                  | 部署经验简述                 |
| ------------------------ | ------------------- | ---------------------- |
| **Prometheus + Grafana** | 应用指标监控，支持报警和可视化     | 自建或 K8s 内集成，Exporter 多 |
| **Zabbix**               | 全栈监控（主机/端口/日志）      | 适合传统机房/大屏展示，Web 配置     |
| **ELK + Filebeat**       | 日志采集 + 实时搜索 + 可视化   | 日志系统首选，Kibana 做大屏      |
| **Node Exporter**        | 采集主机 CPU/内存/磁盘等硬件指标 | 与 Prometheus 配合部署      |
| **Alertmanager**         | 告警通知（钉钉/企业微信/邮件）    | 与 Prometheus 无缝集成      |
| **Skywalking / Jaeger**  | 链路追踪（微服务）           | 用于分析请求瓶颈和慢接口           |

***

## 🧩 示例：一套实用的运维体系结构图

             +----------------------+
             |      Prometheus      |
             |      Alertmanager    |
             +----------------------+
                 ↑         ↑
         +-------------+  +-------------+
         | NodeExporter|  | Flask Exporter|
         +-------------+  +-------------+
                 ↓
            +---------+
            | Grafana |     --> 图表 & 大屏展示
            +---------+

           +---------------------------+
           |     Filebeat → Logstash  |
           |     Elasticsearch → Kibana|
           +---------------------------+

### 一、基本信息

*   **nginx version: nginx/1.20.1**\
    Nginx 主版本号是 **1.20.1**。
*   **built by gcc 4.8.5 20150623 (Red Hat 4.8.5-44) (GCC)**\
    编译 Nginx 时使用的是 **GCC 4.8.5** 编译器。
*   **built with OpenSSL 1.1.1g FIPS 21 Apr 2020**\
    集成的 **OpenSSL** 版本是 **1.1.1g**，并开启了 FIPS（联邦信息处理标准）支持，发布日期为 **2020-04-21**。
*   **TLS SNI support enabled**\
    启用了 **SNI（Server Name Indication）** ，可以让同一个 IP/端口托管多个 HTTPS 域名。

***

### 二、路径配置

| 参数                                                                                                                                                                                                                                                                  | 说明                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `--prefix=/usr/share/nginx`                                                                                                                                                                                                                                         | 安装目录的根路径                                  |
| `--sbin-path=/usr/sbin/nginx`                                                                                                                                                                                                                                       | nginx 可执行文件的完整路径                          |
| `--modules-path=/usr/lib64/nginx/modules`                                                                                                                                                                                                                           | 动态模块（`.so`）默认搜索路径                         |
| `--conf-path=/etc/nginx/nginx.conf`                                                                                                                                                                                                                                 | 主配置文件路径                                   |
| `--error-log-path=/var/log/nginx/error.log`                                                                                                                                                                                                                         | 错误日志文件路径                                  |
| `--http-log-path=/var/log/nginx/access.log`                                                                                                                                                                                                                         | 访问日志文件路径                                  |
| `--http-client-body-temp-path=/var/lib/nginx/tmp/client_body``--http-proxy-temp-path=/var/lib/nginx/tmp/proxy``--http-fastcgi-temp-path=/var/lib/nginx/tmp/fastcgi``--http-uwsgi-temp-path=/var/lib/nginx/tmp/uwsgi``--http-scgi-temp-path=/var/lib/nginx/tmp/scgi` | 各种临时文件（客户端请求体、代理、FastCGI、uWSGI、SCGI）的存放目录 |
| `--pid-path=/run/nginx.pid`                                                                                                                                                                                                                                         | 存放 nginx 主进程 PID 文件的路径                    |
| `--lock-path=/run/lock/subsys/nginx`                                                                                                                                                                                                                                | 锁文件路径                                     |
| `--user=nginx --group=nginx`                                                                                                                                                                                                                                        | 运行 nginx worker 进程所用的系统用户和用户组             |

***

### 三、功能模块支持

*   **兼容性与调试**

    *   `--with-compat`：允许旧版模块二进制兼容
    *   `--with-debug`：编译时启用调试日志功能

*   **异步与性能**

    *   `--with-file-aio`：文件异步 I/O 支持
    *   `--with-google_perftools_module`：集成 Google 性能分析工具（gperftools）模块
    *   `--with-threads`：开启多线程支持

*   **HTTP 基本扩展**

    *   `--with-http_addition_module`：可在响应尾部或头部添加内容
    *   `--with-http_auth_request_module`：支持外部授权子请求
    *   `--with-http_dav_module`：WebDAV 协议支持
    *   `--with-http_degradation_module`：自动降级模块
    *   `--with-http_flv_module`：FLV 视频流支持
    *   `--with-http_gunzip_module`：动态解压 gzip 内容
    *   `--with-http_gzip_static_module`：预压缩文件（.gz）直接提供
    *   `--with-http_mp4_module`：MP4 视频流支持
    *   `--with-http_sub_module`：响应内容替换（sub filter）
    *   `--with-http_realip_module`：从头部获取客户端真实 IP
    *   `--with-http_secure_link_module`：安全链接验证
    *   `--with-http_slice_module`：Slice 分片下载/分发
    *   `--with-http_ssl_module`：SSL/TLS 支持
    *   `--with-http_v2_module`：HTTP/2 支持
    *   `--with-http_stub_status_module`：内置状态监控接口（`stub_status`）

*   **动态可选模块**

    *   `--with-http_image_filter_module=dynamic`：图像处理模块按需加载
    *   `--with-http_xslt_module=dynamic`：XSLT 处理模块按需加载
    *   `--with-http_perl_module=dynamic`：嵌入 Perl 脚本模块按需加载
    *   `--with-mail=dynamic --with-mail_ssl_module`：邮件（SMTP/IMAP/POP3）代理及 SSL 模块按需加载
    *   `--with-stream=dynamic --with-stream_ssl_module --with-stream_ssl_preread_module`：TCP/UDP 流代理及 SSL 支持按需加载

*   **其他**

    *   `--with-randrom_index_module`：随机返回索引文件
    *   `--with-pcre --with-pcre-jit`：基于 PCRE 的正则支持及 JIT 加速

***

### 四、编译优化参数

*   `--with-cc-opt='-O2 -g -pipe -Wall -Wp,-D_FORTIFY_SOURCE=2 -fexceptions -fstack-protector-strong --param=ssp-buffer-size=4 -grecord-gcc-switches -specs=/usr/lib/rpm/redhat/redhat-hardened-cc1 -m64 -mtune=generic'`

    *   **-O2**：优化级别
    *   **-g**：保留调试符号
    *   **-fstack-protector-strong**：开启堆栈溢出保护
    *   **\_FORTIFY\_SOURCE**：增强运行时安全检查
    *   **-mtune=generic**：针对通用 x86\_64 优化

*   `--with-ld-opt='-Wl,-z,relro -specs=/usr/lib/rpm/redhat/redhat-hardened-ld -Wl,-E'`

    *   **-z relro**：只读重定位节，增强二进制安全
    *   **-Wl,-E**：导出符号表，兼容动态模块

***






