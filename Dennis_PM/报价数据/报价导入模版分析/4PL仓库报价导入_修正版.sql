-- ============================================
-- 4PL仓库报价导入 SQL (修正版)
-- 表: app_wms_4pl_billing_warehouse_quote
-- 生成时间: 2026-03-16 08:42:29
-- ============================================

USE `app.shipsage.com`;

-- 当前最大 service_quote_vip_id: 438
-- 需要导入的记录数: 96
--   - 来自DB参考: 64 条
--   - 使用默认值: 32 条

-- SG-SAV2 - 第一部分：入库和转运 - 托盘: $6.5
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    439, 1, 19107, 3002,
    'Pallet Unit CBM Price',
    'each_pallet_cbm',
    6.5,
    'per CBM',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-IAH4 - 第一部分：入库和转运 - 托盘: $6.5
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    440, 1, 19108, 3002,
    'Pallet Unit CBM Price',
    'each_pallet_cbm',
    6.5,
    'per CBM',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-SAV2 - 第一部分：入库和转运 - 散货: $1
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    441, 1, 19107, 3002,
    'ASN Additional Carton for Container',
    'container_asn_additional_carton_price',
    1,
    'per carton',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-IAH4 - 第一部分：入库和转运 - 散货: $1
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    442, 1, 19108, 3002,
    'ASN Additional Carton for Container',
    'container_asn_additional_carton_price',
    1,
    'per carton',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-SAV2 - 第一部分：入库和转运 - SKU分拣费: $5
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    443, 1, 19107, 3002,
    'ASN Additional SKU for Container',
    'container_asn_additional_sku_price',
    5,
    'per sku',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-IAH4 - 第一部分：入库和转运 - SKU分拣费: $5
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    444, 1, 19108, 3002,
    'ASN Additional SKU for Container',
    'container_asn_additional_sku_price',
    5,
    'per sku',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-SAV2 - 第一部分：入库和转运 - 20GP: $230
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    445, 1, 19107, 3002,
    '20'' Container Palletized',
    '3',
    230,
    'per container',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-IAH4 - 第一部分：入库和转运 - 20GP: $230
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    446, 1, 19108, 3002,
    '20'' Container Palletized',
    '3',
    230,
    'per container',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-SAV2 - 第一部分：入库和转运 - 40GP: $300
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    447, 1, 19107, 3002,
    '40'' Container Palletized',
    '5',
    300,
    'per container',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-IAH4 - 第一部分：入库和转运 - 40GP: $300
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    448, 1, 19108, 3002,
    '40'' Container Palletized',
    '5',
    300,
    'per container',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-SAV2 - 第一部分：入库和转运 - 40HQ: $300
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    449, 1, 19107, 3002,
    '40'' HQ Container Palletized',
    '9',
    300,
    'per container',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-IAH4 - 第一部分：入库和转运 - 40HQ: $300
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    450, 1, 19108, 3002,
    '40'' HQ Container Palletized',
    '9',
    300,
    'per container',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-SAV2 - 第一部分：入库和转运 - 45HQ: $300
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    451, 1, 19107, 3002,
    '45'' Container Palletized',
    '7',
    300,
    'per container',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-IAH4 - 第一部分：入库和转运 - 45HQ: $300
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    452, 1, 19108, 3002,
    '45'' Container Palletized',
    '7',
    300,
    'per container',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-SAV2 - 第一部分：入库和转运 - 53 Container: $350
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    453, 1, 19107, 3002,
    '53'' Container Palletized',
    '11',
    350,
    'per container',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-IAH4 - 第一部分：入库和转运 - 53 Container: $350
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    454, 1, 19108, 3002,
    '53'' Container Palletized',
    '11',
    350,
    'per container',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-SAV2 - 第一部分：入库和转运 - 贴/换标签: $0.48
-- 来源: 使用默认值（DB中无匹配）
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    455, 1, 19107, 3002,
    '贴/换标签',
    'standard',
    0.48,
    'label',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-IAH4 - 第一部分：入库和转运 - 贴/换标签: $0.48
-- 来源: 使用默认值（DB中无匹配）
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    456, 1, 19108, 3002,
    '贴/换标签',
    'standard',
    0.48,
    'label',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-SAV2 - 第一部分：入库和转运 - 转运打托: $15
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    457, 1, 19107, 3002,
    '20'' Container Palletized',
    '3',
    15,
    'per container',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-IAH4 - 第一部分：入库和转运 - 转运打托: $15
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    458, 1, 19108, 3002,
    '20'' Container Palletized',
    '3',
    15,
    'per container',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-SAV2 - 第一部分：入库和转运 - 出库转运操作费: $10
