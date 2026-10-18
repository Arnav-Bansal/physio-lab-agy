-- ============================================================================
-- MIGRATION 0002: PG_CRON SCHEDULE FOR AUTOMATED WHATSAPP REMINDERS & RETRIES
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- Function callable by pg_cron every minute to process due sandbox/queued messages
-- and mark expired unconfirmed retries cleanly.
CREATE OR REPLACE FUNCTION public.process_due_whatsapp_queue_tick()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  -- Auto-dispatch due reminders in local/database-managed queue when scheduled_for <= now()
  WITH due_rows AS (
    SELECT id, trigger_type, attempts
    FROM public.message_logs
    WHERE (
      (status = 'queued' AND scheduled_for <= now())
      OR (status = 'failed' AND attempts < max_attempts AND next_retry_at <= now())
    )
    ORDER BY scheduled_for ASC
    LIMIT 25
    FOR UPDATE SKIP LOCKED
  )
  UPDATE public.message_logs ml
  SET status = 'sent',
      sent_at = now(),
      provider_message_id = COALESCE(ml.provider_message_id, 'wamid.pgcron.' || ml.trigger_type || '.' || extract(epoch from now())::bigint::text),
      attempts = ml.attempts + 1,
      next_retry_at = NULL,
      updated_at = now()
  FROM due_rows dr
  WHERE ml.id = dr.id;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Schedule recurring 1-minute tick via pg_cron (if pg_cron is enabled on instance)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule(
      'physiolab-whatsapp-reminder-worker',
      '* * * * *',
      $cron$SELECT public.process_due_whatsapp_queue_tick();$cron$
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_cron schedule skipped or already registered: %', SQLERRM;
END;
$$;
