'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiFetch(
      search.trim()
        ? `/admin/customers?search=${encodeURIComponent(search.trim())}`
        : '/admin/customers',
    )
      .then((res) => setCustomers(res || []))
      .catch(() => {});
  }, [search]);

  return (
    <div className="space-y-6 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Registered Customers Directory
          </h1>
          <p className="text-slate-500">
            View customer contact details and linked order, enquiry, and repair counts.
          </p>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, phone..."
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 w-64"
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
              <th className="p-3">Customer</th>
              <th className="p-3">Email &amp; Phone</th>
              <th className="p-3">Company / GST</th>
              <th className="p-3">Orders</th>
              <th className="p-3">Repairs</th>
              <th className="p-3">Enquiries</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map((c) => (
              <tr key={c.id}>
                <td className="p-3 font-semibold text-slate-900">{c.name}</td>
                <td className="p-3 text-slate-600">
                  {c.email}
                  <br />
                  <span className="text-slate-400">{c.phone || '—'}</span>
                </td>
                <td className="p-3 text-slate-600">
                  {c.customerProfile?.companyName || 'Individual'}
                  {c.customerProfile?.gstNumber
                    ? ` (${c.customerProfile.gstNumber})`
                    : ''}
                </td>
                <td className="p-3 font-bold">{c.counts?.orders ?? 0}</td>
                <td className="p-3 font-bold">{c.counts?.repairBookings ?? 0}</td>
                <td className="p-3 font-bold">{c.counts?.enquiries ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
