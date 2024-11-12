// app/api/auth/confirm/route.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type EmailOtpType } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url) // Define origin here
  const token_hash = searchParams.get('token_hash') as string
  const type = searchParams.get('type') as EmailOtpType | null
  // if "next" is in param, use it as the redirect URL
  const next = (searchParams.get('next') as string) ?? '/'
  const redirectTo = request.nextUrl.clone()
  redirectTo.pathname = next

  if (token_hash && type) {
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

    const { error } = await supabase.auth.verifyOtp({ type, token_hash })

    if (!error) {
      return NextResponse.redirect(redirectTo)
    } else {  // Error handling block
      console.error(error) // Log the error
      redirectTo.pathname = '/auth/auth-code-error'
      return NextResponse.redirect(redirectTo) 
    }
  } else { // No token_hash or type
    redirectTo.pathname = '/auth/auth-code-error' 
    return NextResponse.redirect(`${origin}${redirectTo.pathname}`) 
  }
}