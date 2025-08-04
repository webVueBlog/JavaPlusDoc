# Elasticsearch分片技术实现

## 概述

Elasticsearch分片（Sharding）是其分布式架构的核心，通过将索引分割成多个分片来实现水平扩展。每个分片都是一个独立的Lucene索引，可以分布在集群的不同节点上。

## Elasticsearch分片架构

### 1. 集群架构设计

```yaml
# docker-compose.yml - Elasticsearch集群
version: '3.8'
services:
  # Master节点
  es-master-1:
    image: elasticsearch:8.8.0
    container_name: es-master-1
    environment:
      - node.name=es-master-1
      - node.roles=master
      - cluster.name=es-cluster
      - discovery.seed_hosts=es-master-2,es-master-3
      - cluster.initial_master_nodes=es-master-1,es-master-2,es-master-3
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms1g -Xmx1g"
    ports:
      - "9200:9200"
    volumes:
      - es_master_1_data:/usr/share/elasticsearch/data
    networks:
      - es-network
  
  es-master-2:
    image: elasticsearch:8.8.0
    container_name: es-master-2
    environment:
      - node.name=es-master-2
      - node.roles=master
      - cluster.name=es-cluster
      - discovery.seed_hosts=es-master-1,es-master-3
      - cluster.initial_master_nodes=es-master-1,es-master-2,es-master-3
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms1g -Xmx1g"
    ports:
      - "9201:9200"
    volumes:
      - es_master_2_data:/usr/share/elasticsearch/data
    networks:
      - es-network
  
  es-master-3:
    image: elasticsearch:8.8.0
    container_name: es-master-3
    environment:
      - node.name=es-master-3
      - node.roles=master
      - cluster.name=es-cluster
      - discovery.seed_hosts=es-master-1,es-master-2
      - cluster.initial_master_nodes=es-master-1,es-master-2,es-master-3
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms1g -Xmx1g"
    ports:
      - "9202:9200"
    volumes:
      - es_master_3_data:/usr/share/elasticsearch/data
    networks:
      - es-network
  
  # 数据节点
  es-data-1:
    image: elasticsearch:8.8.0
    container_name: es-data-1
    environment:
      - node.name=es-data-1
      - node.roles=data,ingest
      - cluster.name=es-cluster
      - discovery.seed_hosts=es-master-1,es-master-2,es-master-3
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms2g -Xmx2g"
    ports:
      - "9203:9200"
    volumes:
      - es_data_1_data:/usr/share/elasticsearch/data
    networks:
      - es-network
  
  es-data-2:
    image: elasticsearch:8.8.0
    container_name: es-data-2
    environment:
      - node.name=es-data-2
      - node.roles=data,ingest
      - cluster.name=es-cluster
      - discovery.seed_hosts=es-master-1,es-master-2,es-master-3
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms2g -Xmx2g"
    ports:
      - "9204:9200"
    volumes:
      - es_data_2_data:/usr/share/elasticsearch/data
    networks:
      - es-network
  
  es-data-3:
    image: elasticsearch:8.8.0
    container_name: es-data-3
    environment:
      - node.name=es-data-3
      - node.roles=data,ingest
      - cluster.name=es-cluster
      - discovery.seed_hosts=es-master-1,es-master-2,es-master-3
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms2g -Xmx2g"
    ports:
      - "9205:9200"
    volumes:
      - es_data_3_data:/usr/share/elasticsearch/data
    networks:
      - es-network
  
  # 协调节点
  es-coord-1:
    image: elasticsearch:8.8.0
    container_name: es-coord-1
    environment:
      - node.name=es-coord-1
      - node.roles=
      - cluster.name=es-cluster
      - discovery.seed_hosts=es-master-1,es-master-2,es-master-3
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms1g -Xmx1g"
    ports:
      - "9206:9200"
    networks:
      - es-network
  
  # Kibana
  kibana:
    image: kibana:8.8.0
    container_name: kibana
    environment:
      - ELASTICSEARCH_HOSTS=http://es-coord-1:9200
    ports:
      - "5601:5601"
    networks:
      - es-network
    depends_on:
      - es-coord-1

volumes:
  es_master_1_data:
  es_master_2_data:
  es_master_3_data:
  es_data_1_data:
  es_data_2_data:
  es_data_3_data:

networks:
  es-network:
    driver: bridge
```

### 2. 集群初始化脚本

```bash
#!/bin/bash
# elasticsearch-cluster-init.sh

echo "初始化Elasticsearch集群..."

# 等待集群启动
sleep 60

# 检查集群健康状态
echo "检查集群健康状态..."
curl -X GET "es-coord-1:9200/_cluster/health?pretty"

# 创建索引模板
echo "创建索引模板..."
curl -X PUT "es-coord-1:9200/_index_template/logs_template" -H 'Content-Type: application/json' -d'
{
  "index_patterns": ["logs-*"],
  "template": {
    "settings": {
      "number_of_shards": 3,
      "number_of_replicas": 1,
      "index.routing.allocation.total_shards_per_node": 2
    },
    "mappings": {
      "properties": {
        "timestamp": {
          "type": "date"
        },
        "level": {
          "type": "keyword"
        },
        "message": {
          "type": "text",
          "analyzer": "standard"
        },
        "service": {
          "type": "keyword"
        },
        "host": {
          "type": "keyword"
        }
      }
    }
  }
}'

# 创建用户数据索引
echo "创建用户数据索引..."
curl -X PUT "es-coord-1:9200/users" -H 'Content-Type: application/json' -d'
{
  "settings": {
    "number_of_shards": 5,
    "number_of_replicas": 1,
    "index.routing.allocation.total_shards_per_node": 2,
    "index.routing.allocation.awareness.attributes": "zone"
  },
  "mappings": {
    "properties": {
      "user_id": {
        "type": "keyword"
      },
      "username": {
        "type": "text",
        "fields": {
          "keyword": {
            "type": "keyword"
          }
        }
      },
      "email": {
        "type": "keyword"
      },
      "age": {
        "type": "integer"
      },
      "created_at": {
        "type": "date"
      },
      "location": {
        "type": "geo_point"
      }
    }
  }
}'

echo "Elasticsearch集群初始化完成！"
```

