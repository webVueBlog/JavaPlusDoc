# Docker生产环境部署

## 生产环境规划

### 基础设施规划

在将Docker部署到生产环境之前，需要进行全面的基础设施规划，确保系统的可靠性、可扩展性和安全性。

#### 硬件需求

根据工作负载类型和规模，合理规划硬件资源：

| 资源类型 | 最低配置 | 推荐配置 | 说明 |
|---------|---------|---------|------|
| CPU | 2核 | 4-8核 | 容器编排系统需要额外的CPU资源 |
| 内存 | 4GB | 16-32GB | 预留30%给操作系统和Docker守护进程 |
| 磁盘 | 20GB | 100GB+ | 使用SSD提高I/O性能，考虑单独的数据卷 |
| 网络 | 1Gbps | 10Gbps | 集群内部通信和容器镜像传输需要足够带宽 |

#### 操作系统选择

选择适合Docker的操作系统：

```bash
# 检查Linux内核版本（需要3.10或更高）
uname -r

# 推荐的操作系统发行版：
# - Ubuntu Server 20.04/22.04 LTS
# - CentOS 8/Stream
# - Debian 11/12
# - RHEL 8/9
# - Amazon Linux 2
```

#### 存储规划

为不同的Docker组件选择合适的存储驱动和位置：

```bash
# 检查当前存储驱动
docker info | grep "Storage Driver"

# 推荐的存储驱动：
# - overlay2（首选）
# - devicemapper（配置direct-lvm模式）
# - zfs

# 配置存储驱动和数据目录
cat > /etc/docker/daemon.json << EOF
{
  "storage-driver": "overlay2",
  "data-root": "/mnt/docker-data"
}
EOF

# 重启Docker服务
systemctl restart docker
```

#### 网络规划

规划Docker网络架构：

```bash
# 创建自定义网络
docker network create --driver overlay --subnet=10.10.0.0/16 --gateway=10.10.0.1 prod-network

# 为不同应用创建隔离网络
docker network create --driver overlay --subnet=10.20.0.0/16 frontend-network
docker network create --driver overlay --subnet=10.30.0.0/16 backend-network
docker network create --driver overlay --subnet=10.40.0.0/16 --internal db-network
```

### 容器编排选择

根据项目规模和需求选择合适的容器编排系统：

#### Docker Swarm

适合中小型部署，与Docker紧密集成，易于设置和管理。

```bash
# 初始化Swarm集群
docker swarm init --advertise-addr <MANAGER-IP>

# 添加工作节点
# 在管理节点上获取加入命令
docker swarm join-token worker

# 在工作节点上执行加入命令
docker swarm join --token <TOKEN> <MANAGER-IP>:2377
```

#### Kubernetes

适合大型复杂部署，功能丰富，生态系统完善，但学习曲线较陡。

```bash
# 使用kubeadm安装Kubernetes
# 1. 安装kubeadm、kubelet和kubectl
apt-get update && apt-get install -y apt-transport-https curl
curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -
cat <<EOF | tee /etc/apt/sources.list.d/kubernetes.list
deb https://apt.kubernetes.io/ kubernetes-xenial main
EOF
apt-get update
apt-get install -y kubelet kubeadm kubectl
apt-mark hold kubelet kubeadm kubectl

# 2. 初始化控制平面
kubeadm init --pod-network-cidr=10.244.0.0/16

# 3. 设置kubectl配置
mkdir -p $HOME/.kube
cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
chown $(id -u):$(id -g) $HOME/.kube/config

# 4. 安装网络插件（例如Calico）
kubectl apply -f https://docs.projectcalico.org/manifests/calico.yaml
```

#### Docker Compose

适合单主机部署或开发环境，简单易用。

```bash
# 安装Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 创建生产环境配置
touch docker-compose.yml docker-compose.prod.yml

# 使用生产配置启动服务
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 镜像管理策略

### 私有镜像仓库

在生产环境中，建议使用私有镜像仓库来存储和管理容器镜像。

#### 部署Docker Registry

```bash
# 使用TLS和认证部署私有仓库

