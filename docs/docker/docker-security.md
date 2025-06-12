# Docker安全最佳实践

## Docker安全概述

Docker容器技术为应用部署带来了便利，但同时也引入了新的安全挑战。Docker安全涉及多个层面，包括主机安全、镜像安全、容器运行时安全、网络安全和数据安全等。本文将详细介绍Docker环境中的安全最佳实践，帮助您构建更安全的容器化环境。

## Docker主机安全

### 操作系统加固

```bash
# 保持系统更新
sudo apt update && sudo apt upgrade -y  # Debian/Ubuntu
sudo yum update -y  # CentOS/RHEL

# 禁用不必要的服务
sudo systemctl disable <service-name>
sudo systemctl stop <service-name>

# 配置防火墙，只开放必要端口
sudo ufw allow ssh  # Ubuntu
sudo ufw allow 2376/tcp  # Docker TLS
sudo ufw allow 2377/tcp  # Swarm mode
sudo ufw allow 7946/tcp  # Swarm mode node communication
sudo ufw allow 7946/udp  # Swarm mode node communication
sudo ufw allow 4789/udp  # Swarm overlay network
sudo ufw enable

# 或使用firewalld (CentOS/RHEL)
sudo firewall-cmd --permanent --add-port=22/tcp
sudo firewall-cmd --permanent --add-port=2376/tcp
sudo firewall-cmd --permanent --add-port=2377/tcp
sudo firewall-cmd --permanent --add-port=7946/tcp
sudo firewall-cmd --permanent --add-port=7946/udp
sudo firewall-cmd --permanent --add-port=4789/udp
sudo firewall-cmd --reload
```

### Docker守护进程安全

1. **使用TLS加密Docker API通信**

创建CA和证书：
```bash
# 创建CA私钥和证书
openssl genrsa -aes256 -out ca-key.pem 4096
openssl req -new -x509 -days 365 -key ca-key.pem -sha256 -out ca.pem

# 创建服务器密钥和CSR
openssl genrsa -out server-key.pem 4096
openssl req -subj "/CN=your-server-name" -sha256 -new -key server-key.pem -out server.csr

# 配置服务器证书的扩展属性
echo subjectAltName = DNS:your-server-name,IP:10.10.10.20,IP:127.0.0.1 >> extfile.cnf
echo extendedKeyUsage = serverAuth >> extfile.cnf

# 生成服务器证书
openssl x509 -req -days 365 -sha256 -in server.csr -CA ca.pem -CAkey ca-key.pem \
  -CAcreateserial -out server-cert.pem -extfile extfile.cnf

# 创建客户端密钥和CSR
openssl genrsa -out key.pem 4096
openssl req -subj '/CN=client' -new -key key.pem -out client.csr

# 配置客户端证书的扩展属性
echo extendedKeyUsage = clientAuth > extfile-client.cnf

# 生成客户端证书
openssl x509 -req -days 365 -sha256 -in client.csr -CA ca.pem -CAkey ca-key.pem \
  -CAcreateserial -out cert.pem -extfile extfile-client.cnf

# 删除不需要的文件
rm -v client.csr server.csr extfile.cnf extfile-client.cnf

# 设置权限
chmod -v 0400 ca-key.pem key.pem server-key.pem
chmod -v 0444 ca.pem server-cert.pem cert.pem
```

2. **配置Docker守护进程**

编辑Docker配置文件 `/etc/docker/daemon.json`：
```json
{
  "tls": true,
  "tlsverify": true,
  "tlscacert": "/path/to/ca.pem",
  "tlscert": "/path/to/server-cert.pem",
  "tlskey": "/path/to/server-key.pem",
  "hosts": ["tcp://0.0.0.0:2376", "unix:///var/run/docker.sock"],
  "log-level": "info",
  "icc": false,
  "no-new-privileges": true,
  "userns-remap": "default",
  "live-restore": true,
  "userland-proxy": false,
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 64000,
      "Soft": 64000
    }
  }
}
```

3. **重启Docker服务**

```bash
sudo systemctl restart docker
```

4. **使用客户端证书连接Docker**

