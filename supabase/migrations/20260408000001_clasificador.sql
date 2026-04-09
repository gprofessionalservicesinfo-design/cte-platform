-- ============================================================
-- CTE Platform — Clasificador de Ruta
-- Migration: 20260408000001_clasificador.sql
-- Extends cases, adds route_matrix, seeds prompt + actor check
-- ============================================================

-- ============================================================
-- 1. Extend cases with Clasificador columns
-- ============================================================
ALTER TABLE cases
  ADD COLUMN IF NOT EXISTS assigned_route               text,
  ADD COLUMN IF NOT EXISTS complexity                   text
                            CHECK (complexity IN ('Simple', 'Medium', 'Complex')),
  ADD COLUMN IF NOT EXISTS route_confidence_score       float8,
  ADD COLUMN IF NOT EXISTS estimated_days               int,
  ADD COLUMN IF NOT EXISTS route_classified_at          timestamptz,
  ADD COLUMN IF NOT EXISTS route_version                text,
  ADD COLUMN IF NOT EXISTS route_classification_pending boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS clasificador_output          jsonb;

CREATE INDEX IF NOT EXISTS idx_cases_route_pending
  ON cases (route_classification_pending)
  WHERE route_classification_pending = true;

CREATE INDEX IF NOT EXISTS idx_cases_assigned_route
  ON cases (assigned_route);

-- ============================================================
-- 2. Extend audit_logs actor constraint → add clasificador_agent
--    Postgres cannot ALTER inline CHECK — must DROP + ADD.
--    IF EXISTS is safe: if Postgres named it differently the
--    column will still accept the new constraint cleanly.
-- ============================================================
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_actor_check;
ALTER TABLE audit_logs
  ADD CONSTRAINT audit_logs_actor_check
  CHECK (actor IN (
    'system',
    'intake_agent',
    'clasificador_agent',
    'webhook',
    'reconciliation_job',
    'manual_user'
  ));

-- ============================================================
-- 3. route_matrix table
-- ============================================================
CREATE TABLE IF NOT EXISTS route_matrix (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  route              text        NOT NULL UNIQUE,
  checklist_template jsonb       NOT NULL DEFAULT '[]'::jsonb,
  required_documents jsonb       NOT NULL DEFAULT '[]'::jsonb,
  typical_days       int         NOT NULL DEFAULT 7,
  upsells_default    jsonb       NOT NULL DEFAULT '[]'::jsonb,
  regulatory_notes   text,
  version            text        NOT NULL DEFAULT '1.0',
  updated_at         timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE route_matrix ENABLE ROW LEVEL SECURITY;
CREATE POLICY "route_matrix: service_role only"
  ON route_matrix FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_route_matrix_route ON route_matrix (route);

-- ============================================================
-- 4. Seed route_matrix — all 10 routes (idempotent via ON CONFLICT)
-- ============================================================
INSERT INTO route_matrix
  (route, checklist_template, required_documents, typical_days, upsells_default, regulatory_notes, version)
VALUES

('llc_single_member_us',
 '[{"code":"llc_articles","label":"Articles of Organization","required":true},
   {"code":"operating_agreement","label":"Operating Agreement","required":true},
   {"code":"ein_application","label":"EIN Application (SS-4)","required":true},
   {"code":"registered_agent","label":"Registered Agent Designation","required":true}]'::jsonb,
 '[{"code":"gov_id","label":"Government-issued ID","required":true},
   {"code":"ssn","label":"Social Security Number","required":true}]'::jsonb,
 7,
 '["registered_agent_annual","compliance_plan","business_bank_account"]'::jsonb,
 'Standard LLC for US residents. EIN obtainable immediately via phone/fax with SSN.',
 '1.0'),

