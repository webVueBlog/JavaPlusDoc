# Docker Swarm集群

## 什么是Docker Swarm

Docker Swarm是Docker的原生集群管理工具，它将多个Docker主机组合成一个虚拟的Docker主机，提供标准的Docker API，使得应用可以像在单个Docker主机上一样被部署到Swarm集群中。

Docker Swarm的主要特点：

- **分布式设计**：内置分布式设计，无单点故障
- **声明式服务模型**：使用声明式API定义服务的期望状态
- **服务扩展**：可以轻松扩展或缩减服务实例数量
- **服务发现**：内置服务发现机制，自动为服务分配DNS名称
- **负载均衡**：自动为服务提供负载均衡
- **滚动更新**：支持服务的滚动更新和回滚
- **安全通信**：节点间通信采用TLS加密，提供自动密钥轮换功能

## Swarm架构

### 节点类型

Swarm集群由两种类型的节点组成：

1. **管理节点（Manager Node）**：
   - 维护集群状态
   - 调度服务
   - 提供Swarm API
   - 可以配置为高可用模式（通常建议3、5或7个管理节点）

2. **工作节点（Worker Node）**：
   - 执行容器
   - 不参与集群管理决策
   - 可以根据需要扩展

### 核心概念

- **节点（Node）**：参与Swarm集群的Docker引擎实例
- **服务（Service）**：在Swarm上运行的任务的定义
- **任务（Task）**：调度到节点上的Docker容器实例
- **堆栈（Stack）**：一组相关服务，通常通过Compose文件定义

## 创建和管理Swarm集群

### 初始化Swarm集群

```bash
# 初始化一个新的Swarm集群（在管理节点上执行）
docker swarm init --advertise-addr <MANAGER-IP>

# 输出将显示加入集群的命令，例如：
# docker swarm join --token SWMTKN-1-49nj1cmql0jkz5s954yi3oex3nedyz0fb0xx14ie39trti4wxv-8vxv8rssmk743ojnwacrr2e7c 192.168.99.100:2377
```

### 添加节点到集群

```bash
# 获取加入集群的命令（在管理节点上执行）
# 获取工作节点的加入命令
docker swarm join-token worker

# 获取管理节点的加入命令
docker swarm join-token manager

# 在新节点上执行加入命令
docker swarm join --token <TOKEN> <MANAGER-IP>:2377
```

### 查看集群信息

```bash
# 查看集群中的节点
docker node ls

# 查看节点详细信息
docker node inspect <NODE-ID>

# 以可读格式查看节点信息
docker node inspect --pretty <NODE-ID>
```

### 管理节点

```bash
# 提升工作节点为管理节点
docker node promote <NODE-ID>

# 降级管理节点为工作节点
docker node demote <NODE-ID>

# 更新节点
docker node update <NODE-ID>

# 设置节点可用性
docker node update --availability active|pause|drain <NODE-ID>

# 添加节点标签
docker node update --label-add datacenter=east <NODE-ID>

# 删除节点
docker node rm <NODE-ID>
```

### 离开Swarm集群

```bash
# 在工作节点上执行
docker swarm leave

# 在管理节点上执行（强制离开）
docker swarm leave --force
```

## 服务管理

### 创建服务

```bash
# 创建基本服务
docker service create --name my-web nginx

# 创建带端口映射的服务
docker service create --name my-web --publish 8080:80 nginx

# 创建带环境变量的服务
docker service create --name my-db \
  --env MYSQL_ROOT_PASSWORD=secret \
  --env MYSQL_DATABASE=mydb \
  mysql:5.7

# 创建带卷的服务
docker service create --name my-db \
  --mount type=volume,source=db-data,target=/var/lib/mysql \
  mysql:5.7

# 创建带约束的服务
docker service create --name my-web \
  --constraint node.role==worker \
  --constraint node.labels.datacenter==east \
  nginx

# 创建带资源限制的服务
docker service create --name my-web \
  --limit-cpu 0.5 \
  --limit-memory 512M \
  nginx
```

