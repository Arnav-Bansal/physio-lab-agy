'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  MessageSquare,
  Phone,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Sparkles,
  User,
} from 'lucide-react';

export function OtpLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/portal';

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('+91 98765-43210');
  const [fullName, setFullName] = useState('');
  const [existingPatientName, setExistingPatientName] = useState<string | null>(null);
  const [otp, setOtp] = useState('123456');
  const [sandboxHint, setSandboxHint] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }
      setExistingPatientName(data.existingPatientName);
      setSandboxHint(data.sandboxHint || null);
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send OTP');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          otp,
          fullName: existingPatientName || fullName || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid OTP');
      }
      router.push(nextUrl);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-3xl p-7 sm:p-9 border border-[#D6CFC2] shadow-xl">
      <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest text-[#00858E] mb-2">
        <MessageSquare className="h-4 w-4" />
        <span>WhatsApp OTP Authentication</span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-[#141413]">
        {step === 'phone' ? 'Patient Portal Login' : 'Enter 6-Digit WhatsApp OTP'}
      </h1>
      <p className="text-sm text-[#141413]/70 mt-1.5">
        {step === 'phone'
          ? 'Enter your WhatsApp mobile number to view upcoming appointments, consultation history, and download prescriptions.'
          : `We dispatched a 6-digit verification code to ${phone}.`}
      </p>

      {error && (
        <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      {step === 'phone' ? (
        <form onSubmit={handleSendOtp} className="mt-6 space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#141413]/80 mb-2">
              WhatsApp Mobile Number
            </label>
            <div className="relative">
              <Phone className="h-4 w-4 text-[#00858E] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765-43210"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-[#D6CFC2] bg-[#F5F2EB]/60 text-[#141413] font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#00858E]"
              />
            </div>
          </div>

          {/* Pre-seeded Patient Quick Selectors for Instant Demo Testing */}
          <div className="bg-[#F5F2EB] rounded-2xl p-3.5 border border-[#D6CFC2]/80 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#00858E]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Quick Fill Pre-Seeded Patient Profiles</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setPhone('+91 98765-43210')}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-[#D6CFC2] hover:border-[#00858E] text-[#141413] transition-colors"
              >
                Rohan Verma (+91 98765-43210)
              </button>
              <button
                type="button"
                onClick={() => setPhone('+91 93161-96000')}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-[#D6CFC2] hover:border-[#00858E] text-[#141413] transition-colors"
              >
                Harleen Sidhu (+91 93161-96000)
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-[#00858E] hover:bg-[#006D75] text-white font-bold text-sm shadow-lg shadow-[#00858E]/20 transition-all disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Sending WhatsApp OTP...</span>
              </>
            ) : (
              <>
                <span>Send 6-Digit WhatsApp OTP</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="mt-6 space-y-5">
          {sandboxHint && (
            <div className="p-3.5 rounded-xl bg-[#DCE8E6] border border-[#00858E]/30 flex items-center gap-2.5 text-xs font-semibold text-[#006D75]">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#00858E]" />
              <span>{sandboxHint}</span>
            </div>
          )}

          {existingPatientName ? (
            <div className="p-3.5 rounded-xl bg-[#F5F2EB] border border-[#D6CFC2] text-xs font-medium text-[#141413]">
              Welcome back, <strong className="font-bold text-[#00858E]">{existingPatientName}</strong>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#141413]/80 mb-2">
                Your Full Name (New Patient Registration)
              </label>
              <div className="relative">
                <User className="h-4 w-4 text-[#00858E] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#D6CFC2] bg-[#F5F2EB]/60 text-[#141413] font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#00858E]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#141413]/80 mb-2">
              6-Digit OTP Code
            </label>
            <input
              type="text"
              maxLength={6}
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="w-full px-4 py-3.5 rounded-xl border-2 border-[#00858E] bg-[#F5F2EB]/40 text-center tracking-[0.5em] text-xl font-extrabold text-[#141413] focus:outline-none focus:ring-2 focus:ring-[#00858E]"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => setStep('phone')}
              className="sm:w-1/3 py-3.5 px-4 rounded-xl border border-[#D6CFC2] text-xs font-bold text-[#141413]/80 hover:bg-[#F5F2EB]"
            >
              Change Phone
            </button>
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#00858E] hover:bg-[#006D75] text-white font-bold text-sm shadow-lg shadow-[#00858E]/20 transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying OTP...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Verify &amp; Enter Patient Portal</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
