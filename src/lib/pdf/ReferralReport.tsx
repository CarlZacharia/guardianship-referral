import React from 'react'
import {
  Document, Page, View, Text, StyleSheet,
} from '@react-pdf/renderer'
import { format } from 'date-fns'
import {
  Referral, REFERRAL_TYPE_LABELS, CAPACITY_LABELS,
  ASSET_TYPE_LABELS, STATUS_LABELS, URGENCY_LABELS,
} from '@/lib/types/referral.types'
import { getReferralWarnings, getReferralNextSteps } from '@/lib/referral-alerts'

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */
const s = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', color: '#1a1a1a' },
  // Header
  header: { marginBottom: 20 },
  title: { fontSize: 18, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  subtitle: { fontSize: 10, color: '#666', marginBottom: 2 },
  badge: { fontSize: 9, color: '#444', marginTop: 4 },
  // Sections
  section: { marginBottom: 14 },
  sectionTitle: {
    fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#333',
    borderBottomWidth: 1, borderBottomColor: '#ddd', paddingBottom: 3, marginBottom: 6,
  },
  // Field rows
  row: { flexDirection: 'row', marginBottom: 3 },
  label: { width: '35%', color: '#666' },
  value: { width: '65%', fontFamily: 'Helvetica-Bold' },
  // Tables (assets, family)
  tableRow: {
    flexDirection: 'row', paddingVertical: 3, paddingHorizontal: 4,
    borderBottomWidth: 0.5, borderBottomColor: '#eee',
  },
  tableHeader: { backgroundColor: '#f5f5f5', fontFamily: 'Helvetica-Bold' },
  // Alerts
  alertBox: { marginBottom: 14, borderWidth: 1, borderRadius: 4, overflow: 'hidden' },
  alertHeader: { flexDirection: 'row', paddingVertical: 5, paddingHorizontal: 8 },
  alertHeaderText: { fontSize: 10, fontFamily: 'Helvetica-Bold' },
  alertBody: { paddingHorizontal: 8, paddingVertical: 6 },
  alertItem: { flexDirection: 'row', marginBottom: 4 },
  alertBullet: { width: 12, fontSize: 10 },
  alertMessage: { flex: 1, fontSize: 9 },
  alertNone: { fontSize: 9, color: '#888' },
  // Warning colors
  warningBox: { borderColor: '#ef4444' },
  warningHeader: { backgroundColor: '#fef2f2' },
  warningText: { color: '#b91c1c' },
  // Next steps colors
  nextStepBox: { borderColor: '#1e3a8a' },
  nextStepHeader: { backgroundColor: '#eff6ff' },
  nextStepText: { color: '#1e3a8a' },
  // Footer
  footer: { position: 'absolute', bottom: 25, left: 40, right: 40, fontSize: 8, color: '#999', textAlign: 'center' },
})

/* ------------------------------------------------------------------ */
/*  Helper components                                                  */
/* ------------------------------------------------------------------ */
function Field({ label, value }: { label: string; value?: string | number | boolean | null }) {
  if (value === undefined || value === null || value === '') return null
  const display = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)
  return (
    <View style={s.row}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.value}>{display}</Text>
    </View>
  )
}

function SectionTitle({ children }: { children: string }) {
  return <Text style={s.sectionTitle}>{children}</Text>
}

function fmtDate(d?: string | null) {
  if (!d) return undefined
  try { return format(new Date(d), 'MMM d, yyyy') } catch { return d }
}

function fmtMoney(v?: number | null) {
  if (v === undefined || v === null) return undefined
  return `$${v.toLocaleString()}`
}

/* ------------------------------------------------------------------ */
/*  Main Document                                                      */
/* ------------------------------------------------------------------ */
interface Props {
  referral: Referral & { profiles?: any; facilities?: any }
}