## Java应用集成

### 1. Spring Boot配置

```java
@Configuration
public class ElasticsearchShardingConfig {
    
    @Value("${elasticsearch.hosts}")
    private String[] hosts;
    
    @Bean
    public ElasticsearchClient elasticsearchClient() {
        HttpHost[] httpHosts = Arrays.stream(hosts)
            .map(host -> {
                String[] parts = host.split(":");
                return new HttpHost(parts[0], Integer.parseInt(parts[1]), "http");
            })
            .toArray(HttpHost[]::new);
        
        RestClientBuilder builder = RestClient.builder(httpHosts)
            .setRequestConfigCallback(requestConfigBuilder -> 
                requestConfigBuilder
                    .setConnectTimeout(5000)
                    .setSocketTimeout(60000)
                    .setConnectionRequestTimeout(5000)
            )
            .setHttpClientConfigCallback(httpClientBuilder -> 
                httpClientBuilder
                    .setMaxConnTotal(100)
                    .setMaxConnPerRoute(50)
                    .setKeepAliveStrategy((response, context) -> 30000)
            );
        
        ElasticsearchTransport transport = new RestClientTransport(
            builder.build(), new JacksonJsonpMapper());
        
        return new ElasticsearchClient(transport);
    }
    
    @Bean
    public ElasticsearchOperations elasticsearchOperations() {
        return new ElasticsearchRestTemplate(
            RestClients.create(ClientConfiguration.builder()
                .connectedTo(hosts)
                .withConnectTimeout(Duration.ofSeconds(5))
                .withSocketTimeout(Duration.ofSeconds(60))
                .build()).rest());
    }
}
```

### 2. 分片管理服务

```java
@Service
public class ElasticsearchShardingService {
    
    @Autowired
    private ElasticsearchClient elasticsearchClient;
    
    @Autowired
    private ElasticsearchOperations elasticsearchOperations;
    
    /**
     * 创建分片索引
     */
    public void createShardedIndex(String indexName, int shards, int replicas) {
        try {
            CreateIndexRequest request = CreateIndexRequest.of(builder -> 
                builder.index(indexName)
                    .settings(settings -> settings
                        .numberOfShards(String.valueOf(shards))
                        .numberOfReplicas(String.valueOf(replicas))
                        .put("index.routing.allocation.total_shards_per_node", "2")
                        .put("index.max_result_window", "50000")
                    )
            );
            
            CreateIndexResponse response = elasticsearchClient.indices().create(request);
            log.info("创建分片索引成功: {}, 分片数: {}, 副本数: {}", 
                indexName, shards, replicas);
            
        } catch (Exception e) {
            log.error("创建分片索引失败: {}", indexName, e);
            throw new RuntimeException("创建索引失败", e);
        }
    }
    
    /**
     * 动态调整分片副本数
     */
    public void updateReplicaCount(String indexName, int replicas) {
        try {
            PutIndicesSettingsRequest request = PutIndicesSettingsRequest.of(builder ->
                builder.index(indexName)
                    .settings(settings -> settings
                        .numberOfReplicas(String.valueOf(replicas))
                    )
            );
            
            PutIndicesSettingsResponse response = elasticsearchClient.indices()
                .putSettings(request);
            
            log.info("更新索引副本数成功: {}, 新副本数: {}", indexName, replicas);
            
        } catch (Exception e) {
            log.error("更新索引副本数失败: {}", indexName, e);
            throw new RuntimeException("更新副本数失败", e);
        }
    }
    
    /**
     * 分片重新分配
     */
    public void reallocateShards(String indexName, String fromNode, String toNode) {
        try {
            // 移动分片
            ClusterRerouteRequest request = ClusterRerouteRequest.of(builder ->
                builder.commands(commands -> commands
                    .move(move -> move
                        .index(indexName)
                        .shard(0)
                        .fromNode(fromNode)
                        .toNode(toNode)
                    )
                )
            );
            
            ClusterRerouteResponse response = elasticsearchClient.cluster().reroute(request);
            log.info("分片重新分配成功: {} 从 {} 移动到 {}", indexName, fromNode, toNode);
            
        } catch (Exception e) {
            log.error("分片重新分配失败", e);
            throw new RuntimeException("分片重新分配失败", e);
        }
    }
    
    /**
     * 获取分片分布信息
     */
    public Map<String, Object> getShardDistribution(String indexName) {
        try {
            IndicesStatsRequest request = IndicesStatsRequest.of(builder ->
                builder.index(indexName)
            );
            
            IndicesStatsResponse response = elasticsearchClient.indices().stats(request);
            
            Map<String, Object> distribution = new HashMap<>();
            
            response.indices().forEach((index, stats) -> {
                Map<String, Object> indexInfo = new HashMap<>();
                indexInfo.put("totalShards", stats.total().docs().count());
                indexInfo.put("primaryShards", stats.primaries().docs().count());
                indexInfo.put("storeSize", stats.total().store().sizeInBytes());
                distribution.put(index, indexInfo);
            });
            
            return distribution;
            
        } catch (Exception e) {
            log.error("获取分片分布信息失败: {}", indexName, e);
            throw new RuntimeException("获取分片信息失败", e);
        }
    }
    
    /**
     * 强制合并分片
     */
    public void forcemergeShards(String indexName, int maxNumSegments) {
        try {
            ForcemergeRequest request = ForcemergeRequest.of(builder ->
                builder.index(indexName)
                    .maxNumSegments(maxNumSegments)
                    .onlyExpungeDeletes(false)
                    .flush(true)
            );
            
            ForcemergeResponse response = elasticsearchClient.indices().forcemerge(request);
            log.info("强制合并分片成功: {}, 目标段数: {}", indexName, maxNumSegments);
            
        } catch (Exception e) {
            log.error("强制合并分片失败: {}", indexName, e);
            throw new RuntimeException("强制合并失败", e);
        }
    }
}
```

