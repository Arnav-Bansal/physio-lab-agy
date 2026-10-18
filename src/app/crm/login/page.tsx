'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  UserCog,
  Stethoscope,
  Headset,
  ArrowLeft,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { BrandLogo } from '@/components/brand/logo';

const DEMO_CRM_PROFILES = [
  {
    id: '11111111-1111-4111-8111-111111111101',
    role: 'admin',
    title: 'Admin — Full Multi-Clinic Control',
    name: 'Dr. Guneet Singh',
    email: 'admin@thephysiolab.in',
    desc: 'Manage clinics, physios, staff roles, WhatsApp templates, and full schedule.',
    icon: UserCog,
  },
  {
    id: '11111111-1111-4111-8111-111111111102',
    role: 'staff',
    title: 'Reception / Staff — Front Desk CRM',
    name: 'Simran Kaur',
    email: 'reception@thephysiolab.in',
    desc: 'Manage patient profiles, create manual slot bookings, and trigger WhatsApp messages.',
    icon: Headset,
  },
  {
    id: '22222222-2222-4222-8222-222222222201',
    role: 'physio',
    title: 'Physio (Doctor) — Sports Injury Centre',
    name: 'Dr. Arjun Malhotra, MPT',
    email: 'dr.arjun@thephysiolab.in',
    desc: 'View daily/weekly schedule, add clinical SOAP notes, and upload PDF/Image prescriptions.',
    icon: Stethoscope,
  },
];

export default function CrmLoginPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(DEMO_CRM_PROFILES[0].id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/crm-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId: selectedId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'CRM login failed');
      }
      router.push('/crm');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-linen flex flex-col">
      <header className="border-b border-[#D6CFC2] bg-[#F5F2EB]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/">
            <BrandLogo />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#00858E] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Public Website</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <form
          onSubmit={handleLogin}
          className="max-w-xl w-full bg-white rounded-3xl p-7 sm:p-9 border border-[#D6CFC2] shadow-xl space-y-6"
        >
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#00858E]">
              <ShieldCheck className="h-4 w-4" />
              <span>Unified Web CRM Access</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#141413] mt-1">
              Staff, Physio &amp; Admin Login
            </h1>
            <p className="text-sm text-[#141413]/70 mt-1">
              Select a role profile to sign in to The Physio Lab multi-clinic management dashboard.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {DEMO_CRM_PROFILES.map((item) => {
              const Icon = item.icon;
              const isSelected = selectedId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                    isSelected
                      ? 'border-2 border-[#00858E] bg-[#DCE8E6]/50 shadow-sm'
                      : 'border-[#D6CFC2] bg-[#F5F2EB]/40 hover:border-[#00858E]/50'
                  }`}
                >
                  <div className="h-11 w-11 rounded-xl bg-[#00858E] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#00858E]">
                      {item.title}
                    </span>
                    <p className="text-sm font-extrabold text-[#141413]">
                      {item.name} ({item.email})
                    </p>
                    <p className="text-xs text-[#141413]/70">{item.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-[#00858E] hover:bg-[#006D75] text-white font-extrabold text-sm shadow-lg shadow-[#00858E]/20 transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Signing In to CRM...</span>
              </>
            ) : (
              <>
                <span>Sign In to Unified Web CRM</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
