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
    <div className="min-h-screen flex flex-col bg-background pb-16 md:pb-0">
      {/* Top Portal Header matching physio-lab.lovable.app */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/">
              <BrandLogo compact />
            </Link>

            <nav className="hidden md:flex items-center gap-1">
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
                      'inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors',
                      active
                        ? 'bg-secondary text-secondary-foreground font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
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
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted text-xs">
              <UserCheck className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium text-foreground">{session.fullName}</span>
              <span className="text-muted-foreground">({formatPhoneDisplay(session.phone)})</span>
            </div>

            <Link
              href="/"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-input bg-card hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Globe className="h-3.5 w-3.5 text-primary" />
              <span>Website</span>
            </Link>

            <a
              href="/api/auth/logout?next=/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-destructive hover:bg-destructive/10 border border-border transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Container matching physio-lab.lovable.app p-6 space-y-6 */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {children}
      </main>

      {/* Help Footer Strip */}
      <footer className="hidden md:block border-t border-border bg-sidebar py-4 text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <span>The Physio Lab — Research &amp; Rehabilitation • Barewal Awana, Ludhiana</span>
          <span className="inline-flex items-center gap-2 font-medium text-primary">
            <PhoneCall className="h-3.5 w-3.5" />
            Reception: +91 93161-96000 / +91 98153-70607
          </span>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-background border-t border-border px-2 py-1.5 grid grid-cols-4 gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center py-1.5 rounded-md text-[11px] font-medium transition-colors',
                active ? 'text-primary bg-secondary' : 'text-muted-foreground'
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
