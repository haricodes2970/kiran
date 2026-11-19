import React from 'react';
import Link from 'next/link';
import { ArrowRight, BatteryCharging, Cpu, ShieldCheck } from 'lucide-react';
import { formatINR } from '@/lib/api';
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
    <section className="relative overflow-hidden py-16 sm:py-22 bg-[#0B1930] dark:bg-[#071122] text-white border-y border-slate-800">
      <div
        className="absolute -top-32 left-1/4 h-80 w-80 rounded-full bg-brand-600/25 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div className="space-y-2 max-w-2xl">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-electric">
              03 // Certified Refurbished
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Inspected Refurbished Laptops
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Condition-graded laptops with recorded inspection checks, transparent specs, and store warranty details where listed.
            </p>
          </div>

          <Link
            href="/refurbished"
            className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-brand-500 transition shrink-0"
          >
            <span>Explore Certified Refurbished</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-72 rounded-2xl bg-slate-800/80 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-400/30 bg-red-950/50 p-5 text-sm text-red-200">
            Unable to load refurbished devices right now.
          </div>
        ) : devices.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-10 text-center space-y-3">
            <p className="text-sm font-medium text-slate-200">
              No certified refurbished units are currently listed.
            </p>
            <Link
              href="/refurbished"
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-5 py-2 text-xs font-semibold text-white hover:bg-brand-500 transition"
            >
              <span>Check Refurbished Catalogue</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {devices.map((dev, idx) => (
              <Reveal key={dev.id} delayMs={idx * 50}>
                <article className="h-full rounded-2xl border border-blue-400/20 bg-[#102342]/80 p-5 flex flex-col justify-between gap-5 hover:border-electric/60 transition-all">
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between gap-2">
                      {dev.conditionGrade ? (
                        <span className="rounded-full bg-brand-600/25 border border-electric/35 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase text-electric">
                          {dev.conditionGrade.replace(/_/g, ' ')}
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] text-slate-400">
                          REFURBISHED
                        </span>
                      )}
                      <span className="font-mono text-[11px] text-slate-300">
                        {dev.deviceCode}
                      </span>
                    </div>

                    <Link
                      href={`/refurbished/${dev.slug}`}
                      className="block font-display font-semibold text-base text-white hover:text-electric line-clamp-2 leading-snug transition-colors"
                    >
                      {dev.title}
                    </Link>

                    <div className="rounded-xl bg-[#071122]/75 border border-slate-800 p-3 space-y-1.5 font-mono text-[11px] text-slate-300">
                      {dev.processor && (
                        <p className="flex items-center gap-1.5 truncate">
                          <Cpu className="h-3.5 w-3.5 text-electric shrink-0" />
                          <span className="truncate">{dev.processor}</span>
                        </p>
                      )}
                      {(dev.ram || dev.storage) && (
                        <p className="text-slate-400 truncate">
                          {[dev.ram, dev.storage].filter(Boolean).join(' • ')}
                        </p>
                      )}
                      {typeof dev.batteryHealthPct === 'number' && (
                        <p className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                          <BatteryCharging className="h-3.5 w-3.5 shrink-0" />
                          <span>Battery: {dev.batteryHealthPct}%</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-end justify-between gap-3">
                    <div>
                      {typeof dev.warrantyMonths === 'number' && dev.warrantyMonths > 0 && (
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] text-slate-300 mb-0.5">
                          <ShieldCheck className="h-3 w-3 text-electric" />
                          {dev.warrantyMonths}M Warranty
                        </span>
                      )}
                      <p className="font-display text-lg font-bold text-white">
                        {formatINR(dev.sellingPrice)}
                      </p>
                    </div>

                    <Link
                      href={`/refurbished/${dev.slug}`}
                      className="rounded-full bg-amber-500 px-3.5 py-2 text-xs font-semibold text-ink hover:bg-amber-400 transition shrink-0"
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
