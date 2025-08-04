# SQL Server分片技术实现

## 概述

SQL Server分片技术主要通过分区表、Always On可用性组、弹性数据库工具等方式实现水平扩展。SQL Server提供了多种分片策略，包括表分区、数据库分片和弹性数据库池等解决方案。

## SQL Server分片架构

### 1. 分区表实现

```sql
-- 创建分区函数
CREATE PARTITION FUNCTION OrderDatePartitionFunction (datetime2)
AS RANGE RIGHT FOR VALUES 
('2023-01-01', '2023-04-01', '2023-07-01', '2023-10-01', '2024-01-01');

-- 创建分区方案
CREATE PARTITION SCHEME OrderDatePartitionScheme
AS PARTITION OrderDatePartitionFunction
TO (FileGroup1, FileGroup2, FileGroup3, FileGroup4, FileGroup5, FileGroup6);

-- 创建分区表
CREATE TABLE Orders (
    OrderId BIGINT IDENTITY(1,1) PRIMARY KEY,
    CustomerId BIGINT NOT NULL,
    OrderDate DATETIME2 NOT NULL,
    Amount DECIMAL(10,2),
    Status NVARCHAR(20),
    Region NVARCHAR(50)
) ON OrderDatePartitionScheme(OrderDate);

-- 创建分区索引
CREATE INDEX IX_Orders_CustomerId 
ON Orders(CustomerId) 
ON OrderDatePartitionScheme(OrderDate);

CREATE INDEX IX_Orders_Region 
ON Orders(Region, OrderDate) 
ON OrderDatePartitionScheme(OrderDate);
```

### 2. 弹性数据库配置

```sql
-- 创建分片映射管理器数据库
CREATE DATABASE ShardMapManager;

-- 创建分片数据库
CREATE DATABASE Shard1;
CREATE DATABASE Shard2;
CREATE DATABASE Shard3;

-- 在每个分片中创建表结构
USE Shard1;
CREATE TABLE Orders (
    OrderId BIGINT IDENTITY(1,1) PRIMARY KEY,
    CustomerId BIGINT NOT NULL,
    OrderDate DATETIME2 NOT NULL,
    Amount DECIMAL(10,2),
    Status NVARCHAR(20),
    Region NVARCHAR(50),
    ShardKey BIGINT NOT NULL
);

CREATE INDEX IX_Orders_ShardKey ON Orders(ShardKey);
CREATE INDEX IX_Orders_CustomerId ON Orders(CustomerId);
```

### 3. Docker Compose部署

```yaml
# docker-compose.yml
version: '3.8'
services:
  # SQL Server主实例
  sqlserver-master:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      SA_PASSWORD: "YourStrong@Passw0rd"
      ACCEPT_EULA: "Y"
      MSSQL_PID: "Developer"
    ports:
      - "1433:1433"
    volumes:
      - sqlserver_master_data:/var/opt/mssql
      - ./scripts:/scripts
    hostname: sqlserver-master
    networks:
      - sqlserver-network

  # 分片1
  sqlserver-shard1:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      SA_PASSWORD: "YourStrong@Passw0rd"
      ACCEPT_EULA: "Y"
      MSSQL_PID: "Developer"
    ports:
      - "1434:1433"
    volumes:
      - sqlserver_shard1_data:/var/opt/mssql
    hostname: sqlserver-shard1
    networks:
      - sqlserver-network

  # 分片2
  sqlserver-shard2:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      SA_PASSWORD: "YourStrong@Passw0rd"
      ACCEPT_EULA: "Y"
      MSSQL_PID: "Developer"
    ports:
      - "1435:1433"
    volumes:
      - sqlserver_shard2_data:/var/opt/mssql
    hostname: sqlserver-shard2
    networks:
      - sqlserver-network

  # 分片3
  sqlserver-shard3:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      SA_PASSWORD: "YourStrong@Passw0rd"
      ACCEPT_EULA: "Y"
      MSSQL_PID: "Developer"
    ports:
      - "1436:1433"
    volumes:
      - sqlserver_shard3_data:/var/opt/mssql
    hostname: sqlserver-shard3
    networks:
      - sqlserver-network

volumes:
  sqlserver_master_data:
  sqlserver_shard1_data:
  sqlserver_shard2_data:
  sqlserver_shard3_data:

networks:
  sqlserver-network:
    driver: bridge
```

## Java应用集成

### 1. Maven依赖

```xml
<dependencies>
    <!-- SQL Server JDBC驱动 -->
    <dependency>
        <groupId>com.microsoft.sqlserver</groupId>
        <artifactId>mssql-jdbc</artifactId>
        <version>12.4.2.jre11</version>
    </dependency>
    
    <!-- 弹性数据库客户端 -->
    <dependency>
        <groupId>com.microsoft.azure</groupId>
        <artifactId>elastic-db-tools</artifactId>
        <version>1.0.0</version>
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
    
    <!-- Spring Boot Starter -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter</artifactId>
    </dependency>
</dependencies>
```

### 2. Spring Boot配置

