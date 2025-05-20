---
title: 面试了一位中兴的运维程序员
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## 面试了一位中兴的运维程序员

加群联系作者vx：xiaoda0423

仓库地址：<https://webvueblog.github.io/JavaPlusDoc/>

<https://1024bat.cn/>

<https://github.com/webVueBlog/fastapi_plus>

<https://webvueblog.github.io/JavaPlusDoc/>

![1747398531175.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/910a42c0866944828050590a08aa1c0b~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5oiR5piv5ZOq5ZCS:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTQ1MTAxMTA4MTI0OTE3NSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1748148707&x-orig-sign=jveq0WxoseZhD2sMzrbMz6e%2FIKY%3D)

***

## ✅ 一、CPU 排查命令示例

### 1️⃣ 实时查看 CPU 使用：

    top

### 2️⃣ 查看哪个进程最耗 CPU：

    ps aux --sort=-%cpu | head -10

### 3️⃣ 查看多核 CPU 分布情况：

    mpstat -P ALL 1

### 4️⃣ 查看进程 PID 的线程使用情况（Java 栈分析）：

    jstack <pid> | less

***

## ✅ 二、内存排查命令示例

### 1️⃣ 总体内存占用情况：

    free -h

### 2️⃣ 按内存排序的进程列表：

    ps aux --sort=-%mem | head -10

### 3️⃣ Swap 使用情况：

    vmstat 1

### 4️⃣ 查看被 OOM Killer 杀掉的进程：

    dmesg | grep -i oom

***

## ✅ 三、磁盘空间排查命令示例

### 1️⃣ 查看所有磁盘分区使用：

    df -h

### 2️⃣ 查看当前目录下各目录大小：

    du -sh *

### 3️⃣ 快速定位大文件（TOP 10）：

    du -ah / | sort -rh | head -n 10

### 4️⃣ 查看已被删除但仍占用磁盘的文件：

    lsof | grep deleted

***

## ✅ 四、磁盘 IO 排查命令示例

### 1️⃣ 查看 IO 状况：

    iostat -x 1

### 2️⃣ 查看 IO 等待（wa）：

    vmstat 1

### 3️⃣ 实时查看哪个进程读写最多：

    iotop

***

## ✅ 五、网络问题排查命令示例

### 1️⃣ 查看端口是否监听：

    ss -lntp  # 或 netstat -tulnp

### 2️⃣ 查看实时连接状态：

    ss -s

### 3️⃣ 查看 TCP 连接数：

    netstat -an | grep ESTABLISHED | wc -l

### 4️⃣ 检查网络连通性：

    ping 8.8.8.8

### 5️⃣ 抓包分析请求内容：

    tcpdump -i eth0 port 8080 -nn

***

## ✅ 六、一键性能总览工具（推荐）

    glances  # 安装：pip install glances

***

## ✅ 七、综合一键排查脚本（可选执行）

    #!/bin/bash
    echo "CPU:"
    top -b -n1 | head -5

    echo -e "\nMemory:"
    free -h

    echo -e "\nDisk Usage:"
    df -h

    echo -e "\nIO:"
    iostat -x 1 2

    echo -e "\nNetwork:"
    ss -s

***

## 1 procs（进程队列）

| 列     | 含义       | 通俗解释                                        |
| ----- | -------- | ------------------------------------------- |
| **r** | runnable | 正在 CPU 上跑或排队等跑的线程数，≈ CPU 核数 × 1 属于正常负载。     |
| **b** | blocked  | 因 I/O（磁盘/网络）或锁而睡眠的线程数。持续 \>0 说明 I/O 瓶颈或锁竞争。 |

> **示例**：`r 1→0`、`b 0` → CPU 很空闲，没有堵塞。

***

## 2 memory（内存）

| 列         | 含义         | 通俗解释                                        |
| --------- | ---------- | ------------------------------------------- |
| **swpd**  | swap used  | 已使用交换分区大小。≠0 代表“被换到磁盘”。                     |
| **free**  | free RAM   | 完全空闲内存。Linux 会尽量把闲置内存做缓存，所以 free 很低不代表内存不够。 |
| **buff**  | buffer     | 块设备读写用的元数据缓存（通常几百 MiB 内）。                   |
| **cache** | page cache | 文件数据缓存。越高越能加速读文件。                           |

