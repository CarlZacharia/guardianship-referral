-- Add home ownership fields to referrals table
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS owns_home boolean DEFAULT false;
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS home_other_residents text;
