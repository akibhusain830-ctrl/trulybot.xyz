
import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getEnv } from '@/lib/config/env';
import { AuthenticationError, AuthorizationError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { getUserWorkspace, validateWorkspaceAccess } from '@/lib/database/setup';

export interface AuthContext {
  user: {
    id: string;
    email: string;
    role?: string;
  };
  workspaceId: string;
  profile: any;
}

export async function authenticateRequest(request: NextRequest): Promise<AuthContext> {
  const NEXT_PUBLIC_SUPABASE_URL = getEnv('NEXT_PUBLIC_SUPABASE_URL');
  const NEXT_PUBLIC_SUPABASE_ANON_KEY = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  
  // Create Supabase client for server-side auth
  const supabase = createServerClient(
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
      },
    }
  );

  // Get user from session
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    logger.warn('Authentication failed', { 
      error: error?.message,
      path: request.nextUrl.pathname 
    });
    throw new AuthenticationError('Invalid or expired session');
  }

  // Get user's workspace
  const workspace = await getUserWorkspace(user.id);
  
  if (!workspace) {
    logger.error('User has no workspace', { userId: user.id });
    throw new AuthorizationError('No workspace found for user');
  }

  logger.debug('User authenticated', {
    userId: user.id,
    workspaceId: workspace.workspaceId,
    path: request.nextUrl.pathname
  });

  return {
    user: {
      id: user.id,
      email: user.email!,
      role: workspace.profile.role,
    },
    workspaceId: workspace.workspaceId,
    profile: workspace.profile,
  };
}

export async function requireWorkspaceAccess(
  request: NextRequest,
  workspaceId: string
): Promise<AuthContext> {
  const auth = await authenticateRequest(request);
  
  if (auth.workspaceId !== workspaceId) {
    const hasAccess = await validateWorkspaceAccess(auth.user.id, workspaceId);
    
    if (!hasAccess) {
      logger.warn('Workspace access denied', {
        userId: auth.user.id,
        requestedWorkspaceId: workspaceId,
        userWorkspaceId: auth.workspaceId
      });
      throw new AuthorizationError('Access denied to workspace');
    }
  }

  return auth;
}
