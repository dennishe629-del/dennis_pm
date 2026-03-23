# 前端Demo样式规范

> **版本**：V3.0
> **适用范围**：所有前端Demo
> **设计基础**：基于实际系统截图分析（ShipSage/GAATU Admin）
> **最后更新**：2026-03-19

> **重要说明**：本规范基于现有系统截图分析的实际UI风格，优先贴近现有系统组件规范。颜色、圆角、间距等均来自真实生产环境。

---

## 1. Design System概览

本规范基于**现有系统截图分析**，为前端Demo提供与生产环境一致的UI风格。

### 1.1 设计原则

- **一致性**：所有Demo使用与现有系统统一的颜色、字体、间距系统
- **清晰性**：信息层级分明，重点突出
- **企业风格**：深色侧边栏 + 浅色内容区的经典后台布局
- **实用性**：优先适配现有系统风格，降低理解成本

### 1.2 核心特征

- 侧边栏深色导航（深蓝灰 #1A1F2E）
- 顶部深色工具栏（#1E2330）
- 白色内容区卡片
- 8px 圆角卡片
- 6px 圆角按钮
- 表格行高 48-56px

---

## 2. 主题色系

### 2.1 主色（Primary）

基于系统截图分析的实际主色：

| 名称 | 色值 | 用途 |
|------|------|------|
| **Primary** | `#3B82F6` | 主要按钮、链接、选中状态、蓝色指示条 |
| **Primary Dark** | `#2563EB` | 悬停状态 |
| **Primary Light** | `#60A5FA` | 浅色背景、hover高亮 |
| **Primary Lighten** | `#EFF6FF` | 选中行背景、浅蓝背景 |

### 2.2 次色（Secondary / Accent）

| 名称 | 色值 | 用途 |
|------|------|------|
| **Secondary** | `#424242` | 次要按钮、图标 |
| **Accent** | `#82B1FF` | 强调元素、特殊高亮 |
| **Error** | `#EF4444` | 错误状态（#EF4444 更接近实际系统）|
| **Info** | `#3B82F6` | 信息提示 |
| **Success** | `#10B981` | 成功状态 |
| **Warning** | `#F59E0B` | 警告状态 |

### 2.2 布局专用色

| 名称 | 色值 | 用途 |
|------|------|------|
| **Sidebar BG** | `#1A1F2E` | 侧边栏背景（深蓝灰）|
| **Topbar BG** | `#1E2330` | 顶部导航栏背景 |
| **Card BG** | `#FFFFFF` | 卡片/内容区背景 |
| **Page BG** | `#F9FAFB` | 页面整体背景 |
| **Border** | `#E5E7EB` | 分割线、边框 |
| **Table Header BG** | `#F9FAFB` | 表头背景 |
| **Table Row Hover** | `#F3F4F6` | 表格行hover |
| **Table Row Selected** | `#EFF6FF` | 表格行选中 |

### 2.3 中性色（Grey Scale）

| 名称 | 色值 | 用途 |
|------|------|------|
| **Surface** | `#FFFFFF` | 卡片背景、输入框背景 |
| **Background** | `#F5F5F5` | 页面背景 |
| **Divider** | `#E0E0E0` | 分割线、边框 |
| **Disabled** | `#BDBDBD` | 禁用状态 |
| **Text Primary** | `#212121` | 主要文字 |
| **Text Secondary** | `#757575` | 次要文字 |
| **Text Disabled** | `#9E9E9E` | 禁用文字 |

### 2.4 完整 Material Color Palette

