# Shopify POD Design Studio - 产品需求文档 (PRD)

**版本**: v1.0  
**日期**: 2026-03-18  
**状态**: 待开发  
**负责人**: [产品经理姓名]  

---

## 1. 文档信息

### 1.1 版本历史

| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|---------|
| v1.0 | 2026-03-18 | [PM] | 初始版本 |

### 1.2 相关文档

| 文档名称 | 路径 | 说明 |
|---------|------|------|
| 前端 Demo | `demo-v3/index.html` | 消费者端设计器参考 |
| 代码实现 | `shopify-app/` | 完整代码参考 |
| 部署指南 | `shopify-app/DEPLOYMENT_GUIDE.md` | 技术部署文档 |

---

## 2. 项目概述

### 2.1 背景

商家希望在 Shopify 店铺中提供按需印刷（POD）定制服务，让消费者可以在购买衣服产品时自主设计图案。

### 2.2 目标

为 Shopify 商家提供一个 App，使其能够：
1. 在产品管理后台配置可编辑的设计区域
2. 让消费者在店铺前台使用可视化设计器
3. 将设计数据与订单一起保存，用于后续生产

### 2.3 用户角色

| 角色 | 描述 | 核心需求 |
|------|------|---------|
| **商家** | Shopify 店铺管理员 | 配置产品、管理设计区域、查看定制订单 |
| **消费者** | 店铺访客 | 上传图片、添加文字、预览效果、下单购买 |

---

## 3. 功能需求

### 3.1 功能清单

#### 3.1.1 Admin 后台功能（商家使用）

| 模块 | 功能 | 优先级 | 验收标准 |
|------|------|--------|---------|
| **产品区块** | 在产品编辑页显示 POD 配置卡片 | P0 | 区块正常显示，可展开/收起 |
| **启用开关** | 一键启用/禁用产品的设计功能 | P0 | 开关状态保存，实时生效 |
| **印刷区域配置** | 配置设计区域的位置和尺寸 | P0 | 支持 X/Y/Width/Height 设置 |
| **颜色管理** | 配置可选的衣服颜色 | P0 | 支持添加/删除/启用颜色 |
| **尺寸管理** | 配置可选的衣服尺寸 | P0 | 支持添加/删除尺寸选项 |
| **定价设置** | 设置定制额外费用 | P0 | 支持设置固定附加费 |
| **预览功能** | 预览消费者看到的设计器 | P1 | 弹窗显示设计器界面 |
| **批量配置** | 支持复制配置到其他产品 | P2 | 一键复制配置 |

#### 3.1.2 Storefront 前台功能（消费者使用）

| 模块 | 功能 | 优先级 | 验收标准 |
|------|------|--------|---------|
| **设计器展示** | 在产品页显示设计器区块 | P0 | 只在启用设计功能的产品显示 |
| **图片上传** | 支持上传 PNG/JPG/SVG | P0 | 支持拖拽上传，最大 20MB |
| **图片编辑** | 移动、缩放、旋转图片 | P0 | 操作流畅，有视觉反馈 |
| **文字添加** | 添加自定义文字 | P0 | 支持字体、大小、颜色、样式 |
| **文字编辑** | 移动、旋转文字 | P0 | 操作同图片 |
| **图层管理** | 显示所有设计元素列表 | P1 | 可调整层级、删除元素 |
| **撤销重做** | 支持操作历史 | P1 | 至少支持 20 步历史 |
| **颜色选择** | 选择衣服颜色 | P0 | 显示商家配置的颜色选项 |
| **尺寸选择** | 选择衣服尺寸 | P0 | 显示商家配置的尺寸选项 |
| **数量选择** | 选择购买数量 | P0 | 支持增减按钮和直接输入 |
| **价格显示** | 实时显示总价 | P0 | 基础价格 + 定制费用 |
| **预览功能** | 预览最终效果 | P1 | 弹窗显示高清预览 |
| **加入购物车** | 将设计保存到购物车 | P0 | 设计数据正确保存 |

### 3.2 功能详细说明

#### 3.2.1 Admin 产品配置区块

**入口**: Shopify Admin → Products → [产品] → POD Design Studio 区块

**界面布局**:
```
┌─────────────────────────────────────────┐
│  POD Design Studio           [启用开关]  │
├─────────────────────────────────────────┤
│  状态: ● Active  |  2 印刷区域已配置      │
│                                         │
│  ┌─────────┬─────────┬─────────┐       │
│  │ 2 区域   │ 5 颜色   │ $5.00   │       │
│  │ 印刷区域 │ 可选    │ 定制费  │       │
│  └─────────┴─────────┴─────────┘       │
│                                         │
│  [编辑配置] [预览] [禁用]               │
└─────────────────────────────────────────┘
```

