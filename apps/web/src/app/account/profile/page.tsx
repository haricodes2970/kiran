'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useApp } from '@/context/app-context';

export default function CustomerProfilePage() {
  const { user, refreshUser, notify } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [addresses, setAddresses] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const [newLabel, setNewLabel] = useState('Home / Office');
  const [newLine1, setNewLine1] = useState('');
  const [newCity, setNewCity] = useState('Pune');
  const [newState, setNewState] = useState('Maharashtra');
  const [newPostal, setNewPostal] = useState('411038');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setCompanyName(user.customerProfile?.companyName || '');
      setGstNumber(user.customerProfile?.gstNumber || '');
      apiFetch('/me/addresses')
        .then((res) => setAddresses(res || []))
        .catch(() => {});
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await apiFetch('/me/profile', {
        method: 'PATCH',
        body: JSON.stringify({ name, phone, companyName, gstNumber }),
      });
      await refreshUser();
      notify('Profile updated successfully');
    } catch (err: any) {
      notify(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const created = await apiFetch('/me/addresses', {
        method: 'POST',
        body: JSON.stringify({
          label: newLabel,
          recipient: user.name,
          phone: phone || user.phone || '+919000000000',
          addressLine1: newLine1,
          city: newCity,
          state: newState,
          postalCode: newPostal,
        }),
      });
      setAddresses((prev) => [created, ...prev]);
      setNewLine1('');
      notify('Address added');
    } catch (err: any) {
      notify(err.message || 'Failed to add address', 'error');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await apiFetch(`/me/addresses/${id}`, { method: 'DELETE' });
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      notify('Address removed');
    } catch (err: any) {
      notify(err.message || 'Could not remove address', 'error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <Link
        href="/account"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Customer Dashboard
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <form
          onSubmit={handleSaveProfile}
          className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 text-xs"
        >
          <h1 className="text-lg font-bold text-slate-900">
            Account Profile &amp; GST Details
          </h1>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Company / Business Name (Optional)
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              GSTIN (Optional)
            </label>
            <input
              type="text"
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700"
          >
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>

        {/* Saved Addresses */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 text-xs">
          <h2 className="text-lg font-bold text-slate-900">Saved Addresses</h2>

          <div className="space-y-3">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="rounded-lg border border-slate-100 bg-slate-50 p-3 flex items-start justify-between gap-2"
              >
                <div>
                  <span className="font-bold text-slate-900">{addr.label}</span>
                  <p className="text-slate-600 mt-0.5">
                    {addr.addressLine1}, {addr.city}, {addr.state} - {addr.postalCode}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteAddress(addr.id)}
                  className="text-slate-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddAddress} className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="font-bold text-slate-800">Add New Address</h3>
            <input
              type="text"
              required
              value={newLine1}
              onChange={(e) => setNewLine1(e.target.value)}
              placeholder="Street / Building / Area"
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                required
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                placeholder="City"
                className="rounded-lg border border-slate-200 px-2.5 py-2"
              />
              <input
                type="text"
                required
                value={newState}
                onChange={(e) => setNewState(e.target.value)}
                placeholder="State"
                className="rounded-lg border border-slate-200 px-2.5 py-2"
              />
              <input
                type="text"
                required
                value={newPostal}
                onChange={(e) => setNewPostal(e.target.value)}
                placeholder="PIN"
                className="rounded-lg border border-slate-200 px-2.5 py-2"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white"
            >
              <Plus className="h-3.5 w-3.5" /> Add Address
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
