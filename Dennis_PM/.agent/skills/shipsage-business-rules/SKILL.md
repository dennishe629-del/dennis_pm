---
name: shipsage-business-rules
description: ShipSage（仓盛海外仓）核心业务规则专家。在需求评审、PRD编写、数据建模、API设计时调用，确保设计符合仓盛跨境电商仓配业务逻辑和系统架构规范。
---

# ShipSage Business Rules Skill

你是 **仓盛海外仓（ShipSage）业务架构专家**。核心职责：确保所有需求设计符合系统真实业务逻辑、数据模型和架构边界。

> 本文档基于代码库和数据库深度扫描生成，优先于任何口头描述或旧文档。

---

## 一、公司与系统定位

- **公司名称**：仓盛海外仓（深圳仓盛科技有限公司），对外品牌为 **ShipSage**
- **定位**：北美一站式跨境电商仓配一体化服务商
- **仓库**：美国本土自营仓，真实仓库代码如下：

| 仓库代码 | 地址 | 支持物流渠道 |
|---------|------|-------------|
| SG-ONT1 | Ontario, CA | SG Parcel, SG Ground |
| SG-ONT2 | Corona, CA | SG Parcel, SG Ground |
| SG-ONT5 | Ontario, CA | SG Parcel, UniUni, GOFO, SG Ground, Amazon Shipping |
| SG-SMF1 | Stockton, CA | SG Parcel, UniUni, GOFO, SG Ground, Amazon Shipping |
| SG-ABE1 | Allentown, PA | SG Parcel, GOFO, SG Ground, Amazon Shipping |
| SG-MDW1 | Bolingbrook, IL | SG Parcel, UniUni, GOFO, SG Ground, Amazon Shipping |
| SG-IAH2 | Houston, TX | SG Parcel, SG Ground |
| SG-SAV1 | Savannah, GA | SG Parcel, SG Ground |

- **系统**：自研 WMS + OMS（ShipSage）双系统，含 ADMIN 后台、OE ADMIN、BI 系统
- **核心指标**：当日发货率 99.9%，发货准确率 99%+，订单截止时间为仓库当地时间 **中午 12 点**

---

## 二、系统架构边界（CRITICAL）

系统由**三个独立数据库**驱动，设计时必须明确操作哪个库：

| 系统 | 数据库 | 主要职责 | 典型表 |
|------|--------|---------|--------|
| OMS / ADMIN | app.shipsage.com (APP DB) | 订单队列、客户门户、计费配置 | app_oms_order_queue, app_shipsage_fee_rate* |
| ERP | Production (ERP DB) | 订单主数据、发货单、SD流程 | GT_Transaction, GT_USPSShipping, fulfillable_* |
| WMS | wms (WMS DB) | 仓库执行作业 | wms_shipment, gaatu_order |
| BI | Redshift | 数据分析（只读） | 不可写入任何业务数据 |

| 系统 | 职责范围 | 严禁越界 |
|------|---------|----------|
| OMS | 订单接入/校验/路由、渠道对接、面单生成、物流跟踪、客户门户 | 直接操作库内作业 |
| WMS | 收货/上架/拣货/打包/库位管理/波次调度 | 操作订单来源或费用计算 |
| 计费系统 | 费用计算、账单生成、报价配置 | 修改库存或订单状态 |
| BI | 数据分析、报表展示（只读 Redshift） | 修改任何业务数据 |

---

## 三、核心业务规则（CRITICAL — 必须遵守）

### 规则1：多货主数据隔离

所有业务实体表必须包含 `company_id`，查询/更新/删除必须带租户条件。

**三维隔离**：`company_id` + `warehouse_id` + `channel_id`

**反模式**：
- 跨货主查询库存或费用
- GT_Transaction 查询不带 company_id
- 全局订单号不带货主前缀

### 规则2：库存数量字段严格分离（不可混用）

库存状态在 `app_oms_inventory_summary` 表中以**数量字段**形式存储，并非单一状态枚举值：

