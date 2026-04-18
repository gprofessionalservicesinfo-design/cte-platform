/**
 * Articles of Incorporation — generic CORP template.
 */
import type { ArticlesParams, DocumentTemplate } from '../types'

export function buildCorpArticles(p: ArticlesParams): DocumentTemplate {
  const stateDisplay = p.state || p.state_code || 'Unknown State'
  const sc = (p.state_code ?? 'XX').toUpperCase()
  const effectiveDate = p.effective_date
    ? new Date(p.effective_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : `the date of filing by the ${stateDisplay} Secretary of State`

  return {
    meta: {
      template_id:   `articles_corp_${sc}`,
      document_type: 'articles',
      state:         stateDisplay,
      state_code:    sc,
      title:         'Articles of Incorporation',
      version:       '1.0',
      disclaimer:    `DRAFT — FOR REVIEW ONLY. This document has not been reviewed by an attorney and has not been filed with the ${stateDisplay} Secretary of State.`,
    },
    sections: [
      { type: 'watermark_notice' },
      { type: 'title', text: 'ARTICLES OF INCORPORATION', centered: true },
      { type: 'subtitle', text: 'Corporation', centered: true },
      { type: 'subtitle', text: `State of ${stateDisplay}`, centered: true },
      { type: 'spacer', height: 24 },

      {
        type: 'paragraph',
        text: `The undersigned, acting as incorporator of a corporation under the laws of the State of ${stateDisplay}, hereby adopts the following Articles of Incorporation:`,
      },
      { type: 'spacer', height: 12 },

      { type: 'section_heading', text: 'ARTICLE I — NAME' },
      { type: 'paragraph', text: `The name of the corporation is: ${p.company_name ?? '[CORPORATION NAME]'}`, bold: true },

      { type: 'section_heading', text: 'ARTICLE II — PURPOSE' },
      {
        type: 'paragraph',
        text: p.purpose
          ? `The purpose of the corporation is: ${p.purpose}`
          : `The purpose of the corporation is to engage in any lawful act or activity for which corporations may be organized under the laws of ${stateDisplay}.`,
      },

      { type: 'section_heading', text: 'ARTICLE III — REGISTERED AGENT' },
      {
        type: 'bullet_list',
        items: [
          `Registered Agent: ${p.registered_agent_name ?? '[REGISTERED AGENT]'}`,
          `Address:          ${p.registered_agent_address ?? '[REGISTERED AGENT ADDRESS]'}`,
        ],
      },

      { type: 'section_heading', text: 'ARTICLE IV — PRINCIPAL OFFICE' },
      { type: 'paragraph', text: p.principal_office_address ?? '[PRINCIPAL OFFICE ADDRESS]', indent: true, bold: true },

      { type: 'section_heading', text: 'ARTICLE V — AUTHORIZED SHARES' },
      { type: 'paragraph', text: 'The total number of shares of stock authorized to be issued by the corporation is: 1,000 shares of Common Stock, $0.001 par value per share.' },

      { type: 'section_heading', text: 'ARTICLE VI — INCORPORATOR' },
      {
        type: 'bullet_list',
        items: [
          `Incorporator: ${p.organizer_name ?? '[INCORPORATOR NAME]'}`,
          `Address:      ${p.organizer_address ?? '[INCORPORATOR ADDRESS]'}`,
        ],
      },

      { type: 'section_heading', text: 'ARTICLE VII — EFFECTIVE DATE' },
      { type: 'paragraph', text: `These Articles of Incorporation are effective on: ${effectiveDate}` },

      { type: 'spacer', height: 36 },
      { type: 'horizontal_rule' },
      { type: 'spacer', height: 12 },

      { type: 'paragraph', text: 'IN WITNESS WHEREOF, the undersigned Incorporator has executed these Articles of Incorporation.', centered: true },
      { type: 'spacer', height: 36 },

      {
        type: 'signature_block',
        items: [
          `Incorporator: ${p.organizer_name ?? '[INCORPORATOR NAME]'}`,
          `Address:      ${p.organizer_address ?? '[INCORPORATOR ADDRESS]'}`,
          'Date: ____________________________',
          'Signature: ____________________________',
        ],
      },
    ],
  }
}