### 查看服务信息

```bash
# 列出所有服务
docker service ls

# 查看服务详细信息
docker service inspect <SERVICE-ID>

# 以可读格式查看服务信息
docker service inspect --pretty <SERVICE-ID>

# 查看服务日志
docker service logs <SERVICE-ID>

# 查看服务任务
docker service ps <SERVICE-ID>
```

### 更新服务

```bash
# 更新服务镜像
docker service update --image nginx:1.19 my-web

# 扩展服务实例数量
docker service scale my-web=5

# 或者使用update命令扩展
docker service update --replicas 5 my-web

# 更新端口映射
docker service update --publish-add 8081:80 my-web

# 更新环境变量
docker service update --env-add NODE_ENV=production my-web

# 更新挂载
docker service update --mount-add type=volume,source=new-data,target=/data my-web

# 配置滚动更新策略
docker service update \
  --update-parallelism 2 \
  --update-delay 10s \
  my-web

# 回滚服务更新
docker service update --rollback my-web
```

### 删除服务

```bash
# 删除服务
docker service rm my-web
```

## 使用Docker Stack部署应用

Docker Stack允许使用Compose文件格式在Swarm上部署完整的应用程序堆栈。

### 创建堆栈文件

`docker-stack.yml`：

```yaml
version: '3.8'

services:
  web:
    image: nginx:latest
    ports:
      - "80:80"
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
      placement:
        constraints:
          - node.role == worker
  
  visualizer:
    image: dockersamples/visualizer
    ports:
      - "8080:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    deploy:
      placement:
        constraints:
          - node.role == manager

networks:
  webnet:

volumes:
  data-volume:
```

### 部署堆栈

```bash
# 部署堆栈
docker stack deploy -c docker-stack.yml my-app

# 列出所有堆栈
docker stack ls

# 列出堆栈中的服务
docker stack services my-app

# 列出堆栈中的任务
docker stack ps my-app

# 删除堆栈
docker stack rm my-app
```

## Swarm网络

Swarm模式提供了多种网络驱动，用于不同的网络需求。

### 覆盖网络（Overlay Network）

覆盖网络允许不同节点上的容器相互通信。

```bash
# 创建覆盖网络
docker network create --driver overlay my-network

# 创建加密的覆盖网络
docker network create --driver overlay --opt encrypted my-secure-network

# 创建服务并连接到覆盖网络
docker service create --name my-web --network my-network nginx
```

### 入口网络（Ingress Network）

入口网络是一个特殊的覆盖网络，用于服务的负载均衡和路由网格。

```bash
# 查看入口网络
docker network ls --filter name=ingress

# 重新创建入口网络（如果需要）
docker network rm ingress
docker network create --driver overlay --ingress ingress
```

## Swarm安全

### TLS配置

Swarm使用TLS进行节点间通信加密。

```bash
# 查看当前TLS配置
docker info | grep "Swarm"

# 轮换证书（在管理节点上执行）
docker swarm ca --rotate

# 查看证书有效期
docker swarm ca --quiet --cert-expiry
```

### 使用Secrets管理敏感数据

```bash
# 从文件创建secret
echo "mypassword" | docker secret create db_password -

# 或者从文件创建
docker secret create db_password ./password.txt

# 列出secrets
docker secret ls

# 查看secret详情
docker secret inspect db_password

# 创建使用secret的服务
docker service create \
  --name db \
  --secret db_password \
  --env MYSQL_ROOT_PASSWORD_FILE=/run/secrets/db_password \
  mysql:5.7

# 删除secret
docker secret rm db_password
```

### 使用Configs管理配置文件

```bash
# 从文件创建config
docker config create nginx_conf ./nginx.conf

# 列出configs
docker config ls

# 查看config详情
docker config inspect nginx_conf

# 创建使用config的服务
docker service create \
  --name web \
  --config source=nginx_conf,target=/etc/nginx/nginx.conf \
  nginx

# 删除config
docker config rm nginx_conf
```

## 高可用性配置

### 管理节点高可用

