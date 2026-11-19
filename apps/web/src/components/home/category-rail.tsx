import React from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  Cpu,
  HardDrive,
  Keyboard,
  Laptop,
  Monitor,
  PcCase,
  Printer,
  Plug,
} from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/ui/reveal';

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  productCount?: number;
}

interface CategoryRailProps {
  categories: CategoryItem[];
  loading: boolean;
  error: string | null;
}

function getCategoryIcon(slug: string) {
  switch (slug) {
    case 'laptops':
      return Laptop;
    case 'desktops':
      return PcCase;
    case 'monitors':
      return Monitor;
    case 'storage':
      return HardDrive;
    case 'ram':
      return Cpu;
    case 'keyboards-mice':
      return Keyboard;
    case 'printers':
      return Printer;
    default:
      return Plug;
  }
}

export function CategoryRail({ categories, loading, error }: CategoryRailProps) {
  return (
    <section
      aria-labelledby="categories-heading"
      className="py-14 sm:py-18 bg-panel-2/55 border-b border-subtle"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Shop by Hardware Category"
          description="Browse laptops, desktops, displays, memory, storage, printers, and accessories."
          actionHref="/products"
          actionLabel="View Full Catalogue"
        />

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-44 rounded-card bg-panel animate-pulse border border-subtle" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-card border border-red-200 bg-red-50 dark:bg-red-950/60 dark:border-red-500/30 p-5 text-sm text-red-700 dark:text-red-200">
            Unable to load hardware categories right now.
          </div>
        ) : categories.length === 0 ? (
          <div className="surface-card p-8 text-center text-sm text-muted">
            No hardware categories are published yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
            {categories.map((cat, idx) => {
              const Icon = getCategoryIcon(cat.slug);
              return (
                <Reveal key={cat.id} delayMs={idx * 30}>
                  <Link
                    href={`/products?categorySlug=${cat.slug}`}
                    className="surface-card group h-full overflow-hidden flex flex-col justify-between hover:border-accent hover:shadow-card transition-all duration-200"
                  >
                    <div>
                      <div className="relative aspect-[16/9] bg-panel-2 overflow-hidden border-b border-subtle">
                        {cat.imageUrl ? (
                          <img
                            src={cat.imageUrl}
                            alt={cat.name}
                            loading="lazy"
                            className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                          />
                        ) : (
                          <div className="h-full flex items-center justify-center bg-panel-2 text-accent">
                            <Icon className="h-6 w-6" aria-hidden="true" />
                          </div>
                        )}
                      </div>

                      <div className="p-3.5 sm:p-4">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Icon className="h-4 w-4 text-accent shrink-0" aria-hidden="true" />
                            <h3 className="font-display font-semibold text-sm sm:text-[15px] text-fg group-hover:text-accent truncate transition-colors">
                              {cat.name}
                            </h3>
                          </div>
                          <ArrowUpRight
                            className="h-4 w-4 text-muted group-hover:text-accent shrink-0 transition-colors"
                            aria-hidden="true"
                          />
                        </div>
                        {cat.description && (
                          <p className="hidden sm:line-clamp-1 text-xs text-muted mt-1">
                            {cat.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="px-3.5 sm:px-4 py-2.5 border-t border-subtle flex items-center justify-between font-mono text-[11px] text-muted">
                      <span>{cat.productCount ?? 0} listings</span>
                      <span className="text-accent font-semibold">Browse</span>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