```css
/* Red */
--red: #F44336;
--red-lighten-5: #FFEBEE;
--red-darken-2: #D32F2F;

/* Pink */
--pink: #E91E63;
--pink-lighten-5: #FCE4EC;

/* Purple */
--purple: #9C27B0;
--purple-lighten-5: #F3E5F5;

/* Deep Purple */
--deep-purple: #673AB7;
--deep-purple-lighten-5: #EDE7F6;
--deep-purple-accent-2: #7C4DFF;

/* Indigo - 推荐主色 */
--indigo: #3F51B5;
--indigo-lighten-5: #E8EAF6;
--indigo-darken-1: #3949AB;

/* Blue */
--blue: #2196F3;
--blue-lighten-5: #E3F2FD;

/* Light Blue */
--light-blue: #03A9F4;
--light-blue-lighten-5: #E1F5FE;

/* Cyan */
--cyan: #00BCD4;

/* Teal */
--teal: #009688;

/* Green */
--green: #4CAF50;
--green-lighten-5: #E8F5E9;

/* Light Green */
--light-green: #8BC34A;

/* Lime */
--lime: #CDDC39;

/* Yellow */
--yellow: #FFEB3B;

/* Amber */
--amber: #FFC107;

/* Orange */
--orange: #FF9800;

/* Deep Orange */
--deep-orange: #FF5722;

/* Brown */
--brown: #795548;

/* Blue Grey */
--blue-grey: #607D8B;
--blue-grey-lighten-5: #ECEFF1;
```

---

## 3. 字体规范

### 3.1 字体族

```css
/* 主要字体 - 优先使用系统字体 */
--font-family: -apple-system, 'Microsoft YaHei', 'PingFang SC', 'Segoe UI', sans-serif;

/* 等宽字体（用于数字、代码） */
--font-family-mono: 'SF Mono', 'Monaco', 'Consolas', monospace;
```

> **注意**：不使用外部字体CDN（国内访问慢），使用系统字体栈确保兼容性。

### 3.2 字体大小（Type Scale）

遵循 Material Design Type Scale：

| 样式 | 大小 | 字重 | 行高 | 字间距 | 用途 |
|------|------|------|------|--------|------|
| **H1** | 96px | 300 | 112px | -1.5px | 超大标题 |
| **H2** | 60px | 300 | 72px | -0.5px | 大标题 |
| **H3** | 48px | 400 | 56px | 0 | 页面标题 |
| **H4** | 34px | 400 | 42px | 0.25px | 区块标题 |
| **H5** | 24px | 400 | 32px | 0 | 小标题 |
| **H6** | 20px | 500 | 32px | 0.15px | 卡片标题 |
| **Subtitle 1** | 16px | 400 | 28px | 0.15px | 副标题 |
| **Subtitle 2** | 14px | 500 | 24px | 0.1px | 小副标题 |
| **Body 1** | 16px | 400 | 24px | 0.5px | 主要正文 |
| **Body 2** | 14px | 400 | 20px | 0.25px | 次要正文 |
| **Button** | 14px | 500 | 16px | 1.25px | 按钮文字（大写） |
| **Caption** | 12px | 400 | 16px | 0.4px | 说明文字 |
| **Overline** | 10px | 400 | 16px | 1.5px | 标签文字（大写） |

### 3.3 字重

| 名称 | 值 | 用途 |
|------|-----|------|
| **Thin** | 100 | 极细标题 |
| **Light** | 300 | 大标题 |
| **Regular** | 400 | 正文 |
| **Medium** | 500 | 小标题、按钮 |
| **Bold** | 700 | 强调 |
| **Black** | 900 | 特殊强调 |

---

## 4. 布局规范

### 4.1 间距系统（8dp网格）

Material Design 使用 8dp 作为基础网格单位：

```css
--space-0: 0px;
--space-1: 4px;   /* 0.5 单位 */
--space-2: 8px;   /* 1 单位 */
--space-3: 12px;  /* 1.5 单位 */
--space-4: 16px;  /* 2 单位 */
--space-5: 20px;  /* 2.5 单位 */
--space-6: 24px;  /* 3 单位 */
--space-8: 32px;  /* 4 单位 */
--space-10: 40px; /* 5 单位 */
--space-12: 48px; /* 6 单位 */
--space-16: 64px; /* 8 单位 */
```

### 4.2 断点系统

