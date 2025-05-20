---
title: 笔记1运维服务器6年经验
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## 笔记1运维服务器6年经验

## ✅ 一、查看端口是否被占用的常用命令

### 1️⃣ `lsof` 命令（最推荐）

```bash
lsof -i :端口号
```

#### 示例：

```bash
lsof -i :8080
```

输出：

```
COMMAND   PID  USER   FD   TYPE  DEVICE SIZE/OFF NODE NAME
java     1278  root   45u  IPv6  123456      0t0  TCP *:http-alt (LISTEN)
```

表示：Java 进程正在监听 8080 端口。

---

### 2️⃣ `netstat` 命令（传统方式）

```bash
netstat -tunlp | grep :端口号
```

#### 示例：

```bash
netstat -tunlp | grep :8080
```

输出：

```
tcp6  0  0 :::8080  :::*  LISTEN  1278/java
```

---

### 3️⃣ `ss` 命令（更快更现代）

```bash
ss -ltnp | grep :端口号
```

#### 示例：

```bash
ss -ltnp | grep :8080
```

输出：

```
LISTEN 0 128 :::8080 :::* users:(("java",pid=1278,fd=45))
```

---

## ✅ 二、查看哪个程序占用了端口

### 命令组合：

```bash
lsof -i :端口号
# 或
netstat -tunlp | grep :端口号
# 或
ss -ltnp | grep :端口号
```

你会看到：

* `PID`：进程 ID
* `COMMAND`：进程名
* `fd`：文件描述符
* `LISTEN` 状态：表示该端口是服务端监听中

---

## ✅ 三、查看端口是否能访问（远程端口）

### 本地 telnet（测试远程是否通）：

```bash
telnet ip port
```

#### 示例：

```bash
telnet 127.0.0.1 8080
```

> 如果显示 `Connected to 127.0.0.1.`，说明端口是开放的。

---

## ✅ 四、没有 `lsof` / `netstat` 时怎么办？

安装命令：

```bash
# Debian/Ubuntu
sudo apt install lsof net-tools

# CentOS/RHEL
sudo yum install lsof net-tools
```

---

## ✅ 五、进阶工具（可选）

