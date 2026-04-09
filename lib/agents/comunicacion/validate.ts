import {
  ComunicacionOutputSchema,
  ComunicacionOutput,
  LLMMessageResponseSchema,
  LLMMessageResponse,
  COMM_CHANNELS,
  COMM_LANGUAGES,
  DELIVERY_STATUSES,
} from './schema'

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(Number.isFinite(n) ? n : min, min), max)
}

// Parse and validate the LLM's inner JSON response (message + subject + language + confidence)
export function parseLLMMessageResponse(
  raw: unknown
): { data: LLMMessageResponse; valid: boolean } {
  const result = LLMMessageResponseSchema.safeParse(raw)
  if (result.success) return { data: result.data, valid: true }

  // Fallback: extract what we can
  const o = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>
  return {
    data: {
      message:          typeof o.message  === 'string' ? o.message  : 'Hola, gracias por confiar en CreaTuEmpresaUSA. Nos pondremos en contacto contigo pronto.',
      subject:          typeof o.subject  === 'string' ? o.subject  : null,
      language:         COMM_LANGUAGES.includes(o.language as typeof COMM_LANGUAGES[number])
                          ? (o.language as LLMMessageResponse['language'])
                          : 'es',
      confidence_score: clamp(Number(o.confidence_score), 0, 1) || 0.4,
    },
    valid: false,
  }
}

// Validate the full agent output contract
export function normalizeComunicacionOutput(
  raw:            unknown,
  fallbackCaseId: string,
  fallbackTaskId: string
): { data: ComunicacionOutput; normalized: boolean; issues: string[] } {
  const result = ComunicacionOutputSchema.safeParse(raw)
  if (result.success) return { data: result.data, normalized: false, issues: [] }

  const o = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>

  const data: ComunicacionOutput = {
    case_id:             typeof o.case_id     === 'string' ? o.case_id     : fallbackCaseId,
    task_id:             typeof o.task_id      === 'string' ? o.task_id      : fallbackTaskId,
    channel:             COMM_CHANNELS.includes(o.channel as typeof COMM_CHANNELS[number])
                           ? (o.channel as ComunicacionOutput['channel'])
                           : 'skipped',
    template_used:       typeof o.template_used   === 'string' ? o.template_used   : 'unknown',
    message_sent:        typeof o.message_sent    === 'string' ? o.message_sent    : '',
    language:            COMM_LANGUAGES.includes(o.language as typeof COMM_LANGUAGES[number])
                           ? (o.language as ComunicacionOutput['language'])
                           : 'es',
    delivery_status:     DELIVERY_STATUSES.includes(o.delivery_status as typeof DELIVERY_STATUSES[number])
                           ? (o.delivery_status as ComunicacionOutput['delivery_status'])
                           : 'failed',
    skip_reason:         typeof o.skip_reason === 'string' ? o.skip_reason : 'Normalización aplicada',
    opt_out_checked:     o.opt_out_checked     === true,
    quiet_hours_checked: o.quiet_hours_checked === true,
    confidence_score:    clamp(Number(o.confidence_score), 0, 1) || 0.4,
    comm_version:        'comunicacion-v1.0',
  }

  const issues = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`)
  return { data, normalized: true, issues }
}
