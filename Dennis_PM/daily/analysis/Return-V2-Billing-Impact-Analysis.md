# Return V2.0 深度计费影响分析报告

> 生成时间: 2026-03-30  
> ERD来源: EERD-ShipSage-Ben-OMS-Return-2026-Q1-V2.0-260326-084425.pdf

---

## 一、ERD 核心方案解构

### 1.1 新增数据库表结构

#### 新表 1：`app_system_company_return`（公司退件配置）

```sql
CREATE TABLE IF NOT EXISTS `app_system_company_return` (
    `return_id` int unsigned NOT NULL AUTO_INCREMENT,
    `company_id` int NOT NULL,
    `return_level_id` int NOT NULL DEFAULT '1' COMMENT '退件级别',
    `allow_new` tinyint NOT NULL DEFAULT '1',         -- 允许新品退件
    `allow_disposal` tinyint NOT NULL DEFAULT '1',   -- 允许报废退件
    `allow_quarantine` tinyint NOT NULL DEFAULT '0', -- 允许隔离退件
    `allow_stored` tinyint NOT NULL DEFAULT '0',     -- 允许存储退件
    ...
);
```

**退件级别定义**：

| Level | 名称 | 允许的退件类型 | 业务含义 |
|-------|------|---------------|---------|
| 1 | Simple（简单） | New, Disposal | 最基础的处理，只接受新品和报废 |
| 2 | Standard（标准） | New, Quarantine | 标准处理，接受新品和隔离 |
| 3 | Regular（常规） | New, Store | 常规处理，接受新品和存储 |

#### 新表 2：`app_wms_return_put_away`（退件上架记录）

```sql
CREATE TABLE IF NOT EXISTS `app_wms_return_put_away` (
    `put_away_id` int unsigned NOT NULL AUTO_INCREMENT,
    `scanned_return_barcode` varchar(255) DEFAULT NULL,  -- 扫描的退件条码
    `qty` int unsigned NOT NULL COMMENT 'put away qty',  -- 上架数量
    `scanned_location_id` int unsigned NOT NULL DEFAULT '0',
    `scanned_gaylord_id` int unsigned NOT NULL DEFAULT '0',
    `company_id` int unsigned NOT NULL,
    `return_id` int NOT NULL DEFAULT '0',
    `product_id` int NOT NULL DEFAULT '0',
    `condition_id` int NOT NULL DEFAULT '1',  -- 退件状态
    `comment` varchar(255) DEFAULT NULL,
    ...
);
```

#### 新增 Condition Types（退件状态）

```
wms.inventory_condition_type:
  1. Disposal     - 需报废处理的退件
  2. Quarantine   - 需隔离的退件（待定）
  3. Stored       - 需存储的退件
  4. Unclaimed    - 无人认领的退件（3天后处理）
```

#### 修改：`app_wms_gaylord_barcode`

```sql
ALTER TABLE `app_wms_gaylord_barcode`
ADD COLUMN `type` int NOT NULL DEFAULT '1' COMMENT '1:final scan 2:return' AFTER `barcode`,
ADD COLUMN `condition_id` int NOT NULL DEFAULT '0' COMMENT 'inventory_condition_type.condition_id' AFTER `type`,
ADD COLUMN `company_id` int NOT NULL DEFAULT '0' COMMENT 'company of return gaylord' AFTER `condition_id`;
```

**Return Gaylord 类型**：

| Type | 名称 | 计费关联 |
|------|------|----------|
| Unclaimed Gaylord | 无人认领（3-7天后处理） | 高风险 |
| Disposal Gaylord | 报废（VAS处理） | 高成本 |
| Quarantine Gaylord | 隔离（特定公司） | 存储成本 |
| Stored Gaylord | 存储（混合公司） | 存储成本 |
| Gaylord for New | 新品暂存（后续上架） | 标准处理 |

---

## 二、退件 V2.0 业务流程与计费触发点

