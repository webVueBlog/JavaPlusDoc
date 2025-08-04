# Redis分片技术实现

## 概述

Redis分片（Redis Sharding）是将数据分布到多个Redis实例中的技术，用于突破单个Redis实例的内存限制，提高系统的整体性能和可用性。

## Redis分片方案

### 1. 客户端分片（Client-side Sharding）

客户端负责决定数据存储在哪个Redis实例中。

```java
@Component
public class RedisClientSharding {
    
    private List<JedisPool> jedisPools;
    private ConsistentHash<JedisPool> consistentHash;
    
    @PostConstruct
    public void init() {
        // 初始化Redis连接池
        jedisPools = Arrays.asList(
            new JedisPool("redis-node-1:6379"),
            new JedisPool("redis-node-2:6379"),
            new JedisPool("redis-node-3:6379"),
            new JedisPool("redis-node-4:6379")
        );
        
        // 初始化一致性哈希环
        consistentHash = new ConsistentHash<>(jedisPools);
    }
    
    /**
     * 根据key获取对应的Redis实例
     */
    private JedisPool getJedisPool(String key) {
        return consistentHash.get(key);
    }
    
    /**
     * 设置值
     */
    public void set(String key, String value) {
        JedisPool pool = getJedisPool(key);
        try (Jedis jedis = pool.getResource()) {
            jedis.set(key, value);
        }
    }
    
    /**
     * 获取值
     */
    public String get(String key) {
        JedisPool pool = getJedisPool(key);
        try (Jedis jedis = pool.getResource()) {
            return jedis.get(key);
        }
    }
    
    /**
     * 批量获取（需要跨分片）
     */
    public Map<String, String> mget(String... keys) {
        Map<String, String> result = new HashMap<>();
        Map<JedisPool, List<String>> poolKeyMap = new HashMap<>();
        
        // 按分片分组keys
        for (String key : keys) {
            JedisPool pool = getJedisPool(key);
            poolKeyMap.computeIfAbsent(pool, k -> new ArrayList<>()).add(key);
        }
        
        // 并行查询各分片
        poolKeyMap.entrySet().parallelStream().forEach(entry -> {
            JedisPool pool = entry.getKey();
            List<String> poolKeys = entry.getValue();
            
            try (Jedis jedis = pool.getResource()) {
                List<String> values = jedis.mget(poolKeys.toArray(new String[0]));
                for (int i = 0; i < poolKeys.size(); i++) {
                    result.put(poolKeys.get(i), values.get(i));
                }
            }
        });
        
        return result;
    }
}
```

### 2. 一致性哈希实现

```java
public class ConsistentHash<T> {
    
    private final SortedMap<Long, T> circle = new TreeMap<>();
    private final int virtualNodes;
    private final HashFunction hashFunction;
    
    public ConsistentHash(Collection<T> nodes) {
        this(nodes, 150); // 默认150个虚拟节点
    }
    
    public ConsistentHash(Collection<T> nodes, int virtualNodes) {
        this.virtualNodes = virtualNodes;
        this.hashFunction = Hashing.md5();
        
        for (T node : nodes) {
            addNode(node);
        }
    }
    
    /**
     * 添加节点
     */
    public void addNode(T node) {
        for (int i = 0; i < virtualNodes; i++) {
            String virtualNodeName = node.toString() + "#" + i;
            long hash = hashFunction.hashString(virtualNodeName, StandardCharsets.UTF_8).asLong();
            circle.put(hash, node);
        }
    }
    
    /**
     * 移除节点
     */
    public void removeNode(T node) {
        for (int i = 0; i < virtualNodes; i++) {
            String virtualNodeName = node.toString() + "#" + i;
            long hash = hashFunction.hashString(virtualNodeName, StandardCharsets.UTF_8).asLong();
            circle.remove(hash);
        }
    }
    
    /**
     * 获取key对应的节点
     */
    public T get(String key) {
        if (circle.isEmpty()) {
            return null;
        }
        
        long hash = hashFunction.hashString(key, StandardCharsets.UTF_8).asLong();
        
        if (!circle.containsKey(hash)) {
            SortedMap<Long, T> tailMap = circle.tailMap(hash);
            hash = tailMap.isEmpty() ? circle.firstKey() : tailMap.firstKey();
        }
        
        return circle.get(hash);
    }
}
```

