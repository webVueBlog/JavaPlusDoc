# Docker安装指南

本文将详细介绍如何在不同操作系统上安装Docker，包括主流Linux发行版和Windows系统。无论您是在生产服务器上还是在开发环境中使用Docker，本指南都能帮助您快速完成安装和初始配置。

## Linux服务器安装Docker

### Ubuntu安装Docker

Ubuntu是最流行的Linux发行版之一，下面是在Ubuntu上安装Docker的步骤：

#### 前置条件

- 64位Ubuntu系统（建议使用LTS版本：18.04、20.04或22.04）
- 具有sudo权限的用户

#### 安装步骤

1. 更新软件包索引并安装必要的依赖：

```bash
sudo apt-get update

sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release
```

2. 添加Docker官方GPG密钥：

```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
```

3. 设置Docker稳定版仓库：

```bash
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

4. 安装Docker Engine：

```bash
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io
```

5. 验证安装：

```bash
sudo docker run hello-world
```

6. （可选）将当前用户添加到docker组，以便无需sudo即可运行docker命令：

```bash
sudo usermod -aG docker $USER
# 注销并重新登录，或者运行以下命令应用组更改
newgrp docker
```

### CentOS安装Docker

CentOS是企业级服务器中常用的Linux发行版，以下是在CentOS上安装Docker的步骤：

#### 前置条件

- 64位CentOS 7或CentOS 8
- 具有sudo权限的用户

#### 安装步骤

1. 安装必要的依赖：

```bash
sudo yum install -y yum-utils device-mapper-persistent-data lvm2
```

2. 添加Docker仓库：

```bash
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
```

3. 安装Docker Engine：

```bash
sudo yum install -y docker-ce docker-ce-cli containerd.io
```

4. 启动Docker服务并设置开机自启：

```bash
sudo systemctl start docker
sudo systemctl enable docker
```

5. 验证安装：

```bash
sudo docker run hello-world
```

6. （可选）将当前用户添加到docker组：

```bash
sudo usermod -aG docker $USER
# 注销并重新登录，或者运行以下命令应用组更改
newgrp docker
```

### Debian安装Docker

Debian是另一个流行的Linux发行版，以下是在Debian上安装Docker的步骤：

#### 前置条件

- 64位Debian 10 (Buster)或Debian 11 (Bullseye)
- 具有sudo权限的用户

#### 安装步骤

1. 更新软件包索引并安装必要的依赖：

```bash
sudo apt-get update

sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release
```

2. 添加Docker官方GPG密钥：

```bash
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
```

3. 设置Docker稳定版仓库：

```bash
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

4. 安装Docker Engine：

```bash
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io
```

5. 验证安装：

```bash
sudo docker run hello-world
```

### RHEL/Rocky Linux/AlmaLinux安装Docker

RHEL（Red Hat Enterprise Linux）及其开源替代品Rocky Linux和AlmaLinux是企业级环境中常用的发行版。

#### 前置条件

- 64位RHEL 8/9或Rocky Linux 8/9或AlmaLinux 8/9
- 具有sudo权限的用户

#### 安装步骤

1. 安装必要的依赖：

```bash
sudo dnf install -y dnf-plugins-core
```

2. 添加Docker仓库：

```bash
sudo dnf config-manager --add-repo https://download.docker.com/linux/rhel/docker-ce.repo
```

3. 安装Docker Engine：

```bash
sudo dnf install -y docker-ce docker-ce-cli containerd.io
```

4. 启动Docker服务并设置开机自启：

```bash
sudo systemctl start docker
sudo systemctl enable docker
```

5. 验证安装：

```bash
sudo docker run hello-world
```

### 使用便捷脚本安装Docker

对于测试和开发环境，Docker提供了一个便捷脚本来快速安装：

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

> **注意**：不建议在生产环境中使用便捷脚本安装Docker。

## Windows安装Docker

在Windows上，有两种主要的Docker安装选项：Docker Desktop for Windows和WSL 2（Windows Subsystem for Linux 2）。

### 安装Docker Desktop for Windows

Docker Desktop for Windows提供了一个完整的Docker开发环境，包括Docker Engine、Docker CLI、Docker Compose等。

#### 系统要求

- Windows 10 64位：专业版、企业版或教育版（Build 19041或更高版本）
- 或Windows 11 64位
- 启用硬件虚拟化（在BIOS中开启）
- 至少4GB RAM

#### 安装步骤

