import type { Metadata } from 'next'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'EIN para Extranjeros sin SSN | CreaTuEmpresaUSA',
  description: 'Tramitamos tu EIN del IRS sin SSN ni visa. Desde cualquier país de Latinoamérica. Listo en 2-3 semanas.',
}

const FUNNEL = '/index_final.html?page=wizard'
const WA = 'https://wa.me/18669958013'

export default function EINExtranjeros() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Meta Pixel */}
      <Script id="meta-pixel-ein" strategy="afterInteractive">{`
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
        .ein-nav { background: #fff; border-bottom: 1px solid #E8E7E2; padding: 0 24px; height: 64px; display: flex; align-items: center; }
        .ein-nav a { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .ein-wordmark { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 15px; color: #2A3544; }
        .ein-wordmark span { color: #2CB98A; }
        .ein-hero { background: linear-gradient(135deg, #2A3544 0%, #1a2535 100%); color: #fff; padding: 80px 24px 72px; text-align: center; }
        .ein-eyebrow { font-size: 12px; font-weight: 700; color: #2CB98A; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 20px; }
        .ein-hero h1 { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(28px, 5vw, 48px); line-height: 1.15; margin-bottom: 20px; }
        .ein-hero p { font-size: 17px; color: rgba(255,255,255,0.78); max-width: 560px; margin: 0 auto 36px; line-height: 1.6; }
        .btn-primary { display: inline-block; background: #2CB98A; color: #fff; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; font-size: 16px; padding: 16px 36px; border-radius: 10px; text-decoration: none; transition: background 0.15s; }
        .btn-primary:hover { background: #24a87c; }
        .btn-block { display: block; text-align: center; margin-bottom: 12px; }
        .ein-section { max-width: 560px; margin: 0 auto; padding: 64px 24px; }
        .price-box { background: #fff; border: 2px solid #2CB98A; border-radius: 16px; padding: 40px 36px; text-align: center; }
        .price-label { font-size: 12px; font-weight: 700; color: #6B7A8D; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; }
        .price-amount { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 56px; color: #2A3544; line-height: 1; margin-bottom: 4px; }
        .price-currency { font-size: 24px; vertical-align: super; }
        .price-sub { font-size: 13px; color: #6B7A8D; margin-bottom: 32px; }
        .bullets { list-style: none; margin-bottom: 32px; display: flex; flex-direction: column; gap: 14px; text-align: left; }
        .bullets li { display: flex; align-items: center; gap: 12px; font-size: 15px; font-weight: 500; color: #2A3544; }
        .ck { width: 24px; height: 24px; background: #ecfdf5; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #2CB98A; font-weight: 800; font-size: 12px; flex-shrink: 0; }
        .btn-wa { display: flex; align-items: center; justify-content: center; gap: 8px; border: 2px solid #2CB98A; color: #2CB98A; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; font-size: 15px; padding: 14px 28px; border-radius: 10px; text-decoration: none; transition: all 0.15s; }
        .btn-wa:hover { background: #ecfdf5; }
        .footer-note { text-align: center; font-size: 12px; color: #6B7A8D; padding: 32px 24px; }
        .footer-note a { color: #6B7A8D; }
      `}</style>

      {/* Nav */}
      <nav className="ein-nav">
        <a href="/">
          <svg width="32" height="32" viewBox="0 0 64 64" fill="none" aria-hidden="true">
            <rect width="64" height="64" rx="16" fill="#111318"/>
            <rect x="0" y="27" width="64" height="10" fill="rgba(0,0,0,0.18)"/>
            <text x="32" y="46" fontFamily="Syne,sans-serif" fontWeight="800" fontSize="28" fill="white" textAnchor="middle" letterSpacing="-1">CTE</text>
          </svg>
          <span className="ein-wordmark">CreaTuEmpresa<span>USA</span></span>
        </a>
      </nav>

      {/* Hero */}
      <section className="ein-hero">
        <p className="ein-eyebrow">Número fiscal federal · IRS</p>
        <h1>Obtén tu EIN del IRS<br/>sin SSN ni visa</h1>
        <p>Tramitamos tu número fiscal federal directamente con el IRS. Sin SSN, sin viajar, desde cualquier país de Latinoamérica.</p>
        <a href={FUNNEL} className="btn-primary">Obtener mi EIN ahora →</a>
      </section>

      {/* Price box */}
      <div className="ein-section">
        <div className="price-box">
          <p className="price-label">Servicio EIN para no residentes</p>
          <p className="price-amount"><span className="price-currency">$</span>99</p>
          <p className="price-sub">USD · pago único</p>
          <ul className="bullets">
            <li><span className="ck">✓</span>Sin SSN requerido</li>
            <li><span className="ck">✓</span>Listo en 2–3 semanas</li>
            <li><span className="ck">✓</span>Comunicación en español</li>
          </ul>
          <a href={FUNNEL} className="btn-primary btn-block">Obtener mi EIN ahora →</a>
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
