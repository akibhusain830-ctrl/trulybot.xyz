'use client';

// Client-side CSRF token management
let cachedToken: string | null = null;

// Get CSRF token from server
export async function getCSRFToken(): Promise<string> {
  if (cachedToken) {
    return cachedToken;
  }
  
  try {
    const response = await fetch('/api/csrf-token');
    const data = await response.json();
    
    if (data.success && data.csrfToken) {
      cachedToken = data.csrfToken;
      return data.csrfToken;
    }
  } catch (error) {
    console.error('Failed to get CSRF token:', error);
  }
  
  throw new Error('Failed to get CSRF token');
}

// Create fetch wrapper that automatically includes CSRF token
export async function secureFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const method = options.method || 'GET';
  
  // Only add CSRF token for state-changing operations
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase())) {
    const token = await getCSRFToken();
    
    options.headers = {
      ...options.headers,
      'X-CSRF-Token': token,
    };
  }
  
  return fetch(url, options);
}

// Clear cached token (call when token becomes invalid)
export function clearCSRFToken(): void {
  cachedToken = null;
}