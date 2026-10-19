import React, { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import { BrandLogo } from '@/components/brand/logo';
import { OtpLoginForm } from '@/components/portal/otp-login-form';

export default function PatientLoginPage() {
  return (
    <div className="min-h-screen bg-stone-linen flex flex-col">
      {/* Top Simple Bar */}
      <header className="border-b border-border bg-muted/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/">
            <BrandLogo />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Clinic Showcase</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Reception Wall Image & Benefits */}
          <div className="lg:col-span-6 space-y-6">
            <div className="relative rounded-lg overflow-hidden border-4 border-white shadow-xl">
              <img
                src="/images/clinic/clinic_photo_3.jpg"
                alt="The Physio Lab Reception"
                className="w-full h-64 sm:h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141413]/85 via-[#141413]/20 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-primary px-2.5 py-1 rounded-full">
                  Patient Digital Portal
                </span>
                <h2 className="text-xl font-semibold mt-2">
                  The Physio Lab — Research &amp; Rehabilitation
                </h2>
                <p className="text-xs text-white/80 mt-0.5">
                  Barewal Awana, Ludhiana • +91 93161-96000
                </p>
              </div>
            </div>

            <div className="bg-white/80 rounded-lg p-5 border border-border space-y-2.5 text-xs sm:text-sm">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>What you can do inside your Patient Portal:</span>
              </div>
              <ul className="space-y-1.5 text-foreground/75">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>Book real-time physiotherapy &amp; sports injury slots</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>View upcoming appointments &amp; past consultation clinical notes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>Preview &amp; download PDF and image prescriptions anytime</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Interactive OTP Form */}
          <div className="lg:col-span-6">
            <Suspense fallback={<div className="bg-white rounded-lg p-8 h-96 animate-pulse" />}>
              <OtpLoginForm />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
