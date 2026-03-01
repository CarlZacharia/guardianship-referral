import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fillPdfForm } from '@/lib/pdf/fillPdfForm'
import { readFile } from 'fs/promises'
import path from 'path'

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
    .select('*')
    .eq('id', id)

  // Referrers can only see their own referrals
  if (!isStaff) {
    query = query.eq('referrer_id', user.id)
  }

  const { data: referral } = await query.single()

  if (!referral) {
    return new Response('Not found', { status: 404 })
  }

  // Load PDF template from public/forms/
  const templatePath = path.join(process.cwd(), 'public', 'forms', 'MedicaidForms.pdf')
  let templateBytes: ArrayBuffer
  try {
    const buf = await readFile(templatePath)
    templateBytes = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
  } catch {
    return new Response('PDF template not found', { status: 500 })
  }

  // Fill the form
  const filledPdf = await fillPdfForm(templateBytes, referral, { flatten: false })

  const clientName =
    referral.client_full_legal_name ||
    `${referral.client_first_name ?? ''} ${referral.client_last_name ?? ''}`.trim() ||
    'applicant'

  const safeName = clientName.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_')

  return new Response(filledPdf as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${safeName}_MedicaidForms.pdf"`,
    },
  })
}
