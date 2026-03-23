---
name: "fee-import-generator"
description: "Generates shipping fee and surcharge import files from quote sheets. Invoke when user needs to create fee import files for Gaatu (company_id=1) or standard version quotes, or when processing quote data for database import."
---

# Fee Import Generator

This skill handles the generation of shipping fee and surcharge import files from quote sheets. It supports both Gaatu-specific quotes (company_id=1) and standard version quotes.

## When to Use

Invoke this skill when:
- User needs to generate shipping fee import files from quote Excel files
- User needs to generate surcharge import files from quote data
- User mentions processing quote data for database import
- User asks to create fee import files for Gaatu or standard versions

## Workflow Overview

### Phase 0: Version Selection

0. **Ask user for version type**:
    - Ask user: "请选择报价版本：1) US 版本 2) CN 版本"
    - For US version: Use fee_version_id 87-90
    - For CN version: Use fee_version_id 62-67
    - For Gaatu version: Skip fee_version lookup, use company_id=1

### Phase 1: Service ID Lookup

1. **Query service groups** from `app_shipsage_service_group` table
2. **Match sheet names** to group names:
   - For Gaatu quotes: Match to Gaatu-specific groups (e.g., "Amazon Shipping" → "Amazon Shipping-WarehouseBase")
   - For standard quotes: Match to standard groups
3. **Get service_id** based on customer type:
   - **Gaatu (company_id=1)**: Query `app_shipsage_service_config_company` table
   - **Standard version**: Query `app_shipsage_service_config_template` table with fee_version_id
   - Use `GROUP BY service_id, fee_version_id` to deduplicate (same service_id may appear multiple times for different service_codes)
4. **Verify time validity**: Ensure query time is within start_date and end_date range

### Phase 2: Excel Structure Analysis

5. **Read quote sheet** from source Excel file
6. **Identify layout pattern** before extraction - always preview first 5 rows with `sheet_to_json(ws, {header:1})`:
   - **Single-table layout**: One version per sheet, weight in one column, zones across columns
   - **Multi-table horizontal layout**: Multiple versions side by side in the same sheet, separated by null columns
     - Example (FedEx Ground "Fedex Groud运费" sheet): 4 versions x 11 columns each
       - colOffset for each version: 0, 11, 22, 33
       - Row 0: carrier/warehouse info header
       - Row 1: version name + column headers (计费重-磅, 计费量-公斤, zone2-zone8)
       - Row 2+: data rows starting from weight=1
       - Within each group: `colOffset+1`=weight(lb), `colOffset+3` to `colOffset+9`=zone2-zone8
7. **Identify data sections**:
   - **Shipping fees**: Two-dimensional table with weight ranges and zones
   - **Surcharges**: Additional fee items section
8. **Extract shipping fee data**:
   - Weight ranges (e.g., 1-150 lbs)
   - Zones (e.g., Zone 2-8)
   - Fee values for each weight-zone combination

### Phase 3: Data Validation

9. **Check existing rates** in database:
   - For Gaatu: `app_shipsage_shipping_fee_rate_company` (company_id=1)
   - For standard: `app_shipsage_shipping_fee_rate`
   - Filter by: service_id AND end_date > current_time AND deleted=0
10. **Validate continuity**:
    - **Weight segments**: Check if all weights from min to max exist
    - **Zones**: Check if all zones from min to max exist
    - **Combinations**: Verify all weight-zone combinations exist
11. **Report gaps** if any:
    - Missing weight segments
    - Missing zones
    - Missing combinations

### Phase 4: Shipping Fee File Generation

12. **Ask user for start date**:
    - Default option: Current time
    - Custom option: User can specify a future date
    - Format: yyyy-MM-dd HH:mm:ss
    - Ask user: "请选择开始时间：1) 当前时间 2) 自定义时间"

