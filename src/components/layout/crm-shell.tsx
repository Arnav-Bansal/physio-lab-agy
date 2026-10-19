'use client';

import React, { useState } from 'react';
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
  Plus,
  PanelLeft,
} from 'lucide-react';
import { BrandEmblem } from '@/components/brand/logo';
import { cn } from '@/lib/utils';
import type { CrmSession } from '@/lib/auth/session';
import type { UserRole } from '@/types/database.types';

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
    label: 'Dashboard',
    physioLabel: 'My Dashboard',
    icon: LayoutDashboard,
    exact: true,
    allowedRoles: ['admin', 'staff', 'physio'],
  },
  {
    href: '/crm/schedule',
    label: 'Appointments',
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
    label: 'Patients',
    physioLabel: 'My Patients',
    icon: Users,
    exact: false,
    allowedRoles: ['admin', 'staff', 'physio'],
  },
  {
    href: '/crm/messages',
    label: 'WhatsApp Logs',
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
    label: 'Add Patient',
    icon: Plus,
    allowedRoles: ['admin', 'staff'] as Array<Extract<UserRole, 'admin' | 'staff' | 'physio'>>,
  },
  {
    href: '/crm/schedule?book=1',
    label: 'Create Appointment',
    icon: Calendar,
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
  const [collapsed, setCollapsed] = useState(false);

  if (pathname === '/crm/login' || !session) {
    return <>{children}</>;
  }

  const visibleMainNav = MAIN_NAV.filter((item) => item.allowedRoles.includes(session.role));
  const visibleQuickActions = QUICK_ACTIONS.filter((item) =>
    item.allowedRoles.includes(session.role)
  );

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Light Clinical Sidebar matching physio-lab.lovable.app */}
      <aside
        className={cn(
          'hidden lg:flex shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-200',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Sidebar Header */}
        <div className="border-b border-sidebar-border p-4">
          <Link href="/" className="flex items-center gap-2.5">
            <BrandEmblem className="h-8 w-8" />
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-sidebar-foreground truncate">
                  The Physio Lab
                </span>
                <span className="text-xs text-sidebar-foreground/60 truncate">
                  {session.fullName}
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Sidebar Navigation Groups */}
        <div className="flex-1 overflow-y-auto p-3 space-y-6">
          {/* Main Group */}
          <div>
            {!collapsed && (
              <div className="px-2 pb-1.5 text-xs font-medium text-sidebar-foreground/60">
                Main ({session.role.toUpperCase()})
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
                      'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors',
                      active
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="truncate">{displayLabel}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Actions Group — Admin & Staff (Reception) Only */}
          {visibleQuickActions.length > 0 && (
            <div>
              {!collapsed && (
                <div className="px-2 pb-1.5 text-xs font-medium text-sidebar-foreground/60">
                  Reception Actions
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
                      className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-sidebar-border space-y-1">
          <Link
            href="/crm/login"
            title="Switch Role"
            className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
          >
            <RefreshCw className="h-4 w-4 shrink-0 text-primary" />
            {!collapsed && <span>Switch Role ({session.role})</span>}
          </Link>
          <div className="flex items-center gap-1">
            <Link
              href="/portal"
              title="Patient Portal"
              className="flex-1 flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-sidebar-foreground/75 hover:bg-sidebar-accent/50 transition-colors"
            >
              <UserCheck className="h-3.5 w-3.5 shrink-0" />
              {!collapsed && <span>Portal</span>}
            </Link>
            <Link
              href="/"
              title="Public Website"
              className="flex-1 flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-sidebar-foreground/75 hover:bg-sidebar-accent/50 transition-colors"
            >
              <Globe className="h-3.5 w-3.5 shrink-0" />
              {!collapsed && <span>Website</span>}
            </Link>
            <a
              href="/api/auth/logout?next=/crm/login"
              title="Sign Out"
              className="flex items-center justify-center rounded-md p-1.5 text-xs text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5 shrink-0" />
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content Area matching physio-lab.lovable.app */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        <header className="h-14 flex items-center justify-between border-b border-border bg-background px-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              className="hidden lg:inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted text-muted-foreground transition-colors"
              aria-label="Toggle Sidebar"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-primary">
              Welcome, {session.fullName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground capitalize">
              Role: {session.role}
            </span>
            {session.role !== 'physio' ? (
              <Link
                href="/crm/schedule?book=1"
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Appointment</span>
              </Link>
            ) : (
              <Link
                href="/crm/consultations"
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Stethoscope className="h-3.5 w-3.5" />
                <span>My Consultations</span>
              </Link>
            )}
          </div>
        </header>

        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav
        className={cn(
          'lg:hidden fixed bottom-0 inset-x-0 z-40 bg-background border-t border-border px-2 py-1.5 grid gap-1',
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
                'flex flex-col items-center justify-center py-1.5 rounded-md text-[11px] font-medium',
                active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
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
    </div>
  );
}
