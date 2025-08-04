# HBase分片技术实现

## 概述

HBase是基于Hadoop的分布式、可扩展的NoSQL数据库，采用列族存储模型。HBase的分片机制通过Region自动分割和负载均衡实现水平扩展，支持PB级数据存储和高并发访问。

## HBase架构

### 核心组件

- **HMaster**: 集群管理节点，负责Region分配和负载均衡
- **RegionServer**: 数据存储节点，管理多个Region
- **Region**: 数据分片单元，按行键范围分割
- **ZooKeeper**: 协调服务，维护集群状态
- **HDFS**: 底层存储系统

### 分片原理

```
表 (Table)
├── Region 1 [startKey, endKey1)
├── Region 2 [endKey1, endKey2)
├── Region 3 [endKey2, endKey3)
└── Region N [endKeyN-1, endKey)
```

## 环境搭建

### Docker Compose配置

```yaml
version: '3.8'
services:
  zookeeper:
    image: zookeeper:3.7
    container_name: hbase-zookeeper
    ports:
      - "2181:2181"
    environment:
      ZOO_MY_ID: 1
      ZOO_SERVERS: server.1=0.0.0.0:2888:3888;2181
    volumes:
      - zk_data:/data
      - zk_logs:/datalog

  hbase-master:
    image: harisekhon/hbase:2.4
    container_name: hbase-master
    hostname: hbase-master
    ports:
      - "16010:16010"  # HBase Master Web UI
      - "16000:16000"  # HBase Master RPC
    environment:
      HBASE_CONF_hbase_rootdir: hdfs://namenode:9000/hbase
      HBASE_CONF_hbase_cluster_distributed: 'true'
      HBASE_CONF_hbase_zookeeper_quorum: zookeeper:2181
      HBASE_CONF_hbase_master: hbase-master:16000
      HBASE_CONF_hbase_master_hostname: hbase-master
      HBASE_CONF_hbase_master_port: 16000
      HBASE_CONF_hbase_master_info_port: 16010
      HBASE_CONF_hbase_regionserver_port: 16020
      HBASE_CONF_hbase_regionserver_info_port: 16030
    depends_on:
      - zookeeper
      - namenode
    volumes:
      - hbase_data:/opt/hbase/data

  hbase-regionserver1:
    image: harisekhon/hbase:2.4
    container_name: hbase-regionserver1
    hostname: hbase-regionserver1
    ports:
      - "16030:16030"  # RegionServer Web UI
      - "16020:16020"  # RegionServer RPC
    environment:
      HBASE_CONF_hbase_rootdir: hdfs://namenode:9000/hbase
      HBASE_CONF_hbase_cluster_distributed: 'true'
      HBASE_CONF_hbase_zookeeper_quorum: zookeeper:2181
      HBASE_CONF_hbase_master: hbase-master:16000
      HBASE_CONF_hbase_regionserver_hostname: hbase-regionserver1
      HBASE_CONF_hbase_regionserver_port: 16020
      HBASE_CONF_hbase_regionserver_info_port: 16030
    depends_on:
      - hbase-master
    volumes:
      - hbase_rs1_data:/opt/hbase/data

  hbase-regionserver2:
    image: harisekhon/hbase:2.4
    container_name: hbase-regionserver2
    hostname: hbase-regionserver2
    ports:
      - "16031:16030"  # RegionServer Web UI
      - "16021:16020"  # RegionServer RPC
    environment:
      HBASE_CONF_hbase_rootdir: hdfs://namenode:9000/hbase
      HBASE_CONF_hbase_cluster_distributed: 'true'
      HBASE_CONF_hbase_zookeeper_quorum: zookeeper:2181
      HBASE_CONF_hbase_master: hbase-master:16000
      HBASE_CONF_hbase_regionserver_hostname: hbase-regionserver2
      HBASE_CONF_hbase_regionserver_port: 16020
      HBASE_CONF_hbase_regionserver_info_port: 16030
    depends_on:
      - hbase-master
    volumes:
      - hbase_rs2_data:/opt/hbase/data

  namenode:
    image: apache/hadoop:3.3.4
    container_name: hadoop-namenode
    hostname: namenode
    ports:
      - "9870:9870"  # Namenode Web UI
      - "9000:9000"  # Namenode RPC
    environment:
      CLUSTER_NAME: hadoop-cluster
    command: ["/opt/hadoop/bin/hdfs", "namenode"]
    volumes:
      - namenode_data:/opt/hadoop/data

  datanode:
    image: apache/hadoop:3.3.4
    container_name: hadoop-datanode
    hostname: datanode
    ports:
      - "9864:9864"  # Datanode Web UI
    environment:
      CLUSTER_NAME: hadoop-cluster
    command: ["/opt/hadoop/bin/hdfs", "datanode"]
    depends_on:
      - namenode
    volumes:
      - datanode_data:/opt/hadoop/data

volumes:
  zk_data:
  zk_logs:
  hbase_data:
  hbase_rs1_data:
  hbase_rs2_data:
  namenode_data:
  datanode_data:
```

