// src/lib/validations/referral.schema.ts
// Zod schemas for each form step — used with React Hook Form

import { z } from 'zod';

// ============================================================
// Shared sub-schemas
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

// ============================================================
// STEP 1 — Referral (Source + Case Type + Client + Marital)
// ============================================================
export const step1Schema = z.object({
  // Referral source
  facility_id: z.string().optional(),
  facility_name_freetext: z.string().optional(),
  urgency: z.enum(['routine', 'urgent', 'emergency']),

  // Case type
  referral_type: z.enum(['guardianship', 'medicaid', 'both'], {
    required_error: 'Please select a referral type',
  }),
  reason_for_request: z.string().optional(),

  // Client identity
  client_first_name: z.string().min(1, 'First name is required'),
  client_last_name: z.string().min(1, 'Last name is required'),
  client_full_legal_name: z.string().optional(),
  client_dob: z.string().min(1, 'Date of birth is required'),
  client_sex: z.enum(['male', 'female', 'other', 'unknown']),
  client_ssn_last4: z.string().regex(/^\d{4}$/, 'Enter last 4 digits of SSN'),
  client_language: z.string().optional(),
  client_county: z.string().min(1, 'County is required'),
  client_phone: z.string().optional(),
  client_email: z.string().email('Invalid email').optional().or(z.literal('')),

  // Addresses
  client_home_address: z.string().optional(),
  client_home_city: z.string().optional(),
  client_home_state: z.string().optional(),
  client_home_zip: z.string().optional(),
  owns_home: z.boolean().optional(),
  home_other_residents: z.string().optional(),
  client_current_address: z.string().optional(),
  client_current_city: z.string().optional(),
  client_current_state: z.string().optional(),
  client_current_zip: z.string().optional(),

  // Facility account
  admission_date: z.string().min(1, 'Admission date is required'),
  amount_owed_facility: z.number().min(0).optional().nullable(),
  facility_monthly_cost: z.number().min(0).optional().nullable(),

  // Marital status (moved from old Step 6)
  is_married: z.boolean({ required_error: 'Marital status is required' }),
  spouse_name: z.string().optional(),
  spouse_dob: z.string().optional(),
  spouse_ssn_last4: z.string().regex(/^\d{4}$/).optional().or(z.literal('')),
  spouse_email: z.string().email('Invalid email').optional().or(z.literal('')),
  spouse_address: z.string().optional(),
  spouse_phone: z.string().optional(),
}).refine(
  data => data.facility_id || data.facility_name_freetext,
  { message: 'Please select a facility or enter the facility name', path: ['facility_name_freetext'] }
);

// ============================================================
// STEP 2 — Family - Contacts - Agents
// ============================================================
export const step2Schema = z.object({
  // Family members
  family_members: z.array(familyMemberSchema).optional(),

  // Legal documents — POA
  has_poa: z.boolean().optional(),
  poa_agent_name: z.string().optional(),
  poa_date_executed: z.string().optional(),
  poa_contact: z.string().optional(),

  // Legal documents — HC Surrogate
  has_hc_surrogate: z.boolean().optional(),
  hc_surrogate_name: z.string().optional(),
  hc_surrogate_date_executed: z.string().optional(),
  hc_surrogate_contact: z.string().optional(),

  // Legal documents — Living Will
  has_living_will: z.boolean().optional(),
  living_will_agent_name: z.string().optional(),
  living_will_date_executed: z.string().optional(),
  living_will_contact: z.string().optional(),

  // Legal documents — Trust
  has_trust: z.boolean().optional(),
  trust_type: z.string().optional(),
  trust_trustee_name: z.string().optional(),
  trust_date_executed: z.string().optional(),
  trust_contact: z.string().optional(),

  // Legal documents — Guardianship
  has_prior_guardianship: z.boolean().optional(),
  prior_guardianship_details: z.string().optional(),
  existing_guardian_name: z.string().optional(),
  guardianship_date_executed: z.string().optional(),
  guardianship_contact: z.string().optional(),

  // Benefits & support
  disability_benefits: z.boolean().optional(),
  veteran_services: z.boolean().optional(),
  other_services: z.string().optional(),

  // Legal representation
  legal_rep_name: z.string().optional(),
  legal_rep_contact: z.string().optional(),

  // Special needs
  special_needs: z.string().optional(),
});

// ============================================================
// STEP 3 — Medical & Capacity
// ============================================================
export const step3Schema = z.object({
  capacity_level: z.enum(['no_capacity', 'limited_capacity', 'substance_abuse', 'has_capacity'], {
    required_error: 'Please select a capacity level',
  }),
  bims_score: z.number().min(0).max(15).optional().nullable(),
  diagnoses: z.string().optional(),
  allergies: z.string().optional(),
  medications: z.string().optional(),
  mental_health_history: z.string().optional(),
  dnr: z.boolean().optional(),
  physician_name: z.string().optional(),
  physician_address: z.string().optional(),
  physician_phone: z.string().optional(),
});

// ============================================================
// STEP 4 — Financial
// ============================================================
const incomeEntrySchema = z.object({
  description: z.string().optional().default(''),
  amount: z.number().min(0).optional().nullable(),
});

const insuranceEntrySchema = z.object({
  description: z.string().optional().default(''),
  amount: z.number().min(0).optional().nullable(),
});

export const step4Schema = z.object({
  income_entries: z.array(incomeEntrySchema).optional(),
  monthly_income: z.number().min(0).optional().nullable(),
  medical_insurance_entries: z.array(insuranceEntrySchema).optional(),
  medical_insurance_cost: z.number().min(0).optional().nullable(),
  medicaid_status: z.enum(['yes', 'no', 'applied']).optional(),
  rep_payee_status: z.enum(['yes', 'no', 'applied']).optional(),
  va_benefits: z.boolean().optional(),
  va_benefit_details: z.string().optional(),
  assets_unknown: z.boolean().optional(),
  assets: z.array(assetSchema).optional(),
});

// ============================================================
// STEP 5 — Documents & Uploads
// ============================================================
export const step5Schema = z.object({
  notes: z.string().optional(),
});

// ============================================================
// STEP 6 — Medicaid
// ============================================================
export const step6Schema = z.object({
  medicaid_date_of_need: z.string().optional(),
  medicaid_application_type: z.enum(['new', 'renewal']).optional(),
  medicaid_application_number: z.string().optional(),
  medicaid_case_number: z.string().optional(),
  medicaid_current_status: z.string().optional(),
  medicaid_application_date: z.string().optional(),
  medicaid_filed_by: z.string().optional(),
  medicaid_contact_name: z.string().optional(),
  medicaid_contact_address: z.string().optional(),
  medicaid_contact_phone: z.string().optional(),
  medicaid_contact_email: z.string().optional(),
  medicaid_myaccess_login: z.string().optional(),
  medicaid_myaccess_pw: z.string().optional(),
  medicaid_documents_uploaded: z.string().optional(),
  medicaid_comments: z.string().optional(),
});

// ============================================================
// EXPORT MAP (step number → schema)
// ============================================================
export const stepSchemas = {
  1: step1Schema,
  2: step2Schema,
  3: step3Schema,
  4: step4Schema,
  5: step6Schema,
  6: step5Schema,
} as const;

export type Step1FormData = z.infer<typeof step1Schema>;
export type Step2FormData = z.infer<typeof step2Schema>;
export type Step3FormData = z.infer<typeof step3Schema>;
export type Step4FormData = z.infer<typeof step4Schema>;
export type Step5FormData = z.infer<typeof step5Schema>;
export type Step6FormData = z.infer<typeof step6Schema>;
