# ShipSage Transfer 模块系统分析报告

> 文档版本: 1.0
> 生成日期: 2026-03-17
> 用途: 需求分析参考

---

## 1. 模块概述

**Transfer (调拨)** 是 ShipSage WMS 系统中的库存调拨模块,负责管理仓库之间的库存转移流程。它连接源仓库和目标仓库,实现跨仓库的库存调配。

### 1.1 核心功能

- 调拨单创建与管理 (完整生命周期)
- 调拨类型支持 (FBA, B2B, Internal 等)
- 拣货流程 (Picking Slip)
- 包装准备 (Pack Preparation)
- 托盘化 (Palletize)
- 货件生成与追踪 (Shipment)
- 标签与运单管理 (Label & BOL)
- 上架标签管理 (Stow Tag)
- 调拨费用计算
- ASN 关联

### 1.2 支持的调拨类型

| 类型ID | 类型名 | 说明 |
|--------|--------|------|
| 1 | AMAZON_FBA | Amazon FBA 调拨 |
| 2 | AMAZON_VC | Amazon Vendor Central |
| 3 | HOMEGOODS | HomeGoods 商超调拨 |
| 4 | WALMART | Walmart 商超调拨 |
| 5 | BEST_BUY | BestBuy 商超调拨 |
| 6 | B2C | B2C 调拨 |
| 7 | INTERNAL | 内部调拨 |
| 8 | TARGET | Target 商超调拨 |
| 9 | KOHLS | Kohls 商超调拨 |
| 10 | GNC | GNC 商超调拨 |
| 11 | AMAZON_FBA_CA | Amazon FBA Canada |
| 12 | AMAZON_FBA_MX | Amazon FBA Mexico |
| 13 | REBELUTION | Rebelution 调拨 |
| 14 | FBT_US | FBT US 调拨 |

---

## 2. 数据结构

### 2.1 核心表关系

```
app_wms_transfer (调拨主表)
├── app_wms_transfer_item (调拨明细)
├── app_wms_transfer_shipment (货件)
│   ├── app_wms_transfer_shipment_carton (箱号)
│   └── app_wms_transfer_shipment_pallet (托盘)
├── app_wms_transfer_stow_tag (上架标签)
├── app_wms_transfer_action (操作日志)
├── app_wms_transfer_fee (费用)
├── app_wms_transfer_instruction (调拨说明)
├── app_wms_transfer_picking_slip (拣货单)
├── app_wms_transfer_pack_preparation (包装准备)
├── app_wms_asn_transfer_link (ASN 关联)
└── app_wms_vas_transfer_link (VAS 关联)
```

### 2.2 主表: app_wms_transfer

| 字段 | 类型 | 说明 |
|------|------|------|
| transfer_id | int | 主键 |
| company_id | int unsigned | 公司ID |
| status_id | tinyint | 状态 |
| type_id | tinyint | 调拨类型 |
| platform_id | tinyint | 平台ID |
| title | varchar(255) | 标题 |
| description | text | 描述 |
| handling_unit_id | tinyint | 作业单元ID |
| source_warehouse_id | int | 源仓库ID |
| destination_warehouse_id | int | 目标仓库ID |
| scheduled_start_time | datetime | 计划开始时间 |
| scheduled_finish_time | datetime | 计划结束时间 |
| actual_start_time | datetime | 实际开始时间 |
| actual_finish_time | datetime | 实际结束时间 |
| shipping_method_id | tinyint | 发货方式 |
| delivery_method_id | tinyint | 配送方式 |
| is_dc_packing_list | tinyint | 是否DC包装清单 |
| reference_order_number | varchar(255) | 参考订单号 |
| master_tracking_number | varchar(255) | 主追踪号 |
| declaration_value | varchar(255) | 申报价值 |
| picking_method | tinyint | 拣货方式 |
| put_away_method | tinyint | 上架方式 |
| order_id | int | 订单ID |
| working_location_id | int unsigned | 工作库位ID |
| inventory_type | tinyint | 库存类型 |
| billing_audit_start_time | datetime | 计费审核开始时间 |
| split | tinyint | 是否拆分 |
| draft_data | json | 草稿数据 |
| version | tinyint unsigned | 版本号 |
| total_estimation_fee | decimal(12,2) | 预估费用总额 |

**审计字段**: hidden, disabled, deleted, deleted_at, created_at, created_by, updated_at, updated_by, sla_comments

### 2.3 明细表: app_wms_transfer_item

