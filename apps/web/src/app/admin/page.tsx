'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Boxes,
  ClipboardList,
  Laptop,
  MessageSquare,
  Package,
  ShoppingBag,
  Users,
} from 'lucide-react';
import { apiFetch, formatINR } from '@/lib/api';

export default function AdminDashboardOverviewPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/admin/dashboard/overview')
      .then((res) => setData(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-xs text-slate-500">
        Calculating live database metrics...
      </div>
    );
  }

  const m = data.metrics;

  const statCards = [
    {
      label: 'Products (Active / Total)',
      value: `${m.activeProducts} / ${m.totalProducts}`,
      sub: `${m.totalCategories} active categories`,
      href: '/admin/products',
      icon: Package,
    },
    {
      label: 'Total Inventory Units',
      value: String(m.totalInventoryUnits),
      sub: `${m.lowStockProductsCount} low-stock • ${m.outOfStockProductsCount} out-of-stock`,
      href: '/admin/inventory',
      icon: Boxes,
    },
    {
      label: 'Refurbished Laptops',
      value: `${m.publishedRefurbished} / ${m.totalRefurbished}`,
      sub: 'Published vs Total lifecycle units',
      href: '/admin/refurbished',
      icon: Laptop,
    },
    {
      label: 'Orders & Collected Revenue',
      value: formatINR(m.salesSummary?.collectedRevenue),
      sub: `${m.totalOrders} total orders (${m.pendingOrders} pending)`,
      href: '/admin/orders',
      icon: ShoppingBag,
    },
    {
      label: 'Pending Repair Bookings',
      value: `${m.pendingRepairBookings} / ${m.totalRepairBookings}`,
      sub: 'Active bench repairs & quotations',
      href: '/admin/repairs',
      icon: ClipboardList,
    },
    {
      label: 'Customer Enquiries',
      value: `${m.newEnquiriesCount} New`,
      sub: `${m.totalEnquiriesCount} total enquiries logged`,
      href: '/admin/enquiries',
      icon: MessageSquare,
    },
    {
      label: 'Registered Customers',
      value: String(m.totalCustomers),
      sub: 'Active customer accounts',
      href: '/admin/customers',
      icon: Users,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Executive Operations Dashboard
          </h1>
          <p className="text-xs text-slate-500">
            All metrics are computed live from PostgreSQL database records.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/products"
            className="rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            + Add Product
          </Link>
          <Link
            href="/admin/inventory"
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Adjust Stock
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Link
              key={i}
              href={card.href}
              className="rounded-xl border border-slate-200 bg-white p-5 hover:border-blue-600 transition space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  {card.label}
                </span>
                <Icon className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{card.value}</p>
              <p className="text-[11px] text-slate-500">{card.sub}</p>
            </Link>
          );
        })}
      </div>

      {/* Low Stock Alerts */}
      {data.lowStockAlerts?.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span>Low-Stock &amp; Out-of-Stock Inventory Alerts</span>
            </div>
            <Link
              href="/admin/inventory"
              className="text-xs font-semibold text-amber-900 underline"
            >
              Manage Stock →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {data.lowStockAlerts.map((item: any) => (
              <div
                key={item.productId}
                className="flex items-center justify-between rounded-lg bg-white p-2.5 border border-amber-200"
              >
                <span className="font-medium text-slate-800 truncate pr-2">
                  {item.sku} — {item.name}
                </span>
                <span
                  className={`shrink-0 rounded px-2 py-0.5 font-bold ${
                    item.availableQuantity === 0
                      ? 'bg-red-100 text-red-700'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {item.availableQuantity} left
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-blue-600 font-semibold">
              All Orders
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {data.recentOrders?.map((ord: any) => (
              <div key={ord.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-slate-900">
                    {ord.reference}
                  </span>
                  <span className="block text-slate-500">{ord.customer?.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 block">
                    {formatINR(ord.totalAmount)}
                  </span>
                  <span className="text-[11px] text-blue-700">{ord.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Recent Repair Requests
            </h2>
            <Link href="/admin/repairs" className="text-blue-600 font-semibold">
              All Repairs
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {data.recentRepairs?.map((rep: any) => (
              <div key={rep.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-slate-900">
                    {rep.reference}
                  </span>
                  <span className="block text-slate-500">
                    {rep.brand} {rep.model} ({rep.issueCategory})
                  </span>
                </div>
                <span className="rounded bg-blue-50 px-2 py-0.5 font-semibold text-blue-700">
                  {rep.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
