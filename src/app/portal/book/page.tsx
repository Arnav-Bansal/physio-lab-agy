import React from 'react';
import { CalendarPlus } from 'lucide-react';
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
      <div className="space-y-1">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary bg-secondary px-2.5 py-0.5 rounded-md">
          <CalendarPlus className="h-3.5 w-3.5" />
          <span>Self-Service Scheduling</span>
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground pt-1">
          Book Your Physiotherapy Session
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
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
