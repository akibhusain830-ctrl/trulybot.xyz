/**
 * CRITICAL SECURITY FIX: Tenant Isolation Middleware
 * Ensures strict data isolation between tenants
 * 
 * Features:
 * - Automatic workspace_id injection for all queries
 * - Cross-tenant access prevention
 * - User-workspace relationship validation
 * - Request context enrichment with tenant data
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { logger } from '@/lib/logger';
import { createRequestId } from '@/lib/requestContext';

export interface TenantContext {
  userId: string;
  userEmail: string;
  workspaceId: string;
  role: 'owner' | 'admin' | 'member';
  subscriptionTier: string;
  subscriptionStatus: string;
}

interface TenantValidationResult {
  success: true;
  context: TenantContext;
}

interface TenantValidationError {
  success: false;
  response: NextResponse;
}

/**
 * Validates and extracts tenant context from authenticated request
 */
export async function validateTenantContext(
  req: NextRequest
): Promise<TenantValidationResult | TenantValidationError> {
  const reqId = createRequestId();
  
  try {
    // Validate environment
    const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = process.env;
    if (!NEXT_PUBLIC_SUPABASE_URL || !NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      logger.error('Missing Supabase configuration', { reqId });
      return {
        success: false,
        response: NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
      };
    }

    // Create Supabase client
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
              // Handle cases where cookies cannot be set
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

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      logger.warn('Authentication failed in tenant validation', { reqId, error: authError });
      return {
        success: false,
        response: NextResponse.json({
          error: 'Authentication required',
          code: 'UNAUTHORIZED'
        }, { status: 401 })
      };
    }

    // Get user's profile and workspace information
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        workspace_id,
        role,
        subscription_tier,
        subscription_status,
        trial_ends_at,
        workspaces!inner (
          id,
          name,
          slug,
          created_at
        )
      `)
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      logger.error('Profile not found for authenticated user', { 
        reqId, 
        userId: user.id, 
        error: profileError 
      });
      return {
        success: false,
        response: NextResponse.json({
          error: 'User profile not found',
          code: 'PROFILE_NOT_FOUND'
        }, { status: 404 })
      };
    }

    if (!profile.workspace_id) {
      logger.error('User has no workspace assigned', { reqId, userId: user.id });
      return {
        success: false,
        response: NextResponse.json({
          error: 'No workspace assigned',
          code: 'NO_WORKSPACE'
        }, { status: 403 })
      };
    }

    // Construct tenant context
    const tenantContext: TenantContext = {
      userId: user.id,
      userEmail: user.email || '',
      workspaceId: profile.workspace_id,
      role: profile.role || 'member',
      subscriptionTier: profile.subscription_tier || 'basic',
      subscriptionStatus: profile.subscription_status || 'none'
    };

    logger.info('Tenant context validated successfully', { 
      reqId, 
      userId: user.id, 
      workspaceId: profile.workspace_id,
      role: profile.role
    });

    return {
      success: true,
      context: tenantContext
    };

  } catch (error) {
    logger.error('Tenant validation error', {
      reqId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return {
      success: false,
      response: NextResponse.json({
        error: 'Tenant validation failed',
        code: 'TENANT_VALIDATION_ERROR'
      }, { status: 500 })
    };
  }
}

/**
 * Validates that a user has access to a specific workspace
 */
export async function validateWorkspaceAccess(
  userId: string,
  workspaceId: string
): Promise<boolean> {
  try {
    const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = process.env;
    if (!NEXT_PUBLIC_SUPABASE_URL || !NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return false;
    }

    const cookieStore = cookies();
    const supabase = createServerClient(
      NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get: (name: string) => cookieStore.get(name)?.value,
        }
      }
    );

    const { data: profile } = await supabase
      .from('profiles')
      .select('workspace_id')
      .eq('id', userId)
      .eq('workspace_id', workspaceId)
      .single();

    return !!profile;

  } catch (error) {
    logger.error('Workspace access validation failed', { userId, workspaceId, error });
    return false;
  }
}

/**
 * Middleware wrapper that ensures tenant isolation
 */
export function withTenantIsolation<T extends any[]>(
  handler: (req: NextRequest, context: TenantContext, ...args: T) => Promise<NextResponse>
) {
  return async (req: NextRequest, ...args: T): Promise<NextResponse> => {
    const validationResult = await validateTenantContext(req);
    
    if (!validationResult.success) {
      return validationResult.response;
    }

    // Add tenant context to request headers for downstream use
    req.headers.set('x-tenant-user-id', validationResult.context.userId);
    req.headers.set('x-tenant-workspace-id', validationResult.context.workspaceId);
    req.headers.set('x-tenant-role', validationResult.context.role);

    return handler(req, validationResult.context, ...args);
  };
}

/**
 * Helper to extract workspace ID from request URL parameters
 */
export function extractWorkspaceIdFromParams(
  req: NextRequest,
  params?: Record<string, string>
): string | null {
  // Try URL search params first
  const { searchParams } = new URL(req.url);
  let workspaceId = searchParams.get('workspaceId');
  
  // Try route params
  if (!workspaceId && params) {
    workspaceId = params.workspaceId || params.workspace_id;
  }

  // Try request body for POST/PUT requests
  if (!workspaceId && (req.method === 'POST' || req.method === 'PUT')) {
    // This would need to be extracted from request body in the actual handler
    // since we can't parse the body multiple times
  }

  return workspaceId;
}

/**
 * Validates that the requested workspace matches the user's tenant context
 */
export function validateWorkspaceMatch(
  context: TenantContext,
  requestedWorkspaceId?: string | null
): boolean {
  if (!requestedWorkspaceId) {
    // If no workspace specified in request, use user's workspace
    return true;
  }

  return context.workspaceId === requestedWorkspaceId;
}

/**
 * Creates a secure database query filter for tenant isolation
 */
export function createTenantFilter(workspaceId: string) {
  return {
    workspace_id: workspaceId
  };
}

/**
 * Validates tenant access to specific resources
 */
export async function validateResourceAccess(
  context: TenantContext,
  resourceType: 'lead' | 'document' | 'usage' | 'profile',
  resourceId: string
): Promise<boolean> {
  try {
    const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = process.env;
    if (!NEXT_PUBLIC_SUPABASE_URL || !NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return false;
    }

    const cookieStore = cookies();
    const supabase = createServerClient(
      NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get: (name: string) => cookieStore.get(name)?.value,
        }
      }
    );

    const tableName = getTableName(resourceType);
    
    const { data } = await supabase
      .from(tableName)
      .select('workspace_id')
      .eq('id', resourceId)
      .single();

    return data?.workspace_id === context.workspaceId;

  } catch (error) {
    logger.error('Resource access validation failed', {
      workspaceId: context.workspaceId,
      resourceType,
      resourceId,
      error
    });
    return false;
  }
}

function getTableName(resourceType: string): string {
  switch (resourceType) {
    case 'lead':
      return 'leads';
    case 'document':
      return 'documents';
    case 'usage':
      return 'usage_counters';
    case 'profile':
      return 'profiles';
    default:
      throw new Error(`Unknown resource type: ${resourceType}`);
  }
}
