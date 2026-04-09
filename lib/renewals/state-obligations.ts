/**
 * State-specific annual compliance obligations.
 * Used to auto-generate renewal records when a company is formed.
 *
 * due_date_logic values:
 *   'anniversary'      – due on the anniversary month of formation (1 yr after)
 *   'fixed:MM-DD'      – due on a specific calendar date each year
 *   'biennial'         – every 2 years from formation date
 *   'none'             – no periodic state report requirement
 */
export interface StateObligation {
  annual_report: {
    required: boolean
    due_date_logic: string
    fee_cents: number
    label: string
    description: string
    notes?: string
  }
  franchise_tax?: {
    required: boolean
    due_date_logic: string
    fee_cents: number          // minimum / typical for small LLC
    label: string
    description: string
  }
}

export const STATE_OBLIGATIONS: Record<string, StateObligation> = {
  AL: { annual_report: { required: true,  due_date_logic: 'fixed:04-15',  fee_cents:  10000, label: 'Annual Report – Alabama',    description: 'Reporte anual ante el Secretary of State de Alabama, vence el 15 de abril.' } },
  AK: { annual_report: { required: true,  due_date_logic: 'anniversary',  fee_cents:  10000, label: 'Biennial Report – Alaska',    description: 'Reporte bienal de Alaska. Vence en el mes aniversario de formación.' } },
  AZ: { annual_report: { required: false, due_date_logic: 'none',         fee_cents:      0, label: 'Sin reporte anual – Arizona', description: 'Arizona no requiere reporte anual para LLCs.' } },
  AR: { annual_report: { required: true,  due_date_logic: 'fixed:05-01',  fee_cents:  15000, label: 'Annual Franchise Tax – Arkansas', description: 'Franchise Tax anual de Arkansas, vence el 1ro de mayo.' } },
  CA: { annual_report: { required: true,  due_date_logic: 'anniversary',  fee_cents:   2000, label: 'Statement of Information – California', description: 'Statement of Information bienal de California. Primera entrega dentro de 90 días de formación, luego cada 2 años.' } },
  CO: { annual_report: { required: true,  due_date_logic: 'anniversary',  fee_cents:   1000, label: 'Periodic Report – Colorado',  description: 'Reporte periódico anual de Colorado, vence en el mes aniversario de formación.' } },
  CT: { annual_report: { required: true,  due_date_logic: 'anniversary',  fee_cents:  20000, label: 'Annual Report – Connecticut',  description: 'Reporte anual de Connecticut, vence en el mes aniversario de formación.' } },
  DE: {
    annual_report: { required: true,  due_date_logic: 'fixed:03-01',  fee_cents:  30000, label: 'Annual Report – Delaware',    description: 'Reporte anual de Delaware, vence el 1ro de marzo.' },
    franchise_tax:  { required: true,  due_date_logic: 'fixed:06-01',  fee_cents:  30000, label: 'Franchise Tax – Delaware',    description: 'Franchise Tax anual de Delaware. Mínimo $300 para LLCs.' }
  },
  FL: { annual_report: { required: true,  due_date_logic: 'fixed:05-01',  fee_cents:  13875, label: 'Annual Report – Florida',     description: 'Reporte anual de Florida, vence el 1ro de mayo. Penalidad por entrega tardía.' } },
  GA: { annual_report: { required: true,  due_date_logic: 'fixed:04-01',  fee_cents:   5000, label: 'Annual Report – Georgia',     description: 'Reporte anual de Georgia, vence el 1ro de abril.' } },
  HI: { annual_report: { required: true,  due_date_logic: 'anniversary',  fee_cents:   1500, label: 'Annual Report – Hawaii',      description: 'Reporte anual de Hawaii, vence en el mes aniversario.' } },
  ID: { annual_report: { required: true,  due_date_logic: 'anniversary',  fee_cents:   0,    label: 'Annual Report – Idaho',       description: 'Reporte anual de Idaho, sin costo para LLCs.' } },
  IL: { annual_report: { required: true,  due_date_logic: 'anniversary',  fee_cents:   7500, label: 'Annual Report – Illinois',    description: 'Reporte anual de Illinois, vence el último día del mes aniversario.' } },
  IN: { annual_report: { required: true,  due_date_logic: 'anniversary',  fee_cents:   3200, label: 'Biennial Report – Indiana',   description: 'Reporte bienal de Indiana.' } },
  IA: { annual_report: { required: true,  due_date_logic: 'fixed:04-01',  fee_cents:   6000, label: 'Biennial Report – Iowa',      description: 'Reporte bienal de Iowa, vence el 1ro de abril años pares.' } },
  KS: { annual_report: { required: true,  due_date_logic: 'fixed:04-15',  fee_cents:   5500, label: 'Annual Report – Kansas',      description: 'Reporte anual de Kansas, vence el 15 de abril.' } },
  KY: { annual_report: { required: true,  due_date_logic: 'fixed:06-30',  fee_cents:   1500, label: 'Annual Report – Kentucky',    description: 'Reporte anual de Kentucky, vence el 30 de junio.' } },
  LA: { annual_report: { required: true,  due_date_logic: 'anniversary',  fee_cents:   3500, label: 'Annual Report – Louisiana',   description: 'Reporte anual de Louisiana, vence en el mes aniversario.' } },
  ME: { annual_report: { required: true,  due_date_logic: 'fixed:06-01',  fee_cents:   8500, label: 'Annual Report – Maine',       description: 'Reporte anual de Maine, vence el 1ro de junio.' } },
  MD: { annual_report: { required: true,  due_date_logic: 'fixed:04-15',  fee_cents:  30000, label: 'Annual Report + Property Tax – Maryland', description: 'Reporte anual de Maryland, vence el 15 de abril.' } },
  MA: { annual_report: { required: true,  due_date_logic: 'anniversary',  fee_cents:  50000, label: 'Annual Report – Massachusetts', description: 'Reporte anual de Massachusetts, vence en el mes aniversario.' } },
  MI: { annual_report: { required: true,  due_date_logic: 'fixed:02-15',  fee_cents:   2500, label: 'Annual Statement – Michigan',  description: 'Statement anual de Michigan, vence el 15 de febrero.' } },
  MN: { annual_report: { required: true,  due_date_logic: 'fixed:12-31',  fee_cents:   0,    label: 'Annual Renewal – Minnesota',  description: 'Renovación anual de Minnesota, vence el 31 de diciembre.' } },
  MS: { annual_report: { required: true,  due_date_logic: 'fixed:04-15',  fee_cents:   5000, label: 'Annual Report – Mississippi',  description: 'Reporte anual de Mississippi, vence el 15 de abril.' } },
  MO: { annual_report: { required: false, due_date_logic: 'none',         fee_cents:   0,    label: 'Sin reporte anual – Missouri', description: 'Missouri no requiere reporte anual para LLCs.' } },
  MT: { annual_report: { required: true,  due_date_logic: 'fixed:04-15',  fee_cents:   2000, label: 'Annual Report – Montana',     description: 'Reporte anual de Montana, vence el 15 de abril.' } },
  NE: { annual_report: { required: true,  due_date_logic: 'fixed:04-01',  fee_cents:   2600, label: 'Biennial Report – Nebraska',  description: 'Reporte bienal de Nebraska, vence el 1ro de abril años pares.' } },
  NV: { annual_report: { required: true,  due_date_logic: 'anniversary',  fee_cents:  35000, label: 'Annual List + Business License – Nevada', description: 'Annual list y renovación de Business License de Nevada. Vence en el mes aniversario.' } },
  NH: { annual_report: { required: true,  due_date_logic: 'fixed:04-01',  fee_cents:  10000, label: 'Annual Report – New Hampshire', description: 'Reporte anual de New Hampshire, vence el 1ro de abril.' } },
  NJ: { annual_report: { required: true,  due_date_logic: 'anniversary',  fee_cents:  7800,  label: 'Annual Report – New Jersey',  description: 'Reporte anual de New Jersey, vence en el mes aniversario.' } },
  NM: { annual_report: { required: true,  due_date_logic: 'biennial',     fee_cents:   1000, label: 'Biennial Report – New Mexico', description: 'Reporte bienal de New Mexico, cada 2 años.' } },
  NY: { annual_report: { required: true,  due_date_logic: 'biennial',     fee_cents:    900, label: 'Biennial Statement – New York', description: 'Statement bienal de New York, vence en el mes aniversario cada 2 años.' } },
  NC: { annual_report: { required: true,  due_date_logic: 'fixed:04-15',  fee_cents:  20200, label: 'Annual Report – North Carolina', description: 'Reporte anual de North Carolina, vence el 15 de abril.' } },
  ND: { annual_report: { required: true,  due_date_logic: 'fixed:11-15',  fee_cents:   5000, label: 'Annual Report – North Dakota', description: 'Reporte anual de North Dakota, vence el 15 de noviembre.' } },
  OH: { annual_report: { required: false, due_date_logic: 'none',         fee_cents:   0,    label: 'Sin reporte anual – Ohio',    description: 'Ohio no requiere reporte anual para LLCs.' } },
  OK: { annual_report: { required: true,  due_date_logic: 'anniversary',  fee_cents:   2500, label: 'Annual Certificate – Oklahoma', description: 'Certificate anual de Oklahoma, vence en el mes aniversario.' } },
  OR: { annual_report: { required: true,  due_date_logic: 'anniversary',  fee_cents:  10000, label: 'Annual Report – Oregon',      description: 'Reporte anual de Oregon, vence en el mes aniversario.' } },
  PA: { annual_report: { required: false, due_date_logic: 'none',         fee_cents:   7000, label: 'Decennial Report – Pennsylvania', description: 'Pennsylvania requiere un reporte cada 10 años.' } },
  RI: { annual_report: { required: true,  due_date_logic: 'fixed:11-01',  fee_cents:  5000,  label: 'Annual Report – Rhode Island', description: 'Reporte anual de Rhode Island, vence el 1ro de noviembre.' } },
  SC: { annual_report: { required: false, due_date_logic: 'none',         fee_cents:   0,    label: 'Sin reporte anual – South Carolina', description: 'South Carolina no requiere reporte anual para LLCs.' } },
  SD: { annual_report: { required: false, due_date_logic: 'none',         fee_cents:   0,    label: 'Sin reporte anual – South Dakota', description: 'South Dakota no requiere reporte anual para LLCs.' } },
  TN: { annual_report: { required: true,  due_date_logic: 'fixed:04-01',  fee_cents:  30000, label: 'Annual Report – Tennessee',   description: 'Reporte anual de Tennessee, vence el 1ro de abril.' } },
  TX: { annual_report: { required: true,  due_date_logic: 'fixed:05-15',  fee_cents:   0,    label: 'Annual Franchise Tax Report – Texas', description: 'Texas requiere reporte anual de Franchise Tax. LLCs con ingresos bajos pueden calificar para "No Tax Due".', notes: 'Basado en ingresos. Revisar con asesor fiscal.' } },
  UT: { annual_report: { required: true,  due_date_logic: 'anniversary',  fee_cents:  2000,  label: 'Annual Renewal – Utah',       description: 'Renovación anual de Utah, vence en el mes aniversario.' } },
  VT: { annual_report: { required: true,  due_date_logic: 'fixed:03-15',  fee_cents:  3500,  label: 'Annual Report – Vermont',     description: 'Reporte anual de Vermont, vence el 15 de marzo.' } },
  VA: { annual_report: { required: true,  due_date_logic: 'anniversary',  fee_cents:  5000,  label: 'Annual Registration Fee – Virginia', description: 'Registration Fee anual de Virginia, vence en el mes aniversario.' } },
  WA: { annual_report: { required: true,  due_date_logic: 'anniversary',  fee_cents:  6000,  label: 'Annual Report – Washington',  description: 'Reporte anual de Washington, vence en el mes aniversario.' } },
  WV: { annual_report: { required: true,  due_date_logic: 'fixed:07-01',  fee_cents:  2500,  label: 'Annual Report – West Virginia', description: 'Reporte anual de West Virginia, vence el 1ro de julio.' } },
  WI: { annual_report: { required: true,  due_date_logic: 'anniversary',  fee_cents:  2500,  label: 'Annual Report – Wisconsin',   description: 'Reporte anual de Wisconsin, vence en el mes aniversario.' } },
  WY: { annual_report: { required: true,  due_date_logic: 'anniversary',  fee_cents:  6200,  label: 'Annual Report – Wyoming',     description: 'Reporte anual de Wyoming, vence en el mes aniversario de formación.' } },
}

