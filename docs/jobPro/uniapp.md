---
title: 打包发布全流程（iOS + Android）
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## 打包发布全流程（iOS + Android）

加群联系作者vx：xiaoda0423

仓库地址：<https://webvueblog.github.io/JavaPlusDoc/>

<https://1024bat.cn/>

<https://github.com/webVueBlog/fastapi_plus>

<https://webvueblog.github.io/JavaPlusDoc/>




## 一、项目准备

1.  **安装 HBuilderX**  
    下载并安装最新版 HBuilderX（内置 uni-app 打包能力）：  
    <https://www.dcloud.io/hbuilderx.html>

1.  **配置 `manifest.json`**  
    打开项目根目录下 `manifest.json`，在「App–iOS」「App–Android」栏目中填写：

    -   **App 名称、包名**（如 `com.example.myapp`）
    -   **应用版本号**（`versionName` / `versionCode`）
    -   **应用图标**、**启动图**
    -   **权限声明**（定位、相机、网络等）
    -   **入口页面** 与 **网络白名单**

* * *

## 二、Android 打包与发布

### 1. 环境准备

-   JDK 8（推荐）+ Android SDK + Android NDK（某些插件需要）
-   Android Studio（可选，用于调试原生插件）

### 2. 使用 HBuilderX 一键打包

1.  打开 HBuilderX，右键项目名 → **发行** → **原生App-云打包（Android）**

1.  填写 `Keystore` 信息：

    -   **证书别名**、**Keystore 路径**、**密码**

1.  选择 **Debug** 或 **Release** 打包

1.  提交打包后，DCloud 云端会返回一个 `.apk` 或 `.aab` 下载链接

> **Tips**：`.aab` 包支持 Google Play 动态交付，推荐使用。

### 3. 本地离线打包（可选）

```
# 安装 cli 打包工具
npm install -g @dcloudio/uni-app

# 进入项目目录
cd my-uniapp-project

# 构建发行包
npm run build:app-plus

# 打开 Android Studio 导入 “unpackage/android/gradle” 目录
# 在 Android Studio 中签名打包：Build → Generate Signed Bundle / APK
```

### 4. 发布到 Google Play

1.  登录 Google Play Console
1.  新建应用 → 上传 `.aab`
1.  填写应用详情（描述、截图、分类、隐私政策等）
1.  设置分发国家/地区、价格、内容分级
1.  执行审核并发布

* * *

## 三、iOS 打包与发布

### 1. 环境准备

-   macOS + Xcode（最新版）
-   Apple 开发者账号（Individual 或 Company）
-   配置好 Bundle ID，与 `manifest.json` 中一致

### 2. 使用 HBuilderX 云打包（白名单内需要设备 UDID）

1.  打开 HBuilderX，右键项目名 → **发行** → **原生App-云打包（iOS）**

1.  填写 Apple 开发者账号凭证

1.  选择包类型：

    -   **Development**（调试包，需要把设备 UDID 加到 Provisioning Profile）
    -   **Ad Hoc**（内测包，可分发给绑定的 UDID 设备）
    -   **App Store**（正式包，用于提交审核）

1.  提交后下载 `.ipa` 文件

### 3. 本地离线打包（进阶）

```
# 构建发行包
npm run build:app-plus

# 在 Xcode 中打开 “unpackage/ios/…/UnityApp.xcworkspace”
# 选择签名证书和对应的 Provisioning Profile
# Product → Archive 打包
# Archive 完成后通过 Organizer 上传到 App Store Connect
```

### 4. 发布到 App Store

1.  登录 App Store Connect → My Apps → + → New App

1.  填写 App 信息（名称、SKU、Bundle ID）

1.  上传 `.ipa`（可用 Xcode 的 Organizer 或 `altool` 命令行）

    ```
    xcrun altool --upload-app -f MyApp.ipa -u APPLE_ID -p APP_SPECIFIC_PASSWORD
    ```

1.  填写版本说明、截图、关键词、隐私政策等

1.  提交审核 → 发布

* * *

## 四、持续集成 & 自动发布（选做）

-   **GitHub Actions / GitLab CI**：结合 uni-app CLI，自动执行 `npm run build:app-plus`、签名、上传云打包 API
-   **钉钉/邮件通知**：打包完成后推送通知给 QA 进行验收

* * *

## 五、常见注意事项

1.  **包名与 Bundle ID** 一旦发布后不可更改，否则用户升级会失败。

1.  **版本号与版本码**

    -   Android：`versionName`（展示给用户）+ `versionCode`（内部比较）
    -   iOS：`CFBundleShortVersionString` + `CFBundleVersion`（内部）

1.  **图标和启动图**

    -   iOS：需要多分辨率（@1x/@2x/@3x），HBuilderX 会自动生成；
    -   Android：Adaptive Icons（前景+背景图）

