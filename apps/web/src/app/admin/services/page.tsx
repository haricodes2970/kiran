'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch, formatINR } from '@/lib/api';
import { useApp } from '@/context/app-context';

export default function AdminServicesPage() {
  const { notify } = useApp();
  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [shortSummary, setShortSummary] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('799');
  const [estimatedTurnaround, setEstimatedTurnaround] = useState('24 Hours');

  const load = async () => {
    try {
      const res = await apiFetch('/admin/services');
      setCategories(res?.categories || []);
      setServices(res?.services || []);
      if (!categoryId && res?.categories?.length > 0) {
        setCategoryId(res.categories[0].id);
      }
    } catch (err: any) {
      notify(err.message || 'Unable to load services', 'error');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/admin/services', {
        method: 'POST',
        body: JSON.stringify({
          categoryId,
          title,
          shortSummary,
          description: description || shortSummary,
          basePrice: Number(basePrice),
          estimatedTurnaround,
        }),
      });
      notify('Service added');
      setTitle('');
      setShortSummary('');
      await load();
    } catch (err: any) {
      notify(err.message || 'Failed to add service', 'error');
    }
  };

  const handleToggleActive = async (svc: any) => {
    try {
      await apiFetch(`/admin/services/${svc.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ active: !svc.active }),
      });
      notify('Service updated');
      await load();
    } catch (err: any) {
      notify(err.message || 'Could not update service', 'error');
    }
  };

  return (
    <div className="space-y-6 text-xs">
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          Hardware Services Management
        </h1>
        <p className="text-slate-500">
          Configure repair, upgrade, and maintenance offerings shown on `/services`.
        </p>
      </div>

      <form
        onSubmit={handleCreate}
        className="rounded-xl border border-slate-200 bg-white p-5 space-y-3"
      >
        <h2 className="text-sm font-bold text-slate-900">Create New Service</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Service Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Laptop Battery Replacement"
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Base Price (INR)
            </label>
            <input
              type="number"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            required
            value={shortSummary}
            onChange={(e) => setShortSummary(e.target.value)}
            placeholder="Summary of service scope and warranty..."
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2"
          />
          <input
            type="text"
            value={estimatedTurnaround}
            onChange={(e) => setEstimatedTurnaround(e.target.value)}
            placeholder="Turnaround time"
            className="w-40 rounded-lg border border-slate-200 px-3 py-2"
          />
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white"
          >
            Add Service
          </button>
        </div>
      </form>

      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
              <th className="p-3">Service</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Turnaround</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {services.map((svc) => (
              <tr key={svc.id}>
                <td className="p-3 font-semibold text-slate-900">{svc.title}</td>
                <td className="p-3 text-slate-600">{svc.category?.name}</td>
                <td className="p-3 font-bold">
                  {svc.basePrice ? formatINR(svc.basePrice) : 'Quote'}
                </td>
                <td className="p-3 text-slate-500">{svc.estimatedTurnaround}</td>
                <td className="p-3">
                  <span
                    className={`rounded px-2 py-0.5 font-semibold ${
                      svc.active
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {svc.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => handleToggleActive(svc)}
                    className="rounded border border-slate-200 px-2.5 py-1 font-semibold text-slate-700"
                  >
                    {svc.active ? 'Disable' : 'Enable'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
