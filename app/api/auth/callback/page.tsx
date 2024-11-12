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
        // Get the URL params
        const url = new URL(window.location.href)
        const code = url.searchParams.get('code')
        const next = url.searchParams.get('next') || '/dashboard'

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
          router.push(next)
          return
        }

        // No code found, check for token in hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const access_token = hashParams.get('access_token')
        
        if (access_token) {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession()
          if (sessionError) throw sessionError
          
          if (session) {
            router.push('/dashboard')
            return
          }
        }

        throw new Error('No valid authentication parameters found')

      } catch (error) {
        console.error('Auth callback error:', error)
        router.push('/auth/signin?error=' + encodeURIComponent((error as Error).message))
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