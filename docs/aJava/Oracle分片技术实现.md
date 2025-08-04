# Oracle分片技术实现

## 概述

Oracle分片（Oracle Sharding）是Oracle数据库的水平扩展解决方案，通过将数据分布到多个分片数据库中来实现线性扩展。Oracle Sharding支持系统管理分片、用户定义分片和复合分片等多种分片方法。

## Oracle分片架构

### 1. 分片架构组件

```sql
-- 分片目录配置
-- 1. 创建分片目录数据库
CREATE DATABASE shardcatalog
  USER SYS IDENTIFIED BY password
  USER SYSTEM IDENTIFIED BY password
  LOGFILE GROUP 1 ('/u01/app/oracle/oradata/shardcatalog/redo01.log') SIZE 100M,
          GROUP 2 ('/u01/app/oracle/oradata/shardcatalog/redo02.log') SIZE 100M
  MAXLOGFILES 5
  MAXLOGMEMBERS 5
  MAXLOGHISTORY 1
  MAXDATAFILES 100
  CHARACTER SET AL32UTF8
  NATIONAL CHARACTER SET AL16UTF16
  DATAFILE '/u01/app/oracle/oradata/shardcatalog/system01.dbf' SIZE 700M REUSE
  EXTENT MANAGEMENT LOCAL
  SYSAUX DATAFILE '/u01/app/oracle/oradata/shardcatalog/sysaux01.dbf' SIZE 550M REUSE
  DEFAULT TABLESPACE users
    DATAFILE '/u01/app/oracle/oradata/shardcatalog/users01.dbf' SIZE 500M REUSE AUTOEXTEND ON MAXSIZE UNLIMITED
  DEFAULT TEMPORARY TABLESPACE tempts1
    TEMPFILE '/u01/app/oracle/oradata/shardcatalog/temp01.dbf' SIZE 20M REUSE
  UNDO TABLESPACE undotbs1
    DATAFILE '/u01/app/oracle/oradata/shardcatalog/undotbs01.dbf' SIZE 200M REUSE AUTOEXTEND ON MAXSIZE UNLIMITED;
```

### 2. 分片配置脚本

```bash
#!/bin/bash
# oracle_sharding_setup.sh

# 环境变量
export ORACLE_HOME=/u01/app/oracle/product/19.0.0/dbhome_1
export PATH=$ORACLE_HOME/bin:$PATH
export ORACLE_SID=shardcatalog

# 创建分片目录
echo "配置分片目录..."
sqlplus / as sysdba << EOF
-- 启用分片
ALTER SYSTEM SET enable_ddl_logging=TRUE;
ALTER SYSTEM SET db_create_file_dest='/u01/app/oracle/oradata';

-- 创建分片目录用户
CREATE USER shard_admin IDENTIFIED BY password;
GRANT CONNECT, RESOURCE, DBA TO shard_admin;
GRANT GSMADMIN_ROLE TO shard_admin;
GRANT SYSDG, SYSBACKUP TO shard_admin;

-- 配置全局服务管理器
EXEC DBMS_GSM_FIX.validateShard;
EOF

# 配置全局服务管理器
echo "配置全局服务管理器..."
gdsctl << EOF
create gsm -gsm gsm1 -pwd password -catalog shardhost1:1521:shardcatalog -region region1
start gsm -gsm gsm1

-- 添加分片组
add shardgroup -shardgroup primary_shardgroup -deploy_as primary -region region1
add shardgroup -shardgroup standby_shardgroup -deploy_as standby -region region1

-- 添加分片
add shard -connect shardhost1:1521:shard1 -shardgroup primary_shardgroup
add shard -connect shardhost2:1521:shard2 -shardgroup primary_shardgroup
add shard -connect shardhost3:1521:shard3 -shardgroup standby_shardgroup

-- 部署分片
deploy
EOF

echo "Oracle分片配置完成"
```

### 3. Docker Compose部署

