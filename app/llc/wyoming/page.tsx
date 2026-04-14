import type { Metadata } from 'next'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'LLC Wyoming para Extranjeros | CreaTuEmpresaUSA',
  description: 'Abre tu LLC en Wyoming desde cualquier país. Sin impuesto estatal, máxima privacidad. EIN + Registered Agent incluidos.',
}

const FUNNEL = '/index_final.html?page=wizard'
const WA = 'https://wa.me/18669958013'

export default function LLCWyoming() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Meta Pixel */}
      <Script id="meta-pixel-wy" strategy="afterInteractive">{`
        !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
        n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
        (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
        fbq('init','1354633353137315');fbq('track','PageView');
      `}</Script>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: #FAFAF7; color: #2A3544; }
        .wy-nav { background: #fff; border-bottom: 1px solid #E8E7E2; padding: 0 24px; height: 64px; display: flex; align-items: center; }
        .wy-nav a { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .wy-wordmark { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 15px; color: #2A3544; }
        .wy-wordmark span { color: #2CB98A; }
        .wy-hero { background: linear-gradient(135deg, #2A3544 0%, #1a2535 100%); color: #fff; padding: 80px 24px 72px; text-align: center; }
        .wy-eyebrow { font-size: 12px; font-weight: 700; color: #4DB39A; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 20px; }
        .wy-hero h1 { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(28px, 5vw, 48px); line-height: 1.15; margin-bottom: 20px; }
        .wy-hero p { font-size: 17px; color: rgba(255,255,255,0.78); max-width: 560px; margin: 0 auto 36px; line-height: 1.6; }
        .btn-primary { display: inline-block; background: #2CB98A; color: #fff; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; font-size: 16px; padding: 16px 36px; border-radius: 10px; text-decoration: none; transition: background 0.15s; }
        .btn-primary:hover { background: #24a87c; }
        .btn-block { display: block; text-align: center; margin-bottom: 12px; }
        .wy-section { max-width: 560px; margin: 0 auto; padding: 64px 24px; }
        .price-box { background: #fff; border: 2px solid #2CB98A; border-radius: 16px; padding: 40px 36px; text-align: center; }
        .price-label { font-size: 12px; font-weight: 700; color: #6B7A8D; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; }
        .price-from { font-size: 14px; color: #6B7A8D; font-weight: 600; margin-bottom: 4px; }
        .price-amount { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 56px; color: #2A3544; line-height: 1; margin-bottom: 4px; }
        .price-currency { font-size: 24px; vertical-align: super; }
        .price-sub { font-size: 13px; color: #6B7A8D; margin-bottom: 32px; }
        .bullets { list-style: none; margin-bottom: 32px; display: flex; flex-direction: column; gap: 14px; text-align: left; }
        .bullets li { display: flex; align-items: center; gap: 12px; font-size: 15px; font-weight: 500; color: #2A3544; }
        .ck { width: 24px; height: 24px; background: #ecfdf5; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #2CB98A; font-weight: 800; font-size: 12px; flex-shrink: 0; }
        .badge-strip { display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; margin-bottom: 28px; }
        .badge { background: #F0EFE9; color: #6B7A8D; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; letter-spacing: 0.5px; }
        .btn-wa { display: flex; align-items: center; justify-content: center; gap: 8px; border: 2px solid #2CB98A; color: #2CB98A; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; font-size: 15px; padding: 14px 28px; border-radius: 10px; text-decoration: none; transition: all 0.15s; }
        .btn-wa:hover { background: #ecfdf5; }
        .footer-note { text-align: center; font-size: 12px; color: #6B7A8D; padding: 32px 24px; }
        .footer-note a { color: #6B7A8D; }
      `}</style>

      {/* Nav */}
      <nav className="wy-nav">
        <a href="/">
          <svg width="32" height="32" viewBox="0 0 64 64" fill="none" aria-hidden="true">
            <rect width="64" height="64" rx="16" fill="#111318"/>
            <rect x="0" y="27" width="64" height="10" fill="rgba(0,0,0,0.18)"/>
            <text x="32" y="46" fontFamily="Syne,sans-serif" fontWeight="800" fontSize="28" fill="white" textAnchor="middle" letterSpacing="-1">CTE</text>
          </svg>
          <span className="wy-wordmark">CreaTuEmpresa<span>USA</span></span>
        </a>
      </nav>

      {/* Hero */}
      <section className="wy-hero">
        <p className="wy-eyebrow">LLC · Wyoming · Sin impuesto estatal</p>
        <h1>Abre tu LLC en Wyoming<br/>desde cualquier país</h1>
        <p>Sin impuesto estatal, máxima privacidad, ideal para negocios digitales y e-commerce desde LATAM.</p>
        <a href={FUNNEL} className="btn-primary">Abrir mi LLC Wyoming →</a>
      </section>

      {/* Price box */}
      <div className="wy-section">
        <div className="price-box">
          <p className="price-label">Formación LLC Wyoming</p>
          <p className="price-from">desde</p>
          <p className="price-amount"><span className="price-currency">$</span>149</p>
          <p className="price-sub">USD · pago único</p>
          <div className="badge-strip">
            <span className="badge">Wyoming</span>
            <span className="badge">Sin SSN</span>
            <span className="badge">100% remoto</span>
          </div>
          <ul className="bullets">
            <li><span className="ck">✓</span>Sin impuesto estatal en Wyoming</li>
            <li><span className="ck">✓</span>Listo en 5–7 días hábiles</li>
            <li><span className="ck">✓</span>EIN + Registered Agent incluidos</li>
          </ul>
          <a href={FUNNEL} className="btn-primary btn-block">Abrir mi LLC Wyoming →</a>
          <a href={WA} className="btn-wa">💬 Preguntar por WhatsApp</a>
        </div>
      </div>

      <p className="footer-note">
        © {new Date().getFullYear()} CreaTuEmpresaUSA ·{' '}
        <a href="/privacidad">Privacidad</a>
      </p>
    </>
  )
}
