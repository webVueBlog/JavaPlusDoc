module.exports = {
    title: 'Jeskson文档-微服务分布式系统架构',
    description: 'Jeskson文档-架构师',
    base: '/JavaPlusDoc/',
    theme: 'reco',
    head: [
        ['meta', {
            name: 'viewport',
            content: 'width=device-width,initial-scale=1,user-scalable=no'
        }],
        ['script', { src: '/JavaPlusDoc/js/sidebar-scroll.js' }],
        ['script', { src: '/JavaPlusDoc/js/sidebar-enhance.js' }],
        ['script', { src: '/JavaPlusDoc/js/report-site-enhance.js' }]
    ],
    plugins: [
        ['"@vuepress/plugin-medium-zoom"'], // 图片放大
        ['vuepress-plugin-smooth-scroll'], // 平滑滚动
        ['vuepress-plugin-nprogress'], // 加载进度条
        ['vuepress-plugin-mermaidjs'], // Mermaid 图表
        ['@vuepress-reco/vuepress-plugin-loading-page'], // 页面加载动画
        [
            'dynamic-title',
            {
                showIcon: '/favicon.ico',
                showText: '(/≧▽≦/)咦！又好了！',
                hideIcon: '/failure.ico',
                hideText: '(●—●)喔哟，崩溃啦！',
                recoverTime: 2000,
            },
        ],
        [
            "@vuepress-reco/vuepress-plugin-kan-ban-niang",
            {
                theme: ["blackCat"],
                clean: true,
                height: 260,
                modelStyle: {
                    width: '100px',
                    position: "fixed",
                    right: "0px",
                    bottom: "0px",
                    opacity: "0.9",
                    zIndex: 99999,
                    objectFit: 'cover',
                }
            }
        ],
        ["vuepress-plugin-back-to-top"],
        ['vuepress-plugin-code-copy', true]
    ],
    locales: {
        '/': {
            lang: 'zh-CN'
        }
    },
    themeConfig: {
        lastUpdated: '上次更新',
        subSidebar: 'auto',
        nav: [{
            text: '首页',
            link: '/'
        },
            {
                text: '学习路线',
                items: [
                    { text: '入门指南', link: '/' },
                    { text: '基础到进阶', link: '/basic-grammar/basic-data-type' },
                    { text: '架构师成长', link: '/high-concurrency/why-cache' }
                ]
            },
            {
                text: '技术分类',
                items: [
                    { text: 'Java基础', link: '/basic-grammar/basic-data-type' },
                    { text: 'Java进阶', link: '/java-up/nginx' },
                    { text: '分布式架构', link: '/high-concurrency/why-cache' },
                    { text: '微服务', link: '/worker/1' },
                    { text: '数据库', link: '/mysql/mysql' },
                    { text: '运维与部署', link: '/linux/linux' },
                    { text: 'Docker', link: '/docker/docker-tutorial' },
                    { text: '产品系列', link: '/products/' }
                ]
            },
            {
                text: '实战案例',
                items: [
                    { text: '系统设计', link: '/worker/1' },
                    { text: '性能优化', link: '/high-concurrency/why-cache' },
                    { text: '项目实践', link: '/java-up/nginx' }
                ]
            },
            {
                text: '资源',
                items: [
                    { text: '官方文档', link: 'https://webvueblog.github.io/JavaPlusDoc/' },
                    { text: 'GitHub仓库', link: 'https://github.com/webVueBlog/JavaPlusDoc' },
                    { text: '作者主页', link: 'https://github.com/webVueBlog' }
                ]
            }
        ],
        sidebar: [
            {
                title: '文档指南',
                path: '/',
                collapsable: false, // 不折叠
                children: [{
                    title: "学前必读",
                    path: "/"
                }]
            },
            {
                title: 'Java核心技术',
                collapsable: false, // 不折叠
                children: [
                    {
                        title: "基础篇",
                        collapsable: true,
                        children: [
                            {
                                title: "Java基本数据类型",
                                path: "/basic-grammar/basic-data-type"
                            },
                            {
                                title: "数据类型转换",
                                path: "/basic-grammar/type-cast"
                            },
                            {
                                title: "数据类型缓存池",
                                path: "/basic-grammar/int-cache"
                            },
                            {
                                title: "运算符",
                                path: "/basic-grammar/operator"
                            },
                            {
                                title: "流程控制",
                                path: "/basic-grammar/flow-control"
                            },
                            {
                                title: "String类详解",
                                path: "/basic-grammar/string-source"
                            },
                            {
                                title: "字符串常量池",
                                path: "/basic-grammar/constant-pool"
                            },
                            {
                                title: "StringBuilder和Buffer",
                                path: "/basic-grammar/builder-buffer"
                            },
                            {
                                title: "字符串比较",
                                path: "/basic-grammar/equals"
                            },
                            {
                                title: "面向对象基础",
                                path: "/basic-grammar/object-class"
                            },
                            {
                                title: "Java包机制",
                                path: "/basic-grammar/package"
                            },
                            {
                                title: "变量与方法",
                                path: "/basic-grammar/var"
                            },
                            {
                                title: "构造方法",
                                path: "/basic-grammar/construct"
                            },
                            {
                                title: "抽象类",
                                path: "/basic-grammar/abstract"
                            },
                            {
                                title: "接口和内部类",
                                path: "/basic-grammar/interface"
                            },
                            {
                                title: "封装继承多态",
                                path: "/basic-grammar/encapsulation-inheritance-polymorphism"
                            },
                            {
                                title: "this与super关键字",
                                path: "/basic-grammar/this-super"
                            },
                            {
                                title: "不可变对象",
                                path: "/basic-grammar/immutable"
                            }
                        ]
                    },
                    {
                        title: "集合框架",
                        collapsable: true,
                        children: [
                            {
                                title: "集合框架概览",
                                path: "/basic-grammar/gailan"
                            },
                            {
                                title: "ArrayList详解",
                                path: "/basic-grammar/arraylist"
                            },
                            {
                                title: "LinkedList详解",
                                path: "/basic-grammar/linkedlist"
                            },
                            {
                                title: "栈Stack详解",
                                path: "/basic-grammar/stack"
                            },
                            {
                                title: "HashMap详解",
                                path: "/basic-grammar/hashmap"
                            },
                            {
                                title: "LinkedHashMap详解",
                                path: "/basic-grammar/linkedhashmap"
                            },
                            {
                                title: "TreeMap详解",
                                path: "/basic-grammar/treemap"
                            },
                            {
                                title: "ArrayDeque详解",
                                path: "/basic-grammar/ArrayDeque"
                            },
                            {
                                title: "PriorityQueue详解",
                                path: "/basic-grammar/PriorityQueue"
                            },
                            {
                                title: "ArrayList vs LinkedList",
                                path: "/basic-grammar/array-linked-list"
                            },
                            {
                                title: "Java泛型",
                                path: "/basic-grammar/generic"
                            },
                            {
                                title: "Iterator和Iterable",
                                path: "/basic-grammar/iterator-iterable"
                            },
                            {
                                title: "foreach循环陷阱",
                                path: "/basic-grammar/fail-fast"
                            },
                            {
                                title: "Comparable和Comparator",
                                path: "/basic-grammar/comparable-omparator"
                            },
                            {
                                title: "WeakHashMap详解",
                                path: "/basic-grammar/WeakHashMap"
                            }
                        ]
                    },
                    {
                        title: "JVM与性能",
                        collapsable: true,
                        children: [
                            {
                                title: "JVM基础",
                                path: "/aJava/jvm"
                            },
                            {
                                title: "JVM内存区域",
                                path: "/aJava/JVM内存区域"
                            },
                            {
                                title: "程序计数器",
                                path: "/aJava/程序计数器"
                            },
                            {
                                title: "线程",
                                path: "/aJava/线程"
                            }
                        ]
                    },
                    {
                        title: "并发编程",
                        collapsable: true,
                        children: [
                            {
                                title: "多线程入门",
                                path: "/thread/thread"
                            },
                            {
                                title: "线程执行结果获取",
                                path: "/thread/callable-future-futuretask"
                            },
                            {
                                title: "线程的6种状态",
                                path: "/thread/thread-state-and-method"
                            },
                            {
                                title: "深入浅出Java线程池ThreadPoolExecutor",
                                path: "/thread/threadpool-executor"
                            },
                            {
                                title: "synchronized和lock",
                                path: "/jobPro/synchronized"
                            }
                        ]
                    },
                    {
                        title: "IO与网络",
                        collapsable: true,
                        children: [
                            {
                                title: "JavaIO知识体系",
                                path: "/java-up/shangtou"
                            },
                            {
                                title: "文件流",
                                path: "/java-up/file-path"
                            },
                            {
                                title: "字节流与字符流",
                                path: "/java-up/reader-writer"
                            },
                            {
                                title: "转换流",
                                path: "/java-up/char-byte"
                            },
                            {
                                title: "序列化和反序列化",
                                path: "/java-up/serialize"
                            },
                            {
                                title: "NIO基础",
                                path: "/nio/nio"
                            },
                            {
                                title: "NIO vs BIO vs AIO",
                                path: "/nio/BIONIOAIO"
                            },
                            {
                                title: "Buffer和Channel",
                                path: "/nio/buffer-channel"
                            },
                            {
                                title: "网络编程实践",
                                path: "/nio/network-connect"
                            },
                            {
                                title: "IO模型",
                                path: "/nio/moxing"
                            },
                            {
                                title: "IO多路复用",
                                path: "/jobPro/IO"
                            },
                            {
                                title: "Netty入门",
                                path: "/java-up/netty"
                            }
                        ]
                    }
                ]
            },
            {
                title: '分布式架构',
                collapsable: false,
                children: [
                    {
                        title: "缓存系统",
                        collapsable: true,
                        children: [
                            {
                                title: "缓存使用场景",
                                path: "/high-concurrency/why-cache"
                            },
                            {
                                title: "Redis vs Memcached",
                                path: "/high-concurrency/redis-single-thread-model"
                            },
                            {
                                title: "Redis数据类型",
                                path: "/high-concurrency/redis-data-types"
                            },
                            {
                                title: "Redis过期策略",
                                path: "/high-concurrency/redis-expiration-policies-and-lru"
                            },
                            {
                                title: "Redis高并发与高可用",
                                path: "/high-concurrency/how-to-ensure-high-concurrency-and-high-availability-of-redis"
                            },
                            {
                                title: "Redis主从架构",
                                path: "/high-concurrency/redis-master-slave"
                            },
                            {
                                title: "Redis持久化",
                                path: "/high-concurrency/redis-persistence"
                            },
                            {
                                title: "Redis哨兵集群",
                                path: "/high-concurrency/redis-sentinel"
                            },
                            {
                                title: "Redis应用场景",
                                path: "/jobPro/redis"
                            },
                            {
                                title: "Redis key过期问题解决方案",
                                path: "/redis/redis-key-expiration"
                            },
                            {
                                title: "SpringBoot整合Redis",
                                path: "/java-up/redis-springboot"
                            },
                            {
                                title: "缓存雪崩、穿透、击穿",
                                path: "/redis/xuebeng-chuantou-jichuan"
                            },
                            {
                                title: "深入分析Redis Lua脚本运行原理",
                                path: "/redis/redis-lua"
                            }
                        ]
                    },
                    {
                        title: "消息队列",
                        collapsable: true,
                        children: [
                            {
                                title: "为什么使用消息队列",
                                path: "/messagequeue/why-mq"
                            },
                            {
                                title: "消息队列高可用",
                                path: "/messagequeue/how-to-ensure-high-availability-of-message-queues"
                            },
                            {
                                title: "消息不重复消费",
                                path: "/messagequeue/how-to-ensure-that-messages-are-not-repeatedly-consumed"
                            },
                            {
                                title: "消息可靠传输",
                                path: "/messagequeue/how-to-ensure-the-reliable-transmission-of-messages"
                            },
                            {
                                title: "消息顺序性",
                                path: "/messagequeue/how-to-ensure-the-order-of-messages"
                            },
                            {
                                title: "消息队列延时问题",
                                path: "/messagequeue/mq-time-delay-and-expired-failure"
                            },
                            {
                                title: "消息队列设计",
                                path: "/messagequeue/mq-design"
                            },
                            {
                                title: "RabbitMQ入门",
                                path: "/java-up/rabbitmq"
                            },
                            {
                                title: "Kafka基础",
                                path: "/power/kafka"
                            },
                            {
                                title: "Kafka集群",
                                path: "/power/kafkas"
                            },
                            {
                                title: "Kafka消费者",
                                path: "/power/comsumer"
                            }
                        ]
                    },
                    {
                        title: "搜索引擎",
                        collapsable: true,
                        children: [
                            {
                                title: "ES分布式架构原理",
                                path: "/searchEngine/es-architecture"
                            },
                            {
                                title: "ES写入数据原理",
                                path: "/searchEngine/es-write-query-search"
                            },
                            {
                                title: "ES查询效率优化",
                                path: "/searchEngine/es-optimizing-query-performance"
                            },
                            {
                                title: "ES生产集群部署",
                                path: "/searchEngine/es-production-cluster"
                            }
                        ]
                    },
                    {
                        title: "微服务架构",
                        collapsable: true,
                        children: [
                            {
                                title: "微服务优雅上下线",
                                path: "/worker/3"
                            },
                            {
                                title: "滚动部署",
                                path: "/worker/1"
                            },
                            {
                                title: "Nacos优雅停机",
                                path: "/worker/2"
                            },
                            {
                                title: "Dubbo基础",
                                path: "/dubbo/dubbo"
                            }
                        ]
                    },
                    {
                        title: "数据库技术",
                        collapsable: true,
                        children: [
                            {
                                title: "SQL执行过程",
                                path: "/mysql/mysql"
                            },
                            {
                                title: "MySQL事务实现",
                                path: "/mysql/shiwu-shixia"
                            },
                            {
                                title: "深入理解MySQL事务",
                                path: "/mysql/lijie-shiwu"
                            },
                            {
                                title: "MySQL锁机制详解",
                                path: "/mysql/mysql-locks"
                            },
                            {
                                title: "MySQL和Redis数据一致性",
                                path: "/mysql/redis-shuju-yizhixing"
                            },
                            {
                                title: "MyISAM vs InnoDB",
                                path: "/jobPro/InnoDB"
                            },
                            {
                                title: "MongoDB基础",
                                path: "/java-up/mongodb"
                            },
                            {
                                title: "MongoDB备份与恢复",
                                path: "/java-up/mongodb-backup-restore"
                            },
                            {
                                title: "MyBatis-Plus入门",
                                path: "/MyBatis-Plus/getting-started"
                            },
                            {
                                title: "MyBatis-Plus接口",
                                path: "/MyBatis-Plus/service-interface"
                            }
                        ]
                    }
                ]
            },
            {
                title: '运维与部署',
                collapsable: false,
                children: [
                    {
                        title: "Docker容器技术",
                        collapsable: true,
                        children: [
                            {
                                title: "Docker教程",
                                path: "/docker/docker-tutorial"
                            },
                            {
                                title: "docker架构",
                                path: "/docker/docker架构"
                            },
                            {
                                title: "Docker安装指南",
                                path: "/docker/docker-install"
                            },
                            {
                                title: "Docker配置国内源",
                                path: "/docker/docker-mirror"
                            },
                            {
                                title: "Docker镜像管理",
                                path: "/docker/docker-images"
                            },
                            {
                                title: "Docker容器管理",
                                path: "/docker/docker-containers"
                            },
                            {
                                title: "Docker网络配置",
                                path: "/docker/docker-network"
                            },
                            {
                                title: "Docker数据卷管理",
                                path: "/docker/docker-volumes"
                            },
                            {
                                title: "Dockerfile最佳实践",
                                path: "/docker/docker-dockerfile"
                            },
                            {
                                title: "Docker Compose详解",
                                path: "/docker/docker-compose"
                            },
                            {
                                title: "Docker Swarm集群",
                                path: "/docker/docker-swarm"
                            },
                            {
                                title: "Docker安全最佳实践",
                                path: "/docker/docker-security"
                            },
                            {
                                title: "Docker生产环境部署",
                                path: "/docker/docker-production"
                            }
                        ]
                    },
                    {
                        title: "基础设施",
                        collapsable: true,
                        children: [
                            {
                                title: "云计算基础",
                                path: "/aJava/云计算是什么"
                            },
                            {
                                title: "mysql是什么",
                                path: "/aJava/mysql是什么"
                            },
                            {
                                title: "mogodb是什么",
                                path: "/aJava/mogodb是什么"
                            },
                            {
                                title: "安全组是什么",
                                path: "/aJava/安全组是什么"
                            },
                            {
                                title: "CDN是什么",
                                path: "/aJava/CDN是什么"
                            },
                            {
                                title: "nginx是什么",
                                path: "/aJava/nginx是什么"
                            },
                            {
                                title: "tomcat是什么",
                                path: "/aJava/tomcat是什么"
                            },
                            {
                                title: "Eureka是什么",
                                path: "/aJava/Eureka是什么"
                            },
                            {
                                title: "nacos是什么",
                                path: "/aJava/nacos是什么"
                            },
                            {
                                title: "Zookeeper是什么",
                                path: "/aJava/Zookeeper是什么"
                            },
                            {
                                title: "ElasticSearch是什么",
                                path: "/aJava/ElasticSearch是什么"
                            },
                            {
                                title: "微服务基础",
                                path: "/aJava/微服务是什么"
                            },
                            {
                                title: "HDFS基础",
                                path: "/aJava/HDFS是什么"
                            },
                            {
                                title: "块存储",
                                path: "/aJava/块存储是什么"
                            },
                            {
                                title: "对象存储",
                                path: "/aJava/对象存储是什么"
                            },
                            {
                                title: "存储快照",
                                path: "/aJava/存储快照是什么"
                            },
                            {
                                title: "负载均衡",
                                path: "/aJava/负载均衡是什么"
                            },
                            {
                                title: "灰度发布",
                                path: "/aJava/什么是灰度发布"
                            }
                        ]
                    },
                    {
                        title: "DevOps工具链",
                        collapsable: true,
                        children: [
                            {
                                title: "Jenkins基础",
                                path: "/aJava/Jenkins是什么"
                            },
                            {
                                title: "Ansible基础",
                                path: "/aJava/Ansible是什么"
                            },
                            {
                                title: "DevOps概念",
                                path: "/aJava/DevOps是什么"
                            },
                            {
                                title: "WAF和DDOS防护",
                                path: "/aJava/WAF和DDOS的区别是什么"
                            },
                            {
                                title: "Linux常用命令",
                                path: "/linux/linux"
                            },
                            {
                                title: "Nginx环境配置",
                                path: "/linux/nginx-env"
                            },
                            {
                                title: "Kibana安装与使用",
                                path: "/linux/kibana-install"
                            },
                            {
                                title: "Nginx入门",
                                path: "/java-up/nginx"
                            },
                            {
                                title: "Nginx SSL配置",
                                path: "/java-up/ssl"
                            },
                            {
                                title: "Nginx优化与防盗链",
                                path: "/worker/nginx-optimization"
                            }
                        ]
                    },
                    {
                        title: "部署与监控",
                        collapsable: true,
                        children: [
                            {
                                title: "ELK日志系统",
                                path: "/worker/elk"
                            },
                            {
                                title: "ELFK生产集群搭建",
                                path: "/worker/elfk-cluster"
                            },
                            {
                                title: "Jenkins部署SpringBoot",
                                path: "/worker/jenkins"
                            },
                            {
                                title: "RocketMQ安装",
                                path: "/worker/rocketmq"
                            },
                            {
                                title: "Grafana监控",
                                path: "/worker/grafana"
                            },
                            {
                                title: "Prometheus单机部署",
                                path: "/worker/prometheus"
                            },
                            {
                                title: "Grafana监控MySQL、Redis和MongoDB",
                                path: "/worker/grafana-database-monitoring"
                            },
                            {
                                title: "K8s监控",
                                path: "/worker/k8s-monitoring"
                            },
                            {
                                title: "CPU使用率100%异常排查",
                                path: "/worker/cpu-troubleshooting"
                            },
                            {
                                title: "SpringBoot启动脚本",
                                path: "/worker/springboot"
                            },
                            {
                                title: "SkyWalking监控",
                                path: "/worker/skywalking"
                            },
                            {
                                title: "前端自动化部署",
                                path: "/worker/7"
                            },
                            {
                                title: "SRE实践",
                                path: "/sre/sre"
                            },
                            {
                                title: "分布式监控",
                                path: "/sre/monitor"
                            },
                            {
                                title: "服务质量目标",
                                path: "/sre/serviceQuality"
                            },
                            {
                                title: "错误预算",
                                path: "/sre/errorBudget"
                            },
                            {
                                title: "系统性能指标",
                                path: "/sre/system"
                            },
                            {
                                title: "服务器挖矿病毒清除",
                                path: "/sre/server-mining-virus-removal"
                            }
                        ]
                    },
                    {
                        title: "ElasticSearch",
                        collapsable: true,
                        children: [
                            {
                                title: "ElasticSearch架构",
                                path: "/es/es-architecture"
                            },
                            {
                                title: "查询性能优化",
                                path: "/es/es-optimizing-query-performance"
                            },
                            {
                                title: "Linux搭建ES集群与Kibana",
                                path: "/es/es-cluster-setup"
                            }
                        ]
                    }
                ]
            },
            {
                title: '产品系列',
                collapsable: false,
                children: [
                    {
                        title: "产品概述",
                        path: "/products/"
                    },
                    {
                        title: "【溜溜梅】官方商城小程序",
                        path: "/products/product-gallery"
                    },
                    {
                        title: "无人岛商业计划书",
                        path: "/products/无人岛商业计划书"
                    },
                    {
                        title: "蜗牛睡眠高嵩",
                        path: "/products/蜗牛睡眠高嵩"
                    },
                    {
                        title: "优质行业报告网站",
                        path: "/products/优质行业报告网站"
                    },
                    {
                        title: "篮球场如何赚钱",
                        path: "/products/篮球场如何赚钱"
                    },
                    {
                        title: "企业级应用平台",
                        path: "/products/enterprise-platform"
                    },
                    {
                        title: "微服务框架",
                        path: "/products/microservice-framework"
                    },
                    {
                        title: "数据分析套件",
                        path: "/products/data-analytics-suite"
                    }
                ]
            },
            {
                title: '实战案例',
                collapsable: false,
                children: [
                    {
                        title: "Web应用开发",
                        collapsable: true,
                        children: [
                            {
                                title: "用户注册登录系统",
                                path: "/jobPro/login"
                            },
                            {
                                title: "多语言国际化",
                                path: "/jobPro/lan"
                            },
                            {
                                title: "PC网站微信扫码登录",
                                path: "/jobPro/jobPro"
                            },
                            {
                                title: "微信小程序开发完全指南",
                                path: "/jobPro/wechat-miniprogram-guide"
                            },
                            {
                                title: "微信小程序API客服消息",
                                path: "/jobPro/wechat-customer-service"
                            },
                            {
                                title: "微信小程序开放接口",
                                path: "/jobPro/wechat-open-api"
                            },
                            {
                                title: "微信小程序运维中心",
                                path: "/jobPro/wechat-operation-center"
                            },
                            {
                                title: "微信小程序消息推送",
                                path: "/jobPro/appMsg"
                            },
                            {
                                title: "微信小程序自动化部署",
                                path: "/jobPro/miniprogram"
                            },
                            {
                                title: "微信小程序支付功能",
                                path: "/jobPro/appPay"
                            },
                            {
                                title: "iOS/Android打包发布",
                                path: "/jobPro/uniapp"
                            }
                        ]
                    },
                    {
                        title: "技术架构",
                        collapsable: true,
                        children: [
                            {
                                title: "500万日订单下的高可用拼购系统",
                                path: "/tech/high-availability-group-buying"
                            },
                            {
                                title: "2000万日订单背后的技术架构",
                                path: "/tech/twenty-million-orders-architecture"
                            }
                        ]
                    },
                    {
                        title: "企业级应用",
                        collapsable: true,
                        children: [
                            {
                                title: "SpringAOP实践",
                                path: "/java-up/aop-log"
                            },
                            {
                                title: "SpringIoC实践",
                                path: "/java-up/ioc"
                            },
                            {
                                title: "事务支持",
                                path: "/java-up/transaction"
                            },
                            {
                                title: "过滤器与拦截器",
                                path: "/java-up/Filter-Interceptor-Listener"
                            },
                            {
                                title: "SpringBoot整合Quartz",
                                path: "/java-up/quartz"
                            },
                            {
                                title: "SpringBoot整合MyBatis",
                                path: "/java-up/mybatis"
                            },
                            {
                                title: "数据校验",
                                path: "/java-up/validator"
                            },
                            {
                                title: "API数据加密",
                                path: "/worker/6"
                            },
                            {
                                title: "大数据开发实践",
                                path: "/data/data"
                            },
                            {
                                title: "订单流程设计",
                                path: "/order/order-BizOrderService"
                            },
                            {
                                title: "数据导入导出优化",
                                path: "/linuxPrometheus/linux"
                            }
                        ]
                    },
                    {
                        title: "物联网应用",
                        collapsable: true,
                        children: [
                            {
                                title: "物联网基础",
                                path: "/iot/iot"
                            },
                            {
                                title: "物联网Kafka应用",
                                path: "/iot/kafka"
                            },
                            {
                                title: "物联网Redis应用",
                                path: "/iot/redis"
                            },
                            {
                                title: "物联网Cassandra应用",
                                path: "/iot/cassandra"
                            },
                            {
                                title: "物联网设备管理",
                                path: "/iot/server"
                            },
                            {
                                title: "字节数组处理",
                                path: "/iot/byteArray"
                            },
                            {
                                title: "物联网业务流程",
                                path: "/iot/iotJob"
                            }
                        ]
                    }
                ]
            },
            {
                title: '计算机基础',
                collapsable: true,
                children: [
                    {
                        title: "操作系统",
                        path: "/cs/os"
                    },
                    {
                        title: "计算机网络",
                        path: "/cs/wangluo"
                    },
                    {
                        title: "TCP/IP协议详解",
                        path: "/cs/tcp-ip"
                    },
                    {
                        title: "Cookie/Session/Token",
                        path: "/aJava/cookie-session-token"
                    }
                ]
            }
        ]
    }
}