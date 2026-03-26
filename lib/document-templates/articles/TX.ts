import type { ArticlesParams, DocumentTemplate } from '../types'

export function buildTexasArticles(p: ArticlesParams): DocumentTemplate {
  const effectiveDate = p.effective_date
    ? new Date(p.effective_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'the date of filing by the Texas Secretary of State'

  const governingPersonsLabel = p.management_type === 'manager_managed'
    ? 'Managers (Manager-Managed)'
    : 'Members (Member-Managed)'

  return {
    meta: {
      template_id:   'articles_TX',
      document_type: 'articles',
      state:         'Texas',
      state_code:    'TX',
      title:         'Certificate of Formation — Limited Liability Company',
      version:       '1.0',
      disclaimer:    'DRAFT — FOR REVIEW ONLY. This document has not been reviewed by an attorney and has not been filed with the Texas Secretary of State. Do not use this document as a final legal document without professional legal review. In Texas, this document is called "Certificate of Formation" (Form 205).',
    },
    sections: [
      { type: 'watermark_notice' },
      { type: 'title', text: 'CERTIFICATE OF FORMATION', centered: true },
      { type: 'subtitle', text: 'Limited Liability Company', centered: true },
      { type: 'subtitle', text: 'State of Texas', centered: true },
      { type: 'subtitle', text: 'Texas Business Organizations Code § 3.005 / Form 205', centered: true },
      { type: 'spacer', height: 24 },

      {
        type: 'paragraph',
        text: 'The undersigned organizer, acting as organizer of a limited liability company under the Texas Business Organizations Code (TBOC), hereby adopts the following Certificate of Formation:',
      },
      { type: 'spacer', height: 12 },

      { type: 'section_heading', text: 'ARTICLE 1 — ENTITY NAME' },
      {
        type: 'paragraph',
        text: `The filing entity name is: ${p.company_name}`,
        bold: true,
      },
      {
        type: 'paragraph',
        text: 'The name is available and distinguishable from other entities on file with the Secretary of State. The name must contain "Limited Liability Company," "Limited Company," "LLC," "L.L.C.," "LC," or "L.C."',
      },

      { type: 'section_heading', text: 'ARTICLE 2 — REGISTERED AGENT AND REGISTERED OFFICE' },
      {
        type: 'paragraph',
        text: 'The street address of the registered office and the name of the registered agent at such address are:',
      },
      {
        type: 'bullet_list',
        items: [
          `Registered Agent: ${p.registered_agent_name}`,
          `Registered Office (Texas Street Address): ${p.registered_agent_address}`,
        ],
      },
      {
        type: 'paragraph',
        text: 'NOTE: The registered agent must be an individual resident of Texas, a domestic entity, or a foreign entity authorized to conduct business in Texas. A P.O. box alone is not acceptable as the registered office.',
      },

      { type: 'section_heading', text: 'ARTICLE 3 — GOVERNING AUTHORITY' },
      {
        type: 'paragraph',
        text: `The limited liability company shall be governed by: ${governingPersonsLabel}`,
        bold: true,
      },
      p.management_type === 'manager_managed'
        ? {
            type: 'paragraph',
            text: 'The Company is managed by Managers. The name and address of each initial Manager is set forth in the Company\'s regulations (Operating Agreement). The initial Managers have authority to manage all affairs of the Company.',
          }
        : {
            type: 'paragraph',
            text: 'The management of the Company is reserved to the Members. All members of the Company participate in its management. The rights and duties of members shall be set forth in the Company\'s regulations (Operating Agreement).',
          },

      { type: 'section_heading', text: 'ARTICLE 4 — PURPOSE' },
      {
        type: 'paragraph',
        text: p.purpose
          ? `The purpose of the Company is: ${p.purpose}`
          : 'The purpose of the Company is to engage in any lawful act or activity for which a limited liability company may be formed under the Texas Business Organizations Code.',
      },

      { type: 'section_heading', text: 'ARTICLE 5 — PRINCIPAL PLACE OF BUSINESS' },
      {
        type: 'paragraph',
        text: 'The address of the principal place of business of the Company is:',
      },
      { type: 'paragraph', text: p.principal_office_address, indent: true, bold: true },

      { type: 'section_heading', text: 'ARTICLE 6 — DURATION' },
      {
        type: 'paragraph',
        text: 'The Company shall have a perpetual existence unless dissolved pursuant to the Texas Business Organizations Code.',
      },

      { type: 'section_heading', text: 'ARTICLE 7 — LIABILITY OF MEMBERS AND MANAGERS' },
      {
        type: 'paragraph',
        text: 'No Member or Manager shall be personally liable for any debt, obligation, or liability of the Company, except as otherwise expressly provided by the Texas Business Organizations Code.',
      },

      { type: 'section_heading', text: 'ARTICLE 8 — ORGANIZER' },
      {
        type: 'paragraph',
        text: 'The name and address of the organizer of this limited liability company are:',
      },
      {
        type: 'bullet_list',
        items: [
          `Organizer Name: ${p.organizer_name}`,
          `Address: ${p.organizer_address}`,
        ],
      },

      { type: 'section_heading', text: 'ARTICLE 9 — EFFECTIVE DATE' },
      {
        type: 'paragraph',
        text: `This Certificate of Formation is effective on: ${effectiveDate}`,
      },

      { type: 'spacer', height: 36 },
      { type: 'horizontal_rule' },
      { type: 'spacer', height: 12 },

      {
        type: 'paragraph',
        text: 'The undersigned affirms that the person designated as registered agent has consented to the appointment. The undersigned signs this document subject to the penalties imposed by law for the submission of a materially false or fraudulent instrument.',
        centered: true,
      },
      { type: 'spacer', height: 36 },

      {
        type: 'signature_block',
        items: [
          `Organizer Signature: ____________________________`,
          `Printed Name: ${p.organizer_name}`,
          `Address: ${p.organizer_address}`,
          `Date: ____________________________`,
        ],
      },

      { type: 'spacer', height: 24 },
      {
        type: 'paragraph',
        text: `Filing Fee: $300 (payable to the Texas Secretary of State)\nFiling: Texas Secretary of State, P.O. Box 13697, Austin, TX 78711-3697\nOnline Filing: direct.sos.state.tx.us (SOSDirect)\nNote: Texas has no state income tax. Franchise tax applies to revenue > $1.23M/year.`,
        centered: true,
      },
    ],
  }
}
