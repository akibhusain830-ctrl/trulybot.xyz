import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const token = req.headers.get('x-admin-token') || ''
  if (!process.env.ADMIN_API_TOKEN || token !== process.env.ADMIN_API_TOKEN) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json().catch(() => null as any)
  const user_id = String(body?.user_id || '')
  const workspace_id = String(body?.workspace_id || user_id)
  if (!user_id) {
    return NextResponse.json({ success: false, message: 'Missing user_id' }, { status: 400 })
  }
  const { data: existing } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('id', user_id)
    .single()
  if (existing) {
    return NextResponse.json({ success: true, message: 'Profile exists' })
  }
  const { error } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: user_id,
      workspace_id,
      subscription_status: 'active',
      subscription_tier: 'free',
      created_at: new Date().toISOString(),
    })
  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true, message: 'Profile seeded', workspace_id })
}

