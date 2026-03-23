---
trigger: always_on
---

# 项目规则 - 产品经理AI工作空间

## 核心原则

- 先理解目标和价值，再讨论实现方案
- 发现逻辑漏洞时，主动指出并给出建议
- 不确定需求意图时，先确认再动手
- **复杂任务必须先输出执行计划，用户确认后再动手**
- 草稿先放 `drafts/` 试错，成熟后移至 `prds/` 正式版

## 输出规范

- 逻辑闭环：正向流程 + 逆向流程 + 异常分支，不留断点
- 业务规则编号管理：R01、R02...，便于追溯
- 字段说明用表格，必含：字段名、类型、必填、说明；枚举类型列出所有值
- 复杂逻辑：Mermaid流程图 > 表格 > 纯文字
- 先结论后展开；关键信息加粗；中文为主，专业术语保留英文

## 工作流（按需阅读对应文件）

| 阶段 | 触发时机 | 文件 |
|------|----------|------|
| Phase 1 需求洞察 | 收到新需求 | `.agent/workflows/1-analyze-requirement.md` |
| Phase 2 方案架构 | 需求确认后 | `.agent/workflows/2-design-solution.md` |
| Phase 3 规格生成 | 方案确认后 | `.agent/workflows/3-generate-specs.md` |
| Phase 4 验证迭代 | PRD初稿完成后 | `.agent/workflows/4-verify-iterate.md` |

## 工具（按需阅读对应 SKILL.md）

| 触发场景 | 工具路径 |
|----------|----------|
| 生成 Zone Chart 导入文件 | `tools/shipsage-zone-chart-import/SKILL.md` |
| 批量导入费用配置 | `tools/fee-import-generator/SKILL.md` |
| 生成 4PL 仓库报价导入文件 | `tools/4pl-warehouse-quote-import/SKILL.md` |

## 文件组织

详见 `AGENT.MD`。
