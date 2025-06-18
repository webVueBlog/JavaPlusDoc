---
title: 服务器被挖矿后的应急处理与安全加固指南
author: 哪吒
date: '2023-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## 服务器被挖矿后的应急处理与安全加固指南

### 1. 挖矿病毒的特征识别

服务器被挖矿病毒感染通常会表现出以下特征：

- **异常的系统资源占用**：CPU使用率异常高（通常接近100%），即使在服务器空闲时也是如此
- **系统性能下降**：服务器响应缓慢，应用程序运行卡顿
- **硬件异常**：服务器发热严重，风扇持续高速运转
- **异常网络连接**：存在与未知IP地址（尤其是境外IP）的连接
- **隐藏进程**：使用常规工具（如top、htop）无法看到高CPU占用的进程
- **自动恢复机制**：即使杀死可疑进程，短时间内又会自动重启

### 2. 应急响应流程

#### 2.1 紧急隔离

一旦确认服务器被挖矿病毒感染，应立即采取以下措施：

```bash
# 1. 断开网络连接（物理断网或禁用网络接口）
ifconfig eth0 down  # 禁用网络接口（请根据实际情况替换接口名）

# 2. 修改所有用户密码，特别是root密码
passwd root
```

> **重要提示**：在处理过程中，建议使用Live CD启动系统进行操作，避免在已感染的系统中直接操作，因为：
> - 修改的密码可能被监听
> - 修复的文件可能被隐藏的病毒改回
> - 使用的工具可能已被篡改
> - 操作过程可能被全程监控

#### 2.2 确认感染情况

##### 2.2.1 检查高CPU占用进程

```bash
# 使用top命令查看高CPU占用进程
top
# 在top界面按下'c'键可按CPU使用率排序

# 使用ps命令查看高CPU占用进程
ps -eo cmd,pcpu,pid,user --sort -pcpu | head

# 对于隐藏进程，可使用专用工具
# 安装sysdig工具
apt install sysdig  # Debian/Ubuntu系统
yum install sysdig  # CentOS/RHEL系统

# 使用sysdig查看CPU占用排行
sysdig -c topprocs_cpu

# 安装unhide工具
apt install unhide  # Debian/Ubuntu系统
yum install unhide  # CentOS/RHEL系统

# 使用unhide查找隐藏进程
unhide proc
```

##### 2.2.2 检查异常网络连接

```bash
# 查看所有TCP连接
ss -anpt
# 或使用netstat（如果可用）
netstat -antp

# 查看所有UDP连接
ss -anpu

# 使用lsof查看网络连接
lsof -i

# 使用tcpdump抓包分析
tcpdump -i <网卡名> host <本地IP> and port <可疑端口>
```

##### 2.2.3 检查定时任务

```bash
# 查看当前用户的定时任务
crontab -l

# 查看所有用户的定时任务
ls -l /var/spool/cron/*

# 查看系统定时任务
cat /etc/crontab
ls -l /etc/cron.d/
ls -l /etc/cron.hourly/
ls -l /etc/cron.daily/
ls -l /etc/cron.weekly/
ls -l /etc/cron.monthly/

# 查看定时任务日志
tail -f /var/log/cron
```

##### 2.2.4 检查启动项和服务

```bash
# 检查开机启动脚本
cat /etc/rc.d/rc.local

# 检查systemd服务
ls -l /etc/systemd/system/
ls -l /etc/systemd/system/multi-user.target.wants/

# 对于可疑进程，查看其关联的服务
systemctl status <PID>
```

##### 2.2.5 检查异常文件和动态链接库

```bash
# 检查/etc/ld.so.preload文件（该文件默认为空）
cat /etc/ld.so.preload

# 检查可疑的二进制文件（按修改时间排序）
ls -Athl /usr/bin
ls -Athl /usr/sbin

# 检查可疑的二进制文件（按文件大小排序）
ls -AShl /usr/bin
ls -AShl /usr/sbin
```

##### 2.2.6 检查SSH配置和异常公钥

```bash
# 检查SSH授权密钥
cat ~/.ssh/authorized_keys

# 检查SSH配置
grep AuthorizedKeysFile /etc/ssh/sshd_config
grep Root /etc/ssh/sshd_config
grep Password /etc/ssh/sshd_config
```

### 3. 清除挖矿病毒

> **警告**：在执行以下操作前，请确保已备份重要数据。对于严重感染的系统，建议在清理后重装系统。

#### 3.1 解锁系统文件

```bash
# 解除系统文件的隐藏属性
chattr -iRa /usr/ /etc/
```

#### 3.2 终止恶意进程

```bash
# 终止挖矿进程
kill -9 <PID>

# 如果进程由服务启动，先停止并禁用服务
systemctl stop <服务名>.service
systemctl disable <服务名>.service
```

#### 3.3 清除恶意文件

```bash
# 清空/etc/ld.so.preload文件
echo "" > /etc/ld.so.preload

# 删除恶意定时任务
rm -rf /var/spool/cron/*
chattr +i /var/spool/cron/  # 锁定目录防止再次写入

rm -rf /etc/cron.d/*
chattr +i /etc/cron.d/  # 锁定目录防止再次写入

# 删除常见挖矿病毒文件
rm -f /usr/local/lib/libs.so
chattr +i /usr/local/lib  # 锁定目录防止再次写入

rm -f /var/tmp/kworkerds*
rm -f /var/tmp/1.so
rm -f /tmp/kworkerds*
rm -f /tmp/1.so
rm -f /var/tmp/wc.conf
rm -f /tmp/wc.conf
```