### 3. Redis Cluster（官方集群方案）

```java
@Configuration
public class RedisClusterConfig {
    
    @Bean
    public LettuceConnectionFactory redisConnectionFactory() {
        List<RedisNode> nodes = Arrays.asList(
            new RedisNode("redis-cluster-1", 7000),
            new RedisNode("redis-cluster-2", 7000),
            new RedisNode("redis-cluster-3", 7000),
            new RedisNode("redis-cluster-4", 7000),
            new RedisNode("redis-cluster-5", 7000),
            new RedisNode("redis-cluster-6", 7000)
        );
        
        RedisClusterConfiguration clusterConfig = new RedisClusterConfiguration();
        clusterConfig.setClusterNodes(nodes);
        clusterConfig.setMaxRedirects(3);
        
        LettuceClientConfiguration clientConfig = LettuceClientConfiguration.builder()
            .commandTimeout(Duration.ofSeconds(2))
            .build();
        
        return new LettuceConnectionFactory(clusterConfig, clientConfig);
    }
    
    @Bean
    public RedisTemplate<String, Object> redisTemplate() {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(redisConnectionFactory());
        
        // 设置序列化器
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer());
        
        return template;
    }
}

@Service
public class RedisClusterService {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    /**
     * 设置值（自动路由到正确的分片）
     */
    public void set(String key, Object value, long timeout, TimeUnit unit) {
        redisTemplate.opsForValue().set(key, value, timeout, unit);
    }
    
    /**
     * 获取值
     */
    public Object get(String key) {
        return redisTemplate.opsForValue().get(key);
    }
    
    /**
     * 批量操作（可能跨分片）
     */
    public List<Object> multiGet(Collection<String> keys) {
        return redisTemplate.opsForValue().multiGet(keys);
    }
    
    /**
     * 使用Pipeline提高性能
     */
    public void batchSet(Map<String, Object> keyValues) {
        redisTemplate.executePipelined(new RedisCallback<Object>() {
            @Override
            public Object doInRedis(RedisConnection connection) throws DataAccessException {
                for (Map.Entry<String, Object> entry : keyValues.entrySet()) {
                    byte[] key = entry.getKey().getBytes();
                    byte[] value = serialize(entry.getValue());
                    connection.set(key, value);
                }
                return null;
            }
        });
    }
    
    private byte[] serialize(Object obj) {
        // 实现序列化逻辑
        return obj.toString().getBytes();
    }
}
```

## Redis Cluster部署

### 1. 集群配置文件

```bash
# redis-7000.conf
port 7000
cluster-enabled yes
cluster-config-file nodes-7000.conf
cluster-node-timeout 15000
appendonly yes
bind 0.0.0.0
protected-mode no

# 启动Redis实例
redis-server redis-7000.conf
redis-server redis-7001.conf
redis-server redis-7002.conf
redis-server redis-7003.conf
redis-server redis-7004.conf
redis-server redis-7005.conf

# 创建集群
redis-cli --cluster create 127.0.0.1:7000 127.0.0.1:7001 127.0.0.1:7002 \
127.0.0.1:7003 127.0.0.1:7004 127.0.0.1:7005 --cluster-replicas 1
```

### 2. 集群管理脚本