```yaml
# docker-compose.yml
version: '3.8'
services:
  # 分片目录数据库
  shard-catalog:
    image: oracle/database:19.3.0-ee
    environment:
      ORACLE_SID: shardcat
      ORACLE_PDB: shardcatpdb
      ORACLE_PWD: OraclePassword123
      ORACLE_CHARACTERSET: AL32UTF8
    ports:
      - "1521:1521"
      - "5500:5500"
    volumes:
      - shard_catalog_data:/opt/oracle/oradata
      - ./scripts:/opt/oracle/scripts/setup
    hostname: shard-catalog

  # 分片1
  shard1:
    image: oracle/database:19.3.0-ee
    environment:
      ORACLE_SID: shard1
      ORACLE_PDB: shard1pdb
      ORACLE_PWD: OraclePassword123
      ORACLE_CHARACTERSET: AL32UTF8
    ports:
      - "1522:1521"
    volumes:
      - shard1_data:/opt/oracle/oradata
    hostname: shard1
    depends_on:
      - shard-catalog

  # 分片2
  shard2:
    image: oracle/database:19.3.0-ee
    environment:
      ORACLE_SID: shard2
      ORACLE_PDB: shard2pdb
      ORACLE_PWD: OraclePassword123
      ORACLE_CHARACTERSET: AL32UTF8
    ports:
      - "1523:1521"
    volumes:
      - shard2_data:/opt/oracle/oradata
    hostname: shard2
    depends_on:
      - shard-catalog

  # 分片3
  shard3:
    image: oracle/database:19.3.0-ee
    environment:
      ORACLE_SID: shard3
      ORACLE_PDB: shard3pdb
      ORACLE_PWD: OraclePassword123
      ORACLE_CHARACTERSET: AL32UTF8
    ports:
      - "1524:1521"
    volumes:
      - shard3_data:/opt/oracle/oradata
    hostname: shard3
    depends_on:
      - shard-catalog

volumes:
  shard_catalog_data:
  shard1_data:
  shard2_data:
  shard3_data:
```

## Java应用集成

### 1. Maven依赖

```xml
<dependencies>
    <!-- Oracle JDBC驱动 -->
    <dependency>
        <groupId>com.oracle.database.jdbc</groupId>
        <artifactId>ojdbc8</artifactId>
        <version>21.7.0.0</version>
    </dependency>
    
    <!-- Oracle UCP连接池 -->
    <dependency>
        <groupId>com.oracle.database.jdbc</groupId>
        <artifactId>ucp</artifactId>
        <version>21.7.0.0</version>
    </dependency>
    
    <!-- Spring Boot Data JPA -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    
    <!-- Oracle分片客户端 -->
    <dependency>
        <groupId>com.oracle.database.sharding</groupId>
        <artifactId>oracle-sharding</artifactId>
        <version>21.7.0.0</version>
    </dependency>
</dependencies>
```

### 2. Spring Boot配置

```yaml
# application.yml
spring:
  datasource:
    # 分片目录连接
    catalog:
      url: jdbc:oracle:thin:@//localhost:1521/shardcatpdb
      username: shard_admin
      password: OraclePassword123
      driver-class-name: oracle.jdbc.OracleDriver
    
    # 分片连接池配置
    sharding:
      initial-pool-size: 5
      max-pool-size: 20
      min-pool-size: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000

  jpa:
    database-platform: org.hibernate.dialect.Oracle12cDialect
    hibernate:
      ddl-auto: validate
    show-sql: true
    properties:
      hibernate:
        format_sql: true
        use_sql_comments: true

# Oracle分片配置
oracle:
  sharding:
    catalog-url: jdbc:oracle:thin:@//localhost:1521/shardcatpdb
    service-name: sharded_service
    region: region1
    chunk-size: 1000
```

### 3. 分片数据源配置

