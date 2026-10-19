import React, { Suspense } from 'react';
import { repositories } from '@/lib/repositories';
import { ScheduleEngineClient } from '@/components/crm/schedule/schedule-engine-client';

export const dynamic = 'force-dynamic';

export default async function CrmSchedulePage() {
  const [appointments, clinics, physios, patients] = await Promise.all([
    repositories.appointments.listSchedule().catch(() => []),
    repositories.clinics.listAllClinics().catch(() => []),
    repositories.profiles.listActivePhysios().catch(() => []),
    repositories.patients.searchPatients('', 100).catch(() => []),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Multi-Clinic Scheduling Engine
        </span>
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mt-1">
          Daily / Weekly Calendar &amp; Reception Queue
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Book manual-duration slots, filter by clinic or specialist physiotherapist, and enforce
          strict zero double-booking (`btree_gist`).
        </p>
      </div>

      <Suspense fallback={<div className="h-96 bg-white rounded-lg animate-pulse" />}>
        <ScheduleEngineClient
          initialAppointments={appointments}
          clinics={clinics}
          physios={physios}
          patients={patients}
        />
      </Suspense>
    </div>
  );
}
