# MongoDB分片技术实现

## 概述

MongoDB分片（Sharding）是MongoDB的水平扩展解决方案，通过将数据分布到多个分片（shard）上来处理大数据量和高吞吐量的需求。

## MongoDB分片架构

### 1. 分片集群组件

```yaml
# MongoDB分片集群架构
version: '3.8'
services:
  # Config Server副本集
  config1:
    image: mongo:5.0
    command: mongod --configsvr --replSet configReplSet --port 27019
    ports:
      - "27019:27019"
    volumes:
      - config1_data:/data/db
  
  config2:
    image: mongo:5.0
    command: mongod --configsvr --replSet configReplSet --port 27019
    ports:
      - "27020:27019"
    volumes:
      - config2_data:/data/db
  
  config3:
    image: mongo:5.0
    command: mongod --configsvr --replSet configReplSet --port 27019
    ports:
      - "27021:27019"
    volumes:
      - config3_data:/data/db
  
  # 分片1副本集
  shard1_replica1:
    image: mongo:5.0
    command: mongod --shardsvr --replSet shard1ReplSet --port 27018
    ports:
      - "27022:27018"
    volumes:
      - shard1_replica1_data:/data/db
  
  shard1_replica2:
    image: mongo:5.0
    command: mongod --shardsvr --replSet shard1ReplSet --port 27018
    ports:
      - "27023:27018"
    volumes:
      - shard1_replica2_data:/data/db
  
  # 分片2副本集
  shard2_replica1:
    image: mongo:5.0
    command: mongod --shardsvr --replSet shard2ReplSet --port 27018
    ports:
      - "27024:27018"
    volumes:
      - shard2_replica1_data:/data/db
  
  shard2_replica2:
    image: mongo:5.0
    command: mongod --shardsvr --replSet shard2ReplSet --port 27018
    ports:
      - "27025:27018"
    volumes:
      - shard2_replica2_data:/data/db
  
  # mongos路由服务
  mongos1:
    image: mongo:5.0
    command: mongos --configdb configReplSet/config1:27019,config2:27019,config3:27019 --port 27017
    ports:
      - "27017:27017"
    depends_on:
      - config1
      - config2
      - config3
  
  mongos2:
    image: mongo:5.0
    command: mongos --configdb configReplSet/config1:27019,config2:27019,config3:27019 --port 27017
    ports:
      - "27026:27017"
    depends_on:
      - config1
      - config2
      - config3

volumes:
  config1_data:
  config2_data:
  config3_data:
  shard1_replica1_data:
  shard1_replica2_data:
  shard2_replica1_data:
  shard2_replica2_data:
```

### 2. 分片集群初始化脚本

```bash
#!/bin/bash
# mongodb-cluster-init.sh

echo "初始化MongoDB分片集群..."

# 等待服务启动
sleep 30

# 初始化Config Server副本集
echo "初始化Config Server副本集..."
mongo --host config1:27019 --eval '
rs.initiate({
  _id: "configReplSet",
  configsvr: true,
  members: [
    { _id: 0, host: "config1:27019" },
    { _id: 1, host: "config2:27019" },
    { _id: 2, host: "config3:27019" }
  ]
})'

# 等待副本集初始化完成
sleep 20

# 初始化分片1副本集
echo "初始化分片1副本集..."
mongo --host shard1_replica1:27018 --eval '
rs.initiate({
  _id: "shard1ReplSet",
  members: [
    { _id: 0, host: "shard1_replica1:27018" },
    { _id: 1, host: "shard1_replica2:27018" }
  ]
})'

# 初始化分片2副本集
echo "初始化分片2副本集..."
mongo --host shard2_replica1:27018 --eval '
rs.initiate({
  _id: "shard2ReplSet",
  members: [
    { _id: 0, host: "shard2_replica1:27018" },
    { _id: 1, host: "shard2_replica2:27018" }
  ]
})'

# 等待分片副本集初始化完成
sleep 30

# 添加分片到集群
echo "添加分片到集群..."
mongo --host mongos1:27017 --eval '
sh.addShard("shard1ReplSet/shard1_replica1:27018,shard1_replica2:27018")
sh.addShard("shard2ReplSet/shard2_replica1:27018,shard2_replica2:27018")
'

echo "MongoDB分片集群初始化完成！"
```

## Java应用集成

### 1. Spring Boot配置

