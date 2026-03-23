# ShipSage ASN 模块系统分析报告

> 文档版本: 1.0
> 生成日期: 2026-03-17
> 用途: 需求分析参考

---

## 1. 模块概述

**ASN (Advanced Shipping Notification)** 是 ShipSage WMS 系统中的入库通知模块，负责管理从货物发出到入库完成的完整流程。它是仓库运营的起点,连接上游发货通知与下游库存管理。

### 1.1 核心功能

- ASN 创建与管理 (Draft → Completed 完整生命周期)
- 预收货 (Pre-Receiving) 扫描与数量确认
- 实际收货 (Receiving) 扫描与入库
- 货件 manifest 管理
- 箱号 (Carton) 追踪
- 异常处理与数量调整
- 入库费用计算
- 与 FBA (Fulfillment by Amazon) 货件集成

---

## 2. 数据结构

### 2.1 核心表关系

```
app_wms_asn (主表)
├── app_wms_asn_detail (明细表)
│   └── app_wms_asn_manifest (Manifest 表)
│       └── app_wms_asn_carton (箱号表)
├── app_wms_asn_action (操作日志)
└── app_wms_asn_fee (费用表)
```

### 2.2 主表: app_wms_asn

ASN 主表记录入库通知的核心信息。

| 字段 | 类型 | 说明 |
|------|------|------|
| asn_id | int unsigned | 主键 |
| company_id | int | 公司ID |
| warehouse_id | int | 仓库ID |
| source_warehouse_id | int | 源仓库ID (用于转库) |
| fba_shipment_id | varchar(255) | FBA 货件ID |
| status_id | tinyint | 状态 (见状态枚举) |
| title | varchar(255) | ASN 标题 |
| handling_unit_id | tinyint | 作业单元ID |
| shipping_method | int | 发货方式 |
| delivery_method_id | int | 配送方式ID |
| is_palletized | tinyint | 是否托盘化 |
| number_of_pallets | int | 托盘数量 |
| estimated_arrival_date | date | 预计到达日期 |
| fifo | tinyint | 是否 FIFO |
| container_size | int | 集装箱尺寸 |
| container_number | varchar(255) | 集装箱号 |
| hbl | varchar(255) | House Bill of Lading |
| mbl | varchar(255) | Master Bill of Lading |
| tracking_info | varchar(255) | 追踪信息 |
| date_shipped | datetime | 发货日期 |
| is_dc_stick_label | tinyint | 是否贴 DC 标签 |
| received_by | int | 收货人ID |
| receive_time | datetime | 收货时间 |
| receiving_location_id | int unsigned | 收货库位ID |
| putaway_start_time | datetime | 上架开始时间 |
| comments | varchar(255) | 备注 |
| scheduled_start_time | datetime | 计划开始时间 |
| scheduled_finish_time | datetime | 计划结束时间 |
| actual_start_time | datetime | 实际开始时间 |
| actual_finish_time | datetime | 实际结束时间 |
| billing_audit_start_time | datetime | 计费审核开始时间 |
| version | tinyint unsigned | 版本号 |
| postpone_date | date | 延期日期 |
| sla_comments | text | SLA 备注 |

**审计字段** (所有表均包含):
- hidden, disabled, deleted, deleted_at
- created_at, created_by, updated_at, updated_by

### 2.3 明细表: app_wms_asn_detail

记录每个 SKU 的预期数量与实际收货数量。

| 字段 | 类型 | 说明 |
|------|------|------|
| asn_detail_id | int unsigned | 主键 |
| asn_detail_attr_id | int unsigned | 属性ID |
| company_id | int unsigned | 公司ID |
| asn_id | int unsigned | ASN 主表ID |
| status_id | tinyint | 明细状态 |
| product_id | int | 产品ID |
| sku | int | SKU ID |
| display_code | varchar(255) | 显示编码 |
| extra | tinyint | 额外数量标记 |
| qty_original | int | 原始数量 |
| qty_expected | int | 预期数量 |
| qty_additional | int | 额外数量 |
| qty_missing | int | 缺失数量 |
| qty_defective | int | 残次数量 |
| qty_received | int | 已收数量 |
| qty_put_away | int | 已上架数量 |
| qty_linked | int | 已关联数量 |
| closed_by | int | 关闭人ID |
| closed_time | datetime | 关闭时间 |

