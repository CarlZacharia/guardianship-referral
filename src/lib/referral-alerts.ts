// Shared warnings & next-steps logic used by Step7ReviewSubmit and PDF report.

import { Referral, INCOME_LIMIT } from '@/lib/types/referral.types'

export interface ReferralWarning {
  key: string
  message: string
}

export interface ReferralNextStep {
  key: string
  message: string
}

/**
 * Compute warnings for a referral based on its current data.
 */
export function getReferralWarnings(data: Partial<Referral>): ReferralWarning[] {
  const warnings: ReferralWarning[] = []

  const noCapacity = data.capacity_level === 'no_capacity'
  const noPOA = !data.has_poa
  const noGuardian = !data.has_prior_guardianship

  if (noCapacity && noPOA && noGuardian) {
    warnings.push({
      key: 'agent',
      message:
        'There is currently not a decision maker with the ability and authority to sign the DCF documents and to obtain the documentation required by DCF.',
    })
  }

  const incomeOverLimit = (data.monthly_income || 0) > INCOME_LIMIT.income_limit
  const noQIT = !(data as any).has_qit
  if (incomeOverLimit && noQIT) {
    warnings.push({
      key: 'qit',
      message:
        "The applicant's income is over the income limit. A qualified income trust is mandatory and must be obtained soon.",
    })
  }

  return warnings
}

/**
 * Compute next steps for a referral based on its current data.
 * Returns plain-text messages (no JSX) so they can be used in PDFs.
 */
export function getReferralNextSteps(data: Partial<Referral>): ReferralNextStep[] {
  const steps: ReferralNextStep[] = []

  const noCapacity = data.capacity_level === 'no_capacity'
  const noPOA = !data.has_poa
  const noGuardian = !data.has_prior_guardianship
  const hasPOA = !!data.has_poa
  const hasCapacity = data.capacity_level === 'has_capacity'

  const uploadedDocTypes = new Set(
    (data.documents || []).map((d) => d.doc_type),
  )
  const hasPOAUploaded = uploadedDocTypes.has('poa')
  const hasFinReleaseUploaded = uploadedDocTypes.has('financial_disclosure')
  const hasDesigRepUploaded = uploadedDocTypes.has('designation_of_rep')
  const hasAuthDiscloseUploaded = uploadedDocTypes.has('authorization_to_disclose')

  const incomeOverLimit = (data.monthly_income || 0) > INCOME_LIMIT.income_limit
  const noQIT = !(data as any).has_qit

  if (noCapacity && noPOA && noGuardian) {
    steps.push({
      key: 'agent',
      message:
        'There is no one with authority to obtain the documentation and sign documents required by DCF. A guardian must be sought immediately.',
    })
  }

  if (incomeOverLimit && noQIT) {
    steps.push({
      key: 'qit',
      message: 'Obtain a QIT immediately.',
    })
  }

  if (hasPOA && !hasPOAUploaded) {
    steps.push({
      key: 'poa-upload',
      message:
        'Please upload a copy of the Executed Power of Attorney immediately for review.',
    })
  }

  if (!hasFinReleaseUploaded && hasCapacity) {
    steps.push({
      key: 'fin-release-capacity',
      message:
        'Have the applicant sign the financial release and upload it immediately.',
    })
  }

  if (!hasFinReleaseUploaded && hasPOA) {
    steps.push({
      key: 'fin-release-poa',
      message:
        'Have the power of attorney agent sign the financial release and upload it immediately.',
    })
  }

  if (!hasDesigRepUploaded && hasCapacity) {
    steps.push({
      key: 'desig-rep-capacity',
      message:
        'Have the applicant sign the designation of representative form and upload it immediately.',
    })
  }

  if (!hasDesigRepUploaded && hasPOA) {
    steps.push({
      key: 'desig-rep-poa',
      message:
        'Have the financial power of attorney agent sign the designation of representative form and upload it immediately.',
    })
  }

  if (!hasAuthDiscloseUploaded && hasCapacity) {
    steps.push({
      key: 'auth-disclose-capacity',
      message:
        'Have the applicant sign the authorization to disclose information and upload it immediately.',
    })
  }

  if (!hasAuthDiscloseUploaded && hasPOA) {
    steps.push({
      key: 'auth-disclose-poa',
      message:
        'Have the power of attorney agent sign the authorization to disclose information and upload it immediately.',
    })
  }

  return steps
}
