"use server"

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function loginWithServerAction(email: string, password: string) {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set({ 
                name, 
                value, 
                ...options,
                // Force insecure for local network testing on phone
                secure: process.env.NODE_ENV === 'production', 
                sameSite: 'lax' 
              })
            })
          } catch (error) {
            // Ignore if called from server component
          }
        },
      },
    }
  )

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { success: false, error: error.message }
  }
  
  return { success: true }
}

export async function resetPasswordAction(email: string) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set({ name, value, ...options })
            })
          } catch (error) {}
        },
      },
    }
  )

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://coffinity-v2.vercel.app'}/auth/callback?next=/profile/settings`,
  })

  if (error) return { success: false, error: error.message }
  return { success: true }
}
