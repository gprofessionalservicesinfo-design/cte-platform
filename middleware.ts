import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const pathname = request.nextUrl.pathname

  // /auth/callback must always pass through — it is the OAuth landing route.
  // Blocking it would prevent the code exchange from completing.
  if (pathname.startsWith('/auth/callback')) {
    return supabaseResponse
  }

  // LOCAL DEV ONLY — bypass auth for all /admin routes so CRM pages
  // can be reviewed without a login session. No effect in production.
  const isLocalDev = process.env.NODE_ENV === 'development'
  if (isLocalDev && pathname.startsWith('/admin')) {
    console.log(`[middleware] DEV ADMIN BYPASS — skipping auth for ${pathname}`)
    return supabaseResponse
  }


  // Read session from cookie (local decode, no network call).
  const { data: { session } } = await supabase.auth.getSession()
  // Also check raw cookie for auth token (handles legacy anon key format)
  const rawCookie = request.cookies.get('sb-rhprcuqhuesorrncswjs-auth-token')?.value
  const rawCookie0 = request.cookies.get('sb-rhprcuqhuesorrncswjs-auth-token.0')?.value
  const isAuthenticated = !!session?.user || !!rawCookie || !!rawCookie0

  console.log(`[middleware] MIDDLEWARE SESSION OK: ${isAuthenticated} — ${pathname}`)

  // Unauthenticated users cannot access protected routes
  if (!isAuthenticated && (pathname.startsWith('/dashboard') || pathname.startsWith('/admin'))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Authenticated users are sent away from auth pages (only with real session, not raw cookie)
  if (session?.user && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Admin route guard
  if (isAuthenticated && pathname.startsWith('/admin')) {
    const userId = session?.user?.id
    if (!userId) {
      // Allow through if using raw cookie (dev/legacy mode)
      return supabaseResponse
    }
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()
    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
