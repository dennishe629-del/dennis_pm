---
name: "4pl-warehouse-quote-import"
description: "Generates warehouse quote import files for 4PL (Fourth Party Logistics) billing. Invoke when user needs to import 4PL warehouse operation fees including receiving, handling, return, storage, and miscellaneous fees into app_wms_4pl_billing_warehouse_quote table."
---

# 4PL Warehouse Quote Import Generator

This skill handles the generation of 4PL warehouse quote import files from quote Excel sheets. It supports importing warehouse operation fees for receiving, handling, return, storage, and miscellaneous services.

## When to Use

Invoke this skill when:
- User needs to generate 4PL warehouse quote import files
- User mentions importing warehouse fees for 4PL billing
- User needs to process warehouse operation fee quotes (入库费, 操作费, 退货费, 仓储费, 杂费)
- User asks to create import files for app_wms_4pl_billing_warehouse_quote table

## Prerequisites

Before using this skill, ensure:
1. Warehouse IDs exist in GT_Warehouse table (e.g., SG-SAV2=19107, SG-IAH4=19108)
2. Fee version configuration exists in app_wms_4pl_billing_fee_version table
3. Reference warehouse quotes exist in app_wms_4pl_billing_warehouse_quote table for name/index/unit matching

## Workflow Overview

### Phase 1: Quote File Structure Analysis

1. **Read 4PL quote Excel file** from user-provided path
2. **Identify the five sections** in the quote file:
   - **Section 1**: 入库和转运 (Receiving) - service_id: 3002
   - **Section 2**: 操作费 (Handling) - service_id: 3006
   - **Section 3**: 退货费 (Return) - service_id: 3001
   - **Section 4**: 仓储费 (Storage) - service_id: 3000
   - **Section 5**: 杂费 (Misc) - service_id: 3005

3. **Extract data from each section**:

   #### Section 1: 入库和转运 (Receiving) - 11 items per warehouse
   | 货型 (Cargo Type) | 单位 (Unit) | 价格 (Price) |
   |------------------|------------|-------------|
   | 托盘 | CBM | 6.5 |
   | 散货 | 箱 | 1 |
   | SKU分拣费 | sku | 5 |
   | 20GP | container | 230 |
   | 40GP | container | 300 |
   | 40HQ | container | 300 |
   | 45HQ | container | 300 |
   | 53 Container | container | 350 |
   | 贴/换标签 | label | 0.48 |
   | 转运打托 | pallet | 15 |
   | 出库转运操作费 | shipment | 10 |

   #### Section 2: 操作费 (Handling) - 10 items per warehouse
   | 货型 (Cargo Type) | 价格 (Price) |
   |------------------|-------------|
   | Pick & Pack 0-1.1lb | 0.42 |
   | Pick & Pack 1.1-2.2lb | 0.42 |
   | Pick & Pack 2.2-4.41lb | 0.42 |
   | Pick & Pack 4.41-11.02lb | 0.8 |
   | Pick & Pack 11.02-22.04lb | 1.2 |
   | Pick & Pack 22.04-44.09lb | 1.7 |
   | Pick & Pack 44.09-66.13lb | 2.1 |
   | Pick & Pack 66.13-88.18lb | 2.5 |
   | Pick & Pack 88.18-110.23lb | 3.5 |
   | Pick & Pack 110.23-132.28lb | 4 |

   #### Section 3: 退货费 (Return) - 6 items per warehouse
   | 货型 (Cargo Type) | 单位 (Unit) | 价格 (Price) |
   |------------------|------------|-------------|
   | 入库托盘 | CBM | 6.5 |
   | 散货 | 箱 | 1.2 |
   | 更换标签费 | label | 0.48 |
   | 清点费 | pcs | 0.3 |
   | 转运打托 | pallet | 15 |
   | 出库转运操作费 | shipment | 10 |

   #### Section 4: 仓储费 (Storage) - 7 items per warehouse
   | 货型 (Cargo Type) | 单位 (Unit) | 价格 (Price) |
   |------------------|------------|-------------|
   | 0-30天 | CBM per day | 0 |
   | 31-60天 | CBM per day | 0.4 |
   | 61-90天 | CBM per day | 0.48 |
   | 91-120天 | CBM per day | 0.55 |
   | 121-180天 | CBM per day | 0.65 |
   | 181-365天 | CBM per day | 0.8 |
   | 365+天 | CBM per day | 1 |

   #### Section 5: 杂费 (Misc) - 14 items per warehouse
   | 货型 (Cargo Type) | 单位 (Unit) | 价格 (Price) |
   |------------------|------------|-------------|
   | 贴标服务 | package | 0.48 |
   | 工时费 | hour | 30 |
   | 库内销毁费 | kg | 0.3 |
   | 拍照 | photo | 0.48 |
   | 复尺 | sku | 4.5 |
   | SKU尺寸重量有误 | sku | 4.5 |
   | 库存盘点 | item | 0.12 |
   | 库内订单拦截 | shipment | 2 |
   | 托盘耗损费用 | pallet | 0 |
   | SFP | order | 1 |
   | 混箱 | sku | 5 |
   | 拆托 | pallet | 8 |
   | 快递袋 | bag | 0.5 |
   | 一票多件合并打包 | order | 0 |

### Phase 2: Database Reference Lookup

4. **Query existing warehouse quotes** from reference warehouses:
   ```sql
   SELECT * FROM app_wms_4pl_billing_warehouse_quote 
   WHERE warehouse_id IN (112, 113, 114, 116, 117, 118, 119, 120, 131)
   AND deleted = 0
   ```

