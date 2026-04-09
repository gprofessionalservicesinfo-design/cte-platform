import { z } from 'zod'

export const COMM_CHANNELS      = ['whatsapp', 'email', 'both', 'skipped'] as const
export const COMM_LANGUAGES     = ['es', 'en']                             as const
export const DELIVERY_STATUSES  = ['sent', 'failed', 'skipped']            as const

// Maps task_type → template version_label per language.
// Fallback to 'es' template when no 'en' variant exists.
export const TASK_TYPE_TO_TEMPLATE: Record<string, { es: string; en: string }> = {
  welcome_pending:                { es: 'welcome_es',          en: 'welcome_en'          },
  missing_data_followup:          { es: 'missing_data_es',     en: 'missing_data_es'     },
  document_rejected:              { es: 'document_rejected_es', en: 'document_rejected_es' },
  compliance_review_pending:      { es: 'next_steps_es',       en: 'next_steps_es'       },
  route_classification_completed: { es: 'next_steps_es',       en: 'next_steps_es'       },
}

export const ComunicacionOutputSchema = z.object({
  case_id:             z.string(),
  task_id:             z.string(),
  channel:             z.enum(COMM_CHANNELS),
  template_used:       z.string(),
  message_sent:        z.string(),
  language:            z.enum(COMM_LANGUAGES),
  delivery_status:     z.enum(DELIVERY_STATUSES),
  skip_reason:         z.string().nullable(),
  opt_out_checked:     z.boolean(),
  quiet_hours_checked: z.boolean(),
  confidence_score:    z.number().min(0).max(1),
  comm_version:        z.literal('comunicacion-v1.0').default('comunicacion-v1.0'),
})

// Shape of the LLM's JSON response (separate from the full output contract)
export const LLMMessageResponseSchema = z.object({
  message:          z.string(),
  subject:          z.string().nullable(),
  language:         z.enum(COMM_LANGUAGES),
  confidence_score: z.number().min(0).max(1),
})

export type ComunicacionOutput   = z.infer<typeof ComunicacionOutputSchema>
export type LLMMessageResponse   = z.infer<typeof LLMMessageResponseSchema>
export type CommChannel          = typeof COMM_CHANNELS[number]
export type CommLanguage         = typeof COMM_LANGUAGES[number]
