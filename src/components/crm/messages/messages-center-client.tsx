'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquare,
  Play,
  RefreshCw,
  Send,
  AlertTriangle,
  X,
} from 'lucide-react';
import type {
  MessageLogRecord,
  MessageTemplateRecord,
  PatientRecord,
} from '@/types/database.types';
import { renderWhatsAppTemplatePreview } from '@/lib/whatsapp/client';
import { cn, formatDateTimeIST, formatPhoneDisplay } from '@/lib/utils';

interface MessagesCenterClientProps {
  initialLogs: MessageLogRecord[];
  templates: MessageTemplateRecord[];
  patients: PatientRecord[];
}

export function MessagesCenterClient({
  initialLogs,
  templates,
  patients,
}: MessagesCenterClientProps) {
  const router = useRouter();
  const [logs, setLogs] = useState<MessageLogRecord[]>(initialLogs);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [triggerFilter, setTriggerFilter] = useState<string>('all');

  // Queue worker state
  const [runningQueue, setRunningQueue] = useState(false);
  const [dispatchingRowId, setDispatchingRowId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Manual Follow-up Modal state
  const [showManualModal, setShowManualModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [customNote, setCustomNote] = useState(
    'Dr. Arjun Malhotra — Checking in on your knee rehab exercises'
  );
  const [sendingManual, setSendingManual] = useState(false);

  const templateMap = useMemo(() => {
    const map = new Map<string, MessageTemplateRecord>();
    for (const t of templates) {
      map.set(t.trigger_type, t);
    }
    return map;
  }, [templates]);

  const filteredLogs = useMemo(() => {
    return logs.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (triggerFilter !== 'all' && item.trigger_type !== triggerFilter) return false;
      return true;
    });
  }, [logs, statusFilter, triggerFilter]);

  async function handleRunDispatchWorker() {
    setRunningQueue(true);
    setToast(null);
    try {
      const res = await fetch('/api/cron/whatsapp-dispatch', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setToast(
          `WhatsApp Queue Worker completed: ${data.processed} due messages processed (${data.succeeded} sent, ${data.failed} failed).`
        );
        router.refresh();
      }
    } finally {
      setRunningQueue(false);
    }
  }

  async function handleDispatchSingleRow(messageId: string, simulateFailure = false) {
    setDispatchingRowId(messageId);
    setToast(null);
    try {
      const res = await fetch('/api/cron/whatsapp-dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, simulateFailure }),
      });
      const data = await res.json();
      if (data.success) {
        setLogs((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  status: 'delivered',
                  provider_message_id: data.providerMessageId,
                  attempts: (m.attempts || 0) + 1,
                  last_error: null,
                }
              : m
          )
        );
        setToast(`Message dispatched (${data.providerMessageId})`);
      } else {
        setLogs((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  status: 'failed',
                  attempts: (m.attempts || 0) + 1,
                  last_error: data.error || 'Simulated failure',
                }
              : m
          )
        );
        setToast(
          `Message failed (${data.error}) — queued in exponential backoff retry queue (+2m / +10m / +30m).`
        );
      }
      router.refresh();
    } finally {
      setDispatchingRowId(null);
    }
  }

  async function handleSendManualFollowUp(e: React.FormEvent) {
    e.preventDefault();
    setSendingManual(true);
    setToast(null);
    try {
      const res = await fetch('/api/crm/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatientId,
          customNote,
        }),
      });
      const data = await res.json();
      if (res.ok && data.messageLog) {
        setLogs((prev) => [data.messageLog, ...prev]);
        setShowManualModal(false);
        setToast('Manual WhatsApp follow-up dispatched and logged!');
        router.refresh();
      }
    } finally {
      setSendingManual(false);
    }
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-between gap-4 text-xs sm:text-sm font-bold text-emerald-800">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{toast}</span>
          </span>
          <button type="button" onClick={() => setToast(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Top Action & Filter Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#D6CFC2] shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-[#D6CFC2] bg-[#F5F2EB]/60 text-xs font-bold"
            >
              <option value="all">All Statuses ({logs.length})</option>
              <option value="queued">Queued (Scheduled 24h / 2h Reminders)</option>
              <option value="sent">Sent</option>
              <option value="delivered">Delivered</option>
              <option value="failed">Failed (In Retry Queue)</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={triggerFilter}
              onChange={(e) => setTriggerFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-[#D6CFC2] bg-[#F5F2EB]/60 text-xs font-bold"
            >
              <option value="all">All Lifecycle Triggers</option>
              <option value="booking_confirmation">Booking Confirmation (Immediate)</option>
              <option value="reminder_24h">24-Hour Prior Reminder</option>
              <option value="reminder_2h">2-Hour Prior Reminder</option>
              <option value="appointment_cancelled">Appointment Cancelled</option>
              <option value="appointment_no_show">Missed Appointment (No-Show)</option>
              <option value="manual_followup">Manual CRM Follow-Up</option>
              <option value="otp_verification">Patient Portal OTP Login</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              disabled={runningQueue}
              onClick={handleRunDispatchWorker}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F5F2EB] hover:bg-[#DCE8E6] text-[#141413] border border-[#D6CFC2] text-xs font-extrabold transition-colors"
            >
              {runningQueue ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#00858E]" />
              ) : (
                <Play className="h-4 w-4 text-[#00858E]" />
              )}
              <span>Run Reminder &amp; Retry Worker Now</span>
            </button>

            <button
              type="button"
              onClick={() => setShowManualModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00858E] hover:bg-[#006D75] text-white text-xs font-extrabold shadow-sm transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
              <span>+ Send Manual Follow-Up</span>
            </button>
          </div>
        </div>
      </div>

      {/* Central Message Log List */}
      <div className="space-y-3">
        {filteredLogs.map((log) => {
          const tpl = templateMap.get(log.trigger_type);
          const renderedBody = tpl
            ? renderWhatsAppTemplatePreview(tpl.body_preview, log.template_variables || {})
            : JSON.stringify(log.template_variables);

          return (
            <div
              key={log.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-[#D6CFC2] shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5"
            >
              <div className="space-y-2 max-w-3xl">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCE8E6] text-[#006D75] text-xs font-extrabold uppercase tracking-wider">
                    <MessageSquare className="h-3.5 w-3.5" />
                    {log.trigger_type.replace(/_/g, ' ')}
                  </span>

                  <span
                    className={cn(
                      'px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase',
                      log.status === 'delivered' || log.status === 'sent'
                        ? 'bg-emerald-100 text-emerald-800'
                        : log.status === 'queued'
                        ? 'bg-sky-100 text-sky-800'
                        : log.status === 'failed'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-600'
                    )}
                  >
                    {log.status} (Attempts: {log.attempts}/{log.max_attempts})
                  </span>

                  <span className="text-xs font-bold text-[#141413]">
                    To: {formatPhoneDisplay(log.recipient_phone)}
                  </span>
                </div>

                {/* Rendered Dynamic Variables Message Preview */}
                <p className="text-xs sm:text-sm text-[#141413]/85 bg-[#F5F2EB]/70 p-3.5 rounded-2xl border border-[#D6CFC2]">
                  {renderedBody}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#141413]/60">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3 text-[#00858E]" />
                    Scheduled For: <strong>{formatDateTimeIST(log.scheduled_for)}</strong>
                  </span>
                  {log.sent_at && (
                    <span>Sent At: {formatDateTimeIST(log.sent_at)}</span>
                  )}
                  {log.provider_message_id && (
                    <span className="font-mono text-[10px]">
                      ID: {log.provider_message_id}
                    </span>
                  )}
                </div>

                {log.last_error && (
                  <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>
                      Last Error: {log.last_error}
                      {log.next_retry_at
                        ? ` • Next Retry At: ${formatDateTimeIST(log.next_retry_at)}`
                        : ''}
                    </span>
                  </div>
                )}
              </div>

              {/* Retry & Dispatch Controls */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {(log.status === 'queued' || log.status === 'failed') && (
                  <button
                    type="button"
                    disabled={dispatchingRowId === log.id}
                    onClick={() => handleDispatchSingleRow(log.id, false)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00858E] hover:bg-[#006D75] text-white text-xs font-extrabold transition-colors"
                  >
                    {dispatchingRowId === log.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3.5 w-3.5" />
                    )}
                    <span>{log.status === 'failed' ? 'Retry Dispatch Now' : 'Send Now'}</span>
                  </button>
                )}

                {log.status !== 'failed' && (
                  <button
                    type="button"
                    disabled={dispatchingRowId === log.id}
                    onClick={() => handleDispatchSingleRow(log.id, true)}
                    className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-bold transition-colors"
                  >
                    Test Retry Queue
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Send Manual Follow-Up Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#D6CFC2] shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#E8E2D7] pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#00858E]">
                  Meta WhatsApp Cloud API
                </span>
                <h2 className="text-xl font-extrabold text-[#141413]">
                  Trigger Manual Patient Follow-Up
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                className="p-2 rounded-xl bg-[#F5F2EB] text-[#141413]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSendManualFollowUp} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold uppercase mb-1">
                  Select Patient *
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-[#D6CFC2] bg-[#F5F2EB]/60 font-bold"
                >
                  {patients.map((pt) => (
                    <option key={pt.id} value={pt.id}>
                      {pt.full_name} ({formatPhoneDisplay(pt.phone)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1">
                  Specialist / Follow-Up Context (`{'{{physio}}'}` variable)
                </label>
                <input
                  type="text"
                  required
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D6CFC2] bg-[#F5F2EB]/60"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#D6CFC2] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingManual}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00858E] text-white font-extrabold"
                >
                  {sendingManual && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>Send WhatsApp Message</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
