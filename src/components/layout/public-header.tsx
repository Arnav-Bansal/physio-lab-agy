import React from 'react';
import Link from 'next/link';
import { Phone, CalendarCheck, UserCheck, ShieldCheck, Star } from 'lucide-react';
import { BrandLogo } from '@/components/brand/logo';
import { getPatientSession } from '@/lib/auth/session';

export async function PublicHeader() {
  const patientSession = await getPatientSession();

  return (
    <header className="sticky top-0 z-50 border-b border-[#D6CFC2]/80 bg-[#F5F2EB]/95 backdrop-blur-md">
      {/* Top Clinical Info Ribbon */}
      <div className="bg-[#00858E] text-white text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1 font-semibold bg-white/15 px-2.5 py-0.5 rounded-full">
              <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
              5.0 ★ Rated Centre in Ludhiana
            </span>
            <span className="hidden md:inline text-white/90">
              Research &amp; Rehabilitation • Physiotherapy • Sports Injury Centre • Lifestyle Clinic
            </span>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <a
              href="tel:+919316196000"
              className="inline-flex items-center gap-1.5 font-semibold hover:text-amber-200 transition-colors"
            >
              <Phone className="h-3.5 w-3.5" />
              93161-96000
            </a>
            <span className="text-white/40">|</span>
            <a
              href="tel:+919815370607"
              className="inline-flex items-center gap-1.5 font-semibold hover:text-amber-200 transition-colors"
            >
              98153-70607
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        <Link href="/" className="focus:outline-none">
          <BrandLogo />
        </Link>

        <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-[#141413]/80">
          <a href="#pillars" className="hover:text-[#00858E] transition-colors">
            4 Clinical Pillars
          </a>
          <a href="#facility" className="hover:text-[#00858E] transition-colors">
            Inside The Lab
          </a>
          <a href="#specialists" className="hover:text-[#00858E] transition-colors">
            Specialists
          </a>
          <a href="#location" className="hover:text-[#00858E] transition-colors">
            Barewal Awana Centre
          </a>
        </nav>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link
            href="/crm"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-[#141413]/80 hover:text-[#00858E] hover:bg-[#E8E2D7]/70 border border-[#D6CFC2] transition-all"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-[#00858E]" />
            Staff / Doctor CRM
          </Link>

          {patientSession ? (
            <Link
              href="/portal"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-[#141413] text-white hover:bg-[#141413]/90 transition-all shadow-sm"
            >
              <UserCheck className="h-4 w-4 text-[#14B8A6]" />
              <span>My Portal ({patientSession.fullName.split(' ')[0]})</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-bold text-[#00858E] bg-white border border-[#00858E]/30 hover:bg-[#DCE8E6]/50 transition-all"
            >
              <UserCheck className="h-4 w-4" />
              <span>Patient Login</span>
            </Link>
          )}

          <Link
            href={patientSession ? '/portal/book' : '/login?next=/portal/book'}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-bold bg-[#00858E] hover:bg-[#006D75] text-white shadow-md shadow-[#00858E]/20 transition-all"
          >
            <CalendarCheck className="h-4 w-4" />
            <span>Book Appointment</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