### 2.4 Manifest 表: app_wms_asn_manifest

记录 ASN 的货件明细,与箱号关联。

| 字段 | 类型 | 说明 |
|------|------|------|
| manifest_id | int unsigned | 主键 |
| manifest_attr_id | int unsigned | 属性ID |
| asn_id | int unsigned | ASN 主表ID |
| pallet_id | varchar(255) | 托盘ID |
| carton_id | int | 箱号ID |
| product_id | int | 产品ID |
| sku | int | SKU ID |
| display_code | varchar(255) | 显示编码 |
| number_of_cartons | int | 箱数 |
| number_of_cartons_received | int | 已收箱数 |
| units_per_carton | int | 每箱数量 |
| tracking_number | varchar(255) | 追踪号 |
| content | varchar(255) | 描述 |
| note | varchar(255) | 备注 |

### 2.5 箱号表: app_wms_asn_carton

记录每个箱子的物理信息。

| 字段 | 类型 | 说明 |
|------|------|------|
| carton_id | int unsigned | 主键 |
| asn_id | int unsigned | ASN 主表ID |
| barcode | varchar(100) | 箱号条码 |
| carton_number_start | int | 箱号起始 |
| carton_number_end | int | 箱号结束 |
| length | decimal(10,2) | 长度 |
| width | decimal(10,2) | 宽度 |
| height | decimal(10,2) | 高度 |
| weight | decimal(10,2) | 重量 |

### 2.6 操作日志表: app_wms_asn_action

记录 ASN 的所有操作历史。

| 字段 | 类型 | 说明 |
|------|------|------|
| asn_action_id | int unsigned | 主键 |
| company_id | int unsigned | 公司ID |
| action_type_id | int unsigned | 操作类型 |
| asn_id | int unsigned | ASN 主表ID |
| asn_detail_id | int unsigned | ASN 明细ID |
| description | mediumtext | 操作描述 |

### 2.7 费用表: app_wms_asn_fee

记录 ASN 产生的费用。

| 字段 | 类型 | 说明 |
|------|------|------|
| asn_fee_id | int unsigned | 主键 |
| company_id | int unsigned | 公司ID |
| asn_id | int unsigned | ASN 主表ID |
| fee_id | int unsigned | 费用ID |

---

## 3. 状态机

### 3.1 ASN 主状态 (AsnStatus)

| 值 | 状态名 | 说明 |
|----|--------|------|
| 1 | DRAFT | 草稿 |
| 2 | IN_TRANSIT | 运输中 |
| 3 | OPEN | 已开放收货 |
| 4 | IN_PROGRESS | 收货中 |
| 5 | BILLING_AUDIT | 计费审核中 |
| 6 | COMPLETED | 已完成 |

### 3.2 ASN 明细状态

| 值 | 状态名 | 说明 |
|----|--------|------|
| 1 | DETAIL_OPEN | 开放 |
| 2 | DETAIL_IN_PROGRESS | 进行中 |
| 3 | DETAIL_CLOSED | 已关闭 |

### 3.3 状态流转图

```
DRAFT (1) → IN_TRANSIT (2) → OPEN (3) → IN_PROGRESS (4)
                                              ↓
                                    BILLING_AUDIT (5)
                                              ↓
                                       COMPLETED (6)
```

---

## 4. 系统架构

### 4.1 层级结构

```
AsnController (API 入口)
    ↓
AsnService (业务逻辑层)
    ↓
AsnRepository (数据访问层)
    ↓
AsnBaseRepository (DB/WMS 连接)
```

### 4.2 关键组件

| 组件 | 路径 | 说明 |
|------|------|------|
| AsnController | Application/ShipSage/WMS/Http/Controllers/ | API 入口 |
| AsnService | Application/ShipSage/WMS/Services/ | 业务逻辑 |
| AsnRepository | Application/ShipSage/WMS/Repositories/ | 数据访问 |
| AsnBaseRepository | Business/BIZ/Repositories/Base/ | 基础数据访问 |
| AsnStatus | DB/ERP/Enum/ | 状态枚举 |
| ReceivingController | Application/ShipSage/WMS/Http/Controllers/ | 收货控制器 |
| DockAppointmentScheduleController | Application/ShipSage/WMS/Http/Controllers/ | 码头预约控制器 |

