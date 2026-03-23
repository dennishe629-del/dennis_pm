# Shopify POD Design Studio App

让商家在 Shopify 后台为衣服产品配置可编辑的设计区域，消费者可以在前台自定义图案。

## 技术栈

- **框架**: Remix + Shopify App Bridge
- **UI**: Polaris (Shopify Design System)
- **数据库**: Prisma + SQLite (开发) / PostgreSQL (生产)
- **存储**: Shopify Metafields (产品数据)

## 项目结构

```
shopify-app/
├── app/
│   ├── routes/                    # Remix 路由
│   │   ├── app._index.tsx         # App 首页
│   │   ├── app.products.tsx       # 产品列表
│   │   ├── app.products.$id.tsx   # 产品设计器
│   │   └── api.products.$id.design-area.ts  # API
│   ├── extensions/                # Shopify 扩展
│   │   └── product-configuration/ # 产品页面区块
│   ├── models/                    # 数据模型
│   ├── services/                  # 业务逻辑
│   └── shopify.server.ts          # Shopify 配置
├── prisma/
│   └── schema.prisma              # 数据库模型
├── extensions/                    # Shopify CLI 扩展
│   └── product-configuration-block/
├── package.json
└── shopify.app.toml              # App 配置
```

## 核心功能

1. **Admin 后台**: 在产品编辑页面添加设计区域配置
2. **Storefront**: 消费者设计器（通过 App Embed 或 Theme App Extension）
3. **数据存储**: 使用 Shopify Metafields 存储设计区域配置

## 开发流程

### 1. 初始化项目

```bash
npm init @shopify/app@latest -- --template remix
```

### 2. 注册扩展点

在 `shopify.app.toml` 中配置 Admin Block 扩展。

### 3. 部署

```bash
npm run deploy
```
