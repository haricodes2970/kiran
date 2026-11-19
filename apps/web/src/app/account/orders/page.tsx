'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Package } from 'lucide-react';
import { apiFetch, formatINR } from '@/lib/api';

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/me/orders')
      .then((res) => setOrders(res || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <Link
        href="/account"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-accent transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Customer Dashboard
      </Link>

      <div>
        <h1 className="font-display text-2xl font-bold text-fg">
          My Hardware Orders &amp; Purchase Requests
        </h1>
        <p className="text-xs text-muted mt-0.5">
          All order items preserve your unit price snapshot at the time of request.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-muted">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center space-y-3">
          <Package className="h-10 w-10 text-muted mx-auto" />
          <p className="text-sm font-bold text-fg">No orders found</p>
          <Link
            href="/products"
            className="inline-block rounded-full bg-brand-600 px-5 py-2 text-xs font-semibold text-white"
          >
            Browse Hardware Catalogue
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="glass-card rounded-2xl p-5 space-y-4 text-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-subtle pb-3">
                <div>
                  <span className="font-mono font-bold text-sm text-fg">
                    {ord.reference}
                  </span>
                  <span className="text-muted ml-3">
                    {new Date(ord.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-blue-500/15 px-3 py-1 font-semibold text-accent">
                    Order: {ord.status}
                  </span>
                  <span className="glass-pill rounded-full px-3 py-1 font-semibold text-fg">
                    Payment: {ord.paymentStatus}
                  </span>
                  <span className="glass-pill rounded-full px-3 py-1 font-medium text-muted">
                    {ord.fulfilmentType}
                  </span>
                </div>
              </div>

              <div className="divide-y divide-subtle">
                {ord.items?.map((item: any) => (
                  <div
                    key={item.id}
                    className="py-2.5 flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="font-semibold text-fg">{item.productName}</p>
                      <p className="text-muted font-mono text-[11px]">
                        SKU: {item.productSku} • Qty: {item.quantity} ×{' '}
                        {formatINR(item.unitPrice)}
                      </p>
                    </div>
                    <span className="font-display font-bold text-fg">
                      {formatINR(item.lineTotal)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-subtle">
                <span className="text-muted">
                  Ship/Pickup: {ord.shippingRecipient} ({ord.shippingAddressText})
                </span>
                <span className="font-display text-sm font-bold text-fg">
                  Total: {formatINR(ord.totalAmount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