```bash
#!/bin/bash
# redis-cluster-manager.sh

CLUSTER_NODES="127.0.0.1:7000 127.0.0.1:7001 127.0.0.1:7002 127.0.0.1:7003 127.0.0.1:7004 127.0.0.1:7005"

case "$1" in
    start)
        echo "Starting Redis Cluster..."
        for port in 7000 7001 7002 7003 7004 7005; do
            redis-server redis-$port.conf
        done
        ;;
    stop)
        echo "Stopping Redis Cluster..."
        for port in 7000 7001 7002 7003 7004 7005; do
            redis-cli -p $port shutdown
        done
        ;;
    status)
        echo "Redis Cluster Status:"
        redis-cli --cluster info 127.0.0.1:7000
        ;;
    add-node)
        echo "Adding new node $2 to cluster..."
        redis-cli --cluster add-node $2 127.0.0.1:7000
        ;;
    reshard)
        echo "Resharding cluster..."
        redis-cli --cluster reshard 127.0.0.1:7000
        ;;
    *)
        echo "Usage: $0 {start|stop|status|add-node|reshard}"
        exit 1
        ;;
esac
```

## 分片策略优化

### 1. 热点数据处理

```java
@Service
public class HotDataShardingService {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    private final LoadingCache<String, AtomicLong> accessCounter = Caffeine.newBuilder()
        .maximumSize(10000)
        .expireAfterWrite(5, TimeUnit.MINUTES)
        .build(key -> new AtomicLong(0));
    
    /**
     * 检测热点key
     */
    public boolean isHotKey(String key) {
        long accessCount = accessCounter.get(key).incrementAndGet();
        return accessCount > 1000; // 5分钟内访问超过1000次认为是热点
    }
    
    /**
     * 热点数据多副本存储
     */
    public void setWithHotKeyOptimization(String key, Object value) {
        if (isHotKey(key)) {
            // 热点数据存储多个副本
            for (int i = 0; i < 3; i++) {
                String replicaKey = key + "#replica#" + i;
                redisTemplate.opsForValue().set(replicaKey, value);
            }
        } else {
            redisTemplate.opsForValue().set(key, value);
        }
    }
    
    /**
     * 热点数据负载均衡读取
     */
    public Object getWithHotKeyOptimization(String key) {
        if (isHotKey(key)) {
            // 随机选择一个副本读取
            int replicaIndex = ThreadLocalRandom.current().nextInt(3);
            String replicaKey = key + "#replica#" + replicaIndex;
            Object value = redisTemplate.opsForValue().get(replicaKey);
            
            if (value == null) {
                // 副本不存在，回退到原key
                value = redisTemplate.opsForValue().get(key);
            }
            
            return value;
        } else {
            return redisTemplate.opsForValue().get(key);
        }
    }
}
```

### 2. 数据倾斜处理

```java
@Component
public class DataSkewHandler {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    /**
     * 监控各分片数据分布
     */
    @Scheduled(fixedRate = 300000) // 5分钟检查一次
    public void monitorDataDistribution() {
        Map<String, Long> shardSizes = new HashMap<>();
        
        // 获取集群信息
        RedisClusterConnection clusterConnection = 
            (RedisClusterConnection) redisTemplate.getConnectionFactory().getConnection();
        
        Iterable<RedisClusterNode> nodes = clusterConnection.clusterGetNodes();
        
        for (RedisClusterNode node : nodes) {
            if (node.isMaster()) {
                RedisConnection nodeConnection = clusterConnection.getConnection(node);
                Properties info = nodeConnection.info("memory");
                
                String usedMemory = info.getProperty("used_memory");
                shardSizes.put(node.getId(), Long.parseLong(usedMemory));
            }
        }
        
        // 检查数据倾斜
        checkDataSkew(shardSizes);
    }
    
    private void checkDataSkew(Map<String, Long> shardSizes) {
        if (shardSizes.isEmpty()) return;
        
        long maxSize = Collections.max(shardSizes.values());
        long minSize = Collections.min(shardSizes.values());
        
        // 如果最大分片是最小分片的3倍以上，认为存在数据倾斜
        if (maxSize > minSize * 3) {
            log.warn("检测到数据倾斜，最大分片: {}MB, 最小分片: {}MB", 
                maxSize / 1024 / 1024, minSize / 1024 / 1024);
            
            // 触发重新分片
            triggerReshard();
        }
    }
    
    private void triggerReshard() {
        // 实现重新分片逻辑
        log.info("开始执行重新分片操作");
    }
}
```

