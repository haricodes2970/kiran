'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch, formatINR } from '@/lib/api';

export default function AdminReportsPage() {
  const [report, setReport] = useState<any | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      apiFetch('/admin/reports/summary'),
      apiFetch('/admin/audit-logs?limit=20'),
    ])
      .then(([rep, logs]) => {
        setReport(rep);
        setAuditLogs(logs?.data || []);
      })
      .catch(() => {});
  }, []);

  if (!report) {
    return (
      <div className="p-12 text-center text-xs text-slate-500">
        Loading operational and financial reports...
      </div>
    );
  }

  return (
    <div className="space-y-8 text-xs">
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          Financial, Inventory &amp; Operational Reports
        </h1>
        <p className="text-slate-500">
          Distinguishes collected revenue, known purchase cost basis, and verified gross margin from live database records.
        </p>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-1">
          <span className="text-slate-500 font-semibold">Gross Order Value</span>
          <p className="text-xl font-bold text-slate-900">
            {formatINR(report.salesReport.grossOrderValue)}
          </p>
          <span className="text-[11px] text-slate-400">
            {report.salesReport.activeOrdersCount} active orders
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-1">
          <span className="text-slate-500 font-semibold">
            Paid / Collected Revenue
          </span>
          <p className="text-xl font-bold text-emerald-700">
            {formatINR(report.salesReport.paidRevenue)}
          </p>
          <span className="text-[11px] text-slate-400">
            {report.salesReport.paidOrdersCount} paid orders
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-1">
          <span className="text-slate-500 font-semibold">
            Known Purchase Cost Basis
          </span>
          <p className="text-xl font-bold text-slate-800">
            {formatINR(report.salesReport.knownPurchaseCostBasis)}
          </p>
          <span className="text-[11px] text-slate-400">
            From order item cost snapshots
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-1">
          <span className="text-slate-500 font-semibold">
            Verified Gross Margin
          </span>
          <p className="text-xl font-bold text-blue-700">
            {report.salesReport.verifiedGrossMargin !== null
              ? formatINR(report.salesReport.verifiedGrossMargin)
              : 'Incomplete Cost Data'}
          </p>
          <span className="text-[11px] text-slate-400">
            Paid revenue minus cost basis
          </span>
        </div>
      </div>

      {/* Inventory Valuation */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
        <h2 className="text-sm font-bold text-slate-900">
          Inventory Valuation Summary
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <span className="text-slate-500 block">Total Units on Hand</span>
            <span className="text-lg font-bold text-slate-900">
              {report.inventoryReport.totalUnitsOnHand} units ({report.inventoryReport.totalSkus} SKUs)
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Acquisition Cost Valuation</span>
            <span className="text-lg font-bold text-slate-800">
              {formatINR(report.inventoryReport.inventoryCostValuation)}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Storefront Retail Valuation</span>
            <span className="text-lg font-bold text-blue-700">
              {formatINR(report.inventoryReport.inventoryRetailValuation)}
            </span>
          </div>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">
            Recent Administrative Audit Trail
          </h2>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
              <th className="p-3">Timestamp</th>
              <th className="p-3">Actor</th>
              <th className="p-3">Action</th>
              <th className="p-3">Entity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {auditLogs.map((log) => (
              <tr key={log.id}>
                <td className="p-3 text-slate-500">
                  {new Date(log.createdAt).toLocaleString('en-IN')}
                </td>
                <td className="p-3 font-medium text-slate-800">
                  {log.actor?.name || 'System'}
                </td>
                <td className="p-3 font-mono font-semibold text-blue-700">
                  {log.action}
                </td>
                <td className="p-3 text-slate-600">
                  {log.entityType} ({log.entityId || '—'})
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
