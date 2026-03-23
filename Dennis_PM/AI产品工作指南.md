# ShipSage AI 产品工作指南

> 本文档面向产品经理，说明本工作空间内所有文档和工具的作用、使用时机及使用方式，帮助快速上手 AI 辅助产品工作流程。

---

## 目录

1. [整体工作流程概览](#一整体工作流程概览)
2. [工作流文件 Workflows](#二工作流文件-workflows)
3. [技能文件 Skills](#三技能文件-skills)
4. [业务上下文文档 Context](#四业务上下文文档-context)
5. [系统技术文档 Docs](#五系统技术文档-docs)
6. [数据导入工具 Tools](#六数据导入工具-tools)
7. [模板文件 Templates](#七模板文件-templates)
8. [文件组织规范](#八文件组织规范)
9. [快速上手：典型工作场景](#九快速上手典型工作场景)
10. [常见问题](#十常见问题)

---

## 一、整体工作流程概览

本工作空间将产品工作拆分为 **4个阶段**，每个阶段对应一个工作流文件和若干专业技能。

核心原则：不要跳步。每个阶段都有明确的输入和输出，上一阶段的输出是下一阶段的输入。

- Phase 1 需求洞察：澄清真实需求，输出 RDD（需求定义卡片）
- Phase 2 方案架构：数据建模 + 流程设计 + 风险探测
- Phase 3 规格生成：生成完整 PRD + 前端 Demo（可选）
- Phase 4 验证迭代：自检清单 + 问题回溯 + 最终交付

---

## 二、工作流文件 (Workflows)

文件位置：.agent/workflows/

### Phase 1 — 需求洞察

文件：1-analyze-requirement.md
什么时候用：收到任何新需求时，第一步必须执行。
做什么：加载业务背景，调用 requirement-clarifier 技能，识别伪需求，输出 RDD。
输出文件：drafts/YYYY-MM-DD-需求分析/RDD.md
告诉 AI：「我有一个新需求：[描述]，请执行 Phase 1 需求分析」

### Phase 2 — 方案架构

文件：2-design-solution.md
什么时候用：Phase 1 的 RDD 确认后。
做什么：加载系统文档，调用 data-modeler 设计数据模型，绘制流程图，调用 edge-case-detector 风险探测，输出方案草稿。
输出文件：drafts/YYYY-MM-DD-方案设计/Architecture.md
告诉 AI：「RDD 已确认，请执行 Phase 2 方案架构设计」

### Phase 3 — 规格生成

文件：3-generate-specs.md
什么时候用：方案草稿确认后，需要输出正式 PRD 时。
做什么：读取方案草稿，填充 PRD 模板，业务规则编号（R01、R02...），可选生成前端 Demo，输出 AC List。
输出文件：prds/[模块名]/PRD.md，prds/[模块名]/demo/
告诉 AI：「方案草稿已确认，请执行 Phase 3 生成完整 PRD」

### Phase 4 — 验证迭代

文件：4-verify-iterate.md
什么时候用：PRD 输出后，交付给开发前。
做什么：执行 30+ 项自检（逻辑完整性/数据规范/业务规则/权限安全），发现问题回溯修正，输出 AC Checklist。
告诉 AI：「PRD 已生成，请执行 Phase 4 质量自检」

---

## 三、技能文件 (Skills)

文件位置：.agent/skills/
技能文件通常不需要手动调用，工作流会在合适的时机自动触发。


### requirement-clarifier — 需求挖掘专家

文件：.agent/skills/requirement-clarifier/SKILL.md
职责：识别伪需求，挖掘真实业务价值。

核心框架：
- 黄金圈法则：Why（业务价值）-> Who（角色画像）-> JTBD（待办任务）
- 拦截 X-Y Problem：用户说的是解决方案 X，真正的问题是 Y
- 拦截 Nice to have：不做也不影响核心业务的需求

输出：RDD（需求定义卡片），包含：核心洞察、用户故事、验收标准、建议方案

典型触发场景：
- 老板说「加个按钮」-> 先问为什么
- 运营说「体验不好」-> 先问痛点在哪里
- 客户说「想要导出功能」-> 先问导出了拿去做什么

---

### data-modeler — 数据架构师

文件：.agent/skills/data-modeler/SKILL.md
职责：设计企业级数据模型，包括字段清单、ER 图、索引建议。

核心规范：
- 所有业务表必须含标准管理字段：id / tenant_id / created_at / created_by / updated_at / updated_by / is_deleted / version
- 金额字段必须用 Decimal，禁止 Float/Double
- 状态字段必须定义所有枚举值
- 必须考虑并发控制（version 乐观锁）

严禁反模式：
- 把明细列表拍平成 item1、item2 字段（应拆子表）
- 枚举魔法值（只写 1、2、3，不说明含义）
- 核心业务数据物理删除（必须软删除）

触发时机：Phase 2 数据建模阶段自动调用。

---

### edge-case-detector — 边界风险探测器

文件：.agent/skills/edge-case-detector/SKILL.md
职责：用墨菲定律思维扫描逻辑漏洞，发现深层风险。

五维探测法：

| 维度 | 典型风险 | 解决方向 |
|------|---------|----------|
| 交互与网络 | 用户疯狂点击、断网中断 | 前端防抖 + 后端幂等 |
| 并发竞争 | 两个请求同时扣库存 | 数据库行锁 / 乐观锁 |
| 数据一致性 | 扣款成功但订单没变 | 事务 / MQ 最终一致性 |
| 权限安全 | 改 URL 的 ID 看别人订单 | 后端强制校验归属关系 |
| 时间与环境 | 跨国时区显示错误 | 后端存 UTC，前端本地化 |

输出：风险探测报告，每条风险标注 P0/P1/P2 优先级和解决方案。
触发时机：Phase 2 流程设计完成后自动调用。

---

### shipsage-business-rules — ShipSage 业务规则专家

文件：.agent/skills/shipsage-business-rules/SKILL.md
职责：确保所有设计符合 ShipSage 核心业务逻辑，防止设计违反已有规则。

7 条核心规则（设计时必须遵守）：

| 规则 | 名称 | 核心要点 |
|------|------|----------|
| R1 | 多货主数据隔离 | 所有表必须有 company_id，查询必须带租户条件 |
| R2 | 库存数量字段分离 | qty_available/qty_allocated/qty_on_hand/qty_in_transit/qty_frozen 不可混用；condition_id=5为问题库存 |
| R3 | 入库不可跳步 | 创建ASN -> 收货扫描 -> 质检 -> 上架 -> AVAILABLE |
| R4 | 出库SD流程不可跳 | Confirm->Group->AllocateInventory->CreateShipment->Label->SyncToWMS->拣货->复核->打包->发运 |
| R5 | 订单SD状态机 | SYNCED/CONFIRMED/GROUPED/.../SHIPMENTS_LABELED，ERROR必须人工介入，Final Scan后不可取消 |
| R6 | 费用六类计算 | 运费/操作费/仓储费/入库费/退货费/附加费，每笔费用可追溯到具体单据 |
| R7 | 异常处理闭环 | 发现->标记->工单->处理->验证->归档，不可直接人工处理 |

触发时机：PRD 评审、数据建模、Phase 4 自检时自动调用。


---

## 四、业务上下文文档 (Context)

文件位置：context/
这些文档是 AI 的业务常识库，在需求分析和方案设计阶段会被自动加载。

| 文件 | 作用 | 加载时机 |
|------|------|----------|
| company-shipsage.md | 公司介绍：业务模式、仓库分布、服务能力、核心指标 | 几乎每次需求分析都需要 |
| ShipSage系统功能菜单清单.md | 系统功能边界：判断需求是新功能还是优化现有功能 | 需求分析时必读，防止重复建设 |
| FAQ.md | 常见业务问题和答案 | 遇到业务理解疑问时参考 |

注意：如果 AI 对业务背景理解有误，可以主动说「请先读 context/company-shipsage.md」。

---

## 五、系统技术文档 (Docs)

文件位置：docs/
这些是 ShipSage 各模块的详细系统文档，供 AI 在方案设计时了解现有系统结构，避免与现有设计冲突。

| 文件 | 涵盖内容 | 加载时机（需求关键词） |
|------|---------|------------------------|
| ShipSage_订单模块系统文档.md | 订单全生命周期、状态机、SD流程、面单、追踪 | 订单、发货、标签、追踪 |
| ShipSage_BI_完整系统文档.md | BI报表体系、成本计算逻辑、毛利分析 | BI、成本、报表、统计 |
| ShipSage_上下游系统架构.md | 平台对接、ERP集成、上下游数据流 | 系统集成、平台对接 |
| ShipSage_ASN_模块系统分析报告.md | 入库预约（ASN）模块完整分析 | 入库、ASN、收货 |
| ShipSage_Billing_系统文档.md | 计费系统：费用计算规则、账单生成 | 费用、账单、结算 |
| ShipSage_Transfer_模块系统分析报告.md | 转运模块：仓库间转运流程 | 转运、调拨 |
| ShipSage_VAS_系统文档.md | 增值服务：贴标、拍照、打包等 | VAS、增值服务 |

主动指定方式（AI 没自动加载时）：「请先阅读 docs/ShipSage_订单模块系统文档.md，然后分析这个需求」

---

## 六、数据导入工具 (Tools)

文件位置：tools/
这些工具用于处理运营数据导入场景，与产品需求工作流独立，属于日常运营支撑工具。

### Zone Chart 导入生成器

文件：tools/shipsage-zone-chart-import/SKILL.md
用途：将 FedEx/UPS 等承运商的区域费率表转换为 ShipSage 数据库导入文件，导入到 app_shipsage_zone_chart 表。
使用方式：「我需要导入一份 FedEx 区域表，源文件在 [路径]，请使用 Zone Chart 导入工具」
工作流程：查询 zone_chart_type_id -> 匹配仓库 warehouse_id -> 运行生成脚本 -> 输出导入 Excel
参考文件：tools/shipsage-zone-chart-import/warehouse-name-mapping.md（仓库名称对照表）

### 费用导入生成器

文件：tools/fee-import-generator/SKILL.md
用途：将报价 Excel 中的运费和附加费数据转换为数据库导入文件。
支持版本：CN 版本（fee_version_id 62-67）、US 版本（fee_version_id 87-90）、Gaatu 专属（company_id=1）
适用承运商：FedEx Ground、Amazon Shipping、GOFO Parcel、USPS Ground Advantage
使用方式：「我需要更新 FedEx Ground 的运费报价，源文件在 [路径]，请使用费用导入工具」
工作流程：
1. 选择版本类型（US / CN / Gaatu）
2. 查询 service_id
3. 分析 Excel 结构（支持单表和多表横向布局）
4. 验证数据连续性（重量段和分区必须完整）
5. 确认开始时间（当前时间或自定义）
6. 生成运费导入文件 + 附加费导入文件
7. 运行校验脚本，抽样确认无误后再导入数据库

### 4PL 仓库报价导入

文件：tools/4pl-warehouse-quote-import/SKILL.md
用途：将 4PL 合作仓库报价单转换为系统导入文件，导入到 app_wms_4pl_billing_warehouse_quote 表。
支持五类费用：入库费(3002)、操作费(3006)、退货费(3001)、仓储费(3000)、杂费(3005)
使用方式：「我需要导入 SG-SAV2 仓库的 4PL 报价，报价文件在 [路径]，请使用 4PL 仓库报价导入工具」
工作流程：分析报价文件五个费用区块 -> 匹配数据库参考记录 -> 生成每仓库 48 条导入记录 -> 输出 Excel + SQL 文件


---

## 七、模板文件 (Templates)

文件位置：templates/

| 文件 | 用途 |
|------|------|
| prd-template-cn.md | 中文 PRD 模板，Phase 3 生成 PRD 时自动使用 |
| PRD+TPL.doc | Word 格式 PRD 模板，用于对外交付或存档 |

---

## 八、文件组织规范

草稿阶段 — drafts/
适用需求分析、方案设计等过程产物，路径规则：drafts/YYYY-MM-DD-[主题]/
示例：drafts/2026-03-17-订单拦截/RDD.md、Architecture.md、RiskReport.md

正式版 — prds/
适用验证通过的最终交付物，路径规则：prds/[模块名]/
示例：prds/订单拦截/PRD.md、字段清单.md、demo/

归档 — archive/
需求废弃、系统重构、文档过期时移入，路径规则：archive/[模块名]/

---

## 九、快速上手：典型工作场景

场景 A：收到一个新需求
你说：「我们需要在订单列表增加批量导出功能，请帮我分析」
AI 执行：
  Step 0  自动加载 context/company-shipsage.md + 系统功能菜单清单
  Step 1  用 requirement-clarifier 追问：导出给谁用？导出后做什么？每次导出多少条？
  Step 2  输出 RDD，等你确认后进入方案设计

场景 B：需求确认后设计方案
你说：「RDD 确认了，请开始方案设计」
AI 执行：
  Step 0  自动加载 docs/ShipSage_订单模块系统文档.md
  Step 1  用 data-modeler 设计数据模型和 ER 图
  Step 2  绘制业务流程图（正向 + 逆向 + 异常），用 edge-case-detector 扫描风险
  Step 3  输出方案草稿，等你确认后生成 PRD

场景 C：输出 PRD 并交付
你说：「方案确认，请生成完整 PRD，需要前端 Demo」
AI 执行：Phase 3 填充 PRD 模板并生成 Demo，Phase 4 执行 30+ 项质量自检，输出 AC Checklist

场景 D：更新运费报价（运营工具）
你说：「需要更新 FedEx Ground US 版本运费，源文件在 D:/xxx.xlsx」
AI 执行：fee-import-generator -> 选版本 -> 查 service_id -> 分析 Excel -> 验证连续性 -> 生成文件 -> 校验脚本 -> 确认导入

---

## 十、常见问题

Q：AI 不了解我们的业务背景怎么办？
告诉它「请先读 context/company-shipsage.md」，或者说「你先了解一下 ShipSage 是做什么的」。

Q：AI 设计的数据模型与现有系统冲突怎么办？
告诉它「请先读 docs/[对应模块文档]，对照现有表结构重新设计」。

Q：AI 跳过了某个阶段直接给方案怎么办？
明确告诉它「请先执行 Phase 1 需求分析，不要直接给方案」。

Q：草稿生成后想直接修改 PRD，不想走完整流程怎么办？
可以。直接说「请基于现有草稿生成 PRD，跳过需求分析阶段」，AI 会跳过 Phase 1-2 直接执行 Phase 3。

Q：想单独调用某个技能怎么办？
直接说技能名称即可，例如「请用 edge-case-detector 检查这个流程图的边界情况」。

Q：PRD 生成后发现需求理解有误怎么办？
按 Phase 4 的问题回溯表操作：需求理解错误回 Phase 1；数据模型缺陷回 Phase 2 Step 1；边界遗漏回 Phase 2 Step 2。修正后必须重新执行 Phase 4 自检。

---

## 附：文档与工具速查表

| 类型 | 文件/文件夹 | 作用一句话 |
|------|------------|------------|
| 入口文件 | AGENT.MD | AI 工作空间导航地图 |
| 行为规范 | .agent/rules/project-rule.md | AI 的输出标准和协作习惯 |
| 工作流 | .agent/workflows/1~4.md | 产品工作四个阶段的执行脚本 |
| 技能 | .agent/skills/ | 专业领域的 AI 能力模块 |
| 业务背景 | context/ | ShipSage 公司和系统的基础知识 |
| 系统文档 | docs/ | 各模块现有系统的详细设计 |
| 运营工具 | tools/ | 数据导入文件生成工具 |
| PRD 模板 | templates/ | 标准 PRD 格式模板 |
| 工作草稿 | drafts/ | 过程产物暂存 |
| 正式文档 | prds/ | 最终交付 PRD |
| 历史归档 | archive/ | 废弃和历史文档 |