```yaml
# application.yml
spring:
  datasource:
    # 主数据源配置
    master:
      url: jdbc:sqlserver://localhost:1433;databaseName=ShardMapManager;encrypt=false
      username: sa
      password: YourStrong@Passw0rd
      driver-class-name: com.microsoft.sqlserver.jdbc.SQLServerDriver
    
    # 分片数据源配置
    shards:
      shard1:
        url: jdbc:sqlserver://localhost:1434;databaseName=Shard1;encrypt=false
        username: sa
        password: YourStrong@Passw0rd
      shard2:
        url: jdbc:sqlserver://localhost:1435;databaseName=Shard2;encrypt=false
        username: sa
        password: YourStrong@Passw0rd
      shard3:
        url: jdbc:sqlserver://localhost:1436;databaseName=Shard3;encrypt=false
        username: sa
        password: YourStrong@Passw0rd
    
    # 连接池配置
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      idle-timeout: 300000
      connection-timeout: 30000
      max-lifetime: 1800000

  jpa:
    database-platform: org.hibernate.dialect.SQLServer2012Dialect
    hibernate:
      ddl-auto: validate
    show-sql: true
    properties:
      hibernate:
        format_sql: true
        use_sql_comments: true

# SQL Server分片配置
sqlserver:
  sharding:
    shard-map-manager-server: localhost:1433
    shard-map-manager-database: ShardMapManager
    shard-map-name: OrderShardMap
    connection-string-template: "Server={0};Database={1};User Id=sa;Password=YourStrong@Passw0rd;Encrypt=false;"
```

### 3. 分片数据源配置

```java
@Configuration
@EnableJpaRepositories(basePackages = "com.example.repository")
public class SqlServerShardingConfig {
    
    @Value("${sqlserver.sharding.shard-map-manager-server}")
    private String shardMapManagerServer;
    
    @Value("${sqlserver.sharding.shard-map-manager-database}")
    private String shardMapManagerDatabase;
    
    @Value("${sqlserver.sharding.shard-map-name}")
    private String shardMapName;
    
    @Bean
    @Primary
    public DataSource masterDataSource() {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl("jdbc:sqlserver://localhost:1433;databaseName=ShardMapManager;encrypt=false");
        config.setUsername("sa");
        config.setPassword("YourStrong@Passw0rd");
        config.setDriverClassName("com.microsoft.sqlserver.jdbc.SQLServerDriver");
        config.setMaximumPoolSize(20);
        config.setMinimumIdle(5);
        config.setConnectionTimeout(30000);
        config.setIdleTimeout(300000);
        config.setMaxLifetime(1800000);
        
        return new HikariDataSource(config);
    }
    
    @Bean
    public Map<String, DataSource> shardDataSources() {
        Map<String, DataSource> shards = new HashMap<>();
        
        // 配置分片1
        HikariConfig shard1Config = new HikariConfig();
        shard1Config.setJdbcUrl("jdbc:sqlserver://localhost:1434;databaseName=Shard1;encrypt=false");
        shard1Config.setUsername("sa");
        shard1Config.setPassword("YourStrong@Passw0rd");
        shard1Config.setDriverClassName("com.microsoft.sqlserver.jdbc.SQLServerDriver");
        shard1Config.setMaximumPoolSize(20);
        shards.put("shard1", new HikariDataSource(shard1Config));
        
        // 配置分片2
        HikariConfig shard2Config = new HikariConfig();
        shard2Config.setJdbcUrl("jdbc:sqlserver://localhost:1435;databaseName=Shard2;encrypt=false");
        shard2Config.setUsername("sa");
        shard2Config.setPassword("YourStrong@Passw0rd");
        shard2Config.setDriverClassName("com.microsoft.sqlserver.jdbc.SQLServerDriver");
        shard2Config.setMaximumPoolSize(20);
        shards.put("shard2", new HikariDataSource(shard2Config));
        
        // 配置分片3
        HikariConfig shard3Config = new HikariConfig();
        shard3Config.setJdbcUrl("jdbc:sqlserver://localhost:1436;databaseName=Shard3;encrypt=false");
        shard3Config.setUsername("sa");
        shard3Config.setPassword("YourStrong@Passw0rd");
        shard3Config.setDriverClassName("com.microsoft.sqlserver.jdbc.SQLServerDriver");
        shard3Config.setMaximumPoolSize(20);
        shards.put("shard3", new HikariDataSource(shard3Config));
        
        return shards;
    }
    
    @Bean
    public JdbcTemplate masterJdbcTemplate(@Qualifier("masterDataSource") DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }
    
    @Bean
    public EntityManagerFactory entityManagerFactory(@Qualifier("masterDataSource") DataSource dataSource) {
        LocalContainerEntityManagerFactoryBean factory = new LocalContainerEntityManagerFactoryBean();
        factory.setDataSource(dataSource);
        factory.setPackagesToScan("com.example.entity");
        factory.setJpaVendorAdapter(new HibernateJpaVendorAdapter());
        
        Properties jpaProperties = new Properties();
        jpaProperties.setProperty("hibernate.dialect", "org.hibernate.dialect.SQLServer2012Dialect");
        jpaProperties.setProperty("hibernate.hbm2ddl.auto", "validate");
        jpaProperties.setProperty("hibernate.show_sql", "true");
        factory.setJpaProperties(jpaProperties);
        
        factory.afterPropertiesSet();
        return factory.getObject();
    }
}
```

### 4. 分片实体类

