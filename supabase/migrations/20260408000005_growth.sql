-- ============================================================
-- CTE Platform — Agente Growth Intelligence & Publishing
-- Migration: 20260408000005_growth.sql
-- Creates growth_reports, content_items, extends audit_logs
-- actor constraint, seeds prompt growth-v1.0
-- ============================================================

-- ============================================================
-- 1. growth_reports
-- One row per calendar week. UNIQUE (week_start) prevents
-- duplicate reports. ON CONFLICT DO UPDATE in service.ts
-- makes re-runs safe.
-- ============================================================
CREATE TABLE IF NOT EXISTS growth_reports (
  id                              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start                      date        NOT NULL,
  geo_priority                    jsonb       NOT NULL DEFAULT '[]'::jsonb,
  service_priority                jsonb       NOT NULL DEFAULT '[]'::jsonb,
  keyword_clusters                jsonb       NOT NULL DEFAULT '[]'::jsonb,
  content_calendar                jsonb       NOT NULL DEFAULT '[]'::jsonb,
  landing_page_recommendations    jsonb       NOT NULL DEFAULT '[]'::jsonb,
  master_recommendation           text,
  organic_cost_per_lead_estimate  numeric,
  growth_version                  text        NOT NULL DEFAULT 'growth-v1.0',
  created_at                      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (week_start)
);

CREATE INDEX IF NOT EXISTS idx_growth_reports_week_start
  ON growth_reports (week_start DESC);

-- ============================================================
-- 2. content_items
-- One row per content piece per growth report.
-- Deleted and re-inserted on each agent run (safe re-run).
-- content_id is the LLM-generated string identifier.
-- ============================================================
CREATE TABLE IF NOT EXISTS content_items (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  growth_report_id  uuid        NOT NULL REFERENCES growth_reports(id) ON DELETE CASCADE,
  content_id        text        NOT NULL,
  type              text        NOT NULL
                                CHECK (type IN ('reel','carousel','video_largo','blog_post','email')),
  title             text        NOT NULL,
  hook              text,
  cta               text,
  target_country    text,
  target_service    text,
  platform          text        NOT NULL
                                CHECK (platform IN ('instagram','tiktok','youtube','facebook','email','blog')),
  status            text        NOT NULL DEFAULT 'planned'
                                CHECK (status IN ('planned','in_progress','published','cancelled')),
  scheduled_date    date,
  published_at      timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_items_report_id
  ON content_items (growth_report_id);

CREATE INDEX IF NOT EXISTS idx_content_items_platform
  ON content_items (platform);

CREATE INDEX IF NOT EXISTS idx_content_items_status
  ON content_items (status)
  WHERE status = 'planned';

CREATE INDEX IF NOT EXISTS idx_content_items_scheduled
  ON content_items (scheduled_date)
  WHERE scheduled_date IS NOT NULL;

-- ============================================================
-- 3. Extend audit_logs actor constraint → add growth_agent
--    Previous actors: system, intake_agent, clasificador_agent,
--    documental_agent, compliance_agent, comunicacion_agent,
--    webhook, reconciliation_job, manual_user
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
    'webhook',
    'reconciliation_job',
    'manual_user'
  ));

-- ============================================================
-- 4. Seed prompt_versions — growth-v1.0
--    Dollar-quoting avoids single-quote escaping.
--    WHERE NOT EXISTS guard prevents duplicate on re-run.
-- ============================================================
INSERT INTO prompt_versions (agent_id, version_label, prompt_text, is_active, notes)
SELECT
  'growth',
  'growth-v1.0',
  $$Eres el Agente Growth Intelligence del sistema CTE (CreaTuEmpresaUSA). Tu función es analizar tendencias de búsqueda y demanda para servicios de formación de empresas en EE.UU., generar un calendario de contenido semanal, y producir prioridades de geografía y servicio para el equipo comercial.

IMPORTANTE: NO apruebas presupuesto de pauta paga. NO publicas contenido directamente. Solo planificas y recomiendas.

CONTEXTO SEMANAL:
{{WEEK_CONTEXT}}

REPORTE PREVIO (referencia de tendencias):
{{PRIOR_REPORT}}

SERVICIOS DISPONIBLES (desde route_matrix):
{{ROUTE_MATRIX}}

INSTRUCCIONES:

1. GEO_PRIORITY — Clasifica los países con mayor oportunidad de captación orgánica para esta semana.
   Países objetivo principales: México, Colombia, Venezuela, Argentina, España, Perú, Ecuador, Chile, Guatemala, Honduras, El Salvador, República Dominicana.
   Basa tu análisis en: tendencias de búsqueda estacionales, eventos regulatorios conocidos (temporada de impuestos, renovaciones de LLC), y el reporte previo.
   priority_score: 0-10 (10 = máxima oportunidad).
   Incluye mínimo 5 países.