**编辑配置页面**:
- **Tab 1 - 基础设置**: 启用开关、产品类型、生产时间
- **Tab 2 - 印刷区域**: 可视化配置印刷区域位置和尺寸
- **Tab 3 - 颜色尺寸**: 管理可选颜色和尺寸
- **Tab 4 - 定价**: 设置定制附加费

#### 3.2.2 消费者设计器

**入口**: 产品详情页 → Customize Your Design

**界面布局**:
```
┌─────────────────────────────────────────────────────────────┐
│  Customize Your Design                                      │
│  Upload your artwork or add text to create a unique design  │
├──────────────────────────────┬──────────────────────────────┤
│                              │  [Upload] [Text] [Layers]    │
│      ┌──────────────┐        │  ─────────────────────────   │
│      │              │        │                              │
│      │   👕         │        │  ┌──────────────────────┐   │
│      │  ┌────────┐  │        │  │   拖拽上传图片        │   │
│      │  │ Design │  │        │  │   或点击浏览          │   │
│      │  │  Area  │  │        │  └──────────────────────┘   │
│      │  └────────┘  │        │                              │
│      │              │        │  Print Specs:                │
│      └──────────────┘        │  • Min 150 DPI               │
│                              │  • Max 20MB                  │
│  [Select] [Move] [Undo] [🗑️] │  • PNG 300dpi + PDF          │
│                              │                              │
├──────────────────────────────┴──────────────────────────────┤
│  Color: [⚫] [⚪] [🔴] [🔵]                                  │
│  Size:  [XS] [S] [M] [L] [XL] [2XL]                         │
│  Qty:   [-] [ 1 ] [+]                                       │
│  ─────────────────────────────────────────────────────────  │
│  Base: $24.99  |  Customization: $5.00  |  Total: $29.99   │
│                                                             │
│              [    Add to Cart - $29.99    ]                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. 技术方案

### 4.1 技术架构

```
┌─────────────────────────────────────────────────────────────┐
│                    Shopify Platform                          │
├─────────────────────────────────────────────────────────────┤
│  Admin UI Extension          │  Theme App Extension         │
│  (产品配置区块)               │  (消费者设计器)               │
├──────────────────────────────┼──────────────────────────────┤
│  Target:                     │  Block:                      │
│  admin.product-details.block │  @app/pod-design-studio      │
│  .render                     │                              │
└──────────────────────────────┴──────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Remix App Server                          │
├─────────────────────────────────────────────────────────────┤
│  Routes:                                                    │
│  • /app/products              - 产品列表                     │
│  • /app/products/:id          - 设计编辑器                   │
│  • /api/products/:id/design   - 配置 API                     │
│  • /api/generate-print-files  - 生成印刷文件                 │
├─────────────────────────────────────────────────────────────┤
│  Database: Prisma + PostgreSQL                              │
│  Storage: Shopify Metafields (产品配置)                      │
│           AWS S3 (印刷文件存储)                              │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 数据模型

#### 产品配置 (存储在 Shopify Metafield)

```json
{
  "namespace": "pod_design",
  "key": "configuration",
  "type": "json",
  "value": {
    "enabled": true,
    "productType": "tshirt",
    "baseWidth": 500,
    "baseHeight": 600,
    "printAreas": [
      {
        "id": "front",
        "name": "Front Chest",
        "enabled": true,
        "x": 150,
        "y": 80,
        "width": 200,
        "height": 250,
        "minDPI": 150,
        "maxFileSize": 20971520,
        "allowedTypes": ["image", "text"]
      }
    ],
    "colors": [
      { "name": "Black", "hex": "#1a1a2e", "available": true },
      { "name": "White", "hex": "#ffffff", "available": true }
    ],
    "sizes": ["XS", "S", "M", "L", "XL", "2XL"],
    "customizationFee": 5.00,
    "minOrderQuantity": 1,
    "maxOrderQuantity": 100,
    "productionTime": "2-4 days"
  }
}
```

#### 购物车设计数据 (Line Item Properties)