```bash
docker --tlsverify \
  --tlscacert=ca.pem \
  --tlscert=cert.pem \
  --tlskey=key.pem \
  -H=your-server-name:2376 version
```

### 用户权限管理

1. **创建Docker用户组**

```bash
# 创建docker组（通常安装Docker时已创建）
sudo groupadd docker

# 将用户添加到docker组
sudo usermod -aG docker $USER

# 应用更改（重新登录或运行以下命令）
newgrp docker
```

2. **限制Docker用户组权限**

```bash
# 创建专用的Docker管理员用户
sudo useradd -m dockeradmin
sudo usermod -aG docker dockeradmin

# 使用sudo授予特定命令权限
sudo visudo
# 添加以下行
dockeradmin ALL=(ALL) /usr/bin/docker
```

## 容器镜像安全

### 使用官方和验证的镜像

```bash
# 拉取官方镜像
docker pull ubuntu:20.04

# 拉取经过验证的镜像
docker pull nginx:latest

# 检查镜像签名（需要Docker Content Trust）
DOCKER_CONTENT_TRUST=1 docker pull nginx:latest
```

### 启用Docker Content Trust

```bash
# 启用Docker Content Trust
export DOCKER_CONTENT_TRUST=1

# 生成签名密钥
docker trust key generate my-key

# 将密钥添加到仓库
docker trust signer add --key my-key.pub my-key my-registry.example.com/my-image

# 签名并推送镜像
docker tag my-image:latest my-registry.example.com/my-image:latest
docker push my-registry.example.com/my-image:latest
```

### 镜像扫描和漏洞管理

1. **使用Docker Scout**

```bash
# 安装Docker Scout CLI
docker extension install docker/scout-extension

# 扫描本地镜像
docker scout cves nginx:latest

# 查看详细漏洞报告
docker scout recommendations nginx:latest
```

2. **使用第三方扫描工具**

```bash
# 使用Trivy扫描镜像
trivy image nginx:latest

# 使用Clair扫描镜像
clairctl analyze -l nginx:latest

# 使用Anchore扫描镜像
anchore-cli image add docker.io/library/nginx:latest
anchore-cli image wait docker.io/library/nginx:latest
anchore-cli image vuln docker.io/library/nginx:latest os
```

### 构建安全的Docker镜像

1. **最小化基础镜像**

```dockerfile
# 使用Alpine作为基础镜像
FROM alpine:3.14

# 或使用distroless镜像
FROM gcr.io/distroless/static-debian10
```

2. **多阶段构建**

```dockerfile
# 构建阶段
FROM node:14 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 运行阶段
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

3. **不要在镜像中包含敏感信息**

```dockerfile
# 错误示例 - 不要这样做
FROM ubuntu:20.04
ENV DB_PASSWORD=supersecret

# 正确示例 - 使用构建参数，但不保存在最终镜像中
FROM ubuntu:20.04
ARG DB_PASSWORD
RUN echo $DB_PASSWORD > /tmp/setup && ./setup.sh && rm /tmp/setup

# 更好的方式 - 使用Docker Secrets或环境变量注入
```

4. **定期更新基础镜像**

```bash
# 拉取最新的基础镜像
docker pull ubuntu:20.04

# 重新构建应用镜像
docker build -t my-app:latest .
```

## 容器运行时安全

### 以非root用户运行容器

1. **在Dockerfile中设置用户**

```dockerfile
FROM ubuntu:20.04

# 创建非root用户
RUN groupadd -r appuser && useradd -r -g appuser appuser

# 设置应用目录权限
WORKDIR /app
COPY --chown=appuser:appuser . .

# 切换到非root用户
USER appuser

CMD ["./app"]
```

2. **运行时指定用户**

```bash
# 使用--user标志
docker run --user 1000:1000 nginx

# 或使用用户名
docker run --user appuser nginx
```

### 限制容器资源

```bash
# 限制CPU和内存
docker run -d --name limited-container \
  --cpus=0.5 \
  --memory=512m \
  --memory-swap=512m \
  nginx

# 限制IO
docker run -d --name io-limited \
  --device-write-bps /dev/sda:1mb \
  --device-read-bps /dev/sda:1mb \
  nginx

