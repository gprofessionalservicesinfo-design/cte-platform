/* ═══════════════════════════════════════════════════════════════
   CreaTuEmpresaUSA — config.js
   Central configuration for ALL integrations.
   ▸ Update these values before deploying to production.
   ▸ Never expose raw API secret keys here — use a backend proxy.

   PERSISTENCE LAYER (see /js/persistence.js for full docs):
   ──────────────────────────────────────────────────────────────
   ORDER_WEBHOOK_URL → receives formation order payloads
   EIN_WEBHOOK_URL   → receives EIN intake payloads

   Quick start options (no backend required):
   • Zapier:   create a "Catch Hook" trigger → copy URL here
   • Make:     create a "Custom Webhook" → copy URL here
   • webhook.site: free temp endpoint for local dev/testing

   To upgrade to a real database later:
   • Supabase:  replace fetch() in persistence.js with supabase.from().insert()
   • Airtable:  POST to https://api.airtable.com/v0/{BASE_ID}/{TABLE}
   • Your API:  POST /api/orders and /api/ein with the same payload shape
   ═══════════════════════════════════════════════════════════════ */

window.CONFIG = {

  /* ── WhatsApp ──────────────────────────────────────────────────
     Digits only with country code. No +, spaces, or dashes.
     Example: "12125551234" → +1 (212) 555-1234                  */
  WHATSAPP_NUMBER: "19046248859",

  /* ── Formspree ─────────────────────────────────────────────────
     Create a free form at formspree.io → copy the endpoint URL.
     Free plan: 50 submissions/month. Paid: unlimited.           */
  FORMSPREE_ENDPOINT: "https://formspree.io/f/YOUR_FORM_ID",

  /* ── Calendly ──────────────────────────────────────────────────
     Your scheduling link from calendly.com                      */
  CALENDLY_URL: "https://calendly.com/YOUR_LINK",

  /* ── Stripe Payment Links ──────────────────────────────────────
     Create Payment Links at dashboard.stripe.com/payment-links
     Leave empty ("") to redirect to contact page instead.       */
  STRIPE_PAYMENT_LINK_STARTER:    "https://buy.stripe.com/test_8x29AV7LN9SheYO4v36c000",
  STRIPE_PAYMENT_LINK_PRO:        "https://buy.stripe.com/test_cNi5kF7LN9Sh9EugdL6c001",
  STRIPE_PAYMENT_LINK_PREMIUM:    "https://buy.stripe.com/test_cNi6oJaXZ7K9bMCf9H6c002",

  /* ── AI Chat Proxy ─────────────────────────────────────────────
     Server-side proxy that holds your OpenAI key securely.
     Never put raw OpenAI keys in frontend code.                 */
  OPENAI_API_PROXY_URL: "/api/chat",

  /* ── CRM / Lead Webhook ────────────────────────────────────────
     Zapier / Make / HubSpot / Pipedrive webhook URL.
     Leave empty ("") to skip CRM push.                         */
  CRM_WEBHOOK_URL: "",

  /* ── Order Webhook ─────────────────────────────────────────────
     Receives the full structured order payload on wizard submit.
     Use to: create DB record, trigger Stripe session, notify team.
     Supports: Zapier, Make, your own API endpoint.             */
  ORDER_WEBHOOK_URL: "https://creatuempresausa.com/api/orders",

  /* ── EIN Intake Webhook ─────────────────────────────────────────
     Receives the EIN form payload from /ein-intake.html.
     Use to: trigger IRS SS-4 workflow, notify filing team.     */
  EIN_WEBHOOK_URL: "",

  /* ── Supabase / Google Auth ─────────────────────────────────────
     Fill these in to activate the Google login entry point in the
     wizard flow. Do NOT put secret keys here — anon key only.
     Get values from: supabase.com → project → Settings → API

     Set GOOGLE_AUTH_ENABLED: true only after configuring the
     Google provider in your Supabase dashboard AND adding the
     callback URL (http://localhost:PORT/auth/callback or your
     production URL) to Supabase → Auth → URL Configuration.

     APPLE AUTH DEFERRED TO NEXT SPRINT                           */
  SUPABASE_URL:          "https://rhprcuqhuesorrncswjs.supabase.co",
  SUPABASE_ANON_KEY:     "sb_publishable_6wGlBS4g30qvGxU-_DhwQA_FDsHLk6Y",
  GOOGLE_AUTH_ENABLED:   true,

  /* ── Test Mode ──────────────────────────────────────────────────
     Set to true to enable dev/test mode on any host.
     Auto-detected on localhost/127.0.0.1 regardless of this flag.
     Effects: console payload logging, TEST MODE banner,
              Stripe links bypass to /contacto.html fallback.   */
  TEST_MODE: false,

  /* ── Site ──────────────────────────────────────────────────────*/
  SITE_URL:  "https://www.creatuempresausa.com",
  SITE_NAME: "CreaTuEmpresaUSA",

  /* ── Plans definition ──────────────────────────────────────────
     Single source of truth for plan data across all pages.      */
  PLANS: {
    basic: {
      id:      "basic",
      name:    "Plan Basic",
      price:   499,
      badge:   null,
      popular: false,
      features: [
        "Formación de LLC o Corporation",
        "Articles of Organization",
        "Registered Agent (12 meses)",
        "EIN del IRS",
        "Documentos digitales",
        "Soporte por email"
      ],
      not_included: [
        "Operating Agreement",
        "Asesoría bancaria",
        "Business Address"
      ]
    },
    growth: {
      id:      "growth",
      name:    "Plan Growth",
      price:   799,
      badge:   "Más popular",
      popular: true,
      features: [
        "Todo lo del Basic",
        "Operating Agreement completo",
        "Asesoría apertura bancaria",
        "Guía de compliance anual",
        "Soporte prioritario email"
      ],
      not_included: [
        "Business Address",
        "Fast-track",
        "ITIN"
      ]
    },
    premium: {
      id:      "premium",
      name:    "Plan Premium",
      price:   1200,
      badge:   "Concierge",
      popular: false,
      features: [
        "Todo lo del Growth",
        "Fast-track (prioridad máxima)",
        "Business Address Standard (12 meses)",
        "Sesión de asesoría fiscal",
        "Soporte dedicado WhatsApp",
        "Form 5472 incluido"
      ],
      not_included: []
    }
  },

  /* ── WhatsApp message templates ────────────────────────────────*/
  WA_MESSAGES: {
    general:      "Hola, me interesa abrir una empresa en EE.UU. ¿Me pueden asesorar?",
    llc:          "Hola, me interesa formar una LLC en EE.UU. desde {country}. ¿Cuáles son los pasos?",
    corporation:  "Hola, quiero información sobre cómo abrir una C-Corporation en EE.UU.",
    basic:        "Hola, me interesa el Plan Basic ($499) para abrir mi LLC en EE.UU.",
    growth:       "Hola, me interesa el Plan Growth ($799) para LLC + EIN en EE.UU.",
    premium:      "Hola, me interesa el Plan Premium ($1,200) con todo incluido para mi empresa en EE.UU.",
    state:        "Hola, quiero abrir una LLC en {state}. ¿Pueden asesorarme sobre este estado?",
    wizard:       "Hola, completé el formulario del asistente. Quiero una LLC en {state} con el {plan}."
  }
};
