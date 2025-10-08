
import { NextRequest, NextResponse } from 'next/server';
import { calculateSubscriptionAccess } from '@/lib/subscription';
import { ProfileManager } from '@/lib/profile-manager';
import { authenticateRequest } from '@/lib/protectedRoute';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Authentication check using unified system
    const authResult = await authenticateRequest(req);
    if (!authResult.success) {
      return authResult.response;
    }

    // Get or create profile using ProfileManager
    const profile = await ProfileManager.getOrCreateProfile(authResult.userId, authResult.userEmail);
    
    // Calculate subscription access
    const subscriptionInfo = calculateSubscriptionAccess(profile);

    return NextResponse.json({
      user: {
        ...profile,
        id: authResult.userId,
        email: authResult.userEmail
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
