# MEMORY.md — AI 工作记忆

> 跨对话持久化记忆。每次新对话开始时读取，任务结束时如有新决策/进展请更新此文件。

---

## 工作偏好

- 复杂任务必须先列执行计划，确认后再动手
- 大改动前说明思路，获得确认后执行
- 输出后主动询问是否符合预期
- 文件写入超过150行用 Shell Add-Content 分段，不用 Write 工具一次写入
- 修改文件优先用 StrReplace，不整体重写
- Add-Content 追加中文可能乱码，出现时改用 Set-Content 整体重写

---

## 已确定的技术选型

| 项目 | 决策 | 日期 |
|------|------|------|
| POD Design Studio | 前端设计器用 Fabric.js（非 Konva）| 2026-03 |
| POD Design Studio | Shopify App 扩展：Theme Extension + App Block | 2026-03 |
| POD Design Studio | WMS 履约复用现有 VAS 工单流程，插入 Pick→Pack 之间 | 2026-03 |
| 前端 Demo | 优先纯 HTML + Tailwind CDN + Alpine.js，不用构建工具 | 2026-03 |
| 前端 UI 规范 | 基于实际系统截图分析，更新为 #3B82F6 主色 + 深色侧边栏风格 | 2026-03-19 |

---

## 项目进展快照

| 项目 | 当前状态 | 最新版本 | 下一步 |
|------|----------|----------|--------|
| POD Design Studio | PRD 完成，等待开发排期 | v4（PRD-v4-final.md）| 开发启动会 |
| BI 成本计算优化 | PRD V2.0 完成 | V2.0 | 待确认排期 |
| Approval Workflow | PRD + Demo 完成 | V1.0 | 待排期 |
| YWN 接口对接 | PRD 完成（中英文版）| V1.0 | 待排期 |

---

## 工作空间结构决策

| 决策 | 理由 | 日期 |
|------|------|------|
| `.cursor/rules/` 用 `.mdc` 格式 | Cursor Rules 标准格式，alwaysApply 全局生效 | 2026-03 |
| 按需加载文档索引统一到 `context/docs-index.md` | 避免两个 workflow 重复维护映射表 | 2026-03 |
| Tools 清单统一到 `tools/README.md` | 避免 AGENT.MD / project-rule.md 三处重复 | 2026-03 |
| MEMORY.md 放根目录，项目级记忆放 `prds/[项目]/CONTEXT.md` | 全局记忆与项目记忆分层管理 | 2026-03 |

---

## 已踩过的坑

| 问题 | 解决方案 |
|------|----------|
| Write 工具单次写入约 8KB 后截断 | 超过150行改用 Shell Add-Content 分段追加 |
| Add-Content 追加中文乱码 | 改用 Set-Content -Encoding UTF8 整体重写 |
| StrReplace old_string 含特殊字符（箭头、方框等）匹配失败 | 用 Shell Get-Content 先查看精确内容再替换 |
| Cursor 规则 `.mdc` 文件中 ASCII 艺术字符导致渲染乱码 | 线框图改用 `+---+` 替代 `┌──┐` |

---

## 待办事项（跨项目级别）

- [ ] POD Design Studio 开发启动会准备
- [ ] 确认各项目开发排期

---

*最后更新：2026-03-19*
