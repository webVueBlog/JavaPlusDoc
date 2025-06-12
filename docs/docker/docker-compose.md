# Docker Compose详解

## 什么是Docker Compose

Docker Compose是一个用于定义和运行多容器Docker应用程序的工具。通过Compose，您可以使用YAML文件来配置应用程序的服务，然后使用一个命令创建并启动所有服务。

Docker Compose的主要优势：

- **简化复杂应用的部署**：通过单个配置文件和命令管理多个容器
- **声明式服务配置**：以YAML格式定义应用程序的整个环境
- **环境隔离**：为每个项目创建独立的环境
- **保持容器间的数据持久化**：可以在服务重启后保留数据
- **仅重新创建已更改的容器**：提高开发和部署效率
- **支持变量和环境扩展**：适应不同的部署环境

## 安装Docker Compose

### Linux系统安装

```bash
# 下载Docker Compose二进制文件
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# 添加可执行权限
sudo chmod +x /usr/local/bin/docker-compose

# 创建软链接
sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

# 验证安装
docker-compose --version
```

### Windows系统安装

Windows系统中，Docker Desktop已经包含了Docker Compose，无需单独安装。

### macOS系统安装

macOS系统中，Docker Desktop已经包含了Docker Compose，无需单独安装。

### 使用pip安装

```bash
pip install docker-compose
```

## Docker Compose文件结构

Docker Compose使用YAML文件（通常命名为`docker-compose.yml`）来定义服务、网络和卷。

### 基本结构

```yaml
version: '3'  # Compose文件版本

services:      # 定义服务
  web:         # 服务名称
    image: nginx:latest  # 使用的镜像
    ports:     # 端口映射
      - "80:80"
    volumes:   # 卷挂载
      - ./html:/usr/share/nginx/html

volumes:       # 定义卷（可选）
  data-volume:

networks:      # 定义网络（可选）
  app-network:
```

### 主要组件

1. **version**：指定Compose文件格式版本
2. **services**：定义应用程序的各个服务（容器）
3. **volumes**：定义可以挂载到容器的命名卷
4. **networks**：定义容器可以连接的网络

## 服务配置详解

### 基本配置选项

```yaml
services:
  web:
    image: nginx:latest  # 使用现有镜像
    # 或者使用Dockerfile构建
    build: 
      context: ./app  # 构建上下文路径
      dockerfile: Dockerfile.dev  # Dockerfile文件名
    container_name: my-web-app  # 容器名称
    restart: always  # 重启策略
    environment:  # 环境变量
      - NODE_ENV=production
    env_file: .env  # 从文件加载环境变量
    ports:  # 端口映射
      - "80:80"
      - "443:443"
    expose:  # 暴露端口（不映射到宿主机）
      - "8000"
    volumes:  # 卷挂载
      - ./app:/app
      - data-volume:/data
    networks:  # 网络连接
      - frontend
      - backend
    depends_on:  # 依赖关系
      - db
      - redis
```

### 高级配置选项

```yaml
services:
  web:
    # ... 基本配置 ...
    deploy:  # 部署配置（Swarm模式）
      replicas: 3
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
    healthcheck:  # 健康检查
      test: ["CMD", "curl", "-f", "http://localhost"]
      interval: 30s
      timeout: 10s
      retries: 3
    logging:  # 日志配置
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    user: "1000:1000"  # 指定用户和组
    working_dir: /app  # 工作目录
    entrypoint: /app/entrypoint.sh  # 入口点
    command: npm start  # 命令
    ulimits:  # 资源限制
      nproc: 65535
      nofile:
        soft: 20000
        hard: 40000
    sysctls:  # 内核参数
      net.core.somaxconn: 1024
```

## 网络配置

Docker Compose允许您定义自定义网络，并控制服务之间的通信。

### 默认网络

默认情况下，Compose会为您的应用创建一个网络，所有服务都连接到这个网络，服务可以通过服务名称相互访问。

### 自定义网络

```yaml
services:
  web:
    image: nginx
    networks:
      - frontend
  
  api:
    image: node:14
    networks:
      - frontend
      - backend
  
  db:
    image: postgres
    networks:
      - backend

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true  # 内部网络，不连接到外部
```

### 网络驱动选项

