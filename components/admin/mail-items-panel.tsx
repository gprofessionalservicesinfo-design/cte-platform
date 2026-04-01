'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Mail, MailOpen, X } from 'lucide-react'
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

interface MailItemsPanelProps {
  initialItems: MailItem[]
}

export function MailItemsPanel({ initialItems }: MailItemsPanelProps) {
  const [items, setItems] = useState<MailItem[]>(initialItems)
  const [selected, setSelected] = useState<MailItem | null>(null)

  async function openItem(item: MailItem) {
    setSelected(item)
    if (!item.is_read) {
      const supabase = createClient()
      await supabase.from('mail_items').update({ is_read: true }).eq('id', item.id)
      setItems((prev) => prev.map((m) => m.id === item.id ? { ...m, is_read: true } : m))
      setSelected((s) => s?.id === item.id ? { ...s, is_read: true } : s)
    }
  }

  if (items.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-4">No mail items yet.</p>
  }

  return (
    <>
      <div className="space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => openItem(item)}
            className={`w-full text-left rounded-lg border p-3 text-sm transition-colors hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer ${
              item.is_read ? 'bg-gray-50 border-gray-100' : 'bg-blue-50 border-blue-100'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  {!item.is_read && (
                    <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                  <p className={`font-medium truncate ${item.is_read ? 'text-gray-600' : 'text-gray-900'}`}>
                    {item.title}
                  </p>
                </div>
                {item.sender && (
                  <p className="text-xs text-gray-400 mt-0.5">From: {item.sender}</p>
                )}
                {item.description && (
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.description}</p>
                )}
              </div>
              <div className="flex-shrink-0 mt-0.5">
                {item.is_read
                  ? <MailOpen className="h-4 w-4 text-gray-300" />
                  : <Mail className="h-4 w-4 text-blue-500" />
                }
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1.5">{formatDate(item.created_at)}</p>
          </button>
        ))}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
            {/* Header */}
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

            {/* Body */}
            <div className="px-5 py-4 overflow-y-auto flex-1">
              {selected.description ? (
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selected.description}
                </p>
              ) : (
                <p className="text-sm text-gray-400 italic">Sin contenido.</p>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t flex justify-end">
              <Button size="sm" onClick={() => setSelected(null)}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
