import { createClient } from '@/lib/supabase/server'
import { ReferralReadOnly } from '@/components/referral/ReferralReadOnly'
import { StaffStatusPanel } from '@/components/shared/StaffStatusPanel'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Referral Detail — Staff View',
}

export default async function StaffReferralDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: referral } = await supabase
    .from('referrals')
    .select(`
      *,
      family_members(*),
      assets(*),
      referral_documents(*),
      facilities(*),
      profiles!referrer_id(first_name, last_name, organization, phone, email)
    `)
    .eq('id', id)
    .single()

  if (!referral) notFound()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main referral content */}
      <div className="lg:col-span-2">
        <ReferralReadOnly referral={referral} isStaffView />
      </div>

      {/* Staff action sidebar */}
      <div className="space-y-4">
        <StaffStatusPanel referral={referral} />
      </div>
    </div>
  )
}

