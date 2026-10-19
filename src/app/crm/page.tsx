import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  Calendar,
  MessageSquare,
  Stethoscope,
  Users,
  Clock,
  Phone,
  CalendarPlus,
  UserPlus,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building2,
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

  const [allPatients, schedule, consultations, messageLogs, physios] = await Promise.all([
    repositories.patients.searchPatients('', 50).catch(() => []),
    repositories.appointments
      .listSchedule(isPhysio ? { physioId: session.profileId } : undefined)
      .catch(() => []),
    repositories.consultations
      .listConsultations(undefined, isPhysio ? session.profileId : undefined)
      .catch(() => []),
    isPhysio
      ? Promise.resolve([])
      : repositories.messages.listMessageLogs(undefined, 20).catch(() => []),
    repositories.profiles.listActivePhysios().catch(() => []),
  ]);

  const assignedPatientIds = new Set([
    ...schedule.map((a) => a.patient_id),
    ...consultations.map((c) => c.patient_id),
  ]);
  const patients = isPhysio
    ? allPatients.filter((p) => assignedPatientIds.has(p.id))
    : allPatients;

  const scheduledAppointments = schedule.filter((a) => a.status === 'scheduled');
  const completedAppointments = schedule.filter((a) => a.status === 'completed');
  const unassignedCount = scheduledAppointments.filter((a) => !a.physio_id).length;

  const stats = isPhysio
    ? [
        {
          title: 'Active Scheduled Visits',
          value: scheduledAppointments.length,
          badge: `${completedAppointments.length} Completed`,
          icon: Calendar,
          href: '/crm/schedule',
        },
        {
          title: 'Clinical Consultations & Rx',
          value: consultations.length,
          badge: 'SOAP Charts & PDFs',
          icon: Stethoscope,
          href: '/crm/consultations',
        },
        {
          title: 'My Assigned Patients',
          value: patients.length,
          badge: 'Longitudinal Care',
          icon: Users,
          href: '/crm/patients',
        },
      ]
    : [
        {
          title: 'Scheduled Sessions',
          value: scheduledAppointments.length,
          badge: `${completedAppointments.length} Completed`,
          icon: Calendar,
          href: '/crm/schedule',
        },
        {
          title: 'Registered Patients',
          value: patients.length,
          badge: 'Active Directory',
          icon: Users,
          href: '/crm/patients',
        },
        {
          title: 'Consultations & Prescriptions',
          value: consultations.length,
          badge: 'Clinical Records',
          icon: Stethoscope,
          href: '/crm/consultations',
        },
        {
          title: 'WhatsApp Lifecycle Queue',
          value: messageLogs.length,
          badge: '24h & 2h Alerts',
          icon: MessageSquare,
          href: '/crm/messages',
        },
      ];

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'no_show':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-secondary text-secondary-foreground border-primary/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* ====================================================================
          1. CLINICAL COCKPIT HEADER & QUICK ACTION BAR
      ==================================================================== */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-border shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary bg-secondary px-2.5 py-0.5 rounded-md">
              <Building2 className="h-3.5 w-3.5" />
              <span>The Physio Lab — Barewal Awana</span>
            </span>
            <span className="text-xs font-mono text-muted-foreground">
              • {formatDateIST(new Date())}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground pt-1">
            Welcome, {session.fullName}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {isPhysio
              ? 'Doctor Workspace • Manage your daily patient schedule, record SOAP clinical notes, and upload exercise prescriptions.'
              : session.role === 'staff'
              ? 'Front Desk Cockpit • Coordinate multi-physio scheduling, patient check-ins, and automated WhatsApp lifecycle notifications.'
              : 'Multi-Clinic Command Centre • Full clinical, scheduling, and administrative oversight across The Physio Lab.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {!isPhysio && (
            <>
              <Link
                href="/crm/schedule?book=1"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-sm transition-colors"
              >
                <CalendarPlus className="h-4 w-4" />
                <span>+ New Appointment</span>
              </Link>
              <Link
                href="/crm/patients?new=1"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary hover:bg-accent text-secondary-foreground text-xs font-bold border border-primary/15 transition-colors"
              >
                <UserPlus className="h-4 w-4 text-primary" />
                <span>+ Register Patient</span>
              </Link>
            </>
          )}
          <Link
            href="/crm/consultations"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted/70 hover:bg-muted text-foreground text-xs font-bold border border-border transition-colors"
          >
            <Stethoscope className="h-4 w-4 text-primary" />
            <span>Consultations &amp; Rx</span>
          </Link>
        </div>
      </div>

      {/* Unassigned Triage Banner (if any patient self-booked with "Any Specialist") */}
      {!isPhysio && unassignedCount > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-amber-900 font-semibold">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              <strong>{unassignedCount} upcoming appointment(s)</strong> are currently in the
              Clinic Triage Queue awaiting specialist assignment.
            </span>
          </div>
          <Link
            href="/crm/schedule"
            className="inline-flex items-center gap-1 font-bold text-amber-900 hover:underline shrink-0"
          >
            <span>Open Schedule Grid</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* ====================================================================
          2. KPI METRICS STRIP
      ==================================================================== */}
      <div
        className={`grid gap-4 sm:grid-cols-2 ${
          isPhysio ? 'lg:grid-cols-3' : 'lg:grid-cols-4'
        }`}
      >
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              href={item.href}
              className="group rounded-2xl border border-border bg-white p-5 shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {item.title}
                </span>
                <div className="h-9 w-9 rounded-xl bg-secondary text-primary group-hover:bg-primary group-hover:text-white transition-colors flex items-center justify-center">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-3xl font-bold font-mono text-foreground">{item.value}</span>
                <span className="text-[11px] font-semibold text-primary bg-secondary/70 px-2.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ====================================================================
          3. LIVE PATIENT FLOW QUEUE + SPECIALIST ROSTER & PATIENT DIRECTORY
      ==================================================================== */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left 7 Cols: Live Patient Appointment Queue */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                Live Operational Queue
              </span>
              <h2 className="text-xl font-bold text-foreground">
                {isPhysio ? 'My Patient Queue' : 'Upcoming & Recent Sessions'}
              </h2>
            </div>
            <Link
              href="/crm/schedule"
              className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
            >
              <span>Full Multi-Physio Calendar</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-border/70">
            {schedule.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                No appointments scheduled yet.
              </div>
            ) : (
              schedule.slice(0, 6).map((appt) => {
                const initials = (appt.patient?.full_name || 'PT')
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2);

                return (
                  <div
                    key={appt.id}
                    className="p-5 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-secondary text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {initials}
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/crm/patients/${appt.patient_id}`}
                            className="text-sm font-bold text-foreground hover:text-primary truncate"
                          >
                            {appt.patient?.full_name || 'Patient'}
                          </Link>
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${getStatusBadgeClass(
                              appt.status
                            )}`}
                          >
                            {appt.status.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          <span className="font-mono font-semibold text-foreground inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-primary" />
                            {formatDateIST(appt.start_time)} • {formatTimeIST(appt.start_time)} (
                            {appt.manual_duration_mins}m)
                          </span>
                          <span className="text-primary font-semibold">
                            • {appt.physio?.full_name || 'Unassigned Triage'}
                          </span>
                        </div>

                        {appt.chief_complaint && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            <strong className="text-foreground/80">Chief Complaint:</strong>{' '}
                            {appt.chief_complaint}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/crm/consultations?appointmentId=${appt.id}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-primary hover:bg-primary/90 text-white px-3.5 py-2 text-xs font-semibold shadow-sm transition-colors"
                      >
                        <Stethoscope className="h-3.5 w-3.5" />
                        <span>{appt.status === 'completed' ? 'View Chart' : 'Open Chart'}</span>
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 5 Cols: Specialist Roster & Quick Patient Directory */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Physiotherapist Floor Roster */}
          {!isPhysio && (
            <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                    Clinical Floor Roster
                  </span>
                  <h3 className="text-lg font-bold text-foreground">
                    Active Specialists ({physios.length})
                  </h3>
                </div>
                <Link
                  href="/crm/schedule"
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Resource View →
                </Link>
              </div>

              <div className="space-y-2.5">
                {physios.map((doc) => {
                  const docCount = scheduledAppointments.filter(
                    (a) => a.physio_id === doc.id
                  ).length;
                  return (
                    <div
                      key={doc.id}
                      className="p-3 rounded-xl bg-muted/40 border border-border flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className="h-3 w-3 rounded-full shrink-0"
                          style={{ backgroundColor: doc.calendar_color || '#00858E' }}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">
                            {doc.full_name}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {doc.specialization || 'Consultant Physiotherapist'}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-white border border-border text-primary shrink-0">
                        {docCount} Active
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Patient Lookup Card */}
          <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  Patient Records
                </span>
                <h3 className="text-lg font-bold text-foreground">
                  {isPhysio ? 'My Assigned Patients' : 'Recent Patient Profiles'}
                </h3>
              </div>
              <Link
                href="/crm/patients"
                className="text-xs font-bold text-primary hover:underline"
              >
                Directory ({patients.length}) →
              </Link>
            </div>

            <div className="space-y-2.5">
              {patients.slice(0, 5).map((patient) => (
                <div
                  key={patient.id}
                  className="p-3.5 rounded-xl bg-muted/40 border border-border flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/crm/patients/${patient.id}`}
                      className="text-xs sm:text-sm font-bold text-foreground hover:text-primary block truncate"
                    >
                      {patient.full_name}
                    </Link>
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground mt-0.5">
                      <Phone className="h-3 w-3 text-primary" />
                      <span>{formatPhoneDisplay(patient.phone)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {!isPhysio && (
                      <Link
                        href={`/crm/schedule?book=1&patientId=${patient.id}`}
                        className="px-2.5 py-1.5 rounded-lg bg-primary text-white text-[11px] font-semibold hover:bg-primary/90 transition-colors"
                      >
                        Book
                      </Link>
                    )}
                    <Link
                      href={`/crm/patients/${patient.id}`}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-border text-foreground text-[11px] font-semibold hover:bg-secondary transition-colors"
                    >
                      History
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
