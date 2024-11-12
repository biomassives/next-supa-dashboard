// @/components/auth-test.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'  // Changed from @supabase/ssr
import { useRouter, useSearchParams } from 'next/navigation'

export default function AuthTest() {
  const [status, setStatus] = useState<any>(null)
  const [error, setError] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()
  
  useEffect(() => {
    const errorMsg = searchParams.get('error')
    if (errorMsg) {
      setError({ message: decodeURIComponent(errorMsg) })
    }
  }, [searchParams])

  useEffect(() => {
    checkAuth()
  }, [])

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