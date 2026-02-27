import { z } from 'zod';

export const onboardingSchema = z.object({
  // Facility/User type
  referrer_type: z.enum(
    ['nursing_home', 'hospital', 'home_health', 'attorney', 'social_worker', 'family', 'other'],
    { required_error: 'Please select a referrer type' }
  ),

  // Mailing address
  mailing_street: z.string().min(1, 'Street address is required'),
  mailing_city: z.string().min(1, 'City is required'),
  mailing_state: z.string().min(2, 'State is required').max(2),
  mailing_zip: z.string().min(5, 'ZIP code is required').max(10),

  // Billing address
  billing_same_as_mailing: z.boolean().default(false),
  billing_street: z.string().optional(),
  billing_city: z.string().optional(),
  billing_state: z.string().optional(),
  billing_zip: z.string().optional(),

  // Primary contact (for referral information)
  primary_contact_name: z.string().min(1, 'Contact name is required'),
  primary_contact_phone: z.string().min(1, 'Phone number is required'),
  primary_contact_email: z.string().email('Invalid email address'),

  // Billing contact
  billing_contact_name: z.string().min(1, 'Billing contact name is required'),
  billing_contact_phone: z.string().min(1, 'Billing phone is required'),
  billing_contact_email: z.string().email('Invalid billing email address'),
}).superRefine((data, ctx) => {
  if (!data.billing_same_as_mailing) {
    if (!data.billing_street) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Street address is required',
        path: ['billing_street'],
      });
    }
    if (!data.billing_city) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'City is required',
        path: ['billing_city'],
      });
    }
    if (!data.billing_state || data.billing_state.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'State is required',
        path: ['billing_state'],
      });
    }
    if (!data.billing_zip || data.billing_zip.length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'ZIP code is required',
        path: ['billing_zip'],
      });
    }
  }
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;