### 3. 跨分片事务处理

```java
@Service
public class RedisDistributedTransaction {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    /**
     * 使用Lua脚本实现原子操作
     */
    public boolean transferPoints(String fromUser, String toUser, int points) {
        String luaScript = """
            local fromKey = KEYS[1]
            local toKey = KEYS[2]
            local points = tonumber(ARGV[1])
            
            local fromPoints = tonumber(redis.call('GET', fromKey) or 0)
            
            if fromPoints >= points then
                redis.call('DECRBY', fromKey, points)
                redis.call('INCRBY', toKey, points)
                return 1
            else
                return 0
            end
            """;
        
        DefaultRedisScript<Long> script = new DefaultRedisScript<>();
        script.setScriptText(luaScript);
        script.setResultType(Long.class);
        
        List<String> keys = Arrays.asList(
            "user:points:" + fromUser,
            "user:points:" + toUser
        );
        
        Long result = redisTemplate.execute(script, keys, points);
        return result != null && result == 1;
    }
    
    /**
     * 分布式锁实现
     */
    public boolean tryLock(String lockKey, String requestId, long expireTime) {
        String luaScript = """
            if redis.call('SET', KEYS[1], ARGV[1], 'NX', 'PX', ARGV[2]) then
                return 1
            else
                return 0
            end
            """;
        
        DefaultRedisScript<Long> script = new DefaultRedisScript<>();
        script.setScriptText(luaScript);
        script.setResultType(Long.class);
        
        Long result = redisTemplate.execute(script, 
            Collections.singletonList(lockKey), requestId, expireTime);
        
        return result != null && result == 1;
    }
    
    /**
     * 释放分布式锁
     */
    public boolean releaseLock(String lockKey, String requestId) {
        String luaScript = """
            if redis.call('GET', KEYS[1]) == ARGV[1] then
                return redis.call('DEL', KEYS[1])
            else
                return 0
            end
            """;
        
        DefaultRedisScript<Long> script = new DefaultRedisScript<>();
        script.setScriptText(luaScript);
        script.setResultType(Long.class);
        
        Long result = redisTemplate.execute(script, 
            Collections.singletonList(lockKey), requestId);
        
        return result != null && result == 1;
    }
}
```

## 性能优化

### 1. 连接池优化

```java
@Configuration
public class RedisConnectionPoolConfig {
    
    @Bean
    public LettuceConnectionFactory redisConnectionFactory() {
        // 连接池配置
        GenericObjectPoolConfig<StatefulRedisConnection<String, String>> poolConfig = 
            new GenericObjectPoolConfig<>();
        
        poolConfig.setMaxTotal(200);        // 最大连接数
        poolConfig.setMaxIdle(50);          // 最大空闲连接数
        poolConfig.setMinIdle(10);          // 最小空闲连接数
        poolConfig.setMaxWaitMillis(3000);  // 获取连接最大等待时间
        poolConfig.setTestOnBorrow(true);   // 获取连接时检测有效性
        poolConfig.setTestOnReturn(true);   // 归还连接时检测有效性
        poolConfig.setTestWhileIdle(true);  // 空闲时检测有效性
        
        // Lettuce客户端配置
        LettuceClientConfiguration clientConfig = LettuceClientConfiguration.builder()
            .poolingClientConfiguration(LettucePoolingClientConfiguration.builder()
                .poolConfig(poolConfig)
                .build())
            .commandTimeout(Duration.ofSeconds(2))
            .shutdownTimeout(Duration.ofSeconds(5))
            .build();
        
        return new LettuceConnectionFactory(redisClusterConfiguration(), clientConfig);
    }
}
```

### 2. 批量操作优化