('llc_foreign_owned',
 '[{"code":"llc_articles","label":"Articles of Organization","required":true},
   {"code":"operating_agreement","label":"Operating Agreement","required":true},
   {"code":"ein_foreign","label":"EIN — Foreign Path (SS-4 by mail/fax)","required":true},
   {"code":"registered_agent","label":"Registered Agent","required":true},
   {"code":"fincen_boi","label":"FinCEN BOI Report","required":true}]'::jsonb,
 '[{"code":"passport","label":"Valid Passport","required":true},
   {"code":"proof_of_address_foreign","label":"Foreign Proof of Address","required":true},
   {"code":"itin_docs","label":"ITIN supporting documents (if applicable)","required":false}]'::jsonb,
 21,
 '["itin_application","registered_agent_annual","compliance_plan","virtual_office","us_bank_account_assistance"]'::jsonb,
 'Foreign-owned LLCs must file FinCEN BOI. EIN requires IRS SS-4 by mail/fax (no SSN). Form 5472 + 1120 annual filing required.',
 '1.0'),

('corporation',
 '[{"code":"articles_of_incorporation","label":"Articles of Incorporation","required":true},
   {"code":"bylaws","label":"Corporate Bylaws","required":true},
   {"code":"stock_certificates","label":"Stock Certificates","required":true},
   {"code":"ein_application","label":"EIN Application","required":true},
   {"code":"registered_agent","label":"Registered Agent","required":true},
   {"code":"s_corp_election","label":"S-Corp Election (Form 2553, if applicable)","required":false}]'::jsonb,
 '[{"code":"gov_id","label":"Government-issued ID","required":true},
   {"code":"ssn_or_itin","label":"SSN or ITIN","required":true},
   {"code":"shareholder_list","label":"List of Shareholders","required":true}]'::jsonb,
 14,
 '["registered_agent_annual","compliance_plan","business_bank_account","annual_report_filing"]'::jsonb,
 'Delaware and Wyoming preferred. S-Corp election within 75 days of incorporation. Annual franchise taxes apply.',
 '1.0'),

('ein_only',
 '[{"code":"ein_application","label":"EIN Application (SS-4)","required":true},
   {"code":"entity_verification","label":"Entity Verification Document","required":true}]'::jsonb,
 '[{"code":"ssn","label":"Social Security Number","required":true},
   {"code":"entity_docs","label":"Existing entity formation documents","required":true}]'::jsonb,
 3,
 '["compliance_plan","business_bank_account"]'::jsonb,
 'EIN via phone/online for US residents with SSN. Fastest path — no formation needed.',
 '1.0'),

('itin_ein',
 '[{"code":"itin_w7","label":"ITIN Application (W-7)","required":true},
   {"code":"itin_supporting_docs","label":"ITIN Supporting Documents","required":true},
   {"code":"ein_application","label":"EIN Application (SS-4)","required":true}]'::jsonb,
 '[{"code":"passport_certified","label":"Valid Passport (certified copy)","required":true},
   {"code":"proof_of_foreign_status","label":"Proof of Foreign Status","required":true},
   {"code":"tax_return_or_exception","label":"US Tax Return or ITIN Exception Document","required":true}]'::jsonb,
 45,
 '["compliance_plan","virtual_office","us_bank_account_assistance"]'::jsonb,
 'ITIN processing: 7–11 weeks. CAA (Certifying Acceptance Agent) recommended. EIN applied after ITIN issued.',
 '1.0'),

('formation_compliance',
 '[{"code":"llc_articles","label":"Articles of Organization","required":true},
   {"code":"operating_agreement","label":"Operating Agreement","required":true},
   {"code":"ein_application","label":"EIN Application","required":true},
   {"code":"registered_agent","label":"Registered Agent","required":true},
   {"code":"compliance_calendar","label":"Compliance Calendar Setup","required":true},
   {"code":"boi_filing","label":"FinCEN BOI Filing","required":true}]'::jsonb,
 '[{"code":"gov_id","label":"Government-issued ID","required":true},
   {"code":"ssn_or_itin","label":"SSN or ITIN","required":true}]'::jsonb,
 14,
 '["registered_agent_annual","boi_filing","annual_report_filing"]'::jsonb,
 'Full formation + compliance monitoring. BOI filing, annual report reminders, franchise tax tracking.',
 '1.0'),

