'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch, formatINR } from '@/lib/api';
import { useApp } from '@/context/app-context';

const ORDER_STATUSES = [
  'PENDING_CONFIRMATION',
  'CONFIRMED',
  'PROCESSING',
  'READY_FOR_PICKUP',
  'DISPATCHED',
  'COMPLETED',
  'CANCELLED',
];

const PAYMENT_STATUSES = [
  'PENDING',
  'PARTIALLY_PAID',
  'PAID',
  'REFUNDED',
  'FAILED',
];

export default function AdminOrdersPage() {
  const { notify } = useApp();
  const [orders, setOrders] = useState<any[]>([]);

  const load = async () => {
    try {
      const res = await apiFetch('/admin/orders');
      setOrders(res || []);
    } catch (err: any) {
      notify(err.message || 'Unable to load orders', 'error');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpdate = async (
    id: string,
    payload: { status?: string; paymentStatus?: string },
  ) => {
    try {
      await apiFetch(`/admin/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      notify(
        payload.status === 'CANCELLED'
          ? 'Order cancelled and reserved stock automatically restored'
          : 'Order updated',
      );
      await load();
    } catch (err: any) {
      notify(err.message || 'Update failed', 'error');
    }
  };

  return (
    <div className="space-y-6 text-xs">
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          Order &amp; Fulfilment Management
        </h1>
        <p className="text-slate-500">
          Cancelling an order automatically restores product stock and records an `ORDER_CANCELLED` ledger entry.
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((ord) => (
          <div
            key={ord.id}
            className="rounded-xl border border-slate-200 bg-white p-5 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono font-bold text-sm text-slate-900">
                  {ord.reference}
                </span>
                <span className="text-slate-500 ml-3">
                  Customer: {ord.customer?.name} ({ord.shippingPhone})
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label className="text-slate-500">Order:</label>
                <select
                  value={ord.status}
                  onChange={(e) =>
                    handleUpdate(ord.id, { status: e.target.value })
                  }
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-semibold text-blue-700"
                >
                  {ORDER_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>

                <label className="text-slate-500 ml-2">Payment:</label>
                <select
                  value={ord.paymentStatus}
                  onChange={(e) =>
                    handleUpdate(ord.id, { paymentStatus: e.target.value })
                  }
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-semibold text-emerald-700"
                >
                  {PAYMENT_STATUSES.map((ps) => (
                    <option key={ps} value={ps}>
                      {ps}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {ord.items?.map((item: any) => (
                <div
                  key={item.id}
                  className="py-2 flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-slate-900">
                      {item.productName}
                    </span>
                    <span className="text-slate-500 ml-2 font-mono">
                      ({item.productSku}) × {item.quantity}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">
                      {formatINR(item.lineTotal)}
                    </span>
                    {item.costPriceSnapshot && (
                      <span className="text-slate-400 ml-2">
                        (Cost snapshot: {formatINR(item.costPriceSnapshot)})
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-slate-500">
                {ord.fulfilmentType} — {ord.shippingAddressText}
              </span>
              <span className="text-sm font-bold text-slate-900">
                Total: {formatINR(ord.totalAmount)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
