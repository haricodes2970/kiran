import React from 'react';
import Link from 'next/link';
import { ArrowRight, BatteryCharging, Cpu, ShieldCheck } from 'lucide-react';
import { formatINR } from '@/lib/api';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/ui/reveal';

export interface RefurbishedItem {
  id: string;
  slug: string;
  title: string;
  deviceCode: string;
  conditionGrade?: string | null;
  processor?: string | null;
  ram?: string | null;
  storage?: string | null;
  batteryHealthPct?: number | null;
  warrantyMonths?: number | null;
  sellingPrice: number | string;
  isDemo?: boolean;
}

interface RefurbishedShowcaseProps {
  devices: RefurbishedItem[];
  loading: boolean;
  error: string | null;
}

export function RefurbishedShowcase({
  devices,
  loading,
  error,
}: RefurbishedShowcaseProps) {
  return (
    <section className="py-14 sm:py-18 bg-panel-2/70 border-y border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Inspected Refurbished Laptops"
          description="Condition-graded laptops with recorded inspection checks, transparent specs, and store warranty details where listed."
          actionHref="/refurbished"
          actionLabel="Explore Certified Refurbished"
        />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-72 rounded-card bg-panel animate-pulse border border-subtle" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-card border border-red-200 bg-red-50 dark:bg-red-950/60 dark:border-red-500/30 p-5 text-sm text-red-700 dark:text-red-200">
            Unable to load refurbished devices right now.
          </div>
        ) : devices.length === 0 ? (
          <div className="surface-card p-10 text-center space-y-3">
            <p className="text-sm font-medium text-fg">
              No certified refurbished units are currently listed.
            </p>
            <Link
              href="/refurbished"
              className="inline-flex items-center gap-1.5 rounded-control bg-brand-600 px-5 py-2 text-xs font-semibold text-white hover:bg-brand-700 transition-colors"
            >
              <span>Check Refurbished Catalogue</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {devices.map((dev, idx) => (
              <Reveal key={dev.id} delayMs={idx * 45}>
                <article className="surface-card h-full p-5 flex flex-col justify-between gap-4 hover:border-accent hover:shadow-card transition-all duration-200">
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between gap-2">
                      {dev.conditionGrade ? (
                        <span className="rounded-md bg-blue-50 dark:bg-brand-600/20 border border-blue-200/80 dark:border-electric/35 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase text-brand-700 dark:text-electric">
                          {dev.conditionGrade.replace(/_/g, ' ')}
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] uppercase text-muted">
                          Refurbished
                        </span>
                      )}
                      <span className="font-mono text-[11px] text-muted">
                        {dev.deviceCode}
                      </span>
                    </div>

                    <Link
                      href={`/refurbished/${dev.slug}`}
                      className="block font-display font-semibold text-base text-fg hover:text-accent line-clamp-2 leading-snug transition-colors"
                    >
                      {dev.title}
                    </Link>

                    {/* Technical spec-sheet rows */}
                    <dl className="divide-y divide-subtle border-y border-subtle font-mono text-[11px]">
                      {dev.processor && (
                        <div className="py-2 flex items-center justify-between gap-2">
                          <dt className="text-muted flex items-center gap-1.5 shrink-0">
                            <Cpu className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                            <span>CPU</span>
                          </dt>
                          <dd className="text-fg font-medium truncate text-right" title={dev.processor}>
                            {dev.processor}
                          </dd>
                        </div>
                      )}
                      {(dev.ram || dev.storage) && (
                        <div className="py-2 flex items-center justify-between gap-2">
                          <dt className="text-muted shrink-0">RAM / SSD</dt>
                          <dd className="text-fg font-medium truncate text-right">
                            {[dev.ram, dev.storage].filter(Boolean).join(' · ')}
                          </dd>
                        </div>
                      )}
                      {typeof dev.batteryHealthPct === 'number' && (
                        <div className="py-2 flex items-center justify-between gap-2">
                          <dt className="text-muted flex items-center gap-1.5 shrink-0">
                            <BatteryCharging className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                            <span>Battery</span>
                          </dt>
                          <dd className="text-emerald-700 dark:text-emerald-400 font-semibold">
                            {dev.batteryHealthPct}%
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  <div className="pt-1 flex items-end justify-between gap-3">
                    <div>
                      {typeof dev.warrantyMonths === 'number' && dev.warrantyMonths > 0 && (
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] text-muted mb-0.5">
                          <ShieldCheck className="h-3 w-3 text-accent" aria-hidden="true" />
                          {dev.warrantyMonths}M Warranty
                        </span>
                      )}
                      <p className="font-display text-lg font-bold text-fg">
                        {formatINR(dev.sellingPrice)}
                      </p>
                    </div>

                    <Link
                      href={`/refurbished/${dev.slug}`}
                      className="rounded-control bg-amber-500 px-3.5 py-2 text-xs font-semibold text-[#0B1930] hover:bg-amber-400 transition-colors shrink-0"
                    >
                      Inspect Unit
                    </Link>
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
