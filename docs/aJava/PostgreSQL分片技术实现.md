# PostgreSQL分片技术实现

## 概述

PostgreSQL分片是一种水平扩展技术，通过将数据分布到多个数据库实例中来提高性能和可扩展性。本文档介绍PostgreSQL的分片实现方案，包括原生分区、Citus扩展和应用层分片。

## PostgreSQL分片架构

### 1. 原生分区（Partitioning）

```sql
-- 创建分区表
CREATE TABLE orders (
    id BIGSERIAL,
    user_id BIGINT NOT NULL,
    order_date DATE NOT NULL,
    amount DECIMAL(10,2),
    status VARCHAR(20)
) PARTITION BY RANGE (order_date);

-- 创建分区
CREATE TABLE orders_2023_q1 PARTITION OF orders
    FOR VALUES FROM ('2023-01-01') TO ('2023-04-01');

CREATE TABLE orders_2023_q2 PARTITION OF orders
    FOR VALUES FROM ('2023-04-01') TO ('2023-07-01');

CREATE TABLE orders_2023_q3 PARTITION OF orders
    FOR VALUES FROM ('2023-07-01') TO ('2023-10-01');

CREATE TABLE orders_2023_q4 PARTITION OF orders
    FOR VALUES FROM ('2023-10-01') TO ('2024-01-01');
```

### 2. Citus分布式架构

```yaml
# docker-compose.yml - Citus集群
version: '3.8'
services:
  # 协调节点
  citus-coordinator:
    image: citusdata/citus:11.1
    environment:
      POSTGRES_DB: citus
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      PGUSER: postgres
      PGPASSWORD: password
      POSTGRES_HOST_AUTH_METHOD: trust
    ports:
      - "5432:5432"
    volumes:
      - citus_coordinator_data:/var/lib/postgresql/data
    command: >
      bash -c "
        /usr/local/bin/docker-entrypoint.sh postgres &
        sleep 10
        psql -h localhost -U postgres -d citus -c \"SELECT citus_set_coordinator_host('citus-coordinator', 5432);\"
        wait
      "

  # 工作节点1
  citus-worker1:
    image: citusdata/citus:11.1
    environment:
      POSTGRES_DB: citus
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      PGUSER: postgres
      PGPASSWORD: password
      POSTGRES_HOST_AUTH_METHOD: trust
    ports:
      - "5433:5432"
    volumes:
      - citus_worker1_data:/var/lib/postgresql/data

  # 工作节点2
  citus-worker2:
    image: citusdata/citus:11.1
    environment:
      POSTGRES_DB: citus
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      PGUSER: postgres
      PGPASSWORD: password
      POSTGRES_HOST_AUTH_METHOD: trust
    ports:
      - "5434:5432"
    volumes:
      - citus_worker2_data:/var/lib/postgresql/data

volumes:
  citus_coordinator_data:
  citus_worker1_data:
  citus_worker2_data:
```

## Java应用集成

### 1. Maven依赖

```xml
<dependencies>
    <!-- PostgreSQL驱动 -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <version>42.6.0</version>
    </dependency>
    
    <!-- Spring Boot Data JPA -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    
    <!-- HikariCP连接池 -->
    <dependency>
        <groupId>com.zaxxer</groupId>
        <artifactId>HikariCP</artifactId>
    </dependency>
    
    <!-- Sharding-JDBC -->
    <dependency>
        <groupId>org.apache.shardingsphere</groupId>
        <artifactId>shardingsphere-jdbc-core-spring-boot-starter</artifactId>
        <version>5.3.2</version>
    </dependency>
</dependencies>
```

### 2. Spring Boot配置

