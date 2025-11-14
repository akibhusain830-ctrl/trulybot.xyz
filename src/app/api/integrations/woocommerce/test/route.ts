import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { decryptCredential } from '@/lib/encryption'

function normalizeUrl(url: string): string {
  let normalized = url.trim().replace(/\/+$/, '')
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = 'https://' + normalized
  }
  return normalized
}

async function testWooCommerceAPI(storeUrl: string, apiKey: string, apiSecret: string) {
  try {
    const testEndpoint = `${normalizeUrl(storeUrl)}/wp-json/wc/v3/system_status`
    const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')
    const response = await fetch(testEndpoint, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${credentials}`,
        'User-Agent': 'TrulyBot-Integration/1.0',
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    })
    if (!response.ok) {
      return { success: false, error: `API returned ${response.status}: ${response.statusText}` }
    }
    const data = await response.json()
    const storeInfo = {
      currency: data.settings?.currency?.value || 'INR',
      timezone: data.settings?.timezone?.value || 'UTC',
      version: data.environment?.wp_version || 'unknown',
      wc_version: data.environment?.wc_version || 'unknown',
    }
    return { success: true, storeInfo }
  } catch (error: any) {
    return { success: false, error: error?.message || 'Unknown error occurred' }
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const user_id = String(body.user_id || '')
    const store_url = String(body.store_url || '')
    if (!user_id || !store_url) {
      return NextResponse.json({ success: false, message: 'Missing user_id or store_url' }, { status: 400 })
    }

    const normalizedUrl = normalizeUrl(store_url)
    const { data: integration } = await supabaseAdmin
      .from('store_integrations')
      .select('api_key_encrypted, api_secret_encrypted')
      .eq('user_id', user_id)
      .eq('platform', 'woocommerce')
      .eq('store_url', normalizedUrl)
      .eq('status', 'active')
      .single()

    if (!integration) {
      return NextResponse.json({ success: false, message: 'No active integration found' }, { status: 404 })
    }

    const apiKey = await decryptCredential(integration.api_key_encrypted as string)
    const apiSecret = await decryptCredential(integration.api_secret_encrypted as string)
    const result = await testWooCommerceAPI(normalizedUrl, apiKey, apiSecret)
    if (!result.success) {
      return NextResponse.json({ success: false, message: result.error }, { status: 400 })
    }
    return NextResponse.json({ success: true, store_info: result.storeInfo })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Internal error' }, { status: 500 })
  }
}

