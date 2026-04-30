import { createClient } from '@supabase/supabase-js'

// ─── TIPOS (mantienen compatibilidad con código existente) ────────────────
export type Section =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'cta'; text: string; href: string; label: string }
  | { type: 'faq'; items: { q: string; a: string }[] }
  | { type: 'highlight'; text: string }
  | { type: 'wa_cta'; headline?: string; subtext?: string; message?: string }

export interface Post {
  slug: string
  title: string
  headline: string
  description: string
  date: string
  modified: string
  readTime: number
  keyword: string
  metaTitle: string
  metaDescription: string
  focusKeyword: string
  category: string
  badge: string
  photo: string
  sections: Section[]
}

// ─── CLIENTE SUPABASE (server-side, lectura pública) ──────────────────────
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

// ─── MAPEO DB → Post ──────────────────────────────────────────────────────
function rowToPost(row: any): Post {
  return {
    slug: row.slug,
    title: row.title,
    headline: row.headline,
    description: row.description,
    date: row.date,
    modified: row.modified,
    readTime: row.read_time,
    keyword: row.keyword,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    focusKeyword: row.focus_keyword,
    category: row.category,
    badge: row.badge,
    photo: row.photo ?? '',
    sections: row.sections ?? [],
  }
}

// ─── API PÚBLICA ──────────────────────────────────────────────────────────

/**
 * Obtiene todos los posts publicados, ordenados por fecha descendente.
 */
export async function getAllPosts(): Promise<Post[]> {
  const { data, error } = await getSupabase()
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .order('date', { ascending: false })

  if (error) {
    console.error('[getAllPosts] error:', error.message)
    return []
  }
  return (data ?? []).map(rowToPost)
}

/**
 * Obtiene un post por su slug.
 */
export async function getPost(slug: string): Promise<Post | null> {
  const { data, error } = await getSupabase()
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (error) {
    console.error(`[getPost] ${slug}:`, error.message)
    return null
  }
  return data ? rowToPost(data) : null
}

/**
 * Obtiene todos los slugs publicados (para generateStaticParams).
 */
export async function getAllSlugs(): Promise<string[]> {
  const { data, error } = await getSupabase()
    .from('blog_posts')
    .select('slug')
    .eq('status', 'published')

  if (error) {
    console.error('[getAllSlugs] error:', error.message)
    return []
  }
  return (data ?? []).map((r: any) => r.slug)
}

/**
 * BACKWARD COMPAT: array `posts` exportado vacío.
 * Cualquier código que aún haga `import { posts }` ya NO debería usarlo
 * — debe migrarse a `await getAllPosts()`.
 */
export const posts: Post[] = []
