'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, MailOpen, Inbox } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'

interface MailItem {
  id: string
  title: string
  sender: string | null
  description: string | null
  category: string | null
  is_read: boolean
  received_at: string
}

export default function MailPage() {
  const [mail, setMail] = useState<MailItem[]>([])
  const [loading, setLoading] = useState(true)

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
        .order('received_at', { ascending: false })

      setMail(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function markAsRead(mailId: string) {
    const supabase = await createClient()
    const { error } = await supabase
      .from('mail_items')
      .update({ is_read: true })
      .eq('id', mailId)

    if (error) {
      toast.error('Failed to mark as read')
      return
    }

    setMail((prev) => prev.map((m) => (m.id === mailId ? { ...m, is_read: true } : m)))
    toast.success('Marked as read')
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
              className={item.is_read ? 'opacity-70' : 'border-primary/30 shadow-sm'}
            >
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg flex-shrink-0 ${
                        item.is_read ? 'bg-gray-100' : 'bg-blue-50'
                      }`}
                    >
                      {item.is_read ? (
                        <MailOpen className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Mail className="h-4 w-4 text-blue-600" />
                      )}
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
                        <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">{formatDate(item.received_at)}</p>
                    </div>
                  </div>
                  {!item.is_read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-shrink-0 text-xs px-2 whitespace-nowrap"
                      onClick={() => markAsRead(item.id)}
                    >
                      Leído
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
