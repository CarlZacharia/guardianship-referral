// src/lib/validations/referral.schema.ts
// Zod schemas for each form step — used with React Hook Form

import { z } from 'zod';

// ============================================================
// STEP 1 — Referral Source
// ============================================================
export const step1Schema = z.object({
  facility_id: z.string().optional(),
  facility_name_freetext: z.string().optional(),
  urgency: z.enum(['routine', 'urgent', 'emergency']),
}).refine(
  data => data.facility_id || data.facility_name_freetext,
  { message: 'Please select a facility or enter the facility name', path: ['facility_name_freetext'] }
);

// ============================================================
// STEP 2 — Case Type
// ============================================================
export const step2Schema = z.object({
  referral_type: z.enum(['guardianship', 'medicaid', 'both'], {
    required_error: 'Please select a referral type',
  }),
});

// ============================================================
// STEP 3 — Client Identity
// ============================================================
export const step3Schema = z.object({
  client_first_name: z.string().min(1, 'First name is required'),
  client_last_name: z.string().min(1, 'Last name is required'),
  client_full_legal_name: z.string().optional(),
  client_dob: z.string().min(1, 'Date of birth is required'),
  client_sex: z.enum(['male', 'female', 'other', 'unknown']),
  client_ssn_last4: z.string().regex(/^\d{4}$/, 'Enter last 4 digits only').optional().or(z.literal('')),
  client_language: z.string().optional(),
  client_county: z.string().optional(),
  client_phone: z.string().optional(),
  client_email: z.string().email('Invalid email').optional().or(z.literal('')),
  client_home_address: z.string().optional(),
  client_home_city: z.string().optional(),
  client_home_state: z.string().optional(),
  client_home_zip: z.string().optional(),
  client_current_address: z.string().optional(),
  client_current_city: z.string().optional(),
  client_current_state: z.string().optional(),
  client_current_zip: z.string().optional(),
  admission_date: z.string().optional(),
  amount_owed_facility: z.number().min(0).optional().nullable(),
  facility_monthly_cost: z.number().min(0).optional().nullable(),
});

// ============================================================
// STEP 4 — Medical & Capacity
// ============================================================
export const step4Schema = z.object({
  capacity_level: z.enum(['no_capacity', 'limited_capacity', 'substance_abuse', 'has_capacity'], {
    required_error: 'Please select a capacity level',
  }),
  bims_score: z.number().min(0).max(15).optional().nullable(),
  diagnoses: z.string().optional(),
  medications: z.string().optional(),
  mental_health_history: z.string().optional(),
  dnr: z.boolean().optional(),
  physician_name: z.string().optional(),
  physician_address: z.string().optional(),
  physician_phone: z.string().optional(),
});

// ============================================================
// STEP 5 — Financial
// ============================================================
const assetSchema = z.object({
  id: z.string().optional(),
  asset_type: z.enum([
    'checking', 'savings', 'cd', 'money_market',
    'real_estate_primary', 'real_estate_other', 'vehicle',
    'retirement_ira', 'retirement_401k', 'life_insurance',
    'annuity', 'investment', 'prepaid_funeral', 'personal_property', 'other'
  ]),
  institution: z.string().optional(),
  description: z.string().optional(),
  account_last4: z.string().regex(/^\d{4}$/).optional().or(z.literal('')),
  approximate_value: z.number().min(0).optional().nullable(),
  is_exempt: z.boolean().optional(),
  notes: z.string().optional(),
});

export const step5Schema = z.object({
  monthly_income: z.number().min(0).optional().nullable(),
  income_sources: z.string().optional(),
  medical_insurance_cost: z.number().min(0).optional().nullable(),
  medicaid_status: z.enum(['yes', 'no', 'applied']).optional(),
  rep_payee_status: z.enum(['yes', 'no', 'applied']).optional(),
  va_benefits: z.boolean().optional(),
  va_benefit_details: z.string().optional(),
  assets: z.array(assetSchema).optional(),
});

// ============================================================
// STEP 6 — Family & Contacts
// ============================================================
const familyMemberSchema = z.object({
  id: z.string().optional(),
  relationship: z.enum(['child', 'sibling', 'parent', 'other_nok', 'spouse']),
  full_name: z.string().min(1, 'Name is required'),
  dob: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  notes: z.string().optional(),
});

export const step6Schema = z.object({
  is_married: z.boolean().optional(),
  spouse_name: z.string().optional(),
  spouse_dob: z.string().optional(),
  spouse_ssn_last4: z.string().regex(/^\d{4}$/).optional().or(z.literal('')),
  spouse_address: z.string().optional(),
  spouse_phone: z.string().optional(),
  family_members: z.array(familyMemberSchema).optional(),
});

// ============================================================
// STEP 7 — Legal Documents
// ============================================================
export const step7Schema = z.object({
  has_poa: z.boolean().optional(),
  poa_agent_name: z.string().optional(),
  has_hc_surrogate: z.boolean().optional(),
  hc_surrogate_name: z.string().optional(),
  has_living_will: z.boolean().optional(),
  has_trust: z.boolean().optional(),
  trust_type: z.string().optional(),
  has_prior_guardianship: z.boolean().optional(),
  prior_guardianship_details: z.string().optional(),
  existing_guardian_name: z.string().optional(),
  disability_benefits: z.boolean().optional(),
  veteran_services: z.boolean().optional(),
  other_services: z.string().optional(),
  legal_rep_name: z.string().optional(),
  legal_rep_contact: z.string().optional(),
  special_needs: z.string().optional(),
});

// ============================================================
// STEP 8 — Documents & Notes
// ============================================================
export const step8Schema = z.object({
  notes: z.string().optional(),
});

// ============================================================
// EXPORT MAP (step number → schema)
// ============================================================
export const stepSchemas = {
  1: step1Schema,
  2: step2Schema,
  3: step3Schema,
  4: step4Schema,
  5: step5Schema,
  6: step6Schema,
  7: step7Schema,
  8: step8Schema,
} as const;

export type Step1FormData = z.infer<typeof step1Schema>;
export type Step2FormData = z.infer<typeof step2Schema>;
export type Step3FormData = z.infer<typeof step3Schema>;
export type Step4FormData = z.infer<typeof step4Schema>;
export type Step5FormData = z.infer<typeof step5Schema>;
export type Step6FormData = z.infer<typeof step6Schema>;
export type Step7FormData = z.infer<typeof step7Schema>;
export type Step8FormData = z.infer<typeof step8Schema>;

