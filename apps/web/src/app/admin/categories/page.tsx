'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useApp } from '@/context/app-context';

export default function AdminCategoriesPage() {
  const { notify } = useApp();
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const load = async () => {
    try {
      const res = await apiFetch('/admin/categories');
      setCategories(res || []);
    } catch (err: any) {
      notify(err.message || 'Unable to load categories', 'error');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/admin/categories', {
        method: 'POST',
        body: JSON.stringify({ name, description }),
      });
      setName('');
      setDescription('');
      notify('Category created');
      await load();
    } catch (err: any) {
      notify(err.message || 'Could not create category', 'error');
    }
  };

  const handleToggleActive = async (cat: any) => {
    try {
      await apiFetch(`/admin/categories/${cat.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ active: !cat.active }),
      });
      notify(`Category ${cat.name} updated`);
      await load();
    } catch (err: any) {
      notify(err.message || 'Update failed', 'error');
    }
  };

  return (
    <div className="space-y-6 text-xs">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Category Management</h1>
        <p className="text-slate-500">
          Add, edit, or deactivate hardware product categories.
        </p>
      </div>

      <form
        onSubmit={handleCreate}
        className="rounded-xl border border-slate-200 bg-white p-5 flex flex-wrap items-end gap-3"
      >
        <div className="flex-1 min-w-[200px]">
          <label className="block font-semibold text-slate-700 mb-1">
            Category Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Networking & Routers"
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </div>
        <div className="flex-1 min-w-[240px]">
          <label className="block font-semibold text-slate-700 mb-1">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Wi-Fi 6 routers, switches, and network cards"
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
        >
          Add Category
        </button>
      </form>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
              <th className="p-3">Category</th>
              <th className="p-3">Slug</th>
              <th className="p-3">Products</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td className="p-3 font-semibold text-slate-900">{cat.name}</td>
                <td className="p-3 font-mono text-slate-500">{cat.slug}</td>
                <td className="p-3">{cat.productCount ?? 0}</td>
                <td className="p-3">
                  <span
                    className={`rounded px-2 py-0.5 font-semibold ${
                      cat.active
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {cat.active ? 'Active' : 'Archived'}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => handleToggleActive(cat)}
                    className="rounded border border-slate-200 px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {cat.active ? 'Deactivate' : 'Activate'}
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
