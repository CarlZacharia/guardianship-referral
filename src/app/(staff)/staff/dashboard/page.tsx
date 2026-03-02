import { createClient } from '@/lib/supabase/server'
import { ReferralList } from '@/components/shared/ReferralList'
import { StaffDashboardFilters } from '@/components/shared/StaffDashboardFilters'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Staff Dashboard — Zacharia Brown Portal',
}

export default async function StaffDashboard({
  searchParams,
}: {
  searchParams: {
    status?: string
    type?: string
    urgency?: string
    search?: string
  }
}) {
  const supabase = await createClient()

  let query = supabase
    .from('referrals')
    .select(`
      id, created_at, updated_at, submitted_at,
      referral_type, urgency, status, current_step,
      client_first_name, client_last_name,
      facility_name_freetext,
      facilities(name),
      profiles!referrer_id(first_name, last_name, organization)
    `)
    .order('updated_at', { ascending: false })

  if (searchParams.status) query = query.eq('status', searchParams.status)
  if (searchParams.type) query = query.eq('referral_type', searchParams.type)
  if (searchParams.urgency) query = query.eq('urgency', searchParams.urgency)

  const { data: referrals } = await query

  // Filter by search client-side (name search)
  const filtered = searchParams.search
    ? (referrals || []).filter(r =>
        `${r.client_first_name} ${r.client_last_name}`
          .toLowerCase()
          .includes(searchParams.search!.toLowerCase())
      )
    : (referrals || [])

  // Summary counts
  const counts = {
    total: referrals?.length || 0,
    submitted: referrals?.filter(r => r.status === 'submitted').length || 0,
    in_review: referrals?.filter(r => r.status === 'in_review').length || 0,
    emergency: referrals?.filter(r => r.urgency === 'emergency').length || 0,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">All Referrals</h1>
        <p className="text-muted-foreground mt-1">
          {counts.total} total · {counts.submitted} pending review · {counts.emergency} emergency
        </p>
      </div>

      <StaffDashboardFilters />

      <ReferralList
        referrals={filtered}
        isStaffView
        emptyMessage="No referrals match the current filters."
      />
    </div>
  )
}

