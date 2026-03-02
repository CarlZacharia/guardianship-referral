import { createClient } from '@/lib/supabase/server'
import { ReferralList } from '@/components/shared/ReferralList'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Referrals — Zacharia Brown Portal',
}

export default async function ReferrerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: referrals } = await supabase
    .from('referrals')
    .select(`
      id, created_at, updated_at, submitted_at,
      referral_type, urgency, status, current_step,
      client_first_name, client_last_name,
      facility_name_freetext,
      facilities(name)
    `)
    .eq('referrer_id', user!.id)
    .order('updated_at', { ascending: false })

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, organization')
    .eq('id', user!.id)
    .single()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back{profile?.first_name ? `, ${profile.first_name}` : ''}
          </h1>
          <p className="text-muted-foreground mt-1">
            {profile?.organization && `${profile.organization} · `}
            Manage your referrals below
          </p>
        </div>
        <Button asChild>
          <Link href="/referral/new">
            <Plus className="w-4 h-4 mr-2" />
            New Referral
          </Link>
        </Button>
      </div>

      {/* Referral List */}
      <ReferralList
        referrals={referrals || []}
        emptyMessage="You haven't submitted any referrals yet."
        showEditDraft
      />
    </div>
  )
}


