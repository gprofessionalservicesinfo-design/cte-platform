import { z } from 'zod'

export const DOC_TYPES = [
  'passport',
  'national_id',
  'proof_of_address',
  'ss4_ein',
  'itin_doc',
  'formation_doc',
  'operating_agreement',
  'ownership_doc',
  'other',
] as const

export const DOC_QA_STATUSES = ['accepted', 'rejected', 'requires_review'] as const

// Maps agent doc_type → checklist item codes that can be marked complete.
// Checked against both normalized_output.checklist_inicial (intake)
// and clasificador_output.checklist_additions (clasificador).
export const DOC_TYPE_CHECKLIST_MAP: Record<string, string[]> = {
  passport:            ['passport_certified', 'passport', 'gov_id', 'all_docs_immediate'],
  national_id:         ['gov_id', 'passport_or_id', 'all_docs_immediate'],
  proof_of_address:    ['proof_of_address', 'proof_of_address_foreign', 'proof_of_foreign_status'],
  ss4_ein:             ['ein_application', 'ein_foreign', 'priority_ein'],
  itin_doc:            ['itin_w7', 'itin_docs', 'itin_supporting_docs', 'itin_application'],
  formation_doc:       ['llc_articles', 'llc_or_corp_articles', 'articles_of_incorporation'],
  operating_agreement: ['operating_agreement'],
  ownership_doc:       ['beneficial_owner_ids', 'beneficial_owner_disclosure', 'shareholder_list'],
  other:               [],
}

export const DocumentalOutputSchema = z.object({
  case_id:               z.string(),
  document_id:           z.string(),
  doc_type:              z.enum(DOC_TYPES),
  legibility_score:      z.number().int().min(1).max(10),
  status:                z.enum(DOC_QA_STATUSES),
  rejection_reason:      z.string().nullable(),
  fraud_flag:            z.boolean(),
  duplicate_flag:        z.boolean(),
  name_mismatch_flag:    z.boolean(),
  expiration_flag:       z.boolean(),
  manual_review_reason:  z.string().nullable(),
  confidence_score:      z.number().min(0).max(1),
  requires_human_review: z.boolean(),
  doc_version:           z.literal('documental-v1.0').default('documental-v1.0'),
})

export type DocumentalOutput = z.infer<typeof DocumentalOutputSchema>
export type DocType          = typeof DOC_TYPES[number]
export type DocQAStatus      = typeof DOC_QA_STATUSES[number]
