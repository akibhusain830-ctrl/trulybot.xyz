import { NextResponse, NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { logger } from '@/lib/logger'

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  checks: {
    database: { status: 'ok' | 'error'; latency?: number; error?: string }
    redis: { status: 'ok' | 'error'; latency?: number; error?: string }
    openai: { status: 'ok' | 'error'; error?: string }
    environment: { status: 'ok' | 'error'; missing?: string[] }
  }
  version: string
  uptime: number
  responseTime: number
}

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest): Promise<NextResponse<HealthCheckResult>> {
  const startTime = Date.now()
  const checks: HealthCheckResult['checks'] = {
    database: { status: 'ok' },
    redis: { status: 'ok' },
    openai: { status: 'ok' },
    environment: { status: 'ok' },
  }

  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'

  // Check environment variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'OPENAI_API_KEY',
  ]
  
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])
  if (missingEnvVars.length > 0) {
    checks.environment = { status: 'error', missing: missingEnvVars }
    overallStatus = 'unhealthy'
  }

  // Check database connectivity
  try {
    const dbStart = Date.now()
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
    
    const { error } = await supabase
      .from('users')
      .select('id')
      .limit(1)
      .single()
    
    const dbLatency = Date.now() - dbStart
    if (error) {
      checks.database = { status: 'error', latency: dbLatency, error: error.message }
      overallStatus = 'unhealthy'
    } else {
      checks.database = { status: 'ok', latency: dbLatency }
      if (dbLatency > 1000) {
        overallStatus = 'degraded'
        logger.warn('Database latency high', { latency: dbLatency })
      }
    }
  } catch (error) {
    checks.database = { 
      status: 'error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
    overallStatus = 'unhealthy'
    logger.error('Database health check failed', { error })
  }

  // Check OpenAI API
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    })
    
    if (!response.ok) {
      checks.openai = { status: 'error', error: `HTTP ${response.status}` }
      overallStatus = 'degraded'
    }
  } catch (error) {
    checks.openai = { 
      status: 'error', 
      error: error instanceof Error ? error.message : 'Connection failed' 
    }
    overallStatus = 'degraded'
    logger.warn('OpenAI health check failed', { error })
  }

  const responseTime = Date.now() - startTime

  const result: HealthCheckResult = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    checks,
    version: process.env.VERCEL_GIT_COMMIT_SHA || 'development',
    uptime: process.uptime(),
    responseTime,
  }

  const statusCode = overallStatus === 'healthy' ? 200 : 
                     overallStatus === 'degraded' ? 200 : 
                     503

  return NextResponse.json(result, {
    status: statusCode,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Content-Type': 'application/json',
    },
  })
}