| 名称 | 范围 | 描述 |
|------|------|------|
| **xs** | < 600px | 手机 |
| **sm** | 600px - 959px | 大手机/小平板 |
| **md** | 960px - 1263px | 平板 |
| **lg** | 1264px - 1903px | 笔记本/桌面 |
| **xl** | > 1904px | 大屏桌面 |

### 4.3 容器宽度

```css
/* 最大宽度 */
--container-max-width: 1185px; /* lg 断点 */

/* 页面边距 */
--page-padding-xs: 16px;
--page-padding-sm: 24px;
--page-padding-md: 32px;
--page-padding-lg: 48px;
```

### 4.4 网格系统

基于 12 列网格：

```css
/* 列宽 */
--col-1: 8.33%;
--col-2: 16.66%;
--col-3: 25%;
--col-4: 33.33%;
--col-6: 50%;
--col-8: 66.66%;
--col-12: 100%;

/* 间距 */
--gutter: 24px;
```

---

## 5. 阴影层级（Elevation）

Material Design 使用阴影表示高度：

```css
--shadow-0: none;
--shadow-1: 0 2px 1px -1px rgba(0,0,0,0.2), 0 1px 1px 0 rgba(0,0,0,0.14), 0 1px 3px 0 rgba(0,0,0,0.12);
--shadow-2: 0 3px 1px -2px rgba(0,0,0,0.2), 0 2px 2px 0 rgba(0,0,0,0.14), 0 1px 5px 0 rgba(0,0,0,0.12);
--shadow-3: 0 3px 3px -2px rgba(0,0,0,0.2), 0 3px 4px 0 rgba(0,0,0,0.14), 0 1px 8px 0 rgba(0,0,0,0.12);
--shadow-4: 0 2px 4px -1px rgba(0,0,0,0.2), 0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12);
--shadow-6: 0 3px 5px -1px rgba(0,0,0,0.2), 0 6px 10px 0 rgba(0,0,0,0.14), 0 1px 18px 0 rgba(0,0,0,0.12);
--shadow-8: 0 5px 5px -3px rgba(0,0,0,0.2), 0 8px 10px 1px rgba(0,0,0,0.14), 0 3px 14px 2px rgba(0,0,0,0.12);
--shadow-12: 0 7px 8px -4px rgba(0,0,0,0.2), 0 12px 17px 2px rgba(0,0,0,0.14), 0 5px 22px 4px rgba(0,0,0,0.12);
--shadow-16: 0 8px 10px -5px rgba(0,0,0,0.2), 0 16px 24px 2px rgba(0,0,0,0.14), 0 6px 30px 5px rgba(0,0,0,0.12);
--shadow-24: 0 11px 15px -7px rgba(0,0,0,0.2), 0 24px 38px 3px rgba(0,0,0,0.14), 0 9px 46px 8px rgba(0,0,0,0.12);
```

### 5.1 阴影使用场景

| 层级 | 阴影 | 用途 |
|------|------|------|
| 0 | 无 | 扁平元素 |
| 1 | shadow-1 | 卡片默认状态 |
| 2 | shadow-2 | 按钮、输入框 |
| 4 | shadow-4 | 悬停卡片 |
| 6 | shadow-6 | 浮动按钮、导航栏 |
| 8 | shadow-8 | 下拉菜单、对话框 |
| 12 | shadow-12 | 侧边抽屉 |
| 16 | shadow-16 | 模态对话框 |
| 24 | shadow-24 | 全屏对话框 |

---

## 6. 圆角规范

```css
--border-radius-none: 0px;
--border-radius-sm: 4px;
--border-radius-md: 6px;    /* 按钮标准圆角 */
--border-radius-lg: 8px;    /* 卡片标准圆角 */
--border-radius-xl: 12px;
--border-radius-pill: 9999px;
--border-radius-circle: 50%;
```

### 6.1 组件圆角（基于系统截图）

