'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Users, FileText, Activity, CreditCard, Shield, LogOut, Menu, X, ShoppingBag, Mail, Wrench, LayoutDashboard } from 'lucide-react'
import { Logo } from '@/components/logo'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

const NAV_ITEMS = [
  { href: '/admin',           label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/admin/clients',   label: 'Clients',     icon: Users },
  { href: '/admin/orders',    label: 'Orders',      icon: ShoppingBag },
  { href: '/admin/documents', label: 'Documents',   icon: FileText },
  { href: '/admin/addresses', label: 'Direcciones', icon: Mail },
  { href: '/admin/operations',label: 'Operations',  icon: Wrench },
  { href: '/admin/status',    label: 'Status',      icon: Activity },
  { href: '/admin/billing',   label: 'Billing',     icon: CreditCard },
]

interface AdminSidebarProps {
  userEmail?: string | null
}

export function AdminSidebar({ userEmail }: AdminSidebarProps) {
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

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center px-6 py-5 border-b bg-slate-900">
        <Logo height={32} invert />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 bg-slate-900">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom user section */}
      <div className="border-t border-slate-700 px-3 py-4 space-y-1 bg-slate-900">
        {userEmail && (
          <p className="px-3 text-xs text-slate-400 truncate mb-2">{userEmail}</p>
        )}
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-slate-300 hover:text-red-400 hover:bg-slate-800"
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
      {/* Mobile toggle */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden bg-slate-900 border border-slate-700 rounded-md p-2 shadow-sm"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? (
          <X className="h-5 w-5 text-white" />
        ) : (
          <Menu className="h-5 w-5 text-white" />
        )}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-700 shadow-xl transform transition-transform duration-200 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-slate-700 bg-slate-900">
        <SidebarContent />
      </div>
    </>
  )
}