/** Registered Agent annual renewal — same cost regardless of state */
export const REGISTERED_AGENT_RENEWAL_CENTS = 9900 // $99/yr

/** Compliance Plan annual renewal */
export const COMPLIANCE_PLAN_CENTS = 9900 // $99/yr

/** BOI Report (one-time, due within 90 days of formation for companies formed after Jan 1, 2024) */
export const BOI_REPORT_CENTS = 14900 // $149

/**
 * Calculates the first due date for an obligation given the formation date.
 *
 * @param formationDate  ISO date string (YYYY-MM-DD)
 * @param logic          due_date_logic from STATE_OBLIGATIONS
 * @param yearsFromNow   Optional offset — defaults to 1
 */
export function calcDueDate(
  formationDate: string,
  logic: string,
  yearsFromNow = 1
): Date {
  const formed = new Date(formationDate)

  if (logic === 'none') {
    // Push 50 years out so it never appears as upcoming
    const d = new Date(formed)
    d.setFullYear(d.getFullYear() + 50)
    return d
  }

  if (logic === 'anniversary') {
    const d = new Date(formed)
    d.setFullYear(d.getFullYear() + yearsFromNow)
    return d
  }

  if (logic === 'biennial') {
    const d = new Date(formed)
    d.setFullYear(d.getFullYear() + 2)
    return d
  }

  if (logic.startsWith('fixed:')) {
    const [mm, dd] = logic.replace('fixed:', '').split('-').map(Number)
    const year = new Date().getFullYear()
    const candidate = new Date(year, mm - 1, dd)
    // If the fixed date this year has already passed, push to next year
    if (candidate <= new Date()) candidate.setFullYear(year + 1)
    return candidate
  }

  // Fallback: 1 year from formation
  const d = new Date(formed)
  d.setFullYear(d.getFullYear() + 1)
  return d
}

