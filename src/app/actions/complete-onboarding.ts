'use server'

import { createClient } from '@supabase/supabase-js'

interface OnboardingData {
  referrer_type: string
  mailing_street: string
  mailing_city: string
  mailing_state: string
  mailing_zip: string
  billing_street: string
  billing_city: string
  billing_state: string
  billing_zip: string
  primary_contact_name: string
  primary_contact_phone: string
  primary_contact_email: string
  billing_contact_name: string
  billing_contact_phone: string
  billing_contact_email: string
}

export async function completeOnboarding(userId: string, data: OnboardingData) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabase
    .from('profiles')
    .update({
      ...data,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}