```java
@Configuration
public class MongoShardingConfig {
    
    @Value("${spring.data.mongodb.uri}")
    private String mongoUri;
    
    @Bean
    public MongoClient mongoClient() {
        // 连接到mongos路由服务
        ConnectionString connectionString = new ConnectionString(mongoUri);
        
        MongoClientSettings settings = MongoClientSettings.builder()
            .applyConnectionString(connectionString)
            .readPreference(ReadPreference.secondaryPreferred()) // 读写分离
            .writeConcern(WriteConcern.MAJORITY) // 写关注
            .readConcern(ReadConcern.MAJORITY) // 读关注
            .retryWrites(true) // 重试写入
            .retryReads(true) // 重试读取
            .applyToConnectionPoolSettings(builder -> {
                builder.maxSize(100) // 最大连接数
                    .minSize(10) // 最小连接数
                    .maxWaitTime(30, TimeUnit.SECONDS) // 最大等待时间
                    .maxConnectionIdleTime(60, TimeUnit.SECONDS); // 连接空闲时间
            })
            .build();
        
        return MongoClients.create(settings);
    }
    
    @Bean
    public MongoTemplate mongoTemplate() {
        return new MongoTemplate(mongoClient(), "sharded_database");
    }
}
```

### 2. 分片键设计

```java
@Document(collection = "users")
public class User {
    
    @Id
    private String id;
    
    @Indexed
    private String userId; // 分片键
    
    private String username;
    private String email;
    private Date createTime;
    private String region; // 地理位置
    
    // 构造函数、getter、setter
}

@Document(collection = "orders")
public class Order {
    
    @Id
    private String id;
    
    @Indexed
    private String customerId; // 分片键
    
    private String orderId;
    private BigDecimal amount;
    private Date orderTime;
    private String status;
    
    // 构造函数、getter、setter
}

@Document(collection = "products")
public class Product {
    
    @Id
    private String id;
    
    @Indexed
    private String categoryId; // 分片键
    
    private String productName;
    private BigDecimal price;
    private String description;
    
    // 构造函数、getter、setter
}
```

### 3. 分片管理服务

```java
@Service
public class MongoShardingService {
    
    @Autowired
    private MongoTemplate mongoTemplate;
    
    /**
     * 启用数据库分片
     */
    public void enableSharding(String database) {
        Document command = new Document("enableSharding", database);
        mongoTemplate.getDb().runCommand(command);
        log.info("已启用数据库分片: {}", database);
    }
    
    /**
     * 对集合进行分片
     */
    public void shardCollection(String database, String collection, String shardKey) {
        Document command = new Document("shardCollection", database + "." + collection)
            .append("key", new Document(shardKey, 1));
        
        mongoTemplate.getDb().runCommand(command);
        log.info("已对集合进行分片: {}.{}, 分片键: {}", database, collection, shardKey);
    }
    
    /**
     * 创建哈希分片
     */
    public void createHashedSharding(String database, String collection, String shardKey) {
        Document command = new Document("shardCollection", database + "." + collection)
            .append("key", new Document(shardKey, "hashed"));
        
        mongoTemplate.getDb().runCommand(command);
        log.info("已创建哈希分片: {}.{}, 分片键: {}", database, collection, shardKey);
    }
    
    /**
     * 创建范围分片
     */
    public void createRangeSharding(String database, String collection, String shardKey) {
        Document command = new Document("shardCollection", database + "." + collection)
            .append("key", new Document(shardKey, 1));
        
        mongoTemplate.getDb().runCommand(command);
        log.info("已创建范围分片: {}.{}, 分片键: {}", database, collection, shardKey);
    }
    
    /**
     * 创建复合分片键
     */
    public void createCompoundSharding(String database, String collection, 
                                     Map<String, Object> shardKeys) {
        Document keyDoc = new Document();
        shardKeys.forEach(keyDoc::append);
        
        Document command = new Document("shardCollection", database + "." + collection)
            .append("key", keyDoc);
        
        mongoTemplate.getDb().runCommand(command);
        log.info("已创建复合分片: {}.{}, 分片键: {}", database, collection, shardKeys);
    }
    
    /**
     * 查看分片状态
     */
    public Document getShardingStatus() {
        return mongoTemplate.getDb().runCommand(new Document("sh.status", 1));
    }
    
    /**
     * 查看集合分片信息
     */
    public Document getCollectionShardInfo(String database, String collection) {
        Document command = new Document("collStats", collection)
            .append("verbose", true);
        
        return mongoTemplate.getDb(database).runCommand(command);
    }
}
```

### 4. 分片初始化配置

