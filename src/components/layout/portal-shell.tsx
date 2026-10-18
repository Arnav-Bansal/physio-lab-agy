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
} from 'lucide-react';
import { BrandLogo } from '@/components/brand/logo';
import { cn, formatPhoneDisplay } from '@/lib/utils';
import type { PatientSession } from '@/lib/auth/session';

const NAV_ITEMS = [
  { href: '/portal', label: 'Dashboard', icon: Home, exact: true },
  { href: '/portal/book', label: 'Book Appointment', icon: CalendarPlus, exact: false },
  { href: '/portal/history', label: 'Consultations', icon: ClipboardList, exact: false },
  { href: '/portal/prescriptions', label: 'Prescriptions', icon: FileText, exact: false },
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
    <div className="min-h-screen flex flex-col bg-stone-linen pb-20 md:pb-0">
      {/* Top Portal Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#D6CFC2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/">
              <BrandLogo compact />
            </Link>

            <nav className="hidden md:flex items-center gap-1.5">
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
                      'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all',
                      active
                        ? 'bg-[#00858E] text-white shadow-sm'
                        : 'text-[#141413]/75 hover:text-[#00858E] hover:bg-[#F5F2EB]'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-[#F5F2EB] border border-[#D6CFC2]">
              <UserCheck className="h-4 w-4 text-[#00858E]" />
              <div className="text-xs leading-tight">
                <p className="font-bold text-[#141413]">{session.fullName}</p>
                <p className="text-[11px] text-[#141413]/65">{formatPhoneDisplay(session.phone)}</p>
              </div>
            </div>

            <Link
              href="/"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#141413]/75 hover:bg-[#F5F2EB] border border-[#D6CFC2]"
            >
              <Globe className="h-3.5 w-3.5 text-[#00858E]" />
              <span>Clinic Website</span>
            </Link>

            <a
              href="/api/auth/logout?next=/"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Help Footer Strip */}
      <footer className="hidden md:block border-t border-[#D6CFC2] bg-white/70 py-4 text-xs text-[#141413]/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <span>The Physio Lab — Research &amp; Rehabilitation • Barewal Awana, Ludhiana</span>
          <span className="inline-flex items-center gap-2 font-semibold text-[#00858E]">
            <PhoneCall className="h-3.5 w-3.5" />
            Reception Desk: +91 93161-96000 / +91 98153-70607
          </span>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-[#D6CFC2] px-2 py-1.5 grid grid-cols-4 gap-1 shadow-lg">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center py-2 rounded-xl text-[11px] font-bold transition-colors',
                active ? 'text-[#00858E] bg-[#DCE8E6]/60' : 'text-[#141413]/65'
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
