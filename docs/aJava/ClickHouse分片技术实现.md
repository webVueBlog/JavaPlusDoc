# ClickHouse分片技术实现

## 概述

ClickHouse是一个用于在线分析处理(OLAP)的列式数据库管理系统，具有极高的查询性能。ClickHouse的分片机制通过分布式表和本地表的组合实现水平扩展，支持PB级数据的实时分析。

## ClickHouse架构

### 核心概念

- **Shard**: 数据分片，每个分片包含部分数据
- **Replica**: 副本，提供数据冗余和高可用
- **Distributed Table**: 分布式表，查询入口
- **Local Table**: 本地表，实际存储数据
- **ZooKeeper**: 协调服务，管理副本同步

### 分片架构图

```
分布式表 (Distributed)
├── Shard 1
│   ├── Replica 1 (本地表)
│   └── Replica 2 (本地表)
├── Shard 2
│   ├── Replica 1 (本地表)
│   └── Replica 2 (本地表)
└── Shard N
    ├── Replica 1 (本地表)
    └── Replica 2 (本地表)
```

## 环境搭建

### Docker Compose配置

```yaml
version: '3.8'
services:
  zookeeper:
    image: zookeeper:3.7
    container_name: clickhouse-zookeeper
    ports:
      - "2181:2181"
    environment:
      ZOO_MY_ID: 1
      ZOO_SERVERS: server.1=0.0.0.0:2888:3888;2181
    volumes:
      - zk_data:/data
      - zk_logs:/datalog

  clickhouse-01:
    image: clickhouse/clickhouse-server:23.8
    container_name: clickhouse-01
    hostname: clickhouse-01
    ports:
      - "8123:8123"  # HTTP接口
      - "9000:9000"  # Native接口
    volumes:
      - ./config/clickhouse-01:/etc/clickhouse-server
      - ch01_data:/var/lib/clickhouse
      - ch01_logs:/var/log/clickhouse-server
    depends_on:
      - zookeeper
    ulimits:
      nofile:
        soft: 262144
        hard: 262144

  clickhouse-02:
    image: clickhouse/clickhouse-server:23.8
    container_name: clickhouse-02
    hostname: clickhouse-02
    ports:
      - "8124:8123"  # HTTP接口
      - "9001:9000"  # Native接口
    volumes:
      - ./config/clickhouse-02:/etc/clickhouse-server
      - ch02_data:/var/lib/clickhouse
      - ch02_logs:/var/log/clickhouse-server
    depends_on:
      - zookeeper
    ulimits:
      nofile:
        soft: 262144
        hard: 262144

  clickhouse-03:
    image: clickhouse/clickhouse-server:23.8
    container_name: clickhouse-03
    hostname: clickhouse-03
    ports:
      - "8125:8123"  # HTTP接口
      - "9002:9000"  # Native接口
    volumes:
      - ./config/clickhouse-03:/etc/clickhouse-server
      - ch03_data:/var/lib/clickhouse
      - ch03_logs:/var/log/clickhouse-server
    depends_on:
      - zookeeper
    ulimits:
      nofile:
        soft: 262144
        hard: 262144

  clickhouse-04:
    image: clickhouse/clickhouse-server:23.8
    container_name: clickhouse-04
    hostname: clickhouse-04
    ports:
      - "8126:8123"  # HTTP接口
      - "9003:9000"  # Native接口
    volumes:
      - ./config/clickhouse-04:/etc/clickhouse-server
      - ch04_data:/var/lib/clickhouse
      - ch04_logs:/var/log/clickhouse-server
    depends_on:
      - zookeeper
    ulimits:
      nofile:
        soft: 262144
        hard: 262144

volumes:
  zk_data:
  zk_logs:
  ch01_data:
  ch01_logs:
  ch02_data:
  ch02_logs:
  ch03_data:
  ch03_logs:
  ch04_data:
  ch04_logs:
```

### ClickHouse配置文件

#### config/clickhouse-01/config.xml

```xml
<?xml version="1.0"?>
<clickhouse>
    <logger>
        <level>information</level>
        <log>/var/log/clickhouse-server/clickhouse-server.log</log>
        <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
        <size>1000M</size>
        <count>10</count>
    </logger>

    <http_port>8123</http_port>
    <tcp_port>9000</tcp_port>
    <mysql_port>9004</mysql_port>
    <postgresql_port>9005</postgresql_port>

    <listen_host>0.0.0.0</listen_host>

    <max_connections>4096</max_connections>
    <keep_alive_timeout>3</keep_alive_timeout>
    <max_concurrent_queries>100</max_concurrent_queries>
    <uncompressed_cache_size>8589934592</uncompressed_cache_size>
    <mark_cache_size>5368709120</mark_cache_size>

    <path>/var/lib/clickhouse/</path>
    <tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
    <user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
    <access_control_path>/var/lib/clickhouse/access/</access_control_path>

    <users_config>users.xml</users_config>

    <default_profile>default</default_profile>
    <default_database>default</default_database>

    <timezone>Asia/Shanghai</timezone>

    <mlock_executable>true</mlock_executable>

    <remote_servers>
        <cluster_2shards_2replicas>
            <shard>
                <replica>
                    <host>clickhouse-01</host>
                    <port>9000</port>
                </replica>
                <replica>
                    <host>clickhouse-02</host>
                    <port>9000</port>
                </replica>
            </shard>
            <shard>
                <replica>
                    <host>clickhouse-03</host>
                    <port>9000</port>
                </replica>
                <replica>
                    <host>clickhouse-04</host>
                    <port>9000</port>
                </replica>
            </shard>
        </cluster_2shards_2replicas>
    </remote_servers>

    <zookeeper>
        <node>
            <host>zookeeper</host>
            <port>2181</port>
        </node>
    </zookeeper>

    <macros>
        <shard>01</shard>
        <replica>replica_1</replica>
    </macros>

    <distributed_ddl>
        <path>/clickhouse/task_queue/ddl</path>
    </distributed_ddl>

    <compression>
        <case>
            <method>lz4</method>
        </case>
    </compression>
</clickhouse>
```