```java
@Entity
@Table(name = "Orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "OrderId")
    private Long orderId;
    
    @Column(name = "CustomerId")
    private Long customerId;
    
    @Column(name = "OrderDate")
    private LocalDateTime orderDate;
    
    @Column(name = "Amount")
    private BigDecimal amount;
    
    @Column(name = "Status")
    private String status;
    
    @Column(name = "Region")
    private String region;
    
    @Column(name = "ShardKey")
    private Long shardKey;
    
    // 构造函数
    public Order() {}
    
    public Order(Long customerId, LocalDateTime orderDate, BigDecimal amount, String status, String region) {
        this.customerId = customerId;
        this.orderDate = orderDate;
        this.amount = amount;
        this.status = status;
        this.region = region;
        this.shardKey = customerId; // 使用客户ID作为分片键
    }
    
    // Getter和Setter方法
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { 
        this.customerId = customerId;
        this.shardKey = customerId; // 自动设置分片键
    }
    
    public LocalDateTime getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDateTime orderDate) { this.orderDate = orderDate; }
    
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }
    
    public Long getShardKey() { return shardKey; }
    public void setShardKey(Long shardKey) { this.shardKey = shardKey; }
}
```

### 5. 分片路由服务

```java
@Service
public class SqlServerShardingService {
    
    @Autowired
    private Map<String, DataSource> shardDataSources;
    
    @Autowired
    @Qualifier("masterJdbcTemplate")
    private JdbcTemplate masterJdbcTemplate;
    
    private final Map<String, JdbcTemplate> shardJdbcTemplates = new HashMap<>();
    
    @PostConstruct
    public void initShardTemplates() {
        shardDataSources.forEach((shardName, dataSource) -> {
            shardJdbcTemplates.put(shardName, new JdbcTemplate(dataSource));
        });
    }
    
    /**
     * 根据分片键确定分片
     */
    public String determineShardKey(Long shardKey) {
        if (shardKey == null) {
            throw new IllegalArgumentException("Shard key cannot be null");
        }
        
        // 简单的哈希分片策略
        int shardIndex = (int) (shardKey % shardDataSources.size()) + 1;
        return "shard" + shardIndex;
    }
    
    /**
     * 获取分片的JdbcTemplate
     */
    public JdbcTemplate getShardJdbcTemplate(Long shardKey) {
        String shardName = determineShardKey(shardKey);
        return shardJdbcTemplates.get(shardName);
    }
    
    /**
     * 创建订单
     */
    @Transactional
    public Order createOrder(Order order) {
        JdbcTemplate shardTemplate = getShardJdbcTemplate(order.getShardKey());
        
        String sql = """
            INSERT INTO Orders (CustomerId, OrderDate, Amount, Status, Region, ShardKey) 
            OUTPUT INSERTED.OrderId
            VALUES (?, ?, ?, ?, ?, ?)
            """;
        
        Long orderId = shardTemplate.queryForObject(sql, Long.class,
            order.getCustomerId(),
            order.getOrderDate(),
            order.getAmount(),
            order.getStatus(),
            order.getRegion(),
            order.getShardKey());
        
        order.setOrderId(orderId);
        return order;
    }
    
    /**
     * 根据客户ID查询订单
     */
    public List<Order> findOrdersByCustomerId(Long customerId) {
        JdbcTemplate shardTemplate = getShardJdbcTemplate(customerId);
        
        String sql = """
            SELECT OrderId, CustomerId, OrderDate, Amount, Status, Region, ShardKey 
            FROM Orders 
            WHERE CustomerId = ?
            ORDER BY OrderDate DESC
            """;
        
        return shardTemplate.query(sql, this::mapRowToOrder, customerId);
    }
    
    /**
     * 跨分片查询
     */
    public List<Order> findOrdersByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        List<Order> allOrders = new ArrayList<>();
        
        String sql = """
            SELECT OrderId, CustomerId, OrderDate, Amount, Status, Region, ShardKey 
            FROM Orders 
            WHERE OrderDate BETWEEN ? AND ?
            ORDER BY OrderDate DESC
            """;
        
        // 并行查询所有分片
        List<CompletableFuture<List<Order>>> futures = shardJdbcTemplates.values().stream()
            .map(template -> CompletableFuture.supplyAsync(() -> 
                template.query(sql, this::mapRowToOrder, startDate, endDate)))
            .collect(Collectors.toList());
        
        // 合并结果
        futures.forEach(future -> {
            try {
                allOrders.addAll(future.get());
            } catch (Exception e) {
                throw new RuntimeException("Failed to query shard", e);
            }
        });
        
        // 按日期排序
        return allOrders.stream()
            .sorted((o1, o2) -> o2.getOrderDate().compareTo(o1.getOrderDate()))
            .collect(Collectors.toList());
    }
    
    /**
     * 跨分片聚合查询
     */
    public Map<String, Object> getOrderStatistics() {
        String sql = """
            SELECT 
                COUNT(*) as total_orders,
                SUM(Amount) as total_amount,
                AVG(Amount) as avg_amount,
                Region,
                COUNT(*) as region_count
            FROM Orders 
            GROUP BY Region
            """;
        
        List<Map<String, Object>> allRegionStats = new ArrayList<>();
        
        // 查询所有分片
        shardJdbcTemplates.values().parallelStream().forEach(template -> {
            List<Map<String, Object>> shardStats = template.queryForList(sql);
            synchronized (allRegionStats) {
                allRegionStats.addAll(shardStats);
            }
        });
        
        // 聚合结果
        Map<String, Map<String, Object>> regionAggregates = new HashMap<>();
        
        for (Map<String, Object> stat : allRegionStats) {
            String region = (String) stat.get("Region");
            regionAggregates.merge(region, stat, (existing, current) -> {
                Map<String, Object> merged = new HashMap<>(existing);
                merged.put("total_orders", 
                    ((Number) existing.get("total_orders")).longValue() + 
                    ((Number) current.get("total_orders")).longValue());
                merged.put("total_amount", 
                    ((BigDecimal) existing.get("total_amount")).add(
                    (BigDecimal) current.get("total_amount")));
                return merged;
            });
        }
        
        // 计算总体统计
        long totalOrders = regionAggregates.values().stream()
            .mapToLong(stat -> ((Number) stat.get("total_orders")).longValue())
            .sum();
        
        BigDecimal totalAmount = regionAggregates.values().stream()
            .map(stat -> (BigDecimal) stat.get("total_amount"))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        Map<String, Object> result = new HashMap<>();
        result.put("total_orders", totalOrders);
        result.put("total_amount", totalAmount);
        result.put("avg_amount", totalOrders > 0 ? totalAmount.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO);
        result.put("region_statistics", regionAggregates.values());
        
        return result;
    }
    
    /**
     * 批量插入优化
     */
    @Transactional
    public void batchInsertOrders(List<Order> orders) {
        // 按分片分组
        Map<String, List<Order>> ordersByShards = orders.stream()
            .collect(Collectors.groupingBy(order -> determineShardKey(order.getShardKey())));
        
        String sql = """
            INSERT INTO Orders (CustomerId, OrderDate, Amount, Status, Region, ShardKey) 
            VALUES (?, ?, ?, ?, ?, ?)
            """;
        
        // 并行批量插入
        ordersByShards.entrySet().parallelStream().forEach(entry -> {
            String shardName = entry.getKey();
            List<Order> shardOrders = entry.getValue();
            JdbcTemplate template = shardJdbcTemplates.get(shardName);
            
            List<Object[]> batchArgs = shardOrders.stream()
                .map(order -> new Object[]{
                    order.getCustomerId(),
                    order.getOrderDate(),
                    order.getAmount(),
                    order.getStatus(),
                    order.getRegion(),
                    order.getShardKey()
                })
                .collect(Collectors.toList());
            
            template.batchUpdate(sql, batchArgs);
        });
    }
    
    /**
     * 行映射器
     */
    private Order mapRowToOrder(ResultSet rs, int rowNum) throws SQLException {
        Order order = new Order();
        order.setOrderId(rs.getLong("OrderId"));
        order.setCustomerId(rs.getLong("CustomerId"));
        order.setOrderDate(rs.getTimestamp("OrderDate").toLocalDateTime());
        order.setAmount(rs.getBigDecimal("Amount"));
        order.setStatus(rs.getString("Status"));
        order.setRegion(rs.getString("Region"));
        order.setShardKey(rs.getLong("ShardKey"));
        return order;
    }
}
```