### 3. 路由策略实现

```java
@Service
public class ElasticsearchRoutingService {
    
    @Autowired
    private ElasticsearchClient elasticsearchClient;
    
    /**
     * 基于用户ID的路由策略
     */
    public void indexWithUserRouting(String indexName, String userId, Object document) {
        try {
            // 使用用户ID作为路由键
            String routing = calculateRouting(userId);
            
            IndexRequest<Object> request = IndexRequest.of(builder ->
                builder.index(indexName)
                    .id(userId)
                    .routing(routing)
                    .document(document)
            );
            
            IndexResponse response = elasticsearchClient.index(request);
            log.debug("文档索引成功: {}, 路由: {}", response.id(), routing);
            
        } catch (Exception e) {
            log.error("文档索引失败", e);
            throw new RuntimeException("索引失败", e);
        }
    }
    
    /**
     * 基于时间的路由策略
     */
    public void indexWithTimeRouting(String indexPrefix, LocalDateTime timestamp, Object document) {
        try {
            // 按天分割索引
            String indexName = indexPrefix + "-" + timestamp.format(DateTimeFormatter.ofPattern("yyyy.MM.dd"));
            
            // 使用小时作为路由键
            String routing = String.valueOf(timestamp.getHour());
            
            IndexRequest<Object> request = IndexRequest.of(builder ->
                builder.index(indexName)
                    .routing(routing)
                    .document(document)
            );
            
            IndexResponse response = elasticsearchClient.index(request);
            log.debug("时间路由索引成功: {}, 索引: {}, 路由: {}", 
                response.id(), indexName, routing);
            
        } catch (Exception e) {
            log.error("时间路由索引失败", e);
            throw new RuntimeException("索引失败", e);
        }
    }
    
    /**
     * 基于地理位置的路由策略
     */
    public void indexWithGeoRouting(String indexName, double lat, double lon, Object document) {
        try {
            // 基于地理位置计算路由
            String routing = calculateGeoRouting(lat, lon);
            
            IndexRequest<Object> request = IndexRequest.of(builder ->
                builder.index(indexName)
                    .routing(routing)
                    .document(document)
            );
            
            IndexResponse response = elasticsearchClient.index(request);
            log.debug("地理路由索引成功: {}, 路由: {}", response.id(), routing);
            
        } catch (Exception e) {
            log.error("地理路由索引失败", e);
            throw new RuntimeException("索引失败", e);
        }
    }
    
    /**
     * 批量索引with路由
     */
    public void bulkIndexWithRouting(String indexName, List<DocumentWithRouting> documents) {
        try {
            BulkRequest.Builder bulkBuilder = new BulkRequest.Builder();
            
            for (DocumentWithRouting doc : documents) {
                bulkBuilder.operations(op -> op
                    .index(idx -> idx
                        .index(indexName)
                        .id(doc.getId())
                        .routing(doc.getRouting())
                        .document(doc.getDocument())
                    )
                );
            }
            
            BulkResponse response = elasticsearchClient.bulk(bulkBuilder.build());
            
            if (response.errors()) {
                log.warn("批量索引部分失败");
                response.items().forEach(item -> {
                    if (item.error() != null) {
                        log.error("索引失败: {}, 错误: {}", item.id(), item.error().reason());
                    }
                });
            } else {
                log.info("批量索引成功，文档数: {}", documents.size());
            }
            
        } catch (Exception e) {
            log.error("批量索引失败", e);
            throw new RuntimeException("批量索引失败", e);
        }
    }
    
    /**
     * 路由查询
     */
    public <T> List<T> searchWithRouting(String indexName, String routing, 
                                       Query query, Class<T> clazz) {
        try {
            SearchRequest request = SearchRequest.of(builder ->
                builder.index(indexName)
                    .routing(routing)
                    .query(query)
                    .size(1000)
            );
            
            SearchResponse<T> response = elasticsearchClient.search(request, clazz);
            
            return response.hits().hits().stream()
                .map(hit -> hit.source())
                .collect(Collectors.toList());
            
        } catch (Exception e) {
            log.error("路由查询失败", e);
            throw new RuntimeException("查询失败", e);
        }
    }
    
    private String calculateRouting(String userId) {
        // 简单的哈希路由策略
        return String.valueOf(Math.abs(userId.hashCode()) % 10);
    }
    
    private String calculateGeoRouting(double lat, double lon) {
        // 基于地理位置的简单分区策略
        int latZone = (int) ((lat + 90) / 30); // 6个纬度区域
        int lonZone = (int) ((lon + 180) / 60); // 6个经度区域
        return latZone + "-" + lonZone;
    }
    
    public static class DocumentWithRouting {
        private String id;
        private String routing;
        private Object document;
        
        // 构造函数、getter、setter
    }
}
```

### 4. 索引生命周期管理

