'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

export default function ResetPasswordPage() {
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [error, setError]         = useState<string | null>(null)
  const [loading, setLoading]     = useState(false)
  const [success, setSuccess]     = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => {
      window.location.replace('/dashboard')
    }, 2000)
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Crea tu contraseña</h2>
        <p className="mt-1 text-sm text-gray-500">
          Establece una contraseña para acceder a tu portal de cliente.
        </p>
      </div>

      {success ? (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm text-center">
          ✅ Contraseña creada. Redirigiendo a tu portal...
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="password">Nueva contraseña</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirmar contraseña</Label>
              <Input
                id="confirm"
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repite tu contraseña"
                disabled={loading}
              />
            </div>

            <Button type=
mkdir -p app/\(auth\)/reset-password && cat > app/\(auth\)/reset-password/page.tsx << 'HEREDOC'
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return }
    if (password.length < 8)  { setError('Mínimo 8 caracteres.'); return }
    setLoading(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) { setError(updateError.message); setLoading(false); return }
    setSuccess(true)
    setTimeout(() => { window.location.replace('/dashboard') }, 2000)
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Crea tu contraseña</h2>
        <p className="mt-1 text-sm text-gray-500">Establece una contraseña para acceder a tu portal.</p>
      </div>
      {success ? (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm text-center">
          ✅ Contraseña creada. Redirigiendo a tu portal...
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="password">Nueva contraseña</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" disabled={loading} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirmar contraseña</Label>
              <Input id="confirm" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repite tu contraseña" disabled={loading} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</> : 'Crear contraseña y entrar al portal'}
            </Button>
          </form>
        </>
      )}
    </div>
  )
}