```yaml
networks:
  app-network:
    driver: bridge
    driver_opts:
      com.docker.network.bridge.name: app-bridge
    ipam:
      driver: default
      config:
        - subnet: 172.28.0.0/16
          gateway: 172.28.0.1
```

## 卷配置

卷用于持久化数据和共享数据。

### 基本卷配置

```yaml
services:
  db:
    image: postgres
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:  # 命名卷
```

### 高级卷配置

```yaml
volumes:
  db-data:
    driver: local
    driver_opts:
      type: nfs
      o: addr=192.168.1.1,rw
      device: ":/path/to/dir"
  
  backup-data:
    external: true  # 使用外部已存在的卷
```

## Docker Compose命令

### 基本命令

```bash
# 启动所有服务
docker-compose up

# 后台启动所有服务
docker-compose up -d

# 构建或重建服务
docker-compose build

# 停止服务
docker-compose stop

# 停止并删除容器、网络
docker-compose down

# 停止并删除容器、网络、卷
docker-compose down -v

# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs

# 查看特定服务的日志
docker-compose logs service_name

# 在服务中执行命令
docker-compose exec service_name command

# 进入服务的容器
docker-compose exec service_name bash
```

### 高级命令

```bash
# 仅启动特定服务
docker-compose up -d service_name

# 扩展服务实例数量
docker-compose up -d --scale service_name=3

# 查看配置
docker-compose config

# 验证配置
docker-compose config --quiet

# 拉取服务镜像
docker-compose pull

# 重启服务
docker-compose restart

# 强制重新创建容器
docker-compose up -d --force-recreate

# 查看容器间的网络连接
docker-compose network ls

# 暂停服务
docker-compose pause

# 恢复服务
docker-compose unpause

# 查看服务的进程
docker-compose top
```

## 实际应用示例

### Web应用 + 数据库

```yaml
version: '3'

services:
  web:
    build: ./app
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
      - DB_USER=postgres
      - DB_PASSWORD=secret
      - DB_NAME=myapp
    depends_on:
      - db
    restart: always
  
  db:
    image: postgres:13
    volumes:
      - db-data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=secret
      - POSTGRES_DB=myapp
    restart: always

volumes:
  db-data:
```

### 微服务架构

```yaml
version: '3'

services:
  nginx:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - api
      - client
  
  client:
    build:
      context: ./client
      dockerfile: Dockerfile
    environment:
      - REACT_APP_API_URL=http://api:5000
  
  api:
    build:
      context: ./server
      dockerfile: Dockerfile
    environment:
      - MONGO_URI=mongodb://mongo:27017/myapp
      - REDIS_HOST=redis
    depends_on:
      - mongo
      - redis
  
  mongo:
    image: mongo:latest
    volumes:
      - mongo-data:/data/db
  
  redis:
    image: redis:latest
    volumes:
      - redis-data:/data

volumes:
  mongo-data:
  redis-data:
```

### 开发环境配置

```yaml
version: '3'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    volumes:
      - ./:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    command: npm run dev
  
  test:
    build:
      context: .
      dockerfile: Dockerfile.dev
    volumes:
      - ./:/app
      - /app/node_modules
    command: npm run test
```

## 多环境配置

### 使用多个Compose文件

基本配置：`docker-compose.yml`
```yaml
version: '3'

services:
  web:
    image: myapp:latest
    restart: always
```

开发环境配置：`docker-compose.override.yml`（默认与基本配置合并）
```yaml
services:
  web:
    build: .
    volumes:
      - ./:/app
    environment:
      - DEBUG=true
```

生产环境配置：`docker-compose.prod.yml`
```yaml
services:
  web:
    environment:
      - DEBUG=false
    deploy:
      replicas: 3
```

使用特定环境配置：
```bash
# 开发环境（默认使用docker-compose.yml和docker-compose.override.yml）
docker-compose up -d

# 生产环境
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 使用环境变量

`.env`文件：
```
COMPOSE_PROJECT_NAME=myapp
DB_PASSWORD=secret
API_PORT=5000
```

`docker-compose.yml`：
```yaml
version: '3'

services:
  api:
    image: myapi
    ports:
      - "${API_PORT}:5000"
  
  db:
    image: postgres
    environment:
      - POSTGRES_PASSWORD=${DB_PASSWORD}
