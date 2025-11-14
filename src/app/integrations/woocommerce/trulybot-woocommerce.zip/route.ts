import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://trulybot.xyz'
  const url = `${origin}/api/integrations/woocommerce/download?t=${Date.now()}`
  const res = NextResponse.redirect(url, 302)
  res.headers.set('Cache-Control', 'no-store')
  return res
}