### 初始化脚本

```bash
#!/bin/bash
# init-hbase.sh

echo "启动HBase集群..."
docker-compose up -d

echo "等待服务启动..."
sleep 60

echo "创建测试表..."
docker exec -it hbase-master hbase shell << 'EOF'
create 'user_table', 'info', 'stats'
create 'order_table', 'detail', 'payment'
create 'log_table', 'content'
list
EOF

echo "HBase集群初始化完成"
echo "HBase Master Web UI: http://localhost:16010"
echo "RegionServer1 Web UI: http://localhost:16030"
echo "RegionServer2 Web UI: http://localhost:16031"
```

## Java应用集成

### Maven依赖

```xml
<dependencies>
    <dependency>
        <groupId>org.apache.hbase</groupId>
        <artifactId>hbase-client</artifactId>
        <version>2.4.17</version>
    </dependency>
    <dependency>
        <groupId>org.apache.hbase</groupId>
        <artifactId>hbase-common</artifactId>
        <version>2.4.17</version>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>
```

### Spring Boot配置

```java
@Configuration
@EnableConfigurationProperties(HBaseProperties.class)
public class HBaseConfig {
    
    @Autowired
    private HBaseProperties hbaseProperties;
    
    @Bean
    public Connection hbaseConnection() throws IOException {
        org.apache.hadoop.conf.Configuration config = HBaseConfiguration.create();
        
        // 设置ZooKeeper连接
        config.set("hbase.zookeeper.quorum", hbaseProperties.getZookeeperQuorum());
        config.set("hbase.zookeeper.property.clientPort", hbaseProperties.getZookeeperPort());
        
        // 设置HBase连接参数
        config.set("hbase.client.retries.number", "3");
        config.set("hbase.client.pause", "1000");
        config.set("hbase.rpc.timeout", "60000");
        config.set("hbase.client.operation.timeout", "120000");
        config.set("hbase.client.scanner.timeout.period", "120000");
        
        return ConnectionFactory.createConnection(config);
    }
    
    @Bean
    public Admin hbaseAdmin(Connection connection) throws IOException {
        return connection.getAdmin();
    }
}

@ConfigurationProperties(prefix = "hbase")
@Data
public class HBaseProperties {
    private String zookeeperQuorum = "localhost";
    private String zookeeperPort = "2181";
    private int maxConnections = 100;
    private int coreConnections = 10;
}
```

### HBase操作服务

