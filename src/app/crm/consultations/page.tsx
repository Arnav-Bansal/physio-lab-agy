import React from 'react';
import { repositories } from '@/lib/repositories';
import { ConsultationsWorkspaceClient } from '@/components/crm/consultations/consultations-workspace-client';

export const dynamic = 'force-dynamic';

export default async function CrmConsultationsPage({
  searchParams,
}: {
  searchParams: Promise<{ appointmentId?: string }>;
}) {
  const { appointmentId } = await searchParams;

  // If opened with ?appointmentId=..., automatically convert or fetch its consultation
  let autoOpenedId: string | null = null;
  if (appointmentId) {
    const opened = await repositories.consultations
      .openOrCreateFromAppointment(appointmentId)
      .catch(() => null);
    autoOpenedId = opened?.id ?? null;
  }

  const [consultations, schedule] = await Promise.all([
    repositories.consultations.listConsultations().catch(() => []),
    repositories.appointments.listSchedule({ status: 'scheduled' }).catch(() => []),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Clinical Documentation &amp; Prescriptions
        </span>
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mt-1">
          Consultation Management &amp; PDF/Image Prescription Upload
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Convert scheduled appointments into consultations, record clinical notes, upload PDF or
          image prescriptions, and mark complete to sync with the Patient Portal.
        </p>
      </div>

      <ConsultationsWorkspaceClient
        initialConsultations={consultations}
        scheduledAppointments={schedule}
        initialSelectedId={autoOpenedId}
      />
    </div>
  );
}
