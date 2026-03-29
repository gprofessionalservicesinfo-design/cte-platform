import { NextResponse } from 'next/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

export async function GET() {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key  = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const result: Record<string, any> = {
    env: {
      url: url ? url.slice(0, 40) + '…' : 'MISSING',
      service_role_key: key ? key.slice(0, 20) + '…' : 'MISSING',
      anon_key: anonKey ? anonKey.slice(0, 20) + '…' : 'MISSING',
    },
  }

  if (!url || !key) {
    return NextResponse.json({ ...result, error: 'Missing env vars' }, { status: 500 })
  }

  const supabase = createSupabaseAdmin(url, key)

  // 1. List buckets
  const { data: buckets, error: bucketsErr } = await supabase.storage.listBuckets()
  result.listBuckets = { buckets: buckets?.map(b => b.name) ?? [], error: bucketsErr?.message ?? null }

  // 2. Ensure bucket exists
  const bucketExists = (buckets ?? []).some(b => b.name === 'documents')
  if (!bucketExists) {
    const { error: createErr } = await supabase.storage.createBucket('documents', { public: true })
    result.createBucket = { error: createErr?.message ?? null }
  } else {
    result.createBucket = 'skipped — already exists'
  }

  // 3. Upload test file
  const testPath = `_test/test-${Date.now()}.txt`
  const { data: uploadData, error: uploadErr } = await supabase.storage
    .from('documents')
    .upload(testPath, new Blob(['ok'], { type: 'text/plain' }), { upsert: true })
  result.upload = { path: testPath, data: uploadData, error: uploadErr?.message ?? null }

  // 4. Get public URL of test file
  if (!uploadErr) {
    const { data: publicData } = supabase.storage.from('documents').getPublicUrl(testPath)
    result.publicUrl = publicData?.publicUrl ?? null

    // 5. Clean up
    const { error: removeErr } = await supabase.storage.from('documents').remove([testPath])
    result.cleanup = { error: removeErr?.message ?? null }
  }

  // 6. List root of bucket
  const { data: listed, error: listErr } = await supabase.storage
    .from('documents')
    .list('', { limit: 20 })
  result.listRoot = { items: listed?.map(f => f.name) ?? [], error: listErr?.message ?? null }

  return NextResponse.json(result)
}
