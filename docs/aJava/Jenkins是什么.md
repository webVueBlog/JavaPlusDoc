# Jenkins是什么

持续集成工具，它用主从节点结构，通过Webhook监听底阿妈仓库变化，自动触发Pipeline脚本,完成编译，测试，打包，部署四连击。

第一：分布式构建让10台服务器同时干活；第二插件系统能对接Docker K8s甚至钉钉；第三，它的Pipeline脚本用Groovy语言写，支持条件判断，循环，函数，可以写复杂的逻辑。把部署流程写成代码。

用微服务拆了200个模块的架构师，要在测试，预发，生产环境反复横跳的运维，还有每次发版都手抖的新人。它甚至能帮你自动生成测试报告。钉钉直接@责任人。


