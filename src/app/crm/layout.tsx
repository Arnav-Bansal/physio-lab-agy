import React from 'react';
import { getCrmSession } from '@/lib/auth/session';
import { CrmShell } from '@/components/layout/crm-shell';

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const session = await getCrmSession();
  return <CrmShell session={session}>{children}</CrmShell>;
}
