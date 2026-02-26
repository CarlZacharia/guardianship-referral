'use client'

// src/components/referral/steps/Step6Family.tsx

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { step6Schema, Step6FormData } from '@/lib/validations/referral.schema'
import { Referral } from '@/lib/types/referral.types'
import { StepNavigation, StepNavProps } from '../StepNavigation'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Users, PlusCircle, Trash2, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step6Props {
  defaultValues: Partial<Referral>
  referralId?: string
  onComplete: (data: Partial<Referral>) => Promise<void>
  navProps: StepNavProps
}

const RELATIONSHIP_LABELS = {
  child: 'Child',
  sibling: 'Sibling',
  parent: 'Parent',
  other_nok: 'Other Next of Kin',
  spouse: 'Spouse (if not listed above)',
}

export function Step6Family({ defaultValues, referralId, onComplete, navProps }: Step6Props) {
  const form = useForm<Step6FormData>({
    resolver: zodResolver(step6Schema),
    defaultValues: {
      is_married: defaultValues.is_married || false,
      spouse_name: defaultValues.spouse_name || '',
      spouse_dob: defaultValues.spouse_dob || '',
      spouse_ssn_last4: defaultValues.spouse_ssn_last4 || '',
      spouse_address: defaultValues.spouse_address || '',
      spouse_phone: defaultValues.spouse_phone || '',
      family_members: (defaultValues as any).family_members || [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'family_members',
  })

  const isMarried = form.watch('is_married')

  const handleNext = form.handleSubmit(async (data) => {
    await onComplete(data as Partial<Referral>)
  })

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
    } as any)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <CardTitle>Family & Next of Kin</CardTitle>
        </div>
        <CardDescription>
          Florida guardianship requires notice to all close relatives.
          Please provide complete contact information for each family member.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <div className="space-y-6">

            {/* Marital Status */}
            <div className="flex items-center gap-2">
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
                    <FormLabel className="cursor-pointer mb-0 font-medium">
                      Currently Married
                    </FormLabel>
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
                  <FormField
                    control={form.control}
                    name="spouse_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Spouse Full Name</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="spouse_dob"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Spouse Date of Birth</FormLabel>
                        <FormControl><Input type="date" {...field} /></FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="spouse_ssn_last4"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SSN (Last 4)</FormLabel>
                        <FormControl>
                          <Input maxLength={4} placeholder="XXXX" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="spouse_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Spouse Phone</FormLabel>
                        <FormControl><Input type="tel" {...field} /></FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="spouse_address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Spouse Address</FormLabel>
                        <FormControl>
                          <Input placeholder="If different from client" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Family Members */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  Children & Next of Kin
                </h3>
              </div>
              <span className="text-xs text-muted-foreground">
                {fields.length} added
              </span>
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
                                <SelectItem key={value} value={value} className="text-sm">
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
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
                      name={`family_members.${index}.full_name`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Full Name *</FormLabel>
                          <FormControl>
                            <Input className="h-8 text-sm" {...f} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`family_members.${index}.dob`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Date of Birth</FormLabel>
                          <FormControl>
                            <Input type="date" className="h-8 text-sm" {...f} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name={`family_members.${index}.phone`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Phone</FormLabel>
                          <FormControl>
                            <Input type="tel" className="h-8 text-sm" {...f} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`family_members.${index}.email`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Email</FormLabel>
                          <FormControl>
                            <Input type="email" className="h-8 text-sm" {...f} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`family_members.${index}.address`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Address</FormLabel>
                        <FormControl>
                          <Input
                            className="h-8 text-sm"
                            placeholder="Street, City, State ZIP"
                            {...f}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={addMember}
              className="w-full"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Family Member
            </Button>

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