为了实现高可用性，Swarm使用Raft共识算法，建议使用奇数个管理节点。

```bash
# 推荐的管理节点数量：
# - 3个管理节点可以容忍1个节点故障
# - 5个管理节点可以容忍2个节点故障
# - 7个管理节点可以容忍3个节点故障

# 添加管理节点
docker swarm join-token manager
# 然后在新节点上执行返回的命令
```

### 备份和恢复Swarm状态

```bash
# 备份Swarm状态（在管理节点上执行）
systemctl stop docker
tar -czvf swarm-backup.tar.gz /var/lib/docker/swarm
systemctl start docker

# 恢复Swarm状态
systemctl stop docker
rm -rf /var/lib/docker/swarm
tar -xzvf swarm-backup.tar.gz -C /var/lib/docker
systemctl start docker
```

## 监控和日志

### 服务日志

```bash
# 查看服务日志
docker service logs my-service

# 实时查看日志
docker service logs -f my-service

# 查看最近的日志
docker service logs --tail 100 my-service

# 查看特定时间段的日志
docker service logs --since 2020-01-01T00:00:00 my-service
```

### 使用Prometheus和Grafana监控Swarm

```yaml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"
    deploy:
      placement:
        constraints:
          - node.role == manager
  
  node-exporter:
    image: prom/node-exporter
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.ignored-mount-points=^/(sys|proc|dev|host|etc)($$|/)'
    deploy:
      mode: global
  
  cadvisor:
    image: google/cadvisor
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:rw
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
    ports:
      - "8080:8080"
    deploy:
      mode: global
  
  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    volumes:
      - grafana-data:/var/lib/grafana
    deploy:
      placement:
        constraints:
          - node.role == manager

volumes:
  grafana-data:
```

## 实际应用示例

### 部署Web应用和数据库

```yaml
version: '3.8'

services:
  web:
    image: nginx:latest
    ports:
      - "80:80"
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
      placement:
        constraints:
          - node.role == worker
    networks:
      - webnet
  
  api:
    image: my-api:latest
    deploy:
      replicas: 2
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
    environment:
      - DB_HOST=db
      - DB_USER=root
      - DB_PASSWORD_FILE=/run/secrets/db_password
      - DB_NAME=myapp
    networks:
      - webnet
      - dbnet
    secrets:
      - db_password
  
  db:
    image: mysql:5.7
    deploy:
      placement:
        constraints:
          - node.labels.db == true
    volumes:
      - db-data:/var/lib/mysql
    environment:
      - MYSQL_ROOT_PASSWORD_FILE=/run/secrets/db_password
      - MYSQL_DATABASE=myapp
    networks:
      - dbnet
    secrets:
      - db_password

networks:
  webnet:
  dbnet:
    driver: overlay
    internal: true

volumes:
  db-data:

secrets:
  db_password:
    external: true
```

### 蓝绿部署

```yaml
version: '3.8'

services:
  blue:
    image: myapp:1.0
    deploy:
      replicas: 3
    networks:
      - frontend
  
  green:
    image: myapp:2.0
    deploy:
      replicas: 0
    networks:
      - frontend
  
  proxy:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    deploy:
      placement:
        constraints:
          - node.role == manager
    networks:
      - frontend

networks:
  frontend:
```

蓝绿切换：

```bash
# 扩展绿色版本
docker service scale my-app_green=3

# 更新Nginx配置指向绿色版本
# ...

# 缩减蓝色版本
docker service scale my-app_blue=0
```

## 最佳实践

### 管理节点配置

1. **使用奇数个管理节点**：3、5或7个，以实现高可用性
2. **限制管理节点数量**：不要超过7个管理节点，以避免共识性能下降
3. **管理节点专用**：在生产环境中，考虑将管理节点设置为仅管理，不运行工作负载
   ```bash
   docker node update --availability drain <MANAGER-NODE-ID>
   ```

### 服务部署策略

1. **使用标签和约束**：根据节点特性分配服务
   ```bash
   # 添加标签
   docker node update --label-add ssd=true <NODE-ID>
   
   # 使用约束
   docker service create --constraint node.labels.ssd==true --name db mysql:5.7
   ```