```java
@Service
public class IndexLifecycleService {
    
    @Autowired
    private ElasticsearchClient elasticsearchClient;
    
    /**
     * 创建索引生命周期策略
     */
    public void createLifecyclePolicy(String policyName) {
        try {
            // 创建ILM策略
            Map<String, Object> policy = Map.of(
                "policy", Map.of(
                    "phases", Map.of(
                        "hot", Map.of(
                            "actions", Map.of(
                                "rollover", Map.of(
                                    "max_size", "10GB",
                                    "max_age", "7d",
                                    "max_docs", 10000000
                                )
                            )
                        ),
                        "warm", Map.of(
                            "min_age", "7d",
                            "actions", Map.of(
                                "allocate", Map.of(
                                    "number_of_replicas", 0
                                ),
                                "forcemerge", Map.of(
                                    "max_num_segments", 1
                                )
                            )
                        ),
                        "cold", Map.of(
                            "min_age", "30d",
                            "actions", Map.of(
                                "allocate", Map.of(
                                    "number_of_replicas", 0
                                )
                            )
                        ),
                        "delete", Map.of(
                            "min_age", "90d",
                            "actions", Map.of(
                                "delete", Map.of()
                            )
                        )
                    )
                )
            );
            
            // 这里需要使用低级客户端或REST API
            log.info("创建生命周期策略: {}", policyName);
            
        } catch (Exception e) {
            log.error("创建生命周期策略失败: {}", policyName, e);
            throw new RuntimeException("创建策略失败", e);
        }
    }
    
    /**
     * 创建索引模板with生命周期
     */
    public void createIndexTemplateWithLifecycle(String templateName, String indexPattern, 
                                                String lifecyclePolicy) {
        try {
            PutIndexTemplateRequest request = PutIndexTemplateRequest.of(builder ->
                builder.name(templateName)
                    .indexPatterns(indexPattern)
                    .template(template -> template
                        .settings(settings -> settings
                            .numberOfShards("3")
                            .numberOfReplicas("1")
                            .put("index.lifecycle.name", lifecyclePolicy)
                            .put("index.lifecycle.rollover_alias", indexPattern.replace("*", "alias"))
                        )
                        .mappings(mappings -> mappings
                            .properties("timestamp", property -> property
                                .date(date -> date.format("yyyy-MM-dd HH:mm:ss"))
                            )
                            .properties("level", property -> property
                                .keyword(keyword -> keyword)
                            )
                            .properties("message", property -> property
                                .text(text -> text.analyzer("standard"))
                            )
                        )
                    )
            );
            
            PutIndexTemplateResponse response = elasticsearchClient.indices()
                .putIndexTemplate(request);
            
            log.info("创建索引模板成功: {}, 生命周期策略: {}", templateName, lifecyclePolicy);
            
        } catch (Exception e) {
            log.error("创建索引模板失败: {}", templateName, e);
            throw new RuntimeException("创建模板失败", e);
        }
    }
    
    /**
     * 手动触发索引滚动
     */
    public void rolloverIndex(String aliasName) {
        try {
            RolloverRequest request = RolloverRequest.of(builder ->
                builder.alias(aliasName)
                    .conditions(conditions -> conditions
                        .maxSize("5GB")
                        .maxAge(Time.of(time -> time.time("1d")))
                        .maxDocs(5000000L)
                    )
            );
            
            RolloverResponse response = elasticsearchClient.indices().rollover(request);
            
            if (response.rolledOver()) {
                log.info("索引滚动成功: {} -> {}", aliasName, response.newIndex());
            } else {
                log.info("索引滚动条件未满足: {}", aliasName);
            }
            
        } catch (Exception e) {
            log.error("索引滚动失败: {}", aliasName, e);
            throw new RuntimeException("索引滚动失败", e);
        }
    }
    
    /**
     * 监控索引生命周期状态
     */
    @Scheduled(fixedRate = 3600000) // 1小时检查一次
    public void monitorIndexLifecycle() {
        try {
            // 获取所有索引的ILM状态
            GetLifecycleRequest request = GetLifecycleRequest.of(builder ->
                builder.index("*")
            );
            
            // 这里需要使用低级客户端获取ILM状态
            log.info("检查索引生命周期状态");
            
        } catch (Exception e) {
            log.error("监控索引生命周期失败", e);
        }
    }
    
    /**
     * 清理过期索引
     */
    @Scheduled(cron = "0 0 2 * * ?") // 每天凌晨2点执行
    public void cleanupExpiredIndices() {
        try {
            LocalDateTime cutoffDate = LocalDateTime.now().minusDays(90);
            String cutoffPattern = "*-" + cutoffDate.format(DateTimeFormatter.ofPattern("yyyy.MM.dd"));
            
            GetIndexRequest request = GetIndexRequest.of(builder ->
                builder.index(cutoffPattern)
            );
            
            GetIndexResponse response = elasticsearchClient.indices().get(request);
            
            for (String indexName : response.result().keySet()) {
                if (shouldDeleteIndex(indexName, cutoffDate)) {
                    deleteIndex(indexName);
                }
            }
            
        } catch (Exception e) {
            log.error("清理过期索引失败", e);
        }
    }
    
    private boolean shouldDeleteIndex(String indexName, LocalDateTime cutoffDate) {
        // 解析索引名称中的日期
        try {
            String[] parts = indexName.split("-");
            if (parts.length >= 2) {
                String datePart = parts[parts.length - 1];
                LocalDate indexDate = LocalDate.parse(datePart, DateTimeFormatter.ofPattern("yyyy.MM.dd"));
                return indexDate.isBefore(cutoffDate.toLocalDate());
            }
        } catch (Exception e) {
            log.warn("无法解析索引日期: {}", indexName);
        }
        return false;
    }
    
    private void deleteIndex(String indexName) {
        try {
            DeleteIndexRequest request = DeleteIndexRequest.of(builder ->
                builder.index(indexName)
            );
            
            DeleteIndexResponse response = elasticsearchClient.indices().delete(request);
            log.info("删除过期索引: {}", indexName);
            
        } catch (Exception e) {
            log.error("删除索引失败: {}", indexName, e);
        }
    }
}
```

## 性能优化策略

### 1. 分片大小优化