# 限制进程数
docker run -d --name process-limited \
  --pids-limit=50 \
  nginx
```

### 使用安全计算（seccomp）配置文件

1. **使用默认seccomp配置文件**

```bash
# Docker默认启用seccomp
docker run --rm -it ubuntu:20.04 bash
```

2. **使用自定义seccomp配置文件**

```bash
# 下载Docker默认seccomp配置作为起点
wget https://raw.githubusercontent.com/docker/engine/master/profiles/seccomp/default.json

# 编辑配置文件后使用
docker run --security-opt seccomp=/path/to/custom-seccomp.json nginx
```

### 使用AppArmor或SELinux

1. **AppArmor (Ubuntu/Debian)**

```bash
# 检查AppArmor状态
sudo aa-status

# 创建自定义AppArmor配置
sudo nano /etc/apparmor.d/docker-nginx

# 加载配置
sudo apparmor_parser -r -W /etc/apparmor.d/docker-nginx

# 运行容器时使用
docker run --security-opt apparmor=docker-nginx nginx
```

2. **SELinux (CentOS/RHEL)**

```bash
# 检查SELinux状态
getenforce

# 创建自定义SELinux策略
sudo semodule -i my-docker.pp

# 运行容器时使用
docker run --security-opt label=type:my_container_t nginx
```

### 使用只读文件系统

```bash
# 将根文件系统设为只读
docker run --read-only nginx

# 为特定目录提供写入权限
docker run --read-only \
  --tmpfs /tmp \
  --tmpfs /var/cache \
  --tmpfs /var/log \
  nginx
```

### 限制容器功能

```bash
# 删除所有功能并只添加需要的功能
docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE nginx

# 常用的安全组合
docker run \
  --cap-drop=ALL \
  --cap-add=NET_BIND_SERVICE \
  --cap-add=SYS_NICE \
  --security-opt=no-new-privileges \
  nginx
```

### 使用Docker Secrets管理敏感数据

```bash
# 创建secret
echo "mydbpassword" | docker secret create db_password -

# 在服务中使用secret
docker service create \
  --name db \
  --secret db_password \
  --env MYSQL_ROOT_PASSWORD_FILE=/run/secrets/db_password \
  mysql:5.7
```

## 网络安全

### 使用用户定义的网络隔离容器

```bash
# 创建自定义网络
docker network create --driver bridge app-network

# 将容器连接到自定义网络
docker run -d --name web --network app-network nginx
docker run -d --name db --network app-network mysql:5.7

# 创建内部网络（不连接到外部）
docker network create --internal internal-only
docker run -d --name db --network internal-only mysql:5.7
```

### 限制容器间通信

```bash
# 禁用默认桥接网络上的容器间通信
# 在/etc/docker/daemon.json中设置
{
  "icc": false
}

# 重启Docker
sudo systemctl restart docker
```

### 使用TLS保护容器通信

```bash
# 在Docker Swarm中创建覆盖网络时启用加密
docker network create \
  --driver overlay \
  --opt encrypted \
  secure-network
```

### 安全地发布端口

```bash
# 仅绑定到特定接口
docker run -d -p 127.0.0.1:80:80 nginx

# 使用动态端口映射
docker run -d -p 127.0.0.1::80 nginx
```

## 数据安全

### 安全地管理卷和挂载

```bash
# 使用命名卷
docker volume create secure-data
docker run -d -v secure-data:/data nginx

# 使用只读挂载
docker run -d -v /host/config:/container/config:ro nginx

# 使用临时文件系统
docker run -d --tmpfs /tmp:rw,noexec,nosuid,size=1g nginx
```

### 加密存储数据

```bash
# 在主机上创建加密卷
sudo cryptsetup luksFormat /dev/sdX
sudo cryptsetup open /dev/sdX encrypted-data
sudo mkfs.ext4 /dev/mapper/encrypted-data
sudo mount /dev/mapper/encrypted-data /mnt/encrypted-data

# 将加密卷挂载到容器
docker run -d -v /mnt/encrypted-data:/data nginx
```

### 安全备份和恢复

```bash
# 备份Docker卷
docker run --rm -v secure-data:/data -v $(pwd):/backup alpine \
  tar -czf /backup/secure-data-backup.tar.gz -C /data .

