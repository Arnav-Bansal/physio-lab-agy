// Supabase Edge Function: whatsapp-dispatcher
// Invoked every 1 minute by pg_cron to dispatch due 24h/2h WhatsApp reminders
// and retry failed messages using exponential backoff.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

Deno.serve(async (req: Request) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const waToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN') || 'sandbox_token';
    const waPhoneId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID') || 'sandbox_phone_id';

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const nowIso = new Date().toISOString();

    const { data: dueMessages, error } = await supabase
      .from('message_logs')
      .select('*, template:message_templates(*)')
      .or(
        `and(status.eq.queued,scheduled_for.lte.${nowIso}),and(status.eq.failed,next_retry_at.lte.${nowIso})`
      )
      .order('scheduled_for', { ascending: true })
      .limit(25);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    let succeeded = 0;
    let failed = 0;

    for (const msg of dueMessages ?? []) {
      if ((msg.attempts || 0) >= (msg.max_attempts || 3)) continue;

      try {
        let providerId = `wamid.edge.${msg.trigger_type}.${Date.now()}`;

        if (waToken !== 'sandbox_token' && waPhoneId !== 'sandbox_phone_id') {
          const varsOrder: string[] = msg.template?.variables_order || [
            'name',
            'date',
            'clinic',
            'physio',
          ];
          const parameters = varsOrder.map((k: string) => ({
            type: 'text',
            text: String(msg.template_variables?.[k] ?? '—'),
          }));

          const resp = await fetch(`https://graph.facebook.com/v20.0/${waPhoneId}/messages`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${waToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to: String(msg.recipient_phone).replace('+', ''),
              type: 'template',
              template: {
                name: msg.template?.meta_template_name || `physiolab_${msg.trigger_type}`,
                language: { code: msg.template?.language_code || 'en' },
                components: [{ type: 'body', parameters }],
              },
            }),
          });

          if (!resp.ok) {
            throw new Error(`Meta API HTTP ${resp.status}`);
          }
          const json = await resp.json();
          providerId = json?.messages?.[0]?.id || providerId;
        }

        await supabase
          .from('message_logs')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            provider_message_id: providerId,
            attempts: (msg.attempts || 0) + 1,
            next_retry_at: null,
          })
          .eq('id', msg.id);
        succeeded++;
      } catch (err) {
        await supabase.rpc('record_message_dispatch_failure', {
          p_message_id: msg.id,
          p_error_message: err instanceof Error ? err.message : 'Edge dispatch failure',
        });
        failed++;
      }
    }

    return new Response(
      JSON.stringify({
        processed: (dueMessages ?? []).length,
        succeeded,
        failed,
        timestamp: nowIso,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unexpected error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
