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

