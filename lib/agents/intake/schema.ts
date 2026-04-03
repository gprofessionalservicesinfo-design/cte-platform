import { z } from 'zod'

export const ChecklistItemSchema = z.object({
  code:              z.string(),
  label:             z.string(),
  required:          z.boolean(),
  status:            z.literal('pending').default('pending'),
  generated_by:      z.literal('intake').default('intake'),
  checklist_version: z.literal('intake-checklist-v1.0').default('intake-checklist-v1.0'),
  notes:             z.string().nullable().optional().default(null),
})

export const ClienteSchema = z.object({
  nombre:           z.string().min(1),
  email:            z.string().email(),
  telefono:         z.string().nullable().optional().default(null),
  idioma_preferido: z.string().default('es'),
  pais_origen:      z.string().nullable().optional().default(null),
  estado_objetivo:  z.string().nullable().optional().default(null),
})

export const IntakeOutputSchema = z.object({
  case_id:               z.string(),
  cliente:               ClienteSchema,
  servicio_solicitado:   z.string().min(1),
  service_family:        z.enum([
    'LLC_Formation',
    'Corporation_Formation',
    'EIN_Only',
    'Registered_Agent',
    'Compliance',
    'Other',
  ]),
  intake_score:          z.number().int().min(1).max(10),
  score_reasoning:       z.string().min(1),
  checklist_inicial:     z.array(ChecklistItemSchema).min(1),
  siguiente_accion:      z.string().min(1),
  requires_human_review: z.boolean(),
  human_review_reason:   z.string().nullable(),
  confidence_score:      z.number().min(0).max(1),
})

export type IntakeOutput  = z.infer<typeof IntakeOutputSchema>
export type ChecklistItem = z.infer<typeof ChecklistItemSchema>
