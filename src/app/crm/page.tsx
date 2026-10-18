import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  Calendar,
  CheckCircle2,
  ClipboardList,
  MessageSquare,
  Settings,
  Stethoscope,
  Users,
  ArrowRight,
  Clock,
  Phone,
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

  const [patients, schedule, consultations, messageLogs, clinics, physios] = await Promise.all([
    repositories.patients.searchPatients('', 25).catch(() => []),
    repositories.appointments.listSchedule().catch(() => []),
    repositories.consultations.listConsultations().catch(() => []),
    repositories.messages.listMessageLogs(undefined, 15).catch(() => []),
    repositories.clinics.listAllClinics().catch(() => []),
    repositories.profiles.listActivePhysios().catch(() => []),
  ]);

  const scheduledCount = schedule.filter((a) => a.status === 'scheduled').length;
  const completedCount = schedule.filter((a) => a.status === 'completed').length;

  return (
    <div className="space-y-8">
      {/* Top Welcome & Quick Actions Banner */}
      <div className="bg-gradient-to-r from-[#00858E] to-[#006D75] rounded-3xl p-7 sm:p-8 text-white shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest bg-white/15 px-3 py-1 rounded-full">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#5EEAD4]" />
            Unified Multi-Clinic CRM • Role: {session.role.toUpperCase()}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            {session.fullName}
          </h1>
          <p className="text-sm text-white/85">
            {clinics.length} Active Clinic(s) • {physios.length} Specialist Physiotherapists • Real-Time GIST Conflict Prevention Active
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/crm/schedule?book=1"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-[#00858E] font-extrabold text-xs sm:text-sm shadow-md hover:bg-[#F5F2EB] transition-colors"
          >
            <Calendar className="h-4 w-4" />
            <span>+ Book Appointment</span>
          </Link>
          <Link
            href="/crm/patients?new=1"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm border border-white/25 transition-colors"
          >
            <Users className="h-4 w-4" />
            <span>+ Add Patient</span>
          </Link>
          {session.role === 'admin' && (
            <Link
              href="/crm/admin"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#141413] hover:bg-black text-white font-bold text-xs sm:text-sm transition-colors"
            >
              <Settings className="h-4 w-4 text-[#5EEAD4]" />
              <span>Admin Controls</span>
            </Link>
          )}
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <Link
          href="/crm/schedule"
          className="bg-white p-5 rounded-2xl border border-[#D6CFC2] hover:border-[#00858E] transition-all shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#141413]/60">
              Scheduled Visits
            </span>
            <Calendar className="h-5 w-5 text-[#00858E]" />
          </div>
          <p className="text-3xl font-extrabold text-[#00858E] mt-2">{scheduledCount}</p>
          <p className="text-[11px] text-[#141413]/60 mt-1">
            {completedCount} completed sessions
          </p>
        </Link>

        <Link
          href="/crm/patients"
          className="bg-white p-5 rounded-2xl border border-[#D6CFC2] hover:border-[#00858E] transition-all shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#141413]/60">
              Patient Profiles
            </span>
            <Users className="h-5 w-5 text-[#00858E]" />
          </div>
          <p className="text-3xl font-extrabold text-[#141413] mt-2">{patients.length}</p>
          <p className="text-[11px] text-[#141413]/60 mt-1">Fast search by name / phone</p>
        </Link>

        <Link
          href="/crm/consultations"
          className="bg-white p-5 rounded-2xl border border-[#D6CFC2] hover:border-[#00858E] transition-all shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#141413]/60">
              Consultations &amp; Rx
            </span>
            <Stethoscope className="h-5 w-5 text-[#00858E]" />
          </div>
          <p className="text-3xl font-extrabold text-[#141413] mt-2">{consultations.length}</p>
          <p className="text-[11px] text-[#141413]/60 mt-1">Notes + PDF/Image uploads</p>
        </Link>

        <Link
          href="/crm/messages"
          className="bg-white p-5 rounded-2xl border border-[#D6CFC2] hover:border-[#00858E] transition-all shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#141413]/60">
              WhatsApp Dispatches
            </span>
            <MessageSquare className="h-5 w-5 text-[#00858E]" />
          </div>
          <p className="text-3xl font-extrabold text-[#00858E] mt-2">{messageLogs.length}</p>
          <p className="text-[11px] text-[#141413]/60 mt-1">Confirmations &amp; 24h/2h reminders</p>
        </Link>
      </div>

      {/* Two-Column Operational Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Cols: Appointments Queue */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-[#D6CFC2] shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#00858E]">
                Live Clinic Queue
              </span>
              <h2 className="text-xl font-extrabold text-[#141413]">
                Appointments &amp; Consultations
              </h2>
            </div>
            <Link
              href="/crm/schedule"
              className="text-xs font-bold text-[#00858E] hover:underline inline-flex items-center gap-1"
            >
              <span>Open Calendar View</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {schedule.slice(0, 6).map((appt) => (
              <div
                key={appt.id}
                className="p-4 rounded-2xl bg-[#F5F2EB]/60 border border-[#D6CFC2] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/crm/patients/${appt.patient_id}`}
                      className="text-sm font-extrabold text-[#141413] hover:text-[#00858E]"
                    >
                      {appt.patient?.full_name || 'Patient'}
                    </Link>
                    <span className="text-xs text-[#141413]/60">
                      ({formatPhoneDisplay(appt.patient?.phone)})
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        appt.status === 'scheduled'
                          ? 'bg-[#00858E] text-white'
                          : appt.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {appt.status}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#141413]/80 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-[#00858E]" />
                    <span>
                      {formatDateIST(appt.start_time)} • {formatTimeIST(appt.start_time)} –{' '}
                      {formatTimeIST(appt.end_time)} ({appt.manual_duration_mins}m)
                    </span>
                  </p>
                  <p className="text-xs text-[#00858E] font-medium">
                    {appt.physio?.full_name || 'Unassigned Clinic Specialist'} •{' '}
                    {appt.chief_complaint || 'Physiotherapy Visit'}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/crm/consultations?appointmentId=${appt.id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#00858E] hover:bg-[#006D75] text-white text-xs font-bold transition-colors"
                  >
                    <ClipboardList className="h-3.5 w-3.5" />
                    <span>Consultation</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 5 Cols: Recent Patients & Quick Actions */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-[#D6CFC2] shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#00858E]">
                Directory &amp; 1-Click Actions
              </span>
              <h2 className="text-xl font-extrabold text-[#141413]">
                Recent Patients
              </h2>
            </div>
            <Link
              href="/crm/patients"
              className="text-xs font-bold text-[#00858E] hover:underline inline-flex items-center gap-1"
            >
              <span>Search All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {patients.slice(0, 6).map((patient) => (
              <div
                key={patient.id}
                className="p-4 rounded-2xl bg-[#F5F2EB]/60 border border-[#D6CFC2] flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <Link
                    href={`/crm/patients/${patient.id}`}
                    className="text-sm font-extrabold text-[#141413] hover:text-[#00858E] block truncate"
                  >
                    {patient.full_name}
                  </Link>
                  <p className="text-xs text-[#141413]/70 flex items-center gap-1 mt-0.5">
                    <Phone className="h-3 w-3 text-[#00858E]" />
                    <span>{formatPhoneDisplay(patient.phone)}</span>
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Link
                    href={`/crm/schedule?book=1&patientId=${patient.id}`}
                    className="px-2.5 py-1.5 rounded-lg bg-[#00858E] text-white text-[11px] font-bold"
                  >
                    Book
                  </Link>
                  <Link
                    href={`/crm/patients/${patient.id}`}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-[#D6CFC2] text-[#141413] text-[11px] font-bold hover:border-[#00858E]"
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
  );
}
