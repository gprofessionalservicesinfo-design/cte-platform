import axios from 'axios'
import type { SupabaseClient } from '@supabase/supabase-js'
import { normalizeIntakeOutput } from './validate'
import type { IntakeOutput } from './schema'

const INTAKE_MODEL  = 'claude-sonnet-4-6'
const ANTHROPIC_VER = '2023-06-01'
const MAX_TOKENS    = 2048

// Map DB package values → human-readable service description for the prompt
const PKG_TO_SERVICE: Record<string, string> = {
  starter:      'Formación de LLC — Plan Starter (formación estatal)',
  professional: 'Formación de LLC — Plan Pro (formación estatal + EIN federal)',
  premium:      'Formación de LLC — Plan Premium (formación estatal + EIN + Registered Agent + Dirección Comercial)',
}

export interface IntakeContext {
  caseId:      string
  clientName:  string
  clientEmail: string
  phone:       string
  companyName: string
  stateCode:   string
  stateName:   string
  packageKey:  string   // starter | professional | premium
  amountUsd:   number   // dollars (NOT cents)
  source?:     string   // UTM / referral source
}

export async function runIntake(
  ctx: IntakeContext,
  supabase: SupabaseClient
): Promise<{ data: IntakeOutput; normalized: boolean; issues: string[] }> {
  // 1. Fetch active prompt — fall back to embedded default if DB prompt is still a placeholder
  const { data: promptRow } = await supabase
    .from('prompt_versions')
    .select('prompt_text')
    .eq('agent_id', 'intake')
    .eq('is_active', true)
    .maybeSingle()

  const isPlaceholder =
    !promptRow?.prompt_text ||
    promptRow.prompt_text.startsWith('Prompt inicial')

  const systemPrompt = isPlaceholder
    ? buildDefaultSystemPrompt()
    : promptRow!.prompt_text

  // 2. Build rich user message from all resolved context
  const serviceName = PKG_TO_SERVICE[ctx.packageKey] ?? `Servicio CTE — ${ctx.packageKey}`

  const userMessage = [
    'Procesa este nuevo cliente que acaba de pagar:',
    '',
    'DATOS DEL CLIENTE:',
    `- Nombre completo: ${ctx.clientName}`,
    `- Email: ${ctx.clientEmail}`,
    `- Teléfono: ${ctx.phone || 'No proporcionado'}`,
    '',
    'DATOS DE LA EMPRESA:',
    `- Nombre de empresa deseado: ${ctx.companyName}`,
    `- Estado de formación: ${ctx.stateName || ctx.stateCode || 'No especificado'}`,
    `- Código de estado: ${ctx.stateCode || 'N/A'}`,
    '',
    'DATOS DEL SERVICIO:',
    `- Servicio contratado: ${serviceName}`,
    `- Monto pagado: $${ctx.amountUsd.toFixed(2)} USD`,
    `- Plan interno: ${ctx.packageKey}`,
    ctx.source ? `- Fuente/UTM: ${ctx.source}` : null,
    '',
    `ID del caso: ${ctx.caseId}`,
    '',
    'Responde ÚNICAMENTE con JSON válido según el schema. No incluyas markdown ni texto fuera del JSON.',
  ]
    .filter((l) => l !== null)
    .join('\n')

  // 3. Call Anthropic API
  const response = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model:      INTAKE_MODEL,
      max_tokens: MAX_TOKENS,
      system:     systemPrompt,
      messages:   [{ role: 'user', content: userMessage }],
    },
    {
      headers: {
        'x-api-key':         process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': ANTHROPIC_VER,
        'content-type':      'application/json',
      },
      timeout: 30_000,
    }
  )

  // 4. Extract JSON from LLM text (tolerates accidental markdown fences)
  const rawText: string = response.data?.content?.[0]?.text ?? ''
  const raw = (() => {
    const match = rawText.match(/\{[\s\S]*\}/)
    if (!match) return {}
    try { return JSON.parse(match[0]) } catch { return {} }
  })()

  // 5. Normalize via shared validator (handles schema gaps, applies business rules)
  return normalizeIntakeOutput(raw, ctx.caseId)
}

// ── Embedded default prompt ────────────────────────────────────────────────────
// Active until the DB prompt_versions row is updated with a real prompt.
function buildDefaultSystemPrompt(): string {
  return `Eres el Agente de Intake de CreaTuEmpresaUSA (CTE), plataforma que ayuda a emprendedores latinoamericanos a formar empresas en EE.UU.

Tu única función es analizar los datos de un nuevo cliente que acaba de pagar y generar un JSON estructurado con la información de intake.

REGLAS ESTRICTAS:
1. Responde ÚNICAMENTE con JSON válido. NUNCA incluyas markdown (\`\`\`json), explicaciones ni texto fuera del JSON.
2. NUNCA uses "Desconocido" en cliente.nombre — usa el nombre proporcionado.
3. NUNCA uses "unknown" en servicio_solicitado — usa el servicio proporcionado.
4. El JSON debe seguir exactamente este schema:

{
  "case_id": "<el case_id proporcionado — no lo modifiques>",
  "cliente": {
    "nombre": "<nombre completo del cliente>",
    "email": "<email del cliente>",
    "telefono": "<teléfono si se proporcionó, o null>",
    "idioma_preferido": "es",
    "pais_origen": null,
    "estado_objetivo": "<código o nombre del estado de formación, o null>"
  },
  "servicio_solicitado": "<descripción exacta del servicio contratado, específica y completa>",
  "service_family": "<LLC_Formation | Corporation_Formation | EIN_Only | Registered_Agent | Compliance | Other>",
  "intake_score": <entero 1-10>,
  "score_reasoning": "<breve explicación del score>",
  "checklist_inicial": [
    {
      "code": "<snake_case_code>",
      "label": "<etiqueta en español>",
      "required": true,
      "status": "pending",
      "generated_by": "intake",
      "checklist_version": "intake-checklist-v1.0",
      "notes": null
    }
  ],
  "siguiente_accion": "<acción concreta y específica, no genérica>",
  "requires_human_review": false,
  "human_review_reason": null,
  "confidence_score": <decimal 0.0-1.0>
}

LÓGICA DE service_family:
- Plan Starter/Pro/Premium con LLC en el nombre → LLC_Formation
- Solo EIN → EIN_Only
- Solo Registered Agent → Registered_Agent

LÓGICA DE intake_score:
- 8-10: Nombre, email, empresa y estado presentes
- 5-7: Falta estado o nombre de empresa
- 1-4: Faltan datos críticos (nombre o email)

checklist_inicial mínimo para LLC_Formation (5 items):
- search_name_availability: "Búsqueda de disponibilidad del nombre"
- prepare_articles: "Preparar Artículos de Organización"
- file_with_state: "Presentar documentos ante el Estado"
- obtain_ein: "Obtener EIN federal (Número de Empleador)"
- setup_portal: "Configurar acceso al portal del cliente"

Si el plan es Premium, añade:
- setup_registered_agent: "Configurar Registered Agent"
- setup_business_address: "Configurar Dirección Comercial"

LÓGICA DE confidence_score:
- 0.85-1.0: Todos los datos presentes (nombre, email, empresa, estado)
- 0.65-0.84: Falta estado o nombre de empresa
- 0.40-0.64: Falta información relevante
- <0.40: Datos críticos ausentes

siguiente_accion debe ser concreta, p. ej.:
"Iniciar búsqueda de disponibilidad del nombre '${'{companyName}'}' en ${'{state}'}"
No uses frases genéricas como "Revisar el caso".`
}
