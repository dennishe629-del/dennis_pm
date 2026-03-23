# ShipSage Return 模块系统分析报告

> 文档版本: 1.0
> 生成日期: 2026-03-17
> 用途: 需求分析参考

---

## 1. 模块概述

**Return (退货)** 是 ShipSage 系统中的退货处理模块,负责管理客户退货的完整流程。从退货授权(RA)开始,经过收货、质检、上架,到最终的费用结算和索赔处理。

### 1.1 核心功能

- 退货单创建与管理
- 退货标签生成 (Return Shipping Label)
- 退货扫描与验证
- 退货质检与 condition 评估
- 退货上架 (Put-Away)
- 退货索赔 (Claim) 处理
- 退货费用计算
- 退货上传批处理 (Return Upload)

### 1.2 退货来源

| 值 | 类型名 | 说明 |
|----|--------|------|
| 1 | BUYER | 买家退货 |
| 2 | FBA | Amazon FBA 退货 |
| 3 | THIRD_PARTY | 第三方退货 |

---

## 2. 数据结构

### 2.1 核心表关系

```
app_oms_return (退货主表)
├── app_oms_return_detail (退货明细)
│   └── app_oms_return_put_away_detail (上架明细)
├── app_oms_return_action (操作日志)
├── app_oms_return_shipping_label (退货标签)
├── app_oms_return_claim (索赔)
│   └── app_oms_return_claim_detail (索赔明细)
├── app_oms_return_upload (退货上传)
│   └── app_oms_return_upload_detail (上传明细)
└── app_oms_return_detail_images (退货图片)
```

### 2.2 主表: app_oms_return

| 字段 | 类型 | 说明 |
|------|------|------|
| return_id | int unsigned | 主键 |
| company_id | int | 公司ID |
| warehouse_id | int | 仓库ID |
| tracking_number | varchar(100) | 追踪号 |
| upload_id | int | 上传ID |
| return_from_id | tinyint | 退货来源 |
| return_status_id | tinyint | 退货状态 |
| claim_status_id | tinyint | 索赔状态 |
| claim_status_id_first | tinyint | 初始索赔状态 |
| trx_id | varchar(100) | 交易ID |
| ra_id | int | 退货授权ID |
| full_return | int | 是否全额退货 |
| is_reviewed | int | 是否已审核 |
| shipping_cost | double | 运费 |
| shipping_cost_paid_by | varchar(100) | 运费承担方 |
| reason_code | varchar(255) | 退货原因代码 |
| expired_time | timestamp | 过期时间 |
| scheduled_start_time | timestamp | 计划开始时间 |
| scheduled_finish_time | timestamp | 计划结束时间 |
| actual_start_time | timestamp | 实际开始时间 |
| actual_finish_time | timestamp | 实际结束时间 |
| notes | text | 备注 |
| expected_completion_date | timestamp | 预期完成日期 |

**审计字段**: hidden, disabled, deleted, deleted_at, created_at, created_by, updated_at, updated_by

### 2.3 明细表: app_oms_return_detail

| 字段 | 类型 | 说明 |
|------|------|------|
| return_detail_id | int unsigned | 主键 |
| company_id | int | 公司ID |
| return_id | int | 退货主表ID |
| catalog_id | int | 产品目录ID |
| customer_sku | varchar(100) | 客户SKU |
| fnsku | varchar(100) | FNSKU |
| sku | int | SKU ID |
| lpn | varchar(100) | 库位号 (License Plate Number) |
| qty | int | 数量 |
| serial_number | varchar(255) | 序列号 |
| condition_id | int | 产品状态 |
| vas_task_id | int | VAS 任务ID |
| put_away_id | int | 上架ID |
| verify_qty | int | 验证数量 |
| put_away_qty | int | 上架数量 |
| is_open | tinyint | 是否开放 |
| is_virtual | tinyint | 是否虚拟 |
| virtual_barcode | varchar(100) | 虚拟条码 |
| slip_barcode | varchar(100) | 单据条码 |
| scan_barcode | varchar(100) | 扫描条码 |
| reason_code | varchar(100) | 原因代码 |
| notes | varchar(500) | 备注 |

### 2.4 退货标签表: app_oms_return_shipping_label

