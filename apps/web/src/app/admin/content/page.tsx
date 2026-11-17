'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useApp } from '@/context/app-context';

export default function AdminContentPage() {
  const { notify } = useApp();
  const [badge, setBadge] = useState('');
  const [headline, setHeadline] = useState('');
  const [subheadline, setSubheadline] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [address, setAddress] = useState('');
  const [operatingHours, setOperatingHours] = useState('');

  useEffect(() => {
    apiFetch('/site-content')
      .then((res) => {
        if (res?.hero_banner) {
          setBadge(res.hero_banner.badge || '');
          setHeadline(res.hero_banner.headline || '');
          setSubheadline(res.hero_banner.subheadline || '');
        }
        if (res?.business_info) {
          setPhone(res.business_info.phone || '');
          setWhatsappNumber(res.business_info.whatsappNumber || '');
          setAddress(res.business_info.address || '');
          setOperatingHours(res.business_info.operatingHours || '');
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/admin/site-content/hero_banner', {
        method: 'PUT',
        body: JSON.stringify({
          title: 'Homepage Hero Configuration',
          contentJson: JSON.stringify({ badge, headline, subheadline }),
          published: true,
        }),
      });
      notify('Homepage hero banner updated!');
    } catch (err: any) {
      notify(err.message || 'Failed to update hero content', 'error');
    }
  };

  const handleSaveBusinessInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/admin/site-content/business_info', {
        method: 'PUT',
        body: JSON.stringify({
          title: 'Business Contact & Showroom Details',
          contentJson: JSON.stringify({
            businessName: "Kiran's Infotech",
            phone,
            whatsappNumber,
            address,
            operatingHours,
          }),
          published: true,
        }),
      });
      notify('Business contact details updated!');
    } catch (err: any) {
      notify(err.message || 'Failed to update business info', 'error');
    }
  };

  return (
    <div className="space-y-6 text-xs">
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          Storefront Content &amp; Business Settings
        </h1>
        <p className="text-slate-500">
          Edit homepage hero copy, showroom contact information, and operating hours.
        </p>
      </div>

      <form
        onSubmit={handleSaveHero}
        className="rounded-xl border border-slate-200 bg-white p-5 space-y-3"
      >
        <h2 className="text-sm font-bold text-slate-900">
          Homepage Hero Banner
        </h2>
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Top Trust Badge
          </label>
          <input
            type="text"
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Main Headline
          </label>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Subheadline
          </label>
          <textarea
            rows={2}
            value={subheadline}
            onChange={(e) => setSubheadline(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white"
        >
          Save Hero Content
        </button>
      </form>

      <form
        onSubmit={handleSaveBusinessInfo}
        className="rounded-xl border border-slate-200 bg-white p-5 space-y-3"
      >
        <h2 className="text-sm font-bold text-slate-900">
          Showroom Contact, WhatsApp &amp; Hours
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Display Phone
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
              WhatsApp Number (International Digits)
            </label>
            <input
              type="text"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </div>
        </div>
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Showroom Address
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Operating Hours
          </label>
          <input
            type="text"
            value={operatingHours}
            onChange={(e) => setOperatingHours(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white"
        >
          Save Business Info
        </button>
      </form>
    </div>
  );
}