13. **Single-file vs multi-file output**:
    - **Default**: Generate ONE file containing all service_ids for the same carrier/sheet
    - Only generate separate files if user explicitly requests per-service_id files
    - All records sorted by service_id, then zone ascending, then weight ascending

14. **Generate shipping fee import file** if data is continuous:
    - **Start date**: User-selected time (format: yyyy-MM-dd HH:mm:ss)
    - **End date**: 2099-12-31 23:59:59
    - **Format**: Match reference file structure

15. **File structure** for shipping fees:
    - **Gaatu version** (company_id=1):
      - `rate_company_id`: Empty string
      - `company_id`: 1
      - `service_id`: From Phase 1 lookup
      - `weight`: From quote sheet
      - `unit`: 'lb'
      - `zone`: From quote sheet
      - `fee`: From quote sheet
      - `start_date`: User-selected time (format: yyyy-MM-dd HH:mm:ss)
      - `end_date`: 2099-12-31 23:59:59 (format: yyyy-MM-dd HH:mm:ss)
    - **Standard version**:
      - `rate_id`: Empty string
      - `service_id`: From Phase 1 lookup
      - `weight`: From quote sheet
      - `unit`: 'lb'
      - `zone`: From quote sheet
      - `fee`: From quote sheet
      - `start_date`: User-selected time (format: yyyy-MM-dd HH:mm:ss)
      - `end_date`: 2099-12-31 23:59:59 (format: yyyy-MM-dd HH:mm:ss)

### Phase 5: Surcharge Import File Generation

16. **Extract surcharge data** from quote sheet:
    - Identify surcharge items (e.g., Non-Standard Extra Length Charge, Additional Handling Charge, etc.)
    - Extract fee values for each zone (Zone2, Zone 3-4, Zone5+)
    - Note: Some surcharges may have commercial/residential variants

17. **Map surcharge items to fee_codes**:
    - Query `app_shipsage_fee_code_condition_desc` table for matching fee_codes
    - Use `condition_desc_cn` to match surcharge descriptions
    - Verify fee_codes exist in standard quote table (`app_shipsage_fee_rate`)
    - Filter by: service_id AND deleted=0

18. **Known Gaatu Amazon Shipping surcharge mappings**:
    - Non-Standard Extra Length Charge:
      - Zone2: NLL-3S2
      - Zone 3-4: NLL-3S3T4
      - Zone5+: NLL-3S5T
    - Additional Handling Charge (Weight > 50 lbs):
      - Zone2: AHW-2
      - Zone 3-4: AHW-3T4
      - Zone5+: AHW-5M
    - Additional Handling Charge (Length > 47 inches, <=96 inches):
      - Zone2: AHL-2
      - Zone 3-4: AHL-3T4
      - Zone5+: AHL-5M
    - Additional Handling Charge (Length + (Width+Height)*2 > 105 inches):
      - Zone2: AHG-2
      - Zone 3-4: AHG-3T4
      - Zone5+: AHG-5M
    - Additional Handling Charge (Irregular Package):
      - Zone2: AHC-2
      - Zone 3-4: AHC-3T4
      - Zone5+: AHC-5M
    - Large Package Surcharge:
      - Zone2 Commercial: LLC-2
      - Zone2 Residential: LLR-2
      - Zone 3-4 Commercial: LLC-3T4
      - Zone 3-4 Residential: LLR-3T4
      - Zone5+ Commercial: LLC-5M
      - Zone5+ Residential: LLR-5M
    - Delivery Area Surcharge:
      - Commercial: RDC
      - Residential: RDR
    - Extended Delivery Area Surcharge:
      - Commercial: LDC
      - Residential: LDR
    - Remote Area Surcharge:
      - Commercial: CAC
      - Residential: CAR

19. **Validate fee_codes**:
    - Ensure all fee_codes exist in `app_shipsage_fee_rate` table for service_id
    - Report missing fee_codes if any
    - For Gaatu quotes: All fee_codes must exist in standard quote table

