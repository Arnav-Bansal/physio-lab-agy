'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Loader2, CheckCircle2 } from 'lucide-react';

export function PatientQuickWhatsAppButton({
  patientId,
  patientName,
}: {
  patientId: string;
  patientName: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSend() {
    setLoading(true);
    setSent(false);
    try {
      const res = await fetch('/api/crm/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          customNote: `Follow-up check-in for ${patientName}`,
        }),
      });
      if (res.ok) {
        setSent(true);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSend}
      disabled={loading}
      className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-colors disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : sent ? (
        <CheckCircle2 className="h-4 w-4" />
      ) : (
        <MessageSquare className="h-4 w-4" />
      )}
      <span>{sent ? 'WhatsApp Sent!' : '1-Click Send WhatsApp'}</span>
    </button>
  );
}
