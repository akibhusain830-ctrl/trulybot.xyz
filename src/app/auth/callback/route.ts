import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const next = requestUrl.searchParams.get('next') || '/'

  logger.info('OAuth callback received:', { 
    hasCode: !!code, 
    hasError: !!error, 
    next,
    userAgent: request.headers.get('user-agent') || undefined,
    referer: request.headers.get('referer') || undefined
  })

  // Handle OAuth errors
  if (error) {
    logger.error('OAuth callback error:', { error, errorDescription })
    return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=${encodeURIComponent(error)}`)
  }

  if (code) {
    try {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
      
      logger.info('Exchanging code for session...')
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        logger.error('Session exchange error:', exchangeError)
        return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=auth_failed`)
      }

      logger.info('Session exchange successful:', { 
        userId: data.user?.id, 
        email: data.user?.email,
        provider: data.user?.app_metadata?.provider,
        hasSession: !!data.session 
      })

      // Check if email is verified for email/password signups
      if (data.user && !data.user.email_confirmed_at && data.user.app_metadata.provider === 'email') {
        logger.warn('Unverified email attempting access:', { userId: data.user.id })
        return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=email_not_verified`)
      }

      // Create response with session cookies properly set
      const redirectUrl = new URL(next, requestUrl.origin)
      redirectUrl.searchParams.set('auth', 'success')
      
      const response = NextResponse.redirect(redirectUrl.toString())
      
      // Ensure session cookies are properly set with secure options
      if (data.session) {
        const maxAge = 60 * 60 * 24 * 7; // 7 days
        const cookieOptions = {
          path: '/',
          maxAge,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax' as const
        }
        
        // Set the auth cookie explicitly to ensure it's available immediately
        response.cookies.set('sb-access-token', data.session.access_token, cookieOptions)
        response.cookies.set('sb-refresh-token', data.session.refresh_token, cookieOptions)
      }

      logger.info('Redirecting to:', { url: redirectUrl.toString() })
      
      // Force a longer delay to ensure the session is properly set and cookies are written
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return response

    } catch (error) {
      logger.error('Callback processing error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=callback_failed`)
    }
  }

  // If no code and no error, something went wrong
  logger.warn('OAuth callback received without code or error')
  return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=invalid_callback`)
}
