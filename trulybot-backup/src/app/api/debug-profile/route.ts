import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { ProfileManager } from '@/lib/profile-manager';
import { calculateSubscriptionAccess } from '@/lib/subscription';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
    );

    console.log('🔍 Debug: Starting profile debug...');

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('🔍 Debug: Auth result', { 
      hasUser: !!user, 
      userId: user?.id, 
      email: user?.email,
      authError: authError?.message 
    });
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        debug: {
          hasUser: !!user,
          authError: authError?.message
        }
      }, { status: 401 });
    }

    console.log('🔍 Debug: Calling ProfileManager...');
    
    // Get or create profile using ProfileManager
    const profile = await ProfileManager.getOrCreateProfile(user.id, user.email!);
    
    console.log('🔍 Debug: Profile result', { profile });
    
    // Calculate subscription access
    const subscriptionInfo = calculateSubscriptionAccess(profile);
    
    console.log('🔍 Debug: Subscription info', { subscriptionInfo });

    return NextResponse.json({
      success: true,
      user: {
        ...profile,
        id: user.id,
        email: user.email
      },
      subscription: subscriptionInfo,
      profile,
      debug: {
        profileCreated: true,
        subscriptionCalculated: true,
        hasAccess: subscriptionInfo.has_access
      }
    });

  } catch (error: any) {
    console.error('🔴 Debug API error:', error);
    return NextResponse.json({ 
      error: 'Debug failed', 
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}