```java
@Service
public class ShardSizeOptimizer {
    
    @Autowired
    private ElasticsearchClient elasticsearchClient;
    
    @Autowired
    private MeterRegistry meterRegistry;
    
    /**
     * 分析分片大小分布
     */
    public ShardSizeAnalysis analyzeShardSizes(String indexPattern) {
        try {
            IndicesStatsRequest request = IndicesStatsRequest.of(builder ->
                builder.index(indexPattern)
            );
            
            IndicesStatsResponse response = elasticsearchClient.indices().stats(request);
            
            List<ShardInfo> shardInfos = new ArrayList<>();
            
            response.indices().forEach((indexName, stats) -> {
                stats.shards().forEach((shardId, shardStats) -> {
                    ShardInfo info = new ShardInfo();
                    info.setIndexName(indexName);
                    info.setShardId(shardId);
                    info.setDocCount(shardStats.get(0).docs().count());
                    info.setStoreSize(shardStats.get(0).store().sizeInBytes());
                    shardInfos.add(info);
                });
            });
            
            return analyzeDistribution(shardInfos);
            
        } catch (Exception e) {
            log.error("分析分片大小失败", e);
            throw new RuntimeException("分析失败", e);
        }
    }
    
    /**
     * 推荐最优分片数量
     */
    public ShardRecommendation recommendShardCount(long estimatedDataSize, 
                                                 long estimatedDocCount,
                                                 int nodeCount) {
        // 目标分片大小: 10-50GB
        long targetShardSize = 30L * 1024 * 1024 * 1024; // 30GB
        
        // 基于数据大小计算分片数
        int shardsBySize = (int) Math.ceil((double) estimatedDataSize / targetShardSize);
        
        // 基于节点数计算分片数（每个节点1-3个分片）
        int shardsByNodes = nodeCount * 2;
        
        // 基于文档数计算分片数（每个分片不超过1000万文档）
        int shardsByDocs = (int) Math.ceil((double) estimatedDocCount / 10_000_000);
        
        // 取中间值
        int recommendedShards = Math.max(1, Math.min(
            Math.max(shardsBySize, shardsByDocs), 
            shardsByNodes
        ));
        
        ShardRecommendation recommendation = new ShardRecommendation();
        recommendation.setRecommendedShards(recommendedShards);
        recommendation.setRecommendedReplicas(Math.min(1, nodeCount - 1));
        recommendation.setReason(String.format(
            "基于数据大小(%dGB)、文档数(%d)、节点数(%d)的综合考虑",
            estimatedDataSize / (1024 * 1024 * 1024),
            estimatedDocCount,
            nodeCount
        ));
        
        return recommendation;
    }
    
    /**
     * 监控分片性能指标
     */
    @Scheduled(fixedRate = 300000) // 5分钟
    public void monitorShardPerformance() {
        try {
            NodesStatsRequest request = NodesStatsRequest.of(builder ->
                builder.metric("indices")
            );
            
            NodesStatsResponse response = elasticsearchClient.nodes().stats(request);
            
            response.nodes().forEach((nodeId, nodeStats) -> {
                if (nodeStats.indices() != null) {
                    // 索引性能指标
                    long indexingRate = nodeStats.indices().indexing().indexTotal();
                    long searchRate = nodeStats.indices().search().queryTotal();
                    long storeSize = nodeStats.indices().store().sizeInBytes();
                    
                    // 记录指标
                    Gauge.builder("elasticsearch.node.indexing.rate")
                        .tag("node", nodeId)
                        .register(meterRegistry, indexingRate);
                    
                    Gauge.builder("elasticsearch.node.search.rate")
                        .tag("node", nodeId)
                        .register(meterRegistry, searchRate);
                    
                    Gauge.builder("elasticsearch.node.store.size")
                        .tag("node", nodeId)
                        .register(meterRegistry, storeSize);
                }
            });
            
        } catch (Exception e) {
            log.error("监控分片性能失败", e);
        }
    }
    
    private ShardSizeAnalysis analyzeDistribution(List<ShardInfo> shardInfos) {
        if (shardInfos.isEmpty()) {
            return new ShardSizeAnalysis();
        }
        
        // 计算统计信息
        LongSummaryStatistics sizeStats = shardInfos.stream()
            .mapToLong(ShardInfo::getStoreSize)
            .summaryStatistics();
        
        LongSummaryStatistics docStats = shardInfos.stream()
            .mapToLong(ShardInfo::getDocCount)
            .summaryStatistics();
        
        ShardSizeAnalysis analysis = new ShardSizeAnalysis();
        analysis.setTotalShards(shardInfos.size());
        analysis.setAvgShardSize(sizeStats.getAverage());
        analysis.setMaxShardSize(sizeStats.getMax());
        analysis.setMinShardSize(sizeStats.getMin());
        analysis.setAvgDocCount(docStats.getAverage());
        analysis.setMaxDocCount(docStats.getMax());
        analysis.setMinDocCount(docStats.getMin());
        
        // 计算不平衡度
        double sizeImbalance = (sizeStats.getMax() - sizeStats.getMin()) / sizeStats.getAverage();
        analysis.setSizeImbalanceRatio(sizeImbalance);
        
        return analysis;
    }
    
    // 内部类定义
    public static class ShardInfo {
        private String indexName;
        private String shardId;
        private long docCount;
        private long storeSize;
        
        // getter和setter
    }
    
    public static class ShardSizeAnalysis {
        private int totalShards;
        private double avgShardSize;
        private long maxShardSize;
        private long minShardSize;
        private double avgDocCount;
        private long maxDocCount;
        private long minDocCount;
        private double sizeImbalanceRatio;
        
        // getter和setter
    }
    
    public static class ShardRecommendation {
        private int recommendedShards;
        private int recommendedReplicas;
        private String reason;
        
        // getter和setter
    }
}
```

### 2. 查询性能优化

