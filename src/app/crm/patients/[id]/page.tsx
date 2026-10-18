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
} from 'lucide-react';
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

  const [patient, history, messageLogs] = await Promise.all([
    repositories.patients.getPatientById(id).catch(() => null),
    repositories.patients.getUnifiedHistory(id).catch(() => []),
    repositories.messages.listMessageLogs(id, 20).catch(() => []),
  ]);

  if (!patient) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <Link
        href="/crm/patients"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00858E] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Patient Directory</span>
      </Link>

      {/* Patient Profile Header & 1-Click Quick Actions */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D6CFC2] shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2.5">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#141413]">
              {patient.full_name}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCE8E6] text-[#006D75] text-xs font-extrabold">
              <Phone className="h-3.5 w-3.5" />
              {formatPhoneDisplay(patient.phone)}
            </span>
          </div>

          <p className="text-xs text-[#141413]/70">
            Gender: <strong className="uppercase">{patient.gender || 'N/A'}</strong> • DOB:{' '}
            <strong>{patient.date_of_birth ? formatDateIST(patient.date_of_birth) : 'N/A'}</strong>{' '}
            • Address: <strong>{patient.address || 'Ludhiana, Punjab'}</strong>
          </p>

          {patient.medical_history_notes && (
            <div className="p-3.5 rounded-2xl bg-[#F5F2EB] border border-[#D6CFC2] text-xs text-[#141413]/85">
              <strong className="text-[#00858E]">Medical &amp; Rehab History:</strong>{' '}
              {patient.medical_history_notes}
            </div>
          )}

          {patient.general_notes && (
            <p className="text-xs text-[#141413]/65">
              <strong>Reception Notes:</strong> {patient.general_notes}
            </p>
          )}
        </div>

        {/* 1-Click Quick Actions */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href={`/crm/schedule?book=1&patientId=${patient.id}`}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#00858E] hover:bg-[#006D75] text-white font-extrabold text-xs sm:text-sm shadow-sm transition-colors"
          >
            <CalendarPlus className="h-4 w-4" />
            <span>1-Click Book Appointment</span>
          </Link>

          <PatientQuickWhatsAppButton
            patientId={patient.id}
            patientName={patient.full_name}
          />
        </div>
      </div>

      {/* Unified Patient History Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 Cols: Consultations, Notes & Prescriptions Timeline */}
        <div className="lg:col-span-8 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#00858E]">
                Longitudinal Clinical Record
              </span>
              <h2 className="text-xl font-extrabold text-[#141413]">
                Unified Patient History ({history.length} Visits)
              </h2>
            </div>
          </div>

          {history.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-[#D6CFC2]">
              <ClipboardList className="h-8 w-8 text-[#00858E] mx-auto mb-2" />
              <p className="text-sm font-bold text-[#141413]">No Appointments or Consultations Yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((visit) => (
                <div
                  key={visit.appointment_id}
                  className="bg-white rounded-3xl p-6 border border-[#D6CFC2] shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E2D7] pb-3">
                    <div>
                      <p className="text-sm font-extrabold text-[#141413]">
                        {formatDateIST(visit.appointment_start)} •{' '}
                        {formatTimeIST(visit.appointment_start)} –{' '}
                        {formatTimeIST(visit.appointment_end)} ({visit.manual_duration_mins} mins)
                      </p>
                      <p className="text-xs font-semibold text-[#00858E] flex items-center gap-1.5 mt-0.5">
                        <Stethoscope className="h-3.5 w-3.5" />
                        <span>
                          {visit.physio_name} • {visit.clinic_name}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase ${
                          visit.appointment_status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : visit.appointment_status === 'scheduled'
                            ? 'bg-[#00858E] text-white'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {visit.appointment_status}
                      </span>
                      <Link
                        href={`/crm/consultations?appointmentId=${visit.appointment_id}`}
                        className="px-3 py-1 rounded-xl bg-[#F5F2EB] hover:bg-[#DCE8E6] text-xs font-bold text-[#141413] border border-[#D6CFC2]"
                      >
                        {visit.consultation_id ? 'Edit Notes / Rx' : 'Convert to Consultation'}
                      </Link>
                    </div>
                  </div>

                  {/* Clinical Notes & Treatment Plan */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-2xl bg-[#F5F2EB]/60 border border-[#D6CFC2]">
                      <strong className="block uppercase text-[10px] tracking-wider text-[#00858E] mb-1">
                        Diagnosis &amp; Clinical Notes
                      </strong>
                      <p className="font-bold text-[#141413]">
                        {visit.diagnosis || visit.chief_complaint || 'No diagnosis entered yet'}
                      </p>
                      {visit.clinical_notes && (
                        <p className="text-[#141413]/80 mt-1 leading-relaxed">
                          {visit.clinical_notes}
                        </p>
                      )}
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#DCE8E6]/40 border border-[#00858E]/20">
                      <strong className="block uppercase text-[10px] tracking-wider text-[#00858E] mb-1">
                        Prescribed Rehab Protocol
                      </strong>
                      <p className="text-[#141413]/85 whitespace-pre-line">
                        {visit.treatment_plan || 'No treatment protocol recorded yet.'}
                      </p>
                    </div>
                  </div>

                  {/* Prescriptions Attached to this Consultation */}
                  {Array.isArray(visit.prescriptions) && visit.prescriptions.length > 0 && (
                    <div className="pt-1">
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#141413]/60 mb-2">
                        Attached Prescriptions ({visit.prescriptions.length})
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {visit.prescriptions.map((rx) => (
                          <div
                            key={rx.id}
                            className="p-3 rounded-xl bg-[#F5F2EB] border border-[#D6CFC2] flex items-center justify-between gap-2"
                          >
                            <span className="flex items-center gap-2 text-xs font-bold text-[#141413] truncate">
                              {rx.file_type === 'pdf' ? (
                                <FileText className="h-4 w-4 text-[#00858E] shrink-0" />
                              ) : (
                                <ImageIcon className="h-4 w-4 text-[#00858E] shrink-0" />
                              )}
                              <span className="truncate">{rx.file_name}</span>
                            </span>
                            <a
                              href={rx.signed_url || rx.storage_path}
                              target="_blank"
                              rel="noopener noreferrer"
                              download={rx.file_name}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#00858E] text-white text-[11px] font-bold shrink-0"
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

        {/* Right 4 Cols: Patient WhatsApp Communication Log */}
        <div className="lg:col-span-4 space-y-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#00858E]">
              Communication Trail
            </span>
            <h2 className="text-xl font-extrabold text-[#141413]">
              WhatsApp History ({messageLogs.length})
            </h2>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-[#D6CFC2] shadow-sm space-y-3">
            {messageLogs.length === 0 ? (
              <p className="text-xs text-[#141413]/60 py-6 text-center">
                No WhatsApp messages logged for this patient yet.
              </p>
            ) : (
              messageLogs.map((msg) => (
                <div
                  key={msg.id}
                  className="p-3.5 rounded-2xl bg-[#F5F2EB]/60 border border-[#D6CFC2] text-xs space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold uppercase text-[10px] text-[#00858E] flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {msg.trigger_type.replace(/_/g, ' ')}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DCE8E6] text-[#006D75]">
                      {msg.status}
                    </span>
                  </div>
                  <p className="text-[#141413]/80">
                    {msg.template_variables?.clinic || 'The Physio Lab'} •{' '}
                    {msg.template_variables?.physio || ''}
                  </p>
                  <p className="text-[11px] text-[#141413]/55">
                    Scheduled: {formatDateTimeIST(msg.scheduled_for)}
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
