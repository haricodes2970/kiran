import { parseCsv, validateCsvRows } from './import-csv';

describe('CSV Import Parser & Validator', () => {
  it('parses quoted CSV fields with commas cleanly', () => {
    const csv = `sku,slug,name,brand,model,categorySlug,condition,costPrice,sellingPrice,mrpPrice,warrantyMonths,status,featured,shortSummary,description
KI-1,slug-1,"Laptop, 16GB RAM",Lenovo,T14,laptops,NEW,50000,60000,65000,12,PUBLISHED,true,"Fast, reliable","Full description"`;
    const parsed = parseCsv(csv);
    expect(parsed.rows).toHaveLength(1);
    expect(parsed.rows[0].name).toBe('Laptop, 16GB RAM');
    const res = validateCsvRows('products', parsed.rows);
    expect(res.errors).toHaveLength(0);
    expect(res.validRows).toHaveLength(1);
  });

  it('reports field-level errors and duplicate SKUs without throwing', () => {
    const csv = `sku,slug,name,brand,model,categorySlug,condition,costPrice,sellingPrice,description
KI-1,s1,Laptop A,Dell,5420,laptops,NEW,-10,50000,Desc
KI-1,s1,Laptop B,Dell,5430,laptops,INVALID,1000,abc,Desc`;
    const parsed = parseCsv(csv);
    const res = validateCsvRows('products', parsed.rows);
    expect(res.validRows).toHaveLength(0);
    expect(res.errors.some((e) => e.row === 2 && e.field === 'costPrice')).toBe(true);
    expect(res.errors.some((e) => e.row === 3 && e.field === 'sku')).toBe(true);
    expect(res.errors.some((e) => e.row === 3 && e.field === 'condition')).toBe(true);
    expect(res.errors.some((e) => e.row === 3 && e.field === 'sellingPrice')).toBe(true);
  });
});
