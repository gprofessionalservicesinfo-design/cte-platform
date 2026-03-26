import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * AUTH CALLBACK PROCESSING
 *
 * This is the only place that handles the Google OAuth return.
 * Flow:
 *   Google → /auth/callback?code=... → exchangeCodeForSession → set cookie → /dashboard
 *
 * Intentionally does NOT call getUser() after exchange — that requires a live
 * Supabase network call that fails when the anon key format is non-standard.
 * The session cookie is set by exchangeCodeForSession itself. That is sufficient.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const cookieStore = cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Session cookie is now set. Hard redirect to dashboard.
      // Middleware will validate the cookie on the /dashboard request.
      console.log('[auth/callback] AUTH CALLBACK PROCESSING — session set, redirecting to /dashboard')
      // If this is a password recovery flow, redirect to reset-password
      const type = searchParams.get('type')
      if (type === 'recovery') {
        return NextResponse.redirect(new URL('/reset-password', origin))
      }
      return NextResponse.redirect(new URL('/dashboard', origin))
    }

    console.error('[auth/callback] exchangeCodeForSession failed:', error.message)
  }

  // No code or exchange failed — back to login with a clear error
  console.warn('[auth/callback] No code or exchange failed — redirecting to /login?error=callback')
  return NextResponse.redirect(new URL('/login?error=callback', origin))
}