| 字段 | 类型 | 说明 |
|------|------|------|
| transfer_item_id | int unsigned | 主键 |
| transfer_id | int unsigned | 调拨主表ID |
| company_id | int unsigned | 公司ID |
| product_id | int | 产品ID |
| customer_sku | varchar(255) | 客户SKU |
| fnsku | varchar(255) | FNSKU |
| asin | varchar(255) | ASIN |
| case_packed_qty | int | 箱包装数量 |
| barcode | varchar(255) | 条码 |
| asn_id | int | ASN ID |
| parent_trace_id | varchar(255) | 父追踪ID |
| sku_qty | varchar(255) | SKU数量 |
| content | varchar(255) | 描述 |
| qty | int | 数量 |
| qty_picked | int | 已拣货数量 |
| qty_putback | int | 归还数量 |
| qty_shipped | int | 已发货数量 |
| qty_in_box | int | 已装箱数量 |
| wave_id | varchar(255) | 波次ID |

### 2.4 货件表: app_wms_transfer_shipment

| 字段 | 类型 | 说明 |
|------|------|------|
| transfer_shipment_id | int unsigned | 主键 |
| company_id | int unsigned | 公司ID |
| transfer_id | int unsigned | 调拨主表ID |
| status_id | tinyint | 状态 |
| handling_unit_id | tinyint | 作业单元ID |
| shipment_number | varchar(255) | 货件号 |
| source_warehouse_id | int | 源仓库ID |
| destination_warehouse_id | int | 目标仓库ID |
| fulfillment_center | varchar(255) | 配送中心 |
| estimate_shipping_fee | decimal(10,2) | 预估运费 |
| shipping_service_code | varchar(255) | 运输服务代码 |
| is_residential | tinyint | 是否住宅地址 |
| transfer_shipment_address_id | int | 地址ID |
| bol_date | date | 运单日期 |
| bol_number | varchar(255) | 运单号 |
| shipped_time | datetime | 发货时间 |
| shipped_by | int | 发货人 |
| carrier_name | varchar(255) | 承运商名称 |
| audited_time | datetime | 审核时间 |
| audited_by | int | 审核人 |
| scm_headway_id | int | SCM系统ID |
| desc | varchar(255) | 描述 |
| pickup_comments | varchar(255) | 取货备注 |
| shipped_comments | varchar(255) | 发货备注 |

### 2.5 操作日志表: app_wms_transfer_action

| 字段 | 类型 | 说明 |
|------|------|------|
| action_id | int unsigned | 主键 |
| company_id | int unsigned | 公司ID |
| action_type_id | int | 操作类型ID |
| transfer_id | int unsigned | 调拨主表ID |
| transfer_item_id | int | 调拨明细ID |
| notes | text | 备注 |
| extra | json | 扩展数据 |

### 2.6 费用表: app_wms_transfer_fee

| 字段 | 类型 | 说明 |
|------|------|------|
| transfer_fee_id | int unsigned | 主键 |
| company_id | int unsigned | 公司ID |
| transfer_id | int unsigned | 调拨主表ID |
| fee_id | int unsigned | 费用ID |

### 2.7 上架标签表: app_wms_transfer_stow_tag

| 字段 | 类型 | 说明 |
|------|------|------|
| transfer_stow_tag_id | int unsigned | 主键 |
| company_id | int unsigned | 公司ID |
| transfer_id | int unsigned | 调拨主表ID |
| stow_tag_id | int unsigned | 上架标签ID |

---

## 3. 状态机

### 3.1 调拨主状态 (TransferStatus)

| 值 | 状态名 | 说明 |
|----|--------|------|
| 1 | DRAFT | 草稿 |
| 2 | REVIEW | 审核中 |
| 3 | PENDING | 待处理 |
| 4 | OPEN | 已开放 |
| 5 | IN_PROGRESS | 进行中 |
| 6 | PENDING_SHIPMENT_ID | 待货件号 |
| 7 | IN_PROGRESS_PALLETIZE | 托盘化中 |
| 8 | PENDING_LABEL_BOL | 待标签运单 |
| 9 | IN_PROGRESS_FINALIZE | 最终处理中 |
| 10 | READY_PICKUP | 待取货 |
| 11 | BILLING_AUDIT | 计费审核 |
| 12 | COMPLETED | 已完成 |
| 13 | CANCELLED | 已取消 |

### 3.2 状态流转图

