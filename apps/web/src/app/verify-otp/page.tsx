'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, Smartphone } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useApp } from '@/context/app-context';

const IS_DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

function maskPhone(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.length <= 4) return trimmed;
  return `${trimmed.slice(0, 3)} ••••• ${trimmed.slice(-4)}`;
}

export default function VerifyOtpPage() {
  const router = useRouter();
  const { setSession, notify } = useApp();

  const [phone, setPhone] = useState(IS_DEMO_MODE ? '+919820100101' : '');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'REQUEST' | 'VERIFY'>('REQUEST');
  const [demoHint, setDemoHint] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  const requestOtpCode = async () => {
    setFormError(null);
    if (phone.trim().length < 10) {
      setFormError('Please enter a valid mobile number with country code.');
      return;
    }

    try {
      setLoading(true);
      const res = await apiFetch('/auth/otp/request', {
        method: 'POST',
        body: JSON.stringify({ phone: phone.trim() }),
      });
      setDemoHint(IS_DEMO_MODE ? res.demoHint || null : null);
      setStep('VERIFY');
      setResendCooldown(30);
      notify('OTP sent to your mobile number');
    } catch (err: any) {
      const msg = err?.message || 'Failed to request OTP';
      setFormError(msg);
      notify(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    requestOtpCode();
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanOtp = otp.replace(/\D/g, '');
    if (cleanOtp.length !== 6) {
      setFormError('Please enter the 6-digit verification code.');
      return;
    }

    try {
      setLoading(true);
      const res = await apiFetch('/auth/otp/verify', {
        method: 'POST',
        body: JSON.stringify({
          phone: phone.trim(),
          otp: cleanOtp,
          name: name.trim() || undefined,
        }),
      });
      setSession(res.user, res.accessToken);
      notify('Verified mobile OTP successfully!');
      router.push('/account');
    } catch (err: any) {
      const msg = err?.message || 'Invalid or expired verification code';
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
            <Smartphone className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
            {step === 'REQUEST' ? 'Step 1 of 2' : 'Step 2 of 2'}
          </p>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-fg">
            Mobile OTP Sign In
          </h1>
          <p className="text-xs text-muted">
            Passwordless customer authentication via mobile verification code.
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

        {step === 'REQUEST' ? (
          <form onSubmit={handleRequestOtp} className="space-y-4 text-xs">
            <div>
              <label htmlFor="otp-phone" className="block font-semibold text-fg mb-1.5">
                Mobile Phone Number *
              </label>
              <input
                id="otp-phone"
                type="tel"
                required
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98201 00101"
                className="glass-input w-full rounded-control px-3.5 py-2.5"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-control bg-brand-600 px-4 py-3 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Sending OTP...' : 'Send Verification Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
            <div className="flex items-center justify-between gap-2 rounded-control border border-subtle bg-panel-2 px-3.5 py-2.5">
              <span className="text-muted">
                Sent to <strong className="font-mono text-fg">{maskPhone(phone)}</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  setStep('REQUEST');
                  setOtp('');
                  setFormError(null);
                }}
                className="inline-flex items-center gap-1 font-semibold text-accent hover:underline"
              >
                <ArrowLeft className="h-3 w-3" aria-hidden="true" />
                <span>Change</span>
              </button>
            </div>

            {IS_DEMO_MODE && demoHint && (
              <div className="rounded-control bg-amber-500/15 border border-amber-500/35 p-3 text-amber-800 dark:text-amber-200 font-semibold">
                {demoHint}
              </div>
            )}

            <div>
              <label htmlFor="otp-code" className="block font-semibold text-fg mb-1.5">
                Enter 6-Digit OTP Code *
              </label>
              <input
                id="otp-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                className="glass-input w-full rounded-control px-3.5 py-2.5 font-mono text-base tracking-[0.3em] text-center"
              />
            </div>

            <div>
              <label htmlFor="otp-name" className="block font-semibold text-fg mb-1.5">
                Your Name (If New Customer)
              </label>
              <input
                id="otp-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Optional"
                className="glass-input w-full rounded-control px-3.5 py-2.5"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-control bg-brand-600 px-4 py-3 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Verifying...' : 'Verify & Sign In'}
            </button>

            <div className="text-center">
              <button
                type="button"
                disabled={loading || resendCooldown > 0}
                onClick={requestOtpCode}
                className="text-xs font-semibold text-accent hover:underline disabled:text-muted disabled:no-underline"
              >
                {resendCooldown > 0
                  ? `Resend verification code in ${resendCooldown}s`
                  : 'Resend verification code'}
              </button>
            </div>
          </form>
        )}

        <div className="text-center text-xs pt-3 border-t border-subtle">
          <Link href="/login" className="font-semibold text-muted hover:text-accent transition-colors">
            Back to Email &amp; Password Login
          </Link>
        </div>
      </div>
    </div>
  );
}
