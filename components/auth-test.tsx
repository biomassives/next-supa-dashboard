// @/components/auth-test.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'  // Changed from @supabase/ssr
import { useRouter, useSearchParams } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

type AuthError = {
  message: string
  status?: number
  __isAuthError?: boolean
}

export default function AuthTest() {
  const [status, setStatus] = useState<{ user: User | null } | null>(null)
  const [error, setError] = useState<AuthError | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()

  
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          setError({
            message: 'Failed to initialize session',
            status: 400,
            __isAuthError: true
          })
          return
        }

        if (session) {
          setStatus({ user: session.user })
        }

        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event)
            setStatus({ user: session?.user ?? null })
          }
        )

        return () => {
          subscription.unsubscribe()
        }
      } catch (e) {
        console.error('Auth initialization error:', e)
        setError({
          message: (e as Error).message,
          __isAuthError: true
        })
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [supabase.auth])


  async function checkAuth() {
    try {
      setLoading(true)
      setError(null)
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError
      setStatus({ user })
    } catch (e) {
      setError(e)
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function testGoogleLogin() {
    try {
      setLoading(true)
      setError(null)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      })
      if (error) throw error
    } catch (e) {
      setError(e)
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function signOut() {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setStatus(null)
      router.push('/')
    } catch (e) {
      setError(e)
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="space-x-2">
        <button 
          onClick={checkAuth}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Check Auth Status
        </button>
        <button 
          onClick={testGoogleLogin}
          disabled={loading}
          className="px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
        >
          Sign in with Google
        </button>
        <button 
          onClick={signOut}
          disabled={loading}
          className="px-4 py-2 bg-gray-500 text-white rounded disabled:opacity-50"
        >
          Sign Out
        </button>
      </div>


      <div className="mt-4">
        <p className="text-sm font-medium">
          Status: {loading ? 'Loading...' : status?.user ? 'Authenticated' : 'Not Authenticated'}
        </p>
        {error?.__isAuthError && (
          <p className="text-sm text-red-600">
            Session Error: {error.message}
          </p>
        )}
      </div>


      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded">
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      )}
      {status && (
        <div className="p-4 bg-green-100 text-green-700 rounded">
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(status, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}