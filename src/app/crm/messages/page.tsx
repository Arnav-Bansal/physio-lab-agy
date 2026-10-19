import React from 'react';
import { redirect } from 'next/navigation';
import { getCrmSession } from '@/lib/auth/session';
import { repositories } from '@/lib/repositories';
import { MessagesCenterClient } from '@/components/crm/messages/messages-center-client';

export const dynamic = 'force-dynamic';

export default async function CrmMessagesPage() {
  const session = await getCrmSession();
  if (!session) {
    redirect('/crm/login');
  }

  // RBAC: Central WhatsApp Logs & Retry Queue are restricted to Admin and Staff (Reception)
  if (session.role === 'physio') {
    redirect('/crm');
  }

  const [logs, templates, patients] = await Promise.all([
    repositories.messages.listMessageLogs(undefined, 100).catch(() => []),
    repositories.messages.listTemplates().catch(() => []),
    repositories.patients.searchPatients('', 100).catch(() => []),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          WhatsApp Message Logs &amp; Retry Queue
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor immediate booking confirmations, 24-hour and 2-hour scheduled reminders,
          cancellation/no-show triggers, manual follow-ups, and exponential-backoff retries.
        </p>
      </div>

      <MessagesCenterClient
        initialLogs={logs}
        templates={templates}
        patients={patients}
      />
    </div>
  );
}
