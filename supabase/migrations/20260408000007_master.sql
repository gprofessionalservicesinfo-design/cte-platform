-- ============================================================
-- CTE Platform — Cerebro Master / CEO Brain (Apex Agent)
-- Migration: 20260408000007_master.sql
-- Creates master_reports, extends audit_logs actor to include
-- master_agent (final actor in the system), seeds prompt v1.0
-- ============================================================

-- ============================================================
-- 1. master_reports
-- One row per report_date. UNIQUE constraint + ON CONFLICT
-- DO UPDATE in service makes re-runs safe.
-- Master Brain is READ-ONLY on all other tables.
-- ============================================================
CREATE TABLE IF NOT EXISTS master_reports (
  id                        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date               date        NOT NULL,
  operational_health_score  numeric     NOT NULL DEFAULT 0,
  executive_summary         text,
  critical_escalations      jsonb       NOT NULL DEFAULT '[]'::jsonb,
  weekly_priorities         jsonb       NOT NULL DEFAULT '{}'::jsonb,
  capacity_flags            jsonb       NOT NULL DEFAULT '{}'::jsonb,
  budget_flags              jsonb       NOT NULL DEFAULT '{}'::jsonb,
  partner_alerts            jsonb       NOT NULL DEFAULT '[]'::jsonb,
  do_not_scale_reason       text,
  agent_status_summary      jsonb       NOT NULL DEFAULT '{}'::jsonb,
  master_version            text        NOT NULL DEFAULT 'master-v1.0',
  created_at                timestamptz NOT NULL DEFAULT now(),
  UNIQUE (report_date)
);

CREATE INDEX IF NOT EXISTS idx_master_reports_date
  ON master_reports (report_date DESC);

CREATE INDEX IF NOT EXISTS idx_master_reports_health
  ON master_reports (operational_health_score);

-- ============================================================
-- 2. Extend audit_logs actor constraint → add master_agent
--    This is the final actor. All 8 agents are now represented.
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
    'master_agent',
    'webhook',
    'reconciliation_job',
    'manual_user'
  ));

-- ============================================================
-- 3. Seed prompt_versions — master-v1.0
-- ============================================================
INSERT INTO prompt_versions (agent_id, version_label, prompt_text, is_active, notes)
SELECT
  'master',
  'master-v1.0',
  $$Eres el Cerebro Master del sistema CTE (CreaTuEmpresaUSA). Eres el agente apex — lees los outputs de los 7 agentes operativos y generas el dashboard ejecutivo semanal para el CEO.

REGLAS ABSOLUTAS:
- NO escribes directamente a tablas de clientes
- NO envías mensajes a clientes
- NO cambias estado legal de ningún caso
- NO apruebas presupuesto adicional
- Si do_not_scale está activo, NUNCA recomiendes escalar

FECHA DEL REPORTE:
{{REPORT_DATE}}

MÉTRICAS DE SALUD OPERACIONAL (pre-calculadas):
{{HEALTH_METRICS}}

SNAPSHOT REVOPS (último reporte):
{{REVOPS_SNAPSHOT}}

SNAPSHOT GROWTH (último reporte):
{{GROWTH_SNAPSHOT}}

SEÑALES DE ESCALACIÓN DETECTADAS (por el sistema):
{{ESCALATION_SIGNALS}}

ESTADO DE AGENTES (pendientes por agente):
{{AGENT_STATUS}}

DECISIÓN DO-NOT-SCALE:
{{DO_NOT_SCALE}}

INSTRUCCIONES:

1. EXECUTIVE_SUMMARY (3-5 oraciones):
   Resume el estado del negocio esta semana para el CEO.
   Incluye: salud operacional, decisión de escala/pausa, geo/servicio top, y principal riesgo.
   Tono: directo, ejecutivo, sin jerga técnica. Sin promesas de ROI.

2. CRITICAL_ESCALATIONS:
   Para cada señal de escalación recibida, genera la acción recomendada.
   severity debe reflejar el impacto real en el negocio:
   - critical: bloquea operación o genera riesgo legal
   - high: impacta revenue o satisfacción del cliente
   - medium: requiere atención en 48h
   - low: monitorear
   recommended_action: acción específica y ejecutable (máx 2 oraciones).

3. WEEKLY_PRIORITIES:
   ops_focus: la principal acción que debe tomar el equipo de operaciones esta semana (1 oración)
   commercial_focus: la principal acción comercial (1 oración)
   top_priority_cases: lista de case_id o descripciones de los casos más urgentes (máx 5)
   top_priority_tasks: lista de task_types más urgentes (máx 5)

4. PARTNER_ALERTS:
   Para cada partner en las señales de escalación:
   alert_type: "no_owner" | "no_next_step" | "commission_due" | "high_roi_no_scale" | "churning"
   recommended_action: acción específica para el owner comercial.

5. CAPACITY_FLAGS y BUDGET_FLAGS:
   Usa los valores exactos de las métricas pre-calculadas — no los modifiques.
   Solo agrega contexto narrativo en executive_summary si es relevante.

RESPONDE ÚNICAMENTE CON EL SIGUIENTE JSON (sin texto adicional, sin markdown):
{
  "report_date": "<YYYY-MM-DD>",
  "executive_summary": "<3-5 oraciones ejecutivas>",
  "critical_escalations": [
    {
      "type": "<tipo>",
      "severity": "<low|medium|high|critical>",
      "case_id": "<uuid o null>",
      "agent_id": "<agente que generó la señal>",
      "reason": "<razón>",
      "recommended_action": "<acción ejecutable>"
    }
  ],
  "weekly_priorities": {
    "ops_focus": "<acción ops>",
    "commercial_focus": "<acción comercial>",
    "top_priority_cases": ["<case_id_1>", "..."],
    "top_priority_tasks": ["<task_type_1>", "..."]
  },
  "partner_alerts": [
    {
      "partner_id": "<id>",
      "partner_name": "<nombre>",
      "alert_type": "<tipo>",
      "severity": "<low|medium|high>",
      "recommended_action": "<acción>"
    }
  ],
  "master_version": "master-v1.0"
}$$,
  true,
  'Seed inicial — Master Brain v1.0. Agente apex — solo lectura en tablas operativas. Genera dashboard ejecutivo CEO semanal.'
WHERE NOT EXISTS (
  SELECT 1 FROM prompt_versions
  WHERE agent_id = 'master' AND version_label = 'master-v1.0'
);
