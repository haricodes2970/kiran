# Business Data CSV Import Guide (Phase 4E)

Use the templates in `templates/` to prepare real business data before production launch. **Never migrate demo records into production.**

## 1. Templates

- `templates/products.csv` — New hardware products (`sku`, `slug`, `categorySlug`, pricing, `PUBLISHED`/`DRAFT`)
- `templates/refurbished.csv` — Graded refurbished laptops (`deviceCode`, `serialNumber`, specs, battery health, `conditionGrade`, `READY_FOR_SALE`)
- `templates/services.csv` — Repair & upgrade catalog (`slug`, `categorySlug`, `pricingType`, `basePrice`)
- `templates/inventory.csv` — Stock counts per product `sku` (`quantity`, `lowStockThreshold`, `warehouseLocation`)

## 2. Import Order (Important)

1. Ensure `Category` and `ServiceCategory` slugs exist in the database.
2. Import `products.csv` first.
3. Import `inventory.csv` (references `Product.sku`).
4. Import `refurbished.csv` and `services.csv`.

## 3. Running Dry-Run Validation (Default)

Always validate CSV files with dry-run mode before touching the database:

```bash
npx ts-node apps/api/scripts/import-csv.ts --type=products --file=templates/products.csv
npx ts-node apps/api/scripts/import-csv.ts --type=refurbished --file=templates/refurbished.csv
npx ts-node apps/api/scripts/import-csv.ts --type=services --file=templates/services.csv
npx ts-node apps/api/scripts/import-csv.ts --type=inventory --file=templates/inventory.csv
```

Dry-run checks required fields, numeric/enum validity, and duplicate `sku` / `slug` / `deviceCode` / `serialNumber` values, reporting exact row numbers and field names on error.

## 4. Committing Transactionally to Database

Once dry-run passes with `errors=0`, pass `--commit`:

```bash
npx ts-node apps/api/scripts/import-csv.ts --type=products --file=path/to/real-products.csv --commit
```

All rows execute inside a single Prisma `$transaction` (`isDemo=false`, idempotent upsert on unique key) and record a `CSV_IMPORT` entry in `AuditLog`.
