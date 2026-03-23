# POD Design Studio — 项目记忆

> 项目级上下文，新对话涉及此项目时读取。

---

## 项目概况

- **项目名称**：POD 产品定制设计器（POD Design Studio）
- **当前版本**：v4（正式版）
- **PRD 路径**：`prds/pod-design-studio/PRD-v4-final.md`
- **状态**：PRD 完成，等待开发排期
- **负责人**：Dennis

---

## 系统覆盖范围

| 系统 | 模块 | 状态 |
|------|------|------|
| POD Platform（独立平台）| Design Studio 设计器 | PRD 完成 |
| Shopify App | Theme Extension + App Block | PRD 完成，有 Demo |
| Merchant Admin（商家后台）| POD 产品管理、订单管理 | PRD 完成 |
| ShipSage Admin（运营后台）| 印刷作业管理、供应商管理 | PRD 完成 |
| ShipSage WMS | Print Work Order（印刷工单）| PRD 完成 |
| BI | POD 成本/毛利报表 | PRD 完成 |

---

## 关键技术决策

| 决策点 | 选择 | 理由 |
|--------|------|------|
| 设计器前端框架 | Fabric.js | 成熟的 Canvas 库，支持对象模型操作 |
| Shopify 集成方式 | Theme Extension + App Block | 无需修改主题代码，兼容性最好 |
| WMS 履约方式 | 复用 VAS 工单流程 | 无需新建流程，插入 Pick→Pack 之间 |
| 印刷文件生成 | 异步队列（SLA <5min）| 同步生成阻塞用户体验 |
| 多平台支持 | 独立 Platform + Shopify App 双入口 | 覆盖独立站和 Shopify 商家 |

---

## Demo 文件

| 版本 | 路径 | 说明 |
|------|------|------|
| v4（最新）| `prds/pod-design-studio/demo-v4/` | 完整多系统 Demo，含 hub/merchant/admin/wms/bi/studio/embed |
| v3 | `prds/pod-design-studio/demo-v3/` | 旧版，已被 v4 替代 |
| Shopify App | `prds/pod-design-studio/shopify-app/` | Shopify Theme Extension 代码 |

---

## 遗留问题 / 待确认

- [ ] 印刷供应商 API 对接方式（Printful / Printify / 自有供应商）
- [ ] 开发排期确认
- [ ] Shopify App 上架 App Store 审核流程

---

## 版本历史

| 版本 | 日期 | 主要变化 |
|------|------|----------|
| v1 | 2026 初 | 基础设计器 POC |
| v2/v3 | 2026-02 | 多系统覆盖，增加 WMS 履约 |
| v4 | 2026-03-19 | 完整版：补充数据库设计、非功能需求、验收标准汇总 |

---

*最后更新：2026-03-19*
