---
title: 搭建jenkins部署spring-boot项目
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## 搭建jenkins部署spring-boot项目

### docker配置

```shell
version: '3'
services:
  jenkins:
    privileged: true
    container_name: myjenkins
    image: "jenkins/jenkins:lts-jdk17"
    restart: always
    user: root
    volumes:
      - "/etc/localtime:/etc/localtime:ro"
      - "/home/docker/jenkins/data:/var/jenkins_home"
      - "/var/run/docker.sock:/var/run/docker.sock"
      - "/usr/bin/docker:/usr/bin/docker"
      - "/var/lib/docker:/var/lib/docker"
      - "/root:/home"
    ports:
      - "10002:8080"


```

### 命令行脚本配置时区

### 临时修改系统时区

根据Manage Jenkins -> Script Console找到指令框，在指令框中投入下面的指令，可以将时区变为北京时间： `System.setProperty(‘org.apache.commons.jelly.tags.fmt.timeZone’, ‘Asia/Shanghai’)`

### 永久修改时区

```shell
1. 进入daocker容器里面 ： docker exec -it myjenkins bash 
2. echo "Asia/Shanghai" > /etc/timezone

```

## pipeline脚本文件

```shell
pipeline {

   agent any

   // 环境变量
    environment {
        JAR_FILE_NAME = "项目部署文件名 ,例如：app.jar"
        work_dir = "/var/jenkins_home/workspace/${env.JAR_FILE_NAME}-prod"
        REMOTE_HOST = '127.0.0.1'
        REMOTE_USER = 'root'
        REMOTE_DIR = "/data/www/${env.JAR_FILE_NAME}"
    }

    // 入参定义
    parameters {
        string(name: 'branch_name', defaultValue: 'master', description: 'git分支')
    }

   stages {
      stage('检出代码'){
          steps {
               // 检出代码
            	checkout([$class: 'GitSCM', branches: [[name: "*/${params.branch_name}"]],
            	doGenerateSubmoduleConfigurations: false,
            	extensions: [],
            	submoduleCfg: [],
                userRemoteConfigs: [[
                    credentialsId: 'git',
                	url: "http://127.0.0.1:443/xxx.git"]]])
            }
        }

        stage("编译打包"){
        	agent {
                docker {
                	image 'maven:3-alpine'
                    args "-v /root/.m2:/root/.m2"
                }

            }

            steps{
                dir("${env.work_dir}"){
                    // 编译打包
                   	sh "mvn -B -DskipTests clean package"
                   	sh "pwd"
                }
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    def remote = [:]
                    remote.name = '名字随便起，方便记就行 你看到知道是哪台机器'
                    remote.host = "${env.REMOTE_HOST}"
                    remote.user = "${env.REMOTE_USER}"
                    remote.allowAnyHosts = true
                   
                    withCredentials([usernamePassword(credentialsId: 'jenkins上配置的用户名密码凭证ID', passwordVariable: 'password', usernameVariable: 'userName')]) {
                        remote.user = "${userName}"
                        remote.password = "${password}"
                    }

                    // 将jar拷贝到远程机器 
                    sshPut remote: remote, from: "${env.work_dir}/target/${env.JAR_FILE_NAME}.jar", into: "${env.REMOTE_DIR}"

                    //在远程机器执行启动命令
                    sshCommand remote: remote, command: """
                        source /etc/profile 
                        ${env.REMOTE_DIR}/startup.sh restart
                    """
                }
            }
        }
        

   }

}

```







