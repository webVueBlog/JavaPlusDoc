---
title: SpringBoot启动脚本
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## SpringBoot启动脚本

启动脚本

```shell
#!/bin/bash

# 项目名称
APP_NAME="app"
# JAR 文件名
JAR_NAME="/data/www/${APP_NAME}/${APP_NAME}.jar"
# PID 文件
PID_FILE="/data/www/${APP_NAME}/${APP_NAME}.pid"
ENV=prod

JAVA_OPTS="-Xms512m -Xmx1g -XX:+UseConcMarkSweepGC"

# 启动应用
start() {
    if [ -f $PID_FILE ]; then
        echo "$APP_NAME is already running."
        exit 1
    fi
    echo "Starting $APP_NAME..."
#    nohup /usr/bin/java -jar $JAR_NAME --spring.profiles.active=$ENV  >>/dev/null 2>&1 &
     nohup /usr/bin/java $JAVA_OPTS -jar $JAR_NAME --spring.profiles.active=$ENV  > /dev/null  2>&1 &
    echo $! > $PID_FILE
    echo "$APP_NAME started with PID $(cat $PID_FILE)."
}

# 停止应用
# 超时时间（秒）
STOP_TIMEOUT=30
# 停止函数
stop() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat $PID_FILE)
        if ps -p $PID > /dev/null; then
            echo "Stopping $APP_NAME (PID: $PID)..."
            kill $PID

            # 等待进程终止
            SECONDS_WAITED=0
            while ps -p $PID > /dev/null; do
                if [ $SECONDS_WAITED -ge $STOP_TIMEOUT ]; then
                    echo "Process did not terminate within $STOP_TIMEOUT seconds, killing forcefully..."
                    kill -9 $PID
                    break
                fi
                sleep 1
                SECONDS_WAITED=$((SECONDS_WAITED + 1))
            done

            rm -f $PID_FILE
            echo "$APP_NAME stopped."
        else
            echo "No process found with PID: $PID. It may have already stopped."
            rm -f $PID_FILE
        fi
    else
        echo "PID file not found. Is $APP_NAME running?"
    fi
}


# 重启应用
restart() {
    stop
    start
}

# 应用信息
info() {
    if [ -f $PID_FILE ]; then
        echo "$APP_NAME is running with PID $(cat $PID_FILE)."
    else
        echo "$APP_NAME is not running."
    fi
}

# 检查输入的命令
case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    info)
        info
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|info}"
        exit 1
        ;;
esac

```





