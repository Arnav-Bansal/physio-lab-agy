'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  Calendar,
  CalendarPlus,
  CheckCircle2,
  ClipboardList,
  Clock,
  Filter,
  LayoutGrid,
  List,
  Loader2,
  Stethoscope,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type {
  AppointmentStatus,
  AppointmentWithRelations,
  ClinicRecord,
  PatientRecord,
  ProfileRecord,
} from '@/types/database.types';
import { cn, formatDateIST, formatPhoneDisplay, formatTimeIST } from '@/lib/utils';

interface ScheduleEngineClientProps {
  initialAppointments: AppointmentWithRelations[];
  clinics: ClinicRecord[];
  physios: ProfileRecord[];
  patients: PatientRecord[];
}

const HOURS_GRID = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

export function ScheduleEngineClient({
  initialAppointments,
  clinics,
  physios,
  patients,
}: ScheduleEngineClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [appointments, setAppointments] =
    useState<AppointmentWithRelations[]>(initialAppointments);
  const [viewMode, setViewMode] = useState<'week' | 'day' | 'list'>('week');
  const [clinicFilter, setClinicFilter] = useState<string>('all');
  const [physioFilter, setPhysioFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [referenceDate, setReferenceDate] = useState<Date>(() => new Date());

  // Staff Booking Drawer State
  const [showBookingModal, setShowBookingModal] = useState(
    searchParams.get('book') === '1'
  );
  const [selectedPatientId, setSelectedPatientId] = useState(
    searchParams.get('patientId') || patients[0]?.id || ''
  );
  const [selectedClinicId, setSelectedClinicId] = useState(clinics[0]?.id || '');
  const [selectedPhysioId, setSelectedPhysioId] = useState<string>(
    physios[0]?.id || 'unassigned'
  );
  const [bookingDate, setBookingDate] = useState(() =>
    new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 10)
  );
  const [bookingStartClock, setBookingStartClock] = useState('11:00');
  const [manualDurationMins, setManualDurationMins] = useState<number>(45);
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      if (clinicFilter !== 'all' && a.clinic_id !== clinicFilter) return false;
      if (physioFilter === 'unassigned' && a.physio_id !== null) return false;
      if (
        physioFilter !== 'all' &&
        physioFilter !== 'unassigned' &&
        a.physio_id !== physioFilter
      )
        return false;
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      return true;
    });
  }, [appointments, clinicFilter, physioFilter, statusFilter]);

  // Compute 7 days for Weekly Calendar Grid
  const weekDays = useMemo(() => {
    const base = new Date(referenceDate);
    const dayOfWeek = base.getDay(); // 0 Sun .. 6 Sat
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(base);
    monday.setDate(base.getDate() + mondayOffset);
    return Array.from({ length: 7 }, (_, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      return d;
    });
  }, [referenceDate]);

  async function refreshSchedule() {
    const res = await fetch('/api/crm/appointments');
    const data = await res.json();
    if (res.ok && Array.isArray(data.appointments)) {
      setAppointments(data.appointments);
    }
  }

  async function handleCreateStaffBooking(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const startIso = new Date(`${bookingDate}T${bookingStartClock}:00+05:30`).toISOString();
      const endIso = new Date(
        new Date(startIso).getTime() + manualDurationMins * 60 * 1000
      ).toISOString();

      const res = await fetch('/api/crm/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicId: selectedClinicId,
          patientId: selectedPatientId,
          physioId: selectedPhysioId === 'unassigned' ? null : selectedPhysioId,
          startTime: startIso,
          endTime: endIso,
          chiefComplaint:
            chiefComplaint.trim() || 'Physiotherapy & Rehabilitation Session',
          internalNotes: internalNotes.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not create appointment');
      }

      await refreshSchedule();
      setShowBookingModal(false);
      setChiefComplaint('');
      setInternalNotes('');
      setToast(
        `Booking created (${manualDurationMins}m manual slot)! WhatsApp confirmation & 24h/2h reminders queued.`
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusTransition(
    appointmentId: string,
    newStatus: AppointmentStatus
  ) {
    setUpdatingId(appointmentId);
    setToast(null);
    try {
      const res = await fetch('/api/crm/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId,
          status: newStatus,
          cancellationReason:
            newStatus === 'cancelled'
              ? 'Cancelled by clinic staff via CRM'
              : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');

      await refreshSchedule();
      if (newStatus === 'cancelled') {
        setToast(
          'Appointment marked Cancelled — slot released & WhatsApp cancellation notice sent.'
        );
      } else if (newStatus === 'no_show') {
        setToast(
          'Appointment marked No-Show — automated WhatsApp reschedule prompt sent to patient.'
        );
      } else {
        setToast(`Appointment status updated to ${newStatus}.`);
      }
      router.refresh();
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-300 flex items-center justify-between gap-4 text-xs sm:text-sm font-bold text-emerald-800">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{toast}</span>
          </span>
          <button type="button" onClick={() => setToast(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Top Controls Bar: Clinic / Physio / Status Filters + View Switcher + Book Button */}
      <div className="bg-white rounded-lg p-5 sm:p-6 border border-border shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* View Switcher (Daily / Weekly Calendar + List View) */}
          <div className="inline-flex items-center rounded-lg bg-muted/50 p-1 border border-border">
            <button
              type="button"
              onClick={() => setViewMode('day')}
              className={cn(
                'px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5',
                viewMode === 'day'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-foreground/75 hover:text-foreground'
              )}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Daily Calendar</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('week')}
              className={cn(
                'px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5',
                viewMode === 'week'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-foreground/75 hover:text-foreground'
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Weekly Calendar</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={cn(
                'px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5',
                viewMode === 'list'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-foreground/75 hover:text-foreground'
              )}
            >
              <List className="h-3.5 w-3.5" />
              <span>List / Queue View</span>
            </button>
          </div>

          {/* Date Navigation */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const next = new Date(referenceDate);
                next.setDate(next.getDate() - (viewMode === 'day' ? 1 : 7));
                setReferenceDate(next);
              }}
              className="p-2 rounded-xl bg-muted/50 border border-border hover:border-primary"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setReferenceDate(new Date())}
              className="px-3 py-1.5 rounded-xl bg-muted/50 border border-border text-xs font-bold"
            >
              Today ({formatDateIST(referenceDate)})
            </button>
            <button
              type="button"
              onClick={() => {
                const next = new Date(referenceDate);
                next.setDate(next.getDate() + (viewMode === 'day' ? 1 : 7));
                setReferenceDate(next);
              }}
              className="p-2 rounded-xl bg-muted/50 border border-border hover:border-primary"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setError(null);
              setShowBookingModal(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold text-xs sm:text-sm shadow-md transition-colors"
          >
            <CalendarPlus className="h-4 w-4" />
            <span>+ Staff Booking (Manual Duration)</span>
          </button>
        </div>

        {/* Filter Row: Clinic, Physio, Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#E8E2D7]">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              <Filter className="h-3 w-3 inline mr-1 text-primary" />
              Filter by Clinic
            </label>
            <select
              value={clinicFilter}
              onChange={(e) => setClinicFilter(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-border bg-muted/50 text-xs font-bold"
            >
              <option value="all">All Clinics ({clinics.length})</option>
              {clinics.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              <Stethoscope className="h-3 w-3 inline mr-1 text-primary" />
              Filter by Physiotherapist
            </label>
            <select
              value={physioFilter}
              onChange={(e) => setPhysioFilter(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-border bg-muted/50 text-xs font-bold"
            >
              <option value="all">All Physiotherapists ({physios.length})</option>
              <option value="unassigned">Unassigned / Clinic Triage</option>
              {physios.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-border bg-muted/50 text-xs font-bold"
            >
              <option value="all">All Statuses ({appointments.length})</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled (with WhatsApp)</option>
              <option value="no_show">No-Show (with WhatsApp)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ====================================================================
          VIEW MODE 1: DAILY TIME-GRID CALENDAR VIEW
      ==================================================================== */}
      {viewMode === 'day' && (
        <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-muted/50 border-b border-border flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              Daily Time-Grid Schedule — {formatDateIST(referenceDate)}
            </h2>
            <span className="text-xs font-bold text-primary">
              IST (09:00 AM – 08:00 PM)
            </span>
          </div>

          <div className="divide-y divide-[#E8E2D7]">
            {HOURS_GRID.map((hour) => {
              const dayStr = referenceDate.toISOString().slice(0, 10);
              const hourMatches = filteredAppointments.filter((a) => {
                const istDate = new Date(new Date(a.start_time).getTime() + 5.5 * 3600 * 1000);
                const apptDayStr = istDate.toISOString().slice(0, 10);
                const apptHour = istDate.getUTCHours();
                return apptDayStr === dayStr && apptHour === hour;
              });

              const label =
                hour === 12
                  ? '12:00 PM'
                  : hour > 12
                  ? `${hour - 12}:00 PM`
                  : `${hour}:00 AM`;

              return (
                <div key={hour} className="grid grid-cols-12 min-h-[72px]">
                  <div className="col-span-2 sm:col-span-2 p-3 bg-muted/50 border-r border-[#E8E2D7] text-xs font-semibold text-foreground/65">
                    {label}
                  </div>
                  <div className="col-span-10 sm:col-span-10 p-2.5 flex flex-wrap gap-2.5 items-center">
                    {hourMatches.map((appt) => (
                      <div
                        key={appt.id}
                        className="p-3 rounded-lg border border-primary/30 bg-secondary flex items-center justify-between gap-4 min-w-[260px]"
                      >
                        <div>
                          <p className="text-xs font-semibold text-foreground">
                            {appt.patient?.full_name} • {appt.manual_duration_mins} mins
                          </p>
                          <p className="text-[11px] font-semibold text-primary">
                            {formatTimeIST(appt.start_time)} – {formatTimeIST(appt.end_time)} •{' '}
                            {appt.physio?.full_name || 'Unassigned'}
                          </p>
                        </div>
                        <Link
                          href={`/crm/consultations?appointmentId=${appt.id}`}
                          className="px-2.5 py-1.5 rounded-lg bg-primary text-white text-[11px] font-bold"
                        >
                          Open
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ====================================================================
          VIEW MODE 2: WEEKLY CALENDAR GRID VIEW
      ==================================================================== */}
      {viewMode === 'week' && (
        <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-[#E8E2D7]">
            {weekDays.map((day) => {
              const dayIso = day.toISOString().slice(0, 10);
              const dayAppointments = filteredAppointments.filter((a) => {
                const istDate = new Date(new Date(a.start_time).getTime() + 5.5 * 3600 * 1000);
                return istDate.toISOString().slice(0, 10) === dayIso;
              });

              return (
                <div key={dayIso} className="min-h-[300px] flex flex-col">
                  <div className="p-3.5 bg-muted/50 border-b border-[#E8E2D7] text-center">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                      {day.toLocaleDateString('en-IN', { weekday: 'short' })}
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {day.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>

                  <div className="p-2.5 space-y-2.5 flex-1">
                    {dayAppointments.length === 0 ? (
                      <p className="text-[11px] text-foreground/40 text-center py-6">
                        No bookings
                      </p>
                    ) : (
                      dayAppointments.map((appt) => (
                        <div
                          key={appt.id}
                          className="p-3 rounded-lg bg-muted/50 border border-border space-y-1.5 text-xs shadow-sm"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-semibold text-[10px] px-2 py-0.5 rounded-full bg-primary text-white">
                              {formatTimeIST(appt.start_time)} ({appt.manual_duration_mins}m)
                            </span>
                            <span
                              className={cn(
                                'text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded',
                                appt.status === 'scheduled'
                                  ? 'bg-secondary text-[#006D75]'
                                  : appt.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-700'
                              )}
                            >
                              {appt.status}
                            </span>
                          </div>

                          <Link
                            href={`/crm/patients/${appt.patient_id}`}
                            className="font-semibold text-foreground hover:text-primary block truncate"
                          >
                            {appt.patient?.full_name}
                          </Link>

                          <p className="text-[11px] text-primary font-semibold truncate">
                            {appt.physio?.full_name?.split(',')[0] || 'Unassigned'}
                          </p>

                          <div className="pt-1 flex items-center justify-between gap-1 border-t border-border">
                            <Link
                              href={`/crm/consultations?appointmentId=${appt.id}`}
                              className="text-[10px] font-semibold text-primary hover:underline"
                            >
                              Consultation →
                            </Link>
                            {appt.status === 'scheduled' && (
                              <button
                                type="button"
                                onClick={() => handleStatusTransition(appt.id, 'no_show')}
                                className="text-[10px] font-bold text-amber-700 hover:underline"
                              >
                                No-Show
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ====================================================================
          VIEW MODE 3: OPERATIONAL LIST / AGENDA VIEW (WITH STATUS TRIGGERS)
      ==================================================================== */}
      <div className="bg-white rounded-lg p-6 sm:p-7 border border-border shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
              Reception &amp; Clinical Queue
            </span>
            <h2 className="text-xl font-semibold text-foreground">
              All Filtered Appointments ({filteredAppointments.length})
            </h2>
          </div>
        </div>

        <div className="space-y-3">
          {filteredAppointments.map((appt) => (
            <div
              key={appt.id}
              className="p-4 sm:p-5 rounded-lg bg-muted/50 border border-border flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <Link
                    href={`/crm/patients/${appt.patient_id}`}
                    className="text-base font-semibold text-foreground hover:text-primary"
                  >
                    {appt.patient?.full_name}
                  </Link>
                  <span className="text-xs font-semibold text-foreground/65">
                    ({formatPhoneDisplay(appt.patient?.phone)})
                  </span>
                  <span
                    className={cn(
                      'px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase',
                      appt.status === 'scheduled'
                        ? 'bg-primary text-white'
                        : appt.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : appt.status === 'no_show'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-700'
                    )}
                  >
                    {appt.status.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white border border-border text-muted-foreground">
                    {appt.booking_source === 'patient_portal'
                      ? 'Patient Self-Booked'
                      : 'Staff CRM'}
                  </span>
                </div>

                <p className="text-xs font-bold text-foreground/85 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span>
                    {formatDateIST(appt.start_time)} • {formatTimeIST(appt.start_time)} –{' '}
                    {formatTimeIST(appt.end_time)} ({appt.manual_duration_mins} mins manual slot)
                  </span>
                </p>

                <p className="text-xs font-semibold text-primary">
                  {appt.physio?.full_name || 'Unassigned / Clinic Specialist'} •{' '}
                  {appt.clinic?.name || 'The Physio Lab'}
                </p>

                {appt.chief_complaint && (
                  <p className="text-xs text-foreground/75">
                    <strong>Reason:</strong> {appt.chief_complaint}
                  </p>
                )}
              </div>

              {/* Status Transitions & Consultation Conversion Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Link
                  href={`/crm/consultations?appointmentId=${appt.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  <ClipboardList className="h-3.5 w-3.5" />
                  <span>
                    {appt.status === 'completed' ? 'View Consultation' : 'Open Consultation'}
                  </span>
                </Link>

                {appt.status === 'scheduled' && (
                  <>
                    <button
                      type="button"
                      disabled={updatingId === appt.id}
                      onClick={() => handleStatusTransition(appt.id, 'no_show')}
                      className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-colors"
                    >
                      Mark No-Show (WhatsApp)
                    </button>
                    <button
                      type="button"
                      disabled={updatingId === appt.id}
                      onClick={() => handleStatusTransition(appt.id, 'cancelled')}
                      className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-colors"
                    >
                      Cancel (WhatsApp)
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ====================================================================
          STAFF BOOKING MODAL (WITH MANUAL SLOT DURATION & GIST CONFLICT CHECK)
      ==================================================================== */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-xl w-full p-6 sm:p-8 border border-border shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E8E2D7] pb-4">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                  Staff CRM Scheduling Engine
                </span>
                <h2 className="text-xl font-semibold text-foreground">
                  Create Appointment (Manual Slot Duration)
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowBookingModal(false)}
                className="p-2 rounded-xl bg-muted/50 text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs font-bold text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateStaffBooking} className="space-y-4 text-xs sm:text-sm">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold uppercase">1. Select Patient *</label>
                  <Link
                    href="/crm/patients?new=1"
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    + Register New Patient
                  </Link>
                </div>
                <select
                  required
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-border bg-muted/50 font-bold"
                >
                  {patients.map((pt) => (
                    <option key={pt.id} value={pt.id}>
                      {pt.full_name} ({formatPhoneDisplay(pt.phone)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">
                    2. Clinic Branch *
                  </label>
                  <select
                    required
                    value={selectedClinicId}
                    onChange={(e) => setSelectedClinicId(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl border border-border bg-muted/50 font-bold"
                  >
                    {clinics.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-1">
                    3. Assign Physio (Optional)
                  </label>
                  <select
                    value={selectedPhysioId}
                    onChange={(e) => setSelectedPhysioId(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl border border-border bg-muted/50 font-bold"
                  >
                    <option value="unassigned">Unassigned (Clinic Triage)</option>
                    {physios.map((ph) => (
                      <option key={ph.id} value={ph.id}>
                        {ph.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/50 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">
                    Start Time (IST) *
                  </label>
                  <input
                    type="time"
                    required
                    value={bookingStartClock}
                    onChange={(e) => setBookingStartClock(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/50 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">
                    Manual Slot Duration (Mins) *
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={240}
                    step={5}
                    required
                    value={manualDurationMins}
                    onChange={(e) => setManualDurationMins(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-primary bg-muted/50 font-semibold text-primary"
                  />
                </div>
              </div>

              {/* Quick Duration Presets */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-muted-foreground">Quick Durations:</span>
                {[20, 30, 45, 60, 90].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setManualDurationMins(mins)}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-bold border',
                      manualDurationMins === mins
                        ? 'bg-primary text-white border-primary'
                        : 'bg-muted/50 text-foreground border-border'
                    )}
                  >
                    {mins} mins
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1">
                  Chief Complaint / Therapy Goal
                </label>
                <input
                  type="text"
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  placeholder="e.g., Sports Injury Desmotec Rehab / Lumbar Decompression"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/50"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#E8E2D7]">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-border font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>Create Booking &amp; Send WhatsApp</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
