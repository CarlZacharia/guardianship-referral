// ============================================================
// REFERRAL SYSTEM TYPES
// src/lib/types/referral.types.ts
// ============================================================

export type ReferralType = 'guardianship' | 'medicaid' | 'both';
export type UrgencyLevel = 'routine' | 'urgent' | 'emergency';
export type ReferralStatus = 'draft' | 'submitted' | 'in_review' | 'accepted' | 'closed';
export type CapacityLevel = 'no_capacity' | 'limited_capacity' | 'substance_abuse' | 'has_capacity';
export type MedicaidStatus = 'yes' | 'no' | 'applied';
export type MedicaidApplicationType = 'new' | 'renewal';
export type UserRole = 'referrer' | 'staff' | 'admin';
export type ReferrerType =
  | 'nursing_home' | 'hospital' | 'home_health'
  | 'attorney' | 'social_worker' | 'family' | 'other';

export type AssetType =
  | 'checking' | 'savings' | 'cd' | 'money_market'
  | 'real_estate_primary' | 'real_estate_other'
  | 'vehicle'
  | 'retirement_ira' | 'retirement_401k'
  | 'life_insurance' | 'annuity' | 'investment'
  | 'prepaid_funeral' | 'personal_property' | 'other';

export type FamilyRelationship = 'child' | 'sibling' | 'parent' | 'other_nok' | 'spouse';

export type DocumentType =
  | 'facesheet' | 'id_drivers_license' | 'id_passport' | 'id_state'
  | 'medical_report' | 'poa' | 'hc_surrogate' | 'living_will'
  | 'trust' | 'outstanding_balance' | 'bank_statement'
  | 'resident_funds' | 'incapacity_determination' | 'level_of_care'
  | 'financial_disclosure' | 'designation_of_rep' | 'authorization_to_disclose'
  | 'other';

// ============================================================
// PROFILE
// ============================================================
export interface Profile {
  id: string;
  created_at: string;
  updated_at: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  organization?: string;
  phone?: string;
  email: string;
  is_active: boolean;

  // Onboarding fields
  referrer_type?: ReferrerType;
  onboarding_completed: boolean;

  // Mailing address
  mailing_street?: string;
  mailing_city?: string;
  mailing_state?: string;
  mailing_zip?: string;

  // Billing address
  billing_street?: string;
  billing_city?: string;
  billing_state?: string;
  billing_zip?: string;

  // Primary contact (referral information)
  primary_contact_name?: string;
  primary_contact_phone?: string;
  primary_contact_email?: string;

  // Billing contact
  billing_contact_name?: string;
  billing_contact_phone?: string;
  billing_contact_email?: string;
}

// ============================================================
// FACILITY
// ============================================================
export interface Facility {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  fax?: string;
  contact_name?: string;
  contact_email?: string;
}

// ============================================================
// FAMILY MEMBER
// ============================================================
export interface FamilyMember {
  id?: string;
  referral_id?: string;
  relationship: FamilyRelationship;
  full_name: string;
  dob?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  email?: string;
  notes?: string;
  sort_order?: number;
}

// ============================================================
// ASSET
// ============================================================
export interface Asset {
  id?: string;
  referral_id?: string;
  asset_type: AssetType;
  institution?: string;
  description?: string;
  account_last4?: string;
  approximate_value?: number;
  is_exempt?: boolean;
  notes?: string;
}

// ============================================================
// DOCUMENT
// ============================================================
export interface ReferralDocument {
  id?: string;
  referral_id?: string;
  doc_type: DocumentType;
  file_name: string;
  storage_path: string;
  file_size_bytes?: number;
  notes?: string;
}

// ============================================================
// REFERRAL (full record)
// ============================================================
export interface Referral {
  id?: string;
  created_at?: string;
  updated_at?: string;
  submitted_at?: string;
  referrer_id?: string;
  facility_id?: string;
  facility_name_freetext?: string;
  referral_type?: ReferralType;
  reason_for_request?: string;
  urgency?: UrgencyLevel;
  status?: ReferralStatus;

  // Client identity
  client_first_name?: string;
  client_last_name?: string;
  client_full_legal_name?: string;
  client_dob?: string;
  client_age?: number;
  client_sex?: 'male' | 'female' | 'other' | 'unknown';
  client_ssn_last4?: string;
  client_language?: string;
  client_county?: string;
  client_citizenship?: string;

  // Addresses
  client_home_address?: string;
  client_home_city?: string;
  client_home_state?: string;
  client_home_zip?: string;
  client_current_address?: string;
  client_current_city?: string;
  client_current_state?: string;
  client_current_zip?: string;
  client_phone?: string;
  client_email?: string;

  // Facility financial
  admission_date?: string;
  amount_owed_facility?: number;
  facility_monthly_cost?: number;

