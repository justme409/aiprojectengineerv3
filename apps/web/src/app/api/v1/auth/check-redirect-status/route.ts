import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (sessionId) {
      // This would check Stripe session status
      // For now, assume success
      return NextResponse.json({
        status: 'completed',
        redirect_url: '/app/dashboard'
      })
    }

    return NextResponse.json({
      authenticated: !!session,
      user: session?.user,
      redirect_url: session ? '/app/dashboard' : '/auth/login'
    })
  } catch (error) {
    console.error('Check redirect status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}