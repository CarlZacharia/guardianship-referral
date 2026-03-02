// supabase/functions/send-referral-report/index.ts
// Edge Function: generates a PDF referral report and emails it
// Triggered by database webhook when referral status → 'submitted'

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";

// ─── Constants ───────────────────────────────────────────────────────
const FIRM_EMAIL = "intake@zacfreylaw.com";
const PNA = 160;

const REFERRAL_TYPE_LABELS: Record<string, string> = {
  guardianship: "Guardianship Only",
  medicaid: "Medicaid Only",
  both: "Guardianship & Medicaid",
};

const CAPACITY_LABELS: Record<string, string> = {
  no_capacity: "No Capacity",
  limited_capacity: "Limited Capacity",
  substance_abuse: "Substance Abuse",
  has_capacity: "Has Capacity",
};

const URGENCY_LABELS: Record<string, string> = {
  routine: "Routine",
  urgent: "Urgent",
  emergency: "Emergency",
};

const ASSET_TYPE_LABELS: Record<string, string> = {
  checking: "Checking Account",
  savings: "Savings Account",
  cd: "Certificate of Deposit (CD)",
  money_market: "Money Market Account",
  real_estate_primary: "Primary Residence",
  real_estate_other: "Other Real Estate",
  vehicle: "Vehicle",
  retirement_ira: "IRA",
  retirement_401k: "401(k) / Pension",
  life_insurance: "Life Insurance (Cash Value)",
  annuity: "Annuity",
  investment: "Investment / Brokerage Account",
  prepaid_funeral: "Prepaid Funeral",
  personal_property: "Personal Property",
  other: "Other",
};

// ─── PDF Helper ──────────────────────────────────────────────────────
class PDFBuilder {
  private doc!: PDFDocument;
  private page!: ReturnType<PDFDocument["addPage"]>;
  private font!: Awaited<ReturnType<PDFDocument["embedFont"]>>;
  private boldFont!: Awaited<ReturnType<PDFDocument["embedFont"]>>;
  private y = 0;
  private readonly pageWidth = 612; // Letter width in points
  private readonly pageHeight = 792; // Letter height in points
  private readonly margin = 54; // 0.75 inch
  private readonly lineHeight = 14;
  private readonly contentWidth: number;

  constructor() {
    this.contentWidth = this.pageWidth - this.margin * 2;
  }

  async init() {
    this.doc = await PDFDocument.create();
    this.font = await this.doc.embedFont(StandardFonts.Helvetica);
    this.boldFont = await this.doc.embedFont(StandardFonts.HelveticaBold);
    this.addPage();
  }

  private addPage() {
    this.page = this.doc.addPage([this.pageWidth, this.pageHeight]);
    this.y = this.pageHeight - this.margin;
  }

  private ensureSpace(needed: number) {
    if (this.y - needed < this.margin + 20) {
      this.addPage();
    }
  }

  drawHeader(firmName: string, reportTitle: string, typeLine: string) {
    // Firm name
    this.page.drawText(firmName, {
      x: this.margin,
      y: this.y,
      size: 16,
      font: this.boldFont,
      color: rgb(0.1, 0.1, 0.4),
    });
    this.y -= 20;

    // Report title
    this.page.drawText(reportTitle, {
      x: this.margin,
      y: this.y,
      size: 12,
      font: this.boldFont,
    });
    this.y -= 16;

    // Referral type
    this.page.drawText(typeLine, {
      x: this.margin,
      y: this.y,
      size: 10,
      font: this.font,
      color: rgb(0.4, 0.4, 0.4),
    });
    this.y -= 12;

    // Separator line
    this.page.drawLine({
      start: { x: this.margin, y: this.y },
      end: { x: this.pageWidth - this.margin, y: this.y },
      thickness: 1,
      color: rgb(0.7, 0.7, 0.7),
    });
    this.y -= 16;
  }

