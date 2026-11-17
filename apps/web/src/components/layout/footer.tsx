'use client';

import React from 'react';
import Link from 'next/link';
import { Cpu, Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';
import { buildWhatsAppUrl } from '@/lib/api';

export function Footer() {
  const waUrl = buildWhatsAppUrl(
    "Hello Kiran's Infotech, I would like to enquire about computer hardware / repair services.",
  );

  return (
    <>
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Cpu className="h-5 w-5" />
                </div>
                <span className="text-lg font-bold text-white">Kiran&apos;s Infotech</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Enterprise &amp; retail computer hardware sales, 40-point certified refurbished laptops, second-hand laptop acquisition, and chip-level IT repair lab.
              </p>
              <div className="pt-1">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat on WhatsApp
                </a>
              </div>
            </div>

            {/* Hardware & Marketplace */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
                Storefront &amp; Products
              </h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link href="/products?categorySlug=laptops" className="hover:text-white">
                    New Business &amp; Creator Laptops
                  </Link>
                </li>
                <li>
                  <Link href="/refurbished" className="hover:text-white">
                    Certified Refurbished Laptops
                  </Link>
                </li>
                <li>
                  <Link href="/products?categorySlug=desktops" className="hover:text-white">
                    Desktops &amp; Custom Workstations
                  </Link>
                </li>
                <li>
                  <Link href="/products?categorySlug=storage" className="hover:text-white">
                    NVMe SSDs, SATA SSDs &amp; HDDs
                  </Link>
                </li>
                <li>
                  <Link href="/products?categorySlug=ram" className="hover:text-white">
                    DDR4 &amp; DDR5 Memory Modules
                  </Link>
                </li>
                <li>
                  <Link href="/products?categorySlug=monitors" className="hover:text-white">
                    IPS &amp; USB-C Monitors
                  </Link>
                </li>
              </ul>
            </div>

            {/* Services & Customer Area */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
                IT Services &amp; Account
              </h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link href="/services" className="hover:text-white">
                    Laptop Chip-Level Repair
                  </Link>
                </li>
                <li>
                  <Link href="/services#book-repair" className="hover:text-white">
                    Book a Repair Request
                  </Link>
                </li>
                <li>
                  <Link href="/sell-laptop" className="hover:text-white">
                    Sell Your Used Laptop
                  </Link>
                </li>
                <li>
                  <Link href="/account" className="hover:text-white">
                    Customer Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/account/repairs" className="hover:text-white">
                    Track Repair Status &amp; Quotations
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white">
                    Customer / Admin Sign In
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
                Showroom &amp; Service Desk
              </h3>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>
                    Shop 14 &amp; 15, Ground Floor, Sai Cyber Plaza, Kothrud, Pune 411038 (Configurable Demo Address)
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-blue-400 shrink-0" />
                  <span>+91 90000 00000 (Placeholder)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-blue-400 shrink-0" />
                  <span>contact@kiransinfotech.example.com</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Clock className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>Mon – Sat: 10:00 AM – 8:30 PM | Sun: 11:00 AM – 5:00 PM</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>
              © {new Date().getFullYear()} Kiran&apos;s Infotech. All rights reserved. Demo dataset labelled for client evaluation.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/contact" className="hover:text-slate-300">
                Warranty &amp; Support Policy
              </Link>
              <Link href="/admin" className="hover:text-slate-300">
                Administration
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
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-emerald-500 transition"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="hidden sm:inline">WhatsApp Enquiry</span>
      </a>
    </>
  );
}
