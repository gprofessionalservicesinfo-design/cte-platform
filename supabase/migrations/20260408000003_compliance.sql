-- ============================================================
-- CTE Platform — Agente Compliance / Matriz Estatal
-- Migration: 20260408000003_compliance.sql
-- Creates compliance_timeline, renewal_queue, extends cases,
-- extends audit_logs actor constraint, seeds prompt v1.0
-- ============================================================

-- ============================================================
-- 1. compliance_timeline
-- Stores one obligation row per case per code.
-- UNIQUE (case_id, obligation_code) enables idempotent upserts.
-- ============================================================
CREATE TABLE IF NOT EXISTS compliance_timeline (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id          uuid        NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  obligation_code  text        NOT NULL,
  obligation_label text        NOT NULL,
  due_date         date,
  frequency        text        NOT NULL DEFAULT 'one_time'
                               CHECK (frequency IN ('one_time','annual','biennial')),
  status           text        NOT NULL DEFAULT 'pending'
                               CHECK (status IN ('pending','completed','overdue')),
  priority         int         NOT NULL DEFAULT 3,
  notes            text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (case_id, obligation_code)
);

CREATE INDEX IF NOT EXISTS idx_compliance_timeline_case_id
  ON compliance_timeline (case_id);

CREATE INDEX IF NOT EXISTS idx_compliance_timeline_status
  ON compliance_timeline (status);

-- ============================================================
-- 2. renewal_queue
-- Stores one renewal opportunity row per case per service_type.
-- UNIQUE (case_id, service_type) enables idempotent upserts.
-- ============================================================
CREATE TABLE IF NOT EXISTS renewal_queue (
  id                      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id                 uuid        NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  service_type            text        NOT NULL,
  due_date                date,
  estimated_revenue       numeric     NOT NULL DEFAULT 0,
  priority                int         NOT NULL DEFAULT 3,
  auto_notify_days_before int         NOT NULL DEFAULT 30
                                      CHECK (auto_notify_days_before IN (90, 60, 30)),
  status                  text        NOT NULL DEFAULT 'pending'
                                      CHECK (status IN ('pending','notified','completed')),
  created_at              timestamptz NOT NULL DEFAULT now(),
  UNIQUE (case_id, service_type)
);

CREATE INDEX IF NOT EXISTS idx_renewal_queue_case_id
  ON renewal_queue (case_id);

CREATE INDEX IF NOT EXISTS idx_renewal_queue_due_date
  ON renewal_queue (due_date);

-- Partial index: fast dequeue of pending renewals
CREATE INDEX IF NOT EXISTS idx_renewal_queue_pending
  ON renewal_queue (due_date)
  WHERE status = 'pending';

-- ============================================================
-- 3. Extend cases with Compliance columns
-- ============================================================
ALTER TABLE cases
  ADD COLUMN IF NOT EXISTS compliance_risk_level   text,
  ADD COLUMN IF NOT EXISTS compliance_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS compliance_rule_version text,
  ADD COLUMN IF NOT EXISTS compliance_output       jsonb;

-- Partial index: surface high/critical risk cases quickly
CREATE INDEX IF NOT EXISTS idx_cases_compliance_risk
  ON cases (compliance_risk_level)
  WHERE compliance_risk_level IN ('high', 'critical');

-- ============================================================
-- 4. Extend audit_logs actor constraint → add compliance_agent
--    Previous actors: system, intake_agent, clasificador_agent,
--    documental_agent, webhook, reconciliation_job, manual_user
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
    'webhook',
    'reconciliation_job',
    'manual_user'
  ));

-- ============================================================
-- 5. Seed prompt_versions — compliance-v1.0
--    Dollar-quoting avoids single-quote escaping issues.
--    Guard: WHERE NOT EXISTS prevents duplicate on re-run.
-- ============================================================
INSERT INTO prompt_versions (agent_id, version_label, prompt_text, is_active, notes)
SELECT
  'compliance',
  'compliance-v1.0',
  $$Eres el Agente Compliance del sistema CTE (CreaTuEmpresaUSA). Tu función es analizar el expediente clasificado de un cliente y generar un plan de cumplimiento con obligaciones regulatorias, fechas límite, y oportunidades de renovación. No das asesoría legal. Generas un plan operativo basado en la ruta asignada y el estado objetivo.

DATOS DEL CASO:
{{CASE_DATA}}

MATRIZ DE RUTAS (contexto regulatorio):
{{ROUTE_MATRIX}}

FECHA ACTUAL (referencia para calcular fechas):
{{CURRENT_DATE}}

