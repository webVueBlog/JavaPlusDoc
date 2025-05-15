---
title: Nginx服务器SSL证书安装部署
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## Nginx服务器SSL证书安装部署


操作步骤

证书安装

请在 SSL 证书控制台 中选择您需要安装的证书并单击下载。

在弹出的 “证书下载” 窗口中，服务器类型选择 Nginx，单击下载并解压缩 cloud.tencent.com 证书文件包到本地目录。

解压缩后，可获得相关类型的证书文件。其中包含 cloud.tencent.com_nginx 文件夹：

文件夹名称：cloud.tencent.com_nginx

文件夹内容：

cloud.tencent.com_bundle.crt 证书文件

cloud.tencent.com_bundle.pem 证书文件

cloud.tencent.com.key 私钥文件

cloud.tencent.com.csr CSR 文件

CSR 文件是申请证书时由您上传或系统在线生成的，提供给 CA 机构。安装时可忽略该文件。

将已获取到的 cloud.tencent.com_bundle.crt 证书文件和 cloud.tencent.com.key 私钥文件从本地目录拷贝到 Nginx 服务器的  /etc/nginx 目录（此处为 Nginx 默认安装目录，请根据实际情况操作）下。

编辑 Nginx 根目录下的 nginx.conf 文件。修改内容如下：

由于版本问题，配置文件可能存在不同的写法。例如：Nginx 版本为 nginx/1.15.0 以上请使用 listen 443 ssl 代替 listen 443 和 ssl on。

	server {
		 #SSL 默认访问端口号为 443
		 listen 443 ssl; 
		 #请填写绑定证书的域名
		 server_name cloud.tencent.com; 
		 #请填写证书文件的相对路径或绝对路径
		 ssl_certificate cloud.tencent.com_bundle.crt; 
		 #请填写私钥文件的相对路径或绝对路径
		 ssl_certificate_key cloud.tencent.com.key; 
		 ssl_session_timeout 5m;
		 #请按照以下协议配置
		 ssl_protocols TLSv1.2 TLSv1.3; 
		 #请按照以下套件配置，配置加密套件，写法遵循 openssl 标准。
		 ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:HIGH:!aNULL:!MD5:!RC4:!DHE; 
		 ssl_prefer_server_ciphers on;
		 location / {
			 #网站主页路径。此路径仅供参考，具体请您按照实际目录操作。
			 #例如，您的网站主页在 Nginx 服务器的 /etc/www 目录下，则请修改 root 后面的 html 为 /etc/www。
			 root html; 
			 index  index.html index.htm;
		 }
	 }

通过执行以下命令验证配置文件问题。

nginx -t

若存在，请您重新配置或者根据提示修改存在问题。

若不存在，请执行 步骤8。

﻿通过执行以下命令重载 Nginx。

nginx -s reload

重载成功，即可使用 https://cloud.tencent.com 进行访问。

通过执行以下命令验证配置文件问题。

nginx -t

若存在，请您重新配置或者根据提示修改存在问题。

若不存在，请执行 步骤8。

﻿通过执行以下命令重载 Nginx。

nginx -s reload

重载成功，即可使用 https://cloud.tencent.com 进行访问。


	server {
	 #SSL 默认访问端口号为 443
	 listen 443 ssl;
	 #请填写绑定证书的域名
	 server_name cloud.tencent.com; 
	 #请填写证书文件的相对路径或绝对路径
	 ssl_certificate  cloud.tencent.com_bundle.crt; 
	 #请填写私钥文件的相对路径或绝对路径
	 ssl_certificate_key cloud.tencent.com.key; 
	 ssl_session_timeout 5m;
	 #请按照以下套件配置，配置加密套件，写法遵循 openssl 标准。
	 ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE:ECDH:AES:HIGH:!NULL:!aNULL:!MD5:!ADH:!RC4;
	 #请按照以下协议配置
	 ssl_protocols TLSv1.2 TLSv1.3;
	 ssl_prefer_server_ciphers on;
	 location / {
	   #网站主页路径。此路径仅供参考，具体请您按照实际目录操作。 
	   #例如，您的网站主页在 Nginx 服务器的 /etc/www 目录下，则请修改 root 后面的 html 为 /etc/www。
	   root html;
	   index index.html index.htm;
	 }
	}
	server {
	 listen 80;
	 #请填写绑定证书的域名
	 server_name cloud.tencent.com; 
	 #把http的域名请求转成https
	 return 301 https://$host$request_uri; 
	}


