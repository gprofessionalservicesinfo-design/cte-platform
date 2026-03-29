import { NextResponse } from 'next/server'
import { createAdminServerClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createAdminServerClient()

    // All storage objects in the documents bucket
    const { data: storageObjects, error: storageErr } = await supabase
      .from('storage.objects')
      .select('name')
      .eq('bucket_id', 'documents')

    if (storageErr) {
      // Fallback: use storage API to list root-level folders
      const { data: listed, error: listErr } = await supabase.storage
        .from('documents')
        .list('', { limit: 1000 })

      if (listErr) {
        return NextResponse.json({ error: 'Storage list failed: ' + listErr.message }, { status: 500 })
      }

      // Each item in root is a company_id folder — recurse one level
      const allFiles: string[] = []
      for (const folder of listed ?? []) {
        if (!folder.id) continue // it's a folder prefix
        const { data: files } = await supabase.storage
          .from('documents')
          .list(folder.name, { limit: 1000 })
        for (const f of files ?? []) {
          allFiles.push(`${folder.name}/${f.name}`)
        }
      }

      const { data: documents } = await supabase
        .from('documents')
        .select('id, company_id, storage_path, file_url, status, type, created_at')
        .order('created_at', { ascending: false })

      const storageSet = new Set(allFiles)
      const broken = (documents ?? []).filter(d => {
        const p = d.storage_path || d.file_url
        return !p || !storageSet.has(p)
      })

      return NextResponse.json({
        storage_files: allFiles,
        storage_count: allFiles.length,
        document_count: (documents ?? []).length,
        broken_count: broken.length,
        broken,
      })
    }

    const storageSet = new Set((storageObjects ?? []).map(o => o.name))

    const { data: documents } = await supabase
      .from('documents')
      .select('id, company_id, storage_path, file_url, status, type, created_at')
      .order('created_at', { ascending: false })

    const broken = (documents ?? []).filter(d => {
      const p = d.storage_path || d.file_url
      return !p || !storageSet.has(p)
    })

    return NextResponse.json({
      storage_files: Array.from(storageSet),
      storage_count: storageSet.size,
      document_count: (documents ?? []).length,
      broken_count: broken.length,
      broken,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