| 组件 | 圆角 | 说明 |
|------|------|------|
| **Button** | 6px | 标准按钮（基于系统截图）|
| **Button (Rounded)** | 9999px | 圆角按钮 |
| **Card** | 8px | 卡片（基于系统截图）|
| **Dialog** | 8px | 对话框 |
| **Input** | 6px | 输入框 |
| **Chip** | 16px | 标签芯片 |
| **Avatar** | 50% | 头像（圆形） |

---

## 7. 组件规范

### 7.1 按钮（Buttons）

#### 尺寸

| 类型 | 高度 | 内边距 | 字体大小 |
|------|------|--------|----------|
| **Small** | 28px | 0 12px | 12px |
| **Default** | 36-40px | 8px 16px | 14px |
| **Large** | 44px | 0 24px | 14px |

#### 按钮类型

**1. Primary Button（主要按钮 - 基于系统截图）**

```css
.btn-primary {
  background-color: #3B82F6;
  color: white;
  border-radius: 6px;
  padding: 8px 16px;
  font-weight: 500;
  font-size: 14px;
  border: none;
  cursor: pointer;
  transition: background-color 0.15s;
}

.btn-primary:hover {
  background-color: #2563EB;
}

.btn-primary:active {
  background-color: #1D4ED8;
}
```

**2. Secondary Button（次要按钮）**

```css
.btn-secondary {
  background-color: white;
  color: #374151;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
}

.btn-secondary:hover {
  background-color: #F3F4F6;
}
```

**3. Danger Button（危险按钮）**

```css
.btn-danger {
  background-color: #EF4444;
  color: white;
  border-radius: 6px;
  padding: 8px 16px;
  font-weight: 500;
  border: none;
  cursor: pointer;
}

.btn-danger:hover {
  background-color: #DC2626;
}
```

**4. Icon Button（图标按钮）**

```css
.btn-icon {
  width: 36px;
  height: 36px;
  padding: 0;
  border-radius: 6px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover {
  background-color: #F3F4F6;
}
```

### 7.2 输入框（Text Fields - 基于系统截图）

```css
.input {
  background-color: white;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 14px;
  height: 36-40px;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.input:focus {
  outline: none;
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input::placeholder {
  color: #9CA3AF;
}

.input:disabled {
  background-color: #F3F4F6;
  color: #9CA3AF;
  cursor: not-allowed;
}
```

### 7.2.1 搜索框

```css
.search-input {
  background-color: #1E2330;  /* 顶部栏深色背景 */
  border: none;
  border-radius: 6px;
  padding: 8px 12px 8px 36px;
  color: white;
  width: 240px;
}

.search-input::placeholder {
  color: #9CA3AF;
}
```

### 7.3 卡片（Cards - 基于系统截图）

```css
.card {
  background-color: white;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 20-24px;
}

.card-header {
  font-size: 16px;
  font-weight: 500;
  color: #1F2937;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #E5E7EB;
}
```

### 7.3.1 统计卡片

```css
.stat-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #E5E7EB;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #1F2937;
}

.stat-label {
  font-size: 14px;
  color: #6B7280;
  margin-top: 4px;
}
```

### 7.4 表格（Data Tables - 基于系统截图）

```css
.table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
}

.table th {
  background-color: #F9FAFB;
  font-size: 12px;
  font-weight: 600;
  color: #6B7280;
  text-align: left;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 12px 16px;
  border-bottom: 1px solid #E5E7EB;
}

.table td {
  font-size: 14px;
  color: #1F2937;
  padding: 14px 16px;
  border-bottom: 1px solid #E5E7EB;
}

.table tr {
  height: 48-56px;
}

.table tbody tr:hover {
  background-color: #F3F4F6;
}

.table tbody tr.selected {
  background-color: #EFF6FF;
}
```

### 7.4.1 分页组件

```css
.pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 0;
}

.pagination-item {
  min-width: 32px;
  height: 32px;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #6B7280;
  cursor: pointer;
}

.pagination-item:hover {
  border-color: #3B82F6;
  color: #3B82F6;
}

.pagination-item.active {
  background-color: #3B82F6;
  border-color: #3B82F6;
  color: white;
}
```

