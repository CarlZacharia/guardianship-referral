// src/lib/pdf/fillPdfForm.ts
// Utility for loading an existing PDF form and populating fields from referral data.

import { PDFDocument } from 'pdf-lib'
import type { Referral } from '@/lib/types/referral.types'

// ---------------------------------------------------------------------------
// 1.  Discover field names (development helper)
// ---------------------------------------------------------------------------

/** Load a PDF and return every form-field name + type. Useful for mapping. */
export async function listPdfFormFields(pdfBytes: ArrayBuffer) {
  const pdf = await PDFDocument.load(pdfBytes)
  const form = pdf.getForm()
  return form.getFields().map(f => ({
    name: f.getName(),
    type: f.constructor.name, // e.g. PDFTextField, PDFCheckBox, PDFRadioGroup
  }))
}

// ---------------------------------------------------------------------------
// 2.  Field mapping: referral data → PDF field names
// ---------------------------------------------------------------------------
// Update the keys below to match the actual field names in your combined PDF.
// Run `listPdfFormFields` once to discover them, then fill in this map.

type FieldMapper = (r: Partial<Referral>) => string

/**
 * Maps PDF form field names → functions that pull the value from a Referral.
 *
 * Add / remove entries as needed once you know the real field names in
 * your combined PDF.
 */
const FIELD_MAP: Record<string, FieldMapper> = {
  'medicaidcaseno': r => r.medicaid_case_number || '',
  'applicantname': r =>
    r.client_full_legal_name ||
    [r.client_first_name, r.client_last_name].filter(Boolean).join(' '),
  'addressline1': r => r.client_home_address || '',
  'addressline2': r =>
    [r.client_home_city, r.client_home_state, r.client_home_zip].filter(Boolean).join(', '),
  'dob': r => r.client_dob || '',
  'ssn': r => r.client_ssn_last4 ? `***-**-${r.client_ssn_last4}` : '',
  'phone': r => r.client_phone || '',
}

// ---------------------------------------------------------------------------
// 3.  Fill the PDF
// ---------------------------------------------------------------------------

export interface FillPdfOptions {
  /** If true, flatten the form so fields are no longer editable. Default true. */
  flatten?: boolean
}

/**
 * Load a PDF form template, populate fields from a Referral, and return the
 * filled PDF as a Uint8Array (ready for download or upload).
 */
export async function fillPdfForm(
  templateBytes: ArrayBuffer,
  referral: Partial<Referral>,
  opts: FillPdfOptions = {},
) {
  const { flatten = true } = opts

  const pdf = await PDFDocument.load(templateBytes)
  const form = pdf.getForm()

  for (const [fieldName, getValue] of Object.entries(FIELD_MAP)) {
    try {
      const field = form.getTextField(fieldName)
      field.setText(getValue(referral))
    } catch {
      // Field not found in this PDF — skip silently.
      // During development you can console.warn here to catch typos.
      console.warn(`[fillPdfForm] field "${fieldName}" not found in PDF — skipping`)
    }
  }

  if (flatten) form.flatten()

  return pdf.save()
}

// ---------------------------------------------------------------------------
// 4.  Convenience: fetch template from public/ and fill
// ---------------------------------------------------------------------------

/**
 * Fetch a PDF template from a URL (e.g. `/forms/guardianship-packet.pdf`),
 * fill it with referral data, and return the result as a Uint8Array.
 */
export async function fillPdfFromUrl(
  templateUrl: string,
  referral: Partial<Referral>,
  opts?: FillPdfOptions,
) {
  const res = await fetch(templateUrl)
  if (!res.ok) throw new Error(`Failed to fetch PDF template: ${res.statusText}`)
  const templateBytes = await res.arrayBuffer()
  return fillPdfForm(templateBytes, referral, opts)
}

// ---------------------------------------------------------------------------
// 5.  Trigger browser download
// ---------------------------------------------------------------------------

/** Create a blob from filled PDF bytes and trigger a download in the browser. */
export function downloadPdf(pdfBytes: Uint8Array, filename: string) {
  const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
