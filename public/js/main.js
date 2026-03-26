/* ═══════════════════════════════════════════════════════════════
   CreaTuEmpresaUSA — main.js
   Core UI: nav, reveal, FAQ accordion, language toggle, year.
   Config is in config.js. Forms in forms.js. Chat in chat.js.
   Pricing/WhatsApp in pricing.js. States in states.js.
   ═══════════════════════════════════════════════════════════════ */

/* ── ACTIVE NAV LINK ─────────────────────────────────────────── */
function initActiveNav() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  const pageMap = {
    '/':                   'home',
    '/index.html':         'home',
    '/como-funciona.html': 'como-funciona',
    '/servicios.html':     'servicios',
    '/precios.html':       'precios',
    '/guias.html':         'guias',
    '/blog.html':          'blog',
    '/testimonios.html':   'testimonios',
    '/faq.html':           'faq',
    '/contacto.html':      'contacto',
    '/wizard.html':        'precios'
  };
  const currentPage = pageMap[path] || '';
  document.querySelectorAll('.nav-link[data-page]').forEach(link => {
    link.classList.toggle('active', link.dataset.page === currentPage);
  });
}

/* ── NAVBAR SCROLL ───────────────────────────────────────────── */
function initNavScroll() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

/* ── MOBILE NAV ──────────────────────────────────────────────── */
function toggleMNav() {
  const mnav   = document.getElementById('mnav');
  const burger = document.getElementById('burger');
  if (!mnav || !burger) return;
  const isOpen = mnav.classList.toggle('open');
  burger.classList.toggle('open', isOpen);
  burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  burger.setAttribute('aria-label',    isOpen ? 'Cerrar menú' : 'Abrir menú');
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

function closeMNav() {
  const mnav   = document.getElementById('mnav');
  const burger = document.getElementById('burger');
  if (!mnav || !burger) return;
  mnav.classList.remove('open');
  burger.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');
  burger.setAttribute('aria-label',    'Abrir menú');
  document.body.style.overflow = '';
}

window.toggleMNav = toggleMNav;
window.closeMNav  = closeMNav;

/* ── LANGUAGE TOGGLE ─────────────────────────────────────────── */
let currentLang = localStorage.getItem('cte_lang') || 'es';

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('cte_lang', lang);
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.textContent.toLowerCase() === lang);
  });
  document.querySelectorAll(`[data-${lang}]`).forEach(el => {
    const t = el.getAttribute(`data-${lang}`);
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.placeholder = t;
    else el.innerHTML = t;
  });
  document.documentElement.lang = lang;
}

function initLang() {
  if (currentLang !== 'es') setLang(currentLang);
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.textContent.toLowerCase() === currentLang);
  });
}

window.setLang = setLang;

/* ── FAQ ACCORDION ───────────────────────────────────────────── */
function doFaq(btn) {
  const item = btn.closest('.faq-item');
  if (!item) return;
  const wasOpen = item.classList.contains('open');
  // Close all
  document.querySelectorAll('.faq-item.open').forEach(i => {
    i.classList.remove('open');
    const q = i.querySelector('.faq-q');
    if (q) q.setAttribute('aria-expanded', 'false');
  });
  // Open clicked if it was closed
  if (!wasOpen) {
    item.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
  }
}

window.doFaq = doFaq;

/* ── SCROLL REVEAL ───────────────────────────────────────────── */
function initReveal() {
  const els = document.querySelectorAll('.rv:not(.in)');
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
  els.forEach(el => obs.observe(el));
}

window.initReveal = initReveal;

/* ── DYNAMIC FOOTER YEAR ─────────────────────────────────────── */
function initYear() {
  const yr = new Date().getFullYear();
  document.querySelectorAll('.footer-year').forEach(el => {
    el.textContent = yr;
  });
}

/* ── KEYBOARD ACCESSIBILITY ──────────────────────────────────── */
function initKeyboard() {
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMNav();
  });
  // Close mobile nav when clicking outside
  document.addEventListener('click', e => {
    const mnav = document.getElementById('mnav');
    const burger = document.getElementById('burger');
    if (mnav && mnav.classList.contains('open')) {
      if (!mnav.contains(e.target) && !burger.contains(e.target)) {
        closeMNav();
      }
    }
  });
}

