import { createClient } from '@/lib/supabase/server'
import { ReferralForm } from '@/components/referral/ReferralForm'
import { ReferralReadOnly } from '@/components/referral/ReferralReadOnly'
import { EditReferralButton } from '@/components/referral/EditReferralButton'
import { notFound, redirect } from 'next/navigation'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Referral — Zacharia Frey Portal',
}

export default async function ReferralDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ edit?: string }>
}) {
  const { id } = await params
  const { edit } = await searchParams
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
  // Submitted + ?edit=true → revert to draft and show editable form
  const isEditing = referral.status === 'draft' || edit === 'true'

  if (isEditing) {
    // If submitted and user clicked Edit, revert status to draft
    if (referral.status === 'submitted' && edit === 'true') {
      await supabase
        .from('referrals')
        .update({ status: 'draft' })
        .eq('id', id)
      referral.status = 'draft'
    }

    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            {referral.status === 'draft' && edit === 'true' ? 'Edit Referral' : 'Resume Referral'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {edit === 'true'
              ? 'Make your changes and submit again when ready.'
              : 'Continuing from where you left off. Your progress is saved automatically.'}
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

  // Submitted / in-review / accepted → read-only view with Edit button
  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Referral Details</h1>
          <p className="text-muted-foreground mt-1">
            This referral has been submitted and is read-only.
          </p>
        </div>
        {referral.status === 'submitted' && (
          <EditReferralButton referralId={id} />
        )}
      </div>
      <ReferralReadOnly referral={referral} />
    </div>
  )
}