> **示例**：`swpd 0`、`free 133 MiB`、`cache 1.2 GiB` → 没有用到 swap，内存够用。

***

## 3 swap（换页）

| 列      | 含义       | 通俗解释                          |
| ------ | -------- | ----------------------------- |
| **si** | swap-in  | 每秒从磁盘换入内存的字节块数。长期 \>0 意味内存不足。 |
| **so** | swap-out | 每秒换出到磁盘的字节块数。                 |

> **示例**：`si 0`、`so 0` → 未发生换页，一切正常。

***

## 4 io（块设备 I/O）

| 列      | 含义         | 通俗解释        |
| ------ | ---------- | ----------- |
| **bi** | blocks in  | 读磁盘速率（块/秒）。 |
| **bo** | blocks out | 写磁盘速率（块/秒）。 |

> **示例**：`bi 0~2`、`bo 0~388` → 磁盘几乎空闲；偶尔写入 388 块≈ ≈ 2 MiB/s，不算大压力。

***

## 5 system（系统）

| 列      | 含义             | 通俗解释                       |
| ------ | -------------- | -------------------------- |
| **in** | interrupts     | 每秒硬件中断次数，网络/磁盘繁忙时会上升。      |
| **cs** | context switch | 每秒上下文切换次数，并发线程多或内核调用频繁时变大。 |

> **示例**：`in 0~2302`、`cs 0~3834` → 中断和切换都不高。

***

## 6 cpu（CPU 利用率，百分比）

| 列      | 含义     | 通俗解释                    |
| ------ | ------ | ----------------------- |
| **us** | user   | 用户态程序耗 CPU 百分比。         |
| **sy** | system | 内核态耗 CPU 百分比（系统调用、软中断）。 |
| **id** | idle   | 空闲百分比。                  |
| **wa** | iowait | 等待磁盘 I/O 百分比，持续高说明磁盘慢。  |
| **st** | steal  | 虚拟化被宿主机“偷走”的 CPU 百分比。   |

> **示例**：`us 1-2 %`、`sy 1 %`、`id 95-99 %`、`wa 0-2 %`、`st 0 %`\
> CPU 大部分时间发呆，偶尔有极少 I/O 等待，系统非常轻松。

***

### 一句话诊断

*   **CPU** 几乎空闲
*   **内存** 充裕，无 swap
*   **磁盘/网络** I/O 很低，无阻塞
*   **整体** 系统处于“喝茶状态”，无需担心资源瓶颈。

> 如果以后看到：`r` 持续 > CPU 核数、`si/so` 不断增加、`wa` 高于 20 %，就是性能告警信号。

| 目录                                  | 状态                   | 建议                          |
| ----------------------------------- | -------------------- | --------------------------- |
| `/www/server`                       | ✅ 最大占用者              | 分析子目录，确认是否有历史文件可删除          |
| `/var/lib/docker`                   | 🚨 容器临时层             | 使用 `docker system prune` 清理 |
| `/sh`                               | ❓ 自定义目录              | 人工确认内容是否有保留意义               |
| `/var/lib/docker/.../elasticsearch` | 📊 容器内 Elasticsearch | 查看索引数据是否爆炸，设置索引生命周期策略（ILM）  |

    [root@VM-0-14-centos /]# du -ah / | sort -rh | head -n 10  
    du: cannot access ‘/proc/21718/task/21718/fd/4’: No such file or directory  
    du: cannot access ‘/proc/21718/task/21718/fdinfo/4’: No such file or directory  
    du: cannot access ‘/proc/21718/fd/3’: No such file or directory  
    du: cannot access ‘/proc/21718/fdinfo/3’: No such file or directory  
    13G /  
    5.3G /www  
    4.7G /www/server  
    3.3G /var  
    3.0G /usr  
    1.4G /var/lib  
    1.2G /var/lib/docker/overlay2  
    1.2G /var/lib/docker  
    1.2G /sh  
    1.1G /var/lib/docker/overlay2/d41f20e46c2773c0511a3038827e8edc76ad0b30c1c318a37c460b3ca31c1024/diff/usr/share/elasticsearch

## ✅ 基础字段说明

| 字段名            | 含义                           |
| -------------- | ---------------------------- |
| **Filesystem** | 设备或网络存储的名称（例如：本地硬盘、NFS 网络磁盘） |
| **Size**       | 分区总容量                        |
| **Used**       | 已使用的空间                       |
| **Avail**      | 剩余可用空间                       |
| **Use%**       | 使用率百分比                       |
| **Mounted on** | 这个设备挂载到系统的哪个目录上              |

