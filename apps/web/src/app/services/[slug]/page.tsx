'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Clock, MessageCircle, ShieldCheck, Wrench } from 'lucide-react';
import { apiFetch, buildWhatsAppUrl, formatINR } from '@/lib/api';

export default function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [service, setService] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    apiFetch(`/services/${slug}`)
      .then((res) => setService(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="h-72 rounded-3xl bg-panel/60 animate-pulse" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="font-display text-2xl font-bold text-fg">Service Not Found</h1>
        <Link href="/services" className="text-xs font-semibold text-accent hover:underline">
          Back to All Services
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <Link
        href="/services"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-accent transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to All Services
      </Link>

      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-blue-50 dark:bg-brand-600/20 px-3 py-1 font-semibold text-brand-700 dark:text-electric">
            {service.category?.name}
          </span>
          {service.estimatedTurnaround && (
            <span className="text-muted flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> Turnaround: {service.estimatedTurnaround}
            </span>
          )}
        </div>

        <h1 className="font-display text-2xl sm:text-3xl font-bold text-fg">
          {service.title}
        </h1>
        <p className="text-sm text-muted leading-relaxed">
          {service.description}
        </p>

        <div className="rounded-2xl bg-panel-2/80 p-5 border border-subtle flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="block text-xs text-muted">
              {service.basePrice
                ? service.pricingType === 'FIXED'
                  ? 'Fixed Service Fee'
                  : 'Starting From'
                : 'Estimate'}
            </span>
            <span className="font-display text-2xl font-bold text-fg">
              {service.basePrice ? formatINR(service.basePrice) : 'Quote After Inspection'}
            </span>
            {service.warrantyNote && (
              <span className="block text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                <ShieldCheck className="h-3.5 w-3.5 inline mr-1" />
                {service.warrantyNote}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/services?serviceId=${service.id}#book-repair`}
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-brand-700 transition"
            >
              <Wrench className="h-4 w-4" /> Book This Service
            </Link>
            <a
              href={buildWhatsAppUrl(
                `Hello Kiran's Infotech, I want to book "${service.title}".`,
              )}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 transition"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
