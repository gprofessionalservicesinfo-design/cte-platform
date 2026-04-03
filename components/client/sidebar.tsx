'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Logo } from '@/components/logo'
import {
  LayoutDashboard,
  FileText,
  Mail,
  Building2,
  CreditCard,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/documents', label: 'Documents', icon: FileText, exact: false },
  { href: '/dashboard/mail', label: 'Mail', icon: Mail, exact: false },
  { href: '/dashboard/company', label: 'Company', icon: Building2, exact: false },
  { href: '/dashboard/billing', label: 'Billing', icon: CreditCard, exact: false },
]

interface SidebarProps {
  companyName?: string | null
  userEmail?: string | null
}

export function ClientSidebar({ companyName, userEmail }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center px-6 py-5 border-b">
        <Logo height={32} />
      </div>

      {/* Company Name */}
      {companyName && (
        <div className="px-6 py-3 bg-gray-50 border-b">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Company</p>
          <p className="text-sm font-semibold text-gray-800 truncate">{companyName}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom user section */}
      <div className="border-t px-3 py-4 space-y-1">
        {userEmail && (
          <p className="px-3 text-xs text-gray-400 truncate mb-2">{userEmail}</p>
        )}
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-gray-600 hover:text-red-600 hover:bg-red-50"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          <LogOut className="h-4 w-4" />
          {loggingOut ? 'Signing out…' : 'Sign out'}
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden bg-white border rounded-md p-2 shadow-sm"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-white border-r shadow-lg transform transition-transform duration-200 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r bg-white">
        <SidebarContent />
      </div>
    </>
  )
}