```
DRAFT (1) → REVIEW (2) → PENDING (3) → OPEN (4)
                                              ↓
                                        IN_PROGRESS (5)
                                              ↓
                                   PENDING_SHIPMENT_ID (6)
                                              ↓
                                  IN_PROGRESS_PALLETIZE (7)
                                              ↓
                                   PENDING_LABEL_BOL (8)
                                              ↓
                                 IN_PROGRESS_FINALIZE (9)
                                              ↓
                                      READY_PICKUP (10)
                                              ↓
                                     BILLING_AUDIT (11)
                                              ↓
                                       COMPLETED (12)

DRAFT (1) → ... → CANCELLED (13)  (可从任意状态取消)
```

### 3.3 不同调拨类型的状态序列

| 序列名 | 适用类型 | 状态序列 |
|--------|----------|----------|
| SPD_DC_PACKING | Small Parcel, DC Packing | 1,2,3,4,5,6,9,10,11,12 |
| SPD_CUSTOMER_PACKING | Small Parcel, Customer Packing | 1,2,3,4,5,10,11,12 |
| LTL_DC_PACKING | LTL, DC Packing | 1,2,3,4,5,6,7,8,9,10,11,12 |
| LTL_CUSTOMER_PACKING | LTL, Customer Packing | 1,2,3,4,5,8,9,10,11,12 |

---

## 4. 系统架构

### 4.1 层级结构

```
TransferController (API 入口)
    ↓
TransferService (业务逻辑层)
    ↓
TransferRepository (数据访问层)
    ↓
TransferBaseRepository (DB/WMS 连接)
```

### 4.2 关键组件

| 组件 | 路径 | 说明 |
|------|------|------|
| TransferController | Application/ShipSage/WMS/Http/Controllers/ | API 入口 |
| TransferService | Application/ShipSage/WMS/Services/ | 业务逻辑 |
| TransferRepository | Application/ShipSage/WMS/Repositories/ | 数据访问 |
| TransferBaseRepository | Business/BIZ/Repositories/Base/ | 基础数据访问 |
| TransferStatus | DB/WMS/Enum/ | 状态枚举 |
| TransferType | DB/WMS/Enum/ | 类型枚举 |
| TransferStowTagRepository | Application/ShipSage/WMS/Repositories/ | 上架标签数据访问 |

---

## 5. API 接口

### 5.1 Service 层 API (通过 rs() 调用)

#### GET 列表查询

| API | 说明 |
|-----|------|
| index.by-get-transfer-items | 调拨项列表 |
| index.by-transfer-picking-slip | 拣货单 |
| index.by-transfer-working-inventory | 在途库存 |
| index.by-transfer-stow-tag | 上架标签 |
| index.by-shipment-list | 货件列表 |
| index.by-transfer-shipment-carton | 货件箱号 |
| index.by-transfer-shipment-pallet | 货件托盘 |
| index.by-transfer-pack-preparation | 包装准备 |
| index.by-transfer-pack-preparation-for-cn | 包装准备(中国) |
| index.by-find-carton-by-barcode | 按条码查箱号 |
| index.by-find-pallet-by-barcode | 按条码查托盘 |
| index.by-list-transfer-customer-documents | 客户文档列表 |
| index.by-check-pack-product | 检查包装产品 |
| index.by-check-palletize-carton | 检查托盘化箱号 |
| index.by-check-before-pickup-ready | 检查取货准备 |
| index.by-check-before-mark-as-shipped | 检查标记发货 |
| index.by-check-stow-tag-item | 检查上架标签项 |
| index.by-transfer-generate-shipping-label | 生成运输标签 |
| index.by-working-inventory | 在途库存 |
| index.by-transfer-download-carton-list | 下载箱号列表 |
| index.by-transfer-download-pallet-list | 下载托盘列表 |
| index.by-list-consolidated-shipments | 合并货件列表 |
| index.by-consolidated-shipments-report | 合并货件报告 |
| index.by-list-consolidated-detail | 合并明细 |
| index.by-picking-slip-picks | 拣货单拣选 |
| index.by-download-pallet-carton-sku-info | 下载托盘箱号SKU信息 |

#### GET 单条查询

| API | 说明 |
|-----|------|
| show.by-transfer-instruction | 调拨说明 |
| show.by-transfer-shipment | 调拨货件 |

#### POST 创建/操作

