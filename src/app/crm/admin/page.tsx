import React from 'react';
import { redirect } from 'next/navigation';
import { getCrmSession } from '@/lib/auth/session';
import { repositories } from '@/lib/repositories';
import { AdminControlsClient } from '@/components/crm/admin/admin-controls-client';

export const dynamic = 'force-dynamic';

export default async function CrmAdminPage() {
  const session = await getCrmSession();
  if (!session) {
    redirect('/crm/login');
  }

  // RBAC: Strictly restricted to 'admin' role
  if (session.role !== 'admin') {
    redirect('/crm');
  }

  const [clinics, profiles, templates] = await Promise.all([
    repositories.clinics.listAllClinics().catch(() => []),
    repositories.profiles.listAllProfiles().catch(() => []),
    repositories.messages.listTemplates().catch(() => []),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Admin Settings — Clinics, Users &amp; Templates
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure multi-branch clinics, onboard physiotherapists and reception staff, and
          customize WhatsApp notification templates.
        </p>
      </div>

      <AdminControlsClient
        currentUserRole={session.role}
        initialClinics={clinics}
        initialProfiles={profiles}
        initialTemplates={templates}
      />
    </div>
  );
}
