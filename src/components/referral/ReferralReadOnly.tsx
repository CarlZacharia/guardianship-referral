'use client'

import { Referral, REFERRAL_TYPE_LABELS, CAPACITY_LABELS, ASSET_TYPE_LABELS } from '@/lib/types/referral.types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { StatusBadge, UrgencyBadge } from '@/components/shared/ReferralList'
import { format } from 'date-fns'
import {
  UserCircle, MapPin, HeartPulse, DollarSign,
  Users, FileText, Building2, Calendar
} from 'lucide-react'

function Section({ title, icon: Icon, children }: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">{title}</h3>
        <Separator className="flex-1" />
      </div>
      <div className="pl-6 space-y-2">{children}</div>
    </div>
  )
}

function Field({ label, value }: { label: string; value?: string | number | boolean | null }) {
  if (value === undefined || value === null || value === '') return null
  const display = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)
  return (
    <div className="grid grid-cols-3 gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="col-span-2 font-medium">{display}</span>
    </div>
  )
}

interface ReferralReadOnlyProps {
  referral: Referral & { profiles?: any; facilities?: any }
  isStaffView?: boolean
}

export function ReferralReadOnly({ referral, isStaffView }: ReferralReadOnlyProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold">
                {referral.client_full_legal_name ||
                  `${referral.client_first_name} ${referral.client_last_name}`}
              </h2>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <StatusBadge status={referral.status!} />
                <UrgencyBadge urgency={referral.urgency!} />
                {referral.referral_type && (
                  <Badge variant="outline">{REFERRAL_TYPE_LABELS[referral.referral_type]}</Badge>
                )}
              </div>
            </div>
            {referral.submitted_at && (
              <div className="text-sm text-muted-foreground text-right">
                <Calendar className="w-4 h-4 inline mr-1" />
                Submitted<br />
                {format(new Date(referral.submitted_at), 'MMM d, yyyy')}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Client Identity */}
      <Card>
        <CardHeader><CardTitle className="text-base">Client Information</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <Section title="Identity" icon={UserCircle}>
            <Field label="Full Legal Name" value={referral.client_full_legal_name} />
            <Field label="Date of Birth" value={referral.client_dob
              ? format(new Date(referral.client_dob), 'MMMM d, yyyy') : undefined} />
            <Field label="Age" value={referral.client_age ? `${referral.client_age} years` : undefined} />
            <Field label="Sex" value={referral.client_sex} />
            <Field label="SSN (Last 4)" value={referral.client_ssn_last4 ? `***-**-${referral.client_ssn_last4}` : undefined} />
            <Field label="Language" value={referral.client_language} />
            <Field label="County" value={referral.client_county} />
            <Field label="Phone" value={referral.client_phone} />
            <Field label="Email" value={referral.client_email} />
          </Section>

          <Section title="Addresses" icon={MapPin}>
            {referral.client_home_address && (
              <Field label="Home Address" value={
                [referral.client_home_address, referral.client_home_city,
                  referral.client_home_state, referral.client_home_zip].filter(Boolean).join(', ')
              } />
            )}
            {referral.client_current_address && (
              <Field label="Current Address" value={
                [referral.client_current_address, referral.client_current_city,
                  referral.client_current_state, referral.client_current_zip].filter(Boolean).join(', ')
              } />
            )}
          </Section>

          <Section title="Facility Account" icon={Building2}>
            <Field label="Facility" value={referral.facilities?.name || referral.facility_name_freetext} />
            <Field label="Admission Date" value={referral.admission_date
              ? format(new Date(referral.admission_date), 'MMM d, yyyy') : undefined} />
            <Field label="Amount Owed" value={referral.amount_owed_facility
              ? `$${referral.amount_owed_facility.toLocaleString()}` : undefined} />
            <Field label="Monthly Cost" value={referral.facility_monthly_cost
              ? `$${referral.facility_monthly_cost.toLocaleString()}` : undefined} />
          </Section>
        </CardContent>
      </Card>

      {/* Medical */}
      {referral.capacity_level && (
        <Card>
          <CardHeader><CardTitle className="text-base">Medical & Capacity</CardTitle></CardHeader>
          <CardContent>
            <Section title="Capacity & Health" icon={HeartPulse}>
              <Field label="Capacity" value={CAPACITY_LABELS[referral.capacity_level]} />
              <Field label="BIMS Score" value={referral.bims_score} />
              <Field label="DNR" value={referral.dnr} />
              <Field label="Diagnoses" value={referral.diagnoses} />
              <Field label="Medications" value={referral.medications} />
              <Field label="Mental Health" value={referral.mental_health_history} />
              {referral.physician_name && (
                <Field label="Physician" value={
                  [referral.physician_name, referral.physician_address, referral.physician_phone].filter(Boolean).join(' · ')
                } />
              )}
            </Section>
          </CardContent>
        </Card>
      )}

      {/* Financial */}
      <Card>
        <CardHeader><CardTitle className="text-base">Financial</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <Section title="Income & Benefits" icon={DollarSign}>
            <Field label="Monthly Income" value={referral.monthly_income
              ? `$${referral.monthly_income.toLocaleString()}` : undefined} />
            <Field label="Income Sources" value={referral.income_sources} />
            <Field label="Medical Insurance" value={referral.medical_insurance_cost
              ? `$${referral.medical_insurance_cost.toLocaleString()}/mo` : undefined} />
            <Field label="Medicaid Status" value={referral.medicaid_status} />
            <Field label="Rep Payee" value={referral.rep_payee_status} />
            <Field label="VA Benefits" value={referral.va_benefits} />
            {referral.va_benefit_details && (
              <Field label="VA Details" value={referral.va_benefit_details} />
            )}
          </Section>

          {referral.assets && referral.assets.length > 0 && (
            <Section title="Assets" icon={DollarSign}>
              <div className="space-y-2">
                {referral.assets.map((asset: any) => (
                  <div key={asset.id} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                    <div>
                      <span className="font-medium">{ASSET_TYPE_LABELS[asset.asset_type as keyof typeof ASSET_TYPE_LABELS]}</span>
                      {asset.institution && <span className="text-muted-foreground"> · {asset.institution}</span>}
                      {asset.description && <span className="text-muted-foreground"> · {asset.description}</span>}
                    </div>
                    {asset.approximate_value && (
                      <span className="font-medium">${asset.approximate_value.toLocaleString()}</span>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}
        </CardContent>
      </Card>

      {/* Family */}
      <Card>
        <CardHeader><CardTitle className="text-base">Family & Contacts</CardTitle></CardHeader>
        <CardContent>
          <Section title="Spouse & Family" icon={Users}>
            <Field label="Married" value={referral.is_married} />
            {referral.is_married && (
              <>
                <Field label="Spouse Name" value={referral.spouse_name} />
                <Field label="Spouse DOB" value={referral.spouse_dob
                  ? format(new Date(referral.spouse_dob), 'MMM d, yyyy') : undefined} />
                <Field label="Spouse Phone" value={referral.spouse_phone} />
              </>
            )}
            {referral.family_members && referral.family_members.length > 0 && (
              <div className="mt-3 space-y-2">
                {referral.family_members.map((fm: any) => (
                  <div key={fm.id} className="text-sm p-2 bg-muted rounded">
                    <span className="font-medium capitalize">{fm.relationship}</span>: {fm.full_name}
                    {fm.phone && ` · ${fm.phone}`}
                    {fm.address && ` · ${fm.address}`}
                  </div>
                ))}
              </div>
            )}
          </Section>
        </CardContent>
      </Card>

      {/* Legal Documents */}
      <Card>
        <CardHeader><CardTitle className="text-base">Legal Documents</CardTitle></CardHeader>
        <CardContent>
          <Section title="Existing Documents" icon={FileText}>
            <Field label="Power of Attorney" value={referral.has_poa} />
            {referral.has_poa && <Field label="POA Agent" value={referral.poa_agent_name} />}
            <Field label="Health Care Surrogate" value={referral.has_hc_surrogate} />
            {referral.has_hc_surrogate && <Field label="Surrogate Name" value={referral.hc_surrogate_name} />}
            <Field label="Living Will" value={referral.has_living_will} />
            <Field label="Trust" value={referral.has_trust} />
            {referral.has_trust && <Field label="Trust Type" value={referral.trust_type} />}
            <Field label="Prior Guardianship" value={referral.has_prior_guardianship} />
            {referral.has_prior_guardianship && (
              <Field label="Details" value={referral.prior_guardianship_details} />
            )}
            <Field label="Existing Guardian" value={referral.existing_guardian_name} />
            <Field label="Disability Benefits" value={referral.disability_benefits} />
            <Field label="Veterans Services" value={referral.veteran_services} />
            <Field label="Special Needs" value={referral.special_needs} />
          </Section>
        </CardContent>
      </Card>

      {/* Notes */}
      {referral.notes && (
        <Card>
          <CardHeader><CardTitle className="text-base">Notes & Comments</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{referral.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

