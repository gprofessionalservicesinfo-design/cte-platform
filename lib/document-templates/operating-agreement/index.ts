import type { OperatingAgreementParams, OASubtype, DocumentTemplate } from '../types'
import { buildSingleMemberOA }   from './single-member'
import { buildMultiMemberOA }    from './multi-member'
import { buildManagerManagedOA } from './manager-managed'

const BUILDERS: Record<OASubtype, (p: OperatingAgreementParams) => DocumentTemplate> = {
  single_member:   buildSingleMemberOA,
  multi_member:    buildMultiMemberOA,
  manager_managed: buildManagerManagedOA,
}

export function buildOATemplate(p: OperatingAgreementParams, subtype: OASubtype): DocumentTemplate {
  const builder = BUILDERS[subtype]
  if (!builder) {
    throw new Error(
      `Unknown Operating Agreement subtype: "${subtype}". ` +
      `Supported: ${Object.keys(BUILDERS).join(', ')}.`
    )
  }
  return builder(p)
}

export const SUPPORTED_OA_SUBTYPES = Object.keys(BUILDERS) as OASubtype[]
