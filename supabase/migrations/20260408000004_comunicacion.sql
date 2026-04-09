-- ============================================================
-- CTE Platform — Agente Comunicación Omnicanal
-- Migration: 20260408000004_comunicacion.sql
-- Creates communication_log, client_preferences, extends cases,
-- extends audit_logs actor constraint, seeds base prompt + 5 templates
-- ============================================================

-- ============================================================
-- 1. communication_log
-- One row per message sent (or skipped) by the agent.
-- task_id nullable: safety valve in case task is soft-deleted.
-- ============================================================
CREATE TABLE IF NOT EXISTS communication_log (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id             uuid        REFERENCES cases(id) ON DELETE SET NULL,
  task_id             uuid,       -- intentionally no FK — tasks may be archived
  channel             text        NOT NULL
                                  CHECK (channel IN ('whatsapp','email','both','skipped')),
  template_used       text,
  message_sent        text,
  language            text        NOT NULL DEFAULT 'es'
                                  CHECK (language IN ('es','en')),
  delivery_status     text        NOT NULL DEFAULT 'pending'
                                  CHECK (delivery_status IN ('sent','failed','skipped')),
  skip_reason         text,
  opt_out_checked     boolean     NOT NULL DEFAULT false,
  quiet_hours_checked boolean     NOT NULL DEFAULT false,
  sent_at             timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comm_log_case_id        ON communication_log (case_id);
CREATE INDEX IF NOT EXISTS idx_comm_log_task_id        ON communication_log (task_id);
CREATE INDEX IF NOT EXISTS idx_comm_log_delivery_status ON communication_log (delivery_status);

-- ============================================================
-- 2. client_preferences
-- Opt-out and quiet-hours settings per case.
-- One row per case — upsert-safe via UNIQUE (case_id).
-- quiet_hours stored as UTC time (v1 — timezone support in v2).
-- ============================================================
CREATE TABLE IF NOT EXISTS client_preferences (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id             uuid        NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  opt_out_whatsapp    boolean     NOT NULL DEFAULT false,
  opt_out_email       boolean     NOT NULL DEFAULT false,
  preferred_language  text        NOT NULL DEFAULT 'es'
                                  CHECK (preferred_language IN ('es','en')),
  quiet_hours_start   time,       -- UTC, e.g. '22:00'
  quiet_hours_end     time,       -- UTC, e.g. '08:00'
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (case_id)
);

CREATE INDEX IF NOT EXISTS idx_client_prefs_case_id ON client_preferences (case_id);

CREATE TRIGGER trg_client_prefs_updated_at
  BEFORE UPDATE ON client_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 3. Extend cases with communication tracking columns
-- ============================================================
ALTER TABLE cases
  ADD COLUMN IF NOT EXISTS last_communication_at  timestamptz,
  ADD COLUMN IF NOT EXISTS communication_channel  text;

-- ============================================================
-- 4. Extend audit_logs actor constraint → add comunicacion_agent
--    Previous actors: system, intake_agent, clasificador_agent,
--    documental_agent, compliance_agent, webhook,
--    reconciliation_job, manual_user
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
    'webhook',
    'reconciliation_job',
    'manual_user'
  ));

-- ============================================================
-- 5. Seed prompt_versions — comunicacion-v1.0 (active base prompt)
--    The LLM uses this as its generation instruction.
--    Individual message templates are seeded below (is_active=false).
-- ============================================================
INSERT INTO prompt_versions (agent_id, version_label, prompt_text, is_active, notes)
SELECT
  'comunicacion',
  'comunicacion-v1.0',
  $$Eres el Agente de Comunicación del sistema CTE (CreaTuEmpresaUSA). Tu función es generar mensajes personalizados y cálidos para clientes, basándote en el contexto del caso y la plantilla indicada.

CONTEXTO DEL CASO:
{{CASE_CONTEXT}}

TIPO DE TAREA:
{{TASK_TYPE}}

PLANTILLA DE REFERENCIA:
{{TEMPLATE_HINT}}

INSTRUCCIONES:

1. IDIOMA: Usa siempre el idioma indicado en preferred_language del contexto (es=español, en=inglés). Si no está definido, usa español.

2. TONO: Cálido, profesional, directo. No uses jerga legal ni prometas plazos específicos. No des asesoría legal.

3. PERSONALIZACIÓN: Incluye el nombre del cliente. Si conoces la ruta asignada o el estado objetivo, menciónalos de forma natural.

4. LONGITUD:
   - WhatsApp: máximo 300 palabras. Sin formato markdown. Usa saltos de línea naturales.
   - Email (body_text): máximo 400 palabras. Sin HTML — solo texto plano estructurado con saltos de línea.

5. RESTRICCIONES:
   - Nunca menciones montos específicos de honorarios o plazos exactos de procesos gubernamentales.
   - Nunca prometas resultados garantizados.
   - Siempre incluye cómo contactarnos: WhatsApp o soporte@creatuempresausa.com.
   - Para document_rejected: explica la razón del rechazo de forma empática, no acusatoria.

6. SUBJECT (solo para email): genera un asunto corto (máx 60 caracteres) relevante al task_type.

