# ShipSage 订单模块系统分析报告（完整版）

> 生成时间：2026-03-17  
> 本文档基于代码库深度扫描，涵盖系统架构、数据模型、业务流程、字段结构等完整信息，供需求分析使用。

---

## 一、系统架构概述

### 1.1 总体分层架构

```
app.gaatu.com/
├── app/Foundation/               # 基础层：BaseService/BaseRepository/BaseModel/枚举基类
├── app/Modules/
│   ├── Application/ShipSage/
│   │   ├── OMS/                  # 对客应用层（客户门户 ShipSage OMS）
│   │   ├── ADMIN/                # 运营管理层（内部后台）
│   │   ├── WMS/                  # WMS 应用层
│   │   └── BI/                   # BI 数据看板
│   ├── Business/BIZ/             # 业务逻辑层（跨模块复用）
│   │   ├── Services/SmartDistributionService.php      # SD 调度入口（103KB）
│   │   ├── Services/SmartDistributionQueueService.php # SD 队列调度
│   │   ├── Repositories/SmartDistribution/            # SD 各步骤 Repository
│   │   └── Jobs/SmartDistribution/                    # SD 各步骤 Job
│   ├── DB/ERP/                   # Production 数据库访问层
│   ├── DB/APP/                   # app.shipsage.com 数据库
│   ├── DB/WMS/                   # WMS 数据库
│   └── Integration/              # 第三方平台集成
└── client/ShipSage/              # 前端 Vue.js（Nuxt）
```

### 1.2 关键服务与 Repository 文件

| 服务/文件 | 路径 | 说明 |
|-----------|------|------|
| SmartDistributionService | Business/BIZ/Services/SmartDistributionService.php | SD 总调度入口，所有 SD API 在此路由 |
| SmartDistributionQueueService | Business/BIZ/Services/SmartDistributionQueueService.php | 将各 SD 步骤推入队列 |
| ConfirmRepository | BIZ/Repositories/SmartDistribution/ConfirmRepository.php | 确认步骤，含自动/手动确认规则 |
| GroupRepository | BIZ/Repositories/SmartDistribution/GroupRepository.php | 分组步骤，生成 combine_group_id |
| CreateVariationRepository | BIZ/Repositories/SmartDistribution/CreateVariationRepository.php | 创建 FulfillableVariation |
| RateVariationRepository | BIZ/Repositories/SmartDistribution/RateVariationRepository.php | 运费报价 |
| AutoSelectWarehouseRepository | BIZ/Repositories/SmartDistribution/AutoSelectWarehouseRepository.php | 自动选仓 |
| CreateShipmentRepository | BIZ/Repositories/SmartDistribution/CreateShipmentRepository.php | 创建发货单，写入 GT_USPSShipping |
| LabelRepository | BIZ/Repositories/SmartDistribution/LabelRepository.php | 生成标签，支持 10+ 承运商 |
| SyncToWmsRepository | BIZ/Repositories/SmartDistribution/SyncToWmsRepository.php | 同步到 WMS |

### 1.3 数据库连接

| 连接名 | 数据库 | 主要表 |
|--------|--------|--------|
| ERP | Production | GT_Transaction、GT_USPSShipping、GT_USPSShippingDetail、GT_USPSShippingTrx、fulfillable_variation、fulfillable_shipment、fulfillable_shipment_detail、fulfillable_shipment_rate、customer_address、GT_TransactionGroup |
| APP | app.shipsage.com | app_oms_order_queue、app_oms_order_action、app_oms_order_y2 |
| WMS | wms | wms_shipment、gaatu_order 等 |

---

## 二、核心数据模型

### 2.1 订单主表：GT_Transaction

**Model**：`App\Modules\DB\ERP\Models\Transaction`  
**主键**：`trx_id`（varchar 100）

> 一个平台订单（order_id）对应多条 GT_Transaction（每件商品一条 trx）。

#### 2.1.1 基本信息字段

| 字段 | 类型 | 索引 | 说明 |
|------|------|------|------|
| trx_id | varchar(100) | PRI | 交易ID（主键） |
| order_id | varchar(100) | MUL | 平台订单号（一对多） |
| amazon_order_id | varchar(100) | MUL | Amazon 订单ID |
| wayfair_po_number | varchar(100) | MUL | Wayfair 采购单号 |
| walmart_po_id | varchar(100) | MUL | Walmart 采购单ID |
| item_id | varchar(100) | MUL | 产品ID |
| ebay_username | varchar(255) | MUL | eBay 用户名 |
| title | varchar(100) | | 产品标题 |
| listing_type | varchar(100) | | 列表类型 |
| qty_purchased | int | | 购买数量 |
| trx_site_id | varchar(100) | MUL | 交易来源站点（Amazon/eBay/Wayfair/Temu 等） |
| fulfillment_channel | varchar(100) | MUL | 履约渠道（AFN=Amazon自履约，NULL=ShipSage） |
| company_id | int | MUL | 公司ID（租户标识） |