```java
@Service
public class SearchOptimizationService {
    
    @Autowired
    private ElasticsearchClient elasticsearchClient;
    
    /**
     * 优化的分页查询
     */
    public <T> PagedResult<T> optimizedPagedSearch(String indexName, 
                                                 Query query, 
                                                 int page, 
                                                 int size, 
                                                 Class<T> clazz) {
        try {
            // 使用search_after进行深度分页
            if (page * size > 10000) {
                return searchAfterPagination(indexName, query, page, size, clazz);
            } else {
                return standardPagination(indexName, query, page, size, clazz);
            }
            
        } catch (Exception e) {
            log.error("分页查询失败", e);
            throw new RuntimeException("查询失败", e);
        }
    }
    
    /**
     * 聚合查询优化
     */
    public Map<String, Object> optimizedAggregation(String indexName, 
                                                   Query query,
                                                   List<Aggregation> aggregations) {
        try {
            SearchRequest.Builder requestBuilder = new SearchRequest.Builder()
                .index(indexName)
                .query(query)
                .size(0); // 不返回文档，只返回聚合结果
            
            // 添加聚合
            for (Aggregation agg : aggregations) {
                requestBuilder.aggregations(agg.getName(), agg);
            }
            
            SearchRequest request = requestBuilder.build();
            SearchResponse<Void> response = elasticsearchClient.search(request, Void.class);
            
            Map<String, Object> results = new HashMap<>();
            response.aggregations().forEach((name, aggregation) -> {
                results.put(name, parseAggregationResult(aggregation));
            });
            
            return results;
            
        } catch (Exception e) {
            log.error("聚合查询失败", e);
            throw new RuntimeException("聚合查询失败", e);
        }
    }
    
    /**
     * 多索引并行查询
     */
    public <T> List<T> parallelMultiIndexSearch(List<String> indices, 
                                              Query query, 
                                              Class<T> clazz) {
        try {
            // 并行查询多个索引
            List<CompletableFuture<List<T>>> futures = indices.stream()
                .map(index -> CompletableFuture.supplyAsync(() -> {
                    try {
                        SearchRequest request = SearchRequest.of(builder ->
                            builder.index(index)
                                .query(query)
                                .size(1000)
                        );
                        
                        SearchResponse<T> response = elasticsearchClient.search(request, clazz);
                        return response.hits().hits().stream()
                            .map(hit -> hit.source())
                            .collect(Collectors.toList());
                    } catch (Exception e) {
                        log.error("查询索引失败: {}", index, e);
                        return Collections.<T>emptyList();
                    }
                }))
                .collect(Collectors.toList());
            
            // 合并结果
            return futures.stream()
                .map(CompletableFuture::join)
                .flatMap(List::stream)
                .collect(Collectors.toList());
            
        } catch (Exception e) {
            log.error("并行多索引查询失败", e);
            throw new RuntimeException("查询失败", e);
        }
    }
    
    /**
     * 缓存热点查询
     */
    @Cacheable(value = "elasticsearch-queries", key = "#indexName + ':' + #query.toString()")
    public <T> List<T> cachedSearch(String indexName, Query query, Class<T> clazz) {
        try {
            SearchRequest request = SearchRequest.of(builder ->
                builder.index(indexName)
                    .query(query)
                    .size(100)
            );
            
            SearchResponse<T> response = elasticsearchClient.search(request, clazz);
            return response.hits().hits().stream()
                .map(hit -> hit.source())
                .collect(Collectors.toList());
            
        } catch (Exception e) {
            log.error("缓存查询失败", e);
            throw new RuntimeException("查询失败", e);
        }
    }
    
    private <T> PagedResult<T> standardPagination(String indexName, Query query, 
                                                 int page, int size, Class<T> clazz) 
            throws IOException {
        SearchRequest request = SearchRequest.of(builder ->
            builder.index(indexName)
                .query(query)
                .from(page * size)
                .size(size)
        );
        
        SearchResponse<T> response = elasticsearchClient.search(request, clazz);
        
        List<T> content = response.hits().hits().stream()
            .map(hit -> hit.source())
            .collect(Collectors.toList());
        
        return new PagedResult<>(content, page, size, response.hits().total().value());
    }
    
    private <T> PagedResult<T> searchAfterPagination(String indexName, Query query, 
                                                    int page, int size, Class<T> clazz) 
            throws IOException {
        // 实现search_after分页逻辑
        // 这里简化实现，实际需要维护排序值
        return standardPagination(indexName, query, page, size, clazz);
    }
    
    private Object parseAggregationResult(Aggregate aggregation) {
        // 解析聚合结果
        return new HashMap<>(); // 简化实现
    }
    
    public static class PagedResult<T> {
        private List<T> content;
        private int page;
        private int size;
        private long total;
        
        public PagedResult(List<T> content, int page, int size, long total) {
            this.content = content;
            this.page = page;
            this.size = size;
            this.total = total;
        }
        
        // getter和setter
    }
}
```

## 监控与运维

### 1. 集群健康监控