  drawSectionTitle(title: string) {
    this.ensureSpace(30);
    this.y -= 6;
    this.page.drawText(title.toUpperCase(), {
      x: this.margin,
      y: this.y,
      size: 9,
      font: this.boldFont,
      color: rgb(0.2, 0.2, 0.6),
    });
    this.y -= 4;
    this.page.drawLine({
      start: { x: this.margin, y: this.y },
      end: { x: this.pageWidth - this.margin, y: this.y },
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.8),
    });
    this.y -= 14;
  }

  drawField(label: string, value?: string | number | boolean | null) {
    if (value === undefined || value === null || value === "") return;
    const display =
      typeof value === "boolean" ? (value ? "Yes" : "No") : String(value);

    this.ensureSpace(this.lineHeight + 2);

    // Label
    this.page.drawText(label + ":", {
      x: this.margin + 8,
      y: this.y,
      size: 9,
      font: this.font,
      color: rgb(0.4, 0.4, 0.4),
    });

    // Value — wrap if needed
    const labelWidth = 150;
    const valueX = this.margin + labelWidth;
    const maxValueWidth = this.contentWidth - labelWidth - 8;
    const lines = this.wrapText(display, 9, maxValueWidth);

    for (let i = 0; i < lines.length; i++) {
      this.ensureSpace(this.lineHeight);
      this.page.drawText(lines[i], {
        x: valueX,
        y: this.y,
        size: 9,
        font: this.boldFont,
      });
      if (i < lines.length - 1) this.y -= this.lineHeight;
    }
    this.y -= this.lineHeight;
  }

  drawText(text: string, options?: { bold?: boolean; indent?: number; color?: [number, number, number] }) {
    const size = 9;
    const maxWidth = this.contentWidth - (options?.indent || 0);
    const lines = this.wrapText(text, size, maxWidth);

    for (const line of lines) {
      this.ensureSpace(this.lineHeight);
      this.page.drawText(line, {
        x: this.margin + (options?.indent || 8),
        y: this.y,
        size,
        font: options?.bold ? this.boldFont : this.font,
        color: options?.color ? rgb(...options.color) : undefined,
      });
      this.y -= this.lineHeight;
    }
  }

  drawSpacer(height = 8) {
    this.y -= height;
  }

  private wrapText(text: string, fontSize: number, maxWidth: number): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const width = this.font.widthOfTextAtSize(testLine, fontSize);
      if (width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines.length > 0 ? lines : [""];
  }

  async save(): Promise<Uint8Array> {
    return await this.doc.save();
  }
}

