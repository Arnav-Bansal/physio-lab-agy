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
  Activity,
  BellRing,
  Sparkles,
} from 'lucide-react';
import { getPatientSession } from '@/lib/auth/session';
import { repositories } from '@/lib/repositories';
import { formatDateIST, formatTimeIST, formatDateTimeIST, formatPhoneDisplay } from '@/lib/utils';
import { CancelAppointmentButton } from '@/components/portal/cancel-appointment-button';

export const dynamic = 'force-dynamic';

function formatTriggerLabel(triggerType: string) {
  switch (triggerType) {
    case 'booking_confirmation':
      return 'Instant Booking Confirmation';
    case 'reminder_24h':
      return '24-Hour Prior Visit Reminder';
    case 'reminder_2h':
      return '2-Hour Prior Visit Alert';
    case 'appointment_cancelled':
      return 'Cancellation Notice';
    case 'appointment_no_show':
      return 'Missed Visit Follow-Up';
    case 'manual_followup':
      return 'Care Team Check-In';
    default:
      return triggerType.replace(/_/g, ' ');
  }
}

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
  const latestCompleted = completedConsultations[0] || null;

  // Parse home exercises from latest treatment_plan if available
  const homeExercises = latestCompleted?.treatment_plan
    ? latestCompleted.treatment_plan
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="space-y-8">
      {/* ====================================================================
          1. HOSPITALITY-GRADE PATIENT RECOVERY BANNER
      ==================================================================== */}
      <div className="bg-gradient-to-r from-[#141E1E] via-[#00646B] to-[#00858E] rounded-2xl p-6 sm:p-8 lg:p-10 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider bg-white/15 px-3 py-1 rounded-full text-[#5EEAD4]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>WhatsApp Verified • {formatPhoneDisplay(session.phone)}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-white/10 px-3 py-1 rounded-full text-white/85">
              <BellRing className="h-3 w-3 text-[#5EEAD4]" />
              <span>24h &amp; 2h Automated WhatsApp Reminders Active</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            Welcome back, {session.fullName}
          </h1>
          <p className="text-sm text-white/80 max-w-2xl leading-relaxed">
            Track your rehabilitation schedule at <strong>The Physio Lab — Barewal Awana</strong>,
            follow your daily home exercise protocol, and download your digital prescriptions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/portal/book"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-[#00646B] hover:bg-white/90 font-bold text-xs sm:text-sm shadow-md transition-all"
          >
            <CalendarPlus className="h-4 w-4" />
            <span>Book New Session</span>
          </Link>
          <Link
            href="/portal/prescriptions"
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs sm:text-sm border border-white/20 transition-all"
          >
            <FileText className="h-4 w-4 text-[#5EEAD4]" />
            <span>Rx Vault ({prescriptions.length})</span>
          </Link>
        </div>
      </div>

      {/* ====================================================================
          2. QUICK RECOVERY METRICS ROW
      ==================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Link
          href="/portal/book"
          className="bg-white rounded-2xl p-5 border border-border shadow-sm hover:border-primary/40 transition-all flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Upcoming Sessions
            </p>
            <p className="text-3xl font-bold font-mono text-primary mt-1">
              {upcomingAppointments.length}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Scheduled at Barewal Awana
            </p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-secondary text-primary flex items-center justify-center">
            <CalendarCheck className="h-6 w-6" />
          </div>
        </Link>

        <Link
          href="/portal/history"
          className="bg-white rounded-2xl p-5 border border-border shadow-sm hover:border-primary/40 transition-all flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Completed Sessions
            </p>
            <p className="text-3xl font-bold font-mono text-foreground mt-1">
              {completedConsultations.length}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Clinical SOAP notes &amp; plans
            </p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-muted text-foreground flex items-center justify-center">
            <Stethoscope className="h-6 w-6" />
          </div>
        </Link>

        <Link
          href="/portal/prescriptions"
          className="bg-white rounded-2xl p-5 border border-border shadow-sm hover:border-primary/40 transition-all flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Digital Prescriptions
            </p>
            <p className="text-3xl font-bold font-mono text-primary mt-1">
              {prescriptions.length}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              PDF &amp; Image exercise charts
            </p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-secondary text-primary flex items-center justify-center">
            <FileText className="h-6 w-6" />
          </div>
        </Link>
      </div>

      {/* ====================================================================
          3. MAIN TWO-COLUMN CLINICAL PORTAL WORKSPACE
      ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Cols: Boarding-Pass Appointment Tickets + Active Home Rehab Checklist */}
        <div className="lg:col-span-7 space-y-6">
          {/* Upcoming Appointments Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-border shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  Confirmed Schedule
                </span>
                <h2 className="text-xl font-bold text-foreground">
                  Upcoming Appointments ({upcomingAppointments.length})
                </h2>
              </div>
              <Link
                href="/portal/book"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-secondary text-secondary-foreground text-xs font-bold hover:bg-primary hover:text-white transition-colors"
              >
                <CalendarPlus className="h-3.5 w-3.5" />
                <span>Book Slot</span>
              </Link>
            </div>

            {upcomingAppointments.length === 0 ? (
              <div className="bg-muted/50 rounded-2xl p-8 text-center border border-dashed border-border">
                <CalendarCheck className="h-9 w-9 text-primary mx-auto mb-2.5" />
                <p className="text-base font-bold text-foreground">
                  No upcoming appointments scheduled
                </p>
                <p className="text-xs text-muted-foreground mt-1 mb-5 max-w-md mx-auto">
                  Book your next physiotherapy, spine care, or Desmotec sports recovery session
                  online with instant WhatsApp confirmation.
                </p>
                <Link
                  href="/portal/book"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-sm"
                >
                  <CalendarPlus className="h-4 w-4" />
                  <span>Book Appointment Now</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="rounded-2xl p-5 bg-muted/40 border border-border hover:border-primary/40 transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-primary text-white">
                            Confirmed Slot
                          </span>
                          <span className="font-mono text-xs font-semibold text-foreground bg-white px-2.5 py-0.5 rounded-md border border-border">
                            {appt.manual_duration_mins} Mins
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            <MessageSquare className="h-3 w-3 text-emerald-600" />
                            <span>24h &amp; 2h Alerts Active</span>
                          </span>
                        </div>

                        <p className="text-lg font-bold font-mono text-foreground pt-1">
                          {formatDateIST(appt.start_time)} • {formatTimeIST(appt.start_time)} –{' '}
                          {formatTimeIST(appt.end_time)}
                        </p>

                        <p className="text-xs font-semibold text-primary flex items-center gap-1.5">
                          <Stethoscope className="h-3.5 w-3.5" />
                          <span>
                            {appt.physio?.full_name || 'Assigned Clinic Specialist'}
                            {appt.physio?.specialization ? ` • ${appt.physio.specialization}` : ''}
                          </span>
                        </p>

                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          <span>{appt.clinic?.name || 'The Physio Lab — Barewal Awana'}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <CancelAppointmentButton appointmentId={appt.id} />
                      </div>
                    </div>

                    {appt.chief_complaint && (
                      <div className="text-xs text-muted-foreground bg-white px-3.5 py-2.5 rounded-xl border border-border/80">
                        <strong className="text-foreground">Session Focus:</strong>{' '}
                        {appt.chief_complaint}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Home Exercise & Rehab Plan (Hinge Health / Sword Health Inspired) */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-border shadow-sm space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary">
                  <Activity className="h-3.5 w-3.5" />
                  <span>Active Recovery Protocol</span>
                </span>
                <h2 className="text-xl font-bold text-foreground mt-0.5">
                  Prescribed Home Exercise &amp; Rehab Plan
                </h2>
              </div>
              <Link
                href="/portal/history"
                className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
              >
                <span>All Consultations</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {!latestCompleted ? (
              <p className="text-xs text-muted-foreground py-6 text-center bg-muted/40 rounded-xl border border-border">
                Your physiotherapist&apos;s prescribed home exercises and clinical diagnosis will
                appear here after your consultation.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-secondary/50 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      Latest Clinical Diagnosis ({formatDateIST(latestCompleted.appointment_start)})
                    </span>
                    <p className="text-sm font-bold text-foreground mt-0.5">
                      {latestCompleted.diagnosis ||
                        latestCompleted.chief_complaint ||
                        'Physiotherapy & Rehabilitation Assessment'}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-primary">
                    {latestCompleted.physio_name}
                  </span>
                </div>

                {homeExercises.length > 0 && (
                  <div className="space-y-2.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Daily Rehab Protocol ({homeExercises.length} Steps)
                    </p>
                    <div className="grid grid-cols-1 gap-2.5">
                      {homeExercises.map((exercise, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-muted/50 border border-border flex items-start gap-3 text-xs sm:text-sm text-foreground"
                        >
                          <span className="h-6 w-6 rounded-lg bg-primary text-white font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed font-medium">
                            {exercise.replace(/^\d+[\.\)]\s*/, '')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right 5 Cols: Digital Prescriptions Vault & Clean WhatsApp Care Feed */}
        <div className="lg:col-span-5 space-y-6">
          {/* Prescriptions Quick Vault */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-border shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  PDF &amp; Image Exercise Charts
                </span>
                <h2 className="text-xl font-bold text-foreground">
                  My Prescriptions ({prescriptions.length})
                </h2>
              </div>
              <Link
                href="/portal/prescriptions"
                className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
              >
                <span>Open Full Vault</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {prescriptions.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center bg-muted/40 rounded-xl border border-border">
                No prescriptions uploaded yet.
              </p>
            ) : (
              <div className="space-y-3">
                {prescriptions.map((presc) => (
                  <div
                    key={presc.id}
                    className="p-4 rounded-xl bg-muted/40 border border-border hover:border-primary/40 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-secondary text-primary flex items-center justify-center shrink-0">
                        {presc.file_type === 'pdf' ? (
                          <FileText className="h-5 w-5" />
                        ) : (
                          <ImageIcon className="h-5 w-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-white border border-border text-primary">
                            {presc.file_type}
                          </span>
                          <p className="text-xs font-bold text-foreground truncate">
                            {presc.file_name}
                          </p>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                          {presc.description || 'Clinical Exercise Prescription'}
                        </p>
                      </div>
                    </div>

                    <a
                      href={presc.signed_url || presc.storage_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={presc.file_name}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shrink-0 transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Clean WhatsApp Care Timeline */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-border shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-1">
              <MessageSquare className="h-4 w-4" />
              <span>WhatsApp Care Notifications</span>
            </div>
            <h2 className="text-lg font-bold text-foreground mb-4">
              Recent Confirmations &amp; Reminders
            </h2>

            {messageLogs.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4">
                Your booking confirmations and 24h / 2h WhatsApp reminders will appear here.
              </p>
            ) : (
              <div className="space-y-3">
                {messageLogs.slice(0, 5).map((msg) => (
                  <div
                    key={msg.id}
                    className="p-3.5 rounded-xl bg-[#F0FDF4]/60 border border-emerald-200/80 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                        {formatTriggerLabel(msg.trigger_type)}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-white border border-emerald-200 text-emerald-800">
                        {msg.status === 'queued' ? 'Scheduled' : msg.status}
                      </span>
                    </div>
                    <p className="text-muted-foreground font-medium">
                      {msg.template_variables?.clinic || 'The Physio Lab'}
                      {msg.template_variables?.date ? ` • ${msg.template_variables.date}` : ''}
                    </p>
                    <p className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3 text-emerald-700" />
                      <span>{formatDateTimeIST(msg.scheduled_for)}</span>
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
