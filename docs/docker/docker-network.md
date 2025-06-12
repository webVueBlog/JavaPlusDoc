# Docker网络配置

## Docker网络架构

Docker使用插件化的网络架构，称为Container Network Model (CNM)。这种架构允许用户选择或替换Docker的网络驱动，以满足应用程序的需求。Docker内置了多种网络驱动，同时也支持网络插件。

### 网络架构组件

- **沙盒（Sandbox）**：包含容器网络栈的配置，如网络接口、路由表和DNS设置
- **端点（Endpoint）**：将沙盒连接到网络的接口
- **网络（Network）**：可以相互通信的端点集合

## Docker默认网络

当安装Docker时，它会自动创建三个网络：

```bash
$ docker network ls
NETWORK ID     NAME      DRIVER    SCOPE
9f6ae26fcaa1   bridge    bridge    local
82b9c4d3e5a6   host      host      local
33204c3f9584   none      null      local
```

### bridge网络

- 默认网络，新创建的容器会自动连接到此网络
- 在宿主机上创建一个名为`docker0`的网桥
- 容器可以通过此网桥相互通信，也可以访问外部网络

```bash
# 查看bridge网络详情
docker network inspect bridge
```

### host网络

- 容器共享宿主机的网络命名空间
- 容器直接使用宿主机的IP地址和端口
- 没有网络隔离，但性能较好

```bash
# 使用host网络启动容器
docker run -d --network host nginx
```

### none网络

- 容器没有网络接口
- 完全隔离的网络环境
- 适用于不需要网络的应用或自定义网络设置

```bash
# 使用none网络启动容器
docker run -d --network none nginx
```

## 自定义网络

Docker允许用户创建自定义网络，以满足特定的网络需求。

### 创建自定义网络

```bash
# 创建基本的桥接网络
docker network create my-network

# 创建具有特定子网和网关的网络
docker network create --subnet=172.20.0.0/16 --gateway=172.20.0.1 my-network

# 创建使用特定驱动的网络
docker network create --driver overlay my-network

# 创建具有IP范围的网络
docker network create --subnet=172.20.0.0/16 --ip-range=172.20.5.0/24 my-network

# 创建具有自定义选项的网络
docker network create --opt com.docker.network.bridge.name=my-bridge my-network
```

### 网络驱动类型

1. **bridge**：默认的网络驱动，适用于单机环境中的容器

```bash
docker network create --driver bridge my-bridge
```

2. **overlay**：用于Docker Swarm服务，允许跨多个Docker守护进程的容器通信

```bash
docker network create --driver overlay my-overlay
```

3. **macvlan**：允许为容器分配MAC地址，使其在网络上显示为物理设备

```bash
docker network create --driver macvlan \
  --subnet=192.168.0.0/24 \
  --gateway=192.168.0.1 \
  -o parent=eth0 my-macvlan
```

4. **ipvlan**：类似于macvlan，但共享MAC地址

```bash
docker network create --driver ipvlan \
  --subnet=192.168.0.0/24 \
  --gateway=192.168.0.1 \
  -o parent=eth0 my-ipvlan
```

5. **host**：使用宿主机网络

6. **none**：禁用容器网络

## 容器网络操作

### 连接容器到网络

```bash
# 创建容器时连接到网络
docker run -d --name web --network my-network nginx

# 将现有容器连接到网络
docker network connect my-network container_id

# 连接到网络并指定IP地址
docker network connect --ip 172.20.5.10 my-network container_id

# 连接到多个网络
docker network connect my-network2 container_id
```

### 断开容器与网络的连接

```bash
docker network disconnect my-network container_id

# 强制断开连接
docker network disconnect -f my-network container_id
```

### 查看容器网络配置

```bash
# 查看容器网络设置
docker inspect --format='{{json .NetworkSettings.Networks}}' container_id

# 查看容器IP地址
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' container_id

# 查看容器端口映射
docker port container_id
```

## 端口映射

端口映射允许外部访问容器内的服务。

### 基本端口映射

```bash
# 映射特定端口
docker run -d -p 8080:80 nginx

# 映射所有端口
docker run -d -P nginx

# 映射到特定IP地址
docker run -d -p 127.0.0.1:8080:80 nginx

# 映射到随机端口
docker run -d -p 127.0.0.1::80 nginx

# 映射UDP端口
docker run -d -p 8080:80/udp nginx
```

### 查看端口映射

```bash
# 查看容器的端口映射
docker port container_id

# 查看所有容器的端口映射
docker ps
```

## 容器间通信

### 同一网络中的容器通信

在同一自定义网络中的容器可以通过容器名称相互访问。

```bash
# 创建网络
docker network create my-network

# 创建容器并连接到网络
docker run -d --name web --network my-network nginx
docker run -d --name db --network my-network mysql:5.7

# web容器可以通过名称访问db容器
docker exec -it web ping db
```

### 不同网络中的容器通信

容器可以连接到多个网络，以便与不同网络中的容器通信。

```bash
# 创建两个网络
docker network create frontend
docker network create backend

# 创建容器并连接到各自的网络
docker run -d --name web --network frontend nginx
docker run -d --name db --network backend mysql:5.7

# 将web容器也连接到backend网络
docker network connect backend web

# 现在web容器可以访问db容器
docker exec -it web ping db
```

