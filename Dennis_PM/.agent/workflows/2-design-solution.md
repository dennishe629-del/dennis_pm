---
description: 阶段2：方案架构 - 先搭骨架后填肉，设计严谨的实体模型和业务流程
---

# Workflow: Phase 2 - 方案架构 (Architecture)

此工作流用于**方案设计阶段**。在写文档前，先确保地基稳固。

## 步骤 0: 加载系统文档（System Context Loading）

> **Goal**: 在设计前，先了解现有系统的数据模型和业务流程，避免重复设计或与现有结构冲突。

根据需求涉及的模块，**优先读取对应的系统文档**：

参考 `context/docs-index.md` 按关键词查找对应文档。常见场景快速索引：

| 需求涉及模块 | 需加载的文档 |
|-------------|-------------|
| 订单、SD流程、发货、标签 | `docs/ShipSage_订单模块系统文档.md` |
| BI、成本、毛利、报表 | `docs/ShipSage_BI_完整系统文档.md` |
| 平台架构、上下游集成 | `docs/ShipSage_上下游系统架构.md` |
| 入库、ASN、发货计划、收货 | `docs/ShipSage_ASN_模块系统分析报告.md` |
| 费用、账单、运费、报价、结算 | `docs/ShipSage_Billing_系统文档.md` |
| 转运、调拨、FBA补货 | `docs/ShipSage_Transfer_模块系统分析报告.md` |
| 增值服务、VAS、贴标、拍照、改包装 | `docs/ShipSage_VAS_系统文档.md` |
| 退货、逆向物流、退件入库 | `docs/ShipSage_Return_模块系统分析报告.md` |
| 通用业务背景 | `context/company-shipsage.md` |

**重点关注**：
- 现有核心表结构和字段（避免新增重复字段）
- 现有状态机（新需求须兼容已有状态流转）
- 现有关联关系（新表设计须与现有表正确关联）

**业务规则合规校验**（每次设计必须执行）：

阅读 `.agent/skills/shipsage-business-rules/SKILL.md`，对当前方案进行合规校验，重点检查：
- 多货主数据隔离（所有表含 `company_id`，查询必须带租户条件）
- 库存字段规范（qty_available / qty_allocated 等不可混用）
- 金额字段使用 Decimal（禁止 Float/Double）
- 涉及库存/余额的表必须有 `version` 乐观锁字段
- 软删除规范（`is_deleted` 而非物理删除）

---

## 步骤 1: 实体建模 (Data Modeling)

> **Goal**: 确定数据结构。

**调用方式**: 阅读`.agent/skills/data-modeler/SKILL.md`，按照其指引执行

**输入**:

- Phase 1 生成的 RDD（需求定义卡片）
- 用户故事中涉及的核心实体
- 步骤0中加载的现有系统文档

**执行步骤**:

1. 读取 Phase 1 生成的 RDD。
2. 对照系统文档，确认需求是新增实体还是扩展现有实体。
3. 识别核心实体（Entity）和聚合根（Aggregate Root）。
4. 设计字段清单，严格遵循企业级规范（包含审计字段、枚举值定义、索引建议）。
5. 绘制 ER 图，标注关系类型（One-to-Many, Many-to-One等），**标明与现有表的关联**。

**输出期望**:

- 实体模型设计表格（包含字段名、类型、约束、枚举值）
- ER 关系图（Mermaid格式）
- 关键设计说明（如：为何使用软删除、乐观锁等）

## 步骤 2: 流程编排 (Process Design)

> **Goal**: 确定业务流转。

**输入**:

- 步骤1生成的数据模型
- 业务正向流程描述

**执行步骤**:

1. 绘制 Mermaid 流程图（包含正向流程 + 逆向流程 + 异常分支）。
2. 调用 **Skill: `edge-case-detector`** 对流程图进行"攻击性测试"。
   - **调用方式**: 阅读`.agent/skills/edge-case-detector/SKILL.md`
   - **输入**: RDD + 数据模型 + 流程图
   - **输出**: 深度风险探测报告（5维扫描：交互/并发/一致性/权限/时间）
3. 识别并发、异常、权限等风险点，并给出解决方案。

**输出期望**:

- 完整业务流程图（正向+逆向+异常）
- 风险探测报告（P0/P1/P2优先级分类）
- 每条风险必须包含：场景描述 + 风险等级 + 解决方案

## 步骤 3: 方案草稿 (Drafting)

> **Goal**: 形成方案闭环。

将字段表、流程图、风险清单整合成《核心方案设计草稿》，保存到 `drafts/YYYY-MM-DD-方案设计/Architecture.md`。

**Checkpoint**: 询问用户方案逻辑是否闭环，是否可以进入 specs 生成阶段。
