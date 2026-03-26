import type { ArticlesParams, DocumentTemplate } from '../types'

export function buildColoradoArticles(p: ArticlesParams): DocumentTemplate {
  const effectiveDate = p.effective_date
    ? new Date(p.effective_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'the date of filing by the Colorado Secretary of State'

  const mailingAddr = p.mailing_address && p.mailing_address !== p.principal_office_address
    ? p.mailing_address
    : p.principal_office_address

  const managementLabel = p.management_type === 'manager_managed'
    ? 'Manager-Managed'
    : 'Member-Managed'

  return {
    meta: {
      template_id:   'articles_CO',
      document_type: 'articles',
      state:         'Colorado',
      state_code:    'CO',
      title:         'Articles of Organization',
      version:       '1.0',
      disclaimer:    'DRAFT — FOR REVIEW ONLY. This document has not been reviewed by an attorney and has not been filed with the Colorado Secretary of State. Do not use this document as a final legal document without professional legal review.',
    },
    sections: [
      { type: 'watermark_notice' },
      { type: 'title', text: 'ARTICLES OF ORGANIZATION', centered: true },
      { type: 'subtitle', text: 'Limited Liability Company', centered: true },
      { type: 'subtitle', text: 'State of Colorado', centered: true },
      { type: 'subtitle', text: 'Colorado Revised Statutes § 7-80-203', centered: true },
      { type: 'spacer', height: 24 },

      {
        type: 'paragraph',
        text: `The undersigned organizer, being a natural person of legal age, hereby forms a limited liability company under the Colorado Limited Liability Company Act (C.R.S. § 7-80-101 et seq.) and adopts the following Articles of Organization:`,
      },
      { type: 'spacer', height: 12 },

      { type: 'section_heading', text: 'ARTICLE I — NAME OF THE COMPANY' },
      {
        type: 'paragraph',
        text: `The name of the limited liability company is: ${p.company_name}`,
        bold: true,
      },
      {
        type: 'paragraph',
        text: 'The name complies with C.R.S. § 7-90-601 and includes the words "Limited Liability Company," "Limited Company," or the abbreviation "LLC," "L.L.C.," "LC," or "L.C."',
      },

      { type: 'section_heading', text: 'ARTICLE II — PRINCIPAL OFFICE' },
      {
        type: 'paragraph',
        text: `The address of the principal office of the Company is:`,
      },
      { type: 'paragraph', text: p.principal_office_address, indent: true, bold: true },
      {
        type: 'paragraph',
        text: `Mailing Address (if different from principal office):`,
      },
      { type: 'paragraph', text: mailingAddr, indent: true },

      { type: 'section_heading', text: 'ARTICLE III — REGISTERED AGENT' },
      {
        type: 'paragraph',
        text: `The Company appoints the following as its registered agent in the State of Colorado for service of process:`,
      },
      {
        type: 'bullet_list',
        items: [
          `Registered Agent Name: ${p.registered_agent_name}`,
          `Registered Agent Address: ${p.registered_agent_address}`,
        ],
      },
      {
        type: 'paragraph',
        text: 'The registered agent must be a Colorado resident, or a domestic or foreign entity authorized to transact business in Colorado. The registered agent has consented to serve.',
      },

      { type: 'section_heading', text: 'ARTICLE IV — PERIOD OF DURATION' },
      {
        type: 'paragraph',
        text: 'The duration of the Company shall be perpetual unless dissolved in accordance with the Colorado Limited Liability Company Act.',
      },

      { type: 'section_heading', text: 'ARTICLE V — PURPOSE' },
      {
        type: 'paragraph',
        text: p.purpose
          ? `The specific purpose of the Company is: ${p.purpose}`
          : 'The purpose of the Company is to engage in any lawful act or activity for which a limited liability company may be organized under the Colorado Limited Liability Company Act.',
      },

      { type: 'section_heading', text: 'ARTICLE VI — MANAGEMENT STRUCTURE' },
      {
        type: 'paragraph',
        text: `The Company shall be: ${managementLabel}`,
        bold: true,
      },
      p.management_type === 'manager_managed'
        ? {
            type: 'paragraph',
            text: 'Management of the Company is vested in one or more Managers. The Members, in their capacity as Members, shall not have management authority solely by reason of being a Member.',
          }
        : {
            type: 'paragraph',
            text: 'Management of the Company is vested in its Members. Each Member shall have management authority in proportion to their membership interest, unless otherwise provided in the Operating Agreement.',
          },

      { type: 'section_heading', text: 'ARTICLE VII — LIABILITY OF MEMBERS' },
      {
        type: 'paragraph',
        text: 'No Member of the Company shall be personally liable for any debt, obligation, or liability of the Company, whether arising in contract, tort, or otherwise, solely by reason of being a Member of the Company.',
      },

      { type: 'section_heading', text: 'ARTICLE VIII — ORGANIZER' },
      {
        type: 'paragraph',
        text: 'The name and address of the organizer of the Company is:',
      },
      {
        type: 'bullet_list',
        items: [
          `Organizer Name: ${p.organizer_name}`,
          `Organizer Address: ${p.organizer_address}`,
        ],
      },

      { type: 'section_heading', text: 'ARTICLE IX — EFFECTIVE DATE' },
      {
        type: 'paragraph',
        text: `These Articles of Organization shall be effective on ${effectiveDate}.`,
      },

      { type: 'section_heading', text: 'ARTICLE X — AMENDMENT' },
      {
        type: 'paragraph',
        text: 'These Articles of Organization may be amended in accordance with C.R.S. § 7-80-209 by filing Articles of Amendment with the Colorado Secretary of State.',
      },

      { type: 'spacer', height: 36 },
      { type: 'horizontal_rule' },
      { type: 'spacer', height: 12 },

      { type: 'paragraph', text: 'IN WITNESS WHEREOF, the undersigned Organizer has executed these Articles of Organization as of the date set forth below.', centered: true },
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
        text: `Filing Fee: $50 (payable to the Colorado Secretary of State)\nFiling Address: Colorado Secretary of State, 1700 Broadway, Suite 550, Denver, CO 80290\nOnline Filing: www.sos.state.co.us`,
        centered: true,
      },
    ],
  }
}
