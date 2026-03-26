'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Save, Edit2, CheckCircle2 } from 'lucide-react'

interface EINEditorProps {
  companyId: string
  currentEIN: string | null
}

export function EINEditor({ companyId, currentEIN }: EINEditorProps) {
  const [ein, setEin] = useState(currentEIN ?? '')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('companies')
      .update({ ein: ein.trim() || null })
      .eq('id', companyId)

    if (error) {
      toast.error('Failed to save EIN: ' + error.message)
      setSaving(false)
      return
    }

    toast.success('EIN saved successfully')
    setSaving(false)
    setEditing(false)
  }

  if (!editing) {
    return (
      <div className="space-y-1.5">
        <Label>EIN (Tax ID)</Label>
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 h-10 rounded-md border border-input bg-muted px-3 text-sm">
            {ein ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="font-mono text-gray-800">{ein}</span>
              </>
            ) : (
              <span className="text-gray-400 italic">Not assigned</span>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Edit2 className="h-3.5 w-3.5 mr-1.5" />
            Edit
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor="ein-input">EIN (Tax ID)</Label>
      <div className="flex items-center gap-2">
        <Input
          id="ein-input"
          value={ein}
          onChange={(e) => setEin(e.target.value)}
          placeholder="XX-XXXXXXX"
          className="font-mono flex-1"
          disabled={saving}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
            if (e.key === 'Escape') setEditing(false)
          }}
        />
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <>
              <Save className="h-3.5 w-3.5 mr-1.5" />
              Save
            </>
          )}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setEditing(false)} disabled={saving}>
          Cancel
        </Button>
      </div>
      <p className="text-xs text-gray-400">Format: XX-XXXXXXX (e.g., 12-3456789)</p>
    </div>
  )
}
