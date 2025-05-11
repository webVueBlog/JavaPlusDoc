---
title: 从根上理解MySQL事务
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## 从根上理解MySQL事务

事务的概念

MySQL事务是一个或者多个的数据库操作，要么全部执行成功，要么全部失败回滚。

事务是通过事务日志来实现的，事务日志包括：redo log和undo log。

事务的状态

    活动的（active）
    事务对应的数据库操作正在执行过程中时，我们就说该事务处在活动的状态。
    
    部分提交的（partially committed）
    当事务中的最后一个操作执行完成，但由于操作都在内存中执行，所造成的影响并没有刷新到磁盘时，我们就说该事务处在部分提交的状态。
    
    失败的（failed）
    当事务处在活动的或者部分提交的状态时，可能遇到了某些错误（数据库自身的错误、操作系统错误或者直接断电等）而无法继续执行，或者人为的停止当前事务的执行，我们就说该事务处在失败的状态。
    
    中止的（aborted）
    如果事务执行了半截而变为失败的状态，撤销失败事务对当前数据库造成的影响，我们把这个撤销的过程称之为回滚。
    
    当回滚操作执行完毕时，也就是数据库恢复到了执行事务之前的状态，我们就说该事务处在了中止的状态。
    
    提交的（committed）
    当一个处在部分提交的状态的事务将修改过的数据都同步到磁盘上之后，我们就可以说该事务处在了提交的状态。

## 事务的作用

事务主要是为了保证复杂数据库操作数据的一致性，尤其是在并发访问数据时。

MySQL 事务主要用于处理操作量大，复杂度高的数据。

## 事务的特点

原子性（Atomicity，又称不可分割性）

事务的数据操作，要么全部执行成功，要么全部失败回滚到执行之前的状态，就像这个事务从来没有执行过一样。

隔离性（Isolation，又称独立性）

多个事务之间是相互隔离，互不影响的。数据库允许多个并发事务同时对其数据进行读写和修改的能力，隔离性可以防止多个事务并发执行时由于交叉执行而导致数据的不一致。


四种隔离状态：

1. 读未提交（Read uncommitted）
2. 读提交（Read committed）
3. 可重复读（Repeatable read）
4. 串行化（Serializable）
   一致性（Consistency）
   在事务操作之前和之后，数据都是保持一个相同的状态，数据库的完整性没有被破坏。

原子性和隔离性，对一致性有着至关重要的影响。

持久性（Durability）

当事务操作完成后，数据会被刷新到磁盘永久保存，即便是系统故障也不会丢失。

## 事务的语法

数据

```
创建数据表：
create table account(
    -> id int(10) auto_increment,
    -> name varchar(30),
    -> balance int(10),
    -> primary key (id));
插入数据：
insert into account(name,balance) values('aa',100),('bb',10);


```

begin

事务启动方式1

```
mysql> begin;
Query OK, 0 rows affected (0.00 sec)
mysql> 事务操作SQL......
```

start transaction `[修饰符]`

```
修饰符：
1. read only //只读
2. read write //读写 默认
3. WITH CONSISTENT SNAPSHOT //一致性读
```

事务启动方式2

```
mysql> start transaction read only;
Query OK, 0 rows affected (0.00 sec)
mysql> 事务操作SQL......

如设置read only后，对数据进行修改会报错：

mysql> start transaction read only;
Query OK, 0 rows affected (0.00 sec)

mysql> update account set balance=banlance+30 where id = 2;
ERROR 1792 (25006): Cannot execute statement in a READ ONLY transaction.
```

commit

事务执行提交，提交成功则刷新到磁盘

```
mysql> commit;
Query OK, 0 rows affected (0.00 sec)
```

rollback

事务执行回滚，回到事务操作之前的状态。

```
mysql> rollback;
Query OK, 0 rows affected (0.00 sec)
```

这里需要强调一下，ROLLBACK语句是我们程序员手动的去回滚事务时才去使用的，如果事务在执行过程中遇到了某些错误而无法继续执行的话，事务自身会自动的回滚。

完整的提交例子

```
mysql> begin;
Query OK, 0 rows affected (0.01 sec)

mysql> update account set balance=balance-20 where id = 1;
Query OK, 1 row affected (0.00 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> update account set balance=balance+20 where id = 2;
Query OK, 1 row affected (0.00 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> commit;
Query OK, 0 rows affected (0.01 sec)
```
