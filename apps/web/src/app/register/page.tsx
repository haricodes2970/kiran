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
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="space-y-1 text-center">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 text-white mx-auto mb-2 shadow-sm">
            <UserPlus className="h-5 w-5" />
          </div>
          <h1 className="font-display text-xl font-bold text-fg">
            Create Customer Account
          </h1>
          <p className="text-xs text-muted">
            Track hardware orders, submit product enquiries, and manage repair bookings.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-fg mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Rahul Sharma"
              className="glass-input w-full rounded-xl px-3.5 py-2.5"
            />
          </div>

          <div>
            <label className="block font-semibold text-fg mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rahul@example.com"
              className="glass-input w-full rounded-xl px-3.5 py-2.5"
            />
          </div>

          <div>
            <label className="block font-semibold text-fg mb-1">
              Mobile Number (Optional)
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="glass-input w-full rounded-xl px-3.5 py-2.5"
            />
          </div>

          <div>
            <label className="block font-semibold text-fg mb-1">
              Password (Min 8 characters) *
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="StrongPass@123"
              className="glass-input w-full rounded-xl px-3.5 py-2.5"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center text-xs pt-3 border-t border-subtle">
          <span className="text-muted">Already have an account? </span>
          <Link href="/login" className="font-semibold text-accent hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
