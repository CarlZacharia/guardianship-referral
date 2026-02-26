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