## DNS和服务发现

Docker内置了DNS服务器，用于容器名称解析。

### 容器DNS配置

```bash
# 查看容器DNS配置
docker exec container_id cat /etc/resolv.conf

# 自定义DNS服务器
docker run -d --dns 8.8.8.8 --dns 8.8.4.4 nginx

# 自定义DNS搜索域
docker run -d --dns-search example.com nginx

# 添加DNS选项
docker run -d --dns-opt timeout:3 nginx
```

### 服务发现

在Docker Swarm模式下，Docker提供了内置的服务发现功能。

```bash
# 创建服务
docker service create --name web --replicas 3 --network my-overlay nginx

# 其他服务可以通过服务名访问
docker service create --name client --network my-overlay busybox ping web
```

## 网络安全

### 网络隔离

```bash
# 创建隔离网络
docker network create --internal isolated-network

# 在隔离网络中启动容器（无法访问外部网络）
docker run -d --network isolated-network nginx
```

### 限制容器网络功能

```bash
# 禁止容器修改iptables规则
docker run -d --cap-drop NET_ADMIN nginx

# 允许容器配置网络
docker run -d --cap-add NET_ADMIN nginx
```

### 使用网络策略

在Kubernetes等编排系统中，可以使用网络策略来控制容器间的通信。

## 网络故障排查

### 常见问题与解决方案

1. **容器无法连接到外部网络**
   - 检查宿主机网络配置
   - 确认Docker网络配置正确
   - 检查防火墙规则

2. **容器间无法通信**
   - 确保容器在同一网络中
   - 检查网络驱动是否支持容器间通信
   - 验证容器网络配置

3. **端口映射不工作**
   - 确认端口映射配置正确
   - 检查宿主机防火墙是否允许该端口
   - 验证应用是否在容器内正确监听

### 调试工具和命令

```bash
# 使用网络调试容器
docker run -it --network container:container_id nicolaka/netshoot

# 查看网络接口
docker exec container_id ip addr

# 测试网络连接
docker exec container_id ping google.com

# 查看路由表
docker exec container_id route

# 查看iptables规则
docker exec container_id iptables -L

# 跟踪网络路径
docker exec container_id traceroute google.com
```

## 高级网络配置

### 自定义网络插件

Docker支持第三方网络插件，如Calico、Weave和Flannel等。

```bash
# 安装网络插件
docker plugin install <plugin-name>

# 使用网络插件创建网络
docker network create --driver <plugin-name> my-network
```

### 配置Docker守护进程网络

可以通过修改Docker守护进程配置来自定义默认网络设置。

```json
// /etc/docker/daemon.json
{
  "bip": "192.168.1.1/24",
  "fixed-cidr": "192.168.1.0/25",
  "fixed-cidr-v6": "2001:db8::/64",
  "mtu": 1500,
  "default-gateway": "192.168.1.254",
  "default-gateway-v6": "2001:db8::ff",
  "dns": ["8.8.8.8", "8.8.4.4"]
}
```

### 使用IPv6

```bash
# 启用IPv6支持
// /etc/docker/daemon.json
{
  "ipv6": true,
  "fixed-cidr-v6": "2001:db8:1::/64"
}

# 创建支持IPv6的网络
docker network create --ipv6 --subnet=2001:db8:1::/64 ipv6-network

# 启动支持IPv6的容器
docker run -d --network ipv6-network nginx
```

## Docker网络在生产环境中的最佳实践

1. **使用自定义网络**
   - 避免使用默认bridge网络
   - 为不同应用创建独立的网络

2. **合理规划网络地址空间**
   - 避免与现有网络冲突
   - 预留足够的IP地址空间

3. **使用overlay网络进行集群通信**
   - 在Docker Swarm中使用overlay网络
   - 配置加密的overlay网络提高安全性

4. **限制容器网络访问**
   - 只映射必要的端口
   - 使用内部网络隔离敏感服务

5. **监控网络性能**
   - 使用工具监控网络流量和性能
   - 定期检查网络配置

6. **使用服务发现**
   - 在微服务架构中使用服务发现
   - 考虑使用外部服务发现工具

## Docker网络与云平台集成

### AWS

```bash
# 使用AWS VPC驱动
docker network create --driver=overlay \
  --attachable \
  --opt com.docker.network.driver.mtu=9001 \
  my-aws-network
```

### Azure

```bash
# 使用Azure VNET集成
docker network create --driver=overlay \
  --subnet=10.0.0.0/16 \
  --opt com.docker.network.driver.mtu=1500 \
  my-azure-network
```

### Google Cloud

```bash
# 使用GCP网络
docker network create --driver=overlay \
  --subnet=10.0.0.0/16 \
  my-gcp-network
```

## 总结

Docker网络提供了灵活的容器通信解决方案，从简单的单机桥接网络到复杂的多主机overlay网络。通过合理配置Docker网络，可以构建安全、高效的容器化应用架构。

## 下一步学习

- [Docker数据卷管理](./docker-volumes.md)
- [Docker Compose详解](./docker-compose.md)
- [Docker Swarm集群](./docker-swarm.md)
- [Kubernetes网络](./kubernetes-network.md)