# 恢复Docker卷
docker run --rm -v secure-data:/data -v $(pwd):/backup alpine \
  sh -c "cd /data && tar -xzf /backup/secure-data-backup.tar.gz"
```

## 监控和审计

### 启用Docker审计

1. **使用auditd监控Docker活动**

```bash
# 安装auditd
sudo apt install auditd  # Debian/Ubuntu
sudo yum install audit  # CentOS/RHEL

# 配置Docker审计规则
sudo nano /etc/audit/rules.d/docker.rules

# 添加以下规则
-w /usr/bin/docker -k docker
-w /var/lib/docker -k docker
-w /etc/docker -k docker
-w /lib/systemd/system/docker.service -k docker
-w /lib/systemd/system/docker.socket -k docker
-w /etc/default/docker -k docker
-w /etc/docker/daemon.json -k docker
-w /usr/lib/systemd/system/docker.service -k docker
-w /usr/lib/systemd/system/docker.socket -k docker

# 重新加载审计规则
sudo auditctl -R /etc/audit/rules.d/docker.rules

# 查看Docker相关审计日志
sudo ausearch -k docker
```

### 使用容器日志记录

```bash
# 配置Docker日志驱动
# 在/etc/docker/daemon.json中设置
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}

# 为特定容器配置日志驱动
docker run -d \
  --log-driver=syslog \
  --log-opt syslog-address=udp://syslog-server:514 \
  nginx

# 查看容器日志
docker logs container_id
```

### 使用监控工具

1. **使用cAdvisor监控容器**

```bash
docker run \
  --volume=/:/rootfs:ro \
  --volume=/var/run:/var/run:ro \
  --volume=/sys:/sys:ro \
  --volume=/var/lib/docker/:/var/lib/docker:ro \
  --volume=/dev/disk/:/dev/disk:ro \
  --publish=8080:8080 \
  --detach=true \
  --name=cadvisor \
  --privileged \
  --device=/dev/kmsg \
  gcr.io/cadvisor/cadvisor:v0.39.3
```

2. **使用Prometheus和Grafana**

```yaml
version: '3'

services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"
  
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
    ports:
      - "9100:9100"
  
  cadvisor:
    image: gcr.io/cadvisor/cadvisor
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:rw
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
    ports:
      - "8080:8080"
  
  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    volumes:
      - grafana-data:/var/lib/grafana

volumes:
  grafana-data:
```

## 安全更新和补丁管理

### 自动化镜像更新

1. **使用Watchtower自动更新容器**

```bash
# 运行Watchtower以自动更新所有容器
docker run -d \
  --name watchtower \
  --restart always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower --interval 86400

# 仅更新特定容器
docker run -d \
  --name watchtower \
  --restart always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower --interval 86400 container1 container2
```

2. **使用CI/CD管道自动构建和部署**

```yaml
# .gitlab-ci.yml示例
stages:
  - build
  - test
  - scan
  - deploy

build:
  stage: build
  script:
    - docker build -t my-app:$CI_COMMIT_SHA .
    - docker push my-app:$CI_COMMIT_SHA

test:
  stage: test
  script:
    - docker run my-app:$CI_COMMIT_SHA npm test

scan:
  stage: scan
  script:
    - trivy image my-app:$CI_COMMIT_SHA

deploy:
  stage: deploy
  script:
    - docker service update --image my-app:$CI_COMMIT_SHA my_service
```

### 定期安全审计

```bash
# 使用Docker Bench Security进行安全审计
docker run --rm -it \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /usr/bin/docker:/usr/bin/docker \
  -v /etc/docker:/etc/docker \
  -v /etc:/host/etc \
  -v /lib/systemd:/host/lib/systemd \
  -v /usr/lib/systemd:/host/usr/lib/systemd \
  -v /var/lib:/host/var/lib \
  docker/docker-bench-security
