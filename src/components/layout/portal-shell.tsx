'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarPlus,
  ClipboardList,
  FileText,
  Home,
  LogOut,
  PhoneCall,
  UserCheck,
  Globe,
  ShieldCheck,
} from 'lucide-react';
import { BrandLogo } from '@/components/brand/logo';
import { cn, formatPhoneDisplay } from '@/lib/utils';
import type { PatientSession } from '@/lib/auth/session';

const NAV_ITEMS = [
  { href: '/portal', label: 'My Recovery', icon: Home, exact: true },
  { href: '/portal/book', label: 'Book Session', icon: CalendarPlus, exact: false },
  { href: '/portal/history', label: 'Visit History', icon: ClipboardList, exact: false },
  { href: '/portal/prescriptions', label: 'Rx & Charts', icon: FileText, exact: false },
];

export function PortalShell({
  session,
  children,
}: {
  session: PatientSession;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col bg-stone-linen pb-16 md:pb-0">
      {/* Top Portal Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/">
              <BrandLogo compact subtitle="Patient Digital Portal" />
            </Link>

            <nav className="hidden md:flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl border border-border/70">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all',
                      active
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-white/60'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-secondary/70 border border-primary/15 text-xs">
              <UserCheck className="h-3.5 w-3.5 text-primary" />
              <span className="font-bold text-foreground">Welcome, {session.fullName}</span>
              <span className="font-mono text-muted-foreground">
                ({formatPhoneDisplay(session.phone)})
              </span>
            </div>

            <Link
              href="/"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-border bg-white hover:bg-muted/50 transition-colors"
            >
              <Globe className="h-3.5 w-3.5 text-primary" />
              <span>Clinic Website</span>
            </Link>

            <Link
              href="/crm"
              className="hidden xl:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-border bg-white hover:bg-muted/50 transition-colors"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              <span>Staff CRM</span>
            </Link>

            <a
              href="/api/auth/logout?next=/"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10 border border-border bg-white transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {children}
      </main>

      {/* Help Footer Strip */}
      <footer className="hidden md:block border-t border-border bg-white py-4 text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <span>The Physio Lab — Research &amp; Rehabilitation • Barewal Awana, Ludhiana</span>
          <a
            href="tel:+919316196000"
            className="inline-flex items-center gap-2 font-mono font-semibold text-primary hover:underline"
          >
            <PhoneCall className="h-3.5 w-3.5" />
            <span>Reception Desk: +91 93161-96000 / +91 98153-70607</span>
          </a>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-border px-2 py-1.5 grid grid-cols-4 gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center py-1.5 rounded-xl text-[11px] font-semibold transition-colors',
                active ? 'text-white bg-primary shadow-sm' : 'text-muted-foreground'
              )}
            >
              <Icon className="h-4 w-4 mb-0.5" />
              <span>{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
