-- ============================================================
-- CTE Platform — Intake Agent Hardening
-- Migration: 20260403000001_intake_hardening.sql
-- Points 1-4: agent_runs, cases, contacts, idempotency constraints
-- ============================================================

-- ============================================================
-- 1. cases
-- Formal case record for the agent system.
-- case_id = external UUID reference used by agents / n8n.
-- company_id links back to the CRM company record.
-- ============================================================
CREATE TABLE IF NOT EXISTS cases (
  id           uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id      uuid         NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  company_id   uuid,
  agent_id     text         NOT NULL DEFAULT 'intake',
  status       text         NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending','in_progress','completed','failed','cancelled')),
  raw_response text,
  created_at   timestamptz  NOT NULL DEFAULT now(),
  updated_at   timestamptz  NOT NULL DEFAULT now()
);

ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cases: service_role only"
  ON cases FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_cases_company_id ON cases (company_id);
CREATE INDEX IF NOT EXISTS idx_cases_status     ON cases (status);

CREATE TRIGGER trg_cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- 2. contacts
-- Denormalized contact record written by the intake agent
-- at case creation time. One record per checkout session.
-- stripe_session_id UNIQUE prevents duplicate contact records.
-- ============================================================
CREATE TABLE IF NOT EXISTS contacts (
  id                 uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id         uuid,
  client_id          uuid,
  full_name          text,
  email              text,
  phone              text,
  country            text,
  stripe_customer_id text,
  stripe_session_id  text         UNIQUE,
  created_at         timestamptz  NOT NULL DEFAULT now(),
  updated_at         timestamptz  NOT NULL DEFAULT now()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contacts: service_role only"
  ON contacts FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON contacts (company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email      ON contacts (email);

CREATE TRIGGER trg_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- 3. agent_runs
-- Full execution log for every agent run.
-- UNIQUE (agent_id, source_ref_id) is the idempotency gate:
--   - Prevents duplicate processing of the same Stripe event.
--   - Atomic under concurrent webhook retries via Postgres constraint.
-- source_ref_id = checkout_session_id (primary) or stripe_event_id.
-- Reconciliation query: WHERE status IN ('failed','pending')
--   AND started_at < now() - interval '10 minutes'
-- ============================================================
CREATE TABLE IF NOT EXISTS agent_runs (
  id                         uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id                   text         NOT NULL,
  version                    text,
  status                     text         NOT NULL DEFAULT 'pending'
                                          CHECK (status IN ('pending','running','completed','failed','skipped')),
  trigger_type               text         NOT NULL
                                          CHECK (trigger_type IN ('webhook','cron','manual')),
  source_ref_id              text,
  input_raw_json             jsonb,
  input_normalized_json      jsonb,
  llm_raw_output_json        jsonb,
  llm_normalized_output_json jsonb,
  started_at                 timestamptz  NOT NULL DEFAULT now(),
  completed_at               timestamptz,
  error_message              text,
  retry_count                int          NOT NULL DEFAULT 0,
  CONSTRAINT uq_agent_runs_agent_source UNIQUE (agent_id, source_ref_id)
);

ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agent_runs: service_role only"
  ON agent_runs FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_agent_runs_agent_id   ON agent_runs (agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_status     ON agent_runs (status);
CREATE INDEX IF NOT EXISTS idx_agent_runs_source_ref ON agent_runs (source_ref_id);


-- ============================================================
-- 4. Idempotency constraint on companies.stripe_session_id
-- Prevents duplicate company records from webhook retries.
-- Partial index: NULL values excluded so existing clients
-- (who update stripe_session_id) are not affected.
-- ============================================================
CREATE UNIQUE INDEX IF NOT EXISTS uq_companies_stripe_session_id
  ON companies (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;
