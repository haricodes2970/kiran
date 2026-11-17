'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Cpu,
  HardDrive,
  Laptop,
  MessageCircle,
  ShieldCheck,
  ShoppingCart,
  Star,
  Wrench,
} from 'lucide-react';
import { apiFetch, buildWhatsAppUrl, formatINR } from '@/lib/api';
import { useApp } from '@/context/app-context';

export default function HomePage() {
  const { addToCart } = useApp();
  const [categories, setCategories] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [latestProducts, setLatestProducts] = useState<any[]>([]);
  const [refurbished, setRefurbished] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [siteContent, setSiteContent] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHome() {
      try {
        setLoading(true);
        const [catsRes, featRes, latestRes, refurbRes, svcRes, contentRes] =
          await Promise.all([
            apiFetch('/categories'),
            apiFetch('/products?featured=true&limit=4'),
            apiFetch('/products?sortBy=newest&limit=8'),
            apiFetch('/refurbished?limit=4'),
            apiFetch('/services'),
            apiFetch('/site-content'),
          ]);
        setCategories(catsRes || []);
        setFeaturedProducts(featRes?.data || []);
        setLatestProducts(latestRes?.data || []);
        setRefurbished(refurbRes?.data || []);
        setServices((svcRes?.services || []).slice(0, 6));
        setSiteContent(contentRes || {});
      } catch (err: any) {
        setError(err.message || 'Unable to load storefront data');
      } finally {
        setLoading(false);
      }
    }
    loadHome();
  }, []);

  const hero = siteContent?.hero_banner || {
    badge: 'Authorized Hardware Sales • Certified Refurbished • Chip-Level Service Lab',
    headline:
      'Enterprise-Grade Computers, Certified Refurbished Laptops & Precision Hardware Repairs.',
    subheadline:
      'From brand-new business laptops and NVMe/RAM upgrades to 40-point inspected refurbished notebooks and transparent chip-level repairs — backed by Kiran’s Infotech warranty.',
  };

  const whyChooseUs = Array.isArray(siteContent?.why_choose_us)
    ? siteContent.why_choose_us
    : [
        {
          title: '40-Point Certified Refurbished Lab',
          description:
            'Every refurbished ThinkPad, Latitude, EliteBook, and MacBook undergoes thermal stress testing, SMART storage verification, and battery health grading.',
        },
        {
          title: 'Transparent Repair Quotations',
          description:
            'Track your repair live with a unique booking reference. We provide clear diagnosis and digital quotations before any chargeable work begins.',
        },
        {
          title: 'Genuine Components & Upgrade Advisory',
          description:
            'Authorized SSDs, RAM modules, monitors, and peripherals with verified laptop compatibility and same-day installation.',
        },
        {
          title: 'Direct Used-Laptop Buyback',
          description:
            'Upgrade your old laptop effortlessly—submit your device specs online for a fair technical evaluation and trade-in offer.',
        },
      ];

  const testimonials = Array.isArray(siteContent?.testimonials)
    ? siteContent.testimonials
    : [
        {
          name: 'Rahul Sharma (Sample Review)',
          role: 'Founder, Sharma Design Studio',
          quote:
            'Purchased 4 certified refurbished ThinkPads and upgraded our office workstations with 1TB NVMe SSDs. Zero downtime and transparent pricing.',
          rating: 5,
        },
        {
          name: 'Priya Patel (Sample Review)',
          role: 'Chartered Accountant',
          quote:
            'Brought in a dead Dell Latitude that another shop said needed a full board replacement. Kiran’s Infotech repaired the power rail in 48 hours.',
          rating: 5,
        },
        {
          name: 'Vikram Joshi (Sample Review)',
          role: 'Operations Manager',
          quote:
            'The live repair tracking reference and digital quotation approval made managing our office printer and laptop servicing effortless.',
          rating: 5,
        },
      ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-22">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3.5 py-1.5 text-xs font-semibold text-blue-300">
                <ShieldCheck className="h-4 w-4 text-blue-400" />
                <span>{hero.badge}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                {hero.headline}
              </h1>
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                {hero.subheadline}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition shadow-sm"
                >
                  <span>Browse Hardware Catalogue</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/refurbished"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-5 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-800 transition"
                >
                  <Laptop className="h-4 w-4 text-emerald-400" />
                  <span>Certified Refurbished Laptops</span>
                </Link>
                <Link
                  href="/services#book-repair"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/40 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition"
                >
                  <Wrench className="h-4 w-4 text-amber-400" />
                  <span>Book Repair / Upgrade</span>
                </Link>
              </div>
            </div>

            {/* Right Trust Highlights Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-6 space-y-5 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                      Kiran&apos;s Infotech Service Standard
                    </p>
                    <h2 className="text-lg font-bold text-white mt-0.5">
                      Complete Hardware Lifecycle Partner
                    </h2>
                  </div>
                  <Cpu className="h-8 w-8 text-blue-400" />
                </div>
                <div className="space-y-3.5 text-sm">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">New Commercial &amp; Retail Hardware</p>
                      <p className="text-slate-400 text-xs mt-0.5">
                        Dell, HP, Lenovo, ASUS laptops, custom desktops, Samsung/Crucial SSDs, Kingston RAM, and printers.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">Individually Inspected Refurbished Units</p>
                      <p className="text-slate-400 text-xs mt-0.5">
                        Serial-tracked ThinkPads, Latitudes, EliteBooks &amp; MacBooks with verified battery &amp; SMART reports.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">Chip-Level Repair &amp; Same-Day Upgrades</p>
                      <p className="text-slate-400 text-xs mt-0.5">
                        Motherboard repair, HDD-to-SSD cloning, RAM expansion, and LaserJet/InkTank servicing.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between text-xs text-slate-300">
                  <span>Have a second-hand laptop to sell?</span>
                  <Link
                    href="/sell-laptop"
                    className="font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    Get Buyback Evaluation <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="max-w-7xl mx-auto px-4">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        </div>
      )}

      {/* Product Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Department Directory
            </p>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              Shop by Hardware Category
            </h2>
          </div>
          <Link
            href="/products"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View All Products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-28 rounded-xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?categorySlug=${cat.slug}`}
                className="group rounded-xl border border-slate-200 bg-white p-4 hover:border-blue-600 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition text-sm">
                      {cat.name}
                    </h3>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                      {cat.productCount ?? 0} items
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                    {cat.description}
                  </p>
                </div>
                <span className="text-xs font-semibold text-blue-600 mt-3 inline-flex items-center gap-1">
                  Browse <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured New Hardware */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Featured Catalogue
            </p>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              Featured New Laptops, Components &amp; Displays
            </h2>
          </div>
          <Link
            href="/products"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Full Catalogue <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(featuredProducts.length > 0 ? featuredProducts : latestProducts.slice(0, 4)).map(
            (prod) => (
              <div
                key={prod.id}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  <div className="relative h-44 bg-slate-100 border-b border-slate-100">
                    {prod.images?.[0]?.url ? (
                      <img
                        src={prod.images[0].url}
                        alt={prod.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-400">
                        <HardDrive className="h-10 w-10" />
                      </div>
                    )}
                    <span
                      className={`absolute top-2.5 left-2.5 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                        prod.inStock
                          ? 'bg-emerald-600 text-white'
                          : 'bg-red-600 text-white'
                      }`}
                    >
                      {prod.inStock
                        ? `In Stock (${prod.availableQuantity})`
                        : 'Out of Stock'}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-blue-600">{prod.brand}</span>
                      <span>SKU: {prod.sku}</span>
                    </div>
                    <Link
                      href={`/products/${prod.slug}`}
                      className="block font-semibold text-slate-900 hover:text-blue-600 line-clamp-2 text-sm leading-snug"
                    >
                      {prod.name}
                    </Link>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {prod.shortSummary || prod.description}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0 space-y-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-slate-900">
                      {formatINR(prod.sellingPrice)}
                    </span>
                    {prod.mrpPrice && prod.mrpPrice > prod.sellingPrice && (
                      <span className="text-xs text-slate-400 line-through">
                        {formatINR(prod.mrpPrice)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/products/${prod.slug}`}
                      className="flex-1 text-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      View Specs
                    </Link>
                    <button
                      disabled={!prod.inStock}
                      onClick={() =>
                        addToCart({
                          id: prod.id,
                          type: 'PRODUCT',
                          name: prod.name,
                          sku: prod.sku,
                          slug: prod.slug,
                          price: prod.sellingPrice,
                          maxStock: prod.availableQuantity,
                          imageUrl: prod.images?.[0]?.url,
                        })
                      }
                      className="inline-flex items-center justify-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-40"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      </section>

      {/* Certified Refurbished Laptops Section */}
      <section className="bg-slate-900 text-white py-14 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-400/30">
                40-Point Hardware Inspection Verified
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold mt-2">
                Certified Refurbished Business Laptops
              </h2>
              <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                Individually tested corporate off-lease ThinkPads, Dell Latitudes, HP EliteBooks &amp; MacBooks with verified battery health, SMART SSD reports, and store warranty.
              </p>
            </div>
            <Link
              href="/refurbished"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 shrink-0"
            >
              <span>Explore All Refurbished Units</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {refurbished.map((dev) => (
              <div
                key={dev.id}
                className="rounded-xl border border-slate-800 bg-slate-800/70 p-4 flex flex-col justify-between space-y-4 hover:border-emerald-500/50 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="rounded bg-emerald-500/20 px-2 py-0.5 font-semibold text-emerald-300">
                      {dev.conditionGrade?.replace(/_/g, ' ')}
                    </span>
                    <span className="text-slate-400 font-mono">{dev.deviceCode}</span>
                  </div>
                  <Link
                    href={`/refurbished/${dev.slug}`}
                    className="block font-semibold text-white hover:text-emerald-400 text-sm line-clamp-2"
                  >
                    {dev.title}
                  </Link>
                  <div className="text-xs text-slate-300 space-y-1 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    <p>
                      <span className="text-slate-400">CPU:</span> {dev.processor}
                    </p>
                    <p>
                      <span className="text-slate-400">Memory/SSD:</span> {dev.ram} • {dev.storage}
                    </p>
                    {dev.batteryHealthPct && (
                      <p>
                        <span className="text-slate-400">Battery Health:</span>{' '}
                        <span className="text-emerald-400 font-semibold">
                          {dev.batteryHealthPct}% Verified
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-700/70 flex items-center justify-between">
                  <div>
                    <span className="block text-[11px] text-slate-400">
                      {dev.warrantyMonths}M Store Warranty
                    </span>
                    <span className="text-lg font-bold text-white">
                      {formatINR(dev.sellingPrice)}
                    </span>
                  </div>
                  <Link
                    href={`/refurbished/${dev.slug}`}
                    className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-100"
                  >
                    Inspection Report
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hardware Repair & Upgrade Services */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              In-House Technical Service Lab
            </p>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              Laptop, Desktop &amp; Printer Hardware Services
            </h2>
          </div>
          <Link
            href="/services"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            All Services &amp; Repair Booking <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((svc) => (
            <div
              key={svc.id}
              className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between hover:shadow-md transition"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                    <Wrench className="h-3.5 w-3.5" />
                    {svc.category?.name || 'Hardware Service'}
                  </span>
                  <span className="text-xs text-slate-500">
                    ⏱ {svc.estimatedTurnaround}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base">{svc.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {svc.shortSummary}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="block text-[11px] text-slate-400">
                    {svc.pricingType === 'FIXED' ? 'Fixed Service Fee' : 'Starts From'}
                  </span>
                  <span className="text-base font-bold text-slate-900">
                    {svc.basePrice ? formatINR(svc.basePrice) : 'Diagnostic Quote'}
                  </span>
                </div>
                <Link
                  href={`/services?serviceId=${svc.id}#book-repair`}
                  className="rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  Book Service
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Kiran's Infotech + Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="max-w-2xl mb-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Engineering &amp; Service Integrity
            </p>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              Why Customers Trust Kiran&apos;s Infotech
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseUs.map((item: any, idx: number) => (
              <div key={idx} className="space-y-2">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-bold text-sm">
                  0{idx + 1}
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Clearly Labelled Sample Testimonials */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                Sample Client Feedback (Demonstration Data)
              </p>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">
                What Local Businesses &amp; Professionals Say
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t: any, i: number) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200 bg-white p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[...Array(t.rating || 5)].map((_, s) => (
                      <Star key={s} className="h-4 w-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                    Sample Testimonial
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{t.name}</p>
                  <p className="text-[11px] text-slate-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact & WhatsApp Direct Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-blue-950 text-white p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h2 className="text-2xl font-bold">
              Need Custom Workstation Advice or Urgent Laptop Diagnosis?
            </h2>
            <p className="text-sm text-slate-300">
              Speak directly with our hardware engineers on WhatsApp or visit our showroom for same-day SSD/RAM upgrades and chip-level repair estimates.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href={buildWhatsAppUrl(
                "Hello Kiran's Infotech, I need assistance with hardware purchase / laptop repair.",
              )}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-500 transition"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Chat on WhatsApp</span>
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700 transition"
            >
              <span>Showroom Hours &amp; Map</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