### 初始化脚本

```bash
#!/bin/bash
# init-clickhouse.sh

echo "创建ClickHouse配置目录..."
mkdir -p config/clickhouse-01 config/clickhouse-02 config/clickhouse-03 config/clickhouse-04

# 生成配置文件（每个节点的shard和replica不同）
generate_config() {
    local node=$1
    local shard=$2
    local replica=$3
    
    # 复制基础配置
    cp config/clickhouse-01/config.xml config/clickhouse-$node/config.xml
    
    # 修改macros
    sed -i "s/<shard>01<\/shard>/<shard>$shard<\/shard>/g" config/clickhouse-$node/config.xml
    sed -i "s/<replica>replica_1<\/replica>/<replica>$replica<\/replica>/g" config/clickhouse-$node/config.xml
    
    # 复制用户配置
    cp config/clickhouse-01/users.xml config/clickhouse-$node/users.xml
}

generate_config "02" "01" "replica_2"
generate_config "03" "02" "replica_1"
generate_config "04" "02" "replica_2"

echo "启动ClickHouse集群..."
docker-compose up -d

echo "等待服务启动..."
sleep 30

echo "创建分片表结构..."
docker exec -it clickhouse-01 clickhouse-client --query "
CREATE DATABASE IF EXISTS analytics ON CLUSTER cluster_2shards_2replicas;

-- 创建本地表
CREATE TABLE analytics.events_local ON CLUSTER cluster_2shards_2replicas
(
    event_id UInt64,
    user_id UInt64,
    event_type String,
    event_time DateTime,
    properties Map(String, String)
)
ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/events', '{replica}')
PARTITION BY toYYYYMM(event_time)
ORDER BY (user_id, event_time)
SETTINGS index_granularity = 8192;

-- 创建分布式表
CREATE TABLE analytics.events ON CLUSTER cluster_2shards_2replicas
(
    event_id UInt64,
    user_id UInt64,
    event_type String,
    event_time DateTime,
    properties Map(String, String)
)
ENGINE = Distributed(cluster_2shards_2replicas, analytics, events_local, sipHash64(user_id));
"

echo "ClickHouse集群初始化完成"
echo "ClickHouse节点访问地址:"
echo "  节点1: http://localhost:8123"
echo "  节点2: http://localhost:8124"
echo "  节点3: http://localhost:8125"
echo "  节点4: http://localhost:8126"
```

## Java应用集成

### Maven依赖

```xml
<dependencies>
    <dependency>
        <groupId>com.clickhouse</groupId>
        <artifactId>clickhouse-jdbc</artifactId>
        <version>0.4.6</version>
    </dependency>
    <dependency>
        <groupId>com.clickhouse</groupId>
        <artifactId>clickhouse-http-client</artifactId>
        <version>0.4.6</version>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-jdbc</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>com.alibaba</groupId>
        <artifactId>druid-spring-boot-starter</artifactId>
        <version>1.2.18</version>
    </dependency>
</dependencies>
```

### Spring Boot配置

```java
@Configuration
@EnableConfigurationProperties(ClickHouseProperties.class)
public class ClickHouseConfig {
    
    @Autowired
    private ClickHouseProperties clickHouseProperties;
    
    @Bean
    @Primary
    public DataSource clickHouseDataSource() {
        DruidDataSource dataSource = new DruidDataSource();
        
        // 连接配置
        dataSource.setUrl(clickHouseProperties.getUrl());
        dataSource.setUsername(clickHouseProperties.getUsername());
        dataSource.setPassword(clickHouseProperties.getPassword());
        dataSource.setDriverClassName("com.clickhouse.jdbc.ClickHouseDriver");
        
        // 连接池配置
        dataSource.setInitialSize(clickHouseProperties.getInitialSize());
        dataSource.setMaxActive(clickHouseProperties.getMaxActive());
        dataSource.setMinIdle(clickHouseProperties.getMinIdle());
        dataSource.setMaxWait(clickHouseProperties.getMaxWait());
        
        // ClickHouse特定配置
        dataSource.addConnectionProperty("socket_timeout", "300000");
        dataSource.addConnectionProperty("connection_timeout", "10000");
        dataSource.addConnectionProperty("compress", "true");
        dataSource.addConnectionProperty("decompress", "true");
        
        return dataSource;
    }
    
    @Bean
    public JdbcTemplate clickHouseJdbcTemplate(@Qualifier("clickHouseDataSource") DataSource dataSource) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        jdbcTemplate.setQueryTimeout(300); // 5分钟超时
        return jdbcTemplate;
    }
}

@ConfigurationProperties(prefix = "clickhouse")
@Data
public class ClickHouseProperties {
    private String url = "jdbc:clickhouse://localhost:8123/analytics";
    private String username = "default";
    private String password = "";
    private int initialSize = 5;
    private int maxActive = 20;
    private int minIdle = 5;
    private long maxWait = 60000;
}
```