1.  **权限合规**：按需申请权限，并在 App Store / Google Play 上填写隐私条款。

1.  **网络安全**：Android 9+ 需要 HTTPS，或在 `AndroidManifest.xml` 配置 `usesCleartextTraffic`。


## 一、准备工作

1.  **安装工具**

    -   HBuilderX（推荐最新版）
    -   Node.js 环境（如需 CLI 打包）
    -   Xcode（MacOS，用于 iOS 真机调试与 App Store 上传）
    -   Android Studio + Android SDK

1.  **配置证书与签名**

    -   **iOS**：在 Apple Developer 上创建 App ID、下载并安装 `*.p12` 开发/生产证书和对应的 Provisioning Profile；
    -   **Android**：准备好用于签名的 keystore（`.keystore` 或 `.jks`），记住 alias、密码等信息。

1.  **项目设置**

    -   编辑项目根目录下的 `manifest.json` → **App-PLUS** 节点：

        -   填写 App 名称、包名（Bundle Identifier / ApplicationId）、版本号、图标、启动图；

        -   iOS & Android 各自签名配置可以预先填入：

            ```
            "app-plus": {
              "distribute": {
                "android": {
                  "keystore": "release.jks",
                  "storePassword": "****",
                  "alias": "myalias",
                  "password": "****"
                },
                "ios": {
                  "certificateP12": "cert.p12",
                  "certificatePassword": "****",
                  "provision": "profile.mobileprovision"
                }
              }
            }
            ```

* * *

## 二、本地打包（HBuilderX / CLI）

### 1. HBuilderX 一键打包

-   打开 HBuilderX → 菜单【发行】→【原生App-云打包】→ 选择 **Android(iOS)** → 上传签名配置 → 点击 **立即打包**。
-   打包成功后，可在 “打包管理” 中下载 `.apk`/`.aab` 或 `.ipa` 文件。

### 2. CLI 本地打包

*（适合脚本化或不想依赖云打包时）*

```
# 进入项目目录
cd your-uni-app

# 安装依赖（首次）
npm install

# 构建 App-PLUS
npm run build:app-plus
# 或者（使用 vue-cli-plugin-uni）
# vue-cli-service uni-build --platform app-plus

# 打开原生工程
# Android → dist/build/app-plus/android
# iOS     → dist/build/app-plus/ios
```

* * *

## 三、原生项目导出与签名

### 1. Android 原生工程（Android Studio）

1.  在 HBuilderX 或 CLI 构建完后，进入 `dist/build/app-plus/android`，用 Android Studio 打开。

1.  **配置签名**：

    -   在 `app/build.gradle` 的 `signingConfigs` 里填入 keystore 信息；
    -   在 `buildTypes` 里引用对应的签名配置（release）。

1.  **生成 APK/AAB**：

    -   菜单【Build】→【Generate Signed Bundle/APK】→ 选择 **APK** 或 **Android App Bundle (AAB)** → 选择签名 → Finish。

### 2. iOS 原生工程（Xcode）

1.  在 macOS 上，用 Xcode 打开 `dist/build/app-plus/ios/*.xcworkspace`（或 `.xcodeproj`）。

1.  **配置签名**：

    -   在 **Targets → Signing & Capabilities** 中，选择对应的 Team、Provisioning Profile；
    -   确认 Bundle Identifier 与 Apple Developer 上一致。

1.  **打包导出**：

    -   Product → Archive → Archive 完成后在 Organizer 中点击 **Distribute App** → 选择 **App Store Connect** → 上传到 TestFlight/App Store。

* * *

## 四、应用发布

### 1. Android → Google Play

1.  注册并登录 Google Play Console；
1.  创建新应用，填写应用信息、隐私政策、截图；
1.  上传 **AAB**（推荐）或 **APK**；
1.  设置定价与分发国家/地区；
1.  提交审核，审核通过后即可上架。

### 2. iOS → App Store

1.  在 App Store Connect 中创建新 App（Bundle ID 已注册）；
1.  填写应用信息、截图、版本说明；
1.  等待 TestFlight + Apple 审核；
1.  审核通过后手动或自动发布至 App Store。

* * *

## 五、常见注意事项

-   **版本号管理**：Android `versionCode` 必须递增；iOS `CFBundleVersion` 与 `CFBundleShortVersionString` 规律一致。
-   **多渠道包**（Android）：可在 `build.gradle` 中用 `productFlavors` 做渠道差异化打包。
-   **自动化流水线**：可结合 Jenkins/GitLab CI 调用 CLI 脚本实现全量自动打包与签名。
-   **测试环节**：建议先走灰度/TestFlight，再全量发布，及时监控崩溃与关键指标。


