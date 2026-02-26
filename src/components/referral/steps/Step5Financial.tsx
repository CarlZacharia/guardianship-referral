'use client'

// src/components/referral/steps/Step5Financial.tsx

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { step5Schema, Step5FormData } from '@/lib/validations/referral.schema'
import { Referral, ReferralType, AssetType, ASSET_TYPE_LABELS } from '@/lib/types/referral.types'
import { StepNavigation, StepNavProps } from '../StepNavigation'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { DollarSign, PlusCircle, Trash2, Landmark } from 'lucide-react'
import { cn } from '@/lib/utils'

// Asset categories for grouped display
const ASSET_CATEGORIES = [
  {
    label: 'Bank Accounts',
    types: ['checking', 'savings', 'cd', 'money_market'] as AssetType[],
  },
  {
    label: 'Real Estate',
    types: ['real_estate_primary', 'real_estate_other'] as AssetType[],
  },
  {
    label: 'Vehicles',
    types: ['vehicle'] as AssetType[],
  },
  {
    label: 'Retirement & Investments',
    types: ['retirement_ira', 'retirement_401k', 'investment', 'annuity'] as AssetType[],
  },
  {
    label: 'Insurance & Other',
    types: ['life_insurance', 'prepaid_funeral', 'personal_property', 'other'] as AssetType[],
  },
]

interface Step5Props {
  defaultValues: Partial<Referral>
  referralType?: ReferralType
  referralId?: string
  onComplete: (data: Partial<Referral>) => Promise<void>
  navProps: StepNavProps
}

const threeWayOptions = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'applied', label: 'Applied/Pending' },
]

