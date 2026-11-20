import React from 'react';
import Link from 'next/link';
import { HardDrive, MessageCircle } from 'lucide-react';
import { buildWhatsAppUrl, formatINR } from '@/lib/api';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/ui/reveal';
import { AddToCartButton } from '@/components/ui/add-to-cart-button';

export interface ProductSpecItem {
  key: string;
  value: string;
  groupName?: string | null;
}

export interface ProductCardItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  brand: string;
  model?: string | null;
  shortSummary?: string | null;
  description?: string | null;
  sellingPrice: number | string;
  mrpPrice?: number | string | null;
  inStock: boolean;
  availableQuantity: number;
  isDemo?: boolean;
  images?: Array<{ url: string; altText?: string | null }>;
  specifications?: ProductSpecItem[];
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
    <section className="py-14 sm:py-18 bg-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Laptops, Components & Displays"
          description="Live catalogue items with transparent INR pricing, stock availability, and Order Request cart actions."
          actionHref="/products"
          actionLabel="Explore All Products"
        />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-96 rounded-card bg-panel animate-pulse border border-subtle" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-card border border-red-200 bg-red-50 dark:bg-red-950/60 dark:border-red-500/30 p-5 text-sm text-red-700 dark:text-red-200">
            {error}
          </div>
        ) : products.length === 0 ? (
          <div className="surface-card p-10 text-center space-y-3">
            <p className="text-sm font-medium text-fg">
              No featured hardware listings are available right now.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center rounded-control bg-brand-600 px-5 py-2 text-xs font-semibold text-white hover:bg-brand-700 transition-colors"
            >
              Browse Complete Catalogue
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map((prod, idx) => (
              <Reveal key={prod.id} delayMs={idx * 45}>
                <article className="surface-card h-full overflow-hidden flex flex-col justify-between hover:border-accent hover:shadow-card transition-all duration-200">
                  <div>
                    <Link
                      href={`/products/${prod.slug}`}
                      className="block relative aspect-[4/3] bg-panel-2 border-b border-subtle overflow-hidden group"
                    >
                      {prod.images?.[0]?.url ? (
                        <img
                          src={prod.images[0].url}
                          alt={prod.images[0].altText || prod.name}
                          loading="lazy"
                          className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center text-muted">
                          <HardDrive className="h-10 w-10" aria-hidden="true" />
                        </div>
                      )}

                      <span
                        className={`absolute top-3 left-3 rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide border ${
                          prod.inStock
                            ? 'bg-emerald-50/95 text-emerald-800 border-emerald-300/80 dark:bg-emerald-950/85 dark:text-emerald-300 dark:border-emerald-400/30'
                            : 'bg-slate-100/95 text-slate-700 border-slate-300 dark:bg-slate-900/85 dark:text-slate-300 dark:border-white/15'
                        }`}
                      >
                        {prod.inStock
                          ? `In Stock (${prod.availableQuantity})`
                          : 'Out of Stock'}
                      </span>

                      {prod.isDemo && (
                        <span className="absolute top-3 right-3 rounded-md bg-white/90 dark:bg-[#071122]/85 border border-amber-300/80 dark:border-amber-400/30 px-2 py-0.5 font-mono text-[10px] font-semibold text-amber-800 dark:text-amber-300">
                          Demo Item
                        </span>
                      )}
                    </Link>

                    <div className="p-4 sm:p-5 space-y-2">
                      <div className="flex items-center justify-between font-mono text-[11px] text-muted">
                        <span className="font-semibold text-accent uppercase">
                          {prod.brand}
                        </span>
                        <span>{prod.sku}</span>
                      </div>

                      <Link
                        href={`/products/${prod.slug}`}
                        className="block font-display font-semibold text-base text-fg hover:text-accent line-clamp-2 leading-snug transition-colors"
                      >
                        {prod.name}
                      </Link>

                      <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                        {prod.shortSummary || prod.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 pt-0 space-y-3">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-xl font-bold text-fg">
                          {formatINR(prod.sellingPrice)}
                        </span>
                        {prod.mrpPrice && Number(prod.mrpPrice) > Number(prod.sellingPrice) && (
                          <span className="text-xs text-muted line-through">
                            {formatINR(prod.mrpPrice)}
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                        Order Request Only
                      </span>
                    </div>

                    <div className="space-y-2">
                      <AddToCartButton
                        disabled={!prod.inStock}
                        onAdd={() => onAddToCart(prod)}
                        showCartLink
                        className="w-full"
                      />

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/products/${prod.slug}`}
                          className="flex-1 text-center rounded-control border border-subtle bg-panel-2 hover:border-accent px-3 py-1.5 text-xs font-semibold text-fg transition-colors"
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
                          className="inline-flex items-center justify-center gap-1 rounded-control border border-emerald-600/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                        >
                          <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
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