| API | 说明 |
|-----|------|
| store.by-transfer-open | 开放调拨 |
| store.by-transfer-start | 开始调拨 |
| store.by-transfer-cancel | 取消调拨 |
| store.by-transfer-packing-list-ready | 包装清单就绪 |
| store.by-palletize-complete | 托盘化完成 |
| store.by-shipment-pickup-ready | 货件取货就绪 |
| store.by-shipment-mark-as-shipped | 标记已发货 |
| store.by-transfer-carton | 调拨箱号 |
| store.by-save-info-edit-carton | 保存编辑箱号 |
| store.by-batch-create-cartons | 批量创建箱号 |
| store.by-save-info-edit-preparation-carton | 保存包装箱号 |
| store.by-bulk-update-dimension-by-upload | 批量更新尺寸 |
| store.by-bulk-update-carton-by-upload | 批量更新箱号 |
| store.by-bulk-update-pallet-by-upload | 批量更新托盘 |
| store.by-delete-shipment-carton | 删除货件箱号 |
| store.by-shipment-palletize | 货件托盘化 |
| store.by-create-shipment-pallet | 创建货件托盘 |
| store.by-save-info-edit-pallet | 保存编辑托盘 |
| store.by-delete-shipment-pallet | 删除货件托盘 |
| store.by-complete | 完成调拨 |
| store.by-gs1-label | GS1 标签 |
| store.by-take-photo | 拍照 |
| store.by-upload-consolidated-detail | 上传合并明细 |

#### PUT 更新

| API | 说明 |
|-----|------|
| update.by-extra-setting | 额外设置 |

#### DELETE 删除

| API | 说明 |
|-----|------|
| destroy.by-shipment-pallet | 删除货件托盘 |

### 5.2 货件状态 (TransferShipmentStatus)

| 值 | 状态名 | 说明 |
|----|--------|------|
| 1 | PENDING | 待处理 |
| 2 | PICKUP_READY | 取货就绪 |
| 3 | IN_TRANSIT | 运输中 |
| 4 | DELIVERED | 已送达 |
| 5 | CANCELLED | 已取消 |

---

## 6. 业务流程

### 6.1 标准调拨流程

```
1. 创建调拨单 (Draft)
   ↓
2. 审核 (Review)
   ↓
3. 准备 (Pending → Open)
   ↓
4. 拣货 (In Progress)
   ↓
   ├── 生成拣货单 (Picking Slip)
   ├── 执行拣货
   └── 更新拣货数量
   ↓
5. 包装 (Packing Preparation)
   ↓
   ├── 箱号管理 (Carton)
   ├── 托盘化 (Palletize)
   └── 标签/运单 (Label/BOL)
   ↓
6. 发货 (Ready Pickup → Mark as Shipped)
   ↓
   ├── 承运商取货
   └── 追踪信息更新
   ↓
7. 运输 (In Transit)
   ↓
8. 到达目标仓库 → 创建 ASN
   ↓
9. 目标仓库收货 (Inbound)
   ↓
10. 计费审核 (Billing Audit)
    ↓
11. 完成 (Completed)
```

### 6.2 拣货流程 (Picking)

```
1. 生成拣货单 (Picking Slip)
2. 按波次/区域拣货
3. 扫描验证
4. 放到待包装区
5. 更新已拣数量
```

### 6.3 包装与托盘化流程

```
1. 包装准备 (Pack Preparation)
2. 箱号创建与管理
   ├── 手动创建
   └── 批量导入
3. 托盘化 (Palletize)
   ├── 托盘创建
   ├── 箱号关联
   └── 托盘标签生成
4. 生成 Label/BOL
5. 准备取货
```

### 6.4 与 ASN 集成

调拨发货后,在目标仓库自动创建 ASN:
- 源仓库发货 → 创建 Transfer Shipment
- 目标仓库 → 创建 ASN (Inbound)
- 收货后 → 更新库存

---

## 7. 关键业务规则

### 7.1 数量关系

- **qty** = 调拨总数量
- **qty_picked** ≤ qty (已拣货数量)
- **qty_shipped** ≤ qty_picked (已发货数量)
- **qty_in_box** ≤ qty_picked (已装箱数量)

### 7.2 状态控制

- 只有 OPEN 状态才能开始拣货
- 拣货完成才能进入包装阶段
- 托盘化完成才能生成 Label/BOL
- COMPLETED 状态不可逆

### 7.3 多平台支持

- FBA 调拨: 支持 FBA 特有的 FNSKU, ASIN 字段
- 商超调拨: 支持 Target, Walmart 等的特殊要求
- 内部调拨: 简单的仓库间调拨

---

## 8. 与其他模块的关系

### 8.1 ASN 模块

- 调拨发货 → 目标仓库创建 ASN
- ASN 收货 → 完成库存入库

### 8.2 库存模块 (Inventory)

- 调拨出库 → 源仓库库存扣减
- ASN 入库 → 目标仓库库存增加

### 8.3 拣货模块 (Picking)

- 生成 Picking Slip
- 波次管理 (Wave Pick)
- 拣货验证

### 8.4 计费模块 (4PL/Billing)