```java
@Configuration
@EnableJpaRepositories(basePackages = "com.example.repository")
public class OracleShardingConfig {
    
    @Value("${oracle.sharding.catalog-url}")
    private String catalogUrl;
    
    @Value("${oracle.sharding.service-name}")
    private String serviceName;
    
    @Bean
    @Primary
    public DataSource shardingDataSource() {
        try {
            // 创建Oracle UCP连接池
            PoolDataSource pds = PoolDataSourceFactory.getPoolDataSource();
            pds.setConnectionFactoryClassName("oracle.jdbc.pool.OracleDataSource");
            pds.setURL(catalogUrl);
            pds.setUser("shard_admin");
            pds.setPassword("OraclePassword123");
            
            // 配置连接池参数
            pds.setInitialPoolSize(5);
            pds.setMaxPoolSize(20);
            pds.setMinPoolSize(5);
            pds.setConnectionWaitTimeout(30);
            pds.setInactiveConnectionTimeout(600);
            
            // 启用分片
            pds.setConnectionProperty("oracle.jdbc.enableSharding", "true");
            pds.setConnectionProperty("oracle.jdbc.shardingKey", "true");
            
            return pds;
        } catch (SQLException e) {
            throw new RuntimeException("Failed to create sharding data source", e);
        }
    }
    
    @Bean
    public JdbcTemplate shardingJdbcTemplate(@Qualifier("shardingDataSource") DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }
    
    @Bean
    public EntityManagerFactory entityManagerFactory(@Qualifier("shardingDataSource") DataSource dataSource) {
        LocalContainerEntityManagerFactoryBean factory = new LocalContainerEntityManagerFactoryBean();
        factory.setDataSource(dataSource);
        factory.setPackagesToScan("com.example.entity");
        factory.setJpaVendorAdapter(new HibernateJpaVendorAdapter());
        
        Properties jpaProperties = new Properties();
        jpaProperties.setProperty("hibernate.dialect", "org.hibernate.dialect.Oracle12cDialect");
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
@Table(name = "ORDERS")
@ShardingKey("customerId") // Oracle分片注解
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "order_seq")
    @SequenceGenerator(name = "order_seq", sequenceName = "ORDER_SEQ", allocationSize = 1)
    @Column(name = "ORDER_ID")
    private Long orderId;
    
    @Column(name = "CUSTOMER_ID")
    private Long customerId;
    
    @Column(name = "ORDER_DATE")
    private LocalDate orderDate;
    
    @Column(name = "AMOUNT")
    private BigDecimal amount;
    
    @Column(name = "STATUS")
    private String status;
    
    @Column(name = "REGION")
    private String region;
    
    // 构造函数
    public Order() {}
    
    public Order(Long customerId, LocalDate orderDate, BigDecimal amount, String status, String region) {
        this.customerId = customerId;
        this.orderDate = orderDate;
        this.amount = amount;
        this.status = status;
        this.region = region;
    }
    
    // Getter和Setter方法
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    
    public LocalDate getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDate orderDate) { this.orderDate = orderDate; }
    
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }
}
```

### 5. 分片服务实现