2. **资源分配**：为服务设置资源限制
   ```bash
   docker service create --limit-cpu 0.5 --limit-memory 512M --name app myapp
   ```

3. **滚动更新**：配置适当的更新策略
   ```bash
   docker service create \
     --update-parallelism 1 \
     --update-delay 30s \
     --update-failure-action rollback \
     --name web nginx
   ```

### 网络安全

1. **使用内部网络**：对于不需要外部访问的服务
   ```bash
   docker network create --driver overlay --internal db-network
   ```

2. **加密覆盖网络**：对敏感数据传输
   ```bash
   docker network create --driver overlay --opt encrypted secure-network
   ```

3. **使用Secrets**：管理敏感信息

### 数据管理

1. **使用命名卷**：确保数据持久化
   ```bash
   docker service create \
     --mount type=volume,source=db-data,target=/var/lib/mysql \
     --name db mysql:5.7
   ```

2. **备份策略**：定期备份关键数据

3. **考虑使用外部存储**：对于关键数据，考虑使用NFS、AWS EBS等

## 常见问题与解决方案

### 节点通信问题

**问题**：节点无法加入集群或节点间通信失败

**解决方案**：
1. 检查防火墙设置，确保以下端口开放：
   - TCP 2377：集群管理通信
   - TCP/UDP 7946：节点间通信
   - UDP 4789：覆盖网络流量

2. 检查网络配置：
   ```bash
   # 查看Docker网络设置
   docker info
   
   # 重新初始化Swarm，指定正确的IP
   docker swarm init --advertise-addr <CORRECT-IP>
   ```

### 服务无法启动

**问题**：服务创建后无法启动或处于准备状态

**解决方案**：
1. 检查服务日志：
   ```bash
   docker service logs <SERVICE-ID>
   ```

2. 检查任务状态：
   ```bash
   docker service ps <SERVICE-ID>
   ```

3. 检查资源约束：
   - 确保节点有足够的资源
   - 检查服务的约束条件是否有节点满足

4. 检查镜像可用性：
   - 确保所有节点都能访问镜像仓库
   - 考虑预先在节点上拉取镜像

### 负载均衡问题

**问题**：服务负载不均衡或路由网格不工作

**解决方案**：
1. 检查入口网络：
   ```bash
   docker network inspect ingress
   ```

2. 确认端口发布正确：
   ```bash
   docker service inspect --format='{{.Endpoint.Ports}}' <SERVICE-ID>
   ```

3. 尝试重新创建入口网络：
   ```bash
   docker network rm ingress
   docker network create --driver overlay --ingress ingress
   ```

### 管理节点故障

**问题**：管理节点故障或无法访问

**解决方案**：
1. 如果仍有法定数量的管理节点运行：
   - 系统将自动恢复
   - 可以移除故障节点：
     ```bash
     docker node rm --force <NODE-ID>
     ```

2. 如果失去法定数量的管理节点：
   - 需要强制恢复集群：
     ```bash
     # 在剩余的管理节点上
     docker swarm init --force-new-cluster
     ```
   - 然后添加新的管理节点恢复冗余

## 总结

Docker Swarm是一个强大的容器编排工具，提供了简单易用的集群管理功能。通过Swarm，您可以将多个Docker主机组合成一个虚拟的Docker主机，实现服务的高可用性、负载均衡和扩展。

Swarm的核心优势在于其与Docker紧密集成，使用标准Docker API，学习曲线平缓。对于中小规模的容器部署，Swarm提供了足够的功能和性能。

通过本文介绍的命令和最佳实践，您应该能够创建、管理和维护一个健壮的Docker Swarm集群，为您的应用提供可靠的运行环境。

## 下一步学习

- [Docker安全最佳实践](./docker-security.md)
- [Docker Compose详解](./docker-compose.md)
- [Docker数据卷管理](./docker-volumes.md)
- [Docker生产环境部署](./docker-production.md)