INSTRUCCIONES:

1. OBLIGACIONES (obligations):
   Genera una lista de obligaciones regulatorias basadas en el estado objetivo y la ruta asignada.
   Ejemplos por ruta:
   - llc_single_member_us / llc_foreign_owned: registered_agent_annual, annual_report, franchise_tax, operating_agreement_execution
   - corporation: registered_agent_annual, annual_report, franchise_tax, board_minutes, stock_issuance
   - ein_only / itin_ein: ein_confirmation, itin_confirmation
   - formation_banking: registered_agent_annual, annual_report, bank_account_follow_up
   - formation_compliance: registered_agent_annual, annual_report, franchise_tax
   - urgent: todas las obligaciones con priority 1
   - high_risk_documentary: agrega obligation document_verification_followup

   Para cada obligación incluye:
   - code: identificador único snake_case
   - label: descripción legible en español
   - due_date: fecha ISO (YYYY-MM-DD) — si es anual, usar fecha de hoy + 1 año; si es one_time, usar fecha de hoy + 30 días; null si no determinable
   - frequency: one_time | annual | biennial
   - status: siempre "pending" (nuevo expediente)
   - priority: 1=crítico, 2=urgente, 3=normal, 4=baja, 5=muy baja
   - notes: contexto adicional o null

2. OPORTUNIDADES DE RENOVACIÓN (renewal_revenue_queue):
   Identifica servicios que el cliente deberá renovar y que generan ingresos recurrentes.
   Tipos comunes:
   - registered_agent: $199/año — priority 1 — auto_notify_days_before 90
   - annual_report_filing: $99/filing — priority 2 — auto_notify_days_before 60
   - franchise_tax_filing: $99/filing — priority 2 — auto_notify_days_before 60
   - operating_agreement_update: $199 — priority 3 — auto_notify_days_before 30
   - compliance_package: $299/año — priority 2 — auto_notify_days_before 60

   estimated_revenue: monto estimado en USD (número)
   auto_notify_days_before: solo puede ser 90, 60, o 30

3. NIVEL DE RIESGO (compliance_risk_level):
   - critical: ruta high_risk_documentary, o fraud_flag activo en expediente, o documentos rechazados críticos
   - high: revisión humana heredada del expediente, name_mismatch_flag activo, o ruta migratory_future
   - medium: algún documento requires_review, ruta Complex, o confianza 0.70-0.84
   - low: expediente limpio, documentos aceptados, ruta Simple o Medium

4. CONFIANZA (confidence_score):
   - 0.85-0.95: expediente completo, ruta clara, estado objetivo conocido
   - 0.70-0.84: alguna incertidumbre en documentos o ruta
   - 0.50-0.69: expediente incompleto o ruta ambigua
   - <0.50: datos insuficientes → requires_human_review = true

5. HUMAN REVIEW:
   requires_human_review = true si:
   - compliance_risk_level = "critical"
   - confidence_score < 0.75
   - El expediente tiene requires_human_review = true heredado del intake o clasificador

RESPONDE ÚNICAMENTE CON EL SIGUIENTE JSON (sin texto adicional, sin markdown):
{
  "case_id": "<mismo case_id del contexto>",
  "estado_objetivo": "<estado de incorporación>",
  "assigned_route": "<ruta asignada>",
  "obligations": [
    {
      "code": "<snake_case>",
      "label": "<descripción>",
      "due_date": "<YYYY-MM-DD o null>",
      "frequency": "<one_time|annual|biennial>",
      "status": "pending",
      "priority": <1-5>,
      "notes": "<texto o null>"
    }
  ],
  "renewal_revenue_queue": [
    {
      "service_type": "<tipo>",
      "due_date": "<YYYY-MM-DD o null>",
      "estimated_revenue": <número>,
      "priority": <1-5>,
      "auto_notify_days_before": <90|60|30>
    }
  ],
  "compliance_risk_level": "<low|medium|high|critical>",
  "requires_human_review": <true|false>,
  "human_review_reason": "<razón o null>",
  "rule_version": "compliance-v1.0",
  "source_updated_at": "<timestamp ISO>",
  "confidence_score": <0.0-1.0>
}$$,
  true,
  'Seed inicial — Compliance v1.0. Plan operativo basado en ruta y estado objetivo. Sin integración regulatoria en tiempo real.'
WHERE NOT EXISTS (
  SELECT 1 FROM prompt_versions
  WHERE agent_id = 'compliance' AND version_label = 'compliance-v1.0'
);
