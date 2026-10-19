'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  Plus,
  PanelLeft,
  Search,
  Command,
  ArrowRight,
  Phone,
  X,
  Loader2,
  CalendarPlus,
} from 'lucide-react';
import { BrandEmblem } from '@/components/brand/logo';
import { cn, formatPhoneDisplay } from '@/lib/utils';
import type { CrmSession } from '@/lib/auth/session';
import type { PatientRecord, UserRole } from '@/types/database.types';

interface NavItem {
  href: string;
  label: string;
  physioLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  exact: boolean;
  allowedRoles: Array<Extract<UserRole, 'admin' | 'staff' | 'physio'>>;
}

const MAIN_NAV: NavItem[] = [
  {
    href: '/crm',
    label: 'Clinic Cockpit',
    physioLabel: 'My Cockpit',
    icon: LayoutDashboard,
    exact: true,
    allowedRoles: ['admin', 'staff', 'physio'],
  },
  {
    href: '/crm/schedule',
    label: 'Schedule & Calendar',
    physioLabel: 'My Schedule',
    icon: Calendar,
    exact: false,
    allowedRoles: ['admin', 'staff', 'physio'],
  },
  {
    href: '/crm/consultations',
    label: 'Consultations & Rx',
    physioLabel: 'My Consultations & Rx',
    icon: Stethoscope,
    exact: false,
    allowedRoles: ['admin', 'staff', 'physio'],
  },
  {
    href: '/crm/patients',
    label: 'Patient Directory',
    physioLabel: 'My Patients',
    icon: Users,
    exact: false,
    allowedRoles: ['admin', 'staff', 'physio'],
  },
  {
    href: '/crm/messages',
    label: 'WhatsApp Hub',
    icon: MessageSquare,
    exact: false,
    allowedRoles: ['admin', 'staff'],
  },
  {
    href: '/crm/admin',
    label: 'Admin Settings',
    icon: Settings,
    exact: false,
    allowedRoles: ['admin'],
  },
];

const QUICK_ACTIONS = [
  {
    href: '/crm/patients?new=1',
    label: 'Register Patient',
    icon: Plus,
    allowedRoles: ['admin', 'staff'] as Array<Extract<UserRole, 'admin' | 'staff' | 'physio'>>,
  },
  {
    href: '/crm/schedule?book=1',
    label: 'Book Appointment',
    icon: CalendarPlus,
    allowedRoles: ['admin', 'staff'] as Array<Extract<UserRole, 'admin' | 'staff' | 'physio'>>,
  },
];

