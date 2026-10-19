'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CalendarPlus,
  CheckCircle2,
  ClipboardList,
  Loader2,
  MessageSquare,
  Phone,
  Search,
  UserPlus,
  X,
} from 'lucide-react';
import type { PatientRecord } from '@/types/database.types';
import { formatPhoneDisplay, formatDateIST } from '@/lib/utils';

export function PatientDirectoryClient({
  initialPatients,
}: {
  initialPatients: PatientRecord[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [patients, setPatients] = useState<PatientRecord[]>(initialPatients);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);

  // Create Patient Modal State
  const [showCreateModal, setShowCreateModal] = useState(searchParams.get('new') === '1');
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
      setToastMsg(`Patient profile saved for ${data.patient.full_name}`);
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
        `WhatsApp follow-up message sent to ${patient.full_name} (${formatPhoneDisplay(
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
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-300 flex items-center justify-between gap-4 text-xs sm:text-sm font-bold text-emerald-800">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{toastMsg}</span>
          </span>
          <button type="button" onClick={() => setToastMsg(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Search Bar & Add Patient Button */}
      <div className="bg-white rounded-lg p-5 sm:p-6 border border-border shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-primary absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Instant search by patient name or mobile number (+91...)..."
            className="w-full pl-11 pr-10 py-3 rounded-xl border border-border bg-muted/50 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-[#00858E]"
          />
          {searching && (
            <Loader2 className="h-4 w-4 text-primary animate-spin absolute right-4 top-1/2 -translate-y-1/2" />
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-xs sm:text-sm shadow-sm transition-colors shrink-0"
        >
          <UserPlus className="h-4 w-4" />
          <span>+ Create Patient Profile</span>
        </button>
      </div>

      {/* Patient Directory Cards / Table */}
      <div className="grid grid-cols-1 gap-4">
        {patients.map((patient) => (
          <div
            key={patient.id}
            className="bg-white rounded-lg p-5 sm:p-6 border border-border shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5 hover:border-primary/60 transition-all"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <Link
                  href={`/crm/patients/${patient.id}`}
                  className="text-lg font-semibold text-foreground hover:text-primary"
                >
                  {patient.full_name}
                </Link>
                <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-secondary text-[#006D75]">
                  <Phone className="h-3 w-3" />
                  {formatPhoneDisplay(patient.phone)}
                </span>
                {patient.gender && (
                  <span className="text-xs font-semibold uppercase text-muted-foreground">
                    • {patient.gender}
                  </span>
                )}
                {patient.date_of_birth && (
                  <span className="text-xs text-muted-foreground">
                    • DOB: {formatDateIST(patient.date_of_birth)}
                  </span>
                )}
              </div>

              {patient.medical_history_notes && (
                <p className="text-xs text-muted-foreground bg-muted/50 px-3.5 py-2 rounded-xl border border-border">
                  <strong className="text-primary">Clinical Alert / History:</strong>{' '}
                  {patient.medical_history_notes}
                </p>
              )}

              {patient.general_notes && (
                <p className="text-xs text-foreground/65">
                  <strong>Notes:</strong> {patient.general_notes}
                </p>
              )}
            </div>

            {/* 1-Click Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Link
                href={`/crm/schedule?book=1&patientId=${patient.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <CalendarPlus className="h-3.5 w-3.5" />
                <span>Book Appointment</span>
              </Link>

              <button
                type="button"
                disabled={sendingWaId === patient.id}
                onClick={() => handleOneClickWhatsApp(patient)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
              >
                {sendingWaId === patient.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <MessageSquare className="h-3.5 w-3.5" />
                )}
                <span>Send WhatsApp</span>
              </button>

              <Link
                href={`/crm/patients/${patient.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-muted/50 hover:bg-secondary text-foreground border border-border text-xs font-bold transition-colors"
              >
                <ClipboardList className="h-3.5 w-3.5 text-primary" />
                <span>Unified History</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Patient Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-xl w-full p-6 sm:p-8 border border-border shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E8E2D7] pb-4">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                  Patient Registration
                </span>
                <h2 className="text-xl font-semibold text-foreground">
                  Create / Update Patient Profile
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-xl bg-muted/50 text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleCreatePatient} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g., Gurpreet Singh"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/50 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">
                    WhatsApp Mobile *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98150-00000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/50 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'other')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/50 font-semibold"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/50 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Optional"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/50 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Barewal Awana / Sarabha Nagar, Ludhiana"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1">
                  Clinical History &amp; Medical Alerts
                </label>
                <textarea
                  rows={2}
                  value={medicalNotes}
                  onChange={(e) => setMedicalNotes(e.target.value)}
                  placeholder="Past surgeries, ortho/neuro history, allergies..."
                  className="w-full p-3 rounded-xl border border-border bg-muted/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1">
                  Reception / General Notes
                </label>
                <textarea
                  rows={2}
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  placeholder="Preferred timings, package notes..."
                  className="w-full p-3 rounded-xl border border-border bg-muted/50"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
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
                  className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold"
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
