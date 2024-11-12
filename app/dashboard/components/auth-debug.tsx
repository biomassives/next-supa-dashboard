// @/components/auth-debug.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function AuthDebug() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function checkAuth() {
      const { data: { session }, error } = await supabase.auth.getSession()
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      setDebugInfo({
        session: session,
        sessionError: error,
        user: user,
        userError: userError,
        timestamp: new Date().toISOString()
      })
    }

    checkAuth()
  }, [supabase.auth])

  if (!debugInfo) return null

  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-white p-4 rounded-lg shadow-lg border border-gray-200">
      <h3 className="font-bold mb-2">Auth Debug Info</h3>
      <pre className="text-xs overflow-auto max-h-48">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  )
}