#### 2.1.2 金额与支付字段

| 字段 | 类型 | 说明 |
|------|------|------|
| amount_paid | double | 支付金额 |
| shipping_amount_paid | double | 运费金额 |
| paid_time | datetime | 支付时间 |
| init_paid_time | datetime | 初始支付时间（用于同地址去重查询） |

#### 2.1.3 收货地址字段

| 字段 | 类型 | 说明 |
|------|------|------|
| buyer_shipping_name | varchar(256) | 收货人姓名（明文） |
| buyer_shipping_name_encrypt | varchar(256) | 收货人姓名（加密，用于去重） |
| buyer_shipping_street1 | varchar(256) | 地址行1（明文） |
| buyer_shipping_street1_encrypt | varchar(256) | 地址行1（加密） |
| buyer_shipping_street2 | varchar(256) | 地址行2（明文） |
| buyer_shipping_street2_encrypt | varchar(256) | 地址行2（加密） |
| buyer_shipping_cityname | varchar(100) | 城市 |
| buyer_shipping_stateorprovince | varchar(100) | 州/省 |
| buyer_shipping_country | varchar(100) | 国家 |
| buyer_shipping_postalcode | varchar(100) | 邮编 |
| buyer_shipping_phone | varchar(256) | 电话 |

#### 2.1.4 物流与仓储字段

| 字段 | 类型 | 索引 | 说明 |
|------|------|------|------|
| shipping_service | varchar(100) | | 运输服务名称 |
| shipping_tracking_number | varchar(100) | MUL | 追踪号（关联 GT_USPSShipping.tracking_number） |
| ship_time | datetime | | 实际发货时间 |
| latest_ship_date | datetime | MUL | 最晚发货日期 |
| latest_delivery_date | datetime | MUL | 最晚送达日期 |
| shipped_warehouse_id | int | | 分配发货仓库ID（AutoSelectWarehouse 写入） |
| wms_order_id | int | MUL | WMS 订单ID（SyncToWms 写入） |
| selected_fulfillable_variation_id | int | | 选中的 fulfillable_variation_id（CreateVariation 写入） |

#### 2.1.5 SD 流程标识字段

| 字段 | 类型 | 说明 |
|------|------|------|
| fulfilled_by_shipsage | tinyint(1) | SD核心标识：1=ShipSage发货，2=4PL/第三方，0/NULL=非SD |
| is_prime | tinyint(1) | 是否 Amazon Prime 订单 |
| label_provided_by | tinyint(1) | 标签来源：1=系统，2=客户，3=第三方（TikTok/Veeqo） |
| is_risk_order | tinyint | 是否风险订单（Confirm 步骤检查） |
| combine_group_id | varchar | 分组ID（Group 步骤生成，格式：G+md5） |
| overpack | varchar | 包材类型（含 FEDEX_2_DAYS 特殊逻辑） |

#### 2.1.6 状态字段

| 字段 | 类型 | 索引 | 说明 |
|------|------|------|------|
| status | varchar(100) | MUL | SD 流程步骤状态（见 §3.1） |
| order_state | varchar(50) | | 订单前端展示状态（见 §3.2） |
| create_time | datetime | | 创建时间 |
| update_time | datetime | MUL | 更新时间 |

---

### 2.2 发货单主表：GT_USPSShipping

**Model**：`App\Modules\DB\ERP\Models\UspsShipping`  
**Table**：`GT_USPSShipping`（主键 `usps_id`）

> 虽然表名含 USPS，但实际承载所有承运商发货单（UPS/FedEx/DHL 等均在此表）。  
> CreateShipment 步骤将 FulfillableShipment 转化为本表记录；SyncToWms 步骤将本表同步到 WMS。

| 字段 | 类型 | 索引 | 说明 |
|------|------|------|------|
| usps_id | int unsigned | PRI | 发货单ID（主键） |
| company_id | int | MUL | 公司ID |
| type | varchar(20) | MUL | 承运商类型 |
| tracking_number | varchar(50) | MUL | 物流追踪号（写回 GT_Transaction.shipping_tracking_number） |
| usps_order_id | varchar(30) | MUL | USPS 订单ID |
| piece_id | varchar(20) | MUL | 件ID |
| amount | decimal(12,2) | | 发货费用金额 |
| weight | decimal(14,4) | | 重量（磅） |
| mail_class | varchar(255) | | 邮件类别/服务类型 |
| destination_name | varchar(100) | | 目的地姓名 |
| destination_city | varchar(100) | | 目的地城市 |
| destination_state | varchar(100) | | 目的地州 |
| destination_zip | varchar(100) | | 目的地邮编 |
| destination_country | varchar(100) | | 目的地国家 |
| status_event | varchar(100) | MUL | 物流状态事件 |
| delivery_date_time | datetime | MUL | 签收时间 |
| zone | varchar(20) | MUL | Zone 区域 |
| is_charge | tinyint(1) | MUL | 是否收费 |
| date_time | datetime | MUL | 发货单创建时间 |
| postmark_date_time | datetime | | 邮局盖章时间 |
| label_time | datetime | | 标签生成时间（Label 步骤写入） |
| submit_time | datetime | | 提交到 WMS 时间（SyncToWms 写入） |
| voided | tinyint | | 是否已作废 |
| stop_shipping | tinyint | | 是否停发 |
| angency_id | int | | 承运机构ID（见 Agency 枚举） |

