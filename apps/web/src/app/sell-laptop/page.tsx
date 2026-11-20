'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Laptop, Send } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useApp } from '@/context/app-context';

export default function SellLaptopPage() {
  const router = useRouter();
  const { user, notify } = useApp();

  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [processor, setProcessor] = useState('');
  const [ram, setRam] = useState('8GB DDR4');
  const [storage, setStorage] = useState('256GB SSD');
  const [ageMonths, setAgeMonths] = useState('24');
  const [conditionSummary, setConditionSummary] = useState('');
  const [knownIssues, setKnownIssues] = useState('');
  const [expectedPrice, setExpectedPrice] = useState('');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [submitting, setSubmitting] = useState(false);
  const [submittedRecord, setSubmittedRecord] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      notify('Please sign in to submit a used-laptop evaluation request', 'error');
      router.push('/login');
      return;
    }

    try {
      setSubmitting(true);
      const res = await apiFetch('/used-device-submissions', {
        method: 'POST',
        body: JSON.stringify({
          brand,
          model,
          processor,
          ram,
          storage,
          ageMonths: ageMonths ? Number(ageMonths) : undefined,
          conditionSummary,
          knownIssues: knownIssues || undefined,
          expectedPrice: expectedPrice ? Number(expectedPrice) : undefined,
          contactPhone: contactPhone || user.phone || '+919000000000',
        }),
      });
      setSubmittedRecord(res);
      notify(`Evaluation request ${res.reference} submitted!`);
    } catch (err: any) {
      notify(err.message || 'Submission failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
          Second-Hand Laptop Buyback &amp; Trade-In
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-fg">
          Sell Your Used Laptop to Kiran&apos;s Infotech
        </h1>
        <p className="text-sm text-muted leading-relaxed">
          Submit your laptop specifications and condition details below to receive a transparent buyback evaluation or trade-in offer.
        </p>
      </div>

      {submittedRecord ? (
        <div className="glass-card rounded-3xl border border-emerald-500/30 p-8 space-y-4">
          <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-8 w-8 shrink-0" />
            <div>
              <p className="font-mono text-xs font-bold uppercase">
                Used-Device Evaluation Logged
              </p>
              <h2 className="font-display text-xl font-bold text-fg">
                Reference: {submittedRecord.reference}
              </h2>
            </div>
          </div>
          <p className="text-xs text-muted">
            Our team will review your {submittedRecord.brand}{' '}
            {submittedRecord.model} details and share an evaluation offer in your Customer Dashboard.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/account"
              className="rounded-full bg-brand-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-brand-700 transition"
            >
              Go to Customer Dashboard
            </Link>
            <button
              type="button"
              onClick={() => setSubmittedRecord(null)}
              className="glass-pill rounded-full px-4 py-2 text-xs font-semibold text-fg"
            >
              Submit Another Device
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="glass-card rounded-3xl p-6 sm:p-8 space-y-4 text-xs"
        >
          <div className="flex items-center gap-2 border-b border-subtle pb-3">
            <Laptop className="h-5 w-5 text-accent" />
            <h2 className="font-display text-base font-bold text-fg">
              Device Specifications &amp; Condition Form
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-fg mb-1">
                Laptop Brand *
              </label>
              <input
                type="text"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Lenovo, Dell, HP, Apple"
                className="glass-input w-full rounded-xl px-3.5 py-2"
              />
            </div>

            <div>
              <label className="block font-semibold text-fg mb-1">
                Model Name *
              </label>
              <input
                type="text"
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. ThinkPad T480, Latitude 5410, MacBook Air M1"
                className="glass-input w-full rounded-xl px-3.5 py-2"
              />
            </div>

            <div>
              <label className="block font-semibold text-fg mb-1">
                Processor (CPU) *
              </label>
              <input
                type="text"
                required
                value={processor}
                onChange={(e) => setProcessor(e.target.value)}
                placeholder="e.g. Intel Core i5 10th Gen / Ryzen 5 5500U"
                className="glass-input w-full rounded-xl px-3.5 py-2"
              />
            </div>

            <div>
              <label className="block font-semibold text-fg mb-1">
                Installed RAM *
              </label>
              <input
                type="text"
                required
                value={ram}
                onChange={(e) => setRam(e.target.value)}
                placeholder="e.g. 8GB / 16GB DDR4"
                className="glass-input w-full rounded-xl px-3.5 py-2"
              />
            </div>

            <div>
              <label className="block font-semibold text-fg mb-1">
                Storage (SSD / HDD) *
              </label>
              <input
                type="text"
                required
                value={storage}
                onChange={(e) => setStorage(e.target.value)}
                placeholder="e.g. 256GB NVMe SSD / 512GB SSD"
                className="glass-input w-full rounded-xl px-3.5 py-2"
              />
            </div>

            <div>
              <label className="block font-semibold text-fg mb-1">
                Approximate Device Age (Months)
              </label>
              <input
                type="number"
                min={0}
                value={ageMonths}
                onChange={(e) => setAgeMonths(e.target.value)}
                className="glass-input w-full rounded-xl px-3.5 py-2"
              />
            </div>

            <div>
              <label className="block font-semibold text-fg mb-1">
                Expected Price in INR (Optional)
              </label>
              <input
                type="number"
                min={0}
                value={expectedPrice}
                onChange={(e) => setExpectedPrice(e.target.value)}
                placeholder="e.g. 16000"
                className="glass-input w-full rounded-xl px-3.5 py-2"
              />
            </div>

            <div>
              <label className="block font-semibold text-fg mb-1">
                Contact Phone *
              </label>
              <input
                type="text"
                required
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="glass-input w-full rounded-xl px-3.5 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-fg mb-1">
              Physical &amp; Battery Condition Summary *
            </label>
            <textarea
              rows={2}
              required
              value={conditionSummary}
              onChange={(e) => setConditionSummary(e.target.value)}
              placeholder="Mention charger availability, battery backup hours, and body condition..."
              className="glass-input w-full rounded-xl px-3.5 py-2"
            />
          </div>

          <div>
            <label className="block font-semibold text-fg mb-1">
              Any Known Hardware Issues (Optional)
            </label>
            <input
              type="text"
              value={knownIssues}
              onChange={(e) => setKnownIssues(e.target.value)}
              placeholder="e.g. None, or weak battery / scratch on lid"
              className="glass-input w-full rounded-xl px-3.5 py-2"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <span className="text-muted">
              {user
                ? `Submitting as ${user.name}`
                : 'Sign-in required to submit buyback request'}
            </span>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition"
            >
              <Send className="h-4 w-4" />
              <span>
                {submitting ? 'Submitting...' : 'Submit for Buyback Evaluation'}
              </span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
