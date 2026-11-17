'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Smartphone } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useApp } from '@/context/app-context';

export default function VerifyOtpPage() {
  const router = useRouter();
  const { setSession, notify } = useApp();

  const [phone, setPhone] = useState('+919820100101');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'REQUEST' | 'VERIFY'>('REQUEST');
  const [demoHint, setDemoHint] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await apiFetch('/auth/otp/request', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      });
      setDemoHint(res.demoHint || null);
      setStep('VERIFY');
      notify('OTP sent to your mobile number');
    } catch (err: any) {
      notify(err.message || 'Failed to request OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await apiFetch('/auth/otp/verify', {
        method: 'POST',
        body: JSON.stringify({ phone, otp, name: name || undefined }),
      });
      setSession(res.user, res.accessToken);
      notify('Verified mobile OTP successfully!');
      router.push('/account');
    } catch (err: any) {
      notify(err.message || 'Invalid OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-1 text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white mx-auto mb-2">
            <Smartphone className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Mobile OTP Sign In</h1>
          <p className="text-xs text-slate-500">
            Passwordless customer authentication via mobile verification code.
          </p>
        </div>

        {step === 'REQUEST' ? (
          <form onSubmit={handleRequestOtp} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Mobile Phone Number
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98201 00101"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700"
            >
              {loading ? 'Sending OTP...' : 'Send Verification Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
            {demoHint && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-amber-800 font-semibold">
                {demoHint}
              </div>
            )}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Enter 6-Digit OTP Code
              </label>
              <input
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 font-mono text-base tracking-widest"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Your Name (If New Customer)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Optional"
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700"
            >
              {loading ? 'Verifying...' : 'Verify & Sign In'}
            </button>
          </form>
        )}

        <div className="text-center text-xs pt-2 border-t border-slate-100">
          <Link href="/login" className="font-semibold text-slate-600 hover:text-blue-600">
            Back to Email &amp; Password Login
          </Link>
        </div>
      </div>
    </div>
  );
}
