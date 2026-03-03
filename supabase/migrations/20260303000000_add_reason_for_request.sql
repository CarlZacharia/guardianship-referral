-- Add reason_for_request column to referrals table
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS reason_for_request text;
