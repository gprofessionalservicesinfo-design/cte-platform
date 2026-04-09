import { z } from 'zod'

export const SCALE_PAUSE_FLAGS = ['scale', 'hold', 'pause'] as const
export const PACING_STATUSES   = ['on_track', 'over_pacing', 'under_pacing'] as const

export const BudgetStatusSchema = z.object({
  budget_monthly:         z.number().min(0),
  spent_mtd:              z.number().min(0),
  remaining:              z.number(),
  pacing_status:          z.enum(PACING_STATUSES),
  days_remaining_in_month: z.number().int().min(0),
})

export const PartnerROISchema = z.object({
  partner_id:       z.string(),
  partner_name:     z.string(),
  referred_leads:   z.number().int().min(0),
  paid_clients:     z.number().int().min(0),
  referred_revenue: z.number().min(0),
  commission_due:   z.number().min(0),
  partner_cac:      z.number().nullable(),
  roi_score:        z.number().min(0).max(10),
})

// Full output contract — scale_pause_flag is set by applyGuardrails(), not LLM
export const RevopsOutputSchema = z.object({
  report_date:            z.string(),
  budget_vs_actual:       BudgetStatusSchema,
  cac_7d:                 z.number().nullable(),
  cac_30d:                z.number().nullable(),
  roas_30d:               z.number().nullable(),
  payback_estimate_days:  z.number().nullable(),
  scale_pause_flag:       z.enum(SCALE_PAUSE_FLAGS),
  scale_pause_reason:     z.string(),
  pipeline_health_score:  z.number().min(0).max(10),
  partner_roi_summary:    z.array(PartnerROISchema),
  commission_due_total:   z.number().min(0),
  revops_version:         z.literal('revops-v1.0').default('revops-v1.0'),
})

// Shape of the LLM's JSON response (subset — service fills the rest)
export const LLMRevopsResponseSchema = z.object({
  report_date:            z.string(),
  pipeline_health_score:  z.number().min(0).max(10),
  partner_roi_summary:    z.array(PartnerROISchema),
  master_recommendation:  z.string(),
  revops_version:         z.string(),
})

// Computed metrics passed to guardrails (internal — not stored as-is)
export interface ComputedMetrics {
  cac_7d:                  number | null
  cac_14d:                 number | null
  cac_30d:                 number | null
  roas_30d:                number | null
  payback_estimate_days:   number | null
  spend_mtd:               number
  spend_7d:                number
  paid_clients_7d:         number
  paid_clients_30d:        number
  attributed_revenue_30d:  number
  top_campaign_spend_7d:   number
  budget_monthly:          number
  target_cac:              number
  target_roas:             number
  ops_capacity_ok:         boolean
  sla_breach_rate:         number   // 0-1
}

export type RevopsOutput    = z.infer<typeof RevopsOutputSchema>
export type BudgetStatus    = z.infer<typeof BudgetStatusSchema>
export type PartnerROI      = z.infer<typeof PartnerROISchema>
export type LLMRevopsResponse = z.infer<typeof LLMRevopsResponseSchema>
export type ScalePauseFlag  = typeof SCALE_PAUSE_FLAGS[number]
export type PacingStatus    = typeof PACING_STATUSES[number]