### 2.1 完整退件流程图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Return V2.0 业务流程                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. Company Setup Return Profile                                            │
│     └── app_system_company_return (公司退件配置)                             │
│         ├── return_level_id (1=Simple, 2=Standard, 3=Regular)              │
│         ├── allow_new / allow_disposal / allow_quarantine / allow_stored    │
│                                                                             │
│  2. Warehouse Setup                                                          │
│     ├── 创建 Return Area（退货区域）                                          │
│     └── 创建 Return Gaylord（退货箱）                                        │
│         ├── GL-QUARANTINE-1008-10001 (隔离箱)                               │
│         ├── GL-STORED-0-10002 (存储箱)                                      │
│         └── GL-DISPOSAL-0-10003 (报废箱)                                    │
│                                                                             │
│  3. Return Verify (退件核实)                                                 │
│     ├── 未知退件 → Unclaimed/Stored                                         │
│     │   └── 保留3天待认领，3天后处理                                         │
│     └── 已知退件 → 根据公司配置显示退件状态选项                               │
│         ├── New (新品) → 打印 SKU-ReturnId 标签                              │
│         ├── Quarantine → 打印 SKU-ReturnId-Q 标签                            │
│         ├── Store → 打印 SKU-ReturnId-S 标签                                 │
│         ├── Disposal → 打印 SKU-ReturnId-D 标签                              │
│         └── Unclaimed → 无需标签                                            │
│                                                                             │
│  4. Return Put Away (退件上架)                                               │
│     ├── app_wms_return_put_away 记录                                         │
│     ├── 新品 → 送往 Picking Location                                         │
│     ├── 隔离/存储 → 送往 Return Gaylord                                       │
│     └── Unclaimed → 保留在 Gaylord 中                                       │
│                                                                             │
│  5. Gaylord Transfer (箱体转移)                                              │
│     └── Return Gaylord → Picking Location (允许)                             │
│                                                                             │
│  6. Lost and Found (失物招领)                                               │
│     └── 3天 Unclaimed 件 → 客户可申请认领                                   │
│                                                                             │
│  7. Billing (计费) ← 关键触发点                                              │
│     └── 根据 condition_id / return_level_id 计算费用                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 计费触发点分析

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        计费触发点与金额影响因素                              │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  触发点 A: Return Verified (退件核实完成)                                    │
│  ├── 计费内容: 操作费 + 核实费                                               │
│  ├── 影响因素:                                                              │
│  │   ├── condition_id (退件状态)                                           │
│  │   │   ├── New (1) → 标准处理                                            │
│  │   │   ├── Quarantine (2) → 隔离处理 + 存储附加费                        │
│  │   │   ├── Store (3) → 存储处理 + 存储附加费                             │
│  │   │   ├── Disposal (4) → 报废处理 + 高额处理费                          │
│  │   │   └── Unclaimed (5) → 无人认领待定                                 │
│  │   └── 是否需要生成 Return Label                                         │
│  │       ├── New: 需要 (SKU-ReturnId)                                      │
│  │       ├── Quarantine: 需要 (SKU-ReturnId-Q)                             │
│  │       ├── Store: 需要 (SKU-ReturnId-S)                                  │
│  │       ├── Disposal: 需要 (SKU-ReturnId-D)                               │
│  │       └── Unclaimed: 不需要标签                                          │
│  └── 当前代码问题: 核实环节没有独立的计费逻辑                                 │
│                                                                            │
│  触发点 B: Return Put Away (退件上架完成) ← 主要计费点                       │
│  ├── 计费内容: 上架费 + 存储费 (基于 condition_id)                            │
│  ├── 影响因素:                                                              │
│  │   ├── put_away_qty (实际上架数量) ← 新增关键字段                         │
│  │   ├── condition_id (上架时的退件状态)                                    │
│  │   │   ├── New (新品上架) → 标准上架费                                    │
│  │   │   ├── Quarantine (隔离) → 隔离存储附加费                            │
│  │   │   ├── Store (存储) → 存储附加费                                      │
│  │   │   ├── Disposal (报废) → 报废处理附加费                               │
│  │   │   └── Unclaimed (无人认领) → 暂缓计费                                │
│  │   ├── return_level_id (公司退件级别)                                     │
│  │   │   ├── Level 1 (Simple) → 基础费率                                   │
│  │   │   ├── Level 2 (Standard) → 标准费率                                 │
│  │   │   └── Level 3 (Regular) → 高级费率                                 │
│  │   └── put_away_location (上架位置)                                      │
│  │       ├── Picking Location → 标准费用                                    │
│  │       └── Return Gaylord → Gaylord存储费用                               │
│  └── 当前代码问题:                                                          │
│      1. 没有读取 condition_id 进行差异化计费                                 │
│      2. 没有使用 put_away_qty（应替代 verify_qty）                          │
│      3. 没有考虑 return_level_id 对费率的影响                                │
│      4. 没有区分上架位置对计费的影响                                         │
│                                                                            │
│  触发点 C: Return Gaylord Transfer (箱体转移)                               │
│  ├── 计费内容: 转移操作费                                                   │
│  ├── 影响因素:                                                              │
│  │   ├── transfer_type (转移类型)                                          │
│  │   │   ├── Return Gaylord → Picking Location                             │
│  │   │   └── Return Gaylord → Another Return Gaylord                       │
│  │   └── gaylord_condition_id (箱体状态)                                   │
│  └── 当前代码问题: 没有相关计费逻辑                                          │
│                                                                            │
│  触发点 D: Unclaimed 过期处理 (3天后)                                        │
│  ├── 计费内容: 逾期存储费 / 强制处理费                                        │
│  ├── 影响因素:                                                              │
│  │   ├── 逾期天数                                                           │
│  │   └── 最终处理方式 (disposal / transfer)                                │
│  └── 当前代码问题: 没有相关计费逻辑                                          │
│                                                                            │
│  触发点 E: Disposal 处理 (报废)                                              │
│  ├── 计费内容: 报废处理费                                                   │
│  ├── 影响因素:                                                              │
│  │   ├── disposal_qty (报废数量)                                           │
│  │   └── disposal_fee_per_unit (单位处理费)                                 │
│  └── 当前代码问题: 没有相关计费逻辑                                          │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 三、当前代码与新方案差距分析

### 3.1 当前 OMS 计费方法对比

**方法1: `storeByCalcFBAReturnFeesByQuoteModeV1`（Legacy）**

```php
// 问题: 硬编码的 sku/package 两档计费，没有 condition_id 支持
$quotes = $this->rs('APP/ShipsageServiceQuote', 'index', [...])->pluck(null, 'index');

// 计费公式 (仅两档)
if ('sku' == $quote->get('index')) {
    $amount = $quote->get('quote') * $qty * -1;  // SKU计费
}

if ('package' == $quote->get('index')) {
    $amount = $quote->get('quote') * $qty * -1;  // Package计费
}
```

**方法2: `storeByCalcFBAReturnFees`（VIP版本）**

```php
// 问题: 使用 additional_units_price 计费，没有区分 condition_id
$skuQuote = collect($currentQuotes->get('additional_units_price'))->get('quote', 0);
$minAdditionalUnits = collect($currentQuotes->get('additional_unit_charge_min_units'))->get('quote', 0);
$amount = ($skuQuote - $minAdditionalUnits) * $skuQty * -1;
```

**方法3: `storeByCalcReturnFeesV22`（当前最新）**

