-- Trigger the send-referral-report Edge Function when a referral is submitted
-- This uses pg_net to make an HTTP request to the Edge Function
--
-- BEFORE RUNNING: Replace the two placeholders below with your actual values:
--   YOUR_PROJECT_REF  → your Supabase project reference (e.g. abcdefghijklmnop)
--   YOUR_SERVICE_ROLE_KEY → your service_role key from Project Settings > API

-- Enable the pg_net extension (for async HTTP calls from triggers)
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Function that fires the Edge Function via HTTP
CREATE OR REPLACE FUNCTION notify_referral_submitted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only fire when status changes TO 'submitted'
  IF NEW.status = 'submitted' AND (OLD.status IS NULL OR OLD.status <> 'submitted') THEN
    -- Use pg_net to make an async HTTP POST to the Edge Function
    PERFORM net.http_post(
      url := 'https://bwrcuqparmeeeeyngqlu.supabase.co/functions/v1/send-referral-report',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
      ),
      body := jsonb_build_object(
        'record', row_to_json(NEW),
        'old_record', row_to_json(OLD)
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create the trigger on the referrals table
DROP TRIGGER IF EXISTS on_referral_submitted ON referrals;
CREATE TRIGGER on_referral_submitted
  AFTER UPDATE ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION notify_referral_submitted();
