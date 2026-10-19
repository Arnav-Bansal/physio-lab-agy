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
  Columns,
  User,
  Phone,
  Search,
  Plus,
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
  currentUserRole?: 'admin' | 'staff' | 'physio' | 'patient';
  currentPhysioId?: string;
}

const HOURS_GRID = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

export function ScheduleEngineClient({
  initialAppointments,
  clinics,
  physios,
  patients,
  currentUserRole = 'admin',
  currentPhysioId,
}: ScheduleEngineClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPhysio = currentUserRole === 'physio';

  const [appointments, setAppointments] =
    useState<AppointmentWithRelations[]>(initialAppointments);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'list'>('day');
  const [clinicFilter, setClinicFilter] = useState<string>('all');
  const [physioFilter, setPhysioFilter] = useState<string>(
    currentPhysioId || 'all'
  );
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Initialize referenceDate to the first scheduled appointment's date if available so the calendar immediately shows live data
  const [referenceDate, setReferenceDate] = useState<Date>(() => {
    const firstScheduled = initialAppointments.find((a) => a.status === 'scheduled');
    return firstScheduled ? new Date(firstScheduled.start_time) : new Date();
  });

  // Slide-Over Appointment Inspector Drawer State
  const [inspectedAppointment, setInspectedAppointment] =
    useState<AppointmentWithRelations | null>(null);

  // Slide-Over Staff Booking Drawer State (Admin & Staff only)
  const [showBookingModal, setShowBookingModal] = useState(
    !isPhysio && searchParams.get('book') === '1'
  );
  const [patientSearchFilter, setPatientSearchFilter] = useState('');
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

  // Visible practitioner columns for Jane App-style Multi-Physio Resource Grid
  const resourceColumns = useMemo(() => {
    const matchingPhysios = physios.filter((p) => {
      if (isPhysio && p.id !== currentPhysioId) return false;
      if (
        physioFilter !== 'all' &&
        physioFilter !== 'unassigned' &&
        p.id !== physioFilter
      )
        return false;
      return true;
    });

    const cols: Array<{ id: string; name: string; subtitle: string; color: string }> =
      physioFilter === 'unassigned'
        ? []
        : matchingPhysios.map((p) => ({
            id: p.id,
            name: p.full_name,
            subtitle: p.specialization || 'Physiotherapist',
            color: p.calendar_color || '#00858E',
          }));

    if (!isPhysio && (physioFilter === 'all' || physioFilter === 'unassigned')) {
      cols.push({
        id: 'unassigned',
        name: 'Clinic Triage Queue',
        subtitle: 'Unassigned Self-Bookings',
        color: '#D97706',
      });
    }
    return cols;
  }, [physios, isPhysio, currentPhysioId, physioFilter]);

  // Compute 7 days for Weekly Calendar Grid
  const weekDays = useMemo(() => {
    const base = new Date(referenceDate);
    const dayOfWeek = base.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(base);
    monday.setDate(base.getDate() + mondayOffset);
    return Array.from({ length: 7 }, (_, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      return d;
    });
  }, [referenceDate]);

  const filteredPatientsForModal = useMemo(() => {
    if (!patientSearchFilter.trim()) return patients;
    const q = patientSearchFilter.toLowerCase();
    return patients.filter(
      (p) =>
        p.full_name.toLowerCase().includes(q) ||
        p.phone.toLowerCase().includes(q)
    );
  }, [patients, patientSearchFilter]);

  function handleQuickSlotClick(colId: string, hour: number) {
    if (isPhysio) return;
    const istRef = new Date(referenceDate.getTime() + 5.5 * 3600 * 1000);
    const dateIso = istRef.toISOString().slice(0, 10);
    setBookingDate(dateIso);
    setBookingStartClock(`${String(hour).padStart(2, '0')}:00`);
    setSelectedPhysioId(colId);
    setError(null);
    setShowBookingModal(true);
  }

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
      setReferenceDate(new Date(startIso));
      setToast(
        `Appointment booked (${manualDurationMins}m slot)! Instant WhatsApp confirmation & 24h/2h reminders queued.`
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
      setInspectedAppointment(null);
      if (newStatus === 'cancelled') {
        setToast(
          'Appointment cancelled — slot released & WhatsApp cancellation notice dispatched.'
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

  const activeDayIso = new Date(referenceDate.getTime() + 5.5 * 3600 * 1000)
    .toISOString()
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {toast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between gap-4 text-xs sm:text-sm font-bold text-emerald-800">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{toast}</span>
          </span>
          <button type="button" onClick={() => setToast(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ====================================================================
          TOP CALENDAR CONTROLS BAR (JANE APP / CLINIKO STYLE)
      ==================================================================== */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-border shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* View Mode Switcher */}
          <div className="inline-flex items-center rounded-xl bg-muted/60 p-1 border border-border">
            <button
              type="button"
              onClick={() => setViewMode('day')}
              className={cn(
                'px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5',
                viewMode === 'day'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Columns className="h-3.5 w-3.5" />
              <span>Multi-Physio Day Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('week')}
              className={cn(
                'px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5',
                viewMode === 'week'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>7-Day Week</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={cn(
                'px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5',
                viewMode === 'list'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <List className="h-3.5 w-3.5" />
              <span>Operational Queue ({filteredAppointments.length})</span>
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
              className="p-2 rounded-xl bg-muted/60 border border-border hover:border-primary transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setReferenceDate(new Date())}
              className="px-3.5 py-2 rounded-xl bg-muted/60 border border-border font-mono text-xs font-bold text-foreground hover:bg-secondary/50 transition-colors"
            >
              {formatDateIST(referenceDate)}
            </button>
            <button
              type="button"
              onClick={() => {
                const next = new Date(referenceDate);
                next.setDate(next.getDate() + (viewMode === 'day' ? 1 : 7));
                setReferenceDate(next);
              }}
              className="p-2 rounded-xl bg-muted/60 border border-border hover:border-primary transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {!isPhysio && (
            <button
              type="button"
              onClick={() => {
                setError(null);
                setShowBookingModal(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs sm:text-sm shadow-md shadow-primary/20 transition-all"
            >
              <CalendarPlus className="h-4 w-4" />
              <span>+ Book Appointment</span>
            </button>
          )}
        </div>

        {/* Filter Row: Clinic, Physio, Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-border/70">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              <Filter className="h-3 w-3 inline mr-1 text-primary" />
              Clinic Branch
            </label>
            <select
              value={clinicFilter}
              onChange={(e) => setClinicFilter(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-border bg-muted/40 text-xs font-bold"
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
            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              <Stethoscope className="h-3 w-3 inline mr-1 text-primary" />
              {isPhysio ? 'Specialist Scope' : 'Filter by Specialist'}
            </label>
            <select
              value={physioFilter}
              disabled={isPhysio}
              onChange={(e) => setPhysioFilter(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-border bg-muted/40 text-xs font-bold disabled:opacity-75"
            >
              {!isPhysio && <option value="all">All Specialists ({physios.length})</option>}
              {!isPhysio && <option value="unassigned">Clinic Triage (Unassigned)</option>}
              {physios
                .filter((p) => !isPhysio || p.id === currentPhysioId)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Appointment Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-border bg-muted/40 text-xs font-bold"
            >
              <option value="all">All Statuses ({appointments.length})</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No-Show</option>
            </select>
          </div>
        </div>
      </div>

      {/* ====================================================================
          VIEW MODE 1: MULTI-PHYSIO RESOURCE COLUMN DAY GRID (JANE APP STYLE)
      ==================================================================== */}
      {viewMode === 'day' && (
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-muted/40 border-b border-border flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                Multi-Practitioner Resource Schedule
              </span>
              <h2 className="text-base font-bold text-foreground">
                {formatDateIST(referenceDate)}
              </h2>
            </div>
            {!isPhysio && (
              <span className="text-xs text-muted-foreground">
                Tip: Click any empty time slot under a doctor to book directly
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[780px]">
              {/* Practitioner Column Headers */}
              <div
                className="grid border-b border-border bg-muted/25"
                style={{
                  gridTemplateColumns: `92px repeat(${Math.max(resourceColumns.length, 1)}, minmax(190px, 1fr))`,
                }}
              >
                <div className="p-3 border-r border-border text-[11px] font-mono font-bold uppercase text-muted-foreground flex items-center justify-center">
                  IST Time
                </div>
                {resourceColumns.map((col) => (
                  <div
                    key={col.id}
                    className="p-3.5 border-r last:border-r-0 border-border flex items-center gap-2.5"
                  >
                    <span
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: col.color }}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{col.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{col.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Time Rows */}
              <div className="divide-y divide-border/70">
                {HOURS_GRID.map((hour) => {
                  const label =
                    hour === 12
                      ? '12:00 PM'
                      : hour > 12
                      ? `${hour - 12}:00 PM`
                      : `${hour}:00 AM`;

                  return (
                    <div
                      key={hour}
                      className="grid min-h-[76px]"
                      style={{
                        gridTemplateColumns: `92px repeat(${Math.max(
                          resourceColumns.length,
                          1
                        )}, minmax(190px, 1fr))`,
                      }}
                    >
                      <div className="p-3 bg-muted/20 border-r border-border font-mono text-xs font-semibold text-muted-foreground flex items-start justify-center">
                        {label}
                      </div>

                      {resourceColumns.map((col) => {
                        const cellAppointments = filteredAppointments.filter((a) => {
                          const istDate = new Date(
                            new Date(a.start_time).getTime() + 5.5 * 3600 * 1000
                          );
                          const apptDayStr = istDate.toISOString().slice(0, 10);
                          const apptHour = istDate.getUTCHours();
                          const matchesCol =
                            col.id === 'unassigned'
                              ? a.physio_id === null
                              : a.physio_id === col.id;
                          return (
                            apptDayStr === activeDayIso &&
                            apptHour === hour &&
                            matchesCol
                          );
                        });

                        return (
                          <div
                            key={col.id}
                            onClick={() => {
                              if (cellAppointments.length === 0) {
                                handleQuickSlotClick(col.id, hour);
                              }
                            }}
                            className={cn(
                              'p-2 border-r last:border-r-0 border-border/70 transition-colors relative group',
                              cellAppointments.length === 0 &&
                                !isPhysio &&
                                'hover:bg-secondary/35 cursor-pointer'
                            )}
                          >
                            {cellAppointments.length === 0 && !isPhysio && (
                              <span className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1 text-[10px] font-bold text-primary px-2 py-1">
                                <Plus className="h-3 w-3" />
                                <span>Book {label}</span>
                              </span>
                            )}

                            <div className="space-y-1.5">
                              {cellAppointments.map((appt) => (
                                <button
                                  key={appt.id}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setInspectedAppointment(appt);
                                  }}
                                  className={cn(
                                    'w-full text-left p-2.5 rounded-xl border shadow-sm transition-all hover:shadow-md space-y-1',
                                    appt.status === 'completed'
                                      ? 'bg-emerald-50/90 border-emerald-200'
                                      : appt.status === 'cancelled' || appt.status === 'no_show'
                                      ? 'bg-red-50/80 border-red-200 opacity-75'
                                      : 'bg-secondary/85 border-primary/30'
                                  )}
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="font-mono text-[10px] font-bold text-primary">
                                      {formatTimeIST(appt.start_time)} ({appt.manual_duration_mins}m)
                                    </span>
                                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/90 text-foreground">
                                      {appt.status.replace('_', ' ')}
                                    </span>
                                  </div>
                                  <p className="text-xs font-bold text-foreground truncate">
                                    {appt.patient?.full_name}
                                  </p>
                                  {appt.chief_complaint && (
                                    <p className="text-[10px] text-muted-foreground truncate">
                                      {appt.chief_complaint}
                                    </p>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          VIEW MODE 2: 7-DAY WEEKLY CALENDAR GRID
      ==================================================================== */}
      {viewMode === 'week' && (
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-border">
            {weekDays.map((day) => {
              const dayIso = day.toISOString().slice(0, 10);
              const dayAppointments = filteredAppointments.filter((a) => {
                const istDate = new Date(new Date(a.start_time).getTime() + 5.5 * 3600 * 1000);
                return istDate.toISOString().slice(0, 10) === dayIso;
              });

              return (
                <div key={dayIso} className="min-h-[340px] flex flex-col">
                  <div className="p-3.5 bg-muted/40 border-b border-border text-center">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
                      {day.toLocaleDateString('en-IN', { weekday: 'short' })}
                    </p>
                    <p className="text-sm font-bold font-mono text-foreground mt-0.5">
                      {day.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>

                  <div className="p-2.5 space-y-2.5 flex-1">
                    {dayAppointments.length === 0 ? (
                      <p className="text-[11px] text-muted-foreground/50 text-center py-8">
                        No slots booked
                      </p>
                    ) : (
                      dayAppointments.map((appt) => (
                        <button
                          key={appt.id}
                          type="button"
                          onClick={() => setInspectedAppointment(appt)}
                          className="w-full text-left p-3 rounded-xl bg-muted/40 hover:bg-secondary/60 border border-border hover:border-primary/40 space-y-1.5 text-xs shadow-sm transition-all"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono font-bold text-[10px] px-2 py-0.5 rounded-md bg-primary text-white">
                              {formatTimeIST(appt.start_time)} ({appt.manual_duration_mins}m)
                            </span>
                            <span
                              className={cn(
                                'text-[9px] font-bold uppercase px-1.5 py-0.5 rounded',
                                appt.status === 'scheduled'
                                  ? 'bg-secondary text-secondary-foreground'
                                  : appt.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-700'
                              )}
                            >
                              {appt.status.replace('_', ' ')}
                            </span>
                          </div>

                          <p className="font-bold text-foreground truncate">
                            {appt.patient?.full_name}
                          </p>

                          <p className="text-[11px] text-primary font-semibold truncate">
                            {appt.physio?.full_name?.split(',')[0] || 'Clinic Triage'}
                          </p>
                        </button>
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
          VIEW MODE 3: OPERATIONAL LIST / AGENDA QUEUE VIEW
      ==================================================================== */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-border shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                Reception &amp; Clinical Queue
              </span>
              <h2 className="text-xl font-bold text-foreground">
                Filtered Appointments ({filteredAppointments.length})
              </h2>
            </div>
          </div>

          <div className="space-y-3">
            {filteredAppointments.map((appt) => (
              <div
                key={appt.id}
                className="p-4 sm:p-5 rounded-xl bg-muted/40 border border-border flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <Link
                      href={`/crm/patients/${appt.patient_id}`}
                      className="text-base font-bold text-foreground hover:text-primary"
                    >
                      {appt.patient?.full_name}
                    </Link>
                    <span className="text-xs font-mono font-semibold text-muted-foreground">
                      ({formatPhoneDisplay(appt.patient?.phone)})
                    </span>
                    <span
                      className={cn(
                        'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase',
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
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-white border border-border text-muted-foreground">
                      {appt.booking_source === 'patient_portal'
                        ? 'Patient Self-Booked'
                        : 'Front Desk CRM'}
                    </span>
                  </div>

                  <p className="text-xs font-mono font-bold text-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span>
                      {formatDateIST(appt.start_time)} • {formatTimeIST(appt.start_time)} –{' '}
                      {formatTimeIST(appt.end_time)} ({appt.manual_duration_mins} mins)
                    </span>
                  </p>

                  <p className="text-xs font-semibold text-primary">
                    {appt.physio?.full_name || 'Clinic Triage (Unassigned)'} •{' '}
                    {appt.clinic?.name || 'The Physio Lab'}
                  </p>

                  {appt.chief_complaint && (
                    <p className="text-xs text-muted-foreground">
                      <strong className="text-foreground">Chief Complaint:</strong>{' '}
                      {appt.chief_complaint}
                    </p>
                  )}
                </div>

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
                        Mark No-Show
                      </button>
                      <button
                        type="button"
                        disabled={updatingId === appt.id}
                        onClick={() => handleStatusTransition(appt.id, 'cancelled')}
                        className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ====================================================================
          SLIDE-OVER APPOINTMENT INSPECTOR DRAWER (JANE APP STYLE)
      ==================================================================== */}
      {inspectedAppointment && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end"
          onClick={() => setInspectedAppointment(null)}
        >
          <div
            className="bg-white w-full max-w-md h-full shadow-2xl border-l border-border p-6 sm:p-7 flex flex-col justify-between overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                    Appointment Inspector
                  </span>
                  <h3 className="text-xl font-bold text-foreground mt-0.5">
                    {inspectedAppointment.patient?.full_name}
                  </h3>
                  <p className="text-xs font-mono text-muted-foreground mt-0.5 flex items-center gap-1.5">
                    <Phone className="h-3 w-3 text-primary" />
                    <span>{formatPhoneDisplay(inspectedAppointment.patient?.phone)}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectedAppointment(null)}
                  className="p-2 rounded-xl bg-muted/60 hover:bg-muted text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-bold uppercase px-2.5 py-0.5 rounded-full bg-primary text-white text-[10px]">
                    {inspectedAppointment.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Date &amp; Time</span>
                  <span className="font-mono font-bold text-foreground">
                    {formatDateIST(inspectedAppointment.start_time)} •{' '}
                    {formatTimeIST(inspectedAppointment.start_time)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Slot Duration</span>
                  <span className="font-mono font-bold text-primary">
                    {inspectedAppointment.manual_duration_mins} Minutes
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Specialist</span>
                  <span className="font-bold text-foreground">
                    {inspectedAppointment.physio?.full_name || 'Unassigned Triage'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Booking Source</span>
                  <span className="font-semibold text-foreground">
                    {inspectedAppointment.booking_source === 'patient_portal'
                      ? 'Patient Self-Booked'
                      : 'Staff CRM'}
                  </span>
                </div>
              </div>

              {inspectedAppointment.chief_complaint && (
                <div className="p-4 rounded-xl bg-secondary/50 border border-primary/20 space-y-1 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    Chief Complaint / Session Notes
                  </span>
                  <p className="text-foreground font-medium leading-relaxed">
                    {inspectedAppointment.chief_complaint}
                  </p>
                </div>
              )}

              <div className="space-y-2.5 pt-2">
                <Link
                  href={`/crm/consultations?appointmentId=${inspectedAppointment.id}`}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-bold shadow-md transition-colors"
                >
                  <Stethoscope className="h-4 w-4" />
                  <span>
                    {inspectedAppointment.status === 'completed'
                      ? 'Open Completed Clinical Chart'
                      : 'Start / Open Consultation & Rx'}
                  </span>
                </Link>

                <Link
                  href={`/crm/patients/${inspectedAppointment.patient_id}`}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-muted/60 hover:bg-muted text-foreground border border-border text-xs font-bold transition-colors"
                >
                  <User className="h-4 w-4 text-primary" />
                  <span>View Longitudinal Patient History</span>
                </Link>
              </div>
            </div>

            {inspectedAppointment.status === 'scheduled' && (
              <div className="pt-4 border-t border-border space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Status Actions (Triggers Automated WhatsApp)
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    disabled={updatingId === inspectedAppointment.id}
                    onClick={() =>
                      handleStatusTransition(inspectedAppointment.id, 'no_show')
                    }
                    className="py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold"
                  >
                    Mark No-Show
                  </button>
                  <button
                    type="button"
                    disabled={updatingId === inspectedAppointment.id}
                    onClick={() =>
                      handleStatusTransition(inspectedAppointment.id, 'cancelled')
                    }
                    className="py-2.5 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold"
                  >
                    Cancel Booking
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====================================================================
          SLIDE-OVER STAFF BOOKING DRAWER (WITH SEARCHABLE PATIENT SELECTOR)
      ==================================================================== */}
      {showBookingModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end"
          onClick={() => setShowBookingModal(false)}
        >
          <div
            className="bg-white max-w-lg w-full h-full p-6 sm:p-8 border-l border-border shadow-2xl space-y-5 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                  Front Desk Scheduling Engine
                </span>
                <h2 className="text-xl font-bold text-foreground mt-0.5">
                  Book Appointment Slot
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowBookingModal(false)}
                className="p-2 rounded-xl bg-muted/60 text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs font-bold text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateStaffBooking} className="space-y-4 text-xs sm:text-sm">
              {/* Searchable Patient Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase text-muted-foreground">
                    1. Select Patient *
                  </label>
                  <Link
                    href="/crm/patients?new=1"
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    + Register New Patient
                  </Link>
                </div>
                <div className="relative">
                  <Search className="h-3.5 w-3.5 text-primary absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={patientSearchFilter}
                    onChange={(e) => setPatientSearchFilter(e.target.value)}
                    placeholder="Filter patient list by name or phone..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-muted/30 text-xs"
                  />
                </div>
                <select
                  required
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-border bg-muted/50 font-bold"
                >
                  {filteredPatientsForModal.map((pt) => (
                    <option key={pt.id} value={pt.id}>
                      {pt.full_name} ({formatPhoneDisplay(pt.phone)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
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
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                    3. Assign Specialist
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/50 font-mono font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                    Start Time (IST) *
                  </label>
                  <input
                    type="time"
                    required
                    value={bookingStartClock}
                    onChange={(e) => setBookingStartClock(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/50 font-mono font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                    Duration (Mins) *
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={240}
                    step={5}
                    required
                    value={manualDurationMins}
                    onChange={(e) => setManualDurationMins(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-primary bg-secondary/40 font-mono font-bold text-primary text-xs"
                  />
                </div>
              </div>

              {/* Quick Duration Presets */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-muted-foreground">Presets:</span>
                {[20, 30, 45, 60, 90].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setManualDurationMins(mins)}
                    className={cn(
                      'px-3 py-1 rounded-lg font-mono text-xs font-bold border transition-colors',
                      manualDurationMins === mins
                        ? 'bg-primary text-white border-primary'
                        : 'bg-muted/50 text-foreground border-border hover:border-primary/40'
                    )}
                  >
                    {mins}m
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                  Chief Complaint / Therapy Focus
                </label>
                <input
                  type="text"
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  placeholder="e.g., Post-op ACL Desmotec rehab, Lumbar decompression..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                  Internal Reception Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Referral notes, package details..."
                  className="w-full p-3 rounded-xl border border-border bg-muted/50"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
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
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-bold shadow-md"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>Confirm &amp; Send WhatsApp</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