***

## 🧾 核心磁盘挂载情况中文解释

### 📌 1. 根目录（系统主分区）：

    /dev/vda1         197G   91G   99G  48% /

*   **这是系统主分区**，所有 `/` 开头的路径都基于它。
*   总容量 197G，当前使用了 91G（大约一半），剩 99G。
*   **使用率 48%，属于健康状态。**

***

### 📌 2. Docker 容器层（多个 overlay 分区）：

    overlay 197G  91G  99G  48% /var/lib/docker/overlay2/xxxxx/merged

*   Docker 使用 **分层文件系统 overlay2**，这些是容器运行时的文件视图。
*   它们共享的是同一个主分区（`/dev/vda1`），所以容量一致。
*   **你运行了多个 Docker 容器，overlay 数量较多是正常的。**

***

### 📌 3. NFS 网络存储挂载（用于容器持久化）：

    172.18.96.88:/data1/ifs/kubernetes/... 1008G 623G 335G 66% /var/lib/kubelet/...

*   表示从 IP 为 `172.18.96.88` 的服务器挂载了远程磁盘（通过 NFS 协议）。
*   通常是 **K8s 容器的数据卷（如 MongoDB / ClickHouse / Cassandra 的持久卷）** 。
*   容量很大（1008G），使用 623G，剩余 335G，使用率 66%。
*   **只要 < 80%，都属正常范围。**

***

### 📌 4. `tmpfs` 文件系统（虚拟内存盘）：

    tmpfs   7.7G   12K   7.7G   1% /var/lib/kubelet/pods/...

*   `tmpfs` 是一种用内存创建的临时文件系统，**速度很快**，重启即清除。
*   用于 Kubernetes 存储容器临时 Secret、Token。
*   通常使用率非常低（几 KB），这是正常的。

***

### 📌 5. `shm` 共享内存目录：

    shm  64M  0  64M  0% /var/lib/docker/containers/xxx/mounts/shm

*   每个容器都有自己的 `shm`，用于进程间共享内存（如浏览器/数据库共享区）。
*   也是内存中的，不占用硬盘，64MB 为默认配置。

***

## ✅ 总结：当前磁盘状态健康

| 分类                | 状态说明             |
| ----------------- | ---------------- |
| **系统盘 /dev/vda1** | 使用率 48%，非常健康     |
| **容器 overlay**    | 都挂载在系统盘下，随容器而建   |
| **NFS 网络盘**       | 使用 66%，也在正常范围    |
| **tmpfs / shm**   | 基于内存的临时文件系统，占用极低 |
| **没有分区超过 80%**    | ✅ 没有磁盘告警风险       |

***

## ✅ 建议（如长期运行）：

| 场景       | 建议                                  |
| -------- | ----------------------------------- |
| 容器频繁重建   | 定期清理 `/var/lib/docker/overlay2` 残留层 |
| NFS 写入慢  | 检查网络带宽与挂载参数（如 `rsize/wsize`）        |
| 未来容量上涨风险 | 建议对根分区或 NFS 容量做容量监控，超过 85% 报警       |

***

## 📋 字段中文说明

### `procs（进程队列）`

| 字段  | 含义                | 解读                        |
| --- | ----------------- | ------------------------- |
| `r` | 可运行进程数量（正在等待 CPU） | \> 核心数时说明 **CPU 繁忙/调度堵塞** |
| `b` | 正在等待 I/O 的进程      | 有值说明有 **磁盘或网络 I/O 阻塞**    |

### `memory（内存）`

| 字段      | 含义              |
| ------- | --------------- |
| `swpd`  | 使用的 swap 空间（KB） |
| `free`  | 空闲内存            |
| `buff`  | 用作块缓存的内存        |
| `cache` | 用作文件缓存的内存（可回收）  |

### `swap（交换分区）`

| 字段   | 含义                     |
| ---- | ---------------------- |
| `si` | 从 swap 分区读入内存的速率（KB/s） |
| `so` | 从内存写入 swap 的速率（KB/s）   |

> 一旦 `si/so > 0`，说明 **内存压力大，正在使用 swap**

### `io（磁盘 I/O）`

