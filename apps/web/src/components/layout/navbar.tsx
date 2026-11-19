'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShoppingCart,
  User,
  ShieldCheck,
  Search,
  Menu,
  X,
  LogOut,
  ArrowUpRight,
} from 'lucide-react';
import { useApp } from '@/context/app-context';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, cartCount } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isAdmin = Boolean(user?.roles?.includes('ADMIN'));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      router.push('/products');
      setMobileOpen(false);
      return;
    }
    router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    setMobileOpen(false);
  };

  const navLinks = [
    { href: '/products', label: 'Products' },
    { href: '/refurbished', label: 'Refurbished' },
    { href: '/services', label: 'Services' },
    { href: '/sell-laptop', label: 'Sell Laptop' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-40 px-3 sm:px-6 pt-3 pb-2 pointer-events-none">
      <div className="max-w-7xl mx-auto space-y-2 pointer-events-auto">
        {/* Selective Liquid-Glass Floating Bar */}
        <div
          className={`glass-nav rounded-2xl px-3 sm:px-4 xl:px-5 h-16 flex items-center justify-between gap-2 sm:gap-3 transition-shadow duration-300 ${
            scrolled ? 'shadow-glass' : ''
          }`}
        >
          {/* Separated Brand Mark (mobile + desktop) + Wordmark (sm+ desktop) */}
          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0 focus-visible:rounded-xl"
            aria-label="Kiran's Infotech Home"
          >
            <img
              src="/brand/kirans-mark.png"
              alt="Kiran's Infotech Mark"
              width={512}
              height={512}
              className="h-8 w-8 sm:h-9 sm:w-9 object-contain"
            />
            <img
              src="/brand/kirans-wordmark-dark.png"
              alt="Kiran's Infotech"
              width={1059}
              height={248}
              className="hidden sm:block dark:hidden h-6 xl:h-7 w-auto object-contain"
            />
            <img
              src="/brand/kirans-wordmark.png"
              alt="Kiran's Infotech"
              width={1059}
              height={248}
              className="hidden dark:sm:block h-6 xl:h-7 w-auto object-contain"
            />
          </Link>

          {/* Desktop Primary Links */}
          <nav
            aria-label="Primary navigation"
            className="hidden lg:flex items-center gap-0.5 xl:gap-1 text-xs xl:text-sm"
          >
            {navLinks.map((link) => {
              const active = pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-2.5 xl:px-3.5 py-1.5 font-medium transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-brand-600 text-white'
                      : 'text-ink/80 hover:text-ink hover:bg-ink/5 dark:text-slate-200 dark:hover:text-white dark:hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Glassmorphic Desktop Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-[175px] xl:max-w-xs">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-300" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hardware..."
                aria-label="Search hardware catalogue"
                className="glass-search w-full rounded-full pl-9 pr-3 py-1.5 text-xs xl:text-sm text-ink dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-300/70 focus:border-brand-600 dark:focus:border-electric focus:outline-none transition"
              />
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <ThemeToggle />

            {isAdmin && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1 rounded-full bg-ink dark:bg-brand-600 px-2.5 xl:px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-electric dark:text-white" />
                <span>Admin</span>
              </Link>
            )}

            <Link
              href="/cart"
              aria-label={`Order Cart (${cartCount} items)`}
              className="glass-pill relative inline-flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-ink dark:text-white hover:border-brand-600 transition"
            >
              <ShoppingCart className="h-4 w-4 text-ink dark:text-electric" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="inline-flex h-4 min-w-[16px] sm:h-5 sm:min-w-[20px] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] sm:text-[11px] font-bold text-ink">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-1">
                <Link
                  href="/account"
                  className="glass-pill inline-flex items-center gap-1 rounded-full px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-ink dark:text-white hover:border-brand-600 transition"
                >
                  <User className="h-3.5 w-3.5 text-brand-600 dark:text-electric" />
                  <span className="max-w-[72px] sm:max-w-[90px] truncate">{user.name.split(' ')[0]}</span>
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  aria-label="Sign out"
                  title="Sign out"
                  className="glass-pill inline-flex items-center justify-center rounded-full p-1.5 text-slate-500 dark:text-slate-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/60 transition"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1 rounded-full bg-brand-600 px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 transition shadow-sm whitespace-nowrap"
              >
                <User className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </Link>
            )}

            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="glass-pill lg:hidden inline-flex items-center justify-center rounded-full p-1.5 sm:p-2 text-ink dark:text-white"
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Selective Glass Demo Mode & Repair Track Pill */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-2">
          <div className="glass-pill inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium text-ink/85 dark:text-slate-200">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
            <span className="font-mono uppercase tracking-wider text-[10px] font-semibold text-amber-700 dark:text-amber-300">
              Demo Mode
            </span>
            <span className="hidden sm:inline text-slate-600 dark:text-slate-300">
              Sample inventory &amp; INR (₹) pricing • Order Request Only
            </span>
          </div>
          <Link
            href="/account/repairs"
            className="glass-pill hidden sm:inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium text-ink/85 dark:text-slate-200 hover:text-brand-600 dark:hover:text-electric transition"
          >
            <span>Track Repair Status</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="lg:hidden glass-nav rounded-2xl p-4 space-y-3">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search laptops, SSDs, RAM..."
                  aria-label="Search hardware catalogue"
                  className="glass-search w-full rounded-xl pl-9 pr-4 py-2 text-sm text-ink dark:text-white"
                />
              </div>
            </form>
            <nav aria-label="Mobile navigation" className="flex flex-col space-y-1">
              {navLinks.map((link) => {
                const active = pathname?.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                      active
                        ? 'bg-brand-600 text-white'
                        : 'text-ink dark:text-slate-100 hover:bg-surface dark:hover:bg-white/10'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href="/account/repairs"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-3.5 py-2.5 text-sm font-medium text-ink dark:text-slate-100 hover:bg-surface dark:hover:bg-white/10 flex items-center justify-between"
              >
                <span>Track Repair Status</span>
                <ArrowUpRight className="h-4 w-4 text-slate-400" />
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-3.5 py-2.5 text-sm font-semibold text-brand-600 dark:text-electric hover:bg-brand-50 dark:hover:bg-white/10 flex items-center gap-2"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Admin Console</span>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
