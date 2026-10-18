'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileText,
  Image as ImageIcon,
  Loader2,
  Stethoscope,
  UploadCloud,
  User,
  AlertCircle,
} from 'lucide-react';
import type {
  AppointmentWithRelations,
  ConsultationRecord,
  PrescriptionRecord,
} from '@/types/database.types';
import { cn, formatDateIST, formatFileSize } from '@/lib/utils';

type ConsultationListItem = ConsultationRecord & {
  patient?: { id: string; full_name: string; phone: string } | null;
  clinic?: { id: string; name: string } | null;
  physio?: { id: string; full_name: string; specialization: string | null } | null;
  prescriptions?: PrescriptionRecord[];
};

interface ConsultationsWorkspaceClientProps {
  initialConsultations: ConsultationListItem[];
  scheduledAppointments: AppointmentWithRelations[];
  initialSelectedId?: string | null;
}

export function ConsultationsWorkspaceClient({
  initialConsultations,
  scheduledAppointments,
  initialSelectedId,
}: ConsultationsWorkspaceClientProps) {
  const router = useRouter();
  const [consultations, setConsultations] =
    useState<ConsultationListItem[]>(initialConsultations);
  const [selectedId, setSelectedId] = useState<string>(
    initialSelectedId || initialConsultations[0]?.id || ''
  );

  const activeConsultation =
    consultations.find((c) => c.id === selectedId) || consultations[0] || null;

  // Form fields synced to activeConsultation
  const [chiefComplaint, setChiefComplaint] = useState(
    activeConsultation?.chief_complaint || ''
  );
  const [diagnosis, setDiagnosis] = useState(activeConsultation?.diagnosis || '');
  const [clinicalNotes, setClinicalNotes] = useState(
    activeConsultation?.clinical_notes || ''
  );
  const [treatmentPlan, setTreatmentPlan] = useState(
    activeConsultation?.treatment_plan || ''
  );
  const [followUpDate, setFollowUpDate] = useState(
    activeConsultation?.follow_up_recommended_date || ''
  );

  // Prescription Upload State (supports both PDF and Image)
  const [uploadingFile, setUploadingFile] = useState(false);
  const [rxDescription, setRxDescription] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [convertingApptId, setConvertingApptId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function selectConsultation(c: ConsultationListItem) {
    setSelectedId(c.id);
    setChiefComplaint(c.chief_complaint || '');
    setDiagnosis(c.diagnosis || '');
    setClinicalNotes(c.clinical_notes || '');
    setTreatmentPlan(c.treatment_plan || '');
    setFollowUpDate(c.follow_up_recommended_date || '');
    setError(null);
  }

  async function handleConvertAppointment(appointmentId: string) {
    setConvertingApptId(appointmentId);
    setError(null);
    try {
      const res = await fetch('/api/crm/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'open', appointmentId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not convert appointment');

      router.push(`/crm/consultations?appointmentId=${appointmentId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to convert appointment');
    } finally {
      setConvertingApptId(null);
    }
  }

  async function handleSaveConsultation(markComplete: boolean) {
    if (!activeConsultation) return;
    setSavingNotes(true);
    setError(null);
    setToast(null);

    try {
      const res = await fetch('/api/crm/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultationId: activeConsultation.id,
          chiefComplaint,
          diagnosis,
          clinicalNotes,
          treatmentPlan,
          followUpRecommendedDate: followUpDate || null,
          markComplete,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save consultation');

      setConsultations((prev) =>
        prev.map((item) =>
          item.id === activeConsultation.id
            ? { ...item, ...data.consultation }
            : item
        )
      );

      setToast(
        markComplete
          ? 'Consultation marked as Complete! Automatically synced to Unified Patient History & Patient Portal.'
          : 'Clinical notes & rehab plan saved.'
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  }

  async function handlePrescriptionUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !activeConsultation) return;

    setUploadingFile(true);
    setError(null);
    setToast(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('consultationId', activeConsultation.id);
      formData.append('patientId', activeConsultation.patient_id);
      formData.append('clinicId', activeConsultation.clinic_id);
      formData.append(
        'description',
        rxDescription.trim() || `${file.type === 'application/pdf' ? 'PDF' : 'Image'} Prescription`
      );

      const res = await fetch('/api/crm/prescriptions/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setConsultations((prev) =>
        prev.map((c) =>
          c.id === activeConsultation.id
            ? {
                ...c,
                prescriptions: [data.prescription, ...(c.prescriptions || [])],
              }
            : c
        )
      );
      setRxDescription('');
      e.target.value = '';
      setToast(
        `Uploaded ${data.prescription.file_type.toUpperCase()} prescription "${
          data.prescription.file_name
        }" — now accessible in Patient Portal!`
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prescription upload failed');
    } finally {
      setUploadingFile(false);
    }
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center gap-2.5 text-xs sm:text-sm font-bold text-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-xs sm:text-sm font-bold text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Quick Bar: Convert Unopened Scheduled Appointments into Consultations */}
      {scheduledAppointments.length > 0 && (
        <div className="bg-white rounded-3xl p-5 border border-[#D6CFC2] shadow-sm space-y-3">
          <p className="text-xs font-extrabold uppercase tracking-wider text-[#00858E]">
            Convert Scheduled Appointments to Consultations ({scheduledAppointments.length})
          </p>
          <div className="flex flex-wrap gap-2.5">
            {scheduledAppointments.map((appt) => (
              <button
                key={appt.id}
                type="button"
                disabled={convertingApptId === appt.id}
                onClick={() => handleConvertAppointment(appt.id)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#F5F2EB] hover:bg-[#00858E] text-[#141413] hover:text-white border border-[#D6CFC2] text-xs font-bold transition-colors"
              >
                {convertingApptId === appt.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Stethoscope className="h-3.5 w-3.5" />
                )}
                <span>
                  {appt.patient?.full_name} ({formatDateIST(appt.start_time)})
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 4 Cols: All Consultations List */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#141413]/70">
            All Consultations ({consultations.length})
          </h2>

          <div className="space-y-3">
            {consultations.map((c) => {
              const isSelected = activeConsultation?.id === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => selectConsultation(c)}
                  className={cn(
                    'w-full text-left p-4 rounded-2xl border transition-all space-y-1.5',
                    isSelected
                      ? 'bg-white border-2 border-[#00858E] shadow-md'
                      : 'bg-white/80 border-[#D6CFC2] hover:border-[#00858E]/50'
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-extrabold text-[#141413]">
                      {c.patient?.full_name || 'Patient'}
                    </span>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase',
                        c.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      )}
                    >
                      {c.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#00858E]">
                    {c.physio?.full_name || 'Clinic Specialist'}
                  </p>
                  <p className="text-[11px] text-[#141413]/65 line-clamp-1">
                    {c.diagnosis || c.chief_complaint || 'Clinical evaluation in progress'}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-[#141413]/55 pt-1">
                    <span>{formatDateIST(c.created_at)}</span>
                    <span>{(c.prescriptions || []).length} Prescription(s)</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 8 Cols: Active Consultation Editor + PDF/Image Prescription Uploader */}
        <div className="lg:col-span-8">
          {!activeConsultation ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#D6CFC2]">
              <Stethoscope className="h-10 w-10 text-[#00858E] mx-auto mb-3" />
              <p className="text-base font-extrabold text-[#141413]">
                Select a consultation or convert a scheduled appointment above
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D6CFC2] shadow-sm space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2D7] pb-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#00858E]">
                      Clinical Consultation Sheet
                    </span>
                    <span
                      className={cn(
                        'px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase',
                        activeConsultation.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      )}
                    >
                      {activeConsultation.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-[#141413] mt-1">
                    {activeConsultation.patient?.full_name}
                  </h2>
                  <p className="text-xs text-[#141413]/70">
                    Attending: <strong>{activeConsultation.physio?.full_name || 'Clinic Specialist'}</strong>{' '}
                    • {activeConsultation.clinic?.name || 'The Physio Lab — Barewal Awana'}
                  </p>
                </div>

                <Link
                  href={`/crm/patients/${activeConsultation.patient_id}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F5F2EB] border border-[#D6CFC2] text-xs font-bold text-[#141413] hover:border-[#00858E]"
                >
                  <User className="h-3.5 w-3.5 text-[#00858E]" />
                  <span>View Patient History</span>
                </Link>
              </div>

              {/* Clinical Notes Form */}
              <div className="space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">
                      Chief Complaint
                    </label>
                    <input
                      type="text"
                      value={chiefComplaint}
                      onChange={(e) => setChiefComplaint(e.target.value)}
                      placeholder="Primary symptoms & pain area..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D6CFC2] bg-[#F5F2EB]/50 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">
                      Clinical Diagnosis
                    </label>
                    <input
                      type="text"
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      placeholder="e.g., Grade-II Right Knee ACL Sprain"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D6CFC2] bg-[#F5F2EB]/50 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-1">
                    SOAP / Clinical Assessment Notes
                  </label>
                  <textarea
                    rows={3}
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    placeholder="Range of motion, special tests, Desmotec force metrics, manual therapy performed..."
                    className="w-full p-3.5 rounded-2xl border border-[#D6CFC2] bg-[#F5F2EB]/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-1">
                    Rehabilitation Protocol &amp; Home Exercise Plan (Visible in Patient Portal)
                  </label>
                  <textarea
                    rows={4}
                    value={treatmentPlan}
                    onChange={(e) => setTreatmentPlan(e.target.value)}
                    placeholder="1. Eccentric squats 3x10&#10;2. Resistance band exercises..."
                    className="w-full p-3.5 rounded-2xl border border-[#D6CFC2] bg-[#F5F2EB]/50"
                  />
                </div>

                <div className="sm:w-1/2">
                  <label className="block text-xs font-bold uppercase mb-1">
                    Recommended Follow-Up Date
                  </label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D6CFC2] bg-[#F5F2EB]/50 font-semibold"
                  />
                </div>
              </div>

              {/* Dual PDF & Image Prescription Uploader */}
              <div className="p-5 rounded-2xl bg-[#F5F2EB]/80 border-2 border-dashed border-[#00858E]/40 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#00858E]">
                      Private Supabase Storage Bucket (prescriptions/)
                    </span>
                    <h3 className="text-base font-extrabold text-[#141413]">
                      Upload Prescription (Both PDF &amp; Image Supported)
                    </h3>
                    <p className="text-xs text-[#141413]/65">
                      Supports <code>.pdf</code> documents and <code>.jpg / .png / .webp</code>{' '}
                      exercise chart photos (max 10 MB).
                    </p>
                  </div>

                  <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#00858E] hover:bg-[#006D75] text-white text-xs font-extrabold shadow-sm shrink-0 transition-colors">
                    {uploadingFile ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UploadCloud className="h-4 w-4" />
                    )}
                    <span>{uploadingFile ? 'Uploading...' : 'Select PDF or Image'}</span>
                    <input
                      type="file"
                      accept="application/pdf,image/jpeg,image/png,image/webp"
                      onChange={handlePrescriptionUpload}
                      disabled={uploadingFile}
                      className="hidden"
                    />
                  </label>
                </div>

                <input
                  type="text"
                  value={rxDescription}
                  onChange={(e) => setRxDescription(e.target.value)}
                  placeholder="Optional prescription title/notes (e.g., Phase-2 Desmotec Rehab Chart)..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D6CFC2] bg-white text-xs"
                />

                {/* Attached Prescriptions List */}
                {(activeConsultation.prescriptions || []).length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-[#D6CFC2]">
                    <p className="text-[11px] font-extrabold uppercase text-[#141413]/65">
                      Uploaded Prescriptions ({(activeConsultation.prescriptions || []).length})
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {(activeConsultation.prescriptions || []).map((rx) => (
                        <div
                          key={rx.id}
                          className="p-3 rounded-xl bg-white border border-[#D6CFC2] flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {rx.file_type === 'pdf' ? (
                              <FileText className="h-4 w-4 text-[#00858E] shrink-0" />
                            ) : (
                              <ImageIcon className="h-4 w-4 text-[#00858E] shrink-0" />
                            )}
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[#141413] truncate">
                                {rx.file_name}
                              </p>
                              <p className="text-[10px] text-[#141413]/55">
                                {rx.file_type.toUpperCase()} • {formatFileSize(rx.file_size_bytes)}
                              </p>
                            </div>
                          </div>
                          <a
                            href={rx.signed_url || rx.storage_path}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={rx.file_name}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#DCE8E6] text-[#006D75] text-[11px] font-bold shrink-0"
                          >
                            <Download className="h-3 w-3" />
                            <span>View</span>
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons: Save Draft vs Mark as Complete */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-[#E8E2D7]">
                <button
                  type="button"
                  disabled={savingNotes}
                  onClick={() => handleSaveConsultation(false)}
                  className="px-5 py-3 rounded-xl border border-[#D6CFC2] bg-[#F5F2EB] hover:bg-[#E8E2D7] text-xs font-bold text-[#141413]"
                >
                  Save Draft Notes
                </button>

                <button
                  type="button"
                  disabled={savingNotes}
                  onClick={() => handleSaveConsultation(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00858E] hover:bg-[#006D75] text-white text-xs sm:text-sm font-extrabold shadow-md transition-colors"
                >
                  {savingNotes ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ClipboardCheck className="h-4 w-4" />
                  )}
                  <span>Mark Consultation as Complete &amp; Sync to History</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
