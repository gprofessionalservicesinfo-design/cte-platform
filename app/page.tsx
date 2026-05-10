import { readFileSync } from 'fs'
import { join } from 'path'
import Script from 'next/script'
import { MarketingNav } from '@/components/marketing/marketing-nav'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CreaTuEmpresaUSA — Forma tu LLC en EE.UU. desde cualquier país',
  description:
    'Forma tu LLC o Corporation en Estados Unidos sin visa, sin SSN, sin viajar. Proceso 100% en español. Starter desde $499.',
}

export default function Home() {
  const html = readFileSync(
    join(process.cwd(), 'public', 'landing_production.html'),
    'utf-8',
  )

  // Extract <style> blocks from <head>
  const styles = (html.match(/<style[\s\S]*?<\/style>/gi) ?? []).join('')

  // Isolate raw <body> content
  const bodyOpen  = html.indexOf('<body>')
  const bodyClose = html.lastIndexOf('</body>')
  const rawBody = html.slice(
    bodyOpen  !== -1 ? bodyOpen  + '<body>'.length : 0,
    bodyClose !== -1 ? bodyClose : html.length,
  )

  // Slice off the embedded <header> entirely (one </header> exists at line 1378).
  // MarketingNav above replaces it — no CSS trickery needed.
  const headerEnd = rawBody.indexOf('</header>')
  const bodyWithoutNav = headerEnd !== -1
    ? rawBody.slice(headerEnd + '</header>'.length)
    : rawBody

  // Lift <script> blocks out — React discards them in dangerouslySetInnerHTML
  const scripts: string[] = []
  const bodyHtml = bodyWithoutNav.replace(
    /<script\b[^>]*>([\s\S]*?)<\/script>/gi,
    (_, src) => { scripts.push(src); return '' },
  )

  // Guard hamburger init: element no longer exists after nav removal.
  // Replacing this exact string lets the IIFE return early instead of
  // throwing a TypeError that would also kill the tabs + FAQ accordion.
  const scriptContent = scripts.join('\n').replace(
    "var btn = document.getElementById('hamburger');",
    "var btn = document.getElementById('hamburger'); if (!btn) return;",
  )

  return (
    <>
      <MarketingNav />
      <div
        dangerouslySetInnerHTML={{
          __html:
            styles +
            // Hide the landing's own floating WA (MarketingNav has one already)
            '<style>.wa-float{display:none!important}</style>' +
            bodyHtml,
        }}
      />
      {/* Execute landing JS (tabs, FAQ) after React hydration */}
      <Script id="landing-js" strategy="afterInteractive">
        {scriptContent}
      </Script>
    </>
  )
}
