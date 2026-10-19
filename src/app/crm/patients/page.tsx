import React, { Suspense } from 'react';
import { repositories } from '@/lib/repositories';
import { PatientDirectoryClient } from '@/components/crm/patients/patient-directory-client';

export const dynamic = 'force-dynamic';

export default async function CrmPatientsPage() {
  const patients = await repositories.patients.searchPatients('', 50).catch(() => []);

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Patient CRM &amp; Directory
        </span>
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mt-1">
          Patient Management &amp; Fast Search
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Search patients by name or mobile number, view unified clinical history, or trigger
          1-click appointment bookings and WhatsApp follow-ups.
        </p>
      </div>

      <Suspense fallback={<div className="h-64 bg-white rounded-lg animate-pulse" />}>
        <PatientDirectoryClient initialPatients={patients} />
      </Suspense>
    </div>
  );
}
