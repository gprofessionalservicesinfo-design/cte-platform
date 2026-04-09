import { z } from 'zod'

export const ESCALATION_SEVERITIES = ['low', 'medium', 'high', 'critical'] as const
export const PARTNER_ALERT_TYPES   = [
  'no_owner', 'no_next_step', 'commission_due', 'high_roi_no_scale', 'churning',
] as const

export const EscalationSchema = z.object({
  type:                z.string(),
  severity:            z.enum(ESCALATION_SEVERITIES),
  case_id:             z.string().nullable(),
  agent_id:            z.string(),
  reason:              z.string(),
  recommended_action:  z.string(),
})

export const WeeklyPrioritiesSchema = z.object({
  ops_focus:            z.string(),
  commercial_focus:     z.string(),
  top_priority_cases:   z.array(z.string()),
  top_priority_tasks:   z.array(z.string()),
})

export const CapacityFlagsSchema = z.object({
  ops_saturated:               z.boolean(),
  cases_backlog_count:         z.number().int().min(0),
  avg_case_age_days:           z.number().min(0),
  human_review_pending_count:  z.number().int().min(0),
})

export const BudgetFlagsSchema = z.object({
  scale_pause_flag:  z.enum(['scale', 'hold', 'pause']),
  current_cac_7d:    z.number().nullable(),
  target_cac:        z.number().nullable(),
  budget_pacing:     z.string(),
})

export const PartnerAlertSchema = z.object({
  partner_id:         z.string(),
  partner_name:       z.string(),
  alert_type:         z.string(),
  severity:           z.enum(['low', 'medium', 'high']),
  recommended_action: z.string(),
})

export const AgentStatusSchema = z.object({
  intake_pending:           z.number().int().min(0),
  classification_pending:   z.number().int().min(0),
  documents_pending:        z.number().int().min(0),
  compliance_pending:       z.number().int().min(0),
  communications_pending:   z.number().int().min(0),
  renewals_due_30d:         z.number().int().min(0),
  human_review_pending:     z.number().int().min(0),
})

export const MasterOutputSchema = z.object({
  report_date:               z.string(),
  operational_health_score:  z.number().min(0).max(10),
  executive_summary:         z.string(),
  critical_escalations:      z.array(EscalationSchema),
  weekly_priorities:         WeeklyPrioritiesSchema,
  capacity_flags:            CapacityFlagsSchema,
  budget_flags:              BudgetFlagsSchema,
  partner_alerts:            z.array(PartnerAlertSchema),
  do_not_scale_reason:       z.string().nullable(),
  agent_status_summary:      AgentStatusSchema,
  master_version:            z.literal('master-v1.0').default('master-v1.0'),
})

export type MasterOutput      = z.infer<typeof MasterOutputSchema>
export type Escalation        = z.infer<typeof EscalationSchema>
export type WeeklyPriorities  = z.infer<typeof WeeklyPrioritiesSchema>
export type CapacityFlags     = z.infer<typeof CapacityFlagsSchema>
export type BudgetFlags       = z.infer<typeof BudgetFlagsSchema>
export type PartnerAlert      = z.infer<typeof PartnerAlertSchema>
export type AgentStatus       = z.infer<typeof AgentStatusSchema>
export type EscalationSeverity = typeof ESCALATION_SEVERITIES[number]

// Internal — inputs to the health score computation
export interface HealthInputs {
  casesBacklogCount:        number
  avgCaseAgeDays:           number
  humanReviewPendingCount:  number
  commDeliveryRate:         number   // 0-1
  revopsPipelineHealth:     number   // 0-10 from revops_reports
}
