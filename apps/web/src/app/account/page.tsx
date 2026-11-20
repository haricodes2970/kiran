'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  Laptop,
  MessageSquare,
  Package,
  ShoppingCart,
  Wrench,
} from 'lucide-react';
import { apiFetch, formatINR } from '@/lib/api';
import { useApp } from '@/context/app-context';
import { AccountShell } from '@/components/account/account-shell';

export default function CustomerAccountOverviewPage() {
  const { user, cartCount } = useApp();

  const [orders, setOrders] = useState<any[]>([]);
  const [repairs, setRepairs] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [sellRequests, setSellRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);
    setError(null);

    Promise.all([
      apiFetch('/me/orders'),
      apiFetch('/me/repair-bookings'),
      apiFetch('/me/enquiries'),
      apiFetch('/me/used-device-submissions'),
    ])
      .then(([ord, rep, enq, sell]) => {
        if (!active) return;
        setOrders(Array.isArray(ord) ? ord : []);
        setRepairs(Array.isArray(rep) ? rep : []);
        setEnquiries(Array.isArray(enq) ? enq : []);
        setSellRequests(Array.isArray(sell) ? sell : []);
      })
      .catch((err: any) => {
        if (active) setError(err?.message || 'Unable to load account summary.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  return (
    <AccountShell
      counts={{
        orders: orders.length,
        repairs: repairs.length,
        enquiries: enquiries.length,
      }}
    >
      {error && (
        <div
          role="alert"
          className="rounded-card border border-red-300 bg-red-50 dark:bg-red-950/60 dark:border-red-500/40 p-4 text-xs text-red-700 dark:text-red-200 flex items-center gap-2"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/account/orders"
          className="surface-card p-5 hover:border-accent transition-colors space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Order Requests</span>
            <Package className="h-5 w-5 text-accent" aria-hidden="true" />
          </div>
          <p className="font-display text-2xl font-bold text-fg">
            {loading ? '—' : orders.length}
          </p>
          <p className="text-[11px] text-accent font-medium">View order history →</p>
        </Link>

        <Link
          href="/account/repairs"
          className="surface-card p-5 hover:border-accent transition-colors space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Repair Bookings</span>
            <Wrench className="h-5 w-5 text-amber-500" aria-hidden="true" />
          </div>
          <p className="font-display text-2xl font-bold text-fg">
            {loading ? '—' : repairs.length}
          </p>
          <p className="text-[11px] text-accent font-medium">Track status &amp; quotations →</p>
        </Link>

        <Link
          href="/account/enquiries"
          className="surface-card p-5 hover:border-accent transition-colors space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Product Enquiries</span>
            <MessageSquare className="h-5 w-5 text-emerald-500" aria-hidden="true" />
          </div>
          <p className="font-display text-2xl font-bold text-fg">
            {loading ? '—' : enquiries.length}
          </p>
          <p className="text-[11px] text-accent font-medium">View responses &amp; status →</p>
        </Link>

        <Link
          href="/sell-laptop"
          className="surface-card p-5 hover:border-accent transition-colors space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Used-Device Submissions</span>
            <Laptop className="h-5 w-5 text-accent" aria-hidden="true" />
          </div>
          <p className="font-display text-2xl font-bold text-fg">
            {loading ? '—' : sellRequests.length}
          </p>
          <p className="text-[11px] text-accent font-medium">Submit laptop buyback →</p>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="glass-stage rounded-card p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-fg">
          Quick Actions
        </span>
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 rounded-control bg-brand-600 px-3.5 py-2 font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            <span>Browse Hardware</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
          <Link
            href="/services#book-repair"
            className="inline-flex items-center gap-1.5 rounded-control border border-subtle bg-panel px-3.5 py-2 font-semibold text-fg hover:border-accent transition-colors"
          >
            <Wrench className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            <span>Book Repair</span>
          </Link>
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 rounded-control bg-amber-500 px-3.5 py-2 font-semibold text-[#0B1930] hover:bg-amber-400 transition-colors"
          >
            <ShoppingCart className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Order Cart ({cartCount})</span>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="surface-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-fg">
              Recent Repair Bookings
            </h2>
            <Link
              href="/account/repairs"
              className="text-xs font-semibold text-accent hover:underline"
            >
              View All
            </Link>
          </div>

          {loading ? (
            <div className="h-28 rounded-control bg-panel-2 animate-pulse" />
          ) : repairs.length === 0 ? (
            <p className="text-xs text-muted">No repair bookings yet.</p>
          ) : (
            <div className="space-y-3">
              {repairs.slice(0, 3).map((rep) => (
                <div
                  key={rep.id}
                  className="rounded-control border border-subtle bg-panel-2 p-3.5 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-fg">{rep.reference}</span>
                    <span className="rounded-md bg-blue-500/15 px-2 py-0.5 text-[11px] font-semibold text-accent">
                      {rep.status}
                    </span>
                  </div>
                  <p className="font-medium text-fg">
                    {rep.brand} {rep.model} · {rep.issueCategory}
                  </p>
                  {rep.updates?.length > 0 && (
                    <p className="text-muted">
                      Latest: {rep.updates[rep.updates.length - 1].customerVisibleMessage}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="surface-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-fg">
              Recent Order Requests
            </h2>
            <Link
              href="/account/orders"
              className="text-xs font-semibold text-accent hover:underline"
            >
              View All
            </Link>
          </div>

          {loading ? (
            <div className="h-28 rounded-control bg-panel-2 animate-pulse" />
          ) : orders.length === 0 ? (
            <p className="text-xs text-muted">No order requests placed yet.</p>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 3).map((ord) => (
                <div
                  key={ord.id}
                  className="rounded-control border border-subtle bg-panel-2 p-3.5 text-xs flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <span className="font-mono font-bold text-fg block">
                      {ord.reference}
                    </span>
                    <span className="text-muted">
                      {ord.items?.length || 0} item(s) · {ord.fulfilmentType}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-display font-bold text-fg block">
                      {formatINR(ord.totalAmount)}
                    </span>
                    <span className="text-[11px] text-accent font-semibold">
                      {ord.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AccountShell>
  );
}