### 7.5 侧边栏（Sidebar - 基于系统截图）

```css
.sidebar {
  width: 220px;
  background-color: #1A1F2E;  /* 深蓝灰 */
  min-height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
}

.sidebar-logo {
  height: 64px;
  background-color: #0F1419;
  display: flex;
  align-items: center;
  padding: 0 16px;
  color: white;
  font-weight: 600;
  font-size: 18px;
}

.sidebar-nav-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: #E5E7EB;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.15s;
  gap: 12px;
}

.sidebar-nav-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.sidebar-nav-item.active {
  background-color: rgba(59, 130, 246, 0.1);
  color: white;
  border-left: 3px solid #3B82F6;  /* 蓝色指示条 */
  padding-left: 13px;  /* 补偿边框宽度 */
}

.sidebar-nav-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### 7.6 顶部导航栏（Topbar - 基于系统截图）

```css
.topbar {
  height: 64px;
  background-color: #1E2330;  /* 深灰 */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: fixed;
  top: 0;
  left: 220px;  /* 侧边栏宽度 */
  right: 0;
  z-index: 100;
}

.topbar-search {
  background-color: #1E2330;
  border: none;
  border-radius: 6px;
  padding: 8px 12px 8px 36px;
  color: white;
  width: 280px;
  font-size: 14px;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.topbar-icon {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #E5E7EB;
  cursor: pointer;
  position: relative;
}

.topbar-icon:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.topbar-icon .badge {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 8px;
  height: 8px;
  background-color: #EF4444;
  border-radius: 50%;
}

.topbar-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #3B82F6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}
```

### 7.7 面包屑

```css
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  margin-bottom: 16px;
}

.breadcrumb-item {
  color: #6B7280;
}

.breadcrumb-item a {
  color: #6B7280;
  text-decoration: none;
}

.breadcrumb-item a:hover {
  color: #3B82F6;
}

.breadcrumb-item.current {
  color: #1F2937;
}

.breadcrumb-separator {
  color: #9CA3AF;
}
```

### 7.7 对话框（Dialogs）

```css
.v-dialog {
  background-color: white;
  border-radius: 4px;
  box-shadow: var(--shadow-24);
  max-width: 560px;
}

.v-dialog--fullscreen {
  border-radius: 0;
}

.v-card__title {
  font-size: 20px;
  font-weight: 500;
  padding: 24px 24px 0;
}

.v-card__text {
  padding: 20px 24px;
}

.v-card__actions {
  padding: 8px;
}
```

### 7.8 芯片（Chips）

```css
.v-chip {
  height: 32px;
  border-radius: 16px;
  padding: 0 12px;
  font-size: 14px;
  background-color: #E0E0E0;
}

.v-chip--outlined {
  background-color: transparent;
  border: 1px solid currentColor;
}

.v-chip--label {
  border-radius: 4px;
}
```

### 7.9 标签页（Tabs）

```css
.v-tabs {
  height: 48px;
}

.v-tab {
  padding: 0 16px;
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1.25px;
  color: var(--text-secondary);
}

.v-tab--active {
  color: var(--primary);
}

.v-tabs-slider {
  height: 2px;
  background-color: var(--primary);
}
```

### 7.10 分页（Pagination）

```css
.v-pagination__item {
  min-width: 34px;
  height: 34px;
  border-radius: 4px;
  font-size: 14px;
}

.v-pagination__item--active {
  background-color: var(--primary);
  color: white;
}

.v-pagination__navigation {
  width: 34px;
  height: 34px;
  border-radius: 4px;
}
```

---

## 8. 动画与过渡

### 8.1 缓动函数

```css
--ease-standard: cubic-bezier(0.4, 0.0, 0.2, 1);
--ease-decelerate: cubic-bezier(0.0, 0.0, 0.2, 1);
--ease-accelerate: cubic-bezier(0.4, 0.0, 1, 1);
--ease-sharp: cubic-bezier(0.4, 0.0, 0.6, 1);
```

### 8.2 持续时间

```css
--duration-instant: 0ms;
--duration-fast: 150ms;
--duration-normal: 200ms;
--duration-slow: 300ms;
--duration-slower: 375ms;
--duration-slowest: 500ms;
```

### 8.3 常用过渡

```css
/* 悬停效果 */
--transition-hover: background-color 150ms var(--ease-standard);