| 字段   | 含义              |
| ---- | --------------- |
| `bi` | 每秒块设备读入速率（KB/s） |
| `bo` | 每秒块设备写出速率（KB/s） |

### `system（系统）`

| 字段   | 含义                   |
| ---- | -------------------- |
| `in` | 每秒中断次数（包括时钟中断）       |
| `cs` | 每秒上下文切换次数（线程调度频繁时变高） |

### `cpu（CPU 使用率）`

| 字段   | 含义                    |
| ---- | --------------------- |
| `us` | 用户态 CPU 使用（Java、业务逻辑） |
| `sy` | 内核态 CPU 使用（系统调用、网络）   |
| `id` | 空闲 CPU 比例             |
| `wa` | 等待 I/O 比例（磁盘/网络慢时变高）  |
| `st` | 被虚拟化系统抢占的时间（云主机特有）    |

***

## 🔍 当前系统状态分析（从每秒变化行判断）

| 项目                | 观察值                           | 解读                        |
| ----------------- | ----------------------------- | ------------------------- |
| `r` 平均 1\~6       | 有时高达 6                        | 有**并发负载**但没过载（系统为 4 核）属正常 |
| `b` 一直为 0         | 无进程阻塞在 IO                     | 没有明显磁盘瓶颈                  |
| `si/so` 为 0       | 没用 swap（也确实未启用）               | ✅                         |
| `wa` 平均 1\~4%     | 有少量 IO 等待                     | 小负载，无需担忧，持续观察             |
| `cs` 约 12w 次/s    | **线程调度极频繁**，可能 Java 应用上下文切换活跃 |                           |
| `us+sy` 在 17\~28% | CPU 利用合理                      | 有一定业务压力但没有瓶颈              |

***

## ✅ 总体结论

当前系统 **运行健康，暂无严重瓶颈**，仅有以下轻微负载现象：

*   `cs`（上下文切换）很高，说明线程调度频繁，可能与：

    *   **RocketMQ / Cassandra 多线程并发处理任务有关**
    *   可以通过 `top -H -p <pid>` 和 `jstack` 分析具体线程活跃情况

*   `wa` 稍有提升（1\~4%），若持续走高可进一步分析 IO 层：

    *   通过 `iostat -x 1`、`iotop` 或 `dstat -dny` 查看慢盘、IO高进程

***

## 📌 后续建议

| 场景         | 建议                          |
| ---------- | --------------------------- |
| 持续 cs 很高   | `perf top` 或 `jstack` 查热点线程 |
| wa 明显升高    | 查看 `iotop`、分区是否爆写、慢磁盘       |
| r \> 4 持续高 | 检查 CPU 是否瓶颈、是否需要扩容          |
| swap 未启用   | 已知但已巡检完毕（上一步已创建脚本）          |

***

## 📋 前十内存占用进程分析表

| 排名 | 应用                  | %MEM  | RSS（常驻内存） | Xmx配置      | 分析要点                                |
| -- | ------------------- | ----- | --------- | ---------- | ----------------------------------- |
| ①  | Elasticsearch       | 16.4% | \~2.6 GB  | `-Xmx2g`   | 内存已接近上限，正常但需监控 GC 和查询负载             |
| ②  | RocketMQ Broker     | 8.5%  | \~1.3 GB  | `-Xmx1g`   | 超出配置值（说明使用了直接内存 / MappedByteBuffer） |
| ③  | Cassandra           | 6.0%  | \~964 MB  | `-Xmx512m` | 内存明显超出配置，**可能内存泄漏或 jamm 统计不准**      |
| ④  | Kafka ZK            | 2.6%  | \~428 MB  | `-Xmx512m` | 属于 Zookeeper，不算高，正常                 |
| ⑤  | ArgusAgent          | 1.7%  | \~283 MB  | N/A        | 云监控 Agent，轻量服务                      |
| ⑥  | MongoDB             | 1.7%  | \~272 MB  | N/A        | 内存占比合理                              |
| ⑦  | MariaDB             | 1.6%  | \~270 MB  | N/A        | 可结合 `innodb_buffer_pool_size` 优化    |
| ⑧  | RocketMQ NameServer | 1.4%  | \~228 MB  | `-Xmx512m` | 内存正常，GC 配置较保守                       |
| ⑨  | ClickHouse          | 0.8%  | \~134 MB  | N/A        | 非热点时低占用合理                           |

***

## 🔍 关键诊断结论

