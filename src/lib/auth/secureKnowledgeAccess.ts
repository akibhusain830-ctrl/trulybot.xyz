import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getUserSubscriptionStatus } from '../subscription/subscriptionService.server';

interface KnowledgeItem {
  id: string;
  content: string;
  filename: string;
  user_id: string;
  created_at: string;
}

/**
 * Secure knowledge base access with tenant isolation
 */
export class SecureKnowledgeAccess {
  
  /**
   * Get knowledge items for a specific user only (tenant isolation)
   */
  static async getUserKnowledge(userId: string, limit: number = 50): Promise<KnowledgeItem[]> {
    const supabase = createServerSupabaseClient();
    
    // CRITICAL: Always filter by user_id to ensure tenant isolation
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('id, content, filename, user_id, created_at')
      .eq('user_id', userId) // TENANT ISOLATION - never trust client-provided user_id
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      throw new Error(`Failed to fetch knowledge: ${error.message}`);
    }
    
    return data || [];
  }
  
  /**
   * Add knowledge item with subscription limits
   */
  static async addKnowledgeItem(
    userId: string, 
    content: string, 
    filename: string
  ): Promise<KnowledgeItem> {
    const supabase = createServerSupabaseClient();
    
    // Check subscription limits
    const subscription = await getUserSubscriptionStatus(userId);
    const maxItems = subscription.features.maxKnowledgeItems;
    
    if (maxItems > 0) { // -1 means unlimited
      const existingCount = await this.getKnowledgeCount(userId);
      if (existingCount >= maxItems) {
        throw new Error(`Knowledge base limit reached. Your ${subscription.tier} plan allows ${maxItems} items.`);
      }
    }
    
    // Insert with explicit user_id (never trust client input)
    const { data, error } = await supabase
      .from('knowledge_base')
      .insert({
        content,
        filename,
        user_id: userId // CRITICAL: Use server-verified user_id
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to add knowledge: ${error.message}`);
    }
    
    return data;
  }
  
  /**
   * Update knowledge item (with ownership verification)
   */
  static async updateKnowledgeItem(
    userId: string,
    itemId: string,
    content: string,
    filename: string
  ): Promise<KnowledgeItem> {
    const supabase = createServerSupabaseClient();
    
    // First verify ownership
    const { data: existing } = await supabase
      .from('knowledge_base')
      .select('user_id')
      .eq('id', itemId)
      .single();
    
    if (!existing || existing.user_id !== userId) {
      throw new Error('Knowledge item not found or access denied');
    }
    
    // Update only if user owns it
    const { data, error } = await supabase
      .from('knowledge_base')
      .update({
        content,
        filename,
        updated_at: new Date().toISOString()
      })
      .eq('id', itemId)
      .eq('user_id', userId) // Double-check ownership
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to update knowledge: ${error.message}`);
    }
    
    return data;
  }
  
  /**
   * Delete knowledge item (with ownership verification)
   */
  static async deleteKnowledgeItem(userId: string, itemId: string): Promise<void> {
    const supabase = createServerSupabaseClient();
    
    // Delete only if user owns it
    const { error } = await supabase
      .from('knowledge_base')
      .delete()
      .eq('id', itemId)
      .eq('user_id', userId); // CRITICAL: Ensure user can only delete their own items
    
    if (error) {
      throw new Error(`Failed to delete knowledge: ${error.message}`);
    }
  }
  
  /**
   * Get knowledge item count for user (for limits)
   */
  static async getKnowledgeCount(userId: string): Promise<number> {
    const supabase = createServerSupabaseClient();
    
    const { count, error } = await supabase
      .from('knowledge_base')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    if (error) {
      throw new Error(`Failed to count knowledge: ${error.message}`);
    }
    
    return count || 0;
  }
  
  /**
   * Search knowledge items for user (tenant-isolated)
   */
  static async searchKnowledge(
    userId: string,
    query: string,
    limit: number = 10
  ): Promise<KnowledgeItem[]> {
    const supabase = createServerSupabaseClient();
    
    // Search only within user's knowledge base
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('id, content, filename, user_id, created_at')
      .eq('user_id', userId) // TENANT ISOLATION
      .or(`content.ilike.%${query}%, filename.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      throw new Error(`Failed to search knowledge: ${error.message}`);
    }
    
    return data || [];
  }
}