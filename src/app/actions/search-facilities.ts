'use server'

import { createClient } from '@supabase/supabase-js'

export async function searchFacilities(query: string) {
  if (!query || query.length < 3) {
    return { data: [], error: null }
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from('facilities')
    .select('id, name, address, city, state, zip, phone, fax, contact_name, contact_email')
    .ilike('name', `%${query}%`)
    .order('name')
    .limit(10)

  if (error) {
    return { data: [], error: error.message }
  }

  return { data: data || [], error: null }
}
