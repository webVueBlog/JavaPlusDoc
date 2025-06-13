---
title: Kubernetes全栈监控实践
author: 哪吒
date: '2023-07-20'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## Kubernetes全栈监控实践

本文将介绍如何在Kubernetes环境中搭建全栈监控系统，实现对集群、节点、Pod、容器和应用的全方位监控。

### 1. Kubernetes监控概述

#### 1.1 监控层次

Kubernetes环境的监控通常分为以下几个层次：

- **基础设施层**：物理/虚拟机、网络设备
- **Kubernetes集群层**：控制平面组件（API Server、Scheduler、Controller Manager、etcd）
- **节点层**：Node状态、资源使用率（CPU、内存、磁盘、网络）
- **Pod/容器层**：容器资源使用、健康状态
- **应用层**：业务指标、请求延迟、错误率

#### 1.2 监控架构

我们将采用以下组件构建Kubernetes监控系统：

- **Prometheus**：时序数据库，用于存储和查询监控指标
- **Grafana**：可视化平台，用于展示监控数据
- **Alertmanager**：告警管理器，处理告警路由和通知
- **Node Exporter**：收集节点级别的指标
- **kube-state-metrics**：提供Kubernetes对象的状态指标
- **Prometheus Operator**：简化Prometheus在Kubernetes上的部署和管理

### 2. 使用Prometheus Operator部署监控系统

#### 2.1 安装Helm

Helm是Kubernetes的包管理工具，我们将使用它来部署Prometheus Operator。

```bash
# 下载Helm安装脚本
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3

# 添加执行权限
chmod 700 get_helm.sh

# 执行安装脚本
./get_helm.sh
```

#### 2.2 添加Prometheus社区Helm仓库

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
```

#### 2.3 创建监控命名空间

```bash
kubectl create namespace monitoring
```

#### 2.4 部署Prometheus Operator

```bash
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --set grafana.adminPassword=admin \
  --set prometheus.prometheusSpec.retention=15d
```

这个Helm Chart会部署以下组件：
- Prometheus Operator
- Prometheus实例
- Alertmanager
- Grafana
- Node Exporter
- kube-state-metrics
- 各种ServiceMonitor和PodMonitor资源

#### 2.5 验证部署

```bash
# 检查Pod状态
kubectl get pods -n monitoring

# 检查Service状态
kubectl get svc -n monitoring
```

#### 2.6 访问Grafana

```bash
# 端口转发Grafana服务
kubectl port-forward svc/prometheus-grafana 3000:80 -n monitoring
```

现在可以通过浏览器访问 http://localhost:3000 来访问Grafana。默认用户名是 `admin`，密码是上面设置的 `admin`。

### 3. 监控Kubernetes集群组件

#### 3.1 控制平面监控

Prometheus Operator已经配置了对Kubernetes控制平面组件的监控，包括：

- **API Server**：请求延迟、请求率、错误率
- **Scheduler**：调度延迟、调度错误
- **Controller Manager**：控制循环延迟
- **etcd**：提案提交率、提案失败率、数据库大小

在Grafana中，可以找到名为 "Kubernetes / Control Plane" 的预配置仪表板。

#### 3.2 节点监控

Node Exporter收集的节点级别指标包括：

- **CPU使用率**：用户态、系统态、IO等待
- **内存使用率**：已用、可用、缓存
- **磁盘使用率**：读写操作、空间使用
- **网络流量**：接收和发送的字节数、包数
- **系统负载**：1分钟、5分钟、15分钟平均负载

在Grafana中，可以找到名为 "Kubernetes / Compute Resources / Node" 的预配置仪表板。

#### 3.3 Pod和容器监控

kubelet的cAdvisor组件收集容器级别的指标，包括：

- **容器CPU使用率**
- **容器内存使用率**
- **容器网络流量**
- **容器文件系统使用率**

在Grafana中，可以找到名为 "Kubernetes / Compute Resources / Pod" 和 "Kubernetes / Compute Resources / Container" 的预配置仪表板。

### 4. 监控应用

#### 4.1 为应用添加Prometheus指标

以Spring Boot应用为例，添加Prometheus指标支持：

1. 添加依赖：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

2. 配置application.properties：

```properties
management.endpoints.web.exposure.include=prometheus,health,info
management.endpoint.prometheus.enabled=true
management.metrics.export.prometheus.enabled=true
```

#### 4.2 创建ServiceMonitor

创建一个ServiceMonitor资源，让Prometheus自动发现并抓取应用指标：

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: spring-boot-app
  namespace: monitoring
spec:
  selector:
    matchLabels:
      app: spring-boot-app  # 应用Service的标签
  endpoints:
  - port: http  # Service中暴露指标的端口名称
    path: /actuator/prometheus  # 指标路径
    interval: 15s  # 抓取间隔
```

#### 4.3 导入应用仪表板

在Grafana中，可以导入ID为4701的「JVM Micrometer」仪表板，用于监控Spring Boot应用。

### 5. 配置告警

#### 5.1 创建PrometheusRule

创建一个PrometheusRule资源，定义告警规则：

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: kubernetes-apps
  namespace: monitoring
spec:
  groups:
  - name: kubernetes-apps
    rules:
    - alert: PodHighCpuUsage
      expr: sum(rate(container_cpu_usage_seconds_total{container!="",pod!=""}[5m])) by (pod, namespace) > 0.8
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "Pod CPU使用率过高"
        description: "Pod {{ $labels.pod }} 在命名空间 {{ $labels.namespace }} 的CPU使用率超过80%已持续5分钟。"
    
    - alert: PodHighMemoryUsage
      expr: sum(container_memory_working_set_bytes{container!="",pod!=""}) by (pod, namespace) / sum(container_spec_memory_limit_bytes{container!="",pod!=""}) by (pod, namespace) > 0.8
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "Pod内存使用率过高"
        description: "Pod {{ $labels.pod }} 在命名空间 {{ $labels.namespace }} 的内存使用率超过80%已持续5分钟。"