| 字段 | 类型 | 说明 |
|------|------|------|
| shipping_label_id | int unsigned | 主键 |
| company_id | int | 公司ID |
| warehouse_id | int | 仓库ID |
| tracking_number | varchar(100) | 追踪号 |
| trx_id | varchar(100) | 交易ID |
| agency_id | int | 代理商ID |
| package_type_id | int | 包裹类型ID |
| carrier | varchar(100) | 承运商 |
| service_code | varchar(100) | 服务代码 |
| service_name | varchar(100) | 服务名称 |
| label_url | varchar(500) | 标签URL |
| label_img | varchar(500) | 标签图片 |
| pre_paid | tinyint | 是否预付 |
| shipping_fee_original | decimal(12,2) | 原始运费 |
| shipping_fee | decimal(10,2) | 运费 |

### 2.5 索赔表: app_oms_return_claim

| 字段 | 类型 | 说明 |
|------|------|------|
| claim_id | int unsigned | 主键 |
| company_id | int | 公司ID |
| return_id | int | 退货主表ID |
| claim_status_id | tinyint | 索赔状态 |
| notes | text | 备注 |

### 2.6 操作日志表: app_oms_return_action

| 字段 | 类型 | 说明 |
|------|------|------|
| action_id | int unsigned | 主键 |
| company_id | int | 公司ID |
| action_type_id | int | 操作类型ID |
| return_id | int | 退货主表ID |
| return_detail_id | int | 退货明细ID |
| notes | varchar(500) | 备注 |

### 2.7 上传表: app_oms_return_upload

| 字段 | 类型 | 说明 |
|------|------|------|
| upload_id | int unsigned | 主键 |
| company_id | int | 公司ID |
| tracking_number | varchar(100) | 追踪号 |
| return_from_id | tinyint | 退货来源 |
| reference_id | varchar(100) | 参考ID |
| return_action | varchar(50) | 退货操作 (Putaway/其他) |

---

## 3. 状态机

### 3.1 退货主状态 (ReturnStatus)

| 值 | 状态名 | 说明 |
|----|--------|------|
| 1 | SCANNED | 已扫描 |
| 2 | VERIFIED | 已验证 |
| 3 | PROCESSED | 已处理 |
| 4 | CANCELLED | 已取消 |

### 3.2 索赔状态 (ReturnClaimStatus)

| 值 | 状态名 | 说明 |
|----|--------|------|
| 1 | NO_NEED | 无需索赔 |
| 2 | UNCLAIMED | 未索赔 |
| 3 | CLAIMED | 已索赔 |
| 4 | APPROVED | 已批准 |
| 5 | REJECTED | 已拒绝 |

### 3.3 状态流转图

```
SCANNED (1) → VERIFIED (2) → PROCESSED (3)
                                    ↓
                              CANCELLED (4)  (可从任意状态取消)

索赔流程:
NO_NEED (1)
UNCLAIMED (2) → CLAIMED (3) → APPROVED (4) / REJECTED (5)
```

---

## 4. 系统架构

### 4.1 层级结构

```
ReturnController (API 入口)
    ↓
ReturnService (业务逻辑层 - WMS & OMS)
    ↓
ReturnRepository (数据访问层)
    ↓
BIZ/Return (跨模块服务)
```

### 4.2 多模块实现

Return 模块跨越两个主要模块:

| 模块 | 组件 | 说明 |
|------|------|------|
| **OMS** | ReturnController, ReturnService | 退货主流程管理 |
| **OMS** | ReturnShippingLabelService | 退货标签服务 |
| **OMS** | ReturnUploadService | 退货上传服务 |
| **WMS** | ReturnController, ReturnService | 仓库退货操作 |

### 4.3 关键组件

| 组件 | 路径 | 说明 |
|------|------|------|
| WMS/ReturnController | Application/ShipSage/WMS/Http/Controllers/ | WMS退货API入口 |
| WMS/ReturnService | Application/ShipSage/WMS/Services/ | WMS退货业务逻辑 |
| OMS/ReturnController | Application/ShipSage/OMS/Http/Controllers/ | OMS退货API入口 |
| OMS/ReturnService | Application/ShipSage/OMS/Services/ | OMS退货业务逻辑 |
| OMS/ReturnShippingLabelService | Application/ShipSage/OMS/Services/ | 退货标签服务 |
| OMS/ReturnUploadService | Application/ShipSage/OMS/Services/ | 退货上传服务 |
| BIZ/Return | Business/BIZ/Services/ | 跨模块退货服务 |
| ReturnStatus | DB/APP/Enum/ | 退货状态枚举 |
| ReturnFrom | DB/APP/Enum/ | 退货来源枚举 |
| ReturnClaimStatus | DB/APP/Enum/ | 索赔状态枚举 |

---

