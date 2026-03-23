---
description: 阶段4：验证与迭代 - 交付前的自检与优化循环
---

# Workflow: Phase 4 - 验证与迭代 (Verify & Iterate)

此工作流用于**质量保证阶段**。PRD输出不是终点，验证通过才能交付。

## 步骤 1: 自检清单 (Self-Check)

> **Goal**: 确保交付物符合产品质量标准。

请逐项检查以下维度：

### 逻辑完整性

- [ ] 状态流转是否闭环？（包含正向、逆向、异常路径）
- [ ] 异常处理是否覆盖？（网络超时、并发冲突、权限不足等）
- [ ] 业务规则是否编号？（R01, R02... 便于追溯）

### 数据规范性

- [ ] 字段类型是否精确？（金额用Decimal，状态用Enum，禁止模糊类型）
- [ ] 必填/可选是否明确？
- [ ] 枚举值是否列全？（如：状态码的所有可能值）
- [ ] 是否包含标准管理字段？（id, company_id, created_at, updated_at, is_deleted, version）
- [ ] 金额字段是否使用 Decimal 类型？（禁止 Float/Double）
- [ ] 是否定义索引和唯一约束？

### ShipSage 业务规则

- [ ] 是否符合多货主隔离？（所有表含 company_id，查询必须带租户条件）
- [ ] 库存数量字段是否严格分离？（qty_available/qty_allocated/qty_on_hand/qty_in_transit/qty_frozen/qty_hold 不可混用；condition_id=5 为问题库存不可参与可售计算）
- [ ] 入库流程是否完整？（创建发货计划ASN → 收货扫描 → 质检 → 上架 → AVAILABLE，不可跳步）
- [ ] 出库 SD 流程是否完整？（Confirm → Group → CreateVariation → ValidateAddress → RateVariation → AllocateInventory → AutoSelectWarehouse → CreateShipment → Label → SyncToWMS → WMS拣货 → 复核 → 打包 → 称重 → Final Scan，不可跳步）
- [ ] 订单 SD 状态机是否合规？（SYNCED/CONFIRMED/GROUPED/.../SHIPMENTS_LABELED，ERROR 必须人工介入，不可自动跳过）
- [ ] 取消逻辑是否正确？（SHIPMENTS_LABELED 后需先作废面单 voided=1；WMS Final Scan 发运后任何角色不可取消）
- [ ] 异常处理是否闭环？（ERROR/EXCEPTION → 工单 → 处理 → 验证 → 归档，不可跳过工单直接人工处理）
- [ ] 费用计算是否可追溯到具体单据？金额字段是否使用 Decimal（禁止 Float/Double）？
- [ ] 涉及库存/余额扣减的表是否有 version 乐观锁字段？
- [ ] BI 相关设计是否只读？（Redshift 不可写入任何业务数据）

### 权限与安全

- [ ] 是否包含"权限说明"章节？
- [ ] 是否定义角色权限矩阵？（商家/客服/仓管/操作员/运营/管理员）
- [ ] 敏感数据是否脱敏？（手机号、身份证）
- [ ] 是否存在越权风险？（水平/垂直越权）

### PRD 结构完整性（模板 V2.0）

- [ ] 是否包含「用户角色」章节？（角色/描述/痛点/诉求）
- [ ] 是否包含「核心场景」章节？（端到端场景叙述）
- [ ] 是否包含「设计思路」章节？（方案对比表含Decision列 + 关键设计决策）
- [ ] 「开发范围」表是否有 Task # 编号列？（T1/T2/T3...）
- [ ] 每个任务是否包含「数据库设计」子节？（新建表或扩展字段）
- [ ] 数据库设计是否含标准管理字段？（company_id / created_at / updated_at / is_deleted / version）
- [ ] 是否包含「非功能需求」章节？（性能/可用性/安全/幂等/扩展性）
- [ ] 是否包含「验收标准汇总」章节？（按 Task # 汇总，含P0/P1/P2优先级）
- [ ] Task # 编号是否贯穿「开发范围→任务详情→验收标准汇总」三节，保持一致？

### 前端Demo（如有）

- [ ] 是否按 `.agent/skills/frontend-designer/SKILL.md` 规范生成？
- [ ] 多系统Demo是否有 `index.html` 导航Hub页？
- [ ] Mock数据是否覆盖正常、空、异常三种状态？
- [ ] 所有枚举状态是否有对应颜色标签？
- [ ] 文件可否直接在浏览器打开，无报错？

## 步骤 2: 问题回溯 (Backtracking)

> **Goal**: 如果发现问题，回到对应阶段修正。

根据问题类型，回到对应Workflow：

| 问题类型         | 回到阶段        | 示例                           |
| :--------------- | :-------------- | :----------------------------- |
| **需求理解错误** | Phase 1         | 发现做的不是用户真实痛点       |
| **数据模型缺陷** | Phase 2 - 步骤1 | ER关系设计错误，缺少关键字段   |
| **边界情况遗漏** | Phase 2 - 步骤2 | 并发场景未覆盖，状态机有死循环 |
| **PRD格式问题**  | Phase 3         | 缺少章节、格式不规范           |

**修正后，必须重新执行本阶段（Phase 4）验证**。

## 步骤 3: 最终交付 (Delivery)

> **Goal**: 确认无误后，正式归档。

1. 将文档从 `drafts/YYYY-MM-DD-[主题]/` 移动到 `prds/[模块名]/`。
2. 如果有前端Demo，确保代码可直接运行。
3. 输出《验收标准清单(AC Checklist)》供测试使用：
   - 基于Phase 1的RDD中的"验收标准"章节
   - 补充Phase 2发现的边界情况
   - 标注优先级（P0必测、P1重要、P2可选）

## 步骤 4: 用户确认 (User Confirmation)

询问用户：

1. PRD是否符合预期？是否需要调整？
2. Demo（如有）是否需要优化？
3. 是否可以正式交付给开发团队？

**Done**: 任务完成，进入开发排期！