```java
@Component
public class ShardingInitializer {
    
    @Autowired
    private MongoShardingService shardingService;
    
    @EventListener(ApplicationReadyEvent.class)
    public void initializeSharding() {
        try {
            // 启用数据库分片
            shardingService.enableSharding("sharded_database");
            
            // 用户集合 - 使用userId哈希分片
            shardingService.createHashedSharding("sharded_database", "users", "userId");
            
            // 订单集合 - 使用customerId范围分片
            shardingService.createRangeSharding("sharded_database", "orders", "customerId");
            
            // 产品集合 - 使用复合分片键
            Map<String, Object> productShardKeys = new HashMap<>();
            productShardKeys.put("categoryId", 1);
            productShardKeys.put("productId", 1);
            shardingService.createCompoundSharding("sharded_database", "products", productShardKeys);
            
            log.info("MongoDB分片初始化完成");
            
        } catch (Exception e) {
            log.error("MongoDB分片初始化失败", e);
        }
    }
}
```

## 分片策略优化

### 1. 智能分片键选择

```java
@Service
public class ShardKeyOptimizer {
    
    @Autowired
    private MongoTemplate mongoTemplate;
    
    /**
     * 分析集合的查询模式
     */
    public ShardKeyRecommendation analyzeQueryPatterns(String collection) {
        // 分析查询日志
        List<Document> queryLogs = getQueryLogs(collection);
        
        Map<String, Integer> fieldUsageCount = new HashMap<>();
        Map<String, Double> fieldSelectivity = new HashMap<>();
        
        for (Document log : queryLogs) {
            Document query = log.get("command", Document.class);
            if (query != null && query.containsKey("find")) {
                Document filter = query.get("filter", Document.class);
                if (filter != null) {
                    analyzeFilterFields(filter, fieldUsageCount);
                }
            }
        }
        
        // 计算字段选择性
        for (String field : fieldUsageCount.keySet()) {
            double selectivity = calculateFieldSelectivity(collection, field);
            fieldSelectivity.put(field, selectivity);
        }
        
        return recommendShardKey(fieldUsageCount, fieldSelectivity);
    }
    
    private void analyzeFilterFields(Document filter, Map<String, Integer> fieldUsageCount) {
        for (String field : filter.keySet()) {
            fieldUsageCount.merge(field, 1, Integer::sum);
        }
    }
    
    private double calculateFieldSelectivity(String collection, String field) {
        // 计算字段的选择性（不重复值的比例）
        Aggregation aggregation = Aggregation.newAggregation(
            Aggregation.group(field),
            Aggregation.count().as("distinctCount")
        );
        
        AggregationResults<Document> results = mongoTemplate.aggregate(
            aggregation, collection, Document.class);
        
        long distinctCount = results.getMappedResults().size();
        long totalCount = mongoTemplate.count(new Query(), collection);
        
        return totalCount > 0 ? (double) distinctCount / totalCount : 0;
    }
    
    private ShardKeyRecommendation recommendShardKey(Map<String, Integer> fieldUsageCount, 
                                                   Map<String, Double> fieldSelectivity) {
        // 综合考虑使用频率和选择性
        String recommendedField = fieldUsageCount.entrySet().stream()
            .max((e1, e2) -> {
                double score1 = e1.getValue() * fieldSelectivity.getOrDefault(e1.getKey(), 0.0);
                double score2 = e2.getValue() * fieldSelectivity.getOrDefault(e2.getKey(), 0.0);
                return Double.compare(score1, score2);
            })
            .map(Map.Entry::getKey)
            .orElse("_id");
        
        return new ShardKeyRecommendation(recommendedField, 
            fieldSelectivity.getOrDefault(recommendedField, 0.0));
    }
    
    private List<Document> getQueryLogs(String collection) {
        // 从MongoDB profiler获取查询日志
        Query query = new Query(Criteria.where("ns").is("sharded_database." + collection)
            .and("ts").gte(new Date(System.currentTimeMillis() - 24 * 60 * 60 * 1000))); // 最近24小时
        
        return mongoTemplate.find(query, Document.class, "system.profile");
    }
    
    public static class ShardKeyRecommendation {
        private String field;
        private double selectivity;
        
        public ShardKeyRecommendation(String field, double selectivity) {
            this.field = field;
            this.selectivity = selectivity;
        }
        
        // getter和setter
    }
}
```

### 2. 数据平衡监控

