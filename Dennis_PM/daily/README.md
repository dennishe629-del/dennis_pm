# Daily 工作文件夹

日常工作管理目录，存放每周待办、临时分析、小优化需求等非正式 PRD 文件。

## 文件夹结构

```
daily/
├── README.md                    ← 本文件
├── weekly/                      ← 每周待办（按周归档）
│   ├── 2026-W14.md              ← 2026年第14周（3/30-4/5）
│   ├── 2026-W15.md
│   └── ...
├── analysis/                    ← 小需求分析/调研（不够写 PRD 的）
│   ├── 1008-order-stuck.md      ← 如：1008 客户订单卡住分析
│   ├── auto-split-feasibility.md
│   └── ...
├── temp/                        ← 临时文件（会议记录、截图说明、草稿）
│   └── ...
└── bugs/                        ← Bug 分析/排查记录
    └── ...
```

## 命名规范

| 类型 | 格式 | 示例 |
|------|------|------|
| 周报 | `YYYY-WNN.md` | `2026-W14.md` |
| 分析 | `关键词-简述.md` | `sd-box-mismatch.md` |
| 临时 | 随意，用完可删 | `meeting-0331.md` |
| Bug | `BUG-简述.md` | `BUG-createvariation-box-error.md` |

## 周报模板

见 `weekly/` 下的 `.md` 文件，模板在第一个文件中。