20. **Generate surcharge import file**:
    - **Start date**: User-selected time (same as shipping fees)
    - **End date**: 2099-12-31 23:59:59
    - **Format**: Match reference file structure

21. **File structure** for surcharges:
    - **Gaatu version** (company_id=1):
      - `rate_company_id`: Empty string
      - `company_id`: 1
      - `service_id`: From Phase 1 lookup
      - `fee_group`: Surcharge category name
      - `fee_code`: Mapped fee_code from database
      - `fee`: Surcharge fee value from quote sheet
      - `start_date`: User-selected time (format: yyyy-MM-dd HH:mm:ss)
      - `end_date`: 2099-12-31 23:59:59 (format: yyyy-MM-dd HH:mm:ss)
    - **Standard version**:
      - `service_id`: From Phase 1 lookup
      - `fee_group`: Surcharge category name
      - `fee_code`: Mapped fee_code from database
      - `fee_code_carrier`: From `app_shipsage_fee_code_condition_desc` table
      - `fee_type`: From `app_shipsage_fee_code_condition_desc` table
      - `commercial`: From `app_shipsage_fee_code_condition_desc` table
      - `residential`: From `app_shipsage_fee_code_condition_desc` table
      - `additional`: From `app_shipsage_fee_code_condition_desc` table
      - `rate_shopping`: From `app_shipsage_fee_code_condition_desc` table
      - `fee`: Surcharge fee value from quote sheet
      - `start_date`: User-selected time (format: yyyy-MM-dd HH:mm:ss)
      - `end_date`: 2099-12-31 23:59:59 (format: yyyy-MM-dd HH:mm:ss)

    **Note**: For standard version, query `app_shipsage_fee_code_condition_desc` with condition: service_id AND fee_code AND deleted=0

## Gaatu vs Standard Version Differences

| Aspect | Gaatu (company_id=1) | Standard Version |
|---------|----------------------|----------------|
| Service config table | `app_shipsage_service_config_company` | `app_shipsage_service_config_template` |
| Shipping rate table | `app_shipsage_shipping_fee_rate_company` | `app_shipsage_shipping_fee_rate` |
| Surcharge rate table | `app_shipsage_fee_rate_company` | `app_shipsage_fee_rate` |
| Query condition | `company_id = 1` | No company_id filter |
| Group naming | Gaatu-specific groups | Standard groups |

## Known Gaatu Service Mappings

- Amazon Shipping -> service_id: 3360 (AMZN_US_106)
- 204FedEx -> service_id: 1611 (FEDEX_GROUND_204)
- 206FedEx -> service_id: 1611 (FEDEX_GROUND_206)
- 212FedEx -> service_id: 1611 (FEDEX_BIG_212)
- UPS Ground -> service_id: 3367 (03_12)

## Known Standard Version Service ID Mappings

### FedEx Ground (service_group_id: 2, sheet: "Fedex Groud运费")

**Excel layout**: 4 versions side by side (multi-table horizontal), each occupying 11 columns
- colOffset per version: S1=0, S2=11, S3=22, OE=33
- Row 0: carrier/warehouse header; Row 1: version name + column headers; Row 2+: data
- Column mapping per group: `colOffset+1`=weight(lb), `colOffset+3` to `colOffset+9`=zone2-zone8

#### CN Version FedEx Ground (fee_version_id: 62-67)
| fee_version_id | Version Name | service_id | colOffset | Notes |
|---|---|---|---|---|
| 62 | Shipping Fee-S1-2025010601-CN-VIP | 3349 | 0 | S1标准价格 |
| 63 | Shipping Fee-S2-2025010601-CN-SVIP | 3350 | 11 | S2标准价 |
| 64 | Shipping Fee-S3-2025010601-CN-SVIP-Plus | 3351 | 22 | S3标准价 |
| 65 | Shipping Fee-OE-2025010601-CN-SVIP-Plus | 3352 | 33 | OE价格 |
| 66 | Shipping Fee-S1-2025010602-CN-VIP | 3353 | 0 | S1小件折扣，报价同S1 |
| 67 | Shipping Fee-S2-2025010602-CN-SVIP | 3354 | 11 | S2小件折扣，报价同S2 |