# 1. 创建自签名证书
mkdir -p certs
openssl req -newkey rsa:4096 -nodes -sha256 -keyout certs/domain.key -x509 -days 365 -out certs/domain.crt

# 2. 创建认证文件
mkdir -p auth
docker run --rm --entrypoint htpasswd httpd:2 -Bbn admin secure_password > auth/htpasswd

# 3. 启动私有仓库
docker run -d \
  --name registry \
  --restart=always \
  -p 5000:5000 \
  -v "$(pwd)"/certs:/certs \
  -v "$(pwd)"/auth:/auth \
  -e REGISTRY_HTTP_TLS_CERTIFICATE=/certs/domain.crt \
  -e REGISTRY_HTTP_TLS_KEY=/certs/domain.key \
  -e REGISTRY_AUTH=htpasswd \
  -e REGISTRY_AUTH_HTPASSWD_REALM="Registry Realm" \
  -e REGISTRY_AUTH_HTPASSWD_PATH=/auth/htpasswd \
  registry:2
```

#### 使用Harbor作为企业级镜像仓库

```bash
# 1. 下载Harbor安装包
wget https://github.com/goharbor/harbor/releases/download/v2.7.0/harbor-offline-installer-v2.7.0.tgz
tar xzvf harbor-offline-installer-v2.7.0.tgz
cd harbor

# 2. 配置Harbor
cp harbor.yml.tmpl harbor.yml
# 编辑harbor.yml配置文件

# 3. 安装Harbor
./install.sh --with-clair --with-trivy
```

### 镜像标签策略

制定清晰的镜像标签策略，确保镜像的可追溯性和版本管理。

```bash
# 推荐的标签策略：

# 1. 使用语义化版本
docker build -t myregistry.example.com/myapp:1.2.3 .

# 2. 使用Git提交哈希
docker build -t myregistry.example.com/myapp:$(git rev-parse --short HEAD) .

# 3. 使用构建时间戳
docker build -t myregistry.example.com/myapp:$(date +%Y%m%d%H%M%S) .

# 4. 使用环境标签
docker build -t myregistry.example.com/myapp:1.2.3-production .
docker build -t myregistry.example.com/myapp:1.2.3-staging .

# 5. 推送镜像到私有仓库
docker push myregistry.example.com/myapp:1.2.3
```

### 镜像安全扫描

在生产环境中部署前，对镜像进行安全扫描，确保没有已知漏洞。

```bash
# 使用Trivy扫描镜像
trivy image myregistry.example.com/myapp:1.2.3

# 在CI/CD流程中集成镜像扫描
cat > .gitlab-ci.yml << EOF
stages:
  - build
  - scan
  - deploy

build:
  stage: build
  script:
    - docker build -t myregistry.example.com/myapp:${CI_COMMIT_SHA} .

scan:
  stage: scan
  script:
    - trivy image --exit-code 1 --severity HIGH,CRITICAL myregistry.example.com/myapp:${CI_COMMIT_SHA}

deploy:
  stage: deploy
  script:
    - docker push myregistry.example.com/myapp:${CI_COMMIT_SHA}
    - docker service update --image myregistry.example.com/myapp:${CI_COMMIT_SHA} my_service
  only:
    - master
EOF
```

## 部署策略

### 蓝绿部署

蓝绿部署通过同时维护两个生产环境（蓝色和绿色），实现零停机部署。

```yaml
# docker-compose.blue.yml
version: '3.8'
services:
  app:
    image: myregistry.example.com/myapp:1.2.3
    deploy:
      replicas: 3
    environment:
      - DEPLOYMENT=blue
    networks:
      - frontend
      - backend

# docker-compose.green.yml
version: '3.8'
services:
  app:
    image: myregistry.example.com/myapp:1.3.0
    deploy:
      replicas: 0
    environment:
      - DEPLOYMENT=green
    networks:
      - frontend
      - backend

# 部署蓝色环境
docker stack deploy -c docker-compose.blue.yml myapp

# 部署绿色环境并切换流量
docker service scale myapp_app-green=3
# 更新负载均衡器配置指向绿色环境
# ...
# 确认绿色环境正常后，缩减蓝色环境
docker service scale myapp_app-blue=0
```

### 金丝雀部署

金丝雀部署通过逐步将流量从旧版本转移到新版本，降低风险。

```bash
# 使用Docker Swarm进行金丝雀部署

