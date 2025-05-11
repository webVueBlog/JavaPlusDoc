---
title: 常用linux命令备忘录
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## 常用linux命令备忘录

```
ls -l 查看当前目录下的文件
cd 进入目录
pwd 查看当前目录
mkdir 创建目录
rm -rf 删除目录
cp sourceFile targetFile 复制文件
mv sourceFile targetFile 移动文件
cat 查看文件内容
chomd 修改文件权限
zip 压缩文件
unzip 解压文件
ps -ef | grep java 查看java进程
kill -9 pid 杀死进程
top 查看系统资源使用情况
df -h 查看磁盘使用情况
nohup java -jar xxx.jar & 后台启动java程序
tail -f xxx.log 查看日志
nohup java -jar xxx.jar > xxx.log 2>&1 & 后台启动java程序并输出日志
ping ip 检查网络连通性
netstat -anp | grep 80 查看端口占用情况
```

ls 列出目录内容

```
ls -l 列出文件详细信息
ls -a 列出所有文件（包括隐藏文件）
ls -lh 以易读的方式列出文件大小
```

cd 

```
cd .. 返回上一级目录
cd ~ 返回用户主目录
```

mkdir

```
mkdir dir 创建目录
mkdir -p dir1/dir2 创建多级目录
```

rm

```
rm file 删除文件
rm -r dir 删除目录
rm -rf dir 强制删除目录
```

cp

```
cp sourceFile targetFile 复制文件
cp -r sourceDir targetDir 复制目录
```

mv

```
mv sourceFile targetFile 移动文件
```

cat

```
cat file 查看文件内容
cat file1 file2 合并文件
cat > file 创建文件并写入内容
cat >> file 追加内容到文件
```

head 和 tail

```
head -n file 查看文件前n行
tail -n file 查看文件后n行
tail -f file 实时查看文件内容
```

vim

```
vim file 打开文件
i 进入插入模式
Esc 退出插入模式
:w 保存文件
:q 退出vim
:q! 强制退出vim
:wq 保存并退出vim
```

chmod

```
chmod u+x file 给文件所有者添加执行权限
chmod 755 file 设置文件权限为755（rwxr-xr-x）
chmod 777 file 设置文件权限为777（rwxrwxrwx）

文件所有者 u
文件所属组 g
其他用户 o

读 r
写 w
执行 x
所有 a

chmod u+w file 给文件所有者添加写权限
chmod a+r file 给所有用户添加读权限
chmod o+x file 给其他用户添加执行权限
chmod g-w file 给文件所属组删除写权限
chmod u-x file 给文件所有者删除执行权限
chmod a-w file 给所有用户删除写权限

```

zip

```
zip -r archive.zip dir 将目录压缩为zip文件
zip -r archive.zip file1 file2 将文件压缩为zip文件

gzip -r archive.zip dir 将目录压缩为zip文件

gzip -d archive.zip 解压zip文件
```

tar 

```
tar -cvf archive.tar file 将文件压缩为tar文件
tar -xvf archive.tar 解压tar文件

打包并压缩：tar -czvf archive.tar.gz dir 将目录压缩为tar.gz文件
```

kill

```
kill -9 pid 杀死进程

```

系统服务命令

```
service 服务名 start 启动服务
service 服务名 stop 停止服务
service 服务名 restart 重启服务
service 服务名 status 查看服务状态

systemctl start 服务名 启动服务
systemctl stop 服务名 停止服务
systemctl restart 服务名 重启服务
systemctl status 服务名 查看服务状态
systemctl enable 服务名 设置服务开机自启动
systemctl disable 服务名 取消服务开机自启动

```

磁盘和分区管理

```
fdisk -l 查看磁盘和分区信息
fdisk /dev/sda 创建分区
mkfs.ext4 /dev/sda1 格式化分区
mount /dev/sda1 /mnt 挂载分区
umount /mnt 卸载分区


df -h 查看磁盘使用情况,gb,mb
du -sh dir 查看目录大小
du -sh file 查看文件大小

```

系统信息和性能查看

