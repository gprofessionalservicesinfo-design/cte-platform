'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Mail, X } from 'lucide-react'

interface SendEmailModalProps {
  clientEmail: string
  clientName: string
  companyId: string
}

export function SendEmailModal({ clientEmail, clientName, companyId }: SendEmailModalProps) {
  const [open, setOpen] = useState(false)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null)

  async function handleSend() {
    if (!subject.trim() || !body.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/send-client-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: clientEmail, name: clientName, subject, body, companyId }),
      })
      const json = await res.json()
      if (res.ok) {
        setResult({ ok: true, msg: 'Email enviado correctamente.' })
        setSubject('')
        setBody('')
      } else {
        setResult({ ok: false, msg: json.error ?? 'Error al enviar.' })
      }
    } catch {
      setResult({ ok: false, msg: 'Error de red.' })
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => { setResult(null); setOpen(true) }}>
        <Mail className="h-4 w-4 mr-1.5" />
        Enviar email
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-semibold text-gray-900">Enviar email al cliente</h2>
          <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <Label className="text-xs text-gray-500">Para</Label>
            <p className="text-sm font-medium text-gray-900">{clientName} &lt;{clientEmail}&gt;</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email-subject">Asunto</Label>
            <Input
              id="email-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Actualización sobre tu caso…"
              disabled={loading}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email-body">Mensaje</Label>
            <textarea
              id="email-body"
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Escribe el mensaje aquí…"
              disabled={loading}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          {result && (
            <p className={`text-sm ${result.ok ? 'text-green-600' : 'text-red-600'}`}>
              {result.msg}
            </p>
          )}
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t">
          <Button variant="outline" size="sm" onClick={() => setOpen(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button size="sm" onClick={handleSend} disabled={loading || !subject.trim() || !body.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Mail className="h-4 w-4 mr-1.5" />}
            Enviar
          </Button>
        </div>
      </div>
    </div>
  )
}
