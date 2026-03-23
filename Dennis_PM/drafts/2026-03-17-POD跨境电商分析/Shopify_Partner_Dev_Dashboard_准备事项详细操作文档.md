# Shopify Dev Dashboard 准备事项操作文档

> 目标：完成 Dev Dashboard 账号确认、Dev Store 创建、App 创建与版本发布、权限配置，为后续 App 开发与测试做准备。  
> 本文档聚焦后台配置操作，不涉及代码开发。

---

## 背景说明

- **Dev Dashboard** 已取代 Partner Dashboard，成为 Shopify app 开发的主操作台，用于管理 app、版本、Dev Store、权限等。
- **App Extensions 不能在 Dashboard 中创建**，必须通过 Shopify CLI 处理。
- 因此：产品/PM 在 Dev Dashboard 完成前期准备；开发通过 CLI 初始化和开发扩展。

参考：[Dev Dashboard 概览](https://shopify.dev/docs/apps/build/dev-dashboard) · [从 Partner Dashboard 迁移](https://shopify.dev/docs/apps/build/dev-dashboard/migrate-from-partners)

---

## 操作步骤

### Step 1 · 登录 Dev Dashboard

地址：`https://dev.shopify.com/dashboard`

确认左侧菜单可以看到 **Apps** 和 **Dev stores**，若无权限先申请。

---

### Step 2 · 创建 Dev Store

路径：**Dev stores → Add dev store**

| 配置项 | 建议 |
|---|---|
| Store name | `clothing-customizer-dev`（项目识别命名） |
| Plan | Basic（MVP 阶段够用） |
| Feature Preview | 暂不启用（MVP 阶段不需要） |

完成后记录：Store 名称、URL、Owner、成员列表。

> Dev Store 仅用于开发测试，不能用于真实交易。测试订单使用 Bogus Test Gateway 或支付商 test mode。

参考：[Development Stores](https://shopify.dev/docs/apps/build/dev-dashboard/development-stores)

---

### Step 3 · 确认 App 创建方式

本项目为**扩展型 App**（含 Shopify Admin UI 与 Theme App Extension），**必须由开发通过 Shopify CLI 初始化**，不能仅靠 Dashboard 完成。

- 若开发已通过 CLI 初始化 → 跳到 Step 4
- 若需要在 Dashboard 先建 App 容器 →
  - 路径：**Apps → Create app → Start from Dev Dashboard**
  - 输入 App 名称 → **Create**

参考：[使用 Dev Dashboard 创建 App](https://shopify.dev/docs/apps/build/dev-dashboard/create-apps-using-dev-dashboard)

---

### Step 4 · 创建 App Version 并发布

> App 必须至少有一个 Version，才能安装到 Store。

路径：**App → Versions → 填写配置 → Release**

需与开发共同确认的配置项：

| 配置项 | 说明 |
|---|---|
| App URL | 由开发提供当前可用的 dev/staging 地址 |
| Webhooks API version | 由开发决定，采用当前推荐版本 |
| Scopes | 见下方权限清单，需产品参与确认 |

**Scopes 建议清单（MVP 阶段）**：

| Scope | 用途 |
|---|---|
| `read_products` / `write_products` | 读取/创建商品 |
| `read_orders` / `write_orders` | 读取/更新订单 |
| `read_customers` | 读取客户信息 |
| `read_inventory` / `write_inventory` | 库存管理 |

> Scope 变更会触发商家重新授权，建议 MVP 阶段一次规划完整。

---

### Step 5 · 安装 App 到 Dev Store

路径：**App → Home → Install app → 选择 Dev Store → Install**

安装前确认：
- App Version 已 Release
- Dev Store 为本项目专用测试店
- Scopes 已确认
- 开发已准备好可访问的 App 环境

安装后验证：App 出现在 Dev Store 的 Apps 列表、可正常打开、无权限或 redirect 报错。

---

### Step 6 · 添加团队成员

路径：Dev Store Admin → **Settings → Users and permissions → Add staff**

建议至少包含：产品经理、前端开发、后端开发、QA、运营/实施。

明确角色：店铺 Owner / Staff / App 配置管理人。

---

### Step 7 · 准备测试内容

| 类别 | 建议 |
|---|---|
| 测试商品 | 服装类 4–6 个（含颜色/尺码变体）、非服装 1–2 个 |
| 主题 | Online Store 2.0 主题 + 商品页 block 测试模板 |
| 素材 | Front/Back 底图、测试上传图片、测试文字 |

---

## 常见误区

| 误区 | 说明 |
|---|---|
| 在 Dashboard 创建 Extensions | 不可以，必须通过 Shopify CLI |
| 只建 App 不建 Version | 不可以，没有 Version 无法安装 |
| 用 Dev Store 做正式环境 | 不可以，仅限开发测试 |
| MVP 后才规划 Scopes | 不建议，Scope 变更会触发重新授权 |

---

## 项目产出物清单

完成以上步骤后，建议同步整理以下文档：

- **环境清单**：App 名称、Dev Store 名称/URL、Owner、Staff 列表、当前版本状态
- **权限清单**：Scopes 列表、每项用途、是否 MVP 必需
- **测试准备清单**：商品、主题、素材、验收场景
- **协作清单**：谁建 App、谁管 Version、谁安装、谁配主题、谁验收

---

## 参考文档

- [Dev Dashboard 概览](https://shopify.dev/docs/apps/build/dev-dashboard)
- [从 Partner Dashboard 迁移](https://shopify.dev/docs/apps/build/dev-dashboard/migrate-from-partners)
- [使用 Dev Dashboard 创建 App](https://shopify.dev/docs/apps/build/dev-dashboard/create-apps-using-dev-dashboard)
- [Development Stores](https://shopify.dev/docs/apps/build/dev-dashboard/development-stores)
