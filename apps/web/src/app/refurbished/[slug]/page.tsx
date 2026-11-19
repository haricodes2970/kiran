'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';
import { apiFetch, buildWhatsAppUrl, formatINR } from '@/lib/api';
import { useApp } from '@/context/app-context';
import { AddToCartButton } from '@/components/ui/add-to-cart-button';

export default function RefurbishedDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useApp();
  const [device, setDevice] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await apiFetch(`/refurbished/${slug}`);
        setDevice(data);
      } catch (err: any) {
        setError(err.message || 'Refurbished unit not available');
      } finally {
        setLoading(false);
      }
    }
    if (slug) load();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="h-96 rounded-2xl bg-panel/60 animate-pulse" />
      </div>
    );
  }

  if (error || !device) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="font-display text-2xl font-bold text-fg">
          Refurbished Laptop Unavailable
        </h1>
        <p className="text-sm text-muted">
          {error || 'This unit may have already been sold.'}
        </p>
        <Link
          href="/refurbished"
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-xs font-semibold text-white"
        >
          <ArrowLeft className="h-4 w-4" /> View Available Refurbished Laptops
        </Link>
      </div>
    );
  }

  const inspection = device.inspections?.[0];
  const waUrl = buildWhatsAppUrl(
    `Hello Kiran's Infotech, I want to enquire about refurbished "${device.title}" (Code: ${device.deviceCode}, Serial: ${device.serialNumber}, Price: ${formatINR(device.sellingPrice)}).`,
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <Link
        href="/refurbished"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-accent transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Refurbished Marketplace
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-subtle bg-white overflow-hidden shadow-card">
            {device.imageUrls?.[0] && (
              <img
                src={device.imageUrls[0]}
                alt={device.title}
                className="w-full h-80 object-cover"
              />
            )}
          </div>

          <div className="glass-card rounded-2xl p-4 space-y-2 text-xs border border-emerald-500/25">
            <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-300">
              <ShieldCheck className="h-4 w-4" />
              <span>Warranty &amp; Unit Identification</span>
            </div>
            {(device.warrantyTerms || (typeof device.warrantyMonths === 'number' && device.warrantyMonths > 0)) && (
              <p className="text-fg">
                {device.warrantyTerms || `${device.warrantyMonths}-Month Store Hardware Warranty`}
              </p>
            )}
            <p className="text-[11px] text-muted">
              Serial Number: <span className="font-mono text-fg">{device.serialNumber}</span> • Unit Code:{' '}
              <span className="font-mono text-fg">{device.deviceCode}</span>
            </p>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-brand-600 px-3 py-1 font-mono text-[11px] font-semibold text-white">
                {device.conditionGrade?.replace(/_/g, ' ')}
              </span>
              <span className="glass-pill rounded-full px-3 py-1 font-mono text-muted">
                Unit: {device.deviceCode}
              </span>
              {device.batteryHealthPct && (
                <span className="rounded-full bg-blue-50 dark:bg-brand-600/20 px-3 py-1 font-semibold text-brand-700 dark:text-electric">
                  Battery Health: {device.batteryHealthPct}%{device.batteryCycles ? ` (${device.batteryCycles} cycles)` : ''}
                </span>
              )}
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-bold text-fg">
              {device.title}
            </h1>
            {device.cosmeticNotes && (
              <p className="text-xs text-muted">
                <strong className="text-fg">Physical Condition Notes:</strong>{' '}
                {device.cosmeticNotes}
              </p>
            )}
            {device.workPerformed && (
              <p className="text-xs text-muted">
                <strong className="text-fg">Refurbishment Work Logged:</strong>{' '}
                {device.workPerformed}
              </p>
            )}
          </div>

          <div className="glass-card rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="block text-xs text-muted">
                Refurbished Unit Price (Order Request Only)
              </span>
              <span className="font-display text-3xl font-bold text-fg">
                {formatINR(device.sellingPrice)}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <AddToCartButton
                label="Add to Cart"
                onAdd={() =>
                  addToCart({
                    id: device.id,
                    type: 'REFURBISHED',
                    name: device.title,
                    sku: device.deviceCode,
                    slug: device.slug,
                    price: device.sellingPrice,
                    maxStock: 1,
                    imageUrl: device.imageUrls?.[0],
                  })
                }
                className="px-6 py-2.5"
              />

              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 transition"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp Enquiry</span>
              </a>
            </div>
          </div>

          {/* Hardware Specs */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="bg-panel-2/80 px-5 py-3 border-b border-subtle">
              <h2 className="font-display text-sm font-bold text-fg">
                Unit Hardware Configuration
              </h2>
            </div>
            <dl className="divide-y divide-subtle text-xs">
              <div className="grid grid-cols-3 px-5 py-2.5">
                <dt className="font-semibold text-muted">Brand &amp; Model</dt>
                <dd className="col-span-2 text-fg font-medium">
                  {device.brand} {device.model}
                </dd>
              </div>
              <div className="grid grid-cols-3 px-5 py-2.5">
                <dt className="font-semibold text-muted">Processor</dt>
                <dd className="col-span-2 text-fg font-medium">
                  {device.processor}
                </dd>
              </div>
              <div className="grid grid-cols-3 px-5 py-2.5">
                <dt className="font-semibold text-muted">Memory (RAM)</dt>
                <dd className="col-span-2 text-fg font-medium">{device.ram}</dd>
              </div>
              <div className="grid grid-cols-3 px-5 py-2.5">
                <dt className="font-semibold text-muted">Storage</dt>
                <dd className="col-span-2 text-fg font-medium">
                  {device.storage}
                </dd>
              </div>
              <div className="grid grid-cols-3 px-5 py-2.5">
                <dt className="font-semibold text-muted">Display</dt>
                <dd className="col-span-2 text-fg font-medium">
                  {device.display}
                </dd>
              </div>
              <div className="grid grid-cols-3 px-5 py-2.5">
                <dt className="font-semibold text-muted">Operating System</dt>
                <dd className="col-span-2 text-fg font-medium">
                  {device.osInstalled}
                </dd>
              </div>
            </dl>
          </div>

          {/* Recorded Technician Inspection Report */}
          {inspection && (
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="bg-[#0B1930] text-white px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4 text-electric" />
                  <h2 className="font-display text-sm font-bold">
                    Technician Hardware Inspection Report
                  </h2>
                </div>
                <span className="text-[11px] text-electric font-semibold">
                  Inspector: {inspection.inspectorName}
                </span>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {[
                  ['Display & Hinges', inspection.screenCheck],
                  ['Keyboard & Trackpad', inspection.keyboardTrackpad],
                  ['Ports & Wireless', inspection.portsConnectivity],
                  ['Thermals & Cooling Fan', inspection.thermalsFan],
                  ['Battery Capacity Test', inspection.batteryHealthReport],
                  ['SSD / Storage SMART Health', inspection.storageSmartHealth],
                ].map(([label, val]) => (
                  <div key={String(label)} className="rounded-xl bg-panel-2/75 p-3 border border-subtle">
                    <span className="font-bold text-fg block mb-1">{label}</span>
                    <span className="text-muted">{val}</span>
                  </div>
                ))}
              </div>
              <div className="bg-emerald-500/10 px-5 py-3 border-t border-emerald-500/20 flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                <span>Verdict: {inspection.overallVerdict}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
