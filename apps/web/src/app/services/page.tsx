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

  // Repair booking form state
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Kiran&apos;s Infotech Hardware Lab
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Computer, Laptop &amp; Printer Repair &amp; Upgrade Services
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            From chip-level motherboard diagnostics and broken hinge repairs to same-day NVMe SSD cloning, DDR4/DDR5 RAM upgrades, and LaserJet/InkTank servicing.
          </p>
        </div>

        <a
          href="#book-repair"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 shrink-0"
        >
          <Wrench className="h-4 w-4" />
          <span>Book a Repair Request</span>
        </a>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedCategory('')}
          className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
            selectedCategory === ''
              ? 'bg-slate-900 text-white'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          All Hardware Services
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.slug)}
            className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
              selectedCategory === cat.slug
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-56 rounded-xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((svc) => (
            <div
              key={svc.id}
              className="rounded-xl border border-slate-200 bg-white p-6 flex flex-col justify-between hover:shadow-md transition"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="rounded-md bg-blue-50 px-2.5 py-1 font-semibold text-blue-700">
                    {svc.category?.name}
                  </span>
                  <span className="text-slate-500 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {svc.estimatedTurnaround}
                  </span>
                </div>

                <Link
                  href={`/services/${svc.slug}`}
                  className="block text-base font-bold text-slate-900 hover:text-blue-600"
                >
                  {svc.title}
                </Link>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {svc.description}
                </p>
              </div>

              <div className="pt-4 mt-5 border-t border-slate-100 space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="block text-[10px] uppercase font-semibold text-slate-400">
                      {svc.pricingType === 'FIXED'
                        ? 'Fixed Service Charge'
                        : 'Indicative Starting Price'}
                    </span>
                    <span className="text-lg font-bold text-slate-900">
                      {svc.basePrice ? formatINR(svc.basePrice) : 'Diagnostic Quote'}
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-medium">
                    <ShieldCheck className="h-3.5 w-3.5 inline mr-0.5" />
                    90-Day Service Warranty
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="#book-repair"
                    onClick={() => setServiceId(svc.id)}
                    className="flex-1 text-center rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                  >
                    Select &amp; Book Repair
                  </a>
                  <a
                    href={buildWhatsAppUrl(
                      `Hello Kiran's Infotech, I need "${svc.title}" service (${svc.estimatedTurnaround}).`,
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-lg bg-emerald-600 p-2 text-white hover:bg-emerald-500"
                    title="WhatsApp Service Enquiry"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Repair Booking Form Section */}
      <section
        id="book-repair"
        className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm"
      >
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Online Service Intake &amp; Live Tracking
            </span>
            <h2 className="text-2xl font-bold text-slate-900">
              Book a Hardware Repair or Upgrade Request
            </h2>
            <p className="text-xs text-slate-500">
              Receive an instant booking reference (`REP-YYYYMMDD-XXXX`) to track diagnostics, review digital quotations, and approve repair work from your Customer Dashboard.
            </p>
          </div>

          {createdBooking ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 space-y-4">
              <div className="flex items-center gap-3 text-emerald-800">
                <CheckCircle2 className="h-7 w-7 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold uppercase">
                    Repair Booking Registered
                  </p>
                  <h3 className="text-xl font-bold">
                    Booking Reference: {createdBooking.reference}
                  </h3>
                </div>
              </div>
              <p className="text-xs text-emerald-900">
                Device: {createdBooking.brand} {createdBooking.model} ({createdBooking.deviceType}) — Issue: {createdBooking.issueCategory}
              </p>
              <div className="flex items-center gap-3 pt-1">
                <Link
                  href="/account/repairs"
                  className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
                >
                  Track Repair Status in Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setCreatedBooking(null);
                    setIssueDescription('');
                  }}
                  className="rounded-lg border border-emerald-300 bg-white px-4 py-2 text-xs font-semibold text-emerald-800"
                >
                  Submit Another Request
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleBookRepair} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Requested Service (Optional)
                  </label>
                  <select
                    value={serviceId}
                    onChange={(e) => setServiceId(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2"
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
                  <label className="block font-semibold text-slate-700 mb-1">
                    Device Type *
                  </label>
                  <select
                    value={deviceType}
                    onChange={(e) => setDeviceType(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2"
                  >
                    <option value="Laptop">Laptop / Notebook</option>
                    <option value="Desktop">Desktop / Workstation PC</option>
                    <option value="Printer">LaserJet / InkTank Printer</option>
                    <option value="Monitor / Accessory">Monitor / Peripheral</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Brand *
                  </label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Dell, HP, Lenovo, Apple, Epson"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Model Name / Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. Latitude 5420, ThinkPad E14, LaserJet M126nw"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Problem Category *
                  </label>
                  <select
                    value={issueCategory}
                    onChange={(e) => setIssueCategory(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2"
                  >
                    <option value="Power / No Boot">No Power / Dead Motherboard / Charging Issue</option>
                    <option value="SSD & RAM Upgrade">SSD / RAM Performance Upgrade</option>
                    <option value="Screen & Hinge">Broken Screen / Flickering / Hinge Repair</option>
                    <option value="Overheating / Fan Noise">Overheating / Thermal Repaste / Fan Noise</option>
                    <option value="Keyboard / Battery">Keyboard / Trackpad / Battery Replacement</option>
                    <option value="Printer Paper Jam / Fuser">Printer Paper Jam / Fuser / Ink Issue</option>
                    <option value="OS / Data Recovery">OS Boot Error / Data Migration</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Serial Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="Service Tag or Serial Number"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Preferred Drop-off / Service Date
                  </label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Contact Mobile Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Detailed Problem Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="Describe symptoms (e.g., LED blink pattern, error message, liquid spill, or desired SSD/RAM capacity)..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-500">
                  {user
                    ? `Booking linked to account: ${user.name} (${user.email})`
                    : 'Sign in required to submit & track repair request'}
                </span>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
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
    <Suspense fallback={<div className="p-12 text-center text-sm">Loading services...</div>}>
      <ServicesAndRepairContent />
    </Suspense>
  );
}
