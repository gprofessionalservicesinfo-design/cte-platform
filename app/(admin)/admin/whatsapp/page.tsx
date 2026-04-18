'use client'

import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Send, RefreshCw, MessageCircle, Phone } from 'lucide-react'

interface Message {
  id: string
  phone_number: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

interface Thread {
  phone_number: string
  company_name: string | null
  last_message: string
  last_at: string
  unread: boolean
}

export default function WhatsAppInboxPage() {
  // Stable client — createClient() is a singleton in the browser but we
  // memoize to avoid it appearing as a new reference on every render,
  // which would cause all useCallback([supabase]) deps to retrigger.
  const supabase = useMemo(() => createClient(), [])

  const [threads, setThreads] = useState<Thread[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // ── Load threads ──────────────────────────────────────────────────────────
  const loadThreads = useCallback(async () => {
    setRefreshing(true)
    const { data } = await supabase
      .from('whatsapp_conversations')
      .select('phone_number, content, created_at, role')
      .order('created_at', { ascending: false })

    if (data) {
      const seen = new Map<string, Thread>()
      for (const row of data) {
        if (!seen.has(row.phone_number)) {
          seen.set(row.phone_number, {
            phone_number: row.phone_number,
            company_name: null,
            last_message: row.content,
            last_at:      row.created_at,
            unread:       row.role === 'user',
          })
        }
      }
      const list = Array.from(seen.values())

      // Enrich with company names
      const phones = list.map(t => t.phone_number)
      if (phones.length > 0) {
        const { data: companies } = await supabase
          .from('companies')
          .select('company_name, whatsapp_phone_used')
          .in('whatsapp_phone_used', [
            ...phones,
            ...phones.map(p => `whatsapp:${p}`),
          ])

        if (companies) {
          for (const c of companies) {
            const phone = c.whatsapp_phone_used?.startsWith('whatsapp:')
              ? c.whatsapp_phone_used.slice(9)
              : c.whatsapp_phone_used
            const t = seen.get(phone ?? '')
            if (t) t.company_name = c.company_name
          }
        }
      }

      setThreads(list)
    }
    setLoading(false)
    setRefreshing(false)
  }, [supabase])

  useEffect(() => { loadThreads() }, [loadThreads])

  // ── Load messages for selected thread ────────────────────────────────────
  const loadMessages = useCallback(async (phone: string) => {
    const { data } = await supabase
      .from('whatsapp_conversations')
      .select('*')
      .eq('phone_number', phone)
      .order('created_at', { ascending: true })
    setMessages(data ?? [])
  }, [supabase])

  useEffect(() => {
    if (selected) loadMessages(selected)
  }, [selected, loadMessages])

  // ── Auto-scroll to bottom ─────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Realtime subscription ─────────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel('wa-inbox')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'whatsapp_conversations' },
        (payload) => {
          const row = payload.new as Message
          // Update threads list
          setThreads(prev => {
            const existing = prev.find(t => t.phone_number === row.phone_number)
            if (existing) {
              return prev.map(t =>
                t.phone_number === row.phone_number
                  ? { ...t, last_message: row.content, last_at: row.created_at, unread: row.role === 'user' }
                  : t
              )
            }
            return [
              { phone_number: row.phone_number, company_name: null, last_message: row.content, last_at: row.created_at, unread: row.role === 'user' },
              ...prev,
            ]
          })
          // Append to open thread
          if (row.phone_number === selected) {
            setMessages(prev => [...prev, row])
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase, selected])

  // ── Send message ──────────────────────────────────────────────────────────
  async function handleSend() {
    if (!selected || !draft.trim() || sending) return
    setSending(true)
    const body = draft.trim()
    setDraft('')

    const res = await fetch('/api/whatsapp/send', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ to: selected, body }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      alert(`Error: ${err.error ?? 'Send failed'}`)
      setDraft(body) // restore draft
    }
    setSending(false)
  }

  function formatTime(iso: string) {
    const d = new Date(iso)
    const now = new Date()
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    }
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
  }

  return (
    // fixed + left-0 lg:left-64 lets this page fill the viewport to the right
    // of the sidebar without being constrained by the layout's max-w-7xl / padding.
    // The layout still renders the sidebar — we just escape its content wrapper.
    <div className="fixed inset-0 lg:left-64 flex bg-slate-50 overflow-hidden z-10">
      <div className="flex flex-1 overflow-hidden">

        {/* Thread list */}
        <div className="w-80 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-green-600" />
              <span className="font-semibold text-sm text-slate-800">WhatsApp Inbox</span>
            </div>
            <button
              onClick={loadThreads}
              disabled={refreshing}
              className="p-1.5 rounded-md hover:bg-slate-100 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={cn('h-4 w-4 text-slate-500', refreshing && 'animate-spin')} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-sm text-slate-400 text-center">Loading…</div>
            ) : threads.length === 0 ? (
              <div className="p-4 text-sm text-slate-400 text-center">No conversations yet</div>
            ) : (
              threads.map(t => (
                <button
                  key={t.phone_number}
                  onClick={() => setSelected(t.phone_number)}
                  className={cn(
                    'w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors',
                    selected === t.phone_number && 'bg-green-50 border-l-2 border-l-green-500'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {t.company_name ?? t.phone_number}
                      </p>
                      {t.company_name && (
                        <p className="text-xs text-slate-400 truncate">{t.phone_number}</p>
                      )}
                      <p className="text-xs text-slate-500 truncate mt-0.5">{t.last_message}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-xs text-slate-400">{formatTime(t.last_at)}</span>
                      {t.unread && (
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Conversation pane */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
              <div className="text-center">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p>Selecciona una conversación</p>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-5 py-3 border-b border-slate-200 bg-white flex items-center gap-3">
                <Phone className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {threads.find(t => t.phone_number === selected)?.company_name ?? selected}
                  </p>
                  <p className="text-xs text-slate-400">{selected}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {messages.map(m => (
                  <div
                    key={m.id}
                    className={cn(
                      'flex',
                      m.role === 'assistant' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                        m.role === 'assistant'
                          ? 'bg-green-600 text-white rounded-br-sm'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'
                      )}
                    >
                      <p className="whitespace-pre-wrap">{m.content}</p>
                      <p className={cn(
                        'text-xs mt-1',
                        m.role === 'assistant' ? 'text-green-100' : 'text-slate-400'
                      )}>
                        {formatTime(m.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Compose */}
              <div className="px-4 py-3 border-t border-slate-200 bg-white">
                <div className="flex items-end gap-2">
                  <textarea
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                    placeholder="Escribe un mensaje… (Enter para enviar)"
                    rows={2}
                    className="flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!draft.trim() || sending}
                    className={cn(
                      'flex-shrink-0 rounded-xl p-2.5 transition-colors',
                      draft.trim() && !sending
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    )}
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
