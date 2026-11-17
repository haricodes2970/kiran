'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BatteryCharging,
  CheckCircle2,
  Laptop,
  MessageCircle,
  ShieldCheck,
  ShoppingCart,
} from 'lucide-react';
import { apiFetch, buildWhatsAppUrl, formatINR } from '@/lib/api';
import { useApp } from '@/context/app-context';

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
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [brand, conditionGrade, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="rounded-2xl bg-slate-900 text-white p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-400/30">
            <ShieldCheck className="h-4 w-4" /> Individually Tested &amp; Serial-Tracked
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Certified Refurbished Laptop Marketplace
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Every refurbished laptop sold by Kiran&apos;s Infotech is an individually inspected device with verified screen, keyboard, thermal, SMART storage, and battery health reports. Sold units are automatically removed from availability.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 shrink-0">
          <Link
            href="/sell-laptop"
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-500"
          >
            Sell Your Used Laptop
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium"
          >
            <option value="">All Brands</option>
            <option value="Lenovo">Lenovo ThinkPad</option>
            <option value="Dell">Dell Latitude</option>
            <option value="HP">HP EliteBook / ProBook</option>
            <option value="Apple">Apple MacBook</option>
          </select>

          <select
            value={conditionGrade}
            onChange={(e) => setConditionGrade(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium"
          >
            <option value="">All Condition Grades</option>
            <option value="GRADE_A_EXCELLENT">Grade A — Excellent</option>
            <option value="GRADE_B_GOOD">Grade B — Good Value</option>
            <option value="GRADE_C_FAIR">Grade C — Fair</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium"
          >
            <option value="newest">Recently Certified</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Listings */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-96 rounded-xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : devices.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center space-y-2">
          <Laptop className="h-10 w-10 text-slate-400 mx-auto" />
          <p className="text-base font-bold text-slate-900">
            No refurbished units match your current filter
          </p>
          <p className="text-xs text-slate-500">
            Reset filters or message us on WhatsApp for upcoming corporate off-lease batches.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map((dev) => (
            <div
              key={dev.id}
              className="rounded-xl border border-slate-200 bg-white overflow-hidden flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                <div className="relative h-48 bg-slate-100 border-b border-slate-100">
                  {dev.imageUrls?.[0] ? (
                    <img
                      src={dev.imageUrls[0]}
                      alt={dev.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400">
                      <Laptop className="h-10 w-10" />
                    </div>
                  )}
                  <span className="absolute top-3 left-3 rounded-md bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white">
                    {dev.conditionGrade?.replace(/_/g, ' ')}
                  </span>
                  <span className="absolute top-3 right-3 rounded-md bg-slate-900/80 px-2 py-0.5 text-[11px] font-mono text-white">
                    {dev.deviceCode}
                  </span>
                </div>

                <div className="p-5 space-y-3">
                  <Link
                    href={`/refurbished/${dev.slug}`}
                    className="block font-bold text-slate-900 hover:text-blue-600 text-base leading-snug"
                  >
                    {dev.title}
                  </Link>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div>
                      <span className="block text-[10px] uppercase text-slate-400 font-semibold">
                        Processor
                      </span>
                      <span className="font-medium text-slate-800">{dev.processor}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-slate-400 font-semibold">
                        RAM &amp; SSD
                      </span>
                      <span className="font-medium text-slate-800">
                        {dev.ram} / {dev.storage}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-slate-400 font-semibold">
                        Display
                      </span>
                      <span className="font-medium text-slate-800">{dev.display}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-slate-400 font-semibold">
                        Battery Health
                      </span>
                      <span className="font-semibold text-emerald-700 inline-flex items-center gap-1">
                        <BatteryCharging className="h-3.5 w-3.5" />
                        {dev.batteryHealthPct
                          ? `${dev.batteryHealthPct}% Verified`
                          : 'Assessed'}
                      </span>
                    </div>
                  </div>

                  {dev.workPerformed && (
                    <p className="text-xs text-slate-600 line-clamp-2">
                      <span className="font-semibold text-slate-800">Refurbished Work: </span>
                      {dev.workPerformed}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-5 pt-0 space-y-3">
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div>
                    <span className="block text-[11px] text-emerald-700 font-medium">
                      <CheckCircle2 className="h-3 w-3 inline mr-1" />
                      {dev.warrantyMonths} Months Store Warranty
                    </span>
                    <span className="text-xl font-bold text-slate-900">
                      {formatINR(dev.sellingPrice)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/refurbished/${dev.slug}`}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Inspection Report
                    </Link>
                    <button
                      onClick={() =>
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
                      className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      <span>Reserve</span>
                    </button>
                    <a
                      href={buildWhatsAppUrl(
                        `Hello Kiran's Infotech, I am interested in Certified Refurbished ${dev.title} (Unit ID: ${dev.deviceCode}, Price: ${formatINR(dev.sellingPrice)}).`,
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg bg-emerald-600 p-2 text-white hover:bg-emerald-500"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