- 调拨产生运输费用
- 计费审核是完成的必要条件

### 8.5 VAS 模块

- 支持 Value-Added Services
- VAS 与 Transfer 关联

---

## 9. 相关枚举

### 9.1 TransferStatus

```
DRAFT(1) → REVIEW(2) → PENDING(3) → OPEN(4) → IN_PROGRESS(5)
  → PENDING_SHIPMENT_ID(6) → IN_PROGRESS_PALLETIZE(7) → PENDING_LABEL_BOL(8)
  → IN_PROGRESS_FINALIZE(9) → READY_PICKUP(10) → BILLING_AUDIT(11) → COMPLETED(12)

可随时 → CANCELLED(13)
```

### 9.2 TransferType

```
AMAZON_FBA(1), AMAZON_VC(2), HOMEGOODS(3), WALMART(4), BEST_BUY(5),
B2C(6), INTERNAL(7), TARGET(8), KOHLS(9), GNC(10),
AMAZON_FBA_CA(11), AMAZON_FBA_MX(12), REBELUTION(13), FBT_US(14)
```

### 9.3 InventoryActionType

调拨相关的库存操作类型:

| 值 | 类型名 | 说明 |
|----|--------|------|
| 4 | TRANSFER_SHIPMENT | 调拨发货 |

---

## 10. 数据库连接

- **Connection**: WMS
- **数据库**: wms
- **主表**: app_wms_transfer
- **核心关联表**:
  - app_wms_transfer_item (明细)
  - app_wms_transfer_shipment (货件)
  - app_wms_transfer_shipment_carton (箱号)
  - app_wms_transfer_shipment_pallet (托盘)
  - app_wms_transfer_action (操作日志)
  - app_wms_transfer_fee (费用)
  - app_wms_transfer_stow_tag (上架标签)

---

## 11. 开发注意事项

### 11.1 调用方式

```php
// 获取调拨列表
$this->rs('ShipSage/WMS/Transfer', 'index', [
    'api' => 'index.by-get-transfer-items',
    'warehouse_id' => 103
]);

// 获取调拨明细
$this->rs('ShipSage/WMS/Transfer', 'index', [
    'api' => 'index.by-get-transfer-items',
    'transfer_id' => 12345
]);

// 创建调拨
$this->rs('ShipSage/WMS/Transfer', 'store', [
    'api' => 'store.by-transfer-open',
    'source_warehouse_id' => 103,
    'destination_warehouse_id' => 105,
    'type_id' => 1,
    'items' => [...]
]);

// 标记发货
$this->rs('ShipSage/WMS/Transfer', 'store', [
    'api' => 'store.by-shipment-mark-as-shipped',
    'transfer_id' => 12345
]);
```

### 11.2 注意事项

1. 所有参数使用 snake_case
2. company_id 由系统自动处理,不需要传入
3. 调拨类型决定状态流转序列
4. 发货后自动触发目标仓库 ASN 创建
5. 支持 stow_tag 关联用于上架追踪

---

## 12. 附录

### 12.1 相关文档

- [ShipSage WMS 模块概述](../ShipSage_WMS_模块系统分析报告.md)
- [ShipSage ASN 模块](./ShipSage_ASN_模块系统分析报告.md)
- [ShipSage 订单模块](./ShipSage_订单模块系统文档.md)
- [ShipSage 库存模块](./ShipSage_库存模块系统文档.md)

### 12.2 相关控制器

- TransferController — 调拨基础操作

### 12.3 相关 Service

- TransferService — 调拨核心业务
- TransferStowTagRepository — 上架标签数据访问

### 12.4 Transfer 模块表清单

| 表名 | 说明 |
|------|------|
| app_wms_transfer | 调拨主表 |
| app_wms_transfer_item | 调拨明细 |
| app_wms_transfer_shipment | 货件 |
| app_wms_transfer_shipment_carton | 货件箱号 |
| app_wms_transfer_shipment_pallet | 货件托盘 |
| app_wms_transfer_action | 操作日志 |
| app_wms_transfer_action_type | 操作类型 |
| app_wms_transfer_fee | 费用 |
| app_wms_transfer_fee_estimation | 费用预估 |
| app_wms_transfer_stow_tag | 上架标签 |
| app_wms_transfer_picking_slip | 拣货单 |
| app_wms_transfer_pack_preparation | 包装准备 |
| app_wms_transfer_instruction | 调拨说明 |
| app_wms_transfer_address | 地址 |
| app_wms_asn_transfer_link | ASN关联 |
| app_wms_vas_transfer_link | VAS关联 |
