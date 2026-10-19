import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  CalendarPlus,
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
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary bg-secondary px-2.5 py-0.5 rounded-md">
            <ClipboardList className="h-3.5 w-3.5" />
            <span>Longitudinal Clinical Timeline</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground pt-1">
            My Consultation &amp; Visit History
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Complete record of your appointments, physiotherapist clinical notes, rehabilitation
            plans, and attached prescriptions.
          </p>
        </div>

        <Link
          href="/portal/book"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-sm transition-colors self-start sm:self-auto"
        >
          <CalendarPlus className="h-4 w-4" />
          <span>Book Follow-Up Session</span>
        </Link>
      </div>

      {history.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-border shadow-sm">
          <ClipboardList className="h-10 w-10 text-primary mx-auto mb-3" />
          <h2 className="text-lg font-bold text-foreground">No Consultation Records Yet</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Once you book and complete a session at The Physio Lab, your clinical notes and
            prescriptions will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {history.map((item) => (
            <div
              key={item.appointment_id}
              className="bg-white rounded-2xl p-6 sm:p-8 border border-border shadow-sm space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold font-mono text-foreground">
                      <Calendar className="h-4 w-4 text-primary" />
                      {formatDateIST(item.appointment_start)} ({formatTimeIST(item.appointment_start)}{' '}
                      – {formatTimeIST(item.appointment_end)})
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">
                      • {item.manual_duration_mins} mins
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                    <span className="inline-flex items-center gap-1 font-bold text-primary">
                      <Stethoscope className="h-3.5 w-3.5" />
                      {item.physio_name}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      {item.clinic_name}
                    </span>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider self-start sm:self-auto ${
                    item.appointment_status === 'completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.appointment_status === 'scheduled'
                      ? 'bg-secondary text-secondary-foreground'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {item.appointment_status.replace('_', ' ')}
                </span>
              </div>

              {/* Clinical Notes & Rehab Protocol */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted/40 rounded-xl p-4 border border-border space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
                    Chief Complaint &amp; Diagnosis
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {item.diagnosis || item.chief_complaint || 'General Physiotherapy Evaluation'}
                  </p>
                  {item.clinical_notes && (
                    <p className="text-xs text-muted-foreground leading-relaxed pt-1 whitespace-pre-line">
                      {item.clinical_notes}
                    </p>
                  )}
                </div>

                <div className="bg-secondary/50 rounded-xl p-4 border border-primary/20 space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
                    Rehabilitation &amp; Home Exercise Plan
                  </p>
                  <p className="text-xs text-foreground/90 whitespace-pre-line leading-relaxed">
                    {item.treatment_plan ||
                      'Treatment plan will be updated upon completion of your consultation.'}
                  </p>
                </div>
              </div>

              {/* Attached Prescriptions */}
              {Array.isArray(item.prescriptions) && item.prescriptions.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
                    Attached Prescriptions ({item.prescriptions.length})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {item.prescriptions.map((p) => (
                      <div
                        key={p.id}
                        className="p-3.5 rounded-xl bg-muted/40 border border-border flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {p.file_type === 'pdf' ? (
                            <FileText className="h-5 w-5 text-primary shrink-0" />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-primary shrink-0" />
                          )}
                          <span className="text-xs font-bold text-foreground truncate">
                            {p.file_name}
                          </span>
                        </div>
                        <a
                          href={p.signed_url || p.storage_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={p.file_name}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shrink-0 transition-colors"
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
