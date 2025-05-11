---
title: 安装监控grafana
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## 安装监控grafana

### 安装docker

```shell
# step 1: 安装必要的一些系统工具
sudo yum install -y yum-utils device-mapper-persistent-data lvm2
# Step 2: 添加软件源信息
sudo yum-config-manager --add-repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
# Step 3
sudo sed -i 's+download.docker.com+mirrors.aliyun.com/docker-ce+' /etc/yum.repos.d/docker-ce.repo
# Step 4: 更新并安装Docker-CE
sudo yum makecache fast
sudo yum -y install docker-ce
# Step 4: 开启Docker服务
sudo service docker start

# 注意：
# 官方软件源默认启用了最新的软件，您可以通过编辑软件源的方式获取各个版本的软件包。例如官方并没有将测试版本的软件源置为可用，您可以通过以下方式开启。同理可以开启各种测试版本等。
# vim /etc/yum.repos.d/docker-ce.repo
#   将[docker-ce-test]下方的enabled=0修改为enabled=1
#
# 安装指定版本的Docker-CE:
# Step 1: 查找Docker-CE的版本:
# yum list docker-ce.x86_64 --showduplicates | sort -r
#   Loading mirror speeds from cached hostfile
#   Loaded plugins: branch, fastestmirror, langpacks
#   docker-ce.x86_64            17.03.1.ce-1.el7.centos            docker-ce-stable
#   docker-ce.x86_64            17.03.1.ce-1.el7.centos            @docker-ce-stable
#   docker-ce.x86_64            17.03.0.ce-1.el7.centos            docker-ce-stable
#   Available Packages
# Step2: 安装指定版本的Docker-CE: (VERSION例如上面的17.03.0.ce.1-1.el7.centos)
# sudo yum -y install docker-ce-[VERSION]


```

### 配置国内镜像源

```shell
mkdir -p /etc/docker
tee /etc/docker/daemon.json <<-'EOF'
{
    "registry-mirrors": [
        "https://docker.m.daocloud.io",
        "https://huecker.io",
        "https://dockerhub.timeweb.cloud",
        "https://noohub.ru"
    ]
}
EOF

```

### 创建目录和授权

```shell
# 都安装在这个目录
mkdir -p /home/docker/prometheus
mkdir /home/docker/prometheus/grafana_data
mkdir /home/docker/prometheus/prometheus_data
chmod 777  /home/docker/prometheus/grafana_data
chmod 777  /home/docker/prometheus/prometheus_data

```

### 配置文件 prometheus

/home/docker/prometheus/prometheus.yml

```shell
global:
  scrape_interval:     15s # 默认抓取周期
  external_labels:
    monitor: 'codelab-monitor'
scrape_configs:
  - job_name: 'node-exporter' #服务的名称
    scrape_interval: 5s
    metrics_path: /metrics  #获取指标的url
    static_configs:
      - targets: ['192.168.0.221:9100'] # 这个为监听指定服务服务的ip和port，需要修改为自己的ip，貌似云服务必须用公网ip

  - job_name: 'electricity' #服务的名称
    scrape_interval: 5s
    metrics_path: /actuator/prometheus  #获取指标的url
    static_configs:
      - targets: ['192.168.0.130:28097'] # 这个为监听指定服务服务的ip和port，需要修改为自己的ip，貌似云服务必须用公网ip

```

### 配置docker compose文件

/home/docker/prometheus/docker-compose.yml

```shell
version: "3.7"
services:
 node-exporter:
   image: prom/node-exporter:latest
   container_name: "node-exporter0"
   ports:
     - "9100:9100"
   restart: always
 prometheus:
   image: prom/prometheus:latest
   container_name: "prometheus0"
   restart: always
   ports:
     - "9090:9090"
   volumes:
     - "./prometheus.yml:/etc/prometheus/prometheus.yml"
     - "./prometheus_data:/prometheus"
 grafana:
   image: grafana/grafana
   container_name: "grafana0"
   ports:
     - "3000:3000"
   restart: always
   volumes:
     - "./grafana_data:/var/lib/grafana"                                       

```

### 启动服务

```shell
cd /home/docker/prometheus/
docker compose up -d 

```

主机基础监控(cpu，内存，磁盘，网络)

![img_8.png](./img_8.png)

https://grafana.com/grafana/dashboards/12856-jvm-micrometer/

https://grafana.com/grafana/dashboards/10280-microservices-spring-boot-2-1/ 

https://grafana.com/grafana/dashboards/4701-jvm-micrometer/

https://grafana.com/grafana/dashboards/9276-1-cpu/

