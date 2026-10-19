'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Plus,
  ShieldAlert,
  Stethoscope,
  Users,
} from 'lucide-react';
import type {
  ClinicRecord,
  MessageTemplateRecord,
  ProfileRecord,
  UserRole,
} from '@/types/database.types';
import { cn, formatPhoneDisplay } from '@/lib/utils';

interface AdminControlsClientProps {
  currentUserRole: UserRole;
  initialClinics: ClinicRecord[];
  initialProfiles: ProfileRecord[];
  initialTemplates: MessageTemplateRecord[];
}

export function AdminControlsClient({
  currentUserRole,
  initialClinics,
  initialProfiles,
  initialTemplates,
}: AdminControlsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'clinics' | 'users' | 'templates'>('clinics');

  const [clinics, setClinics] = useState<ClinicRecord[]>(initialClinics);
  const [profiles, setProfiles] = useState<ProfileRecord[]>(initialProfiles);
  const [templates, setTemplates] = useState<MessageTemplateRecord[]>(initialTemplates);

  // Add Clinic Form
  const [clinicName, setClinicName] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [clinicPhone, setClinicPhone] = useState('+91 93161-96000');
  const [slotDuration, setSlotDuration] = useState(30);

  // Add Physio / Staff Form
  const [userFullName, setUserFullName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userRole, setUserRole] = useState<'physio' | 'staff' | 'admin'>('physio');
  const [userSpecialization, setUserSpecialization] = useState('');

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = currentUserRole === 'admin';

  async function handleSaveClinic(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setToast(null);
    try {
      const res = await fetch('/api/crm/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity: 'clinic',
          name: clinicName,
          address: clinicAddress,
          phone: clinicPhone,
          default_slot_duration_mins: slotDuration,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save clinic');

      setClinics((prev) => [
        ...prev.filter((c) => c.id !== data.clinic.id),
        data.clinic,
      ]);
      setClinicName('');
      setClinicAddress('');
      setToast(`Saved clinic branch: ${data.clinic.name}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save clinic');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveUserProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setToast(null);
    try {
      const res = await fetch('/api/crm/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity: 'profile',
          full_name: userFullName,
          email: userEmail,
          phone: userPhone,
          role: userRole,
          specialization: userSpecialization,
          primary_clinic_id: clinics[0]?.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save user profile');

      setProfiles((prev) => [
        ...prev.filter((p) => p.id !== data.profile.id),
        data.profile,
      ]);
      setUserFullName('');
      setUserEmail('');
      setUserPhone('');
      setUserSpecialization('');
      setToast(`Added ${data.profile.role.toUpperCase()} profile: ${data.profile.full_name}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save user');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateTemplate(tpl: MessageTemplateRecord) {
    setSaving(true);
    setError(null);
    setToast(null);
    try {
      const res = await fetch('/api/crm/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity: 'template',
          id: tpl.id,
          meta_template_name: tpl.meta_template_name,
          body_preview: tpl.body_preview,
          is_active: tpl.is_active,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not update template');
      setToast(`Updated WhatsApp template "${tpl.name}"`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Template update failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {!isAdmin && (
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-300 flex items-center gap-3 text-xs sm:text-sm font-bold text-amber-900">
          <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0" />
          <span>
            You are currently viewing Admin Controls in read-only mode as{' '}
            <strong>{currentUserRole.toUpperCase()}</strong>. Switch to the{' '}
            <strong>Admin</strong> role via the sidebar to add/edit clinics, physios, or templates.
          </span>
        </div>
      )}

      {toast && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-300 flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-xs sm:text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      {/* Tab Selector */}
      <div className="inline-flex items-center rounded-lg bg-white p-1.5 border border-border shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab('clinics')}
          className={cn(
            'px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all',
            activeTab === 'clinics'
              ? 'bg-primary text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Building2 className="h-4 w-4" />
          <span>Manage Clinics ({clinics.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={cn(
            'px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all',
            activeTab === 'users'
              ? 'bg-primary text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Users className="h-4 w-4" />
          <span>Manage Physios &amp; Users ({profiles.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('templates')}
          className={cn(
            'px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all',
            activeTab === 'templates'
              ? 'bg-primary text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <MessageSquare className="h-4 w-4" />
          <span>WhatsApp Templates ({templates.length})</span>
        </button>
      </div>

      {/* TAB 1: MANAGE CLINICS */}
      {activeTab === 'clinics' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-4">
            {clinics.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-lg p-6 border border-border shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">{c.name}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-emerald-100 text-emerald-800">
                    Active Branch
                  </span>
                </div>
                <p className="text-xs text-foreground/75">
                  {c.address}, {c.city}, {c.state} — {c.pincode}
                </p>
                <p className="text-xs font-bold text-primary">
                  Phone: {formatPhoneDisplay(c.phone)} • Default Slot: {c.default_slot_duration_mins}{' '}
                  mins
                </p>
              </div>
            ))}
          </div>

          <div className="lg:col-span-5">
            <form
              onSubmit={handleSaveClinic}
              className="bg-white rounded-lg p-6 border border-border shadow-sm space-y-4 text-xs sm:text-sm"
            >
              <h3 className="text-lg font-semibold text-foreground">
                + Add / Update Clinic Branch
              </h3>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Clinic Name *</label>
                <input
                  type="text"
                  required
                  disabled={!isAdmin}
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  placeholder="e.g., The Physio Lab — Sarabha Nagar"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/50 font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  disabled={!isAdmin}
                  value={clinicAddress}
                  onChange={(e) => setClinicAddress(e.target.value)}
                  placeholder="Sarabha Nagar Main Market, Ludhiana"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    disabled={!isAdmin}
                    value={clinicPhone}
                    onChange={(e) => setClinicPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/50 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">
                    Default Slot (Mins)
                  </label>
                  <input
                    type="number"
                    disabled={!isAdmin}
                    value={slotDuration}
                    onChange={(e) => setSlotDuration(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/50 font-semibold"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={!isAdmin || saving}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-primary text-white font-semibold disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                <span>Save Clinic Branch</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: MANAGE PHYSIOS & STAFF USERS */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-3">
            {profiles.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-lg p-5 border border-border shadow-sm flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-foreground">
                      {p.full_name}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-primary text-white">
                      {p.role}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-primary">
                    {p.specialization || 'Clinic Operations'}
                  </p>
                  <p className="text-xs text-foreground/65">
                    {p.email} • {formatPhoneDisplay(p.phone)}
                  </p>
                </div>
                <Stethoscope className="h-6 w-6 text-primary shrink-0" />
              </div>
            ))}
          </div>

          <div className="lg:col-span-5">
            <form
              onSubmit={handleSaveUserProfile}
              className="bg-white rounded-lg p-6 border border-border shadow-sm space-y-4 text-xs sm:text-sm"
            >
              <h3 className="text-lg font-semibold text-foreground">
                + Onboard Physio / Staff Member
              </h3>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  disabled={!isAdmin}
                  value={userFullName}
                  onChange={(e) => setUserFullName(e.target.value)}
                  placeholder="Dr. Simranjit Kaur, MPT"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/50 font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    disabled={!isAdmin}
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="doctor@thephysiolab.in"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Role *</label>
                  <select
                    disabled={!isAdmin}
                    value={userRole}
                    onChange={(e) =>
                      setUserRole(e.target.value as 'physio' | 'staff' | 'admin')
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/50 font-bold"
                  >
                    <option value="physio">Physio (Doctor)</option>
                    <option value="staff">Reception / Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Phone</label>
                <input
                  type="tel"
                  disabled={!isAdmin}
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  placeholder="+91 98153-70609"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">
                  Clinical Pillar / Specialization
                </label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={userSpecialization}
                  onChange={(e) => setUserSpecialization(e.target.value)}
                  placeholder="Sports Injury Centre / Neuro Rehab / Ortho"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/50"
                />
              </div>
              <button
                type="submit"
                disabled={!isAdmin || saving}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-primary text-white font-semibold disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                <span>Save User Profile</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: CONFIGURE WHATSAPP MESSAGE TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="bg-secondary rounded-lg p-4 border border-primary/25 text-xs font-semibold text-[#006D75]">
            Supported Dynamic Variables: <code>{'{{name}}'}</code> (Patient Name),{' '}
            <code>{'{{date}}'}</code> (Appointment Date &amp; Time IST),{' '}
            <code>{'{{clinic}}'}</code> (Clinic Branch), and <code>{'{{physio}}'}</code> (Assigned
            Physiotherapist).
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {templates.map((tpl, idx) => (
              <div
                key={tpl.id}
                className="bg-white rounded-lg p-6 border border-border shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                      Trigger: {tpl.trigger_type}
                    </span>
                    <h3 className="text-base font-semibold text-foreground">{tpl.name}</h3>
                  </div>

                  <label className="inline-flex items-center gap-2 text-xs font-bold">
                    <input
                      type="checkbox"
                      disabled={!isAdmin}
                      checked={tpl.is_active}
                      onChange={(e) => {
                        const next = [...templates];
                        next[idx] = { ...tpl, is_active: e.target.checked };
                        setTemplates(next);
                      }}
                      className="rounded border-border"
                    />
                    <span>Active</span>
                  </label>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1">
                    Meta Template Name
                  </label>
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={tpl.meta_template_name}
                    onChange={(e) => {
                      const next = [...templates];
                      next[idx] = { ...tpl, meta_template_name: e.target.value };
                      setTemplates(next);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/50 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1">
                    Template Body (`{'{{name}}'}`, `{'{{date}}'}`, `{'{{clinic}}'}`, `{'{{physio}}'}`)
                  </label>
                  <textarea
                    rows={3}
                    disabled={!isAdmin}
                    value={tpl.body_preview}
                    onChange={(e) => {
                      const next = [...templates];
                      next[idx] = { ...tpl, body_preview: e.target.value };
                      setTemplates(next);
                    }}
                    className="w-full p-3 rounded-xl border border-border bg-muted/50 text-xs"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={!isAdmin || saving}
                    onClick={() => handleUpdateTemplate(tpl)}
                    className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold disabled:opacity-50"
                  >
                    Save Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
