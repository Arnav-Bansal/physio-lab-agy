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
  CheckCheck,
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

  // Manual Follow-up Drawer state
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

  const kpiCounts = useMemo(() => {
    const delivered = logs.filter(
      (m) => m.status === 'delivered' || m.status === 'sent'
    ).length;
    const queued = logs.filter((m) => m.status === 'queued').length;
    const failed = logs.filter((m) => m.status === 'failed').length;
    return { total: logs.length, delivered, queued, failed };
  }, [logs]);

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
        setToast(`WhatsApp message dispatched (${data.providerMessageId})`);
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
          `Message failed (${data.error}) — scheduled in exponential backoff retry queue (+2m / +10m / +30m).`
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
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between gap-4 text-xs sm:text-sm font-bold text-emerald-800">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{toast}</span>
          </span>
          <button type="button" onClick={() => setToast(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Delivery Funnel KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-border shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Total Lifecycle Events
          </span>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-foreground mt-1">
            {kpiCounts.total}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-border shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
            Sent &amp; Delivered
          </span>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-emerald-700 mt-1">
            {kpiCounts.delivered}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-border shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
            Scheduled Reminders (24h/2h)
          </span>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-primary mt-1">
            {kpiCounts.queued}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-border shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-700">
            Retry Queue (Backoff)
          </span>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-red-600 mt-1">
            {kpiCounts.failed}
          </p>
        </div>
      </div>

      {/* Top Action & Filter Bar */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-border shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-border bg-muted/40 text-xs font-bold"
          >
            <option value="all">All Statuses ({logs.length})</option>
            <option value="queued">Queued (24h / 2h Reminders)</option>
            <option value="sent">Sent</option>
            <option value="delivered">Delivered</option>
            <option value="failed">Failed (In Retry Queue)</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={triggerFilter}
            onChange={(e) => setTriggerFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-border bg-muted/40 text-xs font-bold"
          >
            <option value="all">All Lifecycle Triggers</option>
            <option value="booking_confirmation">Booking Confirmation (Immediate)</option>
            <option value="reminder_24h">24-Hour Prior Reminder</option>
            <option value="reminder_2h">2-Hour Prior Reminder</option>
            <option value="appointment_cancelled">Appointment Cancelled</option>
            <option value="appointment_no_show">Missed Appointment (No-Show)</option>
            <option value="manual_followup">Manual Care Follow-Up</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            disabled={runningQueue}
            onClick={handleRunDispatchWorker}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted/60 hover:bg-secondary text-foreground border border-border text-xs font-bold transition-colors"
          >
            {runningQueue ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <Play className="h-4 w-4 text-primary" />
            )}
            <span>Process Due Reminders &amp; Retries</span>
          </button>

          <button
            type="button"
            onClick={() => setShowManualModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors"
          >
            <Send className="h-3.5 w-3.5" />
            <span>+ Send WhatsApp Follow-Up</span>
          </button>
        </div>
      </div>

      {/* WhatsApp Chat-Style Message Feed */}
      <div className="grid grid-cols-1 gap-3.5">
        {filteredLogs.map((log) => {
          const tpl = templateMap.get(log.trigger_type);
          const renderedBody = tpl
            ? renderWhatsAppTemplatePreview(tpl.body_preview, log.template_variables || {})
            : JSON.stringify(log.template_variables);

          return (
            <div
              key={log.id}
              className="bg-white rounded-2xl p-5 sm:p-6 border border-border shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5"
            >
              <div className="space-y-3 max-w-3xl flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-bold uppercase tracking-wider">
                    <MessageSquare className="h-3.5 w-3.5 text-primary" />
                    {log.trigger_type.replace(/_/g, ' ')}
                  </span>

                  <span
                    className={cn(
                      'px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold uppercase',
                      log.status === 'delivered' || log.status === 'sent'
                        ? 'bg-emerald-100 text-emerald-800'
                        : log.status === 'queued'
                        ? 'bg-sky-100 text-sky-800'
                        : log.status === 'failed'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-600'
                    )}
                  >
                    {log.status} • {log.attempts}/{log.max_attempts}
                  </span>

                  <span className="text-xs font-mono font-bold text-foreground">
                    Recipient: {formatPhoneDisplay(log.recipient_phone)}
                  </span>
                </div>

                {/* Authentic WhatsApp Bubble Preview */}
                <div className="relative rounded-2xl rounded-tl-sm bg-[#ECFDF5] border border-emerald-200/90 p-4 text-xs sm:text-sm text-emerald-950 shadow-sm">
                  <p className="leading-relaxed">{renderedBody}</p>
                  <div className="flex items-center justify-end gap-1.5 text-[10px] font-mono text-emerald-700/80 mt-2">
                    <span>{formatDateTimeIST(log.scheduled_for)}</span>
                    <CheckCheck className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                </div>

                {log.last_error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>
                      Delivery Error: {log.last_error}
                      {log.next_retry_at
                        ? ` • Next Retry: ${formatDateTimeIST(log.next_retry_at)}`
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
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold transition-colors"
                  >
                    {dispatchingRowId === log.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3.5 w-3.5" />
                    )}
                    <span>{log.status === 'failed' ? 'Retry Dispatch' : 'Dispatch Now'}</span>
                  </button>
                )}

                {log.status !== 'failed' && (
                  <button
                    type="button"
                    disabled={dispatchingRowId === log.id}
                    onClick={() => handleDispatchSingleRow(log.id, true)}
                    className="px-3 py-2 rounded-xl bg-muted/60 hover:bg-amber-50 text-muted-foreground hover:text-amber-800 border border-border text-[11px] font-semibold transition-colors"
                  >
                    Simulate Retry
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Slide-Over Send Manual Follow-Up Drawer */}
      {showManualModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end"
          onClick={() => setShowManualModal(false)}
        >
          <div
            className="bg-white max-w-md w-full h-full p-6 sm:p-8 border-l border-border shadow-2xl space-y-5 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                  WhatsApp Patient Care
                </span>
                <h2 className="text-xl font-bold text-foreground mt-0.5">
                  Send Manual Follow-Up
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                className="p-2 rounded-xl bg-muted/60 text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSendManualFollowUp} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                  Select Patient *
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-border bg-muted/40 font-bold"
                >
                  {patients.map((pt) => (
                    <option key={pt.id} value={pt.id}>
                      {pt.full_name} ({formatPhoneDisplay(pt.phone)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                  Follow-Up Context / Specialist Message
                </label>
                <textarea
                  rows={3}
                  required
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-border bg-muted/40"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-border font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingManual}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
                >
                  {sendingManual && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>Dispatch WhatsApp</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
