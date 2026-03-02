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
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { createProfile } from '@/app/actions/create-profile'

const REFERRER_TYPES = [
  { value: 'nursing_home', label: 'Nursing Home / SNF' },
  { value: 'alf', label: 'Assisted Living Facility' },
  { value: 'hospital', label: 'Hospital / Health System' },
  { value: 'home_health', label: 'Home Health Agency' },
  { value: 'attorney', label: 'Attorney / Law Firm' },
  { value: 'social_worker', label: 'Social Worker / Case Manager' },
  { value: 'family', label: 'Family Member / Self-Referral' },
  { value: 'other', label: 'Other' },
]

const FACILITY_TYPES = ['nursing_home', 'alf', 'hospital', 'home_health']

export function RegisterForm() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [form, setForm] = useState({
    referrer_type: '',
    organization: '',
    first_name: '',
    last_name: '',
    title: '',
    mailing_street: '',
    mailing_city: '',
    mailing_state: '',
    mailing_zip: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
  })

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const isFacilityType = FACILITY_TYPES.includes(form.referrer_type)
  const typeSelected = form.referrer_type !== ''

  const allFieldsFilled =
    typeSelected &&
    form.first_name.trim() !== '' &&
    form.last_name.trim() !== '' &&
    form.title.trim() !== '' &&
    form.mailing_street.trim() !== '' &&
    form.mailing_city.trim() !== '' &&
    form.mailing_state.trim() !== '' &&
    form.mailing_zip.trim() !== '' &&
    form.email.trim() !== '' &&
    form.phone.trim() !== '' &&
    form.password.length >= 8 &&
    form.confirm_password !== '' &&
    (!isFacilityType || form.organization.trim() !== '')

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

    // Create profile record via server action (uses service role to bypass RLS)
    if (data.user) {
      const result = await createProfile({
        id: data.user.id,
        email: form.email,
        first_name: form.first_name,
        last_name: form.last_name,
        title: form.title || undefined,
        organization: isFacilityType ? form.organization : undefined,
        phone: form.phone,
        mailing_street: form.mailing_street || undefined,
        mailing_city: form.mailing_city || undefined,
        mailing_state: form.mailing_state || undefined,
        mailing_zip: form.mailing_zip || undefined,
        role: 'referrer',
        referrer_type: form.referrer_type || undefined,
      })

      if (result.error) {
        setError(result.error)
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

          {/* Referrer Type — always visible, first field */}
          <div className="space-y-2">
            <Label>Referrer Type *</Label>
            <Select onValueChange={v => setForm(prev => ({ ...prev, referrer_type: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select your referrer type..." />
              </SelectTrigger>
              <SelectContent>
                {REFERRER_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Remaining fields — only shown after referrer type is selected */}
          {typeSelected && (
            <>
              {/* Organization / Facility — only for facility types */}
              {isFacilityType && (
                <div className="space-y-2">
                  <Label htmlFor="organization">Organization / Facility *</Label>
                  <Input
                    id="organization"
                    value={form.organization}
                    onChange={set('organization')}
                    placeholder="e.g., General Hospital"
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input id="first_name" value={form.first_name} onChange={set('first_name')} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input id="last_name" value={form.last_name} onChange={set('last_name')} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" value={form.title} onChange={set('title')} placeholder="e.g., Social Worker" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mailing_street">Street Address *</Label>
                <Input id="mailing_street" value={form.mailing_street} onChange={set('mailing_street')} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mailing_city">City *</Label>
                <Input id="mailing_city" value={form.mailing_city} onChange={set('mailing_city')} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mailing_state">State *</Label>
                <Input id="mailing_state" value={form.mailing_state} onChange={set('mailing_state')} placeholder="FL" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mailing_zip">ZIP *</Label>
                <Input id="mailing_zip" value={form.mailing_zip} onChange={set('mailing_zip')} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input id="email" type="email" value={form.email} onChange={set('email')} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telephone *</Label>
                <Input id="phone" type="tel" value={form.phone} onChange={set('phone')} required />
              </div>

              <Separator />

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={set('password')}
                    required
                    minLength={8}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(prev => !prev)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm Password *</Label>
                <div className="relative">
                  <Input
                    id="confirm_password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={form.confirm_password}
                    onChange={set('confirm_password')}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(prev => !prev)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading || !allFieldsFilled}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Account
              </Button>
            </>
          )}

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