```java
@Component
public class ElasticsearchClusterMonitor {
    
    @Autowired
    private ElasticsearchClient elasticsearchClient;
    
    @Autowired
    private MeterRegistry meterRegistry;
    
    /**
     * 监控集群健康状态
     */
    @Scheduled(fixedRate = 30000)
    public void monitorClusterHealth() {
        try {
            HealthRequest request = HealthRequest.of(builder -> builder);
            HealthResponse response = elasticsearchClient.cluster().health(request);
            
            // 记录集群状态
            String status = response.status().jsonValue();
            Gauge.builder("elasticsearch.cluster.status")
                .tag("status", status)
                .register(meterRegistry, getStatusValue(status));
            
            // 记录节点数量
            Gauge.builder("elasticsearch.cluster.nodes.total")
                .register(meterRegistry, response.numberOfNodes());
            Gauge.builder("elasticsearch.cluster.nodes.data")
                .register(meterRegistry, response.numberOfDataNodes());
            
            // 记录分片状态
            Gauge.builder("elasticsearch.cluster.shards.active")
                .register(meterRegistry, response.activeShards());
            Gauge.builder("elasticsearch.cluster.shards.relocating")
                .register(meterRegistry, response.relocatingShards());
            Gauge.builder("elasticsearch.cluster.shards.initializing")
                .register(meterRegistry, response.initializingShards());
            Gauge.builder("elasticsearch.cluster.shards.unassigned")
                .register(meterRegistry, response.unassignedShards());
            
            // 检查是否有问题
            if (!"green".equals(status)) {
                log.warn("集群状态异常: {}, 未分配分片: {}", 
                    status, response.unassignedShards());
            }
            
        } catch (Exception e) {
            log.error("集群健康监控失败", e);
        }
    }
    
    /**
     * 监控索引状态
     */
    @Scheduled(fixedRate = 300000) // 5分钟
    public void monitorIndexHealth() {
        try {
            IndicesStatsRequest request = IndicesStatsRequest.of(builder ->
                builder.index("*")
            );
            
            IndicesStatsResponse response = elasticsearchClient.indices().stats(request);
            
            response.indices().forEach((indexName, stats) -> {
                // 索引大小
                long storeSize = stats.total().store().sizeInBytes();
                Gauge.builder("elasticsearch.index.store.size")
                    .tag("index", indexName)
                    .register(meterRegistry, storeSize);
                
                // 文档数量
                long docCount = stats.total().docs().count();
                Gauge.builder("elasticsearch.index.docs.count")
                    .tag("index", indexName)
                    .register(meterRegistry, docCount);
                
                // 索引操作统计
                if (stats.total().indexing() != null) {
                    long indexTotal = stats.total().indexing().indexTotal();
                    long indexTime = stats.total().indexing().indexTimeInMillis();
                    
                    Counter.builder("elasticsearch.index.indexing.total")
                        .tag("index", indexName)
                        .register(meterRegistry).increment(indexTotal);
                    
                    Timer.builder("elasticsearch.index.indexing.time")
                        .tag("index", indexName)
                        .register(meterRegistry).record(indexTime, TimeUnit.MILLISECONDS);
                }
                
                // 搜索操作统计
                if (stats.total().search() != null) {
                    long queryTotal = stats.total().search().queryTotal();
                    long queryTime = stats.total().search().queryTimeInMillis();
                    
                    Counter.builder("elasticsearch.index.search.total")
                        .tag("index", indexName)
                        .register(meterRegistry).increment(queryTotal);
                    
                    Timer.builder("elasticsearch.index.search.time")
                        .tag("index", indexName)
                        .register(meterRegistry).record(queryTime, TimeUnit.MILLISECONDS);
                }
            });
            
        } catch (Exception e) {
            log.error("索引健康监控失败", e);
        }
    }
    
    /**
     * 监控节点性能
     */
    @Scheduled(fixedRate = 60000) // 1分钟
    public void monitorNodePerformance() {
        try {
            NodesStatsRequest request = NodesStatsRequest.of(builder ->
                builder.metric("jvm", "os", "fs")
            );
            
            NodesStatsResponse response = elasticsearchClient.nodes().stats(request);
            
            response.nodes().forEach((nodeId, nodeStats) -> {
                String nodeName = nodeStats.name();
                
                // JVM内存使用
                if (nodeStats.jvm() != null && nodeStats.jvm().mem() != null) {
                    long heapUsed = nodeStats.jvm().mem().heapUsedInBytes();
                    long heapMax = nodeStats.jvm().mem().heapMaxInBytes();
                    double heapUsedPercent = (double) heapUsed / heapMax * 100;
                    
                    Gauge.builder("elasticsearch.node.jvm.heap.used")
                        .tag("node", nodeName)
                        .register(meterRegistry, heapUsed);
                    
                    Gauge.builder("elasticsearch.node.jvm.heap.used.percent")
                        .tag("node", nodeName)
                        .register(meterRegistry, heapUsedPercent);
                }
                
                // 系统负载
                if (nodeStats.os() != null) {
                    if (nodeStats.os().cpu() != null) {
                        int cpuPercent = nodeStats.os().cpu().percent();
                        Gauge.builder("elasticsearch.node.os.cpu.percent")
                            .tag("node", nodeName)
                            .register(meterRegistry, cpuPercent);
                    }
                    
                    if (nodeStats.os().mem() != null) {
                        long memUsed = nodeStats.os().mem().usedInBytes();
                        long memTotal = nodeStats.os().mem().totalInBytes();
                        double memUsedPercent = (double) memUsed / memTotal * 100;
                        
                        Gauge.builder("elasticsearch.node.os.mem.used.percent")
                            .tag("node", nodeName)
                            .register(meterRegistry, memUsedPercent);
                    }
                }
                
                // 磁盘使用
                if (nodeStats.fs() != null && nodeStats.fs().total() != null) {
                    long diskUsed = nodeStats.fs().total().totalInBytes() - 
                                  nodeStats.fs().total().availableInBytes();
                    long diskTotal = nodeStats.fs().total().totalInBytes();
                    double diskUsedPercent = (double) diskUsed / diskTotal * 100;
                    
                    Gauge.builder("elasticsearch.node.fs.used.percent")
                        .tag("node", nodeName)
                        .register(meterRegistry, diskUsedPercent);
                }
            });
            
        } catch (Exception e) {
            log.error("节点性能监控失败", e);
        }
    }
    
    private double getStatusValue(String status) {
        switch (status) {
            case "green": return 2;
            case "yellow": return 1;
            case "red": return 0;
            default: return -1;
        }
    }
}
```

### 2. 自动故障处理