### ClickHouse操作服务

```java
@Service
@Slf4j
public class ClickHouseService {
    
    @Autowired
    private JdbcTemplate clickHouseJdbcTemplate;
    
    /**
     * 批量插入事件数据
     */
    public void batchInsertEvents(List<EventData> events) {
        String sql = "INSERT INTO analytics.events (event_id, user_id, event_type, event_time, properties) VALUES (?, ?, ?, ?, ?)";
        
        List<Object[]> batchArgs = events.stream()
            .map(event -> new Object[]{
                event.getEventId(),
                event.getUserId(),
                event.getEventType(),
                event.getEventTime(),
                event.getProperties()
            })
            .collect(Collectors.toList());
        
        try {
            int[] results = clickHouseJdbcTemplate.batchUpdate(sql, batchArgs);
            log.info("批量插入事件数据: {} 条", results.length);
            
        } catch (Exception e) {
            log.error("批量插入事件数据失败", e);
            throw new RuntimeException(e);
        }
    }
    
    /**
     * 查询用户事件统计
     */
    public List<UserEventStats> getUserEventStats(Long userId, LocalDate startDate, LocalDate endDate) {
        String sql = """
            SELECT 
                user_id,
                event_type,
                count() as event_count,
                uniq(event_id) as unique_events,
                min(event_time) as first_event,
                max(event_time) as last_event
            FROM analytics.events
            WHERE user_id = ?
              AND toDate(event_time) BETWEEN ? AND ?
            GROUP BY user_id, event_type
            ORDER BY event_count DESC
            """;
        
        try {
            return clickHouseJdbcTemplate.query(sql, 
                new Object[]{userId, startDate, endDate},
                (rs, rowNum) -> UserEventStats.builder()
                    .userId(rs.getLong("user_id"))
                    .eventType(rs.getString("event_type"))
                    .eventCount(rs.getLong("event_count"))
                    .uniqueEvents(rs.getLong("unique_events"))
                    .firstEvent(rs.getTimestamp("first_event").toLocalDateTime())
                    .lastEvent(rs.getTimestamp("last_event").toLocalDateTime())
                    .build()
            );
            
        } catch (Exception e) {
            log.error("查询用户事件统计失败", e);
            throw new RuntimeException(e);
        }
    }
    
    /**
     * 实时事件分析
     */
    public List<EventAnalytics> getRealTimeEventAnalytics(int minutes) {
        String sql = """
            SELECT 
                event_type,
                count() as total_events,
                uniq(user_id) as unique_users,
                avg(toUnixTimestamp(now()) - toUnixTimestamp(event_time)) as avg_delay_seconds
            FROM analytics.events
            WHERE event_time >= now() - INTERVAL ? MINUTE
            GROUP BY event_type
            ORDER BY total_events DESC
            """;
        
        try {
            return clickHouseJdbcTemplate.query(sql, 
                new Object[]{minutes},
                (rs, rowNum) -> EventAnalytics.builder()
                    .eventType(rs.getString("event_type"))
                    .totalEvents(rs.getLong("total_events"))
                    .uniqueUsers(rs.getLong("unique_users"))
                    .avgDelaySeconds(rs.getDouble("avg_delay_seconds"))
                    .build()
            );
            
        } catch (Exception e) {
            log.error("查询实时事件分析失败", e);
            throw new RuntimeException(e);
        }
    }
    
    /**
     * 漏斗分析
     */
    public FunnelAnalysisResult getFunnelAnalysis(List<String> steps, int windowHours) {
        StringBuilder sql = new StringBuilder();
        sql.append("SELECT \n");
        
        // 构建漏斗查询
        for (int i = 0; i < steps.size(); i++) {
            if (i > 0) sql.append(",\n");
            sql.append(String.format(
                "    countIf(event_type = '%s') as step_%d", 
                steps.get(i), i + 1
            ));
        }
        
        sql.append("\nFROM (\n");
        sql.append("    SELECT user_id, event_type, event_time\n");
        sql.append("    FROM analytics.events\n");
        sql.append("    WHERE event_type IN (");
        
        for (int i = 0; i < steps.size(); i++) {
            if (i > 0) sql.append(", ");
            sql.append("'").append(steps.get(i)).append("'");
        }
        
        sql.append(")\n");
        sql.append("      AND event_time >= now() - INTERVAL ? HOUR\n");
        sql.append("    ORDER BY user_id, event_time\n");
        sql.append(") GROUP BY user_id\n");
        sql.append("HAVING step_1 > 0");
        
        try {
            List<Map<String, Object>> results = clickHouseJdbcTemplate.queryForList(
                sql.toString(), windowHours
            );
            
            return buildFunnelResult(steps, results);
            
        } catch (Exception e) {
            log.error("漏斗分析查询失败", e);
            throw new RuntimeException(e);
        }
    }
    
    private FunnelAnalysisResult buildFunnelResult(List<String> steps, List<Map<String, Object>> results) {
        List<FunnelStep> funnelSteps = new ArrayList<>();
        
        for (int i = 0; i < steps.size(); i++) {
            String stepKey = "step_" + (i + 1);
            long userCount = results.stream()
                .mapToLong(row -> ((Number) row.get(stepKey)).longValue())
                .sum();
            
            double conversionRate = i == 0 ? 100.0 : 
                (double) userCount / funnelSteps.get(0).getUserCount() * 100;
            
            funnelSteps.add(FunnelStep.builder()
                .stepName(steps.get(i))
                .userCount(userCount)
                .conversionRate(conversionRate)
                .build());
        }
        
        return FunnelAnalysisResult.builder()
            .steps(funnelSteps)
            .totalUsers(funnelSteps.get(0).getUserCount())
            .overallConversionRate(
                (double) funnelSteps.get(funnelSteps.size() - 1).getUserCount() / 
                funnelSteps.get(0).getUserCount() * 100
            )
            .build();
    }
}
```

