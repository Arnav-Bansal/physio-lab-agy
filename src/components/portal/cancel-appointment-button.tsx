'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { XCircle, Loader2 } from 'lucide-react';

export function CancelAppointmentButton({ appointmentId }: { appointmentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    if (!confirm('Are you sure you want to cancel this scheduled appointment? A WhatsApp confirmation will be sent immediately.')) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/portal/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId,
          reason: 'Cancelled by patient from Patient Web Portal',
        }),
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handleCancel}
      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
      <span>Cancel Booking</span>
    </button>
  );
}