export function Step5Financial({ defaultValues, referralType, referralId, onComplete, navProps }: Step5Props) {
  const isMedicaid = referralType === 'medicaid' || referralType === 'both'

  const form = useForm<Step5FormData>({
    resolver: zodResolver(step5Schema),
    defaultValues: {
      monthly_income: defaultValues.monthly_income ?? undefined,
      income_sources: defaultValues.income_sources || '',
      medical_insurance_cost: defaultValues.medical_insurance_cost ?? undefined,
      medicaid_status: defaultValues.medicaid_status,
      rep_payee_status: defaultValues.rep_payee_status,
      va_benefits: defaultValues.va_benefits || false,
      va_benefit_details: defaultValues.va_benefit_details || '',
      assets: (defaultValues as any).assets || [],
    },
  })

  const { fields: assetFields, append, remove } = useFieldArray({
    control: form.control,
    name: 'assets',
  })

  const handleNext = form.handleSubmit(async (data) => {
    await onComplete(data as Partial<Referral>)
  })

  const addAsset = () => {
    append({
      asset_type: 'checking',
      institution: '',
      description: '',
      account_last4: '',
      approximate_value: undefined,
      is_exempt: false,
      notes: '',
    } as any)
  }

  const totalAssets = assetFields.reduce((sum, _, i) => {
    const val = form.watch(`assets.${i}.approximate_value`)
    return sum + (val || 0)
  }, 0)

  const vaOn = form.watch('va_benefits')

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          <CardTitle>Financial Information</CardTitle>
        </div>
        <CardDescription>
          Income, benefits status, and asset inventory.
          {isMedicaid && ' Asset detail is important for Medicaid eligibility analysis.'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <div className="space-y-6">

            {/* Income */}
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Income</h3>
              <Separator className="flex-1" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="monthly_income"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gross Monthly Income</FormLabel>
                    <FormControl>
                      <Input
                        type="number" min="0" step="0.01" placeholder="0.00"
                        {...field}
                        value={field.value ?? ''}
                        onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="medical_insurance_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medical Insurance (Monthly)</FormLabel>
                    <FormControl>
                      <Input
                        type="number" min="0" step="0.01" placeholder="0.00"
                        {...field}
                        value={field.value ?? ''}
                        onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="income_sources"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Income Sources</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Social Security $1,800/mo, Pension $400/mo" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Benefits Status */}
            <div className="flex items-center gap-2">
              <Landmark className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Benefits Status</h3>
              <Separator className="flex-1" />
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Medicaid */}
              <FormField
                control={form.control}
                name="medicaid_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medicaid Status</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex gap-3 mt-2"
                      >
                        {threeWayOptions.map(opt => (
                          <div key={opt.value} className="flex items-center gap-1.5">
                            <RadioGroupItem value={opt.value} id={`med-${opt.value}`} />
                            <Label htmlFor={`med-${opt.value}`} className="text-sm font-normal cursor-pointer">
                              {opt.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Rep Payee */}
              <FormField
                control={form.control}
                name="rep_payee_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facility Rep Payee</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex gap-3 mt-2"
                      >
                        {threeWayOptions.map(opt => (
                          <div key={opt.value} className="flex items-center gap-1.5">
                            <RadioGroupItem value={opt.value} id={`rep-${opt.value}`} />
                            <Label htmlFor={`rep-${opt.value}`} className="text-sm font-normal cursor-pointer">
                              {opt.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* VA Benefits */}
            <FormField
              control={form.control}
              name="va_benefits"
              render={({ field }) => (
                <FormItem>
                  <div className={cn(
                    'flex items-center justify-between p-3 rounded-lg border transition-colors',
                    vaOn ? 'border-primary/30 bg-primary/5' : 'border-input'
                  )}>
                    <FormLabel className="cursor-pointer mb-0">Veterans Benefits / VA Services</FormLabel>
                    <FormControl>
                      <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />
            {vaOn && (
              <FormField
                control={form.control}
                name="va_benefit_details"
                render={({ field }) => (
                  <FormItem className="ml-4">
                    <FormLabel className="text-sm text-muted-foreground">VA Benefit Details</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Aid & Attendance $1,700/mo, service-connected..." {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            {/* Asset Inventory — full detail for Medicaid cases */}
            {isMedicaid && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Asset Inventory</h3>
                    <Separator className="w-20" />
                  </div>
                  {assetFields.length > 0 && (
                    <Badge variant="outline" className="text-sm">
                      Total: ${totalAssets.toLocaleString()}
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground -mt-2">
                  List all known assets. Approximate values are acceptable at this stage.
                </p>

                {assetFields.length === 0 && (
                  <div className="text-center py-6 border-2 border-dashed rounded-lg text-muted-foreground text-sm">
                    No assets added yet. Click below to add assets.
                  </div>
                )}

                <div className="space-y-4">
                  {assetFields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg bg-slate-50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Asset #{index + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                          className="text-destructive h-7 px-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name={`assets.${index}.asset_type`}
                          render={({ field: f }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Asset Type</FormLabel>
                              <Select onValueChange={f.onChange} defaultValue={f.value}>
                                <FormControl>
                                  <SelectTrigger className="h-8 text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {ASSET_CATEGORIES.map(cat => (
                                    <div key={cat.label}>
                                      <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                                        {cat.label}
                                      </div>
                                      {cat.types.map(t => (
                                        <SelectItem key={t} value={t} className="text-sm pl-4">
                                          {ASSET_TYPE_LABELS[t]}
                                        </SelectItem>
                                      ))}
                                    </div>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`assets.${index}.approximate_value`}
                          render={({ field: f }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Approximate Value ($)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number" min="0" step="0.01" placeholder="0.00"
                                  className="h-8 text-sm"
                                  value={f.value ?? ''}
                                  onChange={e => f.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name={`assets.${index}.institution`}
                          render={({ field: f }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Institution / Owner</FormLabel>
                              <FormControl>
                                <Input className="h-8 text-sm" placeholder="Bank name, etc." {...f} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`assets.${index}.account_last4`}
                          render={({ field: f }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Account # (Last 4)</FormLabel>
                              <FormControl>
                                <Input className="h-8 text-sm" maxLength={4} placeholder="XXXX" {...f} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`assets.${index}.description`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Description / Notes</FormLabel>
                            <FormControl>
                              <Input
                                className="h-8 text-sm"
                                placeholder="e.g., address of property, vehicle year/make/model..."
                                {...f}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`assets.${index}.is_exempt`}
                        render={({ field: f }) => (
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={!!f.value}
                              onCheckedChange={f.onChange}
                              className="scale-75"
                            />
                            <Label className="text-xs text-muted-foreground cursor-pointer">
                              Medicaid exempt asset
                            </Label>
                          </div>
                        )}
                      />
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={addAsset}
                  className="w-full"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Asset
                </Button>
              </>
            )}

            {/* Guardianship-only: simplified */}
            {!isMedicaid && (
              <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Asset Detail</p>
                <p>
                  For guardianship-only cases, detailed asset inventory is not required at this stage.
                  Our team will gather financial details during the intake process.
                </p>
              </div>
            )}

          </div>
        </Form>
      </CardContent>

      <StepNavigation
        {...navProps}
        onNext={handleNext}
        currentStepData={form.getValues() as Partial<Referral>}
      />
    </Card>
  )
}

