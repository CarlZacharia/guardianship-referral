import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, ShadingType, VerticalAlign,
  PageBreak,
} from 'docx'
import { writeFileSync } from 'fs'

const NAVY = '1e3a5f'
const GOLD = 'c8a951'
const GRAY = '666666'
const LIGHT_GRAY = 'f5f5f5'
const BORDER_GRAY = 'dddddd'

const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
const thinBorder = { style: BorderStyle.SINGLE, size: 4, color: BORDER_GRAY }

function feeTableRow(serviceName, serviceDesc, fee) {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 75, type: WidthType.PERCENTAGE },
        borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder },
        margins: { top: 80, bottom: 80, left: 120, right: 80 },
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({ text: serviceName, bold: true, size: 22, font: 'Calibri' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: serviceDesc, size: 18, color: GRAY, italics: true, font: 'Calibri' }),
            ],
          }),
        ],
      }),
      new TableCell({
        width: { size: 25, type: WidthType.PERCENTAGE },
        borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder },
        margins: { top: 80, bottom: 80, left: 80, right: 120 },
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: fee, bold: true, size: 24, font: 'Calibri' }),
            ],
          }),
        ],
      }),
    ],
  })
}

function tableHeader() {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 75, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.SOLID, color: NAVY },
        borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
        margins: { top: 60, bottom: 60, left: 120, right: 80 },
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: 'Service', bold: true, size: 20, color: 'FFFFFF', font: 'Calibri' }),
            ],
          }),
        ],
      }),
      new TableCell({
        width: { size: 25, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.SOLID, color: NAVY },
        borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
        margins: { top: 60, bottom: 60, left: 80, right: 120 },
        children: [
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: 'Fee', bold: true, size: 20, color: 'FFFFFF', font: 'Calibri' }),
            ],
          }),
        ],
      }),
    ],
  })
}

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: 'Calibri', size: 22 },
      },
    },
  },
  sections: [
    {
      properties: {
        page: {
          margin: { top: 900, bottom: 900, left: 1100, right: 1100 },
        },
      },
      children: [
        // ── HEADER ──
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 0 },
          children: [
            new TextRun({
              text: 'ZACHARIA BROWN',
              bold: true,
              size: 48,
              color: NAVY,
              font: 'Calibri',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 40 },
          children: [
            new TextRun({
              text: 'ESTATE PLANNING  •  ELDER LAW  •  ASSET PROTECTION',
              size: 18,
              color: GRAY,
              font: 'Calibri',
              characterSpacing: 60,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: '26811 South Bay Drive, Suite 270  •  Bonita Springs, FL 34134',
              size: 18,
              color: GRAY,
              font: 'Calibri',
            }),
          ],
        }),

        // Gold horizontal rule
        new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: GOLD } },
          spacing: { after: 300 },
        }),

        // ── TITLE ──
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: 'Fee Schedule',
              bold: true,
              italics: true,
              size: 40,
              color: NAVY,
              font: 'Calibri',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          children: [
            new TextRun({
              text: 'Guardianship & Medicaid Services for Healthcare Facilities',
              size: 22,
              color: GRAY,
              font: 'Calibri',
            }),
          ],
        }),

        // ── GUARDIANSHIP SERVICES ──
        new Paragraph({
          spacing: { before: 100, after: 200 },
          children: [
            new TextRun({
              text: 'Guardianship Services',
              bold: true,
              size: 32,
              color: NAVY,
              font: 'Calibri',
            }),
          ],
        }),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            tableHeader(),
            feeTableRow(
              'Uncontested Guardianship Petition',
              'Includes petition preparation, filing, hearing, and issuance of Letters of Guardianship',
              '$4,000'
            ),
            feeTableRow(
              'Contested Guardianship — Additional Fees',
              'Hourly rate applies to contested proceedings beyond the base petition',
              'Hourly Rate*'
            ),
            feeTableRow(
              'Court-Appointed Attorney for Alleged Incapacitated Person',
              'Additional fee when the AIP lacks sufficient assets to retain independent counsel',
              '$1,000'
            ),
          ],
        }),

        // Footnote *
        new Paragraph({
          spacing: { before: 160, after: 80 },
          indent: { left: 200 },
          children: [
            new TextRun({
              text: '* If a guardianship becomes contested, the additional hourly rate and estimated costs will be communicated to the facility prior to any work being performed on the contested matter.',
              size: 18,
              italics: true,
              color: GRAY,
              font: 'Calibri',
            }),
          ],
        }),

        new Paragraph({ spacing: { after: 200 } }),

        // ── MEDICAID APPLICATION SERVICES ──
        new Paragraph({
          spacing: { before: 100, after: 200 },
          children: [
            new TextRun({
              text: 'Medicaid Application Services',
              bold: true,
              size: 32,
              color: NAVY,
              font: 'Calibri',
            }),
          ],
        }),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            tableHeader(),
            feeTableRow(
              'Medicaid Long-Term Care Application',
              'Includes eligibility analysis, document preparation, filing, and follow-up through approval',
              '$4,000'
            ),
            feeTableRow(
              'Medicaid Fair Hearing Appeal',
              'Representation in the event of a denial requiring an administrative appeal',
              '$500'
            ),
            feeTableRow(
              'Special Retroactive Medicaid Appeal',
              'Pursuit of retroactive eligibility for prior coverage periods',
              'Quoted per Case**'
            ),
          ],
        }),

        // Footnote **
        new Paragraph({
          spacing: { before: 160, after: 80 },
          indent: { left: 200 },
          children: [
            new TextRun({
              text: '** The fee for a special retroactive Medicaid appeal occurs when there is a large outstanding balance and we are able to obtain coverage outside of and in addition to the standard appeal period.  These fees will be roughly 10% of the monthly private pay charges by the facility for the additional coverage amount.  For more information about this, please contact us.',
              size: 18,
              italics: true,
              color: GRAY,
              font: 'Calibri',
            }),
          ],
        }),

        // ── HORIZONTAL RULE ──
        new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER_GRAY } },
          spacing: { before: 300, after: 200 },
        }),

        // ── PAGE 2: DISCLAIMER ──
        new Paragraph({
          children: [new TextRun({ break: 1 }), new TextRun({ text: '' })],
          pageBreakBefore: true,
        }),

        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 400, after: 200 },
          children: [
            new TextRun({
              text: 'All fees are due upon engagement unless alternative arrangements are made in writing. Fees do not include court filing fees, service of process costs, or other third-party expenses, which will be billed separately. This fee schedule is subject to change. Please contact our office for current pricing.',
              size: 20,
              color: '444444',
              font: 'Calibri',
            }),
          ],
        }),

        new Paragraph({ spacing: { after: 400 } }),

        // Footer
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: 'Zacharia Brown  •  26811 South Bay Drive, Suite 270  •  Bonita Springs, FL 34134',
              size: 18,
              color: GRAY,
              font: 'Calibri',
            }),
          ],
        }),
      ],
    },
  ],
})

const buffer = await Packer.toBuffer(doc)
writeFileSync('public/forms/feeSchedule.docx', buffer)
console.log('Created public/forms/feeSchedule.docx')
