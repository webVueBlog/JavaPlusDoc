# Docker教程

## Docker简介

Docker是一个开源的应用容器引擎，让开发者可以打包他们的应用以及依赖包到一个可移植的容器中，然后发布到任何流行的Linux或Windows操作系统的机器上，也可以实现虚拟化。容器是完全使用沙箱机制，相互之间不会有任何接口。

## Docker的优势

- **轻量级**：Docker容器非常轻量级，启动快速，资源利用率高
- **一致的运行环境**：Docker的镜像提供了除内核外完整的运行时环境，确保了应用运行环境一致性
- **持续交付和部署**：使用Docker可以通过定制应用镜像来实现持续集成、持续交付、部署
- **更高效的资源利用**：Docker容器的运行不需要额外的虚拟化管理程序支持，节约了计算资源

## Docker核心概念

### 1. 镜像（Image）

镜像是Docker容器运行时的只读模板，包含了运行容器所需的文件系统结构和内容。

### 2. 容器（Container）

容器是镜像的运行实例，可以被创建、启动、停止、删除、暂停等。

### 3. 仓库（Repository）

仓库是集中存放镜像的地方，分为公开仓库和私有仓库。

## Docker安装

### Ubuntu安装Docker

```bash
# 更新apt包索引
sudo apt-get update

# 安装必要的系统工具
sudo apt-get install apt-transport-https ca-certificates curl gnupg lsb-release

# 添加Docker官方GPG密钥
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# 设置稳定版仓库
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 更新apt包索引
sudo apt-get update

# 安装Docker Engine
sudo apt-get install docker-ce docker-ce-cli containerd.io

# 验证Docker是否安装成功
sudo docker run hello-world
```

### CentOS安装Docker

```bash
# 卸载旧版本
sudo yum remove docker docker-client docker-client-latest docker-common docker-latest docker-latest-logrotate docker-logrotate docker-engine

# 安装必要的系统工具
sudo yum install -y yum-utils

# 设置仓库
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# 安装Docker Engine
sudo yum install docker-ce docker-ce-cli containerd.io

# 启动Docker
sudo systemctl start docker

# 验证Docker是否安装成功
sudo docker run hello-world
```

### Windows安装Docker

1. 下载[Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
2. 双击安装包进行安装
3. 安装完成后，启动Docker Desktop
4. 打开命令提示符或PowerShell，运行`docker --version`验证安装

## Docker基本命令

### 镜像操作

```bash
# 列出本地镜像
docker images

# 搜索镜像
docker search nginx

# 拉取镜像
docker pull nginx

# 删除镜像
docker rmi nginx
```

### 容器操作

```bash
# 创建并启动容器
docker run -d -p 80:80 --name webserver nginx

# 列出运行中的容器
docker ps

# 列出所有容器
docker ps -a

# 停止容器
docker stop webserver

# 启动容器
docker start webserver

# 重启容器
docker restart webserver

# 删除容器
docker rm webserver
```

## Dockerfile基础

Dockerfile是用来构建Docker镜像的文本文件，包含了一条条指令，每一条指令构建一层镜像，因此每一条指令的内容，就是描述该层镜像应当如何构建。

### 基本指令

```dockerfile
# 基于哪个镜像
FROM nginx:latest

# 维护者信息
MAINTAINER author "author@example.com"

# 执行命令
RUN apt-get update && apt-get install -y vim

# 添加文件
ADD index.html /usr/share/nginx/html/

# 拷贝文件
COPY conf/nginx.conf /etc/nginx/nginx.conf

# 设置环境变量
ENV PATH /usr/local/nginx/bin:$PATH

# 暴露端口
EXPOSE 80 443

# 设置卷
VOLUME ["/data"]

# 设置工作目录
WORKDIR /usr/share/nginx/html

# 设置启动命令
CMD ["nginx", "-g", "daemon off;"]
```

### 构建镜像

```bash
# 在Dockerfile所在目录执行
docker build -t my-nginx .
```

## Docker Compose基础

Docker Compose是一个用于定义和运行多容器Docker应用程序的工具。通过Compose，您可以使用YAML文件来配置应用程序的服务，然后使用一个命令创建并启动所有服务。

### 安装Docker Compose

```bash
# 下载Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# 添加可执行权限
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker-compose --version
```

### docker-compose.yml示例

```yaml
version: '3'
services:
  web:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./html:/usr/share/nginx/html
    networks:
      - webnet
  redis:
    image: redis:latest
    networks:
      - webnet
networks:
  webnet:
```

### 常用命令

```bash
# 启动所有服务
docker-compose up -d

# 停止所有服务
docker-compose down

# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs
```

## 下一步学习

- Docker网络配置
- Docker数据卷管理
- Docker Swarm集群
- Kubernetes容器编排

## 参考资源

- [Docker官方文档](https://docs.docker.com/)
- [Docker Hub](https://hub.docker.com/)
- [Docker Compose文档](https://docs.docker.com/compose/)