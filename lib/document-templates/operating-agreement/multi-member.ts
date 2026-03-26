import type { OperatingAgreementParams, DocumentTemplate } from '../types'

export function buildMultiMemberOA(p: OperatingAgreementParams): DocumentTemplate {
  const effectiveDate = new Date(p.effective_date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
  const fiscalYearEnd = p.fiscal_year_end ?? 'December 31'
  const memberCount   = p.members.length

  const totalPct = p.members.reduce((s, m) => s + m.ownership_percentage, 0)

  const memberListItems = p.members.map((m, i) =>
    `Member ${i + 1}: ${m.name}, Address: ${m.address}, Ownership: ${m.ownership_percentage}%, Capital Contribution: ${m.capital_contribution ?? 'As agreed in writing'}`
  )

  const memberNames = p.members.map((m) => m.name).join(', ')

  return {
    meta: {
      template_id:   'oa_multi_member',
      document_type: 'operating_agreement',
      subtype:       'multi_member',
      state:         p.state,
      state_code:    p.state_code,
      title:         'Multi-Member LLC Operating Agreement',
      version:       '1.0',
      disclaimer:    'DRAFT — FOR REVIEW ONLY. This document has not been reviewed by an attorney. Multi-member LLCs have complex legal, tax, and governance implications. Consult qualified legal and tax counsel before executing.',
    },
    sections: [
      { type: 'watermark_notice' },
      { type: 'title', text: 'OPERATING AGREEMENT', centered: true },
      { type: 'subtitle', text: 'Multi-Member Limited Liability Company', centered: true },
      { type: 'spacer', height: 24 },

      {
        type: 'paragraph',
        text: `This Operating Agreement ("Agreement") of ${p.company_name} (the "Company") is entered into as of ${effectiveDate}, by and among the Members listed in Article II below (collectively, the "Members").`,
        bold: true,
      },
      { type: 'spacer', height: 12 },

      { type: 'section_heading', text: 'ARTICLE I — FORMATION AND IDENTITY' },
      {
        type: 'numbered_list',
        items: [
          `Name. The name of the Company is ${p.company_name}.`,
          `Formation. The Company was organized under the laws of the State of ${p.state} upon filing of the Articles of Organization with the ${p.state} Secretary of State.`,
          `Principal Office. ${p.principal_office_address ?? '[PRINCIPAL OFFICE ADDRESS]'}`,
          `Registered Agent. ${p.registered_agent_name ?? '[REGISTERED AGENT NAME]'} at ${p.registered_agent_address ?? '[REGISTERED AGENT ADDRESS]'}.`,
          `Purpose. ${p.purpose ?? 'To engage in any lawful business permitted under the laws of the State of ' + p.state + '.'}`,
          `Fiscal Year. The fiscal year of the Company ends on ${fiscalYearEnd} of each calendar year.`,
          'Term. The Company shall have perpetual existence unless dissolved pursuant to this Agreement or applicable law.',
        ],
      },

      { type: 'section_heading', text: 'ARTICLE II — MEMBERS AND MEMBERSHIP INTERESTS' },
      {
        type: 'paragraph',
        text: `The Company has ${memberCount} Members. The Members and their respective membership interests are:`,
      },
      { type: 'numbered_list', items: memberListItems },
      ...(totalPct !== 100
        ? [{
            type: 'paragraph' as const,
            text: `⚠ WARNING: The ownership percentages above total ${totalPct}%, not 100%. Please review and correct.`,
            bold: true,
          }]
        : []),
      {
        type: 'numbered_list',
        items: [
          'Additional Members. No additional Members may be admitted except upon the affirmative vote of Members holding a Majority Interest and amendment of this Agreement.',
          'Membership Interests. Each Member\'s interest in the Company (each, a "Membership Interest") is personal property. A Member has no interest in specific Company property.',
        ],
      },

      { type: 'section_heading', text: 'ARTICLE III — CAPITAL CONTRIBUTIONS AND ACCOUNTS' },
      {
        type: 'numbered_list',
        items: [
          'Initial Capital Contributions. The initial capital contribution of each Member is as set forth in Article II above.',
          'Additional Contributions. No Member shall be required to make any additional capital contribution. Additional contributions may be made upon unanimous consent of the Members.',
          'Capital Accounts. A separate Capital Account shall be maintained for each Member, credited with contributions and income allocations, and debited for distributions and loss allocations.',
          'No Interest. No Member shall be entitled to receive interest on their capital contribution unless otherwise unanimously agreed.',
          'Return of Capital. No Member shall have the right to demand or receive the return of their capital contribution except upon dissolution of the Company.',
        ],
      },

      { type: 'section_heading', text: 'ARTICLE IV — ALLOCATIONS AND DISTRIBUTIONS' },
      {
        type: 'numbered_list',
        items: [
          'Allocation of Profits and Losses. Except as otherwise provided, all items of Company income, gain, loss, deduction, and credit shall be allocated among the Members in proportion to their Membership Interests.',
          'Tax Allocations. For income tax purposes, each item of income, gain, loss, deduction, and credit shall be allocated among the Members in the same manner as profits and losses, in accordance with Treasury Regulations § 1.704-1(b).',
          'Distributions. Distributions of cash or other property shall be made to the Members in proportion to their Membership Interests, at such times and in such amounts as determined by a Majority Interest.',
          'Limitations on Distributions. No distribution shall be made if it would violate applicable law or render the Company unable to pay its debts as they come due.',
          'Tax Withholding. The Company may withhold distributions or portions thereof if required by applicable federal, state, or local law.',
        ],
      },

      { type: 'section_heading', text: 'ARTICLE V — MANAGEMENT' },
      {
        type: 'numbered_list',
        items: [
          'Member Management. The Company is member-managed. Each Member has the right to participate in the management of the Company\'s business and affairs.',
          'Voting Rights. Each Member shall have voting rights proportional to their Membership Interest. "Majority Interest" means Members holding more than fifty percent (50%) of the total Membership Interests.',
          'Ordinary Decisions. Decisions arising in the ordinary course of business may be made by any Member authorized to act on behalf of the Company, provided such decision does not require Member approval under this Agreement.',
          'Major Decisions. The following actions require the affirmative vote of Members holding a Majority Interest: (a) admission of new Members; (b) amendment of this Agreement; (c) incurrence of debt exceeding $10,000; (d) sale of Company assets outside the ordinary course of business; (e) merger, consolidation, or reorganization; (f) dissolution of the Company.',
          'Unanimous Decisions. The following require unanimous Member consent: (a) amendment of the Articles of Organization; (b) change in the nature of the Company\'s business; (c) any act that would make it impossible to carry on ordinary business.',
          'Meetings. The Members may hold meetings at any time upon notice to all Members. Meetings may be held in person, by telephone, or by other electronic means. Action may be taken without a meeting if all Members consent in writing.',
        ],
      },

      { type: 'section_heading', text: 'ARTICLE VI — TRANSFER OF MEMBERSHIP INTERESTS' },
      {
        type: 'numbered_list',
        items: [
          'Restriction on Transfer. No Member may sell, assign, transfer, pledge, hypothecate, or otherwise dispose of all or any portion of their Membership Interest without the prior written consent of Members holding a Majority Interest, except for transfers to affiliates or family members as provided herein.',
          'Right of First Refusal. Before any Member (the "Transferring Member") may transfer their Membership Interest, the Transferring Member must first offer the Interest to the remaining Members pro rata at the same price and on the same terms as the proposed transfer.',
          'Right of First Refusal Procedure. The Transferring Member shall provide written notice to the other Members specifying the proposed transferee, price, and terms. The other Members shall have thirty (30) days to elect to purchase the Interest at those terms.',
          'Permitted Transfers. Transfers to a Member\'s wholly-owned entity or revocable living trust are permitted without consent, provided the transferee agrees in writing to be bound by this Agreement.',
          'Effect of Transfer. An approved transferee shall be admitted as a substituted Member only upon: (a) consent of the remaining Members; (b) execution of this Agreement (or an amendment); and (c) payment of any applicable transfer costs.',
          'Involuntary Transfer. In the event of a Member\'s bankruptcy, death, incompetency, or involuntary transfer of their Membership Interest, the remaining Members shall have the right to purchase the Interest at fair market value within ninety (90) days of the triggering event.',
        ],
      },

      { type: 'section_heading', text: 'ARTICLE VII — INDEMNIFICATION AND LIABILITY' },
      {
        type: 'numbered_list',
        items: [
          'Limited Liability. No Member shall be personally liable for any debt, obligation, or liability of the Company solely by reason of being a Member.',
          'Indemnification. The Company shall indemnify each Member, manager, officer, employee, and agent for actions taken in good faith on behalf of the Company, except in cases of willful misconduct, fraud, or gross negligence.',
          'Expenses. The Company may advance expenses to a Member or officer prior to final resolution of a matter, subject to the Member\'s agreement to repay if it is determined that indemnification was not warranted.',
        ],
      },

      { type: 'section_heading', text: 'ARTICLE VIII — DISSOLUTION AND LIQUIDATION' },
      {
        type: 'numbered_list',
        items: [
          'Events of Dissolution. The Company shall be dissolved upon: (a) affirmative vote of Members holding at least two-thirds (2/3) of Membership Interests; (b) judicial decree; or (c) any other event required by applicable law.',
          'Winding Up. Upon dissolution, the Company affairs shall be wound up by the Members or a liquidating trustee. The Company shall first pay all debts and liabilities, then distribute remaining assets to Members in proportion to their positive Capital Account balances.',
          'Termination. The Company shall terminate upon filing of a Certificate of Dissolution (or equivalent) with the appropriate state authority.',
        ],
      },

      { type: 'section_heading', text: 'ARTICLE IX — GENERAL PROVISIONS' },
      {
        type: 'numbered_list',
        items: [
          `Governing Law. This Agreement is governed by the laws of the State of ${p.state}.`,
          'Entire Agreement. This Agreement supersedes all prior agreements between the Members regarding the Company.',
          'Amendment. This Agreement may be amended only by a written instrument signed by all Members.',
          'Severability. Invalid provisions shall not affect the validity of remaining provisions.',
          'Dispute Resolution. Any dispute arising under this Agreement shall first be subject to good-faith negotiation among the Members. If unresolved within thirty (30) days, the dispute shall be submitted to mediation before any litigation may commence.',
          'Counterparts and Electronic Signatures. This Agreement may be executed in counterparts, including by electronic signature, each of which shall be deemed an original.',
        ],
      },

      { type: 'spacer', height: 36 },
      { type: 'horizontal_rule' },
      { type: 'spacer', height: 12 },
      {
        type: 'paragraph',
        text: 'IN WITNESS WHEREOF, the Members have executed this Operating Agreement as of the date first written above.',
        centered: true,
      },
      { type: 'spacer', height: 24 },

      {
        type: 'signature_block',
        items: p.members.flatMap((m) => [
          `Member: ${m.name}`,
          `Address: ${m.address}`,
          `Ownership Interest: ${m.ownership_percentage}%`,
          `Date: ____________________________`,
          `Signature: ____________________________`,
          '',
        ]),
      },
    ],
  }
}
