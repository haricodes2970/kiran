'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Laptop, MessageSquare, Package, Wrench } from 'lucide-react';
import { apiFetch, formatINR } from '@/lib/api';
import { useApp } from '@/context/app-context';

export default function CustomerAccountOverviewPage() {
  const router = useRouter();
  const { user, loadingAuth } = useApp();

  const [orders, setOrders] = useState<any[]>([]);
  const [repairs, setRepairs] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [sellRequests, setSellRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loadingAuth && !user) {
      router.replace('/login');
    }
  }, [loadingAuth, user, router]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      apiFetch('/me/orders'),
      apiFetch('/me/repair-bookings'),
      apiFetch('/me/enquiries'),
      apiFetch('/me/used-device-submissions'),
    ])
      .then(([ord, rep, enq, sell]) => {
        setOrders(ord || []);
        setRepairs(rep || []);
        setEnquiries(enq || []);
        setSellRequests(sell || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (loadingAuth || !user) {
    return <div className="p-12 text-center text-sm text-muted">Loading your account...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-subtle pb-5">
        <div>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
            Customer Portal
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-fg mt-1">
            Welcome, {user.name}
          </h1>
          <p className="text-xs text-muted mt-0.5">
            {user.email} {user.phone ? `• ${user.phone}` : ''}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <Link
            href="/account/profile"
            className="glass-pill rounded-full px-4 py-2 font-semibold text-fg hover:border-accent transition"
          >
            Profile &amp; Addresses
          </Link>
          <Link
            href="/account/orders"
            className="glass-pill rounded-full px-4 py-2 font-semibold text-fg hover:border-accent transition"
          >
            My Orders ({orders.length})
          </Link>
          <Link
            href="/account/repairs"
            className="glass-pill rounded-full px-4 py-2 font-semibold text-fg hover:border-accent transition"
          >
            Repair Tracking ({repairs.length})
          </Link>
          <Link
            href="/account/enquiries"
            className="glass-pill rounded-full px-4 py-2 font-semibold text-fg hover:border-accent transition"
          >
            My Enquiries ({enquiries.length})
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Link
          href="/account/orders"
          className="glass-card rounded-2xl p-5 hover:border-accent transition space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Order Requests</span>
            <Package className="h-5 w-5 text-accent" />
          </div>
          <p className="font-display text-2xl font-bold text-fg">{orders.length}</p>
          <p className="text-[11px] text-accent font-medium">View order history →</p>
        </Link>

        <Link
          href="/account/repairs"
          className="glass-card rounded-2xl p-5 hover:border-accent transition space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">
              Repair Bookings
            </span>
            <Wrench className="h-5 w-5 text-amber-500" />
          </div>
          <p className="font-display text-2xl font-bold text-fg">{repairs.length}</p>
          <p className="text-[11px] text-accent font-medium">
            Track status &amp; quotations →
          </p>
        </Link>

        <Link
          href="/account/enquiries"
          className="glass-card rounded-2xl p-5 hover:border-accent transition space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">
              Product Enquiries
            </span>
            <MessageSquare className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="font-display text-2xl font-bold text-fg">{enquiries.length}</p>
          <p className="text-[11px] text-accent font-medium">
            View responses &amp; status →
          </p>
        </Link>

        <Link
          href="/account/profile"
          className="glass-card rounded-2xl p-5 hover:border-accent transition space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">
              Used-Laptop Sell Requests
            </span>
            <Laptop className="h-5 w-5 text-purple-500" />
          </div>
          <p className="font-display text-2xl font-bold text-fg">{sellRequests.length}</p>
          <p className="text-[11px] text-accent font-medium">
            Manage profile &amp; trade-ins →
          </p>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-bold text-fg">
              Active Repair Bookings &amp; Quotations
            </h2>
            <Link
              href="/account/repairs"
              className="text-xs font-semibold text-accent hover:underline"
            >
              View All
            </Link>
          </div>

          {loading ? (
            <p className="text-xs text-muted">Loading...</p>
          ) : repairs.length === 0 ? (
            <p className="text-xs text-muted">No repair bookings yet.</p>
          ) : (
            <div className="space-y-3">
              {repairs.slice(0, 3).map((rep) => (
                <div
                  key={rep.id}
                  className="rounded-xl border border-subtle bg-panel-2/75 p-3.5 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-fg">
                      {rep.reference}
                    </span>
                    <span className="rounded-full bg-blue-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-accent">
                      {rep.status}
                    </span>
                  </div>
                  <p className="font-medium text-fg">
                    {rep.brand} {rep.model} — {rep.issueCategory}
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

        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-bold text-fg">Recent Orders</h2>
            <Link
              href="/account/orders"
              className="text-xs font-semibold text-accent hover:underline"
            >
              View All
            </Link>
          </div>

          {loading ? (
            <p className="text-xs text-muted">Loading...</p>
          ) : orders.length === 0 ? (
            <p className="text-xs text-muted">No orders placed yet.</p>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 3).map((ord) => (
                <div
                  key={ord.id}
                  className="rounded-xl border border-subtle bg-panel-2/75 p-3.5 text-xs flex items-center justify-between"
                >
                  <div>
                    <span className="font-mono font-bold text-fg block">
                      {ord.reference}
                    </span>
                    <span className="text-muted">
                      {ord.items?.length || 0} item(s) • {ord.fulfilmentType}
                    </span>
                  </div>
                  <div className="text-right">
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
    </div>
  );
}