```java
@Service
@Slf4j
public class HBaseService {
    
    @Autowired
    private Connection connection;
    
    @Autowired
    private Admin admin;
    
    /**
     * 创建表
     */
    public void createTable(String tableName, String... columnFamilies) {
        try {
            TableName table = TableName.valueOf(tableName);
            
            if (admin.tableExists(table)) {
                log.warn("表已存在: {}", tableName);
                return;
            }
            
            TableDescriptorBuilder builder = TableDescriptorBuilder.newBuilder(table);
            
            // 添加列族
            for (String cf : columnFamilies) {
                ColumnFamilyDescriptor cfDesc = ColumnFamilyDescriptorBuilder
                    .newBuilder(Bytes.toBytes(cf))
                    .setMaxVersions(3)
                    .setTimeToLive(86400 * 30) // 30天TTL
                    .setCompressionType(Compression.Algorithm.SNAPPY)
                    .build();
                builder.setColumnFamily(cfDesc);
            }
            
            // 预分区
            byte[][] splitKeys = generateSplitKeys(tableName);
            admin.createTable(builder.build(), splitKeys);
            
            log.info("创建表成功: {}", tableName);
            
        } catch (IOException e) {
            log.error("创建表失败: {}", tableName, e);
            throw new RuntimeException(e);
        }
    }
    
    /**
     * 生成预分区键
     */
    private byte[][] generateSplitKeys(String tableName) {
        List<byte[]> splitKeys = new ArrayList<>();
        
        if (tableName.contains("user")) {
            // 用户表按用户ID前缀分区
            for (int i = 1; i < 16; i++) {
                splitKeys.add(Bytes.toBytes(String.format("%02x", i)));
            }
        } else if (tableName.contains("order")) {
            // 订单表按时间分区
            LocalDate start = LocalDate.now().minusMonths(12);
            for (int i = 0; i < 12; i++) {
                String partition = start.plusMonths(i).format(DateTimeFormatter.ofPattern("yyyyMM"));
                splitKeys.add(Bytes.toBytes(partition));
            }
        } else {
            // 默认按哈希分区
            for (int i = 1; i < 10; i++) {
                splitKeys.add(Bytes.toBytes(String.valueOf(i)));
            }
        }
        
        return splitKeys.toArray(new byte[0][]);
    }
    
    /**
     * 插入数据
     */
    public void put(String tableName, String rowKey, String columnFamily, 
                   String column, String value) {
        try (Table table = connection.getTable(TableName.valueOf(tableName))) {
            Put put = new Put(Bytes.toBytes(rowKey));
            put.addColumn(Bytes.toBytes(columnFamily), Bytes.toBytes(column), 
                         Bytes.toBytes(value));
            table.put(put);
            
        } catch (IOException e) {
            log.error("插入数据失败", e);
            throw new RuntimeException(e);
        }
    }
    
    /**
     * 批量插入
     */
    public void batchPut(String tableName, List<Put> puts) {
        try (Table table = connection.getTable(TableName.valueOf(tableName))) {
            table.put(puts);
            log.info("批量插入数据: {} 条", puts.size());
            
        } catch (IOException e) {
            log.error("批量插入失败", e);
            throw new RuntimeException(e);
        }
    }
    
    /**
     * 获取数据
     */
    public Result get(String tableName, String rowKey) {
        try (Table table = connection.getTable(TableName.valueOf(tableName))) {
            Get get = new Get(Bytes.toBytes(rowKey));
            return table.get(get);
            
        } catch (IOException e) {
            log.error("获取数据失败", e);
            throw new RuntimeException(e);
        }
    }
    
    /**
     * 扫描数据
     */
    public List<Result> scan(String tableName, String startRow, String stopRow) {
        List<Result> results = new ArrayList<>();
        
        try (Table table = connection.getTable(TableName.valueOf(tableName))) {
            Scan scan = new Scan();
            
            if (startRow != null) {
                scan.withStartRow(Bytes.toBytes(startRow));
            }
            if (stopRow != null) {
                scan.withStopRow(Bytes.toBytes(stopRow));
            }
            
            try (ResultScanner scanner = table.getScanner(scan)) {
                for (Result result : scanner) {
                    results.add(result);
                }
            }
            
        } catch (IOException e) {
            log.error("扫描数据失败", e);
            throw new RuntimeException(e);
        }
        
        return results;
    }
    
    /**
     * 删除数据
     */
    public void delete(String tableName, String rowKey) {
        try (Table table = connection.getTable(TableName.valueOf(tableName))) {
            Delete delete = new Delete(Bytes.toBytes(rowKey));
            table.delete(delete);
            
        } catch (IOException e) {
            log.error("删除数据失败", e);
            throw new RuntimeException(e);
        }
    }
}
```

### 分片管理服务

