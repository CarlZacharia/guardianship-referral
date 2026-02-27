'use server'

import { createClient } from '@supabase/supabase-js'

export async function createProfile(data: {
  id: string
  email: string
  first_name: string
  last_name: string
  organization: string
  phone: string
  role: string
  referrer_type?: string
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabase.from('profiles').insert(data)

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}
