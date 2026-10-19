import React from 'react';
import { redirect } from 'next/navigation';
import { Stethoscope } from 'lucide-react';
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
      <div className="space-y-1">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary bg-secondary px-2.5 py-0.5 rounded-md">
          <Stethoscope className="h-3.5 w-3.5" />
          <span>Clinical Charting &amp; Prescription Vault</span>
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground pt-1">
          {isPhysio ? 'My Consultations & Prescriptions' : 'Consultations & Prescriptions'}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {isPhysio
            ? 'Record SOAP clinical notes, VAS pain scores, and upload PDF or image prescriptions for your assigned patients.'
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
