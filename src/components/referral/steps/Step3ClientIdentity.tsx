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

