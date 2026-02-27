'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Profile, REFERRER_TYPE_LABELS, ReferrerType } from '@/lib/types/referral.types'
import { updateReferrer } from '@/app/actions/referrer-admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { useForm } from 'react-hook-form'
import {
  ArrowLeft, UserCircle, Building2, MapPin, Receipt, CreditCard, Phone, Loader2, Save,
} from 'lucide-react'

interface ReferrerDetailProps {
  profile: Profile
}

function SectionHeader({ icon: Icon, title }: { icon: React.ComponentType<{ className?: string }>; title: string }) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <Icon className="w-4 h-4 text-primary" />
      <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">{title}</h3>
      <Separator className="flex-1" />
    </div>
  )
}

const REFERRER_TYPE_OPTIONS = Object.entries(REFERRER_TYPE_LABELS) as [ReferrerType, string][]

interface FormValues {
  first_name: string
  last_name: string
  organization: string
  phone: string
  referrer_type: string
  is_active: boolean
  mailing_street: string
  mailing_city: string
  mailing_state: string
  mailing_zip: string
  billing_street: string
  billing_city: string
  billing_state: string
  billing_zip: string
  primary_contact_name: string
  primary_contact_phone: string
  primary_contact_email: string
  billing_contact_name: string
  billing_contact_phone: string
  billing_contact_email: string
}

export function ReferrerDetail({ profile }: ReferrerDetailProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)

  const form = useForm<FormValues>({
    defaultValues: {
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      organization: profile.organization || '',
      phone: profile.phone || '',
      referrer_type: profile.referrer_type || '',
      is_active: profile.is_active ?? true,
      mailing_street: profile.mailing_street || '',
      mailing_city: profile.mailing_city || '',
      mailing_state: profile.mailing_state || 'FL',
      mailing_zip: profile.mailing_zip || '',
      billing_street: profile.billing_street || '',
      billing_city: profile.billing_city || '',
      billing_state: profile.billing_state || 'FL',
      billing_zip: profile.billing_zip || '',
      primary_contact_name: profile.primary_contact_name || '',
      primary_contact_phone: profile.primary_contact_phone || '',
      primary_contact_email: profile.primary_contact_email || '',
      billing_contact_name: profile.billing_contact_name || '',
      billing_contact_phone: profile.billing_contact_phone || '',
      billing_contact_email: profile.billing_contact_email || '',
    },
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    setSaving(true)

    const result = await updateReferrer(profile.id, {
      first_name: data.first_name,
      last_name: data.last_name,
      organization: data.organization || undefined,
      phone: data.phone || undefined,
      referrer_type: data.referrer_type || undefined,
      is_active: data.is_active,
      mailing_street: data.mailing_street || undefined,
      mailing_city: data.mailing_city || undefined,
      mailing_state: data.mailing_state || undefined,
      mailing_zip: data.mailing_zip || undefined,
      billing_street: data.billing_street || undefined,
      billing_city: data.billing_city || undefined,
      billing_state: data.billing_state || undefined,
      billing_zip: data.billing_zip || undefined,
      primary_contact_name: data.primary_contact_name || undefined,
      primary_contact_phone: data.primary_contact_phone || undefined,
      primary_contact_email: data.primary_contact_email || undefined,
      billing_contact_name: data.billing_contact_name || undefined,
      billing_contact_phone: data.billing_contact_phone || undefined,
      billing_contact_email: data.billing_contact_email || undefined,
    })

    if (result.error) {
      toast({ title: 'Error saving', description: result.error, variant: 'destructive' })
    } else {
      toast({ title: 'Referrer updated' })
      router.refresh()
    }
    setSaving(false)
  })

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/staff/referrers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">
              {profile.first_name} {profile.last_name}
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {profile.email}
              {profile.onboarding_completed ? (
                <Badge variant="default" className="text-xs">Onboarded</Badge>
              ) : (
                <Badge variant="outline" className="text-xs">Pending Onboarding</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Edit Referrer Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ── Account Info ── */}
              <SectionHeader icon={UserCircle} title="Account Information" />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="organization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization / Facility</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl><Input type="tel" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="referrer_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Referrer Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {REFERRER_TYPE_OPTIONS.map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Active</FormLabel>
                      <div className="flex items-center gap-2 pt-2">
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <span className="text-sm text-muted-foreground">
                          {field.value ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* ── Mailing Address ── */}
              <SectionHeader icon={MapPin} title="Mailing Address" />
              <FormField
                control={form.control}
                name="mailing_street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="mailing_city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mailing_state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl><Input maxLength={2} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mailing_zip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP</FormLabel>
                      <FormControl><Input maxLength={10} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* ── Billing Address ── */}
              <SectionHeader icon={Receipt} title="Billing Address" />
              <FormField
                control={form.control}
                name="billing_street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="billing_city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="billing_state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl><Input maxLength={2} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="billing_zip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP</FormLabel>
                      <FormControl><Input maxLength={10} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* ── Primary Contact ── */}
              <SectionHeader icon={Phone} title="Primary Contact — Referral Information" />
              <FormField
                control={form.control}
                name="primary_contact_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="primary_contact_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telephone</FormLabel>
                      <FormControl><Input type="tel" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="primary_contact_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input type="email" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* ── Billing Contact ── */}
              <SectionHeader icon={CreditCard} title="Billing Contact" />
              <FormField
                control={form.control}
                name="billing_contact_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="billing_contact_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telephone</FormLabel>
                      <FormControl><Input type="tel" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="billing_contact_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input type="email" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* ── Save ── */}
              <Separator />
              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                  ) : (
                    <><Save className="w-4 h-4 mr-2" /> Save Changes</>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  )
}