### 分片管理服务

```java
@Service
@Slf4j
public class ClickHouseShardingService {
    
    @Autowired
    private JdbcTemplate clickHouseJdbcTemplate;
    
    /**
     * 获取集群信息
     */
    public ClusterInfo getClusterInfo() {
        String sql = """
            SELECT 
                cluster,
                shard_num,
                replica_num,
                host_name,
                port,
                is_local,
                user,
                errors_count,
                slowdowns_count
            FROM system.clusters
            WHERE cluster = 'cluster_2shards_2replicas'
            ORDER BY shard_num, replica_num
            """;
        
        try {
            List<ClusterNode> nodes = clickHouseJdbcTemplate.query(sql, 
                (rs, rowNum) -> ClusterNode.builder()
                    .cluster(rs.getString("cluster"))
                    .shardNum(rs.getInt("shard_num"))
                    .replicaNum(rs.getInt("replica_num"))
                    .hostName(rs.getString("host_name"))
                    .port(rs.getInt("port"))
                    .isLocal(rs.getBoolean("is_local"))
                    .user(rs.getString("user"))
                    .errorsCount(rs.getLong("errors_count"))
                    .slowdownsCount(rs.getLong("slowdowns_count"))
                    .build()
            );
            
            return ClusterInfo.builder()
                .clusterName("cluster_2shards_2replicas")
                .nodes(nodes)
                .shardCount(nodes.stream().mapToInt(ClusterNode::getShardNum).max().orElse(0))
                .replicaCount(nodes.stream().mapToInt(ClusterNode::getReplicaNum).max().orElse(0))
                .build();
            
        } catch (Exception e) {
            log.error("获取集群信息失败", e);
            throw new RuntimeException(e);
        }
    }
    
    /**
     * 获取表分片分布
     */
    public List<TableShardInfo> getTableShardDistribution(String database, String table) {
        String sql = """
            SELECT 
                database,
                table,
                partition,
                name,
                rows,
                bytes_on_disk,
                data_compressed_bytes,
                data_uncompressed_bytes,
                marks,
                modification_time
            FROM system.parts
            WHERE database = ? AND table = ?
              AND active = 1
            ORDER BY partition, name
            """;
        
        try {
            return clickHouseJdbcTemplate.query(sql, 
                new Object[]{database, table},
                (rs, rowNum) -> TableShardInfo.builder()
                    .database(rs.getString("database"))
                    .table(rs.getString("table"))
                    .partition(rs.getString("partition"))
                    .partName(rs.getString("name"))
                    .rows(rs.getLong("rows"))
                    .bytesOnDisk(rs.getLong("bytes_on_disk"))
                    .dataCompressedBytes(rs.getLong("data_compressed_bytes"))
                    .dataUncompressedBytes(rs.getLong("data_uncompressed_bytes"))
                    .marks(rs.getLong("marks"))
                    .modificationTime(rs.getTimestamp("modification_time").toLocalDateTime())
                    .build()
            );
            
        } catch (Exception e) {
            log.error("获取表分片分布失败", e);
            throw new RuntimeException(e);
        }
    }
    
    /**
     * 优化表
     */
    public void optimizeTable(String database, String table) {
        String sql = String.format("OPTIMIZE TABLE %s.%s ON CLUSTER cluster_2shards_2replicas", 
                                  database, table);
        
        try {
            clickHouseJdbcTemplate.execute(sql);
            log.info("优化表完成: {}.{}", database, table);
            
        } catch (Exception e) {
            log.error("优化表失败: {}.{}", database, table, e);
            throw new RuntimeException(e);
        }
    }
    
    /**
     * 删除分区
     */
    public void dropPartition(String database, String table, String partition) {
        String sql = String.format(
            "ALTER TABLE %s.%s ON CLUSTER cluster_2shards_2replicas DROP PARTITION '%s'", 
            database, table, partition
        );
        
        try {
            clickHouseJdbcTemplate.execute(sql);
            log.info("删除分区完成: {}.{} partition {}", database, table, partition);
            
        } catch (Exception e) {
            log.error("删除分区失败: {}.{} partition {}", database, table, partition, e);
            throw new RuntimeException(e);
        }
    }
    
    /**
     * 监控分片负载
     */
    @Scheduled(fixedRate = 300000) // 5分钟
    public void monitorShardLoad() {
        try {
            String sql = """
                SELECT 
                    hostname() as host,
                    database,
                    table,
                    sum(rows) as total_rows,
                    sum(bytes_on_disk) as total_bytes,
                    count() as part_count
                FROM system.parts
                WHERE active = 1
                  AND database = 'analytics'
                GROUP BY hostname(), database, table
                ORDER BY total_bytes DESC
                """;
            
            List<ShardLoadInfo> loadInfos = clickHouseJdbcTemplate.query(sql,
                (rs, rowNum) -> ShardLoadInfo.builder()
                    .host(rs.getString("host"))
                    .database(rs.getString("database"))
                    .table(rs.getString("table"))
                    .totalRows(rs.getLong("total_rows"))
                    .totalBytes(rs.getLong("total_bytes"))
                    .partCount(rs.getInt("part_count"))
                    .build()
            );
            
            log.info("=== ClickHouse分片负载监控 ===");
            loadInfos.forEach(info -> {
                log.info("主机: {}, 表: {}.{}, 行数: {}, 大小: {} MB, 分区数: {}", 
                        info.getHost(), info.getDatabase(), info.getTable(),
                        info.getTotalRows(), info.getTotalBytes() / 1024 / 1024, 
                        info.getPartCount());
            });
            
            // 检查负载不均衡
            checkLoadBalance(loadInfos);
            
        } catch (Exception e) {
            log.error("监控分片负载失败", e);
        }
    }
    
    private void checkLoadBalance(List<ShardLoadInfo> loadInfos) {
        Map<String, List<ShardLoadInfo>> byTable = loadInfos.stream()
            .collect(Collectors.groupingBy(info -> info.getDatabase() + "." + info.getTable()));
        
        byTable.forEach((table, infos) -> {
            if (infos.size() > 1) {
                long maxBytes = infos.stream().mapToLong(ShardLoadInfo::getTotalBytes).max().orElse(0);
                long minBytes = infos.stream().mapToLong(ShardLoadInfo::getTotalBytes).min().orElse(0);
                
                if (maxBytes > 0 && (double) (maxBytes - minBytes) / maxBytes > 0.3) {
                    log.warn("表 {} 分片负载不均衡，最大: {} MB, 最小: {} MB", 
                            table, maxBytes / 1024 / 1024, minBytes / 1024 / 1024);
                }
            }
        });
    }
}
```

