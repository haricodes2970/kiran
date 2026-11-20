'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, Check, Eye, EyeOff, UserPlus } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useApp } from '@/context/app-context';

export default function RegisterPage() {
  const router = useRouter();
  const { setSession, notify } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const hasMinLength = password.length >= 8;
  const hasLetterAndNumber = /[A-Za-z]/.test(password) && /[0-9!@#$%^&*]/.test(password);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (name.trim().length < 2) {
      setFormError('Full name must be at least 2 characters.');
      return;
    }
    if (!hasMinLength) {
      setFormError('Password must be at least 8 characters.');
      return;
    }

    try {
      setLoading(true);
      const res = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          password,
        }),
      });
      setSession(res.user, res.accessToken);
      notify('Account created successfully!');
      router.push('/account');
    } catch (err: any) {
      const msg = err?.message || 'Registration failed';
      setFormError(msg);
      notify(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10 sm:py-14">
      <div className="surface-card p-6 sm:p-8 space-y-6">
        <div className="space-y-1.5 text-center">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-control bg-brand-600 text-white mx-auto mb-1">
            <UserPlus className="h-5 w-5" aria-hidden="true" />
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-fg">
            Create Customer Account
          </h1>
          <p className="text-xs text-muted">
            Track hardware order requests, submit enquiries, and manage repair bookings.
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

        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div>
            <label htmlFor="reg-name" className="block font-semibold text-fg mb-1.5">
              Full Name *
            </label>
            <input
              id="reg-name"
              type="text"
              required
              minLength={2}
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Rahul Sharma"
              className="glass-input w-full rounded-control px-3.5 py-2.5"
            />
          </div>

          <div>
            <label htmlFor="reg-email" className="block font-semibold text-fg mb-1.5">
              Email Address *
            </label>
            <input
              id="reg-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rahul@example.com"
              className="glass-input w-full rounded-control px-3.5 py-2.5"
            />
          </div>

          <div>
            <label htmlFor="reg-phone" className="block font-semibold text-fg mb-1.5">
              Mobile Number (Optional)
            </label>
            <input
              id="reg-phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="glass-input w-full rounded-control px-3.5 py-2.5"
            />
          </div>

          <div>
            <label htmlFor="reg-password" className="block font-semibold text-fg mb-1.5">
              Password *
            </label>
            <div className="relative">
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
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

            <div className="mt-2 flex flex-wrap gap-3 text-[11px]">
              <span
                className={`inline-flex items-center gap-1 ${
                  hasMinLength ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-muted'
                }`}
              >
                <Check className="h-3 w-3" aria-hidden="true" /> 8+ characters
              </span>
              <span
                className={`inline-flex items-center gap-1 ${
                  hasLetterAndNumber ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-muted'
                }`}
              >
                <Check className="h-3 w-3" aria-hidden="true" /> Letters &amp; numbers/symbols
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-control bg-brand-600 px-4 py-3 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
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
