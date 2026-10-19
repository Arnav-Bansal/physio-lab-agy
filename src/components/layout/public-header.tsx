import React from 'react';
import Link from 'next/link';
import { CalendarCheck, UserCheck, ShieldCheck, Phone } from 'lucide-react';
import { BrandLogo } from '@/components/brand/logo';
import { getPatientSession } from '@/lib/auth/session';

export async function PublicHeader() {
  const patientSession = await getPatientSession();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="focus:outline-none">
          <BrandLogo />
        </Link>

        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#pillars" className="hover:text-primary transition-colors">
            Clinical Pillars
          </a>
          <a href="#facility" className="hover:text-primary transition-colors">
            Facility Tour
          </a>
          <a href="#specialists" className="hover:text-primary transition-colors">
            Specialists
          </a>
          <a href="#location" className="hover:text-primary transition-colors">
            Location &amp; Contact
          </a>
        </nav>

        <div className="flex items-center gap-2.5">
          <a
            href="tel:+919316196000"
            className="hidden xl:inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary mr-2"
          >
            <Phone className="h-3.5 w-3.5 text-primary" />
            <span>93161-96000</span>
          </a>

          <Link
            href="/crm"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium text-foreground hover:bg-accent hover:text-accent-foreground border border-input transition-colors"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>Clinic CRM</span>
          </Link>

          {patientSession ? (
            <Link
              href="/portal"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-sm font-medium bg-secondary text-secondary-foreground hover:bg-accent transition-colors"
            >
              <UserCheck className="h-4 w-4" />
              <span>My Portal ({patientSession.fullName.split(' ')[0]})</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-sm font-medium text-foreground bg-card border border-input hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <UserCheck className="h-4 w-4 text-primary" />
              <span>Patient Login</span>
            </Link>
          )}

          <Link
            href={patientSession ? '/portal/book' : '/login?next=/portal/book'}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-colors"
          >
            <CalendarCheck className="h-4 w-4" />
            <span>Book Appointment</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
