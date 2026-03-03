-- Allow referrers to delete their own draft referrals and related child rows

CREATE POLICY "Users can delete own referrals"
  ON referrals FOR DELETE
  TO authenticated
  USING (referrer_id = auth.uid());

CREATE POLICY "Users can delete family_members on own referrals"
  ON family_members FOR DELETE
  TO authenticated
  USING (referral_id IN (SELECT id FROM referrals WHERE referrer_id = auth.uid()));

CREATE POLICY "Users can delete assets on own referrals"
  ON assets FOR DELETE
  TO authenticated
  USING (referral_id IN (SELECT id FROM referrals WHERE referrer_id = auth.uid()));

CREATE POLICY "Users can delete referral_documents on own referrals"
  ON referral_documents FOR DELETE
  TO authenticated
  USING (referral_id IN (SELECT id FROM referrals WHERE referrer_id = auth.uid()));