```java
@Service
@Transactional
public class OracleShardingService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    @Qualifier("shardingJdbcTemplate")
    private JdbcTemplate jdbcTemplate;
    
    /**
     * 创建分片表
     */
    public void createShardedTables() {
        String createTableSql = """
            CREATE SHARDED TABLE orders (
                order_id NUMBER(19) PRIMARY KEY,
                customer_id NUMBER(19) NOT NULL,
                order_date DATE NOT NULL,
                amount NUMBER(10,2),
                status VARCHAR2(20),
                region VARCHAR2(50)
            )
            PARTITION BY CONSISTENT HASH (customer_id)
            PARTITIONS AUTO
            TABLESPACE SET ts1
            """; 
        
        jdbcTemplate.execute(createTableSql);
        
        // 创建序列
        String createSequenceSql = """
            CREATE SEQUENCE order_seq 
            START WITH 1 
            INCREMENT BY 1 
            NOCACHE
            """;
        
        jdbcTemplate.execute(createSequenceSql);
    }
    
    /**
     * 使用分片键插入数据
     */
    public Order createOrder(Long customerId, BigDecimal amount, String region) {
        try {
            // 获取分片连接
            Connection connection = jdbcTemplate.getDataSource().getConnection();
            
            // 设置分片键
            OracleShardingKey shardingKey = connection.unwrap(OracleConnection.class)
                .createShardingKeyBuilder()
                .subkey(customerId, JDBCType.BIGINT)
                .build();
            
            // 获取分片连接
            Connection shardConnection = connection.unwrap(OracleConnection.class)
                .createConnectionBuilder()
                .shardingKey(shardingKey)
                .build();
            
            // 执行插入
            String sql = """
                INSERT INTO orders (order_id, customer_id, order_date, amount, status, region) 
                VALUES (order_seq.NEXTVAL, ?, SYSDATE, ?, 'PENDING', ?)
                """;
            
            try (PreparedStatement stmt = shardConnection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                stmt.setLong(1, customerId);
                stmt.setBigDecimal(2, amount);
                stmt.setString(3, region);
                
                int result = stmt.executeUpdate();
                
                if (result > 0) {
                    try (ResultSet rs = stmt.getGeneratedKeys()) {
                        if (rs.next()) {
                            Order order = new Order();
                            order.setOrderId(rs.getLong(1));
                            order.setCustomerId(customerId);
                            order.setOrderDate(LocalDate.now());
                            order.setAmount(amount);
                            order.setStatus("PENDING");
                            order.setRegion(region);
                            return order;
                        }
                    }
                }
            }
            
            return null;
        } catch (SQLException e) {
            throw new RuntimeException("Failed to create order", e);
        }
    }
    
    /**
     * 根据客户ID查询订单
     */
    public List<Order> findOrdersByCustomerId(Long customerId) {
        String sql = """
            SELECT order_id, customer_id, order_date, amount, status, region 
            FROM orders 
            WHERE customer_id = ?
            ORDER BY order_date DESC
            """;
        
        return jdbcTemplate.query(sql, 
            (rs, rowNum) -> {
                Order order = new Order();
                order.setOrderId(rs.getLong("order_id"));
                order.setCustomerId(rs.getLong("customer_id"));
                order.setOrderDate(rs.getDate("order_date").toLocalDate());
                order.setAmount(rs.getBigDecimal("amount"));
                order.setStatus(rs.getString("status"));
                order.setRegion(rs.getString("region"));
                return order;
            }, customerId);
    }
    
    /**
     * 跨分片聚合查询
     */
    public Map<String, Object> getOrderStatistics() {
        String sql = """
            SELECT 
                COUNT(*) as total_orders,
                SUM(amount) as total_amount,
                AVG(amount) as avg_amount,
                region,
                COUNT(*) as region_count
            FROM orders 
            GROUP BY region
            """;
        
        List<Map<String, Object>> regionStats = jdbcTemplate.queryForList(sql);
        
        // 计算总体统计
        String totalSql = """
            SELECT 
                COUNT(*) as total_orders,
                SUM(amount) as total_amount,
                AVG(amount) as avg_amount
            FROM orders
            """;
        
        Map<String, Object> totalStats = jdbcTemplate.queryForMap(totalSql);
        
        Map<String, Object> result = new HashMap<>();
        result.put("total_statistics", totalStats);
        result.put("region_statistics", regionStats);
        
        return result;
    }
    
    /**
     * 批量插入优化
     */
    @Transactional
    public void batchInsertOrders(List<Order> orders) {
        String sql = """
            INSERT INTO orders (order_id, customer_id, order_date, amount, status, region) 
            VALUES (order_seq.NEXTVAL, ?, ?, ?, ?, ?)
            """;
        
        List<Object[]> batchArgs = orders.stream()
            .map(order -> new Object[]{
                order.getCustomerId(),
                order.getOrderDate(),
                order.getAmount(),
                order.getStatus(),
                order.getRegion()
            })
            .collect(Collectors.toList());
        
        jdbcTemplate.batchUpdate(sql, batchArgs);
    }
}
```

