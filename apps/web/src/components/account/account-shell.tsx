'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, ShieldCheck } from 'lucide-react';
import { useApp } from '@/context/app-context';

interface AccountShellProps {
  children: React.ReactNode;
  counts?: {
    orders?: number;
    repairs?: number;
    enquiries?: number;
  };
}

export function AccountShell({ children, counts }: AccountShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loadingAuth, logout } = useApp();

  useEffect(() => {
    if (!loadingAuth && !user) {
      router.replace('/login');
    }
  }, [loadingAuth, user, router]);

  if (loadingAuth || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-48 rounded-card bg-panel animate-pulse border border-subtle" />
      </div>
    );
  }

  const tabs = [
    { href: '/account', label: 'Overview', exact: true },
    {
      href: '/account/orders',
      label: counts?.orders !== undefined ? `Orders (${counts.orders})` : 'Orders',
    },
    {
      href: '/account/repairs',
      label: counts?.repairs !== undefined ? `Repairs (${counts.repairs})` : 'Repairs',
    },
    {
      href: '/account/enquiries',
      label: counts?.enquiries !== undefined ? `Enquiries (${counts.enquiries})` : 'Enquiries',
    },
    { href: '/account/profile', label: 'Profile & Settings' },
  ];

  const handleSignOut = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-subtle pb-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
              Customer Portal
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-fg mt-1">
              Welcome, {user.name}
            </h1>
            <p className="text-xs text-muted mt-0.5">
              {user.email} {user.phone ? `· ${user.phone}` : ''}
            </p>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex w-fit items-center gap-1.5 rounded-control border border-subtle bg-panel px-3.5 py-2 text-xs font-semibold text-fg hover:border-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Sign Out</span>
          </button>
        </div>

        <nav
          aria-label="Customer portal navigation"
          className="flex flex-wrap items-center gap-2 text-xs"
        >
          {tabs.map((tab) => {
            const active = tab.exact
              ? pathname === tab.href
              : pathname?.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                className={`rounded-control px-3.5 py-2 font-semibold transition-colors ${
                  active
                    ? 'bg-brand-600 text-white'
                    : 'border border-subtle bg-panel text-fg hover:border-accent'
                }`}
              >
                {tab.label}
              </Link>
            );
          })}

          <span
            aria-disabled="true"
            title="Planned future capability"
            className="inline-flex items-center gap-1.5 rounded-control border border-dashed border-subtle bg-panel-2 px-3 py-2 font-mono text-[11px] text-muted cursor-not-allowed"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            <span>Device Passport · Future Feature</span>
          </span>
        </nav>
      </div>

      {children}
    </div>
  );
}
