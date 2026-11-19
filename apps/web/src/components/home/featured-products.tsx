import React from 'react';
import Link from 'next/link';
import { HardDrive, MessageCircle, ShoppingCart } from 'lucide-react';
import { buildWhatsAppUrl, formatINR } from '@/lib/api';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/ui/reveal';

export interface ProductCardItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  brand: string;
  shortSummary?: string | null;
  description?: string | null;
  sellingPrice: number | string;
  mrpPrice?: number | string | null;
  inStock: boolean;
  availableQuantity: number;
  isDemo?: boolean;
  images?: Array<{ url: string; altText?: string | null }>;
}

interface FeaturedProductsProps {
  products: ProductCardItem[];
  loading: boolean;
  error: string | null;
  onAddToCart: (product: ProductCardItem) => void;
}

export function FeaturedProducts({
  products,
  loading,
  error,
  onAddToCart,
}: FeaturedProductsProps) {
  return (
    <section className="py-16 sm:py-20 bg-[#EAF3FF] dark:bg-[#0B1930]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="02 // Featured Hardware"
          title="Laptops, Components & Displays"
          description="Live catalogue items with transparent INR pricing, stock availability, and Order Request cart actions."
          actionHref="/products"
          actionLabel="Explore All Products"
        />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-96 rounded-2xl bg-white/60 dark:bg-slate-800/60 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/60 dark:border-red-500/30 p-5 text-sm text-red-700 dark:text-red-200">
            {error}
          </div>
        ) : products.length === 0 ? (
          <div className="glass-card rounded-2xl p-10 text-center space-y-3">
            <p className="text-sm font-medium text-ink dark:text-white">
              No featured hardware listings are available right now.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center rounded-full bg-brand-600 px-5 py-2 text-xs font-semibold text-white hover:bg-brand-700 transition"
            >
              Browse Complete Catalogue
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((prod, idx) => (
              <Reveal key={prod.id} delayMs={idx * 50}>
                <article className="glass-card h-full rounded-2xl overflow-hidden flex flex-col justify-between hover:border-brand-600 dark:hover:border-electric hover:shadow-card transition-all">
                  <div>
                    <Link
                      href={`/products/${prod.slug}`}
                      className="block relative aspect-[4/3] bg-white border-b border-line dark:border-slate-700/70 overflow-hidden group"
                    >
                      {prod.images?.[0]?.url ? (
                        <img
                          src={prod.images[0].url}
                          alt={prod.images[0].altText || prod.name}
                          loading="lazy"
                          className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center text-slate-400">
                          <HardDrive className="h-10 w-10" />
                        </div>
                      )}

                      <span
                        className={`absolute top-3 left-3 rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide ${
                          prod.inStock
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-800 text-white'
                        }`}
                      >
                        {prod.inStock
                          ? `In Stock (${prod.availableQuantity})`
                          : 'Out of Stock'}
                      </span>

                      {prod.isDemo && (
                        <span className="glass-pill absolute top-3 right-3 rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold text-amber-800 dark:text-amber-300">
                          Demo Item
                        </span>
                      )}
                    </Link>

                    <div className="p-5 space-y-2">
                      <div className="flex items-center justify-between font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-brand-600 dark:text-electric uppercase">
                          {prod.brand}
                        </span>
                        <span>{prod.sku}</span>
                      </div>

                      <Link
                        href={`/products/${prod.slug}`}
                        className="block font-display font-semibold text-base text-ink dark:text-white hover:text-brand-600 dark:hover:text-electric line-clamp-2 leading-snug transition-colors"
                      >
                        {prod.name}
                      </Link>

                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {prod.shortSummary || prod.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 space-y-3">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-xl font-bold text-ink dark:text-white">
                          {formatINR(prod.sellingPrice)}
                        </span>
                        {prod.mrpPrice && Number(prod.mrpPrice) > Number(prod.sellingPrice) && (
                          <span className="text-xs text-slate-400 line-through">
                            {formatINR(prod.mrpPrice)}
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Order Request Only
                      </span>
                    </div>

                    {/* Amazon-inspired Commerce Action Hierarchy */}
                    <div className="space-y-2">
                      <button
                        type="button"
                        disabled={!prod.inStock}
                        onClick={() => onAddToCart(prod)}
                        className="w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-amber-500 px-4 py-2.5 text-xs font-semibold text-ink hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        <span>Add to Cart</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/products/${prod.slug}`}
                          className="flex-1 text-center rounded-full border border-line dark:border-slate-600 bg-white/60 dark:bg-white/5 px-3 py-1.5 text-xs font-semibold text-ink dark:text-slate-100 hover:border-brand-600 dark:hover:border-electric transition"
                        >
                          Inspect Product
                        </Link>
                        <a
                          href={buildWhatsAppUrl(
                            `Hello Kiran's Infotech, I would like to enquire about ${prod.name} (SKU: ${prod.sku}).`,
                          )}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`WhatsApp enquiry for ${prod.name}`}
                          className="inline-flex items-center justify-center gap-1 rounded-full border border-emerald-600/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          <span>Enquire</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
