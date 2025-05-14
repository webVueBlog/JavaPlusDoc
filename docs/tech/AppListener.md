---
title: AppListener
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://github.com/user-attachments/assets/2e6edc2a-0983-49c2-892b-4d94879c7d75">

## AppListener

```java
/**
 * 应用启动监听器
 */
@Component
@Slf4j
public class AppListener implements ApplicationListener<ApplicationReadyEvent> {
    // 创建一个静态的Logger对象
    static Logger logger = LoggerFactory.getLogger(AppListener.class);

    // 实现ApplicationListener接口的onApplicationEvent方法
    @Override
    public void onApplicationEvent(final ApplicationReadyEvent event) {
        try {

        } catch (Exception e) {
            // 如果发生异常，记录错误日志
            logger.error(e.getMessage(), e);
        }
    }
}

```

























