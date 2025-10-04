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
        hasSession: !!data.session,
        emailConfirmed: data.user?.email_confirmed_at,
        userMetadata: data.user?.app_metadata
      })

      // Check if email is verified for email/password signups ONLY
      // Google OAuth users are automatically verified and don't need email_confirmed_at
      if (data.user && !data.user.email_confirmed_at && data.user.app_metadata?.provider === 'email') {
        logger.warn('Unverified email attempting access:', { userId: data.user.id, provider: data.user.app_metadata?.provider })
        return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=email_not_verified`)
      }

      // Create response with session cookies properly set
      const redirectUrl = new URL(next, requestUrl.origin)
      redirectUrl.searchParams.set('auth', 'success')
      
      const response = NextResponse.redirect(redirectUrl.toString())
      
      // Let Supabase handle its own cookie management - don't manually set auth cookies
      // The createRouteHandlerClient already handles cookie setting properly
      
      logger.info('Redirecting to:', { url: redirectUrl.toString(), hasSession: !!data.session })
      
      // Small delay to ensure the session is properly established
      await new Promise(resolve => setTimeout(resolve, 100))
      
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