```php
// 问题1: 只读取 verify_qty，没有使用 put_away_qty
$skuQty = $currentReturnDetails->sum('verify_qty') ?: 0;  // ← 应使用 put_away_qty

// 问题2: 没有 condition_id 计费支持
$quoteIndexPrefix = $this->getQuoteIndexPrefixByReturnFromId($return->get('return_from_id'));
// 只按退件来源计费（buyer_/fba_/3rd_），没有退件状态维度

// 问题3: 没有 return_level_id 计费支持
// 没有根据公司退件级别调整费率

// 问题4: 没有区分上架位置计费
// New 退件 vs Quarantine/Store 退件计费逻辑相同

// 问题5: claim_status_id 判断遗漏 REJECTED(5)
$qb->whereIn('claim_status_id', [
    ReturnClaimStatus::NO_NEED,      // 1
    ReturnClaimStatus::APPROVED,     // 4
    // 遗漏: REJECTED (5) - 拒绝的索赔也应计费
]);
```

### 3.2 当前 WMS 4PL 计费方法

**`storeByCalcReturnFeeV1`（WMS 4PL）**

```php
// 问题1: 使用 verify_qty，没有使用 put_away_qty
$skuQty = $currentReturnDetails->sum('verify_qty') ?: 0;

// 问题2: 有 photo_sku_price（拍照费），但没有 condition_id 计费
$skuItemQty = $currentReturnDetails->pluck('catalog_id')->unique()->count();
$photeQuote = collect($currentQuotes->get('photo_sku_price'))->get('quote', 0);

// 问题3: 有 weight 计费（0<x<=50 / 50<x），但没有 condition_id 附加费
if ($packageWeight >= 0 && $packageWeight <= 50) {
    $packageQuote = collect($currentQuotes->get('0 < x <= 50'))->get('quote', 0);
} else {
    $packageQuote = collect($currentQuotes->get('50 < x'))->get('quote', 0);
}

// 问题4: 没有 Gaylord Transfer 计费
// 问题5: 没有 Disposal 计费
```

### 3.3 差距分析汇总表

| 计费维度 | ERD新方案要求 | 当前OMS | 当前WMS 4PL | 差距 |
|---------|--------------|---------|-------------|------|
| **SKU数量** | put_away_qty | verify_qty ❌ | verify_qty ❌ | ⚠️ 需改 |
| **Condition附加费** | 根据condition_id加收 | 无 ❌ | 无 ❌ | ⚠️ 需新增 |
| **Return Label费** | Quarantine/Store需标签 | 无 ❌ | 无 ❌ | ⚠️ 需新增 |
| **Gaylord存储费** | 隔离/存储箱体附加费 | 无 ❌ | 无 ❌ | ⚠️ 需新增 |
| **Disposal处理费** | 报废件专项处理费 | 无 ❌ | 无 ❌ | ⚠️ 需新增 |
| **Unclaimed逾期费** | 3天后逾期存储费 | 无 ❌ | 无 ❌ | ⚠️ 需新增 |
| **Gaylord Transfer费** | 箱体转移操作费 | 无 ❌ | 无 ❌ | ⚠️ 需新增 |
| **Claim REJECTED计费** | 拒绝索赔也应计费 | 无 ❌ | 无 ❌ | ⚠️ 需改 |
| **Company Level费率** | 根据return_level_id调整 | 无 ❌ | 无 ❌ | ⚠️ 需新增 |
| **Photo拍照费** | 需拍照的退件加收 | 无 ❌ | ✅ 有 | ⚠️ OMS需新增 |
| **Weight计费** | 按重量分段 | 无 ❌ | ✅ 有 | ⚠️ OMS需新增 |

---

## 四、详细改动点清单

### 4.1 数据库层改动

#### 改动点 1: 新建计费配置表

```sql
-- 新表: app_shipsage_return_condition_fee
-- 退件状态-费用映射表
CREATE TABLE IF NOT EXISTS `app_shipsage_return_condition_fee` (
    `fee_id` int unsigned NOT NULL AUTO_INCREMENT,
    `condition_id` int NOT NULL COMMENT 'inventory_condition_type.condition_id',
    `fee_type` varchar(50) NOT NULL COMMENT 'condition_surcharge/label_fee/disposal_fee/storage_fee',
    `fee_amount` decimal(10,4) NOT NULL DEFAULT '0',
    `unit` varchar(20) NOT NULL DEFAULT 'per_unit' COMMENT 'per_unit/per_qty/per_gaylord/per_day',
    `quote_mode_id` int NOT NULL,
    `start_date` date NOT NULL,
    `end_date` date NOT NULL,
    `hidden` tinyint NOT NULL DEFAULT '0',
    `disabled` tinyint NOT NULL DEFAULT '0',
    `deleted` tinyint NOT NULL DEFAULT '0',
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `created_by` int NOT NULL DEFAULT '0',
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `updated_by` int NOT NULL DEFAULT '0',
    PRIMARY KEY (`fee_id`),
    KEY `idx_condition_id` (`condition_id`),
    KEY `idx_quote_mode_id` (`quote_mode_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- 示例数据
