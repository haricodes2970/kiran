'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Wrench, XCircle } from 'lucide-react';
import { apiFetch, formatINR } from '@/lib/api';
import { useApp } from '@/context/app-context';

export default function CustomerRepairsPage() {
  const { notify } = useApp();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/me/repair-bookings');
      setBookings(res || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleQuotationResponse = async (
    bookingId: string,
    quotationId: string,
    decision: 'APPROVED' | 'REJECTED',
  ) => {
    try {
      await apiFetch(
        `/me/repair-bookings/${bookingId}/quotations/${quotationId}/respond`,
        {
          method: 'POST',
          body: JSON.stringify({
            decision,
            customerResponseNote: `Customer marked quotation as ${decision}`,
          }),
        },
      );
      notify(`Quotation ${decision.toLowerCase()}!`);
      await loadBookings();
    } catch (err: any) {
      notify(err.message || 'Could not update quotation response', 'error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/account"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-accent transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Customer Dashboard
        </Link>
        <Link
          href="/services#book-repair"
          className="rounded-full bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700 transition"
        >
          + New Repair Request
        </Link>
      </div>

      <div>
        <h1 className="font-display text-2xl font-bold text-fg">
          My Hardware Repair Bookings &amp; Status Tracker
        </h1>
        <p className="text-xs text-muted mt-0.5">
          View live technician updates and approve digital repair quotations before chargeable work proceeds.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-muted">
          Loading repair bookings...
        </div>
      ) : bookings.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center space-y-3">
          <Wrench className="h-10 w-10 text-muted mx-auto" />
          <p className="text-sm font-bold text-fg">
            No repair bookings submitted yet
          </p>
          <Link
            href="/services#book-repair"
            className="inline-block rounded-full bg-brand-600 px-5 py-2 text-xs font-semibold text-white"
          >
            Book a Hardware Repair
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="glass-card rounded-3xl p-6 space-y-5 text-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-subtle pb-4">
                <div>
                  <span className="font-mono text-sm font-bold text-fg">
                    {b.reference}
                  </span>
                  <span className="text-muted ml-3">
                    {b.deviceType}: {b.brand} {b.model}
                  </span>
                </div>
                <span className="rounded-full bg-brand-600 px-3 py-1 font-semibold text-white">
                  Status: {b.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="font-semibold text-fg">
                    Reported Issue ({b.issueCategory}):
                  </p>
                  <p className="text-muted">{b.issueDescription}</p>
                </div>
                {b.diagnosticSummary && (
                  <div className="rounded-xl bg-blue-500/10 border border-blue-500/25 p-3 space-y-1">
                    <p className="font-bold text-accent">
                      Technician Diagnostic Summary:
                    </p>
                    <p className="text-fg">{b.diagnosticSummary}</p>
                  </div>
                )}
              </div>

              {b.quotations?.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-display font-bold text-fg">
                    Digital Repair Quotations
                  </h3>
                  {b.quotations.map((q: any) => (
                    <div
                      key={q.id}
                      className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono font-bold text-amber-700 dark:text-amber-300">
                          {q.quotationNumber} — {q.diagnosisDetails}
                        </span>
                        <span className="rounded-full bg-amber-500/25 px-2.5 py-0.5 font-bold text-amber-800 dark:text-amber-200">
                          {q.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-6 text-muted">
                        <span>Parts: {formatINR(q.partsCost)}</span>
                        <span>Labour: {formatINR(q.labourCost)}</span>
                        <span>GST: {formatINR(q.taxAmount)}</span>
                        <span className="font-bold text-fg">
                          Total Estimate: {formatINR(q.totalAmount)}
                        </span>
                      </div>

                      {q.status === 'PENDING_APPROVAL' && (
                        <div className="flex items-center gap-3 pt-1">
                          <button
                            type="button"
                            onClick={() =>
                              handleQuotationResponse(b.id, q.id, 'APPROVED')
                            }
                            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-500 transition"
                          >
                            <CheckCircle2 className="h-4 w-4" /> Approve Quotation
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleQuotationResponse(b.id, q.id, 'REJECTED')
                            }
                            className="inline-flex items-center gap-1.5 rounded-full border border-red-400/50 bg-red-500/10 px-4 py-2 font-semibold text-red-600 dark:text-red-300 hover:bg-red-500/20 transition"
                          >
                            <XCircle className="h-4 w-4" /> Decline
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {b.updates?.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-subtle">
                  <h3 className="font-display font-bold text-fg">
                    Repair Progress Timeline
                  </h3>
                  <ol className="space-y-2 border-l-2 border-brand-600/40 pl-4 ml-1">
                    {b.updates.map((u: any) => (
                      <li key={u.id} className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-accent">
                            {u.status}
                          </span>
                          <span className="text-[11px] text-muted">
                            {new Date(u.createdAt).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <p className="text-fg">{u.customerVisibleMessage}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