### 6. 分片管理服务

```java
@Service
public class SqlServerShardManagementService {
    
    @Autowired
    @Qualifier("masterJdbcTemplate")
    private JdbcTemplate masterJdbcTemplate;
    
    @Autowired
    private Map<String, DataSource> shardDataSources;
    
    /**
     * 初始化分片映射
     */
    public void initializeShardMap() {
        // 创建分片映射表
        String createShardMapSql = """
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ShardMap')
            CREATE TABLE ShardMap (
                ShardId INT PRIMARY KEY,
                ShardName NVARCHAR(50) NOT NULL,
                ConnectionString NVARCHAR(500) NOT NULL,
                MinShardKey BIGINT NOT NULL,
                MaxShardKey BIGINT NOT NULL,
                Status NVARCHAR(20) DEFAULT 'Active',
                CreatedDate DATETIME2 DEFAULT GETDATE()
            )
            """;
        
        masterJdbcTemplate.execute(createShardMapSql);
        
        // 插入分片映射信息
        String insertShardSql = """
            MERGE ShardMap AS target
            USING (VALUES 
                (1, 'shard1', 'Server=localhost,1434;Database=Shard1;User Id=sa;Password=YourStrong@Passw0rd;', 0, 333333333),
                (2, 'shard2', 'Server=localhost,1435;Database=Shard2;User Id=sa;Password=YourStrong@Passw0rd;', 333333334, 666666666),
                (3, 'shard3', 'Server=localhost,1436;Database=Shard3;User Id=sa;Password=YourStrong@Passw0rd;', 666666667, 999999999)
            ) AS source (ShardId, ShardName, ConnectionString, MinShardKey, MaxShardKey)
            ON target.ShardId = source.ShardId
            WHEN NOT MATCHED THEN
                INSERT (ShardId, ShardName, ConnectionString, MinShardKey, MaxShardKey)
                VALUES (source.ShardId, source.ShardName, source.ConnectionString, source.MinShardKey, source.MaxShardKey);
            """;
        
        masterJdbcTemplate.execute(insertShardSql);
    }
    
    /**
     * 获取分片信息
     */
    public List<Map<String, Object>> getShardInfo() {
        String sql = """
            SELECT 
                ShardId,
                ShardName,
                ConnectionString,
                MinShardKey,
                MaxShardKey,
                Status,
                CreatedDate
            FROM ShardMap
            ORDER BY ShardId
            """;
        
        return masterJdbcTemplate.queryForList(sql);
    }
    
    /**
     * 获取分片统计信息
     */
    public Map<String, Object> getShardStatistics() {
        List<Map<String, Object>> shardStats = new ArrayList<>();
        
        shardDataSources.entrySet().parallelStream().forEach(entry -> {
            String shardName = entry.getKey();
            DataSource dataSource = entry.getValue();
            JdbcTemplate template = new JdbcTemplate(dataSource);
            
            try {
                String sql = """
                    SELECT 
                        '" + shardName + "' as shard_name,
                        COUNT(*) as record_count,
                        SUM(CAST(Amount AS BIGINT)) as total_amount,
                        MIN(OrderDate) as min_date,
                        MAX(OrderDate) as max_date
                    FROM Orders
                    """;
                
                Map<String, Object> stat = template.queryForMap(sql);
                synchronized (shardStats) {
                    shardStats.add(stat);
                }
            } catch (Exception e) {
                Map<String, Object> errorStat = new HashMap<>();
                errorStat.put("shard_name", shardName);
                errorStat.put("error", e.getMessage());
                synchronized (shardStats) {
                    shardStats.add(errorStat);
                }
            }
        });
        
        Map<String, Object> result = new HashMap<>();
        result.put("shard_statistics", shardStats);
        result.put("timestamp", LocalDateTime.now());
        
        return result;
    }
    
    /**
     * 检查分片健康状态
     */
    public List<Map<String, Object>> checkShardHealth() {
        List<Map<String, Object>> healthStatus = new ArrayList<>();
        
        shardDataSources.entrySet().parallelStream().forEach(entry -> {
            String shardName = entry.getKey();
            DataSource dataSource = entry.getValue();
            
            Map<String, Object> status = new HashMap<>();
            status.put("shard_name", shardName);
            
            try {
                JdbcTemplate template = new JdbcTemplate(dataSource);
                template.queryForObject("SELECT 1", Integer.class);
                status.put("status", "HEALTHY");
                status.put("response_time", System.currentTimeMillis());
            } catch (Exception e) {
                status.put("status", "UNHEALTHY");
                status.put("error", e.getMessage());
            }
            
            synchronized (healthStatus) {
                healthStatus.add(status);
            }
        });
        
        return healthStatus;
    }
    
    /**
     * 重新平衡分片数据
     */
    public void rebalanceShards() {
        // 获取所有分片的数据分布
        Map<String, Long> shardCounts = new HashMap<>();
        
        shardDataSources.forEach((shardName, dataSource) -> {
            JdbcTemplate template = new JdbcTemplate(dataSource);
            Long count = template.queryForObject("SELECT COUNT(*) FROM Orders", Long.class);
            shardCounts.put(shardName, count);
        });
        
        // 计算平均值
        long totalRecords = shardCounts.values().stream().mapToLong(Long::longValue).sum();
        long avgRecords = totalRecords / shardCounts.size();
        
        // 识别需要重新平衡的分片
        shardCounts.forEach((shardName, count) -> {
            double deviation = Math.abs(count - avgRecords) / (double) avgRecords;
            if (deviation > 0.2) { // 偏差超过20%
                System.out.println(String.format("Shard %s needs rebalancing. Count: %d, Average: %d, Deviation: %.2f%%", 
                    shardName, count, avgRecords, deviation * 100));
            }
        });
    }
}
```

