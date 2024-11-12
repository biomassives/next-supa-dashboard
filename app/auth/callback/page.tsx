// @/app/auth/callback/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AuthCallbackPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check URL parameters first
        const url = new URL(window.location.href)
        const code = url.searchParams.get('code')
        
        // If we have a code, use it
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          if (exchangeError) throw exchangeError
          router.replace('/dashboard')  // Changed from push to replace
          return
        }

        // If no code, check for hash fragment
        const hashFragment = window.location.hash
        if (hashFragment) {
          const params = new URLSearchParams(hashFragment.substring(1))
          const accessToken = params.get('access_token')
          
          if (accessToken) {
            // Verify session with the token
            const { data: { session }, error: sessionError } = await supabase.auth.getSession()
            if (sessionError) throw sessionError
            
            if (session) {
              router.replace('/dashboard')  // Changed from push to replace
              return
            }
          }
        }

        throw new Error('Invalid callback URL format')
        
      } catch (error) {
        console.error('Auth callback error:', error)
        // Redirect to signin instead of auth-test to match your existing flow
        router.replace('/auth/signin?error=' + encodeURIComponent((error as Error).message))
      }
    }

    handleCallback()
  }, [router, supabase.auth])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Completing sign in...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  )
}