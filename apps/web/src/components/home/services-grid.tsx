import React from 'react';
import Link from 'next/link';
import { Clock, Wrench } from 'lucide-react';
import { formatINR } from '@/lib/api';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/ui/reveal';

export interface ServiceItem {
  id: string;
  title: string;
  shortSummary?: string | null;
  pricingType?: string | null;
  basePrice?: number | string | null;
  estimatedTurnaround?: string | null;
  category?: { name?: string | null } | null;
}

interface ServicesGridProps {
  services: ServiceItem[];
  loading: boolean;
  error: string | null;
}

export function ServicesGrid({ services, loading, error }: ServicesGridProps) {
  return (
    <section className="py-14 sm:py-18 bg-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Laptop, Desktop & Printer Services"
          description="Repairs, RAM and SSD upgrades, storage replacement, hardware diagnostics, printer servicing, and component replacement."
          actionHref="/services"
          actionLabel="View All Services"
        />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-52 rounded-card bg-panel animate-pulse border border-subtle" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-card border border-red-200 bg-red-50 dark:bg-red-950/60 dark:border-red-500/30 p-5 text-sm text-red-700 dark:text-red-200">
            Unable to load service catalogue right now.
          </div>
        ) : services.length === 0 ? (
          <div className="surface-card p-10 text-center space-y-3">
            <p className="text-sm font-medium text-fg">
              No hardware services are currently published.
            </p>
            <Link
              href="/services#book-repair"
              className="inline-flex items-center rounded-control bg-brand-600 px-5 py-2 text-xs font-semibold text-white hover:bg-brand-700 transition-colors"
            >
              Submit a Repair Request
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((svc, idx) => (
              <Reveal key={svc.id} delayMs={idx * 40}>
                <article className="surface-card group h-full p-5 sm:p-6 flex flex-col justify-between gap-5 hover:border-accent hover:shadow-card transition-all duration-200">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 dark:bg-brand-600/20 border border-blue-200/80 dark:border-electric/30 px-2.5 py-1 font-mono text-[11px] font-semibold text-brand-700 dark:text-electric">
                        <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{svc.category?.name || 'Service'}</span>
                      </span>
                      {svc.estimatedTurnaround && (
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] text-muted">
                          <Clock className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                          <span>{svc.estimatedTurnaround}</span>
                        </span>
                      )}
                    </div>

                    <h3 className="font-display font-semibold text-lg text-fg group-hover:text-accent transition-colors">
                      {svc.title}
                    </h3>

                    {svc.shortSummary && (
                      <p className="text-sm text-muted leading-relaxed">
                        {svc.shortSummary}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-subtle flex items-center justify-between gap-3">
                    <div>
                      <span className="block font-mono text-[10px] uppercase tracking-wider text-muted">
                        {svc.basePrice
                          ? svc.pricingType === 'FIXED'
                            ? 'Fixed Fee'
                            : 'Starts From'
                          : 'Estimate'}
                      </span>
                      <span className="font-display text-base font-bold text-fg">
                        {svc.basePrice ? formatINR(svc.basePrice) : 'Quote After Inspection'}
                      </span>
                    </div>

                    <Link
                      href={`/services?serviceId=${svc.id}#book-repair`}
                      className="rounded-control bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700 transition-colors shrink-0"
                    >
                      Book Service
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
