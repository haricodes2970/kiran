'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  Boxes,
  ClipboardList,
  FileText,
  FolderTree,
  Laptop,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  ShieldAlert,
  ShoppingBag,
  Users,
  Wrench,
} from 'lucide-react';
import { useApp } from '@/context/app-context';

const adminLinks = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/inventory', label: 'Inventory & Stock', icon: Boxes },
  { href: '/admin/refurbished', label: 'Refurbished & Buyback', icon: Laptop },
  { href: '/admin/services', label: 'Hardware Services', icon: Wrench },
  { href: '/admin/repairs', label: 'Repair Bookings', icon: ClipboardList },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/enquiries', label: 'Enquiries', icon: MessageSquare },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/content', label: 'Site Content', icon: FileText },
  { href: '/admin/reports', label: 'Reports & Audit', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loadingAuth } = useApp();

  const isAdmin = user?.roles?.includes('ADMIN');

  useEffect(() => {
    if (!loadingAuth && !user) {
      router.replace('/login');
    }
  }, [loadingAuth, user, router]);

  if (loadingAuth) {
    return (
      <div className="p-12 text-center text-sm text-slate-500">
        Verifying administrator credentials...
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-4">
        <ShieldAlert className="h-12 w-12 text-red-600 mx-auto" />
        <h1 className="text-2xl font-bold text-slate-900">
          Administrator Privileges Required
        </h1>
        <p className="text-xs text-slate-500">
          This area is restricted to authorized Kiran&apos;s Infotech administrators.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/login"
            className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
          >
            Sign In as Administrator
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700"
          >
            Return to Storefront
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="lg:col-span-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-3 space-y-1 sticky top-24">
            <div className="px-3 py-2 border-b border-slate-100 mb-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                Admin Operations
              </p>
              <p className="text-xs font-semibold text-slate-900 truncate">
                {user.name}
              </p>
            </div>
            <nav className="space-y-0.5">
              {adminLinks.map((item) => {
                const Icon = item.icon;
                const active =
                  item.href === '/admin'
                    ? pathname === '/admin'
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                      active
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <section className="lg:col-span-9 space-y-6">{children}</section>
      </div>
    </div>
  );
}
