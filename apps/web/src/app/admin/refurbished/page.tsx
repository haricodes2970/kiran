'use client';

import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { apiFetch, formatINR } from '@/lib/api';
import { useApp } from '@/context/app-context';

const LIFECYCLE_STAGES = [
  'PURCHASED',
  'RECEIVED',
  'INSPECTION_PENDING',
  'UNDER_INSPECTION',
  'REFURBISHMENT',
  'QUALITY_CHECK',
  'READY_FOR_SALE',
  'PUBLISHED',
  'SOLD',
];

export default function AdminRefurbishedPage() {
  const { notify } = useApp();
  const [devices, setDevices] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);

  // Create form
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('Lenovo');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [processor, setProcessor] = useState('Intel Core i5 11th Gen');
  const [ram, setRam] = useState('16GB DDR4');
  const [storage, setStorage] = useState('512GB NVMe SSD');
  const [display, setDisplay] = useState('14" FHD IPS');
  const [batteryHealthPct, setBatteryHealthPct] = useState('90');
  const [acquisitionCost, setAcquisitionCost] = useState('20000');
  const [refurbishmentCost, setRefurbishmentCost] = useState('2000');
  const [sellingPrice, setSellingPrice] = useState('29500');
  const [status, setStatus] = useState('PUBLISHED');

  const load = async () => {
    try {
      const [devRes, subRes] = await Promise.all([
        apiFetch('/admin/refurbished-devices'),
        apiFetch('/admin/used-device-submissions'),
      ]);
      setDevices(devRes || []);
      setSubmissions(subRes || []);
    } catch (err: any) {
      notify(err.message || 'Unable to load refurbished devices', 'error');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/admin/refurbished-devices', {
        method: 'POST',
        body: JSON.stringify({
          title,
          brand,
          model,
          serialNumber,
          processor,
          ram,
          storage,
          display,
          batteryHealthPct: Number(batteryHealthPct),
          acquisitionCost: Number(acquisitionCost),
          refurbishmentCost: Number(refurbishmentCost),
          sellingPrice: Number(sellingPrice),
          status,
        }),
      });
      notify('Refurbished device registered');
      setShowCreate(false);
      setTitle('');
      setSerialNumber('');
      await load();
    } catch (err: any) {
      notify(err.message || 'Creation failed', 'error');
    }
  };

  const handleStageChange = async (id: string, nextStatus: string) => {
    try {
      await apiFetch(`/admin/refurbished-devices/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      notify(`Lifecycle updated to ${nextStatus}`);
      await load();
    } catch (err: any) {
      notify(err.message || 'Update failed', 'error');
    }
  };

  const handleSubmissionUpdate = async (
    id: string,
    nextStatus: string,
    offeredPrice?: number,
  ) => {
    try {
      await apiFetch(`/admin/used-device-submissions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus, offeredPrice }),
      });
      notify('Buyback submission updated');
      await load();
    } catch (err: any) {
      notify(err.message || 'Could not update submission', 'error');
    }
  };

  return (
    <div className="space-y-8 text-xs">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Refurbished Device Lifecycle &amp; Buyback Intake
          </h1>
          <p className="text-slate-500">
            Manage the 9-stage refurbishment pipeline and review customer used-laptop sell requests.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white"
        >
          <Plus className="h-4 w-4" />
          <span>{showCreate ? 'Close' : 'Add Refurbished Unit'}</span>
        </button>
      </div>

      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="rounded-xl border border-slate-200 bg-white p-5 space-y-4"
        >
          <h2 className="text-sm font-bold text-slate-900">
            Register Refurbished Laptop Unit
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Listing Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Lenovo ThinkPad T14 Gen 2 Certified Refurbished"
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Serial Number (Unique) *
              </label>
              <input
                type="text"
                required
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="PF3X9901"
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Brand *</label>
              <input
                type="text"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Model *</label>
              <input
                type="text"
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="ThinkPad T14 Gen 2"
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Processor *
              </label>
              <input
                type="text"
                required
                value={processor}
                onChange={(e) => setProcessor(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">RAM *</label>
              <input
                type="text"
                required
                value={ram}
                onChange={(e) => setRam(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Storage *
              </label>
              <input
                type="text"
                required
                value={storage}
                onChange={(e) => setStorage(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Battery Health %
              </label>
              <input
                type="number"
                value={batteryHealthPct}
                onChange={(e) => setBatteryHealthPct(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Acquisition Cost (INR — Private) *
              </label>
              <input
                type="number"
                required
                value={acquisitionCost}
                onChange={(e) => setAcquisitionCost(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Refurbishment Cost (INR)
              </label>
              <input
                type="number"
                value={refurbishmentCost}
                onChange={(e) => setRefurbishmentCost(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Selling Price (INR) *
              </label>
              <input
                type="number"
                required
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2"
            >
              {LIFECYCLE_STAGES.map((st) => (
                <option key={st} value={st}>
                  Stage: {st}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white"
            >
              Save Refurbished Unit
            </button>
          </div>
        </form>
      )}

      {/* Refurbished Units Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
              <th className="p-3">Code / Device</th>
              <th className="p-3">Specs &amp; Battery</th>
              <th className="p-3">Acq. + Refurb Cost</th>
              <th className="p-3">Selling Price</th>
              <th className="p-3">Lifecycle Stage (9-Stage)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {devices.map((dev) => (
              <tr key={dev.id}>
                <td className="p-3">
                  <span className="font-mono text-slate-500 block">
                    {dev.deviceCode} • SN: {dev.serialNumber}
                  </span>
                  <span className="font-semibold text-slate-900">{dev.title}</span>
                </td>
                <td className="p-3 text-slate-600">
                  {dev.ram} / {dev.storage} • Battery: {dev.batteryHealthPct ?? '—'}%
                </td>
                <td className="p-3 text-slate-500">
                  {formatINR(dev.acquisitionCost)} + {formatINR(dev.refurbishmentCost)}
                </td>
                <td className="p-3 font-bold text-slate-900">
                  {formatINR(dev.sellingPrice)}
                </td>
                <td className="p-3">
                  <select
                    value={dev.status}
                    onChange={(e) => handleStageChange(dev.id, e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-semibold text-blue-700"
                  >
                    {LIFECYCLE_STAGES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Customer Used-Laptop Sell Submissions */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900">
          Customer Used-Laptop Sell Submissions
        </h2>
        <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <th className="p-3">Reference / Customer</th>
                <th className="p-3">Device &amp; Specs</th>
                <th className="p-3">Expected / Offered</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {submissions.map((sub) => (
                <tr key={sub.id}>
                  <td className="p-3">
                    <span className="font-mono font-bold text-slate-900 block">
                      {sub.reference}
                    </span>
                    <span className="text-slate-500">
                      {sub.customer?.name} ({sub.contactPhone})
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="font-semibold text-slate-900 block">
                      {sub.brand} {sub.model} ({sub.processor})
                    </span>
                    <span className="text-slate-500">
                      {sub.ram} / {sub.storage} — {sub.conditionSummary}
                    </span>
                  </td>
                  <td className="p-3">
                    Exp: {sub.expectedPrice ? formatINR(sub.expectedPrice) : '—'} |
                    Offer: {sub.offeredPrice ? formatINR(sub.offeredPrice) : '—'}
                  </td>
                  <td className="p-3">
                    <select
                      value={sub.status}
                      onChange={(e) =>
                        handleSubmissionUpdate(sub.id, e.target.value)
                      }
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-semibold"
                    >
                      <option value="SUBMITTED">SUBMITTED</option>
                      <option value="UNDER_EVALUATION">UNDER_EVALUATION</option>
                      <option value="OFFER_MADE">OFFER_MADE</option>
                      <option value="ACCEPTED">ACCEPTED</option>
                      <option value="ACQUIRED">ACQUIRED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
