'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Filter, HardDrive, MessageCircle, Search, SlidersHorizontal, X } from 'lucide-react';
import { apiFetch, buildWhatsAppUrl, formatINR } from '@/lib/api';
import { useApp } from '@/context/app-context';
import { AddToCartButton } from '@/components/ui/add-to-cart-button';

function ProductsContent() {
  const searchParams = useSearchParams();
  const { addToCart } = useApp();

  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 12, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [categorySlug, setCategorySlug] = useState(
    searchParams.get('categorySlug') || '',
  );
  const [brand, setBrand] = useState('');
  const [condition, setCondition] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setCategorySlug(searchParams.get('categorySlug') || '');
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    if (!mobileFiltersOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileFiltersOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileFiltersOpen]);

  useEffect(() => {
    Promise.all([apiFetch('/categories'), apiFetch('/products/brands')])
      .then(([cats, br]) => {
        setCategories(cats || []);
        setBrands(br || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search.trim()) params.set('search', search.trim());
        if (categorySlug) params.set('categorySlug', categorySlug);
        if (brand) params.set('brand', brand);
        if (condition) params.set('condition', condition);
        if (inStockOnly) params.set('inStock', 'true');
        if (maxPrice) params.set('maxPrice', maxPrice);
        params.set('sortBy', sortBy);
        params.set('page', String(page));
        params.set('limit', '12');

        const res = await apiFetch(`/products?${params.toString()}`);
        setProducts(res?.data || []);
        setMeta(res?.meta || { total: 0, page: 1, limit: 12, totalPages: 1 });
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [search, categorySlug, brand, condition, inStockOnly, maxPrice, sortBy, page]);

  const activeFilterCount = [
    search.trim(),
    categorySlug,
    brand,
    condition,
    inStockOnly ? '1' : '',
    maxPrice,
  ].filter(Boolean).length;

  const resetAllFilters = () => {
    setSearch('');
    setCategorySlug('');
    setBrand('');
    setCondition('');
    setInStockOnly(false);
    setMaxPrice('');
    setPage(1);
  };

  const renderFilterControls = () => (
    <div className="space-y-4">
      <div>
        <label htmlFor="filter-keyword" className="block text-xs font-semibold text-fg mb-1.5">
          Keyword / Model / SKU
        </label>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="filter-keyword"
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="e.g. Latitude, NVMe, DDR5..."
            className="glass-input w-full rounded-control pl-8 pr-3 py-2 text-xs"
          />
        </div>
      </div>

      <div>
        <label htmlFor="filter-category" className="block text-xs font-semibold text-fg mb-1.5">
          Category
        </label>
        <select
          id="filter-category"
          value={categorySlug}
          onChange={(e) => {
            setCategorySlug(e.target.value);
            setPage(1);
          }}
          className="glass-input w-full rounded-control px-3 py-2 text-xs"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name} ({c.productCount ?? 0})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-brand" className="block text-xs font-semibold text-fg mb-1.5">
          Brand
        </label>
        <select
          id="filter-brand"
          value={brand}
          onChange={(e) => {
            setBrand(e.target.value);
            setPage(1);
          }}
          className="glass-input w-full rounded-control px-3 py-2 text-xs"
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-condition" className="block text-xs font-semibold text-fg mb-1.5">
          Condition
        </label>
        <select
          id="filter-condition"
          value={condition}
          onChange={(e) => {
            setCondition(e.target.value);
            setPage(1);
          }}
          className="glass-input w-full rounded-control px-3 py-2 text-xs"
        >
          <option value="">All Conditions</option>
          <option value="NEW">Brand New</option>
          <option value="OPEN_BOX">Open Box</option>
          <option value="REFURBISHED">Refurbished</option>
        </select>
      </div>

      <div>
        <label htmlFor="filter-max-price" className="block text-xs font-semibold text-fg mb-1.5">
          Max Price (INR)
        </label>
        <select
          id="filter-max-price"
          value={maxPrice}
          onChange={(e) => {
            setMaxPrice(e.target.value);
            setPage(1);
          }}
          className="glass-input w-full rounded-control px-3 py-2 text-xs"
        >
          <option value="">Any Price</option>
          <option value="5000">Under ₹5,000</option>
          <option value="15000">Under ₹15,000</option>
          <option value="35000">Under ₹35,000</option>
          <option value="65000">Under ₹65,000</option>
        </select>
      </div>

      <label className="flex items-center gap-2 text-xs font-medium text-fg cursor-pointer pt-1">
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(e) => {
            setInStockOnly(e.target.checked);
            setPage(1);
          }}
          className="rounded border-subtle text-brand-600"
        />
        <span>In-Stock Items Only</span>
      </label>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-subtle pb-5">
        <div>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
            Hardware Catalogue
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-fg mt-1">
            Computer Hardware &amp; Accessories
          </h1>
          <p className="text-sm text-muted mt-0.5">
            Showing {products.length} of {meta.total} published products
          </p>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2.5">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            data-testid="mobile-filter-trigger"
            className="lg:hidden inline-flex items-center gap-2 rounded-control border border-subtle bg-panel px-3.5 py-2 text-xs font-semibold text-fg hover:border-accent transition-colors"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded bg-brand-600 px-1 font-mono text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="flex items-center gap-2">
            <label htmlFor="sort-products" className="text-xs font-medium text-muted hidden sm:inline">
              Sort by:
            </label>
            <select
              id="sort-products"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="glass-input rounded-control px-3 py-2 text-xs font-medium"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Summary Chips (quick clear) */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {categorySlug && (
            <button
              type="button"
              onClick={() => {
                setCategorySlug('');
                setPage(1);
              }}
              className="inline-flex items-center gap-1.5 rounded-md border border-subtle bg-panel px-2.5 py-1 text-xs font-medium text-fg hover:border-accent"
            >
              <span>Category: {categorySlug}</span>
              <X className="h-3 w-3 text-muted" aria-hidden="true" />
            </button>
          )}
          {brand && (
            <button
              type="button"
              onClick={() => {
                setBrand('');
                setPage(1);
              }}
              className="inline-flex items-center gap-1.5 rounded-md border border-subtle bg-panel px-2.5 py-1 text-xs font-medium text-fg hover:border-accent"
            >
              <span>Brand: {brand}</span>
              <X className="h-3 w-3 text-muted" aria-hidden="true" />
            </button>
          )}
          {condition && (
            <button
              type="button"
              onClick={() => {
                setCondition('');
                setPage(1);
              }}
              className="inline-flex items-center gap-1.5 rounded-md border border-subtle bg-panel px-2.5 py-1 text-xs font-medium text-fg hover:border-accent"
            >
              <span>Condition: {condition.replace('_', ' ')}</span>
              <X className="h-3 w-3 text-muted" aria-hidden="true" />
            </button>
          )}
          {maxPrice && (
            <button
              type="button"
              onClick={() => {
                setMaxPrice('');
                setPage(1);
              }}
              className="inline-flex items-center gap-1.5 rounded-md border border-subtle bg-panel px-2.5 py-1 text-xs font-medium text-fg hover:border-accent"
            >
              <span>Under {formatINR(maxPrice)}</span>
              <X className="h-3 w-3 text-muted" aria-hidden="true" />
            </button>
          )}
          {inStockOnly && (
            <button
              type="button"
              onClick={() => {
                setInStockOnly(false);
                setPage(1);
              }}
              className="inline-flex items-center gap-1.5 rounded-md border border-subtle bg-panel px-2.5 py-1 text-xs font-medium text-fg hover:border-accent"
            >
              <span>In Stock Only</span>
              <X className="h-3 w-3 text-muted" aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            onClick={resetAllFilters}
            className="text-xs font-semibold text-accent hover:underline ml-1"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Desktop Sticky Filter Sidebar */}
        <aside className="hidden lg:block lg:col-span-3">
          <div className="glass-filter sticky top-28 rounded-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-subtle pb-3">
              <span className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-fg">
                <Filter className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                <span>Filter Hardware</span>
              </span>
              <button
                type="button"
                onClick={resetAllFilters}
                className="text-xs font-semibold text-accent hover:underline"
              >
                Reset
              </button>
            </div>
            {renderFilterControls()}
          </div>
        </aside>

        {/* Product Grid */}
        <div className="lg:col-span-9 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 rounded-card bg-panel animate-pulse border border-subtle" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="surface-card p-10 text-center space-y-3">
              <p className="text-base font-semibold text-fg">
                No hardware products match your current filters
              </p>
              <p className="text-xs text-muted">
                Clear active filters or contact us on WhatsApp for custom part sourcing.
              </p>
              <button
                type="button"
                onClick={resetAllFilters}
                className="inline-flex items-center rounded-control bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((prod) => (
                <article
                  key={prod.id}
                  className="surface-card overflow-hidden flex flex-col justify-between hover:border-accent hover:shadow-card transition-all duration-200"
                >
                  <div>
                    <Link
                      href={`/products/${prod.slug}`}
                      className="block relative aspect-[4/3] bg-panel-2 border-b border-subtle overflow-hidden group"
                    >
                      {prod.images?.[0]?.url ? (
                        <img
                          src={prod.images[0].url}
                          alt={prod.name}
                          loading="lazy"
                          className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center text-muted">
                          <HardDrive className="h-10 w-10" aria-hidden="true" />
                        </div>
                      )}
                      <span
                        className={`absolute top-3 left-3 rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold uppercase border ${
                          prod.inStock
                            ? 'bg-emerald-50/95 text-emerald-800 border-emerald-300/80 dark:bg-emerald-950/85 dark:text-emerald-300 dark:border-emerald-400/30'
                            : 'bg-slate-100/95 text-slate-700 border-slate-300 dark:bg-slate-900/85 dark:text-slate-300 dark:border-white/15'
                        }`}
                      >
                        {prod.inStock
                          ? `In Stock (${prod.availableQuantity})`
                          : 'Out of Stock'}
                      </span>
                    </Link>

                    <div className="p-4 sm:p-5 space-y-2">
                      <div className="flex items-center justify-between font-mono text-[11px] text-muted">
                        <span className="font-semibold text-accent uppercase">
                          {prod.brand}
                        </span>
                        <span className="truncate max-w-[120px]">{prod.category?.name}</span>
                      </div>
                      <Link
                        href={`/products/${prod.slug}`}
                        className="block font-display font-semibold text-fg hover:text-accent line-clamp-2 text-base leading-snug transition-colors"
                      >
                        {prod.name}
                      </Link>
                      <p className="text-xs text-muted line-clamp-2">
                        {prod.shortSummary || prod.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 pt-0 space-y-3">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-xl font-bold text-fg">
                          {formatINR(prod.sellingPrice)}
                        </span>
                        {prod.mrpPrice && Number(prod.mrpPrice) > Number(prod.sellingPrice) && (
                          <span className="text-xs text-muted line-through">
                            {formatINR(prod.mrpPrice)}
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                        Order Request Only
                      </span>
                    </div>

                    <div className="space-y-2">
                      <AddToCartButton
                        disabled={!prod.inStock}
                        showCartLink
                        onAdd={() =>
                          addToCart({
                            id: prod.id,
                            type: 'PRODUCT',
                            name: prod.name,
                            sku: prod.sku,
                            slug: prod.slug,
                            price: prod.sellingPrice,
                            maxStock: prod.availableQuantity,
                            imageUrl: prod.images?.[0]?.url,
                          })
                        }
                        className="w-full"
                      />

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/products/${prod.slug}`}
                          className="flex-1 text-center rounded-control border border-subtle bg-panel-2 px-3 py-1.5 text-xs font-semibold text-fg hover:border-accent transition-colors"
                        >
                          Inspect Product
                        </Link>
                        <a
                          href={buildWhatsAppUrl(
                            `Hello Kiran's Infotech, I am interested in ${prod.name} (SKU: ${prod.sku}, Price: ${formatINR(prod.sellingPrice)}). Is it available?`,
                          )}
                          target="_blank"
                          rel="noreferrer"
                          title="Enquire on WhatsApp"
                          aria-label={`WhatsApp enquiry for ${prod.name}`}
                          className="inline-flex items-center justify-center gap-1 rounded-control border border-emerald-600/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                        >
                          <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Enquire</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-control border border-subtle bg-panel px-4 py-1.5 text-xs font-semibold text-fg hover:border-accent disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              <span className="text-xs font-medium text-muted px-2">
                Page {meta.page} of {meta.totalPages}
              </span>
              <button
                type="button"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-control border border-subtle bg-panel px-4 py-1.5 text-xs font-semibold text-fg hover:border-accent disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Responsive Mobile Filter Drawer */}
      {mobileFiltersOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="Filter Hardware"
          data-testid="mobile-filter-drawer"
        >
          <div
            className="fixed inset-0 bg-[#071122]/60 backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-xs h-full glass-modal border-l border-subtle p-5 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-subtle pb-3">
                <span className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-fg">
                  <Filter className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                  <span>Filter Hardware</span>
                </span>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  aria-label="Close filters"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-control border border-subtle bg-panel text-fg"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {renderFilterControls()}
            </div>

            <div className="pt-5 mt-5 border-t border-subtle flex items-center gap-2">
              <button
                type="button"
                onClick={resetAllFilters}
                className="flex-1 rounded-control border border-subtle bg-panel py-2.5 text-xs font-semibold text-fg"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 rounded-control bg-brand-600 py-2.5 text-xs font-semibold text-white hover:bg-brand-700"
              >
                Show {meta.total} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-muted">Loading catalogue...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
