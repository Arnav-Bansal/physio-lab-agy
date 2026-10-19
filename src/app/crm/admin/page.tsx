import React from 'react';
import { redirect } from 'next/navigation';
import { Settings } from 'lucide-react';
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
      <div className="space-y-1">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary bg-secondary px-2.5 py-0.5 rounded-md">
          <Settings className="h-3.5 w-3.5" />
          <span>Multi-Clinic Governance • Admin Only</span>
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground pt-1">
          Admin Settings — Clinics, Users &amp; Templates
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
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
