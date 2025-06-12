# Linux上搭建ElasticSearch-8.x集群以及安装Kibana

## 前言

ElasticSearch是一个分布式、RESTful风格的搜索和数据分析引擎，能够解决不断涌现出的各种用例。作为Elastic Stack的核心，它集中存储您的数据，帮助您发现意料之中以及意料之外的情况。

本文将详细介绍如何在Linux环境下搭建ElasticSearch 8.x版本的集群，并安装配置Kibana进行可视化管理。

## 环境准备

### 系统要求

- Linux操作系统（CentOS 7/8、Ubuntu 18.04/20.04等）
- JDK 17或更高版本（ElasticSearch 8.x要求）
- 至少2GB RAM（生产环境建议8GB以上）
- 足够的磁盘空间

### 服务器配置

本教程使用3台服务器搭建集群，配置如下：

| 服务器IP | 主机名 | 角色 |
| --- | --- | --- |
| 192.168.1.101 | es-master | 主节点 |
| 192.168.1.102 | es-data1 | 数据节点 |
| 192.168.1.103 | es-data2 | 数据节点 |

## 安装ElasticSearch

### 1. 下载ElasticSearch

在所有节点上执行以下命令，下载ElasticSearch 8.x版本：

```bash
wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-8.9.0-linux-x86_64.tar.gz
wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-8.9.0-linux-x86_64.tar.gz.sha512
shasum -a 512 -c elasticsearch-8.9.0-linux-x86_64.tar.gz.sha512
tar -xzf elasticsearch-8.9.0-linux-x86_64.tar.gz
cd elasticsearch-8.9.0/
```

### 2. 创建ElasticSearch用户

ElasticSearch不能以root用户运行，需要创建专门的用户：

```bash
sudo useradd elastic
sudo passwd elastic
sudo chown -R elastic:elastic elasticsearch-8.9.0
```

### 3. 修改系统配置

#### 增加文件描述符限制

```bash
sudo vim /etc/security/limits.conf
```

添加以下内容：

```
elastic soft nofile 65535
elastic hard nofile 65535
```

#### 修改虚拟内存配置

```bash
sudo vim /etc/sysctl.conf
```

添加以下内容：

```
vm.max_map_count=262144
```

应用配置：

```bash
sudo sysctl -p
```

### 4. 配置ElasticSearch

#### 主节点配置 (192.168.1.101)

```bash
cd elasticsearch-8.9.0/
vi config/elasticsearch.yml
```

配置内容：

```yaml
# 集群名称
cluster.name: es-cluster

# 节点名称
node.name: es-master

# 是否可以成为主节点
node.master: true

# 是否存储数据
node.data: false

# 网络设置
network.host: 192.168.1.101
http.port: 9200
transport.port: 9300

# 集群发现设置
discovery.seed_hosts: ["192.168.1.101:9300", "192.168.1.102:9300", "192.168.1.103:9300"]
cluster.initial_master_nodes: ["es-master"]

# 跨域设置
http.cors.enabled: true
http.cors.allow-origin: "*"

# 禁用安全设置（仅用于测试环境，生产环境请配置适当的安全措施）
xpack.security.enabled: false
xpack.security.enrollment.enabled: false
xpack.security.http.ssl.enabled: false
xpack.security.transport.ssl.enabled: false
```

#### 数据节点1配置 (192.168.1.102)

```yaml
# 集群名称
cluster.name: es-cluster

# 节点名称
node.name: es-data1

# 是否可以成为主节点
node.master: false

# 是否存储数据
node.data: true

# 网络设置
network.host: 192.168.1.102
http.port: 9200
transport.port: 9300

# 集群发现设置
discovery.seed_hosts: ["192.168.1.101:9300", "192.168.1.102:9300", "192.168.1.103:9300"]
cluster.initial_master_nodes: ["es-master"]

# 跨域设置
http.cors.enabled: true
http.cors.allow-origin: "*"

# 禁用安全设置（仅用于测试环境，生产环境请配置适当的安全措施）
xpack.security.enabled: false
xpack.security.enrollment.enabled: false
xpack.security.http.ssl.enabled: false
xpack.security.transport.ssl.enabled: false
```

#### 数据节点2配置 (192.168.1.103)

