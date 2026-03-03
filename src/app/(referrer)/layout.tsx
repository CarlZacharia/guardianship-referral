import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ReferrerNav } from '@/components/shared/ReferrerNav'

export default async function ReferrerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  // Staff/admin → redirect to their own dashboard
  if (profile.role === 'staff' || profile.role === 'admin') {
    redirect('/staff/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#e9eef6]" style={{ '--card': '210 30% 97.5%' } as React.CSSProperties}>
      <ReferrerNav profile={profile} />
      <main className="max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}

