'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw, CheckCircle2 } from 'lucide-react'

interface ResendWelcomeBtnProps {
  companyId: string
}

export function ResendWelcomeBtn({ companyId }: ResendWelcomeBtnProps) {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleResend() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/resend-welcome/${companyId}`, { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Error')
      setSent(true)
      setTimeout(() => setSent(false), 4000)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={handleResend}
        disabled={loading}
        className={sent ? 'border-green-500 text-green-600' : ''}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
        ) : sent ? (
          <CheckCircle2 className="h-4 w-4 mr-1.5 text-green-600" />
        ) : (
          <RefreshCw className="h-4 w-4 mr-1.5" />
        )}
        {sent ? 'Email enviado' : 'Reenviar bienvenida'}
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
