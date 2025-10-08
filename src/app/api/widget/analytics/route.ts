import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

interface WidgetAnalyticsData {
  botId: string;
  domain: string;
  eventType: 'load' | 'button_click' | 'chat_opened' | 'chat_closed' | 'message_sent' | 'error';
  timestamp: string;
  userAgent?: string;
  sessionId?: string;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const body = await req.json();
    
    // Validate required fields
    const { botId, domain, eventType, timestamp } = body as WidgetAnalyticsData;
    
    if (!botId || !domain || !eventType || !timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields: botId, domain, eventType, timestamp' },
        { status: 400 }
      );
    }

    // Get request headers for additional context
    const headersList = headers();
    const userAgent = headersList.get('user-agent') || 'Unknown';
    const forwarded = headersList.get('x-forwarded-for');
    const realIP = headersList.get('x-real-ip');
    const clientIP = forwarded?.split(',')[0] || realIP || req.ip || 'Unknown';

    // Prepare analytics data
    const analyticsData = {
      bot_id: botId,
      domain: domain,
      event_type: eventType,
      timestamp: new Date(timestamp).toISOString(),
      user_agent: body.userAgent || userAgent,
      session_id: body.sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      client_ip: clientIP,
      error_message: body.errorMessage || null,
      metadata: body.metadata || {},
      created_at: new Date().toISOString()
    };

    // Check if widget_analytics table exists, create if not
    const { data: tableExists } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'widget_analytics')
      .single();

    if (!tableExists) {
      // Create the table if it doesn't exist
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS widget_analytics (
          id BIGSERIAL PRIMARY KEY,
          bot_id TEXT NOT NULL,
          domain TEXT NOT NULL,
          event_type TEXT NOT NULL,
          timestamp TIMESTAMPTZ NOT NULL,
          user_agent TEXT,
          session_id TEXT,
          client_ip TEXT,
          error_message TEXT,
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_widget_analytics_bot_id ON widget_analytics(bot_id);
        CREATE INDEX IF NOT EXISTS idx_widget_analytics_domain ON widget_analytics(domain);
        CREATE INDEX IF NOT EXISTS idx_widget_analytics_event_type ON widget_analytics(event_type);
        CREATE INDEX IF NOT EXISTS idx_widget_analytics_timestamp ON widget_analytics(timestamp);
        CREATE INDEX IF NOT EXISTS idx_widget_analytics_created_at ON widget_analytics(created_at);
      `;

      const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableQuery });
      
      if (createError) {
        console.error('Error creating widget_analytics table:', createError);
        // Continue anyway, table might already exist
      }
    }

    // Insert analytics data
    const { data, error } = await supabase
      .from('widget_analytics')
      .insert([analyticsData])
      .select()
      .single();

    if (error) {
      console.error('Error inserting widget analytics:', error);
      return NextResponse.json(
        { error: 'Failed to store analytics data' },
        { status: 500 }
      );
    }

    // Update daily aggregates (optional optimization)
    await updateDailyAggregates(supabase, botId, domain, eventType, new Date(timestamp));

    return NextResponse.json(
      { 
        success: true, 
        id: data.id,
        message: 'Analytics data recorded successfully' 
      },
      { 
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );

  } catch (error) {
    console.error('Widget analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { searchParams } = new URL(req.url);
    
    const botId = searchParams.get('botId');
    const domain = searchParams.get('domain');
    const eventType = searchParams.get('eventType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');

    if (!botId) {
      return NextResponse.json(
        { error: 'botId parameter is required' },
        { status: 400 }
      );
    }

    // Build query
    let query = supabase
      .from('widget_analytics')
      .select('*')
      .eq('bot_id', botId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (domain) {
      query = query.eq('domain', domain);
    }

    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    if (startDate) {
      query = query.gte('timestamp', startDate);
    }

    if (endDate) {
      query = query.lte('timestamp', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching widget analytics:', error);
      return NextResponse.json(
        { error: 'Failed to fetch analytics data' },
        { status: 500 }
      );
    }

    // Calculate summary statistics
    const summary = {
      totalEvents: data.length,
      eventTypes: {} as Record<string, number>,
      domains: {} as Record<string, number>,
      errors: data.filter((d: any) => d.event_type === 'error').length,
    };

    data.forEach((event: any) => {
      summary.eventTypes[event.event_type] = (summary.eventTypes[event.event_type] || 0) + 1;
      summary.domains[event.domain] = (summary.domains[event.domain] || 0) + 1;
    });

    return NextResponse.json(
      { 
        data,
        summary,
        pagination: {
          limit,
          total: data.length
        }
      },
      { 
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );

  } catch (error) {
    console.error('Widget analytics GET API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// Helper function to update daily aggregates for better performance
async function updateDailyAggregates(supabase: any, botId: string, domain: string, eventType: string, timestamp: Date) {
  try {
    const date = timestamp.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Check if widget_analytics_daily table exists
    const { data: tableExists } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'widget_analytics_daily')
      .single();

    if (!tableExists) {
      // Create daily aggregates table
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS widget_analytics_daily (
          id BIGSERIAL PRIMARY KEY,
          bot_id TEXT NOT NULL,
          domain TEXT NOT NULL,
          event_type TEXT NOT NULL,
          date DATE NOT NULL,
          count INTEGER DEFAULT 1,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(bot_id, domain, event_type, date)
        );
        
        CREATE INDEX IF NOT EXISTS idx_widget_analytics_daily_bot_id ON widget_analytics_daily(bot_id);
        CREATE INDEX IF NOT EXISTS idx_widget_analytics_daily_date ON widget_analytics_daily(date);
      `;

      await supabase.rpc('exec_sql', { sql: createTableQuery });
    }

    // Upsert daily aggregate
    const { error } = await supabase
      .from('widget_analytics_daily')
      .upsert(
        {
          bot_id: botId,
          domain: domain,
          event_type: eventType,
          date: date,
          count: 1,
          updated_at: new Date().toISOString()
        },
        {
          onConflict: 'bot_id,domain,event_type,date',
          ignoreDuplicates: false
        }
      );

    if (error) {
      // If upsert failed, try to increment existing record
      await supabase.rpc('increment_daily_count', {
        p_bot_id: botId,
        p_domain: domain,
        p_event_type: eventType,
        p_date: date
      });
    }

  } catch (error) {
    console.error('Error updating daily aggregates:', error);
    // Don't throw error, this is optional optimization
  }
}
