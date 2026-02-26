import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/auth/ProfileForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Profile — Zacharia Frey Portal',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-muted-foreground mt-1">
          Update your contact information and organization details.
        </p>
      </div>
      <ProfileForm profile={profile} />
    </div>
  )
}