```java
@Service
public class ShardBalanceMonitor {
    
    @Autowired
    private MongoTemplate mongoTemplate;
    
    @Autowired
    private MeterRegistry meterRegistry;
    
    /**
     * 监控分片数据分布
     */
    @Scheduled(fixedRate = 300000) // 5分钟检查一次
    public void monitorShardDistribution() {
        try {
            Document shardStats = mongoTemplate.getDb().runCommand(
                new Document("shardDistribution", 1));
            
            analyzeShardBalance(shardStats);
            
        } catch (Exception e) {
            log.error("分片分布监控失败", e);
        }
    }
    
    private void analyzeShardBalance(Document shardStats) {
        Document shards = shardStats.get("shards", Document.class);
        if (shards == null) return;
        
        Map<String, Long> shardSizes = new HashMap<>();
        long totalSize = 0;
        
        for (String shardName : shards.keySet()) {
            Document shardInfo = shards.get(shardName, Document.class);
            long size = shardInfo.getLong("size");
            shardSizes.put(shardName, size);
            totalSize += size;
        }
        
        // 计算分布不均衡度
        double imbalanceRatio = calculateImbalanceRatio(shardSizes, totalSize);
        
        // 记录指标
        Gauge.builder("mongodb.shard.imbalance.ratio")
            .register(meterRegistry, imbalanceRatio);
        
        // 如果不均衡度超过阈值，触发重新平衡
        if (imbalanceRatio > 0.3) { // 30%的不均衡度
            log.warn("检测到分片数据不均衡，不均衡度: {:.2f}", imbalanceRatio);
            triggerRebalance();
        }
    }
    
    private double calculateImbalanceRatio(Map<String, Long> shardSizes, long totalSize) {
        if (shardSizes.isEmpty() || totalSize == 0) return 0;
        
        double avgSize = (double) totalSize / shardSizes.size();
        double maxDeviation = shardSizes.values().stream()
            .mapToDouble(size -> Math.abs(size - avgSize) / avgSize)
            .max()
            .orElse(0);
        
        return maxDeviation;
    }
    
    private void triggerRebalance() {
        try {
            // 启动平衡器
            mongoTemplate.getDb().runCommand(new Document("balancerStart", 1));
            log.info("已启动分片重新平衡");
            
        } catch (Exception e) {
            log.error("启动分片重新平衡失败", e);
        }
    }
    
    /**
     * 监控chunk分布
     */
    @Scheduled(fixedRate = 600000) // 10分钟检查一次
    public void monitorChunkDistribution() {
        try {
            // 查询chunks集合
            Query query = new Query();
            List<Document> chunks = mongoTemplate.find(query, Document.class, "chunks");
            
            Map<String, Integer> shardChunkCount = new HashMap<>();
            
            for (Document chunk : chunks) {
                String shard = chunk.getString("shard");
                shardChunkCount.merge(shard, 1, Integer::sum);
            }
            
            // 记录每个分片的chunk数量
            for (Map.Entry<String, Integer> entry : shardChunkCount.entrySet()) {
                Gauge.builder("mongodb.shard.chunk.count")
                    .tag("shard", entry.getKey())
                    .register(meterRegistry, entry.getValue());
            }
            
        } catch (Exception e) {
            log.error("Chunk分布监控失败", e);
        }
    }
}
```

### 3. 查询路由优化

