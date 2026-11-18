import fs from 'fs';
import path from 'path';
import {
  ConditionGrade,
  PrismaClient,
  ProductCondition,
  ProductStatus,
  RefurbishedStatus,
  ServicePricingType,
} from '@prisma/client';

export type ImportEntityType = 'products' | 'refurbished' | 'services' | 'inventory';

export interface RowValidationError {
  row: number;
  field: string;
  message: string;
}

export interface CsvValidationResult {
  type: ImportEntityType;
  totalRows: number;
  validRows: Record<string, string>[];
  errors: RowValidationError[];
}

const VALID_PRODUCT_CONDITIONS = new Set<string>(Object.values(ProductCondition));
const VALID_PRODUCT_STATUSES = new Set<string>(Object.values(ProductStatus));
const VALID_CONDITION_GRADES = new Set<string>(Object.values(ConditionGrade));
const VALID_REFURB_STATUSES = new Set<string>(Object.values(RefurbishedStatus));
const VALID_SERVICE_PRICING = new Set<string>(Object.values(ServicePricingType));

/**
 * Parses RFC-4180 CSV text into an array of header-keyed record objects.
 */
export function parseCsv(content: string): { headers: string[]; rows: Record<string, string>[] } {
  const records: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized[i];
    if (inQuotes) {
      if (ch === '"' && normalized[i + 1] === '"') {
        currentField += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        currentField += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if (ch === '\n') {
      currentRow.push(currentField.trim());
      if (currentRow.some((cell) => cell !== '')) {
        records.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += ch;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((cell) => cell !== '')) {
      records.push(currentRow);
    }
  }

  if (records.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = records[0].map((h) => h.trim());
  const rows = records.slice(1).map((cols) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      obj[h] = (cols[idx] ?? '').trim();
    });
    return obj;
  });

  return { headers, rows };
}

function isPositiveNumber(value: string): boolean {
  if (!value) return false;
  const num = Number(value);
  return Number.isFinite(num) && num >= 0;
}

function isNonNegativeInt(value: string): boolean {
  if (!value) return false;
  const num = Number(value);
  return Number.isInteger(num) && num >= 0;
}

function requireField(
  rowObj: Record<string, string>,
  rowNum: number,
  field: string,
  errors: RowValidationError[],
) {
  if (!rowObj[field]) {
    errors.push({ row: rowNum, field, message: `Missing required field '${field}'` });
    return false;
  }
  return true;
}

/**
 * Validates parsed CSV rows for schema correctness and in-file duplicate keys.
 */
