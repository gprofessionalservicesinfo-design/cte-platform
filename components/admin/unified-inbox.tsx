'use client'

import { useEffect, useRef, useState } from 'react'
import { Mail, MessageCircle, Send, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { UnifiedMessage } from '@/app/api/admin/unified-inbox/route'

// ── Templates ────────────────────────────────────────────────────────────────

const TEMPLATES = [
  {
    label:   'Bienvenida',
    content: (name: string, _company: string) =>
      `Hola ${name}, bienvenido a CreaTuEmpresaUSA. Tu caso está en proceso. 🦅`,
  },
  {
    label:   'Docs listos',
    content: (name: string, _company: string) =>
      `Hola ${name}, tus documentos están listos para revisar en tu portal: https://creatuempresausa.com/dashboard/documents 📄`,
  },
  {
    label:   'Info requerida',
    content: (name: string, _company: string) =>
      `Hola ${name}, necesitamos información adicional para continuar con tu caso. Por favor completa tu perfil en: https://creatuempresausa.com/dashboard/onboarding 📋`,
  },
  {
    label:   'Caso completado',
    content: (name: string, company: string) =>
      `Hola ${name}, tu empresa ${company} ha sido formada exitosamente. ¡Felicidades! 🎉`,
  },
]

// ── Props ────────────────────────────────────────────────────────────────────

interface Props {
  companyId:   string
  clientName:  string
  clientPhone: string | null
  clientEmail: string
  companyName: string
}

// ── Message item ─────────────────────────────────────────────────────────────

function MessageItem({ msg, clientName }: { msg: UnifiedMessage; clientName: string }) {
  const [expanded, setExpanded] = useState(false)
  const isOutbound = msg.direction === 'outbound'
  const preview    = msg.content.slice(0, 120)
  const hasMore    = msg.content.length > 120

  return (
    <div className={`flex gap-3 ${isOutbound ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Channel icon */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5 ${
        msg.source === 'email' ? 'bg-blue-100' : 'bg-green-100'
      }`}>
        {msg.source === 'email'
          ? <Mail className="h-3.5 w-3.5 text-blue-600" />
          : <MessageCircle className="h-3.5 w-3.5 text-green-600" />
        }
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] ${isOutbound ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
        <div className="flex items-center gap-2 px-0.5">
          <span className="text-xs text-gray-400">
            {isOutbound ? 'Admin' : clientName}
          </span>
          <span className="text-xs text-gray-300">·</span>
          <span className="text-xs text-gray-400">{formatDate(msg.created_at)}</span>
          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
            msg.source === 'email'
              ? 'bg-blue-50 text-blue-600'
              : 'bg-green-50 text-green-600'
          }`}>
            {msg.source === 'email' ? '📧' : '💬'}
          </span>
        </div>

        <div className={`rounded-xl px-3 py-2 text-sm leading-relaxed ${
          isOutbound
            ? 'bg-[#0A2540] text-white rounded-tr-sm'
            : 'bg-gray-100 text-gray-800 rounded-tl-sm'
        }`}>
          {msg.title && msg.source === 'email' && (
            <p className={`font-semibold text-xs mb-1 ${isOutbound ? 'text-blue-200' : 'text-gray-500'}`}>
              {msg.title}
            </p>
          )}
          <p className="whitespace-pre-wrap">
            {expanded ? msg.content : preview}
            {!expanded && hasMore && '…'}
          </p>
          {hasMore && (
            <button
              onClick={() => setExpanded(e => !e)}
              className={`mt-1 flex items-center gap-0.5 text-xs underline ${
                isOutbound ? 'text-blue-300' : 'text-gray-500'
              }`}
            >
              {expanded ? <><ChevronUp className="h-3 w-3" /> Ver menos</> : <><ChevronDown className="h-3 w-3" /> Ver más</>}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function UnifiedInbox({ companyId, clientName, clientPhone, clientEmail, companyName }: Props) {
  const [messages, setMessages]   = useState<UnifiedMessage[]>([])
  const [loading, setLoading]     = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [channel, setChannel]     = useState<'email' | 'whatsapp'>('email')
  const [text, setText]           = useState('')
  const [sending, setSending]     = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [sendOk, setSendOk]       = useState(false)
  const feedRef                   = useRef<HTMLDivElement>(null)

  const firstName = clientName.split(' ')[0]

  async function load(quiet = false) {
    if (!quiet) setLoading(true)
    else setRefreshing(true)
    try {
      const res = await fetch(`/api/admin/unified-inbox?companyId=${companyId}`)
      if (res.ok) {
        const { messages: msgs } = await res.json()
        setMessages(msgs ?? [])
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { load() }, [companyId])

  async function handleSend() {
    if (!text.trim()) return
    setSending(true)
    setSendError(null)
    setSendOk(false)

    try {
      if (channel === 'email') {
        const res = await fetch('/api/admin/send-client-email', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to:        clientEmail,
            name:      clientName,
            subject:   `Actualización sobre tu caso — ${companyName}`,
            body:      text,
            companyId,
          }),
        })
        if (!res.ok) {
          const j = await res.json()
          throw new Error(j.error ?? 'Error al enviar email')
        }
      } else {
        if (!clientPhone) throw new Error('No hay número de WhatsApp para este cliente')
        const res = await fetch('/api/whatsapp/send', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: clientPhone, body: text }),
        })
        if (!res.ok) {
          const j = await res.json()
          throw new Error(j.error ?? 'Error al enviar WhatsApp')
        }
      }

      setText('')
      setSendOk(true)
      setTimeout(() => setSendOk(false), 3000)
      // Refresh feed after short delay so DB write is visible
      setTimeout(() => load(true), 1200)
    } catch (err: any) {
      setSendError(err.message)
    } finally {
      setSending(false)
    }
  }

  function applyTemplate(t: typeof TEMPLATES[0]) {
    setText(t.content(firstName, companyName))
  }

  return (
    <div className="flex flex-col h-[600px]">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-1 pb-3 border-b border-gray-100">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Feed de comunicaciones
        </p>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="Actualizar"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* ── Feed ── */}
      <div ref={feedRef} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="mx-auto h-8 w-8 text-gray-200 mb-2" />
            <p className="text-sm text-gray-400">Sin comunicaciones aún.</p>
          </div>
        ) : (
          messages.map(msg => (
            <MessageItem key={`${msg.source}-${msg.id}`} msg={msg} clientName={clientName} />
          ))
        )}
      </div>

      {/* ── Reply bar ── */}
      <div className="border-t border-gray-100 pt-3 space-y-2">

        {/* Channel toggle */}
        <div className="flex gap-1">
          <button
            onClick={() => setChannel('email')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              channel === 'email'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            <Mail className="h-3 w-3" />
            Email
          </button>
          <button
            onClick={() => { if (clientPhone) setChannel('whatsapp') }}
            disabled={!clientPhone}
            title={!clientPhone ? 'Sin número de WhatsApp' : undefined}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              channel === 'whatsapp'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            <MessageCircle className="h-3 w-3" />
            WhatsApp
          </button>
        </div>

        {/* Templates */}
        <div className="flex flex-wrap gap-1">
          {TEMPLATES.map(t => (
            <button
              key={t.label}
              onClick={() => applyTemplate(t)}
              className="text-xs px-2.5 py-1 rounded-full bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-600 transition-colors border border-gray-200 hover:border-blue-200"
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Textarea + send */}
        <div className="flex gap-2">
          <textarea
            rows={2}
            value={text}
            onChange={e => { setText(e.target.value); setSendError(null); setSendOk(false) }}
            placeholder={channel === 'email' ? 'Escribe un email…' : 'Escribe un mensaje de WhatsApp…'}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <button
            onClick={handleSend}
            disabled={sending || !text.trim()}
            className="flex-shrink-0 flex flex-col items-center justify-center gap-1 bg-[#0A2540] hover:bg-[#0d3060] disabled:opacity-40 text-white rounded-lg px-3 py-2 transition-colors"
          >
            {sending
              ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Send className="h-4 w-4" />
            }
            <span className="text-xs font-semibold">
              {sending ? '…' : sendOk ? '✓' : 'Enviar'}
            </span>
          </button>
        </div>

        {sendError && <p className="text-xs text-red-500">{sendError}</p>}
        {sendOk    && <p className="text-xs text-green-600">✅ Mensaje enviado correctamente.</p>}
      </div>
    </div>
  )
}
