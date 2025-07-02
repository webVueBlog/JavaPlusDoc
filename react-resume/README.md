# 程序员简历网站模板

一个专为大公司（阿里、字节、腾讯等）招聘设计的专业简历网站模板，基于 React + Vite + Ant Design 构建。

## ✨ 特色功能

- 🎯 **专业设计**：符合大公司招聘标准的简历展示
- 📱 **响应式布局**：完美适配手机、平板、电脑
- 🚀 **高性能**：基于 Vite 构建，加载速度快
- 🎨 **现代UI**：使用 Ant Design，界面美观专业
- 📊 **数据驱动**：项目经验包含具体的数据指标
- 🖨️ **打印友好**：支持打印为PDF格式

## 🚀 快速开始

1. **安装依赖**
   ```bash
   npm install
   ```

2. **启动开发服务器**
   ```bash
   npm run dev
   ```

3. **构建生产版本**
   ```bash
   npm run build
   ```

## 📝 自定义内容

### 1. 个人信息修改

在 `src/App.jsx` 中修改以下内容：

```javascript
// 个人信息
const personalInfo = {
  name: '张三',
  title: '高级前端工程师',
  description: '5年前端开发经验...',
  contact: {
    email: 'zhangsan@example.com',
    phone: '+86 138-0000-0000',
    location: '北京',
    github: 'https://github.com/yourname',
    linkedin: 'https://linkedin.com/in/yourname'
  }
};
```

### 2. 项目经验更新

修改 `projects` 数组中的项目信息：

```javascript
const projects = [
  {
    title: '项目名称',
    company: '公司名称',
    role: '职位',
    duration: '2023.03 - 2023.12',
    description: '项目描述...',
    image: '项目截图URL',
    tags: ['技术栈1', '技术栈2'],
    metrics: [
      { label: '性能提升', value: '30%' },
      { label: '用户规模', value: '1000万+' }
    ],
    highlights: [
      '主要贡献1',
      '主要贡献2'
    ]
  }
];
```

### 3. 技能标签更新

修改 `skills` 对象：

```javascript
const skills = {
  '前端技术': ['React', 'Vue3', 'TypeScript'],
  '后端技术': ['Node.js', 'Python', 'Java'],
  '数据库': ['MySQL', 'MongoDB', 'Redis'],
  '云服务': ['AWS', '阿里云', 'Docker'],
  '工具平台': ['Git', 'Webpack', '蓝湖']
};
```

### 4. 工作经历更新

修改 `experiences` 数组：

```javascript
const experiences = [
  {
    year: '2023.03 - 至今',
    company: '公司名称',
    role: '职位',
    content: '工作描述...'
  }
];
```

### 5. 教育背景更新

修改 `education` 对象：

```javascript
const education = {
  school: '学校名称',
  major: '专业',
  degree: '学位',
  year: '2015-2019',
  gpa: '3.8/4.0',
  courses: ['课程1', '课程2']
};
```

## 🎨 样式自定义

### 主题色彩

在 `src/index.css` 中修改主题色彩：

```css
:root {
  --primary-color: #1890ff;
  --secondary-color: #52c41a;
  --text-color: #333;
  --background-color: #f5f5f5;
}
```

### 布局调整

- 修改 `src/App.jsx` 中的布局参数
- 调整卡片间距、字体大小等
- 自定义响应式断点

## 📱 响应式设计

模板已针对不同设备进行优化：

- **桌面端**：完整布局，多列展示
- **平板端**：适中布局，部分列合并
- **手机端**：单列布局，垂直排列

## 🖨️ 打印优化

模板包含专门的打印样式：

- 隐藏导航和页脚
- 优化卡片边框
- 确保内容完整显示

## 🚀 部署建议

### 静态部署

1. **Vercel**（推荐）
   ```bash
   npm run build
   # 上传 dist 文件夹到 Vercel
   ```

2. **GitHub Pages**
   ```bash
   npm run build
   # 推送到 gh-pages 分支
   ```

3. **阿里云/腾讯云**
   ```bash
   npm run build
   # 上传 dist 文件夹到云服务器
   ```

### 自定义域名

部署后可以绑定自定义域名，提升专业度。

## 📋 简历优化建议

### 内容建议

1. **项目描述**：突出技术难点和解决方案
2. **数据指标**：用具体数字展示成果
3. **技术栈**：按熟练程度排序
4. **工作经历**：突出职责和成就

### 设计建议

1. **保持简洁**：避免过度装饰
2. **重点突出**：重要信息要醒目
3. **一致性**：保持字体、颜色统一
4. **可读性**：确保文字清晰易读

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个模板。

## 📄 许可证

MIT License

---

**提示**：记得定期更新项目经验和技术栈，保持简历的时效性！ 