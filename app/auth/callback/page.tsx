// app/auth/callback/page.tsx
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
        const hashFragment = window.location.hash
        if (!hashFragment) {
          throw new Error('No hash fragment in URL')
        }

        // Get access token from hash
        const params = new URLSearchParams(hashFragment.substring(1))
        const accessToken = params.get('access_token')
        
        if (!accessToken) {
          throw new Error('No access token found')
        }

        // Get the current session to verify the callback worked
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          throw sessionError
        }

        if (session) {
          router.push('/dashboard')
        } else {
          throw new Error('Session not established')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        router.push('/auth-test?error=' + encodeURIComponent((error as Error).message))
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