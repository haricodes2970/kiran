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
  ShoppingCart,
} from 'lucide-react';
import { apiFetch, buildWhatsAppUrl, formatINR } from '@/lib/api';
import { useApp } from '@/context/app-context';

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
        <div className="h-96 rounded-2xl bg-slate-200 animate-pulse" />
      </div>
    );
  }

  if (error || !device) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">
          Refurbished Laptop Unavailable
        </h1>
        <p className="text-sm text-slate-500">
          {error || 'This unit may have already been sold.'}
        </p>
        <Link
          href="/refurbished"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
        >
          <ArrowLeft className="h-4 w-4" /> View Available Refurbished Laptops
        </Link>
      </div>
    );
  }

  const inspection = device.inspections?.[0];
  const waUrl = buildWhatsAppUrl(
    `Hello Kiran's Infotech, I want to enquire about Certified Refurbished "${device.title}" (Code: ${device.deviceCode}, Serial: ${device.serialNumber}, Price: ${formatINR(device.sellingPrice)}).`,
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <Link
        href="/refurbished"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Refurbished Marketplace
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            {device.imageUrls?.[0] && (
              <img
                src={device.imageUrls[0]}
                alt={device.title}
                className="w-full h-80 object-cover"
              />
            )}
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Warranty &amp; Certification Summary</span>
            </div>
            <p className="text-emerald-800">
              {device.warrantyTerms ||
                `${device.warrantyMonths}-Month Kiran's Infotech Carry-In Hardware Warranty`}
            </p>
            <p className="text-[11px] text-emerald-700">
              Serial Number: <span className="font-mono">{device.serialNumber}</span> • Unit Code:{' '}
              <span className="font-mono">{device.deviceCode}</span>
            </p>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-md bg-emerald-600 px-2.5 py-1 font-semibold text-white">
                {device.conditionGrade?.replace(/_/g, ' ')}
              </span>
              <span className="rounded-md bg-slate-100 px-2.5 py-1 font-mono text-slate-700">
                Unit: {device.deviceCode}
              </span>
              {device.batteryHealthPct && (
                <span className="rounded-md bg-blue-50 px-2.5 py-1 font-semibold text-blue-700">
                  Battery Health: {device.batteryHealthPct}% ({device.batteryCycles || 'Verified'} cycles)
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {device.title}
            </h1>
            {device.cosmeticNotes && (
              <p className="text-xs text-slate-600">
                <strong className="text-slate-800">Physical Condition Notes:</strong>{' '}
                {device.cosmeticNotes}
              </p>
            )}
            {device.workPerformed && (
              <p className="text-xs text-slate-600">
                <strong className="text-slate-800">Refurbishment Work Performed:</strong>{' '}
                {device.workPerformed}
              </p>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="block text-xs text-slate-500">
                Certified Refurbished Price (Single Serialized Unit)
              </span>
              <span className="text-3xl font-bold text-slate-900">
                {formatINR(device.sellingPrice)}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() =>
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
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-700"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Add Unit to Order Cart</span>
              </button>

              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp Enquiry</span>
              </a>
            </div>
          </div>

          {/* Hardware Specs */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
              <h2 className="text-sm font-bold text-slate-900">
                Unit Hardware Configuration
              </h2>
            </div>
            <dl className="divide-y divide-slate-100 text-xs">
              <div className="grid grid-cols-3 px-5 py-2.5">
                <dt className="font-semibold text-slate-600">Brand &amp; Model</dt>
                <dd className="col-span-2 text-slate-900 font-medium">
                  {device.brand} {device.model}
                </dd>
              </div>
              <div className="grid grid-cols-3 px-5 py-2.5">
                <dt className="font-semibold text-slate-600">Processor</dt>
                <dd className="col-span-2 text-slate-900 font-medium">
                  {device.processor}
                </dd>
              </div>
              <div className="grid grid-cols-3 px-5 py-2.5">
                <dt className="font-semibold text-slate-600">Memory (RAM)</dt>
                <dd className="col-span-2 text-slate-900 font-medium">{device.ram}</dd>
              </div>
              <div className="grid grid-cols-3 px-5 py-2.5">
                <dt className="font-semibold text-slate-600">Storage</dt>
                <dd className="col-span-2 text-slate-900 font-medium">
                  {device.storage}
                </dd>
              </div>
              <div className="grid grid-cols-3 px-5 py-2.5">
                <dt className="font-semibold text-slate-600">Display</dt>
                <dd className="col-span-2 text-slate-900 font-medium">
                  {device.display}
                </dd>
              </div>
              <div className="grid grid-cols-3 px-5 py-2.5">
                <dt className="font-semibold text-slate-600">Operating System</dt>
                <dd className="col-span-2 text-slate-900 font-medium">
                  {device.osInstalled}
                </dd>
              </div>
            </dl>
          </div>

          {/* 40-Point Inspection Report */}
          {inspection && (
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4 text-emerald-400" />
                  <h2 className="text-sm font-bold">
                    Technician Hardware Inspection Report
                  </h2>
                </div>
                <span className="text-[11px] text-emerald-300 font-semibold">
                  Inspector: {inspection.inspectorName}
                </span>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                  <span className="font-bold text-slate-800 block mb-1">
                    Display &amp; Hinges
                  </span>
                  <span className="text-slate-600">{inspection.screenCheck}</span>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                  <span className="font-bold text-slate-800 block mb-1">
                    Keyboard &amp; Trackpad
                  </span>
                  <span className="text-slate-600">{inspection.keyboardTrackpad}</span>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                  <span className="font-bold text-slate-800 block mb-1">
                    Ports &amp; Wireless
                  </span>
                  <span className="text-slate-600">{inspection.portsConnectivity}</span>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                  <span className="font-bold text-slate-800 block mb-1">
                    Thermals &amp; Cooling Fan
                  </span>
                  <span className="text-slate-600">{inspection.thermalsFan}</span>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                  <span className="font-bold text-slate-800 block mb-1">
                    Battery Capacity Test
                  </span>
                  <span className="text-slate-600">
                    {inspection.batteryHealthReport}
                  </span>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                  <span className="font-bold text-slate-800 block mb-1">
                    SSD / Storage SMART Health
                  </span>
                  <span className="text-slate-600">
                    {inspection.storageSmartHealth}
                  </span>
                </div>
              </div>
              <div className="bg-emerald-50 px-5 py-3 border-t border-emerald-100 flex items-center gap-2 text-xs font-semibold text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Verdict: {inspection.overallVerdict}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
