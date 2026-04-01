'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, MailOpen, Inbox, X } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface MailItem {
  id: string
  title: string
  sender: string | null
  description: string | null
  category: string | null
  is_read: boolean
  created_at: string
}

export default function MailPage() {
  const [mail, setMail] = useState<MailItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<MailItem | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = await createClient()

      // RLS (current_client_id()) filters companies automatically
      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .order('created_at')
        .limit(1)
        .maybeSingle()

      if (!company) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('mail_items')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false })

      setMail(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function openItem(item: MailItem) {
    setSelected(item)
    if (!item.is_read) {
      const supabase = await createClient()
      await supabase.from('mail_items').update({ is_read: true }).eq('id', item.id)
      setMail((prev) => prev.map((m) => m.id === item.id ? { ...m, is_read: true } : m))
      setSelected((s) => s?.id === item.id ? { ...s, is_read: true } : s)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mail Center</h1>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mail Center</h1>
        <p className="text-gray-500 mt-1">Important updates and correspondence.</p>
      </div>

      {mail.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Inbox className="mx-auto h-12 w-12 text-gray-200 mb-4" />
            <p className="text-gray-500 font-medium">No mail yet</p>
            <p className="text-gray-400 text-sm mt-1">
              We&apos;ll notify you of important updates here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {mail.map((item) => (
            <Card
              key={item.id}
              className={`cursor-pointer transition-colors hover:border-blue-300 ${item.is_read ? 'opacity-70' : 'border-primary/30 shadow-sm'}`}
              onClick={() => openItem(item)}
            >
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`p-2 rounded-lg flex-shrink-0 ${item.is_read ? 'bg-gray-100' : 'bg-blue-50'}`}>
                      {item.is_read
                        ? <MailOpen className="h-4 w-4 text-gray-400" />
                        : <Mail className="h-4 w-4 text-blue-600" />
                      }
                    </div>
                    <div className="min-w-0">
                      <p className={`font-medium truncate ${item.is_read ? 'text-gray-600' : 'text-gray-900'}`}>
                        {!item.is_read && (
                          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2 mb-0.5" />
                        )}
                        {item.title}
                      </p>
                      {item.sender && (
                        <p className="text-xs text-gray-400 mt-0.5">From: {item.sender}</p>
                      )}
                      {item.description && (
                        <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{item.description}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">{formatDate(item.created_at)}</p>
                    </div>
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
                <h2 className="font-semibold text-gray-900 leading-snug">{selected.title}</h2>
                {selected.sender && (
                  <p className="text-xs text-gray-500 mt-0.5">De: {selected.sender}</p>
                )}
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(selected.created_at)}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 mt-0.5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-5 py-4 overflow-y-auto flex-1">
              {selected.description ? (
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selected.description}
                </p>
              ) : (
                <p className="text-sm text-gray-400 italic">Sin contenido.</p>
              )}
            </div>
            <div className="px-5 py-4 border-t flex justify-end">
              <Button size="sm" onClick={() => setSelected(null)}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
