'use client';

import React from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import { buildWhatsAppUrl } from '@/lib/api';

export default function ContactPage() {
  const waUrl = buildWhatsAppUrl(
    "Hello Kiran's Infotech, I would like to connect with your showroom / service desk.",
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <div className="max-w-3xl space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
          About &amp; Showroom Contact
        </p>
        <h1 className="text-3xl font-bold text-slate-900">
          Kiran&apos;s Infotech — Computer Sales, Certified Refurbished Laptops &amp; Hardware Lab
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Kiran&apos;s Infotech combines authorized new computer hardware retail, 40-point certified refurbished laptop resale, second-hand laptop buyback, and an in-house chip-level repair and upgrade workshop.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
          <MapPin className="h-6 w-6 text-blue-600" />
          <h2 className="font-bold text-slate-900 text-base">
            Showroom &amp; Service Center
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Shop 14 &amp; 15, Ground Floor, Sai Cyber Plaza, Kothrud, Pune, Maharashtra 411038 (Configurable Demo Address)
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
          <Clock className="h-6 w-6 text-blue-600" />
          <h2 className="font-bold text-slate-900 text-base">Operating Hours</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Monday – Saturday: 10:00 AM – 8:30 PM
            <br />
            Sunday: 11:00 AM – 5:00 PM
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
          <Phone className="h-6 w-6 text-blue-600" />
          <h2 className="font-bold text-slate-900 text-base">Direct Contact</h2>
          <p className="text-xs text-slate-600">
            Phone: +91 90000 00000 (Placeholder)
            <br />
            Email: contact@kiransinfotech.example.com
          </p>
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
          >
            <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
          </a>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600">
            <ShieldCheck className="h-4 w-4" /> Our Service Guarantee
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            Transparent Hardware Diagnostics &amp; Verified Components
          </h2>
          <ul className="space-y-2.5 text-xs text-slate-600">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Unique repair reference tracking with digital quotation approval before chargeable work.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>40-point inspection checklist on every certified refurbished laptop.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Same-day NVMe SSD &amp; DDR4/DDR5 RAM upgrades with lossless OS migration.</span>
            </li>
          </ul>
        </div>
        <div className="flex flex-wrap gap-3 md:justify-end">
          <Link
            href="/services#book-repair"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-xs font-semibold text-white hover:bg-blue-700"
          >
            <Wrench className="h-4 w-4" /> Book a Repair Request
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-5 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Explore Hardware Catalogue
          </Link>
        </div>
      </div>
    </div>
  );
}