#### US Version FedEx Ground (fee_version_id: 87-90)
| fee_version_id | Version Name | service_id |
|---|---|---|
| 87 | Shipping Fee-20250226-US-WHOLESALE | 3397 |
| 88 | Shipping Fee-20250226-US-BEST SELLER | 3398 |
| 89 | Shipping Fee-20250226-US-VIP | 3399 |
| 90 | Shipping Fee-20250226-US-Ultra price | 3400 |

### Amazon Shipping

#### CN Version Amazon Shipping (fee_version_id: 62-67)
| fee_version_id | Name | service_id |
|---|---|---|
| 62 | Shipping Fee-S1-2025010601-CN-VIP | 3356 |
| 63 | Shipping Fee-S2-2025010601-CN-SVIP | 3358 |
| 64 | Shipping Fee-S3-2025010601-CN-SVIP-Plus | 3360 |
| 65 | Shipping Fee-OE-2025010601-CN-SVIP-Plus | 3362 |
| 66 | Shipping Fee-S1-2025010602-CN-VIP | 3364 |
| 67 | Shipping Fee-S2-2025010602-CN-SVIP | 3366 |

#### US Version Amazon Shipping (fee_version_id: 87-90)
| fee_version_id | Name | service_id |
|---|---|---|
| 87 | Shipping Fee-20250226-US-WHOLESALE | 3402 |
| 88 | Shipping Fee-20250226-US-BEST SELLER | 3404 |
| 89 | Shipping Fee-20250226-US-VIP | 3406 |
| 90 | Shipping Fee-20250226-US-Ultra price | 3408 |

### GOFO Parcel (service_group_id: 32)

#### CN Version GOFO Parcel (fee_version_id: 62-67)
| fee_version_id | Version Name | service_id |
|---|---|---|
| 62 | Shipping Fee-S1-2025010601-CN-VIP | 3417 |
| 63 | Shipping Fee-S2-2025010601-CN-SVIP | 3418 |
| 64 | Shipping Fee-S3-2025010601-CN-SVIP-Plus | 3419 |
| 65 | Shipping Fee-OE-2025010601-CN-SVIP-Plus | 3420 |
| 66 | Shipping Fee-S1-2025010602-CN-VIP | 3421 |
| 67 | Shipping Fee-S2-2025010602-CN-SVIP | 3422 |

#### US Version GOFO Parcel (fee_version_id: 89-90 only)
| fee_version_id | Version Name | service_id |
|---|---|---|
| 89 | Shipping Fee-20250226-US-VIP | 3427 |
| 90 | Shipping Fee-20250226-US-Ultra price | 3428 |

### USPS Ground Advantage
- service_group_id: 23, display_name: "USPS GA"
- Query service_id from `app_shipsage_service_config_template` by fee_version_id as needed

## File Naming Convention

- Shipping fee import: `app_shipsage_shipping_fee_rate_company_AMZ.xlsx` (Gaatu) or `app_shipsage_shipping_fee_rate_[SERVICE].xlsx` (standard)
- Surcharge import: `app_shipsage_fee_rate_company_AMZ.xlsx` (Gaatu) or `app_shipsage_fee_rate_[SERVICE].xlsx` (standard)

## Important Notes

