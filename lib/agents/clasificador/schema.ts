import { z } from 'zod'

export const ASSIGNED_ROUTES = [
  'llc_single_member_us',
  'llc_foreign_owned',
  'corporation',
  'ein_only',
  'itin_ein',
  'formation_compliance',
  'formation_banking',
  'migratory_future',
  'urgent',
  'high_risk_documentary',
] as const

export const COMPLEXITY_LEVELS = ['Simple', 'Medium', 'Complex'] as const

export const ChecklistItemClasificadorSchema = z.object({
  code:              z.string(),
  label:             z.string(),
  required:          z.boolean(),
  status:            z.literal('pending').default('pending'),
  generated_by:      z.literal('clasificador').default('clasificador'),
  checklist_version: z.literal('clasificador-checklist-v1.0').default('clasificador-checklist-v1.0'),
  notes:             z.string().nullable().optional().default(null),
})

export const ClasificadorOutputSchema = z.object({
  case_id:               z.string(),
  assigned_route:        z.enum(ASSIGNED_ROUTES),
  complexity:            z.enum(COMPLEXITY_LEVELS),
  confidence_score:      z.number().min(0).max(1),
  upsells_eligible:      z.array(z.string()),
  regulatory_risks:      z.array(z.string()),
  requires_human_review: z.boolean(),
  human_review_reason:   z.string().nullable(),
  checklist_additions:   z.array(ChecklistItemClasificadorSchema),
  estimated_days:        z.number().int().min(1),
  next_action:           z.string().min(1),
  route_version:         z.literal('clasificador-v1.0').default('clasificador-v1.0'),
})

export type ClasificadorOutput        = z.infer<typeof ClasificadorOutputSchema>
export type ChecklistItemClasificador = z.infer<typeof ChecklistItemClasificadorSchema>
export type AssignedRoute             = typeof ASSIGNED_ROUTES[number]
export type Complexity                = typeof COMPLEXITY_LEVELS[number]
