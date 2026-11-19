import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ClipboardCheck,
  FileSpreadsheet,
  HeadphonesIcon,
  Laptop,
  Wrench,
} from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';

const CAPABILITIES = [
  {
    code: '01',
    title: 'Hardware Sales',
    description:
      'Laptops, desktops, monitors, RAM, SSD storage, printers, and accessories listed with clear specifications and INR pricing.',
    icon: Laptop,
  },
  {
    code: '02',
    title: 'Refurbished Device Inspection',
    description:
      'Refurbished laptops are checked for condition grade, battery health, and hardware status before being listed for sale.',
    icon: ClipboardCheck,
  },
  {
    code: '03',
    title: 'Repair & Upgrade Expertise',
    description:
      'Practical support for laptop and desktop repairs, RAM and SSD upgrades, diagnostics, printer servicing, and component replacement.',
    icon: Wrench,
  },
  {
    code: '04',
    title: 'Customer Assistance',
    description:
      'Direct guidance for selecting compatible parts, submitting order requests, and tracking repair progress online.',
    icon: HeadphonesIcon,
  },
  {
    code: '05',
    title: 'Transparent Quotations',
    description:
      'Clear booking references and itemized repair quotations shared for customer review before proceeding with work.',
    icon: FileSpreadsheet,
  },
];

export function WhyUs() {
  return (
    <section className="py-14 sm:py-18 bg-panel-2/60 border-t border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Editorial Thesis */}
          <div className="lg:col-span-5 space-y-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent font-semibold">
              Why Kiran&apos;s Infotech
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-fg tracking-tight leading-tight">
              Built for Clarity and Practical Support
            </h2>
            <p className="text-sm sm:text-base text-muted leading-relaxed">
              Straightforward hardware discovery, documented refurbished listings, and trackable service workflows without guesswork.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/services#book-repair"
                className="inline-flex items-center gap-2 rounded-control bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-brand-700 transition-colors"
              >
                <span>Book Repair or Upgrade</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-control border border-subtle bg-panel px-4 py-2.5 text-xs font-semibold text-fg hover:border-accent transition-colors"
              >
                <span>Contact Storefront</span>
              </Link>
            </div>
          </div>

          {/* Right 5-Row Hairline Capability Index */}
          <div className="lg:col-span-7 divide-y divide-subtle border-y border-subtle">
            {CAPABILITIES.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.code} delayMs={idx * 35}>
                  <div className="py-4 sm:py-5 flex items-start gap-4">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-control border border-subtle bg-panel text-accent">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-display font-semibold text-base text-fg">
                          {item.title}
                        </h3>
                        <span className="font-mono text-xs text-muted shrink-0">
                          {item.code}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-muted leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