## 5. API 接口

### 5.1 WMS 模块 API

#### GET 列表查询

| API | 说明 |
|-----|------|
| index.by-list | 退货列表 |
| index.by-inbound-list | 入库列表 |
| index.by-return-detail-put-away | 退货上架明细 |
| index.by-receiving-detail | 收货明细 |
| index.by-transaction-list | 交易列表 |

#### GET 单条查询

| API | 说明 |
|-----|------|
| show.by-view-detail | 查看详情 |

#### POST 创建/操作

| API | 说明 |
|-----|------|
| store.by-scan | 扫描退货 |
| store.by-verify | 验证退货 |
| store.by-verify-batch-destroy | 批量验证销毁 |
| store.by-missing-sla | 缺失SLA |
| store.by-take-photo | 拍照 |

#### PUT 更新

| API | 说明 |
|-----|------|
| update.by-cancel | 取消退货 |

### 5.2 OMS 模块 API

#### GET 列表查询

| API | 说明 |
|-----|------|
| index.by-list | 退货列表 |
| index.by-list-detail | 退货明细列表 |
| index.by-lost-found | 失物招领 |
| index.by-list-customer-sku | 客户SKU列表 |

#### GET 单条查询

| API | 说明 |
|-----|------|
| show.by-detail-all | 所有明细 |

#### POST 创建/操作

| API | 说明 |
|-----|------|
| store.by-claim-detail | 索赔明细 |

#### PUT 更新

| API | 说明 |
|-----|------|
| update.by-is-reviewed | 标记已审核 |

### 5.3 ReturnShippingLabelService API

| API | 说明 |
|-----|------|
| index.by-list | 标签列表 |
| show.by-detail | 标签详情 |
| show.by-trx-id | 按交易ID查询 |
| show.by-sku | 按SKU查询 |
| store.by-shipping-label | 创建标签 |
| update.by-cancel | 取消标签 |

---

## 6. 业务流程

### 6.1 标准退货流程

```
1. 退货授权 (RA) 创建
   ↓
2. 生成退货标签 (Return Shipping Label)
   ↓
   ├── 买家获取标签
   └── 退货包裹发出
   ↓
3. 仓库收到退货 → 扫描 (Scanned)
   ↓
4. 验证退货商品 → 验证 (Verified)
   ↓
   ├── 检查产品状态 (Condition)
   ├── 记录数量
   └── 检查是否需要索赔
   ↓
5. 处理退货 → Processed
   ↓
   ├── 上架 (Put-Away)
   ├── VAS 处理 (如需要)
   └── 库存更新
   ↓
6. 索赔处理 (如适用)
   ↓
   ├── 无需索赔 → NO_NEED
   ├── 发起索赔 → CLAIMED
   └── 索赔结果 → APPROVED / REJECTED
   ↓
7. 费用结算
```

### 6.2 退货扫描流程

```
1. 扫描追踪号 (Tracking Number)
2. 系统匹配退货单
3. 扫描产品条码
4. 记录实收数量
5. 比对预期数量
6. 记录差异 (如有)
7. 完成扫描 → 状态变为 SCANNED
```

### 6.3 退货验证流程

```
1. 获取退货明细
2. 质检检查
   ├── 产品状态 (New/Used/Refurbished)
   ├── 产品完整性
   └── 是否与订单匹配
3. 记录 Condition
4. 验证数量
5. 标记已验证 → 状态变为 VERIFIED
```

### 6.4 退货上架流程

```
1. 验证通过后
2. 创建上架任务
3. 分配库位
4. 上架操作
5. 更新库存
6. 完成处理 → 状态变为 PROCESSED
```

---

## 7. 关键业务规则

### 7.1 数量关系

- **qty** = 退货数量
- **verify_qty** ≤ qty (已验证数量)
- **put_away_qty** ≤ verify_qty (已上架数量)

### 7.2 状态控制

- 只有 SCANNED 状态才能进行验证
- 只有 VERIFIED 状态才能进行处理
- PROCESSED 状态不可逆
- CANCELLED 可从任意状态取消

### 7.3 费用处理

- **shipping_cost**: 退货运费
- **shipping_cost_paid_by**: 运费承担方 (Gaatu/Customer)
- 运费可能需要向客户索赔

### 7.4 退货来源

| 来源 | 说明 |
|------|------|
| BUYER | 终端客户退货 |
| FBA | Amazon FBA 退货 |
| THIRD_PARTY | 第三方渠道退货 |

---

## 8. 与其他模块的关系

