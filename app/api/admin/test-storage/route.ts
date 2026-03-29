import { NextResponse } from 'next/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

const MIME_CANDIDATES = [
  { mime: 'text/html',       ext: 'html', content: '<p>test</p>' },
  { mime: 'application/pdf', ext: 'pdf',  content: '%PDF-1.4 test' },
  { mime: 'text/plain',      ext: 'txt',  content: 'test' },
  { mime: 'image/jpeg',      ext: 'jpg',  content: 'fakejpeg' },
  { mime: 'image/png',       ext: 'png',  content: 'fakepng' },
  { mime: 'application/octet-stream', ext: 'bin', content: 'binary' },
]

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    return NextResponse.json({ error: 'Missing env vars' }, { status: 500 })
  }

  const supabase = createSupabaseAdmin(url, key)

  // Bucket metadata (includes allowed_mime_types if set)
  const { data: buckets, error: bucketsErr } = await supabase.storage.listBuckets()
  const bucket = (buckets ?? []).find(b => b.name === 'documents')
  const bucketMeta = bucket
    ? { id: bucket.id, public: bucket.public, allowed_mime_types: (bucket as any).allowed_mime_types ?? 'not exposed by SDK' }
    : null

  // Test each MIME type
  const ts = Date.now()
  const mimeResults: Record<string, any> = {}

  for (const { mime, ext, content } of MIME_CANDIDATES) {
    const path = `_test/${ts}.${ext}`
    const { error: upErr } = await supabase.storage
      .from('documents')
      .upload(path, new Blob([content], { type: mime }), { contentType: mime, upsert: true })

    mimeResults[mime] = upErr ? { ok: false, error: upErr.message } : { ok: true }

    // Clean up if upload succeeded
    if (!upErr) {
      await supabase.storage.from('documents').remove([path])
    }
  }

  return NextResponse.json({
    bucket: bucketMeta,
    bucketListError: bucketsErr?.message ?? null,
    mimeTests: mimeResults,
  })
}
