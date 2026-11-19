import React from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Laptop, ShoppingCart } from 'lucide-react';
import { formatINR } from '@/lib/api';
import { HeroMedia } from '@/components/home/hero-media';
import { ProductCardItem } from '@/components/home/featured-products';

interface HeroContent {
  badge?: string;
  headline?: string;
  subheadline?: string;
}

interface HeroProps {
  content?: HeroContent | null;
  heroProduct?: ProductCardItem | null;
  onAddToCart?: (product: ProductCardItem) => void;
}

export function Hero({ content, heroProduct, onAddToCart }: HeroProps) {
  const badge = content?.badge?.trim() || 'Hardware • Certified Refurbished • IT Services';
  const headline = content?.headline?.trim() || 'Technology That Moves You Forward.';
  const subheadline =
    content?.subheadline?.trim() ||
    'Discover quality laptops, computer hardware and professional technology services — all in one place.';

  const hasProductVisual = Boolean(heroProduct?.images?.[0]?.url);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#EAF3FF] via-[#F2F7FF] to-[#EAF3FF] dark:from-[#0B1930] dark:via-[#0E203D] dark:to-[#0B1930] pt-6 pb-16 sm:pt-10 sm:pb-24 border-b border-line dark:border-slate-800">
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.14),transparent_58%)] dark:bg-[radial-gradient(ellipse_at_top_right,rgba(96,165,250,0.18),transparent_58%)] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 tech-grid-bg opacity-55 dark:opacity-35 pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Editorial Copy & Actions */}
          <div className="lg:col-span-6 space-y-6">
            <div className="glass-pill inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium text-ink dark:text-slate-100 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-brand-600 dark:bg-electric" aria-hidden="true" />
              <span className="font-mono text-[11px] tracking-wide text-slate-700 dark:text-slate-200">
                {badge}
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.75rem] font-bold tracking-tight text-ink dark:text-white leading-[1.04]">
              {headline}
            </h1>

            <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 max-w-xl leading-relaxed">
              {subheadline}
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-brand-700 transition shadow-sm"
              >
                <span>Explore Hardware</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/refurbished"
                className="glass-pill inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-ink dark:text-white hover:border-brand-600 dark:hover:border-electric transition"
              >
                <Laptop className="h-4 w-4 text-brand-600 dark:text-electric" />
                <span>Certified Refurbished</span>
              </Link>
            </div>

            <div className="pt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-mono text-slate-600 dark:text-slate-400">
              <span>ORDER REQUEST CHECKOUT</span>
              <span aria-hidden="true">•</span>
              <span>TRANSPARENT INR PRICING</span>
              <span aria-hidden="true">•</span>
              <Link
                href="/services#book-repair"
                className="text-brand-600 dark:text-electric font-semibold hover:underline"
              >
                BOOK REPAIR OR UPGRADE
              </Link>
            </div>
          </div>

          {/* Right Real Laptop/Desktop Showcase Stage */}
          <div className="lg:col-span-6">
            {hasProductVisual && heroProduct ? (
              <div className="relative rounded-3xl border border-blue-200/80 dark:border-blue-400/25 bg-[#0B1930] text-white p-4 sm:p-6 shadow-glass overflow-hidden">
                <div
                  className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-brand-600/35 blur-3xl pointer-events-none"
                  aria-hidden="true"
                />

                <div className="relative flex items-center justify-between gap-2 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-electric" aria-hidden="true" />
                    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-300">
                      Featured System // {heroProduct.brand}
                    </span>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase ${
                      heroProduct.inStock
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {heroProduct.inStock
                      ? `In Stock (${heroProduct.availableQuantity})`
                      : 'Out of Stock'}
                  </span>
                </div>

                <Link
                  href={`/products/${heroProduct.slug}`}
                  className="block relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-white border border-white/15 group"
                >
                  <img
                    src={heroProduct.images![0].url}
                    alt={heroProduct.images![0].altText || heroProduct.name}
                    className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                </Link>

                <div className="relative pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="min-w-0">
                    <Link
                      href={`/products/${heroProduct.slug}`}
                      className="block font-display font-semibold text-base sm:text-lg text-white hover:text-electric truncate transition-colors"
                    >
                      {heroProduct.name}
                    </Link>
                    <p className="font-mono text-xs text-slate-400 mt-0.5">
                      SKU: {heroProduct.sku} • {formatINR(heroProduct.sellingPrice)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {onAddToCart && (
                      <button
                        type="button"
                        disabled={!heroProduct.inStock}
                        onClick={() => onAddToCart(heroProduct)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-4 py-2 text-xs font-semibold text-ink hover:bg-amber-400 disabled:opacity-40 transition"
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        <span>Add to Cart</span>
                      </button>
                    )}
                    <Link
                      href={`/products/${heroProduct.slug}`}
                      className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/20 transition"
                    >
                      <span>Inspect</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <HeroMedia />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
