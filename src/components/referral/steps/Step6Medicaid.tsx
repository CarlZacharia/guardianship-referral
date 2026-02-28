'use client';

// src/components/referral/steps/Step6Medicaid.tsx
// Medicaid application details

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step6Schema, Step6FormData } from '@/lib/validations/referral.schema';
import { Referral, AutoSaveProps } from '@/lib/types/referral.types';
import { useAutoSave } from '@/hooks/use-auto-save';
import { StepNavigation, StepNavProps } from '../StepNavigation';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { FileText, User, KeyRound } from 'lucide-react';

interface Step6Props {
  defaultValues: Partial<Referral>;
  onComplete: (data: Partial<Referral>) => Promise<void>;
  navProps: StepNavProps;
  autoSave: AutoSaveProps;
}

export function Step6Medicaid({ defaultValues, onComplete, navProps, autoSave }: Step6Props) {
  const form = useForm<Step6FormData>({
    resolver: zodResolver(step6Schema),
    defaultValues: {
      medicaid_date_of_need: defaultValues.medicaid_date_of_need || '',
      medicaid_application_type: defaultValues.medicaid_application_type || undefined,
      medicaid_application_number: defaultValues.medicaid_application_number || '',
      medicaid_case_number: defaultValues.medicaid_case_number || '',
      medicaid_current_status: defaultValues.medicaid_current_status || '',
      medicaid_application_date: defaultValues.medicaid_application_date || '',
      medicaid_filed_by: defaultValues.medicaid_filed_by || '',
      medicaid_contact_name: defaultValues.medicaid_contact_name || '',
      medicaid_contact_address: defaultValues.medicaid_contact_address || '',
      medicaid_contact_phone: defaultValues.medicaid_contact_phone || '',
      medicaid_contact_email: defaultValues.medicaid_contact_email || '',
      medicaid_myaccess_login: defaultValues.medicaid_myaccess_login || '',
      medicaid_myaccess_pw: defaultValues.medicaid_myaccess_pw || '',
      medicaid_documents_uploaded: defaultValues.medicaid_documents_uploaded || '',
      medicaid_comments: defaultValues.medicaid_comments || '',
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

  const handleNext = form.handleSubmit(async (data) => {
    await onComplete(data as Partial<Referral>);
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <CardTitle>Medicaid</CardTitle>
        </div>
        <CardDescription>
          Medicaid application details and timeline.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <div className="space-y-6">

            {/* Application Info */}
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Application Info</h3>
              <Separator className="flex-1" />
            </div>

            <FormField
              control={form.control}
              name="medicaid_application_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Application Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-4 mt-1"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="new" id="app-type-new" />
                        <Label htmlFor="app-type-new" className="cursor-pointer font-normal">New Application</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="renewal" id="app-type-renewal" />
                        <Label htmlFor="app-type-renewal" className="cursor-pointer font-normal">Renewal</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="medicaid_date_of_need"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Medicaid Need</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., March 2026" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="medicaid_application_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application Date</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 02/15/2026" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="medicaid_application_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application Number</FormLabel>
                    <FormControl>
                      <Input placeholder="If available" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="medicaid_case_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Case Number</FormLabel>
                    <FormControl>
                      <Input placeholder="If available" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="medicaid_current_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Status</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Pending, Approved, Denied" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="medicaid_filed_by"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Filed By</FormLabel>
                    <FormControl>
                      <Input placeholder="Name of person who filed" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Primary Contact */}
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Primary Contact</h3>
              <Separator className="flex-1" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="medicaid_contact_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Name</FormLabel>
                    <FormControl>
                      <Input placeholder="First Last" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="medicaid_contact_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Phone</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="(555) 555-5555" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="medicaid_contact_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Street, City, State, ZIP" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="medicaid_contact_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* MyACCESS Credentials */}
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">MyACCESS Account</h3>
              <Separator className="flex-1" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="medicaid_myaccess_login"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>MyACCESS Login</FormLabel>
                    <FormControl>
                      <Input placeholder="Username or email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="medicaid_myaccess_pw"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>MyACCESS Password</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Documents & Comments */}
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Documents & Comments</h3>
              <Separator className="flex-1" />
            </div>

            <FormField
              control={form.control}
              name="medicaid_documents_uploaded"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Documents Uploaded</FormLabel>
                  <FormControl>
                    <Textarea placeholder="List any documents already uploaded or submitted for this Medicaid application..." rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="medicaid_comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comments</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any additional comments or notes about this Medicaid case..." rows={3} {...field} />
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
        currentStepData={form.getValues() as Partial<Referral>}
        saveStatus={saveStatus}
      />
    </Card>
  );
}
