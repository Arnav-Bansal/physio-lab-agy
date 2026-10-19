import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  CalendarPlus,
  ClipboardList,
  Download,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  Phone,
  Stethoscope,
  AlertTriangle,
  CheckCheck,
  Clock,
} from 'lucide-react';
import { getCrmSession } from '@/lib/auth/session';
import { repositories } from '@/lib/repositories';
import {
  formatDateIST,
  formatDateTimeIST,
  formatPhoneDisplay,
  formatTimeIST,
} from '@/lib/utils';
import { PatientQuickWhatsAppButton } from '@/components/crm/patients/patient-quick-whatsapp';

export const dynamic = 'force-dynamic';

export default async function CrmPatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getCrmSession();
  const isPhysio = session?.role === 'physio';

  const [patient, history, messageLogs] = await Promise.all([
    repositories.patients.getPatientById(id).catch(() => null),
    repositories.patients.getUnifiedHistory(id).catch(() => []),
    isPhysio
      ? Promise.resolve([])
      : repositories.messages.listMessageLogs(id, 20).catch(() => []),
  ]);

  if (!patient) {
    notFound();
  }

  const initials = patient.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  const completedCount = history.filter((h) => h.appointment_status === 'completed').length;
  const totalPrescriptions = history.reduce(
    (sum, item) => sum + (Array.isArray(item.prescriptions) ? item.prescriptions.length : 0),
    0
  );

  return (
    <div className="space-y-6">
      <Link
        href="/crm/patients"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Patient Directory</span>
      </Link>

      {/* Longitudinal Patient Profile Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-border shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl bg-primary text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-sm">
              {initials}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  {patient.full_name}
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-secondary-foreground font-mono text-xs font-bold">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                  {formatPhoneDisplay(patient.phone)}
                </span>
              </div>

              <p className="text-xs text-muted-foreground">
                Gender: <strong className="uppercase text-foreground">{patient.gender || 'N/A'}</strong> •
                DOB:{' '}
                <strong className="font-mono text-foreground">
                  {patient.date_of_birth ? formatDateIST(patient.date_of_birth) : 'N/A'}
                </strong>{' '}
                • Address: <strong className="text-foreground">{patient.address || 'Ludhiana, Punjab'}</strong>
              </p>
            </div>
          </div>

          {/* Role-Scoped Quick Actions */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {!isPhysio ? (
              <>
                <Link
                  href={`/crm/schedule?book=1&patientId=${patient.id}`}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs sm:text-sm shadow-sm transition-colors"
                >
                  <CalendarPlus className="h-4 w-4" />
                  <span>Book Appointment</span>
                </Link>

                <PatientQuickWhatsAppButton
                  patientId={patient.id}
                  patientName={patient.full_name}
                />
              </>
            ) : (
              <Link
                href="/crm/consultations"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs sm:text-sm shadow-sm transition-colors"
              >
                <Stethoscope className="h-4 w-4" />
                <span>Open Clinical Charts</span>
              </Link>
            )}
          </div>
        </div>

        {/* Clinical Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border/70">
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Total Visits
            </span>
            <p className="text-xl font-bold font-mono text-foreground mt-0.5">{history.length}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Completed Rehab
            </span>
            <p className="text-xl font-bold font-mono text-emerald-700 mt-0.5">{completedCount}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Attached Rx Files
            </span>
            <p className="text-xl font-bold font-mono text-primary mt-0.5">{totalPrescriptions}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              WhatsApp Alerts
            </span>
            <p className="text-xl font-bold font-mono text-foreground mt-0.5">
              {messageLogs.length}
            </p>
          </div>
        </div>

        {patient.medical_history_notes && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-950">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold uppercase tracking-wider text-[10px] text-amber-800 block">
                Clinical Alert &amp; Medical History
              </strong>
              <span className="font-medium">{patient.medical_history_notes}</span>
            </div>
          </div>
        )}
      </div>

      {/* Unified Patient History Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 Cols: Longitudinal Clinical Timeline */}
        <div className="lg:col-span-8 space-y-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Longitudinal Clinical Record
            </span>
            <h2 className="text-xl font-bold text-foreground">
              Visit &amp; Consultation Timeline ({history.length})
            </h2>
          </div>

          {history.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-border">
              <ClipboardList className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-bold text-foreground">
                No Appointments or Consultations Yet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((visit) => (
                <div
                  key={visit.appointment_id}
                  className="bg-white rounded-2xl p-6 border border-border shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/70 pb-3.5">
                    <div>
                      <p className="text-sm font-bold font-mono text-foreground">
                        {formatDateIST(visit.appointment_start)} •{' '}
                        {formatTimeIST(visit.appointment_start)} –{' '}
                        {formatTimeIST(visit.appointment_end)} ({visit.manual_duration_mins}m)
                      </p>
                      <p className="text-xs font-semibold text-primary flex items-center gap-1.5 mt-0.5">
                        <Stethoscope className="h-3.5 w-3.5" />
                        <span>
                          {visit.physio_name} • {visit.clinic_name}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          visit.appointment_status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : visit.appointment_status === 'scheduled'
                            ? 'bg-primary text-white'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {visit.appointment_status}
                      </span>
                      <Link
                        href={`/crm/consultations?appointmentId=${visit.appointment_id}`}
                        className="px-3 py-1.5 rounded-xl bg-muted/60 hover:bg-secondary text-xs font-bold text-foreground border border-border transition-colors"
                      >
                        {visit.consultation_id ? 'Open SOAP Chart' : 'Start Consultation'}
                      </Link>
                    </div>
                  </div>

                  {/* Clinical Notes & Treatment Plan */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1">
                      <strong className="block uppercase text-[10px] tracking-wider text-primary">
                        Diagnosis &amp; SOAP Notes
                      </strong>
                      <p className="font-bold text-foreground">
                        {visit.diagnosis || visit.chief_complaint || 'Evaluation pending'}
                      </p>
                      {visit.clinical_notes && (
                        <p className="text-muted-foreground pt-1 leading-relaxed whitespace-pre-line">
                          {visit.clinical_notes}
                        </p>
                      )}
                    </div>

                    <div className="p-4 rounded-xl bg-secondary/50 border border-primary/20 space-y-1">
                      <strong className="block uppercase text-[10px] tracking-wider text-primary">
                        Prescribed Rehab Protocol
                      </strong>
                      <p className="text-foreground/90 whitespace-pre-line leading-relaxed">
                        {visit.treatment_plan || 'No treatment protocol recorded yet.'}
                      </p>
                    </div>
                  </div>

                  {/* Prescriptions Attached to this Consultation */}
                  {Array.isArray(visit.prescriptions) && visit.prescriptions.length > 0 && (
                    <div className="pt-1">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                        Attached Prescriptions ({visit.prescriptions.length})
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {visit.prescriptions.map((rx) => (
                          <div
                            key={rx.id}
                            className="p-3 rounded-xl bg-muted/40 border border-border flex items-center justify-between gap-2"
                          >
                            <span className="flex items-center gap-2 text-xs font-bold text-foreground truncate">
                              {rx.file_type === 'pdf' ? (
                                <FileText className="h-4 w-4 text-primary shrink-0" />
                              ) : (
                                <ImageIcon className="h-4 w-4 text-primary shrink-0" />
                              )}
                              <span className="truncate">{rx.file_name}</span>
                            </span>
                            <a
                              href={rx.signed_url || rx.storage_path}
                              target="_blank"
                              rel="noopener noreferrer"
                              download={rx.file_name}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary text-white text-[11px] font-bold shrink-0"
                            >
                              <Download className="h-3 w-3" />
                              <span>Open</span>
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 4 Cols: Patient WhatsApp Communication Bubbles */}
        <div className="lg:col-span-4 space-y-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Communication Trail
            </span>
            <h2 className="text-xl font-bold text-foreground">
              WhatsApp History ({messageLogs.length})
            </h2>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-border shadow-sm space-y-3">
            {messageLogs.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">
                No WhatsApp messages logged for this patient yet.
              </p>
            ) : (
              messageLogs.map((msg) => (
                <div
                  key={msg.id}
                  className="p-3.5 rounded-xl bg-[#ECFDF5] border border-emerald-200/90 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold uppercase text-[10px] text-emerald-900 flex items-center gap-1">
                      <MessageSquare className="h-3 w-3 text-emerald-600" />
                      {msg.trigger_type.replace(/_/g, ' ')}
                    </span>
                    <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-white border border-emerald-200 text-emerald-800">
                      {msg.status}
                    </span>
                  </div>
                  <p className="text-emerald-950 font-medium">
                    {msg.template_variables?.clinic || 'The Physio Lab'} •{' '}
                    {msg.template_variables?.physio || ''}
                  </p>
                  <p className="text-[10px] font-mono text-emerald-700/80 flex items-center justify-between pt-0.5">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDateTimeIST(msg.scheduled_for)}
                    </span>
                    <CheckCheck className="h-3.5 w-3.5 text-emerald-600" />
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