/* ── DYNAMIC FAQ from JSON ───────────────────────────────────── */
async function initDynamicFAQ() {
  const container = document.getElementById('faqDynamic');
  const searchEl  = document.getElementById('faqSearch');
  const filterEl  = document.getElementById('faqFilter');
  if (!container) return;

  let faqData = null;
  try {
    const resp = await fetch('/data/faqs.json');
    faqData = await resp.json();
  } catch {
    container.innerHTML = '<p style="color:var(--gray-500)">No se pudieron cargar las preguntas. <a href="/contacto.html">Contáctanos directamente.</a></p>';
    return;
  }

  let currentCat = 'all';
  let searchTerm = '';

  function renderFAQs() {
    const items = faqData.faqs.filter(f => {
      const matchCat  = currentCat === 'all' || f.category === currentCat;
      const matchSearch = !searchTerm ||
        f.question.toLowerCase().includes(searchTerm) ||
        f.answer.toLowerCase().includes(searchTerm);
      return matchCat && matchSearch;
    });

    if (!items.length) {
      container.innerHTML = `<p style="text-align:center;color:var(--gray-500);padding:40px 0">
        No encontramos resultados para "${searchTerm}". <a href="/contacto.html">Pregúntanos directamente →</a>
      </p>`;
      return;
    }

    container.innerHTML = items.map(f => `
      <div class="faq-item" data-id="${f.id}">
        <button class="faq-q" onclick="doFaq(this)" aria-expanded="false">
          ${f.question}
          <span class="faq-icon" aria-hidden="true">+</span>
        </button>
        <div class="faq-a"><p>${f.answer}</p></div>
      </div>`).join('');

    initReveal();
  }

  // Render categories
  if (filterEl && faqData.categories) {
    filterEl.innerHTML = faqData.categories.map(cat => `
      <button class="faq-filter-btn ${cat.id === 'all' ? 'active' : ''}"
              data-cat="${cat.id}">${cat.label}</button>`).join('');

    filterEl.addEventListener('click', e => {
      const btn = e.target.closest('.faq-filter-btn');
      if (!btn) return;
      currentCat = btn.dataset.cat;
      filterEl.querySelectorAll('.faq-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderFAQs();
    });
  }

  // Search
  if (searchEl) {
    searchEl.addEventListener('input', () => {
      searchTerm = searchEl.value.trim().toLowerCase();
      renderFAQs();
    });
  }

  renderFAQs();
}

/* ── DYNAMIC BLOG from JSON ──────────────────────────────────── */
async function initDynamicBlog() {
  const grid = document.getElementById('blogDynamic');
  if (!grid) return;

  let blogData = null;
  try {
    const resp = await fetch('/data/blog.json');
    blogData = await resp.json();
  } catch {
    return;
  }

  grid.innerHTML = blogData.posts.map((post, i) => `
    <article class="blog-card rv ${i > 0 ? 'rv-d' + Math.min(i, 4) : ''}">
      <div class="blog-thumb" aria-hidden="true" style="font-size:44px">${post.emoji}</div>
      <div class="blog-body">
        <div class="blog-cat">${post.category}</div>
        <h2 class="blog-title">${post.title}</h2>
        <p class="blog-desc">${post.excerpt}</p>
        <div class="blog-meta"><span>${post.date_display}</span><span>·</span><span>${post.read_time} min de lectura</span></div>
        <a href="/contacto.html" class="blog-read">Leer artículo →</a>
      </div>
    </article>`).join('');

  initReveal();
}

/* ── INIT ────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initActiveNav();
  initNavScroll();
  initReveal();
  initLang();
  initYear();
  initKeyboard();

  // Module inits (each module checks for its own elements)
  if (window.PricingModule) window.PricingModule.init();
  if (window.FormsModule)   window.FormsModule.init();
  if (window.ChatModule)    window.ChatModule.init();
  if (window.StatesModule)  window.StatesModule.init();

  // Page-specific
  initDynamicFAQ();
  initDynamicBlog();
});
