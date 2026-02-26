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

