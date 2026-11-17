'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useApp } from '@/context/app-context';

const ENQUIRY_STATUSES = [
  'NEW',
  'IN_PROGRESS',
  'FOLLOWED_UP',
  'CONVERTED',
  'CLOSED',
];

export default function AdminEnquiriesPage() {
  const { notify } = useApp();
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [followUpSummary, setFollowUpSummary] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  const load = async () => {
    try {
      const res = await apiFetch(
        search.trim()
          ? `/admin/enquiries?search=${encodeURIComponent(search.trim())}`
          : '/admin/enquiries',
      );
      setEnquiries(res || []);
    } catch (err: any) {
      notify(err.message || 'Unable to load enquiries', 'error');
    }
  };

  useEffect(() => {
    load();
  }, [search]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await apiFetch(`/admin/enquiries/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      notify(`Enquiry status updated to ${status}`);
      await load();
    } catch (err: any) {
      notify(err.message || 'Update failed', 'error');
    }
  };

  const handleSaveNotes = async (id: string) => {
    try {
      await apiFetch(`/admin/enquiries/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          followUpSummary: followUpSummary || undefined,
          internalNotes: internalNotes || undefined,
          status: 'FOLLOWED_UP',
        }),
      });
      notify('Enquiry follow-up saved');
      setEditingId(null);
      await load();
    } catch (err: any) {
      notify(err.message || 'Could not save notes', 'error');
    }
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Customer Enquiries &amp; Lead Conversion
          </h1>
          <p className="text-slate-500">
            Search enquiries, record follow-ups, and maintain private internal notes.
          </p>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customer, subject, reference..."
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 w-64"
        />
      </div>

      <div className="space-y-4">
        {enquiries.map((enq) => (
          <div
            key={enq.id}
            className="rounded-xl border border-slate-200 bg-white p-5 space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-mono font-bold text-slate-900">
                  {enq.reference}
                </span>
                <span className="text-slate-500 ml-3">
                  {enq.customer?.name} ({enq.customer?.email} • {enq.contactPhone})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={enq.status}
                  onChange={(e) => handleStatusChange(enq.id, e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-semibold text-blue-700"
                >
                  {ENQUIRY_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    setEditingId(editingId === enq.id ? null : enq.id);
                    setFollowUpSummary(enq.followUpSummary || '');
                    setInternalNotes(enq.internalNotes || '');
                  }}
                  className="rounded border border-slate-200 px-3 py-1.5 font-semibold text-slate-700"
                >
                  Respond / Note
                </button>
              </div>
            </div>

            <h2 className="font-bold text-sm text-slate-900">{enq.subject}</h2>
            <p className="text-slate-600">{enq.message}</p>

            {enq.internalNotes && (
              <p className="rounded bg-amber-50 border border-amber-200 px-3 py-1.5 text-amber-900">
                <strong>Private Note:</strong> {enq.internalNotes}
              </p>
            )}

            {editingId === enq.id && (
              <div className="rounded-lg bg-slate-50 p-4 border border-slate-200 space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Customer-Visible Follow-Up Summary
                  </label>
                  <input
                    type="text"
                    value={followUpSummary}
                    onChange={(e) => setFollowUpSummary(e.target.value)}
                    placeholder="Shared quote or stock confirmation..."
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-amber-800 mb-1">
                    Private Internal Note
                  </label>
                  <input
                    type="text"
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="Internal sales note..."
                    className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleSaveNotes(enq.id)}
                  className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white"
                >
                  Save Follow-Up
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