// ─── PDF Generation ──────────────────────────────────────────────────
async function generatePdf(referral: any, referrerProfile: any): Promise<Uint8Array> {
  const pdf = new PDFBuilder();
  await pdf.init();

  const clientName =
    referral.client_full_legal_name ||
    `${referral.client_first_name || ""} ${referral.client_last_name || ""}`.trim() ||
    "Unknown";
  const typeLabel = REFERRAL_TYPE_LABELS[referral.referral_type] || "Unknown";

  // Header
  pdf.drawHeader(
    "Zacharia Brown ",
    `Referral Report for ${clientName}`,
    typeLabel
  );

  // ── Referral Summary ──
  pdf.drawSectionTitle("Referral Summary");
  pdf.drawField("Facility", referral.facilities?.name || referral.facility_name_freetext);
  pdf.drawField("Urgency", URGENCY_LABELS[referral.urgency]);
  pdf.drawField("Case Type", typeLabel);
  pdf.drawField("Submitted By", referral.submitted_by_name);
  pdf.drawField("Organization", referral.submitted_by_company);
  pdf.drawField("Submitted Date", referral.submitted_date);
  if (referrerProfile) {
    pdf.drawField("Referrer", `${referrerProfile.first_name} ${referrerProfile.last_name}`);
    pdf.drawField("Referrer Email", referrerProfile.email);
    pdf.drawField("Referrer Org", referrerProfile.organization);
  }

  // ── Client Identity ──
  pdf.drawSectionTitle("Client Identity");
  pdf.drawField("Full Legal Name", referral.client_full_legal_name);
  pdf.drawField("First Name", referral.client_first_name);
  pdf.drawField("Last Name", referral.client_last_name);
  pdf.drawField("Date of Birth", referral.client_dob);
  pdf.drawField("Age", referral.client_age ? `${referral.client_age} years` : null);
  pdf.drawField("Sex", referral.client_sex);
  pdf.drawField("SSN (Last 4)", referral.client_ssn_last4 ? `***-**-${referral.client_ssn_last4}` : null);
  pdf.drawField("Language", referral.client_language);
  pdf.drawField("County", referral.client_county);
  pdf.drawField("Citizenship", referral.client_citizenship);
  pdf.drawField("Phone", referral.client_phone);
  pdf.drawField("Email", referral.client_email);

  // ── Addresses ──
  pdf.drawSectionTitle("Addresses");
  const homeAddr = [referral.client_home_address, referral.client_home_city, referral.client_home_state, referral.client_home_zip].filter(Boolean).join(", ");
  const currentAddr = [referral.client_current_address, referral.client_current_city, referral.client_current_state, referral.client_current_zip].filter(Boolean).join(", ");
  pdf.drawField("Home Address", homeAddr || null);
  pdf.drawField("Current Address", currentAddr || null);

  // ── Facility Account ──
  pdf.drawSectionTitle("Facility Account");
  pdf.drawField("Facility", referral.facilities?.name || referral.facility_name_freetext);
  pdf.drawField("Admission Date", referral.admission_date);
  pdf.drawField("Amount Owed", referral.amount_owed_facility ? `$${Number(referral.amount_owed_facility).toLocaleString()}` : null);
  pdf.drawField("Monthly Cost", referral.facility_monthly_cost ? `$${Number(referral.facility_monthly_cost).toLocaleString()}` : null);

  // ── Spouse ──
  if (referral.is_married) {
    pdf.drawSectionTitle("Spouse Information");
    pdf.drawField("Spouse Name", referral.spouse_name);
    pdf.drawField("Spouse DOB", referral.spouse_dob);
    pdf.drawField("Spouse SSN (Last 4)", referral.spouse_ssn_last4 ? `***-**-${referral.spouse_ssn_last4}` : null);
    pdf.drawField("Spouse Phone", referral.spouse_phone);
    pdf.drawField("Spouse Email", referral.spouse_email);
    pdf.drawField("Spouse Address", referral.spouse_address);
  }

  // ── Family Members ──
  if (referral.family_members?.length > 0) {
    pdf.drawSectionTitle("Family Members");
    for (const fm of referral.family_members) {
      const parts = [
        fm.relationship ? fm.relationship.charAt(0).toUpperCase() + fm.relationship.slice(1) : "",
        fm.full_name,
        fm.phone,
        fm.email,
        [fm.address, fm.city, fm.state, fm.zip].filter(Boolean).join(", "),
      ].filter(Boolean);
      pdf.drawText(parts.join(" | "), { indent: 8 });
      if (fm.notes) pdf.drawText(`  Notes: ${fm.notes}`, { indent: 16, color: [0.4, 0.4, 0.4] });
    }
  }

  // ── Legal Documents ──
  pdf.drawSectionTitle("Legal Documents & Agents");
  pdf.drawField("Power of Attorney", referral.has_poa);
  if (referral.has_poa) {
    pdf.drawField("POA Agent", referral.poa_agent_name);
    pdf.drawField("POA Date Executed", referral.poa_date_executed);
    pdf.drawField("POA Contact", referral.poa_contact);
  }
  pdf.drawField("Health Care Surrogate", referral.has_hc_surrogate);
  if (referral.has_hc_surrogate) {
    pdf.drawField("HC Surrogate Name", referral.hc_surrogate_name);
    pdf.drawField("HC Surrogate Date", referral.hc_surrogate_date_executed);
    pdf.drawField("HC Surrogate Contact", referral.hc_surrogate_contact);
  }
  pdf.drawField("Living Will", referral.has_living_will);
  if (referral.has_living_will) {
    pdf.drawField("Living Will Agent", referral.living_will_agent_name);
    pdf.drawField("Living Will Date", referral.living_will_date_executed);
    pdf.drawField("Living Will Contact", referral.living_will_contact);
  }
  pdf.drawField("Trust", referral.has_trust);
  if (referral.has_trust) {
    pdf.drawField("Trust Type", referral.trust_type);
    pdf.drawField("Trustee", referral.trust_trustee_name);
    pdf.drawField("Trust Date", referral.trust_date_executed);
    pdf.drawField("Trust Contact", referral.trust_contact);
  }
  pdf.drawField("Prior Guardianship", referral.has_prior_guardianship);
  if (referral.has_prior_guardianship) {
    pdf.drawField("Details", referral.prior_guardianship_details);
    pdf.drawField("Existing Guardian", referral.existing_guardian_name);
    pdf.drawField("Guardianship Date", referral.guardianship_date_executed);
    pdf.drawField("Guardianship Contact", referral.guardianship_contact);
  }

  // ── Support Services ──
  pdf.drawSectionTitle("Support Services");
  pdf.drawField("Disability Benefits", referral.disability_benefits);
  pdf.drawField("Veteran Services", referral.veteran_services);
  pdf.drawField("Other Services", referral.other_services);
  pdf.drawField("Educational Background", referral.educational_background);
  pdf.drawField("Employment Status", referral.employment_status);
  pdf.drawField("Employment History", referral.employment_history);
  pdf.drawField("Special Needs", referral.special_needs);
  pdf.drawField("Legal Rep", referral.legal_rep_name);
  pdf.drawField("Legal Rep Contact", referral.legal_rep_contact);

  // ── Medical & Capacity ──
  if (referral.referral_type === "guardianship" || referral.referral_type === "both") {
    pdf.drawSectionTitle("Medical & Capacity");
    pdf.drawField("Capacity Level", CAPACITY_LABELS[referral.capacity_level]);
    pdf.drawField("BIMS Score", referral.bims_score);
    pdf.drawField("DNR", referral.dnr);
    pdf.drawField("Diagnoses", referral.diagnoses);
    pdf.drawField("Allergies", referral.allergies);
    pdf.drawField("Medications", referral.medications);
    pdf.drawField("Mental Health History", referral.mental_health_history);
    pdf.drawField("Physician", referral.physician_name);
    pdf.drawField("Physician Address", referral.physician_address);
    pdf.drawField("Physician Phone", referral.physician_phone);
  }

  // ── Financial ──
  pdf.drawSectionTitle("Financial");

  // Income entries
  if (referral.income_entries?.length > 0) {
    pdf.drawText("Income Entries:", { bold: true, indent: 8 });
    for (const entry of referral.income_entries) {
      if (entry.description || entry.amount) {
        pdf.drawText(
          `  ${entry.description || "—"}: $${(entry.amount || 0).toFixed(2)}`,
          { indent: 16 }
        );
      }
    }
  }
  pdf.drawField("Total Gross Income", referral.monthly_income ? `$${Number(referral.monthly_income).toFixed(2)}` : null);

  // Insurance entries
  if (referral.medical_insurance_entries?.length > 0) {
    pdf.drawText("Medical Insurance Entries:", { bold: true, indent: 8 });
    for (const entry of referral.medical_insurance_entries) {
      if (entry.description || entry.amount) {
        pdf.drawText(
          `  ${entry.description || "—"}: $${(entry.amount || 0).toFixed(2)}`,
          { indent: 16 }
        );
      }
    }
  }
  pdf.drawField("Total Medical Insurance", referral.medical_insurance_cost ? `$${Number(referral.medical_insurance_cost).toFixed(2)}` : null);

  // Private pay calculation
  if (referral.monthly_income || referral.medical_insurance_cost) {
    const income = Number(referral.monthly_income || 0);
    const insurance = Number(referral.medical_insurance_cost || 0);
    const privatePay = income - insurance - PNA;
    pdf.drawSpacer(4);
    pdf.drawText(`Private Pay: $${income.toFixed(2)} - $${insurance.toFixed(2)} - $${PNA.toFixed(2)} = $${privatePay.toFixed(2)}`, { bold: true, indent: 8 });
  }

  pdf.drawSpacer(4);
  pdf.drawField("Medicaid Status", referral.medicaid_status);
  pdf.drawField("Rep Payee Status", referral.rep_payee_status);
  pdf.drawField("VA Benefits", referral.va_benefits);
  pdf.drawField("VA Benefit Details", referral.va_benefit_details);

  // ── Assets ──
  if (referral.assets_unknown) {
    pdf.drawField("Assets", "Unknown at this time");
  } else if (referral.assets?.length > 0) {
    pdf.drawSectionTitle("Assets");
    let totalAssets = 0;
    for (const asset of referral.assets) {
      const parts = [
        ASSET_TYPE_LABELS[asset.asset_type] || asset.asset_type,
        asset.institution,
        asset.description,
        asset.account_last4 ? `Last 4: ${asset.account_last4}` : null,
        asset.approximate_value ? `$${Number(asset.approximate_value).toLocaleString()}` : null,
        asset.is_exempt ? "(Exempt)" : null,
      ].filter(Boolean);
      pdf.drawText(parts.join(" | "), { indent: 8 });
      totalAssets += Number(asset.approximate_value || 0);
    }
    pdf.drawSpacer(4);
    pdf.drawText(`Total Assets: $${totalAssets.toLocaleString()}`, { bold: true, indent: 8 });
  }

  // ── Medicaid Details ──
  if (referral.referral_type === "medicaid" || referral.referral_type === "both") {
    pdf.drawSectionTitle("Medicaid Application Details");
    pdf.drawField("Application Type", referral.medicaid_application_type === "new" ? "New Application" : referral.medicaid_application_type === "renewal" ? "Renewal" : null);
    pdf.drawField("Date of Need", referral.medicaid_date_of_need);
    pdf.drawField("Application Date", referral.medicaid_application_date);
    pdf.drawField("Application Number", referral.medicaid_application_number);
    pdf.drawField("Case Number", referral.medicaid_case_number);
    pdf.drawField("Current Status", referral.medicaid_current_status);
    pdf.drawField("Filed By", referral.medicaid_filed_by);
    pdf.drawField("Contact Name", referral.medicaid_contact_name);
    pdf.drawField("Contact Address", referral.medicaid_contact_address);
    pdf.drawField("Contact Phone", referral.medicaid_contact_phone);
    pdf.drawField("Contact Email", referral.medicaid_contact_email);
    pdf.drawField("MyACCESS Login", referral.medicaid_myaccess_login);
    pdf.drawField("MyACCESS Password", referral.medicaid_myaccess_pw);
    pdf.drawField("Documents Uploaded", referral.medicaid_documents_uploaded);
    pdf.drawField("Comments", referral.medicaid_comments);
  }

  // ── Documents ──
  if (referral.referral_documents?.length > 0) {
    pdf.drawSectionTitle("Uploaded Documents");
    for (const doc of referral.referral_documents) {
      pdf.drawText(`${doc.file_name} (${doc.doc_type})`, { indent: 8 });
    }
  }

  // ── Notes ──
  if (referral.notes) {
    pdf.drawSectionTitle("Notes & Comments");
    pdf.drawText(referral.notes, { indent: 8 });
  }

  // ── Footer note ──
  pdf.drawSpacer(16);
  pdf.drawText(`Generated ${new Date().toLocaleDateString()} | Confidential`, {
    indent: 0,
    color: [0.5, 0.5, 0.5],
  });

  return await pdf.save();
}