- Always verify weight segments and zones are continuous before generating import files
- **Date format**: All versions must use `yyyy-MM-dd HH:mm:ss` format (string format)
- **Data validation**: Ensure all weight data is included from minimum weight (e.g., 1lb) to maximum weight
- **Sorting requirement**: Shipping fee records must be sorted by zone first, then by weight
- **Single file output**: By default generate one file with all service_ids; only split if user explicitly requests
- Sheet names in Excel cannot exceed 31 characters
- Consider package_type only if explicitly required (usually not needed)
- Always check end_date > current_time when querying existing rates
- **Always ask user for version type first** (US/CN/Gaatu)
- **Always ask user for start date before generating files** (current time or custom future date)
- **For Gaatu quotes**: All fee_codes must exist in standard quote table (`app_shipsage_fee_rate`)
- **Surcharge validation**: Use `condition_desc_cn` field to match surcharge descriptions accurately
- **Zone mapping**: Excel zones (Zone2, Zone 3-4, Zone5+) map to database zones (2, 3-4, 5+)

## Common Issues and Solutions

### Issue 1: Missing weight data
- **Symptom**: Generated files lack weight data (e.g., missing 1lb or 2lb)
- **Cause**: Incorrect row indexing when extracting data from Excel
- **Solution**:
  - Verify Excel file structure (header rows vs data rows)
  - Ensure extraction starts from the correct row index
  - Example: If data starts at row 3 (index 2), use `for (let row = 2; row < jsonData.length; row++)`

### Issue 2: Incorrect date format
- **Symptom**: Date values are numbers instead of strings
- **Cause**: Using Excel date format instead of string format
- **Solution**:
  - All versions must use `yyyy-MM-dd HH:mm:ss` format (string format)
  - Example: `const startTimeStr = startTime.toISOString().slice(0, 19).replace('T', ' ');`

### Issue 3: Incorrect sorting order
- **Symptom**: Records are not sorted by zone first
- **Cause**: Missing or incorrect sorting logic
- **Solution**:
  - Sort by zone first, then by weight
  - Example:
    ```javascript
    records.sort((a, b) => a.zone !== b.zone ? a.zone - b.zone : a.weight - b.weight);
    ```

### Issue 4: Excel file structure misunderstanding
- **Symptom**: Extracted data doesn't match expected format
- **Cause**: Misunderstanding of Excel file column/row structure
- **Solution**:
  - Always preview sheet structure before extraction
  - Identify header rows, data rows, and column mappings
  - For multi-table horizontal layout, calculate colOffset correctly

### Issue 5: Duplicate service_id in query results
- **Symptom**: Same service_id appears multiple times in template query
- **Cause**: Multiple service_codes (e.g., FEDEX_GROUND_204, FEDEX_GROUND_206) share the same service_id
- **Solution**: Use `GROUP BY service_id, fee_version_id` in the query to deduplicate

### Issue 6: Navicat 导入后日期显示为 0000-00-00
- **Symptom**: start_date/end_date 在数据库中显示为 0000-00-00 HH:mm:ss
- **Cause**: xlsx 库将日期字符串写入 Excel 时被自动识别为数字格式，Navicat 读取数字无法解析日期部分
- **Solution**:
  1. 写入 worksheet 后对日期列强制设置文本类型
  2. **推荐方案**：改用 CSV 格式导入，CSV 中所有值均为纯文本，不存在格式转换问题
  3. 参考函数：
  ```javascript
  function forceTextColumns(ws, colNames) {
    const range = XLSX.utils.decode_range(ws['!ref']);
    const colIdxs = [];
    for (let C = range.s.c; C <= range.e.c; C++) {
      const h = ws[XLSX.utils.encode_cell({ r: 0, c: C })];
      if (h && colNames.includes(h.v)) colIdxs.push(C);
    }
    for (let R = range.s.r + 1; R <= range.e.r; R++) {
      for (const C of colIdxs) {
        const addr = XLSX.utils.encode_cell({ r: R, c: C });
        if (ws[addr]) { ws[addr].t = 's'; ws[addr].z = '@'; }
      }
    }
  }
  // 在 writeFile 前调用：
  forceTextColumns(newWorksheet, ['start_date', 'end_date']);
  ```

