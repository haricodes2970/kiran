'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  Info,
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
  const missingAnyDirectDetails = !validAddress || !validPhone || !validEmail;

  const waUrl = buildWhatsAppUrl(
    "Hello Kiran's Infotech, I would like to connect with your sales and service team.",
    info?.whatsappNumber || undefined,
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="max-w-3xl space-y-3">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
          About &amp; Store Contact
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-fg">
          {info?.businessName || "Kiran's Infotech"}: Hardware Sales, Refurbished Devices &amp; IT Services
        </h1>
        <p className="text-sm sm:text-base text-muted leading-relaxed">
          {info?.tagline ||
            "Kiran's Infotech supports retail and business customers with new computer hardware, inspected refurbished laptops, used-laptop buyback evaluations, and repair and upgrade services."}
        </p>
      </div>

      {/* Consolidated CMS-Driven Store Contact Panel */}
      <div className="surface-card p-6 sm:p-8 space-y-6">
        {loading ? (
          <div className="h-28 rounded-control bg-panel-2 animate-pulse" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-display font-bold text-fg text-sm">
                <Clock className="h-4 w-4 text-accent" aria-hidden="true" />
                <span>Operating Hours</span>
              </div>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">
                {validHours || 'Operating hours are not yet published. Message us on WhatsApp to confirm availability.'}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 font-display font-bold text-fg text-sm">
                <MapPin className="h-4 w-4 text-accent" aria-hidden="true" />
                <span>Direct Channels</span>
              </div>
              <div className="space-y-1.5 text-xs sm:text-sm text-muted">
                {validAddress && (
                  <p className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 text-accent shrink-0 mt-1" aria-hidden="true" />
                    <span>{validAddress}</span>
                  </p>
                )}
                {validPhone && (
                  <p className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-accent shrink-0" aria-hidden="true" />
                    <span>{validPhone}</span>
                  </p>
                )}
                {validEmail && (
                  <p className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-accent shrink-0" aria-hidden="true" />
                    <span>{validEmail}</span>
                  </p>
                )}
                {!validAddress && !validPhone && !validEmail && (
                  <p className="text-xs text-muted">
                    No direct address, phone, or email is currently published in CMS settings.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <p className="font-display font-bold text-fg text-sm">
                  Instant Store Enquiry
                </p>
                <p className="text-xs text-muted">
                  Reach our hardware &amp; repair desk directly on WhatsApp.
                </p>
              </div>
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-fit items-center gap-2 rounded-control bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        )}

        {!loading && missingAnyDirectDetails && (
          <div
            data-testid="contact-cms-notice"
            className="rounded-control border border-subtle bg-panel-2 px-4 py-3 flex items-start gap-2.5 text-xs text-muted"
          >
            <Info className="h-4 w-4 text-accent shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              Additional store address, phone, and email details will appear here once published in the storefront CMS. Use WhatsApp enquiry or online repair and order forms in the meantime.
            </span>
          </div>
        )}
      </div>

      {/* Service & Workflow Commitments */}
      <div className="glass-stage rounded-card p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-accent">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Transparent Process
          </div>
          <h2 className="font-display text-2xl font-bold text-fg">
            Clear Enquiries, Quotations &amp; Service Tracking
          </h2>
          <ul className="space-y-2.5 text-xs sm:text-sm text-muted">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
              <span>Track repair bookings online with a unique booking reference and transparent quotation review.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
              <span>Refurbished laptop listings include documented hardware specifications, condition grades, and listed store terms.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
              <span>Order Request workflow keeps hardware purchasing straightforward without unverified online payment prompts.</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap gap-3 md:justify-end">
          <Link
            href="/services#book-repair"
            className="inline-flex items-center gap-2 rounded-control bg-brand-600 px-5 py-3 text-xs font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            <Wrench className="h-4 w-4" aria-hidden="true" /> Book a Repair Request
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-control border border-subtle bg-panel px-5 py-3 text-xs font-semibold text-fg hover:border-accent transition-colors"
          >
            Explore Hardware Catalogue
          </Link>
        </div>
      </div>
    </div>
  );
}
