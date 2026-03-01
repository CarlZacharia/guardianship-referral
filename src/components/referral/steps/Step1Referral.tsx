'use client';

// src/components/referral/steps/Step1Referral.tsx
// Combined step: Referral Source + Case Type + Client Identity + Marital Status

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step1Schema, Step1FormData } from '@/lib/validations/referral.schema';
import { Referral, Facility, FLORIDA_COUNTIES, AutoSaveProps } from '@/lib/types/referral.types';
import { useAutoSave } from '@/hooks/use-auto-save';
import { createClient } from '@/lib/supabase/client';
import { StepNavigation, StepNavProps } from '../StepNavigation';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Building2, UserCircle, MapPin, DollarSign, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step1Props {
  defaultValues: Partial<Referral>;
  onComplete: (data: Partial<Referral>, advance?: boolean) => Promise<void>;
  navProps: StepNavProps;
  autoSave: AutoSaveProps;
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

function calculateAge(dob: string): number | undefined {
  if (!dob) return undefined;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age >= 0 ? age : undefined;
}

export function Step1Referral({ defaultValues, onComplete, navProps, autoSave }: Step1Props) {
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
      referral_type: defaultValues.referral_type || undefined,
      reason_for_request: defaultValues.reason_for_request || '',
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
      is_married: defaultValues.is_married || false,
      spouse_name: defaultValues.spouse_name || '',
      spouse_dob: defaultValues.spouse_dob || '',
      spouse_ssn_last4: defaultValues.spouse_ssn_last4 || '',
      spouse_email: defaultValues.spouse_email || '',
      spouse_address: defaultValues.spouse_address || '',
      spouse_phone: defaultValues.spouse_phone || '',
    },
  });

  const { saveStatus, flushSave } = useAutoSave({
    form,
    stepNumber: autoSave.stepNumber,
    saveStepData: autoSave.save,
  });

  useEffect(() => {
    autoSave.registerFlush(flushSave);
    return () => autoSave.registerFlush(null);
  }, [autoSave, flushSave]);

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

  const dobValue = form.watch('client_dob');
  const calculatedAge = calculateAge(dobValue);
  const isMarried = form.watch('is_married');

  const handleNext = form.handleSubmit(async (data) => {
    await onComplete({
      ...data,
      facility_id: data.facility_id || undefined,
      facility_name_freetext: data.facility_name_freetext || undefined,
      client_age: calculateAge(data.client_dob),
      client_full_legal_name: data.client_full_legal_name ||
        `${data.client_first_name} ${data.client_last_name}`.trim(),
    } as Partial<Referral>);
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          <CardTitle>Referral</CardTitle>
        </div>
        <CardDescription>
          Referral source, case type, and client information.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <div className="space-y-6">

            {/* ── Referral Source ── */}
            <SectionHeader icon={Building2} title="Referral Source" />

            <div className="space-y-3">
              <Label className="text-sm font-medium">Referring Facility</Label>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingFacilities}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={loadingFacilities ? 'Loading facilities...' : 'Select facility...'} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {facilities.map(f => (
                            <SelectItem key={f.id} value={f.id}>
                              <div>
                                <div className="font-medium">{f.name}</div>
                                {f.city && <div className="text-xs text-muted-foreground">{f.city}</div>}
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
                        <Input placeholder="Enter facility name" {...field} />
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

            {/* Urgency */}
            <FormField
              control={form.control}
              name="urgency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Urgency Level</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-4 mt-1"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="routine" id="urgency-routine" />
                        <Label htmlFor="urgency-routine" className="cursor-pointer font-normal">Routine</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="urgent" id="urgency-urgent" />
                        <Label htmlFor="urgency-urgent" className="cursor-pointer font-normal">Urgent</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="emergency" id="urgency-emergency" />
                        <Label htmlFor="urgency-emergency" className="cursor-pointer font-normal">Emergency</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Case Type */}
            <FormField
              control={form.control}
              name="referral_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Case Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-4 mt-1"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="guardianship" id="type-guardianship" />
                        <Label htmlFor="type-guardianship" className="cursor-pointer font-normal">Guardianship</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="medicaid" id="type-medicaid" />
                        <Label htmlFor="type-medicaid" className="cursor-pointer font-normal">Medicaid</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="both" id="type-both" />
                        <Label htmlFor="type-both" className="cursor-pointer font-normal">Both</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Reason for Request */}
            <FormField
              control={form.control}
              name="reason_for_request"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Request</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the reason for this referral request..."
                      className="min-h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ── Client Identity ── */}
            <SectionHeader icon={UserCircle} title="Client Information" />

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
                  <FormItem>
                    <FormLabel>Date of Birth <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
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
                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
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
                    <FormControl><Input placeholder="XXXX" maxLength={4} {...field} /></FormControl>
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
                        <SelectTrigger><SelectValue placeholder="Select county..." /></SelectTrigger>
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

            {/* ── Marital Status (moved from Step 6) ── */}
            <div className="flex items-center gap-2 pt-1">
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
                    <FormLabel className="cursor-pointer mb-0 font-medium">Currently Married</FormLabel>
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
                  <FormField control={form.control} name="spouse_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Spouse Full Name</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="spouse_dob"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Spouse Date of Birth</FormLabel>
                        <FormControl><Input type="date" {...field} /></FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <FormField control={form.control} name="spouse_ssn_last4"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SSN (Last 4)</FormLabel>
                        <FormControl><Input maxLength={4} placeholder="XXXX" {...field} /></FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="spouse_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Spouse Phone</FormLabel>
                        <FormControl><Input type="tel" {...field} /></FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="spouse_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Spouse Email</FormLabel>
                        <FormControl><Input type="email" placeholder="email@example.com" {...field} /></FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField control={form.control} name="spouse_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Spouse Address</FormLabel>
                      <FormControl><Input placeholder="If different from client" {...field} /></FormControl>
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* ── Addresses ── */}
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

            {/* ── Facility Account ── */}
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
                        type="number" min="0" step="0.01" placeholder="0.00"
                        value={field.value ?? ''}
                        onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        onBlur={field.onBlur} name={field.name} ref={field.ref}
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
                        type="number" min="0" step="0.01" placeholder="0.00"
                        value={field.value ?? ''}
                        onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        onBlur={field.onBlur} name={field.name} ref={field.ref}
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
        currentStepData={form.getValues() as unknown as Partial<Referral>}
        saveStatus={saveStatus}
      />
    </Card>
  );
}