# 1. 部署当前版本
docker service create --name myapp \
  --replicas 5 \
  myregistry.example.com/myapp:1.2.3

# 2. 更新服务，使用金丝雀策略
docker service update \
  --image myregistry.example.com/myapp:1.3.0 \
  --update-parallelism 1 \
  --update-delay 1m \
  myapp

# 3. 监控更新过程
docker service ps myapp

# 4. 如果发现问题，回滚更新
docker service update --rollback myapp
```

### 滚动更新

滚动更新是最常用的部署策略，逐步替换旧版本的实例。

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    image: myregistry.example.com/myapp:1.3.0
    deploy:
      replicas: 5
      update_config:
        parallelism: 2
        delay: 30s
        order: start-first
        failure_action: rollback
        monitor: 60s
      rollback_config:
        parallelism: 2
        delay: 10s
        order: stop-first

# 部署服务
docker stack deploy -c docker-compose.yml myapp

# 更新服务镜像
docker service update --image myregistry.example.com/myapp:1.3.1 myapp_app
```

## 高可用性配置

### Docker Swarm高可用

配置Docker Swarm集群以实现高可用性。

```bash
# 1. 初始化第一个管理节点
docker swarm init --advertise-addr <MANAGER1-IP>

# 2. 获取管理节点加入令牌
docker swarm join-token manager

# 3. 在其他管理节点上执行加入命令
# 在Manager2上
docker swarm join --token <MANAGER-TOKEN> <MANAGER1-IP>:2377
# 在Manager3上
docker swarm join --token <MANAGER-TOKEN> <MANAGER1-IP>:2377

# 4. 获取工作节点加入令牌
docker swarm join-token worker

# 5. 在工作节点上执行加入命令
docker swarm join --token <WORKER-TOKEN> <MANAGER1-IP>:2377

# 6. 查看集群状态
docker node ls
```

### 服务高可用

配置服务以实现高可用性。

```bash
# 1. 创建具有多个副本的服务
docker service create \
  --name myapp \
  --replicas 5 \
  --publish 80:80 \
  myregistry.example.com/myapp:1.3.0

# 2. 配置服务约束和偏好，确保副本分布在不同节点
docker service update \
  --constraint-add "node.labels.zone==east" \
  --constraint-add "node.role==worker" \
  --placement-pref-add "spread=node.labels.rack" \
  myapp

# 3. 配置健康检查
docker service update \
  --health-cmd "curl -f http://localhost/health || exit 1" \
  --health-interval 5s \
  --health-retries 3 \
  --health-timeout 2s \
  --health-start-period 10s \
  myapp

# 4. 配置重启策略
docker service update \
  --restart-condition any \
  --restart-delay 5s \
  --restart-max-attempts 3 \
  --restart-window 120s \
  myapp
```

### 数据持久化

确保数据的持久化和高可用性。

```bash
# 1. 创建命名卷
docker volume create --driver local \
  --opt type=nfs \
  --opt o=addr=192.168.1.1,rw \
  --opt device=:/path/to/nfs \
  myapp-data

# 2. 使用卷创建服务
docker service create \
  --name db \
  --mount type=volume,source=myapp-data,target=/var/lib/mysql \
  --replicas 1 \
  mysql:5.7

# 3. 配置数据备份
cat > backup.sh << 'EOF'
#!/bin/bash
DATETIME=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/backup

docker run --rm \
  -v myapp-data:/data \
  -v $BACKUP_DIR:/backup \
  alpine \
  tar -czf /backup/myapp-data-$DATETIME.tar.gz -C /data .
EOF
chmod +x backup.sh

# 4. 设置定时备份
echo "0 2 * * * /path/to/backup.sh" | crontab -
```

## 监控和日志

### 监控系统

部署监控系统，实时监控Docker容器和主机的状态。