INSERT INTO `app_shipsage_return_condition_fee`
(`condition_id`, `fee_type`, `fee_amount`, `unit`, `quote_mode_id`, `start_date`, `end_date`) VALUES
(1, 'condition_surcharge', 0.0000, 'per_qty', 1, '2026-01-01', '2099-12-31'),   -- New: 无附加费
(2, 'condition_surcharge', 0.5000, 'per_qty', 1, '2026-01-01', '2099-12-31'),   -- Quarantine: $0.5/件
(3, 'condition_surcharge', 0.3000, 'per_qty', 1, '2026-01-01', '2099-12-31'),   -- Store: $0.3/件
(4, 'condition_surcharge', 1.5000, 'per_qty', 1, '2026-01-01', '2099-12-31'),   -- Disposal: $1.5/件
(5, 'condition_surcharge', 0.0000, 'per_qty', 1, '2026-01-01', '2099-12-31'),   -- Unclaimed: 无附加费
(2, 'label_fee', 0.2500, 'per_unit', 1, '2026-01-01', '2099-12-31'),           -- Quarantine Label: $0.25
(3, 'label_fee', 0.2500, 'per_unit', 1, '2026-01-01', '2099-12-31'),           -- Store Label: $0.25
(4, 'disposal_fee', 2.0000, 'per_unit', 1, '2026-01-01', '2099-12-31');        -- Disposal: $2/件
```

#### 改动点 2: 修改 `app_shipsage_balance_return_fees` 表

```sql
ALTER TABLE `app_shipsage_balance_return_fees`
ADD COLUMN `condition_id` int NOT NULL DEFAULT '1' COMMENT '退件状态' AFTER `package_quote`,
ADD COLUMN `return_level_id` int NOT NULL DEFAULT '1' COMMENT '公司退件级别' AFTER `condition_id`,
ADD COLUMN `put_away_id` int unsigned DEFAULT NULL COMMENT 'app_wms_return_put_away.put_away_id' AFTER `return_level_id`,
ADD COLUMN `put_away_qty` int unsigned DEFAULT NULL COMMENT '实际上架数量' AFTER `put_away_id`,
ADD COLUMN `label_fee` decimal(10,4) DEFAULT NULL COMMENT 'Return Label费用' AFTER `put_away_qty`,
ADD COLUMN `condition_surcharge` decimal(10,4) DEFAULT NULL COMMENT '状态附加费' AFTER `label_fee`,
ADD COLUMN `storage_fee` decimal(10,4) DEFAULT NULL COMMENT 'Gaylord存储费' AFTER `condition_surcharge`,
ADD COLUMN `disposal_fee` decimal(10,4) DEFAULT NULL COMMENT '报废处理费' AFTER `storage_fee`;
```

#### 改动点 3: 新建 Gaylord 转移计费表

```sql
-- 新表: app_shipsage_balance_gaylord_transfer_fee
CREATE TABLE IF NOT EXISTS `app_shipsage_balance_gaylord_transfer_fee` (
    `fee_id` int unsigned NOT NULL AUTO_INCREMENT,
    `gaylord_barcode` varchar(100) NOT NULL COMMENT '箱体条码',
    `transfer_type` varchar(50) NOT NULL COMMENT 'return_to_picking/return_to_return',
    `source_location_id` int unsigned DEFAULT NULL,
    `target_location_id` int unsigned DEFAULT NULL,
    `source_gaylord_id` int unsigned DEFAULT NULL,
    `target_gaylord_id` int unsigned DEFAULT NULL,
    `fee_amount` decimal(10,4) NOT NULL DEFAULT '0',
    `bill_date` date NOT NULL,
    `company_id` int NOT NULL,
    `quote_mode_id` int NOT NULL,
    `balance_log_id` int unsigned NOT NULL,
    `comments` varchar(500) DEFAULT NULL,
    `hidden` tinyint NOT NULL DEFAULT '0',
    `disabled` tinyint NOT NULL DEFAULT '0',
    `deleted` tinyint NOT NULL DEFAULT '0',
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `created_by` int NOT NULL DEFAULT '0',
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `updated_by` int NOT NULL DEFAULT '0',
    PRIMARY KEY (`fee_id`),
    KEY `idx_company_id` (`company_id`),
    KEY `idx_bill_date` (`bill_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
```

---

### 4.2 代码层改动

#### 改动点 4: 新增 DB Repository

**文件: `app/Modules/DB/APP/Repositories/ShipsageReturnConditionFeeRepository.php`**

```php
<?php

namespace App\Modules\DB\APP\Repositories;

use App\Foundation\Enum\DBConnections;
use App\Foundation\Core\BaseRepository;

class ShipsageReturnConditionFeeRepository extends BaseRepository
{
    public function __construct()
    {
        parent::__construct();

        $this->connection = DBConnections::APP;

        $this->table = 'app_shipsage_return_condition_fee';
        $this->itemId = 'fee_id';

        $this->createdAt = 'created_at';
        $this->createdBy = 'created_by';
        $this->updatedAt = 'updated_at';
        $this->updatedBy = 'updated_by';

        $this->dateFormat = 'Y-m-d H:i:s';

        $this->hasCompanyColumn = false;
        $this->hasDeletedColumn = true;
    }
}
```

**文件: `app/Modules/DB/APP/Repositories/ShipsageBalanceGaylordTransferFeeRepository.php`**

```php
<?php

namespace App\Modules\DB\APP\Repositories;

use App\Foundation\Enum\DBConnections;
use App\Foundation\Core\BaseRepository;

class ShipsageBalanceGaylordTransferFeeRepository extends BaseRepository
{
    public function __construct()
    {
        parent::__construct();

        $this->connection = DBConnections::APP;

        $this->table = 'app_shipsage_balance_gaylord_transfer_fee';
        $this->itemId = 'fee_id';

        $this->createdAt = 'created_at';
        $this->createdBy = 'created_by';
        $this->updatedAt = 'updated_at';
        $this->updatedBy = 'updated_by';

        $this->dateFormat = 'Y-m-d H:i:s';

        $this->hasCompanyColumn = true;
        $this->hasDeletedColumn = true;
    }
}
```

#### 改动点 5: 修改 OMS ReturnFeesRepository（核心改动）

**文件: `app/Modules/Application/ShipSage/OMS/Repositories/Fees/ReturnFeesRepository.php`**

**改动1: 新增 API 端点**

```php
public function store()
{
    switch ($this->getRequest()->input('api')) {
        // ... 现有端点 ...

        // 新增 V3 计费（支持 condition_id）
        case 'store.by-calc-return-fees-v3':
            $item = $this->storeByCalcReturnFeesV3();
            break;

        // 新增 Gaylord Transfer 计费
        case 'store.by-calc-gaylord-transfer-fee':
            $item = $this->storeByCalcGaylordTransferFee();
            break;

        // 新增 Unclaimed 逾期计费
        case 'store.by-calc-unclaimed-overdue-fee':
            $item = $this->storeByCalcUnclaimedOverdueFee();
            break;
    }
}
```

**改动2: `storeByCalcReturnFeesV3` 方法实现（核心逻辑）**

```php
/**
 * V3 计费: 支持 condition_id + put_away_qty + return_level_id
 */
public function storeByCalcReturnFeesV3()
{
    list($this->company, $this->serviceId, $this->quoteModeId) = $this->checkAndGetCompanyAndServiceIdAndQuoteModeId();

    $this->initGlobalParams();
    $this->initQuotes();

    // ========== 改动1: 读取退件状态费用配置 ==========
    $conditionFees = $this->rs(
        'APP/ShipsageReturnConditionFee',
        'index',
        [
            'api' => 'index.by-default',
            'quote_mode_id' => $this->quoteModeId,
            'qb' => function($qb) {
                $qb->where('start_date', '<=', $this->endDateTime);
                $qb->where('end_date', '>=', $this->startDateTime);
            }
        ],
        true
    )->groupBy('condition_id');

    // ========== 改动2: 读取公司退件级别配置 ==========
    $companyReturnConfig = $this->rs(
        'APP/SystemCompanyReturn',
        'index',
        [
            'api' => 'index.by-default',
            'company_id' => $this->company->get('company_id'),
        ],
        true
    );

    // ========== 改动3: 读取 app_wms_return_put_away 数据 ==========
    $putAwayData = $this->rs(
        'APP/WmsReturnPutAway',
        'index',
        [
            'api' => 'index.by-default',
            'qb' => function($qb) {
                $qb->whereIn('return_id', $returnIds);
            }
        ],
        true
    )->groupBy('return_id');

    $this->initBalanceLog('Return Fees', 'Subtract', 'Return Fees V3');

    for ($page = 1; $page > 0; ++$page) {
        // ... 获取 returns 数据 ...

        // ========== 改动4: 优化计费条件 - 增加 REJECTED ==========
        $qb->whereIn('return_status_id', [ReturnStatus::VERIFIED, ReturnStatus::PROCESSED]);
        $qb->whereIn('claim_status_id', [
            ReturnClaimStatus::NO_NEED,
            ReturnClaimStatus::APPROVED,
            ReturnClaimStatus::REJECTED  // ← 新增: 拒绝的索赔也应计费
        ]);

        // ========== 改动5: 获取退件明细时增加 condition_id ==========
        $returnDetails = $this->rs('APP/OmsReturnDetail', 'index', [
            'api' => 'index.by-default',
            'company_id' => false,
            'qb' => function($qb) use ($returns) {
                $qb->whereIn('return_id', $returns->pluck('return_id')->unique()->toArray());
            },
            'select' => [
                'return_detail_id',
                'customer_sku',
                'fnsku',
                'catalog_id AS product_id',
                'sku',
                'return_id',
                'verify_qty',
                'condition_id'  // ← 新增
            ],
        ], true);

        foreach ($returns as $return) {
            $return = collect($return);
            $actionDate = $return->get('updated_at');

            // ========== 改动6: 根据退件级别获取对应费率 ==========
            $returnLevelId = collect($companyReturnConfig->first())->get('return_level_id', 1);
            $currentQuotes = $this->getQuotesByReturnLevel($returnLevelId, $actionDate);

            $returnId = $return->get('return_id');
            $currentReturnDetails = $returnDetails->where('return_id', $returnId);

            // ========== 改动7: 使用 put_away_qty 替代 verify_qty ==========
            $putAwayInfo = collect($putAwayData->get($returnId));
            $skuQty = $putAwayInfo->get('qty', $currentReturnDetails->sum('verify_qty')) ?: 0;

            // ========== 改动8: 按退件来源和状态获取费率 ==========
            $quoteIndexPrefix = $this->getQuoteIndexPrefixByReturnFromId($return->get('return_from_id'));
            $skuQuote = collect($currentQuotes->get($quoteIndexPrefix.'return_sku'))->get('quote', 0);
            $packageQuote = collect($currentQuotes->get($quoteIndexPrefix.'return_package'))->get('quote', 0);

            // ========== 改动9: 新增 Condition 附加费计算 ==========
            $conditionSurchargeFee = 0;
            $labelFee = 0;
            $disposalFee = 0;

            foreach ($currentReturnDetails as $detail) {
                $detail = collect($detail);
                $conditionId = $detail->get('condition_id', 1);
                $detailQty = $putAwayInfo->get('qty', $detail->get('verify_qty'));

                // 读取 condition 附加费
                $conditionItemFees = collect($conditionFees->get($conditionId));

                // Condition Surcharge (状态附加费)
                $conditionSurcharge = collect($conditionItemFees->where('fee_type', 'condition_surcharge')->first());
                if ($conditionSurcharge->get('fee_amount')) {
                    $conditionSurchargeFee += $conditionSurcharge->get('fee_amount') * $detailQty;
                }

                // Label Fee (标签费 - Quarantine/Store/Disposal)
                $labelFeeItem = collect($conditionItemFees->where('fee_type', 'label_fee')->first());
                if ($labelFeeItem->get('fee_amount')) {
                    $labelFee += $labelFeeItem->get('fee_amount');
                }

                // Disposal Fee (报废费)
                $disposalFeeItem = collect($conditionItemFees->where('fee_type', 'disposal_fee')->first());
                if ($conditionId == 4 && $disposalFeeItem->get('fee_amount')) {  // Disposal
                    $disposalFee += $disposalFeeItem->get('fee_amount') * $detailQty;
                }
            }

            // ========== 改动10: Gaylord 存储费 ==========
            $storageFee = 0;
            if ($putAwayInfo->get('scanned_gaylord_id')) {
                $storageFee = collect($currentQuotes->get('gaylord_storage_fee'))->get('quote', 0);
            }

            // ========== 改动11: 组装费用明细 ==========
            $packageAmount = $this->round(abs($packageQuote * 1) * -1, 2);
            $itemsAmount = $this->round(abs($skuQty * $skuQuote) * -1, 2);
            $conditionSurchargeAmount = $this->round($conditionSurchargeFee * -1, 2);
            $labelFeeAmount = $this->round($labelFee * -1, 2);
            $storageFeeAmount = $this->round($storageFee * -1, 2);
            $disposalFeeAmount = $this->round($disposalFee * -1, 2);
            $totalAmount = $this->round(
                bcadd($packageAmount, $itemsAmount, 2) +
                bcadd($conditionSurchargeAmount, $labelFeeAmount, 2) +
                bcadd($storageFeeAmount, $disposalFeeAmount, 2),
                2
            );

            // ========== 改动12: 增强 fees_detail 结构 ==========
            $feesDetail = [
                'package_amount'       => $packageAmount,
                'items_amount'         => $itemsAmount,
                'condition_id'         => $conditionId,
                'condition_surcharge'  => $conditionSurchargeAmount,
                'label_fee'            => $labelFeeAmount,
                'storage_fee'          => $storageFeeAmount,
                'disposal_fee'         => $disposalFeeAmount,
                'return_level_id'      => $returnLevelId,
                'put_away_qty'         => $skuQty,
                'platform'             => '',
                'store'                => '',
            ];

            $skuReturnFees[] = [
                'company_id'           => $this->company->get('company_id'),
                'balance_log_id'       => $this->logId,
                'quote_mode_id'        => $this->quoteModeId,
                'fee_version_id'       => $this->currentVersionId,
                'type'                 => $this->getReturnTypeByReturnFromId($return->get('return_from_id')),
                'action_date'          => $actionDate,
                'tracking_number'      => $return->get('tracking_number'),
                'warehouse_id'         => $wmsWarehouses->where('warehouse_id', $return->get('warehouse_id'))->first()->erp_id ?? 0,
                'return_id'            => $returnId,
                'amount'               => $totalAmount,
                'sku_qty'              => $skuQty,
                'sku_quote'            => $skuQuote,
                'package_qty'          => 1,
                'package_quote'        => $packageQuote,
                'condition_id'         => $conditionId,
                'return_level_id'      => $returnLevelId,
                'put_away_id'          => $putAwayInfo->get('put_away_id'),
                'put_away_qty'         => $skuQty,
                'label_fee'            => $labelFeeAmount,
                'condition_surcharge'  => $conditionSurchargeAmount,
                'storage_fee'          => $storageFeeAmount,
                'disposal_fee'         => $disposalFeeAmount,
                'fees_detail'          => json_encode($feesDetail, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
            ];
        }

        // 保存逻辑...
        $this->rs('APP/ShipsageBalanceDetail', 'store', [...]);
        $this->rs('APP/ShipsageReturnFee', 'store', [...]);
        $this->rs('ERP/Charge', 'store', [...]);
    }

    return $this->storeBalanceLog();
}
```

**改动3: 新增 Gaylord Transfer 计费方法**

```php
/**
 * Gaylord 转移计费
 */
public function storeByCalcGaylordTransferFee()
{
    // 读取未计费的 gaylord transfer 记录
    $transfers = $this->rs('APP/WmsGaylordTransfer', 'index', [
        'api' => 'index.by-unbilled',
        'transfer_type' => 'return',  // 仅退件箱转移
        'bill_date' => date('Y-m-d'),
    ], true);

    foreach ($transfers as $transfer) {
        $transfer = collect($transfer);

        // 读取费率配置
        $transferFee = collect($this->quotes->get('gaylord_transfer_fee'))->get('quote', 0);

        // Gaylord 存储时间超过 N 天加收逾期费
        $createdAt = $transfer->get('created_at');
        $days = (strtotime(date('Y-m-d')) - strtotime($createdAt)) / 86400;
        $overdueFee = 0;
        if ($days > 30) {
            $overdueFee = collect($this->quotes->get('gaylord_overdue_storage_fee'))->get('quote', 0) * $days;
        }

        $totalFee = $transferFee + $overdueFee;

        $this->rs('APP/ShipsageBalanceGaylordTransferFee', 'store', [
            'api' => 'store.by-default',
            'data' => [
                'gaylord_barcode' => $transfer->get('gaylord_barcode'),
                'transfer_type' => $transfer->get('transfer_type'),
                'source_location_id' => $transfer->get('source_location_id'),
                'target_location_id' => $transfer->get('target_location_id'),
                'source_gaylord_id' => $transfer->get('source_gaylord_id'),
                'target_gaylord_id' => $transfer->get('target_gaylord_id'),
                'fee_amount' => $totalFee,
                'bill_date' => date('Y-m-d'),
                'company_id' => $transfer->get('company_id'),
                'quote_mode_id' => $this->quoteModeId,
                'balance_log_id' => $this->logId,
                'comments' => json_encode([
                    'transfer_fee' => $transferFee,
                    'overdue_fee' => $overdueFee,
                    'days' => $days,
                ]),
            ]
        ]);
    }
}
```

**改动4: 新增 Unclaimed 逾期计费方法**

```php
/**
 * Unclaimed 逾期计费
 * 触发条件: 退件保留超过3天未认领
 */
public function storeByCalcUnclaimedOverdueFee()
{
    // 读取 3 天前的 Unclaimed 退件
    $unclaimedReturns = $this->rs('APP/OmsReturn', 'index', [
        'api' => 'index.by-unclaimed-overdue',
        'overdue_days' => 3,
    ], true);

    foreach ($unclaimedReturns as $return) {
        $return = collect($return);
        $days = (strtotime(date('Y-m-d')) - strtotime($return->get('actual_finish_time'))) / 86400;

        // 逾期存储费: $0.1/天/件
        $overdueFeePerDay = collect($this->quotes->get('unclaimed_overdue_fee'))->get('quote', 0.1);
        $returnDetails = $this->rs('APP/OmsReturnDetail', 'index', [...]);
        $totalQty = $returnDetails->sum('verify_qty');

        $overdueAmount = $overdueFeePerDay * $days * $totalQty;

        // 记录计费
        $this->rs('APP/ShipsageReturnFee', 'store', [
            'api' => 'store.by-default',
            'data' => [[
                'type' => 'Unclaimed Overdue',
                'action_date' => date('Y-m-d'),
                'amount' => $overdueAmount * -1,
                'comments' => json_encode([
                    'overdue_days' => $days,
                    'fee_per_day' => $overdueFeePerDay,
                    'total_qty' => $totalQty,
                ]),
            ]]
        ]);
    }
}
```

#### 改动点 6: 修改 WMS 4PL ReturnFeeRepository

**文件: `app/Modules/Application/ShipSage/WMS/Repositories/PL4/ReturnFeeRepository.php`**

```php
// 改动1: 第179-180行 - 使用 put_away_qty
// 原来:
$skuQty = $currentReturnDetails->sum('verify_qty') ?: 0;

// 改为:
$putAwayInfo = collect($putAwayData->get($returnId));
$skuQty = $putAwayInfo->get('qty', $currentReturnDetails->sum('verify_qty')) ?: 0;

// 改动2: 新增 Condition 附加费
$conditionId = collect($currentReturnDetails->first())->get('condition_id', 1);
$conditionFee = $this->getConditionFee($conditionId, 'condition_surcharge', $skuQty);
$labelFee = $this->getConditionFee($conditionId, 'label_fee', 1);
$disposalFee = ($conditionId == 4) ? $this->getConditionFee($conditionId, 'disposal_fee', $skuQty) : 0;

$feesDetail = [
    'items_amount'         => $itemsAmount,
    'package_amount'       => $packageAmount,
    'photo_amount'         => $photeAmount,
    'condition_id'         => $conditionId,
    'condition_surcharge'  => $conditionFee,
    'label_fee'            => $labelFee,
    'disposal_fee'         => $disposalFee,
    'put_away_qty'         => $skuQty,
];
```

#### 改动点 7: 新增计费配置 Service

**文件: `app/Modules/Application/ShipSage/OMS/Services/ReturnFeeConfigService.php`**

```php
<?php

namespace App\Modules\Application\ShipSage\OMS\Services;

use App\Foundation\Core\BaseService;

class ReturnFeeConfigService extends BaseService
{
    /**
     * 按退件级别获取费率
     */
    public function getQuotesByReturnLevel($returnLevelId, $actionDate)
    {
        // Level 1 (Simple): 基础费率
        // Level 2 (Standard): 标准费率 × 1.1
        // Level 3 (Regular): 高级费率 × 1.2

        $levelMultipliers = [
            1 => 1.0,   // Simple
            2 => 1.1,   // Standard
            3 => 1.2,   // Regular
        ];

        $multiplier = $levelMultipliers[$returnLevelId] ?? 1.0;

        return $this->quotes->map(function($quote) use ($multiplier) {
            $quote->quote = round($quote->quote * $multiplier, 4);
            return $quote;
        });
    }

    /**
     * 获取退件状态附加费
     */
    public function getConditionFee($conditionId, $feeType, $qty)
    {
        $fee = $this->rs('APP/ShipsageReturnConditionFee', 'index', [
            'api' => 'index.by-default',
            'condition_id' => $conditionId,
            'fee_type' => $feeType,
        ], true)->first();

        if (!$fee) return 0;

        $fee = collect($fee);
        $unit = $fee->get('unit', 'per_unit');

        return match($unit) {
            'per_qty' => $fee->get('fee_amount') * $qty,
            'per_unit' => $fee->get('fee_amount'),
            'per_gaylord' => $fee->get('fee_amount'),
            'per_day' => $fee->get('fee_amount') * $qty,
            default => $fee->get('fee_amount')
        };
    }
}
```

---

## 五、Quote 配置新增字段

### 5.1 Quote Index 新增项

| Index Key | 类型 | 说明 | OMS | WMS 4PL |
|-----------|------|------|-----|---------|
| `buyer_return_sku` | 价格 | 买家退件 SKU 费率 | ✅ | - |
| `fba_return_sku` | 价格 | FBA 退件 SKU 费率 | ✅ | - |
| `3rd_return_sku` | 价格 | 第三方退件 SKU 费率 | ✅ | - |
| `buyer_return_package` | 价格 | 买家退件包裹费率 | ✅ | - |
| `fba_return_package` | 价格 | FBA 退件包裹费率 | ✅ | - |
| `3rd_return_package` | 价格 | 第三方退件包裹费率 | ✅ | - |
| `condition_surcharge_new` | 价格 | 新品附加费 | 🆕 需新增 | 🆕 需新增 |
| `condition_surcharge_quarantine` | 价格 | 隔离附加费 | 🆕 需新增 | 🆕 需新增 |
| `condition_surcharge_store` | 价格 | 存储附加费 | 🆕 需新增 | 🆕 需新增 |
| `condition_surcharge_disposal` | 价格 | 报废附加费 | 🆕 需新增 | 🆕 需新增 |
| `condition_label_quarantine` | 价格 | 隔离标签费 | 🆕 需新增 | 🆕 需新增 |
| `condition_label_store` | 价格 | 存储标签费 | 🆕 需新增 | 🆕 需新增 |
| `condition_label_disposal` | 价格 | 报废标签费 | 🆕 需新增 | 🆕 需新增 |
| `disposal_fee` | 价格 | 报废处理费 | 🆕 需新增 | 🆕 需新增 |
| `gaylord_storage_fee` | 价格 | Gaylord 存储费 | 🆕 需新增 | 🆕 需新增 |
| `gaylord_transfer_fee` | 价格 | Gaylord 转移费 | 🆕 需新增 | 🆕 需新增 |
| `gaylord_overdue_storage_fee` | 价格 | Gaylord 逾期存储费 | 🆕 需新增 | 🆕 需新增 |
| `unclaimed_overdue_fee` | 价格 | Unclaimed 逾期费/天/件 | 🆕 需新增 | 🆕 需新增 |

---

## 六、实施优先级与工作量评估

### P0 - 核心计费逻辑修复（立即上线）

| # | 改动点 | 涉及文件 | 工作量 | 影响范围 |
|---|--------|----------|--------|---------|
| 1 | `claim_status_id` 增加 REJECTED(5) | OMS `ReturnFeesRepository.php` | 0.5h | 计费不完整 |
| 2 | 使用 `put_away_qty` 替代 `verify_qty` | OMS + WMS `ReturnFeeRepository.php` | 2h | 计费数量不准确 |
| 3 | 修复 `app_oms_return_detail.condition_id` 字段读取 | OMS `ReturnFeesRepository.php` | 1h | 需确认字段存在性 |

### P1 - 新增 Condition 计费（下一迭代）

| # | 改动点 | 涉及文件 | 工作量 | 影响范围 |
|---|--------|----------|--------|---------|
| 4 | 新建 `app_shipsage_return_condition_fee` 表 | DB Migration | 2h | 新功能 |
| 5 | 新建 `ShipsageReturnConditionFeeRepository` | DB Layer | 1h | 新功能 |
| 6 | 新建 `storeByCalcReturnFeesV3` 方法 | OMS `ReturnFeesRepository.php` | 8h | 新功能 |
| 7 | `fees_detail` 结构增强 | OMS `ReturnFeesRepository.php` | 2h | 新功能 |
| 8 | 修改 `app_shipsage_balance_return_fees` 表 | DB Migration | 1h | 新功能 |
| 9 | WMS 4PL Condition 计费支持 | WMS `ReturnFeeRepository.php` | 4h | 新功能 |

### P2 - 扩展计费场景（下季度）

| # | 改动点 | 涉及文件 | 工作量 | 影响范围 |
|---|--------|----------|--------|---------|
| 10 | Gaylord Transfer 计费 | 新增 Repository + Service | 6h | 新功能 |
| 11 | Disposal 处理计费 | OMS `ReturnFeesRepository.php` | 4h | 新功能 |
| 12 | Unclaimed 逾期计费 | OMS `ReturnFeesRepository.php` | 4h | 新功能 |
| 13 | Return Level 差异化费率 | OMS `ReturnFeesRepository.php` | 4h | 新功能 |

### P3 - 报表与前端（后续迭代）

| # | 改动点 | 工作量 |
|---|--------|--------|
| 14 | Return Fee 报表增强（按 condition_id 分组） | 4h |
| 15 | Return Fee 报表增强（按 return_level_id 分组） | 4h |
| 16 | 前端退件配置页面（Admin） | 8h |
| 17 | 前端 Gaylord 库存页面 | 8h |

---

## 七、总结

### 7.1 核心改动点总结

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         Return V2.0 计费改动总结                            │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  【数据层改动】                                                             │
│  1. 新建 app_shipsage_return_condition_fee 表 (Condition 费用映射)          │
│  2. 修改 app_shipsage_balance_return_fees 表 (新增 condition_id, put_away_ │
│     qty, label_fee, storage_fee, disposal_fee 等字段)                       │
│  3. 新建 app_shipsage_balance_gaylord_transfer_fee 表 (箱体转移费用)        │
│                                                                            │
│  【代码层改动 - OMS】                                                       │
│  4. ReturnFeesRepository::storeByCalcReturnFeesV3 (新增)                   │
│     - 支持 condition_id 差异化计费                                         │
│     - 支持 put_away_qty 替代 verify_qty                                   │
│     - 支持 return_level_id 差异化费率                                       │
│     - 支持 Label 费 / Storage 费 / Disposal 费                            │
│  5. ReturnFeesRepository::storeByCalcGaylordTransferFee (新增)             │
│  6. ReturnFeesRepository::storeByCalcUnclaimedOverdueFee (新增)             │
│  7. claim_status_id 条件增加 REJECTED(5)                                   │
│                                                                            │
│  【代码层改动 - WMS 4PL】                                                   │
│  8. ReturnFeeRepository::storeByCalcReturnFeeV1 增强                       │
│     - 支持 condition_id 差异化计费                                         │
│     - 支持 put_away_qty                                                   │
│     - 支持 Label 费 / Disposal 费                                         │
│                                                                            │
│  【配置层改动】                                                             │
│  9. Quote Mode 新增 condition_surcharge_* 系列字段                         │
│  10. Quote Mode 新增 label_fee / storage_fee / disposal_fee 系列字段        │
│  11. Quote Mode 新增 gaylord_transfer_fee / overdue_fee 系列字段           │
│                                                                            │
│  【报表层改动】                                                             │
│  12. Return Fee Export 增加 condition_id / put_away_qty / label_fee 等列   │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 关键设计决策

| 决策点 | 方案A（推荐） | 方案B | 推荐理由 |
|--------|-------------|-------|---------|
| **Condition 费率存储** | 独立表 `app_shipsage_return_condition_fee` | 在 Quote Mode 中增加索引 | 推荐A：更灵活，支持细粒度配置 |
| **计费数量** | 优先 `put_away_qty`，fallback `verify_qty` | 仅 `verify_qty` | 推荐A：更准确反映实际上架量 |
| **Label 费计费时机** | 按 condition_id 判断是否计费 | 全部计费 | 推荐A：Unclaimed 不需要标签 |
| **Gaylord 存储费** | 按箱体计费 | 按件数计费 | 推荐A：更符合 Gaylord 业务逻辑 |
| **Disposal 计费时机** | 在 Put Away 时计费 | 在 Disposal 处理时计费 | 推荐B：确保退件状态确定后再计费 |