> 以 **HBuilderX 3.x** + **uni-app CLI（vite）** 为例，分为  
> **准备 → 打包 → 签名 → 测试 → 商店发布 / 私有分发**，两端各自有差异。

* * *

## 1. 通用准备

| 动作             | 关键点                                                                                  |
| -------------- | ------------------------------------------------------------------------------------ |
| **① 升级环境**     | HBuilderX ≥ 3.8 / Node ≥ 16 / JDK 11 / Android Studio ≥ Arctic Fox                   |
| **② 清理依赖**     | `npm run clean && npm install --legacy-peer-deps`                                    |
| **③ 配置 appId** | `manifest.json` → `AppID`（唯一），同时填公司包名（如 `com.example.app`）                           |
| **④ 资源规范**     | 512×512 icon、1024×1024 iOS App Store icon、启动图按官方模板自适配                                |
| **⑤ 版本号**      | 遵循 **Android versionCode 递增整数 / iOS CFBundleVersion**；`package.json` & `manifest` 同步 |

* * *

## 2. Android 端

### 2.1 打包方式

| 方式                                         | 适用              | 步骤概要                                                                                                                            |
| ------------------------------------------ | --------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **① HBuilderX 云打包** (最快)                   | 小团队 / 无原生拓展     | ① 登录 DCloud Dev 账号 → ② 勾选“发行” → ③ 上传 keystore → ④ 点击“云端打包”                                                                      |
| **② uni-app CLI → Android Studio** (可深度定制) | 需改原生插件 / 需要 AAB | `bash<br>npm run build:app-android<br>cd platforms/android<br>./gradlew assembleRelease # APK<br>./gradlew bundleRelease # AAB` |

### 2.2 签名 & 出包

```
# 生成 keystore（若没有）
keytool -genkey -v -keystore my-release.jks -alias mykey \
  -keyalg RSA -keysize 2048 -validity 36500
```

1.  **HBuilderX**：菜单「发行 → 原生 App-Android」→ 选择 keystore、输入密码
1.  **Gradle**：在 `android/gradle.properties` 填 `MY_KEYSTORE_PASSWORD` …，`build.gradle` 内 `signingConfigs` 引用环境变量。
1.  打完包得 **AAB** (Google Play 强推)；国内渠道仍可用 APK。

### 2.3 发布

| 渠道                   | 步骤                                                                |
| -------------------- | ----------------------------------------------------------------- |
| **Google Play**      | ① 创建应用 → ② 上传 .aab → ③ 填隐私政策 / 内容分级 → ④ 上线 Production/Closed Test |
| **各大商店** (华为/小米/魅族…) | 需 APK；注意包名一致、签名一致，版本号严格递增                                         |
| **企业私发**             | 内网蒲公英 / Fir / 自建对象存储 + 二维码                                        |

* * *

## 3. iOS 端

### 3.1 打包方式

| 方式                      | 优缺点                                       |
| ----------------------- | ----------------------------------------- |
| **HBuilderX 云打包（推荐）**   | 免 Mac，自动生成 .ipa；不足：原生插件受限、需上传 p12+描述文件    |
| **uni-app CLI → Xcode** | 最灵活，支持最新 iOS SDK、Swift 插件，需 macOS & Xcode |

### 3.2 证书与描述文件

1.  **Apple Developer 账号**（99 USD/年，公司或个人）

1.  在 **Apple Developer → Certificates, Identifiers & Profiles**：

    -   新建 **App ID** (`com.example.app`)
    -   生成 **Distribution Certificate**（.cer → 导出 .p12）
    -   创建 **Provisioning Profile**（App Store / Ad-Hoc / In-House）

> ⚠️ **Bundle Identifier & TeamID 必须与 manifest.json 完全一致**。

### 3.3 打包流程 (Xcode)

```
npm run build:app-ios
open platforms/ios/*.xcworkspace   # 打开 Xcode
# Xcode ▸ Product ▸ Archive ▸ Distribute App ▸ App Store / Ad-Hoc
```

生成 `.ipa` → **Transporter** 上传到 **App Store Connect**。

### 3.4 测试 & 发布

| 流程               | 关键动作                                                     |
| ---------------- | -------------------------------------------------------- |
| **TestFlight**   | Archive → Upload → “Internal / External Testers” → 发测试链接 |
| **App Store 正式** | 填写元数据 + 隐私合规表单 + 截图（6.7", 5.5" 等）→ 提交审核（~24 h）           |

* * *

## 4. 自动化 & 多渠道

| 目标           | 方案                                                                                                                                                                                                  |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **CI/CD**    | GitHub Actions / Jenkins Pipeline：① 安装 `node, java, android-sdk`② `npm ci && npm run build:app-android`③ `gradlew bundleRelease`④ `gcloud firebase appdistribution:distribute` or `fastlane supply` |
| **Fastlane** | `fastlane deliver` 上传 iOS`fastlane supply` 上传 Play Store                                                                                                                                            |
| **多商店自动投递**  | 蒲公英 API / Fastlane plugin-appcenter / 酷安 OpenAPI                                                                                                                                                    |

