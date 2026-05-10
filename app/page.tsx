import { readFileSync } from 'fs'
import { join } from 'path'
import Script from 'next/script'
import { MarketingNav } from '@/components/marketing/marketing-nav'
import type { Metadata } from 'next'

// Force SSR — prevents Vercel from serving stale static output
export const dynamic = 'force-dynamic'

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

  // Pull every <style> block from the file (they live in <head>)
  const styles = (html.match(/<style[\s\S]*?<\/style>/gi) ?? []).join('')

  // Isolate raw <body> content
  const bodyOpen  = html.indexOf('<body>')
  const bodyClose = html.lastIndexOf('</body>')
  const rawBody = html.slice(
    bodyOpen  !== -1 ? bodyOpen  + '<body>'.length : 0,
    bodyClose !== -1 ? bodyClose : html.length,
  )

  // Strip elements that MarketingNav replaces or duplicates.
  // Regex is more resilient than indexOf against whitespace / attribute variations.
  const bodyClean = rawBody
    // Remove the entire embedded <header> (nav + mobile menu)
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    // Remove the landing's own floating WA button (targets aria-label; no class attr on this element)
    .replace(/<a\b[^>]+aria-label="Contactar por WhatsApp"[\s\S]*?<\/a>/i, '')

  // Lift <script> blocks out — React silently drops them inside dangerouslySetInnerHTML
  const scripts: string[] = []
  const bodyHtml = bodyClean.replace(
    /<script\b[^>]*>([\s\S]*?)<\/script>/gi,
    (_, src) => { scripts.push(src); return '' },
  )

  // Guard hamburger init: #hamburger no longer exists after header removal.
  // Adding an early return prevents a TypeError that would also kill tabs + FAQ scripts.
  const scriptContent = scripts.join('\n').replace(
    "var btn = document.getElementById('hamburger');",
    "var btn = document.getElementById('hamburger'); if (!btn) return;",
  )

  return (
    <>
      <MarketingNav />
      <div
        dangerouslySetInnerHTML={{ __html: styles + bodyHtml }}
      />
      <Script id="landing-js" strategy="afterInteractive">
        {scriptContent}
      </Script>
    </>
  )
}