#### Prometheus和Grafana

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--web.enable-lifecycle'
    ports:
      - "9090:9090"
    deploy:
      placement:
        constraints:
          - node.role == manager

  node-exporter:
    image: prom/node-exporter:latest
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
    deploy:
      mode: global

  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
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
    image: grafana/grafana:latest
    volumes:
      - grafana-data:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=secure_password
      - GF_USERS_ALLOW_SIGN_UP=false
    ports:
      - "3000:3000"
    deploy:
      placement:
        constraints:
          - node.role == manager

volumes:
  prometheus-data:
  grafana-data:
```

#### 配置Prometheus

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          # - alertmanager:9093

rule_files:
  # - "first_rules.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node-exporter'
    dns_sd_configs:
      - names:
        - 'tasks.node-exporter'
        type: 'A'
        port: 9100

  - job_name: 'cadvisor'
    dns_sd_configs:
      - names:
        - 'tasks.cadvisor'
        type: 'A'
        port: 8080

  - job_name: 'docker'
    static_configs:
      - targets: ['host.docker.internal:9323']
```

### 日志管理

配置集中式日志管理系统，收集和分析容器日志。

#### ELK Stack

```yaml
# docker-compose.logging.yml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.17.0
    environment:
      - discovery.type=single-node
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - elasticsearch-data:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"
    deploy:
      resources:
        limits:
          memory: 1g

  logstash:
    image: docker.elastic.co/logstash/logstash:7.17.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    ports:
      - "5000:5000"
      - "5000:5000/udp"
      - "9600:9600"
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:7.17.0
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch

volumes:
  elasticsearch-data:
```

#### 配置Logstash

```
# logstash.conf
input {
  gelf {
    port => 5000
  }
}

filter {
  if [docker][image] =~ /^myregistry\.example\.com\/myapp/ {
    mutate {
      add_field => { "application" => "myapp" }
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "logstash-%{+YYYY.MM.dd}"
  }
}
```

#### 配置Docker日志驱动

```bash
# 在/etc/docker/daemon.json中配置
cat > /etc/docker/daemon.json << EOF
{
  "log-driver": "gelf",
  "log-opts": {
    "gelf-address": "udp://localhost:5000",
    "tag": "{{.Name}}/{{.ID}}"
  }
}
EOF

# 重启Docker服务
systemctl restart docker

# 或者为特定容器配置日志驱动
docker service create \
  --name myapp \
  --log-driver gelf \
  --log-opt gelf-address=udp://logstash:5000 \
  --log-opt tag="myapp/{{.Name}}/{{.ID}}" \
  myregistry.example.com/myapp:1.3.0
```

## 性能优化

### 容器性能优化

优化容器配置以提高性能。

```bash
# 1. 限制容器资源
docker service create \
  --name myapp \
  --limit-cpu 0.5 \
  --limit-memory 512M \
  --reserve-cpu 0.1 \
  --reserve-memory 128M \
  myregistry.example.com/myapp:1.3.0

# 2. 优化容器网络
docker service create \
  --name myapp \
  --network-add name=fast-network,alias=myapp \
  --dns 8.8.8.8 \
  --dns-option ndots:2 \
  --dns-search example.com \
  myregistry.example.com/myapp:1.3.0

# 3. 优化存储性能
docker service create \
  --name myapp \
  --mount type=volume,source=fast-data,target=/data,volume-driver=local,volume-opt=type=tmpfs,volume-opt=device=tmpfs,volume-opt=o=size=100m \
  myregistry.example.com/myapp:1.3.0
```

### Docker守护进程优化

优化Docker守护进程配置以提高性能。

```bash
# 在/etc/docker/daemon.json中配置
cat > /etc/docker/daemon.json << EOF
{
  "storage-driver": "overlay2",
  "storage-opts": ["overlay2.override_kernel_check=true"],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 64000,
      "Soft": 64000
    }
  },
  "live-restore": true,
  "max-concurrent-downloads": 10,
  "max-concurrent-uploads": 10,
  "registry-mirrors": ["https://mirror.example.com"],
  "insecure-registries": ["registry.internal:5000"],
  "experimental": false,
  "metrics-addr": "0.0.0.0:9323",
  "dns": ["8.8.8.8", "8.8.4.4"]
}
EOF

# 重启Docker服务
systemctl restart docker
```

### 主机系统优化

优化主机系统配置以提高Docker性能。