```java
@Service
@Slf4j
public class HBaseShardingService {
    
    @Autowired
    private Connection connection;
    
    @Autowired
    private Admin admin;
    
    /**
     * 获取表的Region信息
     */
    public List<RegionInfo> getTableRegions(String tableName) {
        try {
            TableName table = TableName.valueOf(tableName);
            return admin.getRegions(table);
            
        } catch (IOException e) {
            log.error("获取Region信息失败", e);
            throw new RuntimeException(e);
        }
    }
    
    /**
     * 手动分割Region
     */
    public void splitRegion(String tableName, String splitKey) {
        try {
            TableName table = TableName.valueOf(tableName);
            admin.split(table, Bytes.toBytes(splitKey));
            log.info("手动分割Region: {} at {}", tableName, splitKey);
            
        } catch (IOException e) {
            log.error("分割Region失败", e);
            throw new RuntimeException(e);
        }
    }
    
    /**
     * 合并Region
     */
    public void mergeRegions(String tableName, String region1, String region2) {
        try {
            admin.mergeRegionsAsync(
                Bytes.toBytes(region1),
                Bytes.toBytes(region2),
                false
            );
            log.info("合并Region: {} + {}", region1, region2);
            
        } catch (IOException e) {
            log.error("合并Region失败", e);
            throw new RuntimeException(e);
        }
    }
    
    /**
     * 移动Region
     */
    public void moveRegion(String regionName, String targetServer) {
        try {
            admin.move(Bytes.toBytes(regionName), ServerName.valueOf(targetServer));
            log.info("移动Region: {} to {}", regionName, targetServer);
            
        } catch (IOException e) {
            log.error("移动Region失败", e);
            throw new RuntimeException(e);
        }
    }
    
    /**
     * 负载均衡
     */
    public void balanceCluster() {
        try {
            boolean result = admin.balance();
            log.info("集群负载均衡: {}", result ? "成功" : "无需均衡");
            
        } catch (IOException e) {
            log.error("负载均衡失败", e);
            throw new RuntimeException(e);
        }
    }
    
    /**
     * 获取集群状态
     */
    public ClusterMetrics getClusterStatus() {
        try {
            return admin.getClusterMetrics();
            
        } catch (IOException e) {
            log.error("获取集群状态失败", e);
            throw new RuntimeException(e);
        }
    }
    
    /**
     * 监控Region分布
     */
    @Scheduled(fixedRate = 300000) // 5分钟
    public void monitorRegionDistribution() {
        try {
            ClusterMetrics metrics = getClusterStatus();
            
            log.info("=== HBase集群状态 ===");
            log.info("活跃RegionServer数量: {}", metrics.getLiveServerMetrics().size());
            log.info("死亡RegionServer数量: {}", metrics.getDeadServerNames().size());
            
            // 检查Region分布
            for (Map.Entry<ServerName, ServerMetrics> entry : 
                 metrics.getLiveServerMetrics().entrySet()) {
                
                ServerName serverName = entry.getKey();
                ServerMetrics serverMetrics = entry.getValue();
                
                log.info("RegionServer: {}", serverName.getServerName());
                log.info("  Region数量: {}", serverMetrics.getRegionMetrics().size());
                log.info("  请求数/秒: {}", serverMetrics.getRequestCountPerSecond());
                log.info("  读请求数/秒: {}", serverMetrics.getReadRequestsCount());
                log.info("  写请求数/秒: {}", serverMetrics.getWriteRequestsCount());
            }
            
            // 检查是否需要负载均衡
            checkAndBalance(metrics);
            
        } catch (Exception e) {
            log.error("监控Region分布失败", e);
        }
    }
    
    private void checkAndBalance(ClusterMetrics metrics) {
        Map<ServerName, ServerMetrics> servers = metrics.getLiveServerMetrics();
        
        if (servers.size() < 2) {
            return;
        }
        
        // 计算Region分布的标准差
        List<Integer> regionCounts = servers.values().stream()
            .map(sm -> sm.getRegionMetrics().size())
            .collect(Collectors.toList());
        
        double avg = regionCounts.stream().mapToInt(Integer::intValue).average().orElse(0);
        double variance = regionCounts.stream()
            .mapToDouble(count -> Math.pow(count - avg, 2))
            .average().orElse(0);
        double stdDev = Math.sqrt(variance);
        
        // 如果标准差超过阈值，触发负载均衡
        if (stdDev > 5) {
            log.warn("Region分布不均衡，标准差: {}, 触发负载均衡", stdDev);
            balanceCluster();
        }
    }
}
```

## 性能优化策略

### 1. RowKey设计

