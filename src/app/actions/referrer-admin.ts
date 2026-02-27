'use server'

import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface CreateReferrerData {
  first_name: string
  last_name: string
  email: string
  organization?: string
  phone?: string
  referrer_type?: string
}

export async function createReferrer(data: CreateReferrerData) {
  const supabase = getAdminClient()

  // Create the auth user with a random password (they'll use password reset to set their own)
  const tempPassword = crypto.randomUUID()
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: data.email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: {
      first_name: data.first_name,
      last_name: data.last_name,
    },
  })

  if (authError) {
    return { error: authError.message }
  }

  // Create the profile record
  const { error: profileError } = await supabase.from('profiles').insert({
    id: authData.user.id,
    email: data.email,
    first_name: data.first_name,
    last_name: data.last_name,
    organization: data.organization || '',
    phone: data.phone || '',
    role: 'referrer',
    referrer_type: data.referrer_type || undefined,
  })

  if (profileError) {
    return { error: profileError.message }
  }

  // Send a password reset email so the user can set their own password
  const { error: resetError } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: data.email,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/onboarding`,
    },
  })

  if (resetError) {
    // Account was created successfully, just the invite email failed
    return { error: null, warning: 'Account created but invite email failed to send.' }
  }

  return { error: null }
}

interface UpdateReferrerData {
  first_name?: string
  last_name?: string
  organization?: string
  phone?: string
  referrer_type?: string
  is_active?: boolean
  mailing_street?: string
  mailing_city?: string
  mailing_state?: string
  mailing_zip?: string
  billing_street?: string
  billing_city?: string
  billing_state?: string
  billing_zip?: string
  primary_contact_name?: string
  primary_contact_phone?: string
  primary_contact_email?: string
  billing_contact_name?: string
  billing_contact_phone?: string
  billing_contact_email?: string
}

export async function updateReferrer(userId: string, data: UpdateReferrerData) {
  const supabase = getAdminClient()

  const { error } = await supabase
    .from('profiles')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}
