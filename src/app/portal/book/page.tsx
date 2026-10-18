import React from 'react';
import { repositories } from '@/lib/repositories';
import { SelfBookingWizard } from '@/components/portal/self-booking-wizard';

export const dynamic = 'force-dynamic';

export default async function PatientBookAppointmentPage({
  searchParams,
}: {
  searchParams: Promise<{ physioId?: string }>;
}) {
  const resolvedParams = await searchParams;
  const [clinics, physios] = await Promise.all([
    repositories.clinics.listActiveClinics().catch(() => []),
    repositories.profiles.listActivePhysios().catch(() => []),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#00858E]">
          Self-Service Scheduling
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#141413] mt-1">
          Book Your Physiotherapy Session
        </h1>
        <p className="text-sm text-[#141413]/70 mt-1">
          Select your preferred clinic branch, optional specialist physiotherapist, and real-time
          available time slot.
        </p>
      </div>

      <SelfBookingWizard
        clinics={clinics}
        physios={physios}
        initialPhysioId={resolvedParams.physioId}
      />
    </div>
  );
}
