# Docker数据卷管理

## 什么是Docker数据卷

Docker数据卷是一种持久化数据的机制，它允许在容器和宿主机之间共享文件和目录。数据卷是独立于容器的特殊目录，具有以下特点：

- **数据持久化**：容器删除后，数据卷仍然存在
- **数据共享**：多个容器可以共享同一个数据卷
- **数据隔离**：数据卷与容器的生命周期解耦
- **性能优化**：数据卷的I/O性能通常优于容器内部文件系统
- **跨平台支持**：数据卷在不同操作系统上工作方式一致

## 数据管理方式

Docker提供了三种主要的数据管理方式：

1. **数据卷（Volumes）**：由Docker管理的宿主机文件系统的一部分（通常在`/var/lib/docker/volumes/`）
2. **绑定挂载（Bind Mounts）**：将宿主机上的任意目录或文件挂载到容器中
3. **tmpfs挂载（tmpfs Mounts）**：将数据存储在宿主机的内存中，而不是磁盘上

## Docker数据卷操作

### 创建和管理数据卷

```bash
# 创建数据卷
docker volume create my-volume

# 查看所有数据卷
docker volume ls

# 查看数据卷详细信息
docker volume inspect my-volume

# 删除数据卷
docker volume rm my-volume

# 删除所有未使用的数据卷
docker volume prune

# 创建带标签的数据卷
docker volume create --label environment=production my-volume

# 创建使用特定驱动的数据卷
docker volume create --driver local my-volume

# 创建带选项的数据卷
docker volume create --opt type=nfs --opt o=addr=192.168.1.1,rw --opt device=:/path/to/dir my-nfs-volume
```

### 在容器中使用数据卷

```bash
# 使用数据卷启动容器
docker run -d -v my-volume:/app/data nginx

# 使用只读数据卷
docker run -d -v my-volume:/app/data:ro nginx

# 使用新语法挂载数据卷
docker run -d --mount source=my-volume,target=/app/data nginx

# 使用匿名数据卷
docker run -d -v /app/data nginx

# 使用临时数据卷（容器删除后自动删除）
docker run -d --mount source=my-volume,target=/app/data,tmpfs=true nginx
```

## 绑定挂载操作

绑定挂载允许将宿主机上的任意路径挂载到容器中。

```bash
# 基本绑定挂载
docker run -d -v /host/path:/container/path nginx

# 使用只读绑定挂载
docker run -d -v /host/path:/container/path:ro nginx

# 使用新语法进行绑定挂载
docker run -d --mount type=bind,source=/host/path,target=/container/path nginx

# 挂载单个文件
docker run -d -v /host/file.conf:/container/file.conf nginx

# 使用相对路径（不推荐）
docker run -d -v $(pwd)/config:/container/config nginx
```

## tmpfs挂载操作

tmpfs挂载将数据存储在宿主机的内存中，适用于存储非持久化的敏感数据。

```bash
# 基本tmpfs挂载
docker run -d --tmpfs /app/temp nginx

# 指定tmpfs选项
docker run -d --tmpfs /app/temp:rw,noexec,nosuid,size=100m nginx

# 使用新语法进行tmpfs挂载
docker run -d --mount type=tmpfs,destination=/app/temp nginx

# 指定tmpfs大小
docker run -d --mount type=tmpfs,destination=/app/temp,tmpfs-size=100m nginx

# 指定tmpfs模式
docker run -d --mount type=tmpfs,destination=/app/temp,tmpfs-mode=1770 nginx
```

## 数据卷使用场景

### 数据库持久化

```bash
# 创建MySQL数据卷
docker volume create mysql-data

# 启动MySQL容器并使用数据卷
docker run -d \
  --name mysql \
  -e MYSQL_ROOT_PASSWORD=password \
  -v mysql-data:/var/lib/mysql \
  mysql:5.7
```

### 配置文件管理

```bash
# 创建配置数据卷
docker volume create nginx-conf

# 从容器复制默认配置到宿主机
docker run --rm -v nginx-conf:/nginx nginx bash -c "cp -a /etc/nginx/. /nginx/"

# 使用自定义配置启动容器
docker run -d \
  --name nginx \
  -v nginx-conf:/etc/nginx \
  -p 80:80 \
  nginx
```

### 应用数据共享

```bash
# 创建共享数据卷
docker volume create shared-data

# 启动多个容器共享数据
docker run -d --name app1 -v shared-data:/app/data nginx
docker run -d --name app2 -v shared-data:/app/data nginx
```

### 开发环境代码挂载

```bash
# 挂载源代码目录
docker run -d \
  --name node-app \
  -v $(pwd):/app \
  -w /app \
  -p 3000:3000 \
  node:14 \
  npm start
```

## 数据卷备份与恢复

### 备份数据卷

```bash
# 使用临时容器备份数据卷
docker run --rm \
  -v my-volume:/source \
  -v $(pwd):/backup \
  alpine \
  tar -czvf /backup/my-volume-backup.tar.gz -C /source .
```

### 恢复数据卷

```bash
# 创建新数据卷
docker volume create my-new-volume

# 使用临时容器恢复数据
docker run --rm \
  -v my-new-volume:/target \
  -v $(pwd):/backup \
  alpine \
  sh -c "tar -xzvf /backup/my-volume-backup.tar.gz -C /target"
```

## 数据卷驱动

Docker支持多种数据卷驱动，用于扩展数据卷功能。

### 本地驱动（local）