**关联关系**：
- GT_USPSShipping → GT_USPSShippingDetail（一对多，usps_id）
- GT_USPSShipping → GT_USPSShippingTrx（一对多，usps_id）
- GT_USPSShipping ← fulfillable_shipment（通过 usps_id 关联）

---

### 2.3 发货明细表：GT_USPSShippingDetail

**Model**：`App\Modules\DB\ERP\Models\UspsShippingDetail`  
**Table**：`GT_USPSShippingDetail`（主键 `usps_detail_id`）

| 字段 | 说明 |
|------|------|
| usps_detail_id | PRI |
| usps_id | 关联 GT_USPSShipping |
| （其余字段） | SKU、数量、重量等商品明细信息 |

---

### 2.4 USPS 交易流水表：GT_USPSShippingTrx

**Model**：`App\Modules\DB\ERP\Models\UspsShippingTrx`  
**Table**：`GT_USPSShippingTrx`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int unsigned | PRI |
| tracking_number | varchar(100) | 追踪号 |
| service_status_id | int | 服务状态ID |
| service_charge_desc | varchar(100) | 服务费描述 |
| service_name_id | int | 服务名称ID |
| service_name | varchar(100) | 服务名称 |
| usps_id | int | 关联 GT_USPSShipping |
| transaction_id | int | 交易ID |
| trx_id | varchar | 关联 GT_Transaction.trx_id（SyncToWms 查询用） |
| sku_group_id | int | SKU 组ID |
| warehouse_id | int | 仓库ID |
| sales_qty | int | 销售数量 |
| total_postage_amt | varchar(10) | 邮资金额 |
| transaction_date | datetime | 交易日期 |

---

### 2.5 SD 中间表：fulfillable_variation

**Model**：`App\Modules\DB\ERP\Models\FulfillableVariation`  
**Table**：`fulfillable_variation`（主键 `fulfillable_variation_id`）

> SD 流程 CreateVariation 步骤创建，每个分组（combine_group_id）对应一条记录，记录收货地址与发货策略。

| 字段 | 说明 |
|------|------|
| fulfillable_variation_id | PRI |
| customer_address_id | 关联 customer_address 表 |
| combine_group_id | 关联分组ID |
| create_time | 创建时间 |

**关联关系**：
- fulfillable_variation → fulfillable_shipment（一对多）
- fulfillable_variation → customer_address（多对一）

---

### 2.6 SD 中间表：fulfillable_shipment

**Model**：`App\Modules\DB\ERP\Models\FulfillableShipment`  
**Table**：`fulfillable_shipment`（主键 `fulfillable_shipment_id`）

> SD 流程中每个发货包裹对应一条记录，记录选中的费率、仓库、标签状态等。

| 字段 | 说明 |
|------|------|
| fulfillable_shipment_id | PRI |
| fulfillable_variation_id | 关联 fulfillable_variation |
| warehouse_id | 发货仓库ID |
| selected_fulfillable_shipment_rate_id | 选中的费率ID |
| usps_id | Label 生成后关联 GT_USPSShipping |
| shipment_state | 发货单状态（见 ShipmentStatus 枚举） |
| shipment_status | 数字状态：1=NEW,2=IN_PROGRESS,3=SUCCESS,4=NEED_MANUALLY_CREATE_LABEL,9=FAIL |
| create_time | 创建时间 |
| update_time | 更新时间 |

**关联关系**：
- fulfillable_shipment → fulfillable_shipment_detail（一对多）
- fulfillable_shipment → fulfillable_shipment_rate（一对多）
- fulfillable_shipment → GT_USPSShipping（多对一，usps_id）

---

### 2.7 SD 中间表：fulfillable_shipment_detail

**Model**：`App\Modules\DB\ERP\Models\FulfillableShipmentDetail`  
**Table**：`fulfillable_shipment_detail`（主键 `fulfillable_shipment_detail_id`）

| 字段 | 说明 |
|------|------|
| fulfillable_shipment_detail_id | PRI |
| fulfillable_shipment_id | 关联 fulfillable_shipment |
| catalog_id | 产品目录ID（库存扣减依据） |
| qty | 数量 |

---

### 2.8 SD 中间表：fulfillable_shipment_rate

**Model**：`App\Modules\DB\ERP\Models\FulfillableShipmentRate`  
**Table**：`fulfillable_shipment_rate`（主键 `fulfillable_shipment_rate_id`）

