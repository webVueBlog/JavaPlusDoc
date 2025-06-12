# Docker镜像管理

## 什么是Docker镜像

Docker镜像是一个只读的模板，用于创建Docker容器。镜像可以理解为一个包含了应用程序及其依赖环境的文件系统，它是容器的基础。Docker镜像由多个层（layers）组成，每层都是只读的，这些层堆叠在一起形成最终的镜像。

## 镜像的特点

- **分层结构**：Docker镜像由多个层组成，每层代表Dockerfile中的一条指令
- **共享层**：不同的镜像可以共享相同的层，节省存储空间
- **只读**：镜像层是只读的，容器运行时会在最上层添加一个可写层
- **版本控制**：镜像支持标签（tag）机制，可以对不同版本进行管理

## 镜像命名与标签

镜像的完整名称由以下部分组成：

```
[registry-host]:[port]/[username]/[repository]:[tag]
```

- **registry-host:port**：镜像仓库地址，默认为Docker Hub
- **username**：用户名或组织名
- **repository**：镜像名称
- **tag**：镜像标签，默认为latest

例如：`docker.io/nginx:1.19.0`、`registry.example.com:5000/myapp:v1.0`

## 镜像基本操作

### 查看本地镜像

```bash
# 列出本地所有镜像
docker images
# 或
docker image ls

# 查看镜像详细信息
docker image inspect nginx:latest

# 查看镜像历史
docker history nginx:latest
```

### 搜索镜像

```bash
# 搜索Docker Hub上的镜像
docker search nginx

# 限制搜索结果数量
docker search --limit 5 nginx

# 只显示官方镜像
docker search --filter "is-official=true" nginx

# 按星级筛选
docker search --filter "stars=1000" nginx
```

### 拉取镜像

```bash
# 拉取最新版本
docker pull nginx

# 拉取指定版本
docker pull nginx:1.19.0

# 拉取指定仓库的镜像
docker pull registry.example.com:5000/myapp:v1.0
```

### 推送镜像

```bash
# 登录到Docker Hub
docker login

# 标记本地镜像
docker tag myapp:latest username/myapp:latest

# 推送到Docker Hub
docker push username/myapp:latest

# 推送到私有仓库
docker push registry.example.com:5000/myapp:latest
```

### 删除镜像

```bash
# 删除指定镜像
docker rmi nginx:latest
# 或
docker image rm nginx:latest

# 强制删除
docker rmi -f nginx:latest

# 删除未使用的镜像
docker image prune

# 删除所有未使用的镜像（包括未标记的）
docker image prune -a
```

## 构建自定义镜像

### 使用Dockerfile构建

1. 创建Dockerfile

```dockerfile
FROM nginx:latest
COPY ./html /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2. 构建镜像

```bash
# 基本构建命令
docker build -t myapp:latest .

# 指定Dockerfile路径
docker build -t myapp:latest -f /path/to/Dockerfile .

# 添加构建参数
docker build --build-arg VERSION=1.0 -t myapp:latest .

# 不使用缓存构建
docker build --no-cache -t myapp:latest .
```

### 使用现有容器创建镜像

```bash
# 从运行中的容器创建镜像
docker commit -m "Added new files" -a "Author" container_id username/myapp:latest
```

## 镜像优化技巧

### 减小镜像大小

1. **使用轻量级基础镜像**
   - 使用Alpine Linux作为基础镜像
   - 使用特定语言的精简版镜像（如node:alpine）

2. **多阶段构建**

```dockerfile
# 构建阶段
FROM maven:3.8.1-openjdk-11-slim AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn package -DskipTests

# 运行阶段
FROM openjdk:11-jre-slim
WORKDIR /app
COPY --from=build /app/target/myapp.jar .
EXPOSE 8080
CMD ["java", "-jar", "myapp.jar"]
```

3. **合并RUN指令**

```dockerfile
# 不推荐
RUN apt-get update
RUN apt-get install -y package1
RUN apt-get install -y package2
RUN apt-get clean

# 推荐
RUN apt-get update && \
    apt-get install -y package1 package2 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```

4. **使用.dockerignore文件**

```
.git
node_modules
tmp
log
*.md
```

### 提高构建效率

1. **合理安排Dockerfile指令顺序**
   - 将不常变化的指令放在前面
   - 将频繁变化的指令放在后面

2. **利用构建缓存**
   - 避免不必要的`--no-cache`选项
   - 使用`COPY`代替`ADD`（除非需要自动解压）

## 镜像安全最佳实践

1. **使用官方镜像**
   - 优先使用Docker官方认证的镜像
   - 检查镜像的下载量和星级

2. **定期更新基础镜像**
   - 使用CI/CD自动构建最新版本
   - 设置镜像扫描机制

3. **不在镜像中存储敏感信息**
   - 使用环境变量或Docker secrets
   - 避免在Dockerfile中硬编码密钥

4. **以非root用户运行**

```dockerfile
FROM node:14-alpine
WORKDIR /app
COPY . .
RUN npm install
# 创建非root用户
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
# 切换到非root用户
USER appuser
CMD ["node", "app.js"]
```

## 镜像仓库管理

### Docker Hub

- 公共镜像仓库，提供免费和付费计划
- 支持自动构建、团队协作等功能

### 私有仓库

1. **Docker Registry**

```bash
# 启动本地Registry
docker run -d -p 5000:5000 --name registry registry:2

# 推送镜像到本地Registry
docker tag myapp:latest localhost:5000/myapp:latest
docker push localhost:5000/myapp:latest
```

2. **Harbor**
   - 企业级Registry，提供RBAC、漏洞扫描等功能
   - 支持多租户、镜像复制等高级特性

## 常见问题与解决方案

### 拉取镜像失败

1. **网络问题**
   - 检查网络连接
   - 配置镜像加速器

2. **权限问题**
   - 确认已登录到私有仓库
   - 检查用户权限

### 镜像构建失败

1. **上下文问题**
   - 确保构建上下文正确
   - 使用.dockerignore排除不需要的文件

2. **依赖问题**
   - 检查网络连接
   - 确保依赖包可访问

## 总结

Docker镜像是容器化应用的基础，掌握镜像的管理和优化技巧对于高效使用Docker至关重要。通过合理构建和管理镜像，可以显著提高开发和部署效率，同时保证应用的安全性和可靠性。

## 下一步学习

- [Docker容器管理](./docker-containers.md)
- [Docker网络配置](./docker-network.md)
- [Docker数据卷管理](./docker-volumes.md)