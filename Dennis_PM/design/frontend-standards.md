# 前端规范 v2.0（SSOT - 单一真源）

> 版本：v2.0 | 基于生产系统截图分析
> 适用范围：ShipSage / GAATU Admin / POD / WMS / BI 等所有前端 Demo

---

## 零、设计背景与规划

### 背景

本规范基于**生产系统截图分析**，优先贴近现有系统组件规范。

**设计目标**：支持高频录入、检索、审核、对账、追踪等后台作业，在高信息密度前提下保持清晰层次，通过统一组件规范降低研发与维护成本。

**设计原则**：

| 原则 | 说明 |
|------|------|
| 任务优先 | 关键操作路径最短 |
| 状态可见 | 任何流程节点可追踪、可定位 |
| 一致性 | 跨模块视觉与交互一致 |
| 可扩展 | 支持模块扩展与多角色差异化 |

### Demo 输出优先级

| 优先级 | 页面 | 说明 |
|--------|------|------|
| P0 | 登录页、工作台 | 基础入口 |
| P1 | 订单列表页、订单详情页 | 核心业务 |
| P2 | 入库/出库作业页、库存查询页 | WMS 核心 |
| P3 | 财务账单页、用户角色管理页 | 财务/系统 |

### Demo 输出结构

```
prds/[模块名]/demo/
├── index.html       # 主入口
├── detail.html      # 详情页
├── [role].html      # 按角色分页
└── studio.html      # 设计器（如有）
```

---

## 一、颜色规范

基于生产系统截图的实配色，不使用外部字体 CDN。

### 1.1 主色与品牌

| 用途 | 色值 | CSS 变量 |
|------|------|---------|
| 主色 | `#3B82F6` | `--primary` |
| 主色深 | `#2563EB` | `--primary-dark` |
| 主色浅 | `#60A5FA` | `--primary-light` |
| 选中背景 | `#EFF6FF` | `--primary-lighten` |

### 1.2 布局色

| 用途 | 色值 | CSS 变量 |
|------|------|---------|
| 侧边栏背景 | `#1A1F2E` | `--sidebar-bg` |
| 顶部栏背景 | `#1E2330` | `--topbar-bg` |
| 卡片背景 | `#FFFFFF` | `--card-bg` |
| 页面背景 | `#F9FAFB` | `--page-bg` |
| 边框 | `#E5E7EB` | `--border` |
| 表格表头背景 | `#F9FAFB` | `--table-header` |
| 表格行 Hover | `#F3F4F6` | `--table-hover` |
| 表格行选中 | `#EFF6FF` | `--table-selected` |

### 1.3 语义色

| 用途 | 色值 | CSS 变量 |
|------|------|---------|
| 成功 | `#10B981` | `--success` |
| 警告 | `#F59E0B` | `--warning` |
| 错误 | `#EF4444` | `--error` |
| 信息 | `#3B82F6` | `--info` |

### 1.4 文字色

| 用途 | 色值 |
|------|------|
| 主要文字 | `#1F2937` |
| 次要文字 | `#6B7280` |
| 占位/禁用 | `#9CA3AF` |

---

## 二、字体规范

### 2.1 字体族

```css
--font-family: -apple-system, 'Microsoft YaHei', 'PingFang SC', 'Segoe UI', sans-serif;
```

> 不使用外部字体 CDN，使用系统字体栈确保兼容性。

### 2.2 字号与字重

| 用途 | 大小 | 字重 |
|------|------|------|
| 页面标题 | 24px | 600 |
| 卡片标题 | 18px | 500 |
| 正文 | 14px | 400 |
| 辅助信息 | 12px | 400 |

---

## 三、间距规范

基于 8dp 网格：`4 / 8 / 12 / 16 / 24 / 32`

---

## 四、圆角规范

| 组件 | 圆角 |
|------|------|
| 按钮 | 6px |
| 卡片 | 8px |
| 输入框 | 6px |
| 标签/Chip | 16px |

---

## 五、组件规范

### 5.1 按钮

```css
/* Primary */
background: #3B82F6; color: white; border-radius: 6px; height: 36px; padding: 0 16px;
/* Hover: #2563EB */

/* Secondary */
background: white; color: #374151; border: 1px solid #D1D5DB; border-radius: 6px;
/* Hover: #F3F4F6 */

/* Danger */
background: #EF4444; color: white; border-radius: 6px;
/* Hover: #DC2626 */
```

### 5.2 输入框

```css
background: white; border: 1px solid #D1D5DB; border-radius: 6px;
height: 36-40px; padding: 0 12px; font-size: 14px;
/* Focus: border-color: #3B82F6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1) */
```

### 5.3 卡片

```css
background: white; border: 1px solid #E5E7EB; border-radius: 8px;
padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
```

### 5.4 表格

```css
.table th {
  background: #F9FAFB; font-size: 12px; font-weight: 600;
  color: #6B7280; text-transform: uppercase;
  padding: 12px 16px; border-bottom: 1px solid #E5E7EB;
}
.table td { font-size: 14px; padding: 14px 16px; border-bottom: 1px solid #E5E7EB; }
.table tr { height: 48-56px; }
.table tbody tr:hover { background: #F3F4F6; }
```