-- 来源: 使用默认值（DB中无匹配）
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    459, 1, 19107, 3002,
    '出库转运操作费',
    'standard',
    10,
    'shipment',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-IAH4 - 第一部分：入库和转运 - 出库转运操作费: $10
-- 来源: 使用默认值（DB中无匹配）
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    460, 1, 19108, 3002,
    '出库转运操作费',
    'standard',
    10,
    'shipment',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-SAV2 - 第二部分：操作费 - Pick & Pack 0-1.1lb: $0.42
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    461, 1, 19107, 3006,
    'Pick & Pack',
    '0 < x && x <= 1.1',
    0.42,
    'per unit',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-IAH4 - 第二部分：操作费 - Pick & Pack 0-1.1lb: $0.42
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    462, 1, 19108, 3006,
    'Pick & Pack',
    '0 < x && x <= 1.1',
    0.42,
    'per unit',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-SAV2 - 第二部分：操作费 - Pick & Pack 1.1-2.2lb: $0.42
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    463, 1, 19107, 3006,
    'Pick & Pack',
    '0 < x && x <= 1.1',
    0.42,
    'per unit',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-IAH4 - 第二部分：操作费 - Pick & Pack 1.1-2.2lb: $0.42
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    464, 1, 19108, 3006,
    'Pick & Pack',
    '0 < x && x <= 1.1',
    0.42,
    'per unit',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-SAV2 - 第二部分：操作费 - Pick & Pack 2.2-4.41lb: $0.42
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    465, 1, 19107, 3006,
    'Pick & Pack',
    '0 < x && x <= 1.1',
    0.42,
    'per unit',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-IAH4 - 第二部分：操作费 - Pick & Pack 2.2-4.41lb: $0.42
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    466, 1, 19108, 3006,
    'Pick & Pack',
    '0 < x && x <= 1.1',
    0.42,
    'per unit',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-SAV2 - 第二部分：操作费 - Pick & Pack 4.41-11.02lb: $0.8
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    467, 1, 19107, 3006,
    'Pick & Pack',
    '0 < x && x <= 1.1',
    0.8,
    'per unit',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-IAH4 - 第二部分：操作费 - Pick & Pack 4.41-11.02lb: $0.8
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    468, 1, 19108, 3006,
    'Pick & Pack',
    '0 < x && x <= 1.1',
    0.8,
    'per unit',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-SAV2 - 第二部分：操作费 - Pick & Pack 11.02-22.04lb: $1.2
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    469, 1, 19107, 3006,
    'Pick & Pack',
    '0 < x && x <= 1.1',
    1.2,
    'per unit',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-IAH4 - 第二部分：操作费 - Pick & Pack 11.02-22.04lb: $1.2
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    470, 1, 19108, 3006,
    'Pick & Pack',
    '0 < x && x <= 1.1',
    1.2,
    'per unit',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-SAV2 - 第二部分：操作费 - Pick & Pack 22.04-44.09lb: $1.7
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    471, 1, 19107, 3006,
    'Pick & Pack',
    '0 < x && x <= 1.1',
    1.7,
    'per unit',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-IAH4 - 第二部分：操作费 - Pick & Pack 22.04-44.09lb: $1.7
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    472, 1, 19108, 3006,
    'Pick & Pack',
    '0 < x && x <= 1.1',
    1.7,
    'per unit',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-SAV2 - 第二部分：操作费 - Pick & Pack 44.09-66.13lb: $2.1
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    473, 1, 19107, 3006,
    'Pick & Pack',
    '0 < x && x <= 1.1',
    2.1,
    'per unit',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-IAH4 - 第二部分：操作费 - Pick & Pack 44.09-66.13lb: $2.1
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    474, 1, 19108, 3006,
    'Pick & Pack',
    '0 < x && x <= 1.1',
    2.1,
    'per unit',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-SAV2 - 第二部分：操作费 - Pick & Pack 66.13-88.18lb: $2.5
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    475, 1, 19107, 3006,
    'Pick & Pack',
    '0 < x && x <= 1.1',
    2.5,
    'per unit',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-IAH4 - 第二部分：操作费 - Pick & Pack 66.13-88.18lb: $2.5
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    476, 1, 19108, 3006,
    'Pick & Pack',
    '0 < x && x <= 1.1',
    2.5,
    'per unit',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-SAV2 - 第二部分：操作费 - Pick & Pack 88.18-110.23lb: $3.5
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    477, 1, 19107, 3006,
    'Pick & Pack',
    '0 < x && x <= 1.1',
    3.5,
    'per unit',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-IAH4 - 第二部分：操作费 - Pick & Pack 88.18-110.23lb: $3.5
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    478, 1, 19108, 3006,
    'Pick & Pack',
    '0 < x && x <= 1.1',
    3.5,
    'per unit',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-SAV2 - 第二部分：操作费 - Pick & Pack 110.23-132.28lb: $4
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    479, 1, 19107, 3006,
    'Pick & Pack',
    '0 < x && x <= 1.1',
    4,
    'per unit',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-IAH4 - 第二部分：操作费 - Pick & Pack 110.23-132.28lb: $4
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    480, 1, 19108, 3006,
    'Pick & Pack',
    '0 < x && x <= 1.1',
    4,
    'per unit',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-SAV2 - 第三部分：退货费 - 入库托盘: $6.5