```java
@Service
public class QueryRoutingOptimizer {
    
    @Autowired
    private MongoTemplate mongoTemplate;
    
    /**
     * 优化查询以避免跨分片操作
     */
    public <T> List<T> optimizedFind(Query query, Class<T> entityClass, String collection) {
        // 分析查询是否包含分片键
        if (containsShardKey(query, collection)) {
            // 包含分片键，可以路由到特定分片
            return mongoTemplate.find(query, entityClass, collection);
        } else {
            // 不包含分片键，需要广播查询
            log.warn("查询不包含分片键，将执行跨分片查询: {}", query);
            return mongoTemplate.find(query, entityClass, collection);
        }
    }
    
    /**
     * 批量查询优化
     */
    public <T> List<T> optimizedBatchFind(List<String> shardKeyValues, 
                                        String shardKeyField, 
                                        Class<T> entityClass, 
                                        String collection) {
        // 按分片键分组
        Map<String, List<String>> shardGroups = groupByShardKey(shardKeyValues, shardKeyField);
        
        List<T> results = new ArrayList<>();
        
        // 并行查询各分片
        shardGroups.entrySet().parallelStream().forEach(entry -> {
            Query query = new Query(Criteria.where(shardKeyField).in(entry.getValue()));
            List<T> shardResults = mongoTemplate.find(query, entityClass, collection);
            synchronized (results) {
                results.addAll(shardResults);
            }
        });
        
        return results;
    }
    
    /**
     * 聚合查询优化
     */
    public <T> AggregationResults<T> optimizedAggregate(Aggregation aggregation, 
                                                      String collection, 
                                                      Class<T> outputType) {
        // 检查聚合管道是否可以下推到分片
        if (canPushDownToShards(aggregation)) {
            return mongoTemplate.aggregate(aggregation, collection, outputType);
        } else {
            // 需要在mongos层进行聚合
            log.warn("聚合操作需要在mongos层执行，可能影响性能");
            return mongoTemplate.aggregate(aggregation, collection, outputType);
        }
    }
    
    private boolean containsShardKey(Query query, String collection) {
        // 获取集合的分片键信息
        String shardKey = getShardKey(collection);
        if (shardKey == null) return false;
        
        // 检查查询条件是否包含分片键
        Document queryDoc = query.getQueryObject();
        return queryDoc.containsKey(shardKey);
    }
    
    private String getShardKey(String collection) {
        try {
            // 从config.collections获取分片键信息
            Query query = new Query(Criteria.where("_id").is("sharded_database." + collection));
            Document collectionInfo = mongoTemplate.findOne(query, Document.class, "collections");
            
            if (collectionInfo != null) {
                Document key = collectionInfo.get("key", Document.class);
                if (key != null && !key.isEmpty()) {
                    return key.keySet().iterator().next();
                }
            }
        } catch (Exception e) {
            log.error("获取分片键失败", e);
        }
        
        return null;
    }
    
    private Map<String, List<String>> groupByShardKey(List<String> values, String shardKeyField) {
        // 根据分片键值计算目标分片
        Map<String, List<String>> groups = new HashMap<>();
        
        for (String value : values) {
            String targetShard = calculateTargetShard(value, shardKeyField);
            groups.computeIfAbsent(targetShard, k -> new ArrayList<>()).add(value);
        }
        
        return groups;
    }
    
    private String calculateTargetShard(String shardKeyValue, String shardKeyField) {
        // 简化的分片计算逻辑
        int hash = shardKeyValue.hashCode();
        int shardCount = getShardCount();
        int shardIndex = Math.abs(hash) % shardCount;
        return "shard" + shardIndex;
    }
    
    private int getShardCount() {
        try {
            Document listShards = mongoTemplate.getDb().runCommand(new Document("listShards", 1));
            List<Document> shards = listShards.getList("shards", Document.class);
            return shards != null ? shards.size() : 1;
        } catch (Exception e) {
            log.error("获取分片数量失败", e);
            return 1;
        }
    }
    
    private boolean canPushDownToShards(Aggregation aggregation) {
        // 检查聚合管道是否包含可以下推到分片的操作
        List<AggregationOperation> operations = aggregation.getOperations();
        
        for (AggregationOperation operation : operations) {
            if (operation instanceof GroupOperation || 
                operation instanceof SortOperation ||
                operation instanceof LimitOperation) {
                // 这些操作通常需要在mongos层执行
                return false;
            }
        }
        
        return true;
    }
}
```

## 性能优化

### 1. 连接池优化

```java
@Configuration
public class MongoConnectionOptimization {
    
    @Bean
    public MongoClientSettings mongoClientSettings() {
        return MongoClientSettings.builder()
            .applyToConnectionPoolSettings(builder -> {
                builder.maxSize(200)                    // 最大连接数
                    .minSize(20)                        // 最小连接数
                    .maxWaitTime(30, TimeUnit.SECONDS)  // 最大等待时间
                    .maxConnectionLifeTime(60, TimeUnit.MINUTES) // 连接最大生存时间
                    .maxConnectionIdleTime(30, TimeUnit.MINUTES) // 连接最大空闲时间
                    .maintenanceInitialDelay(0, TimeUnit.SECONDS)
                    .maintenanceFrequency(30, TimeUnit.SECONDS); // 维护频率
            })
            .applyToSocketSettings(builder -> {
                builder.connectTimeout(10, TimeUnit.SECONDS)    // 连接超时
                    .readTimeout(30, TimeUnit.SECONDS);         // 读取超时
            })
            .applyToServerSettings(builder -> {
                builder.heartbeatFrequency(10, TimeUnit.SECONDS)   // 心跳频率
                    .minHeartbeatFrequency(500, TimeUnit.MILLISECONDS); // 最小心跳频率
            })
            .build();
    }
}
```