/* 按钮点击 */
--transition-btn: box-shadow 280ms var(--ease-standard);

/* 卡片提升 */
--transition-elevation: box-shadow 280ms var(--ease-standard);

/* 对话框打开 */
--transition-dialog: transform 300ms var(--ease-decelerate), opacity 300ms var(--ease-standard);

/* 菜单展开 */
--transition-menu: transform 250ms var(--ease-standard), opacity 200ms var(--ease-standard);

/* 页面切换 */
--transition-page: transform 300ms var(--ease-standard);
```

---

## 9. 页面结构规范

### 9.1 列表页结构（基于系统截图）

```
┌────────────────────────────────────────────────────────────────┐
│ ┌──────┐                                                       │
│ │ LOGO │  [搜索框...                     ]  [通知] [设置] [头像]│  ← Topbar
│ └──────┤                                                        │
│ ┌──────┐ ┌──────────────────────────────────────────────────┐ │
│ │      │ │ 面包屑：首页 > 模块 > 页面                        │ │
│ │ 侧边栏│ ├──────────────────────────────────────────────────┤ │
│ │      │ │ ┌────┐ ┌────┐ ┌────┐ ┌────┐                      │ │
│ │ 菜单1│ │ │统计│ │统计│ │统计│ │统计│  ← 统计卡片           │ │
│ │ 菜单2│ │ └────┘ └────┘ └────┘ └────┘                      │ │
│ │ 菜单3│ │ ┌──────────────────────────────────────────────┐ │ │
│ │      │ │ │ [搜索...] [筛选▼] [日期▼] [+新增]             │ │ │
│ │      │ │ ├──────────────────────────────────────────────┤ │ │
│ │      │ │ │ 列1    │ 列2    │ 列3    │ 列4    │ 操作      │ │
│ │      │ │ ├────────┼────────┼────────┼────────┼──────────┤ │
│ │      │ │ │ 数据   │ 数据   │ [标签] │ 数据   │ [查看][⋮]│ │
│ │      │ │ │ 数据   │ 数据   │ [标签] │ 数据   │ [查看][⋮]│ │
│ │      │ │ └────────┴────────┴────────┴────────┴──────────┘ │ │
│ │      │ │                            [< 1 2 3 4 5 >]         │ │
│ └──────┘ └──────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

### 9.2 表单页结构

```
┌────────────────────────────────────────────────────────────────┐
│ ┌──────┐  [← 返回] 页面标题                      [取消] [保存] │
│ └──────┤                                                        │
│ ┌──────┐ ┌──────────────────────────────────────────────────┐ │
│ │ 侧边栏│ │ 卡片                                              │ │
│ │      │ │ ┌──────────────────┐ ┌────────────────────────┐  │ │
│ │      │ │ │ 字段1 *          │ │ 字段3                  │  │ │
│ │      │ │ │ [输入框         ]│ │ [输入框               ]│  │ │
│ │      │ │ │                  │ │                        │  │ │
│ │      │ │ │ 字段2 *          │ │ 字段4                  │  │ │
│ │      │ │ │ [下拉选择      ▼]│ │ [输入框               ]│  │ │
│ │      │ │ └──────────────────┘ └────────────────────────┘  │ │
│ │      │ └──────────────────────────────────────────────────┘ │
│ └──────┘                                                       │
└────────────────────────────────────────────────────────────────┘
```

### 9.2 详情页结构

