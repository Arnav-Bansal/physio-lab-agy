import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { Users } from 'lucide-react';
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
      <div className="space-y-1">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary bg-secondary px-2.5 py-0.5 rounded-md">
          <Users className="h-3.5 w-3.5" />
          <span>{isPhysio ? 'Doctor Patient Roster' : 'Central Patient Directory'}</span>
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground pt-1">
          {isPhysio ? 'My Assigned Patients' : 'Patient Directory'}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {isPhysio
            ? `Viewing longitudinal clinical records for patients assigned to ${session.fullName}.`
            : 'Manage patient profiles, view unified history, or trigger 1-click appointment bookings and WhatsApp follow-ups.'}
        </p>
      </div>

      <Suspense fallback={<div className="h-64 bg-white rounded-2xl border border-border animate-pulse" />}>
        <PatientDirectoryClient
          initialPatients={patients}
          currentUserRole={session.role}
        />
      </Suspense>
    </div>
  );
}
