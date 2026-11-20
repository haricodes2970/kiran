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
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-accent transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Customer Dashboard
      </Link>

      <div>
        <h1 className="font-display text-2xl font-bold text-fg">My Product Enquiries</h1>
        <p className="text-xs text-muted mt-0.5">
          Track enquiries submitted for products, refurbished laptops, or hardware services.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-muted">
          Loading enquiries...
        </div>
      ) : enquiries.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center space-y-3">
          <MessageSquare className="h-10 w-10 text-muted mx-auto" />
          <p className="text-sm font-bold text-fg">No enquiries submitted yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {enquiries.map((enq) => (
            <div
              key={enq.id}
              className="glass-card rounded-2xl p-5 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-fg">
                  {enq.reference}
                </span>
                <span className="rounded-full bg-blue-500/15 px-3 py-1 font-semibold text-accent">
                  {enq.status}
                </span>
              </div>
              <h2 className="font-display font-bold text-sm text-fg">{enq.subject}</h2>
              <p className="text-muted">{enq.message}</p>
              {enq.followUpSummary && (
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 p-3 text-emerald-700 dark:text-emerald-300 mt-2">
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