```
┌─────────────────────────────────────────────────────────┐
│ [← 返回] 页面标题                            [编辑] [删除] │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────┐ ┌───────────────────────────────────┐ │
│ │                 │ │ 基础信息                           │ │
│ │    [图片/       │ │ 编码：XXX-20260131-001            │ │
│ │     图表]       │ │ 状态：[已生效]                     │ │
│ │                 │ │ 名称：示例名称                      │ │
│ │                 │ │ 创建时间：2026-01-31 10:00:00     │ │
│ └─────────────────┘ └───────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 业务信息                                             │ │
│ │ 字段1：值1                                           │ │
│ │ 字段2：值2                                           │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 明细列表                                  [添加明细] │ │
│ │ ┌───────┬───────┬───────┬───────┬────────────────┐  │ │
│ │ │ 列1   │ 列2   │ 列3   │ 列4   │      操作      │  │ │
│ │ ├───────┼───────┼───────┼───────┼────────────────┤  │ │
│ │ │ 数据  │ 数据  │ 数据  │ 数据  │  编辑   删除   │  │ │
│ │ └───────┴───────┴───────┴───────┴────────────────┘  │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 9.3 表单页结构

```
┌─────────────────────────────────────────────────────────┐
│ [← 返回] 页面标题                                        │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 基础信息                                             │ │
│ │ 字段1 *：[输入框                                     ] │ │
│ │ 字段2 *：[下拉选择                ▼]                  │ │
│ │ 字段3：  [输入框                                     ] │ │
│ │ 字段4：  [多行文本                                   ] │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 明细列表                                    [添加明细] │ │
│ │ ┌───────┬───────┬───────┬────────────────────────┐  │ │
│ │ │ 列1   │ 列2   │ 列3   │         操作           │  │ │
│ │ ├───────┼───────┼───────┼────────────────────────┤  │ │
│ │ │[输入] │[输入] │[输入] │        [删除]          │  │ │
│ │ └───────┴───────┴───────┴────────────────────────┘  │ │
│ └─────────────────────────────────────────────────────┘ │
│                              [取消]        [保存]       │
└─────────────────────────────────────────────────────────┘
```

---

## 10. 数据格式化规范

### 10.1 日期格式

```javascript
// 日期
'YYYY-MM-DD'        // 2026-01-31

// 日期时间
'YYYY-MM-DD HH:mm'  // 2026-01-31 14:30
'YYYY-MM-DD HH:mm:ss' // 2026-01-31 14:30:00

// 相对时间
'2分钟前'
'1小时前'
'昨天 14:30'
```

### 10.2 数字格式

```javascript
// 整数
'1,234'

// 金额
'$12,345.67'
'¥12,345.67'

// 百分比
'85.50%'

// 数量
'1,234 件'
'1,234.56 kg'
```

### 10.3 状态标签

使用 Chip 组件展示状态：

```html
<!-- 成功 -->
<v-chip color="success" text-color="white">已完成</v-chip>

<!-- 警告 -->
<v-chip color="warning" text-color="white">待处理</v-chip>

<!-- 错误 -->
<v-chip color="error" text-color="white">已取消</v-chip>

<!-- 信息 -->
<v-chip color="info" text-color="white">进行中</v-chip>

<!-- 默认 -->
<v-chip>草稿</v-chip>
```

### 10.4 空值展示

```html
<!-- 空值 -->
<span class="text--disabled">—</span>

<!-- 空状态 -->
<v-empty-state
  icon="mdi-inbox"
  label="暂无数据"
  description="点击上方按钮添加数据"