```java
@Component
public class RowKeyDesigner {
    
    /**
     * 用户表RowKey设计
     * 格式: hash(userId)_userId
     */
    public String generateUserRowKey(String userId) {
        String hash = String.format("%02x", Math.abs(userId.hashCode()) % 16);
        return hash + "_" + userId;
    }
    
    /**
     * 订单表RowKey设计
     * 格式: yyyyMM_orderId
     */
    public String generateOrderRowKey(String orderId, LocalDateTime orderTime) {
        String timePrefix = orderTime.format(DateTimeFormatter.ofPattern("yyyyMM"));
        return timePrefix + "_" + orderId;
    }
    
    /**
     * 日志表RowKey设计
     * 格式: yyyyMMddHH_hash(logId)_logId
     */
    public String generateLogRowKey(String logId, LocalDateTime logTime) {
        String timePrefix = logTime.format(DateTimeFormatter.ofPattern("yyyyMMddHH"));
        String hash = String.format("%04x", Math.abs(logId.hashCode()) % 65536);
        return timePrefix + "_" + hash + "_" + logId;
    }
    
    /**
     * 反向时间戳RowKey（用于获取最新数据）
     * 格式: (Long.MAX_VALUE - timestamp)_id
     */
    public String generateReverseTimeRowKey(String id, LocalDateTime time) {
        long timestamp = time.toInstant(ZoneOffset.UTC).toEpochMilli();
        long reverseTime = Long.MAX_VALUE - timestamp;
        return String.format("%019d_%s", reverseTime, id);
    }
}
```

### 2. 批量操作优化

```java
@Service
public class HBaseBatchService {
    
    @Autowired
    private Connection connection;
    
    private static final int BATCH_SIZE = 1000;
    
    /**
     * 批量写入优化
     */
    public void batchWrite(String tableName, List<Map<String, Object>> dataList) {
        try (Table table = connection.getTable(TableName.valueOf(tableName))) {
            
            List<Put> puts = new ArrayList<>();
            
            for (Map<String, Object> data : dataList) {
                Put put = createPut(data);
                puts.add(put);
                
                // 达到批次大小时执行写入
                if (puts.size() >= BATCH_SIZE) {
                    table.put(puts);
                    puts.clear();
                }
            }
            
            // 写入剩余数据
            if (!puts.isEmpty()) {
                table.put(puts);
            }
            
        } catch (IOException e) {
            log.error("批量写入失败", e);
            throw new RuntimeException(e);
        }
    }
    
    /**
     * 异步批量写入
     */
    @Async
    public CompletableFuture<Void> asyncBatchWrite(String tableName, 
                                                  List<Map<String, Object>> dataList) {
        return CompletableFuture.runAsync(() -> {
            batchWrite(tableName, dataList);
        });
    }
    
    /**
     * 并行扫描
     */
    public List<Result> parallelScan(String tableName, List<String> rowKeyRanges) {
        List<CompletableFuture<List<Result>>> futures = rowKeyRanges.stream()
            .map(range -> CompletableFuture.supplyAsync(() -> {
                String[] parts = range.split(",");
                return scanRange(tableName, parts[0], parts[1]);
            }))
            .collect(Collectors.toList());
        
        return futures.stream()
            .map(CompletableFuture::join)
            .flatMap(List::stream)
            .collect(Collectors.toList());
    }
    
    private List<Result> scanRange(String tableName, String startRow, String stopRow) {
        List<Result> results = new ArrayList<>();
        
        try (Table table = connection.getTable(TableName.valueOf(tableName))) {
            Scan scan = new Scan()
                .withStartRow(Bytes.toBytes(startRow))
                .withStopRow(Bytes.toBytes(stopRow))
                .setCaching(1000)  // 设置缓存大小
                .setBatch(100);    // 设置批次大小
            
            try (ResultScanner scanner = table.getScanner(scan)) {
                for (Result result : scanner) {
                    results.add(result);
                }
            }
            
        } catch (IOException e) {
            log.error("扫描范围失败: {} - {}", startRow, stopRow, e);
        }
        
        return results;
    }
    
    private Put createPut(Map<String, Object> data) {
        String rowKey = (String) data.get("rowKey");
        Put put = new Put(Bytes.toBytes(rowKey));
        
        data.forEach((key, value) -> {
            if (!"rowKey".equals(key) && value != null) {
                String[] parts = key.split(":");
                if (parts.length == 2) {
                    put.addColumn(Bytes.toBytes(parts[0]), Bytes.toBytes(parts[1]), 
                                 Bytes.toBytes(value.toString()));
                }
            }
        });
        
        return put;
    }
}
```

### 3. 缓存策略

