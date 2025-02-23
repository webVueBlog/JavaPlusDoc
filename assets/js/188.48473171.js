(window.webpackJsonp=window.webpackJsonp||[]).push([[188],{854:function(s,a,t){"use strict";t.r(a);var e=t(2),n=Object(e.a)({},(function(){var s=this,a=s._self._c;return a("ContentSlotsDistributor",{attrs:{"slot-key":s.$parent.slotKey}},[a("blockquote",[a("p",[s._v("点击勘误"),a("a",{attrs:{href:"https://github.com/webVueBlog/JavaPlusDoc/issues",target:"_blank",rel:"noopener noreferrer"}},[s._v("issues"),a("OutboundLink")],1),s._v("，哪吒感谢大家的阅读")])]),s._v(" "),a("img",{attrs:{align:"right",width:"100",src:"https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png"}}),s._v(" "),a("h2",{attrs:{id:"elk日志系统安装"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#elk日志系统安装"}},[s._v("#")]),s._v(" ELK日志系统安装")]),s._v(" "),a("p",[s._v("安装")]),s._v(" "),a("h3",{attrs:{id:"安装elasticsearch"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#安装elasticsearch"}},[s._v("#")]),s._v(" 安装elasticsearch")]),s._v(" "),a("p",[s._v("创建用户，创建目录并授权")]),s._v(" "),a("div",{staticClass:"language-shell extra-class"},[a("pre",{pre:!0,attrs:{class:"language-shell"}},[a("code",[a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# 用户")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("sudo")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("useradd")]),s._v(" elasticsearch\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("sudo")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("groupadd")]),s._v(" elasticsearch \n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("sudo")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("usermod")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-a")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-G")]),s._v(" elasticsearch elasticsearch\n\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# 创建目录")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("mkdir")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-p")]),s._v(" /data/elk/es/"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("data,logs"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# 目录修改所有者为 elasticsearch")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("chown")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-R")]),s._v(" elasticsearch:elasticsearch es\n\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# 临时启动一个容器获取配置文件拷贝出来，修改配置挂载")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("docker")]),s._v(" run "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("--name")]),s._v(" elasticsearch "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-d")]),s._v(" elasticsearch:7.17.15\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("docker")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("cp")]),s._v(" elasticsearch:/usr/share/elasticsearch/config /data/elk/es/\n\n")])])]),a("div",{staticClass:"language-shell extra-class"},[a("pre",{pre:!0,attrs:{class:"language-shell"}},[a("code",[s._v("version: "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v("'3.1'")]),s._v("\nservices:\n  elasticsearch:\n    image: elasticsearch:7.17.15\n    container_name: elasticsearch\n    privileged: "),a("span",{pre:!0,attrs:{class:"token boolean"}},[s._v("true")]),s._v("\n    environment:\n      - "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"cluster.name=elasticsearch"')]),s._v(" "),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#设置集群名称为elasticsearch")]),s._v("\n      - "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"discovery.type=single-node"')]),s._v(" "),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#以单一节点模式启动")]),s._v("\n      - "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"ES_JAVA_OPTS=-Xms512m -Xmx2048m"')]),s._v(" "),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#设置使用jvm内存大小")]),s._v("\n      - "),a("span",{pre:!0,attrs:{class:"token assign-left variable"}},[s._v("bootstrap.memory_lock")]),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v("true\n    volumes:\n      - /etc/localtime:/etc/localtime\n      - ./es/plugins:/usr/share/elasticsearch/plugins:rw "),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#插件文件挂载")]),s._v("\n      - ./es/data:/usr/share/elasticsearch/data:rw "),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#数据文件挂载")]),s._v("\n      - ./es/logs:/usr/share/elasticsearch/logs:rw\n    ports:\n      - "),a("span",{pre:!0,attrs:{class:"token number"}},[s._v("9200")]),s._v(":9200\n      - "),a("span",{pre:!0,attrs:{class:"token number"}},[s._v("9300")]),s._v(":9300\n    deploy:\n     resources:\n        limits:\n           cpus: "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"2"')]),s._v("\n           memory: 2048M\n        reservations:\n           memory: 512M\n\n")])])]),a("h3",{attrs:{id:"设置es密码"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#设置es密码"}},[s._v("#")]),s._v(" 设置ES密码")]),s._v(" "),a("p",[s._v("修改配置 vim elasticsearch.yml")]),s._v(" "),a("div",{staticClass:"language-shell extra-class"},[a("pre",{pre:!0,attrs:{class:"language-shell"}},[a("code",[s._v("xpack.security.enabled: "),a("span",{pre:!0,attrs:{class:"token boolean"}},[s._v("true")]),s._v("\nxpack.license.self_generated.type: basic\nxpack.security.transport.ssl.enabled: "),a("span",{pre:!0,attrs:{class:"token boolean"}},[s._v("true")]),s._v("\n\n\n")])])]),a("p",[s._v("重启服务")]),s._v(" "),a("p",[s._v("docker restart elasticsearch")]),s._v(" "),a("p",[s._v("初始化密码")]),s._v(" "),a("div",{staticClass:"language-shell extra-class"},[a("pre",{pre:!0,attrs:{class:"language-shell"}},[a("code",[s._v("\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#进入容器")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("docker")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token builtin class-name"}},[s._v("exec")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-it")]),s._v(" elasticsearch "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("bash")]),s._v("\n\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# 初始化命令, 会同时初始化多个账号的密码，按提示操作即可")]),s._v("\n/usr/share/elasticsearch/bin/elasticsearch-setup-passwords interactive\n\n\n")])])]),a("p",[s._v("安装kibana")]),s._v(" "),a("p",[s._v("创建用户，目录，授权")]),s._v(" "),a("div",{staticClass:"language-shell extra-class"},[a("pre",{pre:!0,attrs:{class:"language-shell"}},[a("code",[a("span",{pre:!0,attrs:{class:"token function"}},[s._v("sudo")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("useradd")]),s._v(" kibana\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("sudo")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("groupadd")]),s._v(" kibana \n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("sudo")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("usermod")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-a")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-G")]),s._v(" kibana kibana\n\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("mkdir")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-p")]),s._v(" /data/elk/kibana/config\n\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# 授权 ")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("chown")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-R")]),s._v(" kibana:kibana kibana \n\n")])])]),a("p",[s._v("配置文件处理")]),s._v(" "),a("div",{staticClass:"language-shell extra-class"},[a("pre",{pre:!0,attrs:{class:"language-shell"}},[a("code",[s._v("\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# 先随便运行一个节点，获取配置文件，从容器中拷贝出来")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("docker")]),s._v(" run "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("--name")]),s._v(" kibana "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-d")]),s._v(" kibana:7.17.15\n\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# 查询看运行是否正常 ")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("docker")]),s._v(" logs "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-f")]),s._v(" kibana  \n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("docker")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("cp")]),s._v(" kibana:/usr/share/kibana/confg/kibana.yml /data/elk/kibana/config\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("docker")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("rm")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-f")]),s._v(" kibana\n\n\n")])])]),a("p",[s._v("启动容器")]),s._v(" "),a("p",[s._v("创建配置文件 vim docker-kibana.yaml")]),s._v(" "),a("div",{staticClass:"language-shell extra-class"},[a("pre",{pre:!0,attrs:{class:"language-shell"}},[a("code",[s._v("version: "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v("'3.1'")]),s._v("\nservices:\n  kibana:\n    image: kibana:7.17.15\n    container_name: kibana\n    volumes:\n      - /etc/localtime:/etc/localtime\n    "),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#  - /data/elk/kibana/config:/usr/share/kibana/config:rw")]),s._v("\n    "),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#depends_on: ")]),s._v("\n     "),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# - elasticsearch #kibana在elasticsearch启动之后再启动")]),s._v("\n    environment:\n      ELASTICSEARCH_HOSTS: http://localhost:9200 "),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#设置访问elasticsearch的地址")]),s._v("\n      I18N_LOCALE: zh-CN\n    ports:\n      - "),a("span",{pre:!0,attrs:{class:"token number"}},[s._v("5601")]),s._v(":5601\n\n")])])]),a("p",[s._v("logstash 日志格式化")]),s._v(" "),a("h3",{attrs:{id:"用户关联"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#用户关联"}},[s._v("#")]),s._v(" 用户关联")]),s._v(" "),a("div",{staticClass:"language-shell extra-class"},[a("pre",{pre:!0,attrs:{class:"language-shell"}},[a("code",[a("span",{pre:!0,attrs:{class:"token function"}},[s._v("sudo")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("useradd")]),s._v(" logstash\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("sudo")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("groupadd")]),s._v(" logstash \n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("sudo")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("usermod")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-a")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-G")]),s._v(" logstash logstash\n\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("mkdir")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-p")]),s._v(" /data/elk/logstash/config\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("mkdir")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-p")]),s._v(" /data/elk/logstash/data\n\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# 授权 ")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("chown")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-R")]),s._v(" logstash:logstash /data/elk/logstash \n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("chmod")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[s._v("777")]),s._v(" /data/elk/logstash/data\n\n")])])]),a("h2",{attrs:{id:"启动临时容器获取配置"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#启动临时容器获取配置"}},[s._v("#")]),s._v(" 启动临时容器获取配置")]),s._v(" "),a("div",{staticClass:"language-shell extra-class"},[a("pre",{pre:!0,attrs:{class:"language-shell"}},[a("code",[a("span",{pre:!0,attrs:{class:"token function"}},[s._v("docker")]),s._v(" run "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("--name")]),s._v(" logstash "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-d")]),s._v(" logstash:7.17.15\n\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# 进入容器看需求哪些配置")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("docker")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token builtin class-name"}},[s._v("exec")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-it")]),s._v(" logstash "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("bash")]),s._v("\n\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# 我拷贝 config和data")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("docker")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("cp")]),s._v(" logstash:/usr/share/logstash/data  /data/elk/logstash\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("docker")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("cp")]),s._v(" logstash:/usr/share/logstash/config  /data/elk/logstash\n\n\n")])])]),a("p",[s._v("配置 /data/elk/logstash/config/logstash.yml")]),s._v(" "),a("div",{staticClass:"language-shell extra-class"},[a("pre",{pre:!0,attrs:{class:"language-shell"}},[a("code",[s._v("http.host: "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"0.0.0.0"')]),s._v("\nxpack.monitoring.enabled: "),a("span",{pre:!0,attrs:{class:"token boolean"}},[s._v("true")]),s._v("\nxpack.monitoring.elasticsearch.username: logstash_system    "),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#访问es的用户名")]),s._v("\nxpack.monitoring.elasticsearch.password: "),a("span",{pre:!0,attrs:{class:"token number"}},[s._v("123456")]),s._v("           "),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#访问es的密码 xxx")]),s._v("\nxpack.monitoring.elasticsearch.hosts: "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"127.0.0.1:9200"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("    "),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#es的访问地址:端口")]),s._v("\n\n")])])]),a("p",[s._v("配置 /data/elk/logstash/pipeline/logstash.conf")]),s._v(" "),a("div",{staticClass:"language-shell extra-class"},[a("pre",{pre:!0,attrs:{class:"language-shell"}},[a("code",[a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# Beats -> Logstash -> Elasticsearch pipeline.")]),s._v("\n\ninput "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n  beats "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n    port "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[s._v("5044")]),s._v("\n  "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n\nfilter "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n    grok "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n        match "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n            "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"message"')]),s._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"%{DATA:logtime}\\|\\|%{DATA:thread}\\|\\|%{DATA:level}\\|\\|%{DATA:traceId}\\|\\|%{DATA:uid}\\|\\|%{DATA:class}\\|\\|%{GREEDYDATA:msg}"')]),s._v("\n        "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n    "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n\n\n   "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("date")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n     match        "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"logtime"')]),s._v(" , "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"dd/MMM/YYYY:HH:mm:ss Z"')]),s._v(", "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"UNIX"')]),s._v(", "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"yyyy-MM-dd HH:mm:ss"')]),s._v(", "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"dd-MMM-yyyy HH:mm:ss"')]),s._v(","),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"yyyy-MM-dd HH:mm:ss.SSS"')]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("\n     target       "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"@timestamp"')]),s._v("\n   "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n\n   mutate"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n        remove_field "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"host"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("\n        remove_field "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"agent"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("\n        remove_field "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"ecs"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("\n        remove_field "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"tags"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("\n        remove_field "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"fields"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("\n        remove_field "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"@version"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("\n        remove_field "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"input"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("\n        remove_field "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"log"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("\n    "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n\noutput "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n\n  elasticsearch "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n        hosts "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"http://localhost:9200"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("\n        user "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"elastic"')]),s._v("\n        password "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"123456"')]),s._v("  "),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# 密钥 ")]),s._v("\n        index "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"bbw-%{+YYYY.MM.dd}"')]),s._v("\n  "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n\n "),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# stdout {")]),s._v("\n "),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#   codec => rubydebug")]),s._v("\n "),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# }")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n\n\n")])])]),a("h3",{attrs:{id:"docker容器配置并启动"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#docker容器配置并启动"}},[s._v("#")]),s._v(" docker容器配置并启动")]),s._v(" "),a("div",{staticClass:"language-shell extra-class"},[a("pre",{pre:!0,attrs:{class:"language-shell"}},[a("code",[s._v("\nversion: "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v("'3.1'")]),s._v("\nservices:\n  logstash:\n    image: logstash:7.17.15\n    container_name: logstash\n    volumes:\n      - /etc/localtime:/etc/localtime\n      - /data/elk/logstash/config:/usr/share/logstash/config:rw\n      - /data/elk/logstash/data:/usr/share/logstash/data:rw\n      - /data/elk/logstash/pipeline:/usr/share/logstash/pipeline:rw\n    ports:\n      - "),a("span",{pre:!0,attrs:{class:"token number"}},[s._v("5044")]),s._v(":5044\n\n")])])]),a("p",[s._v("启动容器 docker-compose up")]),s._v(" "),a("h3",{attrs:{id:"filebeat配置"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#filebeat配置"}},[s._v("#")]),s._v(" filebeat配置")]),s._v(" "),a("div",{staticClass:"language-shell extra-class"},[a("pre",{pre:!0,attrs:{class:"language-shell"}},[a("code",[a("span",{pre:!0,attrs:{class:"token function"}},[s._v("docker")]),s._v(" run "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("--name")]),s._v(" filebeat "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-d")]),s._v(" filebeat:7.17.15\n\n\n")])])])])}),[],!1,null,null,null);a.default=n.exports}}]);