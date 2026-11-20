'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useApp } from '@/context/app-context';
import { AccountShell } from '@/components/account/account-shell';

export default function CustomerProfilePage() {
  const router = useRouter();
  const { user, refreshUser, logout, notify } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [saving, setSaving] = useState(false);

  const [newLabel, setNewLabel] = useState('Home / Office');
  const [newLine1, setNewLine1] = useState('');
  const [newCity, setNewCity] = useState('Pune');
  const [newState, setNewState] = useState('Maharashtra');
  const [newPostal, setNewPostal] = useState('411038');

  useEffect(() => {
    if (!user) return;
    setName(user.name || '');
    setPhone(user.phone || '');
    setCompanyName(user.customerProfile?.companyName || '');
    setGstNumber(user.customerProfile?.gstNumber || '');
    setLoadingAddresses(true);
    apiFetch('/me/addresses')
      .then((res) => setAddresses(Array.isArray(res) ? res : []))
      .catch(() => setAddresses([]))
      .finally(() => setLoadingAddresses(false));
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
      notify(err?.message || 'Failed to update profile', 'error');
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
      notify(err?.message || 'Failed to add address', 'error');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await apiFetch(`/me/addresses/${id}`, { method: 'DELETE' });
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      notify('Address removed');
    } catch (err: any) {
      notify(err?.message || 'Could not remove address', 'error');
    }
  };

  const handleSignOut = async () => {
    await logout();
    router.push('/');
  };

  return (
    <AccountShell>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
          {/* Personal & Business Profile */}
          <form
            onSubmit={handleSaveProfile}
            className="surface-card p-6 space-y-4 text-xs"
          >
            <h2 className="font-display text-lg font-bold text-fg">
              Account Profile &amp; GST Details
            </h2>

            <div>
              <label htmlFor="prof-name" className="block font-semibold text-fg mb-1">
                Full Name *
              </label>
              <input
                id="prof-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="glass-input w-full rounded-control px-3.5 py-2"
              />
            </div>

            <div>
              <label htmlFor="prof-phone" className="block font-semibold text-fg mb-1">
                Phone Number
              </label>
              <input
                id="prof-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="glass-input w-full rounded-control px-3.5 py-2"
              />
            </div>

            <div>
              <label htmlFor="prof-company" className="block font-semibold text-fg mb-1">
                Company / Business Name (Optional)
              </label>
              <input
                id="prof-company"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="glass-input w-full rounded-control px-3.5 py-2"
              />
            </div>

            <div>
              <label htmlFor="prof-gstin" className="block font-semibold text-fg mb-1">
                GSTIN (Optional)
              </label>
              <input
                id="prof-gstin"
                type="text"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                className="glass-input w-full rounded-control px-3.5 py-2 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded-control bg-brand-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>

          {/* Session & Security (strictly supported functionality) */}
          <div className="surface-card p-6 space-y-3 text-xs">
            <div className="flex items-center gap-2 font-display text-sm font-bold text-fg">
              <ShieldCheck className="h-4 w-4 text-accent" aria-hidden="true" />
              <span>Account Session</span>
            </div>
            <p className="text-muted">
              Signed in as <strong className="text-fg">{user?.email}</strong>
            </p>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-control border border-subtle bg-panel-2 px-4 py-2 text-xs font-semibold text-fg hover:border-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Sign Out of Account</span>
            </button>
          </div>
        </div>

        {/* Saved Addresses (Add & Delete supported) */}
        <div className="surface-card p-6 space-y-4 text-xs">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold text-fg">Saved Addresses</h2>
            <span className="font-mono text-[10px] uppercase text-muted">
              Add &amp; Remove
            </span>
          </div>

          {loadingAddresses ? (
            <div className="h-20 rounded-control bg-panel-2 animate-pulse" />
          ) : addresses.length === 0 ? (
            <p className="rounded-control border border-dashed border-subtle bg-panel-2 p-4 text-muted">
              No saved addresses yet. Add a delivery or billing address below.
            </p>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="rounded-control border border-subtle bg-panel-2 p-3.5 flex items-start justify-between gap-3"
                >
                  <div>
                    <span className="font-bold text-fg">{addr.label}</span>
                    <p className="text-muted mt-0.5">
                      {addr.addressLine1}, {addr.city}, {addr.state} - {addr.postalCode}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteAddress(addr.id)}
                    aria-label={`Delete address ${addr.label}`}
                    className="p-1 text-muted hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleAddAddress} className="space-y-3 pt-4 border-t border-subtle">
            <h3 className="font-bold text-fg">Add New Address</h3>
            <div>
              <label htmlFor="addr-label" className="block font-semibold text-fg mb-1">
                Label
              </label>
              <input
                id="addr-label"
                type="text"
                required
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Home / Office"
                className="glass-input w-full rounded-control px-3.5 py-2"
              />
            </div>
            <div>
              <label htmlFor="addr-line1" className="block font-semibold text-fg mb-1">
                Street / Building / Area *
              </label>
              <input
                id="addr-line1"
                type="text"
                required
                value={newLine1}
                onChange={(e) => setNewLine1(e.target.value)}
                placeholder="Street / Building / Area"
                className="glass-input w-full rounded-control px-3.5 py-2"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                required
                aria-label="City"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                placeholder="City"
                className="glass-input rounded-control px-2.5 py-2"
              />
              <input
                type="text"
                required
                aria-label="State"
                value={newState}
                onChange={(e) => setNewState(e.target.value)}
                placeholder="State"
                className="glass-input rounded-control px-2.5 py-2"
              />
              <input
                type="text"
                required
                aria-label="PIN Code"
                value={newPostal}
                onChange={(e) => setNewPostal(e.target.value)}
                placeholder="PIN"
                className="glass-input rounded-control px-2.5 py-2"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-control bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-brand-700 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Add Address</span>
            </button>
          </form>
        </div>
      </div>
    </AccountShell>
  );
}