1. 从[Docker官网](https://www.docker.com/products/docker-desktop)下载Docker Desktop安装程序。

2. 双击安装程序并按照向导进行安装。

3. 安装过程中，确保选择"使用WSL 2"选项（推荐）。

4. 安装完成后，Docker Desktop将自动启动。

5. 验证安装：打开PowerShell或命令提示符，运行：

```powershell
docker run hello-world
```

### 使用WSL 2安装Docker

如果您已经使用WSL 2，也可以直接在WSL 2的Linux发行版中安装Docker，而不需要Docker Desktop。

#### 前置条件

- 已安装并配置WSL 2
- 已安装Linux发行版（如Ubuntu）

#### 安装步骤

1. 启动您的WSL 2 Linux发行版（例如Ubuntu）。

2. 按照上面的Linux安装指南（基于您的发行版）安装Docker。

3. 启动Docker服务：

```bash
sudo service docker start
```

4. （可选）设置Docker在WSL启动时自动启动，将以下行添加到`~/.bashrc`或`~/.zshrc`：

```bash
# 启动Docker服务
if service docker status 2>&1 | grep -q "is not running"; then
    wsl.exe -d ${WSL_DISTRO_NAME} -u root -e /usr/sbin/service docker start >/dev/null 2>&1
fi
```

5. 验证安装：

```bash
docker run hello-world
```

## 安装Docker Compose

Docker Compose是一个用于定义和运行多容器Docker应用程序的工具。以下是安装Docker Compose的方法：

### Linux安装Docker Compose

1. 下载当前稳定版本的Docker Compose：

```bash
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
```

2. 添加可执行权限：

```bash
sudo chmod +x /usr/local/bin/docker-compose
```

3. 验证安装：

```bash
docker-compose --version
```

### Windows安装Docker Compose

如果您安装了Docker Desktop for Windows，Docker Compose已经包含在其中。

验证安装：

```powershell
docker-compose --version
```

## 配置Docker镜像加速

在国内使用Docker时，从Docker Hub拉取镜像可能会很慢。配置镜像加速可以显著提高下载速度。

### Linux配置镜像加速

1. 创建或修改Docker守护进程配置文件：

```bash
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": [
    "https://registry.docker-cn.com",
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com"
  ]
}
EOF
```

2. 重启Docker服务：

```bash
sudo systemctl daemon-reload
sudo systemctl restart docker
```

### Windows配置镜像加速

1. 右键点击系统托盘中的Docker图标，选择"Settings"。

2. 点击"Docker Engine"。

3. 在JSON配置中添加或修改`registry-mirrors`字段：

```json
{
  "registry-mirrors": [
    "https://registry.docker-cn.com",
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com"
  ]
}
```

4. 点击"Apply & Restart"应用更改。

## 安装后的基本操作

### 验证Docker安装

```bash
# 检查Docker版本
docker --version
docker-compose --version

# 验证Docker是否正常工作
docker run hello-world

# 查看Docker系统信息
docker info
```

### 管理Docker服务

```bash
# Linux启动Docker服务
sudo systemctl start docker

# Linux停止Docker服务
sudo systemctl stop docker

# Linux重启Docker服务
sudo systemctl restart docker

# Linux查看Docker服务状态
sudo systemctl status docker

# Linux设置Docker开机自启
sudo systemctl enable docker
```

### 基本Docker命令

```bash
# 列出本地镜像
docker images

# 搜索镜像
docker search nginx

# 拉取镜像
docker pull nginx

# 运行容器
docker run -d -p 80:80 --name webserver nginx

# 列出运行中的容器
docker ps

# 列出所有容器（包括已停止的）
docker ps -a

# 停止容器
docker stop webserver

# 启动容器
docker start webserver

# 删除容器
docker rm webserver

# 删除镜像
docker rmi nginx
```

## 常见问题排查

### 权限问题

如果遇到"Permission denied"错误：

```bash
# 将当前用户添加到docker组
sudo usermod -aG docker $USER

# 应用组更改（无需注销）
newgrp docker
```

### 端口冲突

如果遇到"port is already allocated"错误：

```bash
# 查找占用端口的进程
sudo netstat -tulpn | grep <端口号>

# 或者使用lsof
sudo lsof -i :<端口号>

# 终止占用端口的进程
sudo kill <PID>
```

### Docker服务无法启动

```bash
# 检查Docker日志
sudo journalctl -u docker.service

# 检查Docker守护进程状态
sudo systemctl status docker
```

### 磁盘空间不足

```bash
# 清理未使用的Docker对象
docker system prune -a

# 查看Docker磁盘使用情况
docker system df
```

## 总结

本文详细介绍了如何在各种Linux发行版和Windows系统上安装Docker，以及安装后的基本配置和常见问题排查。通过遵循本指南，您可以在服务器或开发环境中快速设置Docker环境，为容器化应用开发和部署打下基础。

## 下一步学习

- [Docker教程](./docker-tutorial.md)
- [Docker镜像管理](./docker-images.md)
- [Docker容器管理](./docker-containers.md)
- [Dockerfile最佳实践](./docker-dockerfile.md)