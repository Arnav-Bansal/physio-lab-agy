import React from 'react';
import Link from 'next/link';
import {
  CalendarCheck,
  UserCheck,
  ShieldCheck,
  Phone,
  MapPin,
  Clock,
  Star,
} from 'lucide-react';
import { BrandLogo } from '@/components/brand/logo';
import { getCrmSession, getPatientSession } from '@/lib/auth/session';

export async function PublicHeader() {
  const [patientSession, crmSession] = await Promise.all([
    getPatientSession(),
    getCrmSession(),
  ]);

  const activeUserName = crmSession?.fullName || patientSession?.fullName || null;

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-md">
      {/* Slim Architectural Top Utility Strip */}
      <div className="bg-[#141E1E] text-white/85 text-[11px] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar whitespace-nowrap">
            <span className="inline-flex items-center gap-1.5 font-medium text-white">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span>5.0 ★ Google Verified Rehab Centre</span>
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-white/70">
              <MapPin className="h-3 w-3 text-[#2DD4BF]" />
              <span>Barewal Awana, Ludhiana</span>
            </span>
            <span className="hidden lg:inline-flex items-center gap-1 text-white/70">
              <Clock className="h-3 w-3 text-[#2DD4BF]" />
              <span>Mon – Sat: 9:00 AM – 8:00 PM</span>
            </span>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {activeUserName && (
              <>
                <span className="hidden sm:inline-flex items-center gap-1.5 font-semibold text-[#5EEAD4]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Welcome, {activeUserName}</span>
                </span>
                <span className="hidden sm:inline text-white/25">|</span>
              </>
            )}
            <a
              href="tel:+919316196000"
              className="inline-flex items-center gap-1.5 font-mono font-medium text-white hover:text-[#2DD4BF] transition-colors"
            >
              <Phone className="h-3 w-3 text-[#2DD4BF]" />
              <span>+91 93161-96000</span>
            </a>
            <span className="text-white/25">|</span>
            <Link
              href="/crm"
              className="inline-flex items-center gap-1 text-white/75 hover:text-white font-medium transition-colors"
            >
              <ShieldCheck className="h-3 w-3 text-[#2DD4BF]" />
              <span>{crmSession ? `CRM (${crmSession.fullName})` : 'Staff & Doctor CRM'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Consumer Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        <Link href="/" className="focus:outline-none">
          <BrandLogo />
        </Link>

        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-foreground/80">
          <a href="#conditions" className="hover:text-primary transition-colors">
            Conditions &amp; Pain Relief
          </a>
          <a href="#pillars" className="hover:text-primary transition-colors">
            4 Clinical Pillars
          </a>
          <a href="#facility" className="hover:text-primary transition-colors">
            Desmotec Lab &amp; Tour
          </a>
          <a href="#specialists" className="hover:text-primary transition-colors">
            Specialists
          </a>
          <a href="#stories" className="hover:text-primary transition-colors">
            Patient Stories
          </a>
          <a href="#location" className="hover:text-primary transition-colors">
            Location
          </a>
        </nav>

        <div className="flex items-center gap-2.5">
          {patientSession ? (
            <Link
              href="/portal"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-secondary text-secondary-foreground hover:bg-accent transition-colors border border-primary/15"
            >
              <UserCheck className="h-4 w-4 text-primary" />
              <span>Welcome, {patientSession.fullName.split(' ')[0]} • Portal</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-foreground bg-card border border-border hover:border-primary/40 hover:bg-secondary/50 transition-all"
            >
              <UserCheck className="h-4 w-4 text-primary" />
              <span>Patient Portal</span>
            </Link>
          )}

          <Link
            href={patientSession ? '/portal/book' : '/login?next=/portal/book'}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 transition-all"
          >
            <CalendarCheck className="h-4 w-4" />
            <span>Book Assessment</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