```yaml
# application.yml
spring:
  shardingsphere:
    datasource:
      names: ds0,ds1,ds2
      ds0:
        type: com.zaxxer.hikari.HikariDataSource
        driver-class-name: org.postgresql.Driver
        jdbc-url: jdbc:postgresql://localhost:5432/shard0
        username: postgres
        password: password
      ds1:
        type: com.zaxxer.hikari.HikariDataSource
        driver-class-name: org.postgresql.Driver
        jdbc-url: jdbc:postgresql://localhost:5433/shard1
        username: postgres
        password: password
      ds2:
        type: com.zaxxer.hikari.HikariDataSource
        driver-class-name: org.postgresql.Driver
        jdbc-url: jdbc:postgresql://localhost:5434/shard2
        username: postgres
        password: password
    
    rules:
      sharding:
        tables:
          t_order:
            actual-data-nodes: ds$->{0..2}.t_order_$->{0..3}
            table-strategy:
              standard:
                sharding-column: order_id
                sharding-algorithm-name: t_order_table_inline
            database-strategy:
              standard:
                sharding-column: user_id
                sharding-algorithm-name: t_order_database_inline
        
        sharding-algorithms:
          t_order_database_inline:
            type: INLINE
            props:
              algorithm-expression: ds$->{user_id % 3}
          t_order_table_inline:
            type: INLINE
            props:
              algorithm-expression: t_order_$->{order_id % 4}
    
    props:
      sql-show: true
```

### 3. 实体类定义

```java
@Entity
@Table(name = "t_order")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderId;
    
    @Column(name = "user_id")
    private Long userId;
    
    @Column(name = "order_date")
    private LocalDate orderDate;
    
    @Column(name = "amount")
    private BigDecimal amount;
    
    @Column(name = "status")
    private String status;
    
    // 构造函数、getter、setter
    public Order() {}
    
    public Order(Long userId, LocalDate orderDate, BigDecimal amount, String status) {
        this.userId = userId;
        this.orderDate = orderDate;
        this.amount = amount;
        this.status = status;
    }
    
    // getter和setter方法
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public LocalDate getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDate orderDate) { this.orderDate = orderDate; }
    
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
```

### 4. 分片服务实现

```java
@Service
@Transactional
public class PostgreSQLShardingService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    /**
     * 创建订单
     */
    public Order createOrder(Long userId, BigDecimal amount) {
        Order order = new Order();
        order.setUserId(userId);
        order.setOrderDate(LocalDate.now());
        order.setAmount(amount);
        order.setStatus("PENDING");
        
        return orderRepository.save(order);
    }
    
    /**
     * 根据用户ID查询订单
     */
    public List<Order> findOrdersByUserId(Long userId) {
        return orderRepository.findByUserId(userId);
    }
    
    /**
     * 跨分片统计查询
     */
    public Map<String, Object> getOrderStatistics() {
        String sql = """
            SELECT 
                COUNT(*) as total_orders,
                SUM(amount) as total_amount,
                AVG(amount) as avg_amount
            FROM t_order
            """;
        
        Map<String, Object> result = jdbcTemplate.queryForMap(sql);
        return result;
    }
    
    /**
     * 批量插入订单
     */
    @Transactional
    public void batchInsertOrders(List<Order> orders) {
        String sql = """
            INSERT INTO t_order (user_id, order_date, amount, status) 
            VALUES (?, ?, ?, ?)
            """;
        
        List<Object[]> batchArgs = orders.stream()
            .map(order -> new Object[]{
                order.getUserId(),
                order.getOrderDate(),
                order.getAmount(),
                order.getStatus()
            })
            .collect(Collectors.toList());
        
        jdbcTemplate.batchUpdate(sql, batchArgs);
    }
    
    /**
     * 分片信息查询
     */
    public List<Map<String, Object>> getShardInfo() {
        String sql = """
            SELECT 
                schemaname,
                tablename,
                pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
            FROM pg_tables 
            WHERE tablename LIKE 't_order%'
            ORDER BY schemaname, tablename
            """;
        
        return jdbcTemplate.queryForList(sql);
    }
}
```

## Citus分布式表管理

### 1. 创建分布式表

```sql
-- 连接到协调节点
\c citus

-- 添加工作节点
SELECT citus_add_node('citus-worker1', 5432);
SELECT citus_add_node('citus-worker2', 5432);

-- 创建表
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    order_date DATE NOT NULL,
    amount DECIMAL(10,2),
    status VARCHAR(20)
);

-- 创建分布式表
SELECT create_distributed_table('orders', 'user_id');

-- 创建引用表（小表，在所有节点复制）
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50),
    email VARCHAR(100)
);

SELECT create_reference_table('users');
```

### 2. Citus管理服务

