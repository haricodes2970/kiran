'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';
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

export function Footer() {
  const [info, setInfo] = useState<BusinessInfo | null>(null);

  useEffect(() => {
    let mounted = true;
    apiFetch('/site-content')
      .then((res) => {
        if (mounted && res?.business_info) {
          setInfo(res.business_info);
        }
      })
      .catch(() => {
        // Keep footer functional even if site-content fetch fails
      });
    return () => {
      mounted = false;
    };
  }, []);

  const waUrl = buildWhatsAppUrl(
    "Hello Kiran's Infotech, I would like to enquire about hardware or IT services.",
    info?.whatsappNumber || undefined,
  );

  return (
    <>
      <footer className="bg-white/75 dark:bg-[#071122] border-t border-line dark:border-slate-800 text-ink dark:text-slate-100 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="space-y-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2.5"
                aria-label="Kiran's Infotech Home"
              >
                <img
                  src="/brand/kirans-mark.png"
                  alt="Kiran's Infotech Mark"
                  width={512}
                  height={512}
                  className="h-8 w-8 object-contain"
                />
                <img
                  src="/brand/kirans-wordmark-dark.png"
                  alt={info?.businessName || "Kiran's Infotech"}
                  width={1059}
                  height={248}
                  className="dark:hidden h-6 w-auto object-contain"
                />
                <img
                  src="/brand/kirans-wordmark.png"
                  alt={info?.businessName || "Kiran's Infotech"}
                  width={1059}
                  height={248}
                  className="hidden dark:block h-6 w-auto object-contain"
                />
              </Link>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {info?.tagline ||
                  'Computer hardware, refurbished laptops, upgrades, and IT repair services — managed through transparent order requests and quotations.'}
              </p>
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp Enquiry</span>
              </a>
            </div>

            {/* Hardware */}
            <div>
              <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
                Hardware
              </h3>
              <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
                <li>
                  <Link href="/products?categorySlug=laptops" className="hover:text-brand-600 dark:hover:text-electric transition">
                    Laptops
                  </Link>
                </li>
                <li>
                  <Link href="/refurbished" className="hover:text-brand-600 dark:hover:text-electric transition">
                    Certified Refurbished
                  </Link>
                </li>
                <li>
                  <Link href="/products?categorySlug=desktops" className="hover:text-brand-600 dark:hover:text-electric transition">
                    Desktops
                  </Link>
                </li>
                <li>
                  <Link href="/products?categorySlug=monitors" className="hover:text-brand-600 dark:hover:text-electric transition">
                    Monitors
                  </Link>
                </li>
                <li>
                  <Link href="/products?categorySlug=storage" className="hover:text-brand-600 dark:hover:text-electric transition">
                    SSD &amp; Storage
                  </Link>
                </li>
                <li>
                  <Link href="/products?categorySlug=ram" className="hover:text-brand-600 dark:hover:text-electric transition">
                    Memory (RAM)
                  </Link>
                </li>
              </ul>
            </div>

            {/* Services & Account */}
            <div>
              <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
                Services &amp; Account
              </h3>
              <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
                <li>
                  <Link href="/services" className="hover:text-brand-600 dark:hover:text-electric transition">
                    Repair &amp; Upgrade Services
                  </Link>
                </li>
                <li>
                  <Link href="/services#book-repair" className="hover:text-brand-600 dark:hover:text-electric transition">
                    Book a Repair
                  </Link>
                </li>
                <li>
                  <Link href="/sell-laptop" className="hover:text-brand-600 dark:hover:text-electric transition">
                    Sell Old Laptop
                  </Link>
                </li>
                <li>
                  <Link href="/account" className="hover:text-brand-600 dark:hover:text-electric transition">
                    Customer Account
                  </Link>
                </li>
                <li>
                  <Link href="/account/repairs" className="hover:text-brand-600 dark:hover:text-electric transition">
                    Track Repair Status
                  </Link>
                </li>
                <li>
                  <Link href="/cart" className="hover:text-brand-600 dark:hover:text-electric transition">
                    Order Request Cart
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info (rendered strictly from stored business_info) */}
            <div>
              <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
                Business Contact
              </h3>
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                {info?.address && (
                  <li className="flex items-start gap-2.5">
                    <MapPin className="h-4 w-4 text-brand-600 dark:text-electric shrink-0 mt-0.5" />
                    <span>{info.address}</span>
                  </li>
                )}
                {info?.phone && (
                  <li className="flex items-center gap-2.5">
                    <Phone className="h-4 w-4 text-brand-600 dark:text-electric shrink-0" />
                    <span>{info.phone}</span>
                  </li>
                )}
                {info?.email && (
                  <li className="flex items-center gap-2.5">
                    <Mail className="h-4 w-4 text-brand-600 dark:text-electric shrink-0" />
                    <span>{info.email}</span>
                  </li>
                )}
                {info?.operatingHours && (
                  <li className="flex items-start gap-2.5">
                    <Clock className="h-4 w-4 text-brand-600 dark:text-electric shrink-0 mt-0.5" />
                    <span>{info.operatingHours}</span>
                  </li>
                )}
                {!info?.address && !info?.phone && !info?.email && !info?.operatingHours && (
                  <li className="text-xs text-slate-500 dark:text-slate-400">
                    Visit{' '}
                    <Link href="/contact" className="text-brand-600 dark:text-electric underline">
                      Contact &amp; Enquiry
                    </Link>{' '}
                    to reach our team.
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="border-t border-line dark:border-slate-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
            <p>
              © {new Date().getFullYear()} {info?.businessName || "Kiran's Infotech"}. All rights reserved.
            </p>
            <div className="flex items-center gap-5">
              <Link href="/about" className="hover:text-ink dark:hover:text-white transition">
                About
              </Link>
              <Link href="/contact" className="hover:text-ink dark:hover:text-white transition">
                Support &amp; Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Click-to-Chat CTA */}
      <a
        href={waUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with Kiran's Infotech on WhatsApp"
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-glass hover:bg-emerald-500 transition"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="hidden sm:inline">WhatsApp Enquiry</span>
      </a>
    </>
  );
}