-- 来源: 使用默认值（DB中无匹配）
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    481, 1, 19107, 3001,
    '入库托盘',
    'standard',
    6.5,
    'CBM',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-IAH4 - 第三部分：退货费 - 入库托盘: $6.5
-- 来源: 使用默认值（DB中无匹配）
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    482, 1, 19108, 3001,
    '入库托盘',
    'standard',
    6.5,
    'CBM',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-SAV2 - 第三部分：退货费 - 散货: $1.2
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    483, 1, 19107, 3001,
    'Package',
    '0 < x <= 50',
    1.2,
    'per package',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-IAH4 - 第三部分：退货费 - 散货: $1.2
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    484, 1, 19108, 3001,
    'Package',
    '0 < x <= 50',
    1.2,
    'per package',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-SAV2 - 第三部分：退货费 - 更换标签费: $0.48
-- 来源: 使用默认值（DB中无匹配）
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    485, 1, 19107, 3001,
    '更换标签费',
    'standard',
    0.48,
    'label',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-IAH4 - 第三部分：退货费 - 更换标签费: $0.48
-- 来源: 使用默认值（DB中无匹配）
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    486, 1, 19108, 3001,
    '更换标签费',
    'standard',
    0.48,
    'label',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-SAV2 - 第三部分：退货费 - 清点费: $0.3
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    487, 1, 19107, 3001,
    'Item',
    'item',
    0.3,
    'per item',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-IAH4 - 第三部分：退货费 - 清点费: $0.3
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    488, 1, 19108, 3001,
    'Item',
    'item',
    0.3,
    'per item',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-SAV2 - 第三部分：退货费 - 转运打托: $15
-- 来源: 使用默认值（DB中无匹配）
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    489, 1, 19107, 3001,
    '转运打托',
    'standard',
    15,
    'pallet',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-IAH4 - 第三部分：退货费 - 转运打托: $15
-- 来源: 使用默认值（DB中无匹配）
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    490, 1, 19108, 3001,
    '转运打托',
    'standard',
    15,
    'pallet',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-SAV2 - 第三部分：退货费 - 出库转运操作费: $10
-- 来源: 使用默认值（DB中无匹配）
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    491, 1, 19107, 3001,
    '出库转运操作费',
    'standard',
    10,
    'shipment',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-IAH4 - 第三部分：退货费 - 出库转运操作费: $10
