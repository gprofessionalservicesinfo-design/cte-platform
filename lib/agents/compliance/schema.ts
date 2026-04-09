import { z } from 'zod'

export const COMPLIANCE_RISK_LEVELS = ['low', 'medium', 'high', 'critical'] as const
export const OBLIGATION_FREQUENCIES = ['one_time', 'annual', 'biennial']     as const
export const OBLIGATION_STATUSES    = ['pending', 'completed', 'overdue']    as const
export const NOTIFY_WINDOWS         = [90, 60, 30]                           as const

export const ComplianceObligationSchema = z.object({
  code:      z.string(),
  label:     z.string(),
  due_date:  z.string().nullable(),
  frequency: z.enum(OBLIGATION_FREQUENCIES),
  status:    z.enum(OBLIGATION_STATUSES),
  priority:  z.number().int().min(1).max(5),
  notes:     z.string().nullable(),
})

export const RenewalOpportunitySchema = z.object({
  service_type:            z.string(),
  due_date:                z.string().nullable(),
  estimated_revenue:       z.number().min(0),
  priority:                z.number().int().min(1).max(5),
  auto_notify_days_before: z.union([z.literal(90), z.literal(60), z.literal(30)]),
})

export const ComplianceOutputSchema = z.object({
  case_id:               z.string(),
  estado_objetivo:       z.string(),
  assigned_route:        z.string(),
  obligations:           z.array(ComplianceObligationSchema),
  renewal_revenue_queue: z.array(RenewalOpportunitySchema),
  compliance_risk_level: z.enum(COMPLIANCE_RISK_LEVELS),
  requires_human_review: z.boolean(),
  human_review_reason:   z.string().nullable(),
  rule_version:          z.literal('compliance-v1.0').default('compliance-v1.0'),
  source_updated_at:     z.string(),
  confidence_score:      z.number().min(0).max(1),
})

export type ComplianceOutput     = z.infer<typeof ComplianceOutputSchema>
export type ComplianceObligation = z.infer<typeof ComplianceObligationSchema>
export type RenewalOpportunity   = z.infer<typeof RenewalOpportunitySchema>
export type ComplianceRiskLevel  = typeof COMPLIANCE_RISK_LEVELS[number]
