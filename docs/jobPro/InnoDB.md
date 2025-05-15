---
title: MyISAM和InnoDB有什么区别
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## MyISAM和InnoDB有什么区别

MyISAM和InnoDB是MySQL数据库中两种常用的存储引擎，它们有以下主要区别：

1. **事务支持**：
    - MyISAM不支持事务，不支持外键，也不支持行级锁定，因此在并发读写操作时性能较好。
    - InnoDB支持事务，支持外键，也支持行级锁定，因此在并发读写操作时性能较差。

2. **索引类型**：
    - MyISAM支持全文索引，而InnoDB不支持全文索引。

3. **存储方式**：
    - MyISAM的数据和索引是分开存储的，数据存储在MYD文件中，索引存储在MYI文件中。
    - InnoDB的数据和索引是存储在一起的，数据存储在ibdata文件中，索引存储在ibd文件中。

4. **缓存**：
    - MyISAM只缓存索引，不缓存数据。
    - InnoDB既缓存索引，也缓存数据。

5. **表空间**：
    - MyISAM的表空间是独立的，每个表都有自己的表空间。
    - InnoDB的表空间是共享的，所有表共享同一个表空间。

6. **自增列**：
    - MyISAM的自增列是独立的，每个表都有自己的自增列。
    - InnoDB的自增列是共享的，所有表共享同一个自增列。

总的来说，MyISAM和InnoDB各有优缺点，选择哪种存储引擎取决于具体的应用场景。如果需要事务支持、外键支持、行级锁定等特性，可以选择InnoDB；如果需要全文索引、高性能的并发读写操作等特性，可以选择MyISAM。

