'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Laptop,
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
        <div className="h-96 rounded-card bg-panel animate-pulse border border-subtle" />
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
          className="inline-flex items-center gap-2 rounded-control bg-brand-600 px-5 py-2.5 text-xs font-semibold text-white"
        >
          <ArrowLeft className="h-4 w-4" /> View Available Refurbished Laptops
        </Link>
      </div>
    );
  }

  const inspection = device.inspections?.[0];
  const inspectionRows = inspection
    ? [
        ['Display & Hinges', inspection.screenCheck],
        ['Keyboard & Trackpad', inspection.keyboardTrackpad],
        ['Ports & Wireless', inspection.portsConnectivity],
        ['Thermals & Cooling Fan', inspection.thermalsFan],
        ['Battery Capacity Test', inspection.batteryHealthReport],
        ['SSD / Storage SMART Health', inspection.storageSmartHealth],
      ].filter(([, val]) => Boolean(val))
    : [];

  const waUrl = buildWhatsAppUrl(
    `Hello Kiran's Infotech, I want to enquire about refurbished "${device.title}" (Code: ${device.deviceCode}, Serial: ${device.serialNumber}, Price: ${formatINR(device.sellingPrice)}).`,
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Link
        href="/refurbished"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-accent transition-colors"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to Refurbished Marketplace
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-4">
          <div className="surface-card overflow-hidden bg-panel-2">
            {device.imageUrls?.[0] ? (
              <img
                src={device.imageUrls[0]}
                alt={device.title}
                className="w-full h-80 object-cover"
              />
            ) : (
              <div className="h-80 flex items-center justify-center text-muted">
                <Laptop className="h-12 w-12" aria-hidden="true" />
              </div>
            )}
          </div>

          <div className="surface-card p-4 space-y-2 text-xs border-emerald-500/30">
            <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-300">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              <span>Unit Identification{(device.warrantyTerms || (typeof device.warrantyMonths === 'number' && device.warrantyMonths > 0)) ? ' & Warranty' : ''}</span>
            </div>
            {(device.warrantyTerms || (typeof device.warrantyMonths === 'number' && device.warrantyMonths > 0)) && (
              <p className="text-fg">
                {device.warrantyTerms || `${device.warrantyMonths}-Month Store Hardware Warranty`}
              </p>
            )}
            <p className="text-[11px] text-muted">
              {device.serialNumber && (
                <>
                  Serial Number: <span className="font-mono text-fg">{device.serialNumber}</span> ·{' '}
                </>
              )}
              Unit Code: <span className="font-mono text-fg">{device.deviceCode}</span>
            </p>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-md bg-brand-600 px-2.5 py-1 font-mono text-[11px] font-semibold text-white">
                Refurbished{device.conditionGrade ? ` · ${device.conditionGrade.replace(/_/g, ' ')}` : ''}
              </span>
              <span className="rounded-md border border-subtle bg-panel px-2.5 py-1 font-mono text-muted">
                Unit: {device.deviceCode}
              </span>
              {typeof device.batteryHealthPct === 'number' && (
                <span className="rounded-md bg-blue-50 dark:bg-brand-600/20 border border-blue-200/80 dark:border-electric/30 px-2.5 py-1 font-semibold text-brand-700 dark:text-electric">
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

          <div className="glass-stage rounded-card p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="block font-mono text-[10px] uppercase tracking-wider text-muted">
                Refurbished Unit Price · Order Request Only
              </span>
              <span className="font-display text-3xl font-bold text-fg">
                {formatINR(device.sellingPrice)}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <AddToCartButton
                label="Add to Cart"
                showCartLink
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

              <Link
                href="/cart"
                className="inline-flex items-center gap-1.5 rounded-control border border-subtle bg-panel px-4 py-2.5 text-xs font-semibold text-fg hover:border-accent transition-colors"
              >
                <span>Order Cart</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>

              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-control bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                <span>WhatsApp Enquiry</span>
              </a>
            </div>
          </div>

          {/* Hardware Specs */}
          <div className="surface-card overflow-hidden">
            <div className="bg-panel-2 px-5 py-3 border-b border-subtle">
              <h2 className="font-display text-sm font-bold text-fg">
                Unit Hardware Configuration
              </h2>
            </div>
            <dl className="divide-y divide-subtle text-xs">
              {(device.brand || device.model) && (
                <div className="grid grid-cols-3 px-5 py-2.5">
                  <dt className="font-semibold text-muted">Brand &amp; Model</dt>
                  <dd className="col-span-2 text-fg font-medium">
                    {[device.brand, device.model].filter(Boolean).join(' ')}
                  </dd>
                </div>
              )}
              {device.processor && (
                <div className="grid grid-cols-3 px-5 py-2.5">
                  <dt className="font-semibold text-muted">Processor</dt>
                  <dd className="col-span-2 text-fg font-medium">{device.processor}</dd>
                </div>
              )}
              {device.ram && (
                <div className="grid grid-cols-3 px-5 py-2.5">
                  <dt className="font-semibold text-muted">Memory (RAM)</dt>
                  <dd className="col-span-2 text-fg font-medium">{device.ram}</dd>
                </div>
              )}
              {device.storage && (
                <div className="grid grid-cols-3 px-5 py-2.5">
                  <dt className="font-semibold text-muted">Storage</dt>
                  <dd className="col-span-2 text-fg font-medium">{device.storage}</dd>
                </div>
              )}
              {device.display && (
                <div className="grid grid-cols-3 px-5 py-2.5">
                  <dt className="font-semibold text-muted">Display</dt>
                  <dd className="col-span-2 text-fg font-medium">{device.display}</dd>
                </div>
              )}
              {device.osInstalled && (
                <div className="grid grid-cols-3 px-5 py-2.5">
                  <dt className="font-semibold text-muted">Operating System</dt>
                  <dd className="col-span-2 text-fg font-medium">{device.osInstalled}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Recorded Technician Inspection Report (only rendered when recorded) */}
          {inspection && inspectionRows.length > 0 && (
            <div className="surface-card overflow-hidden">
              <div className="bg-panel-2 border-b border-subtle px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4 text-accent" aria-hidden="true" />
                  <h2 className="font-display text-sm font-bold text-fg">
                    Technician Hardware Inspection Report
                  </h2>
                </div>
                {inspection.inspectorName && (
                  <span className="text-[11px] text-accent font-semibold">
                    Inspector: {inspection.inspectorName}
                  </span>
                )}
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                {inspectionRows.map(([label, val]) => (
                  <div key={String(label)} className="rounded-lg bg-panel-2 p-3 border border-subtle">
                    <span className="font-bold text-fg block mb-1">{label}</span>
                    <span className="text-muted">{val}</span>
                  </div>
                ))}
              </div>
              {inspection.overallVerdict && (
                <div className="bg-emerald-500/10 px-5 py-3 border-t border-emerald-500/20 flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>Verdict: {inspection.overallVerdict}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