export function CrmShell({
  session,
  children,
}: {
  session: CrmSession | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  // Global Cmd+K Command Palette State
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState('');
  const [cmdPatients, setCmdPatients] = useState<PatientRecord[]>([]);
  const [cmdLoading, setCmdLoading] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setCmdOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!cmdOpen) return;
    const timer = setTimeout(async () => {
      setCmdLoading(true);
      try {
        const res = await fetch(`/api/crm/patients?q=${encodeURIComponent(cmdQuery)}`);
        const data = await res.json();
        if (res.ok && Array.isArray(data.patients)) {
          setCmdPatients(data.patients.slice(0, 6));
        }
      } finally {
        setCmdLoading(false);
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [cmdOpen, cmdQuery]);

  if (pathname === '/crm/login' || !session) {
    return <>{children}</>;
  }

  const visibleMainNav = MAIN_NAV.filter((item) => item.allowedRoles.includes(session.role));
  const visibleQuickActions = QUICK_ACTIONS.filter((item) =>
    item.allowedRoles.includes(session.role)
  );

  return (
    <div className="min-h-screen flex w-full bg-stone-linen">
      {/* Architectural Clinical Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex shrink-0 flex-col bg-[#141E1E] text-white border-r border-white/10 transition-all duration-200',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Sidebar Header */}
        <div className="h-16 border-b border-white/10 px-4 flex items-center">
          <Link href="/crm" className="flex items-center gap-3 min-w-0">
            <BrandEmblem className="h-8 w-8" />
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold tracking-tight text-white truncate">
                  The Physio Lab
                </span>
                <span className="text-[11px] text-[#2DD4BF] font-medium truncate">
                  Barewal Awana CRM
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Sidebar Navigation Groups */}
        <div className="flex-1 overflow-y-auto p-3 space-y-6">
          {/* Workspace Group */}
          <div>
            {!collapsed && (
              <div className="px-2.5 pb-2 text-[10px] font-bold uppercase tracking-widest text-white/45">
                Workspace • {session.role}
              </div>
            )}
            <nav className="space-y-1">
              {visibleMainNav.map((item) => {
                const Icon = item.icon;
                const active = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                const displayLabel =
                  session.role === 'physio' && item.physioLabel ? item.physioLabel : item.label;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={displayLabel}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs sm:text-sm transition-all',
                      active
                        ? 'bg-primary text-white font-semibold shadow-sm shadow-primary/30'
                        : 'text-white/75 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="truncate">{displayLabel}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Reception Quick Actions */}
          {visibleQuickActions.length > 0 && (
            <div>
              {!collapsed && (
                <div className="px-2.5 pb-2 text-[10px] font-bold uppercase tracking-widest text-white/45">
                  Front Desk Shortcuts
                </div>
              )}
              <nav className="space-y-1">
                {visibleQuickActions.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      title={item.label}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-[#5EEAD4] bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}
        </div>

        {/* Sidebar Footer: Profile & Role Switcher */}
        <div className="p-3 border-t border-white/10 space-y-2 bg-black/20">
          {!collapsed && (
            <div className="px-2.5 py-1.5">
              <p className="text-xs font-bold text-white truncate">{session.fullName}</p>
              <p className="text-[11px] text-white/55 truncate">{session.email}</p>
            </div>
          )}
          <Link
            href="/crm/login"
            title="Switch Staff/Doctor Role"
            className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-white bg-white/10 hover:bg-white/15 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5 shrink-0 text-[#2DD4BF]" />
            {!collapsed && <span>Switch Profile ({session.role})</span>}
          </Link>
          <div className="flex items-center gap-1 pt-0.5">
            <Link
              href="/portal"
              title="Patient Portal"
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            >
              <UserCheck className="h-3.5 w-3.5 shrink-0" />
              {!collapsed && <span>Portal</span>}
            </Link>
            <Link
              href="/"
              title="Public Website"
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Globe className="h-3.5 w-3.5 shrink-0" />
              {!collapsed && <span>Website</span>}
            </Link>
            <a
              href="/api/auth/logout?next=/crm/login"
              title="Sign Out"
              className="flex items-center justify-center rounded-lg p-1.5 text-xs text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5 shrink-0" />
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        {/* Top Command Header Bar */}
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between gap-4 border-b border-border bg-white/95 backdrop-blur-md px-4 sm:px-6">
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              className="hidden lg:inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border hover:bg-muted text-muted-foreground transition-colors shrink-0"
              aria-label="Toggle Sidebar"
            >
              <PanelLeft className="h-4 w-4" />
            </button>

            {/* Instant Global Search Trigger (Cmd+K) */}
            <button
              type="button"
              onClick={() => setCmdOpen(true)}
              className="w-full max-w-md flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-muted/60 hover:bg-muted border border-border text-xs text-muted-foreground transition-all"
            >
              <span className="flex items-center gap-2 truncate">
                <Search className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="truncate">
                  Quick search patients by name or phone...
                </span>
              </span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-white border border-border font-mono text-[10px] font-semibold text-foreground shrink-0">
                <Command className="h-2.5 w-2.5" />K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/crm/login"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-1.5 text-xs font-bold text-secondary-foreground border border-primary/15 hover:bg-accent transition-colors"
            >
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span>Welcome, {session.fullName}</span>
              <span className="uppercase text-[10px] font-mono opacity-75">({session.role})</span>
            </Link>

            {session.role !== 'physio' ? (
              <Link
                href="/crm/schedule?book=1"
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Book Slot</span>
              </Link>
            ) : (
              <Link
                href="/crm/consultations"
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
              >
                <Stethoscope className="h-3.5 w-3.5" />
                <span>Open Charts</span>
              </Link>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav
        className={cn(
          'lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-border px-2 py-1.5 grid gap-1',
          visibleMainNav.length === 4
            ? 'grid-cols-4'
            : visibleMainNav.length === 5
            ? 'grid-cols-5'
            : 'grid-cols-6'
        )}
      >
        {visibleMainNav.map((item) => {
          const Icon = item.icon;
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const displayLabel =
            session.role === 'physio' && item.physioLabel ? item.physioLabel : item.label;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-semibold',
                active ? 'bg-primary text-white' : 'text-muted-foreground'
              )}
            >
              <Icon className="h-4 w-4 mb-0.5" />
              <span className="truncate max-w-full px-0.5">
                {displayLabel.replace('My ', '').split(' ')[0]}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* ====================================================================
          GLOBAL CMD+K PATIENT & WORKSPACE COMMAND PALETTE
      ==================================================================== */}
      {cmdOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 p-4"
          onClick={() => setCmdOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-xl w-full border border-border shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border flex items-center gap-3">
              <Search className="h-4 w-4 text-primary shrink-0" />
              <input
                type="text"
                autoFocus
                value={cmdQuery}
                onChange={(e) => setCmdQuery(e.target.value)}
                placeholder="Search patient by name or phone (+91...), or jump to a module..."
                className="flex-1 text-sm font-medium text-foreground bg-transparent focus:outline-none"
              />
              {cmdLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
              <button
                type="button"
                onClick={() => setCmdOpen(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto p-3 space-y-4">
              {/* Patient Search Results */}
              <div>
                <div className="px-2.5 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Matching Patients ({cmdPatients.length})
                </div>
                {cmdPatients.length === 0 ? (
                  <p className="text-xs text-muted-foreground px-2.5 py-3">
                    No matching patients found.
                  </p>
                ) : (
                  <div className="space-y-1">
                    {cmdPatients.map((pt) => (
                      <div
                        key={pt.id}
                        className="p-2.5 rounded-xl hover:bg-muted/70 flex items-center justify-between gap-3 transition-colors"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setCmdOpen(false);
                            router.push(`/crm/patients/${pt.id}`);
                          }}
                          className="flex-1 text-left min-w-0"
                        >
                          <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                            {pt.full_name}
                          </p>
                          <p className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3 text-primary" />
                            <span>{formatPhoneDisplay(pt.phone)}</span>
                          </p>
                        </button>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {session.role !== 'physio' && (
                            <button
                              type="button"
                              onClick={() => {
                                setCmdOpen(false);
                                router.push(`/crm/schedule?book=1&patientId=${pt.id}`);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-primary text-white text-[11px] font-semibold"
                            >
                              Book Slot
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setCmdOpen(false);
                              router.push(`/crm/patients/${pt.id}`);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-secondary text-secondary-foreground text-[11px] font-semibold inline-flex items-center gap-1"
                          >
                            <span>History</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Navigation */}
              <div className="border-t border-border pt-3">
                <div className="px-2.5 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Quick Navigation
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {visibleMainNav.map((nav) => {
                    const Icon = nav.icon;
                    return (
                      <button
                        key={nav.href}
                        type="button"
                        onClick={() => {
                          setCmdOpen(false);
                          router.push(nav.href);
                        }}
                        className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-muted text-xs font-semibold text-foreground text-left"
                      >
                        <Icon className="h-4 w-4 text-primary shrink-0" />
                        <span>{nav.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
