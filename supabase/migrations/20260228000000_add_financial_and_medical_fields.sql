-- Add allergies column to referrals table
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS allergies text;

-- Add income and insurance entry arrays (stored as JSONB)
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS income_entries jsonb;
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS medical_insurance_entries jsonb;
