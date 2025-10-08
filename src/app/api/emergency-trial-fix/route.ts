import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow for specific email (security measure)
    if (user.email !== 'akibhusain830@gmail.com') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { action } = await req.json();

    if (action === 'extend_trial') {
      // Extend trial by 30 days from now
      const newTrialEnd = new Date();
      newTrialEnd.setDate(newTrialEnd.getDate() + 30);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'trial',
          trial_ends_at: newTrialEnd.toISOString(),
          has_used_trial: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Update error:', updateError);
        return NextResponse.json({ error: 'Failed to extend trial' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Trial extended successfully',
        new_trial_end: newTrialEnd.toISOString(),
        days_added: 30
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('Emergency trial fix error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
}
