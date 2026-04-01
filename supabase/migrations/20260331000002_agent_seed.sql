-- ============================================================
-- CreaTuEmpresaUSA — Agent Seed Data
-- Migration: 20260331000002_agent_seed.sql
-- Sprint 1 · Tarea 2: Registro de los 8 agentes del Blueprint V2
-- Idempotente: ON CONFLICT (agent_id) DO UPDATE
-- ============================================================

INSERT INTO agent_registry (agent_id, version, status, nucleo, human_review_level, risk_level, config)
VALUES

-- --------------------------------------------------------
-- 1. MASTER — Agente directivo, orquestador del ecosistema
-- --------------------------------------------------------
(
  'master',
  '2.0',
  'active',
  'directivo',
  'H2',
  'Bajo',
  '{
    "allowed_reads":  ["all_agent_outputs", "crm_pipeline", "spend_data", "compliance_alerts", "partner_pipeline"],
    "allowed_writes": ["priority_queue", "agent_tasks", "executive_report", "scale_pause_flags"],
    "forbidden":      ["client_messages", "legal_status_changes", "budget_approval_above_threshold"]
  }'::jsonb
),

-- --------------------------------------------------------
-- 2. INTAKE — Captura y apertura de casos entrantes
-- --------------------------------------------------------
(
  'intake',
  '2.0',
  'active',
  'operativo',
  'H1',
  'Bajo',
  '{
    "allowed_reads":  ["form_data", "stripe_events", "partner_registry"],
    "allowed_writes": ["cases", "contacts", "checklists", "tasks", "notifications_queue"],
    "forbidden":      ["compliance_rules", "pricing_changes", "time_promises"]
  }'::jsonb
),

-- --------------------------------------------------------
-- 3. CLASIFICADOR — Tipifica casos y asigna rutas de proceso
-- --------------------------------------------------------
(
  'clasificador',
  '2.0',
  'active',
  'operativo',
  'H2',
  'Medio',
  '{
    "allowed_reads":        ["cases", "checklists_templates", "route_matrix"],
    "allowed_writes":       ["cases", "checklists", "tasks"],
    "forbidden":            ["activate_filing", "close_checklist_solo", "compliance_rules_final"],
    "confidence_threshold": 0.85
  }'::jsonb
),

-- --------------------------------------------------------
-- 4. DOCUMENTAL — Revisión y gestión de documentos del expediente
-- --------------------------------------------------------
(
  'documental',
  '2.0',
  'active',
  'operativo',
  'H2',
  'Medio-Alto',
  '{
    "allowed_reads":        ["cases", "checklists", "documents_bucket_raw"],
    "allowed_writes":       ["documents_status", "checklists", "tasks", "notifications_queue"],
    "forbidden":            ["close_expediente", "mark_compliance_done", "edit_pricing", "free_form_messages"],
    "confidence_threshold": 0.80
  }'::jsonb
),

-- --------------------------------------------------------
-- 5. COMPLIANCE — Monitoreo de obligaciones legales y regulatorias
-- --------------------------------------------------------
(
  'compliance',
  '2.0',
  'active',
  'operativo',
  'H3',
  'Alto',
  '{
    "allowed_reads":  ["cases", "compliance_matrix", "company_registry", "services_contracted"],
    "allowed_writes": ["compliance_timeline", "renewal_queue", "tasks", "crm_opportunities"],
    "forbidden":      ["legal_advice_final", "confirm_doubtful_applicability", "edit_formation_docs"]
  }'::jsonb
),

-- --------------------------------------------------------
-- 6. COMUNICACION — Gestión de mensajería y notificaciones al cliente
-- --------------------------------------------------------
(
  'comunicacion',
  '2.0',
  'active',
  'relacional',
  'H2',
  'Medio',
  '{
    "allowed_reads":  ["cases", "contacts", "opt_out_registry", "approved_templates"],
    "allowed_writes": ["communication_log", "notifications_sent", "tts_queue"],
    "forbidden":      ["unapproved_templates", "sensitive_topics_without_approval", "legal_promises", "time_promises"]
  }'::jsonb
),

-- --------------------------------------------------------
-- 7. GROWTH — Contenido, calendario editorial y recomendaciones
-- --------------------------------------------------------
(
  'growth',
  '2.0',
  'active',
  'relacional',
  'H2',
  'Bajo-Medio',
  '{
    "allowed_reads":  ["analytics_data", "trends_api", "services_catalog", "approved_calendar"],
    "allowed_writes": ["content_calendar", "publishing_queue", "master_recommendations"],
    "forbidden":      ["scale_paid_campaigns", "approve_budget", "publish_without_calendar_approval"]
  }'::jsonb
),

-- --------------------------------------------------------
-- 8. REVOPS — Revenue operations, partners y métricas de negocio
-- --------------------------------------------------------
(
  'revops',
  '2.0',
  'active',
  'relacional',
  'H2',
  'Alto',
  '{
    "allowed_reads":  ["spend_data", "revenue_data", "pipeline", "partner_registry", "capacity_flags", "sla_data"],
    "allowed_writes": ["scale_pause_flags", "partner_pipeline", "commission_records", "budget_alerts", "crm_pipeline"],
    "forbidden":      ["scale_if_ops_saturated", "continue_campaign_above_cac_threshold", "advance_partner_without_owner", "deal_without_attribution"]
  }'::jsonb
)

ON CONFLICT (agent_id) DO UPDATE SET
  version            = EXCLUDED.version,
  status             = EXCLUDED.status,
  nucleo             = EXCLUDED.nucleo,
  human_review_level = EXCLUDED.human_review_level,
  risk_level         = EXCLUDED.risk_level,
  config             = EXCLUDED.config,
  updated_at         = now();