### 2. 批量操作优化

```java
@Service
public class MongoBatchOptimization {
    
    @Autowired
    private MongoTemplate mongoTemplate;
    
    /**
     * 批量插入优化
     */
    public <T> void optimizedBatchInsert(List<T> documents, String collection) {
        if (documents.isEmpty()) return;
        
        // 按分片键分组
        Map<String, List<T>> shardGroups = groupDocumentsByShardKey(documents, collection);
        
        // 并行插入各分片
        shardGroups.entrySet().parallelStream().forEach(entry -> {
            List<T> shardDocuments = entry.getValue();
            
            // 分批插入，避免单次操作过大
            int batchSize = 1000;
            for (int i = 0; i < shardDocuments.size(); i += batchSize) {
                int endIndex = Math.min(i + batchSize, shardDocuments.size());
                List<T> batch = shardDocuments.subList(i, endIndex);
                
                mongoTemplate.insert(batch, collection);
            }
        });
    }
    
    /**
     * 批量更新优化
     */
    public void optimizedBatchUpdate(List<UpdateRequest> updateRequests, String collection) {
        BulkOperations bulkOps = mongoTemplate.bulkOps(BulkOperations.BulkMode.UNORDERED, collection);
        
        for (UpdateRequest request : updateRequests) {
            bulkOps.updateOne(request.getQuery(), request.getUpdate());
        }
        
        BulkWriteResult result = bulkOps.execute();
        log.info("批量更新完成，匹配: {}, 修改: {}", 
            result.getMatchedCount(), result.getModifiedCount());
    }
    
    /**
     * 批量删除优化
     */
    public void optimizedBatchDelete(List<Query> deleteQueries, String collection) {
        BulkOperations bulkOps = mongoTemplate.bulkOps(BulkOperations.BulkMode.UNORDERED, collection);
        
        for (Query query : deleteQueries) {
            bulkOps.remove(query);
        }
        
        BulkWriteResult result = bulkOps.execute();
        log.info("批量删除完成，删除数量: {}", result.getDeletedCount());
    }
    
    private <T> Map<String, List<T>> groupDocumentsByShardKey(List<T> documents, String collection) {
        // 根据分片键对文档进行分组
        Map<String, List<T>> groups = new HashMap<>();
        
        String shardKey = getShardKey(collection);
        if (shardKey == null) {
            groups.put("default", documents);
            return groups;
        }
        
        for (T document : documents) {
            String shardKeyValue = extractShardKeyValue(document, shardKey);
            String targetShard = calculateTargetShard(shardKeyValue);
            groups.computeIfAbsent(targetShard, k -> new ArrayList<>()).add(document);
        }
        
        return groups;
    }
    
    private String extractShardKeyValue(Object document, String shardKey) {
        // 使用反射或其他方式提取分片键值
        try {
            Field field = document.getClass().getDeclaredField(shardKey);
            field.setAccessible(true);
            Object value = field.get(document);
            return value != null ? value.toString() : "";
        } catch (Exception e) {
            log.error("提取分片键值失败", e);
            return "";
        }
    }
    
    private String getShardKey(String collection) {
        // 获取集合的分片键
        return "userId"; // 简化实现
    }
    
    private String calculateTargetShard(String shardKeyValue) {
        // 计算目标分片
        return "shard0"; // 简化实现
    }
    
    public static class UpdateRequest {
        private Query query;
        private Update update;
        
        public UpdateRequest(Query query, Update update) {
            this.query = query;
            this.update = update;
        }
        
        // getter和setter
    }
}
```

### 3. 索引优化