### ✅ 正常情况：

*   ES、RocketMQ、Cassandra 都运行在较高负载下，但仍在系统总内存承受范围内。
*   MongoDB、MariaDB、ClickHouse 占用轻量，无性能隐患。

### ⚠️ 异常/需关注点：

| 问题                            | 建议                                                                                                  |
| ----------------------------- | --------------------------------------------------------------------------------------------------- |
| Cassandra 使用超出 `Xmx512M` 明显异常 | - 可能是 native memory 泄漏（如 jemalloc 未限制） - 建议 **增加 Xmx 到 1\~2G 并限制 jemalloc preload** 或观察 `jcmd/jmap` |
| RocketMQ Broker 超出 `Xmx1G`    | - 说明使用了大量 off-heap（如 commitlog 映射） - 检查 `MaxDirectMemorySize`、PageCache 是否命中率低                      |
| ES 占用 2.6G 接近上限               | - 若频繁 Full GC，可增加 `Xmx` 或优化查询 DSL / 分片数                                                             |
| 无 Swap 空间，系统临界状态风险高           | - 建议立即挂载 `swap`，参考前述脚本 `enable_swap.sh`                                                             |

***

## 🛠️ 下一步建议操作

| 目标                               | 建议操作                                                           |
| -------------------------------- | -------------------------------------------------------------- |
| 分析 Cassandra 内存使用                | `jcmd <pid> VM.native_memory summary` 或 `jmap -heap <pid>`     |
| 检查 RocketMQ 是否 DirectMemory 使用超限 | 查看 `MaxDirectMemorySize`、日志 GC FullGC 频率                       |
| ES 优化                            | - 查看 `/_cat/segments?v` 是否碎片多 - `/_nodes/stats/jvm` 看 GC stats |
| 定期巡检脚本加入 mem + GC 检测             | 扩展前述巡检脚本中添加：`jstat -gc <pid>` / `grep -i gc.log`               |

***

## 📊 当前内存使用情况（单位：GB）

| 项目             | 数值   | 说明               |
| -------------- | ---- | ---------------- |
| **total**      | 15G  | 总物理内存            |
| **used**       | 7.1G | 已使用（不包括缓存）       |
| **free**       | 732M | 真正未被使用的内存（很少）    |
| **buff/cache** | 7.4G | 被操作系统用于缓存（可回收）   |
| **available**  | 7.8G | 实际可用（空闲 + 可回收缓存） |

***

## 🧠 内存使用解读：

*   **空闲内存（free）仅 732MB**，看似很少，但这是 Linux 的正常表现。
*   **buff/cache 高达 7.4G**：Linux 会把没被用的内存尽可能用来缓存磁盘数据，以提升系统效率。
*   **available 达到 7.8G**：说明还有足够的内存供新程序使用，不存在真正的内存压力。

***

## ❄️ Swap 分区情况：

    Swap: 0B total, 0B used

> 系统当前没有启用 Swap 分区，也就是没有交换空间。

### 📌 有无 Swap 的区别：

| 项目   | 有 Swap     | 无 Swap         |
| ---- | ---------- | -------------- |
| 内存满后 | 会暂存到硬盘（慢）  | 会直接触发 OOM 杀死进程 |
| 稳定性  | 更稳         | 有 OOM 风险       |
| 性能   | 偶尔慢（如大 GC） | 更高（无换页）        |

***

### ✅ 建议是否开启 Swap？

| 场景                                     | 建议                             |
| -------------------------------------- | ------------------------------ |
| 应用可控、服务轻量                              | **可不启用**，避免频繁换页                |
| 有 JVM、大内存服务（如 Cassandra、Elasticsearch） | ✅ **建议启用 2\~4GB swap 分区** 作为保护 |
| 云服务器（如阿里云 ECS）                         | 可用 `swapfile` 快速挂载临时 swap 空间   |

***

## 🛠️ 快速添加 Swap 示例（无需重启）

    # 创建一个 2GB 的 swap 文件
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile

    # 查看效果
    free -h

> 如需永久生效，请在 `/etc/fstab` 中添加：

    /swapfile none swap sw 0 0

***

```
📋 系统性能巡检报告 - Sun May 18 08:45:43     2025
=========================================

🧠 [CPU 使用情况]
./sys_check.sh: line 8: mpstat: command not found

📈 [系统负载 - load average]
./sys_check.sh: line 12: uptime: command not found

🔥 [Top 5 CPU 占用进程]
ps: unknown option -- o
Try `ps --help' for more information.

