import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type { MessageStatus } from '@/types/database.types';

/**
 * GET /api/webhooks/whatsapp
 * Meta WhatsApp Cloud API Webhook Verification Challenge
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || 'physiolab_verify_token_2026';

  if (mode === 'subscribe' && token === expectedToken && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Webhook verification failed' }, { status: 403 });
}

/**
 * POST /api/webhooks/whatsapp
 * Reconciles Meta WhatsApp delivery receipts (sent, delivered, read, failed)
 * with central public.message_logs rows by provider_message_id (wamid.xxx).
 */
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const appSecret = process.env.WHATSAPP_APP_SECRET;
    const signature = request.headers.get('x-hub-signature-256');

    if (appSecret && signature) {
      const expectedSig =
        'sha256=' + crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');
      if (signature !== expectedSig) {
        return NextResponse.json({ error: 'Invalid X-Hub-Signature-256' }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    const supabase = createSupabaseAdminClient();
    let updatedCount = 0;

    const entries = Array.isArray(payload?.entry) ? payload.entry : [];
    for (const entry of entries) {
      const changes = Array.isArray(entry?.changes) ? entry.changes : [];
      for (const change of changes) {
        const statuses = Array.isArray(change?.value?.statuses) ? change.value.statuses : [];
        for (const st of statuses) {
          const wamid = st.id ? String(st.id) : null;
          const rawStatus = String(st.status || '').toLowerCase();
          if (!wamid) continue;

          const nowIso = st.timestamp
            ? new Date(Number(st.timestamp) * 1000).toISOString()
            : new Date().toISOString();

          if (rawStatus === 'failed') {
            const errTitle =
              st.errors?.[0]?.title || st.errors?.[0]?.message || 'Meta webhook delivery failure';
            const { data: existing } = await supabase
              .from('message_logs')
              .select('id')
              .eq('provider_message_id', wamid)
              .maybeSingle();

            if (existing?.id) {
              await supabase.rpc('record_message_dispatch_failure', {
                p_message_id: existing.id,
                p_error_message: errTitle,
              });
              updatedCount++;
            }
          } else if (['sent', 'delivered', 'read'].includes(rawStatus)) {
            const updatePatch: Record<string, string> = {
              status: rawStatus as MessageStatus,
              updated_at: nowIso,
            };
            if (rawStatus === 'sent') updatePatch.sent_at = nowIso;
            if (rawStatus === 'delivered') updatePatch.delivered_at = nowIso;
            if (rawStatus === 'read') updatePatch.read_at = nowIso;

            await supabase
              .from('message_logs')
              .update(updatePatch)
              .eq('provider_message_id', wamid);
            updatedCount++;
          }
        }
      }
    }

    return NextResponse.json({ received: true, updatedCount });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook processing error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
