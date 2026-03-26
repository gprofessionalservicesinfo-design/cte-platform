import type { OperatingAgreementParams, DocumentTemplate } from '../types'

export function buildSingleMemberOA(p: OperatingAgreementParams): DocumentTemplate {
  const member = p.members[0]
  const effectiveDate = new Date(p.effective_date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
  const fiscalYearEnd = p.fiscal_year_end ?? 'December 31'

  return {
    meta: {
      template_id:   'oa_single_member',
      document_type: 'operating_agreement',
      subtype:       'single_member',
      state:         p.state,
      state_code:    p.state_code,
      title:         'Single Member LLC Operating Agreement',
      version:       '1.0',
      disclaimer:    'DRAFT — FOR REVIEW ONLY. This document has not been reviewed by an attorney and should not be relied upon as legal advice. Consult a qualified attorney before using this as a binding legal document.',
    },
    sections: [
      { type: 'watermark_notice' },
      { type: 'title', text: 'OPERATING AGREEMENT', centered: true },
      { type: 'subtitle', text: 'Single Member Limited Liability Company', centered: true },
      { type: 'spacer', height: 24 },

      {
        type: 'paragraph',
        text: `This Operating Agreement ("Agreement") of ${p.company_name} (the "Company") is entered into as of ${effectiveDate}, by ${member?.name ?? '[MEMBER NAME]'} (the "Member").`,
        bold: true,
      },
      { type: 'spacer', height: 12 },

      { type: 'section_heading', text: 'ARTICLE I — FORMATION AND IDENTITY' },
      {
        type: 'numbered_list',
        items: [
          `Name. The name of the Company is ${p.company_name}. The Company may conduct business under that name or any other name that the Member deems appropriate or advisable.`,
          `Formation. The Company was formed as a limited liability company under the laws of the State of ${p.state} upon the filing of the Articles of Organization with the ${p.state} Secretary of State.`,
          `Principal Office. The principal place of business of the Company shall be: ${p.principal_office_address ?? '[PRINCIPAL OFFICE ADDRESS]'}`,
          `Registered Agent. The Company's registered agent in ${p.state} is ${p.registered_agent_name ?? '[REGISTERED AGENT]'} located at ${p.registered_agent_address ?? '[REGISTERED AGENT ADDRESS]'}.`,
          `Purpose. ${p.purpose ?? 'The Company is organized to engage in any lawful business or activity permitted under the laws of the State of ' + p.state + '.'}`,
          `Fiscal Year. The fiscal year of the Company shall end on ${fiscalYearEnd} of each year.`,
          `Term. The Company shall have perpetual existence, unless earlier dissolved as provided herein or as required by law.`,
        ],
      },

      { type: 'section_heading', text: 'ARTICLE II — MEMBER' },
      {
        type: 'numbered_list',
        items: [
          `Sole Member. The Company has one (1) Member: ${member?.name ?? '[MEMBER NAME]'}, with a principal address of: ${member?.address ?? '[MEMBER ADDRESS]'}.`,
          `Membership Interest. The Member holds one hundred percent (100%) of all membership interests in the Company.`,
          `Capital Contribution. The Member's initial capital contribution is: ${member?.capital_contribution ?? '$0.00 or as otherwise agreed'}.`,
          `No Additional Members. No additional Members may be admitted without written consent of the existing Member and amendment of this Agreement.`,
          `Single Member Status. The Company shall be treated as a disregarded entity for U.S. federal income tax purposes pursuant to Treasury Regulations § 301.7701-3, unless the Member elects otherwise.`,
        ],
      },

      { type: 'section_heading', text: 'ARTICLE III — MANAGEMENT' },
      {
        type: 'numbered_list',
        items: [
          'Member Management. The Company shall be managed by the Member, who shall have full and exclusive authority over all decisions relating to the business and affairs of the Company.',
          'Authority. The Member shall have the right to bind the Company in any and all matters, including without limitation: entering contracts, opening bank accounts, acquiring assets, and taking any other action on behalf of the Company.',
          'Officers. The Member may, from time to time, designate officers of the Company with such titles and duties as the Member determines appropriate. Such officers shall serve at the pleasure of the Member.',
          'Delegation. The Member may delegate authority to act on behalf of the Company to any person or persons as the Member sees fit, by written authorization or resolution.',
        ],
      },

      { type: 'section_heading', text: 'ARTICLE IV — CAPITAL ACCOUNTS AND ACCOUNTING' },
      {
        type: 'numbered_list',
        items: [
          `Capital Account. A capital account shall be maintained for the Member in accordance with applicable Treasury Regulations. The Member's capital account shall be credited with contributions and the Member's share of income and gains, and debited for distributions and the Member's share of losses and deductions.`,
          'Books and Records. The Company shall maintain complete and accurate books of account and other Company records at its principal office. The Member shall have access to all books and records at any time.',
          `Tax Year. The Company shall use the calendar year as its taxable year, ending ${fiscalYearEnd}.`,
          'Tax Treatment. Unless otherwise elected, the Company shall be treated as a disregarded entity for federal tax purposes (Form 1040, Schedule C for sole proprietor or applicable form). The Member is responsible for all federal and state income taxes on Company income.',
        ],
      },

      { type: 'section_heading', text: 'ARTICLE V — DISTRIBUTIONS' },
      {
        type: 'numbered_list',
        items: [
          'Discretionary Distributions. Distributions of cash or other assets shall be made at such times and in such amounts as the Member determines in the Member\'s sole discretion, subject to applicable law.',
          'Limitation. No distribution shall be made if, after giving effect to the distribution, the Company would not be able to pay its debts as they become due in the ordinary course of business.',
          'Sole Recipient. All distributions shall be made entirely to the Member as the sole interest holder.',
        ],
      },

      { type: 'section_heading', text: 'ARTICLE VI — INDEMNIFICATION AND LIABILITY' },
      {
        type: 'numbered_list',
        items: [
          'Limited Liability. The Member shall not be personally liable for any debt, obligation, or liability of the Company solely by reason of being a Member, except as otherwise required by applicable law.',
          'Indemnification. The Company shall indemnify and hold harmless the Member from and against all claims, liabilities, costs, and expenses (including reasonable attorneys\' fees) arising out of or relating to the Member\'s actions on behalf of the Company, except in cases of willful misconduct or fraud.',
          'Insurance. The Company may purchase and maintain liability insurance as the Member deems appropriate.',
        ],
      },

      { type: 'section_heading', text: 'ARTICLE VII — DISSOLUTION AND WINDING UP' },
      {
        type: 'numbered_list',
        items: [
          'Events of Dissolution. The Company shall be dissolved upon: (a) written determination by the Member to dissolve the Company; (b) entry of a judicial decree of dissolution; or (c) any event required by applicable state law.',
          'Winding Up. Upon dissolution, the Company\'s affairs shall be wound up by the Member. The assets shall be applied to: (i) payment of Company debts and liabilities; (ii) establishment of any necessary reserves; and (iii) distribution of remaining assets to the Member.',
          'Certificate of Dissolution. Upon completion of winding up, the Member shall file a Certificate of Dissolution (or equivalent document) with the appropriate state authority.',
        ],
      },

      { type: 'section_heading', text: 'ARTICLE VIII — GENERAL PROVISIONS' },
      {
        type: 'numbered_list',
        items: [
          `Governing Law. This Agreement shall be governed by and construed in accordance with the laws of the State of ${p.state}, without regard to conflict of law principles.`,
          'Entire Agreement. This Agreement constitutes the entire agreement between the Member and the Company with respect to the subject matter hereof and supersedes all prior agreements and understandings.',
          'Amendment. This Agreement may be amended only by a written instrument signed by the Member.',
          'Severability. If any provision of this Agreement is held invalid or unenforceable, the remaining provisions shall continue in full force and effect.',
          'Counterparts. This Agreement may be executed in one or more counterparts, each of which shall be deemed an original.',
          'Headings. Section headings are for convenience only and shall not affect the interpretation of this Agreement.',
        ],
      },

      { type: 'spacer', height: 36 },
      { type: 'horizontal_rule' },
      { type: 'spacer', height: 12 },
      {
        type: 'paragraph',
        text: `IN WITNESS WHEREOF, the Member has executed this Operating Agreement as of the date first written above.`,
        centered: true,
      },
      { type: 'spacer', height: 36 },

      {
        type: 'signature_block',
        items: [
          `Member: ${member?.name ?? '[MEMBER NAME]'}`,
          `Address: ${member?.address ?? '[MEMBER ADDRESS]'}`,
          `Membership Interest: 100%`,
          `Date: ____________________________`,
          `Signature: ____________________________`,
          '',
          `Company: ${p.company_name}`,
          `State of Formation: ${p.state}`,
        ],
      },
    ],
  }
}
