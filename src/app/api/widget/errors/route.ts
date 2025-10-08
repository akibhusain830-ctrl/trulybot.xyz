import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

interface WidgetErrorData {
  botId: string;
  domain: string;
  errorType: 'javascript' | 'network' | 'cors' | 'iframe_blocked' | 'script_load' | 'api' | 'unknown';
  errorMessage: string;
  errorStack?: string;
  timestamp: string;
  userAgent?: string;
  sessionId?: string;
  url?: string;
  lineNumber?: number;
  columnNumber?: number;
  browserInfo?: {
    name: string;
    version: string;
    platform: string;
  };
  metadata?: Record<string, any>;
}

interface ErrorSeverity {
  level: 'low' | 'medium' | 'high' | 'critical';
  impact: string;
  frequency: number;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const body = await req.json();
    
    // Validate required fields
    const { botId, domain, errorType, errorMessage, timestamp } = body as WidgetErrorData;
    
    if (!botId || !domain || !errorType || !errorMessage || !timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields: botId, domain, errorType, errorMessage, timestamp' },
        { status: 400 }
      );
    }

    // Get request headers for additional context
    const headersList = headers();
    const userAgent = headersList.get('user-agent') || 'Unknown';
    const forwarded = headersList.get('x-forwarded-for');
    const realIP = headersList.get('x-real-ip');
    const clientIP = forwarded?.split(',')[0] || realIP || req.ip || 'Unknown';

    // Analyze error severity
    const severity = analyzeErrorSeverity(errorType, errorMessage);

    // Prepare error data
    const errorData = {
      bot_id: botId,
      domain: domain,
      error_type: errorType,
      error_message: errorMessage,
      error_stack: body.errorStack || null,
      timestamp: new Date(timestamp).toISOString(),
      user_agent: body.userAgent || userAgent,
      session_id: body.sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      client_ip: clientIP,
      url: body.url || null,
      line_number: body.lineNumber || null,
      column_number: body.columnNumber || null,
      browser_info: body.browserInfo || null,
      severity_level: severity.level,
      severity_impact: severity.impact,
      metadata: {
        ...body.metadata,
        severity: severity
      },
      created_at: new Date().toISOString()
    };

    // Check if widget_errors table exists, create if not
    const { data: tableExists } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'widget_errors')
      .single();

    if (!tableExists) {
      // Create the table if it doesn't exist
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS widget_errors (
          id BIGSERIAL PRIMARY KEY,
          bot_id TEXT NOT NULL,
          domain TEXT NOT NULL,
          error_type TEXT NOT NULL,
          error_message TEXT NOT NULL,
          error_stack TEXT,
          timestamp TIMESTAMPTZ NOT NULL,
          user_agent TEXT,
          session_id TEXT,
          client_ip TEXT,
          url TEXT,
          line_number INTEGER,
          column_number INTEGER,
          browser_info JSONB,
          severity_level TEXT NOT NULL DEFAULT 'medium',
          severity_impact TEXT,
          metadata JSONB DEFAULT '{}',
          resolved BOOLEAN DEFAULT FALSE,
          resolved_at TIMESTAMPTZ,
          resolved_by TEXT,
          resolution_notes TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_widget_errors_bot_id ON widget_errors(bot_id);
        CREATE INDEX IF NOT EXISTS idx_widget_errors_domain ON widget_errors(domain);
        CREATE INDEX IF NOT EXISTS idx_widget_errors_error_type ON widget_errors(error_type);
        CREATE INDEX IF NOT EXISTS idx_widget_errors_severity ON widget_errors(severity_level);
        CREATE INDEX IF NOT EXISTS idx_widget_errors_timestamp ON widget_errors(timestamp);
        CREATE INDEX IF NOT EXISTS idx_widget_errors_resolved ON widget_errors(resolved);
        CREATE INDEX IF NOT EXISTS idx_widget_errors_created_at ON widget_errors(created_at);
      `;

      const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableQuery });
      
      if (createError) {
        console.error('Error creating widget_errors table:', createError);
        // Continue anyway, table might already exist
      }
    }

    // Insert error data
    const { data, error } = await supabase
      .from('widget_errors')
      .insert([errorData])
      .select()
      .single();

    if (error) {
      console.error('Error inserting widget error:', error);
      return NextResponse.json(
        { error: 'Failed to store error data' },
        { status: 500 }
      );
    }

    // Update error frequency tracking
    await updateErrorFrequency(supabase, botId, domain, errorType, errorMessage);

    // Check if this is a critical error that needs immediate attention
    if (severity.level === 'critical') {
      await sendCriticalErrorAlert(supabase, botId, domain, errorData);
    }

    return NextResponse.json(
      { 
        success: true, 
        id: data.id,
        severity: severity,
        message: 'Error data recorded successfully' 
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
    console.error('Widget error monitoring API error:', error);
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
    const errorType = searchParams.get('errorType');
    const severityLevel = searchParams.get('severityLevel');
    const resolved = searchParams.get('resolved');
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
      .from('widget_errors')
      .select('*')
      .eq('bot_id', botId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (domain) {
      query = query.eq('domain', domain);
    }

    if (errorType) {
      query = query.eq('error_type', errorType);
    }

    if (severityLevel) {
      query = query.eq('severity_level', severityLevel);
    }

    if (resolved !== null) {
      query = query.eq('resolved', resolved === 'true');
    }

    if (startDate) {
      query = query.gte('timestamp', startDate);
    }

    if (endDate) {
      query = query.lte('timestamp', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching widget errors:', error);
      return NextResponse.json(
        { error: 'Failed to fetch error data' },
        { status: 500 }
      );
    }

    // Calculate error statistics
    const statistics = calculateErrorStatistics(data);

    return NextResponse.json(
      { 
        data,
        statistics,
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
    console.error('Widget error monitoring GET API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const body = await req.json();
    const { errorId, resolved, resolvedBy, resolutionNotes } = body;

    if (!errorId) {
      return NextResponse.json(
        { error: 'errorId is required' },
        { status: 400 }
      );
    }

    const updateData: any = {
      resolved: resolved === true,
      resolved_at: resolved === true ? new Date().toISOString() : null,
      resolved_by: resolvedBy || null,
      resolution_notes: resolutionNotes || null
    };

    const { data, error } = await supabase
      .from('widget_errors')
      .update(updateData)
      .eq('id', errorId)
      .select()
      .single();

    if (error) {
      console.error('Error updating widget error:', error);
      return NextResponse.json(
        { error: 'Failed to update error' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        data,
        message: 'Error status updated successfully' 
      },
      { 
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );

  } catch (error) {
    console.error('Widget error monitoring PATCH API error:', error);
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
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// Helper function to analyze error severity
function analyzeErrorSeverity(errorType: string, errorMessage: string): ErrorSeverity {
  const message = errorMessage.toLowerCase();
  
  // Critical errors that prevent widget from functioning
  if (
    errorType === 'script_load' ||
    message.includes('refused to connect') ||
    message.includes('blocked by cors') ||
    message.includes('network error') ||
    message.includes('failed to fetch')
  ) {
    return {
      level: 'critical',
      impact: 'Widget completely non-functional',
      frequency: 1
    };
  }
  
  // High severity errors
  if (
    errorType === 'iframe_blocked' ||
    errorType === 'cors' ||
    message.includes('permission denied') ||
    message.includes('unauthorized') ||
    message.includes('forbidden')
  ) {
    return {
      level: 'high',
      impact: 'Widget partially functional, core features broken',
      frequency: 1
    };
  }
  
  // Medium severity errors
  if (
    errorType === 'api' ||
    errorType === 'network' ||
    message.includes('timeout') ||
    message.includes('server error') ||
    message.includes('bad request')
  ) {
    return {
      level: 'medium',
      impact: 'Some features may not work correctly',
      frequency: 1
    };
  }
  
  // Low severity errors
  return {
    level: 'low',
    impact: 'Minor issues, widget mostly functional',
    frequency: 1
  };
}

// Helper function to calculate error statistics
function calculateErrorStatistics(errors: any[]) {
  const stats = {
    totalErrors: errors.length,
    resolvedErrors: errors.filter((e: any) => e.resolved).length,
    unresolvedErrors: errors.filter((e: any) => !e.resolved).length,
    errorTypes: {} as Record<string, number>,
    severityLevels: {} as Record<string, number>,
    domains: {} as Record<string, number>,
    topErrors: [] as Array<{ message: string; count: number; severity: string }>,
    errorTrends: {
      last24h: 0,
      last7d: 0,
      last30d: 0
    }
  };

  const now = new Date();
  const day24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const day7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const day30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const errorMessageCounts: Record<string, { count: number; severity: string }> = {};

  errors.forEach((error: any) => {
    // Error types
    stats.errorTypes[error.error_type] = (stats.errorTypes[error.error_type] || 0) + 1;
    
    // Severity levels
    stats.severityLevels[error.severity_level] = (stats.severityLevels[error.severity_level] || 0) + 1;
    
    // Domains
    stats.domains[error.domain] = (stats.domains[error.domain] || 0) + 1;
    
    // Error message frequency
    const shortMessage = error.error_message.substring(0, 100);
    if (!errorMessageCounts[shortMessage]) {
      errorMessageCounts[shortMessage] = { count: 0, severity: error.severity_level };
    }
    errorMessageCounts[shortMessage].count++;
    
    // Time-based trends
    const errorDate = new Date(error.created_at);
    if (errorDate > day24h) stats.errorTrends.last24h++;
    if (errorDate > day7d) stats.errorTrends.last7d++;
    if (errorDate > day30d) stats.errorTrends.last30d++;
  });

  // Top errors by frequency
  stats.topErrors = Object.entries(errorMessageCounts)
    .map(([message, data]) => ({ message, count: data.count, severity: data.severity }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return stats;
}

// Helper function to update error frequency tracking
async function updateErrorFrequency(supabase: any, botId: string, domain: string, errorType: string, errorMessage: string) {
  try {
    const errorHash = Buffer.from(`${errorType}:${errorMessage}`).toString('base64').substring(0, 50);
    
    // Check if error frequency table exists
    const { data: tableExists } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'widget_error_frequency')
      .single();

    if (!tableExists) {
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS widget_error_frequency (
          id BIGSERIAL PRIMARY KEY,
          bot_id TEXT NOT NULL,
          domain TEXT NOT NULL,
          error_type TEXT NOT NULL,
          error_hash TEXT NOT NULL,
          error_message TEXT NOT NULL,
          frequency INTEGER DEFAULT 1,
          first_seen TIMESTAMPTZ DEFAULT NOW(),
          last_seen TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(bot_id, domain, error_hash)
        );
        
        CREATE INDEX IF NOT EXISTS idx_widget_error_frequency_bot_id ON widget_error_frequency(bot_id);
        CREATE INDEX IF NOT EXISTS idx_widget_error_frequency_hash ON widget_error_frequency(error_hash);
      `;

      await supabase.rpc('exec_sql', { sql: createTableQuery });
    }

    // Upsert frequency record
    await supabase
      .from('widget_error_frequency')
      .upsert(
        {
          bot_id: botId,
          domain: domain,
          error_type: errorType,
          error_hash: errorHash,
          error_message: errorMessage,
          frequency: 1,
          last_seen: new Date().toISOString()
        },
        {
          onConflict: 'bot_id,domain,error_hash',
          ignoreDuplicates: false
        }
      );

  } catch (error) {
    console.error('Error updating error frequency:', error);
    // Don't throw error, this is optional tracking
  }
}

// Helper function to send critical error alerts
async function sendCriticalErrorAlert(supabase: any, botId: string, domain: string, errorData: any) {
  try {
    // Here you could implement email alerts, Slack notifications, etc.
    console.error(`CRITICAL WIDGET ERROR for bot ${botId} on ${domain}:`, {
      errorType: errorData.error_type,
      errorMessage: errorData.error_message,
      timestamp: errorData.timestamp,
      userAgent: errorData.user_agent
    });

    // Log to alerts table if it exists
    const { error } = await supabase
      .from('widget_alerts')
      .insert([{
        bot_id: botId,
        domain: domain,
        alert_type: 'critical_error',
        alert_message: `Critical widget error: ${errorData.error_message}`,
        error_data: errorData,
        created_at: new Date().toISOString()
      }]);

    if (error && !error.message.includes('does not exist')) {
      console.error('Error creating alert:', error);
    }

  } catch (error) {
    console.error('Error sending critical error alert:', error);
    // Don't throw error, this is optional alerting
  }
}