```json
{
  "_pod_design_data": {
    "productId": "gid://shopify/Product/123456",
    "color": "#1a1a2e",
    "size": "M",
    "elements": [
      {
        "type": "image",
        "x": 200,
        "y": 150,
        "width": 150,
        "height": 150,
        "rotation": 0,
        "filename": "my-design.png"
      },
      {
        "type": "text",
        "text": "Hello World",
        "x": 250,
        "y": 300,
        "fontFamily": "Arial",
        "fontSize": 24,
        "color": "#000000",
        "rotation": 0
      }
    ]
  },
  "_pod_design_preview": "data:image/png;base64,...",
  "_pod_print_files": {
    "png": "https://cdn.example.com/prints/123.png",
    "pdf": "https://cdn.example.com/prints/123.pdf"
  }
}
```

### 4.3 API 接口

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/products/:id/design-config` | GET | 获取产品设计配置 |
| `/api/products/:id/design-config` | POST | 保存产品设计配置 |
| `/api/generate-print-files` | POST | 生成高清印刷文件 |
| `/api/orders/:id/print-files` | GET | 获取订单印刷文件 |

---

## 5. 非功能需求

### 5.1 性能要求

| 指标 | 要求 | 说明 |
|------|------|------|
| 设计器加载时间 | < 3s | 从页面加载到设计器可用 |
| 图片上传时间 | < 10s | 20MB 图片上传完成 |
| 操作响应时间 | < 100ms | 拖拽、缩放等操作 |
| 印刷文件生成 | < 30s | 300 DPI 文件生成 |

### 5.2 兼容性要求

| 平台 | 支持版本 |
|------|---------|
| Shopify Admin | 最新 3 个版本 |
| Shopify Themes | Dawn, Craft, Sense, Refresh |
| 浏览器 | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ |
| 移动端 | iOS 14+, Android 10+ |

### 5.3 安全要求

- 文件上传限制：最大 20MB，仅允许 PNG/JPG/SVG
- 所有 API 调用使用 Shopify 认证
- 印刷文件存储使用签名 URL
- 支持 CORS 配置

---

## 6. Shopify 后台配置清单

### 6.1 Partner 开发者中心配置

#### 6.1.1 创建 App

**路径**: https://partners.shopify.com → Apps → Create app

| 配置项 | 值 | 状态 |
|--------|-----|------|
| App 名称 | POD Design Studio | ☐ |
| App URL | [开发提供 ngrok URL] | ☐ |
| Allowed redirection URLs | [开发提供] | ☐ |
| Client ID | [从 Partner 后台复制] | ☐ |
| Client Secret | [从 Partner 后台复制] | ☐ |

#### 6.1.2 API 权限配置

**路径**: App → Configuration → App setup → API access scopes

| 权限 | 用途 | 状态 |
|------|------|------|
| `read_products` | 读取产品信息 | ☐ |
| `write_products` | 修改产品 Metafields | ☐ |
| `read_metaobject_definitions` | 读取元对象定义 | ☐ |
| `write_metaobject_definitions` | 创建元对象定义 | ☐ |
| `read_metaobjects` | 读取元对象数据 | ☐ |
| `write_metaobjects` | 写入元对象数据 | ☐ |

#### 6.1.3 扩展注册

**路径**: App → Extensions → Add extension

| 扩展类型 | 名称 | 状态 |
|---------|------|------|
| Admin UI Extension | Product Design Configuration | ☐ |
| Theme App Extension | POD Design Studio Storefront | ☐ |

### 6.2 开发店铺配置

#### 6.2.1 开发店铺信息

| 信息 | 值 |
|------|-----|
| 店铺域名 | [您的店铺].myshopify.com |
| 后台登录邮箱 | [您的邮箱] |
| 后台登录密码 | [您的密码] |

#### 6.2.2 测试产品

| 产品类型 | 产品名称 | 基础价格 | 状态 |
|---------|---------|---------|------|
| T恤 | Classic Unisex Tee | $24.99 | ☐ |
| 卫衣 | Premium Hoodie | $44.99 | ☐ |
| 手机壳 | iPhone 15 Case | $19.99 | ☐ |

#### 6.2.3 主题配置

| 配置项 | 值 |
|--------|-----|
| 使用主题 | Dawn |
| 主题版本 | 最新 |

---

## 7. 开发交付物

### 7.1 代码交付

| 交付物 | 路径 | 说明 |
|--------|------|------|
| 完整代码 | `shopify-app/` | 包含所有扩展和路由 |
| 数据库迁移 | `prisma/migrations/` | 数据库结构 |
| 环境变量模板 | `.env.example` | 配置模板 |

### 7.2 文档交付

| 交付物 | 说明 |
|--------|------|
| 部署文档 | 如何部署到生产环境 |
| API 文档 | 接口说明和示例 |
| 测试报告 | 功能测试和兼容性测试 |
| 操作手册 | 商家使用指南 |

### 7.3 验收标准

#### 功能验收

- [ ] Admin 产品页面显示 POD Design Studio 区块
- [ ] 可以启用/禁用产品的设计功能
- [ ] 可以配置印刷区域的位置和尺寸
- [ ] 可以配置颜色和尺寸选项
- [ ] 可以设置定制费用
- [ ] 店铺前台只在启用的产品显示设计器
- [ ] 消费者可以上传图片（PNG/JPG/SVG）
- [ ] 消费者可以添加和编辑文字
- [ ] 消费者可以移动、缩放、旋转设计元素
- [ ] 设计数据正确保存到购物车
- [ ] 订单包含设计预览图和印刷文件

#### 性能验收

- [ ] 设计器加载时间 < 3s
- [ ] 20MB 图片上传 < 10s
- [ ] 操作响应时间 < 100ms

#### 兼容性验收

- [ ] 在 Chrome 最新版测试通过
- [ ] 在 Firefox 最新版测试通过
- [ ] 在 Safari 最新版测试通过
- [ ] 在 iOS Safari 测试通过
- [ ] 在 Android Chrome 测试通过

---

## 8. 项目计划

### 8.1 里程碑

| 阶段 | 时间 | 交付物 | 负责人 |
|------|------|--------|--------|
| **Phase 1** | Week 1-2 | Admin 配置功能 | 开发 |
| **Phase 2** | Week 3-4 | Storefront 设计器 | 开发 |
| **Phase 3** | Week 5 | 印刷文件生成 | 开发 |
| **Phase 4** | Week 6 | 测试优化 | 双方 |
| **Phase 5** | Week 7 | 部署上线 | 双方 |

### 8.2 任务分解

#### Phase 1: Admin 配置功能

| 任务 | 工时 | 依赖 |
|------|------|------|
| 初始化 Shopify App 项目 | 1d | Partner 配置完成 |
| 创建 Admin UI Extension | 2d | - |
| 实现产品配置区块 | 3d | - |
| 实现设计编辑器页面 | 3d | - |
| Metafield 数据存储 | 2d | - |
| Admin 功能测试 | 2d | - |

#### Phase 2: Storefront 设计器

| 任务 | 工时 | 依赖 |
|------|------|------|
| 创建 Theme App Extension | 2d | - |
| 实现 Canvas 设计器 | 5d | - |
| 图片上传功能 | 2d | - |
| 文字编辑功能 | 2d | - |
| 图层管理功能 | 2d | - |
| 购物车集成 | 2d | - |

#### Phase 3: 印刷文件生成

| 任务 | 工时 | 依赖 |
|------|------|------|
| 高清 PNG 生成 | 2d | - |
| PDF 生成 | 2d | - |
| 文件存储集成 | 2d | AWS S3 配置 |

---

## 9. 风险与应对

| 风险 | 可能性 | 影响 | 应对措施 |
|------|--------|------|---------|
| Shopify API 变更 | 中 | 高 | 关注开发者更新，预留适配时间 |
| 大文件上传超时 | 中 | 中 | 实现分片上传，增加进度显示 |
| 浏览器兼容性问题 | 低 | 中 | 使用成熟库，充分测试 |
| 印刷精度不达标 | 中 | 高 | 提供 DPI 检测，给出警告提示 |

---

## 10. 附录

### 10.1 术语表

| 术语 | 说明 |
|------|------|
| POD | Print on Demand，按需印刷 |
| Metafield | Shopify 的自定义数据字段 |
| UI Extension | Shopify Admin 界面扩展 |
| Theme App Extension | Shopify 店铺主题扩展 |
| Line Item Properties | 购物车行项目属性 |
| DTG | Direct to Garment，直喷印刷技术 |

### 10.2 参考资源

| 资源 | 链接 |
|------|------|
| Shopify App Dev | https://shopify.dev/docs/apps |
| Admin UI Extensions | https://shopify.dev/docs/api/admin-extensions |
| Theme App Extensions | https://shopify.dev/docs/apps/online-store/theme-app-extensions |
| Shopify Polaris | https://polaris.shopify.com |

### 10.3 联系方式

| 角色 | 姓名 | 邮箱 | 职责 |
|------|------|------|------|
| 产品经理 | [姓名] | [邮箱] | 需求、验收 |
| 技术负责人 | [姓名] | [邮箱] | 技术方案、开发 |
| Shopify 支持 | - | support@shopify.com | 平台问题 |

---

**文档结束**
