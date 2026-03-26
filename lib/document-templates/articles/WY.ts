import type { ArticlesParams, DocumentTemplate } from '../types'

export function buildWyomingArticles(p: ArticlesParams): DocumentTemplate {
  const effectiveDate = p.effective_date
    ? new Date(p.effective_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'the date of filing by the Wyoming Secretary of State'

  const managementLabel = p.management_type === 'manager_managed'
    ? 'Manager-Managed'
    : 'Member-Managed'

  return {
    meta: {
      template_id:   'articles_WY',
      document_type: 'articles',
      state:         'Wyoming',
      state_code:    'WY',
      title:         'Articles of Organization',
      version:       '1.0',
      disclaimer:    'DRAFT — FOR REVIEW ONLY. This document has not been reviewed by an attorney and has not been filed with the Wyoming Secretary of State. Do not use this document as a final legal document without professional legal review.',
    },
    sections: [
      { type: 'watermark_notice' },
      { type: 'title', text: 'ARTICLES OF ORGANIZATION', centered: true },
      { type: 'subtitle', text: 'Limited Liability Company', centered: true },
      { type: 'subtitle', text: 'State of Wyoming', centered: true },
      { type: 'subtitle', text: 'Wyoming Statutes § 17-29-201', centered: true },
      { type: 'spacer', height: 24 },

      {
        type: 'paragraph',
        text: 'The undersigned, acting as organizer of a limited liability company under the Wyoming Limited Liability Company Act (W.S. §§ 17-29-101 through 17-29-1102), hereby adopts the following Articles of Organization:',
      },
      { type: 'spacer', height: 12 },

      { type: 'section_heading', text: 'ARTICLE I — NAME' },
      {
        type: 'paragraph',
        text: `The name of the limited liability company is: ${p.company_name}`,
        bold: true,
      },
      {
        type: 'paragraph',
        text: 'The name complies with W.S. § 17-29-108 and must contain "Limited Liability Company," "LLC," "L.L.C.," "Limited Company," "LC," or "L.C."',
      },

      { type: 'section_heading', text: 'ARTICLE II — PRINCIPAL OFFICE' },
      {
        type: 'paragraph',
        text: 'The address of the principal office of the Company is:',
      },
      { type: 'paragraph', text: p.principal_office_address, indent: true, bold: true },
      {
        type: 'paragraph',
        text: 'NOTE: Wyoming does not require the principal office to be located in Wyoming.',
      },

      { type: 'section_heading', text: 'ARTICLE III — REGISTERED AGENT' },
      {
        type: 'paragraph',
        text: 'The Company designates the following as its registered agent in Wyoming. The registered agent must have a physical street address in Wyoming (P.O. boxes are not acceptable):',
      },
      {
        type: 'bullet_list',
        items: [
          `Registered Agent Name: ${p.registered_agent_name}`,
          `Wyoming Street Address: ${p.registered_agent_address}`,
        ],
      },
      {
        type: 'paragraph',
        text: 'The registered agent has consented to act in this capacity as required by W.S. § 17-28-101.',
      },

      { type: 'section_heading', text: 'ARTICLE IV — DURATION' },
      {
        type: 'paragraph',
        text: 'The Company shall have a perpetual duration unless dissolved pursuant to the Wyoming Limited Liability Company Act.',
      },

      { type: 'section_heading', text: 'ARTICLE V — PURPOSE' },
      {
        type: 'paragraph',
        text: p.purpose
          ? `The purpose of the Company is: ${p.purpose}`
          : 'The purpose of the Company is to engage in any lawful act or activity for which a limited liability company may be organized under Wyoming law.',
      },

      { type: 'section_heading', text: 'ARTICLE VI — MANAGEMENT' },
      {
        type: 'paragraph',
        text: `Management of the Company is vested in its: ${managementLabel}`,
        bold: true,
      },
      p.management_type === 'manager_managed'
        ? {
            type: 'paragraph',
            text: 'The Company shall be managed by one or more Managers as set forth in the Operating Agreement. The names and addresses of the initial Manager(s) shall be set forth in the Operating Agreement.',
          }
        : {
            type: 'paragraph',
            text: 'The Company shall be managed by its Members. The rights and obligations of the Members shall be set forth in the Operating Agreement.',
          },

      { type: 'section_heading', text: 'ARTICLE VII — LIMITED LIABILITY' },
      {
        type: 'paragraph',
        text: 'No Member or Manager of the Company shall be personally liable for any debt, obligation, or liability of the Company solely by reason of being or acting as a Member or Manager, except as otherwise expressly provided in the Wyoming Limited Liability Company Act.',
      },

      { type: 'section_heading', text: 'ARTICLE VIII — ORGANIZER' },
      {
        type: 'paragraph',
        text: 'The name and address of the organizer is:',
      },
      {
        type: 'bullet_list',
        items: [
          `Name: ${p.organizer_name}`,
          `Address: ${p.organizer_address}`,
        ],
      },

      { type: 'section_heading', text: 'ARTICLE IX — EFFECTIVE DATE' },
      {
        type: 'paragraph',
        text: `These Articles of Organization are effective on: ${effectiveDate}`,
      },

      { type: 'spacer', height: 36 },
      { type: 'horizontal_rule' },
      { type: 'spacer', height: 12 },

      {
        type: 'paragraph',
        text: 'IN WITNESS WHEREOF, the undersigned Organizer has executed these Articles of Organization.',
        centered: true,
      },
      { type: 'spacer', height: 36 },

      {
        type: 'signature_block',
        items: [
          `Organizer: ${p.organizer_name}`,
          `Address: ${p.organizer_address}`,
          `Date: ____________________________`,
          `Signature: ____________________________`,
        ],
      },

      { type: 'spacer', height: 24 },
      {
        type: 'paragraph',
        text: `Filing Fee: $62 (payable to the Wyoming Secretary of State)\nFiling Address: Wyoming Secretary of State, 200 W. 24th Street, Cheyenne, WY 82002-0020\nOnline Filing: sos.wyo.gov`,
        centered: true,
      },
    ],
  }
}