```

## 安全合规性

### 符合CIS Docker基准

```bash
# 使用Docker Bench Security检查CIS合规性
docker run --rm -it \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /usr/bin/docker:/usr/bin/docker \
  -v /etc/docker:/etc/docker \
  -v /etc:/host/etc \
  -v /lib/systemd:/host/lib/systemd \
  -v /usr/lib/systemd:/host/usr/lib/systemd \
  -v /var/lib:/host/var/lib \
  docker/docker-bench-security
```

### 符合GDPR/HIPAA等法规

1. **数据加密**

```bash
# 使用加密卷
# 参见前面的"加密存储数据"部分
```

2. **数据隔离**

```bash
# 使用专用网络
docker network create --internal sensitive-data-network

# 使用专用卷
docker volume create --label data=sensitive sensitive-data
```

3. **访问控制**

```bash
# 使用RBAC（在Docker Enterprise或Kubernetes中）
# 使用Docker Content Trust签名镜像
export DOCKER_CONTENT_TRUST=1
```

## 安全事件响应

### 创建安全事件响应计划

1. **准备阶段**
   - 记录Docker环境
   - 建立基线
   - 设置监控和警报

2. **检测阶段**
   - 监控异常活动
   - 使用入侵检测系统

3. **遏制阶段**

```bash
# 隔离受影响的容器
docker network disconnect bridge compromised-container

# 停止受影响的容器
docker stop compromised-container

# 保存容器状态以供分析
docker commit compromised-container forensic-image
```

4. **根除阶段**

```bash
# 删除受影响的容器和镜像
docker rm compromised-container
docker rmi compromised-image

# 更新基础镜像和应用
docker pull base-image:latest
docker build -t my-app:latest .
```

5. **恢复阶段**

```bash
# 从备份恢复数据
docker run --rm -v backup-volume:/backup -v data-volume:/data alpine \
  sh -c "cd /data && tar -xzf /backup/backup.tar.gz"

# 部署更新后的应用
docker service update --image my-app:latest my_service
```

## Docker安全清单

### 主机安全

- [ ] 保持主机操作系统更新
- [ ] 使用最小化的主机操作系统
- [ ] 配置主机防火墙
- [ ] 启用SELinux或AppArmor
- [ ] 限制对Docker套接字的访问
- [ ] 配置Docker守护进程使用TLS
- [ ] 禁用不必要的服务

### 镜像安全

- [ ] 使用官方或验证的基础镜像
- [ ] 使用最小化的基础镜像
- [ ] 定期更新基础镜像
- [ ] 使用多阶段构建
- [ ] 不在镜像中存储敏感信息
- [ ] 扫描镜像中的漏洞
- [ ] 使用Docker Content Trust签名镜像

### 容器运行时安全

- [ ] 以非root用户运行容器
- [ ] 使用只读文件系统
- [ ] 限制容器资源
- [ ] 限制容器功能
- [ ] 使用seccomp配置文件
- [ ] 使用AppArmor或SELinux配置文件
- [ ] 禁用特权容器
- [ ] 使用--no-new-privileges标志

### 网络安全

- [ ] 使用用户定义的网络
- [ ] 限制容器间通信
- [ ] 仅发布必要的端口
- [ ] 使用TLS加密网络通信
- [ ] 使用内部网络隔离敏感服务

### 数据安全

- [ ] 使用卷管理持久数据
- [ ] 加密敏感数据
- [ ] 定期备份数据
- [ ] 使用Docker Secrets管理敏感信息

### 监控和审计

- [ ] 配置容器日志记录
- [ ] 设置主机和容器监控
- [ ] 启用Docker审计
- [ ] 定期审查安全策略和配置

## 总结

Docker安全是一个多层面的挑战，需要从主机、镜像、容器运行时、网络和数据等多个方面进行考虑。通过实施本文介绍的最佳实践，您可以显著提高Docker环境的安全性，降低安全风险。

记住，安全是一个持续的过程，而不是一次性的工作。定期更新、监控、审计和改进您的Docker安全策略，以应对不断变化的安全威胁。

## 下一步学习

- [Docker生产环境部署](./docker-production.md)
- [Docker Swarm集群](./docker-swarm.md)
- [Docker Compose详解](./docker-compose.md)
- [Docker数据卷管理](./docker-volumes.md)