/**
 * ShipSage Zone Chart Import File Generator
 *
 * Usage:
 *   node generate-zone-chart.js --source <source.xlsx> --template <template.xlsx> --output <output.xlsx>
 *
 * Dependencies: npm install mysql2 xlsx
 */

const XLSX = require('xlsx');
const mysql = require('mysql2/promise');
const args = process.argv.slice(2);

function getArg(name) {
  const idx = args.indexOf('--' + name);
  return idx !== -1 ? args[idx + 1] : null;
}

const SOURCE_FILE = getArg('source');
const TEMPLATE_FILE = getArg('template');
const OUTPUT_FILE = getArg('output');

if (!SOURCE_FILE || !TEMPLATE_FILE || !OUTPUT_FILE) {
  console.error('Usage: node generate-zone-chart.js --source <file> --template <file> --output <file>');
  process.exit(1);
}

const MYSQL_CONFIG = {
  host: process.env.MYSQL_HOST || 'production-ro-001.cvq1rh9zazcx.us-west-1.rds.amazonaws.com',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || 'dennis.he',
  password: process.env.MYSQL_PASSWORD || '',
};

// Add known warehouse name mismatches here: { 'Excel Name': 'DB Name' }
const WAREHOUSE_NAME_OVERRIDES = {};

async function main() {
  // 1. Read source file
  console.log('Reading source file:', SOURCE_FILE);
  const srcWb = XLSX.readFile(SOURCE_FILE);
  const srcData = XLSX.utils.sheet_to_json(srcWb.Sheets[srcWb.SheetNames[0]], { header: 1 });

  const carrierType = srcData[0][1];
  if (!carrierType) throw new Error('Cannot find carrier type in Row 1, Col B');
  console.log('  Carrier type:', carrierType);

  // Parse warehouse columns (row 2, col B onward)
  const warehouseCols = [];
  for (let c = 1; c < srcData[1].length; c++) {
    const raw = srcData[1][c];
    if (!raw) continue;
    const name = String(raw).split('\n')[0].trim();
    const mappedName = WAREHOUSE_NAME_OVERRIDES[name] || name;
    warehouseCols.push({ col: c, name, mappedName });
  }
  console.log('  Warehouses:', warehouseCols.map(w => w.name + (w.name !== w.mappedName ? ` -> ${w.mappedName}` : '')).join(', '));

  // 2. Connect to DB
  console.log('\nConnecting to database...');
  const conn = await mysql.createConnection(MYSQL_CONFIG);

  // Query zone_chart_type_id
  const [zcRows] = await conn.execute(
    'SELECT zone_chart_type_id FROM `app.shipsage.com`.app_shipsage_zone_chart_type WHERE zone_chart_type = ?',
    [carrierType.toUpperCase()]
  );
  if (!zcRows.length) throw new Error(`zone_chart_type not found: ${carrierType}`);
  const zoneChartTypeId = zcRows[0].zone_chart_type_id;
  console.log('  zone_chart_type_id:', zoneChartTypeId);

  // Query warehouse_ids
  const warehouseMap = {};
  for (const wh of warehouseCols) {
    const [rows] = await conn.execute(
      'SELECT warehouse_id FROM Production.GT_Warehouse WHERE warehouse_name = ?',
      [wh.mappedName]
    );
    if (!rows.length) {
      console.warn(`  WARNING: Warehouse '${wh.mappedName}' not found — skipping`);
    } else {
      warehouseMap[wh.col] = { warehouseId: rows[0].warehouse_id, ...wh };
      console.log(`  '${wh.mappedName}' -> warehouse_id: ${rows[0].warehouse_id}`);
    }
  }
  await conn.end();

  if (!Object.keys(warehouseMap).length) throw new Error('No valid warehouses found.');

  // 3. Read template headers
  console.log('\nReading template:', TEMPLATE_FILE);
  const tplWb = XLSX.readFile(TEMPLATE_FILE);
  const tplData = XLSX.utils.sheet_to_json(tplWb.Sheets[tplWb.SheetNames[0]], { header: 1 });
  const headers = tplData[0];
  console.log('  Headers:', JSON.stringify(headers));

  // 4. Build output rows
  console.log('\nProcessing zone data...');
  const today = new Date().toISOString().split('T')[0] + ' 00:00:00';
  const dataRows = [];

  for (let i = 2; i < srcData.length; i++) {
    const zipPrefix = srcData[i][0];
    if (!zipPrefix) continue;
    const prefix3 = String(zipPrefix).padStart(3, '0');
    const zipStart = prefix3 + '00';
    const zipEnd   = prefix3 + '99';

    for (const [col, info] of Object.entries(warehouseMap)) {
      const zoneVal = srcData[i][parseInt(col)];
      if (!zoneVal || zoneVal === '-') continue;
      dataRows.push([
        null,                 // zone_chart_id
        zipStart,             // zip_range_start
        zipEnd,               // zip_range_end
        info.warehouseId,     // warehouse_id
        zoneChartTypeId,      // zone_chart_type_id
        parseInt(zoneVal),    // zone
        today,                // start_date
        '2099-12-31 23:59:59' // end_date
      ]);
    }
  }

  // 5. Sort: warehouse_id ASC, then zip_range_start ASC
  dataRows.sort((a, b) => {
    const wCmp = a[3] - b[3];
    if (wCmp !== 0) return wCmp;
    return String(a[1]).localeCompare(String(b[1]));
  });

  // 6. Write output
  console.log('\nWriting output file:', OUTPUT_FILE);
  const outWb = XLSX.utils.book_new();
  const outSheet = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
  XLSX.utils.book_append_sheet(outWb, outSheet, 'zone_chart');
  XLSX.writeFile(outWb, OUTPUT_FILE);

  console.log('\nDone!');
  console.log('  zone_chart_type_id :', zoneChartTypeId);
  Object.values(warehouseMap).forEach(w =>
    console.log(`  ${w.name} -> ${w.mappedName} (warehouse_id: ${w.warehouseId})`)
  );
  console.log('  Total rows         :', dataRows.length);
  console.log('  Output             :', OUTPUT_FILE);
}

main().catch(err => {
  console.error('ERROR:', err.message);
  process.exit(1);
});
