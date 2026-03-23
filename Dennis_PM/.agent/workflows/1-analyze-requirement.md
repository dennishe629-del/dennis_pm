---
description: 阶段1：需求洞察 - 拒绝伪需求，把一句话需求转化为严谨的RDD
---

# Workflow: Phase 1 - 需求洞察 (Insight)

此工作流用于**需求分析阶段**。不要直接开始写方案，先搞清楚"为什么做"和"为谁做"。

## 步骤 0: 加载业务背景（Context Loading）

> **Goal**: 在分析需求前，先建立业务认知基线，确保需求分析有正确的业务语境。

**必须加载**：
- `context/company-shipsage.md` — 公司业务模式、核心能力
- `context/ShipSage系统功能菜单清单.md` — 系统功能边界（判断需求是新功能还是优化现有功能）

**按需加载**（根据需求涉及的模块）：

参考 `context/docs-index.md` 按关键词查找对应文档。常见场景快速索引：

| 需求关键词 | 需加载的文档 |
|-----------|-------------|
| 订单、发货、SD流程、标签、追踪 | `docs/ShipSage_订单模块系统文档.md` |
| BI、成本、毛利、报表、统计 | `docs/ShipSage_BI_完整系统文档.md` |
| 系统集成、平台对接、上下游 | `docs/ShipSage_上下游系统架构.md` |
| 入库、ASN、发货计划、收货 | `docs/ShipSage_ASN_模块系统分析报告.md` |
| 费用、账单、运费、报价、结算 | `docs/ShipSage_Billing_系统文档.md` |
| 转运、调拨、FBA补货 | `docs/ShipSage_Transfer_模块系统分析报告.md` |
| 增值服务、VAS、贴标、拍照、改包装 | `docs/ShipSage_VAS_系统文档.md` |
| 退货、逆向物流、退款、退件入库 | `docs/ShipSage_Return_模块系统分析报告.md` |
| 常见业务问题、客户FAQ | `context/FAQ.md` |

加载后，提取以下信息作为需求分析的背景：
- 该模块现有核心功能和边界
- 相关角色和权限
- 现有业务规则和约束

---

## 步骤 1: 需求澄清与追问 (Clarify)

> **Goal**: 识别并拦截伪需求，挖掘业务价值。

请调用 **Skill: `requirement-clarifier`** 执行以下操作：

**调用方式**: 阅读`.agent/skills/requirement-clarifier/SKILL.md`，按照其指引执行

**输入**:

- 用户的原始需求描述（一句话或多句话）
- 步骤0中加载的业务背景信息

**执行步骤**:

1. 分析用户输入的原始需求。
2. 识别是否存在 "X-Y Problem"（即用户给的是解决方案而非问题）。
3. 结合系统现有功能判断：是全新需求、还是现有功能的扩展/优化？
4. 使用 JTBD 和 USM 框架进行结构化追问（如果信息不全）。

**输出期望**:

- 如果需求模糊，提出3个关键问题给用户，直到信息足够
- 如果需求清晰，转至步骤2生成RDD

## 步骤 2: 需求定义 (Define)

> **Goal**: 将模糊需求转化为结构化的定义。

当信息收集完整后，使用 `requirement-clarifier` Skill 中定义的模板，输出《需求定义卡片(RDD)》。

**必须包含**:

- 核心洞察 (Insight)
- 用户故事 (User Story)
- 验收标准 & NFR
- 建议方案（MVP vs 理想方案）
- 专家建议

**质量检查**:

- [ ] 是否识别出真实痛点（非伪需求）
- [ ] 业务价值是否量化（High/Medium/Low）
- [ ] 验收标准是否可测试

## 步骤 3: 归档 (Archive)

将生成的RDD保存到 `drafts/YYYY-MM-DD-需求分析/RDD.md`，并询问用户是否进入下一阶段（方案架构）。
 