> RateVariation 步骤为每个 fulfillable_shipment 生成多条费率记录，系统选出最优费率后写入 selected_fulfillable_shipment_rate_id。

| 字段 | 说明 |
|------|------|
| fulfillable_shipment_rate_id | PRI |
| fulfillable_shipment_id | 关联 fulfillable_shipment |
| carrier | 承运商（UPS/USPS/FedEx/DHL 等） |
| service | 服务类型 |
| rate | 费率金额 |

---

### 2.9 收货地址表：customer_address

**Model**：`App\Modules\DB\ERP\Models\CustomerAddress`  
**Table**：`customer_address`（主键 `customer_address_id`）

> CreateVariation 步骤从 GT_Transaction 地址字段提取后创建，fulfillable_variation 通过 customer_address_id 关联。

| 字段 | 说明 |
|------|------|
| customer_address_id | PRI |
| （地址字段） | 姓名、街道、城市、州、邮编、国家等 |
| update_time | 更新时间 |

---

### 2.10 订单操作队列表：app_oms_order_queue（APP DB）

| 字段 | 类型 | 说明 |
|------|------|------|
| order_queue_id | int | PRI |
| company_id | int | 公司ID |
| order_id | varchar(100) | 订单ID |
| type_id | int | 类型ID |
| payload | json | 负载数据 |
| response | text | 响应数据 |
| status | tinyint | 0=pending，1=success，2=fail |
| command | varchar(100) | 执行命令 |

---

## 三、状态体系

### 3.1 交易状态（TransactionStatus）

每次 SD 步骤完成后更新 GT_Transaction.status：

| 常量 | 值 | 说明 | 触发步骤 |
|------|-----|------|----------|
| STATUS_SYNCED | SYNCED | 已从平台同步 | 订单导入 |
| STATUS_TO_BE_CONFIRMED | TO_BE_CONFIRMED | 待人工确认 | Confirm（手动分支） |
| STATUS_CONFIRMED | CONFIRMED | 已确认 | Confirm（自动分支） |
| STATUS_GROUPED | GROUPED | 已分组 | Group |
| STATUS_VARIATIONS_CREATED | VARIATIONS_CREATED | 变体已创建 | CreateVariation |
| STATUS_ADDRESS_VALIDATED | ADDRESS_VALIDATED | 地址已验证 | ValidateAddress |
| STATUS_VARIATIONS_RATED | VARIATIONS_RATED | 已报价 | RateVariation |
| STATUS_INVENTORY_ALLOCATED | INVENTORY_ALLOCATED | 库存已分配 | AllocateInventory |
| STATUS_SHIPMENTS_CREATED | SHIPMENTS_CREATED | 发货单已创建 | CreateShipment |
| STATUS_SHIPMENTS_LABELED | SHIPMENTS_LABELED | 标签已生成 | Label |
| STATUS_CANCELLED | CANCELLED | 已取消 | - |
| STATUS_REFUNDED | REFUNDED | 已退款 | - |
| STATUS_ERROR | ERROR | 错误 | 任意步骤异常 |

**非处理状态组**（STATUS_NOT_PROCESSED）：SYNCED、TO_BE_CONFIRMED、CONFIRMED

### 3.2 订单展示状态（order_state / ORDER_STATE_*）

前端展示用状态，存储在 GT_Transaction.order_state：

| 常量 | 显示值 | 说明 |
|------|--------|------|
| ORDER_STATE_ACTION_REQUIRED | Action Required | 需要人工操作 |
| ORDER_STATE_PROCESSING | Processing | 处理中（GROUPED~SHIPMENTS_LABELED） |
| ORDER_STATE_PARTIALLY_SHIPPED | Partially Shipped | 部分发货 |
| ORDER_STATE_SHIPPED | Shipped | 已发货 |
| ORDER_STATE_PARTIALLY_DELIVERED | Partially Delivered | 部分送达 |
| ORDER_STATE_DELIVERED | Delivered | 已送达 |
| ORDER_STATE_CANCELLED | Cancelled | 已取消 |
| ORDER_STATE_INTERCEPTED | Intercepted | 已拦截 |
| ORDER_STATE_REFUNDED | Refunded | 已退款 |
| ORDER_STATE_RETURNED | Returned | 已退货 |

**状态映射规则**（TransactionStatus → order_state）：

| status | order_state |
|--------|-------------|
| SYNCED | Synced（初始）|
| TO_BE_CONFIRMED / ERROR | Action Required |
| GROUPED → SHIPMENTS_LABELED | Processing |
| CANCELLED | Cancelled |
| PICKED | Fulfillment |
| FINAL SCANNED | Shipped |

### 3.3 发货单状态（ShipmentStatus）

存储在 fulfillable_shipment.shipment_status（数字）和 shipment_state（字符串）：