### Issue 7: xlsx sheet_to_json 读取时记录丢失
- **Symptom**: 导入文件实际只有1条记录，而非预期的数千条
- **Cause**: 当第一列（如 rate_id）全为空字符串时，`sheet_to_json` 默认模式会将后续行合并
- **Solution**: 使用 `header:1` 模式读取后手动转换为对象数组：
  ```javascript
  const raw = XLSX.utils.sheet_to_json(ws, { header: 1 });
  const headers = raw[0];
  const records = raw.slice(1).map(row => {
    const obj = {}; headers.forEach((h, i) => obj[h] = row[i]); return obj;
  });
  ```

## Phase 6: Import File Verification

After generating import files, always run data verification before importing to database.

### Verification Script: `verify_fedex_ground_import.js`

Location: `d:\公司文件\工作文件-B\AI Project\Dennis_PM\verify_fedex_ground_import.js`

Run with:
```bash
node verify_fedex_ground_import.js
```

### Verification Logic

**Shipping Fee Verification** (per service_id, 10 random samples each):
- Read source Excel sheet with `header:1`
- Read import file with `header:1` to avoid empty rate_id column issue
- For each sample: look up `weight` row in source sheet at `colOffset+1`, read fee at `colOffset+3+(zone-2)`
- Compare import fee vs source fee (tolerance < 0.001)

**Surcharge Verification** (per service_id, 10 random samples each):
- Build source map: `key = service_id:fee_code => fee`
- Column offset for surcharge sheet differs from shipping fee sheet:
  - Use `surColOffsetMap = { 3349:4, 3353:4, 3350:10, 3354:10, 3351:16, 3352:22 }` for zone-based rules
  - Use `simpleColMap = { 3349:4, 3353:4, 3350:5, 3354:5, 3351:6, 3352:7 }` for rows 26-30 (area surcharges)
  - Use `unauthorizedColMap` for OML/OVR/OVX rows
  - Use `signatureCol` map for DCS/CSG/ADS rows
- Compare import fee vs source fee for each sampled record

### Expected Verification Output
```
════════════════════════════════════════════════════════
        FedEx Ground 导入文件校验报告
════════════════════════════════════════════════════════
  运费记录总数: 6300，附加费记录总数: 444

【一、运费校验】每个 service_id 随机抽取10条
  ▶ S1标准价格 (service_id: 3349)  共1050条
  weight   zone   导入fee    源文件fee   结果
  68       6      20         20         ✓ 通过
  小计: 10 通过 / 0 不符

【二、附加费校验】每个 service_id 随机抽取10条
  ▶ S1标准价格 (service_id: 3349)  共74条
  fee_code     fee_group                  导入fee    源文件fee   结果
  AHW-2        Additional Handling charge 8.88       8.88       ✓ 通过
  小计: 10 通过 / 0 不符

  校验总结: 120 通过 / 0 不符
  ✓ 所有抽样数据与源文件一致，可以导入
════════════════════════════════════════════════════════
```

### Verification Workflow
1. Generate import files (xlsx + csv)
2. Run verification script
3. Show verification results to user and ask for confirmation
4. Only proceed with database import after user confirms all samples pass

### Issue 6: Navicat 导入后日期显示为 0000-00-00
- **Symptom**: start_date/end_date 在数据库中显示为 0000-00-00 HH:mm:ss
- **Cause**: xlsx 库将日期字符串写入 Excel 时被自动识别为数字格式，Navicat 读取数字无法解析日期部分
- **Solution**:
  1. 写入 worksheet 后对日期列强制设置文本类型：`ws[addr].t = 's'; ws[addr].z = '@';`
  2. **推荐方案**：改用 CSV 格式导入，CSV 中所有值均为纯文本，不存在格式转换问题
  3. 参考函数：
    ```javascript
    function forceTextColumns(ws, colNames) {
      const range = XLSX.utils.decode_range(ws['!ref']);
      const colIdxs = [];
      for (let C = range.s.c; C <= range.e.c; C++) {
        const h = ws[XLSX.utils.encode_cell({ r: 0, c: C })];
        if (h && colNames.includes(h.v)) colIdxs.push(C);
      }
      for (let R = range.s.r + 1; R <= range.e.r; R++) {
        for (const C of colIdxs) {
          const addr = XLSX.utils.encode_cell({ r: R, c: C });
          if (ws[addr]) { ws[addr].t = 's'; ws[addr].z = '@'; }
        }
      }
    }
    // 在 writeFile 前调用：
    forceTextColumns(newWorksheet, ['start_date', 'end_date']);
    ```

