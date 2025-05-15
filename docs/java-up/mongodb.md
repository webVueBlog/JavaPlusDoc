---
title: MongoDB最基础入门
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## MongoDB最基础入门

## MongoDB 是什么

MongoDB 是一个基于分布式的文件存储数据库，旨在为 Web 应用提供可扩展的高性能数据存储解决方案。

以上引用来自于官方，不得不说，解释得文绉绉的。那就让我来换一种通俗的说法给小伙伴们解释一下，MongoDB 将数据存储为一个文档（类似于 JSON 对象），数据结构由键值对组成，类似于 Java 中的 Map，通过 key 的方式访问起来效率就高得多，对吧？这也是 MongoDB 最重要的特点。

MongoDB 提供了企业版（功能更强大）和社区版，对于我们开发者来说，拿社区版来学习和使用就足够了。MongoDB 的驱动包很多，常见的编程语言都有覆盖到，比如说 Java、JavaScript、C++、C#、Python 等等。

1）MongoDB 的默认端口号为 27017。

2）MongoDB 的版本号为 4.2.6。

安装 Robo 3T

Robo 3T 提供了对 MongoDB 和 SCRAM-SHA-256（升级的 mongo shell）的支持，是一款轻量级的 MongoDB 客户端工具。

## MongoDB 的相关概念

随着互联网的极速发展，用户数据也越来越庞大，NoSQL 数据库的发展能够很好地处理这些大的数据，MongoDB 是 NoSQL 数据库中的一个典型的代表。

说到这，可能有些小伙伴们还不知道 NoSQL 是啥意思，我简单解释一下。NoSQL 可不是没有 SQL 的意思，它实际的含义是 Not Only SQL，也就是“不仅仅是 SQL”，指的是非关系型数据库，和传统的关系型数据库 MySQL、Oracle 不同。

MongoDB 命名源于英文单词 humongous，意思是「巨大无比」，可以看得出 MongoDB 的野心。MongoDB 的数据以类似于 JSON 格式的二进制文档存储：

第一步，在项目中添加 MongoDB 驱动依赖：

```
<dependency>
    <groupId>org.mongodb</groupId>
    <artifactId>mongodb-driver-sync</artifactId>
    <version>4.0.3</version>
</dependency>
```

第二步，新建测试类 MongoDBTest：

```
public class MongoDBTest {
    public static void main(String[] args) {
        MongoClient mongoClient = MongoClients.create();
        MongoDatabase database = mongoClient.getDatabase("mydb");
        MongoCollection<Document> collection = database.getCollection("test");

        Document doc = new Document("name", "aa")
                .append("age", "18")
                .append("hobbies", Arrays.asList("写作", "敲代码"));
        collection.insertOne(doc);

        System.out.println("集合大小：" +collection.countDocuments());

        Document myDoc = collection.find().first();
        System.out.println("文档内容：" + myDoc.toJson());
    }
}
```

1）MongoClient 为 MongoDB 提供的客户端连接对象，不指定主机名和端口号的话，默认就是“localhost”和“27017”。

2）getDatabase() 方法用于获取指定名称的数据库，如果数据库已经存在，则直接返回该 DB 对象（MongoDatabase），否则就创建一个再返回（省去了判空的操作，非常人性化）。

3）getCollection() 方法用于获取指定名称的文档对象，如果文档已经存在，则直接返回该 Document 的集合对象，否则就创建一个再返回（和 getDatabase() 方法类似）。

4）countDocuments() 方法用于获取集合中的文档数目。

5）要查询文档，可以通过 find() 方法，它返回一个 FindIterable 对象，first() 方法可以返回当前集合中的第一个文档对象。