## 性能优化策略

### 1. 分片键选择

```java
@Component
public class ShardingKeyOptimizer {
    
    /**
     * 用户ID分片（均匀分布）
     */
    public String getUserShardingKey() {
        return "sipHash64(user_id)";
    }
    
    /**
     * 时间+用户ID复合分片
     */
    public String getTimeUserShardingKey() {
        return "sipHash64(concat(toString(toYYYYMM(event_time)), toString(user_id)))";
    }
    
    /**
     * 随机分片（最均匀但失去局部性）
     */
    public String getRandomShardingKey() {
        return "rand()";
    }
    
    /**
     * 分析分片键分布
     */
    public ShardingAnalysis analyzeShardingDistribution(String table, String shardingKey) {
        String sql = String.format("""
            SELECT 
                %s %% 100 as shard_bucket,
                count() as record_count,
                sum(bytes_on_disk) as total_bytes
            FROM %s
            GROUP BY shard_bucket
            ORDER BY shard_bucket
            """, shardingKey, table);
        
        // 执行查询并分析分布均匀性
        // 返回分析结果
        return new ShardingAnalysis();
    }
}
```

### 2. 查询优化

```java
@Service
public class ClickHouseQueryOptimizer {
    
    @Autowired
    private JdbcTemplate clickHouseJdbcTemplate;
    
    /**
     * 并行查询优化
     */
    public <T> List<T> parallelQuery(String baseQuery, List<String> conditions, 
                                    RowMapper<T> rowMapper) {
        List<CompletableFuture<List<T>>> futures = conditions.parallelStream()
            .map(condition -> CompletableFuture.supplyAsync(() -> {
                String sql = baseQuery + " WHERE " + condition;
                return clickHouseJdbcTemplate.query(sql, rowMapper);
            }))
            .collect(Collectors.toList());
        
        return futures.stream()
            .map(CompletableFuture::join)
            .flatMap(List::stream)
            .collect(Collectors.toList());
    }
    
    /**
     * 预聚合查询优化
     */
    public void createMaterializedView(String viewName, String sourceTable, String aggregation) {
        String sql = String.format("""
            CREATE MATERIALIZED VIEW %s ON CLUSTER cluster_2shards_2replicas
            ENGINE = SummingMergeTree()
            PARTITION BY toYYYYMM(event_date)
            ORDER BY (event_date, event_type)
            AS SELECT 
                toDate(event_time) as event_date,
                event_type,
                %s
            FROM %s
            GROUP BY event_date, event_type
            """, viewName, aggregation, sourceTable);
        
        try {
            clickHouseJdbcTemplate.execute(sql);
            log.info("创建物化视图成功: {}", viewName);
            
        } catch (Exception e) {
            log.error("创建物化视图失败: {}", viewName, e);
            throw new RuntimeException(e);
        }
    }
    
    /**
     * 查询计划分析
     */
    public QueryPlan analyzeQuery(String query) {
        String explainSql = "EXPLAIN PLAN " + query;
        
        try {
            List<Map<String, Object>> plan = clickHouseJdbcTemplate.queryForList(explainSql);
            
            return QueryPlan.builder()
                .originalQuery(query)
                .executionPlan(plan)
                .estimatedRows(extractEstimatedRows(plan))
                .estimatedCost(extractEstimatedCost(plan))
                .build();
            
        } catch (Exception e) {
            log.error("分析查询计划失败", e);
            throw new RuntimeException(e);
        }
    }
    
    private long extractEstimatedRows(List<Map<String, Object>> plan) {
        // 从执行计划中提取预估行数
        return 0;
    }
    
    private double extractEstimatedCost(List<Map<String, Object>> plan) {
        // 从执行计划中提取预估成本
        return 0.0;
    }
}
```

### 3. 批量写入优化

