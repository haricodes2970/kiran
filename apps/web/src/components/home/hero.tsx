'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Check, Laptop, ShoppingCart } from 'lucide-react';
import { formatINR } from '@/lib/api';
import { HeroMedia } from '@/components/home/hero-media';
import { ProductCardItem, ProductSpecItem } from '@/components/home/featured-products';

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

const PRIORITY_SPEC_KEYS = ['Processor', 'Memory', 'Storage', 'Graphics', 'Display'];

function pickHeroSpecs(specs?: ProductSpecItem[]): ProductSpecItem[] {
  if (!Array.isArray(specs) || specs.length === 0) return [];
  const picked: ProductSpecItem[] = [];
  for (const key of PRIORITY_SPEC_KEYS) {
    const match = specs.find((s) => s.key.toLowerCase() === key.toLowerCase());
    if (match && match.value) {
      picked.push(match);
    }
    if (picked.length === 4) break;
  }
  if (picked.length === 0) {
    return specs.slice(0, 4);
  }
  return picked;
}

export function Hero({ content, heroProduct, onAddToCart }: HeroProps) {
  const [justAdded, setJustAdded] = useState(false);

  const headline = content?.headline?.trim() || 'Technology That Moves You Forward.';
  const subheadline =
    content?.subheadline?.trim() ||
    'Laptops, components, certified refurbished systems and professional IT services with transparent INR pricing.';

  const hasProductVisual = Boolean(heroProduct?.images?.[0]?.url);
  const heroSpecs = heroProduct ? pickHeroSpecs(heroProduct.specifications) : [];
  const showMrp =
    heroProduct?.mrpPrice &&
    Number(heroProduct.mrpPrice) > Number(heroProduct.sellingPrice);

  const handleHeroAddToCart = () => {
    if (!heroProduct || !onAddToCart || !heroProduct.inStock) return;
    onAddToCart(heroProduct);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 2600);
  };

  return (
    <section className="relative bg-page pt-8 pb-14 sm:pt-12 sm:pb-20 border-b border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Editorial Column */}
          <div className="lg:col-span-5 space-y-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent font-semibold">
              Kiran&apos;s Infotech · Hardware &amp; IT Services
            </p>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.35rem] xl:text-[3.6rem] font-bold tracking-tight text-fg leading-[1.04]">
              {headline}
            </h1>

            <p className="text-base sm:text-[17px] text-muted max-w-lg leading-relaxed">
              {subheadline}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-control bg-brand-600 hover:bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition-colors"
              >
                <span>Explore Hardware</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>

              <Link
                href="/refurbished"
                className="inline-flex items-center gap-2 rounded-control border border-subtle bg-panel hover:border-accent px-5 py-3 text-sm font-semibold text-fg transition-colors"
              >
                <Laptop className="h-4 w-4 text-accent" aria-hidden="true" />
                <span>Certified Refurbished</span>
              </Link>
            </div>

            <div className="pt-4 border-t border-subtle flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-mono text-muted">
              <span className="whitespace-nowrap">ORDER REQUEST CHECKOUT</span>
              <span className="whitespace-nowrap">INR (₹) PRICING</span>
              <Link
                href="/services#book-repair"
                className="text-accent font-semibold hover:underline whitespace-nowrap"
              >
                BOOK REPAIR OR UPGRADE →
              </Link>
            </div>
          </div>

          {/* Right Art-Directed Hardware Stage */}
          <div className="lg:col-span-7">
            {hasProductVisual && heroProduct ? (
              <div className="rounded-card border border-blue-950/15 dark:border-blue-400/20 bg-[#0B1930] dark:bg-[#071122] text-white overflow-hidden shadow-elevated">
                {/* Seamless Full-Bleed Product Photography (no white cutout box) */}
                <Link
                  href={`/products/${heroProduct.slug}`}
                  className="block relative aspect-[16/10] w-full overflow-hidden group bg-[#071122]"
                >
                  <img
                    src={heroProduct.images![0].url}
                    alt={heroProduct.images![0].altText || heroProduct.name}
                    className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-[#0B1930] via-[#0B1930]/20 to-black/25 dark:from-[#071122] dark:via-[#071122]/25"
                    aria-hidden="true"
                  />

                  {/* Top overlay metadata */}
                  <div className="absolute top-3.5 inset-x-3.5 sm:inset-x-4 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center truncate max-w-[64%] rounded-md bg-[#071122]/80 backdrop-blur-md border border-white/15 px-2.5 py-1 font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-100">
                      {heroProduct.brand}
                      {heroProduct.model ? ` · ${heroProduct.model}` : ''}
                    </span>

                    <span
                      className={`shrink-0 whitespace-nowrap rounded-md px-2.5 py-1 font-mono text-[10px] font-semibold uppercase backdrop-blur-md border ${
                        heroProduct.inStock
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-400/30'
                          : 'bg-slate-900/80 text-slate-300 border-white/15'
                      }`}
                    >
                      {heroProduct.inStock
                        ? `In Stock · ${heroProduct.availableQuantity}`
                        : 'Out of Stock'}
                    </span>
                  </div>
                </Link>

                {/* Hardware Details, Real Specs & Purchase Controls */}
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="space-y-1.5">
                    <Link
                      href={`/products/${heroProduct.slug}`}
                      className="block font-display text-lg sm:text-xl font-bold text-white hover:text-electric transition-colors leading-snug"
                    >
                      {heroProduct.name}
                    </Link>
                    {heroProduct.shortSummary && (
                      <p className="text-xs sm:text-sm text-slate-300 line-clamp-2">
                        {heroProduct.shortSummary}
                      </p>
                    )}
                  </div>

                  {/* Real Specifications (only rendered when backed by catalogue data) */}
                  {heroSpecs.length > 0 && (
                    <dl className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {heroSpecs.map((spec) => (
                        <div
                          key={spec.key}
                          className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-2"
                        >
                          <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                            {spec.key}
                          </dt>
                          <dd className="text-xs font-medium text-slate-100 truncate mt-0.5" title={spec.value}>
                            {spec.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}

                  {/* Pricing & Warm Amber Shopping Actions */}
                  <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="flex items-baseline gap-2.5">
                        <span className="font-display text-xl sm:text-2xl font-bold text-white">
                          {formatINR(heroProduct.sellingPrice)}
                        </span>
                        {showMrp && (
                          <span className="font-mono text-xs text-slate-400 line-through">
                            {formatINR(heroProduct.mrpPrice)}
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-[11px] text-slate-400 mt-0.5">
                        SKU: {heroProduct.sku} · Order Request Only
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {onAddToCart && (
                        <button
                          type="button"
                          disabled={!heroProduct.inStock}
                          onClick={handleHeroAddToCart}
                          className={`inline-flex items-center gap-1.5 rounded-control px-4 py-2.5 text-xs font-semibold transition-colors disabled:opacity-40 ${
                            justAdded
                              ? 'bg-emerald-500 text-[#071122]'
                              : 'bg-amber-500 hover:bg-amber-400 text-[#0B1930]'
                          }`}
                        >
                          {justAdded ? (
                            <>
                              <Check className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>Added to Cart</span>
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>Add to Cart</span>
                            </>
                          )}
                        </button>
                      )}

                      <Link
                        href={justAdded ? '/cart' : `/products/${heroProduct.slug}`}
                        className="inline-flex items-center gap-1 rounded-control border border-white/20 bg-white/10 hover:bg-white/20 px-3.5 py-2.5 text-xs font-semibold text-white transition-colors"
                      >
                        <span>{justAdded ? 'Order Request' : 'View Specs'}</span>
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    </div>
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
