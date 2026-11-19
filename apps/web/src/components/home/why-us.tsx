import React from 'react';
import {
  ClipboardCheck,
  FileSpreadsheet,
  HeadphonesIcon,
  Laptop,
  Wrench,
} from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/ui/reveal';

const PROPOSITIONS = [
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
    <section className="py-16 sm:py-20 bg-[#DCEBFF]/55 dark:bg-[#0D1E3A] border-t border-line dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="05 // Why Kiran's Infotech"
          title="Built for Clarity and Practical Support"
          description="Straightforward hardware discovery, documented refurbished listings, and trackable service workflows."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {PROPOSITIONS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.code} delayMs={idx * 45}>
                <div className="glass-card h-full rounded-2xl p-5 flex flex-col justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-brand-600/20 text-brand-600 dark:text-electric">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="font-mono text-xs font-semibold text-slate-400">
                        {item.code}
                      </span>
                    </div>
                    <h3 className="font-display font-semibold text-base text-ink dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