```yaml
# 集群名称
cluster.name: es-cluster

# 节点名称
node.name: es-data2

# 是否可以成为主节点
node.master: false

# 是否存储数据
node.data: true

# 网络设置
network.host: 192.168.1.103
http.port: 9200
transport.port: 9300

# 集群发现设置
discovery.seed_hosts: ["192.168.1.101:9300", "192.168.1.102:9300", "192.168.1.103:9300"]
cluster.initial_master_nodes: ["es-master"]

# 跨域设置
http.cors.enabled: true
http.cors.allow-origin: "*"

# 禁用安全设置（仅用于测试环境，生产环境请配置适当的安全措施）
xpack.security.enabled: false
xpack.security.enrollment.enabled: false
xpack.security.http.ssl.enabled: false
xpack.security.transport.ssl.enabled: false
```

### 5. 启动ElasticSearch

在所有节点上执行以下命令启动ElasticSearch：

```bash
su - elastic
cd elasticsearch-8.9.0/
./bin/elasticsearch -d
```

### 6. 验证集群状态

```bash
curl -X GET "http://192.168.1.101:9200/_cluster/health?pretty"
```

正常情况下，应该看到类似以下输出：

```json
{
  "cluster_name" : "es-cluster",
  "status" : "green",
  "timed_out" : false,
  "number_of_nodes" : 3,
  "number_of_data_nodes" : 2,
  "active_primary_shards" : 0,
  "active_shards" : 0,
  "relocating_shards" : 0,
  "initializing_shards" : 0,
  "unassigned_shards" : 0,
  "delayed_unassigned_shards" : 0,
  "number_of_pending_tasks" : 0,
  "number_of_in_flight_fetch" : 0,
  "task_max_waiting_in_queue_millis" : 0,
  "active_shards_percent_as_number" : 100.0
}
```

## 安装Kibana

### 1. 下载Kibana

在主节点（192.168.1.101）上执行以下命令：

```bash
wget https://artifacts.elastic.co/downloads/kibana/kibana-8.9.0-linux-x86_64.tar.gz
wget https://artifacts.elastic.co/downloads/kibana/kibana-8.9.0-linux-x86_64.tar.gz.sha512
shasum -a 512 -c kibana-8.9.0-linux-x86_64.tar.gz.sha512
tar -xzf kibana-8.9.0-linux-x86_64.tar.gz
cd kibana-8.9.0/
```

### 2. 配置Kibana

```bash
vi config/kibana.yml
```

配置内容：

```yaml
# 服务器主机名
server.host: "192.168.1.101"

# Kibana服务端口
server.port: 5601

# ElasticSearch连接设置
elasticsearch.hosts: ["http://192.168.1.101:9200"]

# 禁用安全设置（仅用于测试环境，生产环境请配置适当的安全措施）
elasticsearch.ssl.verificationMode: none
xpack.security.enabled: false
```

### 3. 启动Kibana

```bash
./bin/kibana &
```

### 4. 访问Kibana

在浏览器中访问：`http://192.168.1.101:5601`

## 安全配置（生产环境）

对于生产环境，强烈建议启用安全功能。以下是基本的安全配置步骤：

### 1. 启用X-Pack安全功能

修改所有节点的`elasticsearch.yml`：

```yaml
xpack.security.enabled: true
xpack.security.enrollment.enabled: true
xpack.security.http.ssl.enabled: true
xpack.security.transport.ssl.enabled: true
```

### 2. 设置内置用户密码

```bash
./bin/elasticsearch-setup-passwords interactive
```

### 3. 配置Kibana连接安全的ElasticSearch

```yaml
elasticsearch.username: "kibana_system"
elasticsearch.password: "your_password"
```

## 集群维护

### 添加新节点

1. 在新节点上安装ElasticSearch
2. 配置`elasticsearch.yml`，确保`cluster.name`与现有集群一致
3. 设置`discovery.seed_hosts`包含现有集群节点
4. 启动新节点，它将自动加入集群

### 集群扩容

随着数据量增长，可能需要扩展集群：

1. 添加更多数据节点
2. 调整分片数量和副本数量
3. 考虑使用热-温-冷架构管理数据生命周期

## 常见问题排查

### 集群状态为黄色或红色

- 黄色：部分副本分片未分配
- 红色：部分主分片未分配

解决方法：

```bash
# 查看未分配分片的原因
GET /_cluster/allocation/explain

# 检查集群健康状态
GET /_cluster/health?pretty

# 检查节点状态
GET /_cat/nodes?v
```

### JVM内存问题

调整`jvm.options`文件中的堆内存设置：

```
-Xms4g
-Xmx4g
```

## 结论

通过本教程，我们成功在Linux环境下搭建了ElasticSearch 8.x集群，并安装配置了Kibana进行可视化管理。ElasticSearch集群为大规模数据搜索和分析提供了强大的基础，而Kibana则提供了直观的界面来监控和管理集群。

在生产环境中，还需要考虑更多因素，如安全性、高可用性、备份策略等，以确保集群的稳定运行。