export function ReferralReport({ referral }: Props) {
  const clientName =
    referral.client_full_legal_name ||
    `${referral.client_first_name ?? ''} ${referral.client_last_name ?? ''}`.trim() ||
    'Client name pending'

  const warnings = getReferralWarnings(referral)
  const nextSteps = getReferralNextSteps(referral)

  return (
    <Document>
      <Page size="LETTER" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>{clientName}</Text>
          {referral.referral_type && (
            <Text style={s.subtitle}>
              {REFERRAL_TYPE_LABELS[referral.referral_type]}
            </Text>
          )}
          <Text style={s.badge}>
            Status: {STATUS_LABELS[referral.status!]}
            {referral.urgency && referral.urgency !== 'routine' ? `  ·  ${URGENCY_LABELS[referral.urgency]}` : ''}
            {referral.submitted_at ? `  ·  Submitted ${fmtDate(referral.submitted_at)}` : ''}
          </Text>
          {referral.submitted_by_name && (
            <Text style={s.badge}>
              Submitted by: {referral.submitted_by_name}
              {referral.submitted_by_company ? ` · ${referral.submitted_by_company}` : ''}
            </Text>
          )}
          {referral.reason_for_request && (
            <View style={{ marginTop: 8 }}>
              <Text style={{ fontSize: 9, color: '#666' }}>Reason for Request</Text>
              <Text style={{ fontSize: 10, marginTop: 2 }}>{referral.reason_for_request}</Text>
            </View>
          )}
        </View>

        {/* Warnings */}
        <View style={[s.alertBox, s.warningBox]}>
          <View style={[s.alertHeader, s.warningHeader]}>
            <Text style={[s.alertHeaderText, s.warningText]}>Warnings and Issues</Text>
          </View>
          <View style={s.alertBody}>
            {warnings.length === 0 ? (
              <Text style={s.alertNone}>No warnings or issues at this time.</Text>
            ) : (
              warnings.map((w) => (
                <View key={w.key} style={s.alertItem}>
                  <Text style={[s.alertBullet, s.warningText]}>!</Text>
                  <Text style={[s.alertMessage, s.warningText]}>{w.message}</Text>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Next Steps */}
        <View style={[s.alertBox, s.nextStepBox]}>
          <View style={[s.alertHeader, s.nextStepHeader]}>
            <Text style={[s.alertHeaderText, s.nextStepText]}>Next Steps Required</Text>
          </View>
          <View style={s.alertBody}>
            {nextSteps.length === 0 ? (
              <Text style={s.alertNone}>No next steps required at this time.</Text>
            ) : (
              nextSteps.map((ns) => (
                <View key={ns.key} style={s.alertItem}>
                  <Text style={[s.alertBullet, s.nextStepText]}>•</Text>
                  <Text style={[s.alertMessage, s.nextStepText]}>{ns.message}</Text>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Client Identity */}
        <View style={s.section}>
          <SectionTitle>Client Information</SectionTitle>
          <Field label="Full Legal Name" value={referral.client_full_legal_name} />
          <Field label="Date of Birth" value={fmtDate(referral.client_dob)} />
          <Field label="Age" value={referral.client_age ? `${referral.client_age} years` : undefined} />
          <Field label="Sex" value={referral.client_sex} />
          <Field label="SSN (Last 4)" value={referral.client_ssn_last4 ? `***-**-${referral.client_ssn_last4}` : undefined} />
          <Field label="Language" value={referral.client_language} />
          <Field label="County" value={referral.client_county} />
          <Field label="Phone" value={referral.client_phone} />
          <Field label="Email" value={referral.client_email} />
        </View>

        {/* Addresses */}
        {(referral.client_home_address || referral.client_current_address) && (
          <View style={s.section}>
            <SectionTitle>Addresses</SectionTitle>
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
          </View>
        )}

        {/* Facility */}
        <View style={s.section}>
          <SectionTitle>Facility Account</SectionTitle>
          <Field label="Facility" value={referral.facilities?.name || referral.facility_name_freetext} />
          <Field label="Admission Date" value={fmtDate(referral.admission_date)} />
          <Field label="Amount Owed" value={fmtMoney(referral.amount_owed_facility)} />
          <Field label="Monthly Cost" value={fmtMoney(referral.facility_monthly_cost)} />
        </View>

        {/* Medical & Capacity */}
        {referral.capacity_level && (
          <View style={s.section}>
            <SectionTitle>Medical & Capacity</SectionTitle>
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
          </View>
        )}

        {/* Financial */}
        <View style={s.section}>
          <SectionTitle>Financial</SectionTitle>
          <Field label="Gross Monthly Income" value={fmtMoney(referral.monthly_income)} />
          <Field label="Medical Insurance" value={referral.medical_insurance_cost ? `${fmtMoney(referral.medical_insurance_cost)}/mo` : undefined} />
          <Field label="Medicaid Status" value={referral.medicaid_status} />
          <Field label="Rep Payee" value={referral.rep_payee_status} />
          <Field label="VA Benefits" value={referral.va_benefits} />
          {referral.va_benefit_details && (
            <Field label="VA Details" value={referral.va_benefit_details} />
          )}
        </View>

        {/* Assets */}
        {referral.assets && referral.assets.length > 0 && (
          <View style={s.section}>
            <SectionTitle>Assets</SectionTitle>
            <View style={[s.tableRow, s.tableHeader]}>
              <Text style={{ width: '35%' }}>Type</Text>
              <Text style={{ width: '35%' }}>Institution / Description</Text>
              <Text style={{ width: '30%', textAlign: 'right' }}>Value</Text>
            </View>
            {referral.assets.map((asset: any, i: number) => (
              <View key={i} style={s.tableRow}>
                <Text style={{ width: '35%' }}>{ASSET_TYPE_LABELS[asset.asset_type as keyof typeof ASSET_TYPE_LABELS] || asset.asset_type}</Text>
                <Text style={{ width: '35%' }}>{[asset.institution, asset.description].filter(Boolean).join(' · ') || '—'}</Text>
                <Text style={{ width: '30%', textAlign: 'right' }}>{asset.approximate_value ? fmtMoney(asset.approximate_value) : '—'}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Spouse */}
        {referral.is_married && (
          <View style={s.section}>
            <SectionTitle>Spouse</SectionTitle>
            <Field label="Spouse Name" value={referral.spouse_name} />
            <Field label="Spouse DOB" value={fmtDate(referral.spouse_dob)} />
            <Field label="Spouse Phone" value={referral.spouse_phone} />
          </View>
        )}

        {/* Family */}
        {referral.family_members && referral.family_members.length > 0 && (
          <View style={s.section}>
            <SectionTitle>Family & Contacts</SectionTitle>
            {referral.family_members.map((fm: any, i: number) => (
              <View key={i} style={s.row}>
                <Text style={s.label}>{fm.relationship}</Text>
                <Text style={s.value}>
                  {fm.full_name}{fm.phone ? ` · ${fm.phone}` : ''}{fm.address ? ` · ${fm.address}` : ''}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Legal Documents */}
        <View style={s.section}>
          <SectionTitle>Legal Documents</SectionTitle>
          <Field label="Power of Attorney" value={referral.has_poa} />
          {referral.has_poa && <Field label="POA Agent" value={referral.poa_agent_name} />}
          <Field label="Health Care Surrogate" value={referral.has_hc_surrogate} />
          {referral.has_hc_surrogate && <Field label="Surrogate Name" value={referral.hc_surrogate_name} />}
          <Field label="Living Will" value={referral.has_living_will} />
          <Field label="Trust" value={referral.has_trust} />
          {referral.has_trust && <Field label="Trust Type" value={referral.trust_type} />}
          <Field label="Prior Guardianship" value={referral.has_prior_guardianship} />
          {referral.has_prior_guardianship && <Field label="Details" value={referral.prior_guardianship_details} />}
          <Field label="Existing Guardian" value={referral.existing_guardian_name} />
          <Field label="Disability Benefits" value={referral.disability_benefits} />
          <Field label="Veterans Services" value={referral.veteran_services} />
          <Field label="Special Needs" value={referral.special_needs} />
        </View>

        {/* Medicaid */}
        {referral.referral_type && referral.referral_type !== 'guardianship' && (
          <View style={s.section}>
            <SectionTitle>Medicaid</SectionTitle>
            <Field label="Date of Need" value={fmtDate(referral.medicaid_date_of_need)} />
            <Field label="Application Type" value={referral.medicaid_application_type} />
            <Field label="Application #" value={referral.medicaid_application_number} />
            <Field label="Case #" value={referral.medicaid_case_number} />
            <Field label="Current Status" value={referral.medicaid_current_status} />
            <Field label="Application Date" value={fmtDate(referral.medicaid_application_date)} />
            <Field label="Filed By" value={referral.medicaid_filed_by} />
            <Field label="Contact" value={
              [referral.medicaid_contact_name, referral.medicaid_contact_phone, referral.medicaid_contact_email].filter(Boolean).join(' · ') || undefined
            } />
            <Field label="Comments" value={referral.medicaid_comments} />
          </View>
        )}

        {/* Notes */}
        {referral.notes && (
          <View style={s.section}>
            <SectionTitle>Notes & Comments</SectionTitle>
            <Text>{referral.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={s.footer} fixed>
          Zacharia Brown Guardianship Referral Report — Generated {format(new Date(), 'MMM d, yyyy h:mm a')}
        </Text>
      </Page>
    </Document>
  )
}