```

#### 5.2 配置Alertmanager

创建一个Secret来配置Alertmanager：

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: alertmanager-prometheus-kube-prometheus-alertmanager
  namespace: monitoring
stringData:
  alertmanager.yaml: |
    global:
      resolve_timeout: 5m
      smtp_smarthost: 'smtp.example.com:587'
      smtp_from: 'alertmanager@example.com'
      smtp_auth_username: 'alertmanager'
      smtp_auth_password: 'password'
    route:
      group_by: ['job', 'alertname', 'namespace']
      group_wait: 30s
      group_interval: 5m
      repeat_interval: 12h
      receiver: 'email'
      routes:
      - match:
          severity: critical
        receiver: 'pager'
    receivers:
    - name: 'email'
      email_configs:
      - to: 'alerts@example.com'
    - name: 'pager'
      email_configs:
      - to: 'oncall@example.com'
      webhook_configs:
      - url: 'https://api.example.com/webhook'
type: Opaque
```

### 6. 高级配置

#### 6.1 自定义Prometheus存储

对于生产环境，建议配置持久化存储：

```yaml
prometheus:
  prometheusSpec:
    retention: 30d
    storageSpec:
      volumeClaimTemplate:
        spec:
          storageClassName: standard
          accessModes: ["ReadWriteOnce"]
          resources:
            requests:
              storage: 100Gi
```

#### 6.2 配置远程存储

对于长期存储，可以配置Prometheus将数据发送到远程存储：

```yaml
prometheus:
  prometheusSpec:
    remoteWrite:
      - url: "http://thanos-receive.monitoring.svc:19291/api/v1/receive"
```

#### 6.3 使用Thanos扩展Prometheus

Thanos可以提供全局查询视图、长期存储和高可用性：

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install thanos bitnami/thanos \
  --namespace monitoring \
  --set objstoreConfig="type: S3\naccessKey: YOUR_ACCESS_KEY\nsecretKey: YOUR_SECRET_KEY\nbucket: thanos\nendpoint: s3.amazonaws.com"
```

## 监控面板示例

### 集群概览

![Kubernetes集群概览](/worker/k8s-cluster-overview.svg)

*Kubernetes集群概览面板展示了集群的整体健康状态和资源使用情况*

### 节点资源监控

![Kubernetes节点资源使用率](/worker/k8s-node-resources.svg)

*Kubernetes节点资源监控面板展示了各节点的CPU、内存和磁盘使用率以及Pod数量*

### Pod监控

![Kubernetes Pod监控](/worker/k8s-pod-monitoring.svg)

*Kubernetes Pod监控面板展示了Pod的状态分布、资源使用情况和关键Pod的详细信息*

### 应用监控

![Spring Boot应用监控](/worker/k8s-app-monitoring.svg)

*Spring Boot应用监控面板展示了应用的JVM内存使用、HTTP请求统计和端点性能数据*

### 8. 最佳实践

#### 8.1 资源规划

- **Prometheus**：根据指标数量和保留时间调整资源。一般建议每天1GB的数据量，加上30%的余量。
- **Grafana**：对于中小型集群，1CPU和1GB内存通常足够。
- **Alertmanager**：资源需求较小，0.5CPU和256MB内存通常足够。

#### 8.2 性能优化

- 调整抓取间隔：默认为15s，可以根据需要调整。
- 使用标签选择器限制抓取范围。
- 配置适当的保留期限，避免存储过多历史数据。
- 对于大型集群，考虑使用Prometheus联邦或Thanos。

#### 8.3 安全性考虑

- 使用NetworkPolicy限制Prometheus的访问范围。
- 为Grafana配置适当的认证和授权。
- 敏感信息（如告警接收者的凭据）应使用Secret存储。

### 9. 故障排查

#### 9.1 Prometheus无法抓取指标

- 检查ServiceMonitor/PodMonitor的标签选择器是否正确。
- 验证目标端点是否可访问（使用kubectl port-forward测试）。
- 检查Prometheus日志中的错误信息。

```bash
kubectl logs -f prometheus-prometheus-kube-prometheus-prometheus-0 -n monitoring -c prometheus
```

#### 9.2 Grafana无法显示数据

- 验证Prometheus数据源配置是否正确。
- 使用Prometheus UI测试查询表达式。
- 检查Grafana日志中的错误信息。

```bash
kubectl logs -f prometheus-grafana-xxxxxxxxxx-xxxxx -n monitoring -c grafana
```

#### 9.3 告警未触发

- 在Prometheus UI中检查告警规则状态。
- 验证告警表达式是否正确。
- 检查Alertmanager的配置和日志。

```bash
kubectl logs -f alertmanager-prometheus-kube-prometheus-alertmanager-0 -n monitoring -c alertmanager
```

### 10. 结论

通过本文介绍的方法，您可以在Kubernetes环境中搭建全栈监控系统，实现对集群、节点、Pod、容器和应用的全方位监控。这将帮助您及时发现和解决潜在问题，保障系统的稳定运行。

随着Kubernetes生态的不断发展，监控工具和最佳实践也在不断演进。建议定期关注社区动态，及时更新监控系统，以获得更好的监控效果。