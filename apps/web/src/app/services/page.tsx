'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  Clock,
  MessageCircle,
  Send,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import { apiFetch, buildWhatsAppUrl, formatINR } from '@/lib/api';
import { useApp } from '@/context/app-context';

function ServicesAndRepairContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, notify } = useApp();

  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  const [serviceId, setServiceId] = useState(searchParams.get('serviceId') || '');
  const [deviceType, setDeviceType] = useState('Laptop');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [issueCategory, setIssueCategory] = useState('Power / No Boot');
  const [issueDescription, setIssueDescription] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [submitting, setSubmitting] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<any | null>(null);

  useEffect(() => {
    const sid = searchParams.get('serviceId');
    if (sid) setServiceId(sid);
  }, [searchParams]);

  useEffect(() => {
    if (user?.phone) {
      setCustomerPhone((prev) => prev || user.phone || '');
    }
  }, [user]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await apiFetch(
          selectedCategory
            ? `/services?categorySlug=${selectedCategory}`
            : '/services',
        );
        setCategories(res?.categories || []);
        setServices(res?.services || []);
      } catch {
        setCategories([]);
        setServices([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedCategory]);

  const handleBookRepair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      notify('Please sign in to submit a repair booking and track status', 'error');
      router.push('/login');
      return;
    }

    try {
      setSubmitting(true);
      const booking = await apiFetch('/repair-bookings', {
        method: 'POST',
        body: JSON.stringify({
          serviceId: serviceId || undefined,
          deviceType,
          brand,
          model,
          serialNumber: serialNumber || undefined,
          issueCategory,
          issueDescription,
          preferredDate: preferredDate || undefined,
          customerPhone: customerPhone || user.phone || '+919000000000',
        }),
      });
      setCreatedBooking(booking);
      notify(`Repair booking created! Reference: ${booking.reference}`);
    } catch (err: any) {
      notify(err.message || 'Failed to submit repair booking', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Header & Quick Repair Navigation */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-subtle pb-6">
        <div>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
            IT Repair &amp; Upgrade Services
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-fg mt-1">
            Computer, Laptop &amp; Printer Services
          </h1>
          <p className="text-sm text-muted mt-1 max-w-2xl">
            Hardware diagnostics, laptop and desktop repairs, RAM and SSD upgrades, storage replacement, printer servicing, and component replacement.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <a
            href="#book-repair"
            data-testid="jump-to-book-repair"
            className="inline-flex items-center gap-2 rounded-control bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            <Wrench className="h-4 w-4" aria-hidden="true" />
            <span>Book a Repair Request</span>
          </a>
          <Link
            href="/account/repairs"
            className="inline-flex items-center gap-2 rounded-control border border-subtle bg-panel px-4 py-2.5 text-xs font-semibold text-fg hover:border-accent transition-colors"
          >
            <span>Track Existing Repair</span>
          </Link>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSelectedCategory('')}
          className={`rounded-control px-3.5 py-2 text-xs font-semibold transition-colors ${
            selectedCategory === ''
              ? 'bg-brand-600 text-white'
              : 'border border-subtle bg-panel text-fg hover:border-accent'
          }`}
        >
          All Hardware Services
        </button>
        {categories.map((cat) => (
          <button
            type="button"
            key={cat.id}
            onClick={() => setSelectedCategory(cat.slug)}
            className={`rounded-control px-3.5 py-2 text-xs font-semibold transition-colors ${
              selectedCategory === cat.slug
                ? 'bg-brand-600 text-white'
                : 'border border-subtle bg-panel text-fg hover:border-accent'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-56 rounded-card bg-panel animate-pulse border border-subtle" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((svc) => (
            <article
              key={svc.id}
              className="surface-card p-6 flex flex-col justify-between hover:border-accent hover:shadow-card transition-all duration-200"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs gap-2">
                  <span className="rounded-md bg-blue-50 dark:bg-brand-600/20 border border-blue-200/80 dark:border-electric/30 px-2.5 py-1 font-semibold text-brand-700 dark:text-electric">
                    {svc.category?.name}
                  </span>
                  {svc.estimatedTurnaround && (
                    <span className="text-muted flex items-center gap-1 font-mono text-[11px]">
                      <Clock className="h-3.5 w-3.5 text-accent" aria-hidden="true" /> {svc.estimatedTurnaround}
                    </span>
                  )}
                </div>

                <Link
                  href={`/services/${svc.slug}`}
                  className="block font-display text-base font-bold text-fg hover:text-accent transition-colors"
                >
                  {svc.title}
                </Link>
                <p className="text-xs text-muted leading-relaxed">
                  {svc.description}
                </p>
              </div>

              <div className="pt-4 mt-5 border-t border-subtle space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="block font-mono text-[10px] uppercase font-semibold text-muted">
                      {svc.basePrice
                        ? svc.pricingType === 'FIXED'
                          ? 'Fixed Service Charge'
                          : 'Indicative Starting Price'
                        : 'Estimate'}
                    </span>
                    <span className="font-display text-lg font-bold text-fg">
                      {svc.basePrice ? formatINR(svc.basePrice) : 'Quote After Inspection'}
                    </span>
                  </div>
                  {svc.warrantyNote && (
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                      <ShieldCheck className="h-3.5 w-3.5 inline mr-0.5" aria-hidden="true" />
                      {svc.warrantyNote}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="#book-repair"
                    onClick={() => setServiceId(svc.id)}
                    className="flex-1 text-center rounded-control bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-brand-700 transition-colors"
                  >
                    Select &amp; Book Repair
                  </a>
                  <a
                    href={buildWhatsAppUrl(
                      `Hello Kiran's Infotech, I need "${svc.title}" service.`,
                    )}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`WhatsApp enquiry for ${svc.title}`}
                    className="inline-flex items-center justify-center rounded-control bg-emerald-600 p-2 text-white hover:bg-emerald-500 transition-colors"
                    title="WhatsApp Service Enquiry"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Repair Booking Form Section */}
      <section
        id="book-repair"
        className="glass-stage rounded-card p-6 sm:p-10"
      >
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="space-y-1">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
              Online Service Intake &amp; Live Tracking
            </span>
            <h2 className="font-display text-2xl font-bold text-fg">
              Book a Hardware Repair or Upgrade Request
            </h2>
            <p className="text-xs text-muted">
              Receive a booking reference (<span className="font-mono">REP-YYYYMMDD-XXXX</span>) to track diagnostics, review quotations, and approve work from your Customer Dashboard.
            </p>
          </div>

          {createdBooking ? (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 space-y-4">
              <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-7 w-7 shrink-0" />
                <div>
                  <p className="text-xs font-bold uppercase">
                    Repair Booking Registered
                  </p>
                  <h3 className="font-display text-xl font-bold text-fg">
                    Booking Reference: {createdBooking.reference}
                  </h3>
                </div>
              </div>
              <p className="text-xs text-fg">
                Device: {createdBooking.brand} {createdBooking.model} ({createdBooking.deviceType}) — Issue: {createdBooking.issueCategory}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  href="/account/repairs"
                  className="rounded-full bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition"
                >
                  Track Repair Status in Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setCreatedBooking(null);
                    setIssueDescription('');
                  }}
                  className="glass-pill rounded-full px-4 py-2 text-xs font-semibold text-fg"
                >
                  Submit Another Request
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleBookRepair} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-fg mb-1">
                    Requested Service (Optional)
                  </label>
                  <select
                    value={serviceId}
                    onChange={(e) => setServiceId(e.target.value)}
                    className="glass-input w-full rounded-xl px-3.5 py-2"
                  >
                    <option value="">General Diagnostics / Let Technician Advise</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title} ({s.basePrice ? formatINR(s.basePrice) : 'Quote'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-fg mb-1">
                    Device Type *
                  </label>
                  <select
                    value={deviceType}
                    onChange={(e) => setDeviceType(e.target.value)}
                    className="glass-input w-full rounded-xl px-3.5 py-2"
                  >
                    <option value="Laptop">Laptop / Notebook</option>
                    <option value="Desktop">Desktop / Workstation PC</option>
                    <option value="Printer">LaserJet / InkTank Printer</option>
                    <option value="Monitor / Accessory">Monitor / Peripheral</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-fg mb-1">
                    Brand *
                  </label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Dell, HP, Lenovo, Apple, Epson"
                    className="glass-input w-full rounded-xl px-3.5 py-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-fg mb-1">
                    Model Name / Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. Latitude 5420, ThinkPad E14, LaserJet M126nw"
                    className="glass-input w-full rounded-xl px-3.5 py-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-fg mb-1">
                    Problem Category *
                  </label>
                  <select
                    value={issueCategory}
                    onChange={(e) => setIssueCategory(e.target.value)}
                    className="glass-input w-full rounded-xl px-3.5 py-2"
                  >
                    <option value="Power / No Boot">No Power / Charging Issue</option>
                    <option value="SSD & RAM Upgrade">SSD / RAM Performance Upgrade</option>
                    <option value="Screen & Hinge">Broken Screen / Flickering / Hinge Repair</option>
                    <option value="Overheating / Fan Noise">Overheating / Thermal Repaste / Fan Noise</option>
                    <option value="Keyboard / Battery">Keyboard / Trackpad / Battery Replacement</option>
                    <option value="Printer Paper Jam / Fuser">Printer Paper Jam / Fuser / Ink Issue</option>
                    <option value="OS / Data Recovery">OS Boot Error / Data Migration</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-fg mb-1">
                    Serial Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="Service Tag or Serial Number"
                    className="glass-input w-full rounded-xl px-3.5 py-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-fg mb-1">
                    Preferred Drop-off / Service Date
                  </label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="glass-input w-full rounded-xl px-3.5 py-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-fg mb-1">
                    Contact Mobile Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="glass-input w-full rounded-xl px-3.5 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-fg mb-1">
                  Detailed Problem Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="Describe symptoms or desired SSD/RAM upgrade..."
                  className="glass-input w-full rounded-xl px-3.5 py-2"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <span className="text-muted">
                  {user
                    ? `Booking linked to account: ${user.name} (${user.email})`
                    : 'Sign in required to submit & track repair request'}
                </span>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition"
                >
                  <Send className="h-4 w-4" />
                  <span>
                    {submitting ? 'Generating Reference...' : 'Submit Repair Booking'}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-muted">Loading services...</div>}>
      <ServicesAndRepairContent />
    </Suspense>
  );
}
