// ============================================================
// REFERRAL SYSTEM TYPES
// src/lib/types/referral.types.ts
// ============================================================

export type ReferralType = 'guardianship' | 'medicaid' | 'both';
export type UrgencyLevel = 'routine' | 'urgent' | 'emergency';
export type ReferralStatus = 'draft' | 'submitted' | 'in_review' | 'accepted' | 'closed';
export type CapacityLevel = 'no_capacity' | 'limited_capacity' | 'substance_abuse' | 'has_capacity';
export type MedicaidStatus = 'yes' | 'no' | 'applied';
export type UserRole = 'referrer' | 'staff' | 'admin';

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
  | 'trust' | 'outstanding_balance' | 'bank_statement' | 'other';

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
  medications?: string;
  mental_health_history?: string;
  dnr?: boolean;
  physician_name?: string;
  physician_address?: string;
  physician_phone?: string;

  // Financial
  monthly_income?: number;
  income_sources?: string;
  medical_insurance_cost?: number;
  medicaid_status?: MedicaidStatus;
  rep_payee_status?: MedicaidStatus;
  va_benefits?: boolean;
  va_benefit_details?: string;

  // Spouse
  is_married?: boolean;
  spouse_name?: string;
  spouse_dob?: string;
  spouse_ssn_last4?: string;
  spouse_address?: string;
  spouse_phone?: string;

  // Legal documents
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
// FORM STEP DATA (subset types per step for React Hook Form)
// ============================================================

export interface Step1Data {
  facility_id?: string;
  facility_name_freetext?: string;
  urgency: UrgencyLevel;
}

export interface Step2Data {
  referral_type: ReferralType;
}

export interface Step3Data {
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
}

export interface Step4Data {
  capacity_level: CapacityLevel;
  bims_score?: number;
  diagnoses?: string;
  medications?: string;
  mental_health_history?: string;
  dnr?: boolean;
  physician_name?: string;
  physician_address?: string;
  physician_phone?: string;
}

export interface Step5Data {
  monthly_income?: number;
  income_sources?: string;
  medical_insurance_cost?: number;
  medicaid_status?: MedicaidStatus;
  rep_payee_status?: MedicaidStatus;
  va_benefits?: boolean;
  va_benefit_details?: string;
  assets?: Asset[];
}

export interface Step6Data {
  is_married?: boolean;
  spouse_name?: string;
  spouse_dob?: string;
  spouse_ssn_last4?: string;
  spouse_address?: string;
  spouse_phone?: string;
  family_members?: FamilyMember[];
}

export interface Step7Data {
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

export interface Step8Data {
  notes?: string;
  documents?: ReferralDocument[];
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