## 性能优化策略

### 1. 分区表优化

```sql
-- 分区表维护
-- 添加新分区
ALTER PARTITION SCHEME OrderDatePartitionScheme
NEXT USED FileGroup7;

ALTER PARTITION FUNCTION OrderDatePartitionFunction()
SPLIT RANGE ('2024-04-01');

-- 删除旧分区
ALTER PARTITION FUNCTION OrderDatePartitionFunction()
MERGE RANGE ('2023-01-01');

-- 分区切换（快速数据移动）
CREATE TABLE Orders_Archive (
    OrderId BIGINT,
    CustomerId BIGINT,
    OrderDate DATETIME2,
    Amount DECIMAL(10,2),
    Status NVARCHAR(20),
    Region NVARCHAR(50)
) ON FileGroup1;

-- 切换分区到归档表
ALTER TABLE Orders 
SWITCH PARTITION 1 TO Orders_Archive;
```

### 2. 索引优化

```sql
-- 创建分区对齐索引
CREATE INDEX IX_Orders_CustomerId_Partitioned
ON Orders(CustomerId, OrderDate)
ON OrderDatePartitionScheme(OrderDate);

-- 创建覆盖索引
CREATE INDEX IX_Orders_Status_Covering
ON Orders(Status, Region)
INCLUDE (OrderId, CustomerId, Amount)
ON OrderDatePartitionScheme(OrderDate);

-- 创建列存储索引（分析查询优化）
CREATE COLUMNSTORE INDEX CCI_Orders
ON Orders (OrderId, CustomerId, OrderDate, Amount, Status, Region)
ON OrderDatePartitionScheme(OrderDate);
```

### 3. 查询优化

