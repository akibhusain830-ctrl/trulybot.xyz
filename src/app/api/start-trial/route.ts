import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { calculateSubscriptionAccess } from '@/lib/subscription';
import { ProfileManager } from '@/lib/profile-manager';

export async function POST(req: NextRequest) {
  const startedAt = Date.now();
  try {
    // Minimal env validation
    const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = process.env;
    if (!NEXT_PUBLIC_SUPABASE_URL || !NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const cookieStore = cookies();
    const supabase = createServerClient(
      NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get: (name: string) => cookieStore.get(name)?.value,
          set: (name: string, value: string, options: any) => {
            try {
              cookieStore.set({ name, value, ...options });
            } catch {
              // Handle cases where cookies cannot be set (e.g., in middleware)
            }
          },
          remove: (name: string, options: any) => {
            try {
              cookieStore.set({ name, value: '', ...options });
            } catch {
              // Handle cases where cookies cannot be removed
            }
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // Debug logging
    console.log('[start-trial] Auth check:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      authError: authError?.message,
      cookies: Object.keys(cookieStore.getAll()).length
    });
    
    if (authError || !user) {
      console.log('[start-trial] Auth failed:', { authError, user: !!user });
      return NextResponse.json({ 
        error: 'You must be logged in to start a trial',
        debug: {
          authError: authError?.message,
          hasUser: !!user,
          cookieCount: Object.keys(cookieStore.getAll()).length
        }
      }, { status: 401 });
    }

    // Ensure profile exists
    const profile = await ProfileManager.getOrCreateProfile(user.id, user.email || '');

    // Attempt to start trial idempotently
    const { profile: updatedProfile, started, reason } = await ProfileManager.startTrial(user.id);
    const access = calculateSubscriptionAccess(updatedProfile);

    if (!started) {
      // Provide contextual error or redirect
      if (reason === 'active-subscription') {
        return NextResponse.json({
          error: 'You already have an active subscription',
          subscription: access,
          redirect: '/dashboard'
        }, { status: 400 });
      }
      if (reason === 'trial-already-active') {
        return NextResponse.json({
          error: 'Trial already active',
          subscription: access,
          redirect: '/dashboard'
        }, { status: 400 });
      }
      if (reason === 'trial-already-used') {
        return NextResponse.json({
          error: 'You have already used your free trial. Please choose a paid plan to continue.',
          subscription: access,
          redirect: '/pricing'
        }, { status: 400 });
      }
      return NextResponse.json({
        error: 'Unable to start trial',
        subscription: access
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Trial started successfully! Welcome to TrulyBot Ultra.',
      subscription: access,
      profile: updatedProfile,
      redirect: '/dashboard',
      ms: Date.now() - startedAt
    });
  } catch (error: any) {
    console.error('[start-trial:error]', error);
    return NextResponse.json({
      error: 'An unexpected error occurred while starting your trial.',
      code: 'START_TRIAL_FAILURE'
    }, { status: 500 });
  }
}
