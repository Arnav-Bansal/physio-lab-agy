import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getCrmSession } from '@/lib/auth/session';
import { repositories } from '@/lib/repositories';
import { PatientDirectoryClient } from '@/components/crm/patients/patient-directory-client';

export const dynamic = 'force-dynamic';

export default async function CrmPatientsPage() {
  const session = await getCrmSession();
  if (!session) {
    redirect('/crm/login');
  }

  const isPhysio = session.role === 'physio';

  const [allPatients, physioSchedule, physioConsultations] = await Promise.all([
    repositories.patients.searchPatients('', 50).catch(() => []),
    isPhysio
      ? repositories.appointments.listSchedule({ physioId: session.profileId }).catch(() => [])
      : Promise.resolve([]),
    isPhysio
      ? repositories.consultations.listConsultations(undefined, session.profileId).catch(() => [])
      : Promise.resolve([]),
  ]);

  const assignedIds = new Set([
    ...physioSchedule.map((a) => a.patient_id),
    ...physioConsultations.map((c) => c.patient_id),
  ]);

  const patients = isPhysio
    ? allPatients.filter((p) => assignedIds.has(p.id))
    : allPatients;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          {isPhysio ? 'My Assigned Patients' : 'Patients'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isPhysio
            ? `Viewing clinical records for patients assigned to ${session.fullName}.`
            : 'Manage patient profiles, view unified history, or trigger 1-click appointment bookings and WhatsApp follow-ups.'}
        </p>
      </div>

      <Suspense fallback={<div className="h-64 bg-white rounded-lg animate-pulse" />}>
        <PatientDirectoryClient
          initialPatients={patients}
          currentUserRole={session.role}
        />
      </Suspense>
    </div>
  );
}