-- 来源: 使用默认值（DB中无匹配）
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    492, 1, 19108, 3001,
    '出库转运操作费',
    'standard',
    10,
    'shipment',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-SAV2 - 第四部分：仓储费 - 0-30天: $0
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    493, 1, 19107, 3000,
    'Storage Age',
    'days_other',
    0,
    'per CBM per day',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-IAH4 - 第四部分：仓储费 - 0-30天: $0
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    494, 1, 19108, 3000,
    'Storage Age',
    'days_other',
    0,
    'per CBM per day',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-SAV2 - 第四部分：仓储费 - 31-60天: $0.4
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    495, 1, 19107, 3000,
    'Storage Age',
    'days_other',
    0.4,
    'per CBM per day',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-IAH4 - 第四部分：仓储费 - 31-60天: $0.4
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    496, 1, 19108, 3000,
    'Storage Age',
    'days_other',
    0.4,
    'per CBM per day',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-SAV2 - 第四部分：仓储费 - 61-90天: $0.48
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    497, 1, 19107, 3000,
    'Storage Age',
    'days_other',
    0.48,
    'per CBM per day',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-IAH4 - 第四部分：仓储费 - 61-90天: $0.48
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    498, 1, 19108, 3000,
    'Storage Age',
    'days_other',
    0.48,
    'per CBM per day',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-SAV2 - 第四部分：仓储费 - 91-120天: $0.55
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    499, 1, 19107, 3000,
    'Storage Age',
    'days_other',
    0.55,
    'per CBM per day',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-IAH4 - 第四部分：仓储费 - 91-120天: $0.55
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    500, 1, 19108, 3000,
    'Storage Age',
    'days_other',
    0.55,
    'per CBM per day',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-SAV2 - 第四部分：仓储费 - 121-180天: $0.65
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    501, 1, 19107, 3000,
    'Storage Age',
    'days_other',
    0.65,
    'per CBM per day',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-IAH4 - 第四部分：仓储费 - 121-180天: $0.65
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    502, 1, 19108, 3000,
    'Storage Age',
    'days_other',
    0.65,
    'per CBM per day',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-SAV2 - 第四部分：仓储费 - 181-365天: $0.8
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    503, 1, 19107, 3000,
    'Storage Age',
    'days_other',
    0.8,
    'per CBM per day',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-IAH4 - 第四部分：仓储费 - 181-365天: $0.8
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    504, 1, 19108, 3000,
    'Storage Age',
    'days_other',
    0.8,
    'per CBM per day',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-SAV2 - 第四部分：仓储费 - 365+天: $1
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    505, 1, 19107, 3000,
    'Storage Age',
    'days_other',
    1,
    'per CBM per day',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-IAH4 - 第四部分：仓储费 - 365+天: $1
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    506, 1, 19108, 3000,
    'Storage Age',
    'days_other',
    1,
    'per CBM per day',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-SAV2 - 第五部分：杂费 - 贴标服务: $0.48
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    507, 1, 19107, 3005,
    'relabel_surcharge',
    'relabel_surcharge',
    0.48,
    'per pallet',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-IAH4 - 第五部分：杂费 - 贴标服务: $0.48
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    508, 1, 19108, 3005,
    'relabel_surcharge',
    'relabel_surcharge',
    0.48,
    'per pallet',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-SAV2 - 第五部分：杂费 - 工时费: $30
-- 来源: 使用默认值（DB中无匹配）
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    509, 1, 19107, 3005,
    '工时费',
    'standard',
    30,
    'hour',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-IAH4 - 第五部分：杂费 - 工时费: $30
-- 来源: 使用默认值（DB中无匹配）
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    510, 1, 19108, 3005,
    '工时费',
    'standard',
    30,
    'hour',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-SAV2 - 第五部分：杂费 - 库内销毁费: $0.3
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    511, 1, 19107, 3005,
    'destroy_sku_surcharge',
    'destroy_sku_surcharge',
    0.3,
    'per pallet',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-IAH4 - 第五部分：杂费 - 库内销毁费: $0.3
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    512, 1, 19108, 3005,
    'destroy_sku_surcharge',
    'destroy_sku_surcharge',
    0.3,
    'per pallet',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-SAV2 - 第五部分：杂费 - 拍照: $0.48
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    513, 1, 19107, 3005,
    'take_photo_surcharge',
    'take_photo_surcharge',
    0.48,
    'per pallet',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-IAH4 - 第五部分：杂费 - 拍照: $0.48
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    514, 1, 19108, 3005,
    'take_photo_surcharge',
    'take_photo_surcharge',
    0.48,
    'per pallet',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-SAV2 - 第五部分：杂费 - 复尺: $4.5
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    515, 1, 19107, 3005,
    'remeasure_surcharge',
    'remeasure_surcharge',
    4.5,
    'per pallet',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-IAH4 - 第五部分：杂费 - 复尺: $4.5
-- 来源: 参考现有DB配置
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    516, 1, 19108, 3005,
    'remeasure_surcharge',
    'remeasure_surcharge',
    4.5,
    'per pallet',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-SAV2 - 第五部分：杂费 - SKU尺寸重量有误: $4.5
-- 来源: 使用默认值（DB中无匹配）
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    517, 1, 19107, 3005,
    'SKU尺寸重量有误',
    'standard',
    4.5,
    'sku',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-IAH4 - 第五部分：杂费 - SKU尺寸重量有误: $4.5