```java
@Service
public class SqlServerQueryOptimizationService {
    
    @Autowired
    private SqlServerShardingService shardingService;
    
    /**
     * 分区消除查询
     */
    public List<Order> findOrdersByDateRangeOptimized(LocalDateTime startDate, LocalDateTime endDate) {
        // 使用分区消除的查询
        String sql = """
            SELECT OrderId, CustomerId, OrderDate, Amount, Status, Region, ShardKey 
            FROM Orders 
            WHERE OrderDate >= ? AND OrderDate < ?
            ORDER BY OrderDate DESC
            """;
        
        List<Order> results = new ArrayList<>();
        
        // 并行查询相关分片
        shardingService.getShardJdbcTemplates().values().parallelStream().forEach(template -> {
            List<Order> shardResults = template.query(sql, shardingService::mapRowToOrder, startDate, endDate);
            synchronized (results) {
                results.addAll(shardResults);
            }
        });
        
        return results.stream()
            .sorted((o1, o2) -> o2.getOrderDate().compareTo(o1.getOrderDate()))
            .collect(Collectors.toList());
    }
    
    /**
     * 使用提示的查询优化
     */
    public List<Order> findOrdersWithHints(Long customerId) {
        JdbcTemplate template = shardingService.getShardJdbcTemplate(customerId);
        
        String sql = """
            SELECT /*+ INDEX(Orders, IX_Orders_CustomerId) */ 
                OrderId, CustomerId, OrderDate, Amount, Status, Region, ShardKey 
            FROM Orders WITH (NOLOCK)
            WHERE CustomerId = ?
            ORDER BY OrderDate DESC
            """;
        
        return template.query(sql, shardingService::mapRowToOrder, customerId);
    }
    
    /**
     * 批量查询优化
     */
    public Map<Long, List<Order>> findOrdersByCustomerIds(List<Long> customerIds) {
        // 按分片分组客户ID
        Map<String, List<Long>> customerIdsByShards = customerIds.stream()
            .collect(Collectors.groupingBy(shardingService::determineShardKey));
        
        Map<Long, List<Order>> results = new ConcurrentHashMap<>();
        
        // 并行查询
        customerIdsByShards.entrySet().parallelStream().forEach(entry -> {
            String shardName = entry.getKey();
            List<Long> shardCustomerIds = entry.getValue();
            JdbcTemplate template = shardingService.getShardJdbcTemplates().get(shardName);
            
            String sql = """
                SELECT OrderId, CustomerId, OrderDate, Amount, Status, Region, ShardKey 
                FROM Orders 
                WHERE CustomerId IN (" + 
                shardCustomerIds.stream().map(id -> "?").collect(Collectors.joining(",")) + 
                ") ORDER BY CustomerId, OrderDate DESC
                """;
            
            List<Order> orders = template.query(sql, shardingService::mapRowToOrder, shardCustomerIds.toArray());
            
            // 按客户ID分组
            Map<Long, List<Order>> customerOrders = orders.stream()
                .collect(Collectors.groupingBy(Order::getCustomerId));
            
            results.putAll(customerOrders);
        });
        
        return results;
    }
}
```

## 监控和运维

### 1. 性能监控

```java
@Component
public class SqlServerShardMonitor {
    
    @Autowired
    private Map<String, DataSource> shardDataSources;
    
    /**
     * 监控分片性能指标
     */
    public Map<String, Object> getPerformanceMetrics() {
        List<Map<String, Object>> shardMetrics = new ArrayList<>();
        
        shardDataSources.entrySet().parallelStream().forEach(entry -> {
            String shardName = entry.getKey();
            DataSource dataSource = entry.getValue();
            JdbcTemplate template = new JdbcTemplate(dataSource);
            
            try {
                // 查询性能计数器
                String sql = """
                    SELECT 
                        '" + shardName + "' as shard_name,
                        (SELECT cntr_value FROM sys.dm_os_performance_counters 
                         WHERE counter_name = 'Batch Requests/sec') as batch_requests_per_sec,
                        (SELECT cntr_value FROM sys.dm_os_performance_counters 
                         WHERE counter_name = 'SQL Compilations/sec') as compilations_per_sec,
                        (SELECT cntr_value FROM sys.dm_os_performance_counters 
                         WHERE counter_name = 'Page life expectancy') as page_life_expectancy,
                        (SELECT COUNT(*) FROM sys.dm_exec_sessions WHERE is_user_process = 1) as active_sessions,
                        (SELECT COUNT(*) FROM sys.dm_exec_requests) as active_requests
                    """;
                
                Map<String, Object> metrics = template.queryForMap(sql);
                synchronized (shardMetrics) {
                    shardMetrics.add(metrics);
                }
            } catch (Exception e) {
                Map<String, Object> errorMetrics = new HashMap<>();
                errorMetrics.put("shard_name", shardName);
                errorMetrics.put("error", e.getMessage());
                synchronized (shardMetrics) {
                    shardMetrics.add(errorMetrics);
                }
            }
        });
        
        Map<String, Object> result = new HashMap<>();
        result.put("shard_metrics", shardMetrics);
        result.put("timestamp", LocalDateTime.now());
        
        return result;
    }
    
    /**
     * 监控等待统计
     */
    public List<Map<String, Object>> getWaitStatistics() {
        List<Map<String, Object>> allWaitStats = new ArrayList<>();
        
        shardDataSources.entrySet().parallelStream().forEach(entry -> {
            String shardName = entry.getKey();
            DataSource dataSource = entry.getValue();
            JdbcTemplate template = new JdbcTemplate(dataSource);
            
            try {
                String sql = """
                    SELECT TOP 10
                        '" + shardName + "' as shard_name,
                        wait_type,
                        waiting_tasks_count,
                        wait_time_ms,
                        max_wait_time_ms,
                        signal_wait_time_ms
                    FROM sys.dm_os_wait_stats
                    WHERE wait_time_ms > 0
                    ORDER BY wait_time_ms DESC
                    """;
                
                List<Map<String, Object>> waitStats = template.queryForList(sql);
                synchronized (allWaitStats) {
                    allWaitStats.addAll(waitStats);
                }
            } catch (Exception e) {
                // 记录错误但继续处理其他分片
                System.err.println("Error getting wait stats for " + shardName + ": " + e.getMessage());
            }
        });
        
        return allWaitStats;
    }
    
    /**
     * 监控索引使用情况
     */
    public List<Map<String, Object>> getIndexUsageStats() {
        List<Map<String, Object>> allIndexStats = new ArrayList<>();
        
        shardDataSources.entrySet().parallelStream().forEach(entry -> {
            String shardName = entry.getKey();
            DataSource dataSource = entry.getValue();
            JdbcTemplate template = new JdbcTemplate(dataSource);
            
            try {
                String sql = """
                    SELECT 
                        '" + shardName + "' as shard_name,
                        OBJECT_NAME(ius.object_id) as table_name,
                        i.name as index_name,
                        ius.user_seeks,
                        ius.user_scans,
                        ius.user_lookups,
                        ius.user_updates,
                        ius.last_user_seek,
                        ius.last_user_scan,
                        ius.last_user_lookup
                    FROM sys.dm_db_index_usage_stats ius
                    INNER JOIN sys.indexes i ON ius.object_id = i.object_id AND ius.index_id = i.index_id
                    WHERE OBJECT_NAME(ius.object_id) = 'Orders'
                    ORDER BY (ius.user_seeks + ius.user_scans + ius.user_lookups) DESC
                    """;
                
                List<Map<String, Object>> indexStats = template.queryForList(sql);
                synchronized (allIndexStats) {
                    allIndexStats.addAll(indexStats);
                }
            } catch (Exception e) {
                System.err.println("Error getting index stats for " + shardName + ": " + e.getMessage());
            }
        });
        
        return allIndexStats;
    }
}
```