```java
@Service
public class ElasticsearchFailoverService {
    
    @Autowired
    private ElasticsearchClient elasticsearchClient;
    
    @Autowired
    private NotificationService notificationService;
    
    /**
     * 检测并处理分片分配问题
     */
    @Scheduled(fixedRate = 60000)
    public void handleShardAllocationIssues() {
        try {
            HealthRequest request = HealthRequest.of(builder -> builder);
            HealthResponse health = elasticsearchClient.cluster().health(request);
            
            if (health.unassignedShards() > 0) {
                log.warn("检测到未分配分片: {}", health.unassignedShards());
                handleUnassignedShards();
            }
            
            if (health.relocatingShards() > 10) {
                log.warn("检测到大量分片重新分配: {}", health.relocatingShards());
                // 可能需要调整分配策略
            }
            
        } catch (Exception e) {
            log.error("分片分配检查失败", e);
        }
    }
    
    /**
     * 处理未分配分片
     */
    private void handleUnassignedShards() {
        try {
            // 获取未分配分片详情
            ClusterAllocationExplainRequest request = ClusterAllocationExplainRequest.of(builder ->
                builder.includeYesDecisions(true)
                    .includeDiskInfo(true)
            );
            
            ClusterAllocationExplainResponse response = elasticsearchClient.cluster()
                .allocationExplain(request);
            
            // 分析分配失败原因
            String reason = analyzeAllocationFailure(response);
            log.info("分片未分配原因: {}", reason);
            
            // 尝试自动修复
            attemptAutoFix(reason);
            
        } catch (Exception e) {
            log.error("处理未分配分片失败", e);
        }
    }
    
    /**
     * 自动修复常见问题
     */
    private void attemptAutoFix(String reason) {
        try {
            if (reason.contains("disk")) {
                // 磁盘空间不足，尝试清理旧数据
                cleanupOldIndices();
            } else if (reason.contains("allocation")) {
                // 分配策略问题，尝试调整设置
                adjustAllocationSettings();
            } else if (reason.contains("replica")) {
                // 副本分配问题，临时减少副本数
                reduceReplicaCount();
            }
        } catch (Exception e) {
            log.error("自动修复失败", e);
        }
    }
    
    /**
     * 清理旧索引
     */
    private void cleanupOldIndices() {
        try {
            LocalDateTime cutoff = LocalDateTime.now().minusDays(7);
            String pattern = "logs-" + cutoff.format(DateTimeFormatter.ofPattern("yyyy.MM.dd"));
            
            GetIndexRequest request = GetIndexRequest.of(builder ->
                builder.index(pattern)
            );
            
            GetIndexResponse response = elasticsearchClient.indices().get(request);
            
            for (String indexName : response.result().keySet()) {
                if (isOldIndex(indexName, cutoff)) {
                    deleteIndex(indexName);
                }
            }
            
        } catch (Exception e) {
            log.error("清理旧索引失败", e);
        }
    }
    
    /**
     * 调整分配设置
     */
    private void adjustAllocationSettings() {
        try {
            PutClusterSettingsRequest request = PutClusterSettingsRequest.of(builder ->
                builder.transient_(settings -> settings
                    .put("cluster.routing.allocation.enable", "all")
                    .put("cluster.routing.rebalance.enable", "all")
                    .put("cluster.routing.allocation.allow_rebalance", "always")
                )
            );
            
            PutClusterSettingsResponse response = elasticsearchClient.cluster()
                .putSettings(request);
            
            log.info("调整集群分配设置完成");
            
        } catch (Exception e) {
            log.error("调整分配设置失败", e);
        }
    }
    
    /**
     * 减少副本数
     */
    private void reduceReplicaCount() {
        try {
            // 临时将所有索引的副本数设为0
            PutIndicesSettingsRequest request = PutIndicesSettingsRequest.of(builder ->
                builder.index("*")
                    .settings(settings -> settings
                        .numberOfReplicas("0")
                    )
            );
            
            PutIndicesSettingsResponse response = elasticsearchClient.indices()
                .putSettings(request);
            
            log.info("临时减少副本数完成");
            
            // 发送通知
            notificationService.sendAlert("Elasticsearch副本数已临时调整为0");
            
        } catch (Exception e) {
            log.error("减少副本数失败", e);
        }
    }
    
    private String analyzeAllocationFailure(ClusterAllocationExplainResponse response) {
        // 简化实现，实际需要解析详细的分配决策
        return "分配失败分析";
    }
    
    private boolean isOldIndex(String indexName, LocalDateTime cutoff) {
        // 解析索引名称中的日期
        try {
            String[] parts = indexName.split("-");
            if (parts.length >= 2) {
                String datePart = parts[parts.length - 1];
                LocalDate indexDate = LocalDate.parse(datePart, DateTimeFormatter.ofPattern("yyyy.MM.dd"));
                return indexDate.isBefore(cutoff.toLocalDate());
            }
        } catch (Exception e) {
            log.warn("无法解析索引日期: {}", indexName);
        }
        return false;
    }
    
    private void deleteIndex(String indexName) {
        try {
            DeleteIndexRequest request = DeleteIndexRequest.of(builder ->
                builder.index(indexName)
            );
            
            DeleteIndexResponse response = elasticsearchClient.indices().delete(request);
            log.info("删除旧索引: {}", indexName);
            
        } catch (Exception e) {
            log.error("删除索引失败: {}", indexName, e);
        }
    }
}
```

## 配置文件

### application.yml

```yaml
spring:
  application:
    name: elasticsearch-sharding-demo
  
elasticsearch:
  hosts:
    - "localhost:9200"
    - "localhost:9201"
    - "localhost:9202"
  connection-timeout: 5s
  socket-timeout: 60s
  
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
    org.elasticsearch: DEBUG
    com.example.elasticsearch: DEBUG
```

## 最佳实践

### 1. 分片设计原则

- **分片大小**: 保持在10-50GB之间
- **分片数量**: 避免过度分片，通常每个节点1-3个分片
- **副本策略**: 根据可用性需求设置副本数
- **路由策略**: 合理使用路由避免热点

### 2. 性能优化

- **批量操作**: 使用bulk API提高索引性能
- **分片预分配**: 根据数据增长预估分片数
- **索引模板**: 统一管理索引设置和映射
- **生命周期管理**: 自动化索引的创建、滚动和删除

### 3. 监控要点

- **集群健康**: 定期检查集群状态
- **分片分布**: 监控分片在节点间的分布
- **性能指标**: 关注索引和查询性能
- **资源使用**: 监控CPU、内存、磁盘使用情况

### 4. 故障处理

- **自动恢复**: 配置自动故障转移
- **备份策略**: 定期备份重要数据
- **容量规划**: 预留足够的存储空间
- **版本升级**: 制定滚动升级策略

## 总结

Elasticsearch分片技术是构建高性能、高可用搜索系统的关键。通过合理的分片设计、路由策略和监控机制，可以实现：

1. **水平扩展**: 支持PB级数据存储和查询
2. **高可用性**: 通过副本机制保证服务连续性
3. **负载均衡**: 分片分布实现查询负载分散
4. **性能优化**: 并行处理提升查询效率

在实际应用中，需要根据业务特点调整分片策略，并建立完善的监控和运维体系。