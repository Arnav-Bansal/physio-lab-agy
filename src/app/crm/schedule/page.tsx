import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          {isPhysio ? `My Schedule — ${session.fullName}` : 'Appointments & Calendar'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isPhysio
            ? 'Viewing only appointments assigned to you across daily, weekly, and list views.'
            : 'Book manual-duration slots, filter by clinic or physiotherapist, and prevent double-bookings.'}
        </p>
      </div>

      <Suspense fallback={<div className="h-96 bg-white rounded-lg animate-pulse" />}>
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
