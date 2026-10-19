'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CalendarPlus,
  CheckCircle2,
  ClipboardList,
  LayoutGrid,
  List,
  Loader2,
  MessageSquare,
  Phone,
  Search,
  UserPlus,
  X,
  AlertTriangle,
} from 'lucide-react';
import type { PatientRecord } from '@/types/database.types';
import { cn, formatPhoneDisplay, formatDateIST } from '@/lib/utils';

export function PatientDirectoryClient({
  initialPatients,
  currentUserRole = 'admin',
}: {
  initialPatients: PatientRecord[];
  currentUserRole?: 'admin' | 'staff' | 'physio' | 'patient';
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPhysio = currentUserRole === 'physio';

  const [patients, setPatients] = useState<PatientRecord[]>(initialPatients);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'table' | 'cards'>('table');

  // Slide-Over Create Patient Drawer State (Admin & Staff only)
  const [showCreateModal, setShowCreateModal] = useState(
    !isPhysio && searchParams.get('new') === '1'
  );
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [generalNotes, setGeneralNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1-Click Quick WhatsApp state
  const [sendingWaId, setSendingWaId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Debounced fast search by name or phone number
  useEffect(() => {
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/crm/patients?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (res.ok && Array.isArray(data.patients)) {
          setPatients(data.patients);
        }
      } finally {
        setSearching(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  async function handleCreatePatient(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch('/api/crm/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          phone,
          email: email || null,
          gender,
          date_of_birth: dob || null,
          address: address || null,
          medical_history_notes: medicalNotes || null,
          general_notes: generalNotes || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save patient');

      setPatients((prev) => [
        data.patient,
        ...prev.filter((p) => p.id !== data.patient.id),
      ]);
      setShowCreateModal(false);
      setFullName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setMedicalNotes('');
      setGeneralNotes('');
      setToastMsg(`Patient profile registered for ${data.patient.full_name}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save patient');
    } finally {
      setSaving(false);
    }
  }

  async function handleOneClickWhatsApp(patient: PatientRecord) {
    setSendingWaId(patient.id);
    setToastMsg(null);
    try {
      const res = await fetch('/api/crm/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patient.id,
          customNote: 'Rehabilitation & Recovery Follow-Up Check-In',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'WhatsApp dispatch failed');
      setToastMsg(
        `WhatsApp follow-up message dispatched to ${patient.full_name} (${formatPhoneDisplay(
          patient.phone
        )})`
      );
    } catch (err) {
      setToastMsg(err instanceof Error ? err.message : 'Failed to send WhatsApp');
    } finally {
      setSendingWaId(null);
    }
  }

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between gap-4 text-xs sm:text-sm font-bold text-emerald-800">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{toastMsg}</span>
          </span>
          <button type="button" onClick={() => setToastMsg(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Search Bar, Layout Toggle & Add Patient Button */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-border shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-primary absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Instant search by patient name or WhatsApp mobile (+91...)..."
            className="w-full pl-11 pr-10 py-3 rounded-xl border border-border bg-muted/40 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {searching && (
            <Loader2 className="h-4 w-4 text-primary animate-spin absolute right-4 top-1/2 -translate-y-1/2" />
          )}
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="inline-flex items-center rounded-xl bg-muted/60 p-1 border border-border">
            <button
              type="button"
              onClick={() => setLayoutMode('table')}
              className={cn(
                'px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all',
                layoutMode === 'table'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <List className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('cards')}
              className={cn(
                'px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all',
                layoutMode === 'cards'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Cards</span>
            </button>
          </div>

          {!isPhysio && (
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs sm:text-sm shadow-sm transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              <span>+ Register Patient</span>
            </button>
          )}
        </div>
      </div>

      {/* HIGH-DENSITY CLINICAL TABLE VIEW */}
      {layoutMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="py-3.5 px-5">Patient</th>
                  <th className="py-3.5 px-4">WhatsApp Mobile</th>
                  <th className="py-3.5 px-4">Clinical Alerts &amp; Notes</th>
                  <th className="py-3.5 px-5 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70 text-xs sm:text-sm">
                {patients.map((patient) => {
                  const initials = patient.full_name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2);

                  return (
                    <tr
                      key={patient.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-secondary text-primary font-bold text-xs flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <div>
                            <Link
                              href={`/crm/patients/${patient.id}`}
                              className="font-bold text-foreground hover:text-primary block"
                            >
                              {patient.full_name}
                            </Link>
                            <span className="text-[11px] text-muted-foreground">
                              {patient.gender ? patient.gender.toUpperCase() : 'PT'}
                              {patient.date_of_birth
                                ? ` • DOB: ${formatDateIST(patient.date_of_birth)}`
                                : ''}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold px-2.5 py-1 rounded-lg bg-secondary/70 text-secondary-foreground">
                          <Phone className="h-3 w-3 text-primary" />
                          {formatPhoneDisplay(patient.phone)}
                        </span>
                      </td>

                      <td className="py-4 px-4 max-w-md">
                        {patient.medical_history_notes ? (
                          <div className="inline-flex items-start gap-1.5 text-xs text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{patient.medical_history_notes}</span>
                          </div>
                        ) : patient.general_notes ? (
                          <span className="text-xs text-muted-foreground line-clamp-1">
                            {patient.general_notes}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground/50">—</span>
                        )}
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          {!isPhysio && (
                            <>
                              <Link
                                href={`/crm/schedule?book=1&patientId=${patient.id}`}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold transition-colors"
                              >
                                <CalendarPlus className="h-3.5 w-3.5" />
                                <span>Book</span>
                              </Link>
                              <button
                                type="button"
                                disabled={sendingWaId === patient.id}
                                onClick={() => handleOneClickWhatsApp(patient)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                              >
                                {sendingWaId === patient.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <MessageSquare className="h-3.5 w-3.5" />
                                )}
                                <span>WhatsApp</span>
                              </button>
                            </>
                          )}
                          <Link
                            href={`/crm/patients/${patient.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-muted/60 hover:bg-secondary text-foreground border border-border text-xs font-bold transition-colors"
                          >
                            <ClipboardList className="h-3.5 w-3.5 text-primary" />
                            <span>History</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARD GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patients.map((patient) => (
            <div
              key={patient.id}
              className="bg-white rounded-2xl p-5 sm:p-6 border border-border shadow-sm flex flex-col justify-between gap-4 hover:border-primary/50 transition-all"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <Link
                    href={`/crm/patients/${patient.id}`}
                    className="text-lg font-bold text-foreground hover:text-primary"
                  >
                    {patient.full_name}
                  </Link>
                  <span className="inline-flex items-center gap-1 font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
                    <Phone className="h-3 w-3 text-primary" />
                    {formatPhoneDisplay(patient.phone)}
                  </span>
                </div>

                {patient.medical_history_notes && (
                  <p className="text-xs text-amber-900 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200">
                    <strong>Clinical Alert:</strong> {patient.medical_history_notes}
                  </p>
                )}

                {patient.general_notes && (
                  <p className="text-xs text-muted-foreground">
                    <strong>Notes:</strong> {patient.general_notes}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border/70">
                {!isPhysio && (
                  <>
                    <Link
                      href={`/crm/schedule?book=1&patientId=${patient.id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold transition-colors"
                    >
                      <CalendarPlus className="h-3.5 w-3.5" />
                      <span>Book Slot</span>
                    </Link>

                    <button
                      type="button"
                      disabled={sendingWaId === patient.id}
                      onClick={() => handleOneClickWhatsApp(patient)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      {sendingWaId === patient.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <MessageSquare className="h-3.5 w-3.5" />
                      )}
                      <span>WhatsApp</span>
                    </button>
                  </>
                )}

                <Link
                  href={`/crm/patients/${patient.id}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-muted/60 hover:bg-secondary text-foreground border border-border text-xs font-bold transition-colors ml-auto"
                >
                  <ClipboardList className="h-3.5 w-3.5 text-primary" />
                  <span>Unified History</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide-Over Create Patient Drawer */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-white max-w-lg w-full h-full p-6 sm:p-8 border-l border-border shadow-2xl space-y-5 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                  Patient Intake &amp; Registration
                </span>
                <h2 className="text-xl font-bold text-foreground mt-0.5">
                  Register Patient Profile
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-xl bg-muted/60 text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleCreatePatient} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g., Gurpreet Singh"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/40 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                    WhatsApp Mobile *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98150-00000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/40 font-mono font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'other')}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/40 font-semibold"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/40 font-mono font-semibold text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Optional"
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                  Residential Area / Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Barewal Awana / Sarabha Nagar, Ludhiana"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                  Clinical History &amp; Medical Alerts
                </label>
                <textarea
                  rows={2}
                  value={medicalNotes}
                  onChange={(e) => setMedicalNotes(e.target.value)}
                  placeholder="Past surgeries, pacemaker/implant alerts, ortho/neuro history..."
                  className="w-full p-3 rounded-xl border border-border bg-muted/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                  Reception &amp; Package Notes
                </label>
                <textarea
                  rows={2}
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  placeholder="Preferred slot timings, referral source..."
                  className="w-full p-3 rounded-xl border border-border bg-muted/40"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-border font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold shadow-md"
                >
                  {saving ? 'Saving...' : 'Save Patient Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