5. **Match cargo types to database records**:
   - **Receiving (3002)**:
     - 托盘 → name containing 'cbm' or unit containing 'CBM'
     - 散货 → name containing 'carton'
     - 20GP/40GP/40HQ/45HQ/53 Container → name containing container size + 'Palletized'
     - SKU分拣费 → name containing 'sku'
     - 贴/换标签 → name containing 'label'
     - 转运打托 → name containing 'palletiz'
     - 出库转运操作费 → name containing 'outbound'
   
   - **Handling (3006)**:
     - All pick & pack items → name containing 'pick'
   
   - **Return (3001)**:
     - 入库托盘 → name containing 'pallet'
     - 散货 → name containing 'package'
     - 更换标签费 → name containing 'label'
     - 清点费 → name containing 'item'
     - 转运打托 → name containing 'palletiz'
     - 出库转运操作费 → name containing 'outbound'
   
   - **Storage (3000)**:
     - All storage items → name containing 'storage'
   
   - **Misc (3005)**:
     - 贴标服务 → name containing 'label'
     - 工时费 → name containing 'labor'
     - 库内销毁费 → name containing 'destroy'
     - 拍照 → name containing 'photo'
     - 复尺 → name containing 'remeasure'
     - 库存盘点 → name containing 'inventory'
     - 库内订单拦截 → name containing 'intercept'
     - SFP → name containing 'sfp'
     - 快递袋 → name containing 'bag'

### Phase 3: Import Data Generation

6. **Generate import records** for each warehouse:
   - For each warehouse (SG-SAV2: 19107, SG-IAH4: 19108)
   - For each of the 48 items (11+10+6+7+14)
   - Match to database reference or use default values

7. **Record structure**:
   - `service_quote_vip_id`: Empty (auto-increment)
   - `company_id`: 1
   - `warehouse_id`: 19107 or 19108
   - `service_id`: 3000, 3001, 3002, 3005, or 3006
   - `name`: From DB match or cargo type
   - `index`: From DB match or 'standard'
   - `quote`: Price from quote file
   - `unit`: From DB match or default based on service_id
   - `start_date`: User-provided or current time
   - `end_date`: 2099-12-31 23:59:59
   - `hidden`: 0
   - `disabled`: 0
   - `deleted`: 0

### Phase 4: File Generation

8. **Generate Excel import file**:
   - Filename: `4PL仓库报价导入模板_[仓库代码].xlsx`
   - Sheet name: `warehouse_quote_import`
   - Columns: All table fields + 备注 column

9. **Generate SQL import file**:
   - Filename: `4PL仓库报价导入_[仓库代码].sql`
   - Include INSERT statements for all records
   - Include verification SQL at the end

## Service ID Mapping

| 费用类型 | service_id | 表名 |
|---------|-----------|------|
| 仓储费 (Storage) | 3000 | app_shipsage_fee_version (fee_version_id: 1005) |
| 退货费 (Return) | 3001 | app_shipsage_fee_version (fee_version_id: 1001) |
| 到货费 (Receiving) | 3002 | app_shipsage_fee_version (fee_version_id: 1002) |
| 增值服务费 (Misc) | 3005 | app_shipsage_fee_version (fee_version_id: 1008) |
| 操作费 (Handling) | 3006 | app_shipsage_fee_version (fee_version_id: 1006) |

## Default Units by Service ID

| service_id | Default Unit |
|-----------|-------------|
| 3000 | per CBM per day |
| 3001 | per package |
| 3002 | per CBM |
| 3005 | per package |
| 3006 | per unit |

## File Naming Convention

- Excel import template: `4PL仓库报价导入模板_[仓库代码].xlsx`
- SQL import file: `4PL仓库报价导入_[仓库代码].sql`

## Important Notes

- Always verify warehouse IDs exist in GT_Warehouse table before generating import files
- For items not found in reference DB, use cargo type as name and 'standard' as index
- Date format must be `yyyy-MM-dd HH:mm:ss`
- End date should be set to `2099-12-31 23:59:59` for long-term validity
- Each warehouse generates 48 records total (11 receiving + 10 handling + 6 return + 7 storage + 14 misc)

## Common Issues and Solutions

### Issue 1: Missing warehouse ID
- **Symptom**: Cannot find warehouse_id for warehouse code
- **Cause**: Warehouse not created in GT_Warehouse table
- **Solution**: Create warehouse in GT_Warehouse first, get the warehouse_id

### Issue 2: No matching reference in DB
- **Symptom**: Cannot find matching name/index/unit from reference warehouses
- **Cause**: New cargo type not existing in reference data
- **Solution**: Use cargo type as name, 'standard' as index, and service-appropriate unit

### Issue 3: Duplicate records
- **Symptom**: Import fails due to duplicate key
- **Cause**: Records already exist for the warehouse
- **Solution**: Check existing records first, update if needed instead of insert

## Example Usage

```javascript
// Example: Generate import files for SG-SAV2 and SG-IAH4
const warehouses = [
  { code: 'SG-SAV2', id: 19107 },
  { code: 'SG-IAH4', id: 19108 }
];

// Extract 48 items per warehouse from quote file
// Match to DB references
// Generate Excel and SQL files
```

## Verification SQL

After import, verify data with:
```sql
SELECT 
    warehouse_id, 
    service_id, 
    name, 
    `index`, 
    quote, 
    unit
FROM app_wms_4pl_billing_warehouse_quote 
WHERE warehouse_id IN (19107, 19108) 
AND deleted = 0
ORDER BY warehouse_id, service_id, name;
```
