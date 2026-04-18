/**
 * DBA / Fictitious Name Registration — generic template.
 */
import type { ArticlesParams, DocumentTemplate } from '../types'

export function buildDBATemplate(p: ArticlesParams): DocumentTemplate {
  const stateDisplay = p.state || p.state_code || 'Unknown State'
  const sc = (p.state_code ?? 'XX').toUpperCase()

  return {
    meta: {
      template_id:   `dba_${sc}`,
      document_type: 'articles',
      state:         stateDisplay,
      state_code:    sc,
      title:         'Fictitious Name Registration (DBA)',
      version:       '1.0',
      disclaimer:    `DRAFT — FOR REVIEW ONLY. This document has not been reviewed by an attorney and has not been filed with the ${stateDisplay} county clerk or Secretary of State.`,
    },
    sections: [
      { type: 'watermark_notice' },
      { type: 'title', text: 'FICTITIOUS NAME REGISTRATION', centered: true },
      { type: 'subtitle', text: 'Doing Business As (DBA)', centered: true },
      { type: 'subtitle', text: `State of ${stateDisplay}`, centered: true },
      { type: 'spacer', height: 24 },

      {
        type: 'paragraph',
        text: `The undersigned hereby registers the following fictitious business name under the laws of the State of ${stateDisplay}:`,
      },
      { type: 'spacer', height: 12 },

      { type: 'section_heading', text: 'SECTION 1 — FICTITIOUS NAME' },
      { type: 'paragraph', text: `Fictitious Business Name (DBA): ${p.company_name ?? '[DBA NAME]'}`, bold: true },

      { type: 'section_heading', text: 'SECTION 2 — OWNER INFORMATION' },
      {
        type: 'bullet_list',
        items: [
          `Owner Name:    ${p.organizer_name ?? '[OWNER NAME]'}`,
          `Owner Address: ${p.organizer_address ?? '[OWNER ADDRESS]'}`,
        ],
      },

      { type: 'section_heading', text: 'SECTION 3 — BUSINESS ADDRESS' },
      { type: 'paragraph', text: p.principal_office_address ?? '[BUSINESS ADDRESS]', indent: true, bold: true },

      { type: 'section_heading', text: 'SECTION 4 — NATURE OF BUSINESS' },
      {
        type: 'paragraph',
        text: p.purpose
          ? `Nature of Business: ${p.purpose}`
          : 'Nature of Business: General business activities as permitted by law.',
      },

      { type: 'section_heading', text: 'SECTION 5 — COMMENCEMENT DATE' },
      {
        type: 'paragraph',
        text: p.effective_date
          ? `Commencement Date: ${new Date(p.effective_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`
          : 'Commencement Date: Date of filing',
      },

      { type: 'spacer', height: 36 },
      { type: 'horizontal_rule' },
      { type: 'spacer', height: 12 },

      { type: 'paragraph', text: 'I declare that the foregoing information is true and correct to the best of my knowledge.', centered: true },
      { type: 'spacer', height: 36 },

      {
        type: 'signature_block',
        items: [
          `Owner: ${p.organizer_name ?? '[OWNER NAME]'}`,
          'Date: ____________________________',
          'Signature: ____________________________',
        ],
      },

      { type: 'spacer', height: 24 },
      {
        type: 'paragraph',
        text: 'Note: Filing requirements, fees, and county clerk location vary by state and county. Please consult your local county clerk for specific filing instructions.',
        centered: true,
      },
    ],
  }
}