```java
@Service
public class MongoIndexOptimization {
    
    @Autowired
    private MongoTemplate mongoTemplate;
    
    /**
     * 创建分片友好的索引
     */
    public void createShardFriendlyIndexes(String collection) {
        // 1. 分片键索引（自动创建）
        
        // 2. 复合索引（包含分片键）
        Index compoundIndex = new Index()
            .on("userId", Sort.Direction.ASC)  // 分片键
            .on("createTime", Sort.Direction.DESC)
            .on("status", Sort.Direction.ASC);
        
        mongoTemplate.indexOps(collection).ensureIndex(compoundIndex);
        
        // 3. 查询优化索引
        Index queryIndex = new Index()
            .on("userId", Sort.Direction.ASC)  // 分片键
            .on("email", Sort.Direction.ASC)
            .sparse(); // 稀疏索引
        
        mongoTemplate.indexOps(collection).ensureIndex(queryIndex);
        
        // 4. 地理位置索引
        Index geoIndex = new Index()
            .on("userId", Sort.Direction.ASC)  // 分片键
            .on("location", "2dsphere");
        
        mongoTemplate.indexOps(collection).ensureIndex(geoIndex);
    }
    
    /**
     * 监控索引使用情况
     */
    @Scheduled(fixedRate = 3600000) // 1小时检查一次
    public void monitorIndexUsage() {
        List<String> collections = Arrays.asList("users", "orders", "products");
        
        for (String collection : collections) {
            try {
                // 获取索引统计信息
                Document indexStats = mongoTemplate.getDb()
                    .getCollection(collection)
                    .aggregate(Arrays.asList(
                        new Document("$indexStats", new Document())
                    ))
                    .first();
                
                if (indexStats != null) {
                    analyzeIndexUsage(collection, indexStats);
                }
                
            } catch (Exception e) {
                log.error("监控索引使用情况失败: {}", collection, e);
            }
        }
    }
    
    private void analyzeIndexUsage(String collection, Document indexStats) {
        Document accesses = indexStats.get("accesses", Document.class);
        if (accesses != null) {
            long ops = accesses.getLong("ops");
            Date since = accesses.getDate("since");
            
            if (ops == 0 && since != null) {
                long daysSinceLastUse = (System.currentTimeMillis() - since.getTime()) / (24 * 60 * 60 * 1000);
                if (daysSinceLastUse > 30) {
                    log.warn("索引 {} 在集合 {} 中超过30天未使用，考虑删除", 
                        indexStats.getString("name"), collection);
                }
            }
        }
    }
    
    /**
     * 自动创建查询优化索引
     */
    public void autoCreateQueryIndexes(String collection, List<Document> queryPatterns) {
        Map<String, Integer> fieldUsageCount = new HashMap<>();
        
        // 分析查询模式
        for (Document query : queryPatterns) {
            analyzeQueryFields(query, fieldUsageCount);
        }
        
        // 创建高频查询字段的索引
        fieldUsageCount.entrySet().stream()
            .filter(entry -> entry.getValue() > 100) // 使用次数超过100
            .forEach(entry -> {
                String field = entry.getKey();
                if (!field.equals("_id")) { // 跳过默认索引
                    Index index = new Index().on(field, Sort.Direction.ASC);
                    mongoTemplate.indexOps(collection).ensureIndex(index);
                    log.info("为字段 {} 创建索引，使用频率: {}", field, entry.getValue());
                }
            });
    }
    
    private void analyzeQueryFields(Document query, Map<String, Integer> fieldUsageCount) {
        for (String field : query.keySet()) {
            if (!field.startsWith("$")) { // 跳过操作符
                fieldUsageCount.merge(field, 1, Integer::sum);
            }
        }
    }
}
```

## 监控与运维

### 1. 分片集群监控

