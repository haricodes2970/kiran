'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useApp } from '@/context/app-context';

export default function AdminInventoryPage() {
  const { notify } = useApp();
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'low_stock' | 'out_of_stock'>('all');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [changeQty, setChangeQty] = useState('5');
  const [reason, setReason] = useState('RESTOCK');
  const [notes, setNotes] = useState('');

  const load = async () => {
    try {
      const res = await apiFetch(`/admin/inventory?filter=${filter}`);
      setItems(res || []);
      if (!selectedProductId && res?.length > 0) {
        setSelectedProductId(res[0].productId);
      }
    } catch (err: any) {
      notify(err.message || 'Unable to load inventory', 'error');
    }
  };

  useEffect(() => {
    load();
  }, [filter]);

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/admin/inventory/adjustments', {
        method: 'POST',
        body: JSON.stringify({
          productId: selectedProductId,
          changeQuantity: Number(changeQty),
          reason,
          notes: notes || undefined,
        }),
      });
      notify('Stock updated transactionally & movement logged');
      setNotes('');
      await load();
    } catch (err: any) {
      notify(err.message || 'Stock adjustment failed', 'error');
    }
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Inventory &amp; Stock Ledger
          </h1>
          <p className="text-slate-500">
            Transactional stock adjustments update product availability across the storefront immediately.
          </p>
        </div>

        <div className="flex gap-2">
          {(['all', 'low_stock', 'out_of_stock'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 font-semibold ${
                filter === f
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-700'
              }`}
            >
              {f === 'all'
                ? 'All Stock'
                : f === 'low_stock'
                  ? 'Low Stock'
                  : 'Out of Stock'}
            </button>
          ))}
        </div>
      </div>

      {/* Transactional Stock Adjustment Form */}
      <form
        onSubmit={handleAdjust}
        className="rounded-xl border border-slate-200 bg-white p-5 space-y-3"
      >
        <h2 className="text-sm font-bold text-slate-900">
          Record Stock Movement / Adjustment
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">
              Product
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2"
            >
              {items.map((inv) => (
                <option key={inv.productId} value={inv.productId}>
                  {inv.product.sku} — {inv.product.name} (Current: {inv.availableQuantity})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Qty Delta (+ / -)
            </label>
            <input
              type="number"
              required
              value={changeQty}
              onChange={(e) => setChangeQty(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2"
            >
              <option value="RESTOCK">RESTOCK</option>
              <option value="MANUAL_ADJUSTMENT">MANUAL_ADJUSTMENT</option>
              <option value="DAMAGED_WRITEOFF">DAMAGED_WRITEOFF</option>
              <option value="RETURNED">RETURNED</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Supplier invoice or adjustment note..."
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2"
          />
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
          >
            Apply Stock Change
          </button>
        </div>
      </form>

      {/* Inventory Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
              <th className="p-3">SKU &amp; Product</th>
              <th className="p-3">Available</th>
              <th className="p-3">Threshold</th>
              <th className="p-3">Status</th>
              <th className="p-3">Latest Movement</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((inv) => (
              <tr key={inv.id}>
                <td className="p-3">
                  <span className="font-mono text-slate-500 block">
                    {inv.product.sku}
                  </span>
                  <span className="font-semibold text-slate-900">
                    {inv.product.name}
                  </span>
                </td>
                <td className="p-3 font-bold text-sm text-slate-900">
                  {inv.availableQuantity}
                </td>
                <td className="p-3 text-slate-500">{inv.lowStockThreshold}</td>
                <td className="p-3">
                  {inv.isOutOfStock ? (
                    <span className="rounded bg-red-100 px-2 py-0.5 font-bold text-red-700">
                      OUT OF STOCK
                    </span>
                  ) : inv.isLowStock ? (
                    <span className="rounded bg-amber-100 px-2 py-0.5 font-bold text-amber-800">
                      LOW STOCK
                    </span>
                  ) : (
                    <span className="rounded bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700">
                      HEALTHY
                    </span>
                  )}
                </td>
                <td className="p-3 text-slate-500">
                  {inv.transactions?.[0]
                    ? `${inv.transactions[0].reason} (${
                        inv.transactions[0].changeQuantity > 0 ? '+' : ''
                      }${inv.transactions[0].changeQuantity})`
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
