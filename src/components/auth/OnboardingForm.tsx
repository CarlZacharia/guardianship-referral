'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { onboardingSchema, OnboardingFormData } from '@/lib/validations/onboarding.schema';
import { Profile, REFERRER_TYPE_LABELS, ReferrerType } from '@/lib/types/referral.types';
import { completeOnboarding } from '@/app/actions/complete-onboarding';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  ClipboardList, Building2, MapPin, Receipt, UserCircle, CreditCard, DollarSign, Loader2, Info,
} from 'lucide-react';

interface OnboardingFormProps {
  profile: Profile;
  userId: string;
}

function SectionHeader({ icon: Icon, title }: { icon: React.ComponentType<{ className?: string }>; title: string }) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <Icon className="w-4 h-4 text-primary" />
      <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">{title}</h3>
      <Separator className="flex-1" />
    </div>
  );
}

const REFERRER_TYPE_OPTIONS = Object.entries(REFERRER_TYPE_LABELS) as [ReferrerType, string][];

export function OnboardingForm({ profile, userId }: OnboardingFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      referrer_type: profile.referrer_type || undefined,
      mailing_street: '',
      mailing_city: '',
      mailing_state: 'FL',
      mailing_zip: '',
      billing_same_as_mailing: false,
      billing_street: '',
      billing_city: '',
      billing_state: 'FL',
      billing_zip: '',
      primary_contact_name: '',
      primary_contact_phone: '',
      primary_contact_email: profile.email || '',
      billing_contact_name: '',
      billing_contact_phone: '',
      billing_contact_email: '',
    },
  });

  const billingSameAsMailing = form.watch('billing_same_as_mailing');

  const handleSubmit = form.handleSubmit(async (data) => {
    setLoading(true);
    setError('');

    // If billing same as mailing, copy values
    const billingStreet = data.billing_same_as_mailing ? data.mailing_street : data.billing_street!;
    const billingCity = data.billing_same_as_mailing ? data.mailing_city : data.billing_city!;
    const billingState = data.billing_same_as_mailing ? data.mailing_state : data.billing_state!;
    const billingZip = data.billing_same_as_mailing ? data.mailing_zip : data.billing_zip!;

    const result = await completeOnboarding(userId, {
      referrer_type: data.referrer_type,
      mailing_street: data.mailing_street,
      mailing_city: data.mailing_city,
      mailing_state: data.mailing_state,
      mailing_zip: data.mailing_zip,
      billing_street: billingStreet,
      billing_city: billingCity,
      billing_state: billingState,
      billing_zip: billingZip,
      primary_contact_name: data.primary_contact_name,
      primary_contact_phone: data.primary_contact_phone,
      primary_contact_email: data.primary_contact_email,
      billing_contact_name: data.billing_contact_name,
      billing_contact_phone: data.billing_contact_phone,
      billing_contact_email: data.billing_contact_email,
    });

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    toast({ title: 'Profile completed', description: 'Your account setup is complete.' });
    router.push('/dashboard');
    router.refresh();
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-primary" />
          <CardTitle>Complete Your Profile</CardTitle>
        </div>
        <CardDescription>
          Before you can submit referrals, we need a few more details about your organization,
          addresses, and contact information.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* ── Section 1: Organization Type ── */}
            <SectionHeader icon={Building2} title="Organization Type" />
            <FormField
              control={form.control}
              name="referrer_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type of Facility / Referrer *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your type..." />
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

            {/* ── Section 2: Mailing Address ── */}
            <SectionHeader icon={MapPin} title="Mailing Address" />
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="mailing_street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address *</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St, Suite 100" {...field} />
                    </FormControl>
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
                      <FormLabel>City *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mailing_state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State *</FormLabel>
                      <FormControl>
                        <Input maxLength={2} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mailing_zip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP *</FormLabel>
                      <FormControl>
                        <Input maxLength={10} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* ── Section 3: Billing Address ── */}
            <SectionHeader icon={Receipt} title="Billing Address" />
            <FormField
              control={form.control}
              name="billing_same_as_mailing"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">Same as mailing address</FormLabel>
                </FormItem>
              )}
            />

            {!billingSameAsMailing && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="billing_street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address *</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St, Suite 100" {...field} />
                      </FormControl>
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
                        <FormLabel>City *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="billing_state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State *</FormLabel>
                        <FormControl>
                          <Input maxLength={2} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="billing_zip"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP *</FormLabel>
                        <FormControl>
                          <Input maxLength={10} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* ── Section 4: Primary Contact ── */}
            <SectionHeader icon={UserCircle} title="Primary Contact — Referral Information" />
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="primary_contact_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Smith" {...field} />
                    </FormControl>
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
                      <FormLabel>Telephone *</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="(239) 555-0100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="primary_contact_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="jane@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* ── Section 5: Billing Contact ── */}
            <SectionHeader icon={CreditCard} title="Billing Contact" />
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="billing_contact_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
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
                      <FormLabel>Telephone *</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="(239) 555-0100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="billing_contact_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="billing@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* ── Section 6: Fee Schedule ── */}
            <SectionHeader icon={DollarSign} title="Fee Schedule" />
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="text-sm text-muted-foreground space-y-2">
                  <p className="font-medium text-foreground">Fee information will be provided here.</p>
                  <p>
                    Our fee schedule for guardianship and Medicaid referrals will be displayed
                    in this section. For questions about fees, please contact our office at{' '}
                    <a href="tel:2393454545" className="text-primary hover:underline">239.345.4545</a>.
                  </p>
                </div>
              </div>
            </div>

            {/* ── Submit ── */}
            <Separator />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Complete Setup
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
