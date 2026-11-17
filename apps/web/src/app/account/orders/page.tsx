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
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Customer Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          My Hardware Orders &amp; Purchase Requests
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          All order items preserve your unit price snapshot at the time of purchase.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-3">
          <Package className="h-10 w-10 text-slate-400 mx-auto" />
          <p className="text-sm font-bold text-slate-900">No orders found</p>
          <Link
            href="/products"
            className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
          >
            Browse Hardware Catalogue
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 text-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="font-mono font-bold text-sm text-slate-900">
                    {ord.reference}
                  </span>
                  <span className="text-slate-400 ml-3">
                    {new Date(ord.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-blue-50 px-2.5 py-1 font-semibold text-blue-700">
                    Order: {ord.status}
                  </span>
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">
                    Payment: {ord.paymentStatus}
                  </span>
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
                    {ord.fulfilmentType}
                  </span>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {ord.items?.map((item: any) => (
                  <div
                    key={item.id}
                    className="py-2 flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{item.productName}</p>
                      <p className="text-slate-500 font-mono text-[11px]">
                        SKU: {item.productSku} • Qty: {item.quantity} ×{' '}
                        {formatINR(item.unitPrice)}
                      </p>
                    </div>
                    <span className="font-bold text-slate-900">
                      {formatINR(item.lineTotal)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-slate-500">
                  Ship/Pickup: {ord.shippingRecipient} ({ord.shippingAddressText})
                </span>
                <span className="text-sm font-bold text-slate-900">
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
