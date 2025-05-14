---
title: Kafka事件处理类
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://github.com/user-attachments/assets/67708222-7c2e-4d88-a10f-3e9433eaee89">

## Kafka事件处理类

1. String
2. Integer
3. Long
4. Enum
5. Big
6. ThreadLocal
7. CloseLoader
8. ArrayList
9. LinkedList
10. Map
11. HashMap
12. Set

```java
public class ConsumerRecord<K, V> {
    // 定义一个常量，表示没有时间戳
    public static final long NO_TIMESTAMP = -1L;
    // 定义一个常量，表示没有大小
    public static final int NULL_SIZE = -1;
    // 定义一个常量，表示没有校验和
    public static final int NULL_CHECKSUM = -1;
    // 定义一个私有变量，表示主题
    private final String topic;
    // 定义一个私有变量，表示分区
    private final int partition;
    // 定义一个私有变量，表示偏移量
    private final long offset;
    // 定义一个私有变量，表示时间戳
    private final long timestamp;
    // 定义一个私有变量，表示时间戳类型
    private final TimestampType timestampType;
    // 定义一个私有变量，表示序列化后的键的大小
    private final int serializedKeySize;
    // 定义一个私有变量，表示序列化后的值的大小
    private final int serializedValueSize;
    // 定义一个私有变量，表示头部信息
    private final Headers headers;
    // 定义一个私有变量，表示键
    private final K key;
    // 定义一个私有变量，表示值
    private final V value;
    // 定义一个私有变量，表示领导者的纪元
    private final Optional<Integer> leaderEpoch;
    // 定义一个私有变量，表示校验和
    private volatile Long checksum;

    // 构造函数，用于创建一个ConsumerRecord对象
    public ConsumerRecord(String topic, int partition, long offset, K key, V value) {
        this(topic, partition, offset, -1L, TimestampType.NO_TIMESTAMP_TYPE, -1L, -1, -1, key, value);
    }

    // 构造函数，用于创建一个ConsumerRecord对象
    public ConsumerRecord(String topic, int partition, long offset, long timestamp, TimestampType timestampType, long checksum, int serializedKeySize, int serializedValueSize, K key, V value) {
        this(topic, partition, offset, timestamp, timestampType, checksum, serializedKeySize, serializedValueSize, key, value, new RecordHeaders());
    }

    // 构造函数，用于创建一个ConsumerRecord对象
    public ConsumerRecord(String topic, int partition, long offset, long timestamp, TimestampType timestampType, Long checksum, int serializedKeySize, int serializedValueSize, K key, V value, Headers headers) {
        this(topic, partition, offset, timestamp, timestampType, checksum, serializedKeySize, serializedValueSize, key, value, headers, Optional.empty());
    }

    // 构造函数，用于创建一个ConsumerRecord对象
    public ConsumerRecord(String topic, int partition, long offset, long timestamp, TimestampType timestampType, Long checksum, int serializedKeySize, int serializedValueSize, K key, V value, Headers headers, Optional<Integer> leaderEpoch) {
        // 如果主题为空，抛出异常
        if (topic == null) {
            throw new IllegalArgumentException("Topic cannot be null");
        // 如果头部信息为空，抛出异常
        } else if (headers == null) {
            throw new IllegalArgumentException("Headers cannot be null");
        // 否则，将参数赋值给私有变量
        } else {
            this.topic = topic;
            this.partition = partition;
            this.offset = offset;
            this.timestamp = timestamp;
            this.timestampType = timestampType;
            this.checksum = checksum;
            this.serializedKeySize = serializedKeySize;
            this.serializedValueSize = serializedValueSize;
            this.key = key;
            this.value = value;
            this.headers = headers;
            this.leaderEpoch = leaderEpoch;
        }
    }

    // 返回主题
    public String topic() {
        return this.topic;
    }

    // 返回分区
    public int partition() {
        return this.partition;
    }

    // 返回头部信息
    public Headers headers() {
        return this.headers;
    }

    // 返回键
    public K key() {
        return this.key;
    }

    // 返回值
    public V value() {
        return this.value;
    }

    // 返回偏移量
    public long offset() {
        return this.offset;
    }

    // 返回时间戳
    public long timestamp() {
        return this.timestamp;
    }

    // 返回时间戳类型
    public TimestampType timestampType() {
        return this.timestampType;
    }

    /** @deprecated */
    @Deprecated
    public long checksum() {
        if (this.checksum == null) {
            this.checksum = DefaultRecord.computePartialChecksum(this.timestamp, this.serializedKeySize, this.serializedValueSize);
        }

        return this.checksum;
    }

    public int serializedKeySize() {
        return this.serializedKeySize;
    }

    public int serializedValueSize() {
        return this.serializedValueSize;
    }

    public Optional<Integer> leaderEpoch() {
        return this.leaderEpoch;
    }

    public String toString() {
        return "ConsumerRecord(topic = " + this.topic + ", partition = " + this.partition + ", leaderEpoch = " + this.leaderEpoch.orElse((Object)null) + ", offset = " + this.offset + ", " + this.timestampType + " = " + this.timestamp + ", serialized key size = " + this.serializedKeySize + ", serialized value size = " + this.serializedValueSize + ", headers = " + this.headers + ", key = " + this.key + ", value = " + this.value + ")";
    }
}
```
