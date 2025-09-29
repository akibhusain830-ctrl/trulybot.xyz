import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'You must be logged in to start a trial' }, { status: 401 });
    }

    // Check if user already has an active trial or subscription
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('trial_ends_at, subscription_status')
      .eq('id', user.id)
      .single();

    if (profile?.trial_ends_at || profile?.subscription_status === 'active') {
      return NextResponse.json({ error: 'You already have an active trial or subscription' }, { status: 400 });
    }

    // Start 7-day trial
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7);

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        trial_ends_at: trialEndDate.toISOString(),
        subscription_tier: 'ultra',
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error starting trial:', updateError);
      return NextResponse.json({ error: 'Failed to start trial' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Trial started successfully',
      trial_ends_at: trialEndDate.toISOString()
    });

  } catch (error: any) {
    console.error('Start trial error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}