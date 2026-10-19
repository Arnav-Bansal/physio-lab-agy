import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { Calendar } from 'lucide-react';
import { getCrmSession } from '@/lib/auth/session';
import { repositories } from '@/lib/repositories';
import { ScheduleEngineClient } from '@/components/crm/schedule/schedule-engine-client';

export const dynamic = 'force-dynamic';

export default async function CrmSchedulePage() {
  const session = await getCrmSession();
  if (!session) {
    redirect('/crm/login');
  }

  const isPhysio = session.role === 'physio';

  const [appointments, clinics, physios, patients] = await Promise.all([
    repositories.appointments
      .listSchedule(isPhysio ? { physioId: session.profileId } : undefined)
      .catch(() => []),
    repositories.clinics.listAllClinics().catch(() => []),
    repositories.profiles.listActivePhysios().catch(() => []),
    repositories.patients.searchPatients('', 100).catch(() => []),
  ]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary bg-secondary px-2.5 py-0.5 rounded-md">
          <Calendar className="h-3.5 w-3.5" />
          <span>{isPhysio ? 'Specialist Calendar Scope' : 'Multi-Clinic Scheduling Engine'}</span>
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground pt-1">
          {isPhysio ? `My Schedule — ${session.fullName}` : 'Appointments & Calendar'}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {isPhysio
            ? 'Viewing only appointments assigned to you across daily resource, 7-day weekly, and queue views.'
            : 'Book manual-duration slots, filter by clinic or specialist, and prevent double-bookings in real time.'}
        </p>
      </div>

      <Suspense fallback={<div className="h-96 bg-white rounded-2xl border border-border animate-pulse" />}>
        <ScheduleEngineClient
          initialAppointments={appointments}
          clinics={clinics}
          physios={physios}
          patients={patients}
          currentUserRole={session.role}
          currentPhysioId={isPhysio ? session.profileId : undefined}
        />
      </Suspense>
    </div>
  );
}
