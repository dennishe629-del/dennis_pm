# ShipSage BI 完整系统文档

> **文档版本**: v2.0  
> **创建日期**: 2026-03-16  
> **适用对象**: 产品经理、业务分析师、开发人员  
> **维护说明**: 本文档将持续更新，后续会加入 OMS、WMS、ADMIN 等模块

---

## 目录

1. [重要结论：模块归属确认](#一重要结论模块归属确认)
2. [文档概述](#二文档概述)
3. [ShipSage 平台整体架构](#三shipsage-平台整体架构)
4. [ShipSage BI 模块核心功能](#四shipsage-bi-模块核心功能)
5. [数据仓库架构](#五数据仓库架构)
6. [毛利分析系统（Gross Margin）](#六毛利分析系统gross-margin)
7. [系统枚举与配置](#七系统枚举与配置)
8. [关键业务概念](#八关键业务概念)
9. [业务流程图](#九业务流程图)
10. [实体关系图（ERD）](#十实体关系图erd)
11. [API 接口文档](#十一api-接口文档)
12. [详细数据字典](#十二详细数据字典)
13. [性能优化](#十三性能优化)
14. [常见问题](#十四常见问题)
15. [相关文件导航](#十五相关文件导航)

---

## 一、重要结论：模块归属确认

### 1.1 模块归属验证结果

经过代码库深入分析，确认以下结论：

| 模块 | 代码位置 | 所属系统 | 结论 |
|------|----------|----------|------|
| **Gross Margin** | `Application/ShipSage/BI` | ShipSage BI | ✅ 属于 ShipSage BI |
| **PL4 成本** | `Application/ShipSage/BI/ETL/PL4` | ShipSage BI | ✅ 属于 ShipSage BI |
| **GMROI** | `DB/BI` | DB BI (通用 BI 平台) | ❌ **不属于 ShipSage BI** |
| **Sales Clearance** | `DB/BI` | DB BI (通用 BI 平台) | ❌ **不属于 ShipSage BI** |
| **ASIN Performance** | `DB/BI` | DB BI (通用 BI 平台) | ❌ **不属于 ShipSage BI** |

### 1.2 关键区分依据

```
app.gaatu.com/app/Modules/
├── Application/ShipSage/BI/     ← ShipSage 专属 BI 模块
│   ├── GrossMargin/             ← ShipSage 毛利分析
│   ├── PL4/                     ← ShipSage PL4 成本
│   └── ...
│
└── DB/BI/                       ← 通用 BI 数据层（跨业务线）
    ├── GmroiReport/             ← 通用 GMROI（多业务共用）
    ├── SalesClearance/          ← 通用销售清仓（多业务共用）
    ├── AsinPerformance/         ← 通用 ASIN 分析
    └── ShipsageSalesFees/       ← ShipSage 数据存储
```

**重要发现**：
- `DB/BI` 是**通用数据层模块**，服务于多个业务线（ShipSage、其他业务）
- `Application/ShipSage/BI` 是**ShipSage 专属业务模块**
- `ShipsageSalesFeesRepository` 虽然在 `DB/BI` 中，但它是 ShipSage 数据的**存储层**，真正的业务逻辑在 `Application/ShipSage/BI`

### 1.3 本文档范围

本文档仅覆盖 **ShipSage BI** 专属内容：
- ✅ Gross Margin（毛利分析）
- ✅ PL4 成本分析
- ❌ GMROI（属于通用 BI）
- ❌ Sales Clearance（属于通用 BI）
- ❌ ASIN Performance（属于通用 BI）

---

## 二、文档概述

### 2.1 文档目的

为产品经理和业务分析师提供 ShipSage BI 系统的完整背景知识和结构信息，帮助理解：
- 系统整体架构和数据流向
- 毛利分析的业务逻辑和计算规则
- 关键业务概念和术语定义
- 系统枚举值和配置项

### 2.2 术语表

| 术语 | 英文全称 | 说明 |
|------|----------|------|
| BI | Business Intelligence | 商业智能/数据分析 |
| ETL | Extract, Transform, Load | 数据抽取、转换、加载 |
| SKU | Stock Keeping Unit | 库存单位/商品编码 |
| ASN | Advanced Shipping Notice | 预先发货通知 |
| VAS | Value Added Service | 增值服务 |
| SCC | Shipping Charge Correction | 运费调整 |
| PL4 | Product Level 4 | 产品四级成本分析 |
| SPD | Small Parcel Delivery | 小包裹配送 |
| LTL | Less Than Truckload | 零担运输 |

---

## 三、ShipSage 平台整体架构

### 3.1 系统模块划分

```
ShipSage Platform
├── APP (Application Layer)
│   └── ShipSage
│       ├── BI (Business Intelligence) ← 本文档重点
│       ├── OMS (Order Management System)
│       ├── WMS (Warehouse Management System)
│       └── ADMIN (Administration)
│
├── DB (Data Layer)
│   ├── BI (通用数据仓库 - Redshift)
│   ├── APP (Application Database)
│   ├── WMS (Warehouse Database)
│   └── ERP (Enterprise Resource Planning)
│
└── Integration Layer
    ├── ETL Pipelines
    └── API Gateway
```

### 3.2 数据库架构

| 数据库 | 类型 | 用途 | ShipSage BI 相关表 |
|--------|------|------|-------------------|
| **BI** | Redshift | 数据仓库 | `shipsage_sales_fees` |
| **APP** | MySQL/PostgreSQL | 业务数据 | `app_shipsage_balance_*` |
| **WMS** | MySQL/PostgreSQL | 仓储数据 | `inventory_history_*` |
| **ERP** | MySQL/PostgreSQL | 企业资源 | `GT_UpsGround`, `GT_Usps` |

### 3.3 ShipSage BI 数据流向

```
业务系统 (APP/WMS/ERP)
    ↓
ETL Repositories (Application/ShipSage/BI/ETL/)
    ↓
shipsage_sales_fees 表 (DB/BI - Redshift)
    ↓
GrossMarginService (Application/ShipSage/BI)
    ↓
BI Dashboard / Reports
```

---

## 四、ShipSage BI 模块核心功能

### 4.1 功能模块概览

| 模块 | 功能描述 | 目标用户 | 数据更新频率 |
|------|----------|----------|--------------|
| **Gross Margin** | 毛利分析（Sales/Cost 对比） | 财务、运营、管理层 | 每日 |
| **PL4 Cost** | 产品四级成本分析 | 财务、产品 | 每日 |

### 4.2 技术架构

```
app.gaatu.com/app/Modules/Application/ShipSage/BI/
├── config.php                    # 模块配置
├── Console/Commands/             # 定时任务
│   └── StoreByUpdateShipsageSalesFeesCommand.php
├── Enum/                         # 枚举定义
│   ├── Carrier.php              # 承运商枚举
│   ├── FeesEventName.php        # 费用事件枚举
│   ├── FeesName.php             # 费用名称枚举
│   ├── PricingModel.php         # 定价模式枚举
│   ├── TeamName.php             # 团队枚举
│   └── TierName.php             # VIP 等级枚举
├── Http/Controllers/            # 控制器
│   ├── BudgetSalesController.php
│   ├── GrossMarginController.php
│   └── SourceTaskController.php
├── Repositories/                # 数据仓库
│   ├── BudgetSalesRepository.php
│   ├── ETL/                     # ETL 处理
│   │   ├── GrossMargin/         # 毛利 ETL
│   │   │   ├── GrossMarginRepository.php
│   │   │   ├── ShippingRepository.php
│   │   │   ├── StorageRepository.php
│   │   │   ├── HandlingRepository.php
│   │   │   ├── ReceivingRepository.php
│   │   │   ├── ReturnRepository.php
│   │   │   ├── PackingMaterialRepository.php
│   │   │   ├── MiscRepository.php
│   │   │   └── AdjustmentCostRepository.php
│   │   └── PL4/                 # PL4 成本 ETL
│   │       ├── GrossMarginRepository.php
│   │       ├── HandlingRepository.php
│   │       ├── MiscRepository.php
│   │       ├── ReceivingRepository.php
│   │       ├── ReturnRepository.php
│   │       └── StorageRepository.php
│   └── SourceTaskRepository.php
├── Services/                    # 业务逻辑层
│   ├── BudgetSalesService.php
│   ├── GrossMarginService.php
│   └── SourceTaskService.php
└── routes/                      # 路由定义
    ├── api.php
    ├── api-client.php
    └── api-guest.php
```

---

## 五、数据仓库架构

### 5.1 核心数据表

#### 5.1.1 shipsage_sales_fees（毛利数据主表）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `fees_id` | VARCHAR | 费用唯一标识（格式：`v-{type}-{id}`） |
| `fees_event_name` | VARCHAR | 费用事件类型（Fulfillment, Storage, Shipping 等） |
| `fees_name` | VARCHAR | 费用名称（Sales Fee, Handling Fee 等） |
| `fees_category` | VARCHAR | 费用分类（`sales` 或 `cost`） |
| `fees_time` | TIMESTAMP | 费用发生时间（UTC+00） |
| `action_date` | TIMESTAMP | 操作日期（UTC+00） |
| `company_id` | INT | 客户公司 ID |
| `company_name` | VARCHAR | 客户公司名称 |
| `team_id` / `team_name` | INT/VARCHAR | 团队 ID/名称 |
| `manager_id` / `manager_name` | INT/VARCHAR | 账户经理 ID/名称 |
| `pricing_model_id` / `pricing_model_name` | INT/VARCHAR | 定价模式 ID/名称 |
| `tier_id` / `tier_name` | INT/VARCHAR | VIP 等级 ID/名称 |
| `fee_version_id` / `fee_version_name` | INT/VARCHAR | 费用版本 ID/名称 |
| `warehouse_id` / `warehouse_name` | INT/VARCHAR | 仓库 ID/名称 |
| `service_type` / `service_name` | VARCHAR | 服务类型/名称 |
| `carrier` | VARCHAR | 承运商 |
| `tracking_number` | VARCHAR | 追踪号 |
| `sales` | DECIMAL | 总销售额 |
| `cost` | DECIMAL | 总成本（负数） |
| `gross_profit` | DECIMAL | 毛利（sales + cost） |
| `detail` | JSON | 详细信息（JSON 格式） |

#### 5.1.2 Sales/Cost 细分字段

| Sales 类型 | Cost 类型 | 说明 |
|------------|-----------|------|
| `storage_sales` | `storage_cost` | 仓储销售/成本 |
| `handling_sales` | `handling_cost` | 操作销售/成本 |
| `shipping_sales` | `shipping_cost` | 运输销售/成本 |
| `receiving_sales` | `receiving_cost` | 入库销售/成本 |
| `return_sales` | `return_cost` | 退货销售/成本 |
| `packing_material_sales` | `packing_material_cost` | 包材销售/成本 |
| `misc_sales` | `misc_cost` | 杂项销售/成本 |

### 5.2 ETL 数据流程

```
业务系统数据
    ↓
├─ Fulfillment Service → HandlingRepository (Fulfillment)
├─ Storage Service → StorageRepository
├─ Handling Service → HandlingRepository (Transfer/VAS)
├─ Shipping Service → ShippingRepository
├─ Receiving Service → ReceivingRepository
├─ Return Service → ReturnRepository
├─ Packing Material Service → PackingMaterialRepository
└─ Misc Service → MiscRepository
    ↓
shipsage_sales_fees 表（BI 数据库）
    ↓
GrossMarginService
    ↓
BI Dashboard / Reports
```

---

## 六、毛利分析系统（Gross Margin）

### 6.1 业务背景

毛利分析是 ShipSage BI 的核心功能，用于分析公司各项业务的盈利能力。通过对比销售收入（Sales）和成本（Cost），计算出毛利（Gross Profit）和毛利率（Gross Margin）。

### 6.2 核心公式

```sql
-- 总销售额（所有 sales 类型求和）
total_sales = SUM(storage_sales + handling_sales + shipping_sales 
                  + receiving_sales + return_sales 
                  + packing_material_sales + misc_sales)

-- 总成本（所有 cost 类型求和）
total_cost = SUM(storage_cost + handling_cost + shipping_cost 
                 + receiving_cost + return_cost 
                 + packing_material_cost + misc_cost)

-- 毛利（注意：cost 为负数，实际是减法）
gross_profit = total_sales + total_cost

-- 毛利率（保留 4 位小数）
gross_margin = CASE
    WHEN total_sales = 0 THEN
        CASE
            WHEN total_gross_profit > 0 THEN 1
            WHEN total_gross_profit = 0 THEN 0
            WHEN total_gross_profit < 0 THEN -1
        END
    ELSE
        ROUND(total_gross_profit / total_sales, 4)
END
```

### 6.3 Sales（销售收入）取数逻辑

#### 6.3.1 Sales 分类及数据来源

| Sales 类型 | 数据来源表 | 计算公式 | ETL 文件 |
|------------|------------|----------|----------|
| **shipping_sales** | `app_shipsage_balance_shipping_fees` | `amount * -1` | ShippingRepository.php |
| **storage_sales** | `app_shipsage_balance_storage_fees` | `amount * -1` | StorageRepository.php |
| **handling_sales** | `app_shipsage_balance_handling_fees` | `amount * -1` | HandlingRepository.php |
| **receiving_sales** | `app_shipsage_balance_receiving_fees` | `amount * -1` | ReceivingRepository.php |
| **return_sales** | `app_shipsage_balance_return_fees` | `amount * -1` | ReturnRepository.php |
| **packing_material_sales** | `app_shipsage_balance_packing_fees` | `amount * -1` | PackingMaterialRepository.php |
| **misc_sales** | `app_shipsage_balance_misc_fees` | `amount * -1` | MiscRepository.php |

#### 6.3.2 Sales 取数条件

```php
// 1. 时间范围（向前推 3 天确保数据完整）
$startTime = date('Y-m-d H:i:s', strtotime($startTime.'-3 DAY'));

// 2. 报价模式过滤（只处理标准报价模式）
$conditions[] = 'TB.quote_mode_id IN (1, 10, 11)';

// 3. 排除 OEM 子公司
if ($this->checkIsOemSubCompany($item->get('company_id'))) {
    continue;
}

// 4. 时间限制（数据从 2022-12-27 开始可用）
if ($startTime < '2022-12-27') {
    $startTime = '2022-12-27';
}
```

### 6.4 Cost（成本）取数逻辑

#### 6.4.1 Cost 分类及数据来源

| Cost 类型 | 数据来源 | 计算方式 | ETL 文件 |
|-----------|----------|----------|----------|
| **shipping_cost** | UPS/USPS 对账、物流发票 | `(实际成本 - 原始运费) * -1` | ShippingRepository.php |
| **storage_cost** | `inventory_history_storage_cost` | `unit_quote * qty * -1` | StorageRepository.php |
| **handling_cost** | 实际操作记录（履单/转运/VAS） | 按数量 × 单价计算 | HandlingRepository.php |
| **receiving_cost** | ASN 入库操作 | 按容器/托盘/纸箱数量 × 单价 | ReceivingRepository.php |
| **return_cost** | 退货处理 | 按退货数量 × 单价 | ReturnRepository.php |
| **packing_material_cost** | 包材消耗记录 | `qty * unit_cost * -1` | PackingMaterialRepository.php |
| **misc_cost** | 杂项费用 | `amount * -1` | MiscRepository.php |

#### 6.4.2 Shipping Cost 详细逻辑

```php
// UPS 对账成本计算
$shippingCost = round($upsGroups->get('total_cost') * -1, 2);

// 如果是首次对账（has_iss），需要减去原始运费
if ($upsGroups->get('has_iss') && $shipping->get('shipping_fee_original')) {
    $shippingCost = round(($upsGroups->get('total_cost') - $shipping->get('shipping_fee_original')) * -1, 2);
}

// SCC（Shipping Charge Correction）$1/次
if ($upsGroups->get('scc_times')) {
    $shippingCost = round($shippingCost + round($upsGroups->get('scc_times') * -1, 2), 2);
}

// USPS 对账成本计算
$shippingCost = round(($item->get('amount') - $item->get('shipping_fee_original')) * -1, 2);

// USPS 调整（Adjustment）
$shippingCost = round($item->get('adjusted_amount'), 2);
```

#### 6.4.3 Handling Cost 详细逻辑

**Fulfillment Handling（履单操作）**：
```php
// 计算体积重量
$divisor = collect($currentQuotes->get('dimensional_weight_divisor'))->get('quote', 260);
$volumnWeight = abs($item->get('length') * $item->get('width') * $item->get('height') / $divisor);

// 实际重量（OZ -> LB）
$realWeight = $item->get('weight_lb') + $item->get('weight_oz') / 16;

// 计费重量取较大值
$billWeight = round(($volumnWeight > $realWeight ? $volumnWeight : $realWeight), 2);

// 根据计费重量匹配报价
list($handlingCost, $currentQuoteName) = $this->getPackageCost($billWeight, $currentQuotes, true);
```

**Transfer Handling（转运操作）**：
```php
// SPD（Small Parcel Delivery）模式
if (TransferShippingMethod::SPD == $shippingMethodId) {
    if (TransferHandlingUnit::PRODUCT == $handlingUnitId) {
        list($allPickQty, $packageAmount) = $this->calcProductPickAndPackFee($currentQuotes, $pickData, true);
    }
    if (TransferHandlingUnit::CARTON == $handlingUnitId) {
        foreach ($cartons as $vCarton) {
            $packageAmount += $this->getMatchQuote($currentQuotes, $vCarton->weight);
        }
    }
}

// LTL（Less Than Truckload）模式
if (TransferShippingMethod::LTL == $shippingMethodId) {
    $amountPalletizing = round($palletizingQty * $quotePalletizing, 2);
    $amountPalletOutbound = round($palletOutboundQty * $quotePalletOutbound, 2);
    $amountPalletBreakdown = round($palletBreakdownQty * $quotePalletBreakDown, 2);
    $amountPalletLoading = round($palletLoadingQty * $quotePalletLoading, 2);
    
    $palletAmount = $amountPalletizing + $amountPalletOutbound + $amountPalletBreakdown + $amountPalletLoading;
    $handlingCost = round($palletAmount + $packageAmount, 2) * -1;
}
```

### 6.5 维度分析

#### 6.5.1 支持的分组维度

| 维度 | 说明 | SQL 实现 |
|------|------|----------|
| Customer | 按客户公司聚合 | `TA.company_id` |
| Team | 按团队聚合 | `TA.team_name` |
| Service Type | 按服务类型聚合 | `TA.fees_event_name` |
| Fee Type | 按费用类型聚合 | `TA.fees_name` |
| Carrier | 按承运商聚合 | `TA.carrier` |
| Warehouse | 按仓库聚合 | `TA.warehouse_name` |
| Year | 按年份聚合 | `TO_CHAR(TO_DATE(...), 'YYYY')` |
| Month | 按月份聚合 | `TO_CHAR(TO_DATE(...), 'YYYY-MM')` |
| Week | 按周聚合 | `TO_CHAR(TO_DATE(...), 'IYYY"W"IW')` |
| Day | 按日聚合 | `TO_CHAR(..., 'YYYY-MM-DD')` |
| Quarter | 按季度聚合 | `DATE_PART(year, ...) \|\| ' Q' \|\| DATE_PART(quarter, ...)` |
| Customer, Month | 客户+月份组合 | `TA.company_id \|\| ', ' \|\| TO_CHAR(...)` |
| Team, Month | 团队+月份组合 | `TA.team_name \|\| ', ' \|\| TO_CHAR(...)` |
| Customer, Quarter | 客户+季度组合 | `TA.company_id \|\| ', ' \|\| ...` |
| Customer, Warehouse, Month | 客户+仓库+月份 | `TA.company_id \|\| ', ' \|\| ...` |

---

## 七、系统枚举与配置

### 7.1 费用事件（FeesEventName）

```php
const RECEIVING     = 'Receiving';      // 入库
const RETURN        = 'Return';         // 退货
const FULFILLMENT   = 'Fulfillment';    // 履单
const STORAGE       = 'Storage';        // 仓储
const TRANSFER      = 'Transfer';       // 转运
const VAS           = 'VAS';            // 增值服务
const LABEL         = 'Label';          // 标签
const NOT_SPECIFIED = 'Unspecified';    // 未指定
```

### 7.2 费用名称（FeesName）

```php
const RETURN_FEE           = 'Return Fee';           // 退货费
const PACKING_MATERIAL_FEE = 'Packing Material Fee'; // 包材费
const SHIPPING_FEE         = 'Shipping Fee';         // 运费
const STORAGE_FEE          = 'Storage Fee';          // 仓储费
const HANDLING_FEE         = 'Handling Fee';         // 操作费
const RECEIVING_FEE        = 'Receiving Fee';        // 入库费
const MISC_FEE             = 'Misc Fee';             // 杂项费
```

### 7.3 承运商（Carrier）

```php
const UPS             = 'UPS';              // UPS
const USPS            = 'USPS';             // USPS
const FEDEX           = 'FedEx';            // FedEx
const ONTRAC          = 'OnTrac';           // OnTrac
const UNIUNI          = 'UniUni';           // UniUni
const GOFO            = 'GOFO';             // GOFO
const AMAZON_SHIPPING = 'Amazon Shipping';  // Amazon Shipping
const GLOBAL_POST     = 'GlobalPost';       // GlobalPost
```

### 7.4 定价模式（PricingModel）

```php
const CN            = 'CN';            // 中国定价
const US            = 'US';            // 美国定价
const NOT_SPECIFIED = 'Unspecified';   // 未指定
```

### 7.5 团队（TeamName）

```php
const CN            = 'CN';            // 中国团队
const US            = 'US';            // 美国团队
const NOT_SPECIFIED = 'Unspecified';   // 未指定
```

### 7.6 VIP 等级（TierName）

```php
const SVIP_PLUS             = 'SVIP+';                  // SVIP+
const VIP                   = 'VIP';                    // VIP
const SVIP                  = 'SVIP';                   // SVIP
const IMPORTANT_BEST_SELLER = 'Important(BEST SELLER)'; // 重要（畅销）
const IMPORTANT_WHOLESALE   = 'Member(WHOLESALE)';      // 批发会员
const NOT_SPECIFIED         = 'Unspecified';            // 未指定
```

### 7.7 报价模式 ID

| ID | 模式名称 | 说明 |
|----|----------|------|
| 1 | 标准模式 | 标准报价 |
| 10 | 特殊模式 1 | 特殊定价 |
| 11 | 特殊模式 2 | 特殊定价 |

---

## 八、关键业务概念

### 8.1 符号规则

| 类型 | 符号 | 说明 |
|------|------|------|
| Sales | 正数 (+) | 收入 |
| Cost | 负数 (-) | 支出 |
| Gross Profit | 正/负/零 | Sales + Cost（Cost 为负，实际是减法） |

### 8.2 时间处理

- **存储时区**：所有时间统一转换为 UTC+00
- **显示时区**：前端根据用户时区转换显示
- **时间范围**：查询时自动向前推 3 天确保数据完整
- **最早数据**：2022-12-27

### 8.3 公司层级

```
Parent Company (顶层公司)
    ├── Sub Company 1 (子公司)
    │   └── Sub-Sub Company (孙公司)
    └── Sub Company 2 (子公司)
```

- **OEM 子公司**：数据被排除在分析外
- **子账户归属**：数据归集到顶层父公司

### 8.4 报价版本

- 支持多版本报价管理
- 根据时间范围匹配有效报价
- 报价变更历史追溯

### 8.5 关系类型（Relation Type）

用于费用详情查询时关联业务单据：

| 关系类型 | 字段名 | 说明 |
|----------|--------|------|
| Shipment ID | shipment_id | 履行单 ID |
| Trx ID | fulfillment_transaction_id | 交易 ID |
| Tracking Number | tracking_number | 追踪号 |
| Order ID | fulfillment_order_id | 订单 ID |
| Transfer Order ID | transfer_order_id | 转运单 ID |
| ASN # | asn_id | ASN ID |
| VAS # | vas_number | VAS 编号 |
| Inventory Code | inventory_code | 库存编码 |
| Return ID | return_id | 退货 ID |

---

## 九、业务流程图

### 9.1 订单到费用生成完整流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        订单到费用生成业务流程 (BPMN)                         │
└─────────────────────────────────────────────────────────────────────────────┘

[客户]          [OMS]           [WMS]           [Billing]       [BI]
  │               │               │               │               │
  │  1.创建订单    │               │               │               │
  │──────────────>│               │               │               │
  │               │               │               │               │
  │               │ 2.分配仓库    │               │               │
  │               │──────────────>│               │               │
  │               │               │               │               │
  │               │               │ 3.生成履单单   │               │
  │               │               │──┐            │               │
  │               │               │  │            │               │
  │               │               │<─┘            │               │
  │               │               │               │               │
  │               │               │ 4.拣货/打包   │               │
  │               │               │──┐            │               │
  │               │               │  │            │               │
  │               │               │<─┘            │               │
  │               │               │               │               │
  │               │               │ 5.发货        │               │
  │               │               │──────────────────────────────>│
  │               │               │               │               │
  │               │               │               │ 6.计算费用    │
  │               │               │               │──┐            │
  │               │               │               │  │            │
  │               │               │               │<─┘            │
  │               │               │               │               │
  │               │               │               │ 7.生成账单    │
  │               │               │               │──────────────>│
  │               │               │               │               │
  │               │               │               │               │ 8.ETL处理
  │               │               │               │               │──┐
  │               │               │               │               │  │
  │               │               │               │               │<─┘
  │               │               │               │               │
  │               │               │               │               │ 9.数据入库
  │               │               │               │               │──┐
  │               │               │               │               │  │
  │               │               │               │               │<─┘
  │               │               │               │               │
  │               │               │               │               │ 10.报表展示
  │               │               │               │               │──>
```

### 9.2 运费对账流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          运费对账业务流程                                    │
└─────────────────────────────────────────────────────────────────────────────┘

    [发货]              [承运商]              [对账系统]            [BI]
      │                    │                    │                   │
      │ 1.发货并获取追踪号  │                    │                   │
      │───────────────────>│                    │                   │
      │                    │                    │                   │
      │                    │ 2.运输服务         │                    │
      │                    │──┐                 │                   │
      │                    │  │                 │                   │
      │                    │<─┘                 │                   │
      │                    │                    │                   │
      │                    │ 3.生成账单         │                    │
      │                    │───────────────────>│                   │
      │                    │                    │                   │
      │                    │                    │ 4.接收账单        │
      │                    │                    │──┐                │
      │                    │                    │  │                │
      │                    │                    │<─┘                │
      │                    │                    │                   │
      │                    │                    │ 5.账单核对        │
      │                    │                    │──┐                │
      │                    │                    │  │                │
      │                    │                    │<─┘                │
      │                    │                    │                   │
      │                    │                    │ 6.差异计算        │
      │                    │                    │──┐                │
      │                    │                    │  │                │
      │                    │                    │<─┘                │
      │                    │                    │                   │
      │                    │                    │ 7.成本确认        │
      │                    │                    │──────────────────>│
      │                    │                    │                   │
      │                    │                    │                   │ 8.更新成本
      │                    │                    │                   │──┐
      │                    │                    │                   │  │
      │                    │                    │                   │<─┘
```

### 9.3 仓储费用计算流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         仓储费用计算流程                                     │
└─────────────────────────────────────────────────────────────────────────────┘

  [WMS库存]          [计费引擎]          [报价系统]          [BI仓库]
      │                  │                  │                  │
      │ 1.每日库存快照    │                  │                  │
      │─────────────────>│                  │                  │
      │                  │                  │                  │
      │                  │ 2.获取体积/数量   │                  │
      │                  │──┐               │                  │
      │                  │  │               │                  │
      │                  │<─┘               │                  │
      │                  │                  │                  │
      │                  │ 3.查询报价       │                  │
      │                  │─────────────────>│                  │
      │                  │                  │                  │
      │                  │                  │ 4.返回单价       │
      │                  │                  │─────────────────>│
      │                  │                  │                  │
      │                  │ 5.计算费用       │                  │
      │                  │──┐               │                  │
      │                  │  │               │                  │
      │                  │<─┘               │                  │
      │                  │                  │                  │
      │                  │ 6.生成仓储费用    │                  │
      │                  │─────────────────────────────────────>│
      │                  │                  │                  │
      │                  │                  │                  │ 7.ETL处理
      │                  │                  │                  │──┐
      │                  │                  │                  │  │
      │                  │                  │                  │<─┘
```

### 9.4 退货处理流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          退货处理业务流程                                    │
└─────────────────────────────────────────────────────────────────────────────┘

  [客户]           [OMS]            [WMS]            [Billing]         [BI]
    │                │                │                │                │
    │ 1.申请退货      │                │                │                │
    │───────────────>│                │                │                │
    │                │                │                │                │
    │                │ 2.创建退货单    │                │                │
    │                │───────────────>│                │                │
    │                │                │                │                │
    │ 3.寄回商品      │                │                │                │
    │─────────────────────────────────>│                │                │
    │                │                │                │                │
    │                │                │ 4.验收质检      │                │
    │                │                │──┐             │                │
    │                │                │  │             │                │
    │                │                │<─┘             │                │
    │                │                │                │                │
    │                │                │ 5.入库/销毁    │                │
    │                │                │──┐             │                │
    │                │                │  │             │                │
    │                │                │<─┘             │                │
    │                │                │                │                │
    │                │                │ 6.计算费用     │                │
    │                │                │───────────────>│                │
    │                │                │                │                │
    │                │                │                │ 7.生成账单     │
    │                │                │                │───────────────>│
    │                │                │                │                │
    │                │                │                │                │ 8.ETL
    │                │                │                │                │──┐
    │                │                │                │                │  │
    │                │                │                │                │<─┘
```

---

## 十、实体关系图（ERD）

### 10.1 核心表关系图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      ShipSage BI 核心 ERD                                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐         ┌─────────────────────┐
│   shipsage_sales    │         │      company        │
│       _fees         │         │                     │
├─────────────────────┤         ├─────────────────────┤
│ PK fees_id          │         │ PK company_id       │
│ FK company_id ──────┼────────>│    company_name     │
│ FK warehouse_id     │         │ FK team_id          │
│ FK team_id          │         │ FK manager_id       │
│ fees_event_name     │         └─────────────────────┘
│ fees_name           │                   │
│ fees_category       │                   │
│ sales               │                   │
│ cost                │                   │
│ gross_profit        │                   │
│ detail (JSON)       │                   │
└─────────────────────┘                   │
           │                              │
           │                              │
           ▼                              ▼
┌─────────────────────┐         ┌─────────────────────┐
│     warehouse       │         │        team         │
├─────────────────────┤         ├─────────────────────┤
│ PK warehouse_id <───┼─────────│ PK team_id <────────┘
│    warehouse_name   │         │    team_name        │
│    country          │         └─────────────────────┘
│    sg_flag          │
└─────────────────────┘
           │
           │
           ▼
┌─────────────────────┐
│   service_quote     │
├─────────────────────┤
│ PK quote_id         │
│ FK service_id       │
│    quote_name       │
│    quote_value      │
│    start_date       │
│    end_date         │
└─────────────────────┘
```

### 10.2 费用事件关系图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      费用事件关系图                                          │
└─────────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────┐
                    │  shipsage_sales │
                    │    _fees        │
                    │  (中心表)       │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   FULFILL   │      │   STORAGE   │      │   SHIPPING  │
│   (履单)    │      │   (仓储)    │      │   (运输)    │
├─────────────┤      ├─────────────┤      ├─────────────┤
│shipment_id  │      │inventory_id │      │tracking_no  │
│order_id     │      │storage_type │      │carrier      │
│tracking_no  │      │volume       │      │service_code │
└─────────────┘      └─────────────┘      └─────────────┘

         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  RECEIVING  │      │   RETURN    │      │     VAS     │
│   (入库)    │      │   (退货)    │      │  (增值服务) │
├─────────────┤      ├─────────────┤      ├─────────────┤
│asn_id       │      │return_id    │      │vas_number   │
│container_no  │      │return_type  │      │vas_type     │
│carton_qty   │      │qty          │      │service_detail
└─────────────┘      └─────────────┘      └─────────────┘
```

### 10.3 数据流向图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        数据流向图                                            │
└─────────────────────────────────────────────────────────────────────────────┘

  Source Systems                    ETL Process                   BI Warehouse
  ──────────────                   ───────────                   ────────────

┌──────────────┐
│  APP DB      │
│  (Billing)   │─────┐
└──────────────┘     │
                     │
┌──────────────┐     │          ┌─────────────────┐
│  WMS DB      │     │          │  ETL: Gross     │         ┌─────────────────┐
│(Operations)  │─────┼─────────>│  Margin         │────────>│  shipsage_sales │
└──────────────┘     │          │                 │         │      _fees      │
                     │          │  - Extract      │         └─────────────────┘
┌──────────────┐     │          │  - Transform    │
│  ERP DB      │     │          │  - Load         │
│ (Logistics)  │─────┘          └─────────────────┘
└──────────────┘                          │
                                          │
                     ┌────────────────────┘
                     │
                     ▼
          ┌─────────────────┐
          │  ETL: PL4       │
          │  Cost           │
          └─────────────────┘
```

---

## 十一、API 接口文档

### 11.1 Gross Margin APIs

#### 11.1.1 概览查询

```http
GET /api/gross-margins?api=index.by-overview
```

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| api | string | 是 | API 标识 | index.by-overview |
| group_option | string | 是 | 分组维度 | Customer, Team, Month 等 |
| start_date | date | 是 | 开始日期 | 2024-01-01 |
| end_date | date | 是 | 结束日期 | 2024-01-31 |
| customer_id | int/array | 否 | 客户 ID | 123 或 [123,456] |
| manager_id | int/array | 否 | 经理 ID | 456 |
| fees_event_name | string/array | 否 | 费用事件 | Fulfillment, Storage |
| fees_name | string/array | 否 | 费用名称 | Shipping Fee |
| team_name | string/array | 否 | 团队名称 | US, CN |
| service_name | string/array | 否 | 服务名称 | FedEx, UPS |
| carrier | string/array | 否 | 承运商 | UPS, FedEx |
| pricing_model_name | string/array | 否 | 定价模式 | US, CN |
| tier_name | string/array | 否 | VIP 等级 | VIP, SVIP |
| warehouse_name | string/array | 否 | 仓库名称 | LA Warehouse |
| gaatu_excluded | boolean | 否 | 排除 Gaatu | 1 |
| label_excluded | boolean | 否 | 排除标签对账公司 | 1 |
| is_histogram | boolean | 否 | 是否为直方图 | 1 |
| date_type | string | 否 | 时间列类型 | fees_time, action_date |

**响应示例**：

```json
{
  "errcode": 1,
  "errmsg": "ok",
  "data": {
    "items": [
      {
        "group_option": "123, 2024-01",
        "group_option_id": "123",
        "group_option_name": "Customer A",
        "total_sales": 10000.00,
        "storage_sales": 1000.00,
        "handling_sales": 2000.00,
        "shipping_sales": 5000.00,
        "receiving_sales": 500.00,
        "return_sales": 100.00,
        "packing_material_sales": 200.00,
        "misc_sales": 100.00,
        "total_cost": -6000.00,
        "storage_cost": -600.00,
        "handling_cost": -1200.00,
        "shipping_cost": -3000.00,
        "receiving_cost": -300.00,
        "return_cost": -50.00,
        "packing_material_cost": -120.00,
        "misc_cost": -50.00,
        "total_gross_profit": 4000.00,
        "gross_margin": 0.4000,
        "company_name": "Customer A"
      }
    ],
    "headers": [
      { "text": "BI.Gross Margin.Customer", "value": "customer", "sortable": false, "align": "left" }
    ]
  }
}
```

#### 11.1.2 费用详情查询

```http
GET /api/gross-margins?api=index.by-fees
```

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| api | string | 是 | API 标识 | index.by-fees |
| start_date | date | 是 | 开始日期 | 2024-01-01 |
| end_date | date | 是 | 结束日期 | 2024-01-31 |
| page | int | 否 | 页码 | 1 |
| items_per_page | int | 否 | 每页条数 | 50 |
| 其他筛选条件 | - | 否 | 同概览查询 | - |

**响应示例**：

```json
{
  "errcode": 1,
  "errmsg": "ok",
  "data": {
    "items": [
      {
        "fees_id": "f-fs-sf-ab-s-12345",
        "fees_event_name": "Fulfillment",
        "fees_name": "Shipping Fee",
        "fees_category": "sales",
        "fees_time": "2024-01-15 08:30:00+00",
        "action_date": "2024-01-15 00:00:00+00",
        "company_id": 123,
        "company_name": "Customer A",
        "team_name": "US",
        "warehouse_name": "LA Warehouse",
        "carrier": "UPS",
        "tracking_number": "1Z999AA10123456784",
        "shipping_sales": 15.50,
        "sales": 15.50,
        "cost": 0,
        "gross_profit": 15.50,
        "detail": {
          "service_detail": {
            "shipment_id": "SH12345",
            "order_id": "ORD67890",
            "weight": 2.5,
            "dimensions": "10x8x6"
          }
        },
        "misc_type": "",
        "comments": ""
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 50,
      "total": 1000,
      "last_page": 20
    }
  }
}
```

#### 11.1.3 过滤数据查询

```http
GET /api/gross-margins?api=index.by-get-filter-data
```

**响应示例**：

```json
{
  "errcode": 1,
  "errmsg": "ok",
  "data": {
    "group_options": ["Customer", "Team", "Service Type", "Fee Type", "Carrier", "Warehouse", "Year", "Month", "Week", "Day", "Quarter", "Customer, Month", "Team, Month", "Customer, Quarter", "Customer, Warehouse, Month"],
    "operation_types": ["Receiving", "Return", "Fulfillment", "Storage", "Transfer", "VAS", "Label", "Unspecified"],
    "fee_types": ["Return Fee", "Packing Material Fee", "Shipping Fee", "Storage Fee", "Handling Fee", "Receiving Fee", "Misc Fee"],
    "teams": ["CN", "US", "Unspecified"],
    "pricing_models": ["CN", "US", "Unspecified"],
    "tiers": ["SVIP+", "VIP", "SVIP", "Important(BEST SELLER)", "Member(WHOLESALE)", "Unspecified"],
    "warehouses": ["LA Warehouse", "NY Warehouse", "Unspecified"],
    "managers": [{"id": 1, "name": "Manager A"}, {"id": 2, "name": "Manager B"}],
    "carriers": ["UPS", "USPS", "FedEx", "OnTrac", "UniUni", "GOFO", "Amazon Shipping", "GlobalPost"],
    "service_names": ["FedEx Ground", "UPS Ground", "USPS Priority"]
  }
}
```

### 11.2 API 错误码

| 错误码 | 说明 | 处理建议 |
|--------|------|----------|
| 1 | 成功 | - |
| 0 | 失败 | 查看 errmsg |
| 400 | 请求参数错误 | 检查参数格式和必填项 |
| 401 | 未授权 | 检查登录状态 |
| 403 | 权限不足 | 联系管理员授权 |
| 404 | 资源不存在 | 检查 ID 是否正确 |
| 500 | 服务器错误 | 联系开发人员 |

---

## 十二、详细数据字典

### 12.1 shipsage_sales_fees 表

| 字段名 | 数据类型 | 是否必填 | 默认值 | 说明 | 示例值 |
|--------|----------|----------|--------|------|--------|
| **主键字段** |
| fees_id | VARCHAR(50) | 是 | - | 费用唯一标识 | f-fs-sf-ab-s-12345 |
| **事件字段** |
| fees_event_name | VARCHAR(50) | 是 | - | 费用事件类型 | Fulfillment |
| fees_event_desc | VARCHAR(255) | 否 | '' | 费用事件描述 | Auto Billing |
| fees_name | VARCHAR(50) | 是 | - | 费用名称 | Shipping Fee |
| fees_desc | VARCHAR(255) | 否 | '' | 费用描述 | Operation |
| fees_category | VARCHAR(20) | 是 | - | 费用分类 | sales/cost |
| **时间字段** |
| fees_time | TIMESTAMP | 是 | - | 费用发生时间(UTC) | 2024-01-15 08:30:00+00 |
| action_date | TIMESTAMP | 是 | - | 操作日期(UTC) | 2024-01-15 00:00:00+00 |
| **客户维度** |
| company_id | INT | 是 | - | 客户公司 ID | 123 |
| company_name | VARCHAR(255) | 否 | '' | 客户公司名称 | Customer A |
| team_id | INT | 否 | 0 | 团队 ID | 1 |
| team_name | VARCHAR(50) | 否 | '' | 团队名称 | US |
| manager_id | INT | 否 | 0 | 账户经理 ID | 456 |
| manager_name | VARCHAR(100) | 否 | '' | 账户经理名称 | Manager A |
| **定价维度** |
| pricing_model_id | INT | 否 | 0 | 定价模式 ID | 1 |
| pricing_model_name | VARCHAR(50) | 否 | '' | 定价模式名称 | US |
| tier_id | INT | 否 | 0 | VIP 等级 ID | 1 |
| tier_name | VARCHAR(50) | 否 | '' | VIP 等级名称 | VIP |
| fee_version_id | INT | 否 | 0 | 费用版本 ID | 1 |
| fee_version_name | VARCHAR(100) | 否 | '' | 费用版本名称 | Version 1 |
| **仓库维度** |
| warehouse_id | INT | 否 | 0 | 仓库 ID | 1 |
| warehouse_name | VARCHAR(100) | 否 | '' | 仓库名称 | LA Warehouse |
| **服务维度** |
| service_type | VARCHAR(50) | 否 | '' | 服务类型 | Ground |
| service_name | VARCHAR(100) | 否 | '' | 服务名称 | FedEx Ground |
| carrier | VARCHAR(50) | 否 | '' | 承运商 | FedEx |
| **业务关联** |
| tracking_number | VARCHAR(100) | 否 | '' | 追踪号 | 1Z999AA10123456784 |
| shipment_id | VARCHAR(50) | 否 | '' | 履行单 ID | SH12345 |
| fulfillment_order_id | VARCHAR(50) | 否 | '' | 订单 ID | ORD67890 |
| fulfillment_transaction_id | VARCHAR(50) | 否 | '' | 交易 ID | TRX98765 |
| transfer_order_id | VARCHAR(50) | 否 | '' | 转运单 ID | TO54321 |
| asn_id | VARCHAR(50) | 否 | '' | ASN ID | ASN11111 |
| vas_number | VARCHAR(50) | 否 | '' | VAS 编号 | VAS22222 |
| return_id | VARCHAR(50) | 否 | '' | 退货 ID | RET33333 |
| inventory_code | VARCHAR(50) | 否 | '' | 库存编码 | INV44444 |
| **Sales 金额** |
| storage_sales | DECIMAL(18,2) | 否 | 0 | 仓储销售 | 100.00 |
| handling_sales | DECIMAL(18,2) | 否 | 0 | 操作销售 | 200.00 |
| shipping_sales | DECIMAL(18,2) | 否 | 0 | 运输销售 | 500.00 |
| receiving_sales | DECIMAL(18,2) | 否 | 0 | 入库销售 | 50.00 |
| return_sales | DECIMAL(18,2) | 否 | 0 | 退货销售 | 10.00 |
| packing_material_sales | DECIMAL(18,2) | 否 | 0 | 包材销售 | 20.00 |
| misc_sales | DECIMAL(18,2) | 否 | 0 | 杂项销售 | 10.00 |
| sales | DECIMAL(18,2) | 否 | 0 | 总销售 | 890.00 |
| **Cost 金额** |
| storage_cost | DECIMAL(18,2) | 否 | 0 | 仓储成本 | -60.00 |
| handling_cost | DECIMAL(18,2) | 否 | 0 | 操作成本 | -120.00 |
| shipping_cost | DECIMAL(18,2) | 否 | 0 | 运输成本 | -300.00 |
| receiving_cost | DECIMAL(18,2) | 否 | 0 | 入库成本 | -30.00 |
| return_cost | DECIMAL(18,2) | 否 | 0 | 退货成本 | -5.00 |
| packing_material_cost | DECIMAL(18,2) | 否 | 0 | 包材成本 | -12.00 |
| misc_cost | DECIMAL(18,2) | 否 | 0 | 杂项成本 | -5.00 |
| cost | DECIMAL(18,2) | 否 | 0 | 总成本 | -532.00 |
| **汇总** |
| gross_profit | DECIMAL(18,2) | 否 | 0 | 毛利 | 358.00 |
| **其他** |
| detail | JSON | 否 | NULL | 详细信息 | {"key": "value"} |
| hidden | TINYINT | 否 | 0 | 是否隐藏 | 0/1 |
| disabled | TINYINT | 否 | 0 | 是否禁用 | 0/1 |
| deleted | TINYINT | 否 | 0 | 是否删除 | 0/1 |
| created_at | TIMESTAMP | 否 | CURRENT_TIMESTAMP | 创建时间 | 2024-01-15 08:30:00 |
| created_by | INT | 否 | 0 | 创建人 ID | 1 |
| updated_at | TIMESTAMP | 否 | CURRENT_TIMESTAMP | 更新时间 | 2024-01-15 08:30:00 |
| updated_by | INT | 否 | 0 | 更新人 ID | 1 |

---

## 十三、性能优化

### 13.1 维度缓存优化

```php
// 使用静态变量缓存维度数据，减少数据库查询
public static $dimensions = [];

public function getDimensions()
{
    if (! self::$dimensions) {
        self::$dimensions = $this->getCompanyDimensions();
    }
    return self::$dimensions;
}
```

### 13.2 索引建议

建议在以下字段上创建索引：
- `company_id`
- `fees_event_name`
- `fees_name`
- `fees_time`
- `action_date`
- `warehouse_id`
- `team_name`

---

## 十四、常见问题

### Q1: Sales 和 Cost 的符号规则是什么？

**A:** 
- Sales（销售额）：正数
- Cost（成本）：负数
- Gross Profit = Sales + Cost（自动计算）

### Q2: 为什么某些数据没有显示？

**A:** 可能的原因：
1. 数据在 2022-12-27 之前（系统最早数据）
2. 公司是 OEM 子公司（被排除）
3. 报价模式不在 (1, 10, 11) 范围内
4. 时间范围设置不正确

### Q3: 毛利率为什么显示为 -1, 0, 1？

**A:** 当销售额为 0 时：
- 毛利 > 0：显示为 1
- 毛利 = 0：显示为 0
- 毛利 < 0：显示为 -1

---

## 十五、相关文件导航

| 文件 | 功能 |
|------|------|
| `ShipsageSalesFeesRepository.php` | 核心数据查询（DB/BI） |
| `GrossMarginService.php` | 毛利分析服务（Application/ShipSage/BI） |
| `GrossMarginRepository.php` | 毛利基础 Repository（Application/ShipSage/BI） |
| `ShippingRepository.php` | 运输成本计算（Application/ShipSage/BI） |
| `StorageRepository.php` | 仓储成本计算（Application/ShipSage/BI） |
| `HandlingRepository.php` | 操作成本计算（Application/ShipSage/BI） |
| `ReceivingRepository.php` | 收货成本计算（Application/ShipSage/BI） |
| `ReturnRepository.php` | 退货成本计算（Application/ShipSage/BI） |
| `PackingMaterialRepository.php` | 包材成本计算（Application/ShipSage/BI） |
| `MiscRepository.php` | 杂项成本计算（Application/ShipSage/BI） |
| `StoreByUpdateShipsageSalesFeesCommand.php` | ETL 更新命令（Application/ShipSage/BI） |

---

## 附录

### A. 常用 ETL 命令

```bash
# 更新 shipsage_sales_fees 表（定期执行）
php artisan shipsage:bi:shipsage-sales-fees:store.by-update

# 各类费用计算命令
index.by-get-shipping-sales           # Shipping Sales
index.by-get-estimated-shipping-cost  # Shipping Cost（预估）
index.by-get-reconciliation-shipping-cost-with-ups    # UPS 对账
index.by-get-reconciliation-shipping-cost-with-usps   # USPS 对账
index.by-get-reconciliation-shipping-cost-with-usps-adj  # USPS 调整
index.by-get-storage-sales            # Storage Sales
index.by-get-storage-cost             # Storage Cost
index.by-get-handling-sales           # Handling Sales
index.by-get-handling-cost-with-fulfillment   # Fulfillment Handling Cost
index.by-get-handling-cost-with-transfer      # Transfer Handling Cost
index.by-get-handling-cost-with-vas           # VAS Handling Cost
index.by-get-receiving-sales          # Receiving Sales
index.by-get-receiving-cost-without-gaatu     # Receiving Cost
index.by-get-return-sales             # Return Sales
index.by-get-return-item-cost         # Return Item Cost
index.by-get-return-package-cost      # Return Package Cost
index.by-get-packing-material-sales   # Packing Material Sales
index.by-get-packing-material-cost    # Packing Material Cost
```

### B. 数据库连接配置

| 连接名 | 数据库 | 用途 |
|--------|--------|------|
| DBConnections::BI | Redshift | BI 数据仓库 |
| DBConnections::APP | MySQL | 业务数据库 |
| DBConnections::WMS | MySQL | 仓储数据库 |
| DBConnections::ERP | MySQL | ERP 数据库 |

---

*文档结束*