```java
@Service
public class RedisBatchOptimization {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    /**
     * 批量设置（使用Pipeline）
     */
    public void batchSet(Map<String, Object> data) {
        redisTemplate.executePipelined(new RedisCallback<Object>() {
            @Override
            public Object doInRedis(RedisConnection connection) throws DataAccessException {
                for (Map.Entry<String, Object> entry : data.entrySet()) {
                    byte[] key = entry.getKey().getBytes();
                    byte[] value = serialize(entry.getValue());
                    connection.set(key, value);
                }
                return null;
            }
        });
    }
    
    /**
     * 批量获取（按分片分组）
     */
    public Map<String, Object> batchGet(Set<String> keys) {
        // 按分片分组keys
        Map<Integer, List<String>> shardKeyMap = keys.stream()
            .collect(Collectors.groupingBy(this::getShardIndex));
        
        Map<String, Object> result = new ConcurrentHashMap<>();
        
        // 并行查询各分片
        shardKeyMap.entrySet().parallelStream().forEach(entry -> {
            List<String> shardKeys = entry.getValue();
            List<Object> values = redisTemplate.opsForValue().multiGet(shardKeys);
            
            for (int i = 0; i < shardKeys.size(); i++) {
                if (values.get(i) != null) {
                    result.put(shardKeys.get(i), values.get(i));
                }
            }
        });
        
        return result;
    }
    
    private int getShardIndex(String key) {
        // 计算key对应的分片索引
        return Math.abs(key.hashCode()) % 16; // 假设16个分片
    }
    
    private byte[] serialize(Object obj) {
        // 实现序列化
        return obj.toString().getBytes();
    }
}
```

### 3. 缓存预热策略

```java
@Service
public class RedisCacheWarmup {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @Autowired
    private UserService userService;
    
    /**
     * 应用启动时预热缓存
     */
    @EventListener(ApplicationReadyEvent.class)
    public void warmupCache() {
        log.info("开始缓存预热...");
        
        CompletableFuture.runAsync(() -> {
            try {
                warmupHotUsers();
                warmupHotProducts();
                warmupConfigData();
                
                log.info("缓存预热完成");
            } catch (Exception e) {
                log.error("缓存预热失败", e);
            }
        });
    }
    
    /**
     * 预热热点用户数据
     */
    private void warmupHotUsers() {
        List<Long> hotUserIds = userService.getHotUserIds(1000);
        
        Map<String, Object> userData = new HashMap<>();
        for (Long userId : hotUserIds) {
            User user = userService.getUserById(userId);
            userData.put("user:" + userId, user);
        }
        
        // 批量写入Redis
        batchSetWithExpire(userData, 3600); // 1小时过期
    }
    
    /**
     * 批量设置带过期时间
     */
    private void batchSetWithExpire(Map<String, Object> data, long seconds) {
        redisTemplate.executePipelined(new RedisCallback<Object>() {
            @Override
            public Object doInRedis(RedisConnection connection) throws DataAccessException {
                for (Map.Entry<String, Object> entry : data.entrySet()) {
                    byte[] key = entry.getKey().getBytes();
                    byte[] value = serialize(entry.getValue());
                    connection.setEx(key, seconds, value);
                }
                return null;
            }
        });
    }
    
    private byte[] serialize(Object obj) {
        // 实现序列化
        return obj.toString().getBytes();
    }
}
```

## 监控与运维

### 1. Redis集群监控

