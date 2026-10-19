import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  Calendar,
  MessageSquare,
  Stethoscope,
  Users,
  Clock,
  User,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { getCrmSession } from '@/lib/auth/session';
import { repositories } from '@/lib/repositories';
import { formatDateIST, formatTimeIST, formatPhoneDisplay } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function CrmDashboardPage() {
  const session = await getCrmSession();
  if (!session) {
    redirect('/crm/login');
  }

  const isPhysio = session.role === 'physio';

  const [allPatients, schedule, consultations, messageLogs] = await Promise.all([
    repositories.patients.searchPatients('', 50).catch(() => []),
    repositories.appointments
      .listSchedule(isPhysio ? { physioId: session.profileId } : undefined)
      .catch(() => []),
    repositories.consultations
      .listConsultations(undefined, isPhysio ? session.profileId : undefined)
      .catch(() => []),
    isPhysio
      ? Promise.resolve([])
      : repositories.messages.listMessageLogs(undefined, 15).catch(() => []),
  ]);

  // For physio role, scope patient list strictly to patients assigned to this physio
  const assignedPatientIds = new Set([
    ...schedule.map((a) => a.patient_id),
    ...consultations.map((c) => c.patient_id),
  ]);
  const patients = isPhysio
    ? allPatients.filter((p) => assignedPatientIds.has(p.id))
    : allPatients;

  const scheduledCount = schedule.filter((a) => a.status === 'scheduled').length;
  const completedCount = schedule.filter((a) => a.status === 'completed').length;

  const stats = isPhysio
    ? [
        {
          title: 'My Scheduled Visits',
          value: scheduledCount,
          description: `${completedCount} completed sessions`,
          icon: Calendar,
          color: 'text-primary',
          href: '/crm/schedule',
        },
        {
          title: 'My Consultations & Rx',
          value: consultations.length,
          description: 'Clinical notes & prescriptions',
          icon: Stethoscope,
          color: 'text-emerald-600',
          href: '/crm/consultations',
        },
        {
          title: 'My Assigned Patients',
          value: patients.length,
          description: 'Patients under your care',
          icon: Users,
          color: 'text-sky-600',
          href: '/crm/patients',
        },
      ]
    : [
        {
          title: 'Scheduled Visits',
          value: scheduledCount,
          description: `${completedCount} completed sessions`,
          icon: Calendar,
          color: 'text-primary',
          href: '/crm/schedule',
        },
        {
          title: 'Total Patients',
          value: patients.length,
          description: 'Registered patient profiles',
          icon: Users,
          color: 'text-sky-600',
          href: '/crm/patients',
        },
        {
          title: 'Consultations & Rx',
          value: consultations.length,
          description: 'Clinical notes & prescriptions',
          icon: Stethoscope,
          color: 'text-emerald-600',
          href: '/crm/consultations',
        },
        {
          title: 'WhatsApp Messages',
          value: messageLogs.length,
          description: 'Confirmations & 24h/2h reminders',
          icon: MessageSquare,
          color: 'text-amber-600',
          href: '/crm/messages',
        },
      ];

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'no_show':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="flex-1 space-y-6">
      {/* Header matching physio-lab.lovable.app */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Welcome, {session.fullName}
          </h1>
          <p className="text-muted-foreground">
            {isPhysio
              ? 'Viewing your personal clinical schedule, consultations, and assigned patients.'
              : session.role === 'staff'
              ? 'Reception Desk — Manage clinic bookings, patient profiles, and WhatsApp communication.'
              : 'Admin Overview — Full multi-clinic schedule, patients, consultations, and system settings.'}
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground self-start">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          <span>
            RBAC Scope:{' '}
            <strong className="text-foreground uppercase">{session.role}</strong>
            {isPhysio ? ' (Assigned Records Only)' : session.role === 'staff' ? ' (No Admin Settings)' : ' (Full Control)'}
          </span>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div
        className={`grid gap-4 md:grid-cols-2 ${
          isPhysio ? 'lg:grid-cols-3' : 'lg:grid-cols-4'
        }`}
      >
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              href={item.href}
              className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-shadow block"
            >
              <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
                <h3 className="text-sm font-medium tracking-tight">{item.title}</h3>
                <Icon className={`h-4 w-4 ${item.color}`} />
              </div>
              <div className="p-6 pt-0">
                <div className="text-2xl font-bold">{item.value}</div>
                <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 2-Column Main Content */}
      <div className="grid gap-6 md:grid-cols-2 items-start">
        {/* Left Card: Upcoming Appointments */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold leading-none tracking-tight">
                {isPhysio ? 'My Assigned Appointments' : 'Upcoming Appointments'}
              </h3>
              <Link
                href="/crm/schedule"
                className="text-sm text-primary hover:underline font-medium"
              >
                View Calendar
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              {isPhysio
                ? `Appointments assigned to ${session.fullName}`
                : 'View and manage scheduled patient sessions'}
            </p>
          </div>
          <div className="p-6 pt-0">
            {schedule.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No appointments scheduled
              </div>
            ) : (
              <div className="space-y-4">
                {schedule.slice(0, 5).map((appt) => (
                  <div key={appt.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <Link
                            href={`/crm/patients/${appt.patient_id}`}
                            className="font-medium hover:text-primary"
                          >
                            {appt.patient?.full_name || 'Patient'}
                          </Link>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {formatDateIST(appt.start_time)} • {formatTimeIST(appt.start_time)} (
                            {appt.manual_duration_mins}m)
                          </span>
                        </div>
                        {appt.physio?.full_name && (
                          <div className="flex items-center gap-2">
                            <Stethoscope className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {appt.physio.full_name}
                            </span>
                          </div>
                        )}
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${getStatusBadgeClass(
                          appt.status
                        )}`}
                      >
                        {appt.status.replace('_', ' ')}
                      </span>
                    </div>

                    {appt.chief_complaint && (
                      <div className="text-sm text-muted-foreground border-t pt-2">
                        <strong className="text-foreground font-medium">Notes:</strong>{' '}
                        {appt.chief_complaint}
                      </div>
                    )}

                    <div className="pt-2 flex items-center gap-2">
                      <Link
                        href={`/crm/consultations?appointmentId=${appt.id}`}
                        className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        {isPhysio ? 'Add Consultation Notes & Rx' : 'Open Consultation'}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Card: Patients */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold leading-none tracking-tight">
                {isPhysio ? 'My Assigned Patients' : 'Recent Patients'}
              </h3>
              <Link
                href="/crm/patients"
                className="text-sm text-primary hover:underline font-medium"
              >
                All Patients
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              {isPhysio
                ? 'View clinical history and prescriptions for your patients'
                : 'Quickly book visits or view patient clinical history'}
            </p>
          </div>
          <div className="p-6 pt-0">
            <div className="space-y-4">
              {patients.slice(0, 5).map((patient) => (
                <div
                  key={patient.id}
                  className="border rounded-lg p-4 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <Link
                      href={`/crm/patients/${patient.id}`}
                      className="font-medium text-primary hover:underline block truncate"
                    >
                      {patient.full_name}
                    </Link>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{formatPhoneDisplay(patient.phone)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!isPhysio && (
                      <Link
                        href={`/crm/schedule?book=1&patientId=${patient.id}`}
                        className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                      >
                        Book Visit
                      </Link>
                    )}
                    <Link
                      href={`/crm/patients/${patient.id}`}
                      className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      Clinical History
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
