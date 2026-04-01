---
name: frontend-designer
description: 前端Demo生成专家。当需要生成前端Demo、可视化原型、交互页面时调用。
---

# Frontend Designer Skill

## 规范文件（必读）

生成 Demo 前先读取 `design/frontend-standards.md`（统一前端规范 SSOT，包含设计背景、颜色/组件/模板规范与执行 SOP）。

## 技术选型

| 场景 | 技术 |
|------|------|
| 快速单页原型 | 纯 HTML + Tailwind CSS CDN |
| 多页面系统 Demo | 多个 HTML + 共享 CSS 变量 |
| 复杂交互（设计器类）| React + Fabric.js（CDN）|
| 数据表格/后台页面 | HTML + Tailwind + 内联 Mock 数据 |

**原则**：优先单文件可运行，无需构建工具，直接双击打开。

## 输出结构

```
prds/[模块名]/demo/
├── index.html       # 主入口
├── detail.html      # 详情页
├── [role].html      # 按角色分页
└── studio.html      # 设计器（如有）
```

## 质量检查

生成后自检：
- [ ] 浏览器直接打开无报错
- [ ] Mock 数据覆盖正常/空/异常三种状态
- [ ] 所有枚举状态都有对应颜色标签
- [ ] 关键操作有交互反馈（弹窗/Toast）
- [ ] 响应式布局无横向滚动

## 多系统导航 Hub

当 PRD 涉及多个系统（Admin/WMS/Merchant/BI），必须生成 `index.html` 作为导航中心。

## 注意事项

- 不使用外部字体 CDN，使用系统字体栈
- 图标优先用 Unicode/Emoji
- 颜色优先用 Tailwind 预设类