```java
@Service
public class ClickHouseBatchWriter {
    
    @Autowired
    private JdbcTemplate clickHouseJdbcTemplate;
    
    private static final int BATCH_SIZE = 10000;
    private final BlockingQueue<EventData> writeQueue = new LinkedBlockingQueue<>(100000);
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2);
    
    @PostConstruct
    public void startBatchWriter() {
        // 定时批量写入
        scheduler.scheduleAtFixedRate(this::flushBatch, 5, 5, TimeUnit.SECONDS);
        
        // 队列满时强制写入
        scheduler.scheduleAtFixedRate(this::checkQueueSize, 1, 1, TimeUnit.SECONDS);
    }
    
    /**
     * 异步写入事件
     */
    public boolean writeEventAsync(EventData event) {
        try {
            return writeQueue.offer(event, 100, TimeUnit.MILLISECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return false;
        }
    }
    
    /**
     * 批量刷新
     */
    private void flushBatch() {
        List<EventData> batch = new ArrayList<>();
        writeQueue.drainTo(batch, BATCH_SIZE);
        
        if (!batch.isEmpty()) {
            try {
                batchInsert(batch);
                log.debug("批量写入完成: {} 条记录", batch.size());
            } catch (Exception e) {
                log.error("批量写入失败: {} 条记录", batch.size(), e);
                // 重新入队或写入失败队列
                handleWriteFailure(batch);
            }
        }
    }
    
    private void checkQueueSize() {
        if (writeQueue.size() > 80000) { // 80%阈值
            log.warn("写入队列接近满载: {}", writeQueue.size());
            flushBatch();
        }
    }
    
    private void batchInsert(List<EventData> events) {
        String sql = "INSERT INTO analytics.events (event_id, user_id, event_type, event_time, properties) VALUES";
        
        StringBuilder values = new StringBuilder();
        for (int i = 0; i < events.size(); i++) {
            if (i > 0) values.append(",");
            EventData event = events.get(i);
            values.append(String.format(
                "(%d, %d, '%s', '%s', %s)",
                event.getEventId(),
                event.getUserId(),
                event.getEventType(),
                event.getEventTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")),
                formatProperties(event.getProperties())
            ));
        }
        
        clickHouseJdbcTemplate.execute(sql + values.toString());
    }
    
    private String formatProperties(Map<String, String> properties) {
        if (properties == null || properties.isEmpty()) {
            return "{}";
        }
        
        StringBuilder sb = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<String, String> entry : properties.entrySet()) {
            if (!first) sb.append(",");
            sb.append("'").append(entry.getKey()).append("':'").append(entry.getValue()).append("'");
            first = false;
        }
        sb.append("}");
        return sb.toString();
    }
    
    private void handleWriteFailure(List<EventData> batch) {
        // 实现失败重试逻辑
        log.error("处理写入失败的批次: {} 条记录", batch.size());
    }
    
    @PreDestroy
    public void shutdown() {
        scheduler.shutdown();
        try {
            if (!scheduler.awaitTermination(30, TimeUnit.SECONDS)) {
                scheduler.shutdownNow();
            }
        } catch (InterruptedException e) {
            scheduler.shutdownNow();
            Thread.currentThread().interrupt();
        }
        
        // 刷新剩余数据
        flushBatch();
    }
}
```

## 监控和运维

### 1. 集群监控服务

