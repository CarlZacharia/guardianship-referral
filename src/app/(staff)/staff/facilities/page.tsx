import { createClient } from '@/lib/supabase/server'
import { FacilitiesTable } from '@/components/shared/FacilitiesTable'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Facilities — Zacharia Frey Portal',
}

export default async function FacilitiesPage() {
  const supabase = await createClient()

  const { data: facilities } = await supabase
    .from('facilities')
    .select('*')
    .order('name')

  // Count referrals per facility for display
  const { data: referralCounts } = await supabase
    .from('referrals')
    .select('facility_id')
    .not('facility_id', 'is', null)

  const countMap: Record<string, number> = {}
  referralCounts?.forEach(r => {
    if (r.facility_id) countMap[r.facility_id] = (countMap[r.facility_id] || 0) + 1
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Facilities</h1>
        <p className="text-muted-foreground mt-1">
          Manage referring facilities. Facilities listed here appear in the referral form dropdown.
        </p>
      </div>
      <FacilitiesTable facilities={facilities || []} referralCounts={countMap} />
    </div>
  )
}

