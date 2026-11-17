'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Filter,
  HardDrive,
  MessageCircle,
  Search,
  ShoppingCart,
} from 'lucide-react';
import { apiFetch, buildWhatsAppUrl, formatINR } from '@/lib/api';
import { useApp } from '@/context/app-context';

function ProductsContent() {
  const searchParams = useSearchParams();
  const { addToCart } = useApp();

  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 12, totalPages: 1 });
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [search, categorySlug, brand, condition, inStockOnly, maxPrice, sortBy, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Kiran&apos;s Infotech Storefront
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Computer Hardware &amp; Accessories Catalogue
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Showing {products.length} of {meta.total} published products
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-slate-600">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-3 space-y-5">
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-800">
                <Filter className="h-3.5 w-3.5 text-blue-600" /> Filter Hardware
              </span>
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setCategorySlug('');
                  setBrand('');
                  setCondition('');
                  setInStockOnly(false);
                  setMaxPrice('');
                  setPage(1);
                }}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Reset
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Keyword / Model / SKU
              </label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="e.g. Latitude, NVMe, DDR5..."
                  className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-1.5 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Category
              </label>
              <select
                value={categorySlug}
                onChange={(e) => {
                  setCategorySlug(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Brand
              </label>
              <select
                value={brand}
                onChange={(e) => {
                  setBrand(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Condition
              </label>
              <select
                value={condition}
                onChange={(e) => {
                  setCondition(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
              >
                <option value="">All Conditions</option>
                <option value="NEW">Brand New</option>
                <option value="OPEN_BOX">Open Box</option>
                <option value="REFURBISHED">Refurbished</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Max Price (INR)
              </label>
              <select
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
              >
                <option value="">Any Price</option>
                <option value="5000">Under ₹5,000</option>
                <option value="15000">Under ₹15,000</option>
                <option value="35000">Under ₹35,000</option>
                <option value="65000">Under ₹65,000</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => {
                  setInStockOnly(e.target.checked);
                  setPage(1);
                }}
                className="rounded border-slate-300 text-blue-600"
              />
              <span>In-Stock Items Only</span>
            </label>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="lg:col-span-9 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 rounded-xl bg-slate-200 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center space-y-3">
              <p className="text-base font-semibold text-slate-800">
                No hardware products match your current filters
              </p>
              <p className="text-xs text-slate-500">
                Try clearing a filter or enquire on WhatsApp for custom part sourcing.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  className="rounded-xl border border-slate-200 bg-white overflow-hidden flex flex-col justify-between hover:shadow-md transition"
                >
                  <div>
                    <div className="relative h-44 bg-slate-100 border-b border-slate-100">
                      {prod.images?.[0]?.url ? (
                        <img
                          src={prod.images[0].url}
                          alt={prod.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center text-slate-400">
                          <HardDrive className="h-10 w-10" />
                        </div>
                      )}
                      <span
                        className={`absolute top-2.5 left-2.5 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                          prod.inStock
                            ? 'bg-emerald-600 text-white'
                            : 'bg-red-600 text-white'
                        }`}
                      >
                        {prod.inStock
                          ? `In Stock (${prod.availableQuantity})`
                          : 'Out of Stock'}
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-semibold text-blue-600">
                          {prod.brand}
                        </span>
                        <span>{prod.category?.name}</span>
                      </div>
                      <Link
                        href={`/products/${prod.slug}`}
                        className="block font-semibold text-slate-900 hover:text-blue-600 line-clamp-2 text-sm leading-snug"
                      >
                        {prod.name}
                      </Link>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {prod.shortSummary || prod.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 pt-0 space-y-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-slate-900">
                        {formatINR(prod.sellingPrice)}
                      </span>
                      {prod.mrpPrice && prod.mrpPrice > prod.sellingPrice && (
                        <span className="text-xs text-slate-400 line-through">
                          {formatINR(prod.mrpPrice)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/products/${prod.slug}`}
                        className="flex-1 text-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Details
                      </Link>
                      <button
                        disabled={!prod.inStock}
                        onClick={() =>
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
                        className="inline-flex items-center justify-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-40"
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        <span>Add</span>
                      </button>
                      <a
                        href={buildWhatsAppUrl(
                          `Hello Kiran's Infotech, I am interested in ${prod.name} (SKU: ${prod.sku}, Price: ${formatINR(prod.sellingPrice)}). Is it available?`,
                        )}
                        target="_blank"
                        rel="noreferrer"
                        title="Enquire on WhatsApp"
                        className="inline-flex items-center justify-center rounded-lg bg-emerald-600 p-2 text-white hover:bg-emerald-500"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-xs font-medium text-slate-600">
                Page {meta.page} of {meta.totalPages}
              </span>
              <button
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm">Loading catalogue...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
