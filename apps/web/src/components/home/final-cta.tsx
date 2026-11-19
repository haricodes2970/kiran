import React from 'react';
import Link from 'next/link';
import { ArrowRight, MessageCircle, Wrench } from 'lucide-react';
import { buildWhatsAppUrl } from '@/lib/api';
import { Reveal } from '@/components/ui/reveal';

interface FinalCtaProps {
  whatsappNumber?: string;
}

export function FinalCta({ whatsappNumber }: FinalCtaProps) {
  const waUrl = buildWhatsAppUrl(
    "Hello Kiran's Infotech, I would like assistance with a hardware product or repair service.",
    whatsappNumber || undefined,
  );

  return (
    <section className="pt-16 sm:pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-[#0B1930] dark:bg-[#102342] border border-blue-400/20 text-white p-8 sm:p-12 lg:p-14 shadow-glass">
            <div
              className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-brand-600/35 blur-3xl pointer-events-none"
              aria-hidden="true"
            />
            <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="space-y-3 max-w-2xl">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-electric">
                  06 // Ready When You Are
                </p>
                <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                  Looking for Hardware, an Upgrade, or a Repair Quote?
                </h2>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  Browse available products, send a direct WhatsApp enquiry, contact our team, or book a service request online.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-ink hover:bg-amber-400 transition"
                >
                  <span>Explore Products</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <a
                  href={waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-500 transition"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>WhatsApp Enquiry</span>
                </a>

                <Link
                  href="/services#book-repair"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/20 transition"
                >
                  <Wrench className="h-4 w-4" />
                  <span>Book a Repair</span>
                </Link>

                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-white/10 transition"
                >
                  <span>Contact Us</span>
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
