import { NextRequest } from 'next/server'
import { createSuccessResponse, createErrorResponse } from '@/lib/apiSecurity'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const srv = process.env.SUPABASE_SERVICE_ROLE_KEY
    const envStatus = {
      hasUrl: !!url,
      hasAnon: !!anon,
      hasServiceRole: !!srv,
      url
    }

    const { data: users, error: listErr } = await supabaseAdmin.auth.admin.listUsers()
    const adminOk = !listErr

    const { data: ping, error: dbErr } = await supabaseAdmin
      .from('profiles').select('id').limit(1)

    const dbOk = !dbErr

    return createSuccessResponse({ envStatus, adminOk, dbOk, sampleUsers: users?.users?.length || 0 })
  } catch (e: any) {
    logger.error('Auth diagnose failed', { error: e })
    return createErrorResponse(e?.message || 'diagnose_failed')
  }
}

