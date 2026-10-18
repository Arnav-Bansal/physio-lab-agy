import React from 'react';
import Link from 'next/link';
import {
  CalendarCheck,
  CalendarPlus,
  Clock,
  Download,
  FileText,
  MapPin,
  MessageSquare,
  Stethoscope,
  ArrowRight,
  CheckCircle2,
  Image as ImageIcon,
} from 'lucide-react';
import { getPatientSession } from '@/lib/auth/session';
import { repositories } from '@/lib/repositories';
import { formatDateIST, formatTimeIST, formatDateTimeIST, formatPhoneDisplay } from '@/lib/utils';
import { CancelAppointmentButton } from '@/components/portal/cancel-appointment-button';

export const dynamic = 'force-dynamic';

export default async function PatientPortalDashboard() {
  const session = await getPatientSession();
  if (!session) return null;

  const [appointments, history, prescriptions, messageLogs] = await Promise.all([
    repositories.appointments.listPatientAppointments(session.patientId).catch(() => []),
    repositories.patients.getUnifiedHistory(session.patientId).catch(() => []),
    repositories.consultations.listPatientPrescriptions(session.patientId).catch(() => []),
    repositories.messages.listMessageLogs(session.patientId, 10).catch(() => []),
  ]);

  const upcomingAppointments = appointments.filter((a) => a.status === 'scheduled');
  const completedConsultations = history.filter((h) => h.consultation_status === 'completed');

  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-[#00858E] to-[#006D75] rounded-3xl p-7 sm:p-9 text-white shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-white/15 px-3 py-1 rounded-full">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#5EEAD4]" />
            WhatsApp OTP Verified Session • {formatPhoneDisplay(session.phone)}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            Hello, {session.fullName}
          </h1>
          <p className="text-sm text-white/85 max-w-2xl">
            Manage your upcoming rehabilitation sessions at{' '}
            <strong>The Physio Lab — Barewal Awana</strong>, review your doctor&apos;s consultation
            notes, and download your PDF or image exercise prescriptions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/portal/book"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-[#00858E] hover:bg-[#F5F2EB] font-extrabold text-sm shadow-md transition-all"
          >
            <CalendarPlus className="h-4 w-4" />
            <span>Book New Appointment</span>
          </Link>
          <Link
            href="/portal/prescriptions"
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-sm border border-white/25 transition-all"
          >
            <FileText className="h-4 w-4" />
            <span>My Prescriptions ({prescriptions.length})</span>
          </Link>
        </div>
      </div>

      {/* Quick KPI Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-[#D6CFC2] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#141413]/60">
              Upcoming Sessions
            </p>
            <p className="text-3xl font-extrabold text-[#00858E] mt-1">
              {upcomingAppointments.length}
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-[#DCE8E6] text-[#00858E] flex items-center justify-center">
            <CalendarCheck className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#D6CFC2] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#141413]/60">
              Completed Consultations
            </p>
            <p className="text-3xl font-extrabold text-[#141413] mt-1">
              {completedConsultations.length}
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-[#F5F2EB] text-[#141413] flex items-center justify-center">
            <Stethoscope className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#D6CFC2] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#141413]/60">
              Digital Prescriptions
            </p>
            <p className="text-3xl font-extrabold text-[#00858E] mt-1">
              {prescriptions.length}
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-[#DCE8E6] text-[#00858E] flex items-center justify-center">
            <FileText className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Cols: Upcoming Appointments & Latest Clinical Consultation */}
        <div className="lg:col-span-7 space-y-6">
          {/* Upcoming Appointments Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#D6CFC2] shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#00858E]">
                  Live Schedule
                </span>
                <h2 className="text-xl font-extrabold text-[#141413]">
                  Upcoming Appointments
                </h2>
              </div>
              <Link
                href="/portal/book"
                className="text-xs font-bold text-[#00858E] hover:underline inline-flex items-center gap-1"
              >
                <span>+ Book Slot</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {upcomingAppointments.length === 0 ? (
              <div className="bg-[#F5F2EB]/70 rounded-2xl p-8 text-center border border-dashed border-[#D6CFC2]">
                <CalendarCheck className="h-8 w-8 text-[#00858E] mx-auto mb-2" />
                <p className="text-sm font-bold text-[#141413]">
                  No upcoming appointments scheduled
                </p>
                <p className="text-xs text-[#141413]/65 mt-1 mb-4">
                  Book your next physiotherapy or sports injury session online with instant WhatsApp
                  confirmation.
                </p>
                <Link
                  href="/portal/book"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00858E] text-white text-xs font-bold"
                >
                  <CalendarPlus className="h-4 w-4" />
                  <span>Book Appointment</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="rounded-2xl p-5 bg-[#F5F2EB]/60 border border-[#D6CFC2] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#00858E] text-white">
                          Scheduled
                        </span>
                        <span className="text-xs font-semibold text-[#141413]/70">
                          {appt.manual_duration_mins} mins session
                        </span>
                      </div>
                      <p className="text-base font-extrabold text-[#141413]">
                        {formatDateIST(appt.start_time)} • {formatTimeIST(appt.start_time)} –{' '}
                        {formatTimeIST(appt.end_time)}
                      </p>
                      <p className="text-xs font-semibold text-[#00858E] flex items-center gap-1.5">
                        <Stethoscope className="h-3.5 w-3.5" />
                        <span>
                          {appt.physio?.full_name || 'Assigned Clinic Specialist'}
                          {appt.physio?.specialization ? ` (${appt.physio.specialization})` : ''}
                        </span>
                      </p>
                      <p className="text-xs text-[#141413]/70 flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-[#00858E]" />
                        <span>{appt.clinic?.name || 'The Physio Lab — Barewal Awana'}</span>
                      </p>
                      {appt.chief_complaint && (
                        <p className="text-xs text-[#141413]/80 bg-white px-3 py-1.5 rounded-lg border border-[#D6CFC2]/70 mt-2">
                          <strong>Reason:</strong> {appt.chief_complaint}
                        </p>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-end justify-between gap-2 shrink-0">
                      <CancelAppointmentButton appointmentId={appt.id} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Consultation Summary Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#D6CFC2] shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#00858E]">
                  Clinical Records
                </span>
                <h2 className="text-xl font-extrabold text-[#141413]">
                  Recent Consultation History
                </h2>
              </div>
              <Link
                href="/portal/history"
                className="text-xs font-bold text-[#00858E] hover:underline inline-flex items-center gap-1"
              >
                <span>View Full History</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {completedConsultations.length === 0 ? (
              <p className="text-xs text-[#141413]/65 py-6 text-center">
                Completed consultation records and rehab notes will appear here after your visit.
              </p>
            ) : (
              <div className="space-y-4">
                {completedConsultations.slice(0, 2).map((item) => (
                  <div
                    key={item.appointment_id}
                    className="rounded-2xl p-5 bg-[#F5F2EB]/60 border border-[#D6CFC2] space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[#00858E]">
                        {formatDateIST(item.appointment_start)} • {item.physio_name}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        Completed Consultation
                      </span>
                    </div>

                    {item.diagnosis && (
                      <p className="text-sm font-extrabold text-[#141413]">
                        Diagnosis: {item.diagnosis}
                      </p>
                    )}

                    {item.treatment_plan && (
                      <div className="bg-white rounded-xl p-3.5 border border-[#D6CFC2] text-xs text-[#141413]/85 whitespace-pre-line">
                        <strong className="block text-[#00858E] uppercase tracking-wider text-[10px] mb-1">
                          Prescribed Rehab Protocol:
                        </strong>
                        {item.treatment_plan}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 5 Cols: Digital Prescriptions & WhatsApp Reminders Log */}
        <div className="lg:col-span-5 space-y-6">
          {/* Prescriptions Quick Vault */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#D6CFC2] shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#00858E]">
                  PDF &amp; Image Attachments
                </span>
                <h2 className="text-xl font-extrabold text-[#141413]">
                  My Prescriptions
                </h2>
              </div>
              <Link
                href="/portal/prescriptions"
                className="text-xs font-bold text-[#00858E] hover:underline inline-flex items-center gap-1"
              >
                <span>Open Vault</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {prescriptions.length === 0 ? (
              <p className="text-xs text-[#141413]/65 py-6 text-center">
                No prescriptions uploaded yet.
              </p>
            ) : (
              <div className="space-y-3">
                {prescriptions.map((presc) => (
                  <div
                    key={presc.id}
                    className="p-4 rounded-2xl bg-[#F5F2EB]/70 border border-[#D6CFC2] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-[#00858E]/10 text-[#00858E] flex items-center justify-center shrink-0">
                        {presc.file_type === 'pdf' ? (
                          <FileText className="h-5 w-5" />
                        ) : (
                          <ImageIcon className="h-5 w-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-[#141413] truncate">
                          {presc.file_name}
                        </p>
                        <p className="text-[11px] text-[#141413]/65 truncate">
                          {presc.description || presc.file_type.toUpperCase()}
                        </p>
                      </div>
                    </div>

                    <a
                      href={presc.signed_url || presc.storage_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={presc.file_name}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#00858E] hover:bg-[#006D75] text-white text-xs font-bold shrink-0 transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Automated WhatsApp Notifications Feed */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#D6CFC2] shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#00858E] mb-1">
              <MessageSquare className="h-4 w-4" />
              <span>Automated WhatsApp Reminders</span>
            </div>
            <h2 className="text-lg font-extrabold text-[#141413] mb-4">
              Recent WhatsApp Updates
            </h2>

            {messageLogs.length === 0 ? (
              <p className="text-xs text-[#141413]/65 py-4">
                Your booking confirmations and 24h / 2h WhatsApp reminders will be logged here.
              </p>
            ) : (
              <div className="space-y-3">
                {messageLogs.slice(0, 5).map((msg) => (
                  <div
                    key={msg.id}
                    className="p-3.5 rounded-2xl bg-[#F5F2EB]/60 border border-[#D6CFC2] text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold uppercase tracking-wider text-[10px] text-[#00858E]">
                        {msg.trigger_type.replace(/_/g, ' ')}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DCE8E6] text-[#006D75]">
                        {msg.status}
                      </span>
                    </div>
                    <p className="text-[#141413]/80 font-medium">
                      {msg.template_variables?.clinic || 'The Physio Lab'}
                      {msg.template_variables?.date ? ` • ${msg.template_variables.date}` : ''}
                    </p>
                    <p className="text-[11px] text-[#141413]/55 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Scheduled: {formatDateTimeIST(msg.scheduled_for)}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
