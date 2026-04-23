'use client'

import { useSearchParams } from 'next/navigation'
import { Logo } from '@/components/logo'
import Link from 'next/link'
import { useState } from 'react'

const WA_NUMBER = '18669958013'
const WA_BASE   = `https://wa.me/${WA_NUMBER}?text=`

const PLANS = [
  {
    id:    'plan_basico',
    name:  'Plan Básico',
    price: '$499',
    badge: null,
    waText: 'Quiero%20el%20Plan%20B%C3%A1sico%20%E2%80%94%20LLC%20%24499',
    features: [
      'LLC registrada en el estado que elijas (NM, WY, DE, FL, TX)',
      'EIN asignado por el IRS',
      'Registered Agent por 1 año',
      'Operating Agreement personalizado',
      'BOI Report presentado al FinCEN',
      'Soporte en español por WhatsApp',
      'Entrega en 7-10 días hábiles',
    ],
  },
  {
    id:    'plan_completo',
    name:  'Plan Completo',
    price: '$799',
    badge: 'MÁS POPULAR',
    waText: 'Quiero%20el%20Plan%20Completo%20%E2%80%94%20LLC%20%24799',
    features: [
      'Todo del Plan Básico, más:',
      'Gestión de apertura Mercury Bank',
      'Setup de Stripe para cobros internacionales',
      'Dominio .com + email profesional (1 año)',
      'Plantillas de contratos W-9 en inglés/español',
      'Sesión de onboarding 1-a-1 (45 min)',
      'Acceso al portal cliente con seguimiento en tiempo real',
    ],
  },
]

const FAQS: { q: string; a: string }[] = [
  {
    q: '¿Necesito viajar o tener visa para abrir mi LLC?',
    a: 'No. El proceso es 100% remoto. Nunca necesitas pisar suelo americano, tener visa ni ser residente. Solo necesitas tu pasaporte y una dirección fuera de EE. UU.',
  },
  {
    q: '¿Tendré que pagar impuestos en USA?',
    a: 'Si eres no residente y tu negocio opera fuera de EE. UU. (clientes y servicios fuera del país), generalmente la LLC de un solo miembro no tributa impuestos federales en EE. UU. Recomendamos confirmar tu situación con un CPA licenciado, ya que cada caso es distinto.',
  },
  {
    q: '¿Qué estado me conviene más?',
    a: 'Depende de tu objetivo. New Mexico (NM) ofrece anonimato total y costo mínimo. Wyoming (WY) tiene fuerte protección de activos. Delaware (DE) es preferido por startups e inversores. Florida y Texas son ideales si planeas operar en esos estados. Te asesoramos en el proceso para elegir según tu caso.',
  },
  {
    q: '¿En cuánto tiempo tengo mi LLC lista?',
    a: 'Entre 7 y 10 días hábiles desde que completas el formulario y realizas el pago. El EIN puede tardar hasta 2 semanas adicionales dependiendo del IRS.',
  },
  {
    q: '¿Puedo abrir una cuenta Mercury Bank sin SSN?',
    a: 'Sí. Mercury acepta LLCs de no residentes con EIN. El proceso de solicitud es online. Nosotros te guiamos paso a paso en la apertura (incluido en Plan Completo, orientación en Plan Básico).',
  },
  {
    q: '¿Cuánto cuesta mantener la LLC después del primer año?',
    a: 'Varía por estado. NM y WY son los más económicos: renovación anual del Registered Agent (~$99/año). Algunos estados cobran franchise tax o report anual adicional. Te informamos los costos exactos de tu estado antes de registrar.',
  },
  {
    q: '¿Ustedes son abogados o una firma legal?',
    a: 'No. CreaTuEmpresaUSA es un servicio de formación de entidades (business formation) operado por Gutierrez Professional Services LLC. No somos abogados, no brindamos asesoría legal ni fiscal, y nuestros servicios no crean relación abogado-cliente. Para asesoría legal específica, recomendamos contratar un abogado licenciado.',
  },
  {
    q: '¿Qué pasa si no quedo conforme?',
    a: 'Si el problema es un error de nuestra parte (datos incorrectos en el filing), lo corregimos sin costo. Para cancelaciones antes de iniciar el trámite, aplica nuestra Política de Reembolso. Una vez presentados los documentos ante el estado, los costos gubernamentales no son reembolsables.',
  },
]