```java
@Service
public class HBaseCacheService {
    
    @Autowired
    private HBaseService hbaseService;
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    private static final String CACHE_PREFIX = "hbase:";
    private static final int CACHE_TTL = 3600; // 1小时
    
    /**
     * 带缓存的数据获取
     */
    public Result getWithCache(String tableName, String rowKey) {
        String cacheKey = CACHE_PREFIX + tableName + ":" + rowKey;
        
        // 先从缓存获取
        Object cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            return deserializeResult((String) cached);
        }
        
        // 缓存未命中，从HBase获取
        Result result = hbaseService.get(tableName, rowKey);
        if (!result.isEmpty()) {
            // 写入缓存
            String serialized = serializeResult(result);
            redisTemplate.opsForValue().set(cacheKey, serialized, CACHE_TTL, TimeUnit.SECONDS);
        }
        
        return result;
    }
    
    /**
     * 缓存预热
     */
    @EventListener(ApplicationReadyEvent.class)
    public void warmupCache() {
        log.info("开始HBase缓存预热...");
        
        // 预热热点数据
        List<String> hotKeys = getHotKeys();
        hotKeys.parallelStream().forEach(key -> {
            String[] parts = key.split(":");
            if (parts.length == 2) {
                getWithCache(parts[0], parts[1]);
            }
        });
        
        log.info("HBase缓存预热完成，预热数据: {} 条", hotKeys.size());
    }
    
    private List<String> getHotKeys() {
        // 从配置或统计数据中获取热点键
        return Arrays.asList(
            "user_table:001",
            "user_table:002",
            "order_table:latest"
        );
    }
    
    private String serializeResult(Result result) {
        // 简化实现，实际应使用更高效的序列化方式
        Map<String, String> data = new HashMap<>();
        result.rawCells().forEach(cell -> {
            String family = Bytes.toString(CellUtil.cloneFamily(cell));
            String qualifier = Bytes.toString(CellUtil.cloneQualifier(cell));
            String value = Bytes.toString(CellUtil.cloneValue(cell));
            data.put(family + ":" + qualifier, value);
        });
        return JSON.toJSONString(data);
    }
    
    private Result deserializeResult(String serialized) {
        // 简化实现
        return null; // 实际需要反序列化为Result对象
    }
}
```

## 监控和运维

### 1. 集群监控服务

