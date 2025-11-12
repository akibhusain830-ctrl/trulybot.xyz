import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { createErrorResponse, createSuccessResponse, createValidationErrorResponse, createRateLimitResponse } from '@/lib/apiSecurity'
import { limitIp } from '@/lib/middleware/rateLimiter'
import { ProfileManager } from '@/lib/profile-manager'

export const dynamic = 'force-dynamic'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  next: z.string().optional()
})

export async function POST(req: NextRequest) {
  const rl = limitIp(req as any as Request, 'global')
  if (rl.limited) {
    return createRateLimitResponse(rl.resetAt, { remaining: rl.remaining })
  }

  try {
    const json = await req.json()
    const parsed = schema.safeParse(json)
    if (!parsed.success) {
      return createValidationErrorResponse(parsed.error.errors.map(e => e.message))
    }

    const { email, password, next } = parsed.data

    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false
    })

    if (createError) {
      if (String(createError.message || '').toLowerCase().includes('already exists')) {
        return createErrorResponse('Account already exists. Please sign in.', 409, { code: 'ACCOUNT_EXISTS' })
      }
      logger.error('Admin signup failed', { error: JSON.stringify(createError) })
      // Fallback: generate a signup link so user can confirm even if createUser fails
      const origin = (process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin).replace(/\/$/, '')
      const finalNext = next && !next.includes('/sign-up') ? next : '/'
      const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(finalNext)}`
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'signup',
        email,
        password,
        options: { redirectTo }
      })
      if (linkError) {
        logger.error('Admin signup link generation failed', { error: JSON.stringify(linkError) })
        return createErrorResponse('Signup failed', 500, { code: 'ADMIN_SIGNUP_FAILED', details: linkError?.message || JSON.stringify(linkError) })
      }
      // Proceed as success (email provider will deliver; Supabase also returns an action_link)
      return createSuccessResponse({ invited: true })
    }

    const origin = (process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin).replace(/\/$/, '')
    const finalNext = next && !next.includes('/sign-up') ? next : '/'
    const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(finalNext)}`

    const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, { redirectTo })
    if (inviteError) {
      logger.warn('Invite by email failed, continuing', { error: JSON.stringify(inviteError) })
    }

    if (created.user?.id) {
      try {
        await ProfileManager.getOrCreateProfile(created.user.id, email)
      } catch (e: any) {
        logger.error('Profile ensure failed after admin signup', { error: e?.message })
      }
    }

    return createSuccessResponse({ invited: true })
  } catch (error: any) {
    return createErrorResponse(error.message || 'Unexpected error')
  }
}
