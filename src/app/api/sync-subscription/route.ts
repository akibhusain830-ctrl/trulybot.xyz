
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { ProfileManager } from '@/lib/profile-manager';
import { calculateSubscriptionAccess, SubscriptionTier } from '@/lib/subscription';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
  logger.info('sync-subscription:start');
    
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { subscription_tier = 'pro', payment_id } = body;

  logger.info('sync-subscription:activate', { userId: user.id, tier: subscription_tier });

    // Activate subscription using ProfileManager
    const updatedProfile = await ProfileManager.activateSubscription(
      user.id, 
      subscription_tier as SubscriptionTier, 
      payment_id
    );

    const subscriptionInfo = calculateSubscriptionAccess(updatedProfile);

  logger.info('sync-subscription:success', { userId: user.id });

    return NextResponse.json({ 
      success: true,
      message: 'Subscription activated successfully!',
      subscription: subscriptionInfo,
      profile: updatedProfile
    });

  } catch (error: any) {
  logger.error('sync-subscription:error', error);
    return NextResponse.json({ 
      error: 'Failed to sync subscription',
      details: error.message 
    }, { status: 500 });
  }
}
