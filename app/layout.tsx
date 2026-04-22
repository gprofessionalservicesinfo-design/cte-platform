import type { Metadata } from 'next'
import { Syne, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { GoogleAnalytics } from '@next/third-parties/google'
import Script from 'next/script'
import DisclaimerFooter from '@/components/legal/DisclaimerFooter'
import LegalConsentBanner from '@/components/legal/LegalConsentBanner'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'CTE Platform - LLC Formation Dashboard',
  description: 'Manage your US company formation with CreaTuEmpresaUSA',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${syne.variable} ${plusJakarta.variable}`}>
        {children}
        <Toaster richColors position="top-right" />
        <DisclaimerFooter />
        <LegalConsentBanner />
        <GoogleAnalytics gaId="G-5Y7CX5NXJQ" />
        {/* Meta Pixel — global, loads on all Next.js pages */}
        <Script id="meta-pixel-global" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
          n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
          (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init','1354633353137315');fbq('track','PageView');
        `}</Script>
      </body>
    </html>
  )
}