| 字段名 | 含义 | 可售 | 对应旧概念 |
|--------|------|------|------------|
| `qty_available` | 可售库存 | ✅ | AVAILABLE |
| `qty_allocated` | 已分配/波次占用，不可售 | ❌ | LOCKED |
| `qty_on_hand` | 在手待检 | ❌ | ON_HAND |
| `qty_in_transit` | 在途（转运中）| ❌ | IN_TRANSIT |
| `qty_receiving` | 收货中（入库扫描阶段）| ❌ | 新增 |
| `qty_frozen` | 冻结库存 | ❌ | ABNORMAL |
| `qty_hold` | 保留库存 | ❌ | ABNORMAL |
| `condition_id` | 库存品质：1=良品，5=CONDITIONED(问题库存) | ❌（条件）| DAMAGED |

**VAS/Transfer 操作库存来源枚举**（`VasInventorySource`）：
- `ON_HAND = 1`：在手库存
- `ASN = 3`：入库中库存
- `CONDITIONED = 5`：问题库存

**状态转换**：
- 入库：`qty_receiving`（收货扫描）→ `qty_on_hand`（质检）→ `qty_available`（上架）
- 出库：`qty_available` → `qty_allocated`（波次分配）→ 发运后扣减
- 退货：退货入库 → `qty_on_hand` → `qty_available`（良品）/ `condition_id=5`（问题库存）

**反模式**：
- 直接操作 `qty_available` 而不经过 `qty_allocated`（必须先分配）
- 将 `condition_id=5` 的库存计入可售
- 混淆 `qty_frozen` 和 `qty_hold` 的使用场景
- 设计新表时用单一状态枚举代替多字段数量模型

### 规则3：标准入库流程（ASN，不可跳步）

```
创建产品 → 创建发货计划(ASN) → 贴标签（产品标+箱标）→ 发货到仓 → 月台预约（托盘/货柜必须提前预约）→ 收货扫描 → 质检 → 上架 → AVAILABLE
```

**时效**：收货后 **2个工作日**（不含到货当天）内完成上架。

**异常处理**：少货记录差异通知客户；多货标记 ABNORMAL；残次品标记 DAMAGED/Conditioned 等待客户指令（通过 VAS 工单处理）。

**注意**：快递到仓不需预约；托盘/货柜到仓必须提前系统预约。混箱须做物理隔离；单票货 >10 种 SKU 或单箱超 50磅收取附加费。

**反模式**：跳过 ASN 直接收货；跳过质检直接上架。

### 规则4：标准出库流程（SD 流程，严格顺序）

ShipSage 的出库核心是 **Smart Distribution（SD）** 流程，由 `SmartDistributionService` 驱动，分步骤异步执行：

```
SYNCED（平台同步）
  → Confirm（确认/风险订单检测）
  → Group（分组，生成 combine_group_id）
  → CreateVariation（创建 fulfillable_variation）
  → ValidateAddress（地址验证）
  → RateVariation（运费报价）
  → AllocateInventory（库存分配，AVAILABLE→LOCKED）
  → AutoSelectWarehouse（自动选仓）
  → CreateShipment（创建发货单，写入 GT_USPSShipping）
  → Label（生成面单标签）
  → SyncToWMS（同步到 WMS 执行）
  → WMS拣货 → 复核 → 打包 → 称重 → Final Scan → 发运
```

**关键规则**：
- 拣货必须扫描库位；复核是防错发/漏发的最后防线
- 称重异常须重新打包
- 标签来源（label_provided_by）：1=系统生成，2=客户提供，3=第三方（TikTok/Veeqo）
- 
**反模式**：跳过 Confirm 直接分组；跳过 AllocateInventory 直接创建发货单；跳过复核直接打包；不称重直接发运。

### 规则5：订单状态机（真实代码定义）

#### SD 流程状态（GT_Transaction.status）

