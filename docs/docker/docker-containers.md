# Docker容器管理

## 什么是Docker容器

Docker容器是Docker镜像的运行实例，是一个可执行的软件包，包含运行应用程序所需的一切：代码、运行时环境、系统工具、系统库和设置。容器将应用程序与其环境隔离开来，确保它可以在任何地方以相同的方式工作。

## 容器与虚拟机的区别

| 特性 | 容器 | 虚拟机 |
|------|------|--------|
| 启动时间 | 秒级 | 分钟级 |
| 占用资源 | 轻量级（MB） | 重量级（GB） |
| 隔离级别 | 进程级隔离 | 硬件级隔离 |
| 操作系统 | 共享宿主机内核 | 独立操作系统 |
| 数量 | 单机可运行数千个 | 单机通常几十个 |
| 性能 | 接近原生 | 有一定损耗 |

## 容器生命周期

![容器生命周期](https://docs.docker.com/engine/images/architecture.svg)

Docker容器的生命周期包括以下状态：

- **created**：已创建但未启动
- **running**：正在运行
- **paused**：暂停运行
- **stopped**：已停止运行
- **deleted**：已删除

## 容器基本操作

### 创建和运行容器

```bash
# 创建并启动容器（前台运行）
docker run nginx

# 创建并启动容器（后台运行）
docker run -d nginx

# 指定容器名称
docker run -d --name webserver nginx

# 端口映射
docker run -d -p 8080:80 nginx

# 环境变量
docker run -d -e MYSQL_ROOT_PASSWORD=password mysql

# 挂载卷
docker run -d -v /host/path:/container/path nginx

# 使用网络
docker run -d --network my-network nginx
```

### 查看容器

```bash
# 查看运行中的容器
docker ps

# 查看所有容器（包括已停止的）
docker ps -a

# 查看最近创建的容器
docker ps -n 5

# 只显示容器ID
docker ps -q

# 查看容器详细信息
docker inspect container_id

# 查看容器日志
docker logs container_id

# 实时查看日志
docker logs -f container_id

# 查看容器内进程
docker top container_id

# 查看容器资源使用情况
docker stats container_id
```

### 容器控制操作

```bash
# 启动容器
docker start container_id

# 停止容器
docker stop container_id

# 重启容器
docker restart container_id

# 暂停容器
docker pause container_id

# 恢复容器
docker unpause container_id

# 强制停止容器
docker kill container_id
```

### 容器交互操作

```bash
# 在运行中的容器内执行命令
docker exec -it container_id /bin/bash

# 在新容器中启动交互式shell
docker run -it ubuntu /bin/bash

# 将文件从主机复制到容器
docker cp /host/path/file container_id:/container/path/

# 将文件从容器复制到主机
docker cp container_id:/container/path/file /host/path/
```

### 容器清理操作

```bash
# 删除容器
docker rm container_id

# 强制删除运行中的容器
docker rm -f container_id

# 删除所有已停止的容器
docker container prune

# 删除所有容器（包括运行中的）
docker rm -f $(docker ps -aq)
```

## 容器资源管理

### 限制CPU资源

```bash
# 限制CPU使用率（最多使用2个CPU核心）
docker run -d --cpus=2 nginx

# 指定CPU核心使用权重
docker run -d --cpu-shares=512 nginx

# 指定使用特定的CPU核心
docker run -d --cpuset-cpus=0,1 nginx
```

### 限制内存资源

```bash
# 限制内存使用（最多使用512MB）
docker run -d --memory=512m nginx

# 限制内存和交换空间
docker run -d --memory=512m --memory-swap=1g nginx

# 设置内存预留
docker run -d --memory=512m --memory-reservation=256m nginx
```

### 限制IO资源

```bash
# 限制读写速度
docker run -d --device-read-bps=/dev/sda:1mb --device-write-bps=/dev/sda:1mb nginx

# 限制读写IOPS
docker run -d --device-read-iops=/dev/sda:1000 --device-write-iops=/dev/sda:1000 nginx
```

## 容器网络配置

### 网络模式

Docker提供了多种网络模式：

- **bridge**：默认网络模式，容器通过网桥连接
- **host**：容器共享宿主机网络命名空间
- **none**：容器没有网络连接
- **container**：容器共享其他容器的网络命名空间
- **自定义网络**：用户创建的网络

```bash
# 使用桥接网络
docker run -d --network bridge nginx

# 使用主机网络
docker run -d --network host nginx

# 不使用网络
docker run -d --network none nginx

# 共享其他容器的网络
docker run -d --network container:container_id nginx
```

### 创建自定义网络

```bash
# 创建桥接网络
docker network create my-network

# 创建具有特定子网和网关的网络
docker network create --subnet=172.18.0.0/16 --gateway=172.18.0.1 my-network

# 创建使用特定驱动的网络
docker network create --driver overlay my-network
```

### 网络管理命令

```bash
# 列出所有网络
docker network ls

# 查看网络详情
docker network inspect my-network

# 将容器连接到网络
docker network connect my-network container_id

# 断开容器与网络的连接
docker network disconnect my-network container_id

# 删除网络
docker network rm my-network

# 删除所有未使用的网络
docker network prune
```

## 容器数据管理

### 数据卷（Volumes）

数据卷是Docker管理的宿主机文件系统的一部分，由Docker管理。

```bash
# 创建数据卷
docker volume create my-volume

# 使用数据卷运行容器
docker run -d -v my-volume:/container/path nginx

# 查看所有数据卷
docker volume ls

# 查看数据卷详情
docker volume inspect my-volume

# 删除数据卷
docker volume rm my-volume

# 删除所有未使用的数据卷
docker volume prune
```

### 绑定挂载（Bind Mounts）

绑定挂载是将宿主机上的文件或目录挂载到容器中。

```bash
# 使用绑定挂载运行容器
docker run -d -v /host/path:/container/path nginx

# 使用只读绑定挂载
docker run -d -v /host/path:/container/path:ro nginx

# 使用新语法进行绑定挂载
docker run -d --mount type=bind,source=/host/path,target=/container/path nginx
```

### tmpfs挂载

tmpfs挂载在容器内存中创建临时文件系统。

```bash
# 使用tmpfs挂载
docker run -d --tmpfs /container/path nginx

# 指定tmpfs选项
docker run -d --tmpfs /container/path:rw,noexec,nosuid,size=100m nginx

# 使用新语法进行tmpfs挂载
docker run -d --mount type=tmpfs,destination=/container/path nginx
```

## 容器编排与扩展

### Docker Compose

Docker Compose是用于定义和运行多容器Docker应用程序的工具。

```yaml
# docker-compose.yml示例
version: '3'
services:
  web:
    image: nginx
    ports:
      - "80:80"
    volumes:
      - ./html:/usr/share/nginx/html
    depends_on:
      - db
  db:
    image: mysql
    environment:
      MYSQL_ROOT_PASSWORD: example
```

```bash
# 启动所有服务
docker-compose up -d

# 停止所有服务
docker-compose down

# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs

# 扩展服务实例数量
docker-compose up -d --scale web=3
```

### Docker Swarm

Docker Swarm是Docker的原生集群管理工具。

```bash
# 初始化Swarm集群
docker swarm init --advertise-addr <MANAGER-IP>

# 创建服务
docker service create --replicas 3 --name web nginx

# 查看服务
docker service ls

# 查看服务详情
docker service inspect web

# 查看服务任务
docker service ps web

# 扩展服务
docker service scale web=5

# 更新服务
docker service update --image nginx:1.19 web

# 删除服务
docker service rm web
```

## 容器监控与日志

### 监控容器

```bash
# 查看容器资源使用情况
docker stats

# 查看特定容器的资源使用情况
docker stats container_id

# 使用cAdvisor监控容器
docker run -d --name=cadvisor \
  -p 8080:8080 \
  --volume=/:/rootfs:ro \
  --volume=/var/run:/var/run:ro \
  --volume=/sys:/sys:ro \
  --volume=/var/lib/docker/:/var/lib/docker:ro \
  --volume=/dev/disk/:/dev/disk:ro \
  google/cadvisor:latest
```

### 容器日志管理

```bash
# 查看容器日志
docker logs container_id

# 查看最近的日志
docker logs --tail 100 container_id

# 实时查看日志
docker logs -f container_id

# 查看带时间戳的日志
docker logs -t container_id

# 限制日志大小和文件数量
docker run -d --log-driver json-file --log-opt max-size=10m --log-opt max-file=3 nginx
```

## 容器安全最佳实践

1. **使用非root用户运行容器**

```dockerfile
FROM nginx:latest
RUN groupadd -r appgroup && useradd -r -g appgroup appuser
USER appuser
```

2. **限制容器资源**

```bash
docker run -d --cpus=0.5 --memory=512m nginx
```

3. **使用只读文件系统**

```bash
docker run -d --read-only nginx
```

4. **使用安全计算模式（seccomp）**

```bash
docker run -d --security-opt seccomp=/path/to/seccomp/profile.json nginx
```

5. **禁用特权模式**

```bash
# 不要使用
docker run --privileged nginx

# 如果需要特定权限，使用cap-add
docker run --cap-add NET_ADMIN nginx
```

6. **定期更新镜像**

```bash
docker pull nginx:latest
```

7. **使用内容信任**

```bash
export DOCKER_CONTENT_TRUST=1
docker pull nginx:latest
```

## 容器故障排查

### 常见问题与解决方案

1. **容器无法启动**
   - 检查日志：`docker logs container_id`
   - 检查配置：`docker inspect container_id`
   - 检查资源限制：确保有足够的CPU、内存资源

2. **容器网络问题**
   - 检查网络配置：`docker network inspect network_name`
   - 检查端口映射：`docker port container_id`
   - 使用网络调试工具：`docker run --net container:container_id nicolaka/netshoot`

3. **容器性能问题**
   - 监控资源使用：`docker stats container_id`
   - 检查日志是否有错误
   - 考虑增加资源限制或优化应用

### 调试技巧

```bash
# 在运行中的容器内执行命令
docker exec -it container_id /bin/bash

# 查看容器内进程
docker top container_id

# 查看容器事件
docker events --filter container=container_id

# 导出容器文件系统
docker export container_id > container.tar

# 查看容器差异
docker diff container_id
```

## 总结

Docker容器是轻量级、可移植的应用运行环境，通过合理管理容器，可以显著提高应用的部署效率和可靠性。掌握容器的基本操作、资源管理、网络配置和数据管理等方面的知识，对于高效使用Docker至关重要。

## 下一步学习

- [Docker网络配置](./docker-network.md)
- [Docker数据卷管理](./docker-volumes.md)
- [Docker Compose详解](./docker-compose.md)
- [Docker Swarm集群](./docker-swarm.md)