'use server'

import { createClient } from '@supabase/supabase-js'

export async function createFacility(data: {
  name: string
  address?: string
  city?: string
  state?: string
  zip?: string
  phone?: string
  contact_name?: string
  contact_email?: string
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: facility, error } = await supabase
    .from('facilities')
    .insert(data)
    .select('id')
    .single()

  if (error) {
    return { id: null, error: error.message }
  }

  return { id: facility.id as string, error: null }
}
