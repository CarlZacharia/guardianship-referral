import { createClient } from '@/lib/supabase/server'
import { ReferrerDetail } from '@/components/shared/ReferrerDetail'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Edit Referrer — Zacharia Brown Portal',
}

export default async function ReferrerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .eq('role', 'referrer')
    .single()

  if (!profile) notFound()

  return (
    <div className="space-y-6">
      <ReferrerDetail profile={profile} />
    </div>
  )
}
