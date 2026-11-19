'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import { apiFetch, buildWhatsAppUrl } from '@/lib/api';

interface BusinessInfo {
  businessName?: string;
  tagline?: string;
  phone?: string;
  whatsappNumber?: string;
  email?: string;
  address?: string;
  operatingHours?: string;
}

function isPlaceholderValue(val?: string): boolean {
  if (!val) return true;
  const lower = val.toLowerCase();
  return (
    lower.includes('90000 00000') ||
    lower.includes('9000000000') ||
    lower.includes('example.com') ||
    lower.includes('placeholder') ||
    lower.includes('sample demo')
  );
}

export default function ContactPage() {
  const [info, setInfo] = useState<BusinessInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    apiFetch('/site-content')
      .then((res) => {
        if (mounted && res?.business_info) {
          setInfo(res.business_info);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const validAddress = info?.address && !isPlaceholderValue(info.address) ? info.address : null;
  const validPhone = info?.phone && !isPlaceholderValue(info.phone) ? info.phone : null;
  const validEmail = info?.email && !isPlaceholderValue(info.email) ? info.email : null;
  const validHours = info?.operatingHours?.trim() || null;

  const waUrl = buildWhatsAppUrl(
    "Hello Kiran's Infotech, I would like to connect with your sales and service team.",
    info?.whatsappNumber || undefined,
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <div className="max-w-3xl space-y-3">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
          About &amp; Store Contact
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-fg">
          {info?.businessName || "Kiran's Infotech"} — Hardware Sales, Refurbished Devices &amp; IT Services
        </h1>
        <p className="text-sm sm:text-base text-muted leading-relaxed">
          {info?.tagline ||
            "Kiran's Infotech supports retail and business customers with new computer hardware, inspected refurbished laptops, used-laptop buyback evaluations, and repair and upgrade services."}
        </p>
      </div>

      {/* CMS-Driven Contact Cards (no placeholder phone/email rendered) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-6 space-y-3">
          <MapPin className="h-6 w-6 text-accent" />
          <h2 className="font-display font-bold text-fg text-base">
            Store Location
          </h2>
          {loading ? (
            <div className="h-10 rounded-lg bg-panel-2 animate-pulse" />
          ) : validAddress ? (
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              {validAddress}
            </p>
          ) : (
            <p className="text-xs text-muted leading-relaxed">
              Store address will be published here once confirmed by the business owner.
            </p>
          )}
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-3">
          <Clock className="h-6 w-6 text-accent" />
          <h2 className="font-display font-bold text-fg text-base">
            Operating Hours
          </h2>
          {loading ? (
            <div className="h-10 rounded-lg bg-panel-2 animate-pulse" />
          ) : validHours ? (
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              {validHours}
            </p>
          ) : (
            <p className="text-xs text-muted leading-relaxed">
              Operating hours are not yet published. Message us on WhatsApp to confirm availability.
            </p>
          )}
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-3">
          <Phone className="h-6 w-6 text-accent" />
          <h2 className="font-display font-bold text-fg text-base">
            Direct Contact
          </h2>
          {loading ? (
            <div className="h-10 rounded-lg bg-panel-2 animate-pulse" />
          ) : (
            <div className="space-y-1.5 text-xs sm:text-sm text-muted">
              {validPhone && (
                <p className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-accent shrink-0" />
                  <span>{validPhone}</span>
                </p>
              )}
              {validEmail && (
                <p className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-accent shrink-0" />
                  <span>{validEmail}</span>
                </p>
              )}
              {!validPhone && !validEmail && (
                <p className="text-xs text-muted">
                  Direct phone and email details are pending client confirmation. Use WhatsApp enquiry or portal requests below.
                </p>
              )}
            </div>
          )}
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Service & Workflow Commitments (Strictly Verified Platform Capabilities) */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-accent">
            <ShieldCheck className="h-4 w-4" /> Transparent Process
          </div>
          <h2 className="font-display text-2xl font-bold text-fg">
            Clear Enquiries, Quotations &amp; Service Tracking
          </h2>
          <ul className="space-y-2.5 text-xs sm:text-sm text-muted">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>Track repair bookings online with a unique booking reference and transparent quotation review.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>Refurbished laptop listings include documented hardware specifications, condition grades, and listed store terms.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>Order Request workflow keeps hardware purchasing straightforward without unverified online payment prompts.</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap gap-3 md:justify-end">
          <Link
            href="/services#book-repair"
            className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-xs font-semibold text-white hover:bg-brand-700 transition"
          >
            <Wrench className="h-4 w-4" /> Book a Repair Request
          </Link>
          <Link
            href="/products"
            className="glass-pill inline-flex items-center gap-2 rounded-full px-5 py-3 text-xs font-semibold text-fg hover:border-accent transition"
          >
            Explore Hardware Catalogue
          </Link>
        </div>
      </div>
    </div>
  );
}
