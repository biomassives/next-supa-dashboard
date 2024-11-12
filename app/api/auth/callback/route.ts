// /app/api/auth/callback/route.ts

import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { type CookieOptions, createServerClient } from '@supabase/ssr'



/**
 * OAuth with PKCE flow for SSR
 *
 * @link https://supabase.com/docs/guides/auth/server-side/oauth-with-pkce-flow-for-ssr
 */


export async function GET(request: Request) {


  const  
 { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')  
 ?? '/'
  const redirectTo = request.nextUrl.clone()
  redirectTo.pathname = next
  


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
            cookieStore.delete({ name, ...options })
          },
        },
      }
    )



    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(redirectTo)  

    } else {
      console.error(error)
      redirectTo.pathname = '/auth/auth-code-error'
      return NextResponse.redirect(`${origin}${redirectTo.pathname}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}