```java
@Component
public class MongoShardingMonitor {
    
    @Autowired
    private MongoTemplate mongoTemplate;
    
    @Autowired
    private MeterRegistry meterRegistry;
    
    /**
     * 监控分片集群健康状态
     */
    @Scheduled(fixedRate = 30000)
    public void monitorClusterHealth() {
        try {
            // 检查mongos状态
            Document isMaster = mongoTemplate.getDb().runCommand(new Document("isMaster", 1));
            boolean isMongos = isMaster.getBoolean("ismaster", false);
            
            // 检查分片状态
            Document listShards = mongoTemplate.getDb().runCommand(new Document("listShards", 1));
            List<Document> shards = listShards.getList("shards", Document.class);
            
            int healthyShards = 0;
            int totalShards = shards.size();
            
            for (Document shard : shards) {
                String state = shard.getString("state");
                if ("1".equals(state)) {
                    healthyShards++;
                }
            }
            
            // 记录指标
            Gauge.builder("mongodb.cluster.shards.total")
                .register(meterRegistry, totalShards);
            Gauge.builder("mongodb.cluster.shards.healthy")
                .register(meterRegistry, healthyShards);
            
            // 检查平衡器状态
            Document balancerStatus = mongoTemplate.getDb().runCommand(
                new Document("balancerStatus", 1));
            boolean balancerEnabled = balancerStatus.getBoolean("mode", false);
            
            Gauge.builder("mongodb.cluster.balancer.enabled")
                .register(meterRegistry, balancerEnabled ? 1 : 0);
            
        } catch (Exception e) {
            log.error("MongoDB集群健康监控失败", e);
        }
    }
    
    /**
     * 监控分片性能指标
     */
    @Scheduled(fixedRate = 60000)
    public void monitorShardPerformance() {
        try {
            Document serverStatus = mongoTemplate.getDb().runCommand(
                new Document("serverStatus", 1));
            
            // 连接数
            Document connections = serverStatus.get("connections", Document.class);
            if (connections != null) {
                int current = connections.getInteger("current", 0);
                int available = connections.getInteger("available", 0);
                
                Gauge.builder("mongodb.connections.current")
                    .register(meterRegistry, current);
                Gauge.builder("mongodb.connections.available")
                    .register(meterRegistry, available);
            }
            
            // 操作计数
            Document opcounters = serverStatus.get("opcounters", Document.class);
            if (opcounters != null) {
                long insert = opcounters.getLong("insert");
                long query = opcounters.getLong("query");
                long update = opcounters.getLong("update");
                long delete = opcounters.getLong("delete");
                
                Counter.builder("mongodb.operations.insert")
                    .register(meterRegistry).increment(insert);
                Counter.builder("mongodb.operations.query")
                    .register(meterRegistry).increment(query);
                Counter.builder("mongodb.operations.update")
                    .register(meterRegistry).increment(update);
                Counter.builder("mongodb.operations.delete")
                    .register(meterRegistry).increment(delete);
            }
            
        } catch (Exception e) {
            log.error("MongoDB性能监控失败", e);
        }
    }
}
```

### 2. 自动故障恢复

```java
@Service
public class MongoFailoverService {
    
    @Autowired
    private MongoTemplate mongoTemplate;
    
    @Autowired
    private NotificationService notificationService;
    
    /**
     * 检测并处理分片故障
     */
    @Scheduled(fixedRate = 15000)
    public void detectAndHandleFailures() {
        try {
            Document listShards = mongoTemplate.getDb().runCommand(new Document("listShards", 1));
            List<Document> shards = listShards.getList("shards", Document.class);
            
            for (Document shard : shards) {
                String shardId = shard.getString("_id");
                String host = shard.getString("host");
                String state = shard.getString("state");
                
                if (!"1".equals(state)) {
                    handleShardFailure(shardId, host);
                }
            }
            
        } catch (Exception e) {
            log.error("分片故障检测失败", e);
        }
    }
    
    private void handleShardFailure(String shardId, String host) {
        log.error("检测到分片故障: {} ({})", shardId, host);
        
        // 发送告警
        notificationService.sendAlert(
            "MongoDB分片故障",
            String.format("分片 %s (%s) 发生故障，请及时处理", shardId, host)
        );
        
        // 尝试自动恢复
        attemptAutoRecovery(shardId, host);
    }
    
    private void attemptAutoRecovery(String shardId, String host) {
        try {
            // 检查副本集状态
            if (host.contains("/")) {
                String[] parts = host.split("/");
                String replSetName = parts[0];
                String[] hosts = parts[1].split(",");
                
                // 尝试连接副本集的其他成员
                for (String memberHost : hosts) {
                    if (testConnection(memberHost)) {
                        log.info("副本集 {} 的成员 {} 仍然可用", replSetName, memberHost);
                        return;
                    }
                }
            }
            
            // 如果所有成员都不可用，尝试重启服务
            log.warn("分片 {} 的所有成员都不可用，需要手动干预", shardId);
            
        } catch (Exception e) {
            log.error("自动恢复失败", e);
        }
    }
    
    private boolean testConnection(String host) {
        try {
            MongoClient testClient = MongoClients.create("mongodb://" + host);
            testClient.getDatabase("admin").runCommand(new Document("ping", 1));
            testClient.close();
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
```

## 总结

MongoDB分片技术是处理大规模数据的重要解决方案。成功实施需要考虑：

1. **分片键设计**：选择合适的分片键是关键，需要平衡查询性能和数据分布
2. **架构规划**：合理规划Config Server、分片和mongos的部署
3. **查询优化**：尽量包含分片键以避免跨分片查询
4. **监控运维**：建立完善的监控体系，及时发现和处理问题

**最佳实践：**
- 选择高基数、查询频繁的字段作为分片键
- 使用复合分片键提高查询效率
- 定期监控数据分布和性能指标
- 建立自动化的故障检测和恢复机制

通过合理的设计和实施，MongoDB分片可以为应用提供优秀的水平扩展能力。