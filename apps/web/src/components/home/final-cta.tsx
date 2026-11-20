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
    <section className="pt-14 sm:pt-18">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="glass-stage rounded-card p-8 sm:p-10 lg:p-12">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="space-y-2.5 max-w-2xl">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                  Ready When You Are
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-fg">
                  Looking for Hardware, an Upgrade, or a Repair Quote?
                </h2>
                <p className="text-sm sm:text-base text-muted leading-relaxed">
                  Browse available products, send a direct WhatsApp enquiry, contact our team, or book a service request online.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 rounded-control bg-amber-500 px-5 py-3 text-sm font-semibold text-[#0B1930] hover:bg-amber-400 transition-colors"
                >
                  <span>Explore Products</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>

                <a
                  href={waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-control bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  <span>WhatsApp Enquiry</span>
                </a>

                <Link
                  href="/services#book-repair"
                  className="inline-flex items-center gap-2 rounded-control border border-subtle bg-panel hover:border-accent px-5 py-3 text-sm font-semibold text-fg transition-colors"
                >
                  <Wrench className="h-4 w-4 text-accent" aria-hidden="true" />
                  <span>Book a Repair</span>
                </Link>

                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-control border border-subtle bg-panel hover:border-accent px-5 py-3 text-sm font-semibold text-fg transition-colors"
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
