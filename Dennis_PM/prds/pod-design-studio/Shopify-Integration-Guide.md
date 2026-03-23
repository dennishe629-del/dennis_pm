# Shopify App 对接完整指南

> **文档用途**: POD Design Studio — Shopify集成开发参考
> **创建日期**: 2026-03-17
> **对应PRD**: 3-PRD-20260317-v3.md，Task 2（Shopify App集成）
> **技术栈**: Node.js + Remix + Shopify CLI

---

## 目录

1. [架构概览](#一架构概览)
2. [第一步：注册Shopify Partner，创建App](#二第一步注册shopify-partner创建app)
3. [第二步：搭建后端（Remix）](#三第二步搭建后端remix)
4. [第三步：实现OAuth安装流程](#四第三步实现oauth安装流程)
5. [第四步：创建Theme App Extension（嵌入商品页）](#五第四步创建theme-app-extension嵌入商品页)
6. [第五步：注册Webhook监听订单](#六第五步注册webhook监听订单)
7. [第六步：本地开发调试](#七第六步本地开发调试)
8. [第七步：App Store提交审核](#八第七步app-store提交审核)
9. [核心对接路径总结](#九核心对接路径总结)
10. [数据库表设计（shops表）](#十数据库表设计shops表)
11. [常见问题](#十一常见问题)

---

## 一、架构概览

```
┌─────────────────────────────────────────────────────────┐
│                   Shopify 生态                           │
│  App Store → 商家安装 → OAuth授权 → 商家后台              │
│  Theme Editor → App Block → 商品页嵌入设计器              │
│  Webhook → orders/paid → 触发印刷文件生成                 │
└─────────────────────────────────────────────────────────┘
         ↕ API / Webhook
┌─────────────────────────────────────────────────────────┐
│              POD Platform 后端（Node.js + Remix）         │
│  /auth/callback  OAuth处理，保存access_token             │
│  /admin          商家管理后台（产品模板/订单/工厂）        │
│  /api/designs    保存设计JSON，返回design_id             │
│  /webhooks/*     处理Shopify事件                         │
└─────────────────────────────────────────────────────────┘
         ↕
┌─────────────────────────────────────────────────────────┐
│              Design Studio Widget（React+Fabric.js）      │
│  嵌入Shopify商品页（Theme App Extension App Block）       │
│  消费者定制 → 保存设计 → design_id写入购物车属性           │
└─────────────────────────────────────────────────────────┘
```

**关键数据流**：
```
商家安装App → OAuth → access_token → shops表
商品页加载 → App Block liquid → 设计器Widget
消费者定制 → POST /api/designs → design_id
design_id → Shopify Cart line_item._design_id属性
消费者结账 → orders/paid Webhook → 生成印刷文件 → 推送工厂
```

---

## 二、第一步：注册Shopify Partner，创建App

### 2.1 注册Partner账号

1. 访问 https://partners.shopify.com 注册
2. 创建Development Store（用于本地测试，免费）

### 2.2 创建App

1. Partners后台 → **Apps → Create App → Create app manually**
2. 填写信息：

| 字段 | 值 |
|------|----|
| App name | POD Design Studio |
| App URL | https://your-backend.com（先填，后续更新）|
| Allowed redirection URLs | https://your-backend.com/auth/callback |

3. 记录下 **Client ID** 和 **Client Secret**（后续配置到环境变量）

### 2.3 配置OAuth Scopes

PRD要求的权限范围（US-201）：

```
write_products     - 创建/更新Shopify商品（同步产品模板）
read_orders        - 读取订单数据
write_script_tags  - 注入JS脚本（Embed Widget用）
read_customers     - 读取消费者信息（可选）
```

---

## 三、第二步：搭建后端（Remix）

### 3.1 初始化项目

Shopify官方推荐Remix框架，内置OAuth、Session管理、Billing API：

```bash
npm init @shopify/app@latest
# 交互选项：
# ✔ Your project name: pod-design-studio
# ✔ Start by adding your first extension? No
# ✔ Choose a template: Remix
```

生成的项目结构：
```
pod-design-studio/
├── app/
│   ├── routes/
│   │   ├── auth.$.tsx          # OAuth入口
│   │   ├── auth.callback.tsx   # OAuth回调
│   │   ├── app._index.tsx      # 商家后台首页
│   │   ├── app.products.tsx    # 产品模板管理
│   │   ├── app.orders.tsx      # 订单管理
│   │   └── webhooks.tsx        # Webhook处理
│   └── shopify.server.ts       # Shopify SDK配置
├── extensions/                 # Theme App Extension
└── shopify.app.toml            # App配置文件
```

### 3.2 配置环境变量

创建 `.env` 文件：

```env
SHOPIFY_API_KEY=你的Client_ID
SHOPIFY_API_SECRET=你的Client_Secret
SHOPIFY_APP_URL=https://your-backend.com
SCOPES=write_products,read_orders,write_script_tags
DATABASE_URL=mysql://user:pass@host/pod_db
S3_BUCKET=your-s3-bucket
S3_REGION=us-east-1
```

### 3.3 配置 shopify.app.toml

```toml
name = "POD Design Studio"
client_id = "你的Client_ID"
application_url = "https://your-backend.com"
embedded = true

[auth]
redirect_urls = ["https://your-backend.com/auth/callback"]

[webhooks]
api_version = "2024-01"

  [[webhooks.subscriptions]]
  topics = ["orders/paid"]
  uri = "/webhooks/orders-paid"

  [[webhooks.subscriptions]]
  topics = ["app/uninstalled"]
  uri = "/webhooks/app-uninstalled"

[pos]
embedded = false
```

---

## 四、第三步：实现OAuth安装流程

Remix模板已内置，核心流程说明：

```
商家在App Store点击Install
  → GET /auth?shop=xxx.myshopify.com
  → 后端生成OAuth URL，重定向至Shopify授权页
  → 商家点击「Install App」授权
  → Shopify回调 GET /auth/callback?code=xxx&shop=xxx
  → 后端用code换取access_token
  → 写入shops表（保存shop_domain + access_token）
  → 注册Webhook（orders/paid, app/uninstalled）
  → 跳转至商家后台 /app
```

关键代码（`app/shopify.server.ts`）：

```typescript
import "@shopify/shopify-app-remix/adapters/node";
import { shopifyApp } from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { prisma } from "./db.server";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  appUrl: process.env.SHOPIFY_APP_URL!,
  scopes: process.env.SCOPES!.split(","),
  sessionStorage: new PrismaSessionStorage(prisma),
  // 安装成功后的回调
  hooks: {
    afterAuth: async ({ session }) => {
      // 注册Webhook
      await shopify.registerWebhooks({ session });
      // 写入shops表
      await prisma.shop.upsert({
        where: { shopDomain: session.shop },
        create: { shopDomain: session.shop, accessToken: session.accessToken },
        update: { accessToken: session.accessToken, isActive: true }
      });
    }
  }
});

export default shopify;
export const authenticate = shopify.authenticate;
```

---

## 五、第四步：创建Theme App Extension（嵌入商品页）

这是实现PRD US-202的核心，让设计器Widget嵌入Shopify商品页。

### 5.1 生成Extension

```bash
shopify app generate extension
# 选择: Theme app extension
# 命名: pod-designer-block
```

### 5.2 创建App Block Liquid模板

文件路径：`extensions/pod-designer-block/blocks/designer.liquid`

```liquid
{%- liquid
  assign product_handle = product.handle
  assign shop_domain = shop.permanent_domain
-%}

<div id="pod-designer-wrapper" style="margin: 16px 0">
  {%- if block.settings.enable_customization -%}
    <button
      id="pod-customize-btn"
      type="button"
      style="
        width: 100%;
        padding: 14px;
        background: {{ block.settings.button_color }};
        color: {{ block.settings.button_text_color }};
        border: none;
        border-radius: 4px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
      "
    >
      {{ block.settings.button_text }}
    </button>

    <!-- 设计器Modal容器 -->
    <div id="pod-designer-modal"
         style="display:none;position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.5)">
      <div style="position:absolute;inset:40px;background:#fff;border-radius:8px;overflow:hidden">
        <iframe
          id="pod-designer-iframe"
          src=""
          style="width:100%;height:100%;border:none"
          allow="clipboard-write"
        ></iframe>
      </div>
    </div>
  {%- endif -%}
</div>

<script>
(function() {
  const DESIGNER_URL = {{ block.settings.designer_url | json }};
  const shopDomain = {{ shop_domain | json }};
  const productId = {{ product.id | json }};
  const selectedVariantId = function() {
    // 获取当前选中的variant
    return document.querySelector('[name="id"]')?.value ||
           {{ product.selected_or_first_available_variant.id | json }};
  };

  const btn = document.getElementById('pod-customize-btn');
  const modal = document.getElementById('pod-designer-modal');
  const iframe = document.getElementById('pod-designer-iframe');

  if (!btn) return;

  // 打开设计器
  btn.addEventListener('click', function() {
    const variantId = selectedVariantId();
    const url = `${DESIGNER_URL}?shop=${shopDomain}&productId=${productId}&variantId=${variantId}`;
    iframe.src = url;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  });

  // 监听设计器postMessage（消费者点击加购）
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'pod_add_to_cart') {
      const { design_id, variant_id, qty } = e.data;

      // 调用Shopify Cart API
      fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{
            id: variant_id || selectedVariantId(),
            quantity: qty || 1,
            properties: {
              '_design_id': design_id,
              '_customized': 'true'
            }
          }]
        })
      })
      .then(r => r.json())
      .then(() => {
        // 关闭设计器，打开购物车
        modal.style.display = 'none';
        document.body.style.overflow = '';
        // 触发Shopify原生购物车更新事件
        document.dispatchEvent(new CustomEvent('cart:updated'));
        window.location.href = '/cart';
      })
            .catch(err => console.error('[POD] Cart add failed:', err));

      // 关闭设计器
      modal.style.display = 'none';
      document.body.style.overflow = '';
      iframe.src = '';
    }

    // 关闭设计器（ESC键/关闭消息）
    if (e.data && e.data.type === 'pod_close') {
      modal.style.display = 'none';
      document.body.style.overflow = '';
      iframe.src = '';
    }
  });

  // 点击遮罩关闭
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
      iframe.src = '';
    }
  });
})();
</script>

{% schema %}
{
  "name": "POD Designer",
  "target": "section",
  "settings": [
    {"type": "checkbox", "id": "enable_customization", "label": "Enable Customization Button", "default": true},
    {"type": "text", "id": "button_text", "label": "Button Text", "default": "✏️ Customize Your Design"},
    {"type": "color", "id": "button_color", "label": "Button Color", "default": "#e63946"},
    {"type": "color", "id": "button_text_color", "label": "Button Text Color", "default": "#ffffff"},
    {"type": "text", "id": "designer_url", "label": "Designer App URL", "default": "https://your-backend.com/designer"}
  ]
}
{% endschema %}
```

### 5.3 在主题编辑器中启用

1. Shopify后台 → **Online Store → Themes → Customize**
2. 进入产品页模板（Products / Default product）
3. 左侧点击 **Add section** → 找到 **POD Designer**
4. 配置按钮文字、颜色、Designer URL
5. 点击 Save

---

## 六、第五步：注册Webhook监听订单

文件：`app/routes/webhooks.tsx`

```typescript
export const action = async ({ request }) => {
  const { topic, shop, payload } = await authenticate.webhook(request);

  switch (topic) {
    case "ORDERS_PAID": {
      const order = payload;
      for (const item of order.line_items) {
        const designIdProp = item.properties?.find(p => p.name === '_design_id');
        if (designIdProp?.value) {
          await printFileQueue.add('generate', {
            designId: designIdProp.value,
            orderId: order.id,
            shop
          }, { attempts: 3, backoff: { type: 'exponential', delay: 60000 } });
        }
      }
      break;
    }
    case "APP_UNINSTALLED": {
      await prisma.shop.update({
        where: { shopDomain: shop },
        data: { isActive: false, uninstalledAt: new Date() }
      });
      break;
    }
  }
  return new Response();
};
```

**Webhook签名验证**：`authenticate.webhook()` 已内置HMAC-SHA256验证，无需手动实现。

---

## 七、第六步：本地开发调试

```bash
# 启动开发服务器（自动建立Cloudflare Tunnel）
shopify app dev

# 查看Webhook日志
shopify app webhook trigger --topic orders/paid

# 重新部署Extension
shopify app deploy
```

---

## 八、第七步：App Store提交审核

| 步骤 | 操作 | 预计时间 |
|------|------|----------|
| 1 | 填写App Store listing（描述/截图/隐私政策）| 1-2天 |
| 2 | 准备Demo Store（Shopify要求提供可测试店铺）| 0.5天 |
| 3 | 提交审核 | - |
| 4 | Shopify审核 | 1-2周 |
| 5 | 审核通过上架 | - |

审核前检查清单：
- [ ] 隐私政策URL有效且内容完整
- [ ] App功能在Demo Store中可正常使用
- [ ] 卸载流程正确（数据软删除，保留30天）
- [ ] 不使用已废弃的Shopify API
- [ ] V1定价为Free，Billing API可暂不实现

---

## 九、核心对接路径总结

```
[Shopify App Store]
  ↓ 商家点击Install
[OAuth授权] → access_token → shops表
  ↓
[商家后台 /app] 配置产品模板 → 绑定Shopify Product
  ↓
[主题编辑器] 添加POD Designer App Block
  ↓
[Shopify商品页] 消费者点击「Customize」
  → 设计器iframe弹出
  → 消费者定制 → POST /api/designs → design_id
  → postMessage → Shopify Cart API
  → design_id写入line_item.properties._design_id
  ↓
[消费者结账] → orders/paid Webhook
  → 找到_design_id → 生成PNG+PDF印刷文件
  → 推送工厂API（HMAC-SHA256签名）
```

---

## 十、数据库表设计（shops表）

```sql
CREATE TABLE shops (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  shop_domain     VARCHAR(255) NOT NULL UNIQUE,
  access_token    VARCHAR(255) NOT NULL,
  plan            ENUM('free','starter','pro') DEFAULT 'free',
  billing_charge_id VARCHAR(100) NULL,
  trial_ends_at   DATETIME NULL,
  is_active       TINYINT(1) DEFAULT 1,
  installed_at    DATETIME DEFAULT NOW(),
  uninstalled_at  DATETIME NULL,
  created_at      DATETIME DEFAULT NOW(),
  INDEX idx_domain (shop_domain)
);
```

---

## 十一、常见问题

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| App Block在主题编辑器中找不到 | Extension未部署 | 运行 `shopify app deploy` |
| OAuth回调404 | redirect_url未注册 | Partners后台添加回调URL |
| Webhook收不到 | URL不可访问 | 确认服务器公网可访问；检查toml配置 |
| iframe跨域报错 | CSP策略 | 后端响应头添加 `frame-ancestors *.myshopify.com` |
| design_id未传入订单 | postMessage格式错误 | 检查 `e.data.type === 'pod_add_to_cart'` |

---

## 参考资源

| 资源 | 链接 |
|------|------|
| Shopify App开发文档 | https://shopify.dev/docs/apps |
| Remix App模板 | https://shopify.dev/docs/apps/getting-started/create |
| Theme App Extension | https://shopify.dev/docs/apps/online-store/theme-app-extensions |
| Shopify Cart API | https://shopify.dev/docs/api/ajax/reference/cart |
| App Store审核要求 | https://shopify.dev/docs/apps/launch/app-requirements |

---

**文档版本**: v1.0 | **最后更新**: 2026-03-17 | **对应PRD**: 3-PRD-20260317-v3.md Task 2
