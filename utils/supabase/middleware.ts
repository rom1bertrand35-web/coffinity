import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Pour la requête, on ne met que name et value
            request.cookies.set(name, value)
          })
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            // Pour la réponse, on garde les options (indispensable pour les sessions)
            const isLocal = request.nextUrl.protocol === 'http:';
            supabaseResponse.cookies.set({
              name,
              value,
              ...options,
              secure: isLocal ? false : options.secure,
              sameSite: isLocal ? 'lax' : options.sameSite,
            })
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')

  if (!user && !isAuthPage) {
    // Si l'utilisateur n'est pas connecté et n'est pas déjà sur la page auth, on le redirige
    const url = request.nextUrl.clone()
    url.pathname = '/auth'
    return NextResponse.redirect(url)
  }

  if (user && isAuthPage) {
    // Si l'utilisateur est connecté et essaie d'aller sur la page auth, on le redirige vers l'accueil
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