#### 3.4 清除异常SSH公钥

```bash
# 检查并删除可疑的SSH公钥
cat ~/.ssh/authorized_keys
# 手动编辑文件删除可疑公钥
```

### 4. 系统安全加固

#### 4.1 更新系统和软件

```bash
# Debian/Ubuntu系统
apt update && apt upgrade -y

# CentOS/RHEL系统
yum update -y
```

#### 4.2 加固SSH服务

```bash
# 编辑SSH配置文件
vi /etc/ssh/sshd_config

# 推荐的安全配置
PermitRootLogin no           # 禁止root直接登录
PasswordAuthentication no    # 禁用密码认证，使用密钥认证
Port 22345                   # 修改默认SSH端口
AllowUsers user1 user2       # 限制允许登录的用户
MaxAuthTries 3               # 最大认证尝试次数
ClientAliveInterval 300      # 客户端活跃检测间隔
ClientAliveCountMax 0        # 客户端活跃检测计数

# 重启SSH服务
systemctl restart sshd
```

#### 4.3 配置防火墙

```bash
# 安装并启用防火墙
# Debian/Ubuntu系统
apt install ufw
ufw enable
ufw default deny incoming
ufw default allow outgoing
ufw allow 22345/tcp  # 允许SSH端口（使用修改后的端口）
ufw allow 80/tcp     # 允许HTTP端口（根据需要配置）
ufw allow 443/tcp    # 允许HTTPS端口（根据需要配置）

# CentOS/RHEL系统
yum install firewalld
systemctl enable firewalld
systemctl start firewalld
firewall-cmd --permanent --add-port=22345/tcp  # 允许SSH端口（使用修改后的端口）
firewall-cmd --permanent --add-port=80/tcp     # 允许HTTP端口（根据需要配置）
firewall-cmd --permanent --add-port=443/tcp    # 允许HTTPS端口（根据需要配置）
firewall-cmd --reload
```

#### 4.4 安装入侵检测和防御工具

```bash
# 安装Fail2Ban防止暴力破解
# Debian/Ubuntu系统
apt install fail2ban

# CentOS/RHEL系统
yum install epel-release
yum install fail2ban

# 配置Fail2Ban
cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
vi /etc/fail2ban/jail.local

# 启动Fail2Ban
systemctl enable fail2ban
systemctl start fail2ban

# 安装ClamAV防病毒软件
# Debian/Ubuntu系统
apt install clamav clamav-daemon

# CentOS/RHEL系统
yum install epel-release
yum install clamav clamav-update

# 更新病毒库
freshclam

# 扫描系统
clamscan -r --bell -i /
```

#### 4.5 锁定关键目录

```bash
# 使用chattr命令锁定关键目录和文件
chattr +i /etc/passwd
chattr +i /etc/shadow
chattr +i /etc/group
chattr +i /etc/gshadow
chattr +i /etc/ssh/sshd_config
```

### 5. 长期防护措施

#### 5.1 定期更新和补丁管理

- 建立定期更新系统和应用程序的计划
- 关注安全公告，及时应用安全补丁
- 对于关键系统，在应用补丁前进行测试

#### 5.2 定期备份

- 实施3-2-1备份策略：3份数据副本，2种不同的存储介质，1份异地备份
- 定期测试备份的可恢复性
- 确保备份数据的安全性（加密、访问控制）

#### 5.3 安全监控

- 部署集中式日志管理系统
- 配置关键事件的告警机制
- 定期审查系统日志和安全事件

```bash
# 安装auditd进行系统审计
# Debian/Ubuntu系统
apt install auditd

# CentOS/RHEL系统
yum install audit

# 启用auditd服务
systemctl enable auditd
systemctl start auditd
```

#### 5.4 最小权限原则

- 仅安装必要的软件包
- 关闭不需要的服务和端口
- 为用户分配最小必要的权限
- 使用非特权用户运行应用程序

#### 5.5 定期安全审计

- 定期进行漏洞扫描
- 执行安全基线检查
- 进行渗透测试评估系统安全性

```bash
# 使用Lynis进行安全审计
# Debian/Ubuntu系统
apt install lynis

# CentOS/RHEL系统
yum install lynis

# 运行Lynis审计
lynis audit system
```

### 6. 总结

服务器被挖矿病毒感染后的处理不仅仅是清除病毒，更重要的是找出入侵途径并加以修复，同时加强系统安全防护。对于严重感染的系统，建议在备份重要数据后重装系统，以确保彻底清除所有恶意代码。

安全是一个持续的过程，需要定期的维护、更新和审计。通过实施本文提供的安全加固措施，可以显著降低服务器被挖矿病毒感染的风险。

### 7. 参考资料

- [Linux应急响应：挖矿病毒处理](https://www.secpulse.com/archives/76825.html)
- [Linux服务器挖矿病毒清除全攻略](https://www.yunweipai.com/47241.html)
- [挖矿病毒处置（Linux篇)](https://wlaq.xjtu.edu.cn/info/1008/1945.htm)