('formation_banking',
 '[{"code":"llc_articles","label":"Articles of Organization","required":true},
   {"code":"operating_agreement","label":"Operating Agreement","required":true},
   {"code":"ein_application","label":"EIN Application","required":true},
   {"code":"registered_agent","label":"Registered Agent","required":true},
   {"code":"bank_referral","label":"Business Bank Account Referral","required":true},
   {"code":"bank_resolution","label":"Corporate Resolution for Banking","required":true}]'::jsonb,
 '[{"code":"gov_id","label":"Government-issued ID","required":true},
   {"code":"ssn_or_itin","label":"SSN or ITIN","required":true},
   {"code":"proof_of_address","label":"Proof of US or Foreign Address","required":true}]'::jsonb,
 21,
 '["compliance_plan","virtual_office","mercury_bank_referral","relay_bank_referral"]'::jsonb,
 'Formation + banking setup. Mercury/Relay for foreign-owned. US address may be required by bank.',
 '1.0'),

('migratory_future',
 '[{"code":"entity_structure_review","label":"Entity Structure Review for Visa Purposes","required":true},
   {"code":"llc_or_corp_articles","label":"Articles of Organization or Incorporation","required":true},
   {"code":"ein_application","label":"EIN Application","required":true},
   {"code":"registered_agent","label":"Registered Agent","required":true},
   {"code":"immigration_attorney_note","label":"Immigration Attorney Referral Note","required":true}]'::jsonb,
 '[{"code":"passport","label":"Valid Passport","required":true},
   {"code":"visa_status_docs","label":"Current Visa/Immigration Status Documentation","required":true}]'::jsonb,
 21,
 '["immigration_attorney_referral","compliance_plan","registered_agent_annual"]'::jsonb,
 'IMPORTANT: CTE does NOT provide immigration legal advice. Always refer to licensed immigration attorney. Entity type may affect visa eligibility (E-2, EB-5, L-1). ALWAYS requires_human_review = true.',
 '1.0'),

('urgent',
 '[{"code":"expedited_review","label":"Expedited Review and Processing","required":true},
   {"code":"priority_ein","label":"Priority EIN Acquisition","required":true},
   {"code":"state_expedite_filing","label":"State Expedited Filing (if available)","required":true}]'::jsonb,
 '[{"code":"all_docs_immediate","label":"All required documents — IMMEDIATE submission","required":true}]'::jsonb,
 2,
 '["expedited_state_filing","priority_support","compliance_plan"]'::jsonb,
 'Same-day or next-day state filing where available. Additional state fees apply. Client must submit all documents immediately.',
 '1.0'),

('high_risk_documentary',
 '[{"code":"enhanced_doc_review","label":"Enhanced Document Review","required":true},
   {"code":"enhanced_kyc","label":"Identity Verification — Enhanced KYC","required":true},
   {"code":"source_of_funds","label":"Source of Funds Declaration","required":true},
   {"code":"beneficial_owner_disclosure","label":"Beneficial Owner Full Disclosure","required":true},
   {"code":"compliance_officer_review","label":"Compliance Officer Review Before Proceeding","required":true}]'::jsonb,
 '[{"code":"passport_certified","label":"Certified Passport Copy","required":true},
   {"code":"source_of_funds_docs","label":"Source of Funds Documentation","required":true},
   {"code":"beneficial_owner_ids","label":"ID for All Beneficial Owners","required":true}]'::jsonb,
 30,
 '["enhanced_compliance_plan","registered_agent_annual","annual_report_filing"]'::jsonb,
 'HIGH RISK: Requires human review before ANY action. Enhanced KYC/AML procedures. May require legal consultation. Do NOT proceed without compliance officer approval.',
 '1.0')

ON CONFLICT (route) DO UPDATE SET
  checklist_template = EXCLUDED.checklist_template,
  required_documents = EXCLUDED.required_documents,
  typical_days       = EXCLUDED.typical_days,
  upsells_default    = EXCLUDED.upsells_default,
  regulatory_notes   = EXCLUDED.regulatory_notes,
  version            = EXCLUDED.version,
  updated_at         = now();

