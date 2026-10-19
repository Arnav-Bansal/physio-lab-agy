'use client';

import React, { useMemo, useState } from 'react';
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
  Sparkles,
  Eye,
  X,
  Search,
  Phone,
} from 'lucide-react';
import type {
  AppointmentWithRelations,
  ConsultationRecord,
  PrescriptionRecord,
} from '@/types/database.types';
import { cn, formatDateIST, formatFileSize, formatPhoneDisplay } from '@/lib/utils';

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

const SOAP_MODALITY_CHIPS = [
  'Desmotec V.Line eccentric load symmetry tested',
  'Grade III–IV Maitland joint mobilization performed',
  'Lumbar traction & IFT electro-analgesia (15 mins)',
  'Myofascial dry needling & cupping release',
  'Active ROM improved by +15° post-session',
];

const REHAB_PROTOCOL_CHIPS = [
  '1. Desmotec Eccentric Flywheel Squats — 3 sets × 10 reps (controlled 4s eccentric)',
  '2. Isometric Quad Sets & Straight Leg Raises — 3 sets × 15 reps (twice daily)',
  '3. McKenzie Prone Lumbar Extensions — 2 sets × 12 reps every 4 hours',
  '4. Scapular Wall Slides & External Rotation Band Work — 3 sets × 12 reps',
  '5. Cryotherapy (Ice Pack) 15 mins post-exercise if mild soreness occurs',
];

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
  const [listFilter, setListFilter] = useState<'all' | 'in_progress' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

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
  const [painScore, setPainScore] = useState<number | null>(null);

  // Prescription Upload & Preview State
  const [uploadingFile, setUploadingFile] = useState(false);
  const [rxDescription, setRxDescription] = useState('');
  const [previewRx, setPreviewRx] = useState<PrescriptionRecord | null>(null);
  const [savingNotes, setSavingNotes] = useState(false);
  const [convertingApptId, setConvertingApptId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredConsultations = useMemo(() => {
    return consultations.filter((c) => {
      if (listFilter !== 'all' && c.status !== listFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = c.patient?.full_name?.toLowerCase().includes(q);
        const diagMatch = c.diagnosis?.toLowerCase().includes(q);
        if (!nameMatch && !diagMatch) return false;
      }
      return true;
    });
  }, [consultations, listFilter, searchQuery]);

  function selectConsultation(c: ConsultationListItem) {
    setSelectedId(c.id);
    setChiefComplaint(c.chief_complaint || '');
    setDiagnosis(c.diagnosis || '');
    setClinicalNotes(c.clinical_notes || '');
    setTreatmentPlan(c.treatment_plan || '');
    setFollowUpDate(c.follow_up_recommended_date || '');
    setPainScore(null);
    setError(null);
  }

  function handleApplyPainScore(score: number) {
    setPainScore(score);
    const tag = `[VAS Pain Score: ${score}/10]`;
    setClinicalNotes((prev) => {
      const cleaned = prev.replace(/\[VAS Pain Score:\s*\d+\/10\]\s*/g, '');
      return `${tag} ${cleaned}`.trim();
    });
  }

  function appendChip(target: 'soap' | 'rehab', text: string) {
    if (target === 'soap') {
      setClinicalNotes((prev) => (prev ? `${prev}\n• ${text}` : `• ${text}`));
    } else {
      setTreatmentPlan((prev) => (prev ? `${prev}\n${text}` : text));
    }
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
          ? 'Consultation completed! Clinical notes & prescriptions are now live in the Patient Portal.'
          : 'Clinical draft notes saved.'
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
        rxDescription.trim() ||
          `${file.type === 'application/pdf' ? 'PDF' : 'Image'} Rehab Prescription`
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
        `Attached ${data.prescription.file_type.toUpperCase()} prescription "${
          data.prescription.file_name
        }" — synced to Patient Portal.`
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
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between gap-2.5 text-xs sm:text-sm font-bold text-emerald-800">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{toast}</span>
          </span>
          <button type="button" onClick={() => setToast(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-xs sm:text-sm font-bold text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Quick Bar: Convert Unopened Scheduled Appointments into Consultations */}
      {scheduledAppointments.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-border shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>
                Start Consultation from Scheduled Queue ({scheduledAppointments.length})
              </span>
            </p>
            <span className="text-[11px] text-muted-foreground">
              Click any patient below to open their clinical chart
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {scheduledAppointments.map((appt) => (
              <button
                key={appt.id}
                type="button"
                disabled={convertingApptId === appt.id}
                onClick={() => handleConvertAppointment(appt.id)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-secondary/70 hover:bg-primary text-secondary-foreground hover:text-white border border-primary/15 text-xs font-bold transition-all"
              >
                {convertingApptId === appt.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Stethoscope className="h-3.5 w-3.5" />
                )}
                <span>{appt.patient?.full_name}</span>
                <span className="font-mono text-[10px] opacity-75">
                  ({formatDateIST(appt.start_time)})
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Split Clinical Charting Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 4 Cols: Filterable Consultation Charts List */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-border shadow-sm p-4 space-y-4">
          <div className="space-y-2.5">
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-primary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search charts by patient or diagnosis..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-muted/40 text-xs font-medium"
              />
            </div>

            <div className="grid grid-cols-3 gap-1 bg-muted/60 p-1 rounded-xl border border-border">
              {(
                [
                  { id: 'all', label: `All (${consultations.length})` },
                  {
                    id: 'in_progress',
                    label: `Open (${consultations.filter((c) => c.status === 'in_progress').length})`,
                  },
                  {
                    id: 'completed',
                    label: `Done (${consultations.filter((c) => c.status === 'completed').length})`,
                  },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setListFilter(tab.id)}
                  className={cn(
                    'py-1.5 rounded-lg text-[11px] font-bold transition-all',
                    listFilter === tab.id
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 max-h-[680px] overflow-y-auto pr-1">
            {filteredConsultations.map((c) => {
              const isSelected = activeConsultation?.id === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => selectConsultation(c)}
                  className={cn(
                    'w-full text-left p-4 rounded-xl border transition-all space-y-1.5',
                    isSelected
                      ? 'bg-secondary/60 border-2 border-primary shadow-sm'
                      : 'bg-muted/30 border-border hover:border-primary/40'
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-foreground truncate">
                      {c.patient?.full_name || 'Patient'}
                    </span>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0',
                        c.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      )}
                    >
                      {c.status === 'completed' ? 'Completed' : 'In Progress'}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-primary truncate">
                    {c.physio?.full_name || 'Clinic Specialist'}
                  </p>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">
                    {c.diagnosis || c.chief_complaint || 'Clinical assessment in progress'}
                  </p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground pt-1 border-t border-border/60">
                    <span>{formatDateIST(c.created_at)}</span>
                    <span>{(c.prescriptions || []).length} Rx File(s)</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 8 Cols: Active SOAP & Rehab Chart Editor (Prompt EMR Style) */}
        <div className="lg:col-span-8">
          {!activeConsultation ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-border">
              <Stethoscope className="h-10 w-10 text-primary mx-auto mb-3" />
              <p className="text-base font-bold text-foreground">
                Select a consultation chart or open a scheduled appointment above
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-border shadow-sm space-y-6">
              {/* Patient Clinical Chart Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-secondary px-2.5 py-0.5 rounded-md">
                      SOAP &amp; Rehab Chart
                    </span>
                    <span
                      className={cn(
                        'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase',
                        activeConsultation.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      )}
                    >
                      {activeConsultation.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground pt-1">
                    {activeConsultation.patient?.full_name}
                  </h2>
                  <p className="text-xs text-muted-foreground flex items-center gap-3 flex-wrap">
                    {activeConsultation.patient?.phone && (
                      <span className="font-mono inline-flex items-center gap-1">
                        <Phone className="h-3 w-3 text-primary" />
                        {formatPhoneDisplay(activeConsultation.patient.phone)}
                      </span>
                    )}
                    <span>
                      • Specialist:{' '}
                      <strong className="text-foreground">
                        {activeConsultation.physio?.full_name || 'Clinic Specialist'}
                      </strong>
                    </span>
                  </p>
                </div>

                <Link
                  href={`/crm/patients/${activeConsultation.patient_id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-muted/60 hover:bg-secondary border border-border text-xs font-bold text-foreground transition-colors self-start"
                >
                  <User className="h-3.5 w-3.5 text-primary" />
                  <span>Full Longitudinal History</span>
                </Link>
              </div>

              {/* Interactive VAS Pain Scale Selector (0-10) */}
              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Quick VAS Pain Intensity Scale (0 = Pain-Free, 10 = Severe)
                  </span>
                  {painScore !== null && (
                    <span className="font-mono text-xs font-bold text-primary">
                      Logged: {painScore}/10
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-11 gap-1.5">
                  {Array.from({ length: 11 }, (_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleApplyPainScore(i)}
                      className={cn(
                        'py-1.5 rounded-lg font-mono text-xs font-bold border transition-all',
                        painScore === i
                          ? 'bg-primary text-white border-primary shadow-sm'
                          : i <= 3
                          ? 'bg-emerald-50/70 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                          : i <= 6
                          ? 'bg-amber-50/70 text-amber-900 border-amber-200 hover:bg-amber-100'
                          : 'bg-red-50/70 text-red-900 border-red-200 hover:bg-red-100'
                      )}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clinical Notes Form */}
              <div className="space-y-5 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                      Chief Complaint &amp; Pain Area
                    </label>
                    <input
                      type="text"
                      value={chiefComplaint}
                      onChange={(e) => setChiefComplaint(e.target.value)}
                      placeholder="Primary symptoms & onset..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/40 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                      Clinical Diagnosis
                    </label>
                    <input
                      type="text"
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      placeholder="e.g., Grade-II Right Knee ACL Sprain"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/40 font-semibold"
                    />
                  </div>
                </div>

                {/* SOAP Notes + 1-Click Modality Quick-Chips */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase text-muted-foreground">
                      SOAP Assessment &amp; In-Clinic Modalities Performed
                    </label>
                    <span className="text-[11px] text-primary font-semibold">
                      Click chip to insert
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {SOAP_MODALITY_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => appendChip('soap', chip)}
                        className="px-2.5 py-1 rounded-lg bg-secondary/70 hover:bg-primary text-secondary-foreground hover:text-white text-[11px] font-semibold transition-colors"
                      >
                        + {chip}
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows={3}
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    placeholder="Range of motion, special orthopedic tests, Desmotec force metrics, manual therapy performed..."
                    className="w-full p-3.5 rounded-xl border border-border bg-muted/40"
                  />
                </div>

                {/* Rehab Protocol + 1-Click Exercise Quick-Chips */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase text-muted-foreground">
                      Prescribed Rehab &amp; Home Exercise Plan (Synced to Patient Portal)
                    </label>
                    <span className="text-[11px] text-primary font-semibold">
                      Click exercise to append
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {REHAB_PROTOCOL_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => appendChip('rehab', chip)}
                        className="px-2.5 py-1 rounded-lg bg-muted/70 hover:bg-primary text-foreground hover:text-white border border-border text-[11px] font-medium transition-colors truncate max-w-xs"
                      >
                        + {chip.replace(/^\d+\.\s*/, '')}
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows={4}
                    value={treatmentPlan}
                    onChange={(e) => setTreatmentPlan(e.target.value)}
                    placeholder="1. Eccentric squats 3x10&#10;2. Resistance band exercises..."
                    className="w-full p-3.5 rounded-xl border border-border bg-muted/40"
                  />
                </div>

                <div className="sm:w-1/2">
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                    Recommended Next Review Date
                  </label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/40 font-mono font-semibold"
                  />
                </div>
              </div>

              {/* Clean Clinical Prescription Uploader (Supports Both PDF & Images) */}
              <div className="p-5 rounded-2xl bg-secondary/40 border-2 border-dashed border-primary/35 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      Digital Prescription &amp; Exercise Chart Attachment
                    </span>
                    <h3 className="text-base font-bold text-foreground">
                      Attach Prescription (PDF Document or Exercise Chart Image)
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Supports <code>.pdf</code> files and <code>.jpg / .png / .webp</code> camera
                      photos for instant patient download.
                    </p>
                  </div>

                  <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-sm shrink-0 transition-colors">
                    {uploadingFile ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UploadCloud className="h-4 w-4" />
                    )}
                    <span>{uploadingFile ? 'Uploading...' : 'Upload PDF / Image'}</span>
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
                  placeholder="Optional title (e.g., Phase-2 Desmotec ACL Rehab Chart)..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-xs"
                />

                {/* Attached Prescriptions List with Inline Preview */}
                {(activeConsultation.prescriptions || []).length > 0 && (
                  <div className="space-y-2.5 pt-2 border-t border-border/70">
                    <p className="text-[11px] font-bold uppercase text-muted-foreground">
                      Attached Prescriptions ({(activeConsultation.prescriptions || []).length})
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {(activeConsultation.prescriptions || []).map((rx) => (
                        <div
                          key={rx.id}
                          className="p-3 rounded-xl bg-white border border-border flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {rx.file_type === 'pdf' ? (
                              <FileText className="h-4 w-4 text-primary shrink-0" />
                            ) : (
                              <ImageIcon className="h-4 w-4 text-primary shrink-0" />
                            )}
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-foreground truncate">
                                {rx.file_name}
                              </p>
                              <p className="text-[10px] font-mono text-muted-foreground">
                                {rx.file_type.toUpperCase()} • {formatFileSize(rx.file_size_bytes)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => setPreviewRx(rx)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-muted hover:bg-secondary text-foreground text-[11px] font-bold"
                            >
                              <Eye className="h-3 w-3 text-primary" />
                              <span>Preview</span>
                            </button>
                            <a
                              href={rx.signed_url || rx.storage_path}
                              target="_blank"
                              rel="noopener noreferrer"
                              download={rx.file_name}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary text-white text-[11px] font-bold"
                            >
                              <Download className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons: Save Draft vs Mark as Complete */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  disabled={savingNotes}
                  onClick={() => handleSaveConsultation(false)}
                  className="px-5 py-3 rounded-xl border border-border bg-muted/50 hover:bg-muted text-xs font-bold text-foreground transition-colors"
                >
                  Save Draft Chart
                </button>

                <button
                  type="button"
                  disabled={savingNotes}
                  onClick={() => handleSaveConsultation(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-bold shadow-md shadow-primary/20 transition-all"
                >
                  {savingNotes ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ClipboardCheck className="h-4 w-4" />
                  )}
                  <span>Complete Consultation &amp; Publish to Portal</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Inline Prescription Preview Lightbox Modal */}
      {previewRx && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewRx(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-border flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  {previewRx.file_type.toUpperCase()} Prescription Preview
                </span>
                <h3 className="text-base font-bold text-foreground">{previewRx.file_name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewRx.signed_url || previewRx.storage_path}
                  download={previewRx.file_name}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-bold"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewRx(null)}
                  className="p-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-[#141E1E] overflow-auto flex items-center justify-center min-h-[460px]">
              {previewRx.file_type === 'pdf' ? (
                <iframe
                  src={previewRx.signed_url || previewRx.storage_path}
                  title={previewRx.file_name}
                  className="w-full h-[540px] bg-white"
                />
              ) : (
                <img
                  src={previewRx.signed_url || previewRx.storage_path}
                  alt={previewRx.file_name}
                  className="max-h-[540px] w-auto object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
