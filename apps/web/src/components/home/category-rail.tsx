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
      className="py-16 sm:py-20 bg-[#DCEBFF]/55 dark:bg-[#0D1E3A] border-b border-line dark:border-slate-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="01 // Category Discovery"
          title="Shop by Hardware Category"
          description="Browse laptops, desktops, displays, memory, storage, printers, and accessories."
          actionHref="/products"
          actionLabel="View Full Catalogue"
        />

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-52 rounded-2xl bg-white/60 dark:bg-slate-800/60 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/60 dark:border-red-500/30 p-5 text-sm text-red-700 dark:text-red-200">
            Unable to load hardware categories right now.
          </div>
        ) : categories.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center text-sm text-slate-600 dark:text-slate-300">
            No hardware categories are published yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
            {categories.map((cat, idx) => {
              const Icon = getCategoryIcon(cat.slug);
              return (
                <Reveal key={cat.id} delayMs={idx * 35}>
                  <Link
                    href={`/products?categorySlug=${cat.slug}`}
                    className="glass-card group h-full rounded-2xl overflow-hidden flex flex-col justify-between hover:border-brand-600 dark:hover:border-electric hover:shadow-card transition-all"
                  >
                    <div>
                      <div className="relative aspect-[16/9] bg-white dark:bg-slate-900 overflow-hidden border-b border-line dark:border-slate-800">
                        {cat.imageUrl ? (
                          <img
                            src={cat.imageUrl}
                            alt={cat.name}
                            loading="lazy"
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="h-full flex items-center justify-center bg-gradient-to-br from-surface to-blue-100 dark:from-slate-800 dark:to-slate-900 text-brand-600 dark:text-electric">
                            <Icon className="h-7 w-7" />
                          </div>
                        )}
                        <div
                          className="absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent pointer-events-none"
                          aria-hidden="true"
                        />
                        <span className="glass-pill absolute top-2.5 left-2.5 inline-flex h-8 w-8 items-center justify-center rounded-lg text-brand-600 dark:text-electric">
                          <Icon className="h-4 w-4" />
                        </span>
                      </div>

                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-display font-semibold text-sm sm:text-base text-ink dark:text-white group-hover:text-brand-600 dark:group-hover:text-electric transition-colors">
                            {cat.name}
                          </h3>
                          <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-brand-600 dark:group-hover:text-electric shrink-0 transition-colors" />
                        </div>
                        {cat.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                            {cat.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="px-4 pb-3.5 pt-2.5 border-t border-line/70 dark:border-slate-700/60 flex items-center justify-between font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      <span>{cat.productCount ?? 0} listings</span>
                      <span className="text-brand-600 dark:text-electric font-semibold">Browse</span>
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