```bash
# 1. 调整内核参数
cat > /etc/sysctl.d/99-docker.conf << EOF
# 最大文件句柄数
fs.file-max = 1000000

# 允许更多的PIDs
kernel.pid_max = 4194303

# 增加网络性能相关参数
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65536
net.core.netdev_max_backlog = 65536
net.ipv4.ip_local_port_range = 1024 65535
net.ipv4.tcp_fin_timeout = 15
net.ipv4.tcp_keepalive_time = 300
net.ipv4.tcp_keepalive_intvl = 30
net.ipv4.tcp_keepalive_probes = 5

# 启用IP转发（容器网络需要）
net.ipv4.ip_forward = 1

# 增加inotify限制（容器文件系统监控需要）
fs.inotify.max_user_watches = 1048576
fs.inotify.max_user_instances = 8192
EOF

# 应用内核参数
sysctl --system

# 2. 调整用户限制
cat > /etc/security/limits.d/99-docker.conf << EOF
* soft nofile 1048576
* hard nofile 1048576
root soft nofile 1048576
root hard nofile 1048576
* soft nproc 1048576
* hard nproc 1048576
root soft nproc 1048576
root hard nproc 1048576
EOF

# 3. 优化磁盘I/O调度器（对SSD）
echo "mq-deadline" > /sys/block/sda/queue/scheduler

# 4. 禁用不必要的服务
systemctl disable snapd
systemctl disable lxcfs
systemctl disable accounts-daemon
```

## 备份和恢复

### 数据备份策略

实施全面的备份策略，确保数据安全。

```bash
# 1. 创建备份脚本
cat > /usr/local/bin/docker-backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/mnt/backups/$(date +%Y%m%d)"
DOCKER_DATA_DIR="/var/lib/docker"
VOLUME_BACKUP_DIR="${BACKUP_DIR}/volumes"

# 创建备份目录
mkdir -p "${VOLUME_BACKUP_DIR}"

# 备份Docker配置
mkdir -p "${BACKUP_DIR}/config"
cp -r /etc/docker "${BACKUP_DIR}/config/"

# 备份Swarm配置（如果使用Swarm）
if docker info | grep -q "Swarm: active"; then
  mkdir -p "${BACKUP_DIR}/swarm"
  sudo systemctl stop docker
  cp -r "${DOCKER_DATA_DIR}/swarm" "${BACKUP_DIR}/swarm/"
  sudo systemctl start docker
fi

# 备份命名卷
for volume in $(docker volume ls -q); do
  echo "Backing up volume: ${volume}"
  mkdir -p "${VOLUME_BACKUP_DIR}/${volume}"
  docker run --rm \
    -v "${volume}":/source \
    -v "${VOLUME_BACKUP_DIR}/${volume}":/backup \
    alpine \
    tar -czf "/backup/${volume}.tar.gz" -C /source .
done

# 备份运行中的容器配置
mkdir -p "${BACKUP_DIR}/containers"
for container in $(docker ps -q); do
  container_name=$(docker inspect --format="{{.Name}}" "${container}" | sed 's/^\/*//')
  echo "Backing up container config: ${container_name}"
  docker inspect "${container}" > "${BACKUP_DIR}/containers/${container_name}.json"
done

# 备份自定义网络配置
mkdir -p "${BACKUP_DIR}/networks"
for network in $(docker network ls --filter "driver=overlay" --format "{{.Name}}" | grep -v "ingress"); do
  echo "Backing up network config: ${network}"
  docker network inspect "${network}" > "${BACKUP_DIR}/networks/${network}.json"
done

# 压缩备份
cd "$(dirname "${BACKUP_DIR}")"
tar -czf "docker-backup-$(date +%Y%m%d).tar.gz" "$(basename "${BACKUP_DIR}")"
rm -rf "${BACKUP_DIR}"

echo "Backup completed: docker-backup-$(date +%Y%m%d).tar.gz"
EOF

chmod +x /usr/local/bin/docker-backup.sh

# 2. 设置定时备份
echo "0 1 * * * /usr/local/bin/docker-backup.sh" | crontab -
```

### 系统恢复流程