```
uname 查看系统信息
uptime 查看系统运行时间
top 查看系统资源使用情况
free -h 查看内存使用情况
vmstat 1 查看虚拟内存统计信息
iostat 1 查看磁盘IO统计信息
netstat -anp 查看网络连接信息

uname -a 查看系统版本, 内核，os，cpu信息
uname -r 查看系统内核版本
uname -m 查看系统架构
uname -n 查看系统主机名
uname -s 查看系统名称
uname -p 查看系统处理器架构
uname -i 查看系统硬件平台
uname -o 查看系统操作系统
uname -v 查看系统版本号

vmstat 查看系统性能
vmstat 1 5 每秒刷新一次，共刷新5次
vmstat 1 查看系统性能，每秒刷新一次

free 查看内存使用
free -h 查看内存使用，以易读的方式显示
free -m 查看内存使用，以MB为单位显示
free -g 查看内存使用，以GB为单位显示
free -t 查看内存使用，包括交换空间
free -s 1 每秒刷新一次内存使用
```

sar 查看系统负载

```
sar -u 1 5 查看CPU使用情况，每秒刷新一次，共刷新5次
sar -r 1 5 查看内存使用情况，每秒刷新一次，共刷新5次
sar -b 1 5 查看磁盘IO统计信息，每秒刷新一次，共刷新5次
sar -n DEV 1 5 查看网络连接信息，每秒刷新一次，共刷新5次
sar -q 1 5 查看系统负载，每秒刷新一次，共刷新5次
sar -f /var/log/sa/sa01 查看历史系统负载
sar -f /var/log/sa/sa01 -s 00:00 -e 23:59 查看历史系统负载，指定时间范围
sar -f /var/log/sa/sa01 -s 00:00 -e 23:59 -i 1 查看历史系统负载，指定时间范围，每秒刷新一次
sar -f /var/log/sa/sa01 -s 00:00 -e 23:59 -i 1 -n DEV 查看历史网络连接信息，指定时间范围，每秒刷新一次
sar -f /var/log/sa/sa01 -s 00:00 -e 23:59 -i 1 -n DEV -u 查看历史CPU使用情况，指定时间范围，每秒刷新一次

```

yum 包管理

```
yum install package 安装软件包
yum remove package 删除软件包
yum update package 更新软件包
yum list installed 查看已安装的软件包
yum search package 搜索软件包
yum info package 查看软件包信息
yum clean all 清除yum缓存
yum makecache 生成yum缓存
yum update 更新所有软件包
yum update package 更新指定软件包
yum update --skip-broken 跳过损坏的软件包
yum update --exclude=package 不更新指定软件包
yum update --security 更新安全相关的软件包
yum update --advisory=advisory 更新指定安全通告相关的软件包
yum update --advisory=advisory --exclude=package 更新指定安全通告相关的软件包，但不更新指定软件包
yum update --advisory=advisory --exclude=package --security 更新指定安全通告相关的软件包，但不更新指定软件包，且只更新安全相关的软件包
yum update --advisory=advisory --exclude=package --security --skip-broken 更新指定安全通告相关的软件包，但不更新指定软件包，且只更新安全相关的软件包，且跳过损坏的软件包
yum update --advisory=advisory --exclude=package --security --skip-broken --downgrade 更新指定安全通告相关的软件包，但不更新指定软件包，且只更新安全相关的软件包，且跳过损坏的软件包，且降级软件包
yum update --advisory=advisory --exclude=package --security --skip-broken --downgrade --disablerepo=repo 更新指定安全通告相关的软件包，但不更新指定软件包，且只更新安全相关的软件包，且跳过损坏的软件包，且降级软件包，且禁用指定仓库
yum update --advisory=advisory --exclude=package --security --skip-broken --downgrade --disablerepo=repo --enablerepo=repo 更新指定安全通告相关的软件包，但不更新指定软件包，且只更新安全相关的软件包，且跳过损坏的软件包，且降级软件包，且禁用指定仓库，且启用指定
```

apt 包管理

```
apt install package 安装软件包
apt remove package 删除软件包
apt update 更新软件包列表
apt upgrade 更新软件包
apt full-upgrade 更新软件包，包括依赖关系
apt dist-upgrade 更新软件包，包括依赖关系，且升级软件包版本
apt autoremove 删除不再需要的软件包
apt clean 清除apt缓存
apt autoclean 清除apt缓存，但保留必要的软件包
apt search package 搜索软件包
```



