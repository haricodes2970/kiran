'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useApp } from '@/context/app-context';

export default function RegisterPage() {
  const router = useRouter();
  const { setSession, notify } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          phone: phone || undefined,
          password,
        }),
      });
      setSession(res.user, res.accessToken);
      notify('Account created successfully!');
      router.push('/account');
    } catch (err: any) {
      notify(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-1 text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white mx-auto mb-2">
            <UserPlus className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Create Customer Account
          </h1>
          <p className="text-xs text-slate-500">
            Track hardware orders, submit product enquiries, and manage repair bookings.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Rahul Sharma"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rahul@example.com"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Mobile Number (Optional)
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Password (Min 8 characters) *
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="StrongPass@123"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center text-xs pt-2 border-t border-slate-100">
          <span className="text-slate-500">Already have an account? </span>
          <Link href="/login" className="font-semibold text-blue-600 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