### 2. 自动化运维脚本

```powershell
# sqlserver_shard_maintenance.ps1

# SQL Server连接参数
$ServerInstances = @(
    "localhost,1433",
    "localhost,1434", 
    "localhost,1435",
    "localhost,1436"
)
$Username = "sa"
$Password = "YourStrong@Passw0rd"
$LogPath = "C:\Logs\SQLServer"

# 创建日志目录
if (!(Test-Path $LogPath)) {
    New-Item -ItemType Directory -Path $LogPath -Force
}

# 记录日志函数
function Write-Log {
    param([string]$Message)
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogMessage = "$Timestamp - $Message"
    Write-Host $LogMessage
    Add-Content -Path "$LogPath\shard_maintenance_$(Get-Date -Format 'yyyyMMdd').log" -Value $LogMessage
}

# 备份分片数据库
function Backup-ShardDatabases {
    Write-Log "开始备份分片数据库..."
    
    $BackupPath = "C:\Backup\SQLServer\$(Get-Date -Format 'yyyyMMdd')"
    if (!(Test-Path $BackupPath)) {
        New-Item -ItemType Directory -Path $BackupPath -Force
    }
    
    $Databases = @("ShardMapManager", "Shard1", "Shard2", "Shard3")
    
    for ($i = 0; $i -lt $ServerInstances.Length; $i++) {
        $Server = $ServerInstances[$i]
        $Database = $Databases[$i]
        
        try {
            $BackupFile = "$BackupPath\${Database}_$(Get-Date -Format 'yyyyMMdd_HHmmss').bak"
            
            $Query = @"
BACKUP DATABASE [$Database] 
TO DISK = '$BackupFile'
WITH FORMAT, INIT, COMPRESSION;
"@
            
            Invoke-Sqlcmd -ServerInstance $Server -Username $Username -Password $Password -Query $Query -QueryTimeout 3600
            Write-Log "数据库 $Database 备份完成: $BackupFile"
        }
        catch {
            Write-Log "数据库 $Database 备份失败: $($_.Exception.Message)"
        }
    }
    
    Write-Log "分片数据库备份完成"
}

# 检查分片状态
function Check-ShardStatus {
    Write-Log "检查分片状态..."
    
    foreach ($Server in $ServerInstances) {
        try {
            $Query = @"
SELECT 
    @@SERVERNAME as server_name,
    DB_NAME() as database_name,
    (SELECT COUNT(*) FROM sys.dm_exec_sessions WHERE is_user_process = 1) as active_sessions,
    (SELECT COUNT(*) FROM sys.dm_exec_requests) as active_requests,
    (SELECT cntr_value FROM sys.dm_os_performance_counters WHERE counter_name = 'Page life expectancy') as page_life_expectancy
"@
            
            $Result = Invoke-Sqlcmd -ServerInstance $Server -Username $Username -Password $Password -Query $Query
            Write-Log "服务器 $Server 状态正常 - 活动会话: $($Result.active_sessions), 活动请求: $($Result.active_requests)"
        }
        catch {
            Write-Log "服务器 $Server 状态检查失败: $($_.Exception.Message)"
        }
    }
    
    Write-Log "分片状态检查完成"
}

# 更新统计信息
function Update-Statistics {
    Write-Log "更新统计信息..."
    
    $Databases = @("ShardMapManager", "Shard1", "Shard2", "Shard3")
    
    for ($i = 0; $i -lt $ServerInstances.Length; $i++) {
        $Server = $ServerInstances[$i]
        $Database = $Databases[$i]
        
        try {
            $Query = @"
USE [$Database];
EXEC sp_updatestats;
UPDATE STATISTICS Orders WITH FULLSCAN;
"@
            
            Invoke-Sqlcmd -ServerInstance $Server -Username $Username -Password $Password -Query $Query -QueryTimeout 1800
            Write-Log "数据库 $Database 统计信息更新完成"
        }
        catch {
            Write-Log "数据库 $Database 统计信息更新失败: $($_.Exception.Message)"
        }
    }
    
    Write-Log "统计信息更新完成"
}

# 清理旧日志
function Cleanup-Logs {
    Write-Log "清理旧日志文件..."
    
    # 清理30天前的日志文件
    $CutoffDate = (Get-Date).AddDays(-30)
    Get-ChildItem -Path $LogPath -Filter "*.log" | Where-Object { $_.LastWriteTime -lt $CutoffDate } | Remove-Item -Force
    
    # 清理SQL Server错误日志
    foreach ($Server in $ServerInstances) {
        try {
            $Query = "EXEC sp_cycle_errorlog;"
            Invoke-Sqlcmd -ServerInstance $Server -Username $Username -Password $Password -Query $Query
            Write-Log "服务器 $Server 错误日志已循环"
        }
        catch {
            Write-Log "服务器 $Server 错误日志循环失败: $($_.Exception.Message)"
        }
    }
    
    Write-Log "日志清理完成"
}

# 监控分片平衡
function Monitor-ShardBalance {
    Write-Log "监控分片平衡状态..."
    
    $ShardCounts = @()
    $ShardDatabases = @("Shard1", "Shard2", "Shard3")
    
    for ($i = 1; $i -lt $ServerInstances.Length; $i++) {
        $Server = $ServerInstances[$i]
        $Database = $ShardDatabases[$i-1]
        
        try {
            $Query = "USE [$Database]; SELECT COUNT(*) as record_count FROM Orders;"
            $Result = Invoke-Sqlcmd -ServerInstance $Server -Username $Username -Password $Password -Query $Query
            $ShardCounts += $Result.record_count
            Write-Log "分片 $Database 记录数: $($Result.record_count)"
        }
        catch {
            Write-Log "分片 $Database 记录数查询失败: $($_.Exception.Message)"
            $ShardCounts += 0
        }
    }
    
    # 计算平衡度
    if ($ShardCounts.Count -gt 0) {
        $TotalRecords = ($ShardCounts | Measure-Object -Sum).Sum
        $AvgRecords = $TotalRecords / $ShardCounts.Count
        
        for ($i = 0; $i -lt $ShardCounts.Count; $i++) {
            $Deviation = [Math]::Abs($ShardCounts[$i] - $AvgRecords) / $AvgRecords
            if ($Deviation -gt 0.2) {
                Write-Log "警告: 分片 Shard$($i+1) 数据不平衡，偏差: $([Math]::Round($Deviation * 100, 2))%"
            }
        }
    }
    
    Write-Log "分片平衡监控完成"
}

# 主函数
switch ($args[0]) {
    "backup" { Backup-ShardDatabases }
    "status" { Check-ShardStatus }
    "stats" { Update-Statistics }
    "cleanup" { Cleanup-Logs }
    "balance" { Monitor-ShardBalance }
    "all" { 
        Backup-ShardDatabases
        Check-ShardStatus
        Update-Statistics
        Monitor-ShardBalance
        Cleanup-Logs
    }
    default {
        Write-Host "用法: .\sqlserver_shard_maintenance.ps1 {backup|status|stats|cleanup|balance|all}"
        exit 1
    }
}
```