-- ============================================================
-- 5. Seed prompt_versions — clasificador-v1.0
--    Guard: WHERE NOT EXISTS prevents duplicate on re-run
-- ============================================================
INSERT INTO prompt_versions (agent_id, version_label, prompt_text, is_active, notes)
SELECT
  'clasificador',
  'clasificador-v1.0',
  'Eres el Agente Clasificador de Ruta del sistema CTE (CreaTuEmpresaUSA). Tu función es analizar el expediente de un caso procesado por el Agente Intake y asignarle la ruta operativa exacta.

EXPEDIENTE DEL CASO:
{{CASE_DATA}}

MATRIZ DE RUTAS DISPONIBLES:
{{ROUTE_MATRIX}}

INSTRUCCIONES:
1. Analiza el expediente completo: servicio_solicitado, service_family, checklist_inicial, cliente.pais_origen, cliente.estado_objetivo, intake_score, confidence_score, requires_human_review.
2. Asigna la ruta más específica según la información disponible.
3. Determina la complejidad:
   - Simple: documentos claros, cliente US con SSN, sin señales de riesgo.
   - Medium: cliente extranjero sin SSN, complicaciones menores, ITIN probable.
   - Complex: ITIN requerido, migratorio, multi-jurisdicción, alto riesgo documental.
4. Identifica upsells elegibles según el perfil del cliente y la ruta asignada.
5. Detecta riesgos regulatorios específicos para este caso concreto.
6. Establece confidence_score (0.0–1.0). Si confidence_score < 0.85 → requires_human_review = true.
7. Agrega checklist_additions con ítems específicos de esta ruta (distintos a los del intake).
8. Estima los días para completar basándote en la ruta y la complejidad.
9. Las rutas migratory_future y high_risk_documentary SIEMPRE deben tener requires_human_review = true.

RUTAS VÁLIDAS (usa exactamente estos valores de string):
- llc_single_member_us   → LLC para residente/ciudadano US con SSN
- llc_foreign_owned      → LLC para extranjero sin SSN
- corporation            → C-Corp o S-Corp
- ein_only               → Solo EIN (entidad ya formada)
- itin_ein               → ITIN + EIN para extranjeros sin SSN
- formation_compliance   → Formación + paquete de cumplimiento
- formation_banking      → Formación + apertura de cuenta bancaria
- migratory_future       → Caso con implicaciones migratorias (SIEMPRE human review)
- urgent                 → Procesamiento urgente solicitado explícitamente
- high_risk_documentary  → Alto riesgo documental o señales de alerta (SIEMPRE human review)

RESPONDE ÚNICAMENTE CON EL SIGUIENTE JSON (sin texto adicional, sin markdown, sin explicaciones):
{
  "case_id": "<mismo case_id del expediente>",
  "assigned_route": "<ruta exacta del enum>",
  "complexity": "<Simple|Medium|Complex>",
  "confidence_score": <0.0-1.0>,
  "upsells_eligible": ["<servicio1>", "<servicio2>"],
  "regulatory_risks": ["<riesgo específico 1>", "<riesgo específico 2>"],
  "requires_human_review": <true|false>,
  "human_review_reason": "<razón si true, null si false>",
  "checklist_additions": [
    {
      "code": "<codigo_unico>",
      "label": "<descripción clara>",
      "required": <true|false>,
      "status": "pending",
      "generated_by": "clasificador",
      "checklist_version": "clasificador-checklist-v1.0",
      "notes": "<notas adicionales o null>"
    }
  ],
  "estimated_days": <entero positivo>,
  "next_action": "<próxima acción concreta para el equipo operativo>",
  "route_version": "clasificador-v1.0"
}'
WHERE NOT EXISTS (
  SELECT 1 FROM prompt_versions
  WHERE agent_id = 'clasificador' AND version_label = 'clasificador-v1.0'
);