### 5.5 侧边栏

```css
width: 220px; background: #1A1F2E; min-height: 100vh;
.sidebar-nav-item.active {
  background: rgba(59,130,246,0.1); color: white;
  border-left: 3px solid #3B82F6; padding-left: 13px;
}
```

### 5.6 顶部栏

```css
height: 64px; background: #1E2330; position: fixed; top: 0; left: 220px; right: 0;
```

### 5.7 状态标签

| 状态 | 样式 |
|------|------|
| 成功 | `bg-green-100 text-green-800` |
| 警告/待处理 | `bg-yellow-100 text-yellow-800` |
| 错误/异常 | `bg-red-100 text-red-800` |
| 信息/进行中 | `bg-blue-100 text-blue-800` |

---

## 六、页面模板

### 6.1 模板总览

| ID | 名称 | 适用场景 | 核心组件 |
|----|------|---------|---------|
| PT-01 | 列表页 | 查询、筛选、批量操作 | FilterBar / DataTable / Pagination |
| PT-02 | 详情页 | 单据/对象详情查看 | Card / StatusTag / Timeline / LogList |
| PT-03 | 编辑页 | 新建、编辑、提交审核 | FormSection / Input / Select / Button |
| PT-04 | 混合页 | 表单+明细表并行 | FormSection / DataTable / Modal / Toast |
| PT-05 | 审批页 | 审核、驳回、复核 | Card / StatusTag / Modal / CommentBox |
| PT-06 | 对账页 | 对账、差异核对 | FilterBar / CompareTable / Tag / Drawer |
| PT-07 | Wizard 向导 | 分步引导、首次建档 | Stepper / Form / OptionCard / SummaryCard |
| PT-08 | Studio 设计器 | 三栏编辑器、画布编辑 | Toolbar / Canvas / LayerList / PropertyPanel |
| PT-09 | Workstation 作业台 | 扫码作业、任务执行 | ScanInput / TaskCard / MockupCard / ActionBar |
| PT-10 | Flow Monitor | 批次进度、状态监控 | MetricCard / Timeline / StatusTable / AlertCard |

### 6.2 模板必备状态

每个模板必须包含以下状态：

| 状态 | 说明 |
|------|------|
| default | 正常加载数据 |
| loading | 数据加载中（骨架屏）|
| empty | 无数据（引导操作）|
| no-result | 筛选无结果（引导调整）|
| error | 接口错误（可重试）|

---

## 七、交互规范

### 7.1 反馈时序

| 时长 | 反馈 |
|------|------|
| < 100ms | 视觉反馈（hover/active）|
| 100-300ms | 无需反馈 |
| > 300ms | 显示 Loading |
| 提交后 | Toast 成功/失败提示 |

### 7.2 错误处理

| 类型 | 处理方式 |
|------|---------|
| 字段错误 | 字段下方就地提示 |
| 业务错误 | 页面级 Alert + 错误码 |
| 系统错误 | 统一异常区 + 可重试 |
| 高风险操作 | 确认弹窗 + 明确后果文案 |

### 7.3 空态规范

- 无数据：给下一步建议（如"新建数据"）
- 无结果：显示"调整筛选条件"引导
- 无权限：展示申请权限入口

---

## 八、多系统风格

| 系统 | 主色 | 特征 |
|------|------|------|
| Admin（运营后台）| `#3B82F6` | 侧边栏深蓝灰，数据密集 |
| Merchant（商家后台）| `#008060` | Shopify Polaris 风格 |
| WMS（仓库操作）| `#FF6B00` | 按钮大，适合触屏/扫码枪 |
| Design Studio | 品牌色 | 全屏 Canvas 布局 |
| BI（数据分析）| `#37474F` | 图表为主，筛选器丰富 |

---

## 九、Demo 执行 SOP

### Step 1: 解读需求

读取 PRD 中的 ASCII 线框图，识别：
- 页面类型（PT-01~PT-10）
- 核心交互区域（按钮、筛选器、状态标签）
- 数据列和字段

### Step 2: 确定输出文件

```
prds/[模块名]/demo/
├── index.html       # 主入口
├── detail.html      # 详情页
├── [role].html      # 按角色分页
└── studio.html      # 设计器（如有）
```

### Step 3: 生成代码

使用 Tailwind CSS CDN + 内联 Mock 数据：

```html
<script src="https://cdn.tailwindcss.com"></script>
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3/dist/cdn.min.js"></script>
```

### Step 4: 质量检查

- [ ] 浏览器直接打开无报错
- [ ] Mock 数据覆盖正常/空/异常三种状态
- [ ] 所有枚举状态都有对应颜色标签
- [ ] 关键操作有交互反馈
- [ ] 响应式布局无横向滚动

---

## 十、版本记录

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0 | 2026-03-19 | 初版（frontend-style-guide-vuetify.md）|
| v2.0 | 2026-04-01 | 整合设计规范，精简为单一真源文件 |