### 8.1 订单模块 (OMS)

- 退货关联原始订单 (trx_id)
- 退货授权 (ra_id) 管理
- 订单状态联动

### 8.2 库存模块 (WMS/Inventory)

- 退货入库 → 库存增加
- 上架库位管理 (LPN)
- 库存状态更新

### 8.3 VAS 模块

- 退货可能需要增值服务
- 质检、翻新、更换包装等

### 8.4 计费模块 (4PL/Billing)

- 退货费用计算
- 运费索赔处理
- 退货费用报表

### 8.5 FBA 模块

- FBA 退货处理
- FBA 库存返还

---

## 9. 核心枚举

### 9.1 ReturnStatus

```
SCANNED(1) → VERIFIED(2) → PROCESSED(3)
    ↓              ↓           ↓
  CANCELLED(4)  CANCELLED(4) CANCELLED(4)
```

### 9.2 ReturnClaimStatus

```
NO_NEED(1)
UNCLAIMED(2) → CLAIMED(3) → APPROVED(4)
                 ↓
              REJECTED(5)
```

### 9.3 ReturnFrom

```
BUYER(1)      - 买家退货
FBA(2)        - FBA退货
THIRD_PARTY(3) - 第三方退货
```

### 9.4 InventoryActionType

退货相关的库存操作类型:

| 值 | 类型名 | 说明 |
|----|--------|------|
| 2 | RETURN | 退货入库 |

---

## 10. 数据库连接

- **Connection**: APP
- **数据库**: app.shipsage.com
- **主表**: app_oms_return
- **核心关联表**:
  - app_oms_return_detail (明细)
  - app_oms_return_shipping_label (标签)
  - app_oms_return_claim (索赔)
  - app_oms_return_action (操作日志)
  - app_oms_return_upload (上传)

---

## 11. 开发注意事项

### 11.1 调用方式

```php
// WMS 模块 - 获取退货列表
$this->rs('ShipSage/WMS/Return', 'index', [
    'api' => 'index.by-list',
    'warehouse_id' => 103
]);

// WMS 模块 - 扫描退货
$this->rs('ShipSage/WMS/Return', 'store', [
    'api' => 'store.by-scan',
    'tracking_number' => '1Z999AA10123456784',
    'items' => [...]
]);

// WMS 模块 - 验证退货
$this->rs('ShipSage/WMS/Return', 'store', [
    'api' => 'store.by-verify',
    'return_id' => 12345
]);

// OMS 模块 - 创建退货标签
$this->rs('ShipSage/OMS/ReturnShippingLabel', 'store', [
    'api' => 'store.by-shipping-label',
    'return_id' => 12345
]);
```

### 11.2 注意事项

1. 所有参数使用 snake_case
2. company_id 由系统自动处理
3. tracking_number 是退货的核心关联字段
4. 支持虚拟退货 (is_virtual) 场景
5. 退货可能关联 VAS 任务

---

## 12. 附录

### 12.1 相关文档

- [ShipSage WMS 模块概述](./ShipSage_WMS_模块系统分析报告.md)
- [ShipSage OMS 模块](./ShipSage_OMS_模块系统分析报告.md)
- [ShipSage ASN 模块](./ShipSage_ASN_模块系统分析报告.md)

### 12.2 相关控制器

- WMS/ReturnController — WMS退货操作
- OMS/ReturnController — OMS退货管理
- OMS/ReturnShippingLabelController — 退货标签
- OMS/ReturnUploadController — 退货上传

### 12.3 相关 Service

- WMS/ReturnService — WMS退货业务
- OMS/ReturnService — OMS退货管理
- OMS/ReturnShippingLabelService — 退货标签
- OMS/ReturnUploadService — 退货上传

### 12.4 Return 模块表清单

| 表名 | 说明 |
|------|------|
| app_oms_return | 退货主表 |
| app_oms_return_detail | 退货明细 |
| app_oms_return_action | 操作日志 |
| app_oms_return_action_type | 操作类型 |
| app_oms_return_claim | 索赔 |
| app_oms_return_claim_detail | 索赔明细 |
| app_oms_return_claim_status | 索赔状态 |
| app_oms_return_shipping_label | 退货标签 |
| app_oms_return_shipping_label_status | 标签状态 |
| app_oms_return_upload | 退货上传 |
| app_oms_return_upload_detail | 上传明细 |
| app_oms_return_from | 退货来源 |
| app_oms_return_put_away_detail | 上架明细 |
| app_oms_return_detail_images | 退货图片 |