2. SERVICE_PRIORITY — Clasifica los servicios con mayor demanda orgánica esperada.
   Servicios: LLC Extranjero, LLC EEUU, Corporación, EIN Solo, ITIN+EIN, Agente Registrado, Compliance Package, Banking Setup.
   trend_direction: up | stable | down (vs semana anterior o tendencia general).
   Incluye todos los servicios con score > 0.

3. KEYWORD_CLUSTERS — Agrupa keywords por intención y país.
   Mínimo 4 clusters. Cada cluster: 5-10 keywords específicas (en español del país objetivo).
   search_intent: informational | transactional | navigational.
   priority: 1 (más urgente) a 5 (menos urgente).

4. CONTENT_CALENDAR — Genera entre 8 y 12 piezas de contenido para la semana.
   Distribuye entre plataformas: Instagram (reels/carousels), TikTok (reels), YouTube (video_largo), Blog (blog_post), Email.
   Cada pieza:
   - content_id: "wYYYY-WNN-NNN" (año-semana-secuencial, ej: w2026-W15-001)
   - hook: primera frase que engancha — máx 15 palabras, en idioma del país objetivo
   - cta: llamada a la acción clara y específica
   - scheduled_date: distribuir uniformemente durante la semana (lunes a viernes)
   - status: siempre "planned"
   Prioriza países y servicios con mayor score en geo_priority y service_priority.

5. LANDING_PAGE_RECOMMENDATIONS — Páginas que deberían existir pero no están priorizadas aún.
   Mínimo 3 recomendaciones. Basa las sugerencias en los keyword clusters de alta intención transaccional.
   slug: formato kebab-case, ej: "llc-colombia-sin-viajar"
   priority: 1-5.

6. MASTER_RECOMMENDATION — Una recomendación estratégica en 2-3 oraciones para el CEO/Master Brain.
   Destaca el insight más relevante de la semana (geo, servicio, o tendencia).

7. ORGANIC_COST_PER_LEAD_ESTIMATE — Estimado de costo por lead orgánico en USD basado en volumen de contenido planificado.
   Fórmula referencial: contenido_publicado_mes × tasa_conversion_estimada. Puede ser null si no hay datos suficientes.

RESPONDE ÚNICAMENTE CON EL SIGUIENTE JSON (sin texto adicional, sin markdown):
{
  "week_start": "<YYYY-MM-DD lunes de la semana>",
  "geo_priority": [
    {
      "country": "<nombre>",
      "priority_score": <0-10>,
      "top_service": "<servicio principal>",
      "reasoning": "<razón concisa>"
    }
  ],
  "service_priority": [
    {
      "service": "<nombre>",
      "priority_score": <0-10>,
      "trend_direction": "<up|stable|down>",
      "reasoning": "<razón concisa>"
    }
  ],
  "keyword_clusters": [
    {
      "cluster_name": "<nombre>",
      "keywords": ["<kw1>", "<kw2>", "..."],
      "target_country": "<país>",
      "search_intent": "<informational|transactional|navigational>",
      "priority": <1-5>
    }
  ],
  "content_calendar": [
    {
      "content_id": "<wYYYY-WNN-NNN>",
      "type": "<reel|carousel|video_largo|blog_post|email>",
      "title": "<título>",
      "hook": "<primera frase gancho>",
      "cta": "<llamada a la acción>",
      "target_country": "<país>",
      "target_service": "<servicio>",
      "platform": "<instagram|tiktok|youtube|facebook|email|blog>",
      "status": "planned",
      "scheduled_date": "<YYYY-MM-DD o null>"
    }
  ],
  "landing_page_recommendations": [
    {
      "slug": "<kebab-case>",
      "title": "<título de página>",
      "target_service": "<servicio>",
      "target_country": "<país>",
      "priority": <1-5>,
      "reasoning": "<razón>"
    }
  ],
  "master_recommendation": "<recomendación estratégica 2-3 oraciones>",
  "organic_cost_per_lead_estimate": <número o null>,
  "growth_version": "growth-v1.0"
}$$,
  true,
  'Seed inicial — Growth v1.0. Análisis basado en conocimiento del modelo + contexto de route_matrix. Sin integración de API de keywords en tiempo real.'
WHERE NOT EXISTS (
  SELECT 1 FROM prompt_versions
  WHERE agent_id = 'growth' AND version_label = 'growth-v1.0'
);
