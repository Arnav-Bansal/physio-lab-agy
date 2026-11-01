import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { BrandEmblem } from '@/components/brand/logo';
import { ShowcaseLandingView } from '@/components/public/showcase-landing';

export const dynamic = 'force-dynamic';

interface HomePageProps {
  searchParams?: Promise<{ preview?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedParams = searchParams ? await searchParams : {};

  if (resolvedParams?.preview === '1' || resolvedParams?.preview === 'true') {
    return <ShowcaseLandingView />;
  }

  return (
    <div className="min-h-screen bg-[#141E1E] text-white flex flex-col justify-between relative overflow-hidden selection:bg-primary selection:text-white">
      {/* Subtle Ambient Architectural Radial Glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 32%, rgba(0, 156, 166, 0.22) 0%, rgba(0, 109, 117, 0.08) 42%, rgba(20, 30, 30, 0) 75%)',
        }}
        aria-hidden="true"
      />

      {/* Top Subtle Domain Bar */}
      <header className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-8 flex items-center justify-between text-xs text-white/60">
        <span className="font-mono tracking-wider uppercase text-[#5EEAD4]">
          thephysiolabs.com
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-[#2DD4BF]" />
          <span>Barewal Awana, Ludhiana</span>
        </span>
      </header>

      {/* Main Centered Coming Soon Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-14 text-center max-w-3xl mx-auto">
        {/* Elevated Clinic Emblem Badge */}
        <div className="relative mb-8">
          <div
            className="absolute -inset-4 rounded-3xl bg-[#009CA6]/20 blur-xl"
            aria-hidden="true"
          />
          <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-3xl bg-white/[0.06] border border-white/15 shadow-2xl backdrop-blur-md flex items-center justify-center">
            <BrandEmblem className="h-14 w-14 sm:h-16 sm:w-16" />
          </div>
        </div>

        {/* Coming Soon Pill */}
        <div className="inline-flex items-center gap-2 rounded-full bg-[#009CA6]/15 border border-[#2DD4BF]/30 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#5EEAD4] mb-5 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-[#2DD4BF]" />
          <span>Coming Soon</span>
        </div>

        {/* Clinic Name & Tagline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.08]">
          The Physio Lab
        </h1>
        <p className="mt-2.5 text-base sm:text-xl font-medium tracking-wide text-[#5EEAD4]">
          Research &amp; Rehabilitation
        </p>

        {/* Description */}
        <p className="mt-5 text-sm sm:text-base text-white/70 max-w-xl leading-relaxed">
          Our new digital patient portal and online appointment experience at{' '}
          <span className="text-white font-semibold">thephysiolabs.com</span> is currently under
          development.
        </p>

        {/* 4 Clinical Pillars Strip */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 max-w-2xl">
          {[
            'Research & Rehabilitation',
            'Physiotherapy',
            'Sports Injury Centre',
            'Lifestyle Clinic',
          ].map((pillar) => (
            <span
              key={pillar}
              className="rounded-xl bg-white/[0.05] border border-white/10 px-3.5 py-2 text-xs font-medium text-white/85"
            >
              {pillar}
            </span>
          ))}
        </div>

        {/* Clinic Contact Card */}
        <div className="mt-10 w-full max-w-xl rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm p-5 sm:p-6 text-left grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2DD4BF]">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span>Flagship Centre</span>
            </div>
            <p className="text-xs sm:text-sm text-white/85 leading-snug pt-0.5">
              Barewal Awana, Ludhiana, Punjab — 141012
            </p>
            <p className="text-[11px] text-white/55 flex items-center gap-1.5 pt-1">
              <Clock className="h-3 w-3 text-[#2DD4BF] shrink-0" />
              <span>Mon – Sat: 9:00 AM – 8:00 PM</span>
            </p>
          </div>

          <div className="space-y-1 sm:border-l sm:border-white/10 sm:pl-5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2DD4BF]">
              <Phone className="h-3.5 w-3.5 shrink-0" />
              <span>Appointments &amp; Desk</span>
            </div>
            <div className="pt-0.5 space-y-1 font-mono text-xs sm:text-sm">
              <a
                href="tel:+919316196000"
                className="block text-white hover:text-[#5EEAD4] font-semibold transition-colors"
              >
                +91 93161-96000
              </a>
              <a
                href="tel:+919815370607"
                className="block text-white/80 hover:text-[#5EEAD4] transition-colors"
              >
                +91 98153-70607
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer with discrete Staff CRM & Preview access */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto px-6 pb-8 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/45">
        <p>© {new Date().getFullYear()} The Physio Lab — Research &amp; Rehabilitation.</p>
        <div className="flex items-center gap-4">
          <Link
            href="/preview"
            className="hover:text-white/80 transition-colors"
          >
            Website Preview
          </Link>
          <span className="text-white/20">•</span>
          <Link
            href="/crm"
            className="inline-flex items-center gap-1.5 text-white/65 hover:text-[#5EEAD4] font-medium transition-colors"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-[#2DD4BF]" />
            <span>Staff &amp; Doctor CRM</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