默认的数据卷驱动，将数据存储在宿主机本地文件系统中。

```bash
docker volume create --driver local my-volume
```

### NFS驱动

允许使用NFS服务器作为数据卷存储。

```bash
# 安装NFS驱动
docker plugin install --grant-all-permissions vieux/sshfs

# 创建NFS数据卷
docker volume create --driver vieux/sshfs \
  -o sshcmd=user@host:/path \
  -o password=password \
  sshfs-volume
```

### 其他第三方驱动

- **Flocker**：用于多主机环境
- **GlusterFS**：分布式文件系统
- **Ceph**：分布式存储系统
- **NetApp**：企业级存储解决方案

```bash
# 安装第三方驱动
docker plugin install <driver-name>

# 创建使用第三方驱动的数据卷
docker volume create --driver <driver-name> --opt key=value my-volume
```

## 数据卷在Docker Compose中的使用

### 基本用法

```yaml
version: '3'

services:
  web:
    image: nginx
    volumes:
      - web-data:/usr/share/nginx/html
      - ./config/nginx.conf:/etc/nginx/nginx.conf:ro
      - /var/log/nginx:/var/log/nginx

volumes:
  web-data:
    driver: local
```

### 外部数据卷

```yaml
version: '3'

services:
  db:
    image: mysql:5.7
    volumes:
      - db-data:/var/lib/mysql

volumes:
  db-data:
    external: true
```

### 带选项的数据卷

```yaml
version: '3'

services:
  web:
    image: nginx
    volumes:
      - web-data:/usr/share/nginx/html

volumes:
  web-data:
    driver: local
    driver_opts:
      type: nfs
      o: addr=192.168.1.1,rw
      device: ":/path/to/dir"
```

## 数据卷最佳实践

### 命名约定

使用有意义的名称命名数据卷，反映其用途和内容。

```bash
# 好的命名示例
docker volume create mysql-prod-data
docker volume create nginx-conf-staging
```

### 数据卷标签

使用标签组织和管理数据卷。

```bash
# 添加标签
docker volume create --label environment=production --label app=mysql mysql-data

# 根据标签筛选
docker volume ls --filter label=environment=production
```

### 数据卷权限

确保容器内的用户对挂载的数据卷有适当的权限。

```bash
# 在容器启动前设置权限
docker run --rm -v my-volume:/data alpine chown -R 1000:1000 /data

# 使用entrypoint脚本设置权限
cat > entrypoint.sh << 'EOF'
#!/bin/sh
chown -R user:user /app/data
exec "$@"
EOF

# Dockerfile中设置
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
```

### 数据卷清理策略

定期清理未使用的数据卷，防止磁盘空间浪费。

```bash
# 查找未使用的数据卷
docker volume ls -f dangling=true

# 删除未使用的数据卷
docker volume prune

# 创建定期清理的cron作业
echo "0 0 * * * docker volume prune -f" | sudo tee -a /etc/crontab
```

## 数据卷安全考虑

### 敏感数据处理

```bash
# 使用tmpfs存储敏感数据
docker run -d --tmpfs /app/secrets:rw,noexec,nosuid,size=1m nginx

# 使用Docker Secrets（在Swarm模式下）
docker secret create my-secret /path/to/secret/file
docker service create --secret my-secret nginx
```

### 访问控制

```bash
# 限制数据卷访问权限
docker run -d -v my-volume:/app/data:ro nginx

# 使用非root用户访问数据卷
docker run -d -v my-volume:/app/data --user 1000:1000 nginx
```

### 加密数据

```bash
# 使用加密文件系统
docker volume create --driver local \
  --opt type=btrfs \
  --opt device=/dev/mapper/encrypted-device \
  encrypted-volume
```

## 常见问题与解决方案

### 权限问题

**问题**：容器内无法写入挂载的数据卷

**解决方案**：
1. 调整宿主机上的权限
   ```bash
   sudo chown -R 1000:1000 /path/to/volume
   ```

2. 在容器内调整权限
   ```bash
   docker exec -it container_id chown -R user:user /app/data
   ```

3. 使用相同的UID/GID
   ```bash
   docker run -d --user $(id -u):$(id -g) -v /host/path:/container/path nginx
   ```

### 数据卷无法删除

**问题**：尝试删除数据卷时出现错误

**解决方案**：
1. 确保没有容器使用该数据卷
   ```bash
   docker ps -a --filter volume=my-volume
   ```

2. 强制删除（谨慎使用）
   ```bash
   docker volume rm -f my-volume
   ```

3. 重启Docker服务
   ```bash
   sudo systemctl restart docker
   ```

### 性能问题

**问题**：数据卷操作性能较低

**解决方案**：
1. 使用数据卷而不是绑定挂载
2. 减少挂载点数量
3. 考虑使用内存挂载（tmpfs）用于临时数据
4. 使用性能更好的存储驱动

## 总结

Docker数据卷是容器化应用中管理持久数据的关键机制。通过合理使用数据卷、绑定挂载和tmpfs挂载，可以实现数据持久化、共享和隔离，同时保持容器的轻量级和可移植性。掌握数据卷的创建、管理和最佳实践，对于构建健壮的容器化应用至关重要。

## 下一步学习

- [Docker Compose详解](./docker-compose.md)
- [Docker Swarm集群](./docker-swarm.md)
- [Docker安全最佳实践](./docker-security.md)
- [Docker生产环境部署](./docker-production.md)