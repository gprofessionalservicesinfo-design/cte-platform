/* ═══════════════════════════════════════════════════════════════════
   CreaTuEmpresaUSA — persistence.js  v2
   WEBHOOK-FIRST PERSISTENCE LAYER

   ── ARCHITECTURE ──────────────────────────────────────────────────
   localStorage / sessionStorage → always written first (offline-safe).
   Webhook POST                  → attempted after local save.
   Result                        → { ok, skipped, result_status, error }

   result_status values (use these in UI — never check ok/skipped directly):
     Formation orders : 'registered'  | 'local_only' | 'sync_failed'
     EIN applications : 'submitted'   | 'local_only' | 'sync_failed'

   ── WEBHOOK TARGETS — HOW TO CONFIGURE ───────────────────────────

   Set ORDER_WEBHOOK_URL and EIN_WEBHOOK_URL in /js/config.js.
   The payload is sent as JSON via POST. Pick any target below.

   ▸ webhook.site  (free, instant, no account needed — best for testing)
       1. Go to https://webhook.site
       2. Copy your unique URL, e.g.:
            https://webhook.site/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
       3. Paste it into config.js → ORDER_WEBHOOK_URL or EIN_WEBHOOK_URL
       4. Submit the form and watch the payload arrive in real time.

   ▸ Zapier  (no-code automation)
       1. Create a Zap → Trigger: "Webhooks by Zapier" → "Catch Hook"
       2. Copy the webhook URL Zapier gives you.
       3. Add actions: email notification, Google Sheets row, HubSpot deal,
          Slack message, Notion page — whatever you need.
       4. Paste the URL into config.js.

   ▸ Make (formerly Integromat)
       1. Create a scenario → Add module: "Webhooks" → "Custom Webhook"
       2. Click "Add" → name it → copy the URL.
       3. Add downstream modules: Airtable, Google Sheets, Gmail, Slack, etc.
       4. Paste the URL into config.js.

   ▸ Airtable Automations  (direct, no middleware needed)
       Option A — via Make/Zapier webhook (see above).
       Option B — direct Airtable REST API (needs a backend proxy for the PAT):
         POST https://api.airtable.com/v0/{BASE_ID}/FormationOrders
         Authorization: Bearer YOUR_AIRTABLE_PERSONAL_ACCESS_TOKEN
         Content-Type: application/json
         Body: { "fields": { ...payload } }
       IMPORTANT: Never expose your Airtable PAT in frontend code.
       Use a serverless function (Netlify Function, Vercel Function) as proxy.

   ▸ Supabase Edge Function  (when you're ready for a real database)
       1. Create a Supabase project at https://supabase.com
       2. Create tables:
            formation_orders (id, entity_type, state_code, package, total_due_today,
                              customer_email, customer_name, addons, timestamp, ...)
            ein_applications (id, order_reference, responsible_party_name,
                              business_address, member_count, email, timestamp, ...)
       3. Deploy an Edge Function at /functions/v1/submit-order:
            import { createClient } from '@supabase/supabase-js'
            const supabase = createClient(Deno.env.get('SUPABASE_URL'),
                                          Deno.env.get('SUPABASE_SERVICE_KEY'))
            Deno.serve(async (req) => {
              const payload = await req.json()
              const { error } = await supabase.from('formation_orders').insert(payload)
              return new Response(JSON.stringify({ ok: !error }), { status: error ? 500 : 200 })
            })
       4. Set ORDER_WEBHOOK_URL = 'https://{project}.supabase.co/functions/v1/submit-order'
       5. Same pattern for ein_applications → EIN_WEBHOOK_URL.
       The Edge Function holds the service key securely server-side.

   ▸ Your own API
       POST /api/orders  { ...formation order payload }
       POST /api/ein     { ...EIN application payload }
       Return: { ok: true }  on success.

   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Config ─────────────────────────────────────────────────────────
     WEBHOOK_TIMEOUT_MS: max ms to wait for a webhook response.
     If the server takes longer, we treat it as sync_failed and
     continue. The data is already safe in localStorage.
  */
  var WEBHOOK_TIMEOUT_MS = 8000;

  /* ── Helpers ─────────────────────────────────────────────────────── */

  function isTestMode() {
    var h = window.location.hostname;
    return h === 'localhost' || h === '127.0.0.1' || h.startsWith('192.168.')
        || (window.CONFIG && window.CONFIG.TEST_MODE === true);
  }

  /* fetch() with a hard timeout — resolves with a network-error result
     if the server does not respond within WEBHOOK_TIMEOUT_MS.         */
  function fetchWithTimeout(url, options, ms) {
    return new Promise(function (resolve) {
      var timer = setTimeout(function () {
        resolve({ ok: false, _timedOut: true });
      }, ms);

      fetch(url, options).then(function (resp) {
        clearTimeout(timer);
        resolve(resp);
      }).catch(function (err) {
        clearTimeout(timer);
        resolve({ ok: false, _error: err.message });
      });
    });
  }

  /* ── Core POST helper ────────────────────────────────────────────────
     Sends payload to url, returns a normalised result.
     Never throws — all error paths return a result object.

     Raw result shape (internal):
       { ok, http_status, skipped, timed_out, error }
  */
  async function postJSON(url, payload) {
    if (!url || url.trim() === '') {
      return { ok: false, http_status: null, skipped: true, timed_out: false, error: null };
    }

    var resp = await fetchWithTimeout(
      url,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body:    JSON.stringify(payload)
      },
      WEBHOOK_TIMEOUT_MS
    );

    /* Timeout pseudo-response */
    if (resp._timedOut) {
      return {
        ok: false, http_status: null, skipped: false,
        timed_out: true, error: 'Webhook timed out after ' + WEBHOOK_TIMEOUT_MS + 'ms'
      };
    }

    /* Network error pseudo-response */
    if (resp._error) {
      return { ok: false, http_status: null, skipped: false, timed_out: false, error: resp._error };
    }

    /* Real HTTP response */
    var body = null;
    try { body = await resp.json(); } catch (e) {}

    return {
      ok:          resp.ok,
      http_status: resp.status,
      skipped:     false,
      timed_out:   false,
      error:       resp.ok ? null : ((body && body.error) || ('HTTP ' + resp.status))
    };
  }

  /* ── Result builder ──────────────────────────────────────────────────
     Converts the raw postJSON result into the public result shape.

     Public result shape:
       {
         ok:            bool    — webhook accepted the payload
         skipped:       bool    — webhook URL not configured
         timed_out:     bool    — webhook did not respond in time
         http_status:   int     — HTTP status code (null if N/A)
         error:         string  — error description (null if ok/skipped)
         result_status: string  — 'registered'|'submitted'|'local_only'|'sync_failed'
       }

     result_status is the single value UI code should branch on.
  */
  function buildResult(raw, okStatus) {
    var resultStatus;
    if (raw.skipped) {
      resultStatus = 'local_only';
    } else if (raw.ok) {
      resultStatus = okStatus;           /* 'registered' or 'submitted' */
    } else {
      resultStatus = 'sync_failed';
    }
    return {
      ok:            raw.ok,
      skipped:       raw.skipped,
      timed_out:     raw.timed_out || false,
      http_status:   raw.http_status,
      error:         raw.error,
      result_status: resultStatus
    };
  }

  /* ══════════════════════════════════════════════════════════════════
     submitFormationOrder(payload)
     ──────────────────────────────────────────────────────────────────
     Purpose : POST a formation order to ORDER_WEBHOOK_URL.
     Called from :
       • wizard.html   — on Step 4 form submit (non-blocking, fire-and-forget)
       • checkout.html — on "Pagar ahora" click (awaited before Stripe redirect)
     Config  : window.CONFIG.ORDER_WEBHOOK_URL in /js/config.js

     Returns : Promise<{
       ok, skipped, timed_out, http_status, error,
       result_status: 'registered' | 'local_only' | 'sync_failed'
     }>

     ── TO UPGRADE THIS FUNCTION ─────────────────────────────────────
     Supabase Edge Function:
       const r = await fetch(SUPABASE_FUNCTION_URL, { method:'POST', body: JSON.stringify(payload), headers:{...} })
       return buildResult({ ok: r.ok, http_status: r.status, skipped:false, timed_out:false, error: r.ok ? null : 'HTTP '+r.status }, 'registered')

     Direct Supabase client (only safe in a backend / Edge Function):
       const { error } = await supabase.from('formation_orders').insert(payload)
       return buildResult({ ok: !error, skipped:false, timed_out:false, http_status:null, error: error?.message||null }, 'registered')
   ══════════════════════════════════════════════════════════════════ */
  async function submitFormationOrder(payload) {
    var url = (window.CONFIG && window.CONFIG.ORDER_WEBHOOK_URL)
      ? window.CONFIG.ORDER_WEBHOOK_URL.trim() : '';

    if (isTestMode()) {
      console.group('%c[CTE Persistence] submitFormationOrder()', 'color:#0A2540;font-weight:700');
      console.log('ORDER_WEBHOOK_URL :', url || '(not set — local_only)');
      console.log('Payload           :', JSON.parse(JSON.stringify(payload)));
      console.log('Test endpoint tip : paste a https://webhook.site URL into config.js → ORDER_WEBHOOK_URL');
      console.groupEnd();
    }

    if (!url) {
      var skippedResult = buildResult(
        { ok: false, http_status: null, skipped: true, timed_out: false, error: null },
        'registered'
      );
      if (isTestMode()) console.warn('[CTE Persistence] ORDER_WEBHOOK_URL not set → result_status: local_only');
      return skippedResult;
    }

    var raw    = await postJSON(url, payload);
    var result = buildResult(raw, 'registered');

    if (isTestMode()) {
      console.log('[CTE Persistence] submitFormationOrder →', result.result_status, result);
    }

    return result;
  }

  /* ══════════════════════════════════════════════════════════════════
     submitEinApplication(payload)
     ──────────────────────────────────────────────────────────────────
     Purpose : POST an EIN application to EIN_WEBHOOK_URL.
     Called from : ein-intake.html (awaited on form submit)
     Config  : window.CONFIG.EIN_WEBHOOK_URL in /js/config.js

     Returns : Promise<{
       ok, skipped, timed_out, http_status, error,
       result_status: 'submitted' | 'local_only' | 'sync_failed'
     }>

     ── TO UPGRADE THIS FUNCTION ─────────────────────────────────────
     Supabase Edge Function (same pattern as submitFormationOrder above,
     targeting the 'ein_applications' table).

     Airtable (via serverless proxy — DO NOT expose PAT in frontend):
       POST your-proxy.netlify.app/.netlify/functions/ein
       Proxy forwards to:
         POST https://api.airtable.com/v0/{BASE_ID}/EIN_Applications
         Authorization: Bearer {AIRTABLE_PAT}
         Body: { "fields": payload }
   ══════════════════════════════════════════════════════════════════ */
  async function submitEinApplication(payload) {
    var url = (window.CONFIG && window.CONFIG.EIN_WEBHOOK_URL)
      ? window.CONFIG.EIN_WEBHOOK_URL.trim() : '';

    if (isTestMode()) {
      console.group('%c[CTE Persistence] submitEinApplication()', 'color:#0A2540;font-weight:700');
      console.log('EIN_WEBHOOK_URL   :', url || '(not set — local_only)');
      console.log('Payload           :', JSON.parse(JSON.stringify(payload)));
      console.log('Test endpoint tip : paste a https://webhook.site URL into config.js → EIN_WEBHOOK_URL');
      console.groupEnd();
    }

    if (!url) {
      var skippedResult = buildResult(
        { ok: false, http_status: null, skipped: true, timed_out: false, error: null },
        'submitted'
      );
      if (isTestMode()) console.warn('[CTE Persistence] EIN_WEBHOOK_URL not set → result_status: local_only');
      return skippedResult;
    }

    var raw    = await postJSON(url, payload);
    var result = buildResult(raw, 'submitted');

    if (isTestMode()) {
      console.log('[CTE Persistence] submitEinApplication →', result.result_status, result);
    }

    return result;
  }

  /* ── Public API ───────────────────────────────────────────────────
     window.Persistence.submitFormationOrder(payload) → Promise<result>
     window.Persistence.submitEinApplication(payload) → Promise<result>

     Branch on result.result_status — never on result.ok or result.skipped:
       if (result.result_status === 'registered')  { ... }
       if (result.result_status === 'local_only')  { ... }
       if (result.result_status === 'sync_failed') { ... }
       if (result.result_status === 'submitted')   { ... }  ← EIN only
  */
  window.Persistence = {
    submitFormationOrder: submitFormationOrder,
    submitEinApplication: submitEinApplication
  };

}());
