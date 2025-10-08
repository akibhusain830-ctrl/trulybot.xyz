import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/protectedRoute';
import { canAccessFeature } from '@/lib/subscription/subscriptionService.server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (!authResult.success) {
      return authResult.response;
    }

    const supabase = createServerSupabaseClient();
    
    const { data: settings, error } = await supabase
      .from('profiles')
      .select('chatbot_name, welcome_message, accent_color, chatbot_logo_url, chatbot_theme, custom_css')
      .eq('id', authResult.userId)
      .single();
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch settings'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      settings
    });
    
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch settings'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (!authResult.success) {
      return authResult.response;
    }

    const body = await req.json();
    const supabase = createServerSupabaseClient();

    // Validate each setting based on subscription tier
    const updates: any = {};

    // Chatbot name (Pro+)
    if (body.chatbot_name !== undefined) {
      const canCustomize = await canAccessFeature(authResult.userId, 'canCustomizeName');
      if (!canCustomize) {
        return NextResponse.json({
          success: false,
          error: 'Chatbot name customization requires Pro or Ultra plan',
          field: 'chatbot_name'
        }, { status: 403 });
      }
      updates.chatbot_name = body.chatbot_name;
    }

    // Welcome message (Pro+)
    if (body.welcome_message !== undefined) {
      const canCustomize = await canAccessFeature(authResult.userId, 'canCustomizeWelcome');
      if (!canCustomize) {
        return NextResponse.json({
          success: false,
          error: 'Welcome message customization requires Pro or Ultra plan',
          field: 'welcome_message'
        }, { status: 403 });
      }
      updates.welcome_message = body.welcome_message;
    }

    // Accent color (Ultra only)
    if (body.accent_color !== undefined) {
      const canCustomize = await canAccessFeature(authResult.userId, 'canCustomizeColor');
      if (!canCustomize) {
        return NextResponse.json({
          success: false,
          error: 'Color customization requires Ultra plan',
          field: 'accent_color'
        }, { status: 403 });
      }
      updates.accent_color = body.accent_color;
    }

    // Logo (Ultra only)
    if (body.chatbot_logo_url !== undefined) {
      const canCustomize = await canAccessFeature(authResult.userId, 'canCustomizeLogo');
      if (!canCustomize) {
        return NextResponse.json({
          success: false,
          error: 'Logo customization requires Ultra plan',
          field: 'chatbot_logo_url'
        }, { status: 403 });
      }
      updates.chatbot_logo_url = body.chatbot_logo_url;
    }

    // Theme (Ultra only)
    if (body.chatbot_theme !== undefined) {
      const canCustomize = await canAccessFeature(authResult.userId, 'canCustomizeTheme');
      if (!canCustomize) {
        return NextResponse.json({
          success: false,
          error: 'Theme customization requires Ultra plan',
          field: 'chatbot_theme'
        }, { status: 403 });
      }
      updates.chatbot_theme = body.chatbot_theme;
    }

    // Custom CSS (Ultra only)
    if (body.custom_css !== undefined) {
      const canCustomize = await canAccessFeature(authResult.userId, 'canCustomizeCSS');
      if (!canCustomize) {
        return NextResponse.json({
          success: false,
          error: 'Custom CSS requires Ultra plan',
          field: 'custom_css'
        }, { status: 403 });
      }
      updates.custom_css = body.custom_css;
    }

    // Update settings in database
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', authResult.userId);
    
    if (error) {
      console.error('Error updating settings:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to update settings'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update settings'
    }, { status: 500 });
  }
}