💾 [Top 5 内存占用进程]
ps: unknown option -- o
Try `ps --help' for more information.

📊 [内存使用 free -h]
./sys_check.sh: line 24: free: command not found

🧊 [Swap 使用情况]
./sys_check.sh: line 28: swapon: command not found
未启用 swap

🖴 [磁盘 IO 性能 iostat]
./sys_check.sh: line 32: iostat: command not found

💽 [磁盘使用情况 df -h]
Filesystem       Size  Used Avail Use% Mounted on
D:/software/Git  621G  334G  288G  54% /
C:               300G  199G  102G  67% /c

🧱 [磁盘 inode 使用情况]
Filesystem      Inodes IUsed IFree IUse% Mounted on
D:/software/Git      -     -     -     - /
C:                   -     -     -     - /c

🌐 [网络连接统计 ss -s]
./sys_check.sh: line 44: ss: command not found

📡 [网络流量]
❗ 未安装 ifstat，跳过网络流量采集

⚠️ [关键系统日志 (dmesg)]
./sys_check.sh: line 57: dmesg: command not found

✅ 巡检完成！

```

## 📋 字段中文含义

| 字段        | 含义                            |
| --------- | ----------------------------- |
| `%usr`    | 用户态 CPU 使用率（如 Java、Python 程序） |
| `%nice`   | 改变优先级的进程占用率（通常为 0）            |
| `%sys`    | 内核态 CPU 使用率（系统调用、驱动等）         |
| `%iowait` | 等待 I/O 的 CPU 时间占比（磁盘或网络慢）     |
| `%irq`    | 硬件中断时间占比（如网卡中断）               |
| `%soft`   | 软件中断（如内核定时器、网络协议栈）            |
| `%steal`  | 被虚拟化环境抢占的 CPU 时间（如云服务器）       |
| `%idle`   | 空闲时间                          |

***

## ✅ 关键数据解读（汇总视角）

### 📈 汇总行 `CPU all`（整体平均）：

    %usr:  9.68%
    %sys:  4.30%
    %iowait: 2.15%
    %soft: 2.42%
    %idle: 81.45%

### 🧠 分析：

*   整体 CPU 利用率不算高，**81% 空闲**
*   用户态使用率 \~9.68%，说明有正常的业务负载（如 Cassandra）
*   `iowait` 为 **2.15%** ，轻微 I/O 等待，**不严重但值得持续观察**
*   `soft`（软件中断）为 **2.42%** ，说明有一些网络、IO 或内核事件压力（可排查网络流量）

***

## 🧠 分核心分析：

\| 核心 | %usr | %sys | %iowait | %soft | %idle | 说明 |\
\|------|------|------|---------|--------|--------|\
\| CPU0 | 7.61 | 4.35 | 3.26 | 3.26 | 81.52 | IO/软中断略高，稳定 |\
\| CPU1 | 12.77| 3.19 | 2.13 | 1.06 | 80.85 | 主要在处理业务逻辑（如 Java 线程） |\
\| CPU2 | 8.79 | 4.40 | 1.10 | 4.40 | 81.32 | soft 较高，可能是网络或 Cassandra 线程池抢占 |\
\| CPU3 | 8.60 | 3.23 | 2.15 | 1.08 | 84.95 | 最轻松的核之一 |

***

## 🔎 初步结论

*   当前系统整体 **无严重 CPU 瓶颈**，主要是：

    *   Cassandra、RocketMQ 进程在合理使用资源
    *   **部分核心 `soft` 较高**，可能是 **网络中断或 Java 应用线程切换频繁**

*   如果你在排查性能瓶颈，**更可能出现在 JVM 层（GC、线程调度）或磁盘 IO 层**

***

## 📌 建议下一步排查：

| 排查项                   | 命令/建议                                      |
| --------------------- | ------------------------------------------ |
| 查看 Cassandra 是否 GC 频繁 | `tail -f gc.log` 或使用 `jstat -gc PID 1s 10` |
| 查看软中断来源               | `cat /proc/softirqs` 观察哪一类中断频繁（如 NET\_RX）  |
| 磁盘 IO                 | `iostat -x 1` 或 `iotop`                    |
| 网络流量瓶颈                | `iftop` 或 `nload`，看是否有卡顿或高流量进程             |
| Cassandra 压力          | 查询慢日志、Compaction 状态、Pending Tasks          |

