import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OnboardingForm } from '@/components/auth/OnboardingForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Complete Your Profile — Zacharia Frey Referral Portal',
}

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  if (profile.onboarding_completed) {
    redirect('/dashboard')
  }

  return <OnboardingForm profile={profile} userId={user.id} />
}
