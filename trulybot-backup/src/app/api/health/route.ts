import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cache } from '@/lib/cache/manager'
import { memoryMonitor } from '@/lib/performance/optimization'

interface HealthCheckResult {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  checks: {
    database: 'pass' | 'fail'
    openai: 'pass' | 'fail'
    environment: 'pass' | 'fail'
  }
  version: string
  uptime: number
}

export async function GET(): Promise<NextResponse<HealthCheckResult>> {
  const startTime = Date.now()
  const checks = {
    database: 'fail' as 'pass' | 'fail',
    openai: 'fail' as 'pass' | 'fail',
    environment: 'fail' as 'pass' | 'fail',
  }

  // Check environment variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'OPENAI_API_KEY',
  ]
  
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])
  if (missingEnvVars.length === 0) {
    checks.environment = 'pass'
  }

  // Check database connectivity
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
    
    if (!error) {
      checks.database = 'pass'
    }
  } catch (error) {
    console.error('Database health check failed:', error)
  }

  // Check OpenAI API
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    })
    
    if (response.ok) {
      checks.openai = 'pass'
    }
  } catch (error) {
    console.error('OpenAI health check failed:', error)
  }

  const isHealthy = Object.values(checks).every(check => check === 'pass')
  const endTime = Date.now()

  const result: HealthCheckResult = {
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    checks,
    version: process.env.VERCEL_GIT_COMMIT_SHA || 'development',
    uptime: endTime - startTime,
  }

  return NextResponse.json(result, {
    status: isHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Content-Type': 'application/json',
    },
  })
}