制定系统恢复流程，确保在灾难发生时能够快速恢复。

```bash
# 1. 创建恢复脚本
cat > /usr/local/bin/docker-restore.sh << 'EOF'
#!/bin/bash

if [ $# -ne 1 ]; then
  echo "Usage: $0 <backup-file>"
  exit 1
fi

BACKUP_FILE="$1"
RESTORE_DIR="/tmp/docker-restore"

# 解压备份
rm -rf "${RESTORE_DIR}"
mkdir -p "${RESTORE_DIR}"
tar -xzf "${BACKUP_FILE}" -C "${RESTORE_DIR}"
BACKUP_DIR=$(find "${RESTORE_DIR}" -type d -name "[0-9]*" | head -1)

# 恢复Docker配置
if [ -d "${BACKUP_DIR}/config/docker" ]; then
  echo "Restoring Docker configuration..."
  cp -r "${BACKUP_DIR}/config/docker"/* /etc/docker/
fi

# 停止Docker服务
systemctl stop docker

# 恢复Swarm配置（如果存在）
if [ -d "${BACKUP_DIR}/swarm" ]; then
  echo "Restoring Swarm configuration..."
  rm -rf /var/lib/docker/swarm
  mkdir -p /var/lib/docker/swarm
  cp -r "${BACKUP_DIR}/swarm/swarm"/* /var/lib/docker/swarm/
fi

# 启动Docker服务
systemctl start docker

# 恢复命名卷
if [ -d "${BACKUP_DIR}/volumes" ]; then
  echo "Restoring volumes..."
  for volume_tar in "${BACKUP_DIR}/volumes"/*/*.tar.gz; do
    volume_name=$(basename "$(dirname "${volume_tar}")")
    echo "Restoring volume: ${volume_name}"
    
    # 创建卷（如果不存在）
    if ! docker volume inspect "${volume_name}" &>/dev/null; then
      docker volume create "${volume_name}"
    fi
    
    # 恢复卷数据
    docker run --rm \
      -v "${volume_name}":/target \
      -v "$(dirname "${volume_tar}")":/backup \
      alpine \
      sh -c "rm -rf /target/* && tar -xzf /backup/$(basename "${volume_tar}") -C /target"
  done
fi

# 恢复网络配置
if [ -d "${BACKUP_DIR}/networks" ]; then
  echo "Restoring networks..."
  for network_file in "${BACKUP_DIR}/networks"/*.json; do
    network_name=$(basename "${network_file}" .json)
    echo "Restoring network: ${network_name}"
    
    # 检查网络是否存在
    if ! docker network inspect "${network_name}" &>/dev/null; then
      # 从备份文件提取网络配置
      driver=$(jq -r '.[0].Driver' "${network_file}")
      subnet=$(jq -r '.[0].IPAM.Config[0].Subnet' "${network_file}")
      gateway=$(jq -r '.[0].IPAM.Config[0].Gateway' "${network_file}")
      
      # 创建网络
      docker network create \
        --driver "${driver}" \
        --subnet "${subnet}" \
        --gateway "${gateway}" \
        "${network_name}"
    fi
  done
fi

# 恢复容器（可选，通常使用编排工具重新部署）
# ...

echo "Restore completed."
EOF

chmod +x /usr/local/bin/docker-restore.sh
```

### 灾难恢复演练

定期进行灾难恢复演练，确保恢复流程有效。

```bash
# 1. 创建演练脚本
cat > /usr/local/bin/dr-drill.sh << 'EOF'
#!/bin/bash

# 设置测试环境
TEST_DIR="/tmp/dr-test"
mkdir -p "${TEST_DIR}"

# 创建测试卷和数据
docker volume create test-volume
docker run --rm -v test-volume:/data alpine sh -c "echo 'test data' > /data/test.txt"

# 备份测试环境
echo "Backing up test environment..."
/usr/local/bin/docker-backup.sh
BACKUP_FILE=$(ls -t docker-backup-*.tar.gz | head -1)

# 删除测试卷
docker volume rm test-volume

# 恢复测试环境
echo "Restoring test environment..."
/usr/local/bin/docker-restore.sh "${BACKUP_FILE}"

# 验证恢复结果
echo "Verifying restore..."
RESTORE_RESULT=$(docker run --rm -v test-volume:/data alpine cat /data/test.txt)

if [ "${RESTORE_RESULT}" = "test data" ]; then
  echo "Disaster recovery drill: SUCCESS"
else
  echo "Disaster recovery drill: FAILED"
fi

# 清理
docker volume rm test-volume
rm -rf "${TEST_DIR}"
EOF

chmod +x /usr/local/bin/dr-drill.sh

# 2. 设置定期演练
echo "0 2 1 * * /usr/local/bin/dr-drill.sh" | crontab -
```

