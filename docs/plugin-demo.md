---
title: VuePress插件功能演示
date: 2024-01-22
categories:
 - 文档指南
tags:
 - VuePress
 - 插件
 - 演示
---

# VuePress插件功能演示

本页面展示了项目中新增的各种VuePress插件功能。

## 代码演示容器 (demo-block)

使用 `vuepress-plugin-demo-block` 插件，可以直接在文档中运行代码示例：

::: demo 基础按钮示例
```html
<template>
  <div>
    <button @click="count++" class="demo-button">
      点击次数: {{ count }}
    </button>
    <p>当前计数: {{ count }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      count: 0
    }
  }
}
</script>

<style>
.demo-button {
  background: #42b983;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
}
.demo-button:hover {
  background: #369970;
}
</style>
```
:::

## 流程图支持 (flowchart)

使用 `vuepress-plugin-flowchart` 插件，可以用简单的文本语法绘制流程图：

```flowchart
st=>start: 开始
op1=>operation: 用户访问网站
cond=>condition: 是否已登录?
op2=>operation: 显示登录页面
op3=>operation: 显示主页内容
e=>end: 结束

st->op1->cond
cond(yes)->op3->e
cond(no)->op2->e
```

## PWA功能演示

项目已启用PWA支持，具有以下特性：

- **离线访问**: 网站内容可以离线访问
- **桌面图标**: 可以添加到桌面作为应用
- **更新提醒**: 有新内容时会提示用户刷新
- **快速加载**: 利用Service Worker缓存提升加载速度

### PWA安装指南

1. **Chrome浏览器**: 地址栏右侧会出现安装图标
2. **移动设备**: 浏览器菜单中选择"添加到主屏幕"
3. **Edge浏览器**: 地址栏右侧的应用图标

## 代码高亮与复制

代码块支持语法高亮和一键复制功能：

```javascript
// JavaScript 示例
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10)); // 输出: 55
```

```java
// Java 示例
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

```python
# Python 示例
def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)

print(quick_sort([3,6,8,10,1,2,1]))
```

## 进度条与加载动画

- **页面加载进度条**: 页面顶部的绿色进度条
- **页面切换动画**: 平滑的页面过渡效果
- **加载页面动画**: 首次访问时的加载动画

## 图片缩放功能

点击图片可以放大查看

## 返回顶部

页面右下角的返回顶部按钮，滚动页面时会自动显示。

## 看板娘

页面右下角的可爱看板娘会陪伴您的阅读过程。

## 动态标题

当您切换到其他标签页时，浏览器标题会发生变化，切换回来时会显示欢迎信息。

## 使用建议

1. **代码演示**: 适合展示Vue组件、HTML/CSS效果
2. **流程图**: 适合说明业务流程、算法逻辑
3. **PWA功能**: 提升用户体验，支持离线访问
4. **代码高亮**: 提高代码可读性

## 注意事项

- 代码演示容器中的代码会实际运行，请确保代码安全
- 流程图语法需要遵循flowchart.js的规范
- PWA功能需要HTTPS环境才能完全生效
- 部分插件可能需要额外的配置才能达到最佳效果

---

通过这些插件，我们的VuePress文档站点变得更加强大和用户友好！