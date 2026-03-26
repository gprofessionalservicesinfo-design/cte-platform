import type { OperatingAgreementParams, DocumentTemplate } from '../types'

export function buildManagerManagedOA(p: OperatingAgreementParams): DocumentTemplate {
  const effectiveDate = new Date(p.effective_date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
  const fiscalYearEnd = p.fiscal_year_end ?? 'December 31'
  const memberCount   = p.members.length

  const totalPct = p.members.reduce((s, m) => s + m.ownership_percentage, 0)

  const memberListItems = p.members.map((m, i) =>
    `Member ${i + 1}: ${m.name}, Address: ${m.address}, Ownership: ${m.ownership_percentage}%, Capital Contribution: ${m.capital_contribution ?? 'As agreed in writing'}`
  )

  const memberNames  = p.members.map((m) => m.name).join(', ')
  const managers     = p.managers ?? p.members.map((m) => m.name)
  const managerCount = managers.length
  const managerList  = managers.map((name, i) => `Manager ${i + 1}: ${name}`).join('; ')

  return {
    meta: {
      template_id:   'oa_manager_managed',
      document_type: 'operating_agreement',
      subtype:       'manager_managed',
      state:         p.state,
      state_code:    p.state_code,
      title:         'Manager-Managed LLC Operating Agreement',
      version:       '1.0',
      disclaimer:    'DRAFT — FOR REVIEW ONLY. This document has not been reviewed by an attorney. Manager-managed LLCs involve delegation of authority and fiduciary duties. Consult qualified legal and tax counsel before executing.',
    },
    sections: [
      { type: 'watermark_notice' },
      { type: 'title', text: 'OPERATING AGREEMENT', centered: true },
      { type: 'subtitle', text: 'Manager-Managed Limited Liability Company', centered: true },
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
          'Management Structure. The Company is manager-managed. The Members have delegated the management of the Company to the Manager(s) as set forth in Article IV of this Agreement.',
        ],
      },

      { type: 'section_heading', text: 'ARTICLE II — MEMBERS AND MEMBERSHIP INTERESTS' },
      {
        type: 'paragraph',
        text: `The Company has ${memberCount} Member${memberCount !== 1 ? 's' : ''}. The Members and their respective membership interests are:`,
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
          'Passive Investment. As Members in a manager-managed LLC, the Members are passive investors. Except as expressly reserved to Members in this Agreement or applicable law, the Members shall not participate in the day-to-day management of the Company.',
          'Membership Interests. Each Member\'s interest in the Company is personal property. A Member has no interest in specific Company property.',
          'Additional Members. No additional Members may be admitted except upon the affirmative vote of Members holding a Majority Interest and amendment of this Agreement.',
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

      { type: 'section_heading', text: 'ARTICLE IV — MANAGEMENT' },
      {
        type: 'paragraph',
        text: `The Company shall be managed by ${managerCount === 1 ? 'a Manager' : 'Managers'}. The initial Manager${managerCount !== 1 ? 's are' : ' is'}: ${managerList}.`,
        bold: true,
      },
      {
        type: 'numbered_list',
        items: [
          'Authority of Managers. The Manager(s) shall have full, exclusive, and complete authority, power, and discretion to manage and control the business, affairs, and properties of the Company, to make all decisions regarding those matters, and to perform any and all acts or activities customary or incident to the management of the Company\'s business.',
          'Specific Authority. Without limiting the foregoing, the Manager(s) may, without Member approval: (a) enter into any contract or agreement on behalf of the Company; (b) open, close, and manage Company bank accounts; (c) hire and discharge employees and agents; (d) acquire or lease any real or personal property; (e) borrow money and grant security interests in Company assets; (f) make and collect loans; (g) initiate, prosecute, and defend legal proceedings.',
          'Major Decisions Requiring Member Approval. The following require the affirmative vote of Members holding a Majority Interest: (a) admission of new Members; (b) removal or replacement of a Manager; (c) amendment of this Agreement; (d) incurrence of debt exceeding $50,000 in a single transaction or series of related transactions; (e) sale or transfer of all or substantially all Company assets outside the ordinary course of business; (f) merger, consolidation, or reorganization; (g) dissolution of the Company.',
          'Unanimous Member Consent Required. The following require unanimous Member consent: (a) amendment of the Articles of Organization; (b) change in the nature of the Company\'s business; (c) any act that would make it impossible to carry on ordinary business; (d) admission of any Member as a Manager.',
          'Number of Managers. The number of Managers shall be determined by the Members. Managers need not be Members.',
          'Term of Office. Each Manager shall serve until resignation, removal by a Majority Interest of the Members, death, or legal incapacity.',
          'Compensation. Managers shall be entitled to such compensation for their services as shall be determined by a Majority Interest of Members. Managers shall be reimbursed for all reasonable expenses incurred on behalf of the Company.',
          'Meetings of Managers. Managers may meet in person, by telephone, or by other electronic means. Action may be taken by written consent of all Managers in lieu of a meeting.',
          'Officers. The Manager(s) may appoint officers of the Company (President, Secretary, Treasurer, and such other officers as the Manager(s) deem appropriate) and may delegate authority to such officers. Officers serve at the pleasure of the Manager(s).',
        ],
      },

      { type: 'section_heading', text: 'ARTICLE V — MEMBER MEETINGS AND VOTING' },
      {
        type: 'numbered_list',
        items: [
          'Member Meetings. Members shall hold an annual meeting and may hold special meetings as needed. Special meetings may be called by any Manager or by Members holding at least twenty-five percent (25%) of Membership Interests.',
          'Notice. Notice of any meeting shall be given to all Members at least five (5) days prior to the meeting, stating the date, time, place, and purpose of the meeting.',
          'Quorum. The presence, in person or by proxy, of Members holding a Majority Interest shall constitute a quorum for any meeting.',
          'Voting. Each Member shall have voting rights proportional to their Membership Interest. "Majority Interest" means Members holding more than fifty percent (50%) of the total Membership Interests.',
          'Action Without Meeting. Any action required or permitted to be taken at a Member meeting may be taken without a meeting if Members holding the requisite percentage consent in writing.',
          'Information Rights. Each Member has the right to inspect the Company\'s books and records, receive annual financial statements, and be informed of all material matters affecting the Company.',
        ],
      },

      { type: 'section_heading', text: 'ARTICLE VI — ALLOCATIONS AND DISTRIBUTIONS' },
      {
        type: 'numbered_list',
        items: [
          'Allocation of Profits and Losses. Except as otherwise provided, all items of Company income, gain, loss, deduction, and credit shall be allocated among the Members in proportion to their Membership Interests.',
          'Tax Allocations. For income tax purposes, each item of income, gain, loss, deduction, and credit shall be allocated among the Members in the same manner as profits and losses, in accordance with Treasury Regulations § 1.704-1(b).',
          'Distributions. Distributions of cash or other property shall be made to the Members in proportion to their Membership Interests, at such times and in such amounts as determined by the Manager(s) in their reasonable discretion.',
          'Limitations on Distributions. No distribution shall be made if it would violate applicable law or render the Company unable to pay its debts as they come due.',
          'Tax Withholding. The Company may withhold distributions or portions thereof if required by applicable federal, state, or local law.',
        ],
      },

      { type: 'section_heading', text: 'ARTICLE VII — FIDUCIARY DUTIES' },
      {
        type: 'numbered_list',
        items: [
          'Duty of Loyalty. Each Manager owes a duty of loyalty to the Company and the Members, including: (a) accounting for and holding as trustee any property, profit, or benefit derived by the Manager in connection with the conduct of Company business; (b) refraining from dealing with the Company as or on behalf of a party having an interest adverse to the Company; and (c) refraining from competing with the Company in the conduct of Company business.',
          'Duty of Care. Each Manager shall discharge their duties in good faith, with the care an ordinarily prudent person in a like position would exercise under similar circumstances, and in a manner they reasonably believe to be in the best interests of the Company.',
          'Conflict of Interest. A Manager shall promptly disclose to the Members any conflict of interest in connection with a Company transaction. A conflicted Manager may still be counted for quorum purposes but shall recuse from voting on the conflicted matter unless all Members consent to the Manager\'s participation.',
          'Reliance on Information. A Manager is entitled to rely in good faith on information, opinions, reports, or statements prepared by officers, employees, or professional advisors.',
        ],
      },

      { type: 'section_heading', text: 'ARTICLE VIII — TRANSFER OF MEMBERSHIP INTERESTS' },
      {
        type: 'numbered_list',
        items: [
          'Restriction on Transfer. No Member may sell, assign, transfer, pledge, hypothecate, or otherwise dispose of all or any portion of their Membership Interest without the prior written consent of Members holding a Majority Interest, except for transfers to affiliates or family members as provided herein.',
          'Right of First Refusal. Before any Member (the "Transferring Member") may transfer their Membership Interest, the Transferring Member must first offer the Interest to the remaining Members pro rata at the same price and on the same terms as the proposed transfer.',
          'Right of First Refusal Procedure. The Transferring Member shall provide written notice to the other Members specifying the proposed transferee, price, and terms. The other Members shall have thirty (30) days to elect to purchase the Interest at those terms.',
          'Permitted Transfers. Transfers to a Member\'s wholly-owned entity or revocable living trust are permitted without consent, provided the transferee agrees in writing to be bound by this Agreement.',
          'Effect of Transfer. An approved transferee shall be admitted as a substituted Member only upon: (a) consent of the Members; (b) execution of this Agreement (or an amendment); and (c) payment of any applicable transfer costs.',
          'Involuntary Transfer. In the event of a Member\'s bankruptcy, death, incompetency, or involuntary transfer of their Membership Interest, the remaining Members shall have the right to purchase the Interest at fair market value within ninety (90) days of the triggering event.',
        ],
      },

      { type: 'section_heading', text: 'ARTICLE IX — INDEMNIFICATION AND LIABILITY' },
      {
        type: 'numbered_list',
        items: [
          'Limited Liability. No Member or Manager shall be personally liable for any debt, obligation, or liability of the Company solely by reason of being a Member or Manager.',
          'Indemnification of Managers. The Company shall indemnify each Manager for actions taken in good faith on behalf of the Company, except in cases of willful misconduct, fraud, or gross negligence. This indemnification includes reasonable attorneys\' fees and costs.',
          'Indemnification of Members. The Company shall indemnify each Member for actions taken at the direction of the Manager(s) on behalf of the Company, except in cases of willful misconduct or fraud.',
          'Expenses. The Company may advance expenses to a Manager or Member prior to final resolution of a matter, subject to the Manager\'s or Member\'s agreement to repay if it is determined that indemnification was not warranted.',
        ],
      },

      { type: 'section_heading', text: 'ARTICLE X — DISSOLUTION AND LIQUIDATION' },
      {
        type: 'numbered_list',
        items: [
          'Events of Dissolution. The Company shall be dissolved upon: (a) affirmative vote of Members holding at least two-thirds (2/3) of Membership Interests; (b) judicial decree; or (c) any other event required by applicable law.',
          'Winding Up. Upon dissolution, the Company affairs shall be wound up by the Manager(s) or a liquidating trustee appointed by the Members. The Company shall first pay all debts and liabilities, then distribute remaining assets to Members in proportion to their positive Capital Account balances.',
          'Termination. The Company shall terminate upon filing of a Certificate of Dissolution (or equivalent) with the appropriate state authority.',
        ],
      },

      { type: 'section_heading', text: 'ARTICLE XI — GENERAL PROVISIONS' },
      {
        type: 'numbered_list',
        items: [
          `Governing Law. This Agreement is governed by the laws of the State of ${p.state}.`,
          'Entire Agreement. This Agreement supersedes all prior agreements between the Members and Managers regarding the Company.',
          'Amendment. This Agreement may be amended only by a written instrument signed by all Members.',
          'Severability. Invalid provisions shall not affect the validity of remaining provisions.',
          'Dispute Resolution. Any dispute arising under this Agreement shall first be subject to good-faith negotiation among the parties. If unresolved within thirty (30) days, the dispute shall be submitted to mediation before any litigation may commence.',
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

      ...(managers.length > 0 ? [
        { type: 'spacer' as const, height: 24 },
        {
          type: 'paragraph' as const,
          text: 'The undersigned Manager(s) accept(s) appointment and agree(s) to serve in accordance with this Agreement:',
          centered: true,
        },
        { type: 'spacer' as const, height: 12 },
        {
          type: 'signature_block' as const,
          items: managers.flatMap((name) => [
            `Manager: ${name}`,
            `Date: ____________________________`,
            `Signature: ____________________________`,
            '',
          ]),
        },
      ] : []),
    ],
  }
}
