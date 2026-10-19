'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

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
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    setLoading(true);
    setSent(false);
    setError(null);
    try {
      const res = await fetch('/api/crm/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          customNote: `Follow-up check-in for ${patientName}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send WhatsApp');
      }
      setSent(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'WhatsApp failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleSend}
        disabled={loading}
        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-colors disabled:opacity-50"
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
      {error && (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600">
          <AlertCircle className="h-3 w-3" />
          <span>{error}</span>
        </span>
      )}
    </div>
  );
}
