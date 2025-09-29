
export function logSupabaseError(message: string, error: any) {
  console.error(`[Supabase Error] ${message}:`, {
    message: error?.message,
    details: error?.details,
    hint: error?.hint,
    code: error?.code,
  });
}
