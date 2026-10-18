import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type { MessageLogRecord, MessageTemplateRecord } from '@/types/database.types';

export interface WhatsAppTemplateVariables {
  name?: string;
  date?: string;
  clinic?: string;
  physio?: string;
  otp?: string;
  [key: string]: string | undefined;
}

/**
 * Interpolates {{name}}, {{date}}, {{clinic}}, {{physio}} into a template preview string
 */
export function renderWhatsAppTemplatePreview(
  bodyPreview: string,
  variables: WhatsAppTemplateVariables
): string {
  return bodyPreview.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => {
    return variables[key] ?? `{{${key}}}`;
  });
}

/**
 * Dispatches a single queued or retryable message_logs row via Meta WhatsApp Cloud API
 * (with automatic sandbox simulation when WHATSAPP_ACCESS_TOKEN is 'sandbox_token')
 */
export async function dispatchMessageLogRow(
  log: MessageLogRecord,
  template?: MessageTemplateRecord | null,
  simulateFailure = false
): Promise<{ success: boolean; providerMessageId?: string; error?: string }> {
  const supabase = createSupabaseAdminClient();

  // Claim row as 'processing'
  await supabase
    .from('message_logs')
    .update({ status: 'processing', updated_at: new Date().toISOString() })
    .eq('id', log.id);

  try {
    if (simulateFailure) {
      throw new Error('Simulated Meta Cloud API HTTP 503 rate-limit transient error');
    }

    const isLiveWhatsApp =
      process.env.WHATSAPP_ACCESS_TOKEN &&
      process.env.WHATSAPP_ACCESS_TOKEN !== 'sandbox_token' &&
      process.env.WHATSAPP_PHONE_NUMBER_ID &&
      process.env.WHATSAPP_PHONE_NUMBER_ID !== 'sandbox_phone_id';

    let providerMessageId = `wamid.physiolab.${log.trigger_type}.${Date.now()}.${Math.random()
      .toString(36)
      .slice(2, 7)}`;

    if (isLiveWhatsApp) {
      const varsOrder = Array.isArray(template?.variables_order)
        ? template.variables_order
        : ['name', 'date', 'clinic', 'physio'];

      const parameters = varsOrder.map((key) => ({
        type: 'text',
        text: String(log.template_variables?.[key] ?? '—'),
      }));

      const response = await fetch(
        `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: log.recipient_phone.replace('+', ''),
            type: 'template',
            template: {
              name: template?.meta_template_name || `physiolab_${log.trigger_type}`,
              language: { code: template?.language_code || 'en' },
              components: [
                {
                  type: 'body',
                  parameters,
                },
              ],
            },
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Meta Graph API Error (${response.status}): ${errText.slice(0, 200)}`);
      }

      const result = await response.json();
      if (result?.messages?.[0]?.id) {
        providerMessageId = result.messages[0].id;
      }
    }

    const nowIso = new Date().toISOString();
    await supabase
      .from('message_logs')
      .update({
        status: isLiveWhatsApp ? 'sent' : 'delivered',
        sent_at: nowIso,
        delivered_at: isLiveWhatsApp ? null : nowIso,
        provider_message_id: providerMessageId,
        attempts: (log.attempts || 0) + 1,
        next_retry_at: null,
        last_error: null,
        updated_at: nowIso,
      })
      .eq('id', log.id);

    return { success: true, providerMessageId };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown WhatsApp dispatch failure';
    // Invoke our PostgreSQL exponential-backoff RPC function
    await supabase.rpc('record_message_dispatch_failure', {
      p_message_id: log.id,
      p_error_message: errorMessage,
    });
    return { success: false, error: errorMessage };
  }
}

/**
 * Processes due queued reminders (booking_confirmation, reminder_24h, reminder_2h, etc.)
 * and retries failed dispatches whose exponential backoff window has elapsed.
 */
export async function processWhatsAppDispatchQueue(batchSize = 25) {
  const supabase = createSupabaseAdminClient();
  const nowIso = new Date().toISOString();

  // Fetch templates map
  const { data: templates } = await supabase.from('message_templates').select('*');
  const templateById = new Map<string, MessageTemplateRecord>();
  const templateByTrigger = new Map<string, MessageTemplateRecord>();
  for (const t of (templates ?? []) as MessageTemplateRecord[]) {
    templateById.set(t.id, t);
    templateByTrigger.set(t.trigger_type, t);
  }

  // 1. Fetch due 'queued' messages where scheduled_for <= now()
  const { data: dueQueued } = await supabase
    .from('message_logs')
    .select('*')
    .eq('status', 'queued')
    .lte('scheduled_for', nowIso)
    .order('scheduled_for', { ascending: true })
    .limit(batchSize);

  // 2. Fetch retryable 'failed' messages where attempts < max_attempts AND next_retry_at <= now()
  const { data: dueRetries } = await supabase
    .from('message_logs')
    .select('*')
    .eq('status', 'failed')
    .lte('next_retry_at', nowIso)
    .order('next_retry_at', { ascending: true })
    .limit(batchSize);

  const candidates = [
    ...((dueQueued ?? []) as MessageLogRecord[]),
    ...((dueRetries ?? []) as MessageLogRecord[]).filter(
      (r) => (r.attempts || 0) < (r.max_attempts || 3)
    ),
  ];

  let succeeded = 0;
  let failed = 0;

  for (const item of candidates) {
    const tpl =
      (item.template_id ? templateById.get(item.template_id) : undefined) ||
      templateByTrigger.get(item.trigger_type);

    const res = await dispatchMessageLogRow(item, tpl);
    if (res.success) {
      succeeded++;
    } else {
      failed++;
    }
  }

  return {
    processed: candidates.length,
    succeeded,
    failed,
    timestamp: nowIso,
  };
}
