'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, MailOpen, Inbox, X, MessageCircle } from 'lucide-react'

interface MailItem {
  id:          string
  title:       string
  sender:      string | null
  description: string | null
  html_body:   string | null
  channel:     string | null
  direction:   string | null
  category:    string | null
  is_read:     boolean
  created_at:  string
}

function formatDateES(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-MX', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function ChannelIcon({ channel }: { channel: string | null }) {
  if (channel === 'whatsapp') {
    return (
      <span title="WhatsApp" className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100">
        <MessageCircle className="h-3 w-3 text-green-600" />
      </span>
    )
  }
  return (
    <span title="Email" className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100">
      <Mail className="h-3 w-3 text-blue-600" />
    </span>
  )
}

export default function MailPage() {
  const [mail,     setMail]     = useState<MailItem[]>([])
  const [loading,  setLoading]  = useState(true)
  const [selected, setSelected] = useState<MailItem | null>(null)
  const [companyId, setCompanyId] = useState<string | null>(null)

  useEffect(() => {
    let channel: ReturnType<ReturnType<typeof createClient>['channel']> | null = null

    async function load() {
      const supabase = createClient()

      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .order('created_at')
        .limit(1)
        .maybeSingle()

      if (!company) { setLoading(false); return }
      setCompanyId(company.id)

      const { data } = await supabase
        .from('mail_items')
        .select('id,title,sender,description,html_body,channel,direction,category,is_read,created_at')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false })

      setMail(data ?? [])
      setLoading(false)

      // Realtime subscription
      channel = supabase
        .channel(`mail:${company.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'mail_items', filter: `company_id=eq.${company.id}` },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setMail(prev => [payload.new as MailItem, ...prev])
            } else if (payload.eventType === 'UPDATE') {
              setMail(prev => prev.map(m => m.id === (payload.new as MailItem).id ? payload.new as MailItem : m))
            } else if (payload.eventType === 'DELETE') {
              setMail(prev => prev.filter(m => m.id !== (payload.old as any).id))
            }
          },
        )
        .subscribe()
    }

    load()
    return () => { channel?.unsubscribe() }
  }, [])

  async function openItem(item: MailItem) {
    setSelected(item)
    if (!item.is_read) {
      const supabase = createClient()
      await supabase.from('mail_items').update({ is_read: true }).eq('id', item.id)
      setMail(prev => prev.map(m => m.id === item.id ? { ...m, is_read: true } : m))
      setSelected(s => s?.id === item.id ? { ...s, is_read: true } : s)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Bandeja de entrada</h1>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const unread = mail.filter(m => !m.is_read).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bandeja de entrada
          {unread > 0 && (
            <span className="ml-2 text-sm font-semibold bg-blue-500 text-white px-2 py-0.5 rounded-full">
              {unread}
            </span>
          )}
        </h1>
        <p className="text-gray-500 mt-1 text-sm">Actualizaciones y comunicaciones importantes sobre tu caso.</p>
      </div>

      {mail.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Inbox className="mx-auto h-12 w-12 text-gray-200 mb-4" />
            <p className="text-gray-500 font-medium">Sin mensajes aún</p>
            <p className="text-gray-400 text-sm mt-1">
              Te notificaremos aquí cuando haya novedades sobre tu proceso.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {mail.map(item => (
            <Card
              key={item.id}
              className={`cursor-pointer transition-colors hover:border-blue-300 ${item.is_read ? 'opacity-70' : 'border-primary/30 shadow-sm'}`}
              onClick={() => openItem(item)}
            >
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${item.is_read ? 'bg-gray-100' : item.channel === 'whatsapp' ? 'bg-green-50' : 'bg-blue-50'}`}>
                    {item.is_read
                      ? <MailOpen className="h-4 w-4 text-gray-400" />
                      : item.channel === 'whatsapp'
                        ? <MessageCircle className="h-4 w-4 text-green-600" />
                        : <Mail className="h-4 w-4 text-blue-600" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {!item.is_read && (
                        <span className="inline-block w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                      )}
                      <p className={`font-medium truncate ${item.is_read ? 'text-gray-600' : 'text-gray-900'}`}>
                        {item.title}
                      </p>
                      <ChannelIcon channel={item.channel} />
                    </div>
                    {item.sender && (
                      <p className="text-xs text-gray-400 mt-0.5">De: {item.sender}</p>
                    )}
                    {item.description && (
                      <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{item.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{formatDateES(item.created_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-start justify-between gap-3 px-5 py-4 border-b">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <ChannelIcon channel={selected.channel} />
                  <h2 className="font-semibold text-gray-900 leading-snug">{selected.title}</h2>
                </div>
                {selected.sender && (
                  <p className="text-xs text-gray-500 mt-0.5">De: {selected.sender}</p>
                )}
                <p className="text-xs text-gray-400 mt-0.5">{formatDateES(selected.created_at)}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 mt-0.5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-5 py-4 overflow-y-auto flex-1">
              {selected.html_body ? (
                <div
                  className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: selected.html_body }}
                />
              ) : selected.description ? (
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selected.description}
                </p>
              ) : (
                <p className="text-sm text-gray-400 italic">Sin contenido.</p>
              )}
            </div>
            <div className="px-5 py-4 border-t flex justify-end">
              <Button size="sm" onClick={() => setSelected(null)}>Cerrar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