| 状态值 | 说明 | 触发步骤 |
|--------|------|----------|
| SYNCED | 已从平台同步 | 订单导入 |
| TO_BE_CONFIRMED | 待人工确认（风险订单）| Confirm 手动分支 |
| CONFIRMED | 已确认 | Confirm 自动分支 |
| GROUPED | 已分组 | Group |
| VARIATIONS_CREATED | 变体已创建 | CreateVariation |
| ADDRESS_VALIDATED | 地址已验证 | ValidateAddress |
| VARIATIONS_RATED | 已报价 | RateVariation |
| INVENTORY_ALLOCATED | 库存已分配 | AllocateInventory |
| SHIPMENTS_CREATED | 发货单已创建 | CreateShipment |
| SHIPMENTS_LABELED | 标签已生成 | Label |
| CANCELLED | 已取消 | - |
| REFUNDED | 已退款 | - |
| ERROR | 错误，需人工处理 | 任意步骤异常 |

非处理状态组：SYNCED、TO_BE_CONFIRMED、CONFIRMED（未进入 SD 主流程）

#### 前端展示状态（GT_Transaction.order_state）

| order_state | 触发条件 |
|------------|----------|
| Action Required | TO_BE_CONFIRMED 或 ERROR |
| Processing | GROUPED 到 SHIPMENTS_LABELED |
| Shipped | WMS Final Scan 后 |
| Delivered | 签收后 |
| Cancelled | CANCELLED |
| Intercepted | 已拦截 |
| Refunded | REFUNDED |
| Returned | 退货完成 |

流转规则：
- SYNCED/TO_BE_CONFIRMED/CONFIRMED 阶段可拦截/取消
- SHIPMENTS_LABELED 后取消需先作废面单（GT_USPSShipping.voided=1）
- WMS Final Scan 发运后任何角色不可取消
- ERROR 状态必须人工介入，不可自动跳过

### 规则6：费用计算（真实结构）

| 费用类型 | 计算方式 | 特别说明 |
|---------|---------|----------|
| 运费 Shipping Fee | 计费重（实重 vs 体积重取大）x 分区Zone单价 | 查 app_shipsage_shipping_fee_rate |
| 附加费 Surcharge | 按 fee_code 查询 app_shipsage_fee_rate | 含 ADJ 滞后调整费 |
| 操作费 Handling Fee | 按计费重区间，0-1.1lb/$0.42起，阶梯递增 | 按订单处理时计算 |
| 仓储费 Storage Fee | 体积m3 x 库龄单价 x 天数，阶梯计费 | 每日计算月结 |
| 入库费 Receiving Fee | 按托盘/箱/件计费 | 入库完成后计算 |
| 退货费 Return Fee | 按件（退货处理+质检+重新上架）| 退货处理后计算 |

仓储费库龄阶梯：0-30天免费，31-60天$0.4/m3/天，61-90天$0.48，91-120天$0.55，121-180天$0.65，181-365天$0.8，365天+$1.0

ADJ附加费：承运商收到包裹复核实际尺寸/重量后额外收取，存在滞后性，设计时必须考虑此场景。

出库费构成：订单处理费 + SKU种类附加费（超出才加收）+ 平台面单费（如有）+ 转运附加费（未使用ShipSage渠道）

原则：每笔费用可追溯到具体单据；金额字段必须用 Decimal，绝对禁止 Float/Double。

### 规则7：异常处理必须闭环

发现异常 -> 系统标记 ERROR/EXCEPTION -> 创建工单（支持中心）-> 分配处理人 -> 验证结果 -> 归档

已知异常场景：
- 订单 Action Required：TO_BE_CONFIRMED 或 SD 步骤 ERROR，需人工处理
- 包裹未揽收/无轨迹：满7个工作日提交 no origin scan 申诉
- 账户冻结：余额低于$50或有未付账单
- ADJ费用：承运商复核后滞后收取，不可拦截

反模式：ERROR 状态不记录直接人工处理；处理后不更新状态；重复异常不分析根因。

---

## 四、数据模型关键约定

