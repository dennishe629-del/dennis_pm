# Shopify POD Design Studio - 部署指南

## 概述

本指南将帮助您在 Shopify Partner 中创建和部署 POD Design Studio App，让商家可以在产品管理页面配置可编辑的设计区域。

## 前置条件

1. **Shopify Partner 账号**: https://partners.shopify.com
2. **Node.js**: v18.20 或 v20.10+
3. **Shopify CLI**: 最新版本

## 第一步：创建 App

### 1.1 登录 Shopify Partner

```bash
# 安装 Shopify CLI（如果还没有）
npm install -g @shopify/cli @shopify/theme

# 登录 Shopify Partner
shopify auth login
```

### 1.2 初始化项目

```bash
# 创建新的 Shopify App
npm init @shopify/app@latest -- --template remix

# 或者使用本项目的代码
mkdir pod-design-studio
cd pod-design-studio
```

### 1.3 复制项目文件

将本项目的所有文件复制到您的 App 目录中。

## 第二步：配置 App

### 2.1 更新 shopify.app.toml

编辑 `shopify.app.toml`，填入您的信息：

```toml
client_id = "YOUR_CLIENT_ID_HERE"  # 从 Partner Dashboard 获取
name = "POD Design Studio"
application_url = "https://your-ngrok-or-host-url.com"
```

### 2.2 创建 App 在 Partner Dashboard

1. 访问 https://partners.shopify.com
2. 点击 "Apps" → "Create app"
3. 选择 "Create app manually"
4. 填写 App 名称: "POD Design Studio"
5. 获取 Client ID 和 Client Secret
6. 配置 App URL 和 Allowed redirection URL(s)

### 2.3 配置 OAuth Scopes

确保您的 App 有以下权限：

```
read_products, write_products
read_metaobject_definitions, write_metaobject_definitions
read_metaobjects, write_metaobjects
read_publications, write_publications
```

## 第三步：本地开发

### 3.1 安装依赖

```bash
npm install
```

### 3.2 配置数据库

```bash
# 生成 Prisma Client
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev
```

### 3.3 启动开发服务器

```bash
npm run dev
```

这将：
- 启动 Remix 开发服务器
- 创建 ngrok 隧道
- 连接您的开发店铺

## 第四步：配置 Admin Extension

### 4.1 注册扩展点

您的 `shopify.app.toml` 中已经配置了以下扩展：

```toml
[[extensions]]
type = "ui_extension"
name = "Product Design Configuration"
handle = "product-design-config"

  [[extensions.targeting]]
  module = "./extensions/product-configuration-block/src/index.jsx"
  target = "admin.product-details.block.render"
```

### 4.2 部署扩展

```bash
npm run deploy
```

## 第五步：在店铺中使用

### 5.1 安装 App

1. 访问开发店铺的 App 页面
2. 点击 "Install app"
3. 授权所需权限

### 5.2 配置产品

1. 进入 Shopify Admin → Products
2. 选择一个衣服产品
3. 在产品编辑页面，找到 "POD Design Studio" 区块
4. 点击 "Enable Design Studio"
5. 配置印刷区域：
   - 设置位置和尺寸
   - 配置允许的颜色
   - 设置尺寸选项
   - 配置定制费用

### 5.3 添加 Storefront Block

1. 进入 Online Store → Themes → Customize
2. 导航到产品页面
3. 在 Product information 部分添加 "POD Design Studio" block
4. 保存主题

## 第六步：测试

### 6.1 商家后台测试

1. 打开产品编辑页面
2. 确认 POD Design Studio 区块显示正常
3. 配置印刷区域并保存
4. 检查 Metafield 是否正确保存

### 6.2 消费者端测试

1. 访问店铺前台的产品页面
2. 确认设计器显示正常
3. 测试以下功能：
   - 上传图片
   - 添加文字
   - 调整位置和大小
   - 选择颜色和尺寸
   - 添加到购物车

## 第七步：生产部署

### 7.1 准备生产环境

1. 设置生产数据库（PostgreSQL）
2. 配置环境变量
3. 部署到托管服务（如 Fly.io, Heroku, Vercel）

### 7.2 更新 App URL

```bash
# 更新 shopify.app.toml
application_url = "https://your-production-url.com"

# 重新部署
npm run deploy
```

### 7.3 提交 App 审核（可选）

如果想在 Shopify App Store 发布：

1. 在 Partner Dashboard 点击 "Distribute"
2. 选择 "Shopify App Store"
3. 填写 App 详情
4. 提交审核

## 技术架构

```
┌─────────────────────────────────────────────────────────────┐
│                    Shopify Admin                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Product Edit Page                                  │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │  POD Design Studio Block (UI Extension)     │   │   │
│  │  │  - Enable/disable design                    │   │   │
│  │  │  - Configure print areas                    │   │   │
│  │  │  - Set colors & sizes                       │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Remix App Server                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Admin Routes                                       │   │
│  │  - /app/products                                    │   │
│  │  - /app/products/:id (Design Editor)                │   │
│  │                                                     │   │
│  │  API Routes                                         │   │
│  │  - /api/products/:id/design-area                    │   │
│  │  - /api/generate-print-files                        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Shopify Storefront                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Product Page                                       │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │  POD Design Studio Block (Theme Extension)  │   │   │
│  │  │  - Canvas-based design tool                 │   │   │
│  │  │  - Image upload & text editing              │   │   │
│  │  │  - Layer management                         │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 数据流

```
1. 商家配置设计区域
   Admin UI → Metafield API → Product Metafield

2. 消费者设计产品
   Storefront → Canvas API → Design Data

3. 添加到购物车
   Design Data → Cart API → Line Item Properties

4. 生成印刷文件
   Webhook → Print File Generator → Factory API
```

## 关键文件说明

| 文件 | 说明 |
|------|------|
| `shopify.app.toml` | App 配置文件 |
| `extensions/product-configuration-block/` | Admin 产品页面区块 |
| `extensions/storefront-designer/` | 店铺前台设计器 |
| `app/routes/app.products.$id.tsx` | 产品设计编辑器页面 |
| `app/shopify.server.ts` | Shopify App 配置 |

## 常见问题

### Q: 扩展没有显示在产品页面？
A: 确保：
1. App 已正确安装
2. `shopify.app.toml` 中的 target 正确
3. 已运行 `npm run deploy`

### Q: 设计器没有加载？
A: 检查：
1. 产品 Metafield 是否有配置
2. 浏览器控制台是否有错误
3. 主题是否正确添加了 block

### Q: 如何支持更多产品类型？
A: 修改 `getDefaultConfig()` 函数，添加新的产品类型配置。

## 支持

如有问题，请参考：
- [Shopify App Development Docs](https://shopify.dev/docs/apps)
- [Shopify UI Extensions](https://shopify.dev/docs/api/admin-extensions)
- [Shopify Theme Extensions](https://shopify.dev/docs/apps/online-store/theme-app-extensions)
