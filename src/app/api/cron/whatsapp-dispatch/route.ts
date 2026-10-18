import { NextResponse } from 'next/server';
import { processWhatsAppDispatchQueue, dispatchMessageLogRow } from '@/lib/whatsapp/client';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type { MessageLogRecord } from '@/types/database.types';

/**
 * GET / POST /api/cron/whatsapp-dispatch
 * Invoked every minute by pg_cron / Vercel Cron or on-demand from the CRM Message Log UI.
 */
export async function GET() {
  try {
    const summary = await processWhatsAppDispatchQueue(30);
    return NextResponse.json({
      success: true,
      ...summary,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Queue dispatch failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    // Optional single-message immediate dispatch or retry
    if (body.messageId) {
      const supabase = createSupabaseAdminClient();
      const { data: row } = await supabase
        .from('message_logs')
        .select('*')
        .eq('id', String(body.messageId))
        .maybeSingle();

      if (!row) {
        return NextResponse.json({ error: 'Message log record not found' }, { status: 404 });
      }

      const result = await dispatchMessageLogRow(
        row as MessageLogRecord,
        null,
        Boolean(body.simulateFailure)
      );
      return NextResponse.json({
        success: result.success,
        providerMessageId: result.providerMessageId,
        error: result.error,
      });
    }

    const summary = await processWhatsAppDispatchQueue(30);
    return NextResponse.json({
      success: true,
      ...summary,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Queue dispatch failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