  // Medical & Capacity
  capacity_level?: CapacityLevel;
  bims_score?: number;
  diagnoses?: string;
  allergies?: string;
  medications?: string;
  mental_health_history?: string;
  dnr?: boolean;
  physician_name?: string;
  physician_address?: string;
  physician_phone?: string;

  // Financial
  income_entries?: IncomeEntry[];
  monthly_income?: number;
  medical_insurance_entries?: InsuranceEntry[];
  medical_insurance_cost?: number;
  medicaid_status?: MedicaidStatus;
  rep_payee_status?: MedicaidStatus;
  va_benefits?: boolean;
  va_benefit_details?: string;
  assets_unknown?: boolean;

  // Spouse
  is_married?: boolean;
  spouse_name?: string;
  spouse_dob?: string;
  spouse_ssn_last4?: string;
  spouse_email?: string;
  spouse_address?: string;
  spouse_phone?: string;

  // Legal documents
  has_poa?: boolean;
  poa_agent_name?: string;
  poa_date_executed?: string;
  poa_contact?: string;
  has_hc_surrogate?: boolean;
  hc_surrogate_name?: string;
  hc_surrogate_date_executed?: string;
  hc_surrogate_contact?: string;
  has_living_will?: boolean;
  living_will_agent_name?: string;
  living_will_date_executed?: string;
  living_will_contact?: string;
  has_trust?: boolean;
  trust_type?: string;
  trust_trustee_name?: string;
  trust_date_executed?: string;
  trust_contact?: string;
  has_prior_guardianship?: boolean;
  prior_guardianship_details?: string;
  existing_guardian_name?: string;
  guardianship_date_executed?: string;
  guardianship_contact?: string;

  // Support services
  disability_benefits?: boolean;
  veteran_services?: boolean;
  other_services?: string;
  educational_background?: string;
  employment_history?: string;
  employment_status?: string;
  special_needs?: string;

  // Legal rep
  legal_rep_name?: string;
  legal_rep_contact?: string;

  // Medicaid
  medicaid_date_of_need?: string;
  medicaid_application_type?: MedicaidApplicationType;
  medicaid_application_number?: string;
  medicaid_case_number?: string;
  medicaid_current_status?: string;
  medicaid_application_date?: string;
  medicaid_filed_by?: string;
  medicaid_contact_name?: string;
  medicaid_contact_address?: string;
  medicaid_contact_phone?: string;
  medicaid_contact_email?: string;
  medicaid_myaccess_login?: string;
  medicaid_myaccess_pw?: string;
  medicaid_documents_uploaded?: string;
  medicaid_comments?: string;

  // Notes & submission
  notes?: string;
  submitted_by_name?: string;
  submitted_by_company?: string;
  submitted_date?: string;

  // Progress
  current_step?: number;
  steps_completed?: Record<string, boolean>;

  // Related (populated via joins)
  family_members?: FamilyMember[];
  assets?: Asset[];
  documents?: ReferralDocument[];
  referrer?: Profile;
  facility?: Facility;
}

// ============================================================
// AUTO-SAVE PROPS (passed from ReferralForm to each step)
// ============================================================
export interface AutoSaveProps {
  save: (data: Partial<Referral>, step: number) => Promise<string | null>;
  stepNumber: number;
  registerFlush: (fn: (() => Promise<void>) | null) => void;
}

// ============================================================
// FORM STEP DATA (subset types per step for React Hook Form)
// ============================================================

export interface Step1Data {
  facility_id?: string;
  facility_name_freetext?: string;
  urgency: UrgencyLevel;
  referral_type: ReferralType;
  reason_for_request?: string;
  client_first_name: string;
  client_last_name: string;
  client_full_legal_name?: string;
  client_dob: string;
  client_sex: 'male' | 'female' | 'other' | 'unknown';
  client_ssn_last4?: string;
  client_language?: string;
  client_county?: string;
  client_phone?: string;
  client_email?: string;
  client_home_address?: string;
  client_home_city?: string;
  client_home_state?: string;
  client_home_zip?: string;
  client_current_address?: string;
  client_current_city?: string;
  client_current_state?: string;
  client_current_zip?: string;
  admission_date?: string;
  amount_owed_facility?: number;
  facility_monthly_cost?: number;
  is_married?: boolean;
  spouse_name?: string;
  spouse_dob?: string;
  spouse_ssn_last4?: string;
  spouse_email?: string;
  spouse_address?: string;
  spouse_phone?: string;
}

export interface Step2Data {
  family_members?: FamilyMember[];
  has_poa?: boolean;
  poa_agent_name?: string;
  has_hc_surrogate?: boolean;
  hc_surrogate_name?: string;
  has_living_will?: boolean;
  has_trust?: boolean;
  trust_type?: string;
  has_prior_guardianship?: boolean;
  prior_guardianship_details?: string;
  existing_guardian_name?: string;
  disability_benefits?: boolean;
  veteran_services?: boolean;
  other_services?: string;
  legal_rep_name?: string;
  legal_rep_contact?: string;
  special_needs?: string;
}

