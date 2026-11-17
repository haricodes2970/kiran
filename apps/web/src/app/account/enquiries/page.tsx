'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function CustomerEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/me/enquiries')
      .then((res) => setEnquiries(res || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <Link
        href="/account"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Customer Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Product Enquiries</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Track enquiries submitted for products, refurbished laptops, or hardware services.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500">
          Loading enquiries...
        </div>
      ) : enquiries.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-3">
          <MessageSquare className="h-10 w-10 text-slate-400 mx-auto" />
          <p className="text-sm font-bold text-slate-900">No enquiries submitted yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {enquiries.map((enq) => (
            <div
              key={enq.id}
              className="rounded-xl border border-slate-200 bg-white p-5 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-900">
                  {enq.reference}
                </span>
                <span className="rounded-md bg-blue-50 px-2.5 py-1 font-semibold text-blue-700">
                  {enq.status}
                </span>
              </div>
              <h2 className="font-bold text-sm text-slate-900">{enq.subject}</h2>
              <p className="text-slate-600">{enq.message}</p>
              {enq.followUpSummary && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-emerald-900 mt-2">
                  <strong>Kiran&apos;s Infotech Response:</strong> {enq.followUpSummary}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