export function validateCsvRows(
  type: ImportEntityType,
  rows: Record<string, string>[],
): CsvValidationResult {
  const errors: RowValidationError[] = [];
  const validRows: Record<string, string>[] = [];

  const seenSkus = new Set<string>();
  const seenSlugs = new Set<string>();
  const seenDeviceCodes = new Set<string>();
  const seenSerials = new Set<string>();

  rows.forEach((row, index) => {
    const rowNum = index + 2; // 1-indexed + header row
    const rowErrorsStart = errors.length;

    if (type === 'products') {
      requireField(row, rowNum, 'sku', errors);
      requireField(row, rowNum, 'slug', errors);
      requireField(row, rowNum, 'name', errors);
      requireField(row, rowNum, 'brand', errors);
      requireField(row, rowNum, 'model', errors);
      requireField(row, rowNum, 'categorySlug', errors);
      requireField(row, rowNum, 'description', errors);

      if (row.sku) {
        if (seenSkus.has(row.sku)) {
          errors.push({ row: rowNum, field: 'sku', message: `Duplicate SKU '${row.sku}' in CSV` });
        }
        seenSkus.add(row.sku);
      }
      if (row.slug) {
        if (seenSlugs.has(row.slug)) {
          errors.push({ row: rowNum, field: 'slug', message: `Duplicate slug '${row.slug}' in CSV` });
        }
        seenSlugs.add(row.slug);
      }
      if (row.condition && !VALID_PRODUCT_CONDITIONS.has(row.condition)) {
        errors.push({ row: rowNum, field: 'condition', message: `Invalid condition '${row.condition}'` });
      }
      if (row.status && !VALID_PRODUCT_STATUSES.has(row.status)) {
        errors.push({ row: rowNum, field: 'status', message: `Invalid status '${row.status}'` });
      }
      if (!isPositiveNumber(row.costPrice)) {
        errors.push({ row: rowNum, field: 'costPrice', message: 'costPrice must be a non-negative number' });
      }
      if (!isPositiveNumber(row.sellingPrice)) {
        errors.push({ row: rowNum, field: 'sellingPrice', message: 'sellingPrice must be a non-negative number' });
      }
      if (row.mrpPrice && !isPositiveNumber(row.mrpPrice)) {
        errors.push({ row: rowNum, field: 'mrpPrice', message: 'mrpPrice must be a non-negative number' });
      }
      if (row.warrantyMonths && !isNonNegativeInt(row.warrantyMonths)) {
        errors.push({ row: rowNum, field: 'warrantyMonths', message: 'warrantyMonths must be an integer >= 0' });
      }
    } else if (type === 'refurbished') {
      [
        'deviceCode',
        'slug',
        'title',
        'brand',
        'model',
        'serialNumber',
        'processor',
        'ram',
        'storage',
        'display',
      ].forEach((field) => requireField(row, rowNum, field, errors));

      if (row.deviceCode) {
        if (seenDeviceCodes.has(row.deviceCode)) {
          errors.push({ row: rowNum, field: 'deviceCode', message: `Duplicate deviceCode '${row.deviceCode}'` });
        }
        seenDeviceCodes.add(row.deviceCode);
      }
      if (row.slug) {
        if (seenSlugs.has(row.slug)) {
          errors.push({ row: rowNum, field: 'slug', message: `Duplicate slug '${row.slug}'` });
        }
        seenSlugs.add(row.slug);
      }
      if (row.serialNumber) {
        if (seenSerials.has(row.serialNumber)) {
          errors.push({ row: rowNum, field: 'serialNumber', message: `Duplicate serialNumber '${row.serialNumber}'` });
        }
        seenSerials.add(row.serialNumber);
      }
      if (row.conditionGrade && !VALID_CONDITION_GRADES.has(row.conditionGrade)) {
        errors.push({ row: rowNum, field: 'conditionGrade', message: `Invalid conditionGrade '${row.conditionGrade}'` });
      }
      if (row.status && !VALID_REFURB_STATUSES.has(row.status)) {
        errors.push({ row: rowNum, field: 'status', message: `Invalid status '${row.status}'` });
      }
      if (!isPositiveNumber(row.acquisitionCost)) {
        errors.push({ row: rowNum, field: 'acquisitionCost', message: 'acquisitionCost must be >= 0' });
      }
      if (row.refurbishmentCost && !isPositiveNumber(row.refurbishmentCost)) {
        errors.push({ row: rowNum, field: 'refurbishmentCost', message: 'refurbishmentCost must be >= 0' });
      }
      if (!isPositiveNumber(row.sellingPrice)) {
        errors.push({ row: rowNum, field: 'sellingPrice', message: 'sellingPrice must be >= 0' });
      }
    } else if (type === 'services') {
      ['slug', 'title', 'categorySlug', 'shortSummary', 'description'].forEach((field) =>
        requireField(row, rowNum, field, errors),
      );
      if (row.slug) {
        if (seenSlugs.has(row.slug)) {
          errors.push({ row: rowNum, field: 'slug', message: `Duplicate slug '${row.slug}'` });
        }
        seenSlugs.add(row.slug);
      }
      if (row.pricingType && !VALID_SERVICE_PRICING.has(row.pricingType)) {
        errors.push({ row: rowNum, field: 'pricingType', message: `Invalid pricingType '${row.pricingType}'` });
      }
      if (row.basePrice && !isPositiveNumber(row.basePrice)) {
        errors.push({ row: rowNum, field: 'basePrice', message: 'basePrice must be >= 0' });
      }
    } else if (type === 'inventory') {
      requireField(row, rowNum, 'sku', errors);
      if (row.sku) {
        if (seenSkus.has(row.sku)) {
          errors.push({ row: rowNum, field: 'sku', message: `Duplicate SKU '${row.sku}'` });
        }
        seenSkus.add(row.sku);
      }
      if (!isNonNegativeInt(row.quantity)) {
        errors.push({ row: rowNum, field: 'quantity', message: 'quantity must be an integer >= 0' });
      }
      if (row.lowStockThreshold && !isNonNegativeInt(row.lowStockThreshold)) {
        errors.push({ row: rowNum, field: 'lowStockThreshold', message: 'lowStockThreshold must be an integer >= 0' });
      }
    }

    if (errors.length === rowErrorsStart) {
      validRows.push(row);
    }
  });

  return {
    type,
    totalRows: rows.length,
    validRows,
    errors,
  };
}

