
// @/components/auth-test.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { testAuth } from '@/lib/utils/test-auth'  // Updated path

export default function AuthTest() {
  const [status, setStatus] = useState<any>(null)
  const [error, setError] = useState<any>(null)
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  const supabase = createClient(supabaseUrl, supabaseKey)

  async function checkAuth() {
    try {
      setError(null)
      const result = await testAuth()
      setStatus(result)
    } catch (e) {
      setError(e)
      console.error(e)
    }
  }

  async function testGoogleLogin() {
    try {
      setError(null)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (error) throw error
    } catch (e) {
      setError(e)
      console.error(e)
    }
  }

  async function testPasswordLogin() {
    try {
      setError(null)
      const { error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123'
      })
      if (error) throw error
    } catch (e) {
      setError(e)
      console.error(e)
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="space-x-2">
        <button 
          onClick={checkAuth}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Check Auth Status
        </button>
        <button 
          onClick={testGoogleLogin}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Test Google Login
        </button>
        <button 
          onClick={testPasswordLogin}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Test Password Login
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded">
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
      )}

      {status && (
        <div className="p-4 bg-green-100 text-green-700 rounded">
          <pre>{JSON.stringify(status, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}