```java
@Service
@Slf4j
public class HBaseMonitoringService {
    
    @Autowired
    private Admin admin;
    
    @Autowired
    private MeterRegistry meterRegistry;
    
    /**
     * 监控集群健康状态
     */
    @Scheduled(fixedRate = 60000) // 1分钟
    public void monitorClusterHealth() {
        try {
            ClusterMetrics metrics = admin.getClusterMetrics();
            
            // 记录指标
            Gauge.builder("hbase.cluster.live_servers")
                .register(meterRegistry, metrics.getLiveServerMetrics().size());
            
            Gauge.builder("hbase.cluster.dead_servers")
                .register(meterRegistry, metrics.getDeadServerNames().size());
            
            Gauge.builder("hbase.cluster.regions")
                .register(meterRegistry, metrics.getRegionCount());
            
            // 检查异常状态
            if (!metrics.getDeadServerNames().isEmpty()) {
                log.error("发现死亡RegionServer: {}", metrics.getDeadServerNames());
                sendAlert("HBase集群异常", "发现死亡RegionServer: " + metrics.getDeadServerNames());
            }
            
        } catch (Exception e) {
            log.error("监控集群健康状态失败", e);
        }
    }
    
    /**
     * 监控表级别指标
     */
    @Scheduled(fixedRate = 300000) // 5分钟
    public void monitorTableMetrics() {
        try {
            List<TableName> tables = Arrays.asList(
                TableName.valueOf("user_table"),
                TableName.valueOf("order_table"),
                TableName.valueOf("log_table")
            );
            
            for (TableName tableName : tables) {
                if (admin.tableExists(tableName)) {
                    monitorSingleTable(tableName);
                }
            }
            
        } catch (Exception e) {
            log.error("监控表指标失败", e);
        }
    }
    
    private void monitorSingleTable(TableName tableName) throws IOException {
        List<RegionInfo> regions = admin.getRegions(tableName);
        
        log.info("表 {} 监控信息:", tableName.getNameAsString());
        log.info("  Region数量: {}", regions.size());
        
        // 检查Region大小分布
        Map<String, Long> regionSizes = new HashMap<>();
        long totalSize = 0;
        
        for (RegionInfo region : regions) {
            // 获取Region大小（简化实现）
            long size = getRegionSize(region);
            regionSizes.put(region.getRegionNameAsString(), size);
            totalSize += size;
        }
        
        log.info("  总大小: {} MB", totalSize / 1024 / 1024);
        log.info("  平均Region大小: {} MB", totalSize / regions.size() / 1024 / 1024);
        
        // 检查是否需要分割
        checkRegionSplit(tableName, regionSizes);
    }
    
    private long getRegionSize(RegionInfo region) {
        // 简化实现，实际需要通过JMX或其他方式获取
        return 100 * 1024 * 1024; // 100MB
    }
    
    private void checkRegionSplit(TableName tableName, Map<String, Long> regionSizes) {
        long maxSize = 1024 * 1024 * 1024L; // 1GB
        
        regionSizes.entrySet().stream()
            .filter(entry -> entry.getValue() > maxSize)
            .forEach(entry -> {
                log.warn("Region {} 大小超过阈值: {} MB", 
                        entry.getKey(), entry.getValue() / 1024 / 1024);
                
                // 可以触发自动分割
                // splitLargeRegion(tableName, entry.getKey());
            });
    }
    
    /**
     * 性能指标监控
     */
    @Scheduled(fixedRate = 120000) // 2分钟
    public void monitorPerformanceMetrics() {
        try {
            ClusterMetrics metrics = admin.getClusterMetrics();
            
            for (Map.Entry<ServerName, ServerMetrics> entry : 
                 metrics.getLiveServerMetrics().entrySet()) {
                
                ServerName serverName = entry.getKey();
                ServerMetrics serverMetrics = entry.getValue();
                
                // 记录性能指标
                Tags tags = Tags.of("server", serverName.getServerName());
                
                Gauge.builder("hbase.server.request_rate")
                    .tags(tags)
                    .register(meterRegistry, serverMetrics.getRequestCountPerSecond());
                
                Gauge.builder("hbase.server.read_requests")
                    .tags(tags)
                    .register(meterRegistry, serverMetrics.getReadRequestsCount());
                
                Gauge.builder("hbase.server.write_requests")
                    .tags(tags)
                    .register(meterRegistry, serverMetrics.getWriteRequestsCount());
                
                // 检查性能异常
                if (serverMetrics.getRequestCountPerSecond() > 10000) {
                    log.warn("RegionServer {} 请求量过高: {}/s", 
                            serverName.getServerName(), 
                            serverMetrics.getRequestCountPerSecond());
                }
            }
            
        } catch (Exception e) {
            log.error("监控性能指标失败", e);
        }
    }
    
    /**
     * 自动故障恢复
     */
    @EventListener
    public void handleRegionServerFailure(RegionServerFailureEvent event) {
        log.error("RegionServer故障: {}", event.getServerName());
        
        try {
            // 等待自动恢复
            Thread.sleep(30000);
            
            // 检查恢复状态
            ClusterMetrics metrics = admin.getClusterMetrics();
            if (metrics.getDeadServerNames().contains(event.getServerName())) {
                log.error("RegionServer {} 未能自动恢复，需要人工干预", event.getServerName());
                sendAlert("HBase故障", "RegionServer " + event.getServerName() + " 需要人工恢复");
            } else {
                log.info("RegionServer {} 已自动恢复", event.getServerName());
            }
            
        } catch (Exception e) {
            log.error("处理RegionServer故障失败", e);
        }
    }
    
    private void sendAlert(String title, String message) {
        // 发送告警通知（邮件、短信、钉钉等）
        log.error("告警: {} - {}", title, message);
    }
}

// 自定义事件
public class RegionServerFailureEvent {
    private final ServerName serverName;
    
    public RegionServerFailureEvent(ServerName serverName) {
        this.serverName = serverName;
    }
    
    public ServerName getServerName() {
        return serverName;
    }
}
```

### 2. 自动化运维脚本