## 最佳实践

### 1. 分片设计原则

- **选择合适的分片键**：选择分布均匀且查询频繁的字段
- **避免热点分片**：确保数据在分片间均匀分布
- **考虑查询模式**：根据业务查询模式设计分片策略
- **规划扩展性**：预留足够的分片扩展空间

### 2. 性能优化

- **使用分区表**：利用SQL Server原生分区功能
- **优化索引策略**：创建分区对齐的索引
- **批量操作**：使用批量插入和更新提高性能
- **查询优化**：避免跨分片查询，使用查询提示

### 3. 运维管理

- **监控告警**：设置关键性能指标监控
- **定期维护**：定期更新统计信息和重建索引
- **备份策略**：制定完善的备份恢复计划
- **容量规划**：定期评估存储和性能需求

### 4. 高可用性

- **Always On配置**：使用Always On可用性组
- **故障转移**：配置自动故障转移
- **读写分离**：配置只读副本分担查询负载
- **灾难恢复**：建立异地灾备方案

## 总结

SQL Server分片技术通过分区表、弹性数据库工具和Always On等功能，为企业应用提供了强大的水平扩展能力。合理的架构设计、性能优化和运维管理，可以构建高性能、高可用的分布式数据库系统。SQL Server的企业级特性和丰富的管理工具，使其成为Windows平台上的理想选择。