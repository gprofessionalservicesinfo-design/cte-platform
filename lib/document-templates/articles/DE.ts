import type { ArticlesParams, DocumentTemplate } from '../types'

export function buildDelawareArticles(p: ArticlesParams): DocumentTemplate {
  const effectiveDate = p.effective_date
    ? new Date(p.effective_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'the date of filing by the Delaware Secretary of State'

  const managementLabel = p.management_type === 'manager_managed' ? 'Manager-Managed' : 'Member-Managed'

  return {
    meta: {
      template_id:   'articles_DE',
      document_type: 'articles',
      state:         'Delaware',
      state_code:    'DE',
      title:         'Certificate of Formation',
      version:       '1.0',
      disclaimer:    'DRAFT — FOR REVIEW ONLY. This document has not been reviewed by an attorney and has not been filed with the Delaware Secretary of State. Do not use this document as a final legal document without professional legal review.',
    },
    sections: [
      { type: 'watermark_notice' },
      { type: 'title', text: 'CERTIFICATE OF FORMATION', centered: true },
      { type: 'subtitle', text: 'Limited Liability Company', centered: true },
      { type: 'subtitle', text: 'State of Delaware', centered: true },
      { type: 'subtitle', text: 'Delaware Code Title 6, Chapter 18', centered: true },
      { type: 'spacer', height: 24 },

      {
        type: 'paragraph',
        text: 'The undersigned, acting as organizer of a limited liability company under the Delaware Limited Liability Company Act (6 Del. C. § 18-101 et seq.), hereby adopts the following Certificate of Formation:',
      },
      { type: 'spacer', height: 12 },

      { type: 'section_heading', text: 'FIRST — NAME' },
      { type: 'paragraph', text: `The name of the limited liability company is: ${p.company_name ?? '[COMPANY NAME]'}`, bold: true },
      { type: 'paragraph', text: 'The name must contain "Limited Liability Company," "LLC," or "L.L.C." per 6 Del. C. § 18-102.' },

      { type: 'section_heading', text: 'SECOND — REGISTERED AGENT' },
      { type: 'paragraph', text: 'The address of the registered agent for service of process in the State of Delaware is:' },
      {
        type: 'bullet_list',
        items: [
          `Registered Agent: ${p.registered_agent_name ?? '[REGISTERED AGENT]'}`,
          `Delaware Address:  ${p.registered_agent_address ?? '[REGISTERED AGENT ADDRESS]'}`,
        ],
      },

      { type: 'section_heading', text: 'THIRD — PURPOSE' },
      {
        type: 'paragraph',
        text: p.purpose
          ? `The purpose of the Company is: ${p.purpose}`
          : 'The purpose of the Company is to engage in any lawful act or activity for which a limited liability company may be organized under Delaware law.',
      },

      { type: 'section_heading', text: 'FOURTH — MANAGEMENT' },
      { type: 'paragraph', text: `Management of the Company is: ${managementLabel}`, bold: true },

      { type: 'section_heading', text: 'FIFTH — PRINCIPAL OFFICE' },
      { type: 'paragraph', text: 'The address of the Company\'s principal place of business is:' },
      { type: 'paragraph', text: p.principal_office_address ?? '[PRINCIPAL OFFICE ADDRESS]', indent: true, bold: true },

      { type: 'section_heading', text: 'SIXTH — ORGANIZER' },
      {
        type: 'bullet_list',
        items: [
          `Organizer: ${p.organizer_name ?? '[ORGANIZER NAME]'}`,
          `Address:   ${p.organizer_address ?? '[ORGANIZER ADDRESS]'}`,
        ],
      },

      { type: 'section_heading', text: 'SEVENTH — EFFECTIVE DATE' },
      { type: 'paragraph', text: `This Certificate of Formation is effective on: ${effectiveDate}` },

      { type: 'spacer', height: 36 },
      { type: 'horizontal_rule' },
      { type: 'spacer', height: 12 },

      { type: 'paragraph', text: 'IN WITNESS WHEREOF, the undersigned has executed this Certificate of Formation.', centered: true },
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

      { type: 'spacer', height: 24 },
      {
        type: 'paragraph',
        text: 'Filing Fee: $90 (payable to the Delaware Secretary of State)\nFiling Address: Delaware Division of Corporations, 401 Federal St, Suite 4, Dover, DE 19901\nOnline Filing: corp.delaware.gov',
        centered: true,
      },
    ],
  }
}
