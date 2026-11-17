'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch, formatINR } from '@/lib/api';
import { useApp } from '@/context/app-context';

const REPAIR_STATUSES = [
  'SUBMITTED',
  'DIAGNOSING',
  'QUOTATION_SENT',
  'APPROVED',
  'IN_REPAIR',
  'QUALITY_TESTING',
  'READY_FOR_PICKUP',
  'COMPLETED',
  'CANCELLED',
];

export default function AdminRepairsPage() {
  const { notify } = useApp();
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  // Status update form
  const [nextStatus, setNextStatus] = useState('DIAGNOSING');
  const [publicMessage, setPublicMessage] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [diagnosticSummary, setDiagnosticSummary] = useState('');

  // Quotation form
  const [quoDiagnosis, setQuoDiagnosis] = useState('');
  const [partsCost, setPartsCost] = useState('900');
  const [labourCost, setLabourCost] = useState('800');

  const load = async () => {
    const res = await apiFetch('/admin/repair-bookings');
    setBookings(res || []);
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    try {
      await apiFetch(`/admin/repair-bookings/${selectedBooking.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: nextStatus,
          customerVisibleMessage: publicMessage,
          internalNote: internalNote || undefined,
          diagnosticSummary: diagnosticSummary || undefined,
        }),
      });
      notify(
        `Updated repair ${selectedBooking.reference} to ${nextStatus} (Customer dashboard updated)`,
      );
      setPublicMessage('');
      setInternalNote('');
      setSelectedBooking(null);
      await load();
    } catch (err: any) {
      notify(err.message || 'Status update failed', 'error');
    }
  };

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    try {
      await apiFetch(`/admin/repair-bookings/${selectedBooking.id}/quotations`, {
        method: 'POST',
        body: JSON.stringify({
          diagnosisDetails: quoDiagnosis,
          partsCost: Number(partsCost),
          labourCost: Number(labourCost),
        }),
      });
      notify(`Quotation issued for ${selectedBooking.reference}`);
      setQuoDiagnosis('');
      setSelectedBooking(null);
      await load();
    } catch (err: any) {
      notify(err.message || 'Quotation creation failed', 'error');
    }
  };

  return (
    <div className="space-y-6 text-xs">
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          Repair Bookings, Diagnostics &amp; Digital Quotations
        </h1>
        <p className="text-slate-500">
          Internal technician notes remain strictly private; customer-visible messages appear on the customer&apos;s repair timeline.
        </p>
      </div>

      {selectedBooking && (
        <div className="rounded-2xl border border-blue-200 bg-white p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="font-mono font-bold text-sm text-blue-700">
                Managing {selectedBooking.reference}
              </span>
              <p className="text-slate-600">
                {selectedBooking.customerName} ({selectedBooking.customerPhone}) —{' '}
                {selectedBooking.brand} {selectedBooking.model}
              </p>
            </div>
            <button
              onClick={() => setSelectedBooking(null)}
              className="rounded border border-slate-200 px-3 py-1 font-semibold"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status & Notes Form */}
            <form onSubmit={handleUpdateStatus} className="space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">
                Update Repair Status &amp; Notes
              </h3>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  New Status
                </label>
                <select
                  value={nextStatus}
                  onChange={(e) => setNextStatus(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2"
                >
                  {REPAIR_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Diagnostic Summary (Optional)
                </label>
                <input
                  type="text"
                  value={diagnosticSummary}
                  onChange={(e) => setDiagnosticSummary(e.target.value)}
                  placeholder="Summary of root cause..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold text-emerald-700 mb-1">
                  Customer-Visible Update Message *
                </label>
                <textarea
                  rows={2}
                  required
                  value={publicMessage}
                  onChange={(e) => setPublicMessage(e.target.value)}
                  placeholder="Shown on customer dashboard timeline..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold text-amber-700 mb-1">
                  Private Technician Internal Note (Hidden from Customer)
                </label>
                <input
                  type="text"
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="Part supplier, bench number, or internal cost..."
                  className="w-full rounded-lg border border-amber-200 bg-amber-50/40 px-3 py-2"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white"
              >
                Post Status Update
              </button>
            </form>

            {/* Issue Quotation Form */}
            <form onSubmit={handleCreateQuotation} className="space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">
                Prepare Digital Repair Quotation
              </h3>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Diagnosis &amp; Work Scope *
                </label>
                <textarea
                  rows={2}
                  required
                  value={quoDiagnosis}
                  onChange={(e) => setQuoDiagnosis(e.target.value)}
                  placeholder="e.g. Replace 19V power rail MOSFET & thermal repaste"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Parts Cost (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={partsCost}
                    onChange={(e) => setPartsCost(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Labour Cost (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={labourCost}
                    onChange={(e) => setLabourCost(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white"
              >
                Send Quotation to Customer
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Bookings List */}
      <div className="space-y-4">
        {bookings.map((b) => (
          <div
            key={b.id}
            className="rounded-xl border border-slate-200 bg-white p-5 space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-mono font-bold text-sm text-slate-900">
                  {b.reference}
                </span>
                <span className="text-slate-500 ml-3">
                  {b.customerName} ({b.customerPhone})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-blue-50 px-2.5 py-1 font-semibold text-blue-700">
                  {b.status}
                </span>
                <button
                  onClick={() => {
                    setSelectedBooking(b);
                    setNextStatus(b.status);
                    setDiagnosticSummary(b.diagnosticSummary || '');
                  }}
                  className="rounded-lg bg-slate-900 px-3 py-1.5 font-semibold text-white"
                >
                  Update / Quote
                </button>
              </div>
            </div>

            <p className="text-slate-800 font-medium">
              {b.deviceType}: {b.brand} {b.model} —{' '}
              <span className="text-slate-600">{b.issueDescription}</span>
            </p>

            {b.internalNotes && (
              <p className="rounded bg-amber-50 border border-amber-200 px-3 py-1.5 text-amber-900">
                <strong>Private Internal Note:</strong> {b.internalNotes}
              </p>
            )}

            {b.quotations?.length > 0 && (
              <div className="text-slate-600">
                <strong>Quotation:</strong> {b.quotations[0].quotationNumber} —{' '}
                {formatINR(b.quotations[0].totalAmount)} ({b.quotations[0].status})
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
