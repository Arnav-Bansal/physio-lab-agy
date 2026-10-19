'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CalendarCheck,
  Clock,
  MapPin,
  Stethoscope,
  CheckCircle2,
  Loader2,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import type { ClinicRecord, ProfileRecord } from '@/types/database.types';
import type { AvailableSlotDTO } from '@/lib/repositories/interfaces';
import { cn } from '@/lib/utils';

interface SelfBookingWizardProps {
  clinics: ClinicRecord[];
  physios: ProfileRecord[];
  initialPhysioId?: string;
}

export function SelfBookingWizard({
  clinics,
  physios,
  initialPhysioId,
}: SelfBookingWizardProps) {
  const router = useRouter();

  const tomorrowDateStr = new Date(Date.now() + 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const [clinicId, setClinicId] = useState(clinics[0]?.id || '');
  const [physioId, setPhysioId] = useState(initialPhysioId || 'any');
  const [dateStr, setDateStr] = useState(tomorrowDateStr);
  const [durationMins, setDurationMins] = useState(30);
  const [slots, setSlots] = useState<AvailableSlotDTO[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlotDTO | null>(null);
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!clinicId || !dateStr) return;
    let active = true;
    setLoadingSlots(true);
    setSelectedSlot(null);

    fetch(
      `/api/portal/slots?clinicId=${encodeURIComponent(
        clinicId
      )}&physioId=${encodeURIComponent(physioId)}&date=${encodeURIComponent(
        dateStr
      )}&duration=${durationMins}`
    )
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        const fetched = (data.slots || []) as AvailableSlotDTO[];
        setSlots(fetched);
        const firstAvailable = fetched.find((s) => s.available);
        if (firstAvailable) setSelectedSlot(firstAvailable);
      })
      .catch(() => {
        if (active) setSlots([]);
      })
      .finally(() => {
        if (active) setLoadingSlots(false);
      });

    return () => {
      active = false;
    };
  }, [clinicId, physioId, dateStr, durationMins]);

  async function handleConfirmBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlot) {
      setError('Please select an available time slot.');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/portal/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicId,
          physioId: physioId === 'any' ? null : physioId,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          chiefComplaint:
            chiefComplaint.trim() || 'Physiotherapy & Rehabilitation Consultation',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not confirm booking');
      }

      setSuccessMessage(
        'Appointment confirmed! A WhatsApp confirmation and automatic 24h / 2h reminders have been scheduled.'
      );
      setTimeout(() => {
        router.push('/portal');
        router.refresh();
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleConfirmBooking} className="space-y-8">
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3 text-xs sm:text-sm font-semibold text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-5 rounded-lg bg-emerald-50 border border-emerald-300 flex items-center gap-3 text-sm font-bold text-emerald-800">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* STEP 1: Select Clinic & Optional Specialist Physiotherapist */}
      <div className="bg-white rounded-lg p-6 sm:p-8 border border-border shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <span className="h-7 w-7 rounded-full bg-primary text-white text-xs font-semibold flex items-center justify-center">
            1
          </span>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Select Clinic &amp; Specialist Physiotherapist (Optional)
            </h2>
            <p className="text-xs text-foreground/65">
              Choose a specific specialist across our 4 Clinical Pillars or leave unassigned for
              clinic triage.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              <MapPin className="h-3.5 w-3.5 inline mr-1 text-primary" />
              Clinic Branch
            </label>
            <select
              value={clinicId}
              onChange={(e) => setClinicId(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-border bg-muted/50 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-[#00858E]"
            >
              {clinics.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.city})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              <Clock className="h-3.5 w-3.5 inline mr-1 text-primary" />
              Session Duration
            </label>
            <select
              value={durationMins}
              onChange={(e) => setDurationMins(Number(e.target.value))}
              className="w-full px-4 py-3.5 rounded-xl border border-border bg-muted/50 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-[#00858E]"
            >
              <option value={30}>30 Minutes (Standard Physiotherapy Evaluation)</option>
              <option value={45}>45 Minutes (Sports Injury / Desmotec Session)</option>
              <option value={60}>60 Minutes (Comprehensive Neuro / Post-Op Rehab)</option>
            </select>
          </div>
        </div>

        {/* Physiotherapist Cards */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
            <Stethoscope className="h-3.5 w-3.5 inline mr-1 text-primary" />
            Choose Specialist Physiotherapist
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            <button
              type="button"
              onClick={() => setPhysioId('any')}
              className={cn(
                'text-left p-4 rounded-lg border transition-all',
                physioId === 'any'
                  ? 'border-2 border-primary bg-secondary shadow-sm'
                  : 'border-border bg-muted/50 hover:border-primary/50'
              )}
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Flexible Assignment
              </p>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                Any Available Specialist
              </p>
              <p className="text-[11px] text-foreground/65 mt-1">
                Assigned automatically by reception upon arrival.
              </p>
            </button>

            {physios.map((doc) => (
              <button
                key={doc.id}
                type="button"
                onClick={() => setPhysioId(doc.id)}
                className={cn(
                  'text-left p-4 rounded-lg border transition-all',
                  physioId === doc.id
                    ? 'border-2 border-primary bg-secondary shadow-sm'
                    : 'border-border bg-muted/50 hover:border-primary/50'
                )}
              >
                <p className="text-[11px] font-bold text-primary line-clamp-1">
                  {doc.specialization || 'Physiotherapy Specialist'}
                </p>
                <p className="text-sm font-semibold text-foreground mt-0.5">{doc.full_name}</p>
                <p className="text-[11px] text-foreground/65 mt-1 line-clamp-2">{doc.bio}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* STEP 2: Pick Date & Real-Time Slot */}
      <div className="bg-white rounded-lg p-6 sm:p-8 border border-border shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="h-7 w-7 rounded-full bg-primary text-white text-xs font-semibold flex items-center justify-center">
              2
            </span>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Pick Date &amp; Real-Time Available Slot
              </h2>
              <p className="text-xs text-foreground/65">
                Protected by real-time conflict prevention — busy slots are automatically disabled.
              </p>
            </div>
          </div>

          <input
            type="date"
            value={dateStr}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setDateStr(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-border bg-muted/50 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-[#00858E]"
          />
        </div>

        {loadingSlots ? (
          <div className="py-12 flex items-center justify-center gap-2 text-sm font-semibold text-primary">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Checking real-time physiotherapist schedule...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
            {slots.map((slot) => {
              const isSelected = selectedSlot?.startTime === slot.startTime;
              return (
                <button
                  key={slot.startTime}
                  type="button"
                  disabled={!slot.available}
                  onClick={() => setSelectedSlot(slot)}
                  className={cn(
                    'py-3 px-3 rounded-xl text-xs font-bold border transition-all text-center',
                    !slot.available
                      ? 'bg-gray-100 text-gray-400 border-gray-200 line-through cursor-not-allowed'
                      : isSelected
                      ? 'bg-primary text-white border-primary shadow-md'
                      : 'bg-muted/50 hover:bg-secondary text-foreground border-border'
                  )}
                >
                  {slot.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* STEP 3: Chief Complaint & Instant WhatsApp Confirmation */}
      <div className="bg-white rounded-lg p-6 sm:p-8 border border-border shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <span className="h-7 w-7 rounded-full bg-primary text-white text-xs font-semibold flex items-center justify-center">
            3
          </span>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Reason for Visit &amp; Confirm Booking
            </h2>
            <p className="text-xs text-foreground/65">
              Share your symptoms or therapy goal so your physiotherapist can prepare.
            </p>
          </div>
        </div>

        <textarea
          rows={3}
          value={chiefComplaint}
          onChange={(e) => setChiefComplaint(e.target.value)}
          placeholder="e.g., Knee pain after badminton, lower back stiffness, or follow-up Desmotec rehab session..."
          className="w-full p-4 rounded-lg border border-border bg-muted/50 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#00858E]"
        />

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-xs text-[#006D75] font-semibold bg-secondary px-4 py-2.5 rounded-xl">
            <MessageSquare className="h-4 w-4 text-primary shrink-0" />
            <span>
              Instant WhatsApp booking confirmation + 24h &amp; 2h reminders will be sent automatically.
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting || !selectedSlot}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold text-sm shadow-lg shadow-[#00858E]/25 transition-all disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Confirming Slot...</span>
              </>
            ) : (
              <>
                <CalendarCheck className="h-5 w-5" />
                <span>Confirm Appointment</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
