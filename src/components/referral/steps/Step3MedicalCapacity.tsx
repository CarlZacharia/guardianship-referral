'use client'

// src/components/referral/steps/Step3MedicalCapacity.tsx
// Shows for: Guardianship Only, Both

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { step3Schema, Step3FormData } from '@/lib/validations/referral.schema'
import { Referral, CAPACITY_LABELS, CapacityLevel, AutoSaveProps } from '@/lib/types/referral.types'
import { useAutoSave } from '@/hooks/use-auto-save'
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

interface Step3Props {
  defaultValues: Partial<Referral>
  onComplete: (data: Partial<Referral>) => Promise<void>
  navProps: StepNavProps
  autoSave: AutoSaveProps
}

const CAPACITY_DESCRIPTIONS: Record<CapacityLevel, string> = {
  no_capacity: 'Unable to make any personal or financial decisions',
  limited_capacity: 'Some decision-making ability remains in certain areas',
  substance_abuse: 'Incapacity primarily due to substance abuse',
  has_capacity: 'Currently has legal capacity to make decisions',
}

export function Step3MedicalCapacity({ defaultValues, onComplete, navProps, autoSave }: Step3Props) {
  const form = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      capacity_level: defaultValues.capacity_level,
      bims_score: defaultValues.bims_score ?? undefined,
      diagnoses: defaultValues.diagnoses || '',
      allergies: defaultValues.allergies || '',
      medications: defaultValues.medications || '',
      mental_health_history: defaultValues.mental_health_history || '',
      dnr: defaultValues.dnr || false,
      physician_name: defaultValues.physician_name || '',
      physician_address: defaultValues.physician_address || '',
      physician_phone: defaultValues.physician_phone || '',
    },
  })

  const { saveStatus, flushSave } = useAutoSave({
    form,
    stepNumber: autoSave.stepNumber,
    saveStepData: autoSave.save,
  })

  useEffect(() => {
    autoSave.registerFlush(flushSave)
    return () => autoSave.registerFlush(null)
  }, [autoSave, flushSave])

  const handleNext = form.handleSubmit(async (data) => {
    await onComplete(data as Partial<Referral>)
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
                                'w-4 h-4 rounded-full border-2 mt-0.5 shrink-0',
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

            <div className="grid grid-cols-2 gap-4 items-start">
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
                        value={field.value ?? ''}
                        onChange={e => {
                          if (!e.target.value) return field.onChange(undefined);
                          const n = parseInt(e.target.value);
                          if (n >= 0 && n <= 15) field.onChange(n);
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
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
                      'flex items-center justify-between px-3 h-10 rounded-md border',
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

            <FormField control={form.control} name="diagnoses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diagnoses / Medical Conditions</FormLabel>
                  <FormControl>
                    <Textarea placeholder="List current diagnoses (e.g., Alzheimer's dementia, Type 2 diabetes, CHF...)" rows={3} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField control={form.control} name="allergies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Allergies</FormLabel>
                  <FormControl>
                    <Textarea placeholder="List known allergies (medications, food, environmental...)" rows={2} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField control={form.control} name="medications"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Medications</FormLabel>
                  <FormControl>
                    <Textarea placeholder="List current medications and dosages if known..." rows={3} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField control={form.control} name="mental_health_history"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mental Health History</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Include any mental health diagnoses, treatment history, or relevant behavioral history..." rows={3} {...field} />
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
              <FormField control={form.control} name="physician_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Physician Name</FormLabel>
                    <FormControl><Input placeholder="Dr. First Last" {...field} /></FormControl>
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="physician_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Physician Phone</FormLabel>
                    <FormControl><Input type="tel" {...field} /></FormControl>
                  </FormItem>
                )}
              />
            </div>
            <FormField control={form.control} name="physician_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Physician Address</FormLabel>
                  <FormControl><Input placeholder="Practice name and address" {...field} /></FormControl>
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
  )
}
