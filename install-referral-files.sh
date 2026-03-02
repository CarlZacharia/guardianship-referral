#!/bin/bash

# ============================================================
# Zacharia Brown  — Referral Portal File Installer
# Run this from INSIDE your existing Next.js project folder:
#   cd zacharia-frey-referral
#   bash install-referral-files.sh
# ============================================================

set -e
echo ""
echo "============================================================"
echo "  Installing Referral Portal Files..."
echo "============================================================"
echo ""

# Create directories
echo "→ Creating directories..."
mkdir -p "src/app/(auth)/login"
mkdir -p "src/app/(auth)/register"
mkdir -p "src/app/(auth)/verify"
mkdir -p "src/app/(auth)/forgot-password"
mkdir -p "src/app/(referrer)/dashboard"
mkdir -p "src/app/(referrer)/referral/new"
mkdir -p "src/app/(referrer)/referral/[id]"
mkdir -p "src/app/(referrer)/profile"
mkdir -p "src/app/(staff)/staff/dashboard"
mkdir -p "src/app/(staff)/staff/referral/[id]"
mkdir -p "src/app/(staff)/staff/facilities"
mkdir -p src/components/auth
mkdir -p src/components/referral/steps
mkdir -p src/components/shared
mkdir -p src/lib/supabase
mkdir -p src/lib/types
mkdir -p src/lib/validations
mkdir -p src/hooks
echo "   ✓ Done"
echo ""
echo "→ src/app/globals.css"
cat > "src/app/globals.css" << 'ENDOFFILE'
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    --primary: 215 70% 35%;
    --primary-foreground: 0 0% 98%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 215 70% 35%;
    --radius: 0.5rem;
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
  }

  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 240 10% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 215 70% 55%;
    --primary-foreground: 240 5.9% 10%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 215 70% 55%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

ENDOFFILE

echo "→ src/app/layout.tsx"
cat > "src/app/layout.tsx" << 'ENDOFFILE'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Zacharia Brown  — Client Referral Portal',
  description: 'Submit guardianship and Medicaid referrals to Zacharia Brown ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}

ENDOFFILE

echo "→ src/app/page.tsx"
cat > "src/app/page.tsx" << 'ENDOFFILE'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // Check role to determine where to redirect
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'staff' || profile?.role === 'admin') {
      redirect('/staff/dashboard')
    }
    redirect('/dashboard')
  }

  redirect('/login')
}

ENDOFFILE

echo "→ src/middleware.ts"
cat > "src/middleware.ts" << 'ENDOFFILE'
// src/middleware.ts
// Protects routes — redirects unauthenticated users to login

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Public routes — no auth needed
  const publicRoutes = ['/login', '/register', '/verify', '/forgot-password'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(url);
  }

  if (user && isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // Staff route guard — check role
  if (user && pathname.startsWith('/staff')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['staff', 'admin'].includes(profile.role)) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

ENDOFFILE

echo "→ src/lib/utils.ts"
cat > "src/lib/utils.ts" << 'ENDOFFILE'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

ENDOFFILE

echo "→ src/app/(auth)/layout.tsx"
cat > "src/app/(auth)/layout.tsx" << 'ENDOFFILE'
import Image from 'next/image'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Header */}
      <header className="py-6 px-8 border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
            ZF
          </div>
          <div>
            <div className="font-semibold text-foreground">Zacharia Brown </div>
            <div className="text-xs text-muted-foreground">
              Estate Planning · Elder Law · Asset Protection
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-8 text-center text-xs text-muted-foreground border-t bg-white/50">
        26811 South Bay Drive, Suite 270 · Bonita Springs, FL 34134 ·{' '}
        <a href="tel:2393454545" className="hover:text-primary">239.345.4545</a>
        {' '}· This portal is for authorized referral partners only.
      </footer>
    </div>
  )
}

ENDOFFILE

echo "→ src/app/(auth)/login/page.tsx"
cat > "src/app/(auth)/login/page.tsx" << 'ENDOFFILE'
import { LoginForm } from '@/components/auth/LoginForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In — Zacharia Brown Referral Portal',
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirectTo?: string; message?: string }
}) {
  return <LoginForm redirectTo={searchParams.redirectTo} message={searchParams.message} />
}

ENDOFFILE

echo "→ src/app/(auth)/register/page.tsx"
cat > "src/app/(auth)/register/page.tsx" << 'ENDOFFILE'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Account — Zacharia Brown Referral Portal',
}

export default function RegisterPage() {
  return <RegisterForm />
}

ENDOFFILE

echo "→ src/app/(auth)/verify/page.tsx"
cat > "src/app/(auth)/verify/page.tsx" << 'ENDOFFILE'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MailCheck } from 'lucide-react'

