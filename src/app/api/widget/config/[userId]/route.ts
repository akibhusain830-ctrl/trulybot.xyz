
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    // Fetch user's chatbot settings
    const { data, error } = await supabase
      .from('profiles')
      .select('chatbot_name, welcome_message, accent_color')
      .eq('id', userId)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Configuration not found' }, { status: 404 });
    }

    return NextResponse.json({
      chatbot_name: data.chatbot_name || 'Assistant',
      welcome_message: data.welcome_message || 'Hello! How can I help you today?',
      accent_color: data.accent_color || '#2563EB',
    });

  } catch (error) {
    console.error('Widget config error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
