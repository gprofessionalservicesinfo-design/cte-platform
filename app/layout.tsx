import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { GoogleAnalytics } from '@next/third-parties/google'

const inter = Inter({ subsets: ['latin'] })

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
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster richColors position="top-right" />
        <GoogleAnalytics gaId="G-5Y7CX5NXJQ" />
      </body>
    </html>
  )
}
