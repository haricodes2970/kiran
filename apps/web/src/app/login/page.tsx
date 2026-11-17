'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { KeyRound, ShieldCheck, Smartphone, User } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useApp } from '@/context/app-context';

export default function LoginPage() {
  const router = useRouter();
  const { setSession, notify } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const performLogin = async (loginEmail: string, loginPass: string) => {
    try {
      setLoading(true);
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });
      setSession(res.user, res.accessToken);
      notify(`Welcome back, ${res.user.name}!`);
      if (res.user.roles?.includes('ADMIN')) {
        router.push('/admin');
      } else {
        router.push('/account');
      }
    } catch (err: any) {
      notify(err.message || 'Invalid credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(email, password);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-1 text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white mx-auto mb-2">
            <KeyRound className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Sign In to Kiran&apos;s Infotech
          </h1>
          <p className="text-xs text-slate-500">
            Access your orders, repair tracking, quotations, or administration console.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
          <Link
            href="/verify-otp"
            className="font-semibold text-blue-600 hover:underline flex items-center gap-1"
          >
            <Smartphone className="h-3.5 w-3.5" /> Sign In with Mobile OTP
          </Link>
          <Link
            href="/register"
            className="font-semibold text-slate-700 hover:text-blue-600"
          >
            Create Customer Account
          </Link>
        </div>
      </div>

      {/* One-Click Demo Accounts Box */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 space-y-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-amber-900">
          <ShieldCheck className="h-4 w-4 text-amber-600" />
          <span>Client Demo Quick-Login Accounts</span>
        </div>
        <p className="text-amber-800 text-[11px]">
          Click below to sign in immediately as the Demo Administrator or Demo Customers:
        </p>
        <div className="grid grid-cols-1 gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => performLogin('admin@kiransinfotech.demo', 'Admin@Kiran2026!')}
            className="flex items-center justify-between rounded-lg bg-slate-900 px-3.5 py-2.5 text-white hover:bg-slate-800 font-semibold"
          >
            <span>Admin Console (Kiran Deshmukh)</span>
            <span className="font-mono text-[10px] text-blue-300">
              admin@kiransinfotech.demo
            </span>
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() =>
              performLogin('rahul.sharma@example.demo', 'Customer@2026!')
            }
            className="flex items-center justify-between rounded-lg border border-amber-300 bg-white px-3.5 py-2 text-slate-800 hover:bg-amber-100/50 font-semibold"
          >
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-blue-600" /> Customer 1 (Rahul Sharma)
            </span>
            <span className="font-mono text-[10px] text-slate-500">
              rahul.sharma@example.demo
            </span>
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() =>
              performLogin('priya.patel@example.demo', 'Customer@2026!')
            }
            className="flex items-center justify-between rounded-lg border border-amber-300 bg-white px-3.5 py-2 text-slate-800 hover:bg-amber-100/50 font-semibold"
          >
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-emerald-600" /> Customer 2 (Priya Patel)
            </span>
            <span className="font-mono text-[10px] text-slate-500">
              priya.patel@example.demo
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
