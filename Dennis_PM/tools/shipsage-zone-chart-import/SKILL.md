---
name: shipsage-zone-chart-import
description: Generates a zone_chart import Excel file for ShipSage from a source zone chart Excel file. Use when the user wants to create or generate a zone chart import file, add new warehouse zone chart data, or import FedEx/UPS/other carrier zone charts into the ShipSage database (app.shipsage.com.app_shipsage_zone_chart).
---

# ShipSage Zone Chart Import File Generator

Generates an `app_shipsage_zone_chart` import Excel file from a source zone chart spreadsheet.

## Source File Format

The source Excel file follows this structure:

| Row | Col A | Col B | Col C | ... |
|-----|-------|-------|-------|-----|
| 1 | (empty) | Fedex | (empty) | ... | ← carrier type
| 2 | ZIP Code前三位 | SG-SAV2\nGA\n31408 | SG-IAH4\nTX\n77489 | ... | ← warehouse names (may contain newlines)
| 3+ | 000 | - | 7 | ... | ← 3-digit zip prefix + zone values per warehouse |

- Row 1, Col B+: carrier type (e.g. `Fedex`, `UPS`)
- Row 2, Col B+: warehouse names (first line before `\n` is the name)
- Row 3+, Col A: 3-digit ZIP prefix
- Row 3+, Col B+: zone value (integer) or `-` meaning no service

## Output File Format

Matches `app_shipsage_zone_chart` table structure:

```
zone_chart_id | zip_range_start | zip_range_end | warehouse_id | zone_chart_type_id | zone | start_date | end_date
```

- `zip_range_start` = 3-digit prefix + `00` (e.g. `004` → `00400`)
- `zip_range_end` = 3-digit prefix + `99` (e.g. `004` → `00499`)
- `zone_chart_id` = leave blank (auto-increment on import)
- Rows with zone value `-` are skipped
- Sorted by: warehouse_id ASC, then zip_range_start ASC

## Workflow

### Step 1: Query zone_chart_type_id

```sql
SELECT zone_chart_type_id
FROM `app.shipsage.com`.app_shipsage_zone_chart_type
WHERE zone_chart_type = 'FEDEX'  -- uppercase
```

Known values: `FEDEX = 3`

### Step 2: Query warehouse_id

```sql
SELECT warehouse_id, warehouse_name
FROM Production.GT_Warehouse
WHERE warehouse_name = 'SG-SAV1'
```

> **Note**: Warehouse names in source files may not match the database exactly.
> Use fuzzy matching (`LIKE '%SG-SAV%'`) to find candidates and confirm with the user.
> See [warehouse-name-mapping.md](warehouse-name-mapping.md) for known mappings.

### Step 3: Run the generation script

```bash
node scripts/generate-zone-chart.js \
  --source "path/to/source.xlsx" \
  --template "path/to/template.xlsx" \
  --output "path/to/output.xlsx"
```

Or adapt `scripts/generate-zone-chart.js` for the specific file paths.

## Database Connection

Use the MySQL connection configured in the project's `mcp_config.json`:
- Host: `production-ro-001.cvq1rh9zazcx.us-west-1.rds.amazonaws.com`
- Database for zone chart: `app.shipsage.com`
- Database for warehouses: `Production` (table: `GT_Warehouse`)

## Key Notes

- Install dependencies first: `npm install mysql2 xlsx`
- The template file defines the output column order — always read headers from it
- `start_date` default: today's date + ` 00:00:00`
- `end_date` default: `2099-12-31 23:59:59`
- For additional resources, see [warehouse-name-mapping.md](warehouse-name-mapping.md)