***

Linux 3.10.0-1160.76.1.el7.x86\_64 (node-6) 05/18/2025 *x86\_64* (4 CPU)
08:07:05 AM CPU %usr %nice %sys %iowait %irq %soft %steal %guest %gnice %idle

## 📋 表头说明（字段解释）

| 字段        | 含义                                    |
| --------- | ------------------------------------- |
| `USER`    | 启动该进程的用户                              |
| `PID`     | 进程 ID                                 |
| `%CPU`    | CPU 使用率（越高说明该进程占用越多 CPU）              |
| `%MEM`    | 内存使用率                                 |
| `VSZ`     | 虚拟内存大小（单位 KB）                         |
| `RSS`     | 常驻内存大小（实际占用的物理内存，单位 KB）               |
| `TTY`     | 终端设备（大多数服务进程为 `?`，表示不是由终端启动）          |
| `STAT`    | 进程状态（如 S=睡眠，R=运行，Z=僵尸，Ssl=有控制终端+后台运行） |
| `START`   | 进程启动时间                                |
| `TIME`    | 累计占用 CPU 的时间（越大越占用资源）                 |
| `COMMAND` | 执行命令及其参数                              |

***

## 🔍 每一行的中文逐行解释

### **① Cassandra Java 进程**

    cassand+ 31037 27.5  5.9 3707904 954832 ? Ssl Apr25 8990:29 java ... CassandraDaemon

*   **CPU 占比 27.5%** ，长期运行（累计占用近 9000 分钟）
*   说明 Cassandra 数据库实例长期占用 CPU，非常可疑，需重点排查。
*   参数显示 `-Xms512M -Xmx512M`，内存设置很低，可能是性能瓶颈。

### **② RocketMQ Broker**

    xxx 5500  7.0  8.5 7110980 1365700 ? Sl Apr25 2288:02 java ... BrokerStartup

*   **CPU 占用 7.0%** ，占用内存较多（\~1.3GB）
*   是一个 RocketMQ 的 broker 节点
*   负载明显，但不异常，可能消息量大时拉高

### **③ ClickHouse 数据库**

    101 1873  2.6  0.8 6164148 142632 ? Sl Apr15 1254:38 clickhouse-server

*   **轻微 CPU 占用**，常驻服务，说明有活跃查询或聚合任务

### **④ Elasticsearch**

    cassand+ 7240  2.6 16.3 8373412 2621424 ? Sl May16 54:21 java ... elasticsearch

*   **CPU 占用正常，内存占比极高**（2.5GB，16.3%）
*   如果没有禁用 swap 且内存紧张，ES 容易引发 GC 或卡顿

### **⑤ Kubelet**

    root 12693  1.3  0.4 1599980 79768 ? Ssl Apr03 891:25 kubelet ...

*   Kubernetes 管理组件，用于 Node 节点状态同步
*   占用不高，属正常范围

### **⑥ Docker Daemon**

    root 12415  0.9  0.4 1842672 76780 ? Ssl Apr03 613:03 dockerd ...

*   Docker 服务守护进程，长期运行的正常状态

### **⑦ 阿里云安全监控进程**

    root 14943  0.9  0.1 175748 25652 ? Ssl Apr15 445:20 AliYunDunMonitor

*   阿里云服务器安全 agent，CPU 占用稳定

### **⑧ 内核工作线程**

    root 12709  0.8  0.0 0 0 ? S< 06:54 0:16 [kworker/2:2H]

*   后台硬件处理线程（内核级），略有活动

### **⑨ 云监控 Agent**

    root 21524  0.3  1.7 2165708 283472 ? Sl 2023 3406:46 argusagent

*   阿里云/腾讯云等监控 agent，占用略高但可以接受

***

## 📌 当前系统状况总结

| 项目             | 结论                               |
| -------------- | -------------------------------- |
| **高 CPU 占用进程** | Cassandra、RocketMQ Broker        |
| **高内存进程**      | Elasticsearch、RocketMQ           |
| **关键建议**       | Cassandra 已长期占用大量 CPU，应检查其负载是否异常 |

***

## ✅ 后续排查建议（重点 Cassandra）：