```java
@Component
public class RedisClusterMonitor {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @Autowired
    private MeterRegistry meterRegistry;
    
    /**
     * 监控集群状态
     */
    @Scheduled(fixedRate = 30000)
    public void monitorClusterHealth() {
        try {
            RedisClusterConnection connection = 
                (RedisClusterConnection) redisTemplate.getConnectionFactory().getConnection();
            
            Iterable<RedisClusterNode> nodes = connection.clusterGetNodes();
            
            int masterCount = 0;
            int slaveCount = 0;
            int failedCount = 0;
            
            for (RedisClusterNode node : nodes) {
                if (node.isMaster()) {
                    masterCount++;
                } else {
                    slaveCount++;
                }
                
                if (node.getFlags().contains(RedisClusterNode.Flag.FAIL)) {
                    failedCount++;
                }
            }
            
            // 记录指标
            Gauge.builder("redis.cluster.master.count")
                .register(meterRegistry, masterCount);
            Gauge.builder("redis.cluster.slave.count")
                .register(meterRegistry, slaveCount);
            Gauge.builder("redis.cluster.failed.count")
                .register(meterRegistry, failedCount);
            
        } catch (Exception e) {
            log.error("Redis集群监控失败", e);
        }
    }
    
    /**
     * 监控性能指标
     */
    @Scheduled(fixedRate = 60000)
    public void monitorPerformanceMetrics() {
        RedisClusterConnection connection = 
            (RedisClusterConnection) redisTemplate.getConnectionFactory().getConnection();
        
        Iterable<RedisClusterNode> nodes = connection.clusterGetNodes();
        
        for (RedisClusterNode node : nodes) {
            if (node.isMaster()) {
                try {
                    RedisConnection nodeConnection = connection.getConnection(node);
                    Properties info = nodeConnection.info();
                    
                    // 内存使用率
                    long usedMemory = Long.parseLong(info.getProperty("used_memory"));
                    long maxMemory = Long.parseLong(info.getProperty("maxmemory"));
                    double memoryUsageRatio = maxMemory > 0 ? (double) usedMemory / maxMemory : 0;
                    
                    // QPS
                    long totalCommands = Long.parseLong(info.getProperty("total_commands_processed"));
                    
                    // 记录指标
                    Gauge.builder("redis.memory.usage.ratio")
                        .tag("node", node.getId())
                        .register(meterRegistry, memoryUsageRatio);
                    
                    Gauge.builder("redis.commands.total")
                        .tag("node", node.getId())
                        .register(meterRegistry, totalCommands);
                    
                } catch (Exception e) {
                    log.error("获取节点{}性能指标失败", node.getId(), e);
                }
            }
        }
    }
}
```

### 2. 故障自动恢复

```java
@Service
public class RedisFailoverService {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @Autowired
    private NotificationService notificationService;
    
    /**
     * 检测并处理节点故障
     */
    @Scheduled(fixedRate = 15000)
    public void detectAndHandleFailures() {
        try {
            RedisClusterConnection connection = 
                (RedisClusterConnection) redisTemplate.getConnectionFactory().getConnection();
            
            Iterable<RedisClusterNode> nodes = connection.clusterGetNodes();
            
            for (RedisClusterNode node : nodes) {
                if (node.getFlags().contains(RedisClusterNode.Flag.FAIL)) {
                    handleNodeFailure(node);
                }
            }
            
        } catch (Exception e) {
            log.error("故障检测失败", e);
        }
    }
    
    private void handleNodeFailure(RedisClusterNode failedNode) {
        log.error("检测到节点故障: {}", failedNode.getId());
        
        // 发送告警
        notificationService.sendAlert(
            "Redis节点故障", 
            String.format("节点 %s 发生故障，请及时处理", failedNode.getId())
        );
        
        // 如果是主节点故障，检查是否有从节点可以提升
        if (failedNode.isMaster()) {
            promoteSlaveToMaster(failedNode);
        }
    }
    
    private void promoteSlaveToMaster(RedisClusterNode failedMaster) {
        // 实现从节点提升为主节点的逻辑
        log.info("尝试提升从节点为主节点，替换故障节点: {}", failedMaster.getId());
    }
}
```

## 总结

Redis分片技术是构建高性能、高可用缓存系统的关键技术。选择合适的分片方案需要考虑：

1. **业务场景**：数据访问模式、一致性要求、性能需求
2. **运维复杂度**：集群管理、故障处理、扩容难度
3. **成本考虑**：硬件资源、开发成本、维护成本

**推荐方案：**
- **小规模应用**：客户端分片 + 一致性哈希
- **中大规模应用**：Redis Cluster官方方案
- **超大规模应用**：Redis Cluster + 代理层（如Twemproxy、Codis）

通过合理的分片设计和优化，可以构建出高性能、高可用的Redis集群系统。