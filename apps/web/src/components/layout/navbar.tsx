'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Cpu,
  ShoppingCart,
  User,
  ShieldCheck,
  Search,
  Menu,
  X,
  Wrench,
  Laptop,
  LogOut,
  ArrowUpRight,
} from 'lucide-react';
import { useApp } from '@/context/app-context';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, cartCount } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = user?.roles?.includes('ADMIN');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      router.push('/products');
      return;
    }
    router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    setMobileOpen(false);
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Hardware Catalogue' },
    { href: '/refurbished', label: 'Refurbished Laptops' },
    { href: '/services', label: 'Repair & Upgrade Services' },
    { href: '/sell-laptop', label: 'Sell Old Laptop' },
    { href: '/contact', label: 'Contact & Showroom' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      {/* Demo Mode Transparency Banner */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded bg-amber-500/20 px-2 py-0.5 text-[11px] font-semibold text-amber-300 border border-amber-400/30">
              CLIENT DEMO MODE
            </span>
            <span>
              Kiran&apos;s Infotech Interactive Platform — Connected to shared live database. Sample inventory &amp; pricing in INR (₹).
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-slate-300">
            <Link href="/services#book-repair" className="hover:text-white flex items-center gap-1">
              <Wrench className="h-3.5 w-3.5 text-blue-400" /> Book Hardware Service
            </Link>
            <Link href="/refurbished" className="hover:text-white flex items-center gap-1">
              <Laptop className="h-3.5 w-3.5 text-emerald-400" /> 40-Point Certified Refurbished
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
              <Cpu className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-lg font-bold tracking-tight text-slate-900 leading-none">
                Kiran&apos;s Infotech
              </span>
              <span className="block text-[11px] font-medium text-slate-500 mt-0.5">
                Hardware • Refurbished • Chip-Level Lab
              </span>
            </div>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search laptops, SSDs, RAM, monitors, SKU..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none"
              />
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-2.5">
            {isAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"
              >
                <ShieldCheck className="h-4 w-4 text-blue-400" />
                <span>Admin Console</span>
              </Link>
            )}

            <Link
              href="/cart"
              className="relative inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <ShoppingCart className="h-4 w-4 text-slate-700" />
              <span className="hidden sm:inline">Order Cart</span>
              {cartCount > 0 && (
                <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-600 px-1.5 text-[11px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-1.5">
                <Link
                  href="/account"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition"
                >
                  <User className="h-4 w-4 text-blue-600" />
                  <span className="max-w-[110px] truncate">{user.name.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition shadow-sm"
              >
                <User className="h-4 w-4" />
                <span>Sign In</span>
              </Link>
            )}

            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-600"
              aria-label="Toggle Menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Desktop Sub-navigation */}
        <nav className="hidden md:flex items-center gap-1 border-t border-slate-100 py-2 text-sm">
          {navLinks.map((link) => {
            const active =
              link.href === '/'
                ? pathname === '/'
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-1.5 font-medium transition ${
                  active
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="ml-auto flex items-center gap-3 text-xs text-slate-500">
            <Link
              href="/account/repairs"
              className="font-medium text-slate-600 hover:text-blue-600 flex items-center gap-1"
            >
              Track Repair Status <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hardware, laptops, SSD..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-sm"
              />
            </div>
          </form>
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
