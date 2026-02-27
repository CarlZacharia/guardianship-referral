-- Add onboarding-related columns to profiles table

-- Referrer type (was collected in UI but never persisted)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referrer_type text;

-- Onboarding completion flag
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;

-- Mailing address
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mailing_street text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mailing_city text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mailing_state text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mailing_zip text;

-- Billing address
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS billing_street text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS billing_city text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS billing_state text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS billing_zip text;

-- Primary contact (for referral information)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS primary_contact_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS primary_contact_phone text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS primary_contact_email text;

-- Billing contact
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS billing_contact_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS billing_contact_phone text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS billing_contact_email text;

-- Mark all existing profiles as having completed onboarding
-- so they are not forced through the new flow
UPDATE profiles SET onboarding_completed = true WHERE onboarding_completed = false;
