'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ChevronDown, ChevronUp, Package, Search } from 'lucide-react';
import { apiFetch, formatINR } from '@/lib/api';
import { useApp } from '@/context/app-context';
import { AccountShell } from '@/components/account/account-shell';

const ORDER_STATUS_OPTIONS = [
  'PENDING_CONFIRMATION',
  'CONFIRMED',
  'PROCESSING',
  'READY_FOR_PICKUP',
  'DISPATCHED',
  'COMPLETED',
  'CANCELLED',
] as const;

export default function CustomerOrdersPage() {
  const { user } = useApp();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);
    setError(null);

    apiFetch('/me/orders')
      .then((res) => {
        if (active) setOrders(Array.isArray(res) ? res : []);
      })
      .catch((err: any) => {
        if (active) setError(err?.message || 'Unable to load order history.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((ord) => {
      if (statusFilter && ord.status !== statusFilter) return false;
      if (!q) return true;
      const inRef = String(ord.reference || '').toLowerCase().includes(q);
      const inItems = (ord.items || []).some(
        (it: any) =>
          String(it.productName || '').toLowerCase().includes(q) ||
          String(it.productSku || '').toLowerCase().includes(q),
      );
      return inRef || inItems;
    });
  }, [orders, search, statusFilter]);

  return (
    <AccountShell counts={{ orders: orders.length }}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-fg">
              My Hardware Orders &amp; Purchase Requests
            </h2>
            <p className="text-xs text-muted mt-0.5">
              All order items preserve your unit price snapshot at the time of request.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reference or item..."
                aria-label="Search order requests"
                className="glass-input rounded-control pl-8 pr-3 py-2 w-56"
              />
            </div>

            <select
              aria-label="Filter orders by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="glass-input rounded-control px-3 py-2 font-medium"
            >
              <option value="">All Order Statuses</option>
              {ORDER_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-card border border-red-300 bg-red-50 dark:bg-red-950/60 dark:border-red-500/40 p-4 text-xs text-red-700 dark:text-red-200 flex items-center gap-2"
          >
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-36 rounded-card bg-panel animate-pulse border border-subtle" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="surface-card p-12 text-center space-y-3">
            <Package className="h-10 w-10 text-muted mx-auto" aria-hidden="true" />
            <p className="text-sm font-bold text-fg">No order requests found</p>
            <p className="text-xs text-muted">
              Add products or refurbished laptops to your cart to submit an order request.
            </p>
            <Link
              href="/products"
              className="inline-block rounded-control bg-brand-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-brand-700 transition-colors"
            >
              Browse Hardware Catalogue
            </Link>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="surface-card p-8 text-center space-y-3">
            <p className="text-sm font-semibold text-fg">
              No order requests match your search or status filter
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setStatusFilter('');
              }}
              className="rounded-control border border-subtle bg-panel-2 px-4 py-2 text-xs font-semibold text-fg hover:border-accent"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((ord) => {
              const isExpanded = expandedId === ord.id;
              return (
                <article
                  key={ord.id}
                  className="surface-card p-5 space-y-4 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-subtle pb-3">
                    <div>
                      <span className="font-mono font-bold text-sm text-fg">
                        {ord.reference}
                      </span>
                      <span className="text-muted ml-3">
                        {new Date(ord.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-blue-500/15 border border-blue-400/30 px-2.5 py-1 font-semibold text-accent">
                        Order: {ord.status}
                      </span>
                      <span className="rounded-md border border-subtle bg-panel-2 px-2.5 py-1 font-semibold text-fg">
                        Payment: {ord.paymentStatus}
                      </span>
                      <span className="rounded-md border border-subtle bg-panel-2 px-2.5 py-1 font-medium text-muted">
                        {ord.fulfilmentType}
                      </span>
                    </div>
                  </div>

                  <div className="divide-y divide-subtle">
                    {(ord.items || []).map((item: any) => (
                      <div
                        key={item.id}
                        className="py-2.5 flex items-center justify-between gap-4"
                      >
                        <div>
                          <p className="font-semibold text-fg">{item.productName}</p>
                          <p className="text-muted font-mono text-[11px]">
                            SKU: {item.productSku} · Qty: {item.quantity} ×{' '}
                            {formatINR(item.unitPrice)}
                          </p>
                        </div>
                        <span className="font-display font-bold text-fg">
                          {formatINR(item.lineTotal)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-subtle">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : ord.id)}
                      aria-expanded={isExpanded}
                      className="inline-flex items-center gap-1 font-semibold text-accent hover:underline"
                    >
                      <span>{isExpanded ? 'Hide Fulfilment Details' : 'View Fulfilment Details'}</span>
                      {isExpanded ? (
                        <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                    </button>

                    <span className="font-display text-sm font-bold text-fg">
                      Total: {formatINR(ord.totalAmount)}
                    </span>
                  </div>

                  {isExpanded && (
                    <div className="rounded-control border border-subtle bg-panel-2 p-3.5 space-y-1.5 text-xs">
                      <p>
                        <span className="font-semibold text-fg">Recipient: </span>
                        <span className="text-muted">{ord.shippingRecipient} ({ord.shippingPhone})</span>
                      </p>
                      <p>
                        <span className="font-semibold text-fg">Address / Pickup: </span>
                        <span className="text-muted">{ord.shippingAddressText}</span>
                      </p>
                      {ord.gstNumber && (
                        <p>
                          <span className="font-semibold text-fg">GSTIN: </span>
                          <span className="font-mono text-muted">{ord.gstNumber}</span>
                        </p>
                      )}
                      {ord.customerNotes && (
                        <p>
                          <span className="font-semibold text-fg">Notes: </span>
                          <span className="text-muted">{ord.customerNotes}</span>
                        </p>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </AccountShell>
  );
}