## 安全最佳实践

### 容器安全配置

实施容器安全最佳实践。

```bash
# 1. 以非root用户运行容器
docker service create \
  --name myapp \
  --user 1000:1000 \
  myregistry.example.com/myapp:1.3.0

# 2. 使用只读文件系统
docker service create \
  --name myapp \
  --read-only \
  --tmpfs /tmp:rw,noexec,nosuid \
  myregistry.example.com/myapp:1.3.0

# 3. 限制容器功能
docker service create \
  --name myapp \
  --cap-drop ALL \
  --cap-add NET_BIND_SERVICE \
  --security-opt no-new-privileges \
  myregistry.example.com/myapp:1.3.0

# 4. 使用seccomp配置文件
docker service create \
  --name myapp \
  --security-opt seccomp=/etc/docker/seccomp-profile.json \
  myregistry.example.com/myapp:1.3.0
```

### 网络安全

实施网络安全最佳实践。

```bash
# 1. 创建隔离网络
docker network create --driver overlay --internal backend-network

# 2. 使用加密的覆盖网络
docker network create --driver overlay --opt encrypted secure-network

# 3. 配置网络策略
# 在Kubernetes中使用NetworkPolicy
cat > network-policy.yaml << EOF
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: db-policy
spec:
  podSelector:
    matchLabels:
      app: db
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: api
    ports:
    - protocol: TCP
      port: 3306
EOF

# 4. 使用TLS加密通信
docker service create \
  --name web \
  --secret source=ssl-cert,target=/etc/nginx/ssl/cert.pem \
  --secret source=ssl-key,target=/etc/nginx/ssl/key.pem \
  --config source=nginx-ssl,target=/etc/nginx/conf.d/default.conf \
  nginx:latest
```

### 访问控制和认证

实施访问控制和认证最佳实践。

```bash
# 1. 使用Docker Content Trust签名和验证镜像
export DOCKER_CONTENT_TRUST=1
docker pull myregistry.example.com/myapp:1.3.0

# 2. 使用RBAC控制API访问（在Kubernetes中）
cat > rbac.yaml << EOF
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: default
  name: pod-reader
rules:
- apiGroups: [""] # "" 表示核心API组
  resources: ["pods"]
  verbs: ["get", "watch", "list"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods
  namespace: default
subjects:
- kind: User
  name: jane
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
EOF

# 3. 使用Docker Secrets管理敏感信息
docker secret create db-password /path/to/password.txt
docker service create \
  --name db \
  --secret db-password \
  --env MYSQL_ROOT_PASSWORD_FILE=/run/secrets/db-password \
  mysql:5.7
```

## 自动化和CI/CD

### CI/CD流水线

实施CI/CD流水线，自动化构建、测试和部署过程。

