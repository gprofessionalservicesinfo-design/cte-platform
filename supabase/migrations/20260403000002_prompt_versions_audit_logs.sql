-- ============================================================
-- CTE Platform — Prompt Versions + Audit Logs
-- Migration: 20260403000002_prompt_versions_audit_logs.sql
-- Points 5 + 9: prompt versioning + audit trail
-- ============================================================

CREATE TABLE IF NOT EXISTS prompt_versions (
  id            uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id      text         NOT NULL,
  version_label text         NOT NULL,
  prompt_text   text         NOT NULL,
  is_active     boolean      NOT NULL DEFAULT false,
  notes         text,
  created_at    timestamptz  NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_prompt_versions_active_agent
  ON prompt_versions (agent_id)
  WHERE is_active = true;

ALTER TABLE prompt_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prompt_versions: service_role only"
  ON prompt_versions FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_prompt_versions_agent_id ON prompt_versions (agent_id);

INSERT INTO prompt_versions (agent_id, version_label, prompt_text, is_active, notes)
VALUES (
  'intake', 'intake-v1.0',
  'Prompt inicial del Agente Intake v1.0. Ver migration_A_prompt_audit.sql para el texto completo.',
  true,
  'Seed — actualizar antes de producción.'
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id          uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text         NOT NULL,
  entity_id   text,
  action      text         NOT NULL,
  actor       text         NOT NULL
              CHECK (actor IN ('system','intake_agent','webhook','reconciliation_job','manual_user')),
  metadata    jsonb        NOT NULL DEFAULT '{}'::jsonb,
  created_at  timestamptz  NOT NULL DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_logs: service_role only"
  ON audit_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity     ON audit_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action     ON audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs (created_at DESC);
