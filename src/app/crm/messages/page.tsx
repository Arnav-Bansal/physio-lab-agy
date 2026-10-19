import React from 'react';
import { repositories } from '@/lib/repositories';
import { MessagesCenterClient } from '@/components/crm/messages/messages-center-client';

export const dynamic = 'force-dynamic';

export default async function CrmMessagesPage() {
  const [logs, templates, patients] = await Promise.all([
    repositories.messages.listMessageLogs(undefined, 100).catch(() => []),
    repositories.messages.listTemplates().catch(() => []),
    repositories.patients.searchPatients('', 100).catch(() => []),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Automated Communication &amp; Reliability Engine
        </span>
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mt-1">
          Central WhatsApp Message Log &amp; Retry Queue
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
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
