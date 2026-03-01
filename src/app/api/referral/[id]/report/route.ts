import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { ReferralReport } from '@/lib/pdf/ReferralReport'
import React from 'react'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Check user role to determine access
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isStaff = profile?.role === 'staff' || profile?.role === 'admin'

  // Build query
  let query = supabase
    .from('referrals')
    .select('*, family_members(*), assets(*), referral_documents(*), facilities(*)')
    .eq('id', id)

  // Referrers can only see their own referrals
  if (!isStaff) {
    query = query.eq('referrer_id', user.id)
  }

  const { data: referral } = await query.single()

  if (!referral) {
    return new Response('Not found', { status: 404 })
  }

  // Generate PDF
  const buffer = await renderToBuffer(
    React.createElement(ReferralReport, { referral }) as any,
  )

  const clientName =
    referral.client_full_legal_name ||
    `${referral.client_first_name ?? ''} ${referral.client_last_name ?? ''}`.trim() ||
    'referral'

  const safeName = clientName.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_')

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${safeName}_report.pdf"`,
    },
  })
}
