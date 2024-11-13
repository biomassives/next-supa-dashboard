// app/auth/callback/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: { code: string; next?: string }
}) {
  const { code } = searchParams

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
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.delete({ name, ...options })
          },
        },
      }
    )

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error exchanging code for session:', error)
      return redirect('/auth/auth-code-error')
    }
  }

  // Redirect to the appropriate page
  return redirect(searchParams.next || '/dashboard')
}

// Add static flag to ensure proper handling
export const dynamic = 'force-dynamic'