export default function OfertaClient() {
  const params       = useSearchParams()
  const utm_source   = params.get('utm_source')   ?? ''
  const utm_medium   = params.get('utm_medium')   ?? ''
  const utm_campaign = params.get('utm_campaign') ?? ''
  const utm_content  = params.get('utm_content')  ?? ''
  const utms         = { utm_source, utm_medium, utm_campaign, utm_content }

  const [openFaq, setOpenFaq] = useState<number | null>(null)

  // handleWA execution order:
  //   1. Start lead capture fetch (2s AbortController timeout) — non-blocking
  //   2. Fire GA4 event immediately (analytics survive any API failure)
  //   3. Open WhatsApp immediately (user never waits for Supabase)
  function handleWA(cta: string, waText: string) {
    // 1. Lead capture — 2s hard timeout, logs on failure, never blocks step 2/3
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 2000)
    fetch('/api/leads/capture', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ source: 'oferta', clicked_cta: cta, ...utms }),
      signal:  controller.signal,
    })
      .then(() => clearTimeout(timer))
      .catch(err => {
        clearTimeout(timer)
        console.error('[lead_capture_failed]', err, {
          cta,
          utm_source:   utms.utm_source,
          utm_campaign: utms.utm_campaign,
        })
      })

    // 2. GA4 event — fires regardless of fetch outcome
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).gtag?.('event', 'lead_whatsapp_click', { event_label: cta })
    } catch {}

    // 3. WhatsApp redirect — always runs, never blocked
    window.open(`${WA_BASE}${waText}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-b from-[#0A2540] to-[#0e3158] text-white px-5 pt-6 pb-12">

        {/* Logo — no nav */}
        <div className="mb-6">
          <Logo height={28} invert />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 bg-teal-500/20 border border-teal-400/40 text-teal-300 text-xs font-semibold rounded-full px-3 py-1 mb-5">
          🚀 Cupo limitado abril 2026 — Solo 10 clientes
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-3">
          Forma tu LLC en Estados Unidos en <span className="text-teal-400">7 días</span>
        </h1>

        <p className="text-lg text-blue-200 mb-2">
          Sin viajar. Sin ser residente. Desde cualquier país.
        </p>

        <p className="text-2xl font-bold text-white mb-4">
          Desde <span className="text-teal-400">$499 USD</span>
        </p>

        <p className="text-sm text-blue-200 leading-relaxed mb-8 max-w-md">
          Atención 100% personalizada en español. Incluye EIN, Registered Agent,
          Operating Agreement y BOI Report.
        </p>

        {/* Primary CTA */}
        <button
          onClick={() => handleWA('hero', 'LLC')}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-white font-bold text-base rounded-xl px-8 py-4 transition-colors shadow-lg shadow-teal-900/40 mb-3"
        >
          📱 Escríbeme por WhatsApp ahora
        </button>

        {/* Secondary CTA */}
        <a
          href="#calendly"
          className="block text-center text-sm text-teal-300 hover:text-white underline underline-offset-2 transition-colors"
        >
          O agenda una llamada gratis de 15 min →
        </a>

        {/* Micro-trust */}
        <p className="mt-4 text-xs text-blue-300 text-center sm:text-left">
          ⚡ Respuesta en &lt;2h
        </p>
      </section>

      {/* ── PARA QUIÉN ────────────────────────────────────────────── */}
      <section className="px-5 py-12 bg-gray-50">
        <h2 className="text-xl font-bold text-gray-900 text-center mb-8">
          ¿Para quién es esto?
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
          {[
            { icon: '💰', title: 'Freelancer o agencia',      desc: 'Cobra en USD y separa tus finanzas' },
            { icon: '🛒', title: 'Vendes en Amazon o Shopify', desc: 'Crea tu seller account en EE. UU.' },
            { icon: '🔒', title: 'Quieres privacidad',        desc: 'LLC anónima en New Mexico' },
            { icon: '🚀', title: 'Escalas a mercado US',       desc: 'Entidad lista para inversores' },
          ].map(c => (
            <div key={c.title} className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
              <div className="text-3xl mb-2">{c.icon}</div>
              <p className="font-semibold text-gray-900 text-xs leading-tight mb-1">{c.title}</p>
              <p className="text-gray-500 text-xs leading-snug">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── QUÉ INCLUYE / PRICING ─────────────────────────────────── */}
      <section className="px-5 py-12 bg-white">
        <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
          ¿Qué incluye?
        </h2>
        <p className="text-center text-gray-500 text-sm mb-8">Elige el plan que se adapta a tu etapa</p>

        <div className="grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
          {PLANS.map(plan => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 p-6 flex flex-col ${
                plan.badge
                  ? 'border-teal-500 shadow-lg shadow-teal-100'
                  : 'border-gray-200'
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-500 text-white text-xs font-bold rounded-full px-4 py-0.5">
                  {plan.badge}
                </span>
              )}
              <p className="font-bold text-gray-900 text-lg">{plan.name}</p>
              <p className="text-3xl font-bold text-teal-600 mt-1 mb-5">{plan.price}</p>
              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex gap-2 text-sm text-gray-700">
                    <span className="text-teal-500 font-bold shrink-0 mt-0.5">✅</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleWA(plan.id, plan.waText)}
                className={`w-full rounded-xl py-3 text-sm font-bold transition-colors ${
                  plan.badge
                    ? 'bg-teal-500 hover:bg-teal-400 text-white'
                    : 'bg-gray-900 hover:bg-gray-700 text-white'
                }`}
              >
                Empezar con {plan.name.replace('Plan ', '')}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ─────────────────────────────────────────── */}
      <section className="px-5 py-12 bg-gray-50">
        <h2 className="text-xl font-bold text-gray-900 text-center mb-10">
          ¿Cómo funciona?
        </h2>
        <div className="max-w-lg mx-auto space-y-6">
          {[
            {
              day:   'Día 1',
              title: 'Pagas y llenas el formulario',
              desc:  'Proceso online, 10 minutos. Necesitas pasaporte y dirección actual.',
            },
            {
              day:   'Días 2–5',
              title: 'Nosotros registramos todo',
              desc:  'Presentamos tus documentos ante el estado y el IRS. Tú no haces nada.',
            },
            {
              day:   'Días 6–10',
              title: 'Recibes todo por email y portal',
              desc:  'LLC aprobada, EIN, Operating Agreement y BOI confirmado. Listo para operar.',
            },
          ].map((step, i) => (
            <div key={i} className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-500 text-white text-xs font-bold flex items-center justify-center">
                {i + 1}
              </div>
              <div>
                <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-0.5">{step.day}</p>
                <p className="font-semibold text-gray-900 text-sm">{step.title}</p>
                <p className="text-gray-500 text-sm mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <section className="px-5 py-12 bg-white">
        <h2 className="text-xl font-bold text-gray-900 text-center mb-8">
          Preguntas frecuentes
        </h2>
        <div className="max-w-2xl mx-auto divide-y divide-gray-100">
          {FAQS.map((faq, i) => (
            <div key={i}>
              <button
                className="w-full flex justify-between items-center gap-3 py-4 text-left text-sm font-semibold text-gray-900 hover:text-teal-700 transition-colors"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                aria-expanded={openFaq === i}
              >
                <span>{faq.q}</span>
                <span className="shrink-0 text-teal-500 text-lg leading-none">
                  {openFaq === i ? '−' : '+'}
                </span>
              </button>
              {openFaq === i && (
                <p className="pb-4 text-sm text-gray-600 leading-relaxed">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── URGENCIA FINAL + CTA ──────────────────────────────────── */}
      <section className="px-5 py-14 bg-gradient-to-b from-[#0A2540] to-[#061828] text-white text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-3">
          Cupos de abril — Solo 10 disponibles
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold mb-8 leading-snug">
          Tu LLC en EE. UU. empieza hoy
        </h2>

        <button
          onClick={() => handleWA('final', 'LLC')}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-white font-bold text-base rounded-xl px-10 py-4 transition-colors shadow-lg shadow-teal-900/40 mx-auto mb-4"
        >
          📱 Escríbeme LLC por WhatsApp
        </button>

        <a
          id="calendly"
          href="#calendly"
          className="block text-sm text-teal-300 hover:text-white underline underline-offset-2 transition-colors"
        >
          O agenda una llamada de 15 min gratis →
        </a>

        {/* Calendly placeholder */}
        <div className="mt-8 mx-auto max-w-sm bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
          <p className="text-xs text-blue-300 mb-1 uppercase tracking-wide font-semibold">Calendly</p>
          <p className="text-sm text-blue-200">Embed de Calendly — agregar URL cuando esté lista</p>
        </div>
      </section>

    </div>
  )
}
