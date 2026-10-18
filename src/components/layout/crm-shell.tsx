'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Calendar,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Stethoscope,
  Users,
  LogOut,
  Globe,
  RefreshCw,
  UserCheck,
} from 'lucide-react';
import { BrandLogo } from '@/components/brand/logo';
import { cn } from '@/lib/utils';
import type { CrmSession } from '@/lib/auth/session';

const CRM_NAV = [
  { href: '/crm', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/crm/schedule', label: 'Schedule & Calendar', icon: Calendar, exact: false },
  { href: '/crm/patients', label: 'Patients & History', icon: Users, exact: false },
  { href: '/crm/consultations', label: 'Consultations & Rx', icon: Stethoscope, exact: false },
  { href: '/crm/messages', label: 'WhatsApp & Retries', icon: MessageSquare, exact: false },
  { href: '/crm/admin', label: 'Admin Controls', icon: Settings, exact: false, adminOnly: false },
];

export function CrmShell({
  session,
  children,
}: {
  session: CrmSession | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Render standalone login view when at /crm/login or unauthenticated
  if (pathname === '/crm/login' || !session) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex bg-stone-linen">
      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex w-72 shrink-0 flex-col bg-[#141413] text-white border-r border-white/10">
        <div className="p-6 border-b border-white/10">
          <Link href="/">
            <BrandLogo variant="light" compact />
          </Link>
          <div className="mt-4 flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 border border-white/10">
            <div className="min-w-0">
              <p className="text-xs font-extrabold text-white truncate">{session.fullName}</p>
              <p className="text-[11px] text-white/60 truncate">{session.email}</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#00858E] text-white shrink-0">
              {session.role}
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5">
          {CRM_NAV.map((item) => {
            const Icon = item.icon;
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all',
                  active
                    ? 'bg-[#00858E] text-white shadow-md shadow-[#00858E]/25'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                )}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </span>
                {item.href === '/crm/admin' && (
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-white/10 text-[#5EEAD4]">
                    Admin
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            href="/crm/login"
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-white transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5 text-[#5EEAD4]" />
            <span>Switch Role (Admin / Staff / Physio)</span>
          </Link>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/portal"
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-white/80"
            >
              <UserCheck className="h-3.5 w-3.5 text-[#5EEAD4]" />
              <span>Portal</span>
            </Link>
            <Link
              href="/"
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-white/80"
            >
              <Globe className="h-3.5 w-3.5 text-[#5EEAD4]" />
              <span>Website</span>
            </Link>
          </div>

          <a
            href="/api/auth/logout?next=/crm/login"
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">
        {/* Top Operational Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#D6CFC2] px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="lg:hidden">
              <Link href="/">
                <BrandLogo compact showTagline={false} />
              </Link>
            </div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#00858E] bg-[#DCE8E6] px-3 py-1 rounded-full">
              The Physio Lab CRM • {session.role.toUpperCase()}
            </span>
            <span className="hidden md:inline text-xs font-semibold text-[#141413]/70">
              {session.specialization || 'Barewal Awana Flagship Centre'}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/crm/schedule?book=1"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold bg-[#00858E] hover:bg-[#006D75] text-white shadow-sm transition-colors"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>+ New Booking</span>
            </Link>
            <Link
              href="/crm/login"
              className="lg:hidden inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-[#F5F2EB] border border-[#D6CFC2]"
            >
              <RefreshCw className="h-3.5 w-3.5 text-[#00858E]" />
              <span>Role</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#141413] text-white border-t border-white/10 px-2 py-1.5 grid grid-cols-6 gap-1">
        {CRM_NAV.map((item) => {
          const Icon = item.icon;
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center py-1.5 rounded-lg text-[10px] font-bold',
                active ? 'bg-[#00858E] text-white' : 'text-white/65'
              )}
            >
              <Icon className="h-4 w-4 mb-0.5" />
              <span className="truncate max-w-full px-0.5">{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
