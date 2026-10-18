import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  ClipboardList,
  Download,
  FileText,
  Image as ImageIcon,
  MapPin,
  Stethoscope,
} from 'lucide-react';
import { getPatientSession } from '@/lib/auth/session';
import { repositories } from '@/lib/repositories';
import { formatDateIST, formatTimeIST } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function PatientConsultationHistoryPage() {
  const session = await getPatientSession();
  if (!session) return null;

  const history = await repositories.patients.getUnifiedHistory(session.patientId).catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#00858E]">
            Longitudinal Clinical Timeline
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#141413] mt-1">
            My Consultation &amp; Visit History
          </h1>
          <p className="text-sm text-[#141413]/70 mt-1">
            Complete record of your appointments, physiotherapist clinical notes, rehabilitation
            plans, and attached prescriptions.
          </p>
        </div>

        <Link
          href="/portal/book"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00858E] text-white text-xs font-bold self-start sm:self-auto"
        >
          <span>+ Book Follow-Up Session</span>
        </Link>
      </div>

      {history.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#D6CFC2]">
          <ClipboardList className="h-10 w-10 text-[#00858E] mx-auto mb-3" />
          <h2 className="text-lg font-extrabold text-[#141413]">No Consultation Records Yet</h2>
          <p className="text-xs text-[#141413]/65 mt-1">
            Once you book and complete a session at The Physio Lab, your clinical notes and
            prescriptions will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {history.map((item) => (
            <div
              key={item.appointment_id}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D6CFC2] shadow-sm space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E2D7] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 text-sm font-extrabold text-[#141413]">
                      <Calendar className="h-4 w-4 text-[#00858E]" />
                      {formatDateIST(item.appointment_start)} ({formatTimeIST(item.appointment_start)}{' '}
                      – {formatTimeIST(item.appointment_end)})
                    </span>
                    <span className="text-xs text-[#141413]/60">
                      • {item.manual_duration_mins} mins
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[#141413]/75 flex-wrap">
                    <span className="inline-flex items-center gap-1 font-semibold text-[#00858E]">
                      <Stethoscope className="h-3.5 w-3.5" />
                      {item.physio_name}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-[#00858E]" />
                      {item.clinic_name}
                    </span>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider self-start sm:self-auto ${
                    item.appointment_status === 'completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.appointment_status === 'scheduled'
                      ? 'bg-[#DCE8E6] text-[#006D75]'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {item.appointment_status.replace('_', ' ')}
                </span>
              </div>

              {/* Clinical Notes & Rehab Protocol */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#F5F2EB]/60 rounded-2xl p-4 border border-[#D6CFC2]/80 space-y-2">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#00858E]">
                    Chief Complaint &amp; Diagnosis
                  </p>
                  <p className="text-sm font-bold text-[#141413]">
                    {item.diagnosis || item.chief_complaint || 'General Physiotherapy Evaluation'}
                  </p>
                  {item.clinical_notes && (
                    <p className="text-xs text-[#141413]/80 leading-relaxed pt-1">
                      {item.clinical_notes}
                    </p>
                  )}
                </div>

                <div className="bg-[#DCE8E6]/40 rounded-2xl p-4 border border-[#00858E]/20 space-y-2">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#00858E]">
                    Rehabilitation &amp; Home Exercise Plan
                  </p>
                  <p className="text-xs text-[#141413]/85 whitespace-pre-line leading-relaxed">
                    {item.treatment_plan ||
                      'Treatment plan will be updated upon completion of your consultation.'}
                  </p>
                </div>
              </div>

              {/* Attached Prescriptions */}
              {Array.isArray(item.prescriptions) && item.prescriptions.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-[#141413]/65 mb-2.5">
                    Attached Prescriptions ({item.prescriptions.length})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {item.prescriptions.map((p) => (
                      <div
                        key={p.id}
                        className="p-3.5 rounded-2xl bg-[#F5F2EB] border border-[#D6CFC2] flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {p.file_type === 'pdf' ? (
                            <FileText className="h-5 w-5 text-[#00858E] shrink-0" />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-[#00858E] shrink-0" />
                          )}
                          <span className="text-xs font-bold text-[#141413] truncate">
                            {p.file_name}
                          </span>
                        </div>
                        <a
                          href={p.signed_url || p.storage_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={p.file_name}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#00858E] text-white text-xs font-bold shrink-0"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Download</span>
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
  );
}