```

## Docker Compose与Swarm模式

Docker Compose可以与Docker Swarm一起使用，实现服务的编排和扩展。

### 部署到Swarm

```bash
# 初始化Swarm
docker swarm init

# 使用Compose文件部署堆栈
docker stack deploy -c docker-compose.yml myapp

# 列出所有堆栈
docker stack ls

# 查看堆栈中的服务
docker stack services myapp

# 查看堆栈中的任务
docker stack ps myapp

# 移除堆栈
docker stack rm myapp
```

### Swarm模式特定配置

```yaml
version: '3'

services:
  web:
    image: nginx
    deploy:
      mode: replicated
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
      placement:
        constraints:
          - node.role == worker
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

## 最佳实践

### 项目结构

```
project/
├── docker-compose.yml          # 主配置文件
├── docker-compose.override.yml # 开发环境配置
├── docker-compose.prod.yml     # 生产环境配置
├── .env                        # 环境变量
├── app/                        # 应用代码
│   ├── Dockerfile              # 应用Dockerfile
│   └── ...
├── nginx/                      # Nginx配置
│   ├── Dockerfile              # Nginx Dockerfile
│   └── default.conf            # Nginx配置文件
└── scripts/                    # 辅助脚本
    ├── backup.sh               # 备份脚本
    └── deploy.sh               # 部署脚本
```

### 安全最佳实践

1. **使用环境变量或secrets管理敏感信息**
   ```yaml
   services:
     db:
       environment:
         - POSTGRES_PASSWORD_FILE=/run/secrets/db_password
       secrets:
         - db_password
   
   secrets:
     db_password:
       file: ./secrets/db_password.txt
   ```

2. **限制容器资源**
   ```yaml
   services:
     app:
       deploy:
         resources:
           limits:
             cpus: '0.5'
             memory: 512M
   ```

3. **使用非root用户**
   ```yaml
   services:
     app:
       user: "1000:1000"
   ```

### 性能优化

1. **使用多阶段构建**
   ```dockerfile
   # Dockerfile
   FROM node:14 AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build
   
   FROM nginx:alpine
   COPY --from=builder /app/build /usr/share/nginx/html
   ```

2. **优化卷挂载**
   ```yaml
   services:
     app:
       volumes:
         - ./src:/app/src  # 只挂载需要的目录
         - /app/node_modules  # 排除node_modules
   ```

3. **使用健康检查**
   ```yaml
   services:
     web:
       healthcheck:
         test: ["CMD", "curl", "-f", "http://localhost"]
         interval: 30s
         timeout: 10s
         retries: 3
         start_period: 40s
   ```

## 常见问题与解决方案

### 容器间通信问题

**问题**：服务无法通过服务名访问其他服务

**解决方案**：
1. 确保服务在同一网络中
2. 使用`depends_on`确保依赖服务先启动
3. 检查服务名称是否正确
4. 使用`docker-compose ps`确认所有服务都已启动

### 卷挂载权限问题

**问题**：容器无法写入挂载的卷

**解决方案**：
1. 在Dockerfile中设置正确的用户和权限
2. 使用`user`选项指定用户ID
3. 在宿主机上预先设置正确的权限

### 环境变量问题

**问题**：环境变量未正确传递到容器

**解决方案**：
1. 检查`.env`文件格式是否正确
2. 确认变量名称拼写正确
3. 使用`docker-compose config`验证配置
4. 尝试使用`env_file`选项而不是`.env`文件

### 网络端口冲突

**问题**：启动服务时出现端口已被占用错误

**解决方案**：
1. 更改端口映射
2. 停止占用端口的其他服务
3. 使用`docker-compose down`确保旧服务已停止

## 总结

Docker Compose是一个强大的工具，用于定义和运行多容器Docker应用程序。通过使用声明式YAML配置文件，它简化了容器的创建、网络连接和数据卷管理。无论是开发环境、测试环境还是生产环境，Docker Compose都能提供一致的应用程序部署体验。

掌握Docker Compose的配置选项、命令和最佳实践，将帮助您更有效地管理容器化应用程序，提高开发和部署效率。

## 下一步学习

- [Docker Swarm集群](./docker-swarm.md)
- [Docker数据卷管理](./docker-volumes.md)
- [Docker安全最佳实践](./docker-security.md)
- [Docker生产环境部署](./docker-production.md)