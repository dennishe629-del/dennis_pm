# Warehouse Name Mapping

Source Excel files may use different warehouse names than what exists in `Production.GT_Warehouse`.
Confirm mappings with the user when source names don't match exactly.

## Known Mappings

| Excel Source Name | DB warehouse_name | warehouse_id |
|-------------------|-------------------|-------------|
| SG-SAV2 | SG-SAV1 | 120 |
| SG-IAH4 | SG-IAH3 | 131 |

## All SG Warehouses in Production.GT_Warehouse

| warehouse_id | warehouse_name |
|-------------|----------------|
| 100 | SG-MDW1 |
| 101 | SG-SMF1 |
| 103 | SG-MEM1 |
| 109 | SG-ABE1 |
| 112 | SG-ATL1 |
| 113 | SG-ONT1 |
| 114 | SG-ONT2 |
| 116 | SG-IAH1 |
| 117 | SG-ONT3 |
| 118 | SG-IAH2 |
| 119 | SG-ONT4 |
| 120 | SG-SAV1 |
| 130 | SG-ONT5 |
| 131 | SG-IAH3 |
| 132 | SG-SMF2 |
| 133 | SG-CHS1 |

## Query to Find Warehouse by Partial Name

```sql
SELECT warehouse_id, warehouse_name
FROM Production.GT_Warehouse
WHERE warehouse_name LIKE '%SAV%'
ORDER BY warehouse_name;
```
