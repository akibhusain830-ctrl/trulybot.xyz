// Legacy compatibility - redirects to new unified client
import { createClient } from './supabase/client';

export const supabase = createClient();