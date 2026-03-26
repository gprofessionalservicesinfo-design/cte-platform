/* ═══════════════════════════════════════════════════════════════
   CreaTuEmpresaUSA — chat.js
   AI chat widget for Águila assistant.
   Depends on: config.js (window.CONFIG)
   ═══════════════════════════════════════════════════════════════ */

window.ChatModule = (function () {

  /* ── Quick question presets ──────────────────────────────────── */
  const QUICK_QUESTIONS = [
    '¿Puedo abrir LLC sin vivir en EE.UU.?',
    '¿Qué estado es mejor para mí?',
    '¿Necesito SSN o ITIN?',
    '¿Cuánto tarda el EIN?',
    '¿Qué paquete me recomiendas?',
    '¿Puedo abrir cuenta bancaria?'
  ];

  /* ── Keyword-based fallback answers ─────────────────────────── */
  const ANSWERS = {
    llc: '¡Excelente elección! Una LLC te da protección de activos, flexibilidad fiscal y reconocimiento global. La forma más popular para emprendedores extranjeros. ✅',
    corporation: 'La C-Corporation en Delaware es perfecta si planeas levantar capital VC, emitir acciones o participar en aceleradoras como Y Combinator. 🏛️',
    ein: 'El EIN es el número fiscal federal de tu empresa. Sin él no puedes abrir cuenta bancaria ni usar Stripe. Lo tramitamos sin SSN en 2–4 semanas. 🔢',
    ssn: '¡No necesitas SSN! Solo tu pasaporte vigente. El EIN lo tramitamos con poder notarial ante el IRS. 100% remoto. 🎉',
    visa: 'No necesitas visa ni viajar. El proceso es 100% remoto desde tu país. Solo tu pasaporte escaneado y listo. 🌐',
    tiempo: 'LLC: 3–7 días hábiles. EIN del IRS: 2–4 semanas. En total, ~5–6 semanas para tener todo listo. ⏱️',
    precio: 'Starter $299 (LLC básica), Professional $499 (LLC + EIN, el más popular ⭐), Premium $799 (todo incluido + banca). Ver planes → /precios.html 💰',
    banco: 'Con LLC + EIN puedes abrir Mercury, Relay o Brex 100% online. Cuentas reales con seguro FDIC, acceso a Stripe, PayPal y transferencias wire. 🏦',
    wyoming: 'Wyoming: ~$62/año, máxima privacidad, sin impuesto estatal. Ideal para freelancers, consultores y negocios digitales. 🤠',
    delaware: 'Delaware es el favorito de Silicon Valley. Leyes corporativas más avanzadas, Court of Chancery, y reconocimiento global. Ideal para startups y VC. 🏆',
    florida: 'Florida: sin impuesto personal, hub de negocios latinos (Miami), ideal si planeas presencia física o tienes clientes en el sur de EE.UU. ☀️',
    newmexico: 'New Mexico: $50 de formación y $0 de costo anual (sin reporte anual). La opción más económica de EE.UU. 🌵',
    nevada: 'Nevada: sin impuesto corporativo ni personal estatal, alta privacidad. Alternativa a Wyoming aunque con costo anual más alto (~$350/año). 🎰',
    impuesto: 'Una LLC de dueño extranjero sin actividad en EE.UU. generalmente tributa en tu país de residencia. Pero debes presentar el Form 5472 al IRS anualmente. 💸',
    stripe: 'Con LLC + EIN + cuenta bancaria puedes abrir Stripe, PayPal Business, Amazon Seller o Shopify Payments sin restricciones. 💳',
    amazon: 'Para vender en Amazon USA necesitas: LLC, EIN y cuenta bancaria americana. Te ayudamos con todo en el Plan Professional o Premium. 📦',
    default: [
      'Gran pregunta. Para una respuesta precisa según tu situación específica, agenda una consulta gratuita: /contacto.html 📅',
      'Entiendo tu duda. Hemos ayudado a +500 emprendedores latinoamericanos. ¿Te contactamos por WhatsApp para asesorarte? 📱',
      'Cada caso es único. Nuestro equipo puede orientarte en minutos. ¿Quieres que te llamemos o prefieres WhatsApp? 🦅'
    ]
  };

  let defaultIdx = 0;

  /* ── XSS protection ──────────────────────────────────────────── */
  function escHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ── Keyword matching ────────────────────────────────────────── */
  function matchAnswer(text) {
    const low = text.toLowerCase();
    if (/\bllc\b/.test(low))                                         return ANSWERS.llc;
    if (/corp|corporation|c-corp/.test(low))                         return ANSWERS.corporation;
    if (/\bein\b/.test(low))                                         return ANSWERS.ein;
    if (/ssn|seguro social|itin/.test(low))                          return ANSWERS.ssn;
    if (/visa/.test(low))                                            return ANSWERS.visa;
    if (/cuánto tarda|tiempo|días|demora|semana/.test(low))          return ANSWERS.tiempo;
    if (/precio|costo|cuánto cuesta|paquete/.test(low))              return ANSWERS.precio;
    if (/banco|mercury|relay|brex|cuenta bancaria/.test(low))        return ANSWERS.banco;
    if (/wyoming/.test(low))                                         return ANSWERS.wyoming;
    if (/delaware/.test(low))                                        return ANSWERS.delaware;
    if (/florida/.test(low))                                         return ANSWERS.florida;
    if (/new mexico|nuevo méxico/.test(low))                         return ANSWERS.newmexico;
    if (/nevada/.test(low))                                          return ANSWERS.nevada;
    if (/impuesto|tax|5472|fiscal/.test(low))                        return ANSWERS.impuesto;
    if (/stripe|paypal|procesador/.test(low))                        return ANSWERS.stripe;
    if (/amazon|fba|seller/.test(low))                               return ANSWERS.amazon;
    const def = ANSWERS.default[defaultIdx % ANSWERS.default.length];
    defaultIdx++;
    return def;
  }

  /* ── DOM helpers ─────────────────────────────────────────────── */
  function createMsg(html, role) {
    const d = document.createElement('div');
    d.className = `cmsg ${role}`;
    d.innerHTML = `<div class="cb">${html}</div><div class="ct">${role === 'bot' ? 'Águila' : 'Tú'} · Ahora</div>`;
    return d;
  }

  function createTyping() {
    const d = document.createElement('div');
    d.className = 'cmsg bot typing-msg';
    d.innerHTML = '<div class="cb"><div class="typing"><s></s><s></s><s></s></div></div>';
    return d;
  }

  /* ── Try real API, fallback to local ─────────────────────────── */
  async function getResponse(text) {
    const apiUrl = window.CONFIG && window.CONFIG.OPENAI_API_PROXY_URL;
    if (!apiUrl || apiUrl === '/api/chat') {
      // Proxy not configured — use keyword fallback
      return matchAnswer(text);
    }
    try {
      const resp = await fetch(apiUrl, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: text, context: 'llc_usa' })
      });
      if (!resp.ok) throw new Error('API error');
      const json = await resp.json();
      return json.reply || json.message || matchAnswer(text);
    } catch {
      return matchAnswer(text);
    }
  }

  /* ── Core send function ──────────────────────────────────────── */
  async function sendMessage(inputEl, msgsEl) {
    if (!inputEl || !msgsEl) return;
    const text = inputEl.value.trim();
    if (!text) return;
    inputEl.value = '';
    inputEl.disabled = true;

    // Append user message
    msgsEl.appendChild(createMsg(escHtml(text), 'usr'));

    // Show typing
    const typing = createTyping();
    msgsEl.appendChild(typing);
    msgsEl.scrollTop = msgsEl.scrollHeight;

    // Get response (with small minimum delay for UX)
    const [response] = await Promise.all([
      getResponse(text),
      new Promise(r => setTimeout(r, 800))
    ]);

    typing.remove();
    msgsEl.appendChild(createMsg(response, 'bot'));
    msgsEl.scrollTop = msgsEl.scrollHeight;
    inputEl.disabled = false;
    inputEl.focus();
  }

  /* ── Init quick questions ────────────────────────────────────── */
  function initQuickQuestions(container, inputEl, msgsEl) {
    if (!container) return;
    QUICK_QUESTIONS.forEach(q => {
      const btn = document.createElement('button');
      btn.className = 'quick-q';
      btn.textContent = q;
      btn.onclick = () => {
        inputEl.value = q;
        sendMessage(inputEl, msgsEl);
      };
      container.appendChild(btn);
    });
  }

  /* ── Public: sendChat (called from HTML onclick) ─────────────── */
  function sendChat() {
    const inputEl = document.getElementById('mainChatInput');
    const msgsEl  = document.getElementById('chatMsgs');
    sendMessage(inputEl, msgsEl);
  }

  /* ── Init all chat widgets on the page ───────────────────────── */
  function init() {
    // Main chat (index.html)
    const inputEl   = document.getElementById('mainChatInput');
    const msgsEl    = document.getElementById('chatMsgs');
    const quicksEl  = document.getElementById('chatQuicks');

    if (inputEl && msgsEl) {
      initQuickQuestions(quicksEl, inputEl, msgsEl);
      inputEl.addEventListener('keydown', e => {
        if (e.key === 'Enter') sendMessage(inputEl, msgsEl);
      });
    }

    // Floating chat widget (if present on other pages)
    const floatInput = document.getElementById('floatChatInput');
    const floatMsgs  = document.getElementById('floatChatMsgs');
    const floatQuick = document.getElementById('floatChatQuicks');
    if (floatInput && floatMsgs) {
      initQuickQuestions(floatQuick, floatInput, floatMsgs);
      floatInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') sendMessage(floatInput, floatMsgs);
      });
    }
  }

  /* ── Toggle floating chat ────────────────────────────────────── */
  function toggleFloatChat() {
    const widget = document.getElementById('floatChatWidget');
    if (!widget) return;
    const isOpen = widget.classList.toggle('open');
    const btn = document.getElementById('floatChatBtn');
    if (btn) btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }

  // Expose for HTML onclick
  window.sendChat        = sendChat;
  window.toggleFloatChat = toggleFloatChat;

  return { init, sendChat, toggleFloatChat, sendMessage };

})();
