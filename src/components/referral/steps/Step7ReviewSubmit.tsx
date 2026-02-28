'use client'

// src/components/referral/steps/Step7ReviewSubmit.tsx

import { useState } from 'react'
import {
  Referral, REFERRAL_TYPE_LABELS, CAPACITY_LABELS,
  URGENCY_LABELS, ASSET_TYPE_LABELS, INCOME_LIMIT, P_AND_A
} from '@/lib/types/referral.types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Edit, Loader2, ClipboardCheck, AlertCircle } from 'lucide-react'

interface Step7Props {
  referralData: Partial<Referral>
  referralId?: string
  activeSteps: { number: number; label: string }[]
  onSubmit: (data: Partial<Referral>) => Promise<void>
  onEditStep: (step: number) => void
  isSaving: boolean
}

function ReviewSection({
  title,
  stepNumber,
  onEdit,
  children,
}: {
  title: string
  stepNumber: number
  onEdit: (step: number) => void
  children: React.ReactNode
}) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b">
        <h3 className="font-semibold text-sm">{title}</h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onEdit(stepNumber)}
          className="h-7 px-2 text-xs text-primary"
        >
          <Edit className="w-3 h-3 mr-1" /> Edit
        </Button>
      </div>
      <div className="p-4 space-y-1.5">{children}</div>
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value?: string | number | boolean | null }) {
  if (value === undefined || value === null || value === '') return null
  const display = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)
  return (
    <div className="flex gap-3 text-sm">
      <span className="text-muted-foreground w-40 shrink-0">{label}</span>
      <span className="font-medium flex-1">{display}</span>
    </div>
  )
}