| 数字状态 | 常量 | 字符串状态 | 说明 |
|---------|------|------------|------|
| 1 | NEW | Created | 新建 |
| 2 | IN_PROGRESS | In Progress | 进行中 |
| 3 | SUCCESS | Labeled | 成功 |
| 4 | NEED_MANUALLY_CREATE_LABEL | Action Required | 需手动创建标签 |
| 9 | FAIL | Action Required | 失败 |
| - | - | Final Scanned | WMS 最终扫描 |
| - | - | In Transit | 运输中 |
| - | - | Delivered | 已送达 |
| - | - | Voided | 已作废 |
| - | - | Intercepting | 拦截中 |
| - | - | Intercepted | 已拦截 |
| - | - | Returned | 已退货 |

### 3.4 Y2 订单状态（OrderY2Status）

| 值 | 常量 | 显示名称 |
|----|------|----------|
| 1 | SYNCED | Synced |
| 2 | LABEL_PURCHASED | Label Purchased |
| 3 | ASN_IN_TRANSIT | ASN In Transit |
| 4 | ASN_RECEIVED | ASN Received |
| 5 | PACKED | Packed |
| 6 | SHIPPED | Shipped |
| 7 | DELIVERED | Delivered |
| 8 | LABEL_CREATING | Label Creating |
| 9 | LABEL_CREATE_FAILED | Label Create Failed |
| 10 | CANCELLED | Cancelled |

### 3.5 Action Required 场景

#### 订单级 Action Required

| 类型 | 触发条件 |
|------|----------|
| TO_BE_CONFIRMED | 手动确认规则触发 |
| CONFIRM_FAILED | 确认失败 |
| CREATE_SHIPMENT_FAILED | 创建发货单失败 |
| NO_VALID_SHIPMENT | 无有效发货单 |
| OTHERS | 其他 |

#### 发货单级 Action Required

| 类型 | 触发条件 |
|------|----------|
| NEED_MANUALLY_CREATE_LABEL | 标签创建失败 |
| DUPLICATE_TRACKING | 重复追踪号 |
| CUSTOMER_NAME_EMPTY | 收货人姓名为空 |
| INVENTORY_OUT_OF_STOCK | 库存不足 |
| OTHERS | 其他 |

---

## 四、SD 智能分发流程（Smart Distribution）

### 4.1 流程概述

SD（Smart Distribution）是 ShipSage 的核心订单履约流程，通过队列驱动、逐步推进，将平台订单转化为仓库可执行的发货指令。

**核心标识**：GT_Transaction.fulfilled_by_shipsage = 1 表示该订单走 SD 流程。

### 4.2 完整 SD 流程图