/**
 * Returns the reminder tone based on days until due date.
 * Negative days_offset = before due date (days remaining)
 * Positive days_offset = after due date (days overdue)
 */
export function getReminderTone(daysOffset: number): 'educational' | 'preventive' | 'urgent' | 'recovery' {
  if (daysOffset > 0) return 'recovery'          // after due date
  if (daysOffset >= -15) return 'urgent'          // 0–15 days before
  if (daysOffset >= -90) return 'preventive'      // 16–90 days before
  return 'educational'                            // 91+ days before
}

/**
 * The full reminder schedule (days_offset from due date).
 * Negative = before, 0 = due date, positive = after.
 */
export const REMINDER_SCHEDULE = [
  -300, // ~10 months before
  -180, // 6 months before
  -90,  // 90 days before
  -60,  // 60 days before
  -30,  // 30 days before
  -15,  // 15 days before
  -7,   // 7 days before
  -3,   // 3 days before
  0,    // due date
  3,    // 3 days after
  7,    // 7 days after
  15,   // 15 days after
]

/** Status label maps for UI display */
export const RENEWAL_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  upcoming:       { label: 'Próximamente',     color: 'blue'   },
  due_soon:       { label: 'Vence Pronto',     color: 'yellow' },
  overdue:        { label: 'Vencido',          color: 'red'    },
  paid:           { label: 'Pagado',           color: 'green'  },
  waived:         { label: 'Exento',           color: 'gray'   },
  not_applicable: { label: 'No Aplica',        color: 'gray'   },
}

export const RENEWAL_TYPE_LABELS: Record<string, { label: string; icon: string }> = {
  registered_agent: { label: 'Registered Agent',          icon: '🏢' },
  annual_report:    { label: 'Reporte Anual Estatal',      icon: '📋' },
  franchise_tax:    { label: 'Franchise Tax',              icon: '💼' },
  periodic_report:  { label: 'Reporte Periódico',          icon: '📄' },
  compliance_plan:  { label: 'Plan de Cumplimiento',       icon: '🛡️' },
  boi_report:       { label: 'BOI Report (FinCEN)',         icon: '🇺🇸' },
  ein_renewal:      { label: 'EIN / Información Fiscal',   icon: '🔢' },
}
