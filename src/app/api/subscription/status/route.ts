import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/protectedRoute';
import { getUserSubscriptionStatus } from '@/lib/subscription/subscriptionService.server';

export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateRequest(req);
    if (!authResult.success) {
      return authResult.response;
    }

    // Get subscription status
    const status = await getUserSubscriptionStatus(authResult.userId);

    return NextResponse.json({
      success: true,
      subscription: status
    });
    
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch subscription status'
    }, { status: 500 });
  }
}
