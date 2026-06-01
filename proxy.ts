import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const { pathname } = request.nextUrl

  // 1. EXCLUSION TOTALE des assets et fichiers techniques
  if (pathname.startsWith('/_next') || pathname.includes('.') || pathname.startsWith('/api')) {
    return supabaseResponse
  }

  // 2. EXCLUSION DES PAGES PUBLIQUES (Bypass Supabase pour éviter fetch failed)
  // On ne fait aucun appel Supabase si on est sur une page accessible sans compte
  const isPublicPage = pathname === '/' || pathname.startsWith('/auth') || pathname.startsWith('/landing')
  
  if (isPublicPage) {
    return supabaseResponse
  }

  // 3. PROTECTION DES PAGES PRIVÉES (Uniquement pour /profile, /scan, etc.)
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
    // En cas d'erreur de réseau, on laisse passer pour éviter de bloquer l'utilisateur
    return supabaseResponse
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
