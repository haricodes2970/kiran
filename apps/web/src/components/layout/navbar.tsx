'use client';

import React, { useEffect, useRef, useState } from 'react';
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

const NAV_LINKS = [
  { href: '/products', label: 'Products' },
  { href: '/refurbished', label: 'Refurbished' },
  { href: '/services', label: 'Services' },
  { href: '/sell-laptop', label: 'Sell Laptop' },
  { href: '/contact', label: 'Contact' },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, cartCount } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Keyboard accessibility: Escape closes mobile drawer and restores focus
  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  const isAdmin = Boolean(user?.roles?.includes('ADMIN'));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    router.push(trimmed ? `/products?search=${encodeURIComponent(trimmed)}` : '/products');
    setMobileOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-40 glass-nav border-b border-subtle transition-shadow duration-200 ${
        scrolled ? 'shadow-glass' : ''
      }`}
    >
      {/* Integrated hairline utility strip (no floating pills) */}
      <div className="border-b border-subtle/70 bg-panel-2/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-7 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2 text-muted truncate">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" aria-hidden="true" />
            <span className="font-mono uppercase tracking-wider text-[10px] font-semibold text-amber-700 dark:text-amber-300 shrink-0">
              Demo Mode
            </span>
            <span className="hidden sm:inline text-subtle" aria-hidden="true">
              |
            </span>
            <span className="hidden sm:inline truncate">
              Sample inventory &amp; INR (₹) pricing · Order Request Only
            </span>
          </div>

          <Link
            href="/account/repairs"
            className="inline-flex items-center gap-1 font-medium text-muted hover:text-accent transition-colors shrink-0"
          >
            <span>Track Repair Status</span>
            <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Primary navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 xl:gap-5">
        {/* Brand: Separated K symbol + wordmark */}
        <Link
          href="/"
          className="flex items-center gap-2.5 shrink-0 rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
            className="hidden sm:block dark:hidden h-6 xl:h-[26px] w-auto object-contain"
          />
          <img
            src="/brand/kirans-wordmark.png"
            alt="Kiran's Infotech"
            width={1059}
            height={248}
            className="hidden dark:sm:block h-6 xl:h-[26px] w-auto object-contain"
          />
        </Link>

        {/* Desktop Primary Links with refined underline active indicator */}
        <nav
          aria-label="Primary navigation"
          className="hidden lg:flex items-center gap-1 text-[13px] xl:text-sm"
        >
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname?.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={`relative px-3 py-2 rounded-control font-medium transition-colors whitespace-nowrap ${
                  active
                    ? 'text-fg font-semibold'
                    : 'text-muted hover:text-fg hover:bg-panel-2/70'
                }`}
              >
                <span>{link.label}</span>
                {active && (
                  <span
                    className="absolute inset-x-3 bottom-0.5 h-[2px] rounded-full bg-brand-600 dark:bg-electric"
                    aria-hidden="true"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Search */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-[200px] xl:max-w-xs">
          <div className="relative w-full">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hardware..."
              aria-label="Search hardware catalogue"
              className="glass-search w-full rounded-control pl-9 pr-3 py-1.5 text-xs xl:text-sm text-fg placeholder:text-muted focus:border-accent focus:outline-none transition-colors"
            />
          </div>
        </form>

        {/* Right Action Cluster: Theme + Cart | Account / Admin */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <ThemeToggle />

          <Link
            href="/cart"
            aria-label={`Order Cart (${cartCount} items)`}
            className="inline-flex items-center gap-1.5 h-9 px-2.5 sm:px-3 rounded-control border border-subtle bg-panel hover:border-amber-500/70 text-xs font-semibold text-fg transition-colors"
          >
            <ShoppingCart className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            <span className="hidden sm:inline">Cart</span>
            <span
              className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-md px-1.5 font-mono text-[11px] font-bold ${
                cartCount > 0
                  ? 'bg-amber-500 text-ink'
                  : 'bg-panel-2 text-muted'
              }`}
            >
              {cartCount}
            </span>
          </Link>

          <span className="hidden sm:block h-5 w-px bg-subtle mx-0.5" aria-hidden="true" />

          {user ? (
            <div className="flex items-center gap-1">
              <Link
                href="/account"
                className="inline-flex items-center gap-1.5 h-9 px-2.5 sm:px-3 rounded-control border border-subtle bg-panel hover:border-accent text-xs font-semibold text-fg transition-colors"
              >
                <User className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                <span className="max-w-[72px] sm:max-w-[96px] truncate">
                  {user.name.split(' ')[0]}
                </span>
              </Link>
              <button
                type="button"
                onClick={logout}
                aria-label="Sign out"
                title="Sign out"
                className="inline-flex items-center justify-center h-9 w-9 rounded-control border border-subtle bg-panel text-muted hover:text-red-600 hover:border-red-300 dark:hover:text-red-300 dark:hover:border-red-500/40 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 h-9 px-3 sm:px-3.5 rounded-control bg-brand-600 hover:bg-brand-700 text-xs font-semibold text-white transition-colors whitespace-nowrap"
            >
              <User className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Sign In</span>
            </Link>
          )}

          {isAdmin && (
            <Link
              href="/admin"
              className="hidden sm:inline-flex items-center gap-1 h-9 px-2.5 xl:px-3 rounded-control border border-slate-700/40 dark:border-electric/40 bg-ink dark:bg-brand-600/20 text-xs font-semibold text-white dark:text-electric hover:bg-slate-800 dark:hover:bg-brand-600/30 transition-colors"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-electric" aria-hidden="true" />
              <span>Admin</span>
            </Link>
          )}

          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="lg:hidden inline-flex items-center justify-center h-9 w-9 rounded-control border border-subtle bg-panel text-fg hover:border-accent transition-colors"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-drawer"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Navigation Drawer */}
      {mobileOpen && (
        <div
          id="mobile-nav-drawer"
          className="lg:hidden border-t border-subtle bg-panel/95 backdrop-blur-md px-4 py-4 space-y-4"
        >
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search laptops, SSDs, RAM..."
                aria-label="Search hardware catalogue"
                className="glass-search w-full rounded-control pl-9 pr-4 py-2.5 text-sm text-fg placeholder:text-muted focus:border-accent focus:outline-none"
              />
            </div>
          </form>

          <nav aria-label="Mobile navigation" className="flex flex-col space-y-1">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href || pathname?.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between rounded-control px-3.5 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-brand-600/10 text-brand-700 dark:bg-electric/15 dark:text-electric font-semibold border-l-2 border-brand-600 dark:border-electric'
                      : 'text-fg hover:bg-panel-2'
                  }`}
                >
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-subtle flex flex-col gap-1.5">
            <Link
              href="/account/repairs"
              onClick={() => setMobileOpen(false)}
              className="rounded-control px-3.5 py-2 text-sm font-medium text-muted hover:text-fg hover:bg-panel-2 flex items-center justify-between"
            >
              <span>Track Repair Status</span>
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="rounded-control px-3.5 py-2 text-sm font-semibold text-brand-700 dark:text-electric hover:bg-panel-2 flex items-center gap-2"
              >
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                <span>Admin Console</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