```
平台订单同步
      ↓
[SYNCED] ←──────────────── GT_Transaction.status
      ↓
┌─────────────────────────────────────────────────────────┐
│  STEP 1: Confirm（确认）                                  │
│  Repository: ConfirmRepository                           │
│  Job: ConfirmJob（锁：order_id）                         │
│  Queue: biz:smart-distribution:confirm-queue             │
├─────────────────────────────────────────────────────────┤
│  - 查询 SYNCED 状态的订单                                 │
│  - 检查账户余额（pay-as-go 余额不足跳过）                  │
│  - 自动确认规则（符合条件自动→CONFIRMED）                 │
│  - 手动确认触发条件（→TO_BE_CONFIRMED 或 ERROR）：        │
│    · FedEx 2Day 且数量>1                                  │
│    · 库存不足                                            │
│    · 同仓库库存不足以满足整单                             │
│    · PO Box 地址                                         │
│    · 偏远地址                                            │
│    · 风险订单（is_risk_order=1）                         │
│    · 公司无仓库权限                                       │
│    · 特殊 SKU 或特殊站点SKU组合                           │
│    · 同地址订单超过3单（company 1980 规则）               │
└─────────────────────────────────────────────────────────┘
      ↓
[CONFIRMED]
      ↓
┌─────────────────────────────────────────────────────────┐
│  STEP 2: Group（分组）                                    │
│  Repository: GroupRepository                             │
│  Job: GroupJob（锁：company_id + 地址信息）              │
│  Queue: biz:smart-distribution:group-queue               │
├─────────────────────────────────────────────────────────┤
│  - 将同地址、同公司的多条 trx 合并成一个 combine_group_id │
│  - 写入 GT_TransactionGroup 表                           │
│  - 更新 GT_Transaction.status = GROUPED                  │
│  - 更新 GT_Transaction.combine_group_id                  │
└─────────────────────────────────────────────────────────┘
      ↓
[GROUPED]
      ↓
┌─────────────────────────────────────────────────────────┐
│  STEP 3: AutoSelectWarehouse（自动选仓，可选步骤）         │
│  Repository: AutoSelectWarehouseRepository               │
│  Job: AllocateInventoryJob（含选仓逻辑）                  │
├─────────────────────────────────────────────────────────┤
│  - 查询各仓库库存可用量                                   │
│  - 按可用量选出最优仓库                                   │
│  - 写入 GT_Transaction.shipped_warehouse_id              │
│  - 状态保持/回退 GROUPED                                 │
└─────────────────────────────────────────────────────────┘
      ↓
┌─────────────────────────────────────────────────────────┐
│  STEP 4: CreateVariation（创建变体）                      │
│  Repository:  CreateVariationRepository                   │
│  Job: CreateVariationJob (锁:combine_group_id)           │
│  Queue: biz:smart-distribution:create-variation-queue    │
├─────────────────────────────────────────────────────────┤
│  - 创建 customer_address 记录                            │
│  - 创建 fulfillable_variation 记录                       │
│  - 创建 fulfillable_shipment + fulfillable_shipment_detail│
│  - 更新 GT_Transaction.selected_fulfillable_variation_id │
│  - 更新 GT_Transaction.status = VARIATIONS_CREATED       │
└─────────────────────────────────────────────────────────┘
      ↓
[VARIATIONS_CREATED]
      ↓
┌─────────────────────────────────────────────────────────┐
│  STEP 5: ValidateAddress（地址验证）                      │
├─────────────────────────────────────────────────────────┤
│  - 更新 GT_Transaction.status = ADDRESS_VALIDATED        │
└─────────────────────────────────────────────────────────┘
      ↓
[ADDRESS_VALIDATED]
      ↓
┌─────────────────────────────────────────────────────────┐
│  STEP 6: RateVariation（运费报价）                        │
│  Repository: RateVariationRepository                     │
│  Job: RateVariationJob (锁:combine_group_id)             │
├─────────────────────────────────────────────────────────┤
│  - 写入 fulfillable_shipment_rate 多条费率记录            │
│  - 选出最优费率写入 selected_fulfillable_shipment_rate_id │
│  - 更新 GT_Transaction.status = VARIATIONS_RATED         │
└─────────────────────────────────────────────────────────┘
      ↓
[VARIATIONS_RATED]
      ↓
┌─────────────────────────────────────────────────────────┐
│  STEP 7: AllocateInventory（库存分配）                    │
│  Job: AllocateInventoryJob (锁:warehouse+catalog)        │
├─────────────────────────────────────────────────────────┤
│  - 扣减库存 qty_pending                                  │
│  - 更新 GT_Transaction.status = INVENTORY_ALLOCATED      │
└─────────────────────────────────────────────────────────┘
      ↓
[INVENTORY_ALLOCATED]
      ↓
┌─────────────────────────────────────────────────────────┐
│  STEP 8: CreateShipment（创建发货单）                     │
│  Repository: CreateShipmentRepository                    │
│  Job: CreateShipmentJob                                  │
├─────────────────────────────────────────────────────────┤
│  - 创建 GT_USPSShipping / Detail / Trx 记录              │
│  - 更新 fulfillable_shipment.usps_id                     │
│  - 更新 GT_Transaction.status = SHIPMENTS_CREATED        │
└─────────────────────────────────────────────────────────┘
      ↓
[SHIPMENTS_CREATED]
      ↓
┌─────────────────────────────────────────────────────────┐
│  STEP 9: Label（生成标签）                                │
│  Repository: LabelRepository                             │
│  Job: LabelJob (锁:combine_group_id + order_id)          │
├─────────────────────────────────────────────────────────┤
│  按优先级路由15条承运商分支：                             │
│  Teapplix->客户自带->Veeqo->TikTok->EnableCarrier        │
│  ->AmazonBuy->Agency->WesternPost->UPS->USPS             │
│  ->FedEx->GlobalPost->DHL->AmazonShipping->OnTrac        │
│  - 写入 GT_USPSShipping.tracking_number / label_time     │
│  - 写回 GT_Transaction.shipping_tracking_number          │
│  - 更新 GT_Transaction.status = SHIPMENTS_LABELED        │
└─────────────────────────────────────────────────────────┘
      ↓
[SHIPMENTS_LABELED]
      ↓
┌─────────────────────────────────────────────────────────┐
│  STEP 10: SyncToWms（同步到 WMS）                         │
│  Repository: SyncToWmsRepository                         │
│  Job: SyncToWmsJob (锁:usps_id)                          │
├─────────────────────────────────────────────────────────┤
│  - 查询 label_time 5天内且 submit_time IS NULL            │
│  - 排除 WesternPost (angency_id=18)                      │
│  - 创建 wms_shipment，写入 submit_time / wms_order_id    │
└─────────────────────────────────────────────────────────┘
      ↓
[WMS履约: Picked→Packed→Final Scanned→Shipped→Delivered]
```

---

## 五、数据关联关系

### 5.1 核心表关联图