RESPONDE ÚNICAMENTE CON EL SIGUIENTE JSON (sin texto adicional, sin markdown):
{
  "message": "<texto del mensaje — listo para enviar>",
  "subject": "<asunto del email o null si es solo WhatsApp>",
  "language": "<es|en>",
  "confidence_score": <0.0-1.0>
}$$,
  true,
  'Seed inicial — Comunicación v1.0. Generación de mensajes personalizados multicanal. Actualizar al agregar nuevos tipos de tarea.'
WHERE NOT EXISTS (
  SELECT 1 FROM prompt_versions
  WHERE agent_id = 'comunicacion' AND version_label = 'comunicacion-v1.0'
);

-- ============================================================
-- 6. Seed message templates (is_active=false — fetched by version_label)
--    These are content references injected as TEMPLATE_HINT.
--    Update templates without touching service code.
-- ============================================================

-- welcome_es
INSERT INTO prompt_versions (agent_id, version_label, prompt_text, is_active, notes)
SELECT
  'comunicacion',
  'welcome_es',
  $$Bienvenida al sistema CTE — plantilla en español.

Elementos requeridos:
- Saludo cálido con nombre del cliente
- Confirmación de que recibimos su caso
- Qué esperar: revisión de documentos, clasificación de ruta, plan de cumplimiento
- Portal de cliente: https://creatuempresausa.com/login
- Canal de contacto: WhatsApp o soporte@creatuempresausa.com
- Tono: emocionante, motivador, tranquilizador

NO mencionar plazos exactos. NO mencionar costos adicionales.$$,
  false,
  'Plantilla bienvenida español — inyectada como TEMPLATE_HINT en el prompt base'
WHERE NOT EXISTS (
  SELECT 1 FROM prompt_versions WHERE agent_id = 'comunicacion' AND version_label = 'welcome_es'
);

-- welcome_en
INSERT INTO prompt_versions (agent_id, version_label, prompt_text, is_active, notes)
SELECT
  'comunicacion',
  'welcome_en',
  $$Welcome to CTE system — English template.

Required elements:
- Warm greeting with client name
- Confirmation that we received their case
- What to expect: document review, route classification, compliance plan
- Client portal: https://creatuempresausa.com/login
- Contact channel: WhatsApp or soporte@creatuempresausa.com
- Tone: exciting, motivating, reassuring

Do NOT mention exact timelines. Do NOT mention additional costs.$$,
  false,
  'Welcome template English — injected as TEMPLATE_HINT in base prompt'
WHERE NOT EXISTS (
  SELECT 1 FROM prompt_versions WHERE agent_id = 'comunicacion' AND version_label = 'welcome_en'
);

-- missing_data_es
INSERT INTO prompt_versions (agent_id, version_label, prompt_text, is_active, notes)
SELECT
  'comunicacion',
  'missing_data_es',
  $$Solicitud de documentos faltantes — plantilla en español.

Elementos requeridos:
- Saludo con nombre del cliente
- Explicar que necesitamos documentos adicionales para continuar
- Listar los documentos faltantes del contexto (missing_documents)
- Instrucciones claras de cómo enviarlos (portal o WhatsApp)
- Expresar urgencia suave — sin presionar agresivamente
- Ofrecer ayuda si tiene dudas sobre qué documento aplica

Portal de subida: https://creatuempresausa.com/login
Contacto: WhatsApp o soporte@creatuempresausa.com$$,
  false,
  'Plantilla solicitud documentos faltantes español'
WHERE NOT EXISTS (
  SELECT 1 FROM prompt_versions WHERE agent_id = 'comunicacion' AND version_label = 'missing_data_es'
);

-- document_rejected_es
INSERT INTO prompt_versions (agent_id, version_label, prompt_text, is_active, notes)
SELECT
  'comunicacion',
  'document_rejected_es',
  $$Notificación de documento rechazado — plantilla en español.

Elementos requeridos:
- Saludo con nombre del cliente
- Informar empáticamente que el documento fue rechazado
- Incluir la razón de rechazo del contexto (rejection_reason) — de forma clara y sin tecnicismos
- Instrucciones sobre cómo reenviar el documento correcto
- Ofrecer ayuda si tiene dudas
- Tono: empático, no acusatorio, orientado a solución

Portal de subida: https://creatuempresausa.com/login
Contacto: WhatsApp o soporte@creatuempresausa.com$$,
  false,
  'Plantilla documento rechazado español'
WHERE NOT EXISTS (
  SELECT 1 FROM prompt_versions WHERE agent_id = 'comunicacion' AND version_label = 'document_rejected_es'
);

-- next_steps_es
INSERT INTO prompt_versions (agent_id, version_label, prompt_text, is_active, notes)
SELECT
  'comunicacion',
  'next_steps_es',
  $$Actualización de próximos pasos — plantilla en español.

Elementos requeridos:
- Saludo con nombre del cliente
- Informar que el análisis de su caso está avanzando
- Mencionar la ruta asignada de forma simple (sin jerga técnica)
- Explicar qué sigue: cumplimiento, filing, EIN, etc. según la ruta
- Portal para seguimiento: https://creatuempresausa.com/login
- Tono: positivo, de avance, profesional

NO mencionar plazos exactos. NO mencionar montos.
Contacto: WhatsApp o soporte@creatuempresausa.com$$,
  false,
  'Plantilla próximos pasos español — usada por compliance_review_pending y route_classification_completed'
WHERE NOT EXISTS (
  SELECT 1 FROM prompt_versions WHERE agent_id = 'comunicacion' AND version_label = 'next_steps_es'
);