-- 来源: 使用默认值（DB中无匹配）
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    518, 1, 19108, 3005,
    'SKU尺寸重量有误',
    'standard',
    4.5,
    'sku',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-SAV2 - 第五部分：杂费 - 库存盘点: $0.12
-- 来源: 使用默认值（DB中无匹配）
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    519, 1, 19107, 3005,
    '库存盘点',
    'standard',
    0.12,
    'item',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-IAH4 - 第五部分：杂费 - 库存盘点: $0.12
-- 来源: 使用默认值（DB中无匹配）
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    520, 1, 19108, 3005,
    '库存盘点',
    'standard',
    0.12,
    'item',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-SAV2 - 第五部分：杂费 - 库内订单拦截: $2
-- 来源: 使用默认值（DB中无匹配）
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    521, 1, 19107, 3005,
    '库内订单拦截',
    'standard',
    2,
    'shipment',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-IAH4 - 第五部分：杂费 - 库内订单拦截: $2
-- 来源: 使用默认值（DB中无匹配）
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    522, 1, 19108, 3005,
    '库内订单拦截',
    'standard',
    2,
    'shipment',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-SAV2 - 第五部分：杂费 - 托盘耗损费用: $0
-- 来源: 使用默认值（DB中无匹配）
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    523, 1, 19107, 3005,
    '托盘耗损费用',
    'standard',
    0,
    'pallet',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-IAH4 - 第五部分：杂费 - 托盘耗损费用: $0
-- 来源: 使用默认值（DB中无匹配）
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    524, 1, 19108, 3005,
    '托盘耗损费用',
    'standard',
    0,
    'pallet',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-SAV2 - 第五部分：杂费 - SFP: $1
-- 来源: 使用默认值（DB中无匹配）
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    525, 1, 19107, 3005,
    'SFP',
    'standard',
    1,
    'order',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-IAH4 - 第五部分：杂费 - SFP: $1
-- 来源: 使用默认值（DB中无匹配）
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    526, 1, 19108, 3005,
    'SFP',
    'standard',
    1,
    'order',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-SAV2 - 第五部分：杂费 - 混箱: $5
-- 来源: 使用默认值（DB中无匹配）
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    527, 1, 19107, 3005,
    '混箱',
    'standard',
    5,
    'sku',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-IAH4 - 第五部分：杂费 - 混箱: $5
-- 来源: 使用默认值（DB中无匹配）
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    528, 1, 19108, 3005,
    '混箱',
    'standard',
    5,
    'sku',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-SAV2 - 第五部分：杂费 - 拆托: $8
-- 来源: 使用默认值（DB中无匹配）
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    529, 1, 19107, 3005,
    '拆托',
    'standard',
    8,
    'pallet',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-IAH4 - 第五部分：杂费 - 拆托: $8
-- 来源: 使用默认值（DB中无匹配）
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    530, 1, 19108, 3005,
    '拆托',
    'standard',
    8,
    'pallet',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-SAV2 - 第五部分：杂费 - 快递袋: $0.5
-- 来源: 使用默认值（DB中无匹配）
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    531, 1, 19107, 3005,
    '快递袋',
    'standard',
    0.5,
    'bag',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-IAH4 - 第五部分：杂费 - 快递袋: $0.5
-- 来源: 使用默认值（DB中无匹配）
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    532, 1, 19108, 3005,
    '快递袋',
    'standard',
    0.5,
    'bag',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-SAV2 - 第五部分：杂费 - 一票多件合并打包: $0
-- 来源: 使用默认值（DB中无匹配）
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    533, 1, 19107, 3005,
    '一票多件合并打包',
    'standard',
    0,
    'order',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- SG-IAH4 - 第五部分：杂费 - 一票多件合并打包: $0
-- 来源: 使用默认值（DB中无匹配）
INSERT INTO app_wms_4pl_billing_warehouse_quote (
    service_quote_vip_id, company_id, warehouse_id, service_id,
    name, `index`, quote, unit, start_date, end_date,
    hidden, disabled, deleted, created_at, created_by, updated_at, updated_by
) VALUES (
    534, 1, 19108, 3005,
    '一票多件合并打包',
    'standard',
    0,
    'order',
    '2026-03-16 00:00:00',
    '2099-12-31 23:59:59',
    0, 0, 0,
    NOW(), 1, NOW(), 1
);

-- ============================================
-- 验证 SQL
-- ============================================
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