```bash
#!/bin/bash
# hbase-ops.sh - HBase运维脚本

HBASE_HOME="/opt/hbase"
ZK_QUORUM="localhost:2181"

# 检查集群状态
check_cluster_status() {
    echo "检查HBase集群状态..."
    
    # 检查HMaster
    if ! pgrep -f "HMaster" > /dev/null; then
        echo "错误: HMaster未运行"
        return 1
    fi
    
    # 检查RegionServer
    rs_count=$(pgrep -f "HRegionServer" | wc -l)
    if [ $rs_count -eq 0 ]; then
        echo "错误: 没有运行的RegionServer"
        return 1
    fi
    
    echo "集群状态正常: HMaster运行中, $rs_count 个RegionServer运行中"
    return 0
}

# 备份表数据
backup_table() {
    local table_name=$1
    local backup_dir=$2
    
    echo "备份表 $table_name 到 $backup_dir..."
    
    $HBASE_HOME/bin/hbase org.apache.hadoop.hbase.mapreduce.Export \
        $table_name $backup_dir
    
    if [ $? -eq 0 ]; then
        echo "表 $table_name 备份成功"
    else
        echo "表 $table_name 备份失败"
        return 1
    fi
}

# 恢复表数据
restore_table() {
    local table_name=$1
    local backup_dir=$2
    
    echo "从 $backup_dir 恢复表 $table_name..."
    
    $HBASE_HOME/bin/hbase org.apache.hadoop.hbase.mapreduce.Import \
        $table_name $backup_dir
    
    if [ $? -eq 0 ]; then
        echo "表 $table_name 恢复成功"
    else
        echo "表 $table_name 恢复失败"
        return 1
    fi
}

# 清理旧的WAL文件
cleanup_wal() {
    echo "清理旧的WAL文件..."
    
    # 查找7天前的WAL文件
    find /opt/hbase/logs -name "*.log" -mtime +7 -delete
    
    echo "WAL文件清理完成"
}

# 压缩表
compact_table() {
    local table_name=$1
    
    echo "压缩表 $table_name..."
    
    echo "compact '$table_name'" | $HBASE_HOME/bin/hbase shell
    
    echo "表 $table_name 压缩完成"
}

# 主函数
main() {
    case $1 in
        "status")
            check_cluster_status
            ;;
        "backup")
            backup_table $2 $3
            ;;
        "restore")
            restore_table $2 $3
            ;;
        "cleanup")
            cleanup_wal
            ;;
        "compact")
            compact_table $2
            ;;
        *)
            echo "用法: $0 {status|backup|restore|cleanup|compact} [参数]"
            echo "  status                    - 检查集群状态"
            echo "  backup <table> <dir>      - 备份表"
            echo "  restore <table> <dir>     - 恢复表"
            echo "  cleanup                   - 清理WAL文件"
            echo "  compact <table>           - 压缩表"
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
    name: hbase-sharding-demo

hbase:
  zookeeper-quorum: localhost
  zookeeper-port: 2181
  max-connections: 100
  core-connections: 10

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
    org.apache.hadoop.hbase: INFO
    com.example.hbase: DEBUG
```

## 最佳实践

### 1. RowKey设计原则

- **避免热点**: 使用散列前缀分散写入
- **时间序列**: 考虑查询模式设计时间前缀
- **长度适中**: 避免过长的RowKey影响性能
- **字典序**: 利用字典序优化范围查询

### 2. 表设计优化

- **列族数量**: 建议不超过3个列族
- **预分区**: 根据数据分布预先分区
- **压缩算法**: 选择合适的压缩算法（SNAPPY、LZ4）
- **TTL设置**: 合理设置数据过期时间

### 3. 性能调优

- **批量操作**: 使用批量读写提高吞吐量
- **缓存策略**: 合理使用BlockCache和MemStore
- **并发控制**: 控制客户端并发连接数
- **监控告警**: 建立完善的监控体系

### 4. 运维管理

- **定期备份**: 制定数据备份策略
- **容量规划**: 监控存储使用情况
- **版本升级**: 制定滚动升级方案
- **故障恢复**: 建立自动故障恢复机制

## 总结

HBase分片技术通过Region自动分割和负载均衡实现了高可扩展性和高可用性。关键要点包括：

1. **自动分片**: Region根据大小自动分割，支持水平扩展
2. **负载均衡**: 自动分布Region到不同RegionServer
3. **RowKey设计**: 合理的RowKey设计是性能的关键
4. **监控运维**: 完善的监控和自动化运维保证系统稳定性

在实际应用中，需要根据业务特点优化RowKey设计、表结构和分片策略，并建立完善的监控和运维体系。