---

## 5. API 接口

### 5.1 Service 层 API (通过 rs() 调用)

#### GET 列表查询

| API | 说明 |
|-----|------|
| index.by-list | ASN 列表查询 |
| index.by-detail-exception | 异常明细 |
| index.by-detail-receiving | 收货明细 |
| index.by-detail-receiving-location | 收货库位 |
| index.by-detail-receiving-scan-lot-attrs | 收货扫描属性 |
| index.by-detail-receiving-scan-list | 收货扫描列表 |
| index.by-detail-receiving-product | 收货产品 |
| index.by-detail-receiving-inventory | 收货库存 |
| index.by-detail-receiving-inventory-list | 收货库存列表 |
| index.by-detail-receiving-stow-tags | 收货上架标签 |
| index.by-detail-pre-receiving-asn | 预收货 ASN |
| index.by-detail-pre-receiving-scan | 预收货扫描 |
| index.by-detail-pre-receiving-count | 预收货数量 |
| index.by-detail-docs | 文档 |
| index.by-detail-general-photo | 照片 |
| index.by-detail-linked-qty | 已关联数量 |
| index.by-auto-receiving | 自动收货 |
| index.by-palletize | 托盘化 |
| index.by-print-palletize | 打印托盘 |
| index.by-check-tracking-number | 检查追踪号 |
| index.by-drop-to-buttons | 下拉按钮 |

#### GET 单条查询

| API | 说明 |
|-----|------|
| show.by-manifest | Manifest 信息 |
| show.by-unicargo-company | Unicargo 公司 |
| show.by-lot-management-company | 批次管理公司 |
| show.by-link-events | 关联事件 |
| show.by-detail-receiving-putaway-history | 上架历史 |
| show.by-asn-internal-info | ASN 内部信息 |

#### POST 创建/操作

| API | 说明 |
|-----|------|
| store.by-pre-receiving-scan | 预收货扫描 |
| store.by-pre-receiving-count | 预收货数量 |
| store.by-get-receiving-location | 获取收货库位 |
| store.by-receiving-scan | 收货扫描 |
| store.by-upload-doc | 上传文档 |
| store.by-detail-exception-add | 添加异常 |
| store.by-detail-exception-adjust | 调整异常 |
| store.by-complete | 完成 ASN |
| store.by-auto-receiving | 自动收货 |
| store.by-inventory-content | 库存内容 |
| store.by-adjust-receive-inventory | 调整收货库存 |
| store.by-duplicate-receive | 重复收货 |
| store.by-asn-manifest-pre-receiving-count | Manifest 预收货数量 |
| store.by-manage-palletize | 管理托盘化 |

#### PUT 更新

| API | 说明 |
|-----|------|
| update.by-detail-exception | 更新异常 |

#### DELETE 删除

| API | 说明 |
|-----|------|
| destroyByDefault | 默认删除 |

### 5.2 Repository 层 API (内部调用)

| API | 说明 |
|-----|------|
| indexByListFilter | 列表过滤条件 |
| indexByList | 列表数据 |
| indexByListAssociate | 关联列表 |
| indexByListAssemble | 组装列表 |
| indexByApiV202206 | V202206 版本 API |
| storeByReceivingScan | 收货扫描存储 |
| storeByPreReceivingScan | 预收货扫描存储 |
| storeByGetReceivingLocation | 获取收货库位存储 |
| storeByComplete | 完成 ASN 存储 |

---

## 6. 业务流程

### 6.1 标准 ASN 流程

```
1. 创建 ASN (Draft)
   ↓
2. 发货 → 状态变为 IN_TRANSIT
   ↓
3. 货物到达 → 状态变为 OPEN
   ↓
4. 开始收货 → 状态变为 IN_PROGRESS
   ↓
   ├── 预收货扫描 (Pre-Receiving Scan)
   ├── 实际收货扫描 (Receiving Scan)
   ├── 异常处理 (Exception Handling)
   └── 上架 (Put-Away)
   ↓
5. 收货完成 → 状态变为 BILLING_AUDIT
   ↓
6. 计费审核通过 → 状态变为 COMPLETED
```

### 6.2 预收货流程 (Pre-Receiving)

