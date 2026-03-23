# Dennis PM — AI 工作空间

> 本项目是 ShipSage 产品经理的 AI 辅助工作空间，用于需求分析、方案设计、PRD 生成和迭代优化。

## 项目背景

- **公司**: ShipSage 北美海外仓仓配服务商
- **角色**: 产品经理（AI 协作）
- **核心系统**: 自研 WMS + OMS 双系统

详见 `context/company-shipsage.md`。

---

## 工作流（按阶段调用）

| 阶段 | 文件 | 说明 |
|------|------|------|
| Phase 1 需求洞察 | `.agent/workflows/1-analyze-requirement.md` | 澄清需求、生成 RDD |
| Phase 2 方案架构 | `.agent/workflows/2-design-solution.md` | 数据建模、方案设计 |
| Phase 3 规格生成 | `.agent/workflows/3-generate-specs.md` | 生成 PRD 和 Demo |
| Phase 4 验证迭代 | `.agent/workflows/4-verify-iterate.md` | 自检与优化 |

---

## 可用技能（Skills）

| 技能 | 路径 | 适用场景 |
|------|------|----------|
| requirement-clarifier | `.agent/skills/requirement-clarifier/SKILL.md` | 需求模糊时澄清追问 |
| data-modeler | `.agent/skills/data-modeler/SKILL.md` | 数据建模、字段设计 |
| edge-case-detector | `.agent/skills/edge-case-detector/SKILL.md` | 边界和异常用例排查 |
| shipsage-business-rules | `.agent/skills/shipsage-business-rules/SKILL.md` | ShipSage 核心业务规则校验 |
| frontend-designer | `.agent/skills/frontend-designer/SKILL.md` | 将PRD线框图转化为可运行的HTML Demo |

---

## 工具（Tools）

| 工具 | 路径 | 说明 |
|------|------|------|
| Zone Chart 导入生成器 | `tools/shipsage-zone-chart-import/SKILL.md` | 生成区域费率导入文件 |
| 费用导入生成器 | `tools/fee-import-generator/SKILL.md` | 生成费用导入 Excel |
| 4PL 仓库报价导入 | `tools/4pl-warehouse-quote-import/SKILL.md` | 生成报价导入文件 |

---

## 文件组织

- `context/` — 业务背景文档（系统功能清单、公司介绍等）
- `docs/` — 系统技术文档（订单、BI、上下游架构）
- `drafts/` — 进行中的草稿（按 `YYYY-MM-DD-主题` 命名）
- `prds/` — 正式 PRD 文档
- `templates/` — PRD 模板
- `archive/` — 废弃/历史文档

---

## 快速开始

收到新需求时，从 Phase 1 开始：
阅读 `.agent/workflows/1-analyze-requirement.md`，按步骤执行。

---

## Plan / Agent 模式切换 SOP

> 适用于 Cursor 双模式工作场景。核心原则：**先 Plan 定结构，再 Agent 出内容，最后 Plan 做评审**。

### 模式选择口诀

| 你要做的事 | 用哪个模式 |
|-----------|----------|
| 不确定做什么、怎么做 | `plan` |
| 要产出文件、改文档、跑脚本 | `agent` |
| 要开会汇报、出评审摘要 | `plan` |

---

### Phase 0 — 任务初始化（Plan 模式）

**目标**：把需求定义清楚，不急着写文档。

输入：需求背景（口述）+ `prds/*` 历史版本 + `templates/prd-template-cn.md` + `context/*`

输出：
1. 需求目标（一句话）
2. 范围 / 非范围
3. 核心用户流程
4. 风险和待确认项（最多10条）

---

### Phase 1 — 事实取证（Agent 模式）

**目标**：避免"拍脑袋PRD"，所有结论有来源。

动作：
- 从 `docs/*`、`context/*` 提取系统事实
- 从历史 `prds/*` 找可复用模块
- 从 `tools/*` 或脚本确认数据口径

建议输出文件：`prds/<需求名>/facts-v1.md`

格式：事实点 | 来源文件 | 对PRD的影响

---

### Phase 2 — PRD大纲确认（Plan 模式）⚠️ 不可跳过

**目标**：在写正文前对齐范围，避免大量返工。

动作：
- 输出PRD章节目录 + 本次范围内/外 + 需拍板的决策点
- **等待用户明确确认后**，再进入下一步
- 用户有修改则调整大纲再次确认

---

### Phase 3 — PRD正文生成（Agent 模式）

**目标**：快速成稿，可评审。

动作：
- 用户确认大纲后，套 `templates/prd-template-cn.md` 生成正文
- 每个功能模块含：业务规则编号（R01...）、Mermaid流程图、ASCII线框图、验收标准

建议输出文件：`prds/<需求名>/PRD-v1.md`

---

### Phase 4 — Demo稿（Agent 模式）

**目标**：支持演示和评审对齐。

动作：
- 参考 `prds/pod-design-studio/demo-v4/` 的表达结构
- 输出 3~5 分钟讲解版脚本
- 如需页面稿：生成 `prds/<需求名>/demo/index.html`

建议输出文件：`prds/<需求名>/demo-script-v1.md`

---

### Phase 5 — 质量校验（Agent 模式）

**目标**：减少评审返工。

动作：
- 跑 `check_prd.js` 做自检
- 对照验收标准和范围做一致性检查
- 标出"高风险未定项"

建议输出文件：`prds/<需求名>/check-report-v1.md`

---

### Phase 6 — 评审摘要（Plan 模式）

**目标**：给老板/研发/业务快速看懂，控制在一页内。

输出内容：
1. 目标与价值
2. 本期范围
3. 核心流程
4. 依赖与风险
5. 需要拍板的3-5个问题

建议输出文件：`prds/<需求名>/review-onepager-v1.md`
