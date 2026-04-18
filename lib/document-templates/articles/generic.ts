/**
 * Generic Articles of Organization template for states without a custom template.
 * Uses the state name from params.state / params.state_code.
 */
import type { ArticlesParams, DocumentTemplate } from '../types'

export function buildGenericArticles(p: ArticlesParams): DocumentTemplate {
  const stateDisplay = p.state || p.state_code || 'Unknown State'
  const effectiveDate = p.effective_date
    ? new Date(p.effective_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : `the date of filing by the ${stateDisplay} Secretary of State`

  const managementLabel = p.management_type === 'manager_managed' ? 'Manager-Managed' : 'Member-Managed'
  const sc = (p.state_code ?? 'XX').toUpperCase()

  return {
    meta: {
      template_id:   `articles_${sc}`,
      document_type: 'articles',
      state:         stateDisplay,
      state_code:    sc,
      title:         'Articles of Organization',
      version:       '1.0',
      disclaimer:    `DRAFT — FOR REVIEW ONLY. This document has not been reviewed by an attorney and has not been filed with the ${stateDisplay} Secretary of State. Do not use this document as a final legal document without professional legal review.`,
    },
    sections: [
      { type: 'watermark_notice' },
      { type: 'title', text: 'ARTICLES OF ORGANIZATION', centered: true },
      { type: 'subtitle', text: 'Limited Liability Company', centered: true },
      { type: 'subtitle', text: `State of ${stateDisplay}`, centered: true },
      { type: 'spacer', height: 24 },

      {
        type: 'paragraph',
        text: `The undersigned, acting as organizer of a limited liability company under the laws of the State of ${stateDisplay}, hereby adopts the following Articles of Organization:`,
      },
      { type: 'spacer', height: 12 },

      { type: 'section_heading', text: 'ARTICLE I — NAME' },
      { type: 'paragraph', text: `The name of the limited liability company is: ${p.company_name ?? '[COMPANY NAME]'}`, bold: true },

      { type: 'section_heading', text: 'ARTICLE II — PRINCIPAL OFFICE' },
      { type: 'paragraph', text: 'The address of the principal office is:' },
      { type: 'paragraph', text: p.principal_office_address ?? '[PRINCIPAL OFFICE ADDRESS]', indent: true, bold: true },

      { type: 'section_heading', text: 'ARTICLE III — REGISTERED AGENT' },
      {
        type: 'bullet_list',
        items: [
          `Registered Agent: ${p.registered_agent_name ?? '[REGISTERED AGENT]'}`,
          `Address:          ${p.registered_agent_address ?? '[REGISTERED AGENT ADDRESS]'}`,
        ],
      },

      { type: 'section_heading', text: 'ARTICLE IV — MANAGEMENT' },
      { type: 'paragraph', text: `The Company shall be: ${managementLabel}`, bold: true },

      { type: 'section_heading', text: 'ARTICLE V — PURPOSE' },
      {
        type: 'paragraph',
        text: p.purpose
          ? `The purpose of the Company is: ${p.purpose}`
          : `The purpose of the Company is to engage in any lawful act or activity for which a limited liability company may be organized under the laws of ${stateDisplay}.`,
      },

      { type: 'section_heading', text: 'ARTICLE VI — ORGANIZER' },
      {
        type: 'bullet_list',
        items: [
          `Organizer: ${p.organizer_name ?? '[ORGANIZER NAME]'}`,
          `Address:   ${p.organizer_address ?? '[ORGANIZER ADDRESS]'}`,
        ],
      },

      { type: 'section_heading', text: 'ARTICLE VII — EFFECTIVE DATE' },
      { type: 'paragraph', text: `These Articles of Organization are effective on: ${effectiveDate}` },

      { type: 'spacer', height: 36 },
      { type: 'horizontal_rule' },
      { type: 'spacer', height: 12 },

      { type: 'paragraph', text: 'IN WITNESS WHEREOF, the undersigned Organizer has executed these Articles of Organization.', centered: true },
      { type: 'spacer', height: 36 },

      {
        type: 'signature_block',
        items: [
          `Organizer: ${p.organizer_name ?? '[ORGANIZER NAME]'}`,
          `Address:   ${p.organizer_address ?? '[ORGANIZER ADDRESS]'}`,
          'Date: ____________________________',
          'Signature: ____________________________',
        ],
      },
    ],
  }
}
