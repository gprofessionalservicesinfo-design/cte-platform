-- ============================================================
-- CTE Platform — Agente Documental
-- Migration: 20260408000002_documental.sql
-- Extends public.documents (QA columns), extends cases,
-- extends audit_logs actor constraint, seeds prompt v1.0
-- ============================================================

-- ============================================================
-- 1. Extend public.documents with agent QA columns
--
--  IMPORTANT: The existing table has two protected columns:
--    status  text CHECK (status IN ('draft','final','uploaded'))  — migration 002
--    type    text CHECK (...)                                     — schema.sql
--
--  We DO NOT touch those columns. Instead we add:
--    qa_status  — documental agent QA result (separate lifecycle)
--    doc_type   — agent classification (separate from CRM type)
--    case_id    — links document to agent cases system
--    storage_path — agent-system alias populated from file_url
-- ============================================================
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS case_id               uuid        REFERENCES cases(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS client_id             uuid,
  ADD COLUMN IF NOT EXISTS doc_type              text,
  ADD COLUMN IF NOT EXISTS storage_path          text,
  ADD COLUMN IF NOT EXISTS legibility_score      float8,
  ADD COLUMN IF NOT EXISTS qa_status             text        NOT NULL DEFAULT 'pending'
                            CHECK (qa_status IN ('pending','accepted','rejected','requires_review')),
  ADD COLUMN IF NOT EXISTS rejection_reason      text,
  ADD COLUMN IF NOT EXISTS fraud_flag            boolean     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS duplicate_flag        boolean     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS name_mismatch_flag    boolean     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS expiration_flag       boolean     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS manual_review_reason  text,
  ADD COLUMN IF NOT EXISTS confidence_score      float8,
  ADD COLUMN IF NOT EXISTS requires_human_review boolean     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS doc_version           text,
  ADD COLUMN IF NOT EXISTS reviewed_at           timestamptz,
  ADD COLUMN IF NOT EXISTS reviewed_by           text;

CREATE INDEX IF NOT EXISTS idx_documents_case_id   ON public.documents (case_id);
CREATE INDEX IF NOT EXISTS idx_documents_qa_status ON public.documents (qa_status);
CREATE INDEX IF NOT EXISTS idx_documents_doc_type  ON public.documents (doc_type);

-- Partial index: fast dequeue of documents pending QA
CREATE INDEX IF NOT EXISTS idx_documents_qa_pending
  ON public.documents (case_id)
  WHERE qa_status = 'pending';

-- ============================================================
-- 2. Extend cases with document QA tracking columns
-- ============================================================
ALTER TABLE cases
  ADD COLUMN IF NOT EXISTS documents_qa_pending       boolean     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS documents_qa_completed_at  timestamptz,
  ADD COLUMN IF NOT EXISTS documents_first_pass_rate  float8;

CREATE INDEX IF NOT EXISTS idx_cases_docs_qa_pending
  ON cases (documents_qa_pending)
  WHERE documents_qa_pending = true;

-- ============================================================
-- 3. Extend audit_logs actor constraint → add documental_agent
--    Previous actors: system, intake_agent, clasificador_agent,
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
    'webhook',
    'reconciliation_job',
    'manual_user'
  ));

-- ============================================================
-- 4. Seed prompt_versions — documental-v1.0
--    Dollar-quoting avoids single-quote escaping issues.
--    Guard: WHERE NOT EXISTS prevents duplicate on re-run.
-- ============================================================
INSERT INTO prompt_versions (agent_id, version_label, prompt_text, is_active, notes)
SELECT
  'documental',
  'documental-v1.0',
  $$Eres el Agente Documental del sistema CTE (CreaTuEmpresaUSA). Tu función es analizar los metadatos de un documento cargado por un cliente y emitir un veredicto de calidad y validez para el expediente.

IMPORTANTE: En esta versión NO tienes acceso al contenido visual del documento (sin OCR). Debes basar tu análisis ÚNICAMENTE en los metadatos del archivo y el contexto del caso. Sé conservador — es preferible escalar a revisión humana que aprobar un documento inválido.

METADATOS DEL DOCUMENTO:
{{DOCUMENT_METADATA}}

CONTEXTO DEL CASO:
{{CASE_CONTEXT}}

INSTRUCCIONES DE ANÁLISIS:

1. CLASIFICACIÓN (doc_type): Infiere el tipo de documento desde file_name, mime_type y doc_type_hint.
   Tipos válidos (usa exactamente estos valores):
   - passport: Pasaporte internacional
   - national_id: Documento de identidad nacional / Driver's License / Cédula
   - proof_of_address: Comprobante de domicilio (factura, estado de cuenta)
   - ss4_ein: Formulario SS-4 o carta de confirmación de EIN del IRS
   - itin_doc: Documento de ITIN (W-7, carta de asignación ITIN)
   - formation_doc: Documento de formación (Articles of Organization/Incorporation)
   - operating_agreement: Acuerdo de Operaciones de LLC
   - ownership_doc: Documento de propiedad o shareholding / certificado de acciones
   - other: Otro tipo (describe en manual_review_reason)

2. LEGIBILIDAD (legibility_score 1-10): Estima basándote en señales de metadatos:
   Imágenes (image/jpeg, image/png, image/heic):
   - < 30 KB  → score 1-3  (casi seguramente baja resolución o corrupto)
   - 30-100 KB → score 4-6  (calidad incierta)
   - > 100 KB  → score 6-8  (probablemente aceptable)
   PDFs (application/pdf):
   - < 20 KB  → score 1-3  (casi vacío o solo texto sin imagen)
   - 20-100 KB → score 4-6  (contenido básico)
   - > 100 KB  → score 6-9  (documento completo)
   Penalizaciones:
   - Nombre genérico (document.pdf, scan001.jpg, IMG_123.jpg) → resta 2 puntos
   - MIME type inapropiado para el doc_type → resta 3 puntos
   - Formato editable (application/msword, text/plain) para ID o pasaporte → score máximo 3

3. NAME MISMATCH (name_mismatch_flag):
   - Extrae el posible nombre del archivo si contiene palabras que parecen nombre de persona
   - Compara con client_name del contexto del caso
   - Si hay un nombre claro en el archivo que NO coincide → name_mismatch_flag = true
   - Si el nombre es genérico o no hay nombre detectable → name_mismatch_flag = false (incertidumbre)

4. EXPIRATION (expiration_flag):
   - Para passport y national_id: sin OCR no puedes confirmar vigencia → expiration_flag = true SIEMPRE
   - Para otros documentos fiscales o legales: false (a menos que el año en el nombre indique antigüedad > 5 años)

5. FRAUD y DUPLICATE (fraud_flag, duplicate_flag):
   - fraud_flag = true: solo si hay señales muy claras (tamaño 0 bytes, extensión ejecutable como .exe/.bat)
   - duplicate_flag = true: si el file_name es idéntico o casi idéntico al de otro documento esperado del mismo caso

6. STATUS:
   - "rejected": si legibility_score < 6 O fraud_flag = true con alta certeza
   - "accepted": si legibility_score >= 6 Y confidence_score >= 0.80 Y sin flags críticos
   - "requires_review": en todos los demás casos (incertidumbre, flags, confidence < 0.80)

7. CONFIDENCE y HUMAN REVIEW:
   - Sin OCR, la confianza máxima honesta es 0.75
   - Solo metadatos básicos disponibles → confidence 0.40-0.60
   - Metadatos consistentes + nombre inferible → confidence 0.60-0.75
   - Señales de problema detectadas → confidence < 0.50
   - requires_human_review = true si: fraud_flag=true, name_mismatch_flag=true, confidence < 0.80, o legibility_score < 6

RESPONDE ÚNICAMENTE CON EL SIGUIENTE JSON (sin texto adicional, sin markdown):
{
  "case_id": "<mismo case_id del contexto>",
  "document_id": "<mismo document_id del contexto>",
  "doc_type": "<tipo clasificado del enum>",
  "legibility_score": <entero 1-10>,
  "status": "<accepted|rejected|requires_review>",
  "rejection_reason": "<razón específica o null>",
  "fraud_flag": <true|false>,
  "duplicate_flag": <true|false>,
  "name_mismatch_flag": <true|false>,
  "expiration_flag": <true|false>,
  "manual_review_reason": "<razón para revisión humana o null>",
  "confidence_score": <0.0-1.0>,
  "requires_human_review": <true|false>,
  "doc_version": "documental-v1.0"
}$$,
  true,
  'Seed inicial — Documental v1.0 (sin OCR). Evaluación basada en metadatos únicamente. Actualizar al integrar OCR/Vision.'
WHERE NOT EXISTS (
  SELECT 1 FROM prompt_versions
  WHERE agent_id = 'documental' AND version_label = 'documental-v1.0'
);
