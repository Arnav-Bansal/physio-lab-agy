import React from 'react';
import { redirect } from 'next/navigation';
import { getCrmSession } from '@/lib/auth/session';
import { repositories } from '@/lib/repositories';
import { ConsultationsWorkspaceClient } from '@/components/crm/consultations/consultations-workspace-client';

export const dynamic = 'force-dynamic';

export default async function CrmConsultationsPage({
  searchParams,
}: {
  searchParams: Promise<{ appointmentId?: string }>;
}) {
  const session = await getCrmSession();
  if (!session) {
    redirect('/crm/login');
  }

  const isPhysio = session.role === 'physio';
  const { appointmentId } = await searchParams;

  let autoOpenedId: string | null = null;
  if (appointmentId) {
    const opened = await repositories.consultations
      .openOrCreateFromAppointment(appointmentId, session.profileId)
      .catch(() => null);
    autoOpenedId = opened?.id ?? null;
  }

  const [consultations, schedule] = await Promise.all([
    repositories.consultations
      .listConsultations(undefined, isPhysio ? session.profileId : undefined)
      .catch(() => []),
    repositories.appointments
      .listSchedule({
        status: 'scheduled',
        physioId: isPhysio ? session.profileId : undefined,
      })
      .catch(() => []),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          {isPhysio ? `My Consultations & Prescriptions` : 'Consultations & Prescriptions'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isPhysio
            ? `Record SOAP clinical notes and upload PDF or image prescriptions for your assigned patients.`
            : 'Convert scheduled appointments into consultations, record clinical notes, upload PDF or image prescriptions, and mark complete.'}
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
