'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2, Send, StickyNote } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Note {
  id: string
  content: string
  pinned: boolean
  created_at: string
  users: {
    full_name: string | null
    email: string
  } | null
}

interface NotesPanelProps {
  companyId: string
  adminId: string
  initialNotes: Note[]
}

export function NotesPanel({ companyId, adminId, initialNotes }: NotesPanelProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    if (!content.trim()) {
      toast.error('Note cannot be empty')
      return
    }

    setSubmitting(true)
    const supabase = createClient()

    const { data: newNote, error } = await supabase
      .from('notes')
      .insert({
        company_id: companyId,
        admin_id: adminId,
        content: content.trim(),
      })
      .select('id, content, pinned, created_at, users(full_name, email)')
      .single()

    if (error) {
      toast.error('Failed to add note: ' + error.message)
      setSubmitting(false)
      return
    }

    setNotes((prev) => [newNote as Note, ...prev])
    setContent('')
    toast.success('Note added')
    setSubmitting(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="space-y-4">
      {/* New note input */}
      <div className="space-y-2">
        <Textarea
          placeholder="Add an internal note… (Ctrl+Enter to submit)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          disabled={submitting}
          className="resize-none"
        />
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={submitting || !content.trim()}
          className="w-full"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Send className="mr-2 h-3.5 w-3.5" />
              Add Note
            </>
          )}
        </Button>
      </div>

      {/* Notes list */}
      {notes.length === 0 ? (
        <div className="text-center py-6 text-gray-400">
          <StickyNote className="mx-auto h-8 w-8 mb-2 opacity-40" />
          <p className="text-sm">No notes yet. Add one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="rounded-lg bg-yellow-50 border border-yellow-100 p-3">
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.content}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-xs text-gray-400">
                  {note.users?.full_name ?? note.users?.email ?? 'Admin'}
                </span>
                <span className="text-gray-300">·</span>
                <span className="text-xs text-gray-400">{formatDate(note.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
