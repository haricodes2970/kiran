'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ClipboardList,
  Laptop,
  MessageSquare,
  Package,
  User,
  Wrench,
} from 'lucide-react';
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
    return <div className="p-12 text-center text-sm">Loading your account...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Customer Portal
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Welcome, {user.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {user.email} {user.phone ? `• ${user.phone}` : ''}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <Link
            href="/account/profile"
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Profile &amp; Addresses
          </Link>
          <Link
            href="/account/orders"
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 font-semibold text-slate-700 hover:bg-slate-50"
          >
            My Orders ({orders.length})
          </Link>
          <Link
            href="/account/repairs"
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Repair Tracking ({repairs.length})
          </Link>
          <Link
            href="/account/enquiries"
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 font-semibold text-slate-700 hover:bg-slate-50"
          >
            My Enquiries ({enquiries.length})
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Link
          href="/account/orders"
          className="rounded-xl border border-slate-200 bg-white p-5 hover:border-blue-600 transition space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Order Requests</span>
            <Package className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{orders.length}</p>
          <p className="text-[11px] text-blue-600 font-medium">View order history →</p>
        </Link>

        <Link
          href="/account/repairs"
          className="rounded-xl border border-slate-200 bg-white p-5 hover:border-blue-600 transition space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Repair Bookings
            </span>
            <Wrench className="h-5 w-5 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{repairs.length}</p>
          <p className="text-[11px] text-blue-600 font-medium">
            Track status &amp; quotations →
          </p>
        </Link>

        <Link
          href="/account/enquiries"
          className="rounded-xl border border-slate-200 bg-white p-5 hover:border-blue-600 transition space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Product Enquiries
            </span>
            <MessageSquare className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{enquiries.length}</p>
          <p className="text-[11px] text-blue-600 font-medium">
            View responses &amp; status →
          </p>
        </Link>

        <Link
          href="/account/profile"
          className="rounded-xl border border-slate-200 bg-white p-5 hover:border-blue-600 transition space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Used-Laptop Sell Requests
            </span>
            <Laptop className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{sellRequests.length}</p>
          <p className="text-[11px] text-blue-600 font-medium">
            Manage profile &amp; trade-ins →
          </p>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Repairs */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Active Repair Bookings &amp; Quotations
            </h2>
            <Link
              href="/account/repairs"
              className="text-xs font-semibold text-blue-600"
            >
              View All
            </Link>
          </div>

          {loading ? (
            <p className="text-xs text-slate-400">Loading...</p>
          ) : repairs.length === 0 ? (
            <p className="text-xs text-slate-500">No repair bookings yet.</p>
          ) : (
            <div className="space-y-3">
              {repairs.slice(0, 3).map((rep) => (
                <div
                  key={rep.id}
                  className="rounded-lg border border-slate-100 bg-slate-50 p-3.5 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900">
                      {rep.reference}
                    </span>
                    <span className="rounded bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-800">
                      {rep.status}
                    </span>
                  </div>
                  <p className="font-medium text-slate-800">
                    {rep.brand} {rep.model} — {rep.issueCategory}
                  </p>
                  {rep.updates?.length > 0 && (
                    <p className="text-slate-600">
                      Latest: {rep.updates[rep.updates.length - 1].customerVisibleMessage}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Recent Orders</h2>
            <Link
              href="/account/orders"
              className="text-xs font-semibold text-blue-600"
            >
              View All
            </Link>
          </div>

          {loading ? (
            <p className="text-xs text-slate-400">Loading...</p>
          ) : orders.length === 0 ? (
            <p className="text-xs text-slate-500">No orders placed yet.</p>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 3).map((ord) => (
                <div
                  key={ord.id}
                  className="rounded-lg border border-slate-100 bg-slate-50 p-3.5 text-xs flex items-center justify-between"
                >
                  <div>
                    <span className="font-mono font-bold text-slate-900 block">
                      {ord.reference}
                    </span>
                    <span className="text-slate-600">
                      {ord.items?.length || 0} item(s) • {ord.fulfilmentType}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 block">
                      {formatINR(ord.totalAmount)}
                    </span>
                    <span className="text-[11px] text-blue-700 font-semibold">
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