```java
@Service
@Slf4j
public class ClickHouseMonitoringService {
    
    @Autowired
    private JdbcTemplate clickHouseJdbcTemplate;
    
    @Autowired
    private MeterRegistry meterRegistry;
    
    /**
     * 监控集群状态
     */
    @Scheduled(fixedRate = 60000) // 1分钟
    public void monitorClusterStatus() {
        try {
            // 检查集群节点状态
            String sql = """
                SELECT 
                    cluster,
                    shard_num,
                    replica_num,
                    host_name,
                    port,
                    errors_count,
                    slowdowns_count
                FROM system.clusters
                WHERE cluster = 'cluster_2shards_2replicas'
                """;
            
            List<Map<String, Object>> nodes = clickHouseJdbcTemplate.queryForList(sql);
            
            // 记录指标
            Gauge.builder("clickhouse.cluster.nodes")
                .register(meterRegistry, nodes.size());
            
            long totalErrors = nodes.stream()
                .mapToLong(node -> ((Number) node.get("errors_count")).longValue())
                .sum();
            
            Gauge.builder("clickhouse.cluster.errors")
                .register(meterRegistry, totalErrors);
            
            // 检查异常节点
            nodes.stream()
                .filter(node -> ((Number) node.get("errors_count")).longValue() > 0)
                .forEach(node -> {
                    log.warn("节点异常: {}:{}, 错误数: {}", 
                            node.get("host_name"), node.get("port"), 
                            node.get("errors_count"));
                });
            
        } catch (Exception e) {
            log.error("监控集群状态失败", e);
        }
    }
    
    /**
     * 监控查询性能
     */
    @Scheduled(fixedRate = 120000) // 2分钟
    public void monitorQueryPerformance() {
        try {
            String sql = """
                SELECT 
                    query_duration_ms,
                    read_rows,
                    read_bytes,
                    written_rows,
                    written_bytes,
                    memory_usage,
                    query
                FROM system.query_log
                WHERE event_time >= now() - INTERVAL 2 MINUTE
                  AND type = 'QueryFinish'
                  AND query_duration_ms > 1000
                ORDER BY query_duration_ms DESC
                LIMIT 10
                """;
            
            List<Map<String, Object>> slowQueries = clickHouseJdbcTemplate.queryForList(sql);
            
            if (!slowQueries.isEmpty()) {
                log.warn("发现慢查询: {} 条", slowQueries.size());
                
                slowQueries.forEach(query -> {
                    log.warn("慢查询 - 耗时: {}ms, 读取行数: {}, 内存使用: {} MB", 
                            query.get("query_duration_ms"),
                            query.get("read_rows"),
                            ((Number) query.get("memory_usage")).longValue() / 1024 / 1024);
                });
            }
            
            // 记录平均查询性能
            recordAverageQueryMetrics();
            
        } catch (Exception e) {
            log.error("监控查询性能失败", e);
        }
    }
    
    private void recordAverageQueryMetrics() {
        String sql = """
            SELECT 
                avg(query_duration_ms) as avg_duration,
                avg(read_rows) as avg_read_rows,
                avg(memory_usage) as avg_memory
            FROM system.query_log
            WHERE event_time >= now() - INTERVAL 5 MINUTE
              AND type = 'QueryFinish'
            """;
        
        try {
            Map<String, Object> metrics = clickHouseJdbcTemplate.queryForMap(sql);
            
            Gauge.builder("clickhouse.query.avg_duration_ms")
                .register(meterRegistry, ((Number) metrics.get("avg_duration")).doubleValue());
            
            Gauge.builder("clickhouse.query.avg_read_rows")
                .register(meterRegistry, ((Number) metrics.get("avg_read_rows")).doubleValue());
            
            Gauge.builder("clickhouse.query.avg_memory_mb")
                .register(meterRegistry, ((Number) metrics.get("avg_memory")).doubleValue() / 1024 / 1024);
            
        } catch (Exception e) {
            log.debug("记录查询指标失败", e);
        }
    }
    
    /**
     * 监控存储使用情况
     */
    @Scheduled(fixedRate = 300000) // 5分钟
    public void monitorStorageUsage() {
        try {
            String sql = """
                SELECT 
                    database,
                    table,
                    sum(rows) as total_rows,
                    sum(bytes_on_disk) as total_bytes,
                    sum(data_compressed_bytes) as compressed_bytes,
                    sum(data_uncompressed_bytes) as uncompressed_bytes
                FROM system.parts
                WHERE active = 1
                  AND database = 'analytics'
                GROUP BY database, table
                ORDER BY total_bytes DESC
                """;
            
            List<Map<String, Object>> tables = clickHouseJdbcTemplate.queryForList(sql);
            
            log.info("=== ClickHouse存储使用情况 ===");
            tables.forEach(table -> {
                long totalBytes = ((Number) table.get("total_bytes")).longValue();
                long compressedBytes = ((Number) table.get("compressed_bytes")).longValue();
                double compressionRatio = compressedBytes > 0 ? 
                    (double) ((Number) table.get("uncompressed_bytes")).longValue() / compressedBytes : 0;
                
                log.info("表: {}.{}, 行数: {}, 大小: {} GB, 压缩比: {:.2f}", 
                        table.get("database"), table.get("table"),
                        table.get("total_rows"), totalBytes / 1024 / 1024 / 1024,
                        compressionRatio);
                
                // 记录指标
                Tags tags = Tags.of(
                    "database", table.get("database").toString(),
                    "table", table.get("table").toString()
                );
                
                Gauge.builder("clickhouse.table.rows")
                    .tags(tags)
                    .register(meterRegistry, ((Number) table.get("total_rows")).doubleValue());
                
                Gauge.builder("clickhouse.table.bytes")
                    .tags(tags)
                    .register(meterRegistry, totalBytes);
            });
            
        } catch (Exception e) {
            log.error("监控存储使用情况失败", e);
        }
    }
    
    /**
     * 自动清理过期数据
     */
    @Scheduled(cron = "0 0 2 * * ?") // 每天凌晨2点
    public void cleanupExpiredData() {
        try {
            // 删除30天前的分区
            LocalDate cutoffDate = LocalDate.now().minusDays(30);
            String partition = cutoffDate.format(DateTimeFormatter.ofPattern("yyyyMM"));
            
            String sql = String.format(
                "ALTER TABLE analytics.events_local ON CLUSTER cluster_2shards_2replicas DROP PARTITION '%s'",
                partition
            );
            
            clickHouseJdbcTemplate.execute(sql);
            log.info("清理过期数据完成: 分区 {}", partition);
            
        } catch (Exception e) {
            log.error("清理过期数据失败", e);
        }
    }
}
```

### 2. 自动化运维脚本

