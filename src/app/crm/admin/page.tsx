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

  const [clinics, profiles, templates] = await Promise.all([
    repositories.clinics.listAllClinics().catch(() => []),
    repositories.profiles.listAllProfiles().catch(() => []),
    repositories.messages.listTemplates().catch(() => []),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#00858E]">
          System Administration
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#141413] mt-1">
          Admin Control Center — Clinics, Physios &amp; Templates
        </h1>
        <p className="text-sm text-[#141413]/70 mt-1">
          Configure multi-branch clinics, onboard specialist physiotherapists and reception staff,
          and customize WhatsApp notification templates.
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
