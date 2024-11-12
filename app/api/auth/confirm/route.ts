// app/api/auth/confirm/route.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type EmailOtpType } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) 
  {
    try {
  const { searchParams, origin } = new URL(request.url) // Define origin here
  const token_hash = searchParams.get('token_hash') 
  const type = searchParams.get('type') as EmailOtpType | null
  // if "next" is in param, use it as the redirect URL
  const next = (searchParams.get('next') as string) ?? '/'
  const redirectTo = request.nextUrl.clone()
  redirectTo.pathname = next

  if (!token_hash || !type) {
    throw new Error('Missing token_hash or type') 
  }
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

    if (error) {
      throw error // Re-throw the error to be caught by the catch block
    }

    return NextResponse.redirect(redirectTo)
  } catch (error) {
    console.error('Error in /auth/confirm:', error)
    const redirectTo = new URL('/auth/auth-code-error', request.nextUrl.origin)
    return NextResponse.redirect(redirectTo)
  }
}