```bash
#!/bin/bash
# clickhouse-ops.sh - ClickHouse运维脚本

CLICKHOUSE_CLIENT="clickhouse-client"
CLUSTER="cluster_2shards_2replicas"

# 检查集群状态
check_cluster_status() {
    echo "检查ClickHouse集群状态..."
    
    $CLICKHOUSE_CLIENT --query "
        SELECT 
            cluster,
            shard_num,
            replica_num,
            host_name,
            port,
            errors_count,
            slowdowns_count
        FROM system.clusters
        WHERE cluster = '$CLUSTER'
        FORMAT PrettyCompact
    "
}

# 备份表数据
backup_table() {
    local database=$1
    local table=$2
    local backup_path=$3
    
    echo "备份表 $database.$table 到 $backup_path..."
    
    $CLICKHOUSE_CLIENT --query "
        INSERT INTO FUNCTION file('$backup_path', 'Native')
        SELECT * FROM $database.$table
    "
    
    if [ $? -eq 0 ]; then
        echo "表 $database.$table 备份成功"
    else
        echo "表 $database.$table 备份失败"
        return 1
    fi
}

# 优化表
optimize_table() {
    local database=$1
    local table=$2
    
    echo "优化表 $database.$table..."
    
    $CLICKHOUSE_CLIENT --query "
        OPTIMIZE TABLE $database.$table ON CLUSTER $CLUSTER FINAL
    "
    
    echo "表 $database.$table 优化完成"
}

# 检查副本同步状态
check_replication_status() {
    echo "检查副本同步状态..."
    
    $CLICKHOUSE_CLIENT --query "
        SELECT 
            database,
            table,
            replica_name,
            is_leader,
            is_readonly,
            absolute_delay,
            queue_size,
            inserts_in_queue,
            merges_in_queue
        FROM system.replicas
        WHERE database = 'analytics'
        FORMAT PrettyCompact
    "
}

# 清理旧分区
cleanup_old_partitions() {
    local database=$1
    local table=$2
    local days_to_keep=$3
    
    echo "清理 $database.$table 中 $days_to_keep 天前的分区..."
    
    # 计算要删除的分区
    cutoff_date=$(date -d "$days_to_keep days ago" +%Y%m)
    
    $CLICKHOUSE_CLIENT --query "
        SELECT DISTINCT partition
        FROM system.parts
        WHERE database = '$database' AND table = '$table'
          AND partition < '$cutoff_date'
          AND active = 1
    " | while read partition; do
        if [ -n "$partition" ]; then
            echo "删除分区: $partition"
            $CLICKHOUSE_CLIENT --query "
                ALTER TABLE $database.$table ON CLUSTER $CLUSTER DROP PARTITION '$partition'
            "
        fi
    done
    
    echo "分区清理完成"
}

# 监控慢查询
monitor_slow_queries() {
    local threshold_ms=${1:-5000}
    
    echo "监控慢查询 (阈值: ${threshold_ms}ms)..."
    
    $CLICKHOUSE_CLIENT --query "
        SELECT 
            event_time,
            query_duration_ms,
            read_rows,
            read_bytes,
            memory_usage,
            substring(query, 1, 100) as query_preview
        FROM system.query_log
        WHERE event_time >= now() - INTERVAL 1 HOUR
          AND type = 'QueryFinish'
          AND query_duration_ms > $threshold_ms
        ORDER BY query_duration_ms DESC
        LIMIT 20
        FORMAT PrettyCompact
    "
}

# 主函数
main() {
    case $1 in
        "status")
            check_cluster_status
            ;;
        "backup")
            backup_table $2 $3 $4
            ;;
        "optimize")
            optimize_table $2 $3
            ;;
        "replication")
            check_replication_status
            ;;
        "cleanup")
            cleanup_old_partitions $2 $3 $4
            ;;
        "slow-queries")
            monitor_slow_queries $2
            ;;
        *)
            echo "用法: $0 {status|backup|optimize|replication|cleanup|slow-queries} [参数]"
            echo "  status                              - 检查集群状态"
            echo "  backup <db> <table> <path>          - 备份表"
            echo "  optimize <db> <table>               - 优化表"
            echo "  replication                         - 检查副本状态"
            echo "  cleanup <db> <table> <days>         - 清理旧分区"
            echo "  slow-queries [threshold_ms]         - 监控慢查询"
            exit 1
            ;;
    esac
}

main $@
```

## 配置文件

### application.yml

```yaml
spring:
  application:
    name: clickhouse-sharding-demo

clickhouse:
  url: jdbc:clickhouse://localhost:8123/analytics
  username: default
  password: 
  initial-size: 5
  max-active: 20
  min-idle: 5
  max-wait: 60000

management:
  endpoints:
    web:
      exposure:
        include: health,metrics,prometheus
  metrics:
    export:
      prometheus:
        enabled: true

logging:
  level:
    com.clickhouse: INFO
    com.example.clickhouse: DEBUG
```

## 最佳实践

### 1. 表设计原则

- **分区键选择**: 使用时间字段进行分区，便于数据管理
- **排序键优化**: 根据查询模式设计ORDER BY键
- **分片键均匀**: 选择分布均匀的分片键避免热点
- **压缩算法**: 使用LZ4或ZSTD压缩算法

### 2. 查询优化

- **避免SELECT ***: 只查询需要的列
- **使用PREWHERE**: 在WHERE之前过滤数据
- **合理使用索引**: 创建适当的跳数索引
- **并行查询**: 利用分片并行处理

### 3. 写入优化

- **批量写入**: 使用大批次提高吞吐量
- **异步写入**: 使用队列缓冲写入请求
- **避免小批次**: 减少网络开销和合并压力
- **压缩传输**: 启用客户端压缩

### 4. 运维管理

- **监控指标**: 建立完善的监控体系
- **定期优化**: 定期执行OPTIMIZE操作
- **分区管理**: 及时清理过期分区
- **副本监控**: 监控副本同步状态

## 总结

ClickHouse分片技术通过分布式表和本地表的组合实现了高性能的OLAP查询能力。关键要点包括：

1. **分布式架构**: 通过分片和副本实现水平扩展和高可用
2. **列式存储**: 优化分析查询性能和压缩比
3. **智能分片**: 合理的分片键设计确保负载均衡
4. **实时写入**: 支持高并发实时数据写入
5. **运维自动化**: 完善的监控和自动化运维保证系统稳定性

在实际应用中，需要根据数据特点和查询模式优化表结构、分片策略和查询方式，并建立完善的监控和运维体系。