export default function VerifyPage({
  searchParams,
}: {
  searchParams: { email?: string }
}) {
  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
          <MailCheck className="w-6 h-6 text-primary" />
        </div>
        <CardTitle>Check Your Email</CardTitle>
        <CardDescription>
          {searchParams.email
            ? `We sent a confirmation link to ${searchParams.email}`
            : 'A confirmation link has been sent to your email address.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">
          Click the link in the email to activate your account. 
          The link expires in 24 hours.
        </p>
        <p className="text-sm text-muted-foreground">
          If you don&apos;t see it, check your spam folder or contact{' '}
          <a href="mailto:intake@zacbrownlaw.com" className="text-primary hover:underline">
            intake@zacbrownlaw.com
          </a>.
        </p>
        <Button variant="outline" asChild className="w-full">
          <Link href="/login">Back to Sign In</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

ENDOFFILE

echo "→ src/app/(auth)/forgot-password/page.tsx"
cat > "src/app/(auth)/forgot-password/page.tsx" << 'ENDOFFILE'
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/profile/reset-password`,
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Reset Link Sent</CardTitle>
          <CardDescription>Check your email for a password reset link.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" asChild className="w-full">
            <Link href="/login">Back to Sign In</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>
          Enter your email address and we&apos;ll send you a reset link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@organization.com"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Send Reset Link
          </Button>
          <Button variant="ghost" asChild className="w-full">
            <Link href="/login">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Sign In
            </Link>
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

ENDOFFILE

echo "→ src/app/(referrer)/layout.tsx"
cat > "src/app/(referrer)/layout.tsx" << 'ENDOFFILE'
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
    <div className="min-h-screen bg-slate-50">
      <ReferrerNav profile={profile} />
      <main className="max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}

ENDOFFILE

echo "→ src/app/(referrer)/dashboard/page.tsx"
cat > "src/app/(referrer)/dashboard/page.tsx" << 'ENDOFFILE'
import { createClient } from '@/lib/supabase/server'
import { ReferralList } from '@/components/shared/ReferralList'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Referrals — Zacharia Brown Portal',
}

export default async function ReferrerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: referrals } = await supabase
    .from('referrals')
    .select(`
      id, created_at, updated_at, submitted_at,
      referral_type, urgency, status, current_step,
      client_first_name, client_last_name,
      facility_name_freetext,
      facilities(name)
    `)
    .eq('referrer_id', user!.id)
    .order('updated_at', { ascending: false })

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, organization')
    .eq('id', user!.id)
    .single()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back{profile?.first_name ? `, ${profile.first_name}` : ''}
          </h1>
          <p className="text-muted-foreground mt-1">
            {profile?.organization && `${profile.organization} · `}
            Manage your referrals below
          </p>
        </div>
        <Button asChild>
          <Link href="/referral/new">
            <Plus className="w-4 h-4 mr-2" />
            New Referral
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <ReferralStats referrals={referrals || []} />

      {/* Referral List */}
      <ReferralList
        referrals={referrals || []}
        emptyMessage="You haven't submitted any referrals yet."
        showEditDraft
      />
    </div>
  )
}

function ReferralStats({ referrals }: { referrals: any[] }) {
  const drafts = referrals.filter(r => r.status === 'draft').length
  const submitted = referrals.filter(r => r.status === 'submitted').length
  const inReview = referrals.filter(r => r.status === 'in_review').length
  const accepted = referrals.filter(r => r.status === 'accepted').length

  const stats = [
    { label: 'Drafts', value: drafts, color: 'text-slate-600' },
    { label: 'Submitted', value: submitted, color: 'text-blue-600' },
    { label: 'In Review', value: inReview, color: 'text-amber-600' },
    { label: 'Accepted', value: accepted, color: 'text-green-600' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map(({ label, value, color }) => (
        <div key={label} className="bg-white rounded-lg border p-4">
          <div className={`text-2xl font-bold ${color}`}>{value}</div>
          <div className="text-sm text-muted-foreground">{label}</div>
        </div>
      ))}
    </div>
  )
}

ENDOFFILE

echo "→ src/app/(referrer)/referral/new/page.tsx"
cat > "src/app/(referrer)/referral/new/page.tsx" << 'ENDOFFILE'
import { createClient } from '@/lib/supabase/server'
import { ReferralForm } from '@/components/referral/ReferralForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'New Referral — Zacharia Brown Portal',
}

export default async function NewReferralPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">New Referral</h1>
        <p className="text-muted-foreground mt-1">
          Your progress is saved automatically after each step.
        </p>
      </div>
      <ReferralForm userId={user!.id} />
    </div>
  )
}

ENDOFFILE

echo "→ src/app/(referrer)/referral/[id]/page.tsx"
cat > "src/app/(referrer)/referral/[id]/page.tsx" << 'ENDOFFILE'
import { createClient } from '@/lib/supabase/server'
import { ReferralForm } from '@/components/referral/ReferralForm'
import { ReferralReadOnly } from '@/components/referral/ReferralReadOnly'
import { notFound, redirect } from 'next/navigation'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Referral — Zacharia Brown Portal',
}

export default async function ReferralDetailPage({
  params,
}: {
  params: { id: string }
}) {
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
    .eq('id', params.id)
    .eq('referrer_id', user!.id)
    .single()

  if (!referral) notFound()

  // Draft → show editable form at last saved step
  if (referral.status === 'draft') {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Resume Referral</h1>
          <p className="text-muted-foreground mt-1">
            Continuing from where you left off. Your progress is saved automatically.
          </p>
        </div>
        <ReferralForm
          referralId={params.id}
          initialData={referral}
          userId={user!.id}
        />
      </div>
    )
  }

  // Submitted / in-review / accepted → read-only view
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Referral Details</h1>
        <p className="text-muted-foreground mt-1">
          This referral has been submitted and is read-only.
        </p>
      </div>
      <ReferralReadOnly referral={referral} />
    </div>
  )
}

ENDOFFILE

echo "→ src/app/(referrer)/profile/page.tsx"
cat > "src/app/(referrer)/profile/page.tsx" << 'ENDOFFILE'
import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/auth/ProfileForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Profile — Zacharia Brown Portal',
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

ENDOFFILE

echo "→ src/app/(staff)/layout.tsx"
cat > "src/app/(staff)/layout.tsx" << 'ENDOFFILE'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StaffNav } from '@/components/shared/StaffNav'

export default async function StaffLayout({
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

  if (!profile || !['staff', 'admin'].includes(profile.role)) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <StaffNav profile={profile} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}

ENDOFFILE

echo "→ src/app/(staff)/staff/dashboard/page.tsx"
cat > "src/app/(staff)/staff/dashboard/page.tsx" << 'ENDOFFILE'
import { createClient } from '@/lib/supabase/server'
import { ReferralList } from '@/components/shared/ReferralList'
import { StaffDashboardFilters } from '@/components/shared/StaffDashboardFilters'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Staff Dashboard — Zacharia Brown Portal',
}

export default async function StaffDashboard({
  searchParams,
}: {
  searchParams: {
    status?: string
    type?: string
    urgency?: string
    search?: string
  }
}) {
  const supabase = await createClient()

  let query = supabase
    .from('referrals')
    .select(`
      id, created_at, updated_at, submitted_at,
      referral_type, urgency, status, current_step,
      client_first_name, client_last_name,
      facility_name_freetext,
      facilities(name),
      profiles!referrer_id(first_name, last_name, organization)
    `)
    .order('updated_at', { ascending: false })

  if (searchParams.status) query = query.eq('status', searchParams.status)
  if (searchParams.type) query = query.eq('referral_type', searchParams.type)
  if (searchParams.urgency) query = query.eq('urgency', searchParams.urgency)

  const { data: referrals } = await query

  // Filter by search client-side (name search)
  const filtered = searchParams.search
    ? (referrals || []).filter(r =>
        `${r.client_first_name} ${r.client_last_name}`
          .toLowerCase()
          .includes(searchParams.search!.toLowerCase())
      )
    : (referrals || [])

  // Summary counts
  const counts = {
    total: referrals?.length || 0,
    submitted: referrals?.filter(r => r.status === 'submitted').length || 0,
    in_review: referrals?.filter(r => r.status === 'in_review').length || 0,
    emergency: referrals?.filter(r => r.urgency === 'emergency').length || 0,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">All Referrals</h1>
        <p className="text-muted-foreground mt-1">
          {counts.total} total · {counts.submitted} pending review · {counts.emergency} emergency
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: counts.total, color: 'text-slate-700' },
          { label: 'Awaiting Review', value: counts.submitted, color: 'text-blue-600' },
          { label: 'In Review', value: counts.in_review, color: 'text-amber-600' },
          { label: 'Emergency', value: counts.emergency, color: 'text-red-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-lg border p-4">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-sm text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      <StaffDashboardFilters />

      <ReferralList
        referrals={filtered}
        isStaffView
        emptyMessage="No referrals match the current filters."
      />
    </div>
  )
}

ENDOFFILE

echo "→ src/app/(staff)/staff/referral/[id]/page.tsx"
cat > "src/app/(staff)/staff/referral/[id]/page.tsx" << 'ENDOFFILE'
import { createClient } from '@/lib/supabase/server'
import { ReferralReadOnly } from '@/components/referral/ReferralReadOnly'
import { StaffStatusPanel } from '@/components/shared/StaffStatusPanel'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Referral Detail — Staff View',
}

export default async function StaffReferralDetail({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  const { data: referral } = await supabase
    .from('referrals')
    .select(`
      *,
      family_members(*),
      assets(*),
      referral_documents(*),
      facilities(*),
      profiles!referrer_id(first_name, last_name, organization, phone, email)
    `)
    .eq('id', params.id)
    .single()

  if (!referral) notFound()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main referral content */}
      <div className="lg:col-span-2">
        <ReferralReadOnly referral={referral} isStaffView />
      </div>

      {/* Staff action sidebar */}
      <div className="space-y-4">
        <StaffStatusPanel referral={referral} />
      </div>
    </div>
  )
}

ENDOFFILE

echo "→ src/app/(staff)/staff/facilities/page.tsx"
cat > "src/app/(staff)/staff/facilities/page.tsx" << 'ENDOFFILE'
import { createClient } from '@/lib/supabase/server'
import { FacilitiesTable } from '@/components/shared/FacilitiesTable'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Facilities — Zacharia Brown Portal',
}

export default async function FacilitiesPage() {
  const supabase = await createClient()

  const { data: facilities } = await supabase
    .from('facilities')
    .select('*')
    .order('name')

  // Count referrals per facility for display
  const { data: referralCounts } = await supabase
    .from('referrals')
    .select('facility_id')
    .not('facility_id', 'is', null)

  const countMap: Record<string, number> = {}
  referralCounts?.forEach(r => {
    if (r.facility_id) countMap[r.facility_id] = (countMap[r.facility_id] || 0) + 1
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Facilities</h1>
        <p className="text-muted-foreground mt-1">
          Manage referring facilities. Facilities listed here appear in the referral form dropdown.
        </p>
      </div>
      <FacilitiesTable facilities={facilities || []} referralCounts={countMap} />
    </div>
  )
}

ENDOFFILE

echo "→ src/components/auth/LoginForm.tsx"
cat > "src/components/auth/LoginForm.tsx" << 'ENDOFFILE'
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

interface LoginFormProps {
  redirectTo?: string
  message?: string
}

export function LoginForm({ redirectTo, message }: LoginFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Get role to redirect appropriately
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (redirectTo) {
      router.push(redirectTo)
    } else if (profile?.role === 'staff' || profile?.role === 'admin') {
      router.push('/staff/dashboard')
    } else {
      router.push('/dashboard')
    }
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Sign in to submit and track your referrals.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {message && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@organization.com"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Sign In
          </Button>

          <Separator />

          <p className="text-sm text-center text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Create one here
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}

ENDOFFILE

echo "→ src/components/auth/RegisterForm.tsx"
cat > "src/components/auth/RegisterForm.tsx" << 'ENDOFFILE'
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

const REFERRER_TYPES = [
  { value: 'nursing_home', label: 'Nursing Home / SNF' },
  { value: 'hospital', label: 'Hospital / Health System' },
  { value: 'home_health', label: 'Home Health Agency' },
  { value: 'attorney', label: 'Attorney / Law Firm' },
  { value: 'social_worker', label: 'Social Worker / Case Manager' },
  { value: 'family', label: 'Family Member / Self-Referral' },
  { value: 'other', label: 'Other' },
]

export function RegisterForm() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    organization: '',
    phone: '',
    referrer_type: '',
  })

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (form.password !== form.confirm_password) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      setLoading(false)
      return
    }

    // Sign up with Supabase Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        data: {
          first_name: form.first_name,
          last_name: form.last_name,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // Create profile record
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        email: form.email,
        first_name: form.first_name,
        last_name: form.last_name,
        organization: form.organization,
        phone: form.phone,
        role: 'referrer',
      })

      if (profileError) {
        setError(profileError.message)
        setLoading(false)
        return
      }
    }

    router.push(`/verify?email=${encodeURIComponent(form.email)}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>
          Register to submit referrals to Zacharia Brown .
          Your account will be active once you verify your email.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input id="first_name" value={form.first_name} onChange={set('first_name')} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input id="last_name" value={form.last_name} onChange={set('last_name')} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input id="email" type="email" value={form.email} onChange={set('email')} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization">Organization / Facility</Label>
            <Input
              id="organization"
              value={form.organization}
              onChange={set('organization')}
              placeholder="e.g., Naples Community Hospital"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" value={form.phone} onChange={set('phone')} />
            </div>
            <div className="space-y-2">
              <Label>Referrer Type</Label>
              <Select onValueChange={v => setForm(prev => ({ ...prev, referrer_type: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {REFERRER_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={set('password')}
              required
              minLength={8}
            />
            <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm Password *</Label>
            <Input
              id="confirm_password"
              type="password"
              autoComplete="new-password"
              value={form.confirm_password}
              onChange={set('confirm_password')}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Create Account
          </Button>

          <p className="text-sm text-center text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}

ENDOFFILE

echo "→ src/components/auth/ProfileForm.tsx"
cat > "src/components/auth/ProfileForm.tsx" << 'ENDOFFILE'
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/lib/types/referral.types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

export function ProfileForm({ profile }: { profile: Profile }) {
  const supabase = createClient()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    first_name: profile.first_name || '',
    last_name: profile.last_name || '',
    organization: profile.organization || '',
    phone: profile.phone || '',
  })

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase
      .from('profiles')
      .update(form)
      .eq('id', profile.id)

    if (error) {
      setError(error.message)
    } else {
      toast({ title: 'Profile updated successfully.' })
    }
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input value={form.first_name} onChange={set('first_name')} required />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input value={form.last_name} onChange={set('last_name')} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Organization</Label>
            <Input value={form.organization} onChange={set('organization')} />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input type="tel" value={form.phone} onChange={set('phone')} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={profile.email} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">Contact support to change your email.</p>
          </div>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

ENDOFFILE

echo "→ src/components/referral/ReferralForm.tsx"
cat > "src/components/referral/ReferralForm.tsx" << 'ENDOFFILE'
'use client';

// src/components/referral/ReferralForm.tsx
// Main orchestrator for the multi-step referral form

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Referral, ReferralType } from '@/lib/types/referral.types';
import { StepIndicator } from './StepIndicator';
import { StepNavigation } from './StepNavigation';
import { Step1ReferralSource } from './steps/Step1ReferralSource';
import { Step2CaseType } from './steps/Step2CaseType';
import { Step3ClientIdentity } from './steps/Step3ClientIdentity';
import { Step4MedicalCapacity } from './steps/Step4MedicalCapacity';
import { Step5Financial } from './steps/Step5Financial';
import { Step6Family } from './steps/Step6Family';
import { Step7LegalDocuments } from './steps/Step7LegalDocuments';
import { Step8DocumentsNotes } from './steps/Step8DocumentsNotes';
import { Step9ReviewSubmit } from './steps/Step9ReviewSubmit';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// ============================================================
// Step definitions — label, description, and which referral
// types require this step
// ============================================================
export const STEPS = [
  {
    number: 1,
    label: 'Referral Source',
    description: 'Who is making this referral?',
    requiredFor: ['guardianship', 'medicaid', 'both'] as ReferralType[],
  },
  {
    number: 2,
    label: 'Case Type',
    description: 'What type of case is this?',
    requiredFor: ['guardianship', 'medicaid', 'both'] as ReferralType[],
  },
  {
    number: 3,
    label: 'Client Identity',
    description: 'Basic client information',
    requiredFor: ['guardianship', 'medicaid', 'both'] as ReferralType[],
  },
  {
    number: 4,
    label: 'Medical & Capacity',
    description: 'Diagnoses, capacity, and physician',
    requiredFor: ['guardianship', 'both'] as ReferralType[],
  },
  {
    number: 5,
    label: 'Financial',
    description: 'Income, assets, and benefits',
    requiredFor: ['guardianship', 'medicaid', 'both'] as ReferralType[],
  },
  {
    number: 6,
    label: 'Family & Contacts',
    description: 'Spouse, children, and next of kin',
    requiredFor: ['guardianship', 'medicaid', 'both'] as ReferralType[],
  },
  {
    number: 7,
    label: 'Legal Documents',
    description: 'Existing POAs, guardianship, trusts',
    requiredFor: ['guardianship', 'medicaid', 'both'] as ReferralType[],
  },
  {
    number: 8,
    label: 'Documents & Notes',
    description: 'Upload attachments and add notes',
    requiredFor: ['guardianship', 'medicaid', 'both'] as ReferralType[],
  },
  {
    number: 9,
    label: 'Review & Submit',
    description: 'Review all information and submit',
    requiredFor: ['guardianship', 'medicaid', 'both'] as ReferralType[],
  },
];

interface ReferralFormProps {
  referralId?: string;      // if resuming a draft
  initialData?: Partial<Referral>;
  userId: string;
}

export function ReferralForm({ referralId, initialData, userId }: ReferralFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(initialData?.current_step || 1);
  const [referralData, setReferralData] = useState<Partial<Referral>>(initialData || {});
  const [savedReferralId, setSavedReferralId] = useState<string | undefined>(referralId);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const referralType = referralData.referral_type;

  // Get active steps based on referral type selected so far
  const activeSteps = STEPS.filter(step =>
    !referralType || step.requiredFor.includes(referralType)
  );

  // For step 4 (Medical): only required for guardianship or both
  const showMedicalStep = !referralType || referralType === 'guardianship' || referralType === 'both';

  // Save current step data to Supabase
  const saveStepData = useCallback(async (
    stepData: Partial<Referral>,
    stepNumber: number,
    isFinalSubmit = false
  ) => {
    setIsSaving(true);
    setError(null);

    try {
      const payload: Partial<Referral> = {
        ...referralData,
        ...stepData,
        referrer_id: userId,
        current_step: stepNumber,
        steps_completed: {
          ...referralData.steps_completed,
          [`step_${stepNumber}`]: true,
        },
        status: isFinalSubmit ? 'submitted' : 'draft',
        ...(isFinalSubmit && { submitted_at: new Date().toISOString() }),
      };

      let result;

      if (savedReferralId) {
        // Update existing draft
        const { data, error: updateError } = await supabase
          .from('referrals')
          .update(payload)
          .eq('id', savedReferralId)
          .select('id')
          .single();

        if (updateError) throw updateError;
        result = data;
      } else {
        // Create new referral
        const { data, error: insertError } = await supabase
          .from('referrals')
          .insert(payload)
          .select('id')
          .single();

        if (insertError) throw insertError;
        result = data;
        setSavedReferralId(result.id);
      }

      // Update local state
      setReferralData(prev => ({ ...prev, ...stepData }));

      return result?.id;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save. Please try again.';
      setError(message);
      toast({
        title: 'Save Error',
        description: message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [referralData, savedReferralId, supabase, userId, toast]);

  const handleStepComplete = useCallback(async (
    stepData: Partial<Referral>,
    advance = true
  ) => {
    const savedId = await saveStepData(stepData, currentStep);

    if (savedId && advance) {
      // Find next active step number
      const currentIndex = activeSteps.findIndex(s => s.number === currentStep);
      const nextStep = activeSteps[currentIndex + 1];

      if (nextStep) {
        setCurrentStep(nextStep.number);
        window.scrollTo(0, 0);
      }
    }
  }, [saveStepData, currentStep, activeSteps]);

  const handleBack = useCallback(() => {
    const currentIndex = activeSteps.findIndex(s => s.number === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(activeSteps[currentIndex - 1].number);
      window.scrollTo(0, 0);
    }
  }, [currentStep, activeSteps]);

  const handleSaveDraft = useCallback(async (stepData: Partial<Referral>) => {
    await saveStepData(stepData, currentStep);
    toast({
      title: 'Draft Saved',
      description: 'Your progress has been saved. You can return to complete this form later.',
    });
  }, [saveStepData, currentStep, toast]);

  const handleFinalSubmit = useCallback(async (stepData: Partial<Referral>) => {
    const savedId = await saveStepData(stepData, currentStep, true);
    if (savedId) {
      toast({
        title: 'Referral Submitted',
        description: 'Your referral has been submitted successfully. Our team will be in touch.',
      });
      router.push('/dashboard');
    }
  }, [saveStepData, currentStep, toast, router]);

  const isFirstStep = currentStep === activeSteps[0]?.number;
  const isLastStep = currentStep === activeSteps[activeSteps.length - 1]?.number;

  // Step navigation props
  const navProps = {
    onBack: handleBack,
    onSaveDraft: handleSaveDraft,
    isSaving,
    isFirstStep,
    isLastStep,
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Step Indicator */}
      <StepIndicator
        steps={activeSteps}
        currentStep={currentStep}
        completedSteps={referralData.steps_completed || {}}
      />

      {/* Error Banner */}
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      <div className="mt-8">
        {currentStep === 1 && (
          <Step1ReferralSource
            defaultValues={referralData}
            onComplete={handleStepComplete}
            navProps={navProps}
          />
        )}
        {currentStep === 2 && (
          <Step2CaseType
            defaultValues={referralData}
            onComplete={handleStepComplete}
            navProps={navProps}
          />
        )}
        {currentStep === 3 && (
          <Step3ClientIdentity
            defaultValues={referralData}
            referralType={referralType}
            onComplete={handleStepComplete}
            navProps={navProps}
          />
        )}
        {currentStep === 4 && showMedicalStep && (
          <Step4MedicalCapacity
            defaultValues={referralData}
            onComplete={handleStepComplete}
            navProps={navProps}
          />
        )}
        {currentStep === 5 && (
          <Step5Financial
            defaultValues={referralData}
            referralType={referralType}
            referralId={savedReferralId}
            onComplete={handleStepComplete}
            navProps={navProps}
          />
        )}
        {currentStep === 6 && (
          <Step6Family
            defaultValues={referralData}
            referralId={savedReferralId}
            onComplete={handleStepComplete}
            navProps={navProps}
          />
        )}
        {currentStep === 7 && (
          <Step7LegalDocuments
            defaultValues={referralData}
            referralType={referralType}
            onComplete={handleStepComplete}
            navProps={navProps}
          />
        )}
        {currentStep === 8 && (
          <Step8DocumentsNotes
            defaultValues={referralData}
            referralId={savedReferralId}
            onComplete={handleStepComplete}
            navProps={navProps}
          />
        )}
        {currentStep === 9 && (
          <Step9ReviewSubmit
            referralData={referralData}
            referralId={savedReferralId}
            activeSteps={activeSteps}
            onSubmit={handleFinalSubmit}
            onEditStep={setCurrentStep}
            isSaving={isSaving}
          />
        )}
      </div>
    </div>
  );
}

ENDOFFILE

echo "→ src/components/referral/ReferralReadOnly.tsx"
cat > "src/components/referral/ReferralReadOnly.tsx" << 'ENDOFFILE'
'use client'

import { Referral, REFERRAL_TYPE_LABELS, CAPACITY_LABELS, ASSET_TYPE_LABELS } from '@/lib/types/referral.types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { StatusBadge, UrgencyBadge } from '@/components/shared/ReferralList'
import { format } from 'date-fns'
import {
  UserCircle, MapPin, HeartPulse, DollarSign,
  Users, FileText, Building2, Calendar
} from 'lucide-react'

function Section({ title, icon: Icon, children }: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">{title}</h3>
        <Separator className="flex-1" />
      </div>
      <div className="pl-6 space-y-2">{children}</div>
    </div>
  )
}

function Field({ label, value }: { label: string; value?: string | number | boolean | null }) {
  if (value === undefined || value === null || value === '') return null
  const display = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)
  return (
    <div className="grid grid-cols-3 gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="col-span-2 font-medium">{display}</span>
    </div>
  )
}

interface ReferralReadOnlyProps {
  referral: Referral & { profiles?: any; facilities?: any }
  isStaffView?: boolean
}

export function ReferralReadOnly({ referral, isStaffView }: ReferralReadOnlyProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold">
                {referral.client_full_legal_name ||
                  `${referral.client_first_name} ${referral.client_last_name}`}
              </h2>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <StatusBadge status={referral.status!} />
                <UrgencyBadge urgency={referral.urgency!} />
                {referral.referral_type && (
                  <Badge variant="outline">{REFERRAL_TYPE_LABELS[referral.referral_type]}</Badge>
                )}
              </div>
            </div>
            {referral.submitted_at && (
              <div className="text-sm text-muted-foreground text-right">
                <Calendar className="w-4 h-4 inline mr-1" />
                Submitted<br />
                {format(new Date(referral.submitted_at), 'MMM d, yyyy')}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Client Identity */}
      <Card>
        <CardHeader><CardTitle className="text-base">Client Information</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <Section title="Identity" icon={UserCircle}>
            <Field label="Full Legal Name" value={referral.client_full_legal_name} />
            <Field label="Date of Birth" value={referral.client_dob
              ? format(new Date(referral.client_dob), 'MMMM d, yyyy') : undefined} />
            <Field label="Age" value={referral.client_age ? `${referral.client_age} years` : undefined} />
            <Field label="Sex" value={referral.client_sex} />
            <Field label="SSN (Last 4)" value={referral.client_ssn_last4 ? `***-**-${referral.client_ssn_last4}` : undefined} />
            <Field label="Language" value={referral.client_language} />
            <Field label="County" value={referral.client_county} />
            <Field label="Phone" value={referral.client_phone} />
            <Field label="Email" value={referral.client_email} />
          </Section>

          <Section title="Addresses" icon={MapPin}>
            {referral.client_home_address && (
              <Field label="Home Address" value={
                [referral.client_home_address, referral.client_home_city,
                  referral.client_home_state, referral.client_home_zip].filter(Boolean).join(', ')
              } />
            )}
            {referral.client_current_address && (
              <Field label="Current Address" value={
                [referral.client_current_address, referral.client_current_city,
                  referral.client_current_state, referral.client_current_zip].filter(Boolean).join(', ')
              } />
            )}
          </Section>

          <Section title="Facility Account" icon={Building2}>
            <Field label="Facility" value={referral.facilities?.name || referral.facility_name_freetext} />
            <Field label="Admission Date" value={referral.admission_date
              ? format(new Date(referral.admission_date), 'MMM d, yyyy') : undefined} />
            <Field label="Amount Owed" value={referral.amount_owed_facility
              ? `$${referral.amount_owed_facility.toLocaleString()}` : undefined} />
            <Field label="Monthly Cost" value={referral.facility_monthly_cost
              ? `$${referral.facility_monthly_cost.toLocaleString()}` : undefined} />
          </Section>
        </CardContent>
      </Card>

      {/* Medical */}
      {referral.capacity_level && (
        <Card>
          <CardHeader><CardTitle className="text-base">Medical & Capacity</CardTitle></CardHeader>
          <CardContent>
            <Section title="Capacity & Health" icon={HeartPulse}>
              <Field label="Capacity" value={CAPACITY_LABELS[referral.capacity_level]} />
              <Field label="BIMS Score" value={referral.bims_score} />
              <Field label="DNR" value={referral.dnr} />
              <Field label="Diagnoses" value={referral.diagnoses} />
              <Field label="Medications" value={referral.medications} />
              <Field label="Mental Health" value={referral.mental_health_history} />
              {referral.physician_name && (
                <Field label="Physician" value={
                  [referral.physician_name, referral.physician_address, referral.physician_phone].filter(Boolean).join(' · ')
                } />
              )}
            </Section>
          </CardContent>
        </Card>
      )}

      {/* Financial */}
      <Card>
        <CardHeader><CardTitle className="text-base">Financial</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <Section title="Income & Benefits" icon={DollarSign}>
            <Field label="Monthly Income" value={referral.monthly_income
              ? `$${referral.monthly_income.toLocaleString()}` : undefined} />
            <Field label="Income Sources" value={referral.income_sources} />
            <Field label="Medical Insurance" value={referral.medical_insurance_cost
              ? `$${referral.medical_insurance_cost.toLocaleString()}/mo` : undefined} />
            <Field label="Medicaid Status" value={referral.medicaid_status} />
            <Field label="Rep Payee" value={referral.rep_payee_status} />
            <Field label="VA Benefits" value={referral.va_benefits} />
            {referral.va_benefit_details && (
              <Field label="VA Details" value={referral.va_benefit_details} />
            )}
          </Section>

          {referral.assets && referral.assets.length > 0 && (
            <Section title="Assets" icon={DollarSign}>
              <div className="space-y-2">
                {referral.assets.map((asset: any) => (
                  <div key={asset.id} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                    <div>
                      <span className="font-medium">{ASSET_TYPE_LABELS[asset.asset_type as keyof typeof ASSET_TYPE_LABELS]}</span>
                      {asset.institution && <span className="text-muted-foreground"> · {asset.institution}</span>}
                      {asset.description && <span className="text-muted-foreground"> · {asset.description}</span>}
                    </div>
                    {asset.approximate_value && (
                      <span className="font-medium">${asset.approximate_value.toLocaleString()}</span>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}
        </CardContent>
      </Card>

      {/* Family */}
      <Card>
        <CardHeader><CardTitle className="text-base">Family & Contacts</CardTitle></CardHeader>
        <CardContent>
          <Section title="Spouse & Family" icon={Users}>
            <Field label="Married" value={referral.is_married} />
            {referral.is_married && (
              <>
                <Field label="Spouse Name" value={referral.spouse_name} />
                <Field label="Spouse DOB" value={referral.spouse_dob
                  ? format(new Date(referral.spouse_dob), 'MMM d, yyyy') : undefined} />
                <Field label="Spouse Phone" value={referral.spouse_phone} />
              </>
            )}
            {referral.family_members && referral.family_members.length > 0 && (
              <div className="mt-3 space-y-2">
                {referral.family_members.map((fm: any) => (
                  <div key={fm.id} className="text-sm p-2 bg-muted rounded">
                    <span className="font-medium capitalize">{fm.relationship}</span>: {fm.full_name}
                    {fm.phone && ` · ${fm.phone}`}
                    {fm.address && ` · ${fm.address}`}
                  </div>
                ))}
              </div>
            )}
          </Section>
        </CardContent>
      </Card>

      {/* Legal Documents */}
      <Card>
        <CardHeader><CardTitle className="text-base">Legal Documents</CardTitle></CardHeader>
        <CardContent>
          <Section title="Existing Documents" icon={FileText}>
            <Field label="Power of Attorney" value={referral.has_poa} />
            {referral.has_poa && <Field label="POA Agent" value={referral.poa_agent_name} />}
            <Field label="Health Care Surrogate" value={referral.has_hc_surrogate} />
            {referral.has_hc_surrogate && <Field label="Surrogate Name" value={referral.hc_surrogate_name} />}
            <Field label="Living Will" value={referral.has_living_will} />
            <Field label="Trust" value={referral.has_trust} />
            {referral.has_trust && <Field label="Trust Type" value={referral.trust_type} />}
            <Field label="Prior Guardianship" value={referral.has_prior_guardianship} />
            {referral.has_prior_guardianship && (
              <Field label="Details" value={referral.prior_guardianship_details} />
            )}
            <Field label="Existing Guardian" value={referral.existing_guardian_name} />
            <Field label="Disability Benefits" value={referral.disability_benefits} />
            <Field label="Veterans Services" value={referral.veteran_services} />
            <Field label="Special Needs" value={referral.special_needs} />
          </Section>
        </CardContent>
      </Card>

      {/* Notes */}
      {referral.notes && (
        <Card>
          <CardHeader><CardTitle className="text-base">Notes & Comments</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{referral.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

ENDOFFILE

echo "→ src/components/referral/StepIndicator.tsx"
cat > "src/components/referral/StepIndicator.tsx" << 'ENDOFFILE'
'use client';

// src/components/referral/StepIndicator.tsx

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  number: number;
  label: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  completedSteps: Record<string, boolean>;
}

export function StepIndicator({ steps, currentStep, completedSteps }: StepIndicatorProps) {
  return (
    <div className="w-full">
      {/* Mobile: simple "Step X of Y" */}
      <div className="sm:hidden mb-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
          <span>
            Step {steps.findIndex(s => s.number === currentStep) + 1} of {steps.length}
          </span>
          <span className="font-medium text-foreground">
            {steps.find(s => s.number === currentStep)?.label}
          </span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((steps.findIndex(s => s.number === currentStep) + 1) / steps.length) * 100}%`
            }}
          />
        </div>
      </div>

      {/* Desktop: full step indicator */}
      <nav aria-label="Form progress" className="hidden sm:block">
        <ol className="flex items-center">
          {steps.map((step, index) => {
            const isCompleted = completedSteps[`step_${step.number}`];
            const isCurrent = step.number === currentStep;
            const isUpcoming = !isCompleted && !isCurrent;

            return (
              <li
                key={step.number}
                className={cn('flex items-center', index < steps.length - 1 ? 'flex-1' : '')}
              >
                {/* Step circle */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium transition-all',
                      isCompleted && 'bg-primary border-primary text-primary-foreground',
                      isCurrent && 'border-primary text-primary bg-primary/10',
                      isUpcoming && 'border-muted-foreground/30 text-muted-foreground/50'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span>{step.number}</span>
                    )}
                  </div>
                  <span
                    className={cn(
                      'mt-1 text-xs font-medium whitespace-nowrap',
                      isCurrent && 'text-primary',
                      isCompleted && 'text-muted-foreground',
                      isUpcoming && 'text-muted-foreground/40'
                    )}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'flex-1 h-0.5 mx-2 mb-5 transition-all',
                      isCompleted ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}

ENDOFFILE

echo "→ src/components/referral/StepNavigation.tsx"
cat > "src/components/referral/StepNavigation.tsx" << 'ENDOFFILE'
'use client';

// src/components/referral/StepNavigation.tsx

import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { Referral } from '@/lib/types/referral.types';

export interface StepNavProps {
  onBack: () => void;
  onSaveDraft: (data: Partial<Referral>) => Promise<void>;
  isSaving: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
}

interface StepNavigationProps extends StepNavProps {
  onNext: () => void;           // triggers form submission / validation
  currentStepData?: Partial<Referral>; // for save draft
}

export function StepNavigation({
  onBack,
  onNext,
  onSaveDraft,
  currentStepData,
  isSaving,
  isFirstStep,
  isLastStep,
}: StepNavigationProps) {
  return (
    <div className="flex items-center justify-between pt-6 mt-6 border-t">
      {/* Back button */}
      <Button
        type="button"
        variant="outline"
        onClick={onBack}
        disabled={isFirstStep || isSaving}
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back
      </Button>

      <div className="flex items-center gap-3">
        {/* Save Draft */}
        {!isLastStep && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => currentStepData && onSaveDraft(currentStepData)}
            disabled={isSaving}
            className="text-muted-foreground"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-1" />
            )}
            Save Draft
          </Button>
        )}

        {/* Next / Submit */}
        <Button
          type="button"
          onClick={onNext}
          disabled={isSaving}
        >
          {isSaving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
          {isLastStep ? 'Submit Referral' : (
            <>
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

ENDOFFILE

echo "→ src/components/referral/steps/Step1ReferralSource.tsx"
cat > "src/components/referral/steps/Step1ReferralSource.tsx" << 'ENDOFFILE'
'use client';

// src/components/referral/steps/Step1ReferralSource.tsx

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step1Schema, Step1FormData } from '@/lib/validations/referral.schema';
import { Referral, Facility, URGENCY_LABELS, UrgencyLevel } from '@/lib/types/referral.types';
import { createClient } from '@/lib/supabase/client';
import { StepNavigation, StepNavProps } from '../StepNavigation';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Building2, AlertTriangle, Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step1Props {
  defaultValues: Partial<Referral>;
  onComplete: (data: Partial<Referral>, advance?: boolean) => Promise<void>;
  navProps: StepNavProps;
}

const URGENCY_CONFIG = {
  routine: {
    label: 'Routine',
    description: 'Standard processing, no immediate court deadlines',
    icon: Clock,
    color: 'text-green-600',
    border: 'border-green-200 data-[selected=true]:border-green-500 data-[selected=true]:bg-green-50',
  },
  urgent: {
    label: 'Urgent',
    description: 'Time-sensitive — facility discharge threatened or family conflict',
    icon: AlertTriangle,
    color: 'text-amber-600',
    border: 'border-amber-200 data-[selected=true]:border-amber-500 data-[selected=true]:bg-amber-50',
  },
  emergency: {
    label: 'Emergency',
    description: 'Immediate safety risk or emergency petition required',
    icon: Zap,
    color: 'text-red-600',
    border: 'border-red-200 data-[selected=true]:border-red-500 data-[selected=true]:bg-red-50',
  },
} as const;

export function Step1ReferralSource({ defaultValues, onComplete, navProps }: Step1Props) {
  const supabase = createClient();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loadingFacilities, setLoadingFacilities] = useState(true);
  const [showFreetext, setShowFreetext] = useState(!defaultValues.facility_id);

  const form = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      facility_id: defaultValues.facility_id || '',
      facility_name_freetext: defaultValues.facility_name_freetext || '',
      urgency: defaultValues.urgency || 'routine',
    },
  });

  useEffect(() => {
    async function loadFacilities() {
      const { data } = await supabase
        .from('facilities')
        .select('id, name, city, phone')
        .eq('is_active', true)
        .order('name');
      setFacilities(data || []);
      setLoadingFacilities(false);
    }
    loadFacilities();
  }, [supabase]);

  const handleNext = form.handleSubmit(async (data) => {
    await onComplete({
      facility_id: data.facility_id || undefined,
      facility_name_freetext: data.facility_name_freetext || undefined,
      urgency: data.urgency,
    });
  });

  const selectedUrgency = form.watch('urgency');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          <CardTitle>Referral Source</CardTitle>
        </div>
        <CardDescription>
          Identify the referring facility and how quickly this case needs attention.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <div className="space-y-6">

            {/* Facility Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Referring Facility</Label>

              {/* Toggle */}
              <div className="flex gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => setShowFreetext(false)}
                  className={cn(
                    'px-3 py-1 rounded-full border transition-colors',
                    !showFreetext
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-input text-muted-foreground hover:border-primary'
                  )}
                >
                  Select from list
                </button>
                <button
                  type="button"
                  onClick={() => setShowFreetext(true)}
                  className={cn(
                    'px-3 py-1 rounded-full border transition-colors',
                    showFreetext
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-input text-muted-foreground hover:border-primary'
                  )}
                >
                  Not in list — enter manually
                </button>
              </div>

              {!showFreetext ? (
                <FormField
                  control={form.control}
                  name="facility_id"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={loadingFacilities}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={
                              loadingFacilities ? 'Loading facilities...' : 'Select facility...'
                            } />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {facilities.map(f => (
                            <SelectItem key={f.id} value={f.id}>
                              <div>
                                <div className="font-medium">{f.name}</div>
                                {f.city && (
                                  <div className="text-xs text-muted-foreground">{f.city}</div>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="facility_name_freetext"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Enter facility name"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        If this facility refers future cases, staff can add them to the master list.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Urgency Level */}
            <FormField
              control={form.control}
              name="urgency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Urgency Level</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-1 gap-3 mt-2"
                    >
                      {(Object.keys(URGENCY_CONFIG) as UrgencyLevel[]).map((key) => {
                        const config = URGENCY_CONFIG[key];
                        const Icon = config.icon;
                        const isSelected = selectedUrgency === key;

                        return (
                          <div key={key}>
                            <RadioGroupItem value={key} id={`urgency-${key}`} className="sr-only" />
                            <Label
                              htmlFor={`urgency-${key}`}
                              className={cn(
                                'flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all',
                                config.border
                              )}
                              data-selected={isSelected}
                            >
                              <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', config.color)} />
                              <div>
                                <div className="font-medium flex items-center gap-2">
                                  {config.label}
                                  {key === 'emergency' && (
                                    <Badge variant="destructive" className="text-xs">
                                      Immediate attention
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground mt-0.5">
                                  {config.description}
                                </div>
                              </div>
                            </Label>
                          </div>
                        );
                      })}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Form>
      </CardContent>

      <StepNavigation
        {...navProps}
        onNext={handleNext}
        currentStepData={{
          facility_id: form.getValues('facility_id') || undefined,
          facility_name_freetext: form.getValues('facility_name_freetext') || undefined,
          urgency: form.getValues('urgency'),
        }}
      />
    </Card>
  );
}

ENDOFFILE

echo "→ src/components/referral/steps/Step2CaseType.tsx"
cat > "src/components/referral/steps/Step2CaseType.tsx" << 'ENDOFFILE'
'use client';

// src/components/referral/steps/Step2CaseType.tsx

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step2Schema, Step2FormData } from '@/lib/validations/referral.schema';
import { Referral, ReferralType } from '@/lib/types/referral.types';
import { StepNavigation, StepNavProps } from '../StepNavigation';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Scale, HeartHandshake, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step2Props {
  defaultValues: Partial<Referral>;
  onComplete: (data: Partial<Referral>) => Promise<void>;
  navProps: StepNavProps;
}

const CASE_TYPES: {
  value: ReferralType;
  label: string;
  description: string;
  details: string[];
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}[] = [
  {
    value: 'guardianship',
    label: 'Guardianship Only',
    description: 'Court appointment to manage personal and/or financial affairs',
    details: [
      'Individual lacks capacity to make decisions',
      'No existing POA or surrogate is in place',
      'Court petition and adjudication required',
      'May include emergency temporary guardianship',
    ],
    icon: Scale,
    color: 'border-blue-200 data-[selected=true]:border-blue-500 data-[selected=true]:bg-blue-50',
  },
  {
    value: 'medicaid',
    label: 'Medicaid Planning Only',
    description: 'Asset protection and Medicaid eligibility assistance',
    details: [
      'Individual needs long-term care coverage',
      'Asset and income analysis required',
      'Spend-down planning or spousal protections',
      'Application assistance and appeals',
    ],
    icon: HeartHandshake,
    color: 'border-emerald-200 data-[selected=true]:border-emerald-500 data-[selected=true]:bg-emerald-50',
  },
  {
    value: 'both',
    label: 'Guardianship & Medicaid',
    description: 'Both guardianship proceedings and Medicaid planning needed',
    details: [
      'Most common scenario for incapacitated nursing home residents',
      'Guardian will sign Medicaid application',
      'Comprehensive case handling',
      'Coordinated legal and financial planning',
    ],
    icon: Layers,
    color: 'border-purple-200 data-[selected=true]:border-purple-500 data-[selected=true]:bg-purple-50',
  },
];

export function Step2CaseType({ defaultValues, onComplete, navProps }: Step2Props) {
  const form = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      referral_type: defaultValues.referral_type,
    },
  });

  const handleNext = form.handleSubmit(async (data) => {
    await onComplete({ referral_type: data.referral_type });
  });

  const selectedType = form.watch('referral_type');

  return (
    <Card>
      <CardHeader>
        <CardTitle>What Type of Case Is This?</CardTitle>
        <CardDescription>
          Select the type of assistance needed. This determines which sections of the form you will complete.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <FormField
            control={form.control}
            name="referral_type"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-1 gap-4"
                  >
                    {CASE_TYPES.map(({ value, label, description, details, icon: Icon, color }) => {
                      const isSelected = selectedType === value;
                      return (
                        <div key={value}>
                          <RadioGroupItem value={value} id={`type-${value}`} className="sr-only" />
                          <Label
                            htmlFor={`type-${value}`}
                            className={cn(
                              'flex gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all hover:shadow-sm',
                              color
                            )}
                            data-selected={isSelected}
                          >
                            <div className={cn(
                              'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
                              isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                            )}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-base">{label}</div>
                              <div className="text-sm text-muted-foreground mt-0.5">{description}</div>
                              {isSelected && (
                                <ul className="mt-3 space-y-1">
                                  {details.map((d, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                      <span className="text-primary mt-0.5">✓</span>
                                      {d}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>
      </CardContent>

      <StepNavigation
        {...navProps}
        onNext={handleNext}
        currentStepData={{ referral_type: form.getValues('referral_type') }}
      />
    </Card>
  );
}

ENDOFFILE

echo "→ src/components/referral/steps/Step3ClientIdentity.tsx"
cat > "src/components/referral/steps/Step3ClientIdentity.tsx" << 'ENDOFFILE'
'use client';

// src/components/referral/steps/Step3ClientIdentity.tsx

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step3Schema, Step3FormData } from '@/lib/validations/referral.schema';
import { Referral, ReferralType, FLORIDA_COUNTIES } from '@/lib/types/referral.types';
import { StepNavigation, StepNavProps } from '../StepNavigation';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { UserCircle, MapPin, Building2, DollarSign } from 'lucide-react';

interface Step3Props {
  defaultValues: Partial<Referral>;
  referralType?: ReferralType;
  onComplete: (data: Partial<Referral>) => Promise<void>;
  navProps: StepNavProps;
}

function SectionHeader({ icon: Icon, title }: { icon: React.ComponentType<{className?: string}>; title: string }) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <Icon className="w-4 h-4 text-primary" />
      <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">{title}</h3>
      <Separator className="flex-1" />
    </div>
  );
}

// Auto-calculate age from DOB
function calculateAge(dob: string): number | undefined {
  if (!dob) return undefined;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age >= 0 ? age : undefined;
}

export function Step3ClientIdentity({ defaultValues, referralType, onComplete, navProps }: Step3Props) {
  const form = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      client_first_name: defaultValues.client_first_name || '',
      client_last_name: defaultValues.client_last_name || '',
      client_full_legal_name: defaultValues.client_full_legal_name || '',
      client_dob: defaultValues.client_dob || '',
      client_sex: defaultValues.client_sex || undefined,
      client_ssn_last4: defaultValues.client_ssn_last4 || '',
      client_language: defaultValues.client_language || 'English',
      client_county: defaultValues.client_county || '',
      client_phone: defaultValues.client_phone || '',
      client_email: defaultValues.client_email || '',
      client_home_address: defaultValues.client_home_address || '',
      client_home_city: defaultValues.client_home_city || '',
      client_home_state: defaultValues.client_home_state || 'FL',
      client_home_zip: defaultValues.client_home_zip || '',
      client_current_address: defaultValues.client_current_address || '',
      client_current_city: defaultValues.client_current_city || '',
      client_current_state: defaultValues.client_current_state || 'FL',
      client_current_zip: defaultValues.client_current_zip || '',
      admission_date: defaultValues.admission_date || '',
      amount_owed_facility: defaultValues.amount_owed_facility || undefined,
      facility_monthly_cost: defaultValues.facility_monthly_cost || undefined,
    },
  });

  const dobValue = form.watch('client_dob');
  const calculatedAge = calculateAge(dobValue);

  const handleNext = form.handleSubmit(async (data) => {
    await onComplete({
      ...data,
      client_age: calculateAge(data.client_dob),
      client_full_legal_name: data.client_full_legal_name ||
        `${data.client_first_name} ${data.client_last_name}`.trim(),
    });
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserCircle className="w-5 h-5 text-primary" />
          <CardTitle>Client Information</CardTitle>
        </div>
        <CardDescription>
          Basic identity and contact information for the individual being referred.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <div className="space-y-6">

            {/* Personal Identity */}
            <SectionHeader icon={UserCircle} title="Identity" />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="client_first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="First name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="client_last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="Last name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField control={form.control} name="client_full_legal_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Legal Name</FormLabel>
                  <FormControl><Input placeholder="As it appears on legal documents (leave blank if same as above)" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField control={form.control} name="client_dob"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>Date of Birth <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem className="col-span-1">
                <FormLabel>Age</FormLabel>
                <Input
                  value={calculatedAge !== undefined ? `${calculatedAge} years` : ''}
                  readOnly
                  className="bg-muted"
                  placeholder="Auto-calculated"
                />
              </FormItem>
              <FormField control={form.control} name="client_sex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sex</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="unknown">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField control={form.control} name="client_ssn_last4"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SSN (Last 4)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="XXXX"
                        maxLength={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">Last 4 digits only</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="client_language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Language</FormLabel>
                    <FormControl><Input placeholder="English" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="client_county"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>FL County</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select county..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {FLORIDA_COUNTIES.map(county => (
                          <SelectItem key={county} value={county}>{county}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="client_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl><Input type="tel" placeholder="(239) 555-0000" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="client_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" placeholder="email@example.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Home Address */}
            <SectionHeader icon={MapPin} title="Home Address (Pre-Admission)" />

            <FormField control={form.control} name="client_home_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl><Input placeholder="123 Main St" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-3 gap-4">
              <FormField control={form.control} name="client_home_city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="client_home_state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl><Input maxLength={2} placeholder="FL" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="client_home_zip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP</FormLabel>
                    <FormControl><Input maxLength={10} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Current / Facility Address */}
            <SectionHeader icon={Building2} title="Current Address (if different)" />

            <FormField control={form.control} name="client_current_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl><Input placeholder="Facility address or current location" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-3 gap-4">
              <FormField control={form.control} name="client_current_city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="client_current_state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl><Input maxLength={2} placeholder="FL" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="client_current_zip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP</FormLabel>
                    <FormControl><Input maxLength={10} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Facility Financials */}
            <SectionHeader icon={DollarSign} title="Facility Account" />

            <div className="grid grid-cols-3 gap-4">
              <FormField control={form.control} name="admission_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admission Date</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="amount_owed_facility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount Owed</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="facility_monthly_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Cost</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

          </div>
        </Form>
      </CardContent>

      <StepNavigation
        {...navProps}
        onNext={handleNext}
        currentStepData={form.getValues()}
      />
    </Card>
  );
}

ENDOFFILE

echo "→ src/components/referral/steps/Step4MedicalCapacity.tsx"
cat > "src/components/referral/steps/Step4MedicalCapacity.tsx" << 'ENDOFFILE'
'use client'

// src/components/referral/steps/Step4MedicalCapacity.tsx
// Shows for: Guardianship Only, Both

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { step4Schema, Step4FormData } from '@/lib/validations/referral.schema'
import { Referral, CAPACITY_LABELS, CapacityLevel } from '@/lib/types/referral.types'
import { StepNavigation, StepNavProps } from '../StepNavigation'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { HeartPulse, Stethoscope, Brain } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step4Props {
  defaultValues: Partial<Referral>
  onComplete: (data: Partial<Referral>) => Promise<void>
  navProps: StepNavProps
}

const CAPACITY_DESCRIPTIONS: Record<CapacityLevel, string> = {
  no_capacity: 'Unable to make any personal or financial decisions',
  limited_capacity: 'Some decision-making ability remains in certain areas',
  substance_abuse: 'Incapacity primarily due to substance abuse',
  has_capacity: 'Currently has legal capacity to make decisions',
}

export function Step4MedicalCapacity({ defaultValues, onComplete, navProps }: Step4Props) {
  const form = useForm<Step4FormData>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      capacity_level: defaultValues.capacity_level,
      bims_score: defaultValues.bims_score ?? undefined,
      diagnoses: defaultValues.diagnoses || '',
      medications: defaultValues.medications || '',
      mental_health_history: defaultValues.mental_health_history || '',
      dnr: defaultValues.dnr || false,
      physician_name: defaultValues.physician_name || '',
      physician_address: defaultValues.physician_address || '',
      physician_phone: defaultValues.physician_phone || '',
    },
  })

  const handleNext = form.handleSubmit(async (data) => {
    await onComplete(data)
  })

  const selectedCapacity = form.watch('capacity_level')

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-primary" />
          <CardTitle>Medical & Capacity</CardTitle>
        </div>
        <CardDescription>
          Capacity determination is the foundation of a guardianship petition.
          Provide as much detail as is available.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <div className="space-y-6">

            {/* Capacity Level */}
            <FormField
              control={form.control}
              name="capacity_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">
                    Capacity Level <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-1 gap-2 mt-2"
                    >
                      {(Object.keys(CAPACITY_DESCRIPTIONS) as CapacityLevel[]).map((key) => {
                        const isSelected = selectedCapacity === key
                        return (
                          <div key={key}>
                            <RadioGroupItem value={key} id={`cap-${key}`} className="sr-only" />
                            <Label
                              htmlFor={`cap-${key}`}
                              className={cn(
                                'flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all',
                                isSelected
                                  ? 'border-primary bg-primary/5'
                                  : 'border-input hover:border-primary/40'
                              )}
                            >
                              <div className={cn(
                                'w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0',
                                isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
                              )} />
                              <div>
                                <div className="font-medium capitalize">
                                  {CAPACITY_LABELS[key]}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {CAPACITY_DESCRIPTIONS[key]}
                                </div>
                              </div>
                            </Label>
                          </div>
                        )
                      })}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* BIMS Score */}
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                Cognitive Assessment
              </h3>
              <Separator className="flex-1" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bims_score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>BIMS Score</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={15}
                        placeholder="0–15"
                        {...field}
                        value={field.value ?? ''}
                        onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Brief Interview for Mental Status (0–15). Score ≤7 = severe cognitive impairment.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dnr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DNR Order</FormLabel>
                    <div className={cn(
                      'flex items-center justify-between p-3 rounded-lg border mt-2',
                      field.value ? 'border-amber-300 bg-amber-50' : 'border-input'
                    )}>
                      <span className="text-sm">{field.value ? 'DNR in place' : 'No DNR'}</span>
                      <FormControl>
                        <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Diagnoses & Medications */}
            <div className="flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                Medical History
              </h3>
              <Separator className="flex-1" />
            </div>

            <FormField
              control={form.control}
              name="diagnoses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diagnoses / Medical Conditions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="List current diagnoses (e.g., Alzheimer's dementia, Type 2 diabetes, CHF...)"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="medications"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Medications</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="List current medications and dosages if known..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mental_health_history"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mental Health History</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Include any mental health diagnoses, treatment history, or relevant behavioral history..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Physician */}
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                Attending Physician
              </h3>
              <Separator className="flex-1" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="physician_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Physician Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Dr. First Last" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="physician_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Physician Phone</FormLabel>
                    <FormControl>
                      <Input type="tel" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="physician_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Physician Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Practice name and address" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </Form>
      </CardContent>

      <StepNavigation
        {...navProps}
        onNext={handleNext}
        currentStepData={form.getValues()}
      />
    </Card>
  )
}

ENDOFFILE

echo "→ src/components/referral/steps/Step5Financial.tsx"
cat > "src/components/referral/steps/Step5Financial.tsx" << 'ENDOFFILE'
'use client'

// src/components/referral/steps/Step5Financial.tsx

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { step5Schema, Step5FormData } from '@/lib/validations/referral.schema'
import { Referral, ReferralType, AssetType, ASSET_TYPE_LABELS } from '@/lib/types/referral.types'
import { StepNavigation, StepNavProps } from '../StepNavigation'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { DollarSign, PlusCircle, Trash2, Landmark } from 'lucide-react'
import { cn } from '@/lib/utils'

// Asset categories for grouped display
const ASSET_CATEGORIES = [
  {
    label: 'Bank Accounts',
    types: ['checking', 'savings', 'cd', 'money_market'] as AssetType[],
  },
  {
    label: 'Real Estate',
    types: ['real_estate_primary', 'real_estate_other'] as AssetType[],
  },
  {
    label: 'Vehicles',
    types: ['vehicle'] as AssetType[],
  },
  {
    label: 'Retirement & Investments',
    types: ['retirement_ira', 'retirement_401k', 'investment', 'annuity'] as AssetType[],
  },
  {
    label: 'Insurance & Other',
    types: ['life_insurance', 'prepaid_funeral', 'personal_property', 'other'] as AssetType[],
  },
]

interface Step5Props {
  defaultValues: Partial<Referral>
  referralType?: ReferralType
  referralId?: string
  onComplete: (data: Partial<Referral>) => Promise<void>
  navProps: StepNavProps
}

const threeWayOptions = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'applied', label: 'Applied/Pending' },
]

export function Step5Financial({ defaultValues, referralType, referralId, onComplete, navProps }: Step5Props) {
  const isMedicaid = referralType === 'medicaid' || referralType === 'both'

  const form = useForm<Step5FormData>({
    resolver: zodResolver(step5Schema),
    defaultValues: {
      monthly_income: defaultValues.monthly_income ?? undefined,
      income_sources: defaultValues.income_sources || '',
      medical_insurance_cost: defaultValues.medical_insurance_cost ?? undefined,
      medicaid_status: defaultValues.medicaid_status,
      rep_payee_status: defaultValues.rep_payee_status,
      va_benefits: defaultValues.va_benefits || false,
      va_benefit_details: defaultValues.va_benefit_details || '',
      assets: (defaultValues as any).assets || [],
    },
  })

  const { fields: assetFields, append, remove } = useFieldArray({
    control: form.control,
    name: 'assets',
  })

  const handleNext = form.handleSubmit(async (data) => {
    await onComplete(data as Partial<Referral>)
  })

  const addAsset = () => {
    append({
      asset_type: 'checking',
      institution: '',
      description: '',
      account_last4: '',
      approximate_value: undefined,
      is_exempt: false,
      notes: '',
    } as any)
  }

  const totalAssets = assetFields.reduce((sum, _, i) => {
    const val = form.watch(`assets.${i}.approximate_value`)
    return sum + (val || 0)
  }, 0)

  const vaOn = form.watch('va_benefits')

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          <CardTitle>Financial Information</CardTitle>
        </div>
        <CardDescription>
          Income, benefits status, and asset inventory.
          {isMedicaid && ' Asset detail is important for Medicaid eligibility analysis.'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <div className="space-y-6">

            {/* Income */}
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Income</h3>
              <Separator className="flex-1" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="monthly_income"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gross Monthly Income</FormLabel>
                    <FormControl>
                      <Input
                        type="number" min="0" step="0.01" placeholder="0.00"
                        {...field}
                        value={field.value ?? ''}
                        onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="medical_insurance_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medical Insurance (Monthly)</FormLabel>
                    <FormControl>
                      <Input
                        type="number" min="0" step="0.01" placeholder="0.00"
                        {...field}
                        value={field.value ?? ''}
                        onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="income_sources"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Income Sources</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Social Security $1,800/mo, Pension $400/mo" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Benefits Status */}
            <div className="flex items-center gap-2">
              <Landmark className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Benefits Status</h3>
              <Separator className="flex-1" />
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Medicaid */}
              <FormField
                control={form.control}
                name="medicaid_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medicaid Status</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex gap-3 mt-2"
                      >
                        {threeWayOptions.map(opt => (
                          <div key={opt.value} className="flex items-center gap-1.5">
                            <RadioGroupItem value={opt.value} id={`med-${opt.value}`} />
                            <Label htmlFor={`med-${opt.value}`} className="text-sm font-normal cursor-pointer">
                              {opt.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Rep Payee */}
              <FormField
                control={form.control}
                name="rep_payee_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facility Rep Payee</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex gap-3 mt-2"
                      >
                        {threeWayOptions.map(opt => (
                          <div key={opt.value} className="flex items-center gap-1.5">
                            <RadioGroupItem value={opt.value} id={`rep-${opt.value}`} />
                            <Label htmlFor={`rep-${opt.value}`} className="text-sm font-normal cursor-pointer">
                              {opt.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* VA Benefits */}
            <FormField
              control={form.control}
              name="va_benefits"
              render={({ field }) => (
                <FormItem>
                  <div className={cn(
                    'flex items-center justify-between p-3 rounded-lg border transition-colors',
                    vaOn ? 'border-primary/30 bg-primary/5' : 'border-input'
                  )}>
                    <FormLabel className="cursor-pointer mb-0">Veterans Benefits / VA Services</FormLabel>
                    <FormControl>
                      <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />
            {vaOn && (
              <FormField
                control={form.control}
                name="va_benefit_details"
                render={({ field }) => (
                  <FormItem className="ml-4">
                    <FormLabel className="text-sm text-muted-foreground">VA Benefit Details</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Aid & Attendance $1,700/mo, service-connected..." {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            {/* Asset Inventory — full detail for Medicaid cases */}
            {isMedicaid && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Asset Inventory</h3>
                    <Separator className="w-20" />
                  </div>
                  {assetFields.length > 0 && (
                    <Badge variant="outline" className="text-sm">
                      Total: ${totalAssets.toLocaleString()}
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground -mt-2">
                  List all known assets. Approximate values are acceptable at this stage.
                </p>

                {assetFields.length === 0 && (
                  <div className="text-center py-6 border-2 border-dashed rounded-lg text-muted-foreground text-sm">
                    No assets added yet. Click below to add assets.
                  </div>
                )}

                <div className="space-y-4">
                  {assetFields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg bg-slate-50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Asset #{index + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                          className="text-destructive h-7 px-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name={`assets.${index}.asset_type`}
                          render={({ field: f }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Asset Type</FormLabel>
                              <Select onValueChange={f.onChange} defaultValue={f.value}>
                                <FormControl>
                                  <SelectTrigger className="h-8 text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {ASSET_CATEGORIES.map(cat => (
                                    <div key={cat.label}>
                                      <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                                        {cat.label}
                                      </div>
                                      {cat.types.map(t => (
                                        <SelectItem key={t} value={t} className="text-sm pl-4">
                                          {ASSET_TYPE_LABELS[t]}
                                        </SelectItem>
                                      ))}
                                    </div>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`assets.${index}.approximate_value`}
                          render={({ field: f }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Approximate Value ($)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number" min="0" step="0.01" placeholder="0.00"
                                  className="h-8 text-sm"
                                  value={f.value ?? ''}
                                  onChange={e => f.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name={`assets.${index}.institution`}
                          render={({ field: f }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Institution / Owner</FormLabel>
                              <FormControl>
                                <Input className="h-8 text-sm" placeholder="Bank name, etc." {...f} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`assets.${index}.account_last4`}
                          render={({ field: f }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Account # (Last 4)</FormLabel>
                              <FormControl>
                                <Input className="h-8 text-sm" maxLength={4} placeholder="XXXX" {...f} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`assets.${index}.description`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Description / Notes</FormLabel>
                            <FormControl>
                              <Input
                                className="h-8 text-sm"
                                placeholder="e.g., address of property, vehicle year/make/model..."
                                {...f}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`assets.${index}.is_exempt`}
                        render={({ field: f }) => (
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={!!f.value}
                              onCheckedChange={f.onChange}
                              className="scale-75"
                            />
                            <Label className="text-xs text-muted-foreground cursor-pointer">
                              Medicaid exempt asset
                            </Label>
                          </div>
                        )}
                      />
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={addAsset}
                  className="w-full"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Asset
                </Button>
              </>
            )}

            {/* Guardianship-only: simplified */}
            {!isMedicaid && (
              <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Asset Detail</p>
                <p>
                  For guardianship-only cases, detailed asset inventory is not required at this stage.
                  Our team will gather financial details during the intake process.
                </p>
              </div>
            )}

          </div>
        </Form>
      </CardContent>

      <StepNavigation
        {...navProps}
        onNext={handleNext}
        currentStepData={form.getValues() as Partial<Referral>}
      />
    </Card>
  )
}

ENDOFFILE

echo "→ src/components/referral/steps/Step6Family.tsx"
cat > "src/components/referral/steps/Step6Family.tsx" << 'ENDOFFILE'
'use client'

// src/components/referral/steps/Step6Family.tsx

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { step6Schema, Step6FormData } from '@/lib/validations/referral.schema'
import { Referral } from '@/lib/types/referral.types'
import { StepNavigation, StepNavProps } from '../StepNavigation'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Users, PlusCircle, Trash2, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step6Props {
  defaultValues: Partial<Referral>
  referralId?: string
  onComplete: (data: Partial<Referral>) => Promise<void>
  navProps: StepNavProps
}

const RELATIONSHIP_LABELS = {
  child: 'Child',
  sibling: 'Sibling',
  parent: 'Parent',
  other_nok: 'Other Next of Kin',
  spouse: 'Spouse (if not listed above)',
}

export function Step6Family({ defaultValues, referralId, onComplete, navProps }: Step6Props) {
  const form = useForm<Step6FormData>({
    resolver: zodResolver(step6Schema),
    defaultValues: {
      is_married: defaultValues.is_married || false,
      spouse_name: defaultValues.spouse_name || '',
      spouse_dob: defaultValues.spouse_dob || '',
      spouse_ssn_last4: defaultValues.spouse_ssn_last4 || '',
      spouse_address: defaultValues.spouse_address || '',
      spouse_phone: defaultValues.spouse_phone || '',
      family_members: (defaultValues as any).family_members || [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'family_members',
  })

  const isMarried = form.watch('is_married')

  const handleNext = form.handleSubmit(async (data) => {
    await onComplete(data as Partial<Referral>)
  })

  const addMember = () => {
    append({
      relationship: 'child',
      full_name: '',
      dob: '',
      address: '',
      city: '',
      state: 'FL',
      zip: '',
      phone: '',
      email: '',
      notes: '',
    } as any)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <CardTitle>Family & Next of Kin</CardTitle>
        </div>
        <CardDescription>
          Florida guardianship requires notice to all close relatives.
          Please provide complete contact information for each family member.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <div className="space-y-6">

            {/* Marital Status */}
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                Marital Status
              </h3>
              <Separator className="flex-1" />
            </div>

            <FormField
              control={form.control}
              name="is_married"
              render={({ field }) => (
                <FormItem>
                  <div className={cn(
                    'flex items-center justify-between p-3 rounded-lg border transition-colors',
                    isMarried ? 'border-primary/30 bg-primary/5' : 'border-input'
                  )}>
                    <FormLabel className="cursor-pointer mb-0 font-medium">
                      Currently Married
                    </FormLabel>
                    <FormControl>
                      <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />

            {isMarried && (
              <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                <p className="text-sm text-muted-foreground font-medium">Spouse Information</p>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="spouse_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Spouse Full Name</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="spouse_dob"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Spouse Date of Birth</FormLabel>
                        <FormControl><Input type="date" {...field} /></FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="spouse_ssn_last4"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SSN (Last 4)</FormLabel>
                        <FormControl>
                          <Input maxLength={4} placeholder="XXXX" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="spouse_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Spouse Phone</FormLabel>
                        <FormControl><Input type="tel" {...field} /></FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="spouse_address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Spouse Address</FormLabel>
                        <FormControl>
                          <Input placeholder="If different from client" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Family Members */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  Children & Next of Kin
                </h3>
              </div>
              <span className="text-xs text-muted-foreground">
                {fields.length} added
              </span>
            </div>

            <p className="text-sm text-muted-foreground -mt-4">
              List all children (regardless of age), siblings, and other close relatives.
              In Florida, all adult next-of-kin must receive notice of guardianship proceedings.
            </p>

            {fields.length === 0 && (
              <div className="text-center py-6 border-2 border-dashed rounded-lg text-muted-foreground text-sm">
                No family members added yet.
              </div>
            )}

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <FormField
                      control={form.control}
                      name={`family_members.${index}.relationship`}
                      render={({ field: f }) => (
                        <FormItem className="flex-1 mr-4">
                          <Select onValueChange={f.onChange} defaultValue={f.value}>
                            <FormControl>
                              <SelectTrigger className="h-8 w-44 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(RELATIONSHIP_LABELS).map(([value, label]) => (
                                <SelectItem key={value} value={value} className="text-sm">
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-destructive h-7 px-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name={`family_members.${index}.full_name`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Full Name *</FormLabel>
                          <FormControl>
                            <Input className="h-8 text-sm" {...f} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`family_members.${index}.dob`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Date of Birth</FormLabel>
                          <FormControl>
                            <Input type="date" className="h-8 text-sm" {...f} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name={`family_members.${index}.phone`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Phone</FormLabel>
                          <FormControl>
                            <Input type="tel" className="h-8 text-sm" {...f} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`family_members.${index}.email`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Email</FormLabel>
                          <FormControl>
                            <Input type="email" className="h-8 text-sm" {...f} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`family_members.${index}.address`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Address</FormLabel>
                        <FormControl>
                          <Input
                            className="h-8 text-sm"
                            placeholder="Street, City, State ZIP"
                            {...f}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={addMember}
              className="w-full"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Family Member
            </Button>

          </div>
        </Form>
      </CardContent>

      <StepNavigation
        {...navProps}
        onNext={handleNext}
        currentStepData={form.getValues() as Partial<Referral>}
      />
    </Card>
  )
}

ENDOFFILE

echo "→ src/components/referral/steps/Step7LegalDocuments.tsx"
cat > "src/components/referral/steps/Step7LegalDocuments.tsx" << 'ENDOFFILE'
'use client';

// src/components/referral/steps/Step7LegalDocuments.tsx

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step7Schema, Step7FormData } from '@/lib/validations/referral.schema';
import { Referral, ReferralType } from '@/lib/types/referral.types';
import { StepNavigation, StepNavProps } from '../StepNavigation';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { FileText, Shield, HeartPulse, Scale, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step7Props {
  defaultValues: Partial<Referral>;
  referralType?: ReferralType;
  onComplete: (data: Partial<Referral>) => Promise<void>;
  navProps: StepNavProps;
}

function SectionHeader({ icon: Icon, title }: { icon: React.ComponentType<{className?: string}>; title: string }) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <Icon className="w-4 h-4 text-primary" />
      <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">{title}</h3>
      <Separator className="flex-1" />
    </div>
  );
}

// Reusable Yes/No toggle with conditional text field
function YesNoField({
  form,
  fieldName,
  label,
  conditionalFieldName,
  conditionalLabel,
  conditionalPlaceholder,
  conditionalMultiline = false,
}: {
  form: ReturnType<typeof useForm<Step7FormData>>;
  fieldName: keyof Step7FormData;
  label: string;
  conditionalFieldName?: keyof Step7FormData;
  conditionalLabel?: string;
  conditionalPlaceholder?: string;
  conditionalMultiline?: boolean;
}) {
  const isYes = form.watch(fieldName) === true;

  return (
    <div className="space-y-3">
      <FormField
        control={form.control}
        name={fieldName}
        render={({ field }) => (
          <FormItem>
            <div className={cn(
              'flex items-center justify-between p-3 rounded-lg border transition-colors',
              isYes ? 'border-primary/30 bg-primary/5' : 'border-input'
            )}>
              <FormLabel className="cursor-pointer font-medium mb-0">{label}</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value === true}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </div>
          </FormItem>
        )}
      />
      {isYes && conditionalFieldName && (
        <FormField
          control={form.control}
          name={conditionalFieldName}
          render={({ field }) => (
            <FormItem className="ml-4">
              <FormLabel className="text-sm text-muted-foreground">{conditionalLabel}</FormLabel>
              <FormControl>
                {conditionalMultiline ? (
                  <Textarea
                    placeholder={conditionalPlaceholder}
                    rows={3}
                    {...field}
                    value={field.value as string || ''}
                  />
                ) : (
                  <Input
                    placeholder={conditionalPlaceholder}
                    {...field}
                    value={field.value as string || ''}
                  />
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}

export function Step7LegalDocuments({ defaultValues, referralType, onComplete, navProps }: Step7Props) {
  const form = useForm<Step7FormData>({
    resolver: zodResolver(step7Schema),
    defaultValues: {
      has_poa: defaultValues.has_poa,
      poa_agent_name: defaultValues.poa_agent_name || '',
      has_hc_surrogate: defaultValues.has_hc_surrogate,
      hc_surrogate_name: defaultValues.hc_surrogate_name || '',
      has_living_will: defaultValues.has_living_will,
      has_trust: defaultValues.has_trust,
      trust_type: defaultValues.trust_type || '',
      has_prior_guardianship: defaultValues.has_prior_guardianship,
      prior_guardianship_details: defaultValues.prior_guardianship_details || '',
      existing_guardian_name: defaultValues.existing_guardian_name || '',
      disability_benefits: defaultValues.disability_benefits || false,
      veteran_services: defaultValues.veteran_services || false,
      other_services: defaultValues.other_services || '',
      legal_rep_name: defaultValues.legal_rep_name || '',
      legal_rep_contact: defaultValues.legal_rep_contact || '',
      special_needs: defaultValues.special_needs || '',
    },
  });

  const handleNext = form.handleSubmit(async (data) => {
    await onComplete(data);
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <CardTitle>Existing Legal Documents</CardTitle>
        </div>
        <CardDescription>
          Document any existing legal instruments, prior proceedings, and support services in place.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <div className="space-y-6">

            {/* Financial & Health Documents */}
            <SectionHeader icon={Shield} title="Financial & Health Documents" />

            <div className="space-y-3">
              <YesNoField
                form={form}
                fieldName="has_poa"
                label="Power of Attorney (Financial)"
                conditionalFieldName="poa_agent_name"
                conditionalLabel="Agent Name"
                conditionalPlaceholder="Name of POA agent"
              />
              <YesNoField
                form={form}
                fieldName="has_hc_surrogate"
                label="Health Care Surrogate / Health Care Proxy"
                conditionalFieldName="hc_surrogate_name"
                conditionalLabel="Surrogate Name"
                conditionalPlaceholder="Name of health care surrogate"
              />
              <YesNoField
                form={form}
                fieldName="has_living_will"
                label="Living Will / Advance Directive"
              />
              <YesNoField
                form={form}
                fieldName="has_trust"
                label="Trust"
                conditionalFieldName="trust_type"
                conditionalLabel="Type of Trust"
                conditionalPlaceholder="e.g., Revocable Living Trust, Special Needs Trust, Irrevocable Trust"
              />
            </div>

            {/* Guardianship History — show for guardianship/both */}
            {(referralType === 'guardianship' || referralType === 'both' || !referralType) && (
              <>
                <SectionHeader icon={Scale} title="Guardianship History" />
                <div className="space-y-3">
                  <YesNoField
                    form={form}
                    fieldName="has_prior_guardianship"
                    label="Prior or existing guardianship proceedings?"
                    conditionalFieldName="prior_guardianship_details"
                    conditionalLabel="Details"
                    conditionalPlaceholder="Describe prior proceedings, court, case number if known"
                    conditionalMultiline
                  />
                  <FormField
                    control={form.control}
                    name="existing_guardian_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Existing Guardian Name (if any)</FormLabel>
                        <FormControl>
                          <Input placeholder="Name of currently appointed guardian" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {/* Support Services */}
            <SectionHeader icon={HeartPulse} title="Benefits & Support Services" />

            <div className="space-y-3">
              {(['disability_benefits', 'veteran_services'] as const).map(field => (
                <FormField
                  key={field}
                  control={form.control}
                  name={field}
                  render={({ field: f }) => (
                    <FormItem>
                      <div className="flex items-center justify-between p-3 rounded-lg border border-input">
                        <FormLabel className="cursor-pointer font-medium mb-0">
                          {field === 'disability_benefits' ? 'Disability Benefits (SSI/SSDI)' : 'Veterans Benefits / Services'}
                        </FormLabel>
                        <FormControl>
                          <Switch checked={!!f.value} onCheckedChange={f.onChange} />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />
              ))}
              <FormField
                control={form.control}
                name="other_services"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Other Benefits or Services</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Meals on Wheels, home health, community programs" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Legal Representation */}
            <SectionHeader icon={Users} title="Legal Representation" />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="legal_rep_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Attorney / Advocate Name</FormLabel>
                    <FormControl>
                      <Input placeholder="If represented by another attorney" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="legal_rep_contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Information</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone or email" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Special Needs */}
            <FormField
              control={form.control}
              name="special_needs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Needs, Preferences, or Wishes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any special needs, cultural considerations, religious preferences, care preferences, or expressed wishes of the individual..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

          </div>
        </Form>
      </CardContent>

      <StepNavigation
        {...navProps}
        onNext={handleNext}
        currentStepData={form.getValues()}
      />
    </Card>
  );
}

ENDOFFILE

echo "→ src/components/referral/steps/Step8DocumentsNotes.tsx"
cat > "src/components/referral/steps/Step8DocumentsNotes.tsx" << 'ENDOFFILE'
'use client'

// src/components/referral/steps/Step8DocumentsNotes.tsx

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { step8Schema, Step8FormData } from '@/lib/validations/referral.schema'
import { Referral, DocumentType } from '@/lib/types/referral.types'
import { StepNavigation, StepNavProps } from '../StepNavigation'
import { createClient } from '@/lib/supabase/client'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { FileText, Upload, X, Loader2, CheckCircle2 } from 'lucide-react'

interface Step8Props {
  defaultValues: Partial<Referral>
  referralId?: string
  onComplete: (data: Partial<Referral>) => Promise<void>
  navProps: StepNavProps
}

const DOC_TYPE_LABELS: Record<DocumentType, string> = {
  facesheet: 'Facility Admission Facesheet',
  id_drivers_license: 'Driver\'s License',
  id_passport: 'Passport',
  id_state: 'State ID',
  medical_report: 'Medical Report',
  poa: 'Power of Attorney',
  hc_surrogate: 'Health Care Surrogate',
  living_will: 'Living Will / Advance Directive',
  trust: 'Trust Document',
  outstanding_balance: 'Outstanding Balance Statement',
  bank_statement: 'Bank Statement',
  other: 'Other Document',
}

interface UploadedFile {
  name: string
  doc_type: DocumentType
  storage_path: string
  size: number
  uploading?: boolean
}

export function Step8DocumentsNotes({ defaultValues, referralId, onComplete, navProps }: Step8Props) {
  const supabase = createClient()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploads, setUploads] = useState<UploadedFile[]>([])
  const [pendingDocType, setPendingDocType] = useState<DocumentType>('facesheet')
  const [uploading, setUploading] = useState(false)

  const form = useForm<Step8FormData>({
    resolver: zodResolver(step8Schema),
    defaultValues: {
      notes: defaultValues.notes || '',
    },
  })

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !referralId) {
      if (!referralId) {
        toast({
          title: 'Save referral first',
          description: 'The referral must be saved before uploading documents.',
          variant: 'destructive',
        })
      }
      return
    }

    setUploading(true)
    const path = `${referralId}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`

    const { error } = await supabase.storage
      .from('referral-documents')
      .upload(path, file)

    if (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' })
    } else {
      // Save document record to DB
      await supabase.from('referral_documents').insert({
        referral_id: referralId,
        doc_type: pendingDocType,
        file_name: file.name,
        storage_path: path,
        file_size_bytes: file.size,
      })

      setUploads(prev => [...prev, {
        name: file.name,
        doc_type: pendingDocType,
        storage_path: path,
        size: file.size,
      }])
      toast({ title: 'File uploaded successfully' })
    }

    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeUpload = async (path: string) => {
    await supabase.storage.from('referral-documents').remove([path])
    await supabase.from('referral_documents').delete().eq('storage_path', path)
    setUploads(prev => prev.filter(u => u.storage_path !== path))
  }

  const handleNext = form.handleSubmit(async (data) => {
    await onComplete({ notes: data.notes })
  })

  const RECOMMENDED_DOCS: { type: DocumentType; label: string; required?: boolean }[] = [
    { type: 'facesheet', label: 'Admission Facesheet', required: true },
    { type: 'id_drivers_license', label: 'Photo ID', required: true },
    { type: 'outstanding_balance', label: 'Outstanding Balance Statement' },
    { type: 'medical_report', label: 'Medical Report / Physician Letter' },
    { type: 'poa', label: 'Power of Attorney (if exists)' },
    { type: 'bank_statement', label: 'Bank Statement(s)' },
  ]

  const uploadedTypes = new Set(uploads.map(u => u.doc_type))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <CardTitle>Documents & Notes</CardTitle>
        </div>
        <CardDescription>
          Upload supporting documents and add any final notes for our team.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">

          {/* Recommended documents checklist */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                Recommended Documents
              </h3>
              <Separator className="flex-1" />
            </div>
            <div className="grid grid-cols-1 gap-2">
              {RECOMMENDED_DOCS.map(({ type, label, required }) => {
                const isUploaded = uploadedTypes.has(type)
                return (
                  <div
                    key={type}
                    className={`flex items-center justify-between p-2.5 rounded-lg text-sm border ${
                      isUploaded ? 'border-green-200 bg-green-50' : 'border-input'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isUploaded
                        ? <CheckCircle2 className="w-4 h-4 text-green-600" />
                        : <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                      }
                      <span>{label}</span>
                      {required && <Badge variant="outline" className="text-xs">Required</Badge>}
                    </div>
                    {!isUploaded && (
                      <button
                        type="button"
                        onClick={() => {
                          setPendingDocType(type)
                          fileInputRef.current?.click()
                        }}
                        className="text-xs text-primary hover:underline"
                      >
                        Upload
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Upload area */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Upload className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                Upload Document
              </h3>
              <Separator className="flex-1" />
            </div>

            <div className="flex gap-3 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Document Type</label>
                <Select
                  value={pendingDocType}
                  onValueChange={v => setPendingDocType(v as DocumentType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(DOC_TYPE_LABELS) as [DocumentType, string][]).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={uploading || !referralId}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading
                  ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  : <Upload className="w-4 h-4 mr-2" />
                }
                Choose File
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.tiff"
              onChange={handleFileChange}
            />

            {!referralId && (
              <p className="text-xs text-amber-600 mt-2">
                ⚠ Files can only be uploaded after the referral is saved.
                Complete Step 1 first to enable uploads.
              </p>
            )}

            <p className="text-xs text-muted-foreground mt-2">
              Accepted: PDF, Word documents, JPEG, PNG, TIFF. Max 20MB per file.
            </p>
          </div>

          {/* Uploaded files list */}
          {uploads.length > 0 && (
            <div className="space-y-2">
              {uploads.map((upload) => (
                <div
                  key={upload.storage_path}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-green-200 bg-green-50"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <div>
                      <div className="font-medium">{upload.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {DOC_TYPE_LABELS[upload.doc_type]} ·{' '}
                        {(upload.size / 1024).toFixed(0)} KB
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeUpload(upload.storage_path)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          <div>
            <Separator className="mb-4" />
            <Form {...form}>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Notes & Additional Comments
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional context, concerns, urgency details, family dynamics, or other information that would help our team..."
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </Form>
          </div>

        </div>
      </CardContent>

      <StepNavigation
        {...navProps}
        onNext={handleNext}
        currentStepData={{ notes: form.getValues('notes') }}
      />
    </Card>
  )
}

ENDOFFILE

echo "→ src/components/referral/steps/Step9ReviewSubmit.tsx"
cat > "src/components/referral/steps/Step9ReviewSubmit.tsx" << 'ENDOFFILE'
'use client'

// src/components/referral/steps/Step9ReviewSubmit.tsx

import { useState } from 'react'
import {
  Referral, REFERRAL_TYPE_LABELS, CAPACITY_LABELS,
  URGENCY_LABELS, ASSET_TYPE_LABELS
} from '@/lib/types/referral.types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Edit, Loader2, ClipboardCheck, AlertCircle } from 'lucide-react'

interface Step9Props {
  referralData: Partial<Referral>
  referralId?: string
  activeSteps: { number: number; label: string }[]
  onSubmit: (data: Partial<Referral>) => Promise<void>
  onEditStep: (step: number) => void
  isSaving: boolean
}

function ReviewSection({
  title,
  stepNumber,
  onEdit,
  children,
}: {
  title: string
  stepNumber: number
  onEdit: (step: number) => void
  children: React.ReactNode
}) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b">
        <h3 className="font-semibold text-sm">{title}</h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onEdit(stepNumber)}
          className="h-7 px-2 text-xs text-primary"
        >
          <Edit className="w-3 h-3 mr-1" /> Edit
        </Button>
      </div>
      <div className="p-4 space-y-1.5">{children}</div>
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value?: string | number | boolean | null }) {
  if (value === undefined || value === null || value === '') return null
  const display = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)
  return (
    <div className="flex gap-3 text-sm">
      <span className="text-muted-foreground w-40 flex-shrink-0">{label}</span>
      <span className="font-medium flex-1">{display}</span>
    </div>
  )
}

export function Step9ReviewSubmit({
  referralData,
  referralId,
  activeSteps,
  onSubmit,
  onEditStep,
  isSaving,
}: Step9Props) {
  const [certify, setCertify] = useState(false)
  const [submitterName, setSubmitterName] = useState(referralData.submitted_by_name || '')
  const [submitterCompany, setSubmitterCompany] = useState(referralData.submitted_by_company || '')
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!certify) {
      setError('Please certify that the information is accurate before submitting.')
      return
    }
    if (!submitterName) {
      setError('Please enter your name.')
      return
    }
    setError('')
    await onSubmit({
      submitted_by_name: submitterName,
      submitted_by_company: submitterCompany,
      submitted_date: new Date().toISOString().split('T')[0],
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-primary" />
            <CardTitle>Review & Submit</CardTitle>
          </div>
          <CardDescription>
            Please review all information before submitting. Click any section to make edits.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Summary */}
      <ReviewSection title="Referral Type & Urgency" stepNumber={1} onEdit={onEditStep}>
        <ReviewRow
          label="Facility"
          value={referralData.facility_name_freetext || (referralData as any).facilities?.name}
        />
        <ReviewRow
          label="Urgency"
          value={referralData.urgency ? URGENCY_LABELS[referralData.urgency] : undefined}
        />
        <ReviewRow
          label="Case Type"
          value={referralData.referral_type ? REFERRAL_TYPE_LABELS[referralData.referral_type] : undefined}
        />
      </ReviewSection>

      <ReviewSection title="Client Information" stepNumber={3} onEdit={onEditStep}>
        <ReviewRow
          label="Name"
          value={referralData.client_full_legal_name ||
            `${referralData.client_first_name || ''} ${referralData.client_last_name || ''}`.trim()}
        />
        <ReviewRow
          label="Date of Birth"
          value={referralData.client_dob
            ? format(new Date(referralData.client_dob), 'MMM d, yyyy')
            : undefined}
        />
        <ReviewRow label="Age" value={referralData.client_age ? `${referralData.client_age} years` : undefined} />
        <ReviewRow label="Sex" value={referralData.client_sex} />
        <ReviewRow label="County" value={referralData.client_county} />
        <ReviewRow label="Phone" value={referralData.client_phone} />
        <ReviewRow
          label="Admission Date"
          value={referralData.admission_date
            ? format(new Date(referralData.admission_date), 'MMM d, yyyy')
            : undefined}
        />
        <ReviewRow
          label="Amount Owed"
          value={referralData.amount_owed_facility
            ? `$${referralData.amount_owed_facility.toLocaleString()}` : undefined}
        />
      </ReviewSection>

      {referralData.capacity_level && (
        <ReviewSection title="Medical & Capacity" stepNumber={4} onEdit={onEditStep}>
          <ReviewRow
            label="Capacity"
            value={CAPACITY_LABELS[referralData.capacity_level]}
          />
          <ReviewRow label="BIMS Score" value={referralData.bims_score} />
          <ReviewRow label="DNR" value={referralData.dnr} />
          <ReviewRow label="Physician" value={referralData.physician_name} />
        </ReviewSection>
      )}

      <ReviewSection title="Financial" stepNumber={5} onEdit={onEditStep}>
        <ReviewRow
          label="Monthly Income"
          value={referralData.monthly_income
            ? `$${referralData.monthly_income.toLocaleString()}` : undefined}
        />
        <ReviewRow label="Medicaid Status" value={referralData.medicaid_status} />
        <ReviewRow label="Rep Payee" value={referralData.rep_payee_status} />
        <ReviewRow label="VA Benefits" value={referralData.va_benefits} />
        {(referralData as any).assets?.length > 0 && (
          <div className="text-sm">
            <span className="text-muted-foreground">Assets: </span>
            <span className="font-medium">
              {(referralData as any).assets.length} item(s) — Total approx.{' '}
              ${((referralData as any).assets as any[])
                .reduce((s: number, a: any) => s + (a.approximate_value || 0), 0)
                .toLocaleString()}
            </span>
          </div>
        )}
      </ReviewSection>

      <ReviewSection title="Family & Next of Kin" stepNumber={6} onEdit={onEditStep}>
        <ReviewRow label="Married" value={referralData.is_married} />
        {referralData.is_married && (
          <ReviewRow label="Spouse" value={referralData.spouse_name} />
        )}
        {(referralData as any).family_members?.length > 0 && (
          <ReviewRow
            label="Family Members"
            value={`${(referralData as any).family_members.length} added`}
          />
        )}
      </ReviewSection>

      <ReviewSection title="Legal Documents" stepNumber={7} onEdit={onEditStep}>
        <ReviewRow label="Power of Attorney" value={referralData.has_poa} />
        <ReviewRow label="Health Care Surrogate" value={referralData.has_hc_surrogate} />
        <ReviewRow label="Living Will" value={referralData.has_living_will} />
        <ReviewRow label="Trust" value={referralData.has_trust} />
        <ReviewRow label="Prior Guardianship" value={referralData.has_prior_guardianship} />
      </ReviewSection>

      {/* Signature & Certification */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-semibold">Submission Certification</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="submitter-name">Your Name *</Label>
              <Input
                id="submitter-name"
                value={submitterName}
                onChange={e => setSubmitterName(e.target.value)}
                placeholder="First Last"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="submitter-company">Company / Organization</Label>
              <Input
                id="submitter-company"
                value={submitterCompany}
                onChange={e => setSubmitterCompany(e.target.value)}
                placeholder="Facility or organization name"
              />
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg border border-input bg-muted/30">
            <Checkbox
              id="certify"
              checked={certify}
              onCheckedChange={v => setCertify(!!v)}
              className="mt-0.5"
            />
            <Label htmlFor="certify" className="text-sm leading-relaxed cursor-pointer">
              I certify that the information provided in this referral is accurate and complete
              to the best of my knowledge. I understand that this referral will be reviewed by
              Zacharia Brown  and that submitting false information may affect the handling
              of this case.
            </Label>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Separator />

          <Button
            type="button"
            className="w-full"
            size="lg"
            disabled={isSaving || !certify}
            onClick={handleSubmit}
          >
            {isSaving
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
              : <><ClipboardCheck className="w-4 h-4 mr-2" /> Submit Referral</>
            }
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Submitted referrals are routed to{' '}
            <a href="mailto:intake@zacbrownlaw.com" className="text-primary">
              intake@zacbrownlaw.com
            </a>
            . You will receive a confirmation and can track status in your dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

ENDOFFILE

echo "→ src/components/shared/ReferrerNav.tsx"
cat > "src/components/shared/ReferrerNav.tsx" << 'ENDOFFILE'
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/lib/types/referral.types'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ClipboardList, Plus, User, LogOut, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ReferrerNav({ profile }: { profile: Profile }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navLinks = [
    { href: '/dashboard', label: 'My Referrals', icon: ClipboardList },
    { href: '/referral/new', label: 'New Referral', icon: Plus },
  ]

  return (
    <nav className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
              ZF
            </div>
            <span className="font-semibold text-sm hidden sm:block">Referral Portal</span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors',
                  pathname === href
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">
                {profile.first_name} {profile.last_name}
              </span>
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              {profile.email}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <User className="w-4 h-4 mr-2" /> My Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}

ENDOFFILE

echo "→ src/components/shared/StaffNav.tsx"
cat > "src/components/shared/StaffNav.tsx" << 'ENDOFFILE'
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/lib/types/referral.types'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { LayoutDashboard, Building2, Users, LogOut, ChevronDown, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StaffNav({ profile }: { profile: Profile }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navLinks = [
    { href: '/staff/dashboard', label: 'All Referrals', icon: LayoutDashboard },
    { href: '/staff/facilities', label: 'Facilities', icon: Building2 },
  ]

  return (
    <nav className="bg-slate-900 text-white sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/staff/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-white/20 flex items-center justify-center text-xs font-bold">
              ZF
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-semibold leading-tight">Zacharia Brown </div>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <ShieldCheck className="w-3 h-3" />
                Staff Portal
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors',
                  pathname.startsWith(href)
                    ? 'bg-white/20 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white gap-1">
              {profile.first_name} {profile.last_name}
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <div className="px-2 py-1.5 text-xs text-muted-foreground capitalize">
              Role: {profile.role}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}

ENDOFFILE

echo "→ src/components/shared/ReferralList.tsx"
cat > "src/components/shared/ReferralList.tsx" << 'ENDOFFILE'
'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import {
  ReferralStatus, ReferralType, UrgencyLevel,
  STATUS_LABELS, REFERRAL_TYPE_LABELS, URGENCY_LABELS
} from '@/lib/types/referral.types'
import { FileEdit, Eye, AlertTriangle, Zap } from 'lucide-react'

// ============================================================
// StatusBadge
// ============================================================
const STATUS_STYLES: Record<ReferralStatus, string> = {
  draft: 'bg-slate-100 text-slate-700 border-slate-200',
  submitted: 'bg-blue-50 text-blue-700 border-blue-200',
  in_review: 'bg-amber-50 text-amber-700 border-amber-200',
  accepted: 'bg-green-50 text-green-700 border-green-200',
  closed: 'bg-slate-50 text-slate-500 border-slate-200',
}

export function StatusBadge({ status }: { status: ReferralStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}

// ============================================================
// UrgencyBadge
// ============================================================
export function UrgencyBadge({ urgency }: { urgency: UrgencyLevel }) {
  if (urgency === 'routine') return null
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
      urgency === 'emergency'
        ? 'bg-red-50 text-red-700 border-red-200'
        : 'bg-amber-50 text-amber-700 border-amber-200'
    }`}>
      {urgency === 'emergency' ? <Zap className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
      {URGENCY_LABELS[urgency]}
    </span>
  )
}

// ============================================================
// ReferralList
// ============================================================
interface ReferralListProps {
  referrals: any[]
  emptyMessage?: string
  showEditDraft?: boolean
  isStaffView?: boolean
}

export function ReferralList({
  referrals,
  emptyMessage = 'No referrals found.',
  showEditDraft,
  isStaffView,
}: ReferralListProps) {
  if (referrals.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border">
        <p className="text-muted-foreground">{emptyMessage}</p>
        {!isStaffView && (
          <Button asChild className="mt-4">
            <Link href="/referral/new">Submit Your First Referral</Link>
          </Button>
        )}
      </div>
    )
  }

  const basePath = isStaffView ? '/staff/referral' : '/referral'

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="divide-y">
        {referrals.map((referral) => {
          const clientName = referral.client_first_name
            ? `${referral.client_first_name} ${referral.client_last_name}`
            : 'Client name pending'

          const facilityName =
            referral.facilities?.name ||
            referral.facility_name_freetext ||
            'Facility not specified'

          const referrerName = isStaffView && referral.profiles
            ? `${referral.profiles.first_name} ${referral.profiles.last_name}${referral.profiles.organization ? ` · ${referral.profiles.organization}` : ''}`
            : null

          const isDraft = referral.status === 'draft'
          const updatedAt = referral.updated_at
            ? formatDistanceToNow(new Date(referral.updated_at), { addSuffix: true })
            : ''

          return (
            <div key={referral.id} className="p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-foreground">{clientName}</span>
                    <StatusBadge status={referral.status} />
                    <UrgencyBadge urgency={referral.urgency} />
                  </div>
                  <div className="text-sm text-muted-foreground mt-0.5 space-x-2">
                    <span>{facilityName}</span>
                    <span>·</span>
                    <span>{REFERRAL_TYPE_LABELS[referral.referral_type as ReferralType] || 'Type pending'}</span>
                    {isStaffView && referrerName && (
                      <>
                        <span>·</span>
                        <span>Referred by {referrerName}</span>
                      </>
                    )}
                  </div>
                  {isDraft && referral.current_step && (
                    <div className="text-xs text-amber-600 mt-1">
                      Draft · Step {referral.current_step} of 9
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    Updated {updatedAt}
                  </div>
                </div>

                <Button
                  asChild
                  variant={isDraft && showEditDraft ? 'default' : 'outline'}
                  size="sm"
                >
                  <Link href={`${basePath}/${referral.id}`}>
                    {isDraft && showEditDraft ? (
                      <><FileEdit className="w-3.5 h-3.5 mr-1.5" /> Resume</>
                    ) : (
                      <><Eye className="w-3.5 h-3.5 mr-1.5" /> View</>
                    )}
                  </Link>
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

ENDOFFILE

echo "→ src/components/shared/StaffDashboardFilters.tsx"
cat > "src/components/shared/StaffDashboardFilters.tsx" << 'ENDOFFILE'
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

export function StaffDashboardFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/staff/dashboard?${params.toString()}`)
  }

  const clearAll = () => router.push('/staff/dashboard')

  const hasFilters = searchParams.toString().length > 0

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <Input
        placeholder="Search by client name..."
        className="w-56"
        defaultValue={searchParams.get('search') || ''}
        onChange={e => {
          const val = e.target.value
          setTimeout(() => update('search', val), 300)
        }}
      />
      <Select
        defaultValue={searchParams.get('status') || 'all'}
        onValueChange={v => update('status', v)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="submitted">Submitted</SelectItem>
          <SelectItem value="in_review">In Review</SelectItem>
          <SelectItem value="accepted">Accepted</SelectItem>
          <SelectItem value="closed">Closed</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
        </SelectContent>
      </Select>
      <Select
        defaultValue={searchParams.get('type') || 'all'}
        onValueChange={v => update('type', v)}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Case Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="guardianship">Guardianship</SelectItem>
          <SelectItem value="medicaid">Medicaid</SelectItem>
          <SelectItem value="both">Both</SelectItem>
        </SelectContent>
      </Select>
      <Select
        defaultValue={searchParams.get('urgency') || 'all'}
        onValueChange={v => update('urgency', v)}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Urgency" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Urgency</SelectItem>
          <SelectItem value="emergency">Emergency</SelectItem>
          <SelectItem value="urgent">Urgent</SelectItem>
          <SelectItem value="routine">Routine</SelectItem>
        </SelectContent>
      </Select>
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearAll}>
          <X className="w-3.5 h-3.5 mr-1" /> Clear
        </Button>
      )}
    </div>
  )
}

ENDOFFILE

echo "→ src/components/shared/StaffStatusPanel.tsx"
cat > "src/components/shared/StaffStatusPanel.tsx" << 'ENDOFFILE'
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { StatusBadge, UrgencyBadge } from './ReferralList'
import { useToast } from '@/hooks/use-toast'
import { formatDistanceToNow, format } from 'date-fns'
import { Loader2, User, Building2, Calendar } from 'lucide-react'
import { ReferralStatus } from '@/lib/types/referral.types'

const STATUS_TRANSITIONS: Record<ReferralStatus, { label: string; next: ReferralStatus }[]> = {
  draft: [],
  submitted: [
    { label: 'Accept for Review', next: 'in_review' },
    { label: 'Close', next: 'closed' },
  ],
  in_review: [
    { label: 'Mark Accepted', next: 'accepted' },
    { label: 'Close', next: 'closed' },
  ],
  accepted: [
    { label: 'Close Case', next: 'closed' },
  ],
  closed: [
    { label: 'Re-open (In Review)', next: 'in_review' },
  ],
}

export function StaffStatusPanel({ referral }: { referral: any }) {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [note, setNote] = useState('')

  const transitions = STATUS_TRANSITIONS[referral.status as ReferralStatus] || []

  const handleStatusChange = async (next: ReferralStatus) => {
    setLoading(true)
    const { error } = await supabase
      .from('referrals')
      .update({ status: next })
      .eq('id', referral.id)

    if (error) {
      toast({ title: 'Error updating status', variant: 'destructive' })
    } else {
      toast({ title: `Status updated to: ${next.replace('_', ' ')}` })
      router.refresh()
    }
    setLoading(false)
  }

  const referrerProfile = referral.profiles

  return (
    <>
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Case Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={referral.status} />
            <UrgencyBadge urgency={referral.urgency} />
          </div>

          {transitions.length > 0 && (
            <div className="space-y-2">
              {transitions.map(({ label, next }) => (
                <Button
                  key={next}
                  variant={next === 'closed' ? 'outline' : 'default'}
                  size="sm"
                  className="w-full"
                  disabled={loading}
                  onClick={() => handleStatusChange(next)}
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                  {label}
                </Button>
              ))}
            </div>
          )}

          <Separator />

          <div className="space-y-2 text-sm">
            {referral.submitted_at && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                Submitted {format(new Date(referral.submitted_at), 'MMM d, yyyy')}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Referrer Info */}
      {referrerProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Referrer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{referrerProfile.first_name} {referrerProfile.last_name}</span>
            </div>
            {referrerProfile.organization && (
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                <span>{referrerProfile.organization}</span>
              </div>
            )}
            {referrerProfile.phone && (
              <a href={`tel:${referrerProfile.phone}`} className="text-primary hover:underline block">
                {referrerProfile.phone}
              </a>
            )}
            {referrerProfile.email && (
              <a href={`mailto:${referrerProfile.email}`} className="text-primary hover:underline block truncate">
                {referrerProfile.email}
              </a>
            )}
          </CardContent>
        </Card>
      )}

      {/* Staff Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Staff Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="Internal notes (not visible to referrer)..."
            rows={4}
            value={note}
            onChange={e => setNote(e.target.value)}
          />
          <Button variant="outline" size="sm" className="w-full" disabled={!note}>
            Save Note
          </Button>
        </CardContent>
      </Card>
    </>
  )
}

ENDOFFILE

echo "→ src/components/shared/FacilitiesTable.tsx"
cat > "src/components/shared/FacilitiesTable.tsx" << 'ENDOFFILE'
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Facility } from '@/lib/types/referral.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { Plus, Building2, Phone } from 'lucide-react'

interface FacilitiesTableProps {
  facilities: Facility[]
  referralCounts: Record<string, number>
}

export function FacilitiesTable({ facilities, referralCounts }: FacilitiesTableProps) {
  const supabase = createClient()
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', address: '', city: '', state: 'FL', zip: '',
    phone: '', fax: '', contact_name: '', contact_email: '',
  })

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('facilities').insert(form)
    if (error) {
      toast({ title: 'Error adding facility', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Facility added successfully' })
      setOpen(false)
      router.refresh()
    }
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add Facility</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Facility</DialogTitle>
              <DialogDescription>
                Add a new referring facility to the dropdown list.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Facility Name *</Label>
                <Input value={form.name} onChange={set('name')} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Contact Name</Label>
                  <Input value={form.contact_name} onChange={set('contact_name')} />
                </div>
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input type="email" value={form.contact_email} onChange={set('contact_email')} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input value={form.address} onChange={set('address')} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2 col-span-1">
                  <Label>City</Label>
                  <Input value={form.city} onChange={set('city')} />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input value={form.state} onChange={set('state')} maxLength={2} />
                </div>
                <div className="space-y-2">
                  <Label>ZIP</Label>
                  <Input value={form.zip} onChange={set('zip')} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input type="tel" value={form.phone} onChange={set('phone')} />
                </div>
                <div className="space-y-2">
                  <Label>Fax</Label>
                  <Input type="tel" value={form.fax} onChange={set('fax')} />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                Add Facility
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        {facilities.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No facilities yet. Add your first referring facility above.
          </div>
        ) : (
          <div className="divide-y">
            {facilities.map(facility => (
              <div key={facility.id} className="p-4 flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <Building2 className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">{facility.name}</div>
                    {facility.city && (
                      <div className="text-sm text-muted-foreground">
                        {facility.city}, {facility.state} {facility.zip}
                      </div>
                    )}
                    {facility.contact_name && (
                      <div className="text-sm text-muted-foreground">
                        Contact: {facility.contact_name}
                        {facility.contact_email && ` · ${facility.contact_email}`}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  {referralCounts[facility.id!] || 0} referral(s)
                  {facility.phone && (
                    <div className="flex items-center gap-1 justify-end mt-0.5">
                      <Phone className="w-3 h-3" />
                      {facility.phone}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

ENDOFFILE

echo "→ src/lib/supabase/client.ts"
cat > "src/lib/supabase/client.ts" << 'ENDOFFILE'
// src/lib/supabase/client.ts
// Browser-side Supabase client (use in Client Components)

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

ENDOFFILE

echo "→ src/lib/supabase/server.ts"
cat > "src/lib/supabase/server.ts" << 'ENDOFFILE'
// src/lib/supabase/server.ts
// Server-side Supabase client (use in Server Components and Route Handlers)

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component — cookies are read-only, ignore
          }
        },
      },
    }
  );
}

ENDOFFILE

echo "→ src/lib/types/referral.types.ts"
cat > "src/lib/types/referral.types.ts" << 'ENDOFFILE'
// ============================================================
// REFERRAL SYSTEM TYPES
// src/lib/types/referral.types.ts
// ============================================================

export type ReferralType = 'guardianship' | 'medicaid' | 'both';
export type UrgencyLevel = 'routine' | 'urgent' | 'emergency';
export type ReferralStatus = 'draft' | 'submitted' | 'in_review' | 'accepted' | 'closed';
export type CapacityLevel = 'no_capacity' | 'limited_capacity' | 'substance_abuse' | 'has_capacity';
export type MedicaidStatus = 'yes' | 'no' | 'applied';
export type UserRole = 'referrer' | 'staff' | 'admin';

export type AssetType =
  | 'checking' | 'savings' | 'cd' | 'money_market'
  | 'real_estate_primary' | 'real_estate_other'
  | 'vehicle'
  | 'retirement_ira' | 'retirement_401k'
  | 'life_insurance' | 'annuity' | 'investment'
  | 'prepaid_funeral' | 'personal_property' | 'other';

export type FamilyRelationship = 'child' | 'sibling' | 'parent' | 'other_nok' | 'spouse';

export type DocumentType =
  | 'facesheet' | 'id_drivers_license' | 'id_passport' | 'id_state'
  | 'medical_report' | 'poa' | 'hc_surrogate' | 'living_will'
  | 'trust' | 'outstanding_balance' | 'bank_statement' | 'other';

// ============================================================
// PROFILE
// ============================================================
export interface Profile {
  id: string;
  created_at: string;
  updated_at: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  organization?: string;
  phone?: string;
  email: string;
  is_active: boolean;
}

// ============================================================
// FACILITY
// ============================================================
export interface Facility {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  fax?: string;
  contact_name?: string;
  contact_email?: string;
}

// ============================================================
// FAMILY MEMBER
// ============================================================
export interface FamilyMember {
  id?: string;
  referral_id?: string;
  relationship: FamilyRelationship;
  full_name: string;
  dob?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  email?: string;
  notes?: string;
  sort_order?: number;
}

// ============================================================
// ASSET
// ============================================================
export interface Asset {
  id?: string;
  referral_id?: string;
  asset_type: AssetType;
  institution?: string;
  description?: string;
  account_last4?: string;
  approximate_value?: number;
  is_exempt?: boolean;
  notes?: string;
}

// ============================================================
// DOCUMENT
// ============================================================
export interface ReferralDocument {
  id?: string;
  referral_id?: string;
  doc_type: DocumentType;
  file_name: string;
  storage_path: string;
  file_size_bytes?: number;
  notes?: string;
}

// ============================================================
// REFERRAL (full record)
// ============================================================
export interface Referral {
  id?: string;
  created_at?: string;
  updated_at?: string;
  submitted_at?: string;
  referrer_id?: string;
  facility_id?: string;
  facility_name_freetext?: string;
  referral_type?: ReferralType;
  urgency?: UrgencyLevel;
  status?: ReferralStatus;

  // Client identity
  client_first_name?: string;
  client_last_name?: string;
  client_full_legal_name?: string;
  client_dob?: string;
  client_age?: number;
  client_sex?: 'male' | 'female' | 'other' | 'unknown';
  client_ssn_last4?: string;
  client_language?: string;
  client_county?: string;
  client_citizenship?: string;

  // Addresses
  client_home_address?: string;
  client_home_city?: string;
  client_home_state?: string;
  client_home_zip?: string;
  client_current_address?: string;
  client_current_city?: string;
  client_current_state?: string;
  client_current_zip?: string;
  client_phone?: string;
  client_email?: string;

  // Facility financial
  admission_date?: string;
  amount_owed_facility?: number;
  facility_monthly_cost?: number;

  // Medical & Capacity
  capacity_level?: CapacityLevel;
  bims_score?: number;
  diagnoses?: string;
  medications?: string;
  mental_health_history?: string;
  dnr?: boolean;
  physician_name?: string;
  physician_address?: string;
  physician_phone?: string;

  // Financial
  monthly_income?: number;
  income_sources?: string;
  medical_insurance_cost?: number;
  medicaid_status?: MedicaidStatus;
  rep_payee_status?: MedicaidStatus;
  va_benefits?: boolean;
  va_benefit_details?: string;

  // Spouse
  is_married?: boolean;
  spouse_name?: string;
  spouse_dob?: string;
  spouse_ssn_last4?: string;
  spouse_address?: string;
  spouse_phone?: string;

  // Legal documents
  has_poa?: boolean;
  poa_agent_name?: string;
  has_hc_surrogate?: boolean;
  hc_surrogate_name?: string;
  has_living_will?: boolean;
  has_trust?: boolean;
  trust_type?: string;
  has_prior_guardianship?: boolean;
  prior_guardianship_details?: string;
  existing_guardian_name?: string;

  // Support services
  disability_benefits?: boolean;
  veteran_services?: boolean;
  other_services?: string;
  educational_background?: string;
  employment_history?: string;
  employment_status?: string;
  special_needs?: string;

  // Legal rep
  legal_rep_name?: string;
  legal_rep_contact?: string;

  // Notes & submission
  notes?: string;
  submitted_by_name?: string;
  submitted_by_company?: string;
  submitted_date?: string;

  // Progress
  current_step?: number;
  steps_completed?: Record<string, boolean>;

  // Related (populated via joins)
  family_members?: FamilyMember[];
  assets?: Asset[];
  documents?: ReferralDocument[];
  referrer?: Profile;
  facility?: Facility;
}

// ============================================================
// FORM STEP DATA (subset types per step for React Hook Form)
// ============================================================

export interface Step1Data {
  facility_id?: string;
  facility_name_freetext?: string;
  urgency: UrgencyLevel;
}

export interface Step2Data {
  referral_type: ReferralType;
}

export interface Step3Data {
  client_first_name: string;
  client_last_name: string;
  client_full_legal_name?: string;
  client_dob: string;
  client_sex: 'male' | 'female' | 'other' | 'unknown';
  client_ssn_last4?: string;
  client_language?: string;
  client_county?: string;
  client_phone?: string;
  client_email?: string;
  client_home_address?: string;
  client_home_city?: string;
  client_home_state?: string;
  client_home_zip?: string;
  client_current_address?: string;
  client_current_city?: string;
  client_current_state?: string;
  client_current_zip?: string;
  admission_date?: string;
  amount_owed_facility?: number;
  facility_monthly_cost?: number;
}

export interface Step4Data {
  capacity_level: CapacityLevel;
  bims_score?: number;
  diagnoses?: string;
  medications?: string;
  mental_health_history?: string;
  dnr?: boolean;
  physician_name?: string;
  physician_address?: string;
  physician_phone?: string;
}

export interface Step5Data {
  monthly_income?: number;
  income_sources?: string;
  medical_insurance_cost?: number;
  medicaid_status?: MedicaidStatus;
  rep_payee_status?: MedicaidStatus;
  va_benefits?: boolean;
  va_benefit_details?: string;
  assets?: Asset[];
}

export interface Step6Data {
  is_married?: boolean;
  spouse_name?: string;
  spouse_dob?: string;
  spouse_ssn_last4?: string;
  spouse_address?: string;
  spouse_phone?: string;
  family_members?: FamilyMember[];
}

export interface Step7Data {
  has_poa?: boolean;
  poa_agent_name?: string;
  has_hc_surrogate?: boolean;
  hc_surrogate_name?: string;
  has_living_will?: boolean;
  has_trust?: boolean;
  trust_type?: string;
  has_prior_guardianship?: boolean;
  prior_guardianship_details?: string;
  existing_guardian_name?: string;
  disability_benefits?: boolean;
  veteran_services?: boolean;
  other_services?: string;
  legal_rep_name?: string;
  legal_rep_contact?: string;
  special_needs?: string;
}

export interface Step8Data {
  notes?: string;
  documents?: ReferralDocument[];
}

// Labels for display
export const REFERRAL_TYPE_LABELS: Record<ReferralType, string> = {
  guardianship: 'Guardianship Only',
  medicaid: 'Medicaid Only',
  both: 'Guardianship & Medicaid',
};

export const URGENCY_LABELS: Record<UrgencyLevel, string> = {
  routine: 'Routine',
  urgent: 'Urgent',
  emergency: 'Emergency',
};

export const CAPACITY_LABELS: Record<CapacityLevel, string> = {
  no_capacity: 'No Capacity',
  limited_capacity: 'Limited Capacity',
  substance_abuse: 'Substance Abuse',
  has_capacity: 'Has Capacity',
};

export const STATUS_LABELS: Record<ReferralStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  in_review: 'In Review',
  accepted: 'Accepted',
  closed: 'Closed',
};

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  checking: 'Checking Account',
  savings: 'Savings Account',
  cd: 'Certificate of Deposit (CD)',
  money_market: 'Money Market Account',
  real_estate_primary: 'Primary Residence',
  real_estate_other: 'Other Real Estate',
  vehicle: 'Vehicle',
  retirement_ira: 'IRA',
  retirement_401k: '401(k) / Pension',
  life_insurance: 'Life Insurance (Cash Value)',
  annuity: 'Annuity',
  investment: 'Investment / Brokerage Account',
  prepaid_funeral: 'Prepaid Funeral',
  personal_property: 'Personal Property',
  other: 'Other',
};

export const FLORIDA_COUNTIES = [
  'Alachua', 'Baker', 'Bay', 'Bradford', 'Brevard', 'Broward',
  'Calhoun', 'Charlotte', 'Citrus', 'Clay', 'Collier', 'Columbia',
  'DeSoto', 'Dixie', 'Duval', 'Escambia', 'Flagler', 'Franklin',
  'Gadsden', 'Gilchrist', 'Glades', 'Gulf', 'Hamilton', 'Hardee',
  'Hendry', 'Hernando', 'Highlands', 'Hillsborough', 'Holmes',
  'Indian River', 'Jackson', 'Jefferson', 'Lafayette', 'Lake',
  'Lee', 'Leon', 'Levy', 'Liberty', 'Madison', 'Manatee',
  'Marion', 'Martin', 'Miami-Dade', 'Monroe', 'Nassau', 'Okaloosa',
  'Okeechobee', 'Orange', 'Osceola', 'Palm Beach', 'Pasco',
  'Pinellas', 'Polk', 'Putnam', 'St. Johns', 'St. Lucie',
  'Santa Rosa', 'Sarasota', 'Seminole', 'Sumter', 'Suwannee',
  'Taylor', 'Union', 'Volusia', 'Wakulla', 'Walton', 'Washington'
];

ENDOFFILE

echo "→ src/lib/validations/referral.schema.ts"
cat > "src/lib/validations/referral.schema.ts" << 'ENDOFFILE'
// src/lib/validations/referral.schema.ts
// Zod schemas for each form step — used with React Hook Form

import { z } from 'zod';

// ============================================================
// STEP 1 — Referral Source
// ============================================================
export const step1Schema = z.object({
  facility_id: z.string().optional(),
  facility_name_freetext: z.string().optional(),
  urgency: z.enum(['routine', 'urgent', 'emergency']),
}).refine(
  data => data.facility_id || data.facility_name_freetext,
  { message: 'Please select a facility or enter the facility name', path: ['facility_name_freetext'] }
);

// ============================================================
// STEP 2 — Case Type
// ============================================================
export const step2Schema = z.object({
  referral_type: z.enum(['guardianship', 'medicaid', 'both'], {
    required_error: 'Please select a referral type',
  }),
});

// ============================================================
// STEP 3 — Client Identity
// ============================================================
export const step3Schema = z.object({
  client_first_name: z.string().min(1, 'First name is required'),
  client_last_name: z.string().min(1, 'Last name is required'),
  client_full_legal_name: z.string().optional(),
  client_dob: z.string().min(1, 'Date of birth is required'),
  client_sex: z.enum(['male', 'female', 'other', 'unknown']),
  client_ssn_last4: z.string().regex(/^\d{4}$/, 'Enter last 4 digits only').optional().or(z.literal('')),
  client_language: z.string().optional(),
  client_county: z.string().optional(),
  client_phone: z.string().optional(),
  client_email: z.string().email('Invalid email').optional().or(z.literal('')),
  client_home_address: z.string().optional(),
  client_home_city: z.string().optional(),
  client_home_state: z.string().optional(),
  client_home_zip: z.string().optional(),
  client_current_address: z.string().optional(),
  client_current_city: z.string().optional(),
  client_current_state: z.string().optional(),
  client_current_zip: z.string().optional(),
  admission_date: z.string().optional(),
  amount_owed_facility: z.number().min(0).optional().nullable(),
  facility_monthly_cost: z.number().min(0).optional().nullable(),
});

// ============================================================
// STEP 4 — Medical & Capacity
// ============================================================
export const step4Schema = z.object({
  capacity_level: z.enum(['no_capacity', 'limited_capacity', 'substance_abuse', 'has_capacity'], {
    required_error: 'Please select a capacity level',
  }),
  bims_score: z.number().min(0).max(15).optional().nullable(),
  diagnoses: z.string().optional(),
  medications: z.string().optional(),
  mental_health_history: z.string().optional(),
  dnr: z.boolean().optional(),
  physician_name: z.string().optional(),
  physician_address: z.string().optional(),
  physician_phone: z.string().optional(),
});

// ============================================================
// STEP 5 — Financial
// ============================================================
const assetSchema = z.object({
  id: z.string().optional(),
  asset_type: z.enum([
    'checking', 'savings', 'cd', 'money_market',
    'real_estate_primary', 'real_estate_other', 'vehicle',
    'retirement_ira', 'retirement_401k', 'life_insurance',
    'annuity', 'investment', 'prepaid_funeral', 'personal_property', 'other'
  ]),
  institution: z.string().optional(),
  description: z.string().optional(),
  account_last4: z.string().regex(/^\d{4}$/).optional().or(z.literal('')),
  approximate_value: z.number().min(0).optional().nullable(),
  is_exempt: z.boolean().optional(),
  notes: z.string().optional(),
});

export const step5Schema = z.object({
  monthly_income: z.number().min(0).optional().nullable(),
  income_sources: z.string().optional(),
  medical_insurance_cost: z.number().min(0).optional().nullable(),
  medicaid_status: z.enum(['yes', 'no', 'applied']).optional(),
  rep_payee_status: z.enum(['yes', 'no', 'applied']).optional(),
  va_benefits: z.boolean().optional(),
  va_benefit_details: z.string().optional(),
  assets: z.array(assetSchema).optional(),
});

// ============================================================
// STEP 6 — Family & Contacts
// ============================================================
const familyMemberSchema = z.object({
  id: z.string().optional(),
  relationship: z.enum(['child', 'sibling', 'parent', 'other_nok', 'spouse']),
  full_name: z.string().min(1, 'Name is required'),
  dob: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  notes: z.string().optional(),
});

export const step6Schema = z.object({
  is_married: z.boolean().optional(),
  spouse_name: z.string().optional(),
  spouse_dob: z.string().optional(),
  spouse_ssn_last4: z.string().regex(/^\d{4}$/).optional().or(z.literal('')),
  spouse_address: z.string().optional(),
  spouse_phone: z.string().optional(),
  family_members: z.array(familyMemberSchema).optional(),
});

// ============================================================
// STEP 7 — Legal Documents
// ============================================================
export const step7Schema = z.object({
  has_poa: z.boolean().optional(),
  poa_agent_name: z.string().optional(),
  has_hc_surrogate: z.boolean().optional(),
  hc_surrogate_name: z.string().optional(),
  has_living_will: z.boolean().optional(),
  has_trust: z.boolean().optional(),
  trust_type: z.string().optional(),
  has_prior_guardianship: z.boolean().optional(),
  prior_guardianship_details: z.string().optional(),
  existing_guardian_name: z.string().optional(),
  disability_benefits: z.boolean().optional(),
  veteran_services: z.boolean().optional(),
  other_services: z.string().optional(),
  legal_rep_name: z.string().optional(),
  legal_rep_contact: z.string().optional(),
  special_needs: z.string().optional(),
});

// ============================================================
// STEP 8 — Documents & Notes
// ============================================================
export const step8Schema = z.object({
  notes: z.string().optional(),
});

// ============================================================
// EXPORT MAP (step number → schema)
// ============================================================
export const stepSchemas = {
  1: step1Schema,
  2: step2Schema,
  3: step3Schema,
  4: step4Schema,
  5: step5Schema,
  6: step6Schema,
  7: step7Schema,
  8: step8Schema,
} as const;

export type Step1FormData = z.infer<typeof step1Schema>;
export type Step2FormData = z.infer<typeof step2Schema>;
export type Step3FormData = z.infer<typeof step3Schema>;
export type Step4FormData = z.infer<typeof step4Schema>;
export type Step5FormData = z.infer<typeof step5Schema>;
export type Step6FormData = z.infer<typeof step6Schema>;
export type Step7FormData = z.infer<typeof step7Schema>;
export type Step8FormData = z.infer<typeof step8Schema>;

ENDOFFILE

echo "→ src/hooks/use-toast.ts"
cat > "src/hooks/use-toast.ts" << 'ENDOFFILE'
// src/hooks/use-toast.ts
// This is a re-export of the shadcn/ui toast hook.
// After running: npx shadcn@latest add toast
// The actual implementation will be in src/components/ui/use-toast.ts
// This file just provides a clean import path.

export { useToast, toast } from '@/components/ui/use-toast'

ENDOFFILE

echo ""
echo "============================================================"
echo "  ✓ All files installed!"
echo "============================================================"
echo ""
echo "Now run:"
echo ""
echo "  npx shadcn@latest init"
echo "  npx shadcn@latest add button input label select checkbox radio-group card form textarea badge separator progress switch dialog alert-dialog toast tabs dropdown-menu"
echo "  npm install @supabase/supabase-js @supabase/ssr react-hook-form @hookform/resolvers zod date-fns"
echo "  cp .env.local.example .env.local   # then fill in your Supabase keys"
echo "  npm run dev"
echo ""
