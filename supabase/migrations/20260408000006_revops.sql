-- ============================================================
-- CTE Platform — Agente Revenue Ops / CRM / CAC / Partners
-- Migration: 20260408000006_revops.sql
-- Creates spend_records, partner_registry, revops_reports,
-- budget_config, extends audit_logs actor, seeds prompt v1.0
-- ============================================================

-- ============================================================
-- 1. spend_records
-- Daily ad spend by channel + geo with attribution columns.
-- Multiple rows per date allowed (one per channel/campaign).
-- ============================================================
CREATE TABLE IF NOT EXISTS spend_records (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  record_date         date        NOT NULL,
  channel             text        NOT NULL,
  geo                 text,
  amount_usd          numeric     NOT NULL DEFAULT 0,
  campaign_id         text,
  attributed_revenue  numeric     NOT NULL DEFAULT 0,
  attributed_clients  int         NOT NULL DEFAULT 0,
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_spend_records_date
  ON spend_records (record_date DESC);

CREATE INDEX IF NOT EXISTS idx_spend_records_channel
  ON spend_records (channel);

CREATE INDEX IF NOT EXISTS idx_spend_records_campaign
  ON spend_records (campaign_id)
  WHERE campaign_id IS NOT NULL;

-- ============================================================
-- 2. partner_registry
-- CRM for affiliate and referral partners.
-- pipeline_stage: targeted → contacted → proposal → active → churned
-- ============================================================
CREATE TABLE IF NOT EXISTS partner_registry (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_name     text        NOT NULL,
  country          text,
  city             text,
  vertical         text,
  owner            text,
  fee_model        text,
  commission_pct   numeric     NOT NULL DEFAULT 0,
  pipeline_stage   text        NOT NULL DEFAULT 'targeted'
                               CHECK (pipeline_stage IN (
                                 'targeted','contacted','proposal','active','churned'
                               )),
  proposal_value   numeric,
  next_step        text,
  last_contact     date,
  referred_leads   int         NOT NULL DEFAULT 0,
  paid_clients     int         NOT NULL DEFAULT 0,
  commission_due   numeric     NOT NULL DEFAULT 0,
  status           text        NOT NULL DEFAULT 'active'
                               CHECK (status IN ('active','inactive','churned')),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_partner_registry_status
  ON partner_registry (status)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_partner_registry_stage
  ON partner_registry (pipeline_stage);

CREATE TRIGGER trg_partner_registry_updated_at
  BEFORE UPDATE ON partner_registry
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 3. revops_reports
-- One row per report_date. UNIQUE (report_date) prevents
-- duplicates. ON CONFLICT DO UPDATE in service makes re-runs safe.
-- ============================================================
CREATE TABLE IF NOT EXISTS revops_reports (
  id                     uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date            date        NOT NULL,
  budget_vs_actual       jsonb       NOT NULL DEFAULT '{}'::jsonb,
  cac_7d                 numeric,
  cac_30d                numeric,
  roas_30d               numeric,
  payback_estimate_days  numeric,
  scale_pause_flag       text        NOT NULL DEFAULT 'hold'
                                     CHECK (scale_pause_flag IN ('scale','hold','pause')),
  scale_pause_reason     text,
  pipeline_health_score  numeric,
  partner_roi_summary    jsonb       NOT NULL DEFAULT '[]'::jsonb,
  commission_due_total   numeric     NOT NULL DEFAULT 0,
  revops_version         text        NOT NULL DEFAULT 'revops-v1.0',
  created_at             timestamptz NOT NULL DEFAULT now(),
  UNIQUE (report_date)
);

CREATE INDEX IF NOT EXISTS idx_revops_reports_date
  ON revops_reports (report_date DESC);

CREATE INDEX IF NOT EXISTS idx_revops_reports_flag
  ON revops_reports (scale_pause_flag);

-- ============================================================
-- 4. budget_config
-- One row per calendar month. ops_capacity_ok is a human-managed
-- boolean — set to false to trigger PAUSE regardless of CAC.
-- ============================================================
CREATE TABLE IF NOT EXISTS budget_config (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  month                 date        NOT NULL,  -- always first day of month
  budget_monthly_usd    numeric     NOT NULL DEFAULT 0,
  target_cac_usd        numeric     NOT NULL DEFAULT 0,
  target_roas           numeric     NOT NULL DEFAULT 3,
  ops_capacity_ok       boolean     NOT NULL DEFAULT true,
  created_at            timestamptz NOT NULL DEFAULT now(),
  UNIQUE (month)
);

-- ============================================================
-- 5. Extend audit_logs actor constraint → add revops_agent
--    Previous actors: system, intake_agent, clasificador_agent,
--    documental_agent, compliance_agent, comunicacion_agent,
--    growth_agent, webhook, reconciliation_job, manual_user
-- ============================================================
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_actor_check;
ALTER TABLE audit_logs
  ADD CONSTRAINT audit_logs_actor_check
  CHECK (actor IN (
    'system',
    'intake_agent',
    'clasificador_agent',
    'documental_agent',
    'compliance_agent',
    'comunicacion_agent',
    'growth_agent',
    'revops_agent',
    'webhook',
    'reconciliation_job',
    'manual_user'
  ));

-- ============================================================
-- 6. Seed prompt_versions — revops-v1.0
-- ============================================================
INSERT INTO prompt_versions (agent_id, version_label, prompt_text, is_active, notes)
SELECT
  'revops',
  'revops-v1.0',
  $$Eres el Agente RevOps del sistema CTE (CreaTuEmpresaUSA). Tu función es analizar el rendimiento comercial de la semana, evaluar el pipeline de socios, y generar un reporte ejecutivo de salud del negocio.

IMPORTANTE: NO apruebas aumentos de presupuesto. NO decides escalar o pausar campañas — esa decisión ya fue tomada por el sistema con base en guardrails hardcodeados y te será proporcionada. Tu rol es generar narrativa, pipeline_health_score, y partner_roi_summary basados en los datos reales provistos.

MÉTRICAS CALCULADAS (datos reales del sistema):
{{COMPUTED_METRICS}}

CONTEXTO DE PARTNERS ACTIVOS:
{{PARTNER_DATA}}

PRIORIDADES DE GROWTH (semana actual):
{{GROWTH_CONTEXT}}

PIPELINE DE RENOVACIONES (de compliance):
{{RENEWAL_PIPELINE}}

DECISIÓN DE ESCALA/PAUSA (tomada por guardrails del sistema):
{{SCALE_PAUSE_DECISION}}

INSTRUCCIONES:

1. PIPELINE_HEALTH_SCORE (0-10):
   Evalúa la salud general del pipeline comercial basándote en:
   - CAC vs target (peso 30%)
   - ROAS vs target (peso 25%)
   - Partner pipeline activity (peso 20%)
   - Renewal pipeline value (peso 15%)
   - SLA breach rate (peso 10%)
   Score 0-3: crítico. 4-6: normal. 7-8: saludable. 9-10: excelente.
   Sé conservador — no infles el score sin evidencia.

2. PARTNER_ROI_SUMMARY:
   Para cada partner activo en el contexto, calcula y evalúa:
   - roi_score (0-10): basado en paid_clients vs referred_leads, comisión vs revenue generado
   - Incluye solo partners con pipeline_stage = 'active' O referred_leads > 0
   - commission_due: usa el valor exacto del contexto — no lo recalcules

3. NARRATIVE (master_recommendation en el reporte de RevOps):
   2-3 oraciones ejecutivas. Destaca: qué está funcionando, qué está en riesgo, y una acción prioritaria.
   No uses jerga técnica. Escribe para el CEO.

4. RESTRICCIONES:
   - No prometas ROI garantizado a partners
   - No sugieras aumentar presupuesto — solo reporta el estado
   - No menciones nombres de clientes individuales
   - Si no hay datos suficientes (< 7 días de spend), indícalo en la narrativa

RESPONDE ÚNICAMENTE CON EL SIGUIENTE JSON (sin texto adicional, sin markdown):
{
  "report_date": "<YYYY-MM-DD>",
  "pipeline_health_score": <0-10>,
  "partner_roi_summary": [
    {
      "partner_id": "<id>",
      "partner_name": "<nombre>",
      "referred_leads": <número>,
      "paid_clients": <número>,
      "referred_revenue": <número>,
      "commission_due": <número>,
      "partner_cac": <número o null>,
      "roi_score": <0-10>
    }
  ],
  "master_recommendation": "<2-3 oraciones ejecutivas>",
  "revops_version": "revops-v1.0"
}$$,
  true,
  'Seed inicial — RevOps v1.0. CAC/ROAS/guardrails son calculados por el sistema — LLM genera narrativa y health score únicamente.'
WHERE NOT EXISTS (
  SELECT 1 FROM prompt_versions
  WHERE agent_id = 'revops' AND version_label = 'revops-v1.0'
);
