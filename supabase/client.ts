// supabase/client.ts
'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient as createRawClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

// Client Component client
export const createClient = () => {
  return createClientComponentClient<Database>()
}


// Raw client (for direct API access)
export const createDirectClient = () => {
  return createRawClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
      }
    }
  )
}

// Server Component client
export const createServerClient = () => {
  const cookieStore = cookies()
  return createServerComponentClient<Database>({
    cookies: () => cookieStore,
  })
}