预收货是在实际到货前,根据发货通知进行数量和SKU的预先确认。

```
1. 获取 ASN 明细
2. 执行预收货扫描
3. 记录预收数量
4. 与预期数量比对
5. 生成差异报告
```

### 6.3 实际收货流程 (Receiving)

```
1. 扫描箱号/产品条码
2. 匹配 ASN 明细
3. 记录实收数量
4. 处理异常 (缺失/残次)
5. 完成收货
6. 触发库存入库
```

### 6.4 异常处理流程

```
1. 扫描发现异常
2. 记录异常类型 (缺失/残次/多送)
3. 调整数量
4. 提交异常报告
5. 等待审核
6. 完成处理
```

---

## 7. 关键业务规则

### 7.1 数量计算

- **qty_received** = qty_expected + qty_additional - qty_missing - qty_defective
- **qty_put_away** <= qty_received
- **qty_linked** <= qty_received

### 7.2 状态控制

- 只有 IN_PROGRESS 状态才能进行收货扫描
- COMPLETED 状态不可逆
- BILLING_AUDIT 状态需要计费审核通过才能完成

### 7.3 FBA 集成

- 支持 FBA Shipment ID 关联
- 自动同步 FBA 货件状态
- 支持 FBA 特有的标签要求

---

## 8. 与其他模块的关系

### 8.1 订单模块 (OMS)

- ASN 来源于采购订单或调拨单
- 入库完成后触发库存增加

### 8.2 库存模块 (WMS/Inventory)

- 收货完成后创建库存记录
- 支持批次 (Lot) 管理
- 支持库位管理

### 8.3 计费模块 (4PL/Billing)

- ASN 产生收货费用
- 计费审核是 ASN 完成的前置条件

### 8.4 码头预约 (Dock Appointment)

- ASN 与码头预约关联
- 优化收货窗口安排

---

## 9. 相关枚举

### 9.1 入库操作类型 (InventoryActionType)

| 值 | 类型名 | 说明 |
|----|--------|------|
| 1 | ASN_RECEIVING | ASN 收货 |
| 2 | RETURN | 退货 |
| 3 | ORDER_SHIPMENT | 订单发货 |
| 4 | TRANSFER_SHIPMENT | 调拨发货 |
| 5 | ADJUSTMENT | 调整 |
| 6 | RELABEL_CHANGE_SKU | 换标改SKU |
| 7 | ASSEMBLY | 组装 |
| 8 | SPLIT | 拆分 |
| 9 | DISPOSAL | 处置 |

---

## 10. 数据库连接

- **Connection**: WMS
- **数据库**: wms
- **主表**: app_wms_asn
- **关联表**: app_wms_asn_detail, app_wms_asn_manifest, app_wms_asn_carton, app_wms_asn_action, app_wms_asn_fee

---

## 11. 开发注意事项

### 11.1 调用方式

```php
// 获取 ASN 列表
$this->rs('ShipSage/WMS/Asn', 'index', [
    'api' => 'index.by-list',
    'warehouse_id' => 103
]);

// 获取 ASN 详情
$this->rs('ShipSage/WMS/Asn', 'show', [
    'api' => 'show.by-manifest',
    'asn_id' => 12345
]);

// 收货扫描
$this->rs('ShipSage/WMS/Asn', 'store', [
    'api' => 'store.by-receiving-scan',
    'asn_id' => 12345,
    'sku' => 'ABC123',
    'qty' => 10
]);
```

### 11.2 注意事项

1. 所有参数使用 snake_case
2. company_id 由系统自动处理,不需要传入
3. 状态流转需要遵循状态机规则
4. 收货完成后自动触发库存入库

---

## 12. 附录

### 12.1 相关文档

- [ShipSage WMS 模块概述](../ShipSage_WMS_模块系统分析报告.md)
- [ShipSage 订单模块](./ShipSage_订单模块系统文档.md)
- [ShipSage 库存模块](./ShipSage_库存模块系统文档.md)

### 12.2 相关控制器

- AsnController — ASN 基础操作
- ReceivingController — 收货操作
- DockAppointmentScheduleController — 码头预约

### 12.3 相关 Service

- AsnService — ASN 核心业务
- InventoryService — 库存操作 (BIZ 层)
- ReceivingService — 收货业务