```
GT_Transaction (trx_id)
  ├─ order_id (1:N 多条trx同属一个order)
  ├─ shipping_tracking_number --> GT_USPSShipping.tracking_number
  ├─ selected_fulfillable_variation_id --> fulfillable_variation
  ├─ wms_order_id --> wms_shipment
  └─ shipped_warehouse_id --> GT_Warehouse

GT_TransactionGroup (combine_group_id, trx_id)
  └─ combine_group_id --> fulfillable_variation.combine_group_id

fulfillable_variation
  ├─ customer_address_id --> customer_address
  └─ 1:N --> fulfillable_shipment

fulfillable_shipment
  ├─ selected_fulfillable_shipment_rate_id --> fulfillable_shipment_rate
  ├─ usps_id --> GT_USPSShipping
  ├─ 1:N --> fulfillable_shipment_detail
  └─ 1:N --> fulfillable_shipment_rate

GT_USPSShipping (usps_id)
  ├─ 1:N --> GT_USPSShippingDetail
  └─ 1:N --> GT_USPSShippingTrx
```

### 5.2 关键关联 SQL

```sql
-- 查询 SD 订单及发货信息
SELECT
    t.trx_id, t.order_id, t.company_id,
    t.status, t.order_state, t.fulfilled_by_shipsage,
    t.shipped_warehouse_id, t.shipping_tracking_number,
    u.usps_id, u.tracking_number, u.amount, u.weight,
    u.mail_class, u.label_time, u.submit_time,
    u.status_event, u.delivery_date_time
FROM GT_Transaction t
LEFT JOIN GT_USPSShipping u
    ON t.shipping_tracking_number = u.tracking_number
WHERE t.fulfilled_by_shipsage = 1
  AND t.status NOT IN ('CANCELLED', 'REFUNDED');

-- 查询订单完整 SD 链路
SELECT
    t.trx_id, t.order_id, t.status AS trx_status,
    tg.combine_group_id,
    fv.fulfillable_variation_id,
    fs.fulfillable_shipment_id, fs.warehouse_id, fs.shipment_state,
    fsr.carrier, fsr.service, fsr.rate,
    u.usps_id, u.tracking_number, u.label_time
FROM GT_Transaction t
JOIN GT_TransactionGroup tg ON tg.trx_id = t.trx_id
JOIN fulfillable_variation fv ON fv.combine_group_id = tg.combine_group_id
JOIN fulfillable_shipment fs ON fs.fulfillable_variation_id = fv.fulfillable_variation_id
LEFT JOIN fulfillable_shipment_rate fsr
    ON fsr.fulfillable_shipment_rate_id = fs.selected_fulfillable_shipment_rate_id
LEFT JOIN GT_USPSShipping u ON u.usps_id = fs.usps_id
WHERE t.trx_id = 'YOUR_TRX_ID';
```

---

## 六、多渠道订单导入

### 6.1 支持的平台

| 平台 | 说明 |
|------|------|
| Amazon | FBA/FBM，支持 Prime |
| Shopify | Shopify 店铺订单 |
| Chewy | Chewy 宠物平台 |
| Wayfair | Wayfair 家居平台 |
| Walmart | Walmart 平台 |
| eBay | eBay 订单 |
| TikTok | TikTok Shop（标签由 TikTok 提供）|
| Shein | Shein 快时尚平台 |
| DropShipping | Drop Shipping 订单 |
| Temu | Temu 平台（发货前检查取消状态）|

### 6.2 订单导入 Repository 目录

```
Application/ShipSage/OMS/Repositories/Order/Import/
├── BaseImportRepository.php
├── AmazonRepository.php
├── ShopifyRepository.php
├── ChewyRepository.php
├── DropShippingRepository.php
├── CommonRepository.php
└── Y2Repository.php
```

---

## 七、承运商体系（Agency 枚举）

| 值 | 常量 | 承运商 |
|----|------|--------|
| 1 | GAATU | Gaatu（自营）|
| 2 | ENDICIA | Endicia |
| 5 | MARKETPLACE | Marketplace |
| 6 | WINIT | Winit |
| 10 | LIANGCANG | 良仓 |
| 11 | AMAZON_SHIPPING | Amazon Shipping |
| 12 | EZEESHIP | EzeeShip |
| 13 | SHIPBER | Shipber |
| 14 | TOPLINE | Topline |
| 15 | AMAZON_MCF | Amazon MCF |
| 16 | TEMU_PLATFORM_LABEL | Temu 平台标签 |
| 18 | WESTERNPOST | WesternPost（不同步 WMS）|
| 22 | VEEQO | Veeqo |
| 23 | MINGTENG | 明腾 |

LabelRepository 支持的承运商：UPS、USPS、GlobalPost、FedEx、DHL、Amazon Shipping (AMZN_US)、OnTrac

---

## 八、OMS 对客 API 接口

### 8.1 订单查询接口

| API | 功能 |
|-----|------|
| index.by-list | 订单列表（分页）|
| index.by-list-filter | 条件筛选订单 |
| index.by-list-action-required-order | 待人工操作订单 |
| index.by-list-action-required-shipment | 待人工操作发货单 |
| index.by-order-detail-shipment | 订单发货详情 |
| index.by-shipment-list-all | 所有发货单 |
| index.by-count | 按状态统计订单数 |
| show.by-order-detail | 订单详情 |
| show.by-transaction-shipment | 交易发货详情 |