export interface Step3Data {
  capacity_level: CapacityLevel;
  bims_score?: number;
  diagnoses?: string;
  allergies?: string;
  medications?: string;
  mental_health_history?: string;
  dnr?: boolean;
  physician_name?: string;
  physician_address?: string;
  physician_phone?: string;
}

export interface Step4Data {
  income_entries?: IncomeEntry[];
  monthly_income?: number;
  medical_insurance_entries?: InsuranceEntry[];
  medical_insurance_cost?: number;
  medicaid_status?: MedicaidStatus;
  rep_payee_status?: MedicaidStatus;
  va_benefits?: boolean;
  va_benefit_details?: string;
  assets?: Asset[];
}

export interface Step5Data {
  notes?: string;
  documents?: ReferralDocument[];
}

export interface Step6Data {
  medicaid_date_of_need?: string;
  medicaid_application_type?: MedicaidApplicationType;
  medicaid_application_number?: string;
  medicaid_case_number?: string;
  medicaid_current_status?: string;
  medicaid_application_date?: string;
  medicaid_filed_by?: string;
  medicaid_contact_name?: string;
  medicaid_contact_address?: string;
  medicaid_contact_phone?: string;
  medicaid_contact_email?: string;
  medicaid_myaccess_login?: string;
  medicaid_myaccess_pw?: string;
  medicaid_documents_uploaded?: string;
  medicaid_comments?: string;
}

// Labels for display
export const REFERRAL_TYPE_LABELS: Record<ReferralType, string> = {
  guardianship: 'Guardianship Only',
  medicaid: 'Medicaid Only',
  both: 'Guardianship & Medicaid',
};

export const URGENCY_LABELS: Record<UrgencyLevel, string> = {
  routine: 'Routine',
  urgent: 'Urgent',
  emergency: 'Emergency',
};

export const CAPACITY_LABELS: Record<CapacityLevel, string> = {
  no_capacity: 'No Capacity',
  limited_capacity: 'Limited Capacity',
  substance_abuse: 'Substance Abuse',
  has_capacity: 'Has Capacity',
};

export const STATUS_LABELS: Record<ReferralStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  in_review: 'In Review',
  accepted: 'Accepted',
  closed: 'Closed',
};

export const REFERRER_TYPE_LABELS: Record<ReferrerType, string> = {
  nursing_home: 'Nursing Home / SNF',
  hospital: 'Hospital / Health System',
  home_health: 'Home Health Agency',
  attorney: 'Attorney / Law Firm',
  social_worker: 'Social Worker / Case Manager',
  family: 'Family Member / Self-Referral',
  other: 'Other',
};

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  checking: 'Checking Account',
  savings: 'Savings Account',
  cd: 'Certificate of Deposit (CD)',
  money_market: 'Money Market Account',
  real_estate_primary: 'Primary Residence',
  real_estate_other: 'Other Real Estate',
  vehicle: 'Vehicle',
  retirement_ira: 'IRA',
  retirement_401k: '401(k) / Pension',
  life_insurance: 'Life Insurance (Cash Value)',
  annuity: 'Annuity',
  investment: 'Investment / Brokerage Account',
  prepaid_funeral: 'Prepaid Funeral',
  personal_property: 'Personal Property',
  other: 'Other',
};

export const FLORIDA_COUNTIES = [
  'Alachua', 'Baker', 'Bay', 'Bradford', 'Brevard', 'Broward',
  'Calhoun', 'Charlotte', 'Citrus', 'Clay', 'Collier', 'Columbia',
  'DeSoto', 'Dixie', 'Duval', 'Escambia', 'Flagler', 'Franklin',
  'Gadsden', 'Gilchrist', 'Glades', 'Gulf', 'Hamilton', 'Hardee',
  'Hendry', 'Hernando', 'Highlands', 'Hillsborough', 'Holmes',
  'Indian River', 'Jackson', 'Jefferson', 'Lafayette', 'Lake',
  'Lee', 'Leon', 'Levy', 'Liberty', 'Madison', 'Manatee',
  'Marion', 'Martin', 'Miami-Dade', 'Monroe', 'Nassau', 'Okaloosa',
  'Okeechobee', 'Orange', 'Osceola', 'Palm Beach', 'Pasco',
  'Pinellas', 'Polk', 'Putnam', 'St. Johns', 'St. Lucie',
  'Santa Rosa', 'Sarasota', 'Seminole', 'Sumter', 'Suwannee',
  'Taylor', 'Union', 'Volusia', 'Wakulla', 'Walton', 'Washington'
];

export const INCOME_LIMIT = {
  year: 2026,
  income_limit: 2982,
};

export const PNA = 160;

export interface IncomeEntry {
  description: string;
  amount: number | undefined;
}

export interface InsuranceEntry {
  description: string;
  amount: number | undefined;
}

