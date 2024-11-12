// @/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/supabase/middleware'

export async function middleware(request: NextRequest) {
  try {
    const { response, authenticated } = await updateSession(request)
    
    // Generate random nonce for CSP
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
    
    // Get response headers
    const requestHeaders = new Headers(response.headers)
    
    // Add CSP header with nonce
    requestHeaders.set(
      'Content-Security-Policy',
      `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval' 'nonce-${nonce}';
        style-src 'self' 'unsafe-inline';
        img-src 'self' blob: data: https:;
        font-src 'self';
        connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL} https://api.supabase.co;
        frame-src 'self' https://accounts.google.com;
        frame-ancestors 'self';
      `.replace(/\s+/g, ' ').trim()
    )
    
    // Set nonce in request header for use in pages
    requestHeaders.set('x-nonce', nonce)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}