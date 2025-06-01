module.exports = {
    title: 'Jeskson文档-微服务分布式系统架构',
    description: 'Jeskson文档-架构师',
    base: '/JavaPlusDoc/',
    theme: 'reco',
    head: [
        ['meta', {
            name: 'viewport',
            content: 'width=device-width,initial-scale=1,user-scalable=no'
        }]
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
                text: '网站',
                link: 'https://webvueblog.github.io/JavaPlusDoc/'
            },
            {
                text: '星星',
                link: 'https://github.com/webVueBlog/JavaPlusDoc'
            },
            {
                text: '作者',
                items: [{
                    text: 'Github',
                    link: 'https://github.com/webVueBlog'
                }]
            }
        ],
        sidebar: [
            {
                title: '架构师',
                path: '/',
                collapsable: false, // 不折叠
                children: [{
                    title: "学前必读",
                    path: "/"
                }]
            },
            {
                title: '汇总Java大厂',
                path: '/aJava/jvm',
                collapsable: false, // 不折叠
                children: [{
                    title: "jvm",
                    path: "/aJava/jvm"
                },{
                    title: "线程",
                    path: "/aJava/线程"
                },{
                    title: "JVM内存区域",
                    path: "/aJava/JVM内存区域"
                },{
                    title: "程序计数器",
                    path: "/aJava/程序计数器"
                }]
            },
            {
                title: '业务流程',
                path: '/jobPro/jobPro',
                collapsable: true, // 不折叠
                children: [{
                    title: "打包发布全流程（iOS + Android）",
                    path: "/jobPro/uniapp"
                },{
                    title: "面试了一位华为的运维程序员",
                    path: "/jobPro/linux3"
                },{
                    title: "面试了一位中兴的运维程序员",
                    path: "/jobPro/linux2"
                },{
                    title: "笔记1运维服务器6年经验",
                    path: "/jobPro/linux1"
                },{
                    title: "运维服务器6年经验",
                    path: "/jobPro/linux"
                },{
                    title: "MyISAM和InnoDB有什么区别",
                    path: "/jobPro/InnoDB"
                },{
                    title: "什么是IO多路复用",
                    path: "/jobPro/IO"
                },{
                    title: "谈谈对stream流的理解",
                    path: "/jobPro/stream"
                },{
                    title: "synchronized和lock有什么区别",
                    path: "/jobPro/synchronized"
                },{
                    title: "PC网站实现微信扫码登录功能",
                    path: "/jobPro/jobPro"
                },{
                    title: "后端业务功能",
                    path: "/jobPro/spring"
                },{
                    title: "完整的用户注册登录系统",
                    path: "/jobPro/login"
                },{
                    title: "多语言国际化",
                    path: "/jobPro/lan"
                },{
                    title: "Redis缓存系统常见应用场景",
                    path: "/jobPro/redis"
                },{
                    title: "uni-app微信小程序订阅消息推送实践",
                    path: "/jobPro/appMsg"
                },{
                    title: "微信小程序自动化部署miniprogram-ci，一套代码一键上传多个小程序",
                    path: "/jobPro/miniprogram"
                },{
                    title: "微信小程序支付功能全流程实践-mongodb索引-内存管理最佳实践",
                    path: "/jobPro/appPay"
                }]
            },
            {
            title: '管理学',
            path: '/sre/sre',
            collapsable: true, // 不折叠
            children: [{
                title: "管理方法论",
                path: "/sre/sre"
            }, {
                title: "分布式监控",
                path: "/sre/monitor"
            }, {
                title: "减少琐事",
                path: "/sre/reduce"
            }, {
                title: "服务质量目标",
                path: "/sre/serviceQuality"
            }, {
                title: "错误预算",
                path: "/sre/errorBudget"
            }, {
                title: "指导思想",
                path: "/sre/guidingIdeology"
            }, {
                title: "基本概率以及方法论",
                path: "/sre/methodology"
            }, {
                title: "系统性能指标总结",
                path: "/sre/system"
            }]
        },
            {
            title: '权威指南',
            path: '/power/kafka',
            collapsable: true, // 不折叠
            children: [{
                title: "权威指南kafka",
                path: "/power/kafka"
            }, {
                title: "kafka集群",
                path: "/power/kafkas"
            }, {
                title: "kafka消费者",
                path: "/power/comsumer"
            }]
        },
            {
            title: '运维与服务器',
            path: '/linuxPrometheus/linux',
            collapsable: true, // 不折叠
            children: [{
                title: "300万数据导入导出优化方案，从80s优化到8s",
                path: "/linuxPrometheus/linux"
            }]
        },
            {
            title: '工作',
            path: '/worker/1',
            collapsable: true, // 不折叠
            children: [{
                title: "滚动部署",
                path: "/worker/1"
            }, {
                title: "nacos优雅停机",
                path: "/worker/2"
            }, {
                title: "ELK日志系统安装",
                path: "/worker/elk"
            }, {
                title: "搭建jenkins部署spring-boot项目",
                path: "/worker/jenkins"
            }, {
                title: "安装RocketMQ",
                path: "/worker/rocketmq"
            }, {
                title: "安装监控grafana",
                path: "/worker/grafana"
            }, {
                title: "SpringBoot启动脚本",
                path: "/worker/springboot"
            }, {
                title: "Linux常用命令",
                path: "/worker/linux"
            }, {
                title: "微服务（Nacos、eureka、consul）优雅上下线方案汇总",
                path: "/worker/3"
            }, {
                title: "现代化金融核心系统白皮书",
                path: "/worker/4"
            }, {
                title: "用SkyWalking监控Java服务",
                path: "/worker/skywalking"
            }, {
                title: "SpringBoot系列aop面向切面",
                path: "/worker/5"
            }, {
                title: "前后端API交互数据加密AES与RSA混合加密",
                path: "/worker/6"
            }, {
                title: "Docker+Jenkins+Nginx+阿里云服务器实现前端自动化部署",
                path: "/worker/7"
            }]
        },
            {
                title: '高并发架构',
                path: '/high-concurrency/why-cache',
                collapsable: true, // 不折叠
                children: [{
                    title: "项目中缓存是如何使用的",
                    path: "/high-concurrency/why-cache"
                }, {
                    title: "Redis和Memcached有什么区别",
                    path: "/high-concurrency/redis-single-thread-model"
                }, {
                    title: "Redis都有哪些数据类型",
                    path: "/high-concurrency/redis-data-types"
                }, {
                    title: "Redis的过期策略都有哪些",
                    path: "/high-concurrency/redis-expiration-policies-and-lru"
                }, {
                    title: "redis如何高并发和高可用",
                    path: "/high-concurrency/how-to-ensure-high-concurrency-and-high-availability-of-redis"
                }, {
                    title: "Redis主从架构",
                    path: "/high-concurrency/redis-master-slave"
                }, {
                    title: "Redis的持久化",
                    path: "/high-concurrency/redis-persistence"
                }, {
                    title: "Redis哨兵集群实现高可用",
                    path: "/high-concurrency/redis-sentinel"
                }]
            },
            {
                title: '搜索引擎es',
                path: '/es/es-architecture',
                collapsable: true, // 不折叠
                children: [{
                    title: "ES的分布式架构原理",
                    path: "/es/es-architecture"
                }, {
                    title: "ES在数据量很大",
                    path: "/es/es-optimizing-query-performance"
                }]
            },
            {
                title: '大数据',
                path: '/data/data',
                collapsable: true, // 不折叠
                children: [{
                    title: "架构师兼大数据开发工程师",
                    path: "/data/data"
                }]
            },
            {
                title: '订单流程',
                path: '/order/order-BizOrderService',
                collapsable: true, // 不折叠
                children: [{
                    title: "订单流程",
                    path: "/order/order-BizOrderService"
                }]
            },
            {
                title: '技术文',
                path: '/tech/tech',
                collapsable: true, // 不折叠
                children: [{
                    title: "凯撒加解密",
                    path: "/tech/tech"
                }, {
                    title: "HttpStatus",
                    path: "/tech/HttpStatus"
                }, {
                    title: "拦截器",
                    path: "/tech/WebInterceptor"
                }, {
                    title: "AppListener",
                    path: "/tech/AppListener"
                }, {
                    title: "Kafka事件处理类",
                    path: "/tech/KafkaEventHandle"
                },
                    {
                        title: "GatewayApp",
                        path: "/tech/GatewayApp"
                    }, {
                        title: "用户登录认证服务",
                        path: "/tech/Triangulation"
                    }, {
                        title: "发送短信",
                        path: "/tech/SMSService"
                    }, {
                        title: "微信服务类",
                        path: "/tech/WxService"
                    }, {
                        title: "日志服务",
                        path: "/tech/ActionLogService"
                    }, {
                        title: "阿里相关功能服务类",
                        path: "/tech/AliService"
                    }, {
                        title: "交易服务",
                        path: "/tech/user-TradeController"
                    }, {
                        title: "业务员控制类",
                        path: "/tech/user-SalesmanController"
                    }, {
                        title: "探测控制",
                        path: "/tech/user-ProbeController"
                    }, {
                        title: "积分控制",
                        path: "/tech/user-PointsController"
                    }, {
                        title: "用户控制",
                        path: "/tech/user-OperatorUserController"
                    }, {
                        title: "运营商控制",
                        path: "/tech/user-OperatorController"
                    }, {
                        title: "用户登录认证",
                        path: "/tech/user-LoginIdentifyController"
                    }, {
                        title: "文件服务",
                        path: "/tech/user-FileServiceController"
                    }, {
                        title: "E签宝",
                        path: "/tech/user-EsignController"
                    },
                    {
                        title: "资费信息",
                        path: "/tech/user-BExchSvcFeeController"
                    },
                    {
                        title: "配置类",
                        path: "/tech/user-config-web"
                    }, {
                        title: "useRedis配置",
                        path: "/tech/user-RedisConfig"
                    }]
            },
            {
                title: 'MyBatis-Plus',
                path: '/MyBatis-Plus/getting-started',
                collapsable: true, // 不折叠
                children: [{
                    title: "快速开始",
                    path: '/MyBatis-Plus/getting-started'
                }, {
                    title: "持久层接口",
                    path: '/MyBatis-Plus/service-interface'
                }]
            },
            {
                title: '搜索引擎',
                path: '/searchEngine/es-architecture',
                collapsable: true, // 不折叠
                children: [{
                    title: "ES的分布式架构原理",
                    path: "/searchEngine/es-architecture"
                }, {
                    title: "ES写入数据的工作原理",
                    path: "/searchEngine/es-write-query-search"
                }, {
                    title: "数亿级别如何提高查询效率",
                    path: "/searchEngine/es-optimizing-query-performance"
                }, {
                    title: "ES生产集群的部署架构",
                    path: "/searchEngine/es-production-cluster"
                }]
            },
            {
                title: 'mysql',
                path: '/mysql/mysql',
                collapsable: true, // 不折叠
                children: [{
                    title: "一条SQL查询语句是如何执行的",
                    path: "/mysql/mysql"
                }, {
                    title: "MySQL中事务的实现",
                    path: "/mysql/shiwu-shixia"
                }, {
                    title: "从根上理解MySQL事务",
                    path: "/mysql/lijie-shiwu"
                }, {
                    title: "MySQL和Redis的数据一致性",
                    path: "/mysql/redis-shuju-yizhixing"
                }]
            },
            {
                title: 'nio',
                path: '/nio/nio',
                collapsable: true, // 不折叠
                children: [{
                    title: "NIO比IO强在哪",
                    path: "/nio/nio"
                }, {
                    title: "NIO和BIO和AIO的区别",
                    path: "/nio/BIONIOAIO"
                }, {
                    title: "Buffer和Channel",
                    path: "/nio/buffer-channel"
                }, {
                    title: "网络编程实践聊天室",
                    path: "/nio/network-connect"
                }, {
                    title: "IO模型",
                    path: "/nio/moxing"
                }]
            },
            {
                title: '并发编程',
                path: '/thread/thread',
                collapsable: true, // 不折叠
                children: [{
                    title: "Java多线程入门",
                    path: "/thread/thread"
                }, {
                    title: "获取线程的执行结果",
                    path: "/thread/callable-future-futuretask"
                }, {
                    title: "Java线程的6种状态",
                    path: "/thread/thread-state-and-method"
                }]
            },
            {
                title: 'dubbo',
                path: '/dubbo/dubbo',
                collapsable: true, // 不折叠
                children: [{
                    title: "dubbo-bug",
                    path: "/dubbo/dubbo"
                }]
            },
            {
                title: '运维',
                path: '/linux/linux',
                collapsable: true, // 不折叠
                children: [{
                    title: "常用linux命令备忘录",
                    path: "/linux/linux"
                }, {
                    title: "Nginx环境配置",
                    path: "/linux/nginx-env"
                }]
            },
            {
                title: '消息队列',
                path: '/messagequeue/why-mq',
                collapsable: true, // 不折叠
                children: [{
                    title: "为什么使用消息队列",
                    path: "/messagequeue/why-mq"
                }, {
                    title: "如何保证消息队列的高可用",
                    path: "/messagequeue/how-to-ensure-high-availability-of-message-queues"
                }, {
                    title: "如何保证消息不被重复消费",
                    path: "/messagequeue/how-to-ensure-that-messages-are-not-repeatedly-consumed"
                }, {
                    title: "如何保证消息的可靠性传输",
                    path: "/messagequeue/how-to-ensure-the-reliable-transmission-of-messages"
                }, {
                    title: "如何保证消息的顺序性",
                    path: "/messagequeue/how-to-ensure-the-order-of-messages"
                }, {
                    title: "如何解决消息队列的延时",
                    path: "/messagequeue/mq-time-delay-and-expired-failure"
                }, {
                    title: "写一个消息队列",
                    path: "/messagequeue/mq-design"
                }]
            },
            {
                title: 'Redis',
                path: '/redis/rumen',
                collapsable: true, // 不折叠
                children: [{
                    title: "入门教程",
                    path: "/redis/rumen"
                }, {
                    title: "缓存雪崩、穿透、击穿",
                    path: "/redis/xuebeng-chuantou-jichuan"
                }]
            },
            {
                title: '操作系统',
                path: '/cs/os',
                collapsable: true, // 不折叠
                children: [{
                    title: "计算机操作系统",
                    path: "/cs/os"
                }, {
                    title: "计算机网络",
                    path: "/cs/wangluo"
                }]
            },
            {
                title: '物联网',
                path: '/iot/iot',
                collapsable: true, // 不折叠
                children: [{
                    title: "物联网iot",
                    path: "/iot/iot"
                }, {
                    title: "物联网kafka",
                    path: "/iot/kafka"
                }, {
                    title: "物联网redis",
                    path: "/iot/redis"
                }, {
                    title: "物联网cassandra",
                    path: "/iot/cassandra"
                }, {
                    title: "物联网设备",
                    path: "/iot/server"
                }, {
                    title: "字节数组",
                    path: "/iot/byteArray"
                }, {
                    title: "物联网流程",
                    path: "/iot/iotJob"
                }]
            },
            {
                title: 'Java进阶',
                path: '/java-up/nginx',
                collapsable: true, // 不折叠
                children: [{
                    title: "浅出搞懂Nginx",
                    path: "/java-up/nginx"
                }, {
                    title: "Nginx服务器SSL证书安装部署",
                    path: "/java-up/ssl"
                }, {
                    title: "SpringAOP扫盲",
                    path: "/java-up/aop-log"
                }, {
                    title: "SpringIoC扫盲",
                    path: "/java-up/ioc"
                }, {
                    title: "超详细Netty入门",
                    path: "/java-up/netty"
                }, {
                    title: "开启事务支持",
                    path: "/java-up/transaction"
                }, {
                    title: "过滤器与拦截器与监听器",
                    path: "/java-up/Filter-Interceptor-Listener"
                }, {
                    title: "SpringBoot整合Redis缓存",
                    path: "/java-up/redis-springboot"
                }, {
                    title: "SpringBoot整合Quartz",
                    path: "/java-up/quartz"
                }, {
                    title: "SpringBoot整合MyBatis",
                    path: "/java-up/mybatis"
                }, {
                    title: "处理校验逻辑",
                    path: "/java-up/validator"
                }, {
                    title: "MongoDB最基础入门",
                    path: "/java-up/mongodb"
                }, {
                    title: "RabbitMQ入门",
                    path: "/java-up/rabbitmq"
                }, {
                    title: "JavaIO知识体系",
                    path: "/java-up/shangtou"
                }, {
                    title: "文件流",
                    path: "/java-up/file-path"
                }, {
                    title: "字节流",
                    path: "/java-up/file-path"
                }, {
                    title: "字符流",
                    path: "/java-up/reader-writer"
                }, {
                    title: "缓冲流",
                    path: "/java-up/reader-writer"
                }, {
                    title: "转换流",
                    path: "/java-up/char-byte"
                }, {
                    title: "序列化和反序列化",
                    path: "/java-up/serialize"
                }]
            },
            {
                title: "Java基础",
                path: '/basic-grammar/basic-data-type',
                collapsable: true, // 不折叠
                children: [{
                    title: "Java基本数据类型",
                    path: "/basic-grammar/basic-data-type"
                },
                    {
                        title: "基本数据类型的转换",
                        path: "/basic-grammar/type-cast"
                    },
                    {
                        title: "基本数据类型缓存池剖析",
                        path: "/basic-grammar/int-cache"
                    },
                    {
                        title: "掌握运算符",
                        path: "/basic-grammar/operator"
                    },
                    {
                        title: "流程控制语句",
                        path: "/basic-grammar/flow-control"
                    },
                    {
                        title: "深入解读String类",
                        path: "/basic-grammar/string-source"
                    },
                    {
                        title: "字符串常量池",
                        path: "/basic-grammar/constant-pool"
                    },
                    {
                        title: "StringBuilder和StringBuffer",
                        path: "/basic-grammar/builder-buffer"
                    },
                    {
                        title: "如何比较两个字符串相等",
                        path: "/basic-grammar/equals"
                    },
                    {
                        title: "万物皆对象",
                        path: "/basic-grammar/object-class"
                    },
                    {
                        title: "Java中的包",
                        path: "/basic-grammar/package"
                    },
                    {
                        title: "Java变量",
                        path: "/basic-grammar/var"
                    },
                    {
                        title: "Java方法",
                        path: "/basic-grammar/method"
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
                    },
                    {
                        title: "List与Set与Queue与Map",
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
                        title: "双端队列ArrayDeque详解",
                        path: "/basic-grammar/ArrayDeque"
                    },
                    {
                        title: "优先级队列PriorityQueue详解",
                        path: "/basic-grammar/PriorityQueue"
                    },
                    {
                        title: "时间复杂度",
                        path: "/basic-grammar/time-complexity"
                    },
                    {
                        title: "ArrayList和LinkedList的区别",
                        path: "/basic-grammar/array-linked-list"
                    },
                    {
                        title: "深入解析Java泛型",
                        path: "/basic-grammar/generic"
                    },
                    {
                        title: "Iterator和Iterable的区别",
                        path: "/basic-grammar/iterator-iterable"
                    },
                    {
                        title: "Java的foreach循环陷阱",
                        path: "/basic-grammar/fail-fast"
                    },
                    {
                        title: "Comparable和Comparator",
                        path: "/basic-grammar/comparable-omparator"
                    },
                    {
                        title: "详解WeakHashMap",
                        path: "/basic-grammar/WeakHashMap"
                    },
                ],
            },
        ]
    }
}