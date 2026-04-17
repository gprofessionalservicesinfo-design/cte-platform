import type { ArticlesParams, DocumentTemplate } from '../types'

export function buildFloridaArticles(p: ArticlesParams): DocumentTemplate {
  const effectiveDate = p.effective_date
    ? new Date(p.effective_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'the date of filing by the Florida Division of Corporations'

  const managementLabel = p.management_type === 'manager_managed'
    ? 'Manager-Managed'
    : 'Member-Managed'

  return {
    meta: {
      template_id:   'articles_FL',
      document_type: 'articles',
      state:         'Florida',
      state_code:    'FL',
      title:         'Articles of Organization',
      version:       '1.0',
      disclaimer:    'DRAFT — FOR REVIEW ONLY. This document has not been reviewed by an attorney and has not been filed with the Florida Division of Corporations. Do not use this document as a final legal document without professional legal review.',
    },
    sections: [
      { type: 'watermark_notice' },
      { type: 'title', text: 'ARTICLES OF ORGANIZATION', centered: true },
      { type: 'subtitle', text: 'Limited Liability Company', centered: true },
      { type: 'subtitle', text: 'State of Florida', centered: true },
      { type: 'subtitle', text: 'Florida Statutes § 605.0201', centered: true },
      { type: 'spacer', height: 24 },

      {
        type: 'paragraph',
        text: 'The undersigned organizer hereby adopts these Articles of Organization for the purpose of forming a limited liability company pursuant to Chapter 605, Florida Statutes (Florida Revised Limited Liability Company Act):',
      },
      { type: 'spacer', height: 12 },

      { type: 'section_heading', text: 'ARTICLE I — NAME' },
      {
        type: 'paragraph',
        text: `The name of the limited liability company is: ${p.company_name ?? '[COMPANY NAME]'}`,
        bold: true,
      },
      {
        type: 'paragraph',
        text: 'The name contains the words "Limited Liability Company," "LLC," or "L.L.C." as required by F.S. § 605.0112.',
      },

      { type: 'section_heading', text: 'ARTICLE II — PRINCIPAL OFFICE ADDRESS' },
      {
        type: 'paragraph',
        text: 'The mailing address of the Company\'s principal office is:',
      },
      { type: 'paragraph', text: p.principal_office_address ?? '[PRINCIPAL OFFICE ADDRESS]', indent: true, bold: true },
      ...(p.mailing_address && p.mailing_address !== p.principal_office_address
        ? [
            { type: 'paragraph' as const, text: 'Mailing Address (if different):' },
            { type: 'paragraph' as const, text: p.mailing_address ?? '[MAILING ADDRESS]', indent: true },
          ]
        : []),

      { type: 'section_heading', text: 'ARTICLE III — REGISTERED AGENT' },
      {
        type: 'paragraph',
        text: 'The name and street address of the Company\'s initial registered agent in Florida are:',
      },
      {
        type: 'bullet_list',
        items: [
          `Registered Agent Name: ${p.registered_agent_name ?? '[REGISTERED AGENT]'}`,
          `Florida Street Address: ${p.registered_agent_address ?? '[REGISTERED AGENT ADDRESS]'}`,
        ],
      },
      {
        type: 'paragraph',
        text: 'REGISTERED AGENT ACCEPTANCE: Having been named as registered agent and to accept service of process for the above stated company at the place designated in this certificate, I hereby accept the appointment as registered agent and agree to act in this capacity. I further agree to comply with the provisions of all statutes relating to the proper and complete performance of my duties, and I am familiar with and accept the obligations of my position as registered agent.',
        bold: true,
      },
      { type: 'spacer', height: 18 },
      {
        type: 'signature_block',
        items: [
          'Registered Agent Signature: ____________________________',
          `Name: ${p.registered_agent_name ?? '[REGISTERED AGENT]'}`,
          'Date: ____________________________',
        ],
      },

      { type: 'section_heading', text: 'ARTICLE IV — MANAGEMENT STRUCTURE' },
      {
        type: 'paragraph',
        text: `The Company shall be managed by its: ${managementLabel}`,
        bold: true,
      },
      p.management_type === 'manager_managed'
        ? {
            type: 'paragraph',
            text: 'The Company is managed by Managers. The name(s) and address(es) of the initial Manager(s) shall be set forth in the Company\'s Operating Agreement.',
          }
        : {
            type: 'paragraph',
            text: 'The Company is managed by its Members. Each Member shall participate in management in proportion to their ownership interest unless otherwise provided in the Operating Agreement.',
          },

      { type: 'section_heading', text: 'ARTICLE V — PURPOSE' },
      {
        type: 'paragraph',
        text: p.purpose
          ? `The specific purpose of the Company is: ${p.purpose}`
          : 'The purpose of the Company is to engage in any lawful business or activity permitted by Florida law.',
      },

      { type: 'section_heading', text: 'ARTICLE VI — DURATION' },
      {
        type: 'paragraph',
        text: 'The Company shall have a perpetual duration unless dissolved in accordance with Chapter 605, Florida Statutes.',
      },

      { type: 'section_heading', text: 'ARTICLE VII — ORGANIZER' },
      {
        type: 'paragraph',
        text: 'The name and address of the authorized person(s) signing these Articles of Organization:',
      },
      {
        type: 'bullet_list',
        items: [
          `Name: ${p.organizer_name ?? '[ORGANIZER NAME]'}`,
          `Address: ${p.organizer_address ?? '[ORGANIZER ADDRESS]'}`,
        ],
      },

      { type: 'section_heading', text: 'ARTICLE VIII — EFFECTIVE DATE' },
      {
        type: 'paragraph',
        text: `These Articles of Organization shall become effective on: ${effectiveDate}`,
      },

      { type: 'spacer', height: 36 },
      { type: 'horizontal_rule' },
      { type: 'spacer', height: 12 },

      {
        type: 'paragraph',
        text: 'The undersigned authorized person(s) hereby affirm(s) that the facts stated herein are true.',
        centered: true,
      },
      { type: 'spacer', height: 36 },

      {
        type: 'signature_block',
        items: [
          `Signature: ____________________________`,
          `Printed Name: ${p.organizer_name ?? '[ORGANIZER NAME]'}`,
          `Address: ${p.organizer_address ?? '[ORGANIZER ADDRESS]'}`,
          `Date: ____________________________`,
        ],
      },

      { type: 'spacer', height: 24 },
      {
        type: 'paragraph',
        text: `Filing Fee: $125 (payable to the Florida Department of State)\nFiling: Florida Division of Corporations, P.O. Box 6327, Tallahassee, FL 32314\nOnline Filing: dos.myflorida.com/sunbiz\nNote: Florida requires an Annual Report ($138/yr) filed between January 1 and May 1 each year.`,
        centered: true,
      },
    ],
  }
}