/>
```

---

## 11. 实现建议

### 11.1 CSS变量完整定义（基于系统截图）

```css
:root {
  /* 主题色 */
  --primary: #3B82F6;
  --primary-dark: #2563EB;
  --primary-light: #60A5FA;
  --primary-lighten: #EFF6FF;

  /* 状态色 */
  --error: #EF4444;
  --info: #3B82F6;
  --success: #10B981;
  --warning: #F59E0B;

  /* 布局专用色 */
  --sidebar-bg: #1A1F2E;
  --topbar-bg: #1E2330;
  --card-bg: #FFFFFF;
  --page-bg: #F9FAFB;
  --border-color: #E5E7EB;

  /* 表格 */
  --table-header-bg: #F9FAFB;
  --table-row-hover: #F3F4F6;
  --table-row-selected: #EFF6FF;

  /* 中性色 */
  --surface: #FFFFFF;
  --background: #F9FAFB;
  --divider: #E5E7EB;
  --disabled: #D1D5DB;

  /* 文字色 */
  --text-primary: #1F2937;
  --text-secondary: #6B7280;
  --text-disabled: #9CA3AF;

  /* 间距 */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;

  /* 字体 */
  --font-family: -apple-system, 'Microsoft YaHei', 'PingFang SC', 'Segoe UI', sans-serif;
  --font-family-mono: 'SF Mono', 'Monaco', 'Consolas', monospace;

  /* 圆角 */
  --border-radius-sm: 4px;
  --border-radius-md: 6px;   /* 按钮 */
  --border-radius-lg: 8px;   /* 卡片 */
  --border-radius-pill: 9999px;

  /* 过渡 */
  --transition-fast: 150ms ease;
  --transition-normal: 200ms ease;
}
```

### 11.2 推荐技术栈

- **框架**：Vue 2.x / Vue 3.x
- **UI库**：Vuetify 2.x / 3.x
- **图标**：Material Design Icons
- **字体**：Google Roboto

### 11.3 HTML模板

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Demo Title</title>
  
  <!-- Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet">
  
  <!-- Material Design Icons -->
  <link href="https://cdn.jsdelivr.net/npm/@mdi/font@6.x/css/materialdesignicons.min.css" rel="stylesheet">
  
  <!-- Vuetify CSS -->
  <link href="https://cdn.jsdelivr.net/npm/vuetify@2.x/dist/vuetify.min.css" rel="stylesheet">
  
  <style>
    /* 自定义样式 */
    :root {
      --primary: #1976D2;
      /* ... */
    }
  </style>
</head>
<body>
  <div id="app">
    <v-app>
      <!-- 页面内容 -->
    </v-app>
  </div>
  
  <!-- Vue -->
  <script src="https://cdn.jsdelivr.net/npm/vue@2.x/dist/vue.js"></script>
  <!-- Vuetify -->
  <script src="https://cdn.jsdelivr.net/npm/vuetify@2.x/dist/vuetify.js"></script>
  
  <script>
    new Vue({
      el: '#app',
      vuetify: new Vuetify({
        theme: {
          themes: {
            light: {
              primary: '#1976D2',
              secondary: '#424242',
              accent: '#82B1FF',
              error: '#FF5252',
              info: '#2196F3',
              success: '#4CAF50',
              warning: '#FFC107'
            }
          }
        }
      })
    });
  </script>
</body>
</html>
```

---

## 附录

### A. 颜色速查表

| 用途 | 颜色值 | 预览 |
|------|--------|------|
| Primary | #3B82F6 | ⬛ |
| Sidebar BG | #1A1F2E | ⬛ |
| Topbar BG | #1E2330 | ⬛ |
| Success | #10B981 | ⬛ |
| Warning | #F59E0B | ⬛ |
| Error | #EF4444 | ⬛ |
| Border | #E5E7EB | ⬛ |

### B. 组件尺寸速查

| 组件 | 默认高度 | 内边距 |
|------|----------|--------|
| Button | 36px | 0 16px |
| Input | 56px | 0 12px |
| Card Header | 64px | 16px |
| Table Row | 48px | 0 16px |
| Chip | 32px | 0 12px |
| App Bar | 64px | 0 16px |

### C. 修订记录

| 版本 | 日期 | 修订内容 | 修订人 |
|------|------|----------|--------|
| V3.0 | 2026-03-19 | 基于实际系统截图分析，更新为主色#3B82F6，添加侧边栏/顶部栏深色风格 | AI Assistant |
| V2.0 | 2026-03-18 | 基于 Vuetify 2 / Material Design 重新设计 | AI Assistant |
| V1.0 | 2026-01-31 | 初始版本 | Vitamin |
