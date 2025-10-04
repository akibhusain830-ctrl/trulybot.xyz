import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Handle OAuth errors
  if (error) {
    logger.error('OAuth callback error:', { error, errorDescription })
    return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=${encodeURIComponent(error)}`)
  }

  if (code) {
    try {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
      
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        logger.error('Session exchange error:', exchangeError)
        return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=auth_failed`)
      }

      // Check if email is verified for email/password signups
      if (data.user && !data.user.email_confirmed_at && data.user.app_metadata.provider === 'email') {
        logger.warn('Unverified email attempting access:', { userId: data.user.id })
        return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=email_not_verified`)
      }

      logger.info('Successful authentication:', { 
        userId: data.user?.id, 
        provider: data.user?.app_metadata.provider 
      })

    } catch (error) {
      logger.error('Callback processing error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=callback_failed`)
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${requestUrl.origin}/`)
}
