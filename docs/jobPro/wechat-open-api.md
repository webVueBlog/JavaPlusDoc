---
title: 微信小程序开放接口完全指南
author: 哪吒
date: '2023-07-20'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

# 微信小程序开放接口完全指南

## 目录

- [微信小程序开放接口完全指南](#微信小程序开放接口完全指南)
  - [目录](#目录)
  - [1. 开放接口概述](#1-开放接口概述)
    - [1.1 什么是微信小程序开放接口](#11-什么是微信小程序开放接口)
    - [1.2 开放接口的分类](#12-开放接口的分类)
    - [1.3 接口使用前提条件](#13-接口使用前提条件)
  - [2. 登录与用户信息](#2-登录与用户信息)
    - [2.1 登录流程详解](#21-登录流程详解)
    - [2.2 获取用户信息](#22-获取用户信息)
    - [2.3 获取手机号](#23-获取手机号)
    - [2.4 UnionID机制](#24-unionid机制)
  - [3. 转发与分享](#3-转发与分享)
    - [3.1 页面内转发](#31-页面内转发)
    - [3.2 自定义转发内容](#32-自定义转发内容)
    - [3.3 分享到朋友圈](#33-分享到朋友圈)
    - [3.4 转发监听与数据分析](#34-转发监听与数据分析)
  - [4. 支付功能](#4-支付功能)
    - [4.1 支付流程概述](#41-支付流程概述)
    - [4.2 统一下单接口](#42-统一下单接口)
    - [4.3 发起支付](#43-发起支付)
    - [4.4 支付结果通知处理](#44-支付结果通知处理)
  - [5. 微信卡券](#5-微信卡券)
    - [5.1 卡券接口概述](#51-卡券接口概述)
    - [5.2 添加卡券](#52-添加卡券)
    - [5.3 查看卡券](#53-查看卡券)
    - [5.4 核销卡券](#54-核销卡券)
  - [6. 订阅消息](#6-订阅消息)
    - [6.1 订阅消息概述](#61-订阅消息概述)
    - [6.2 申请订阅消息模板](#62-申请订阅消息模板)
    - [6.3 获取订阅权限](#63-获取订阅权限)
    - [6.4 发送订阅消息](#64-发送订阅消息)
  - [7. 微信运动](#7-微信运动)
    - [7.1 微信运动数据获取](#71-微信运动数据获取)
    - [7.2 运动数据处理与展示](#72-运动数据处理与展示)
    - [7.3 实战案例：运动排行榜](#73-实战案例运动排行榜)
  - [8. 生物认证](#8-生物认证)
    - [8.1 指纹认证](#81-指纹认证)
    - [8.2 人脸识别](#82-人脸识别)
    - [8.3 安全最佳实践](#83-安全最佳实践)
  - [9. 开放数据域](#9-开放数据域)
    - [9.1 开放数据域概述](#91-开放数据域概述)
    - [9.2 排行榜实现](#92-排行榜实现)
    - [9.3 好友数据展示](#93-好友数据展示)
  - [10. 小程序跳转](#10-小程序跳转)
    - [10.1 跳转其他小程序](#101-跳转其他小程序)
    - [10.2 从其他小程序返回](#102-从其他小程序返回)
    - [10.3 跳转到微信原生页面](#103-跳转到微信原生页面)
  - [11. 蓝牙API](#11-蓝牙api)
    - [11.1 蓝牙API概述](#111-蓝牙api概述)
    - [11.2 蓝牙设备搜索](#112-蓝牙设备搜索)
    - [11.3 蓝牙连接管理](#113-蓝牙连接管理)
    - [11.4 数据读写与通信](#114-数据读写与通信)
    - [11.5 蓝牙低功耗(BLE)](#115-蓝牙低功耗ble)
    - [11.6 实战案例：智能设备控制](#116-实战案例智能设备控制)
  - [总结](#总结)

## 1. 开放接口概述

### 1.1 什么是微信小程序开放接口

微信小程序开放接口是微信官方提供的一系列API，允许开发者在小程序中调用微信的原生能力和服务。通过这些接口，小程序可以实现登录授权、支付、分享、获取用户信息等功能，极大地丰富了小程序的应用场景和功能。

**开放接口的主要特点：**

- **原生体验**：直接调用微信原生功能，提供流畅的用户体验
- **安全可靠**：由微信官方提供和维护，具有高度的安全性和稳定性
- **功能丰富**：覆盖用户信息、支付、分享、卡券等多个方面
- **持续更新**：微信会不断推出新的开放能力，扩展小程序的功能边界

### 1.2 开放接口的分类

微信小程序开放接口可以分为以下几类：

1. **用户信息类**：
   - 登录授权
   - 获取用户信息
   - 获取手机号
   - UnionID机制

2. **分享与转发类**：
   - 页面内转发
   - 自定义转发内容
   - 分享到朋友圈
   - 转发监听

3. **支付类**：
   - 发起支付
   - 支付结果查询
   - 退款接口

4. **微信服务类**：
   - 订阅消息
   - 卡券
   - 客服消息
   - 微信运动

5. **设备能力类**：
   - 生物认证（指纹、人脸）
   - 蓝牙
   - NFC
   - Wi-Fi

6. **开放数据类**：
   - 好友数据
   - 排行榜
   - 关系链数据

7. **小程序跳转类**：
   - 跳转其他小程序
   - 从其他小程序返回
   - 跳转原生页面

### 1.3 接口使用前提条件

在使用微信小程序开放接口前，需要满足以下条件：

1. **小程序账号要求**：
   - 已注册微信小程序账号
   - 完成开发者资质认证（部分接口需要）
   - 小程序已发布上线（部分接口需要）

2. **开发环境配置**：
   - 安装最新版本的微信开发者工具
   - 在app.json中配置需要使用的接口权限

3. **接口权限申请**：
   - 部分接口需要在微信公众平台申请权限
   - 某些接口需要额外的资质审核

4. **合规要求**：
   - 遵守微信小程序平台运营规范
   - 遵守相关法律法规
   - 保护用户隐私和数据安全

**示例：在app.json中配置权限**

```json
{
  "pages": [
    "pages/index/index",
    "pages/logs/logs"
  ],
  "window": {
    "backgroundTextStyle": "light",
    "navigationBarBackgroundColor": "#fff",
    "navigationBarTitleText": "开放接口示例",
    "navigationBarTextStyle": "black"
  },
  "permission": {
    "scope.userLocation": {
      "desc": "您的位置信息将用于小程序位置接口的效果展示"
    },
    "scope.userFuzzyLocation": {
      "desc": "您的模糊位置信息将用于小程序位置接口的效果展示"
    },
    "scope.writePhotosAlbum": {
      "desc": "保存图片到相册功能"
    }
  }
}
```

## 2. 登录与用户信息

### 2.1 登录流程详解

微信小程序的登录流程是基于OAuth 2.0协议的授权码模式实现的，主要包括以下步骤：

1. **获取登录凭证（code）**：
   - 小程序通过调用`wx.login()`获取临时登录凭证code
   - code有效期为5分钟，只能使用一次

2. **发送code到开发者服务器**：
   - 小程序将code发送到开发者服务器

3. **服务器请求微信接口**：
   - 开发者服务器通过code、AppID和AppSecret请求微信接口
   - 获取用户的openid和session_key

4. **生成自定义登录态**：
   - 开发者服务器生成自定义登录态（如token）
   - 将token返回给小程序

5. **后续业务请求**：
   - 小程序使用token进行后续业务请求

**前端登录代码示例：**

```javascript
// 小程序端登录流程
wx.login({
  success: res => {
    if (res.code) {
      // 发送code到后端
      wx.request({
        url: 'https://your-server.com/api/login',
        method: 'POST',
        data: {
          code: res.code
        },
        success: result => {
          // 保存登录态
          wx.setStorageSync('token', result.data.token);
          console.log('登录成功');
        },
        fail: err => {
          console.error('登录失败', err);
        }
      });
    } else {
      console.error('获取code失败', res.errMsg);
    }
  },
  fail: err => {
    console.error('wx.login调用失败', err);
  }
});
```

**服务器端解密微信运动数据示例（Node.js）：**

```javascript
const crypto = require('crypto');

async function decryptWeRunData(req, res) {
  const { encryptedData, iv } = req.body;
  const openid = req.user.openid;
  
  try {
    // 获取session_key
    const sessionKey = await getUserSessionKey(openid);
    
    if (!sessionKey) {
      return res.status(400).json({
        success: false,
        message: '未找到有效的会话密钥'
      });
    }
    
    // 解密数据
    const decryptedData = decryptData(encryptedData, iv, sessionKey);
    
    if (decryptedData) {
      // 解密成功
      res.json({
        success: true,
        stepInfoList: decryptedData.stepInfoList
      });
      
      // 可以将步数数据保存到数据库
      await saveWeRunData(openid, decryptedData.stepInfoList);
    } else {
      res.status(400).json({
        success: false,
        message: '数据解密失败'
      });
    }
  } catch (error) {
    console.error('解密微信运动数据错误', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
}

// 解密数据函数
function decryptData(encryptedData, iv, sessionKey) {
  try {
    // Base64解码
    const encryptedDataBuffer = Buffer.from(encryptedData, 'base64');
    const ivBuffer = Buffer.from(iv, 'base64');
    const sessionKeyBuffer = Buffer.from(sessionKey, 'base64');
    
    // 解密
    const decipher = crypto.createDecipheriv('aes-128-cbc', sessionKeyBuffer, ivBuffer);
    decipher.setAutoPadding(true);
    
    let decoded = decipher.update(encryptedDataBuffer, 'binary', 'utf8');
    decoded += decipher.final('utf8');
    
    // 解析JSON
    const decodedData = JSON.parse(decoded);
    return decodedData;
  } catch (error) {
    console.error('数据解密错误', error);
    return null;
  }
}

// 保存微信运动数据
async function saveWeRunData(openid, stepInfoList) {
  try {
    // 查找用户
    const user = await User.findOne({ openid });
    
    if (!user) return;
    
    // 保存最新的步数数据
    for (const stepInfo of stepInfoList) {
      // 查找是否已存在该日期的记录
      const existingRecord = await WeRunRecord.findOne({
        userId: user._id,
        timestamp: stepInfo.timestamp
      });
      
      if (existingRecord) {
        // 更新记录
        existingRecord.step = stepInfo.step;
        await existingRecord.save();
      } else {
        // 创建新记录
        await WeRunRecord.create({
          userId: user._id,
          timestamp: stepInfo.timestamp,
          step: stepInfo.step
        });
      }
    }
  } catch (error) {
    console.error('保存微信运动数据错误', error);
  }
}
```

### 7.2 运动数据处理与展示

获取到微信运动数据后，可以对数据进行处理和展示，例如生成步数统计图表、计算运动趋势等：

```javascript
Page({
  data: {
    stepInfoList: [],
    totalSteps: 0,
    averageSteps: 0,
    maxSteps: 0,
    chartData: {}
  },
  
  onLoad() {
    // 获取微信运动数据
    this.getWeRunData();
  },
  
  // 处理步数数据
  processStepData(stepInfoList) {
    if (!stepInfoList || stepInfoList.length === 0) return;
    
    // 按日期排序（从新到旧）
    stepInfoList.sort((a, b) => b.timestamp - a.timestamp);
    
    // 计算总步数
    const totalSteps = stepInfoList.reduce((sum, item) => sum + item.step, 0);
    
    // 计算平均步数
    const averageSteps = Math.round(totalSteps / stepInfoList.length);
    
    // 找出最大步数
    const maxSteps = Math.max(...stepInfoList.map(item => item.step));
    
    // 准备图表数据（最近7天）
    const recentSteps = stepInfoList.slice(0, 7).reverse();
    const chartData = {
      categories: recentSteps.map(item => this.formatDate(item.timestamp)),
      series: [{
        name: '步数',
        data: recentSteps.map(item => item.step)
      }]
    };
    
    // 更新数据
    this.setData({
      stepInfoList,
      totalSteps,
      averageSteps,
      maxSteps,
      chartData
    });
  },
  
  // 格式化日期
  formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  },
  
  // 渲染图表
  renderChart() {
    // 使用第三方图表库渲染图表
    // 这里以echarts为例
    if (!this.chart) {
      this.chart = this.selectComponent('#step-chart');
    }
    
    this.chart.init((canvas, width, height) => {
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height
      });
      
      const option = {
        title: {
          text: '最近7天步数统计',
          left: 'center'
        },
        color: ['#1aad19'],
        grid: {
          containLabel: true
        },
        tooltip: {
          show: true,
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: this.data.chartData.categories
        },
        yAxis: {
          type: 'value',
          min: 0
        },
        series: [{
          name: '步数',
          type: 'line',
          smooth: true,
          data: this.data.chartData.series[0].data
        }]
      };
      
      chart.setOption(option);
      return chart;
    });
  }
});
```

**WXML模板示例：**

```html
<!-- 步数统计页面 -->
<view class="container">
  <!-- 步数概览 -->
  <view class="overview">
    <view class="stat-item">
      <text class="stat-value">{{totalSteps}}</text>
      <text class="stat-label">总步数</text>
    </view>
    <view class="stat-item">
      <text class="stat-value">{{averageSteps}}</text>
      <text class="stat-label">平均步数/天</text>
    </view>
    <view class="stat-item">
      <text class="stat-value">{{maxSteps}}</text>
      <text class="stat-label">最高步数</text>
    </view>
  </view>
  
  <!-- 步数图表 -->
  <view class="chart-container">
    <ec-canvas id="step-chart" canvas-id="step-chart" ec="{{ec}}"></ec-canvas>
  </view>
  
  <!-- 步数列表 -->
  <view class="step-list">
    <view class="list-header">
      <text>日期</text>
      <text>步数</text>
    </view>
    <block wx:for="{{stepInfoList}}" wx:key="timestamp">
      <view class="list-item">
        <text>{{formatDate(item.timestamp)}}</text>
        <text>{{item.step}}</text>
      </view>
    </block>
  </view>
</view>
```

### 7.3 实战案例：运动排行榜

利用微信运动数据，可以实现好友间的运动排行榜功能。这需要结合开放数据域来实现：

**主域页面（WXML）：**

```html
<!-- 运动排行榜页面 -->
<view class="container">
  <view class="header">
    <text class="title">好友运动排行榜</text>
  </view>
  
  <!-- 开放数据域，用于展示好友排行榜 -->
  <view class="rank-container">
    <open-data-context type="werun-friends-rank"></open-data-context>
  </view>
</view>
```

**开放数据域页面（WXML）：**

```html
<!-- 开放数据域内的排行榜 -->
<view class="rank-list">
  <view class="my-rank">
    <open-data type="userAvatarUrl" class="avatar"></open-data>
    <open-data type="userNickName" class="nickname"></open-data>
    <text class="step">{{myStep}}步</text>
    <text class="rank">第{{myRank}}名</text>
  </view>
  
  <view class="rank-header">
    <text>排名</text>
    <text>好友</text>
    <text>步数</text>
  </view>
  
  <scroll-view scroll-y class="rank-scroll">
    <block wx:for="{{rankList}}" wx:key="avatarUrl">
      <view class="rank-item {{item.openid === myOpenid ? 'my-item' : ''}}">
        <text class="rank-num">{{index + 1}}</text>
        <image class="avatar" src="{{item.avatarUrl}}"></image>
        <text class="nickname">{{item.nickname}}</text>
        <text class="step">{{item.step}}步</text>
      </view>
    </block>
  </scroll-view>
</view>
```

**开放数据域JS：**

```javascript
Page({
  data: {
    rankList: [],
    myOpenid: '',
    myStep: 0,
    myRank: 0
  },
  
  onLoad() {
    // 获取微信运动数据
    this.getWeRunRank();
  },
  
  // 获取微信运动排行榜
  getWeRunRank() {
    wx.getUserInfo({
      success: res => {
        this.setData({ myOpenid: res.userInfo.openId });
        
        // 获取微信运动数据
        wx.getWeRunData({
          success: result => {
            // 在开放数据域中，可以直接获取到解密后的数据
            const weRunData = wx.getWeRunData();
            
            // 获取好友排行榜
            wx.getFriendCloudStorage({
              keyList: ['werun'],
              success: res => {
                // 处理排行榜数据
                this.processRankData(weRunData, res.data);
              }
            });
          }
        });
      }
    });
  },
  
  // 处理排行榜数据
  processRankData(myWeRunData, friendsData) {
    // 获取今日步数
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    const myStep = myWeRunData.stepInfoList.find(item => {
      const itemDate = new Date(item.timestamp * 1000);
      return itemDate.toDateString() === today.toDateString();
    })?.step || 0;
    
    // 构建排行榜数据
    const rankList = friendsData.map(friend => {
      // 查找好友今日步数
      const friendWeRunData = friend.KVDataList.find(data => data.key === 'werun');
      let step = 0;
      
      if (friendWeRunData) {
        try {
          const stepData = JSON.parse(friendWeRunData.value);
          const todayData = stepData.stepInfoList.find(item => {
            const itemDate = new Date(item.timestamp * 1000);
            return itemDate.toDateString() === today.toDateString();
          });
          
          if (todayData) {
            step = todayData.step;
          }
        } catch (e) {
          console.error('解析好友步数数据失败', e);
        }
      }
      
      return {
        openid: friend.openid,
        avatarUrl: friend.avatarUrl,
        nickname: friend.nickname,
        step
      };
    });
    
    // 添加自己的数据
    rankList.push({
      openid: this.data.myOpenid,
      avatarUrl: '',  // 开放数据域中无法直接获取自己的头像URL
      nickname: '',   // 开放数据域中无法直接获取自己的昵称
      step: myStep
    });
    
    // 按步数排序
    rankList.sort((a, b) => b.step - a.step);
    
    // 查找自己的排名
    const myRank = rankList.findIndex(item => item.openid === this.data.myOpenid) + 1;
    
    // 更新数据
    this.setData({
      rankList,
      myStep,
      myRank
    });
  }
});
```

## 8. 生物认证

### 8.1 指纹认证

微信小程序支持使用设备的指纹识别功能进行身份验证，通过调用`wx.startSoterAuthentication()`接口实现：

```javascript
Page({
  // 检查设备是否支持指纹认证
  checkSoterSupport() {
    wx.checkIsSoterEnrolledInDevice({
      checkAuthMode: 'fingerPrint',
      success: res => {
        if (res.isEnrolled) {
          // 设备已录入指纹
          this.setData({ supportFingerPrint: true });
        } else {
          // 设备未录入指纹
          wx.showToast({
            title: '请先在系统设置中录入指纹',
            icon: 'none'
          });
        }
      },
      fail: err => {
        console.error('检查指纹认证失败', err);
        wx.showToast({
          title: '您的设备不支持指纹认证',
          icon: 'none'
        });
      }
    });
  },
  
  // 开始指纹认证
  startFingerPrintAuth() {
    wx.startSoterAuthentication({
      requestAuthModes: ['fingerPrint'],
      challenge: 'challenge', // 挑战因子，可以为空
      authContent: '请验证指纹',
      success: res => {
        console.log('指纹认证成功', res);
        
        // 认证成功后的处理
        this.handleAuthSuccess(res);
      },
      fail: err => {
        console.error('指纹认证失败', err);
        
        let message = '指纹认证失败';
        
        if (err.errCode === 90010) {
          message = '没有找到指纹认证相关驱动';
        } else if (err.errCode === 90003) {
          message = '请重新验证指纹';
        }
        
        wx.showToast({
          title: message,
          icon: 'none'
        });
      }
    });
  },
  
  // 处理认证成功
  handleAuthSuccess(res) {
    // 获取认证结果
    const resultJSON = res.resultJSON;
    const resultJSONSignature = res.resultJSONSignature;
    
    // 将认证结果发送到服务器验证
    wx.request({
      url: 'https://your-server.com/api/verify-fingerprint',
      method: 'POST',
      data: {
        resultJSON,
        resultJSONSignature
      },
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      success: result => {
        if (result.data.success) {
          // 服务器验证通过
          wx.showToast({
            title: '认证成功',
            icon: 'success'
          });
          
          // 执行后续操作
          this.afterAuthSuccess();
        } else {
          wx.showToast({
            title: result.data.message || '验证失败',
            icon: 'none'
          });
        }
      },
      fail: err => {
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
        console.error('验证请求失败', err);
      }
    });
  },
  
  // 认证成功后的操作
  afterAuthSuccess() {
    // 例如：解锁敏感功能、授权支付等
  }
});
```

### 8.2 人脸识别

除了指纹认证，微信小程序还支持人脸识别功能，同样通过`wx.startSoterAuthentication()`接口实现，只需将认证模式改为`'facial'`：

```javascript
Page({
  // 检查设备是否支持人脸识别
  checkFacialSupport() {
    wx.checkIsSoterEnrolledInDevice({
      checkAuthMode: 'facial',
      success: res => {
        if (res.isEnrolled) {
          // 设备已录入人脸
          this.setData({ supportFacial: true });
        } else {
          // 设备未录入人脸
          wx.showToast({
            title: '请先在系统设置中录入人脸',
            icon: 'none'
          });
        }
      },
      fail: err => {
        console.error('检查人脸识别失败', err);
        wx.showToast({
          title: '您的设备不支持人脸识别',
          icon: 'none'
        });
      }
    });
  },
  
  // 开始人脸识别
  startFacialAuth() {
    wx.startSoterAuthentication({
      requestAuthModes: ['facial'],
      challenge: 'challenge', // 挑战因子，可以为空
      authContent: '请进行人脸识别',
      success: res => {
        console.log('人脸识别成功', res);
        
        // 认证成功后的处理
        this.handleAuthSuccess(res);
      },
      fail: err => {
        console.error('人脸识别失败', err);
        
        wx.showToast({
          title: '人脸识别失败',
          icon: 'none'
        });
      }
    });
  }
});
```

### 8.3 安全最佳实践

在使用生物认证时，需要注意以下安全最佳实践：

1. **服务器验证**：
   - 不要仅依赖客户端的认证结果
   - 将认证结果发送到服务器进行验证
   - 验证签名的有效性

2. **防重放攻击**：
   - 使用挑战因子（challenge）
   - 每次认证使用不同的挑战因子
   - 服务器验证挑战因子的有效性

3. **降级处理**：
   - 提供备选的认证方式
   - 处理设备不支持生物认证的情况
   - 处理用户未录入生物信息的情况

4. **敏感操作确认**：
   - 仅在必要的敏感操作前使用生物认证
   - 明确告知用户认证的目的
   - 不要过度使用生物认证

**服务器端验证生物认证结果示例（Node.js）：**

```javascript
const crypto = require('crypto');

async function verifyBiometricAuth(req, res) {
  const { resultJSON, resultJSONSignature } = req.body;
  
  try {
    // 解析resultJSON
    const result = JSON.parse(resultJSON);
    
    // 验证挑战因子
    if (result.challenge !== expectedChallenge) {
      return res.status(400).json({
        success: false,
        message: '无效的挑战因子'
      });
    }
    
    // 验证签名
    const publicKey = await getWechatPublicKey();
    const isValid = verifySignature(resultJSON, resultJSONSignature, publicKey);
    
    if (isValid) {
      // 验证通过
      res.json({
        success: true,
        message: '验证成功'
      });
    } else {
      // 验证失败
      res.status(400).json({
        success: false,
        message: '签名验证失败'
      });
    }
  } catch (error) {
    console.error('验证生物认证结果错误', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
}

// 验证签名函数
function verifySignature(data, signature, publicKey) {
  try {
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(data);
    return verify.verify(publicKey, Buffer.from(signature, 'base64'));
  } catch (error) {
    console.error('签名验证错误', error);
    return false;
  }
}
```

## 9. 开放数据域

### 9.1 开放数据域概述

微信小程序的开放数据域是一个独立的JavaScript作用域，用于访问用户的开放数据，如微信好友关系、群信息、排行榜等。开放数据域的主要特点：

1. **数据隔离**：
   - 开放数据只能在开放数据域中访问
   - 主域无法直接获取开放数据

2. **渲染机制**：
   - 开放数据域的内容通过`<open-data>`或`<open-data-context>`组件渲染
   - 主域与开放数据域通过消息机制通信

3. **使用场景**：
   - 好友排行榜
   - 群排行榜
   - 展示好友头像、昵称等信息

**开放数据域的使用流程：**

1. 在游戏项目中创建开放数据域目录（通常为`/opendata`）
2. 在开放数据域中编写访问开放数据的代码
3. 在主域中使用`<open-data-context>`组件渲染开放数据域内容
4. 通过消息机制实现主域与开放数据域的通信

### 9.2 排行榜实现

使用开放数据域实现好友排行榜的完整示例：

**主域页面（WXML）：**

```html
<!-- 排行榜页面 -->
<view class="container">
  <view class="header">
    <text class="title">好友排行榜</text>
    <view class="tab-container">
      <view class="tab {{currentTab === 'friend' ? 'active' : ''}}" bindtap="switchTab" data-tab="friend">好友排行</view>
      <view class="tab {{currentTab === 'group' ? 'active' : ''}}" bindtap="switchTab" data-tab="group">群排行</view>
    </view>
  </view>
  
  <!-- 开放数据域，用于展示排行榜 -->
  <view class="rank-container">
    <open-data-context id="openDataContext"></open-data-context>
  </view>
  
  <!-- 分享按钮 -->
  <button class="share-btn" open-type="share">邀请好友</button>
</view>
```

**主域页面（JS）：**

```javascript
Page({
  data: {
    currentTab: 'friend', // 当前选中的标签：friend或group
    shareTicket: '' // 群分享票据
  },
  
  onLoad(options) {
    // 初始化开放数据域
    this.initOpenDataContext();
    
    // 如果是从群分享进入，获取shareTicket
    if (options.shareTicket) {
      this.setData({ 
        shareTicket: options.shareTicket,
        currentTab: 'group'
      });
      
      // 切换到群排行
      this.switchTab({ currentTarget: { dataset: { tab: 'group' } } });
    }
  },
  
  // 初始化开放数据域
  initOpenDataContext() {
    // 获取开放数据域实例
    this.openDataContext = wx.getOpenDataContext();
    
    // 获取画布
    const canvas = wx.createCanvas();
    
    // 向开放数据域发送初始化消息
    this.openDataContext.postMessage({
      action: 'init',
      canvas: canvas
    });
  },
  
  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    
    if (tab === this.data.currentTab) return;
    
    this.setData({ currentTab: tab });
    
    if (tab === 'friend') {
      // 加载好友排行榜
      this.loadFriendRank();
    } else if (tab === 'group') {
      // 加载群排行榜
      this.loadGroupRank();
    }
  },
  
  // 加载好友排行榜
  loadFriendRank() {
    this.openDataContext.postMessage({
      action: 'loadFriendRank'
    });
  },
  
  // 加载群排行榜
  loadGroupRank() {
    if (this.data.shareTicket) {
      this.openDataContext.postMessage({
        action: 'loadGroupRank',
        shareTicket: this.data.shareTicket
      });
    } else {
      wx.showToast({
        title: '请从群聊中进入',
        icon: 'none'
      });
    }
  },
  
  // 分享
  onShareAppMessage() {
    return {
      title: '来挑战我的分数吧！',
      path: '/pages/rank/index',
      imageUrl: '/images/share.png',
      success: res => {
        if (res.shareTickets && res.shareTickets.length > 0) {
          // 获取群分享票据
          this.setData({ shareTicket: res.shareTickets[0] });
        }
      }
    };
  }
});
```

**开放数据域代码（opendata/index.js）：**

```javascript
// 开放数据域代码
const canvas = wx.getSharedCanvas();
const context = canvas.getContext('2d');

// 排行榜数据
let rankList = [];
let myRank = 0;

// 监听主域消息
wx.onMessage(message => {
  if (message.action === 'init') {
    // 初始化
    initCanvas();
  } else if (message.action === 'loadFriendRank') {
    // 加载好友排行榜
    loadFriendRank();
  } else if (message.action === 'loadGroupRank') {
    // 加载群排行榜
    loadGroupRank(message.shareTicket);
  }
});

// 初始化画布
function initCanvas() {
  // 设置画布尺寸
  canvas.width = 375;
  canvas.height = 600;
  
  // 绘制背景
  context.fillStyle = '#f8f8f8';
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  // 绘制加载提示
  context.fillStyle = '#333333';
  context.font = '16px Arial';
  context.textAlign = 'center';
  context.fillText('加载中...', canvas.width / 2, canvas.height / 2);
}

// 加载好友排行榜
function loadFriendRank() {
  // 获取用户信息
  wx.getUserInfo({
    openIdList: ['selfOpenId'],
    success: res => {
      const userInfo = res.data[0];
      
      // 获取好友数据
      wx.getFriendCloudStorage({
        keyList: ['score'],
        success: res => {
          // 处理排行榜数据
          processRankData(userInfo, res.data);
          
          // 渲染排行榜
          renderRankList();
        },
        fail: err => {
          console.error('获取好友数据失败', err);
          renderError('获取好友数据失败');
        }
      });
    },
    fail: err => {
      console.error('获取用户信息失败', err);
      renderError('获取用户信息失败');
    }
  });
}

// 加载群排行榜
function loadGroupRank(shareTicket) {
  if (!shareTicket) {
    renderError('无效的群分享票据');
    return;
  }
  
  // 获取用户信息
  wx.getUserInfo({
    openIdList: ['selfOpenId'],
    success: res => {
      const userInfo = res.data[0];
      
      // 获取群数据
      wx.getGroupCloudStorage({
        shareTicket,
        keyList: ['score'],
        success: res => {
          // 处理排行榜数据
          processRankData(userInfo, res.data);
          
          // 渲染排行榜
          renderRankList();
        },
        fail: err => {
          console.error('获取群数据失败', err);
          renderError('获取群数据失败');
        }
      });
    },
    fail: err => {
      console.error('获取用户信息失败', err);
      renderError('获取用户信息失败');
    }
  });
}

// 处理排行榜数据
function processRankData(userInfo, friendData) {
  // 提取分数数据
  rankList = friendData.map(friend => {
    // 查找好友分数
    const scoreData = friend.KVDataList.find(data => data.key === 'score');
    let score = 0;
    
    if (scoreData) {
      try {
        score = parseInt(scoreData.value);
      } catch (e) {
        console.error('解析分数数据失败', e);
      }
    }
    
    return {
      openid: friend.openid,
      avatarUrl: friend.avatarUrl,
      nickname: friend.nickname,
      score
    };
  });
  
  // 按分数排序（从高到低）
  rankList.sort((a, b) => b.score - a.score);
  
  // 查找自己的排名
  myRank = rankList.findIndex(item => item.openid === userInfo.openId) + 1;
}

// 渲染排行榜
function renderRankList() {
  // 清空画布
  context.clearRect(0, 0, canvas.width, canvas.height);
  
  // 绘制背景
  context.fillStyle = '#f8f8f8';
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  // 绘制标题
  context.fillStyle = '#333333';
  context.font = 'bold 18px Arial';
  context.textAlign = 'center';
  context.fillText('排行榜', canvas.width / 2, 30);
  
  // 绘制我的排名
  context.font = '16px Arial';
  context.fillText(`我的排名: 第${myRank}名`, canvas.width / 2, 60);
  
  // 绘制分割线
  context.strokeStyle = '#eeeeee';
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(10, 80);
  context.lineTo(canvas.width - 10, 80);
  context.stroke();
  
  // 绘制排行榜列表
  const itemHeight = 60;
  const startY = 100;
  
  for (let i = 0; i < rankList.length && i < 10; i++) {
    const item = rankList[i];
    const y = startY + i * itemHeight;
    
    // 绘制背景（突出显示自己）
    if (item.openid === 'selfOpenId') {
      context.fillStyle = '#e6f7ff';
      context.fillRect(10, y - 5, canvas.width - 20, itemHeight);
    }
    
    // 绘制排名
    context.fillStyle = i < 3 ? '#ff9800' : '#999999';
    context.font = 'bold 18px Arial';
    context.textAlign = 'center';
    context.fillText(`${i + 1}`, 30, y + 20);
    
    // 绘制头像（使用默认头像）
    context.fillStyle = '#dddddd';
    context.beginPath();
    context.arc(70, y + 20, 20, 0, Math.PI * 2);
    context.fill();
    
    // 绘制昵称
    context.fillStyle = '#333333';
    context.font = '16px Arial';
    context.textAlign = 'left';
    context.fillText(item.nickname, 100, y + 20);
    
    // 绘制分数
    context.fillStyle = '#ff6600';
    context.textAlign = 'right';
    context.fillText(`${item.score}分`, canvas.width - 20, y + 20);
    
    // 绘制分割线
    if (i < rankList.length - 1 && i < 9) {
      context.strokeStyle = '#eeeeee';
      context.beginPath();
      context.moveTo(10, y + itemHeight - 5);
      context.lineTo(canvas.width - 10, y + itemHeight - 5);
      context.stroke();
    }
  }
  
  // 如果没有数据
  if (rankList.length === 0) {
    context.fillStyle = '#999999';
    context.font = '16px Arial';
    context.textAlign = 'center';
    context.fillText('暂无排行数据', canvas.width / 2, canvas.height / 2);
  }
}

// 渲染错误信息
function renderError(message) {
  // 清空画布
  context.clearRect(0, 0, canvas.width, canvas.height);
  
  // 绘制背景
  context.fillStyle = '#f8f8f8';
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  // 绘制错误信息
  context.fillStyle = '#ff0000';
  context.font = '16px Arial';
  context.textAlign = 'center';
  context.fillText(message, canvas.width / 2, canvas.height / 2);
}
```

### 9.3 好友数据展示

除了排行榜，开放数据域还可以用于展示好友数据，例如好友列表、群成员列表等：

**使用open-data组件展示用户信息：**

```html
<!-- 用户信息展示 -->
<view class="user-info">
  <open-data type="userAvatarUrl" class="avatar"></open-data>
  <open-data type="userNickName" class="nickname"></open-data>
  <open-data type="userGender" lang="zh_CN" class="gender"></open-data>
  <open-data type="userCity" lang="zh_CN" class="city"></open-data>
</view>
```

**获取好友列表示例：**

```javascript
// 开放数据域中获取好友列表
function getFriendList() {
  wx.getFriendCloudStorage({
    keyList: ['score', 'level'], // 要获取的数据键列表
    success: res => {
      const friendList = res.data;
      console.log('好友列表', friendList);
      
      // 处理好友数据
      processFriendData(friendList);
    },
    fail: err => {
      console.error('获取好友列表失败', err);
    }
  });
}

// 处理好友数据
function processFriendData(friendList) {
  // 处理好友数据的逻辑
  // ...
  
  // 渲染好友列表
  renderFriendList(friendList);
}

// 渲染好友列表
function renderFriendList(friendList) {
  // 渲染好友列表的逻辑
  // ...
}
```

## 10. 小程序跳转

### 10.1 跳转其他小程序

微信小程序支持跳转到其他小程序，通过调用`wx.navigateToMiniProgram()`接口实现：

```javascript
Page({
  // 跳转到其他小程序
  navigateToMiniProgram() {
    wx.navigateToMiniProgram({
      appId: 'wxabcdef123456', // 要跳转的小程序的appid
      path: 'pages/index/index?id=123', // 跳转的目标页面
      extraData: { // 需要传递给目标小程序的数据
        foo: 'bar'
      },
      envVersion: 'release', // 要打开的小程序版本，有效值：develop（开发版），trial（体验版），release（正式版）
      success: res => {
        console.log('跳转成功');
      },
      fail: err => {
        console.error('跳转失败', err);
      }
    });
  }
});
```

**使用button组件跳转：**

```html
<!-- 使用button跳转到其他小程序 -->
<button open-type="navigate" app-id="wxabcdef123456" path="pages/index/index?id=123" extra-data="{{extraData}}" version="release">打开其他小程序</button>
```

### 10.2 从其他小程序返回

当从其他小程序返回时，可以在`onShow`生命周期函数中获取返回信息：

```javascript
Page({
  onShow() {
    // 获取当前页面的参数
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const options = currentPage.options;
    
    // 检查是否有返回参数
    if (options.from_appid) {
      console.log('从其他小程序返回', options);
      
      // 处理返回数据
      this.handleReturnData(options);
    }
  },
  
  // 处理返回数据
  handleReturnData(options) {
    // 处理从其他小程序返回的数据
    // ...
  }
});
```

### 10.3 跳转到微信原生页面

微信小程序还支持跳转到微信的原生页面，例如客服会话、设置页面等：

**跳转到客服会话：**

```html
<!-- 跳转到客服会话 -->
<button open-type="contact" show-message-card="true" send-message-title="咨询问题" send-message-path="pages/index/index" send-message-img="/images/logo.png">联系客服</button>
```

**跳转到设置页面：**

```javascript
Page({
  // 跳转到设置页面
  openSetting() {
    wx.openSetting({
      success: res => {
        console.log('设置页面打开成功', res.authSetting);
      },
      fail: err => {
        console.error('设置页面打开失败', err);
      }
    });
  }
});
```

**跳转到微信支付分页面：**

```javascript
Page({
  // 跳转到微信支付分页面
  navigateToWeChatPay() {
    wx.navigateToMiniProgram({
      appId: 'wxd8f3793ea3b935b8', // 微信支付分小程序的appid
      path: 'pages/index/index', // 跳转的目标页面
      success: res => {
        console.log('跳转成功');
      },
      fail: err => {
        console.error('跳转失败', err);
      }
    });
  }
});
```

## 总结

微信小程序开放接口为开发者提供了丰富的能力，使小程序能够与微信生态深度融合，提供更好的用户体验。本指南详细介绍了各类开放接口的使用方法、最佳实践和实战案例，帮助开发者更好地利用这些能力开发功能丰富的小程序。

在使用开放接口时，需要注意以下几点：

1. **权限申请**：许多开放接口需要在小程序管理后台申请权限，确保在使用前完成相关配置。

2. **用户授权**：涉及用户数据的接口需要获取用户授权，应在合适的时机请求授权，并提供清晰的用途说明。

3. **安全性**：处理用户敏感数据时，应遵循最小权限原则，做好数据加密和安全验证。

4. **兼容性**：不同设备和微信版本对开放接口的支持可能有差异，应做好兼容性处理。

5. **体验优化**：合理使用开放接口，避免过度打扰用户，提供流畅、自然的交互体验。

通过合理运用这些开放接口，开发者可以打造出功能丰富、体验优秀的微信小程序，为用户提供更好的服务。

## 11. 蓝牙API

### 11.1 蓝牙API概述

微信小程序提供了完整的蓝牙API，支持与蓝牙设备进行通信，包括传统蓝牙和低功耗蓝牙(BLE)。通过这些API，小程序可以实现与智能硬件的互联互通，开发各类IoT应用。

**蓝牙API的分类：**

1. **传统蓝牙API**：
   - 适用于传统蓝牙设备
   - 支持搜索、连接、数据传输等功能
   - 使用`wx.openBluetoothAdapter`等接口

2. **低功耗蓝牙(BLE)API**：
   - 适用于BLE设备
   - 支持服务、特征值的操作
   - 使用`wx.readBLECharacteristicValue`等接口

**使用蓝牙API的前提条件：**

1. **权限申请**：
   - 在`app.json`中声明蓝牙相关权限
   - 用户首次使用时需授权

2. **设备支持**：
   - 确保用户设备支持蓝牙功能
   - 检查蓝牙是否开启

**app.json权限配置示例：**

```json
{
  "pages": [
    "pages/index/index"
  ],
  "permission": {
    "scope.bluetooth": {
      "desc": "请求获取蓝牙权限，用于连接智能设备"
    }
  }
}
```

### 11.2 蓝牙设备搜索

在与蓝牙设备通信前，首先需要初始化蓝牙模块并搜索设备。

**蓝牙设备搜索流程：**

1. 初始化蓝牙模块
2. 开始搜索设备
3. 监听设备发现事件
4. 处理搜索结果
5. 停止搜索

**完整代码示例：**

```javascript
Page({
  data: {
    devices: [], // 搜索到的设备列表
    searching: false // 是否正在搜索
  },
  
  // 初始化蓝牙模块
  initBluetooth() {
    wx.openBluetoothAdapter({
      success: (res) => {
        console.log('初始化蓝牙模块成功', res);
        this.startBluetoothDevicesDiscovery();
      },
      fail: (err) => {
        if (err.errCode === 10001) {
          wx.showToast({
            title: '请开启手机蓝牙功能',
            icon: 'none'
          });
        } else {
          wx.showToast({
            title: '蓝牙初始化失败',
            icon: 'none'
          });
        }
        console.error('初始化蓝牙模块失败', err);
      }
    });
    
    // 监听蓝牙适配器状态变化
    wx.onBluetoothAdapterStateChange((res) => {
      console.log('蓝牙适配器状态变化', res);
      if (!res.available) {
        this.stopBluetoothDevicesDiscovery();
      }
    });
    
    // 监听寻找到新设备的事件
    wx.onBluetoothDeviceFound((res) => {
      const devices = res.devices;
      console.log('发现新设备', devices);
      
      // 过滤并添加设备到列表
      devices.forEach(device => {
        // 过滤无名称或已存在的设备
        if (!device.name && !device.localName) {
          return;
        }
        
        // 检查设备是否已存在于列表中
        const foundDevices = this.data.devices;
        const idx = foundDevices.findIndex(item => item.deviceId === device.deviceId);
        
        if (idx === -1) {
          // 新设备，添加到列表
          this.setData({
            devices: [...foundDevices, device]
          });
        } else {
          // 已存在的设备，更新信息
          foundDevices[idx] = device;
          this.setData({
            devices: foundDevices
          });
        }
      });
    });
  },
  
  // 开始搜索蓝牙设备
  startBluetoothDevicesDiscovery() {
    if (this.data.searching) {
      return;
    }
    
    this.setData({
      searching: true
    });
    
    // 开始搜索
    wx.startBluetoothDevicesDiscovery({
      allowDuplicatesKey: false, // 是否允许重复上报同一设备
      success: (res) => {
        console.log('开始搜索蓝牙设备', res);
        wx.showLoading({
          title: '正在搜索设备...'
        });
      },
      fail: (err) => {
        console.error('搜索蓝牙设备失败', err);
        this.setData({
          searching: false
        });
        wx.showToast({
          title: '搜索设备失败',
          icon: 'none'
        });
      }
    });
  },
  
  // 停止搜索蓝牙设备
  stopBluetoothDevicesDiscovery() {
    wx.stopBluetoothDevicesDiscovery({
      success: (res) => {
        console.log('停止搜索蓝牙设备', res);
        this.setData({
          searching: false
        });
        wx.hideLoading();
      }
    });
  },
  
  // 页面卸载时清理蓝牙模块
  onUnload() {
    this.stopBluetoothDevicesDiscovery();
    wx.closeBluetoothAdapter();
  }
});
```

**WXML模板示例：**

```html
<view class="container">
  <view class="header">
    <text class="title">蓝牙设备搜索</text>
    <button class="search-btn" bindtap="{{searching ? 'stopBluetoothDevicesDiscovery' : 'initBluetooth'}}">
      {{searching ? '停止搜索' : '开始搜索'}}
    </button>
  </view>
  
  <view class="device-list">
    <block wx:if="{{devices.length > 0}}">
      <view class="device-item" wx:for="{{devices}}" wx:key="deviceId" bindtap="connectDevice" data-device="{{item}}">
        <view class="device-info">
          <text class="device-name">{{item.name || item.localName || '未知设备'}}</text>
          <text class="device-id">ID: {{item.deviceId}}</text>
          <text class="rssi">信号强度: {{item.RSSI}} dBm</text>
        </view>
        <view class="connect-icon">></view>
      </view>
    </block>
    <view class="empty-tip" wx:else>
      <text>{{searching ? '正在搜索设备...' : '暂无设备，请点击开始搜索'}}</text>
    </view>
  </view>
</view>
```

### 11.3 蓝牙连接管理

搜索到设备后，需要建立连接并管理连接状态。

**蓝牙连接流程：**

1. 创建连接
2. 获取服务
3. 获取特征值
4. 监听连接状态
5. 断开连接

**连接管理代码示例：**

```javascript
Page({
  data: {
    // 其他数据...
    connectedDeviceId: '', // 已连接的设备ID
    services: [], // 设备服务列表
  },
  
  // 连接设备
  connectDevice(e) {
    const device = e.currentTarget.dataset.device;
    const deviceId = device.deviceId;
    
    // 停止搜索
    this.stopBluetoothDevicesDiscovery();
    
    // 创建连接
    wx.createBLEConnection({
      deviceId: deviceId,
      success: (res) => {
        console.log('连接设备成功', res);
        this.setData({
          connectedDeviceId: deviceId
        });
        
        wx.showToast({
          title: '连接成功',
          icon: 'success'
        });
        
        // 获取设备的服务
        this.getBLEDeviceServices(deviceId);
      },
      fail: (err) => {
        console.error('连接设备失败', err);
        wx.showToast({
          title: '连接失败',
          icon: 'none'
        });
      }
    });
    
    // 监听设备连接状态
    wx.onBLEConnectionStateChange((res) => {
      console.log('设备连接状态变化', res);
      if (!res.connected) {
        // 设备已断开连接
        this.setData({
          connectedDeviceId: '',
          services: []
        });
        
        wx.showToast({
          title: '设备已断开连接',
          icon: 'none'
        });
      }
    });
  },
  
  // 获取设备的服务
  getBLEDeviceServices(deviceId) {
    wx.getBLEDeviceServices({
      deviceId: deviceId,
      success: (res) => {
        console.log('获取设备服务成功', res);
        const services = res.services;
        this.setData({
          services: services
        });
        
        // 获取第一个服务的特征值
        if (services.length > 0) {
          this.getBLEDeviceCharacteristics(deviceId, services[0].uuid);
        }
      },
      fail: (err) => {
        console.error('获取设备服务失败', err);
      }
    });
  },
  
  // 获取特定服务的特征值
  getBLEDeviceCharacteristics(deviceId, serviceId) {
    wx.getBLEDeviceCharacteristics({
      deviceId: deviceId,
      serviceId: serviceId,
      success: (res) => {
        console.log('获取特征值成功', res);
        const characteristics = res.characteristics;
        
        // 遍历特征值，查找可读写的特征
        characteristics.forEach(characteristic => {
          const uuid = characteristic.uuid;
          const properties = characteristic.properties;
          
          // 如果特征值可读
          if (properties.read) {
            // 读取特征值数据
            this.readBLECharacteristicValue(deviceId, serviceId, uuid);
          }
          
          // 如果特征值可通知
          if (properties.notify || properties.indicate) {
            // 订阅特征值变化
            this.notifyBLECharacteristicValueChange(deviceId, serviceId, uuid);
          }
        });
      },
      fail: (err) => {
        console.error('获取特征值失败', err);
      }
    });
  },
  
  // 断开设备连接
  disconnectDevice() {
    const deviceId = this.data.connectedDeviceId;
    if (!deviceId) return;
    
    wx.closeBLEConnection({
      deviceId: deviceId,
      success: (res) => {
        console.log('断开设备连接成功', res);
        this.setData({
          connectedDeviceId: '',
          services: []
        });
      },
      fail: (err) => {
        console.error('断开设备连接失败', err);
      }
    });
  },
  
  // 页面卸载时断开连接并关闭蓝牙模块
  onUnload() {
    if (this.data.connectedDeviceId) {
      this.disconnectDevice();
    }
    wx.closeBluetoothAdapter();
  }
});
```

### 11.4 数据读写与通信

连接设备后，可以通过特征值进行数据读写和通信。

**数据读写流程：**

1. 读取特征值
2. 监听特征值变化
3. 写入特征值

**数据读写代码示例：**

```javascript
Page({
  // 其他代码...
  
  // 读取特征值数据
  readBLECharacteristicValue(deviceId, serviceId, characteristicId) {
    wx.readBLECharacteristicValue({
      deviceId: deviceId,
      serviceId: serviceId,
      characteristicId: characteristicId,
      success: (res) => {
        console.log('读取特征值成功', res);
        // 读取成功后，数据会通过onBLECharacteristicValueChange事件返回
      },
      fail: (err) => {
        console.error('读取特征值失败', err);
      }
    });
  },
  
  // 监听特征值变化
  notifyBLECharacteristicValueChange(deviceId, serviceId, characteristicId) {
    wx.notifyBLECharacteristicValueChange({
      deviceId: deviceId,
      serviceId: serviceId,
      characteristicId: characteristicId,
      state: true, // 启用通知
      success: (res) => {
        console.log('订阅特征值成功', res);
        
        // 监听特征值变化
        wx.onBLECharacteristicValueChange((result) => {
          console.log('特征值变化', result);
          const value = this.ab2hex(result.value);
          console.log('接收到的数据：', value);
          
          // 处理接收到的数据
          this.handleReceivedData(value);
        });
      },
      fail: (err) => {
        console.error('订阅特征值失败', err);
      }
    });
  },
  
  // 写入数据到特征值
  writeBLECharacteristicValue(data) {
    const deviceId = this.data.connectedDeviceId;
    if (!deviceId) {
      wx.showToast({
        title: '设备未连接',
        icon: 'none'
      });
      return;
    }
    
    // 获取写入特征值的服务ID和特征值ID
    // 注意：这里需要根据实际设备的服务和特征值进行修改
    const serviceId = 'YOUR_SERVICE_ID';
    const characteristicId = 'YOUR_CHARACTERISTIC_ID';
    
    // 将字符串转换为ArrayBuffer
    const buffer = this.string2ArrayBuffer(data);
    
    wx.writeBLECharacteristicValue({
      deviceId: deviceId,
      serviceId: serviceId,
      characteristicId: characteristicId,
      value: buffer,
      success: (res) => {
        console.log('写入数据成功', res);
      },
      fail: (err) => {
        console.error('写入数据失败', err);
        wx.showToast({
          title: '发送数据失败',
          icon: 'none'
        });
      }
    });
  },
  
  // 处理接收到的数据
  handleReceivedData(data) {
    // 根据设备协议解析数据
    // 这里仅作示例，实际应用中需要根据设备协议进行解析
    console.log('解析后的数据：', data);
    
    // 更新UI显示
    this.setData({
      receivedData: data
    });
  },
  
  // ArrayBuffer转16进制字符串
  ab2hex(buffer) {
    const hexArr = Array.prototype.map.call(
      new Uint8Array(buffer),
      function(bit) {
        return ('00' + bit.toString(16)).slice(-2);
      }
    );
    return hexArr.join('');
  },
  
  // 字符串转ArrayBuffer
  string2ArrayBuffer(str) {
    const buffer = new ArrayBuffer(str.length);
    const dataView = new DataView(buffer);
    for (let i = 0; i < str.length; i++) {
      dataView.setUint8(i, str.charCodeAt(i));
    }
    return buffer;
  }
});
```

### 11.5 蓝牙低功耗(BLE)

蓝牙低功耗(BLE)是一种特殊的蓝牙技术，具有低功耗、低延迟的特点，适用于IoT设备、可穿戴设备等场景。

**BLE的特点：**

1. **低功耗**：设备可以使用纽扣电池运行数月甚至数年
2. **低延迟**：连接建立时间短，通信延迟低
3. **服务与特征值**：采用GATT协议，通过服务和特征值进行数据交互

**BLE通信模型：**

- **服务(Service)**：设备提供的功能集合，每个服务包含多个特征值
- **特征值(Characteristic)**：服务的具体属性，可以读取、写入或订阅
- **描述符(Descriptor)**：特征值的附加信息

**常见BLE服务UUID：**

| 服务名称 | UUID | 描述 |
|---------|------|------|
| 电池服务 | 0x180F | 提供设备电池电量信息 |
| 设备信息服务 | 0x180A | 提供设备制造商、型号等信息 |
| 心率服务 | 0x180D | 提供心率监测数据 |
| 健康温度计服务 | 0x1809 | 提供温度测量数据 |

**BLE设备交互示例：**

```javascript
// 获取设备电池电量
function getBatteryLevel(deviceId) {
  // 电池服务UUID
  const batteryServiceUUID = '180F';
  // 电池电量特征值UUID
  const batteryCharacteristicUUID = '2A19';
  
  // 读取电池电量
  wx.readBLECharacteristicValue({
    deviceId: deviceId,
    serviceId: batteryServiceUUID,
    characteristicId: batteryCharacteristicUUID,
    success: (res) => {
      console.log('读取电池电量成功', res);
      
      // 监听特征值变化获取数据
      wx.onBLECharacteristicValueChange((result) => {
        if (result.characteristicId === batteryCharacteristicUUID) {
          // 解析电池电量数据（单字节，范围0-100）
          const value = new Uint8Array(result.value);
          const batteryLevel = value[0];
          
          console.log('电池电量：', batteryLevel + '%');
          
          // 更新UI显示
          this.setData({
            batteryLevel: batteryLevel
          });
        }
      });
    },
    fail: (err) => {
      console.error('读取电池电量失败', err);
    }
  });
}
```

### 11.6 实战案例：智能设备控制

下面是一个完整的智能灯泡控制案例，展示如何使用蓝牙API控制智能设备。

**智能灯泡控制流程：**

1. 搜索并连接灯泡
2. 获取灯泡服务和特征值
3. 发送控制命令（开关、亮度、颜色）
4. 接收灯泡状态更新

**完整代码示例：**

```javascript
// 智能灯泡控制页面
Page({
  data: {
    devices: [], // 搜索到的设备列表
    searching: false, // 是否正在搜索
    connected: false, // 是否已连接
    deviceId: '', // 已连接的设备ID
    lightOn: false, // 灯泡开关状态
    brightness: 50, // 亮度（0-100）
    color: '#FFFFFF', // 颜色（RGB）
    // 灯泡服务和特征值UUID（示例，实际应根据设备文档确定）
    serviceId: 'FFF0',
    controlCharId: 'FFF1', // 控制特征值
    statusCharId: 'FFF2'  // 状态特征值
  },
  
  // 初始化蓝牙
  onLoad() {
    this.initBluetooth();
  },
  
  // 初始化蓝牙模块
  initBluetooth() {
    wx.openBluetoothAdapter({
      success: (res) => {
        console.log('初始化蓝牙模块成功', res);
      },
      fail: (err) => {
        console.error('初始化蓝牙模块失败', err);
        wx.showModal({
          title: '提示',
          content: '请确保手机蓝牙已开启',
          showCancel: false
        });
      }
    });
    
    // 监听蓝牙适配器状态变化
    wx.onBluetoothAdapterStateChange((res) => {
      if (!res.available) {
        this.setData({
          searching: false,
          connected: false
        });
      }
    });
    
    // 监听设备发现事件
    wx.onBluetoothDeviceFound((res) => {
      res.devices.forEach(device => {
        // 过滤设备（这里假设灯泡名称包含"Light"或"Bulb"）
        const name = device.name || device.localName || '';
        if (name.includes('Light') || name.includes('Bulb')) {
          // 检查是否已存在于列表中
          const idx = this.data.devices.findIndex(d => d.deviceId === device.deviceId);
          if (idx === -1) {
            this.setData({
              devices: [...this.data.devices, device]
            });
          }
        }
      });
    });
    
    // 监听连接状态变化
    wx.onBLEConnectionStateChange((res) => {
      if (!res.connected && this.data.connected) {
        this.setData({
          connected: false,
          lightOn: false
        });
        wx.showToast({
          title: '设备已断开连接',
          icon: 'none'
        });
      }
    });
    
    // 监听特征值变化
    wx.onBLECharacteristicValueChange((res) => {
      if (res.characteristicId === this.data.statusCharId) {
        // 解析灯泡状态数据
        this.parseLightStatus(res.value);
      }
    });
  },
  
  // 开始搜索设备
  startSearch() {
    this.setData({
      devices: [],
      searching: true
    });
    
    wx.startBluetoothDevicesDiscovery({
      success: (res) => {
        console.log('开始搜索设备', res);
      },
      fail: (err) => {
        console.error('搜索设备失败', err);
        this.setData({ searching: false });
      }
    });
  },
  
  // 停止搜索
  stopSearch() {
    wx.stopBluetoothDevicesDiscovery();
    this.setData({ searching: false });
  },
  
  // 连接设备
  connectDevice(e) {
    const deviceId = e.currentTarget.dataset.id;
    this.stopSearch();
    
    wx.createBLEConnection({
      deviceId: deviceId,
      success: (res) => {
        this.setData({
          connected: true,
          deviceId: deviceId
        });
        
        // 获取设备服务
        setTimeout(() => {
          this.getBLEDeviceServices(deviceId);
        }, 1000);
      },
      fail: (err) => {
        console.error('连接设备失败', err);
        wx.showToast({
          title: '连接失败',
          icon: 'none'
        });
      }
    });
  },
  
  // 获取设备服务
  getBLEDeviceServices(deviceId) {
    wx.getBLEDeviceServices({
      deviceId: deviceId,
      success: (res) => {
        // 查找目标服务
        const service = res.services.find(s => s.uuid.toUpperCase().includes(this.data.serviceId));
        if (service) {
          this.getBLEDeviceCharacteristics(deviceId, service.uuid);
        } else {
          wx.showToast({
            title: '未找到灯泡服务',
            icon: 'none'
          });
        }
      }
    });
  },
  
  // 获取服务特征值
  getBLEDeviceCharacteristics(deviceId, serviceId) {
    wx.getBLEDeviceCharacteristics({
      deviceId: deviceId,
      serviceId: serviceId,
      success: (res) => {
        // 查找控制和状态特征值
        res.characteristics.forEach(char => {
          const uuid = char.uuid.toUpperCase();
          
          // 订阅状态特征值变化
          if (uuid.includes(this.data.statusCharId) && (char.properties.notify || char.properties.indicate)) {
            this.notifyBLECharacteristicValueChange(deviceId, serviceId, char.uuid);
          }
          
          // 读取当前状态
          if (uuid.includes(this.data.statusCharId) && char.properties.read) {
            this.readLightStatus(deviceId, serviceId, char.uuid);
          }
        });
      }
    });
  },
  
  // 订阅状态特征值变化
  notifyBLECharacteristicValueChange(deviceId, serviceId, characteristicId) {
    wx.notifyBLECharacteristicValueChange({
      deviceId: deviceId,
      serviceId: serviceId,
      characteristicId: characteristicId,
      state: true,
      success: (res) => {
        console.log('订阅特征值成功');
      }
    });
  },
  
  // 读取灯泡状态
  readLightStatus(deviceId, serviceId, characteristicId) {
    wx.readBLECharacteristicValue({
      deviceId: deviceId,
      serviceId: serviceId,
      characteristicId: characteristicId,
      success: (res) => {
        console.log('读取灯泡状态成功');
      }
    });
  },
  
  // 解析灯泡状态数据
  parseLightStatus(buffer) {
    // 解析数据（示例，实际格式取决于设备协议）
    const data = new Uint8Array(buffer);
    if (data.length >= 4) {
      const status = data[0]; // 0:关闭 1:开启
      const brightness = data[1]; // 亮度 0-100
      const r = data[2]; // 红色 0-255
      const g = data[3]; // 绿色 0-255
      const b = data[4]; // 蓝色 0-255
      
      // 转换为十六进制颜色
      const color = '#' + 
        ('0' + r.toString(16)).slice(-2) + 
        ('0' + g.toString(16)).slice(-2) + 
        ('0' + b.toString(16)).slice(-2);
      
      this.setData({
        lightOn: status === 1,
        brightness: brightness,
        color: color
      });
    }
  },
  
  // 切换灯泡开关
  toggleLight() {
    const newStatus = !this.data.lightOn;
    this.setData({ lightOn: newStatus });
    this.sendControlCommand();
  },
  
  // 调整亮度
  changeBrightness(e) {
    const brightness = e.detail.value;
    this.setData({ brightness: brightness });
    this.sendControlCommand();
  },
  
  // 选择颜色
  changeColor(e) {
    const color = e.detail.value;
    this.setData({ color: color });
    this.sendControlCommand();
  },
  
  // 发送控制命令
  sendControlCommand() {
    const deviceId = this.data.deviceId;
    if (!deviceId || !this.data.connected) return;
    
    // 查找目标服务和特征值
    wx.getBLEDeviceServices({
      deviceId: deviceId,
      success: (res) => {
        const service = res.services.find(s => s.uuid.toUpperCase().includes(this.data.serviceId));
        if (service) {
          wx.getBLEDeviceCharacteristics({
            deviceId: deviceId,
            serviceId: service.uuid,
            success: (res) => {
              const char = res.characteristics.find(c => 
                c.uuid.toUpperCase().includes(this.data.controlCharId) && c.properties.write);
              
              if (char) {
                // 构建控制命令
                const command = this.buildControlCommand();
                
                // 发送命令
                wx.writeBLECharacteristicValue({
                  deviceId: deviceId,
                  serviceId: service.uuid,
                  characteristicId: char.uuid,
                  value: command,
                  success: (res) => {
                    console.log('发送控制命令成功');
                  },
                  fail: (err) => {
                    console.error('发送控制命令失败', err);
                  }
                });
              }
            }
          });
        }
      }
    });
  },
  
  // 构建控制命令
  buildControlCommand() {
    // 解析颜色
    const color = this.data.color.substring(1); // 去掉#
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    
    // 构建命令（示例，实际格式取决于设备协议）
    const command = new Uint8Array(5);
    command[0] = this.data.lightOn ? 1 : 0; // 开关状态
    command[1] = this.data.brightness; // 亮度
    command[2] = r; // 红色
    command[3] = g; // 绿色
    command[4] = b; // 蓝色
    
    return command.buffer;
  },
  
  // 断开连接
  disconnectDevice() {
    const deviceId = this.data.deviceId;
    if (!deviceId) return;
    
    wx.closeBLEConnection({
      deviceId: deviceId,
      success: (res) => {
        this.setData({
          connected: false,
          lightOn: false
        });
      }
    });
  },
  
  // 页面卸载
  onUnload() {
    if (this.data.connected) {
      this.disconnectDevice();
    }
    if (this.data.searching) {
      this.stopSearch();
    }
    wx.closeBluetoothAdapter();
  }
});
```

**WXML模板：**

```html
<view class="container">
  <!-- 设备搜索部分 -->
  <view class="search-section" wx:if="{{!connected}}">
    <view class="header">
      <text class="title">智能灯泡控制</text>
      <button class="search-btn" bindtap="{{searching ? 'stopSearch' : 'startSearch'}}">
        {{searching ? '停止搜索' : '搜索设备'}}
      </button>
    </view>
    
    <view class="device-list">
      <block wx:if="{{devices.length > 0}}">
        <view class="device-item" wx:for="{{devices}}" wx:key="deviceId" bindtap="connectDevice" data-id="{{item.deviceId}}">
          <view class="device-info">
            <text class="device-name">{{item.name || item.localName || '未知设备'}}</text>
            <text class="device-id">ID: {{item.deviceId}}</text>
          </view>
          <view class="connect-icon">连接</view>
        </view>
      </block>
      <view class="empty-tip" wx:else>
        <text>{{searching ? '正在搜索设备...' : '暂无设备，请点击搜索设备'}}</text>
      </view>
    </view>
  </view>
  
  <!-- 设备控制部分 -->
  <view class="control-section" wx:if="{{connected}}">
    <view class="header">
      <text class="title">灯泡控制</text>
      <button class="disconnect-btn" bindtap="disconnectDevice">断开连接</button>
    </view>
    
    <view class="light-status">
      <view class="light-preview" style="background-color: {{lightOn ? color : '#333'}}; opacity: {{lightOn ? brightness/100 : 0.1}};"></view>
      <text class="status-text">状态: {{lightOn ? '开启' : '关闭'}}</text>
    </view>
    
    <view class="control-panel">
      <view class="control-item">
        <text class="control-label">开关</text>
        <switch checked="{{lightOn}}" bindchange="toggleLight" color="#007AFF"></switch>
      </view>
      
      <view class="control-item">
        <text class="control-label">亮度: {{brightness}}%</text>
        <slider value="{{brightness}}" min="0" max="100" show-value="{{false}}" bindchange="changeBrightness" activeColor="#007AFF"></slider>
      </view>
      
      <view class="control-item">
        <text class="control-label">颜色</text>
        <picker mode="colorPicker" value="{{color}}" bindchange="changeColor">
          <view class="color-preview" style="background-color: {{color}};"></view>
        </picker>
      </view>
    </view>
  </view>
</view>
```

**WXSS样式：**

```css
.container {
  padding: 20rpx;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
}

.search-btn, .disconnect-btn {
  font-size: 28rpx;
  padding: 10rpx 20rpx;
  background-color: #007AFF;
  color: white;
  border-radius: 8rpx;
}

.device-list {
  margin-top: 20rpx;
}

.device-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background-color: #f8f8f8;
  border-radius: 10rpx;
  margin-bottom: 20rpx;
}

.device-name {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.device-id {
  font-size: 24rpx;
  color: #666;
}

.connect-icon {
  color: #007AFF;
  font-size: 28rpx;
}

.empty-tip {
  text-align: center;
  color: #999;
  padding: 40rpx 0;
}

.light-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 40rpx 0;
}

.light-preview {
  width: 200rpx;
  height: 200rpx;
  border-radius: 100rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 0 30rpx rgba(0,0,0,0.2);
  transition: all 0.3s ease;
}

.status-text {
  font-size: 32rpx;
}

.control-panel {
  background-color: #f8f8f8;
  border-radius: 10rpx;
  padding: 20rpx;
}

.control-item {
  margin-bottom: 30rpx;
}

.control-label {
  display: block;
  margin-bottom: 10rpx;
  font-size: 28rpx;
}

.color-preview {
  width: 60rpx;
  height: 60rpx;
  border-radius: 8rpx;
  border: 2rpx solid #ddd;
}
```

**后端处理代码示例（Node.js）：**

```javascript
const axios = require('axios');
const jwt = require('jsonwebtoken');

async function login(req, res) {
  const { code } = req.body;
  const appId = 'your-appid';
  const appSecret = 'your-appsecret';
  
  try {
    // 请求微信接口获取openid和session_key
    const wxResponse = await axios.get(
      `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`
    );
    
    const { openid, session_key } = wxResponse.data;
    
    if (openid) {
      // 查询用户是否已存在
      let user = await User.findOne({ openid });
      
      // 不存在则创建新用户
      if (!user) {
        user = await User.create({ openid });
      }
      
      // 生成JWT token
      const token = jwt.sign(
        { userId: user._id, openid },
        'your-jwt-secret',
        { expiresIn: '7d' }
      );
      
      res.json({ success: true, token });
    } else {
      res.status(400).json({ success: false, message: '获取openid失败' });
    }
  } catch (error) {
    console.error('登录处理错误', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
}
```

### 2.2 获取用户信息

在微信小程序中获取用户信息需要遵循用户授权机制，主要有以下几种方式：

1. **通过开放能力按钮获取**：
   - 使用`<button open-type="getUserInfo">`组件
   - 用户点击按钮后弹出授权窗口
   - 在回调中获取用户信息

2. **通过wx.getUserProfile获取**：
   - 调用`wx.getUserProfile()`方法
   - 需要在用户主动触发的事件中调用
   - 每次调用都会弹出授权窗口

**使用button获取用户信息示例：**

```html
<!-- WXML文件 -->
<button open-type="getUserInfo" bindgetuserinfo="getUserInfo">获取用户信息</button>
```

```javascript
// JS文件
Page({
  getUserInfo(e) {
    if (e.detail.userInfo) {
      // 用户允许授权
      const userInfo = e.detail.userInfo;
      this.setData({ userInfo });
      console.log('用户信息', userInfo);
    } else {
      // 用户拒绝授权
      console.log('用户拒绝授权');
    }
  }
});
```

**使用wx.getUserProfile示例：**

```html
<!-- WXML文件 -->
<button bindtap="getUserProfile">获取用户信息</button>
```

```javascript
// JS文件
Page({
  getUserProfile() {
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途
      success: (res) => {
        const userInfo = res.userInfo;
        this.setData({ userInfo });
        console.log('用户信息', userInfo);
      },
      fail: (err) => {
        console.log('获取用户信息失败', err);
      }
    });
  }
});
```

### 2.3 获取手机号

微信小程序提供了获取用户手机号的能力，但需要用户授权，且只能通过button组件的open-type="getPhoneNumber"方式获取：

**前端获取手机号示例：**

```html
<!-- WXML文件 -->
<button open-type="getPhoneNumber" bindgetphonenumber="getPhoneNumber">获取手机号</button>
```

```javascript
// JS文件
Page({
  getPhoneNumber(e) {
    if (e.detail.errMsg === 'getPhoneNumber:ok') {
      // 用户允许授权
      const { code } = e.detail;
      
      // 将code发送到后端解密
      wx.request({
        url: 'https://your-server.com/api/decrypt-phone',
        method: 'POST',
        data: { code },
        header: {
          'Authorization': `Bearer ${wx.getStorageSync('token')}`
        },
        success: res => {
          console.log('手机号信息', res.data);
        },
        fail: err => {
          console.error('获取手机号失败', err);
        }
      });
    } else {
      // 用户拒绝授权
      console.log('用户拒绝授权手机号');
    }
  }
});
```

**后端解密手机号示例（Node.js）：**

```javascript
const axios = require('axios');

async function decryptPhoneNumber(req, res) {
  const { code } = req.body;
  const appId = 'your-appid';
  const appSecret = 'your-appsecret';
  
  try {
    // 获取access_token
    const tokenResponse = await axios.get(
      `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`
    );
    
    const accessToken = tokenResponse.data.access_token;
    
    // 使用code和access_token获取手机号
    const phoneResponse = await axios.post(
      `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${accessToken}`,
      { code }
    );
    
    if (phoneResponse.data.errcode === 0) {
      const phoneInfo = phoneResponse.data.phone_info;
      
      // 保存用户手机号
      await User.findByIdAndUpdate(req.user.userId, {
        phoneNumber: phoneInfo.phoneNumber,
        countryCode: phoneInfo.countryCode
      });
      
      res.json({
        success: true,
        phoneNumber: phoneInfo.phoneNumber,
        countryCode: phoneInfo.countryCode
      });
    } else {
      res.status(400).json({
        success: false,
        message: '获取手机号失败',
        error: phoneResponse.data
      });
    }
  } catch (error) {
    console.error('解密手机号错误', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
}
```

### 2.4 UnionID机制

UnionID是微信为了解决同一用户在不同应用（小程序、公众号、App等）中的身份识别问题而提供的机制。通过UnionID，开发者可以知道同一用户在不同应用中的关联关系。

**UnionID的获取条件：**

1. 开发者账号已完成微信认证
2. 用户必须授权获取用户信息
3. 满足以下任一条件：
   - 用户已关注公众号，且公众号与小程序已关联
   - 用户已使用微信登录过该开发者的App，且App与小程序已关联
   - 用户已关注该开发者的其他小程序，且这些小程序已关联

**获取UnionID示例：**

```javascript
// 前端代码与获取用户信息相同，在后端处理UnionID

// 后端处理UnionID（Node.js）
async function handleLogin(req, res) {
  const { code } = req.body;
  const appId = 'your-appid';
  const appSecret = 'your-appsecret';
  
  try {
    // 请求微信接口获取openid、session_key和unionid
    const wxResponse = await axios.get(
      `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`
    );
    
    const { openid, session_key, unionid } = wxResponse.data;
    
    if (openid) {
      // 查询用户是否已存在（优先使用unionid查询）
      let user;
      
      if (unionid) {
        user = await User.findOne({ unionid });
      }
      
      if (!user) {
        user = await User.findOne({ openid });
      }
      
      // 不存在则创建新用户
      if (!user) {
        user = await User.create({ 
          openid,
          unionid: unionid || null
        });
      } else if (unionid && !user.unionid) {
        // 更新用户的unionid
        user.unionid = unionid;
        await user.save();
      }
      
      // 生成JWT token
      const token = jwt.sign(
        { userId: user._id, openid },
        'your-jwt-secret',
        { expiresIn: '7d' }
      );
      
      res.json({ success: true, token });
    } else {
      res.status(400).json({ success: false, message: '获取openid失败' });
    }
  } catch (error) {
    console.error('登录处理错误', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
}
```

## 3. 转发与分享

### 3.1 页面内转发

微信小程序支持用户将页面转发给朋友或分享到群聊。页面内转发主要通过以下两种方式实现：

1. **通过button组件转发**：
   - 使用`<button open-type="share">`组件
   - 用户点击按钮后弹出转发界面

2. **通过右上角菜单转发**：
   - 用户点击右上角「...」菜单
   - 选择「转发」选项

**使用button组件转发示例：**

```html
<!-- WXML文件 -->
<button open-type="share">分享给朋友</button>
```

```javascript
// JS文件
Page({
  // 定义页面的分享信息
  onShareAppMessage() {
    return {
      title: '自定义转发标题',
      path: '/pages/index/index',
      imageUrl: '/images/share.png' // 自定义转发图片
    };
  }
});
```

### 3.2 自定义转发内容

开发者可以通过`onShareAppMessage`方法自定义转发的内容，包括标题、路径和图片：

```javascript
Page({
  onShareAppMessage(res) {
    // res.from表示转发事件来源：button或menu
    // res.target表示如果from值为button，则target为触发这次转发事件的button
    // res.webViewUrl表示如果from值为webview，则webViewUrl为webview的url
    
    if (res.from === 'button') {
      console.log('来自页面内转发按钮');
    } else {
      console.log('来自右上角转发菜单');
    }
    
    return {
      title: '自定义转发标题',
      path: '/pages/index/index?id=123', // 可以携带参数
      imageUrl: '/images/share.png', // 自定义图片路径，可以是本地文件或网络图片
      promise: new Promise(resolve => {
        // 异步获取转发信息
        setTimeout(() => {
          resolve({
            title: '异步获取的转发标题'
          });
        }, 2000);
      })
    };
  }
});
```

### 3.3 分享到朋友圈

微信小程序支持将内容分享到朋友圈，需要通过button组件的open-type="shareTimeline"实现：

```html
<!-- WXML文件 -->
<button open-type="shareTimeline">分享到朋友圈</button>
```

```javascript
// JS文件
Page({
  // 定义页面的朋友圈分享信息
  onShareTimeline() {
    return {
      title: '自定义朋友圈标题',
      query: 'id=123', // 携带参数
      imageUrl: '/images/timeline-share.png' // 自定义图片
    };
  }
});
```

### 3.4 转发监听与数据分析

开发者可以监听用户的转发行为，并进行数据分析：

```javascript
Page({
  onShareAppMessage() {
    // 记录转发事件
    this.recordShareEvent('appMessage');
    
    return {
      title: '自定义转发标题',
      path: '/pages/index/index?share_source=button'
    };
  },
  
  onShareTimeline() {
    // 记录朋友圈分享事件
    this.recordShareEvent('timeline');
    
    return {
      title: '自定义朋友圈标题',
      query: 'share_source=timeline'
    };
  },
  
  // 记录分享事件的方法
  recordShareEvent(type) {
    const shareData = {
      type,
      page: this.route,
      timestamp: new Date().getTime()
    };
    
    // 可以将分享数据发送到后端记录
    wx.request({
      url: 'https://your-server.com/api/record-share',
      method: 'POST',
      data: shareData,
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      }
    });
    
    // 也可以使用微信自带的数据分析能力
    wx.reportAnalytics('share_event', {
      share_type: type,
      share_page: this.route
    });
  },
  
  onLoad(options) {
    // 检查是否是通过分享进入的页面
    if (options.share_source) {
      console.log(`通过${options.share_source}分享进入页面`);
      
      // 记录分享来源
      wx.reportAnalytics('share_enter', {
        share_source: options.share_source
      });
    }
  }
});
```

## 4. 支付功能

### 4.1 支付流程概述

微信小程序支付是基于微信支付的能力，实现在小程序内完成支付的功能。完整的支付流程包括：

1. **创建商品订单**：
   - 用户在小程序中选择商品并下单
   - 小程序将订单信息发送到开发者服务器

2. **调用统一下单接口**：
   - 开发者服务器调用微信支付统一下单接口
   - 获取预支付交易会话标识（prepay_id）

3. **生成支付参数**：
   - 开发者服务器根据prepay_id生成支付参数
   - 将支付参数返回给小程序

4. **发起支付请求**：
   - 小程序调用`wx.requestPayment()`发起支付
   - 用户在微信支付界面完成支付

5. **接收支付结果通知**：
   - 微信服务器通过回调通知开发者服务器支付结果
   - 开发者服务器更新订单状态

6. **查询支付结果**：
   - 小程序查询开发者服务器获取最终支付状态
   - 展示支付结果给用户

### 4.2 统一下单接口

开发者服务器需要调用微信支付的统一下单接口，获取预支付交易会话标识：

**统一下单接口示例（Node.js）：**

```javascript
const crypto = require('crypto');
const axios = require('axios');
const xml2js = require('xml2js');

async function createUnifiedOrder(req, res) {
  const { openid, totalFee, body, outTradeNo } = req.body;
  
  // 微信支付配置
  const config = {
    appid: 'your-appid',
    mchid: 'your-mchid', // 商户号
    key: 'your-key', // API密钥
    notifyUrl: 'https://your-server.com/api/pay/notify' // 支付结果通知地址
  };
  
  // 构建统一下单参数
  const params = {
    appid: config.appid,
    mch_id: config.mchid,
    nonce_str: generateNonceStr(),
    body: body || '商品购买',
    out_trade_no: outTradeNo,
    total_fee: totalFee, // 单位：分
    spbill_create_ip: req.ip,
    notify_url: config.notifyUrl,
    trade_type: 'JSAPI',
    openid: openid
  };
  
  // 签名
  params.sign = generateSign(params, config.key);
  
  // 将参数转换为XML
  const builder = new xml2js.Builder({ rootName: 'xml', cdata: true });
  const xml = builder.buildObject(params);
  
  try {
    // 调用统一下单接口
    const response = await axios.post(
      'https://api.mch.weixin.qq.com/pay/unifiedorder',
      xml,
      { headers: { 'Content-Type': 'text/xml' } }
    );
    
    // 解析XML响应
    const result = await parseXML(response.data);
    
    if (result.return_code === 'SUCCESS' && result.result_code === 'SUCCESS') {
      // 生成支付参数
      const timeStamp = Math.floor(Date.now() / 1000).toString();
      const nonceStr = generateNonceStr();
      
      const payParams = {
        appId: config.appid,
        timeStamp,
        nonceStr,
        package: `prepay_id=${result.prepay_id}`,
        signType: 'MD5'
      };
      
      // 签名支付参数
      payParams.paySign = generateSign(payParams, config.key);
      
      // 返回支付参数给小程序
      res.json({
        success: true,
        payParams
      });
    } else {
      console.error('统一下单失败', result);
      res.status(400).json({
        success: false,
        message: result.return_msg || result.err_code_des || '统一下单失败'
      });
    }
  } catch (error) {
    console.error('统一下单异常', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
}

// 生成随机字符串
function generateNonceStr() {
  return Math.random().toString(36).substr(2, 15);
}

// 生成签名
function generateSign(params, key) {
  // 按字典序排序参数
  const sortedParams = Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== '')
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  // 拼接key
  const stringSignTemp = `${sortedParams}&key=${key}`;
  
  // MD5加密并转为大写
  return crypto.createHash('md5').update(stringSignTemp).digest('hex').toUpperCase();
}

// 解析XML
function parseXML(xml) {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xml, { explicitArray: false }, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.xml);
      }
    });
  });
}
```

### 4.3 发起支付

小程序端通过调用`wx.requestPayment()`方法发起支付请求：

```javascript
// 小程序端发起支付
Page({
  // 创建订单并发起支付
  createOrderAndPay() {
    // 显示加载提示
    wx.showLoading({ title: '正在创建订单...' });
    
    // 创建订单
    wx.request({
      url: 'https://your-server.com/api/orders',
      method: 'POST',
      data: {
        productId: this.data.productId,
        quantity: this.data.quantity,
        // 其他订单信息
      },
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      success: orderRes => {
        if (orderRes.data.success) {
          const { orderId, outTradeNo } = orderRes.data;
          
          // 获取支付参数
          this.getPayParams(orderId, outTradeNo);
        } else {
          wx.hideLoading();
          wx.showToast({
            title: orderRes.data.message || '创建订单失败',
            icon: 'none'
          });
        }
      },
      fail: err => {
        wx.hideLoading();
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
        console.error('创建订单失败', err);
      }
    });
  },
  
  // 获取支付参数
  getPayParams(orderId, outTradeNo) {
    wx.request({
      url: 'https://your-server.com/api/pay/unified-order',
      method: 'POST',
      data: {
        outTradeNo,
        totalFee: this.data.totalFee, // 单位：分
        body: this.data.productName
      },
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      success: payRes => {
        wx.hideLoading();
        
        if (payRes.data.success) {
          // 发起支付
          this.requestPayment(payRes.data.payParams, orderId);
        } else {
          wx.showToast({
            title: payRes.data.message || '获取支付参数失败',
            icon: 'none'
          });
        }
      },
      fail: err => {
        wx.hideLoading();
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
        console.error('获取支付参数失败', err);
      }
    });
  },
  
  // 调用支付接口
  requestPayment(payParams, orderId) {
    wx.requestPayment({
      ...payParams,
      success: res => {
        console.log('支付成功', res);
        
        // 跳转到支付成功页面
        wx.navigateTo({
          url: `/pages/pay-success/index?orderId=${orderId}`
        });
      },
      fail: err => {
        console.log('支付失败或取消', err);
        
        if (err.errMsg === 'requestPayment:fail cancel') {
          // 用户取消支付
          wx.showToast({
            title: '支付已取消',
            icon: 'none'
          });
        } else {
          // 支付失败
          wx.showToast({
            title: '支付失败，请重试',
            icon: 'none'
          });
        }
        
        // 跳转到订单详情页面
        wx.navigateTo({
          url: `/pages/order-detail/index?orderId=${orderId}`
        });
      }
    });
  }
});
```

### 4.4 支付结果通知处理

微信支付完成后，微信服务器会向开发者服务器发送支付结果通知。开发者需要处理这个通知，更新订单状态：

```javascript
// 处理支付结果通知（Node.js）
async function handlePayNotify(req, res) {
  // 获取通知数据
  const xmlData = req.body.toString('utf-8');
  
  try {
    // 解析XML数据
    const notifyData = await parseXML(xmlData);
    
    // 验证签名
    const sign = notifyData.sign;
    delete notifyData.sign;
    
    const calculatedSign = generateSign(notifyData, 'your-key');
    
    if (calculatedSign !== sign) {
      console.error('签名验证失败');
      return res.send('<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[签名验证失败]]></return_msg></xml>');
    }
    
    // 验证支付结果
    if (notifyData.return_code === 'SUCCESS' && notifyData.result_code === 'SUCCESS') {
      // 获取商户订单号
      const outTradeNo = notifyData.out_trade_no;
      // 获取微信支付订单号
      const transactionId = notifyData.transaction_id;
      // 获取支付金额
      const totalFee = parseInt(notifyData.total_fee);
      
      // 查询订单
      const order = await Order.findOne({ outTradeNo });
      
      if (!order) {
        console.error('订单不存在', outTradeNo);
        return res.send('<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[订单不存在]]></return_msg></xml>');
      }
      
      // 验证金额是否一致
      if (order.totalFee !== totalFee) {
        console.error('支付金额不一致', { orderFee: order.totalFee, payFee: totalFee });
        return res.send('<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[支付金额不一致]]></return_msg></xml>');
      }
      
      // 更新订单状态
      if (order.status === 'UNPAID') {
        order.status = 'PAID';
        order.paidAt = new Date();
        order.transactionId = transactionId;
        await order.save();
        
        // 处理订单后续业务逻辑
        // 例如：发送订单支付成功通知、更新库存等
        
        console.log('订单支付成功', { outTradeNo, transactionId });
      }
      
      // 返回成功响应
      return res.send('<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>');
    } else {
      console.error('支付失败', notifyData);
      return res.send('<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[支付结果异常]]></return_msg></xml>');
    }
  } catch (error) {
    console.error('处理支付通知异常', error);
    return res.send('<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[服务器异常]]></return_msg></xml>');
  }
}
```

## 5. 微信卡券

### 5.1 卡券接口概述

微信小程序支持卡券功能，允许用户在小程序中添加、查看和使用微信卡券。卡券接口主要包括：

1. **添加卡券**：用户将卡券添加到微信卡包
2. **查看卡券**：查看用户已添加的卡券
3. **核销卡券**：在小程序中使用卡券

使用卡券接口前，需要先在微信公众平台完成以下步骤：

1. 创建卡券并设置相关信息
2. 将小程序与公众号关联
3. 在公众号后台开通卡券功能
4. 设置卡券的适用小程序

### 5.2 添加卡券

小程序中通过调用`wx.addCard()`接口实现添加卡券功能：

```javascript
Page({
  // 添加卡券
  addCard() {
    // 显示加载提示
    wx.showLoading({ title: '获取卡券信息...' });
    
    // 从服务器获取卡券信息
    wx.request({
      url: 'https://your-server.com/api/cards',
      method: 'GET',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      success: res => {
        wx.hideLoading();
        
        if (res.data.success && res.data.cardList && res.data.cardList.length > 0) {
          // 调用添加卡券接口
          wx.addCard({
            cardList: res.data.cardList, // 需要添加的卡券列表
            success: result => {
              console.log('添加卡券成功', result);
              
              // 处理添加结果
              const addedCards = result.cardList;
              
              // 将添加结果上报服务器
              this.reportAddedCards(addedCards);
              
              wx.showToast({
                title: '添加卡券成功',
                icon: 'success'
              });
            },
            fail: err => {
              console.error('添加卡券失败', err);
              
              wx.showToast({
                title: '添加卡券失败',
                icon: 'none'
              });
            }
          });
        } else {
          wx.showToast({
            title: res.data.message || '暂无可用卡券',
            icon: 'none'
          });
        }
      },
      fail: err => {
        wx.hideLoading();
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
        console.error('获取卡券信息失败', err);
      }
    });
  },
  
  // 上报已添加的卡券
  reportAddedCards(addedCards) {
    wx.request({
      url: 'https://your-server.com/api/cards/report',
      method: 'POST',
      data: { addedCards },
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      }
    });
  }
});
```

**服务器端获取卡券信息示例（Node.js）：**

```javascript
const axios = require('axios');
const crypto = require('crypto');

async function getCardInfo(req, res) {
  try {
    // 获取access_token
    const accessToken = await getAccessToken();
    
    // 获取卡券列表
    const cardsResponse = await axios.get(
      `https://api.weixin.qq.com/card/batchget?access_token=${accessToken}`,
      {
        data: {
          offset: 0,
          count: 10,
          status_list: ['CARD_STATUS_VERIFY_OK', 'CARD_STATUS_DISPATCH']
        }
      }
    );
    
    if (cardsResponse.data.errcode === 0) {
      const cardList = [];
      
      // 处理卡券列表
      for (const cardInfo of cardsResponse.data.card_id_list) {
        // 获取卡券详情
        const cardDetailResponse = await axios.post(
          `https://api.weixin.qq.com/card/get?access_token=${accessToken}`,
          { card_id: cardInfo }
        );
        
        if (cardDetailResponse.data.errcode === 0) {
          // 获取卡券的扩展参数
          const ext = generateCardExt(cardInfo);
          
          cardList.push({
            cardId: cardInfo,
            cardExt: ext
          });
        }
      }
      
      res.json({
        success: true,
        cardList
      });
    } else {
      res.status(400).json({
        success: false,
        message: '获取卡券列表失败',
        error: cardsResponse.data
      });
    }
  } catch (error) {
    console.error('获取卡券信息错误', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
}

// 生成卡券扩展参数
function generateCardExt(cardId) {
  const appid = 'your-appid';
  const timestamp = Math.floor(Date.now() / 1000);
  const nonceStr = Math.random().toString(36).substr(2, 15);
  const apiTicket = 'your-api-ticket'; // 需要通过接口获取
  
  // 构建签名字符串
  const signParams = [
    apiTicket,
    cardId,
    timestamp,
    nonceStr
  ].sort().join('');
  
  // 计算签名
  const signature = crypto.createHash('sha1').update(signParams).digest('hex');
  
  // 构建cardExt对象
  const cardExt = {
    timestamp,
    nonce_str: nonceStr,
    signature,
    outer_str: 'optional-outer-string' // 可选，用于领取卡券后的自定义参数
  };
  
  // 返回JSON字符串
  return JSON.stringify(cardExt);
}
```

### 5.3 查看卡券

小程序中通过调用`wx.openCard()`接口实现查看卡券功能：

```javascript
Page({
  // 查看卡券
  openCard() {
    // 显示加载提示
    wx.showLoading({ title: '获取卡券信息...' });
    
    // 从服务器获取用户已添加的卡券信息
    wx.request({
      url: 'https://your-server.com/api/user/cards',
      method: 'GET',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      success: res => {
        wx.hideLoading();
        
        if (res.data.success && res.data.cardList && res.data.cardList.length > 0) {
          // 调用查看卡券接口
          wx.openCard({
            cardList: res.data.cardList, // 需要打开的卡券列表
            success: result => {
              console.log('查看卡券成功', result);
            },
            fail: err => {
              console.error('查看卡券失败', err);
              
              wx.showToast({
                title: '查看卡券失败',
                icon: 'none'
              });
            }
          });
        } else {
          wx.showToast({
            title: res.data.message || '暂无可用卡券',
            icon: 'none'
          });
        }
      },
      fail: err => {
        wx.hideLoading();
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
        console.error('获取卡券信息失败', err);
      }
    });
  }
});
```

### 5.4 核销卡券

在小程序中核销卡券通常需要结合微信支付或线下扫码等方式实现。以下是一个通过小程序扫码核销卡券的示例：

```javascript
Page({
  // 扫码核销卡券
  scanToVerifyCard() {
    // 调用扫码接口
    wx.scanCode({
      onlyFromCamera: true, // 只允许从相机扫码
      scanType: ['qrCode'], // 只扫描二维码
      success: res => {
        // 解析扫码结果
        const code = res.result;
        
        // 验证扫码结果格式
        if (!code) {
          wx.showToast({
            title: '无效的二维码',
            icon: 'none'
          });
          return;
        }
        
        // 显示加载提示
        wx.showLoading({ title: '核销中...' });
        
        // 发送核销请求到服务器
        wx.request({
          url: 'https://your-server.com/api/cards/verify',
          method: 'POST',
          data: { code },
          header: {
            'Authorization': `Bearer ${wx.getStorageSync('token')}`
          },
          success: result => {
            wx.hideLoading();
            
            if (result.data.success) {
              wx.showToast({
                title: '核销成功',
                icon: 'success'
              });
              
              // 更新页面数据
              this.refreshData();
            } else {
              wx.showToast({
                title: result.data.message || '核销失败',
                icon: 'none'
              });
            }
          },
          fail: err => {
            wx.hideLoading();
            wx.showToast({
              title: '网络错误，请重试',
              icon: 'none'
            });
            console.error('核销请求失败', err);
          }
        });
      },
      fail: err => {
        console.log('扫码取消或失败', err);
      }
    });
  },
  
  // 刷新页面数据
  refreshData() {
    // 重新加载页面数据
  }
});
```

**服务器端核销卡券示例（Node.js）：**

```javascript
const axios = require('axios');

async function verifyCard(req, res) {
  const { code } = req.body;
  
  try {
    // 获取access_token
    const accessToken = await getAccessToken();
    
    // 调用核销接口
    const verifyResponse = await axios.post(
      `https://api.weixin.qq.com/card/code/consume?access_token=${accessToken}`,
      {
        code,
        card_id: '' // 可选，卡券ID。如果不填写，将默认查询code对应的卡券信息
      }
    );
    
    if (verifyResponse.data.errcode === 0) {
      // 核销成功
      const cardInfo = verifyResponse.data.card;
      
      // 记录核销信息
      await CardVerification.create({
        code,
        cardId: cardInfo.card_id,
        userId: req.user.userId,
        verifiedAt: new Date()
      });
      
      res.json({
        success: true,
        message: '核销成功',
        cardInfo
      });
    } else {
      res.status(400).json({
        success: false,
        message: verifyResponse.data.errmsg || '核销失败',
        error: verifyResponse.data
      });
    }
  } catch (error) {
    console.error('核销卡券错误', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
}
```

## 6. 订阅消息

### 6.1 订阅消息概述

微信小程序订阅消息是一种允许开发者在特定场景下向用户发送服务通知的能力。与公众号模板消息不同，订阅消息需要用户主动订阅，且每次订阅后只能发送一条消息。

**订阅消息的主要特点：**

- **一次性订阅**：用户每次订阅后，开发者可发送一条消息
- **场景限制**：必须在特定场景下才能发起订阅
- **数量限制**：单个小程序可创建的模板数量有限
- **内容限制**：消息内容必须符合所选模板类目

**订阅消息的使用流程：**

1. 创建订阅消息模板
2. 获取用户订阅授权
3. 发送订阅消息

### 6.2 申请订阅消息模板

在使用订阅消息前，需要在微信公众平台申请订阅消息模板：

1. 登录[微信公众平台](https://mp.weixin.qq.com/)
2. 进入「功能」-「订阅消息」
3. 选择「添加模板」，选择模板类目
4. 设置模板标题、内容和关键词
5. 提交审核

审核通过后，可以获取到模板ID，用于后续的订阅和发送操作。

### 6.3 获取订阅权限

小程序通过调用`wx.requestSubscribeMessage()`接口获取用户的订阅授权：

```javascript
Page({
  // 请求订阅消息权限
  requestSubscribe() {
    // 订阅消息模板ID列表
    const tmplIds = ['your-template-id-1', 'your-template-id-2'];
    
    wx.requestSubscribeMessage({
      tmplIds,
      success: res => {
        console.log('订阅结果', res);
        
        // 处理订阅结果
        // res格式: { 'your-template-id-1': 'accept', 'your-template-id-2': 'reject' }
        
        const acceptedTmplIds = [];
        const rejectedTmplIds = [];
        
        tmplIds.forEach(tmplId => {
          if (res[tmplId] === 'accept') {
            acceptedTmplIds.push(tmplId);
          } else if (res[tmplId] === 'reject') {
            rejectedTmplIds.push(tmplId);
          }
        });
        
        // 将订阅结果上报服务器
        if (acceptedTmplIds.length > 0) {
          this.reportSubscription(acceptedTmplIds);
          
          wx.showToast({
            title: '订阅成功',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: '您拒绝了订阅',
            icon: 'none'
          });
        }
      },
      fail: err => {
        console.error('订阅请求失败', err);
        
        wx.showToast({
          title: '订阅请求失败',
          icon: 'none'
        });
      }
    });
  },
  
  // 上报订阅结果
  reportSubscription(tmplIds) {
    wx.request({
      url: 'https://your-server.com/api/subscribe',
      method: 'POST',
      data: { tmplIds },
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      }
    });
  }
});
```

### 6.4 发送订阅消息

获取用户订阅授权后，开发者可以在满足条件时向用户发送一条订阅消息：

**服务器端发送订阅消息示例（Node.js）：**

```javascript
const axios = require('axios');

async function sendSubscribeMessage(req, res) {
  const { openid, templateId, data, page } = req.body;
  
  try {
    // 获取access_token
    const accessToken = await getAccessToken();
    
    // 调用发送订阅消息接口
    const sendResponse = await axios.post(
      `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${accessToken}`,
      {
        touser: openid,
        template_id: templateId,
        page: page || 'pages/index/index', // 可选，点击消息后跳转的页面
        data, // 模板数据
        miniprogram_state: 'formal' // developer为开发版、trial为体验版、formal为正式版
      }
    );
    
    if (sendResponse.data.errcode === 0) {
      // 发送成功
      res.json({
        success: true,
        message: '发送成功'
      });
    } else {
      res.status(400).json({
        success: false,
        message: sendResponse.data.errmsg || '发送失败',
        error: sendResponse.data
      });
    }
  } catch (error) {
    console.error('发送订阅消息错误', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
}
```

**发送订阅消息的最佳实践：**

1. **选择合适的场景**：在用户完成支付、预约成功等关键节点请求订阅
2. **明确订阅用途**：在请求订阅时清晰说明消息用途和内容
3. **及时发送**：在触发条件满足后立即发送，不要延迟
4. **避免频繁请求**：不要在短时间内多次请求用户订阅
5. **优化跳转页面**：设置合适的跳转页面，提升用户体验

## 7. 微信运动

### 7.1 微信运动数据获取

微信小程序可以获取用户在微信运动中的步数数据，需要用户授权。获取步数数据的流程如下：

1. **获取用户授权**：
   - 使用`wx.authorize()`或`button`组件获取`scope.werun`权限

2. **获取微信运动数据**：
   - 调用`wx.getWeRunData()`接口获取加密的运动数据

3. **解密数据**：
   - 将加密数据发送到开发者服务器进行解密

**前端获取微信运动数据示例：**

```javascript
Page({
  // 获取微信运动数据
  getWeRunData() {
    // 检查是否已授权
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.werun']) {
          // 已授权，直接获取数据
          this.getRunData();
        } else {
          // 未授权，请求授权
          wx.authorize({
            scope: 'scope.werun',
            success: () => {
              // 授权成功，获取数据
              this.getRunData();
            },
            fail: err => {
              console.log('授权失败', err);
              
              // 引导用户通过按钮授权
              this.setData({ showAuthButton: true });
            }
          });
        }
      }
    });
  },
  
  // 通过按钮授权
  handleAuthByButton(e) {
    if (e.detail.errMsg === 'getUserInfo:ok') {
      // 授权成功，获取数据
      this.getRunData();
    }
  },
  
  // 获取运动数据
  getRunData() {
    wx.showLoading({ title: '获取运动数据...' });
    
    wx.getWeRunData({
      success: res => {
        // 获取加密的运动数据
        const encryptedData = res.encryptedData;
        const iv = res.iv;
        
        // 将加密数据发送到服务器解密
        wx.request({
          url: 'https://your-server.com/api/werun/decrypt',
          method: 'POST',
          data: {
            encryptedData,
            iv
          },
          header: {
            'Authorization': `Bearer ${wx.getStorageSync('token')}`
          },
          success: result => {
            wx.hideLoading();
            
            if (result.data.success) {
              // 获取解密后的步数数据
              const stepInfoList = result.data.stepInfoList;
              
              // 更新页面数据
              this.setData({ stepInfoList });
            } else {
              wx.showToast({
                title: result.data.message || '获取步数失败',
                icon: 'none'
              });
            }
          },
          fail: err => {
            wx.hideLoading();
            wx.showToast({
              title: '网络错误，请重试',
              icon: 'none'
            });
            console.error('请求解密失败', err);
          }
        });
      },
      fail: err => {
        wx.hideLoading();
        wx.showToast({
          title: '获取运动数据失败',
          icon: 'none'
        });
        console.error('获取运动数据失败', err);
      }
    });
  }
});
```