'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, Eye, EyeOff, KeyRound, ShieldCheck, Smartphone, User } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useApp } from '@/context/app-context';

const IS_DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export default function LoginPage() {
  const router = useRouter();
  const { setSession, notify } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const performLogin = async (loginEmail: string, loginPass: string) => {
    setFormError(null);
    if (!loginEmail.trim() || !loginPass) {
      setFormError('Please enter both your email address and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPass }),
      });
      setSession(res.user, res.accessToken);
      notify(`Welcome back, ${res.user.name}!`);
      if (res.user.roles?.includes('ADMIN')) {
        router.push('/admin');
      } else {
        router.push('/account');
      }
    } catch (err: any) {
      const msg = err?.message || 'Invalid credentials';
      setFormError(msg);
      notify(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(email, password);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10 sm:py-14 space-y-6">
      <div className="surface-card p-6 sm:p-8 space-y-6">
        <div className="space-y-1.5 text-center">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-control bg-brand-600 text-white mx-auto mb-1">
            <KeyRound className="h-5 w-5" aria-hidden="true" />
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-fg">
            Sign In to Kiran&apos;s Infotech
          </h1>
          <p className="text-xs text-muted">
            Access your hardware order requests, repair tracking, and quotations.
          </p>
        </div>

        {formError && (
          <div
            role="alert"
            className="rounded-control border border-red-300 bg-red-50 dark:bg-red-950/60 dark:border-red-500/40 px-3.5 py-2.5 text-xs text-red-700 dark:text-red-200 flex items-start gap-2"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label htmlFor="login-email" className="block font-semibold text-fg mb-1.5">
              Email Address *
            </label>
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="glass-input w-full rounded-control px-3.5 py-2.5"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="block font-semibold text-fg mb-1.5">
              Password *
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="glass-input w-full rounded-control pl-3.5 pr-10 py-2.5"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-fg transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-control bg-brand-600 px-4 py-3 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="flex items-center justify-between text-xs pt-3 border-t border-subtle gap-2">
          <Link
            href="/verify-otp"
            className="font-semibold text-accent hover:underline inline-flex items-center gap-1.5"
          >
            <Smartphone className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Sign In with Mobile OTP</span>
          </Link>
          <Link
            href="/register"
            className="font-semibold text-fg hover:text-accent transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>

      {/* Demo Quick-Login strictly gated to NEXT_PUBLIC_DEMO_MODE === 'true' */}
      {IS_DEMO_MODE && (
        <div className="surface-card border-amber-500/35 p-5 space-y-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-300">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            <span>Demo Mode Quick-Login</span>
          </div>
          <p className="text-muted text-[11px]">
            Available only when <code className="font-mono">NEXT_PUBLIC_DEMO_MODE=true</code>:
          </p>
          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => performLogin('admin@kiransinfotech.demo', 'Admin@Kiran2026!')}
              className="flex items-center justify-between rounded-control bg-[#0B1930] border border-blue-400/25 px-3.5 py-2.5 text-white hover:bg-slate-800 font-semibold transition-colors"
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
              className="flex items-center justify-between rounded-control border border-subtle bg-panel-2 px-3.5 py-2 text-fg hover:border-accent font-semibold transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                <span>Customer 1 (Rahul Sharma)</span>
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
              className="flex items-center justify-between rounded-control border border-subtle bg-panel-2 px-3.5 py-2 text-fg hover:border-accent font-semibold transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
                <span>Customer 2 (Priya Patel)</span>
              </span>
              <span className="font-mono text-[10px] text-muted">
                priya.patel@example.demo
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
