import React from 'react';
import { redirect } from 'next/navigation';
import { getPatientSession } from '@/lib/auth/session';
import { PortalShell } from '@/components/layout/portal-shell';

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getPatientSession();
  if (!session) {
    redirect('/login?next=/portal');
  }

  return <PortalShell session={session}>{children}</PortalShell>;
}
