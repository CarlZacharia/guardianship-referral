import { createClient } from '@/lib/supabase/server'
import { ReferrersTable } from '@/components/shared/ReferrersTable'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Referrers — Zacharia Frey Portal',
}

export default async function ReferrersPage() {
  const supabase = await createClient()

  const { data: referrers } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'referrer')
    .order('created_at', { ascending: false })

  // Count referrals per referrer
  const { data: referralRows } = await supabase
    .from('referrals')
    .select('referrer_id')
    .not('referrer_id', 'is', null)

  const countMap: Record<string, number> = {}
  referralRows?.forEach(r => {
    if (r.referrer_id) countMap[r.referrer_id] = (countMap[r.referrer_id] || 0) + 1
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Referrers</h1>
        <p className="text-muted-foreground mt-1">
          View and manage referrer accounts. Referrers are facilities and individuals who submit referrals.
        </p>
      </div>
      <ReferrersTable referrers={referrers || []} referralCounts={countMap} />
    </div>
  )
}