export function Step7ReviewSubmit({
  referralData,
  referralId,
  activeSteps,
  onSubmit,
  onEditStep,
  isSaving,
}: Step7Props) {
  const [certify, setCertify] = useState(false)
  const [submitterName, setSubmitterName] = useState(referralData.submitted_by_name || '')
  const [submitterCompany, setSubmitterCompany] = useState(referralData.submitted_by_company || '')
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!certify) {
      setError('Please certify that the information is accurate before submitting.')
      return
    }
    if (!submitterName) {
      setError('Please enter your name.')
      return
    }
    setError('')
    await onSubmit({
      submitted_by_name: submitterName,
      submitted_by_company: submitterCompany,
      submitted_date: new Date().toISOString().split('T')[0],
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-primary" />
            <CardTitle>Review & Submit</CardTitle>
          </div>
          <CardDescription>
            Please review all information before submitting. Click any section to make edits.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Step 1: Referral */}
      <ReviewSection title="Referral" stepNumber={1} onEdit={onEditStep}>
        <ReviewRow
          label="Facility"
          value={referralData.facility_name_freetext || (referralData as any).facilities?.name}
        />
        <ReviewRow
          label="Urgency"
          value={referralData.urgency ? URGENCY_LABELS[referralData.urgency] : undefined}
        />
        <ReviewRow
          label="Case Type"
          value={referralData.referral_type ? REFERRAL_TYPE_LABELS[referralData.referral_type] : undefined}
        />
        <ReviewRow
          label="Name"
          value={referralData.client_full_legal_name ||
            `${referralData.client_first_name || ''} ${referralData.client_last_name || ''}`.trim()}
        />
        <ReviewRow
          label="Date of Birth"
          value={referralData.client_dob
            ? format(new Date(referralData.client_dob), 'MMM d, yyyy')
            : undefined}
        />
        <ReviewRow label="Age" value={referralData.client_age ? `${referralData.client_age} years` : undefined} />
        <ReviewRow label="Sex" value={referralData.client_sex} />
        <ReviewRow label="County" value={referralData.client_county} />
        <ReviewRow label="Phone" value={referralData.client_phone} />
        <ReviewRow label="Married" value={referralData.is_married} />
        {referralData.is_married && (
          <ReviewRow label="Spouse" value={referralData.spouse_name} />
        )}
        <ReviewRow
          label="Admission Date"
          value={referralData.admission_date
            ? format(new Date(referralData.admission_date), 'MMM d, yyyy')
            : undefined}
        />
        <ReviewRow
          label="Amount Owed"
          value={referralData.amount_owed_facility
            ? `$${referralData.amount_owed_facility.toLocaleString()}` : undefined}
        />
      </ReviewSection>

      {/* Step 2: Family - Contacts - Agents */}
      <ReviewSection title="Family - Contacts - Agents" stepNumber={2} onEdit={onEditStep}>
        {(referralData as any).family_members?.length > 0 && (
          <ReviewRow
            label="Family Members"
            value={`${(referralData as any).family_members.length} added`}
          />
        )}
        <ReviewRow label="Power of Attorney" value={referralData.has_poa} />
        <ReviewRow label="Health Care Surrogate" value={referralData.has_hc_surrogate} />
        <ReviewRow label="Living Will" value={referralData.has_living_will} />
        <ReviewRow label="Trust" value={referralData.has_trust} />
        <ReviewRow label="Prior Guardianship" value={referralData.has_prior_guardianship} />
      </ReviewSection>

      {/* Step 3: Medical & Capacity */}
      {referralData.capacity_level && (
        <ReviewSection title="Medical & Capacity" stepNumber={3} onEdit={onEditStep}>
          <ReviewRow label="Capacity" value={CAPACITY_LABELS[referralData.capacity_level]} />
          <ReviewRow label="BIMS Score" value={referralData.bims_score} />
          <ReviewRow label="DNR" value={referralData.dnr} />
          <ReviewRow label="Physician" value={referralData.physician_name} />
        </ReviewSection>
      )}

      {/* Step 4: Financial */}
      <ReviewSection title="Financial" stepNumber={4} onEdit={onEditStep}>
        <ReviewRow
          label="Gross Monthly Income"
          value={referralData.monthly_income
            ? `$${referralData.monthly_income.toLocaleString()}` : undefined}
        />
        <ReviewRow
          label="Medical Insurance"
          value={referralData.medical_insurance_cost
            ? `$${referralData.medical_insurance_cost.toLocaleString()}` : undefined}
        />
        {(referralData.monthly_income || referralData.medical_insurance_cost) && (
          <ReviewRow
            label="Private Pay"
            value={`$${((referralData.monthly_income || 0) - (referralData.medical_insurance_cost || 0) - P_AND_A).toLocaleString()}`}
          />
        )}
        <ReviewRow
          label={`Income Limit (${INCOME_LIMIT.year})`}
          value={`$${INCOME_LIMIT.income_limit.toLocaleString()}`}
        />
        <ReviewRow label="Medicaid Status" value={referralData.medicaid_status} />
        <ReviewRow label="Rep Payee" value={referralData.rep_payee_status} />
        <ReviewRow label="VA Benefits" value={referralData.va_benefits} />
        {referralData.assets_unknown ? (
          <ReviewRow label="Assets" value="Unknown at this time" />
        ) : (referralData as any).assets?.length > 0 ? (
          <div className="text-sm">
            <span className="text-muted-foreground">Assets: </span>
            <span className="font-medium">
              {(referralData as any).assets.length} item(s) — Total approx.{' '}
              ${((referralData as any).assets as any[])
                .reduce((s: number, a: any) => s + (a.approximate_value || 0), 0)
                .toLocaleString()}
            </span>
          </div>
        ) : null}
      </ReviewSection>

      {/* Step 5: Medicaid */}
      <ReviewSection title="Medicaid" stepNumber={5} onEdit={onEditStep}>
        <ReviewRow
          label="Application Type"
          value={referralData.medicaid_application_type === 'new' ? 'New Application'
            : referralData.medicaid_application_type === 'renewal' ? 'Renewal'
            : undefined}
        />
        <ReviewRow label="Date of Need" value={referralData.medicaid_date_of_need} />
        <ReviewRow label="Application Date" value={referralData.medicaid_application_date} />
        <ReviewRow label="Application Number" value={referralData.medicaid_application_number} />
        <ReviewRow label="Case Number" value={referralData.medicaid_case_number} />
        <ReviewRow label="Current Status" value={referralData.medicaid_current_status} />
        <ReviewRow label="Filed By" value={referralData.medicaid_filed_by} />
        <ReviewRow label="Contact Name" value={referralData.medicaid_contact_name} />
        <ReviewRow label="Contact Address" value={referralData.medicaid_contact_address} />
        <ReviewRow label="Contact Phone" value={referralData.medicaid_contact_phone} />
        <ReviewRow label="Contact Email" value={referralData.medicaid_contact_email} />
        <ReviewRow label="MyACCESS Login" value={referralData.medicaid_myaccess_login} />
        <ReviewRow label="Documents Uploaded" value={referralData.medicaid_documents_uploaded} />
        <ReviewRow label="Comments" value={referralData.medicaid_comments} />
      </ReviewSection>

      {/* Step 6: Documents & Uploads */}
      <ReviewSection title="Documents & Uploads" stepNumber={6} onEdit={onEditStep}>
        <ReviewRow label="Notes" value={referralData.notes} />
      </ReviewSection>

      {/* Signature & Certification */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-semibold">Submission Certification</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="submitter-name">Your Name *</Label>
              <Input
                id="submitter-name"
                value={submitterName}
                onChange={e => setSubmitterName(e.target.value)}
                placeholder="First Last"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="submitter-company">Company / Organization</Label>
              <Input
                id="submitter-company"
                value={submitterCompany}
                onChange={e => setSubmitterCompany(e.target.value)}
                placeholder="Facility or organization name"
              />
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg border border-input bg-muted/30">
            <Checkbox
              id="certify"
              checked={certify}
              onCheckedChange={v => setCertify(!!v)}
              className="mt-0.5"
            />
            <Label htmlFor="certify" className="text-sm leading-relaxed cursor-pointer">
              I certify that the information provided in this referral is accurate and complete
              to the best of my knowledge. I understand that this referral will be reviewed by
              Zacharia Frey PLLC and that submitting false information may affect the handling
              of this case.
            </Label>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Separator />

          <Button
            type="button"
            className="w-full"
            size="lg"
            disabled={isSaving || !certify}
            onClick={handleSubmit}
          >
            {isSaving
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
              : <><ClipboardCheck className="w-4 h-4 mr-2" /> Submit Referral</>
            }
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Submitted referrals are routed to{' '}
            <a href="mailto:intake@zachariafreylaw.com" className="text-primary">
              intake@zachariafreylaw.com
            </a>
            . You will receive a confirmation and can track status in your dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