```java
@Service
public class CitusManagementService {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    /**
     * 获取集群状态
     */
    public List<Map<String, Object>> getClusterStatus() {
        String sql = "SELECT * FROM citus_get_active_worker_nodes()";
        return jdbcTemplate.queryForList(sql);
    }
    
    /**
     * 获取分片分布信息
     */
    public List<Map<String, Object>> getShardDistribution(String tableName) {
        String sql = """
            SELECT 
                shardid,
                nodename,
                nodeport,
                shard_size
            FROM citus_shards 
            WHERE table_name = ?
            ORDER BY shardid
            """;
        return jdbcTemplate.queryForList(sql, tableName);
    }
    
    /**
     * 重新平衡分片
     */
    public void rebalanceShards() {
        String sql = "SELECT citus_rebalance_start()";
        jdbcTemplate.execute(sql);
    }
    
    /**
     * 获取查询统计
     */
    public List<Map<String, Object>> getQueryStats() {
        String sql = """
            SELECT 
                query,
                calls,
                total_time,
                mean_time
            FROM citus_stat_statements 
            ORDER BY total_time DESC 
            LIMIT 10
            """;
        return jdbcTemplate.queryForList(sql);
    }
}
```

## 性能优化策略

### 1. 分片键选择

```java
@Component
public class ShardingKeyOptimizer {
    
    /**
     * 分析分片键分布
     */
    public Map<String, Object> analyzeShardingKeyDistribution(String tableName, String shardingKey) {
        String sql = String.format("""
            SELECT 
                %s,
                COUNT(*) as count,
                COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() as percentage
            FROM %s 
            GROUP BY %s 
            ORDER BY count DESC
            LIMIT 20
            """, shardingKey, tableName, shardingKey);
        
        // 执行分析逻辑
        return Map.of(
            "distribution", "analysis_result",
            "recommendation", "optimization_suggestion"
        );
    }
    
    /**
     * 检查数据倾斜
     */
    public boolean checkDataSkew(String tableName) {
        String sql = """
            WITH shard_sizes AS (
                SELECT 
                    shardid,
                    pg_size_bytes(shard_size) as size_bytes
                FROM citus_shards 
                WHERE table_name = ?
            )
            SELECT 
                MAX(size_bytes) / NULLIF(MIN(size_bytes), 0) as skew_ratio
            FROM shard_sizes
            """;
        
        // 如果倾斜比例大于2，认为存在数据倾斜
        return true; // 简化实现
    }
}
```

### 2. 查询优化

```java
@Service
public class QueryOptimizationService {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    /**
     * 并行查询优化
     */
    public List<Order> parallelQuery(List<Long> userIds) {
        // 使用CompletableFuture并行查询多个分片
        List<CompletableFuture<List<Order>>> futures = userIds.stream()
            .map(userId -> CompletableFuture.supplyAsync(() -> {
                String sql = "SELECT * FROM orders WHERE user_id = ?";
                return jdbcTemplate.query(sql, 
                    (rs, rowNum) -> {
                        Order order = new Order();
                        order.setOrderId(rs.getLong("id"));
                        order.setUserId(rs.getLong("user_id"));
                        order.setOrderDate(rs.getDate("order_date").toLocalDate());
                        order.setAmount(rs.getBigDecimal("amount"));
                        order.setStatus(rs.getString("status"));
                        return order;
                    }, userId);
            }))
            .collect(Collectors.toList());
        
        return futures.stream()
            .map(CompletableFuture::join)
            .flatMap(List::stream)
            .collect(Collectors.toList());
    }
    
    /**
     * 批量操作优化
     */
    @Transactional
    public void optimizedBatchInsert(List<Order> orders) {
        // 按分片键分组
        Map<Long, List<Order>> groupedOrders = orders.stream()
            .collect(Collectors.groupingBy(Order::getUserId));
        
        // 并行插入每个分片
        groupedOrders.entrySet().parallelStream().forEach(entry -> {
            String sql = """
                INSERT INTO orders (user_id, order_date, amount, status) 
                VALUES (?, ?, ?, ?)
                """;
            
            List<Object[]> batchArgs = entry.getValue().stream()
                .map(order -> new Object[]{
                    order.getUserId(),
                    order.getOrderDate(),
                    order.getAmount(),
                    order.getStatus()
                })
                .collect(Collectors.toList());
            
            jdbcTemplate.batchUpdate(sql, batchArgs);
        });
    }
}
```

## 监控和运维

### 1. 集群监控

