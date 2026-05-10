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

  // Pull every <style> block from the file (they live in <head>)
  const styles = (html.match(/<style[\s\S]*?<\/style>/gi) ?? []).join('')

  // Isolate the raw <body> content
  const bodyOpen = html.indexOf('<body>')
  const bodyClose = html.lastIndexOf('</body>')
  const rawBody = html.slice(
    bodyOpen !== -1 ? bodyOpen + '<body>'.length : 0,
    bodyClose !== -1 ? bodyClose : html.length,
  )

  // Extract <script> blocks so React doesn't silently discard them
  const scripts: string[] = []
  const bodyHtml = rawBody.replace(
    /<script\b[^>]*>([\s\S]*?)<\/script>/gi,
    (_, src) => { scripts.push(src); return '' },
  )

  return (
    <>
      <MarketingNav />
      <div
        dangerouslySetInnerHTML={{
          __html:
            // Landing page styles
            styles +
            // Hide embedded nav (MarketingNav replaces it) + duplicate WA float
            '<style>.nav{display:none!important}.wa-float{display:none!important}</style>' +
            bodyHtml,
        }}
      />
      {/* Re-inject landing scripts (tabs, FAQ accordion, hamburger) via Next.js Script */}
      <Script id="landing-js" strategy="afterInteractive">
        {scripts.join('\n')}
      </Script>
    </>
  )
}