### Issue 7: xlsx sheet_to_json 读取时记录丢失
- **Symptom**: 导入文件实际只有1条记录，而非预期的数千条
- **Cause**: 当第一列（如 rate_id）全为空字符串时，`sheet_to_json` 默认模式会将后续行合并
- **Solution**: 使用 `header:1` 模式读取后手动转换为对象数组：
  ```javascript
  const raw = XLSX.utils.sheet_to_json(ws, { header: 1 });
  const headers = raw[0];
  const records = raw.slice(1).map(row => {
    const obj = {}; headers.forEach((h, i) => obj[h] = row[i]); return obj;
  });
  ```

## Phase 6: Import File Verification

After generating import files, always run data verification before importing to database.

### Verification Script: `verify_fedex_ground_import.js`

Location: `d:\公司文件\工作文件-B\AI Project\Dennis_PM\verify_fedex_ground_import.js`

Run with:
```bash
node verify_fedex_ground_import.js
```

### Verification Logic

**Shipping Fee Verification** (per service_id, 10 random samples each):
- Read source Excel sheet with `header:1`
- Read import file with `header:1` to avoid empty rate_id column issue
- For each sample: look up `weight` row in source sheet at `colOffset+1`, read fee at `colOffset+3+(zone-2)`
- Compare import fee vs source fee (tolerance < 0.001)

**Surcharge Verification** (per service_id, 10 random samples each):
- Build source map: `key = service_id:fee_code => fee`
- Column offset for surcharge sheet differs from shipping fee sheet:
  - Use `surColOffsetMap = { 3349:4, 3353:4, 3350:10, 3354:10, 3351:16, 3352:22 }` for zone-based rules
  - Use `simpleColMap = { 3349:4, 3353:4, 3350:5, 3354:5, 3351:6, 3352:7 }` for rows 26-30 (area surcharges)
  - Use `unauthorizedColMap` for OML/OVR/OVX rows
  - Use `signatureCol` map for DCS/CSG/ADS rows
- Compare import fee vs source fee for each sampled record

### Expected Output
```
════════════════════════════════════════════════════════════════════════
        FedEx Ground 导入文件校验报告
════════════════════════════════════════════════════════════════════════
  运费记录总数: 6300，附加费记录总数: 444

【一、运费校验】每个 service_id 随机抽取10条
  ▶ S1标准价格 (service_id: 3349)  共1050条
  weight   zone   导入fee        源文件fee       结果
  68       6      20           20           ✓ 通过
  ...
  小计: 10 通过 / 0 不符

【二、附加费校验】每个 service_id 随机抽取10条
  ▶ S1标准价格 (service_id: 3349)  共74条
  fee_code       fee_group                      导入fee        源文件fee       结果
  AHW-2          Additional Handling charge     8.88         8.88         ✓ 通过
  ...
  小计: 10 通过 / 0 不符

  校验总结: 120 通过 / 0 不符
  ✓ 所有抽样数据与源文件一致，可以导入
════════════════════════════════════════════════════════════════════════
```

### Verification Workflow
1. Generate import files (xlsx + csv)
2. Run verification script
3. Show verification results to user and ask for confirmation
4. Only proceed with database import after user confirms all samples pass