## 分片管理和监控

### 1. 分片管理服务

```java
@Service
public class OracleShardManagementService {
    
    @Autowired
    @Qualifier("shardingJdbcTemplate")
    private JdbcTemplate jdbcTemplate;
    
    /**
     * 获取分片信息
     */
    public List<Map<String, Object>> getShardInfo() {
        String sql = """
            SELECT 
                shard_space,
                chunk_number,
                shard_group,
                status,
                connect_string
            FROM gv$shard_chunks
            ORDER BY shard_space, chunk_number
            """;
        
        return jdbcTemplate.queryForList(sql);
    }
    
    /**
     * 获取分片统计信息
     */
    public Map<String, Object> getShardStatistics() {
        String sql = """
            SELECT 
                shard_group,
                COUNT(*) as chunk_count,
                SUM(bytes) as total_bytes,
                AVG(bytes) as avg_bytes
            FROM gv$shard_chunks 
            GROUP BY shard_group
            """;
        
        List<Map<String, Object>> shardStats = jdbcTemplate.queryForList(sql);
        
        Map<String, Object> result = new HashMap<>();
        result.put("shard_statistics", shardStats);
        result.put("timestamp", LocalDateTime.now());
        
        return result;
    }
    
    /**
     * 检查分片健康状态
     */
    public List<Map<String, Object>> checkShardHealth() {
        String sql = """
            SELECT 
                shard_group,
                status,
                COUNT(*) as count
            FROM gv$shard_chunks 
            GROUP BY shard_group, status
            ORDER BY shard_group
            """;
        
        return jdbcTemplate.queryForList(sql);
    }
    
    /**
     * 重新平衡分片
     */
    public void rebalanceShards() {
        String sql = "BEGIN DBMS_SHARD.REBALANCE_CHUNKS; END;";
        jdbcTemplate.execute(sql);
    }
    
    /**
     * 添加新分片
     */
    public void addShard(String shardName, String connectString, String shardGroup) {
        String sql = String.format(
            "BEGIN DBMS_SHARD.ADD_SHARD('%s', '%s', '%s'); END;",
            shardName, connectString, shardGroup
        );
        jdbcTemplate.execute(sql);
    }
}
```

### 2. 性能监控

```java
@Component
public class OracleShardMonitor {
    
    @Autowired
    @Qualifier("shardingJdbcTemplate")
    private JdbcTemplate jdbcTemplate;
    
    /**
     * 监控分片性能
     */
    public Map<String, Object> getPerformanceMetrics() {
        // 查询执行统计
        String sqlStatsSql = """
            SELECT 
                sql_text,
                executions,
                elapsed_time,
                cpu_time,
                buffer_gets,
                disk_reads
            FROM v$sql 
            WHERE executions > 0 
            ORDER BY elapsed_time DESC 
            FETCH FIRST 10 ROWS ONLY
            """;
        
        List<Map<String, Object>> sqlStats = jdbcTemplate.queryForList(sqlStatsSql);
        
        // 会话统计
        String sessionStatsSql = """
            SELECT 
                COUNT(*) as total_sessions,
                COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_sessions,
                COUNT(CASE WHEN status = 'INACTIVE' THEN 1 END) as inactive_sessions
            FROM v$session
            """;
        
        Map<String, Object> sessionStats = jdbcTemplate.queryForMap(sessionStatsSql);
        
        // 等待事件统计
        String waitEventsSql = """
            SELECT 
                event,
                total_waits,
                total_timeouts,
                time_waited,
                average_wait
            FROM v$system_event 
            WHERE total_waits > 0 
            ORDER BY time_waited DESC 
            FETCH FIRST 10 ROWS ONLY
            """;
        
        List<Map<String, Object>> waitEvents = jdbcTemplate.queryForList(waitEventsSql);
        
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("sql_statistics", sqlStats);
        metrics.put("session_statistics", sessionStats);
        metrics.put("wait_events", waitEvents);
        metrics.put("timestamp", LocalDateTime.now());
        
        return metrics;
    }
    
    /**
     * 监控表空间使用情况
     */
    public List<Map<String, Object>> getTablespaceUsage() {
        String sql = """
            SELECT 
                ts.tablespace_name,
                ROUND(ts.total_mb, 2) as total_mb,
                ROUND(ts.used_mb, 2) as used_mb,
                ROUND(ts.free_mb, 2) as free_mb,
                ROUND((ts.used_mb / ts.total_mb) * 100, 2) as usage_percent
            FROM (
                SELECT 
                    tablespace_name,
                    SUM(bytes) / 1024 / 1024 as total_mb,
                    SUM(bytes) / 1024 / 1024 - NVL(f.free_mb, 0) as used_mb,
                    NVL(f.free_mb, 0) as free_mb
                FROM dba_data_files df
                LEFT JOIN (
                    SELECT 
                        tablespace_name,
                        SUM(bytes) / 1024 / 1024 as free_mb
                    FROM dba_free_space
                    GROUP BY tablespace_name
                ) f ON df.tablespace_name = f.tablespace_name
                GROUP BY df.tablespace_name, f.free_mb
            ) ts
            ORDER BY usage_percent DESC
            """;
        
        return jdbcTemplate.queryForList(sql);
    }
}
```