async function runCli() {
  const args = process.argv.slice(2);
  const typeArg = args.find((a) => a.startsWith('--type='))?.split('=')[1] as ImportEntityType | undefined;
  const fileArg = args.find((a) => a.startsWith('--file='))?.split('=')[1];
  const commitMode = args.includes('--commit');

  if (!typeArg || !['products', 'refurbished', 'services', 'inventory'].includes(typeArg) || !fileArg) {
    console.error(
      'Usage: ts-node apps/api/scripts/import-csv.ts --type=<products|refurbished|services|inventory> --file=<path.csv> [--commit]',
    );
    process.exit(1);
  }

  const resolvedPath = path.resolve(process.cwd(), fileArg);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`CSV file not found: ${resolvedPath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(resolvedPath, 'utf8');
  const { rows } = parseCsv(content);
  const result = validateCsvRows(typeArg, rows);

  console.log(
    `[CSV ${commitMode ? 'COMMIT' : 'DRY-RUN'}] type=${typeArg} totalRows=${result.totalRows} valid=${result.validRows.length} errors=${result.errors.length}`,
  );

  if (result.errors.length > 0) {
    result.errors.forEach((err) => {
      console.error(`  Row ${err.row} [${err.field}]: ${err.message}`);
    });
    process.exit(1);
  }

  if (!commitMode) {
    console.log('Dry-run passed. No database changes applied. Re-run with --commit to import.');
    return;
  }

  const prisma = new PrismaClient();
  try {
    await prisma.$transaction(async (tx) => {
      if (typeArg === 'products') {
        for (const row of result.validRows) {
          const category = await tx.category.findUnique({ where: { slug: row.categorySlug } });
          if (!category) {
            throw new Error(`Category slug not found in DB: '${row.categorySlug}' (SKU ${row.sku})`);
          }
          await tx.product.upsert({
            where: { sku: row.sku },
            update: {
              slug: row.slug,
              name: row.name,
              brand: row.brand,
              model: row.model,
              categoryId: category.id,
              condition: (row.condition as ProductCondition) || ProductCondition.NEW,
              costPrice: Number(row.costPrice),
              sellingPrice: Number(row.sellingPrice),
              mrpPrice: row.mrpPrice ? Number(row.mrpPrice) : null,
              warrantyMonths: row.warrantyMonths ? Number(row.warrantyMonths) : 12,
              status: (row.status as ProductStatus) || ProductStatus.DRAFT,
              featured: row.featured === 'true',
              shortSummary: row.shortSummary || null,
              description: row.description,
              isDemo: false,
            },
            create: {
              sku: row.sku,
              slug: row.slug,
              name: row.name,
              brand: row.brand,
              model: row.model,
              categoryId: category.id,
              condition: (row.condition as ProductCondition) || ProductCondition.NEW,
              costPrice: Number(row.costPrice),
              sellingPrice: Number(row.sellingPrice),
              mrpPrice: row.mrpPrice ? Number(row.mrpPrice) : null,
              warrantyMonths: row.warrantyMonths ? Number(row.warrantyMonths) : 12,
              status: (row.status as ProductStatus) || ProductStatus.DRAFT,
              featured: row.featured === 'true',
              shortSummary: row.shortSummary || null,
              description: row.description,
              isDemo: false,
            },
          });
        }
      } else if (typeArg === 'refurbished') {
        for (const row of result.validRows) {
          await tx.refurbishedDevice.upsert({
            where: { deviceCode: row.deviceCode },
            update: {
              slug: row.slug,
              title: row.title,
              brand: row.brand,
              model: row.model,
              serialNumber: row.serialNumber,
              processor: row.processor,
              ram: row.ram,
              storage: row.storage,
              display: row.display,
              graphics: row.graphics || null,
              osInstalled: row.osInstalled || 'Windows 11 Pro',
              batteryHealthPct: row.batteryHealthPct ? Number(row.batteryHealthPct) : null,
              conditionGrade:
                (row.conditionGrade as ConditionGrade) || ConditionGrade.GRADE_A_EXCELLENT,
              warrantyMonths: row.warrantyMonths ? Number(row.warrantyMonths) : 6,
              acquisitionCost: Number(row.acquisitionCost),
              refurbishmentCost: row.refurbishmentCost ? Number(row.refurbishmentCost) : 0,
              sellingPrice: Number(row.sellingPrice),
              status: (row.status as RefurbishedStatus) || RefurbishedStatus.READY_FOR_SALE,
              featured: row.featured === 'true',
              isDemo: false,
            },
            create: {
              deviceCode: row.deviceCode,
              slug: row.slug,
              title: row.title,
              brand: row.brand,
              model: row.model,
              serialNumber: row.serialNumber,
              processor: row.processor,
              ram: row.ram,
              storage: row.storage,
              display: row.display,
              graphics: row.graphics || null,
              osInstalled: row.osInstalled || 'Windows 11 Pro',
              batteryHealthPct: row.batteryHealthPct ? Number(row.batteryHealthPct) : null,
              conditionGrade:
                (row.conditionGrade as ConditionGrade) || ConditionGrade.GRADE_A_EXCELLENT,
              warrantyMonths: row.warrantyMonths ? Number(row.warrantyMonths) : 6,
              acquisitionCost: Number(row.acquisitionCost),
              refurbishmentCost: row.refurbishmentCost ? Number(row.refurbishmentCost) : 0,
              sellingPrice: Number(row.sellingPrice),
              status: (row.status as RefurbishedStatus) || RefurbishedStatus.READY_FOR_SALE,
              featured: row.featured === 'true',
              isDemo: false,
            },
          });
        }
      } else if (typeArg === 'services') {
        for (const row of result.validRows) {
          const category = await tx.serviceCategory.findUnique({ where: { slug: row.categorySlug } });
          if (!category) {
            throw new Error(`ServiceCategory slug not found: '${row.categorySlug}' (${row.slug})`);
          }
          await tx.service.upsert({
            where: { slug: row.slug },
            update: {
              title: row.title,
              categoryId: category.id,
              shortSummary: row.shortSummary,
              description: row.description,
              pricingType: (row.pricingType as ServicePricingType) || ServicePricingType.STARTING_FROM,
              basePrice: row.basePrice ? Number(row.basePrice) : null,
              estimatedTurnaround: row.estimatedTurnaround || '24–48 Hours',
              warrantyNote: row.warrantyNote || null,
              featured: row.featured === 'true',
              active: row.active !== 'false',
              isDemo: false,
            },
            create: {
              slug: row.slug,
              title: row.title,
              categoryId: category.id,
              shortSummary: row.shortSummary,
              description: row.description,
              pricingType: (row.pricingType as ServicePricingType) || ServicePricingType.STARTING_FROM,
              basePrice: row.basePrice ? Number(row.basePrice) : null,
              estimatedTurnaround: row.estimatedTurnaround || '24–48 Hours',
              warrantyNote: row.warrantyNote || null,
              featured: row.featured === 'true',
              active: row.active !== 'false',
              isDemo: false,
            },
          });
        }
      } else if (typeArg === 'inventory') {
        for (const row of result.validRows) {
          const product = await tx.product.findUnique({ where: { sku: row.sku } });
          if (!product) {
            throw new Error(`Product SKU not found in DB: '${row.sku}'`);
          }
          await tx.inventory.upsert({
            where: { productId: product.id },
            update: {
              quantity: Number(row.quantity),
              lowStockThreshold: row.lowStockThreshold ? Number(row.lowStockThreshold) : 3,
              warehouseLocation: row.warehouseLocation || 'Main Showroom',
            },
            create: {
              productId: product.id,
              quantity: Number(row.quantity),
              lowStockThreshold: row.lowStockThreshold ? Number(row.lowStockThreshold) : 3,
              warehouseLocation: row.warehouseLocation || 'Main Showroom',
            },
          });
        }
      }

      await tx.auditLog.create({
        data: {
          action: 'CSV_IMPORT',
          entityType: typeArg,
          safeMetadata: `Imported ${result.validRows.length} rows from ${path.basename(resolvedPath)}`,
        },
      });
    });

    console.log(`Committed ${result.validRows.length} ${typeArg} rows transactionally.`);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  runCli().catch((err) => {
    console.error('CSV import failed:', err?.message || err);
    process.exit(1);
  });
}
