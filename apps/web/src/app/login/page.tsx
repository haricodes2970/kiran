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
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="space-y-1 text-center">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 text-white mx-auto mb-2 shadow-sm">
            <KeyRound className="h-5 w-5" />
          </div>
          <h1 className="font-display text-xl font-bold text-fg">
            Sign In to Kiran&apos;s Infotech
          </h1>
          <p className="text-xs text-muted">
            Access your orders, repair tracking, quotations, or administration console.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-fg mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="glass-input w-full rounded-xl px-3.5 py-2.5"
            />
          </div>

          <div>
            <label className="block font-semibold text-fg mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="glass-input w-full rounded-xl px-3.5 py-2.5"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="flex items-center justify-between text-xs pt-3 border-t border-subtle">
          <Link
            href="/verify-otp"
            className="font-semibold text-accent hover:underline flex items-center gap-1"
          >
            <Smartphone className="h-3.5 w-3.5" /> Sign In with Mobile OTP
          </Link>
          <Link
            href="/register"
            className="font-semibold text-fg hover:text-accent transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>

      {/* One-Click Demo Accounts Box */}
      <div className="glass-card rounded-2xl border border-amber-500/30 p-5 space-y-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-300">
          <ShieldCheck className="h-4 w-4" />
          <span>Client Demo Quick-Login Accounts</span>
        </div>
        <p className="text-muted text-[11px]">
          Click below to sign in immediately as the Demo Administrator or Demo Customers:
        </p>
        <div className="grid grid-cols-1 gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => performLogin('admin@kiransinfotech.demo', 'Admin@Kiran2026!')}
            className="flex items-center justify-between rounded-xl bg-[#0B1930] border border-blue-400/20 px-3.5 py-2.5 text-white hover:bg-slate-800 font-semibold transition"
          >
            <span>Admin Console (Kiran Deshmukh)</span>
            <span className="font-mono text-[10px] text-electric">
              admin@kiransinfotech.demo
            </span>
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() =>
              performLogin('rahul.sharma@example.demo', 'Customer@2026!')
            }
            className="glass-pill flex items-center justify-between rounded-xl px-3.5 py-2 text-fg hover:border-accent font-semibold transition"
          >
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-accent" /> Customer 1 (Rahul Sharma)
            </span>
            <span className="font-mono text-[10px] text-muted">
              rahul.sharma@example.demo
            </span>
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() =>
              performLogin('priya.patel@example.demo', 'Customer@2026!')
            }
            className="glass-pill flex items-center justify-between rounded-xl px-3.5 py-2 text-fg hover:border-accent font-semibold transition"
          >
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-emerald-500" /> Customer 2 (Priya Patel)
            </span>
            <span className="font-mono text-[10px] text-muted">
              priya.patel@example.demo
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