### ▶ 1. 线程层级分析

    top -Hp 31037            # 找出 Cassandra 的高 CPU 线程

### ▶ 2. 栈调用分析（排查死循环或热点）

    jstack 31037 > jstack.log

### ▶ 3. GC 日志分析

    less /usr/local/apache-cassandra-3.11.2/logs/gc.log

*   是否频繁 Full GC？
*   GC 时间是否过长？

### ▶ 4. 磁盘和 compaction 压力

*   查看 `system.log` 是否有 compaction 持续进行

<!---->

    tail -f /usr/local/apache-cassandra-3.11.2/logs/system.log

***

## 🧾 第一行：系统运行时间与负载情况

    top - 07:02:58 up 919 days, 16:33,  3 users,  load average: 3.19, 2.44, 2.19

| 字段                               | 含义                                                      |
| -------------------------------- | ------------------------------------------------------- |
| `07:02:58`                       | 当前系统时间                                                  |
| `up 919 days, 16:33`             | 系统已经运行了 919 天 16 小时                                     |
| `3 users`                        | 当前有 3 个登录用户                                             |
| `load average: 3.19, 2.44, 2.19` | 系统平均负载（过去 1、5、15 分钟）一般情况下，**load \> CPU 核心数** 表示系统可能有压力 |

> **建议：** 如果你是 2 核或 4 核机器，`3.19` 就说明负载略高。

***

## 🔧 第二行：任务（进程）状态

    Tasks: 165 total,   1 running, 164 sleeping,   0 stopped,   0 zombie

| 状态                       | 含义                  |
| ------------------------ | ------------------- |
| `165 total`              | 总共 165 个进程          |
| `1 running`              | 其中 1 个正在运行（即使用 CPU） |
| `164 sleeping`           | 大部分在等待（sleep）状态     |
| `0 stopped` / `0 zombie` | 没有被暂停或僵尸进程（正常）      |

***

## 🧠 第三行：CPU 使用情况（所有核心总体占比）

    %Cpu(s):  7.0 us,  3.5 sy,  0.0 ni, 87.7 id,  0.0 wa,  0.0 hi,  1.8 si,  0.0 st

| 字段           | 含义                    |
| ------------ | --------------------- |
| `us` (7.0%)  | 用户空间占用（如 Java、Python） |
| `sy` (3.5%)  | 内核空间（系统调用）占用          |
| `id` (87.7%) | 空闲 CPU 时间             |
| `si` (1.8%)  | 软件中断，例如网络、I/O 中断      |
| `wa` (0.0%)  | 等待 IO（如果高表示磁盘慢）       |

> 当前 CPU 总体压力不高（87.7% 空闲），但某进程占用高。

***

## 🧬 第四行：内存使用情况（单位 KiB，即 1024 字节）

    KiB Mem : 15990492 total,  1075056 free,  7387956 used,  7527480 buff/cache

| 字段           | 含义                    |
| ------------ | --------------------- |
| `total`      | 总内存 15.9 GB           |
| `free`       | 剩余 1 GB 可用（较少）        |
| `used`       | 已使用 7.3 GB            |
| `buff/cache` | Linux 缓存 7.5 GB（可被回收） |

> 实际可用内存：`free + buff/cache ≈ 8.6G`，暂时没有内存压力。

***

## 💾 第五行：交换分区（Swap）

    KiB Swap:        0 total,        0 free,        0 used.  8258336 avail Mem

*   当前系统 **没有开启 swap 分区**，说明依赖物理内存。
*   `avail Mem`: 8.25 GB，是内核预估可用内存。

***

## 🔍 最下方：进程列表（按 CPU 排序）

    PID    USER      %CPU %MEM COMMAND
    31037  cassand+  62.5  5.9  java

| 字段        | 含义                      |
| --------- | ----------------------- |
| `PID`     | 进程号                     |
| `USER`    | 所属用户 cassandra          |
| `%CPU`    | 占用 CPU 62.5%（非常高）       |
| `%MEM`    | 占用内存 5.9%（约 950MB）      |
| `COMMAND` | 执行程序为 `java`（Cassandra） |

***

## 🚨 结论与建议：

*   **当前 Cassandra Java 进程 CPU 占用过高（62.5%）** ，是主要负载来源。

*   可能存在：

    *   查询过多或热点写入
    *   GC 频繁（需看 `jstat`）
    *   长时间运行未重启，内部累积数据
