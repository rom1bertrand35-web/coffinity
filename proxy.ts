import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const { pathname } = request.nextUrl

  // 1. BYPASS SYSTÈME (Crucial pour Vercel Production)
  // On laisse passer sans AUCUNE vérification :
  // - Les fichiers statiques (images, css, js)
  // - Les requêtes internes de Next.js (Server Actions)
  // - Les appels API
  if (
    pathname.startsWith('/_next') || 
    pathname.includes('.') || 
    pathname.startsWith('/api') ||
    request.headers.has('next-action') // Autorise les Server Actions de connexion
  ) {
    return supabaseResponse
  }

  // 2. BYPASS PAGES PUBLIQUES
  const isPublicPage = pathname === '/' || pathname.startsWith('/auth') || pathname.startsWith('/landing')
  if (isPublicPage) {
    return supabaseResponse
  }

  // 3. PROTECTION PAGES PRIVÉES
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
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

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth'
      return NextResponse.redirect(url)
    }
  } catch (e) {
    return supabaseResponse
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
