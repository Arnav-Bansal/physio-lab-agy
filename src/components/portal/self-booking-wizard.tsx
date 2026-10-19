'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
  Sun,
  Sunset,
  Moon,
  ShieldCheck,
} from 'lucide-react';
import type { ClinicRecord, ProfileRecord } from '@/types/database.types';
import type { AvailableSlotDTO } from '@/lib/repositories/interfaces';
import { cn, formatDateIST } from '@/lib/utils';

interface SelfBookingWizardProps {
  clinics: ClinicRecord[];
  physios: ProfileRecord[];
  initialPhysioId?: string;
}

const DURATION_OPTIONS = [
  {
    mins: 30,
    title: '30 Mins Evaluation',
    subtitle: 'Standard Ortho & Spine Session',
  },
  {
    mins: 45,
    title: '45 Mins Sports / Desmotec',
    subtitle: 'Eccentric Lab & Manual Therapy',
  },
  {
    mins: 60,
    title: '60 Mins Comprehensive',
    subtitle: 'Post-Op & Neuro Rehabilitation',
  },
];

export function SelfBookingWizard({
  clinics,
  physios,
  initialPhysioId,
}: SelfBookingWizardProps) {
  const router = useRouter();

  // Generate 10 upcoming dates starting tomorrow
  const upcomingDates = useMemo(() => {
    return Array.from({ length: 10 }, (_, idx) => {
      const d = new Date(Date.now() + (idx + 1) * 24 * 60 * 60 * 1000);
      const iso = d.toISOString().slice(0, 10);
      return {
        iso,
        weekday: idx === 0 ? 'Tomorrow' : d.toLocaleDateString('en-IN', { weekday: 'short' }),
        dayNum: d.toLocaleDateString('en-IN', { day: '2-digit' }),
        month: d.toLocaleDateString('en-IN', { month: 'short' }),
      };
    });
  }, []);

  const [clinicId, setClinicId] = useState(clinics[0]?.id || '');
  const [physioId, setPhysioId] = useState(initialPhysioId || 'any');
  const [dateStr, setDateStr] = useState(upcomingDates[0].iso);
  const [durationMins, setDurationMins] = useState(45);
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

  // Group slots into Morning (<12), Afternoon (12–16), Evening (>=16)
  const groupedSlots = useMemo(() => {
    const morning: AvailableSlotDTO[] = [];
    const afternoon: AvailableSlotDTO[] = [];
    const evening: AvailableSlotDTO[] = [];

    for (const s of slots) {
      const istDate = new Date(new Date(s.startTime).getTime() + 5.5 * 3600 * 1000);
      const hr = istDate.getUTCHours();
      if (hr < 12) morning.push(s);
      else if (hr < 16) afternoon.push(s);
      else evening.push(s);
    }
    return { morning, afternoon, evening };
  }, [slots]);

  const selectedClinicObj = clinics.find((c) => c.id === clinicId) || clinics[0];
  const selectedPhysioObj = physios.find((p) => p.id === physioId);

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
    <form onSubmit={handleConfirmBooking} className="space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-xs sm:text-sm font-semibold text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center gap-3 text-sm font-bold text-emerald-800">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 8 Cols: Guided 3-Step Selection */}
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: Clinic, Session Duration & Specialist */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-border shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-border/70 pb-4">
              <span className="h-8 w-8 rounded-xl bg-primary text-white font-mono text-xs font-bold flex items-center justify-center">
                01
              </span>
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Choose Session Duration &amp; Specialist
                </h2>
                <p className="text-xs text-muted-foreground">
                  Select a specific physiotherapist or let our reception team assign the best
                  specialist for your condition.
                </p>
              </div>
            </div>

            {/* Clinic Selector (if multiple) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                <MapPin className="h-3.5 w-3.5 inline mr-1 text-primary" />
                Clinic Location
              </label>
              <select
                value={clinicId}
                onChange={(e) => setClinicId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-muted/50 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {clinics.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.address})
                  </option>
                ))}
              </select>
            </div>

            {/* Visual Session Duration Cards */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
                <Clock className="h-3.5 w-3.5 inline mr-1 text-primary" />
                Session Duration
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {DURATION_OPTIONS.map((opt) => {
                  const active = durationMins === opt.mins;
                  return (
                    <button
                      key={opt.mins}
                      type="button"
                      onClick={() => setDurationMins(opt.mins)}
                      className={cn(
                        'p-3.5 rounded-xl border text-left transition-all',
                        active
                          ? 'border-2 border-primary bg-secondary/70 shadow-sm'
                          : 'border-border bg-muted/40 hover:border-primary/40'
                      )}
                    >
                      <div className="font-mono text-sm font-bold text-primary">{opt.title}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{opt.subtitle}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Specialist Physiotherapist Cards */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
                <Stethoscope className="h-3.5 w-3.5 inline mr-1 text-primary" />
                Select Physiotherapist (Optional)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPhysioId('any')}
                  className={cn(
                    'text-left p-4 rounded-xl border transition-all',
                    physioId === 'any'
                      ? 'border-2 border-primary bg-secondary/70 shadow-sm'
                      : 'border-border bg-muted/40 hover:border-primary/40'
                  )}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    Fastest Availability
                  </span>
                  <p className="text-sm font-bold text-foreground mt-0.5">
                    Any Available Specialist
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Assigned by reception based on your primary symptom.
                  </p>
                </button>

                {physios.map((doc) => (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => setPhysioId(doc.id)}
                    className={cn(
                      'text-left p-4 rounded-xl border transition-all',
                      physioId === doc.id
                        ? 'border-2 border-primary bg-secondary/70 shadow-sm'
                        : 'border-border bg-muted/40 hover:border-primary/40'
                    )}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary line-clamp-1">
                      {doc.specialization || 'Consultant Physiotherapist'}
                    </span>
                    <p className="text-sm font-bold text-foreground mt-0.5">{doc.full_name}</p>
                    <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
                      {doc.bio || 'Barewal Awana Flagship'}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* STEP 2: Horizontal Date Carousel + Grouped Morning/Afternoon/Evening Slots */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-border shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-4">
              <div className="flex items-center gap-3">
                <span className="h-8 w-8 rounded-xl bg-primary text-white font-mono text-xs font-bold flex items-center justify-center">
                  02
                </span>
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    Select Date &amp; Available Time Slot
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Real-time conflict prevention automatically disables busy slots.
                  </p>
                </div>
              </div>

              <input
                type="date"
                value={dateStr}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setDateStr(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-border bg-muted/50 text-xs font-mono font-bold text-foreground"
              />
            </div>

            {/* Horizontal 10-Day Date Strip */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              {upcomingDates.map((d) => {
                const isSelected = d.iso === dateStr;
                return (
                  <button
                    key={d.iso}
                    type="button"
                    onClick={() => setDateStr(d.iso)}
                    className={cn(
                      'min-w-[82px] py-2.5 px-3 rounded-xl border text-center transition-all shrink-0',
                      isSelected
                        ? 'bg-primary text-white border-primary shadow-md'
                        : 'bg-muted/40 text-foreground border-border hover:border-primary/40'
                    )}
                  >
                    <div
                      className={cn(
                        'text-[10px] font-bold uppercase',
                        isSelected ? 'text-white/85' : 'text-primary'
                      )}
                    >
                      {d.weekday}
                    </div>
                    <div className="text-base font-bold font-mono mt-0.5">
                      {d.dayNum} {d.month}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Grouped Time Slots */}
            {loadingSlots ? (
              <div className="py-12 flex items-center justify-center gap-2 text-sm font-semibold text-primary">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Checking live physiotherapist schedule...</span>
              </div>
            ) : (
              <div className="space-y-5">
                {[
                  { label: 'Morning Sessions (9:00 AM – 12:00 PM)', icon: Sun, items: groupedSlots.morning },
                  { label: 'Afternoon Sessions (12:00 PM – 4:00 PM)', icon: Sunset, items: groupedSlots.afternoon },
                  { label: 'Evening Sessions (4:00 PM – 8:00 PM)', icon: Moon, items: groupedSlots.evening },
                ].map((group) => {
                  const Icon = group.icon;
                  if (group.items.length === 0) return null;
                  return (
                    <div key={group.label} className="space-y-2.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                        <Icon className="h-3.5 w-3.5 text-primary" />
                        <span>{group.label}</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                        {group.items.map((slot) => {
                          const isSelected = selectedSlot?.startTime === slot.startTime;
                          return (
                            <button
                              key={slot.startTime}
                              type="button"
                              disabled={!slot.available}
                              onClick={() => setSelectedSlot(slot)}
                              className={cn(
                                'py-2.5 px-3 rounded-xl font-mono text-xs font-bold border transition-all text-center',
                                !slot.available
                                  ? 'bg-muted/40 text-muted-foreground/40 border-border/50 line-through cursor-not-allowed'
                                  : isSelected
                                  ? 'bg-primary text-white border-primary shadow-md ring-2 ring-primary/20'
                                  : 'bg-white hover:bg-secondary/60 text-foreground border-border'
                              )}
                            >
                              {slot.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* STEP 3: Chief Complaint */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-border shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <span className="h-8 w-8 rounded-xl bg-primary text-white font-mono text-xs font-bold flex items-center justify-center">
                03
              </span>
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Reason for Visit / Primary Symptoms
                </h2>
                <p className="text-xs text-muted-foreground">
                  Share your pain area, injury history, or rehab goal so your specialist can prepare.
                </p>
              </div>
            </div>

            <textarea
              rows={3}
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="e.g., Right knee ACL recovery, lower back sciatica pain, or frozen shoulder stiffness..."
              className="w-full p-4 rounded-xl border border-border bg-muted/40 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Right 4 Cols: Sticky Live Booking Summary Receipt */}
        <div className="lg:col-span-4 lg:sticky lg:top-24">
          <div className="bg-white rounded-2xl border border-border shadow-lg overflow-hidden">
            <div className="bg-[#141E1E] text-white p-6 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#2DD4BF]">
                Appointment Summary
              </span>
              <h3 className="text-lg font-bold">The Physio Lab</h3>
              <p className="text-xs text-white/70">
                {selectedClinicObj?.name || 'Barewal Awana Flagship'}
              </p>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-border/70">
                <span className="text-muted-foreground">Specialist</span>
                <span className="font-bold text-foreground text-right">
                  {selectedPhysioObj ? selectedPhysioObj.full_name : 'Any Available Specialist'}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 pb-3 border-b border-border/70">
                <span className="text-muted-foreground">Date</span>
                <span className="font-mono font-bold text-foreground">
                  {formatDateIST(`${dateStr}T10:00:00+05:30`)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 pb-3 border-b border-border/70">
                <span className="text-muted-foreground">Time Slot (IST)</span>
                <span className="font-mono font-bold text-primary">
                  {selectedSlot ? selectedSlot.label : 'Select a slot'}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 pb-3 border-b border-border/70">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-mono font-bold text-foreground">{durationMins} Minutes</span>
              </div>

              <div className="p-3.5 rounded-xl bg-secondary/70 border border-primary/15 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-secondary-foreground">
                  <MessageSquare className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>WhatsApp Care Included</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Instant WhatsApp booking confirmation + automated 24-hour and 2-hour reminders.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting || !selectedSlot}
                className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Confirming Booking...</span>
                  </>
                ) : (
                  <>
                    <CalendarCheck className="h-4 w-4" />
                    <span>Confirm Appointment</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-muted-foreground flex items-center justify-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                <span>Protected by zero double-booking guarantee</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
