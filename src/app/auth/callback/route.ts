import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { ProfileManager } from '@/lib/profile-manager'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const next = requestUrl.searchParams.get('next') || '/'
  const startTime = Date.now()

  // Validate redirect URL to prevent open redirect attacks
  function validateRedirectUrl(url: string): string {
    try {
      // Allow only relative URLs or URLs to our domain
      if (url.startsWith('/') && !url.startsWith('//')) {
        return url;
      }
      
      const parsed = new URL(url);
      const allowedDomains = [
        'trulybot.xyz',
        'www.trulybot.xyz',
        'localhost',
        '127.0.0.1'
      ];
      
      if (allowedDomains.includes(parsed.hostname.toLowerCase())) {
        return url;
      }
      
      logger.warn('Invalid redirect URL blocked:', { url, hostname: parsed.hostname });
      return '/'; // Default safe redirect
    } catch {
      logger.warn('Malformed redirect URL blocked:', { url });
      return '/'; // Default safe redirect
    }
  }

  const validatedNext = validateRedirectUrl(next);

  // Enhanced logging with performance tracking
  logger.info('🔍 OAuth callback START:', { 
    hasCode: !!code, 
    hasError: !!error, 
    next,
    fullUrl: request.url,
    userAgent: request.headers.get('user-agent') || undefined,
    referer: request.headers.get('referer') || undefined,
    timestamp: new Date().toISOString(),
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  })

  // Handle OAuth errors with enhanced error tracking
  if (error) {
    logger.error('❌ OAuth callback error - REDIRECTING TO SIGN-IN:', { 
      error, 
      errorDescription,
      processingTime: Date.now() - startTime,
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer')
    })
    
    // Track different types of OAuth errors for analytics
    const errorType = error === 'access_denied' ? 'user_cancelled' : 
                     error === 'invalid_request' ? 'config_error' : 
                     'oauth_error'
    
    logger.info('📊 OAuth Error Analytics:', { errorType, error, errorDescription })
    
    return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=${encodeURIComponent(error)}`)
  }

  if (!code) {
    logger.error('❌ No OAuth code provided - REDIRECTING TO SIGN-IN', {
      processingTime: Date.now() - startTime,
      fullUrl: request.url
    })
    return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=no_code`)
  }

  // Process the OAuth code
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    logger.info('🔄 Exchanging OAuth code for session...')
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      logger.error('❌ Session exchange FAILED - REDIRECTING TO SIGN-IN:', { 
        error: exchangeError.message, 
        status: exchangeError.status,
        code: exchangeError.code 
      })
      return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=auth_failed`)
    }

    if (!data.user || !data.session) {
      logger.error('❌ No user or session in exchange result - REDIRECTING TO SIGN-IN:', { 
        hasUser: !!data.user, 
        hasSession: !!data.session 
      })
      return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=no_session`)
    }

    logger.info('✅ Session exchange successful:', { 
        userId: data.user?.id, 
        email: data.user?.email,
        provider: data.user?.app_metadata?.provider,
        hasSession: !!data.session,
        emailConfirmed: data.user?.email_confirmed_at,
        userMetadata: data.user?.app_metadata,
        processingTime: Date.now() - startTime,
        sessionExpiresAt: data.session?.expires_at
      })

      // Track successful OAuth completion for analytics
      logger.info('📊 OAuth Success Analytics:', {
        provider: data.user?.app_metadata?.provider || 'google',
        userAgent: request.headers.get('user-agent') || undefined,
        completionTime: Date.now() - startTime,
        isNewUser: data.user?.created_at ? 
          (Date.now() - new Date(data.user.created_at).getTime() < 60000) : false
      })

      // Check if email is verified for email/password signups ONLY
      // Google OAuth users are automatically verified and don't need email_confirmed_at
      if (data.user && !data.user.email_confirmed_at && data.user.app_metadata?.provider === 'email') {
        logger.warn('Unverified email attempting access:', { userId: data.user.id, provider: data.user.app_metadata?.provider })
        return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=email_not_verified`)
      }

    // Ensure profile exists (fallback in case the DB trigger failed)
    try {
      if (data.user?.id) {
        await ProfileManager.getOrCreateProfile(data.user.id, data.user.email || '')
        logger.info('Profile ensured for authenticated user', { userId: data.user.id })
      }
    } catch (profileError: any) {
      logger.error('Profile ensure failed after OAuth', { error: profileError?.message })
      // Continue redirect; profile can be lazily created later by recovery endpoints
    }

    // Create response with session cookies properly set
    const canonical = (process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin).replace(/\/$/, '')
    const canonicalOrigin = new URL(canonical).origin
    const finalOrigin = requestUrl.origin === canonicalOrigin ? requestUrl.origin : canonicalOrigin
    const redirectUrl = new URL(validatedNext, finalOrigin)
      redirectUrl.searchParams.set('auth', 'success')
      
    const response = NextResponse.redirect(redirectUrl.toString())
      
      // Let Supabase handle its own cookie management - don't manually set auth cookies
      // The createRouteHandlerClient already handles cookie setting properly
      
    logger.info('Redirecting to:', { url: redirectUrl.toString(), hasSession: !!data.session, finalOrigin })
      
      // Remove the setTimeout to prevent memory leaks
      // Session is already established by Supabase
      
      return response

  } catch (error) {
    logger.error('❌ Callback processing error - REDIRECTING TO SIGN-IN:', error)
    return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=callback_failed`)
  }
}