* * *

## 5. 性能 & 体积优化

| 方向       | 技巧                                                                   |
| -------- | -------------------------------------------------------------------- |
| **代码裁剪** | `vite build --minify terser` + Babel preset‐env `useBuiltIns: usage` |
| **动态加载** | 分包 + `uni.loadSubPackage`，首屏 < 1 MB                                  |
| **资源压缩** | pngquant / webp / SVG                                                |
| **原生权限** | 按需在 `manifest` 勾选，iOS 需 Info.plist 描述                                |
| **调试**   | 真机 `console.log` 用 **DCloud Devtools**；发布关闭 `vconsole`               |

* * *

## 6. 常见坑

| 症状                                                | 解决方案                                                                    |
| ------------------------------------------------- | ----------------------------------------------------------------------- |
| iOS App Store “ITMS-90473: Invalid Swift Support” | Xcode → Build Settings → Always Embed Swift Standard Libraries = **No** |
| Android 启动闪退                                      | 检查 `minSdkVersion` ≤ 手机系统；64 bit 要求开启 `abiFilters arm64-v8a`            |
| App 内更新失败                                         | Android 用 **manifest upgrade** 插件；iOS 只能跳转 App Store                    |

* * *

### ✅ 结论

-   **云打包**（DCloud）最快上线；**CLI+原生 IDE** 灵活可扩展。
-   **签名文件** & **版本号** = 两端发布核心；务必做好密钥备份。
-   生产前 3 件套：**崩溃监控**（Bugly/Sentry）、**灰度发布**（TestFlight/内测包）、**埋点**（友盟/自研）。


* * *

## 🧱 一、准备工作（通用）

1.  **安装 HBuilderX（>= 3.1.0）**

    > 官网下载：<https://www.dcloud.io/hbuilderx.html>

1.  **使用 HBuilderX 打开你的 UniApp 项目**

1.  **登录 DCloud 账号（HBuilderX 顶部菜单 → 登录）**

* * *

## 📦 二、安卓 APK 打包与发布流程

### ✅ 方法一：使用 HBuilderX 云打包（推荐）

1.  在 HBuilderX 中，点击顶部菜单：  
    `发行` → `原生App-云打包`

1.  选择平台：Android

1.  填写应用信息（第一次需要填 App 名称、包名、图标等）

1.  点击【开始打包】

1.  打包完成后，会生成 `.apk` 文件，可以用于：

    -   测试安装
    -   上传到应用商店（如 华为、小米、应用宝）

* * *

## 🍏 三、iOS 打包与发布流程（需 Apple 开发者账号）

### ⚠ 前提：

-   你必须拥有 **苹果开发者账号（$99/年）**
-   必须准备 `.p12` 和 `.mobileprovision` 文件（签名证书）

* * *

### ✅ 方法一：使用 HBuilderX 云打包 iOS

1.  在 HBuilderX → `发行` → `原生App-云打包`

1.  选择平台：iOS

1.  上传 iOS 的签名文件（首次配置）

    -   `.p12` 是证书文件（使用钥匙串导出）
    -   `.mobileprovision` 是描述文件（在 Apple Developer 网站下载）

1.  开始打包，等待几分钟

1.  生成 `.ipa` 文件（你可以用 iOS 真机测试或提交到 App Store）

* * *

### ✅ 提交到 App Store 步骤（选做）

1.  下载 `.ipa` 文件后，使用 [Transporter](https://apps.apple.com/us/app/transporter/id1450874784) 上传至 App Store Connect
1.  登录 [App Store Connect](https://appstoreconnect.apple.com/) 完善 App 信息
1.  提交审核，等待苹果通过（1～7天）

* * *

## ✅ 四、注意事项

| 问题           | 说明                                      |
| ------------ | --------------------------------------- |
| **安卓不能安装**   | 检查是否勾选了 `自定义调试基座` 或 `64 位兼容`            |
| **iOS 拒绝审核** | 注意权限说明、隐私协议、版本号递增等                      |
| **调试与真机测试**  | 安卓可直接生成 `debug` 包；iOS 建议用 TestFlight 测试 |

* * *

## 🚀 小结

| 操作      | 安卓         | iOS                          |
| ------- | ---------- | ---------------------------- |
| 编译方式    | 云打包 / 本地打包 | 只能云打包                        |
| 需要开发者账号 | 否          | ✅ 必须                         |
| 测试方式    | 安装 `.apk`  | `.ipa` + TestFlight 或签名后手动安装 |
| 上架流程    | 各大安卓市场     | App Store 审核发布               |

* * *

