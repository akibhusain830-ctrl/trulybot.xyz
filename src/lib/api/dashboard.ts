// Profile settings type for chatbot settings management
export type ProfileSettings = {
  chatbot_name?: string;
  welcome_message?: string;
  accent_color?: string;
};

import { supabase } from '@/lib/supabaseClient';

// Add this helper function at the top
const getAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('No authentication token');
  }
  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  };
};

export interface Document {
  id: string;
  content: string;
  filename: string;
  created_at: string;
  status: string;
  updated_at?: string; // Make this optional since it might not exist
}

// Document Management
export const fetchDocuments = async (userId: string): Promise<Document[]> => {
  console.log('Debug: fetchDocuments called with userId:', userId);
  
  try {
    // Remove updated_at from the select since the column doesn't exist
    const { data, error } = await supabase
      .from('documents')
      .select('id, content, filename, created_at, status')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    console.log('Debug: Supabase response:', { data, error });

    if (error) {
      console.error("Error fetching documents from Supabase:", error);
      throw new Error(`Failed to fetch documents: ${error.message}`);
    }
    
    console.log('Debug: Returning documents:', data || []);
    return data || [];
  } catch (err) {
    console.error('Debug: fetchDocuments caught error:', err);
    throw err;
  }
};

// Fix uploadTextDocument
export const uploadTextDocument = async (text: string, filename: string) => {
  console.log('Debug: uploadTextDocument called', { filename, textLength: text.length });
  
  const headers = await getAuthHeaders();
  const response = await fetch('/api/text-upload', {
    method: 'POST',
    headers,
    body: JSON.stringify({ text, filename }),
  });

  const result = await response.json();
  console.log('Debug: Upload API response:', result);

  if (!response.ok) {
    throw new Error(result.error || 'Upload failed');
  }

  return result.document;
};

// Fix updateDocument
export const updateDocument = async (docId: string, content: string): Promise<Document> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`/api/documents/${docId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ content }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Update failed');
  }

  return result;
};

// Fix deleteDocument
export const deleteDocument = async (docId: string) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`/api/documents/${docId}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.error || 'Delete failed');
  }
};

export async function deleteLead(leadId: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('No authentication token');
  }

  const response = await fetch(`/api/leads/${leadId}/delete`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete lead');
  }
}

// Profile/Settings Management
export const fetchProfileSettings = async (userId: string): Promise<ProfileSettings | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('chatbot_name, welcome_message, accent_color')
    .eq('id', userId)
    .maybeSingle();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const saveProfileSettings = async (userId: string, settings: ProfileSettings): Promise<void> => {
  const { error } = await supabase.from('profiles').upsert({
    id: userId,
    ...settings,
  });
  if (error) throw error;
};