### 3. 自动化运维脚本

```bash
#!/bin/bash
# oracle_shard_maintenance.sh

# Oracle环境变量
export ORACLE_HOME=/u01/app/oracle/product/19.0.0/dbhome_1
export PATH=$ORACLE_HOME/bin:$PATH
export ORACLE_SID=shardcatalog

# 日志文件
LOG_FILE="/var/log/oracle/shard_maintenance_$(date +%Y%m%d).log"

# 记录日志函数
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a $LOG_FILE
}

# 备份分片目录
backup_shard_catalog() {
    log_message "开始备份分片目录..."
    
    local backup_dir="/backup/oracle/$(date +%Y%m%d)"
    mkdir -p $backup_dir
    
    expdp shard_admin/OraclePassword123@shardcatalog \
        directory=DATA_PUMP_DIR \
        dumpfile=shard_catalog_$(date +%Y%m%d_%H%M%S).dmp \
        logfile=shard_catalog_backup.log \
        full=y
    
    log_message "分片目录备份完成"
}

# 检查分片状态
check_shard_status() {
    log_message "检查分片状态..."
    
    sqlplus -s shard_admin/OraclePassword123@shardcatalog << EOF
SET PAGESIZE 0
SET FEEDBACK OFF
SET HEADING OFF

SELECT 'Shard Status Check:' FROM dual;
SELECT shard_group || ' - ' || status || ' - ' || COUNT(*) 
FROM gv\$shard_chunks 
GROUP BY shard_group, status;

SELECT 'Tablespace Usage:' FROM dual;
SELECT tablespace_name || ' - ' || ROUND((used_mb/total_mb)*100, 2) || '%'
FROM (
    SELECT 
        tablespace_name,
        SUM(bytes)/1024/1024 as total_mb,
        SUM(bytes)/1024/1024 - NVL(f.free_mb, 0) as used_mb
    FROM dba_data_files df
    LEFT JOIN (
        SELECT tablespace_name, SUM(bytes)/1024/1024 as free_mb
        FROM dba_free_space
        GROUP BY tablespace_name
    ) f ON df.tablespace_name = f.tablespace_name
    GROUP BY df.tablespace_name, f.free_mb
)
WHERE (used_mb/total_mb)*100 > 80;

EXIT;
EOF
    
    log_message "分片状态检查完成"
}

# 收集统计信息
collect_statistics() {
    log_message "收集统计信息..."
    
    sqlplus -s shard_admin/OraclePassword123@shardcatalog << EOF
EXEC DBMS_STATS.GATHER_SCHEMA_STATS('SHARD_ADMIN', cascade => TRUE);
EXIT;
EOF
    
    log_message "统计信息收集完成"
}

# 清理旧日志
cleanup_logs() {
    log_message "清理旧日志文件..."
    
    # 清理30天前的日志
    find /var/log/oracle -name "*.log" -mtime +30 -delete
    find $ORACLE_HOME/diag -name "*.trc" -mtime +7 -delete
    
    log_message "日志清理完成"
}

# 监控分片平衡
monitor_shard_balance() {
    log_message "监控分片平衡状态..."
    
    sqlplus -s shard_admin/OraclePassword123@shardcatalog << EOF
SET PAGESIZE 0
SET FEEDBACK OFF
SET HEADING OFF

SELECT 'Shard Balance Check:' FROM dual;
SELECT shard_group || ' - Chunks: ' || COUNT(*) || ' - Total Size: ' || ROUND(SUM(bytes)/1024/1024/1024, 2) || 'GB'
FROM gv\$shard_chunks
GROUP BY shard_group
ORDER BY shard_group;

-- 检查是否需要重新平衡
DECLARE
    max_chunks NUMBER;
    min_chunks NUMBER;
    chunk_diff NUMBER;
BEGIN
    SELECT MAX(chunk_count), MIN(chunk_count) 
    INTO max_chunks, min_chunks
    FROM (
        SELECT shard_group, COUNT(*) as chunk_count
        FROM gv\$shard_chunks
        GROUP BY shard_group
    );
    
    chunk_diff := max_chunks - min_chunks;
    
    IF chunk_diff > 10 THEN
        DBMS_OUTPUT.PUT_LINE('Warning: Shard imbalance detected. Difference: ' || chunk_diff);
        DBMS_OUTPUT.PUT_LINE('Consider running rebalance operation.');
    ELSE
        DBMS_OUTPUT.PUT_LINE('Shard balance is acceptable. Difference: ' || chunk_diff);
    END IF;
END;
/

EXIT;
EOF
    
    log_message "分片平衡监控完成"
}

# 主函数
main() {
    case $1 in
        "backup")
            backup_shard_catalog
            ;;
        "status")
            check_shard_status
            ;;
        "stats")
            collect_statistics
            ;;
        "cleanup")
            cleanup_logs
            ;;
        "balance")
            monitor_shard_balance
            ;;
        "all")
            backup_shard_catalog
            check_shard_status
            collect_statistics
            monitor_shard_balance
            cleanup_logs
            ;;
        *)
            echo "用法: $0 {backup|status|stats|cleanup|balance|all}"
            exit 1
            ;;
    esac
}

main $1
```

