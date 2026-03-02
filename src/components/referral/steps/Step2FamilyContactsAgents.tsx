'use client';

// src/components/referral/steps/Step2FamilyContactsAgents.tsx
// Combined step: Family Members + Legal Documents + Benefits + Legal Rep

import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step2Schema, Step2FormData } from '@/lib/validations/referral.schema';
import { Referral, ReferralType, AutoSaveProps } from '@/lib/types/referral.types';
import { useAutoSave } from '@/hooks/use-auto-save';
import { StepNavigation, StepNavProps } from '../StepNavigation';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Users, PlusCircle, Trash2, Shield, Scale, HeartPulse } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step2Props {
  defaultValues: Partial<Referral>;
  referralType?: ReferralType;
  referralId?: string;
  onComplete: (data: Partial<Referral>) => Promise<void>;
  navProps: StepNavProps;
  autoSave: AutoSaveProps;
}

const RELATIONSHIP_LABELS = {
  child: 'Child',
  sibling: 'Sibling',
  parent: 'Parent',
  other_nok: 'Other Next of Kin',
  spouse: 'Spouse (if not listed above)',
};

function SectionHeader({ icon: Icon, title }: { icon: React.ComponentType<{className?: string}>; title: string }) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <Icon className="w-4 h-4 text-primary" />
      <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">{title}</h3>
      <Separator className="flex-1" />
    </div>
  );
}