### 8.2 订单操作接口

| API | 功能 |
|-----|------|
| store.by-upload | 导入订单文件 |
| store.by-batch-update | 批量更新 |
| store.by-batch-fulfilled | 批量标记完成 |
| store.by-batch-update-status-cancelled | 批量取消 |
| store.by-batch-update-status-confirmed | 批量确认 |
| store.by-switch-order-state | 切换订单状态 |
| store.by-switch-order-state-to-return | 转为退货 |
| store.by-switch-shipment-state | 切换发货单状态 |
| store.by-mark-order-as-shipped | 标记已发货 |
| store.by-change-shipped-warehouse-id | 更改发货仓库 |
| update.by-status-cancelled | 取消订单 |
| update.by-void | 作废订单 |
| update.by-intercept | 拦截订单 |

---

## 九、关键业务规则总结

### 9.1 Confirm 步骤手动确认规则（共9条）

| 规则 | 结果状态 | 说明 |
|------|----------|------|
| FedEx 2Day 且数量大于1 | ERROR | 联系客服处理 |
| 订单库存不足 | TO_BE_CONFIRMED | 库存不够发整单 |
| 同仓库库存不足 | TO_BE_CONFIRMED | 无法从同一仓库发全部商品 |
| PO Box 地址 | TO_BE_CONFIRMED | 地址含 P.O.Box |
| 偏远地址 | TO_BE_CONFIRMED | 特定州/国家 |
| 风险订单 | TO_BE_CONFIRMED | is_risk_order=1 |
| 公司无仓库权限 | ERROR | 未配置可用仓库 |
| 特殊 SKU/站点组合 | TO_BE_CONFIRMED | 配置排除项 |
| 同地址订单超3单 | TO_BE_CONFIRMED | company 1980 专属规则 |

### 9.2 标签来源（LabelProvidedBy）

| 值 | 常量 | 说明 |
|----|------|------|
| 1 | SYSTEM | 系统生成标签 |
| 2 | CUSTOMER | 客户自带标签（跳过标签生成）|
| 3 | THIRD_PARTY | 第三方平台提供（TikTok/Veeqo）|

### 9.3 SyncToWms 过滤条件

- label_time 在近5天内
- submit_time IS NULL（未同步过）
- voided = 0 且 stop_shipping = 0
- angency_id != 18（排除 WesternPost）
- 在 wms_shipment 中不存在（left join 为 NULL）
- 按 trx_id 分组去重，每 trx_id 只推一条 usps_id（防死锁）

### 9.4 Group 步骤分组逻辑

- combine_group_id 格式：G + md5(uniqid + trx_ids 拼接)
- 同一 order_id 下的多条 trx 通常分为同一组
- 同地址、同公司的跨 order 订单也可被合并
- 分组结果写入 GT_TransactionGroup（combine_group_id, trx_id）

---

## 十、模块调用链路

```
前端 Vue.js (client/ShipSage)
      | HTTP API
Application/ShipSage/OMS/Http/Controllers/OrderController
      | sv()/rs()
Application/ShipSage/OMS/Services/OrderService
      | rs()
Business/BIZ/Services/SmartDistributionService        # SD 主调度
Business/BIZ/Services/SmartDistributionQueueService   # 队列推送
      | Jobs (Laravel Queue)
Business/BIZ/Jobs/SmartDistribution/*Job
      | artisan command
Business/BIZ/Repositories/SmartDistribution/*Repository
      | rs()
DB/ERP/Repositories/*Repository
      | Eloquent ORM
Production 数据库 (GT_Transaction、GT_USPSShipping 等)
```

跨模块调用使用 rs()（Repository Service）和 sv()（Service）助手函数，第4个参数为 true 时表示绕过权限检查（内部调用）。

---

## 十一、重要枚举文件索引

| 枚举类 | 路径 | 内容 |
|--------|------|------|
| TransactionStatus | DB/ERP/Enum/TransactionStatus.php | 交易状态、订单状态、Action Required 类型 |
| ShipmentStatus | DB/ERP/Enum/ShipmentStatus.php | 发货单数字状态和字符串状态 |
| LabelProvidedBy | DB/ERP/Enum/LabelProvidedBy.php | 标签来源：1=系统，2=客户，3=第三方 |
| OrderY2Status | DB/ERP/Enum/OrderY2Status.php | Y2 订单状态（1-10）|
| Agency | DB/ERP/Enum/Agency.php | 承运机构枚举（23个值）|
| PackingMaterialCategory | DB/ERP/Enum/PackingMaterialCategory.php | 包材类型（含 FEDEX_2_DAYS）|
| Site | DB/ERP/Enum/Site.php | 站点枚举（Amazon/eBay/Temu 等）|

---

*文档生成时间：2026-03-17 | 基于代码库深度扫描，涵盖核心业务逻辑与数据模型*