## 最佳实践

### 1. 分片设计原则

- **选择合适的分片键**：选择查询频繁且分布均匀的字段
- **避免热点数据**：确保数据在分片间均匀分布
- **考虑业务逻辑**：相关数据尽量放在同一分片
- **规划分片数量**：根据数据增长预期合理规划

### 2. 性能优化

- **使用分片键查询**：尽量在查询中包含分片键
- **避免跨分片事务**：设计时考虑事务边界
- **合理使用索引**：在分片键和查询字段上建立索引
- **批量操作优化**：使用批量插入和更新

### 3. 运维管理

- **定期备份**：制定完善的备份恢复策略
- **监控告警**：设置关键指标监控和告警
- **容量规划**：定期评估存储和性能需求
- **故障恢复**：建立快速故障恢复机制

### 4. 安全考虑

- **网络安全**：配置防火墙和网络隔离
- **访问控制**：实施细粒度的权限管理
- **数据加密**：启用透明数据加密（TDE）
- **审计日志**：启用数据库审计功能

## 总结

Oracle分片技术为企业级应用提供了强大的水平扩展能力。通过合理的架构设计、性能优化和运维管理，可以构建高性能、高可用的分布式数据库系统。Oracle Sharding的自动化管理功能和企业级特性，使其成为大型企业应用的理想选择。