// Yes/No radio with conditional detail fields (name, date executed, contact)
function LegalDocField({
  form,
  boolField,
  label,
  nameField,
  nameLabel,
  namePlaceholder,
  dateField,
  contactField,
}: {
  form: ReturnType<typeof useForm<Step2FormData>>;
  boolField: keyof Step2FormData;
  label: string;
  nameField: keyof Step2FormData;
  nameLabel: string;
  namePlaceholder: string;
  dateField: keyof Step2FormData;
  contactField: keyof Step2FormData;
}) {
  const value = form.watch(boolField);
  const isYes = value === true;

  return (
    <div className="space-y-3">
      <FormField
        control={form.control}
        name={boolField}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-medium">{label}</FormLabel>
            <FormControl>
              <RadioGroup
                className="flex gap-4 mt-1"
                value={field.value === true ? 'yes' : field.value === false ? 'no' : ''}
                onValueChange={(v) => field.onChange(v === 'yes')}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id={`${String(boolField)}-yes`} />
                  <Label htmlFor={`${String(boolField)}-yes`} className="cursor-pointer font-normal">Yes</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id={`${String(boolField)}-no`} />
                  <Label htmlFor={`${String(boolField)}-no`} className="cursor-pointer font-normal">No</Label>
                </div>
              </RadioGroup>
            </FormControl>
          </FormItem>
        )}
      />
      {isYes && (
        <div className="space-y-3 pl-4 border-l-2 border-primary/20">
          <FormField
            control={form.control}
            name={nameField}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">{nameLabel}</FormLabel>
                <FormControl>
                  <Input placeholder={namePlaceholder} {...field} value={field.value as string || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={dateField}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Date Executed</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., January 2020" {...field} value={field.value as string || ''} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={contactField}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Contact Information</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Phone, email, or address"
                    rows={2}
                    {...field}
                    value={field.value as string || ''}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
}

export function Step2FamilyContactsAgents({
  defaultValues,
  referralType,
  referralId,
  onComplete,
  navProps,
  autoSave,
}: Step2Props) {
  const form = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      family_members: (defaultValues as any).family_members || [],
      has_poa: defaultValues.has_poa,
      poa_agent_name: defaultValues.poa_agent_name || '',
      poa_date_executed: defaultValues.poa_date_executed || '',
      poa_contact: defaultValues.poa_contact || '',
      has_hc_surrogate: defaultValues.has_hc_surrogate,
      hc_surrogate_name: defaultValues.hc_surrogate_name || '',
      hc_surrogate_date_executed: defaultValues.hc_surrogate_date_executed || '',
      hc_surrogate_contact: defaultValues.hc_surrogate_contact || '',
      has_living_will: defaultValues.has_living_will,
      living_will_agent_name: defaultValues.living_will_agent_name || '',
      living_will_date_executed: defaultValues.living_will_date_executed || '',
      living_will_contact: defaultValues.living_will_contact || '',
      has_trust: defaultValues.has_trust,
      trust_type: defaultValues.trust_type || '',
      trust_trustee_name: defaultValues.trust_trustee_name || '',
      trust_date_executed: defaultValues.trust_date_executed || '',
      trust_contact: defaultValues.trust_contact || '',
      has_prior_guardianship: defaultValues.has_prior_guardianship,
      prior_guardianship_details: defaultValues.prior_guardianship_details || '',
      existing_guardian_name: defaultValues.existing_guardian_name || '',
      guardianship_date_executed: defaultValues.guardianship_date_executed || '',
      guardianship_contact: defaultValues.guardianship_contact || '',
      disability_benefits: defaultValues.disability_benefits || false,
      veteran_services: defaultValues.veteran_services || false,
      other_services: defaultValues.other_services || '',
      legal_rep_name: defaultValues.legal_rep_name || '',
      legal_rep_contact: defaultValues.legal_rep_contact || '',
      special_needs: defaultValues.special_needs || '',
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

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'family_members',
  });

  const handleNext = form.handleSubmit(async (data) => {
    await onComplete(data as Partial<Referral>);
  });

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
    } as any);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <CardTitle>Family - Agents</CardTitle>
        </div>
        <CardDescription>
          Family members, legal documents, and support services.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <div className="space-y-6">

            {/* ── Family Members ── */}
            <div className="flex items-center justify-between">
              <SectionHeader icon={Users} title="Children & Next of Kin" />
              <span className="text-xs text-muted-foreground">{fields.length} added</span>
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
                                <SelectItem key={value} value={value} className="text-sm">{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} className="text-destructive h-7 px-2">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={form.control} name={`family_members.${index}.full_name`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Full Name *</FormLabel>
                          <FormControl><Input className="h-8 text-sm" {...f} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField control={form.control} name={`family_members.${index}.dob`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Date of Birth</FormLabel>
                          <FormControl><Input type="date" className="h-8 text-sm" {...f} /></FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={form.control} name={`family_members.${index}.phone`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Phone</FormLabel>
                          <FormControl><Input type="tel" className="h-8 text-sm" {...f} /></FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField control={form.control} name={`family_members.${index}.email`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Email</FormLabel>
                          <FormControl><Input type="email" className="h-8 text-sm" {...f} /></FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField control={form.control} name={`family_members.${index}.address`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Address</FormLabel>
                        <FormControl><Input className="h-8 text-sm" placeholder="Street, City, State ZIP" {...f} /></FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>

            <Button type="button" variant="outline" onClick={addMember} className="w-full">
              <PlusCircle className="w-4 h-4 mr-2" /> Add Family Member
            </Button>

            {/* ── Legal Documents ── */}
            <SectionHeader icon={Shield} title="Financial & Health Documents" />

            <div className="space-y-5">
              <LegalDocField
                form={form}
                boolField="has_poa"
                label="Financial Power of Attorney"
                nameField="poa_agent_name"
                nameLabel="Agent Name"
                namePlaceholder="Name of POA agent"
                dateField="poa_date_executed"
                contactField="poa_contact"
              />
              <LegalDocField
                form={form}
                boolField="has_hc_surrogate"
                label="Health Care Surrogate / Health Care Proxy"
                nameField="hc_surrogate_name"
                nameLabel="Surrogate Name"
                namePlaceholder="Name of health care surrogate"
                dateField="hc_surrogate_date_executed"
                contactField="hc_surrogate_contact"
              />
              <LegalDocField
                form={form}
                boolField="has_living_will"
                label="Living Will / Advance Directive"
                nameField="living_will_agent_name"
                nameLabel="Agent / Designee Name"
                namePlaceholder="Name of designated agent"
                dateField="living_will_date_executed"
                contactField="living_will_contact"
              />
              <LegalDocField
                form={form}
                boolField="has_trust"
                label="Qualified Income Trust"
                nameField="trust_trustee_name"
                nameLabel="Qualified Income Trustee Name"
                namePlaceholder="Name of trustee"
                dateField="trust_date_executed"
                contactField="trust_contact"
              />
            </div>

            {/* Guardianship History */}
            {(referralType === 'guardianship' || referralType === 'both' || !referralType) && (
              <>
                <SectionHeader icon={Scale} title="Guardianship History" />
                <div className="space-y-5">
                  <LegalDocField
                    form={form}
                    boolField="has_prior_guardianship"
                    label="Prior or existing guardianship proceedings?"
                    nameField="existing_guardian_name"
                    nameLabel="Guardian Name"
                    namePlaceholder="Name of currently appointed guardian"
                    dateField="guardianship_date_executed"
                    contactField="guardianship_contact"
                  />
                  {form.watch('has_prior_guardianship') && (
                    <div className="pl-4 border-l-2 border-primary/20">
                      <FormField control={form.control} name="prior_guardianship_details"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">Additional Details</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Describe prior proceedings, court, case number if known" rows={3} {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Benefits & Support */}
            <SectionHeader icon={HeartPulse} title="Benefits & Support Services" />

            <div className="space-y-3">
              {(['disability_benefits', 'veteran_services'] as const).map(fieldName => (
                <FormField
                  key={fieldName}
                  control={form.control}
                  name={fieldName}
                  render={({ field: f }) => (
                    <FormItem>
                      <div className="flex items-center justify-between p-3 rounded-lg border border-input">
                        <FormLabel className="cursor-pointer font-medium mb-0">
                          {fieldName === 'disability_benefits' ? 'Supplemental Security Income (SSA)' : 'Veterans Benefits / Services'}
                        </FormLabel>
                        <FormControl>
                          <Switch checked={!!f.value} onCheckedChange={f.onChange} />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />
              ))}
              <FormField control={form.control} name="other_services"
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


            {/* Special Needs */}
            <FormField control={form.control} name="special_needs"
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
        saveStatus={saveStatus}
      />
    </Card>
  );
}
