-- ============================================================
-- CreaTuEmpresaUSA — Agent System Base Tables
-- Migration: 20260331000001_agent_system.sql
-- Sprint 1 · Tarea 1: Ecosistema agéntico — tablas base
-- ============================================================


-- ============================================================
-- FUNCIÓN COMPARTIDA: update_updated_at()
-- Actualiza automáticamente el campo updated_at en cada UPDATE
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- 1. agent_registry
-- Registro maestro de todos los agentes del sistema.
-- Cada agente tiene un agent_id único (ej: "intake", "revops").
-- ============================================================
CREATE TABLE IF NOT EXISTS agent_registry (
  id                  uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id            text         NOT NULL UNIQUE,
  version             text         NOT NULL,
  status              text         NOT NULL DEFAULT 'active'
                                   CHECK (status IN ('active', 'inactive', 'testing')),
  nucleo              text         NOT NULL
                                   CHECK (nucleo IN ('operativo', 'relacional', 'directivo')),
  human_review_level  text         NOT NULL
                                   CHECK (human_review_level IN ('H0', 'H1', 'H2', 'H3')),
  risk_level          text,
  config              jsonb        NOT NULL DEFAULT '{}'::jsonb,  -- allowed_reads, allowed_writes, guardrails
  created_at          timestamptz  NOT NULL DEFAULT now(),
  updated_at          timestamptz  NOT NULL DEFAULT now()
);

-- RLS: service_role puede todo, authenticated solo lectura
ALTER TABLE agent_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agent_registry: service_role full access"
  ON agent_registry
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "agent_registry: authenticated read only"
  ON agent_registry
  FOR SELECT
  TO authenticated
  USING (true);

-- Trigger: mantener updated_at sincronizado
CREATE TRIGGER trg_agent_registry_updated_at
  BEFORE UPDATE ON agent_registry
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- 2. prompt_registry
-- Almacena los prompts de cada agente con versionado.
-- NUNCA se expone al frontend — acceso exclusivo de service_role.
-- prompt_hash: sha256 del prompt_text para auditabilidad.
-- ============================================================
CREATE TABLE IF NOT EXISTS prompt_registry (
  id           uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id     text         NOT NULL REFERENCES agent_registry(agent_id) ON DELETE CASCADE,
  version      text         NOT NULL,
  prompt_text  text         NOT NULL,   -- contenido completo del prompt, nunca al frontend
  prompt_hash  text         NOT NULL,   -- sha256 para verificación de integridad
  is_active    boolean      NOT NULL DEFAULT false,
  created_at   timestamptz  NOT NULL DEFAULT now(),
  created_by   text
);

-- RLS: SOLO service_role — ningún rol de frontend puede leer esto
ALTER TABLE prompt_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prompt_registry: service_role only"
  ON prompt_registry
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Índices: optimiza búsqueda del prompt activo de un agente
CREATE INDEX IF NOT EXISTS idx_prompt_registry_agent_active
  ON prompt_registry (agent_id, is_active);


-- ============================================================
-- 3. agent_logs
-- Log inmutable de todas las acciones ejecutadas por agentes.
-- Usado para auditoría, revisión humana y trazabilidad.
-- ============================================================
CREATE TABLE IF NOT EXISTS agent_logs (
  id                  uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id            text         NOT NULL,
  case_id             uuid,                        -- nullable: no toda acción pertenece a un caso
  action              text         NOT NULL,
  input_summary       jsonb        NOT NULL DEFAULT '{}'::jsonb,
  output_summary      jsonb        NOT NULL DEFAULT '{}'::jsonb,
  human_review_level  text
                                   CHECK (human_review_level IN ('H0', 'H1', 'H2', 'H3')),
  status              text         NOT NULL DEFAULT 'pending_review'
                                   CHECK (status IN ('success', 'failed', 'escalated', 'pending_review')),
  created_at          timestamptz  NOT NULL DEFAULT now()
);

-- RLS: SOLO service_role
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agent_logs: service_role only"
  ON agent_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Índices: queries frecuentes por agente, caso y estado
CREATE INDEX IF NOT EXISTS idx_agent_logs_agent_id
  ON agent_logs (agent_id);

CREATE INDEX IF NOT EXISTS idx_agent_logs_case_id
  ON agent_logs (case_id);

CREATE INDEX IF NOT EXISTS idx_agent_logs_status
  ON agent_logs (status);


-- ============================================================
-- 4. agent_tasks
-- Cola de tareas asignadas a agentes.
-- priority: 1 = más urgente, 10 = menos urgente (default 5).
-- ============================================================
CREATE TABLE IF NOT EXISTS agent_tasks (
  id          uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id    text         NOT NULL,
  case_id     uuid,                      -- nullable: tareas globales o sin caso asociado
  task_type   text         NOT NULL,
  payload     jsonb        NOT NULL DEFAULT '{}'::jsonb,
  status      text         NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending', 'in_progress', 'done', 'cancelled')),
  priority    int          NOT NULL DEFAULT 5,
  created_at  timestamptz  NOT NULL DEFAULT now(),
  updated_at  timestamptz  NOT NULL DEFAULT now()
);

-- RLS: SOLO service_role
ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agent_tasks: service_role only"
  ON agent_tasks
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Índices: optimiza dequeue por agente, estado y prioridad
CREATE INDEX IF NOT EXISTS idx_agent_tasks_agent_id
  ON agent_tasks (agent_id);

CREATE INDEX IF NOT EXISTS idx_agent_tasks_status
  ON agent_tasks (status);

CREATE INDEX IF NOT EXISTS idx_agent_tasks_priority
  ON agent_tasks (priority);

-- Trigger: mantener updated_at sincronizado
CREATE TRIGGER trg_agent_tasks_updated_at
  BEFORE UPDATE ON agent_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
