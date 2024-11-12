// @/lib/utils/test-auth.ts
export async function testAuth() {
  try {
    const response = await fetch('/api/auth-test', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })
    
    const data = await response.json()
    console.log('Auth test response:', data)
    return data
  } catch (error) {
    console.error('Auth test error:', error)
    throw error
  }
}
