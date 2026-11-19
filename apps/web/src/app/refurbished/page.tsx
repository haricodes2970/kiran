'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BatteryCharging,
  CheckCircle2,
  Laptop,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';
import { apiFetch, buildWhatsAppUrl, formatINR } from '@/lib/api';
import { useApp } from '@/context/app-context';
import { AddToCartButton } from '@/components/ui/add-to-cart-button';

export default function RefurbishedMarketplacePage() {
  const { addToCart } = useApp();
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [brand, setBrand] = useState('');
  const [conditionGrade, setConditionGrade] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (brand) params.set('brand', brand);
        if (conditionGrade) params.set('conditionGrade', conditionGrade);
        params.set('sortBy', sortBy);
        const res = await apiFetch(`/refurbished?${params.toString()}`);
        setDevices(res?.data || []);
      } catch {
        setDevices([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [brand, conditionGrade, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
      {/* Theme-Consistent Header Banner */}
      <div className="glass-stage rounded-card p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2.5 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 dark:bg-brand-600/20 border border-blue-200/80 dark:border-electric/30 px-2.5 py-1 font-mono text-[11px] font-semibold text-brand-700 dark:text-electric">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Certified Refurbished · Serial-Tracked Single Units</span>
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-fg">
            Inspected Refurbished Laptop Marketplace
          </h1>
          <p className="text-xs sm:text-sm text-muted leading-relaxed">
            Each refurbished laptop listed here includes recorded hardware specs, condition grading, battery status where measured, and single-unit availability tracking.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 shrink-0">
          <Link
            href="/sell-laptop"
            className="rounded-control bg-brand-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            Sell Your Used Laptop
          </Link>
        </div>
      </div>

      {/* Glass Filter Bar */}
      <div className="glass-filter rounded-card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            aria-label="Filter by brand"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="glass-input rounded-control px-3 py-2 text-xs font-medium"
          >
            <option value="">All Brands</option>
            <option value="Lenovo">Lenovo ThinkPad</option>
            <option value="Dell">Dell Latitude</option>
            <option value="HP">HP EliteBook / ProBook</option>
            <option value="Apple">Apple MacBook</option>
          </select>

          <select
            aria-label="Filter by condition grade"
            value={conditionGrade}
            onChange={(e) => setConditionGrade(e.target.value)}
            className="glass-input rounded-control px-3 py-2 text-xs font-medium"
          >
            <option value="">All Condition Grades</option>
            <option value="GRADE_A_EXCELLENT">Grade A — Excellent</option>
            <option value="GRADE_B_GOOD">Grade B — Good Value</option>
            <option value="GRADE_C_FAIR">Grade C — Fair</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">Sort:</span>
          <select
            aria-label="Sort refurbished laptops"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="glass-input rounded-control px-3 py-2 text-xs font-medium"
          >
            <option value="newest">Recently Listed</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Listings */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-96 rounded-card bg-panel animate-pulse border border-subtle" />
          ))}
        </div>
      ) : devices.length === 0 ? (
        <div className="surface-card p-10 text-center space-y-2">
          <Laptop className="h-10 w-10 text-muted mx-auto" aria-hidden="true" />
          <p className="text-base font-bold text-fg">
            No refurbished units match your current filter
          </p>
          <p className="text-xs text-muted">
            Reset filters or enquire on WhatsApp for current showroom availability.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {devices.map((dev) => (
            <article
              key={dev.id}
              className="surface-card overflow-hidden flex flex-col justify-between hover:border-accent hover:shadow-card transition-all duration-200"
            >
              <div>
                <Link
                  href={`/refurbished/${dev.slug}`}
                  className="block relative h-48 bg-panel-2 border-b border-subtle overflow-hidden group"
                >
                  {dev.imageUrls?.[0] ? (
                    <img
                      src={dev.imageUrls[0]}
                      alt={dev.title}
                      loading="lazy"
                      className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted">
                      <Laptop className="h-10 w-10" aria-hidden="true" />
                    </div>
                  )}
                  {dev.conditionGrade && (
                    <span className="absolute top-3 left-3 rounded-md bg-brand-600 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase text-white">
                      {dev.conditionGrade.replace(/_/g, ' ')}
                    </span>
                  )}
                  <span className="absolute top-3 right-3 rounded-md bg-[#071122]/85 border border-white/15 px-2 py-0.5 text-[10px] font-mono text-white">
                    {dev.deviceCode}
                  </span>
                </Link>

                <div className="p-5 space-y-3">
                  <Link
                    href={`/refurbished/${dev.slug}`}
                    className="block font-display font-bold text-fg hover:text-accent text-base leading-snug transition-colors"
                  >
                    {dev.title}
                  </Link>

                  <dl className="divide-y divide-subtle border-y border-subtle font-mono text-[11px]">
                    {dev.processor && (
                      <div className="py-1.5 flex items-center justify-between gap-2">
                        <dt className="text-muted">CPU</dt>
                        <dd className="font-medium text-fg truncate text-right">{dev.processor}</dd>
                      </div>
                    )}
                    {(dev.ram || dev.storage) && (
                      <div className="py-1.5 flex items-center justify-between gap-2">
                        <dt className="text-muted">RAM / SSD</dt>
                        <dd className="font-medium text-fg truncate text-right">
                          {[dev.ram, dev.storage].filter(Boolean).join(' · ')}
                        </dd>
                      </div>
                    )}
                    {dev.display && (
                      <div className="py-1.5 flex items-center justify-between gap-2">
                        <dt className="text-muted">Display</dt>
                        <dd className="font-medium text-fg truncate text-right">{dev.display}</dd>
                      </div>
                    )}
                    {typeof dev.batteryHealthPct === 'number' && (
                      <div className="py-1.5 flex items-center justify-between gap-2">
                        <dt className="text-muted flex items-center gap-1">
                          <BatteryCharging className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                          <span>Battery</span>
                        </dt>
                        <dd className="font-semibold text-emerald-700 dark:text-emerald-400">
                          {dev.batteryHealthPct}%
                        </dd>
                      </div>
                    )}
                  </dl>

                  {dev.workPerformed && (
                    <p className="text-xs text-muted line-clamp-2">
                      <span className="font-semibold text-fg">Work Logged: </span>
                      {dev.workPerformed}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-5 pt-0 space-y-3">
                <div className="pt-3 border-t border-subtle flex items-center justify-between gap-3">
                  <div>
                    {typeof dev.warrantyMonths === 'number' && dev.warrantyMonths > 0 && (
                      <span className="block text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="h-3 w-3 inline mr-1" aria-hidden="true" />
                        {dev.warrantyMonths}M Store Warranty
                      </span>
                    )}
                    <span className="font-display text-xl font-bold text-fg">
                      {formatINR(dev.sellingPrice)}
                    </span>
                  </div>

                  <AddToCartButton
                    label="Add to Cart"
                    showCartLink
                    onAdd={() =>
                      addToCart({
                        id: dev.id,
                        type: 'REFURBISHED',
                        name: dev.title,
                        sku: dev.deviceCode,
                        slug: dev.slug,
                        price: dev.sellingPrice,
                        maxStock: 1,
                        imageUrl: dev.imageUrls?.[0],
                      })
                    }
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/refurbished/${dev.slug}`}
                    className="flex-1 text-center rounded-control border border-subtle bg-panel-2 px-3 py-1.5 text-xs font-semibold text-fg hover:border-accent transition-colors"
                  >
                    Inspect Unit
                  </Link>
                  <a
                    href={buildWhatsAppUrl(
                      `Hello Kiran's Infotech, I am interested in refurbished ${dev.title} (Unit ID: ${dev.deviceCode}, Price: ${formatINR(dev.sellingPrice)}).`,
                    )}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`WhatsApp enquiry for ${dev.title}`}
                    className="inline-flex items-center justify-center gap-1 rounded-control border border-emerald-600/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                  >
                    <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Enquire</span>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
