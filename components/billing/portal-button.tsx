'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ExternalLink, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface PortalButtonProps {
  label?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
}

export function PortalButton({
  label = 'Manage Billing',
  variant = 'default',
  size = 'default',
}: PortalButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/create-portal', { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to open billing portal')
      }
      const { url } = await res.json()
      window.location.href = url
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <Button variant={variant} size={size} onClick={handleClick} disabled={loading}>
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Opening…
        </>
      ) : (
        <>
          <ExternalLink className="mr-2 h-4 w-4" />
          {label}
        </>
      )}
    </Button>
  )
}
