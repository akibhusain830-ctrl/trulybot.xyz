import { createServerSupabaseClient } from '@/lib/supabase/server';

interface SessionValidationResult {
  valid: boolean;
  user: any | null;
  error?: string;
  needsRefresh?: boolean;
}

export async function validateSession(): Promise<SessionValidationResult> {
  try {
    const supabase = createServerSupabaseClient();
    
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return {
        valid: false,
        user: null,
        error: 'No active session'
      };
    }

    // Check if token is expired
    const expiresAt = session.expires_at;
    const now = Math.floor(Date.now() / 1000);
    
    if (expiresAt && expiresAt < now) {
      // Token expired, try to refresh
      const { data: { session: newSession }, error: refreshError } = 
        await supabase.auth.refreshSession();
      
      if (refreshError || !newSession) {
        return {
          valid: false,
          user: null,
          error: 'Session expired and refresh failed'
        };
      }
      
      return {
        valid: true,
        user: newSession.user,
        needsRefresh: true
      };
    }

    // Verify user still exists in database
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return {
        valid: false,
        user: null,
        error: 'User not found'
      };
    }

    // Check if user account is active
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('id', user.id)
      .single();
    
    if (profileError || !profile) {
      return {
        valid: false,
        user: null,
        error: 'User profile not found'
      };
    }

    return {
      valid: true,
      user: {
        ...user,
        profile
      }
    };
    
  } catch (error) {
    console.error('Session validation error:', error);
    return {
      valid: false,
      user: null,
      error: 'Session validation failed'
    };
  }
}

export async function requireValidSession() {
  const result = await validateSession();
  
  if (!result.valid) {
    throw new Error(result.error || 'Invalid session');
  }
  
  return result.user;
}