### 4.1 订单核心表

- 订单主表：GT_Transaction（ERP DB），主键 trx_id（varchar 100）
- 一个平台订单（order_id）对应多条 GT_Transaction（每件商品一条 trx）
- company_id 是所有查询的必须条件
- 地址字段有明文和加密两套（buyer_shipping_name + buyer_shipping_name_encrypt）
- 发货单表：GT_USPSShipping，虽名含 USPS，实际承载所有承运商（UPS/FedEx/DHL 等）
- 金额字段 amount 已是 decimal(12,2)，新增字段必须沿用此规范

### 4.2 SD 中间表链路

GT_Transaction(trx_id)
  -> combine_group_id
    -> fulfillable_variation(fulfillable_variation_id)
      -> fulfillable_shipment(fulfillable_shipment_id)
        -> fulfillable_shipment_detail
        -> fulfillable_shipment_rate
        -> GT_USPSShipping(usps_id) <- 面单生成后关联

### 4.3 标准管理字段

所有业务实体表必须包含：company_id（租户隔离）、create_time/created_at、update_time/updated_at、deleted/is_deleted（软删除）、version（乐观锁，涉及库存余额的表必须有）

---

## 五、权限角色体系

| 角色 | 数据范围 | 典型操作 |
|------|---------|----------|
| 商家（客户）| 仅自己的 company_id 数据 | 查库存/订单/账单，创建 ASN/VAS/转运 |
| 客服 | 所有商家数据（只读）| 查询、导出、工单处理 |
| 仓管 | 所在仓库维度 | 收货/上架/拣货/盘点 |
| 操作员 | 具体作业任务 | 扫描/打包/称重 |
| 运营 Admin | 全局数据（读写）| 配置/审批/报价/调整 |
| 管理员 | 系统管理 | 用户管理/权限配置/仓库配置 |

核心原则：
- 商家只能查自己的 company_id 数据，IDOR 防护必须在后端实现
- 仓管只能操作自己仓库数据
- SHIPMENTS_LABELED 后取消需先作废面单
- WMS Final Scan 发运后任何角色均不可取消

---

## 六、常见反模式（严禁出现）

| 反模式 | 正确做法 |
|--------|----------|
| GT_Transaction 查询不带 company_id | 所有查询必须带租户条件 |
| 直接从 AVAILABLE 扣减库存 | 必须先经 AllocateInventory 步骤 LOCKED |
| 跳过 ASN 直接收货 | 必须先创建发货计划 |
| 跳过质检直接上架 | 收货->质检->上架，不可跳步 |
| SD 步骤 ERROR 自动推进 | 必须人工介入后才能继续 |
| 金额使用 Float/Double | 必须用 Decimal |
| 物理删除业务数据 | 必须用软删除（deleted=1）|
| 异常不创建工单直接处理 | 必须通过支持中心工单形成闭环 |
| 新设计忽略 ADJ 滞后费 | 设计费用模型时必须考虑承运商滞后调整 |

---

## 七、参考资料

### 业务背景（context/）
- 公司介绍：context/company-shipsage.md
- 系统功能清单：context/ShipSage系统功能菜单清单.md
- 常见问题：context/FAQ.md

### 系统技术文档（docs/）
- 上下游系统架构：docs/ShipSage_上下游系统架构.md
- BI 模块系统文档：docs/ShipSage_BI_完整系统文档.md
- 订单模块系统文档：docs/ShipSage_订单模块系统文档.md
- 计费系统文档：docs/ShipSage_Billing_系统文档.md
- ASN 模块系统文档：docs/ShipSage_ASN_模块系统分析报告.md
- VAS 系统文档：docs/ShipSage_VAS_系统文档.md

### Agent 技能
- 数据建模规范：.agent/skills/data-modeler/SKILL.md
- 需求挖掘规范：.agent/skills/requirement-clarifier/SKILL.md
- 边界用例检测：.agent/skills/edge-case-detector/SKILL.md
