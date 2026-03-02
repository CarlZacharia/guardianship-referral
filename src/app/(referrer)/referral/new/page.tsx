import { createClient } from '@/lib/supabase/server'
import { ReferralForm } from '@/components/referral/ReferralForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'New Referral — Zacharia Brown Portal',
}

export default async function NewReferralPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization, referrer_type')
    .eq('id', user!.id)
    .single()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">New Referral</h1>
        <p className="text-muted-foreground mt-1">
          Your progress is saved automatically after each step.
        </p>
      </div>
      <ReferralForm
        userId={user!.id}
        referrerOrganization={profile?.organization}
        referrerType={profile?.referrer_type}
      />
    </div>
  )
}