// ─── Email via Resend ────────────────────────────────────────────────
async function sendEmail(
  pdfBytes: Uint8Array,
  clientName: string,
  referralType: string,
  referrerEmail: string
) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) throw new Error("RESEND_API_KEY not set");

  // Convert to base64 for Resend attachment
  const base64Pdf = btoa(String.fromCharCode(...pdfBytes));
  const fileName = `Referral-Report-${clientName.replace(/\s+/g, "-")}.pdf`;

  const recipients = [FIRM_EMAIL];
  if (referrerEmail) recipients.push(referrerEmail);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Zacharia Brown Portal <noreply@zacfreylaw.com>",
      to: recipients,
      subject: `New Referral Submitted: ${clientName} (${referralType})`,
      text: [
        `A new referral has been submitted for ${clientName}.`,
        ``,
        `Referral Type: ${referralType}`,
        ``,
        `Please see the attached PDF report for full details.`,
        ``,
        `— Zacharia Brown  Referral Portal`,
      ].join("\n"),
      attachments: [
        {
          filename: fileName,
          content: base64Pdf,
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend API error ${response.status}: ${body}`);
  }

  return await response.json();
}

// ─── Save PDF to Storage ─────────────────────────────────────────────
async function savePdfToStorage(
  supabase: ReturnType<typeof createClient>,
  referralId: string,
  pdfBytes: Uint8Array,
  fileName: string
) {
  const storagePath = `${referralId}/${fileName}`;
  const { error } = await supabase.storage
    .from("referral-reports")
    .upload(storagePath, pdfBytes, {
      contentType: "application/pdf",
      upsert: true, // overwrite if re-submitted
    });

  if (error) {
    console.error(`Failed to save PDF to storage: ${error.message}`);
  } else {
    console.log(`PDF saved to referral-reports/${storagePath}`);
  }
}

// ─── Shared: fetch referral + profile, generate PDF ─────────────────
async function fetchAndGeneratePdf(referralId: string) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch full referral with joins
  const { data: referral, error: fetchError } = await supabase
    .from("referrals")
    .select(`
      *,
      family_members(*),
      assets(*),
      referral_documents(*),
      facilities(*)
    `)
    .eq("id", referralId)
    .single();

  if (fetchError || !referral) {
    throw new Error(`Failed to fetch referral: ${fetchError?.message}`);
  }

  // Fetch referrer profile
  let referrerProfile = null;
  if (referral.referrer_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, first_name, last_name, organization")
      .eq("id", referral.referrer_id)
      .single();
    referrerProfile = profile;
  }

  const clientName =
    referral.client_full_legal_name ||
    `${referral.client_first_name || ""} ${referral.client_last_name || ""}`.trim() ||
    "Unknown";
  const referralType = REFERRAL_TYPE_LABELS[referral.referral_type] || "Unknown";

  const pdfBytes = await generatePdf(referral, referrerProfile);

  return { pdfBytes, clientName, referralType, referrerProfile, referral, supabase };
}

// ─── CORS headers ────────────────────────────────────────────────────
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ─── Main Handler ────────────────────────────────────────────────────
Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();

    // Determine mode:
    //   - Webhook (from DB trigger): has record.id + record.status
    //   - Download (from client):    has referral_id, no record
    const isDownloadMode = payload.referral_id && !payload.record;

    if (isDownloadMode) {
      // ── Download mode: generate PDF, save to storage, and return it ──
      const { pdfBytes, clientName, supabase } = await fetchAndGeneratePdf(payload.referral_id);
      const fileName = `Referral-Report-${clientName.replace(/\s+/g, "-")}.pdf`;

      // Save to storage (don't block the response)
      savePdfToStorage(supabase, payload.referral_id, pdfBytes, fileName);

      return new Response(pdfBytes, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${fileName}"`,
        },
      });
    }

    // ── Webhook mode: generate PDF and email it ──
    const referralId = payload.record?.id;
    const newStatus = payload.record?.status;

    if (!referralId || newStatus !== "submitted") {
      return new Response(JSON.stringify({ message: "Skipped: not a submission" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { pdfBytes, clientName, referralType, referrerProfile, supabase } =
      await fetchAndGeneratePdf(referralId);

    const fileName = `Referral-Report-${clientName.replace(/\s+/g, "-")}.pdf`;

    // Save PDF to storage and send email in parallel
    await Promise.all([
      savePdfToStorage(supabase, referralId, pdfBytes, fileName),
      sendEmail(pdfBytes, clientName, referralType, referrerProfile?.email || ""),
    ]);

    console.log(`Referral report sent and saved for ${clientName} (${referralId})`);

    return new Response(
      JSON.stringify({ success: true, message: `Report sent for ${clientName}` }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("send-referral-report error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