```yaml
# .gitlab-ci.yml
stages:
  - build
  - test
  - scan
  - deploy
  - verify

variables:
  DOCKER_REGISTRY: myregistry.example.com
  IMAGE_NAME: myapp
  IMAGE_TAG: $CI_COMMIT_SHA

build:
  stage: build
  script:
    - docker build -t $DOCKER_REGISTRY/$IMAGE_NAME:$IMAGE_TAG .
    - docker push $DOCKER_REGISTRY/$IMAGE_NAME:$IMAGE_TAG

test:
  stage: test
  script:
    - docker pull $DOCKER_REGISTRY/$IMAGE_NAME:$IMAGE_TAG
    - docker run --rm $DOCKER_REGISTRY/$IMAGE_NAME:$IMAGE_TAG npm test

scan:
  stage: scan
  script:
    - trivy image --exit-code 1 --severity HIGH,CRITICAL $DOCKER_REGISTRY/$IMAGE_NAME:$IMAGE_TAG

deploy_staging:
  stage: deploy
  script:
    - docker stack deploy -c docker-compose.staging.yml --with-registry-auth myapp-staging
    - docker service update --image $DOCKER_REGISTRY/$IMAGE_NAME:$IMAGE_TAG myapp-staging_app
  environment:
    name: staging
  only:
    - develop

deploy_production:
  stage: deploy
  script:
    - docker stack deploy -c docker-compose.prod.yml --with-registry-auth myapp-prod
    - docker service update --image $DOCKER_REGISTRY/$IMAGE_NAME:$IMAGE_TAG myapp-prod_app
  environment:
    name: production
  when: manual
  only:
    - master

verify:
  stage: verify
  script:
    - curl -f https://staging.example.com/health || exit 1
  environment:
    name: staging
  only:
    - develop
```

### 自动化测试

实施自动化测试，确保应用质量。

```bash
# 1. 单元测试
docker run --rm \
  -v $(pwd):/app \
  -w /app \
  node:14 \
  npm run test:unit

# 2. 集成测试
docker-compose -f docker-compose.test.yml up --abort-on-container-exit

# 3. 端到端测试
docker run --rm \
  --network host \
  -v $(pwd):/app \
  -w /app \
  cypress/included:8.3.0 \
  cypress run
```

### 基础设施即代码

使用基础设施即代码工具管理Docker环境。

```yaml
# docker-compose.yml with environment variables
version: '3.8'

services:
  app:
    image: ${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
    deploy:
      replicas: ${REPLICAS:-3}
      update_config:
        parallelism: ${UPDATE_PARALLELISM:-1}
        delay: ${UPDATE_DELAY:-30s}
        order: start-first
        failure_action: rollback
      resources:
        limits:
          cpus: ${CPU_LIMIT:-0.5}
          memory: ${MEMORY_LIMIT:-512M}
    environment:
      - NODE_ENV=${NODE_ENV:-production}
      - DB_HOST=${DB_HOST:-db}
    networks:
      - frontend
      - backend

  db:
    image: mysql:5.7
    volumes:
      - db-data:/var/lib/mysql
    environment:
      - MYSQL_ROOT_PASSWORD_FILE=/run/secrets/db-password
      - MYSQL_DATABASE=${DB_NAME:-myapp}
    secrets:
      - db-password
    networks:
      - backend

networks:
  frontend:
    driver: overlay
  backend:
    driver: overlay
    internal: true

volumes:
  db-data:

secrets:
  db-password:
    external: true
```

## 总结

Docker生产环境部署是一个复杂的过程，涉及多个方面的考虑和优化。通过本文介绍的最佳实践，您可以构建一个可靠、高效、安全的Docker生产环境。

关键要点包括：

1. **基础设施规划**：根据工作负载需求规划硬件、操作系统、存储和网络。
2. **容器编排**：选择合适的容器编排系统（Docker Swarm、Kubernetes或Docker Compose）。
3. **镜像管理**：使用私有镜像仓库、制定标签策略、进行安全扫描。
4. **部署策略**：实施蓝绿部署、金丝雀部署或滚动更新。
5. **高可用性**：配置集群高可用、服务高可用和数据持久化。
6. **监控和日志**：部署监控系统和集中式日志管理。
7. **性能优化**：优化容器、Docker守护进程和主机系统。
8. **备份和恢复**：实施备份策略、制定恢复流程、进行灾难恢复演练。
9. **安全最佳实践**：实施容器安全配置、网络安全和访问控制。
10. **自动化和CI/CD**：实施CI/CD流水线、自动化测试和基础设施即代码。

通过遵循这些最佳实践，您可以构建一个稳定、安全、高效的Docker生产环境，为您的应用提供可靠的运行平台。

## 下一步学习

- [Docker安全最佳实践](./docker-security.md)
- [Docker Swarm集群](./docker-swarm.md)
- [Docker Compose详解](./docker-compose.md)
- [Docker数据卷管理](./docker-volumes.md)