| 工具        | 用途              |           |
| --------- | --------------- | --------- |
| `nmap`    | 扫描本机或远程端口是否开放   |           |
| `fuser`   | 快速找出哪个 PID 占用端口 |           |
| `nc -zv`  | 测试端口连通性         |           |
| \`ss -anp | grep LISTEN\`   | 通用的监听端口扫描 |

---

> 查看端口是否被占用，我通常使用 `lsof -i :端口` 或 `ss -ltnp`，能直接定位是哪一个进程监听该端口。实际中如果是端口冲突导致服务启动失败，可以结合 `kill PID` 或 `fuser -k` 来释放端口。

---


* **先宏观、后细节**：先看全局指标再聚焦具体进程 / 线程 / 调用栈
* **先“活数据”，后“冷分析”**：先用实时工具捕捉异常，再用离线日志或 Dump 深挖
* **留证据、可复现**：执行高频采样时先确认磁盘空间、权限和对业务的影响

---

## 0  事前准备

| 动作                                | 目的            |
| --------------------------------- | ------------- |
| **记录时间线**（报警触发点、峰值出现点）            | 方便对比前后基线      |
| **确认变更**（发布、配置、流量）                | 排除代码 / 业务层面因素 |
| **确保 root / sudo + perf/ebpf 权限** | 避免临时被卡权限      |

---

## 1  快速横向体检（1–2 分钟）

```bash
uptime            # load & run-queue
top -b -n 1       # CPU/Load/Swap 一眼看
free -m           # 内存概览
df -hT            # 容量/只读分区
iostat -xz 1 3    # 磁盘 util% / await
sar -n DEV 1 3    # 网卡收发速率/丢包
```

> **判断优先级**：
>
> 1. load≈CPU 核数且 %sy/%wa 高 → 先查 CPU 或磁盘
> 2. free 可用内存低 + swpd 增长 → 查内存泄漏 / OOM
> 3. iostat %util 常年 >80% 或 await > 50 ms → 查磁盘
> 4. 网络丢包 / re-trans 增长 → 查网络

---

## 2  CPU 排查

| 步骤        | 命令                                                                              | 说明                              |
| --------- | ------------------------------------------------------------------------------- | ------------------------------- |
| ① 进程定位    | `top -H` / `htop`                                                               | 找到高 CPU PID 或线程 (TID)           |
| ② 线程源码归位  | `ps -Lp <PID>`                                                                  | 将 TID ↔ 线程名                     |
| ③ 调用栈抓取   | `perf top -p <PID>` 或 `perf record -F 99 -p <PID> -- sleep 30`，随后 `perf report` | 取热点函数                           |
| ④ Java 专用 | `jstack -l <PID>` / async-profiler                                              | 对应线程状态、死循环、GC 卡顿                |
| ⑤ 内核抢占    | `mpstat -P ALL 1`、`pidstat -w`                                                  | context-switch、cpu steal 判断虚机噪音 |

---

## 3  内存排查

| 步骤       | 命令                                                                 | 说明                  |
| -------- | ------------------------------------------------------------------ | ------------------- |
| ① 누수初判   | `free -m`、`vmstat 1`                                               | 缓存/缓存回收、swap in/out |
| ② 进程级    | `top -o %MEM`、`smem -r`                                            | 找占用最大的进程            |
| ③ 映射明细   | `pmap -x <PID>` / `cat /proc/<PID>/smaps_rollup`                   | 堆 / 共享库 / 匿名页       |
| ④ Java 堆 | `jmap -heap <PID>`、`jmap -histo:live`、`jcmd GC.heap_info`          | 老年代溢出、类加载飙升         |
| ⑤ 堆 Dump | `jmap -dump:live,format=b,file=heap.hprof <PID>`，MAT / VisualVM 分析 | 根因定位（集合持有 / 缓存未清）   |
| ⑥ 内核缓存   | `slabtop`、`kmemleak`                                               | 罕见但要排除 driver 泄漏    |

---

## 4  磁盘 & IO 排查

| 步骤      | 命令                                     | 说明                         |
| ------- | -------------------------------------- | -------------------------- |
| ① 负载概览  | `iostat -xz 1`                         | `%util`、`await`、`avgrq-sz` |
| ② 进程级   | `pidstat -d 1`、`iotop -b -n 3`         | 哪个进程读写大                    |
| ③ 磁盘延迟  | `blktrace /dev/sdX` + `blkparse`       | 队列/设备层延迟                   |
| ④ 文件定位  | `lsof +D /path` 或 `fileslower-bpfcc`   | 频繁访问文件路径                   |
| ⑤ FS 级别 | `df -ih`、`dumpe2fs -h`                 | inode 耗尽、磁盘坏块              |
| ⑥ 调优    | `deadline→mq-deadline`、`noop`、`fio` 基准 | IO 调度、RAID/SSD 队列深度        |

---

## 5  网络排查

| 步骤          | 命令                                        | 说明                     |                    |
| ----------- | ----------------------------------------- | ---------------------- | ------------------ |
| ① 速率 / 丢包   | `sar -n DEV 1`、`ethtool -S eth0`          | TX/RX errors, drops    |                    |
| ② 连接数       | `ss -s`、`ss -ant state established`       | SYN flood? FD 耗尽?      |                    |
| ③ 会话详情      | `ss -ntp sport = :8080`                   | 哪些远端连接最多               |                    |
| ④ RTT / 路由  | `mtr <ip>`、`tracepath`                    | 跨机房抖动排除                |                    |
| ⑤ 微包/重传     | `tcpdump -i eth0 -w cap.pcap` + Wireshark | Window size、Dup ACK    |                    |
| ⑥ Socket 队列 | \`netstat -anp                            | grep <PID>`、`ss -ltn\` | Recv-Q / Send-Q 堵塞 |

---

## 6  跨资源综合分析

1. **时间轴对齐**：Grafana/Prometheus 将 CPU、iowait、GC、p99 延迟放在同一 Dashboard。
2. **内核 ebpf**：用 bcc / bpftrace 即时追踪 (e.g. `profile`, `tcpconnlat`, `biolatency`).
3. **压测复现**：ab / wrk / vegeta 重放流量，配合 `perf/kernexec` 抓热点。
4. **容器视角**：`docker stats`、cgroup `/sys/fs/cgroup/*/usage_usec`、K8s Metrics-Server。
5. **自动化**：把常用采样脚本写成 `diag.sh`，配合 Ansible/Fabric 一键收集，避免线上手动误操作。

---

## 7  建议的“黄金三板斧”脚本

```bash
# gstack + top
pid=$(top -b -n1 | awk '/^ *[0-9]+/ && $9>500 {print $1;exit}')
gstack $pid > /tmp/stack.$(date +%s)

# 30s CPU 火焰图
perf record -F 99 -g -p $pid -- sleep 30
perf script | flamegraph.pl > /tmp/cpu.svg

# ebpf: 连接延迟
/tcpconnectlat-bpfcc -d 10 > /tmp/tcplat.log
```

---

### 结语

1. **先定位资源瓶颈 → 再定位进程 → 再看线程 / 调用栈 / 系统调用 / 数据结构**。
2. **复现-> 采样-> 验证**，任何优化都要有客观指标前后对比。
3. **脚本化、自动化**：把上述高频操作固化到仓库，避免“凭感觉”排障。



---

## ✅ 一、CPU 性能问题排查

### 🔍 排查目标：

* 哪个进程/线程占用 CPU 高？
* 是系统调用高？还是业务代码死循环？
* 多核是否均衡？

### 🛠️ 常用命令：

| 命令                         | 用途                   |
| -------------------------- | -------------------- |
| `top`                      | 查看实时 CPU 使用率、负载、占用进程 |
| `htop`                     | 图形化显示各核使用，支持排序和筛选    |
| `ps aux --sort=-%cpu`      | 静态查看占用 CPU 的进程       |
| `pidstat -u -p <pid> 1`    | 查看某个进程的 CPU 使用详情     |
| `perf top` / `perf record` | 查看热点函数，分析死循环         |
| `jstack <pid>`             | Java 进程线程栈分析，定位死循环线程 |

### 🚨 实战指标：

* `load average` 高，但 CPU 利用率低 → IO 等待
* `top` 中 `%us`（用户态）高 → 业务逻辑问题
* `%sy` 高 → 系统调用多，可能频繁网络/disk 操作
* `%id`（空闲）低 → CPU 打满

---

## ✅ 二、内存问题排查

### 🔍 排查目标：

* 是否 OOM（内存打爆）？
* 是哪个进程吃内存？
* 有没有内存泄漏？

### 🛠️ 常用命令：

| 命令                                     | 用途                               |                |
| -------------------------------------- | -------------------------------- | -------------- |
| `free -h`                              | 查看整体内存和 swap 使用情况                |                |
| `top` / `htop`                         | 查看哪个进程吃内存                        |                |
| `ps aux --sort=-%mem`                  | 内存占用排序                           |                |
| `vmstat 1`                             | `si/so` 代表 swap in/out（频繁表示内存不足） |                |
| `smem` / `pmap <pid>`                  | 查看进程内存映射                         |                |
| `jmap -heap <pid>` / `jstat -gc <pid>` | Java 堆信息                         |                |
| \`dmesg                                | grep -i oom\`                    | 查看是否有 OOM 杀死记录 |

### 🚨 实战指标：

* swap 使用过高 → 内存不足
* `OOM Killer` 出现 → 杀掉了高占用进程
* Java 内存泄漏 → 用 `MAT` 工具分析 dump

---

## ✅ 三、磁盘空间问题排查

### 🔍 排查目标：

* 是否磁盘已满？
* 是哪个目录/文件太大？
* 哪些临时文件没有清理？

### 🛠️ 常用命令：

| 命令                           | 用途             |                       |
| ---------------------------- | -------------- | --------------------- |
| `df -h`                      | 查看磁盘各分区使用情况    |                       |
| `du -sh *`                   | 查看当前目录大小       |                       |
| `ncdu`                       | 交互式目录体积分析      |                       |
| `find / -type f -size +500M` | 找出超过 500M 的文件  |                       |
| \`lsof                       | grep deleted\` | 查看已删除但仍占用磁盘的文件（常见于日志） |

### 🚨 实战指标：

* `/var` 或 `/tmp` 被日志打满 → 服务异常
* 日志文件被删但没释放 → 需重启进程
* `docker`/`log`/`core dump` 等导致空间异常消耗

---

## ✅ 四、磁盘 IO 问题排查

### 🔍 排查目标：

* 是否磁盘读写速率限制系统？
* 哪个进程 IO 频繁？
* IO 等待高？

### 🛠️ 常用命令：

| 命令            | 用途                            |
| ------------- | ----------------------------- |
| `iostat -x 1` | 查看每块磁盘的利用率 `util` 和等待 `await` |
| `iotop`       | 实时查看进程的读写 IO 负载               |
| `vmstat 1`    | `wa` 字段高说明 IO 等待高             |
| `dstat -d`    | 磁盘写入速率                        |
| `sar -d 1 5`  | 历史 IO 数据                      |

### 🚨 实战指标：

* `iostat` 中某磁盘 `util` > 80% → 说明该磁盘是瓶颈
* `await` > 50ms → 表示磁盘响应慢
* Java 日志写入频繁也会导致 IO 拥堵

---

## ✅ 五、网络性能问题排查

### 🔍 排查目标：

* 网络延迟？丢包？带宽不够？
* 服务端口未监听？
* 某服务连接满了？

### 🛠️ 常用命令：

| 命令                          | 用途           |                   |
| --------------------------- | ------------ | ----------------- |
| `ping`, `traceroute`        | 检查网络连通性、路径问题 |                   |
| `curl`, `telnet ip port`    | 检查端口是否通      |                   |
| `netstat -anp` / `ss -lntp` | 查看端口监听状态     |                   |
| `iftop`, `nethogs`          | 查看实时带宽占用     |                   |
| `tcpdump`                   | 抓包分析异常       |                   |
| `sar -n DEV 1`              | 查看网络设备流量     |                   |
| \`conntrack -L              | wc -l\`      | 查看连接数（适用于 NAT 场景） |

### 🚨 实战指标：

* `ping` 延迟高丢包多 → 网络链路问题
* `ss` 发现端口未监听 → 应用未启动或崩溃
* `established` 链接数过多 → 服务未释放连接或未加连接池

---

## ✅ 六、问题排查流程总结图

```
   系统性能异常
         │
  ┌──────┴──────┐
  ↓             ↓
CPU高       内存爆/GC频
  ↓             ↓
top/ps       free/vmstat
jstack       jmap/jstat
  ↓             ↓
磁盘满/慢    IO 卡顿？
  ↓             ↓
df/du      iostat/iotop
  ↓             ↓
网络问题？
  ↓
ping/tcpdump/ss/curl
```

---


> 遇到系统响应慢问题，我会先看 CPU/内存是否异常（用 `top` / `vmstat`），然后用 `iostat` 确认是否是磁盘瓶颈，如果都正常再排查网络（`ping`、`ss`、`tcpdump`），实际中配合 `dmesg`/`journalctl` 查异常日志也很重要。

---

排查 Linux 系统中的 **CPU、内存、磁盘、IO、网络性能问题** 通常遵循「定位瓶颈 → 查找进程 → 分析原因 → 优化方案」这条主线。以下是各个方向的排查思路和常用命令：

---

## 🧠 一、CPU 性能问题排查

### 1.1 初步排查

```bash
top
htop            # 更直观（需安装）
```

* 关注 `%CPU`，`load average`（是否超过核心数）
* 找出 CPU 占用高的进程（PID）

### 1.2 深入分析

```bash
ps -eo pid,ppid,cmd,%mem,%cpu --sort=-%cpu | head
```

```bash
pidstat -u -p <PID> 1       # 查看某进程 CPU 占用变化
```

### 1.3 Java 应用场景

```bash
jstack <PID>                # 查看线程栈，排查死循环
top -Hp <PID>               # 找出占用 CPU 高的线程 TID（十进制）
printf "%x\n" <TID>         # 转为十六进制匹配 jstack 中的 nid
```

---

## 🧠 二、内存问题排查

### 2.1 查看整体使用

```bash
free -h
top / htop
vmstat 1
```

* 重点关注 `free`, `available`, `swap` 是否频繁使用

### 2.2 查找占用高的进程

```bash
ps -eo pid,ppid,cmd,%mem,%cpu --sort=-%mem | head
```

```bash
smem -r | head              # 更准确统计（需安装）
```

### 2.3 检查 OOM 历史

```bash
dmesg | grep -i kill
```

---

## 💽 三、磁盘使用排查

### 3.1 空间使用

```bash
df -h                        # 查看挂载点使用率
du -sh /var/log/*            # 查看目录占用
```

### 3.2 清理建议

* 定期清理大日志文件
* 使用 logrotate 自动归档压缩日志

---

## 🖴 四、磁盘 IO 性能排查

### 4.1 实时 IO 状态

```bash
iostat -x 1                  # 观察 %util（高表示 IO 饱和）
```

### 4.2 观察读写情况

```bash
iotop                        # 查看读写最多的进程（需 root）
```

---

## 🌐 五、网络问题排查

### 5.1 基本命令

```bash
netstat -tnlp               # 查看端口监听情况
ss -s                       # TCP 状态统计
ss -ant | grep -i estab     # 当前活跃连接
```

### 5.2 查看流量和连接

```bash
iftop                       # 实时流量（需安装）
nethogs                     # 进程级别的网络流量（需安装）
```

### 5.3 ping & traceroute

```bash
ping <目标地址>             # 查看网络是否通畅、延迟
traceroute <目标地址>       # 路由跳数分析
```

---

## 📌 实战经验总结

| 问题现象   | 排查思路                  |
| ------ | --------------------- |
| CPU 飙高 | top → jstack → 定位死循环  |
| 内存不足   | free → ps → OOM 日志    |
| 磁盘满了   | df/du 分析目录占用          |
| IO 慢卡顿 | iostat → iotop 分析进程   |
| 网络断连/慢 | ping/traceroute/iftop |

---










