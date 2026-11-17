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
    return <div className="max-w-4xl mx-auto px-4 py-12">Loading service...</div>;
  }

  if (!service) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Service Not Found</h1>
        <Link href="/services" className="text-xs font-semibold text-blue-600">
          Back to All Services
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <Link
        href="/services"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back to All Services
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 space-y-6">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-md bg-blue-50 px-2.5 py-1 font-semibold text-blue-700">
            {service.category?.name}
          </span>
          <span className="text-slate-500 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> Turnaround: {service.estimatedTurnaround}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          {service.title}
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          {service.description}
        </p>

        <div className="rounded-xl bg-slate-50 p-5 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="block text-xs text-slate-500">
              {service.pricingType === 'FIXED' ? 'Fixed Service Fee' : 'Starting From'}
            </span>
            <span className="text-2xl font-bold text-slate-900">
              {service.basePrice ? formatINR(service.basePrice) : 'Diagnostic Quote'}
            </span>
            <span className="block text-xs text-emerald-700 mt-1">
              <ShieldCheck className="h-3.5 w-3.5 inline mr-1" />
              {service.warrantyNote || '90-Day Service Warranty'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/services?serviceId=${service.id}#book-repair`}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-700"
            >
              <Wrench className="h-4 w-4" /> Book This Service
            </Link>
            <a
              href={buildWhatsAppUrl(
                `Hello Kiran's Infotech, I want to book "${service.title}".`,
              )}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