```java
@Component
public class PostgreSQLClusterMonitor {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    /**
     * 监控连接数
     */
    public Map<String, Object> monitorConnections() {
        String sql = """
            SELECT 
                datname,
                numbackends,
                xact_commit,
                xact_rollback,
                blks_read,
                blks_hit
            FROM pg_stat_database 
            WHERE datname NOT IN ('template0', 'template1', 'postgres')
            """;
        
        List<Map<String, Object>> stats = jdbcTemplate.queryForList(sql);
        return Map.of("database_stats", stats);
    }
    
    /**
     * 监控慢查询
     */
    public List<Map<String, Object>> getSlowQueries() {
        String sql = """
            SELECT 
                query,
                calls,
                total_time,
                mean_time,
                rows
            FROM pg_stat_statements 
            WHERE mean_time > 1000  -- 超过1秒的查询
            ORDER BY mean_time DESC 
            LIMIT 10
            """;
        
        return jdbcTemplate.queryForList(sql);
    }
    
    /**
     * 监控表大小
     */
    public List<Map<String, Object>> getTableSizes() {
        String sql = """
            SELECT 
                schemaname,
                tablename,
                pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
                pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
            FROM pg_tables 
            WHERE schemaname = 'public'
            ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
            """;
        
        return jdbcTemplate.queryForList(sql);
    }
}
```

### 2. 自动化运维脚本

```bash
#!/bin/bash
# postgresql_maintenance.sh

# 数据库连接配置
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="citus"
DB_USER="postgres"

# 备份函数
backup_database() {
    local backup_dir="/backup/postgresql/$(date +%Y%m%d)"
    mkdir -p $backup_dir
    
    echo "开始备份数据库..."
    pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
        -f "$backup_dir/citus_backup_$(date +%Y%m%d_%H%M%S).sql"
    
    echo "备份完成: $backup_dir"
}

# 清理旧日志
cleanup_logs() {
    echo "清理30天前的日志文件..."
    find /var/log/postgresql -name "*.log" -mtime +30 -delete
    echo "日志清理完成"
}

# 重建索引
reindex_tables() {
    echo "重建索引..."
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "REINDEX DATABASE $DB_NAME;"
    echo "索引重建完成"
}

# 更新统计信息
update_statistics() {
    echo "更新统计信息..."
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "ANALYZE;"
    echo "统计信息更新完成"
}

# 检查分片平衡
check_shard_balance() {
    echo "检查分片平衡状态..."
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
        SELECT 
            nodename,
            COUNT(*) as shard_count,
            SUM(shard_size::bigint) as total_size
        FROM citus_shards 
        GROUP BY nodename
        ORDER BY nodename;
    "
}

# 主函数
main() {
    case $1 in
        "backup")
            backup_database
            ;;
        "cleanup")
            cleanup_logs
            ;;
        "reindex")
            reindex_tables
            ;;
        "analyze")
            update_statistics
            ;;
        "balance")
            check_shard_balance
            ;;
        "all")
            backup_database
            cleanup_logs
            update_statistics
            check_shard_balance
            ;;
        *)
            echo "用法: $0 {backup|cleanup|reindex|analyze|balance|all}"
            exit 1
            ;;
    esac
}

main $1
```

## 最佳实践

### 1. 分片设计原则

- **选择合适的分片键**：选择查询频繁且分布均匀的字段
- **避免跨分片事务**：尽量将相关数据放在同一分片
- **合理设置分片数量**：根据数据量和性能需求确定
- **监控数据倾斜**：定期检查分片间数据分布

### 2. 性能优化

- **使用连接池**：配置合适的连接池大小
- **批量操作**：减少网络往返次数
- **索引优化**：在分片键和查询字段上建立索引
- **查询路由**：优化查询以减少跨分片操作

### 3. 运维管理

- **定期备份**：制定完善的备份策略
- **监控告警**：设置关键指标监控
- **容量规划**：提前规划存储和计算资源
- **故障恢复**：建立快速故障恢复机制

## 总结

PostgreSQL分片技术为大规模数据处理提供了强大的解决方案。通过合理的架构设计、性能优化和运维管理，可以构建高性能、高可用的分布式数据库系统。选择合适的分片策略和工具，结合业务特点进行优化，是成功实施PostgreSQL分片的关键。