'use client';

import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { apiFetch, formatINR } from '@/lib/api';
import { useApp } from '@/context/app-context';

export default function AdminProductsPage() {
  const { notify } = useApp();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  // Create form
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('Dell');
  const [model, setModel] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [initialStock, setInitialStock] = useState('5');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80',
  );
  const [status, setStatus] = useState<'PUBLISHED' | 'DRAFT'>('PUBLISHED');

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        apiFetch('/admin/products?limit=50'),
        apiFetch('/admin/categories'),
      ]);
      setProducts(prodRes?.data || []);
      setCategories(catRes || []);
      if (!categoryId && catRes?.length > 0) {
        setCategoryId(catRes[0].id);
      }
    } catch (err: any) {
      notify(err.message || 'Unable to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/admin/products', {
        method: 'POST',
        body: JSON.stringify({
          sku,
          name,
          brand,
          model,
          categoryId,
          costPrice: Number(costPrice),
          sellingPrice: Number(sellingPrice),
          initialStock: Number(initialStock),
          description,
          status,
          images: imageUrl ? [{ url: imageUrl, isPrimary: true }] : [],
        }),
      });
      notify(`Created product ${name} (${sku})`);
      setShowCreate(false);
      setSku('');
      setName('');
      setModel('');
      await loadData();
    } catch (err: any) {
      notify(err.message || 'Failed to create product', 'error');
    }
  };

  const handleToggleStatus = async (product: any) => {
    const nextStatus = product.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await apiFetch(`/admin/products/${product.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      notify(
        `Product "${product.name}" is now ${nextStatus} (Storefront updated immediately)`,
      );
      await loadData();
    } catch (err: any) {
      notify(err.message || 'Could not update product status', 'error');
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await apiFetch(`/admin/products/${id}`, { method: 'DELETE' });
      notify('Product archived');
      await loadData();
    } catch (err: any) {
      notify(err.message || 'Failed to archive product', 'error');
    }
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Product Catalogue Management
          </h1>
          <p className="text-slate-500">
            Publishing or updating a product immediately updates the customer storefront.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>{showCreate ? 'Close Form' : 'Create Product'}</span>
        </button>
      </div>

      {showCreate && (
        <form
          onSubmit={handleCreateProduct}
          className="rounded-xl border border-slate-200 bg-white p-5 space-y-4"
        >
          <h2 className="text-sm font-bold text-slate-900">
            Create New Hardware Product
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">SKU *</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="KI-LAP-050"
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dell Latitude 5440 (Core i7 / 16GB / 512GB)"
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Brand *</label>
              <input
                type="text"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Model *</label>
              <input
                type="text"
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Latitude 5440"
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Cost Price (INR — Private) *
              </label>
              <input
                type="number"
                required
                min={0}
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Selling Price (INR — Public) *
              </label>
              <input
                type="number"
                required
                min={0}
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Initial Stock *
              </label>
              <input
                type="number"
                required
                min={0}
                value={initialStock}
                onChange={(e) => setInitialStock(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Primary Image URL
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Publication Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'PUBLISHED' | 'DRAFT')}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2"
              >
                <option value="PUBLISHED">PUBLISHED (Live on Storefront)</option>
                <option value="DRAFT">DRAFT (Hidden from Visitors)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Description *
            </label>
            <textarea
              rows={2}
              required
              minLength={10}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </div>

          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-5 py-2.5 font-semibold text-white hover:bg-slate-800"
          >
            Save &amp; Create Product
          </button>
        </form>
      )}

      {/* Products Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
              <th className="p-3">SKU / Product</th>
              <th className="p-3">Category</th>
              <th className="p-3">Cost (Private)</th>
              <th className="p-3">Selling Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-400">
                  Loading products...
                </td>
              </tr>
            ) : (
              products.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-50/70">
                  <td className="p-3">
                    <span className="font-mono text-[11px] text-slate-500 block">
                      {prod.sku}
                    </span>
                    <span className="font-semibold text-slate-900">{prod.name}</span>
                  </td>
                  <td className="p-3 text-slate-600">{prod.category?.name}</td>
                  <td className="p-3 text-slate-500">{formatINR(prod.costPrice)}</td>
                  <td className="p-3 font-bold text-slate-900">
                    {formatINR(prod.sellingPrice)}
                  </td>
                  <td className="p-3">
                    <span
                      className={`rounded px-2 py-0.5 font-semibold ${
                        prod.availableQuantity > 0
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {prod.availableQuantity} units
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`rounded px-2 py-0.5 font-semibold ${
                        prod.status === 'PUBLISHED'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {prod.status}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => handleToggleStatus(prod)}
                      className="rounded border border-slate-200 px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      {prod.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                    </button>
                    {prod.status !== 'ARCHIVED' && (
                      <button
                        onClick={() => handleArchive(prod.id)}
                        className="rounded border border-red-200 px-2.5 py-1 font-semibold text-red-600 hover:bg-red-50"
                      >
                        Archive
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
