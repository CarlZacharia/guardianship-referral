import { createClient } from '@/lib/supabase/server'
import { ReferralForm } from '@/components/referral/ReferralForm'
import { ReferralReadOnly } from '@/components/referral/ReferralReadOnly'
import { notFound, redirect } from 'next/navigation'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Referral — Zacharia Frey Portal',
}

export default async function ReferralDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: referral } = await supabase
    .from('referrals')
    .select(`
      *,
      family_members(*),
      assets(*),
      referral_documents(*),
      facilities(*)
    `)
    .eq('id', id)
    .eq('referrer_id', user!.id)
    .single()

  if (!referral) notFound()

  // Draft → show editable form at last saved step
  if (referral.status === 'draft') {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Resume Referral</h1>
          <p className="text-muted-foreground mt-1">
            Continuing from where you left off. Your progress is saved automatically.
          </p>
        </div>
        <ReferralForm
          referralId={id}
          initialData={referral}
          userId={user!.id}
        />
      </div>
    )
  }

  // Submitted / in-review / accepted → read-only view
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Referral Details</h1>
        <p className="text-muted-foreground mt-1">
          This referral has been submitted and is read-only.
        </p>
      </div>
      <ReferralReadOnly referral={referral} />
    </div>
  )
}

