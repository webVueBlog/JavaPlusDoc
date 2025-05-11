---
title: ELK日志系统安装
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## ELK日志系统安装

安装

### 安装elasticsearch

创建用户，创建目录并授权

```shell
# 用户
sudo useradd elasticsearch
sudo groupadd elasticsearch 
sudo usermod -a -G elasticsearch elasticsearch

# 创建目录
mkdir -p /data/elk/es/{data,logs}

# 目录修改所有者为 elasticsearch
chown -R elasticsearch:elasticsearch es

# 临时启动一个容器获取配置文件拷贝出来，修改配置挂载
docker run --name elasticsearch -d elasticsearch:7.17.15
docker cp elasticsearch:/usr/share/elasticsearch/config /data/elk/es/

```

```shell
version: '3.1'
services:
  elasticsearch:
    image: elasticsearch:7.17.15
    container_name: elasticsearch
    privileged: true
    environment:
      - "cluster.name=elasticsearch" #设置集群名称为elasticsearch
      - "discovery.type=single-node" #以单一节点模式启动
      - "ES_JAVA_OPTS=-Xms512m -Xmx2048m" #设置使用jvm内存大小
      - bootstrap.memory_lock=true
    volumes:
      - /etc/localtime:/etc/localtime
      - ./es/plugins:/usr/share/elasticsearch/plugins:rw #插件文件挂载
      - ./es/data:/usr/share/elasticsearch/data:rw #数据文件挂载
      - ./es/logs:/usr/share/elasticsearch/logs:rw
    ports:
      - 9200:9200
      - 9300:9300
    deploy:
     resources:
        limits:
           cpus: "2"
           memory: 2048M
        reservations:
           memory: 512M

```

### 设置ES密码

修改配置 vim elasticsearch.yml

```shell
xpack.security.enabled: true
xpack.license.self_generated.type: basic
xpack.security.transport.ssl.enabled: true


```

重启服务

docker restart elasticsearch

初始化密码

```shell

#进入容器
docker exec -it elasticsearch bash

# 初始化命令, 会同时初始化多个账号的密码，按提示操作即可
/usr/share/elasticsearch/bin/elasticsearch-setup-passwords interactive


```

安装kibana

创建用户，目录，授权

```shell
sudo useradd kibana
sudo groupadd kibana 
sudo usermod -a -G kibana kibana

mkdir -p /data/elk/kibana/config

# 授权 
chown -R kibana:kibana kibana 

```

配置文件处理

```shell

# 先随便运行一个节点，获取配置文件，从容器中拷贝出来
docker run --name kibana -d kibana:7.17.15

# 查询看运行是否正常 
docker logs -f kibana  
docker cp kibana:/usr/share/kibana/confg/kibana.yml /data/elk/kibana/config
docker rm -f kibana


```

启动容器

创建配置文件 vim docker-kibana.yaml

```shell
version: '3.1'
services:
  kibana:
    image: kibana:7.17.15
    container_name: kibana
    volumes:
      - /etc/localtime:/etc/localtime
    #  - /data/elk/kibana/config:/usr/share/kibana/config:rw
    #depends_on: 
     # - elasticsearch #kibana在elasticsearch启动之后再启动
    environment:
      ELASTICSEARCH_HOSTS: http://localhost:9200 #设置访问elasticsearch的地址
      I18N_LOCALE: zh-CN
    ports:
      - 5601:5601

```

logstash 日志格式化

### 用户关联

```shell
sudo useradd logstash
sudo groupadd logstash 
sudo usermod -a -G logstash logstash

mkdir -p /data/elk/logstash/config
mkdir -p /data/elk/logstash/data

# 授权 
chown -R logstash:logstash /data/elk/logstash 
chmod 777 /data/elk/logstash/data

```

## 启动临时容器获取配置

```shell
docker run --name logstash -d logstash:7.17.15

# 进入容器看需求哪些配置
docker exec -it logstash bash

# 我拷贝 config和data
docker cp logstash:/usr/share/logstash/data  /data/elk/logstash
docker cp logstash:/usr/share/logstash/config  /data/elk/logstash


```

配置 /data/elk/logstash/config/logstash.yml

```shell
http.host: "0.0.0.0"
xpack.monitoring.enabled: true
xpack.monitoring.elasticsearch.username: logstash_system    #访问es的用户名
xpack.monitoring.elasticsearch.password: 123456           #访问es的密码 xxx
xpack.monitoring.elasticsearch.hosts: ["127.0.0.1:9200"]    #es的访问地址:端口

```

配置 /data/elk/logstash/pipeline/logstash.conf

```shell
# Beats -> Logstash -> Elasticsearch pipeline.

input {
  beats {
    port => 5044
  }
}

filter {
    grok {
        match => {
            "message" => "%{DATA:logtime}\|\|%{DATA:thread}\|\|%{DATA:level}\|\|%{DATA:traceId}\|\|%{DATA:uid}\|\|%{DATA:class}\|\|%{GREEDYDATA:msg}"
        }
    }


   date {
     match        => [ "logtime" , "dd/MMM/YYYY:HH:mm:ss Z", "UNIX", "yyyy-MM-dd HH:mm:ss", "dd-MMM-yyyy HH:mm:ss","yyyy-MM-dd HH:mm:ss.SSS" ]
     target       => "@timestamp"
   }

   mutate{
        remove_field => ["host"]
        remove_field => ["agent"]
        remove_field => ["ecs"]
        remove_field => ["tags"]
        remove_field => ["fields"]
        remove_field => ["@version"]
        remove_field => ["input"]
        remove_field => ["log"]
    }
}

output {

  elasticsearch {
        hosts => ["http://localhost:9200"]
        user => "elastic"
        password => "123456"  # 密钥 
        index => "bbw-%{+YYYY.MM.dd}"
  }

 # stdout {
 #   codec => rubydebug
 # }
}


```

### docker容器配置并启动

```shell

version: '3.1'
services:
  logstash:
    image: logstash:7.17.15
    container_name: logstash
    volumes:
      - /etc/localtime:/etc/localtime
      - /data/elk/logstash/config:/usr/share/logstash/config:rw
      - /data/elk/logstash/data:/usr/share/logstash/data:rw
      - /data/elk/logstash/pipeline:/usr/share/logstash/pipeline:rw
    ports:
      - 5044:5044

```

启动容器 docker-compose up

### filebeat配置

```shell
docker run --name filebeat -d filebeat:7.17.15


```










