
import { supabaseAdmin } from '@/lib/supabase/admin';
import { logger } from '@/lib/logger';

export async function ensureUserWorkspace(userId: string, email: string): Promise<string> {
  const supabase = supabaseAdmin;
  
  try {
    // Check if user already has a profile with workspace
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('workspace_id, workspaces(id, name)')
      .eq('id', userId)
      .single();

    if (existingProfile?.workspace_id) {
      return existingProfile.workspace_id;
    }

    // Create workspace for new user
    const workspaceName = email.split('@')[0] + "'s Workspace";
    const workspaceSlug = `workspace-${userId.slice(0, 8)}`;

    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .insert({
        name: workspaceName,
        slug: workspaceSlug,
      })
      .select('id')
      .single();

    if (workspaceError) {
      throw workspaceError;
    }

    // Create or update user profile
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7);

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        workspace_id: workspace.id,
        email,
        role: 'owner',
        trial_ends_at: trialEndDate.toISOString(),
        subscription_status: 'trialing',
      });

    if (profileError) {
      throw profileError;
    }

    logger.info('Created workspace and profile for user', { userId, workspaceId: workspace.id });
    return workspace.id;
  } catch (error) {
    logger.error('Error ensuring user workspace', { userId }, error as Error);
    throw error;
  }
}

export async function getUserWorkspace(userId: string): Promise<{ workspaceId: string; profile: any } | null> {
  const supabase = supabaseAdmin;
  
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        *,
        workspaces (
          id,
          name,
          slug,
          created_at
        )
      `)
      .eq('id', userId)
      .single();

    if (error || !profile?.workspace_id) {
      return null;
    }

    return {
      workspaceId: profile.workspace_id,
      profile
    };
  } catch (error) {
    logger.error('Error getting user workspace', { userId }, error as Error);
    return null;
  }
}

export async function validateWorkspaceAccess(userId: string, workspaceId: string): Promise<boolean> {
  const supabase = supabaseAdmin;
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('workspace_id, role')
      .eq('id', userId)
      .eq('workspace_id', workspaceId)
      .single();

    return !error && !!data;
  } catch (error) {
    logger.error('Error validating workspace access', { userId, workspaceId }, error as Error);
    return false;
  }
}
