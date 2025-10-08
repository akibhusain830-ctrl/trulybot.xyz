
import { NextRequest, NextResponse } from 'next/server';
import { calculateSubscriptionAccess } from '@/lib/subscription';
import { ProfileManager } from '@/lib/profile-manager';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create profile using ProfileManager
    const profile = await ProfileManager.getOrCreateProfile(user.id, user.email!);
    
    // Calculate subscription access
    const subscriptionInfo = calculateSubscriptionAccess(profile);

    return NextResponse.json({
      user: {
        ...profile,
        id: user.id,
        email: user.email
      },
      subscription: subscriptionInfo,
      profile
    });

  } catch (error: any) {
    console.error('🔴 Profile API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch profile', 
      details: error.message 
    }, { status: 500 });
  }
}
