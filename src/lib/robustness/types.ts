/**
 * Enhanced type definitions that improve type safety while maintaining
 * backward compatibility with existing code
 */

// Generic result types that don't break existing patterns
export interface SafeResult<T> {
  data?: T;
  error?: string;
  success: boolean;
}

// Enhanced any replacements that are backward compatible
export type UnknownRecord = Record<string, unknown>;
export type UnknownFunction = (...args: unknown[]) => unknown;
export type UnknownAsyncFunction = (...args: unknown[]) => Promise<unknown>;

// Gradual type improvements for common patterns
export interface EnhancedProfileData {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  workspace_id?: string;
  subscription_status?: string;
  subscription_tier?: string;
  trial_ends_at?: string | null;
  subscription_ends_at?: string | null;
  has_used_trial?: boolean;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown; // Allows existing any usage while improving type hints
}

// Enhanced error types
export interface EnhancedError {
  message: string;
  code?: string;
  status?: number;
  stack?: string;
  context?: UnknownRecord;
}

// API response types that don't break existing code
export interface EnhancedApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
  timestamp?: string;
  requestId?: string;
  [key: string]: unknown; // Maintains flexibility
}

// Safe type guards that help with gradual typing
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isObject(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export function hasProperty<K extends string>(
  obj: unknown,
  prop: K
): obj is UnknownRecord & Record<K, unknown> {
  return isObject(obj) && prop in obj;
}

// Safe type casting with fallbacks
export function safeString(value: unknown, fallback = ''): string {
  return isString(value) ? value : fallback;
}

export function safeNumber(value: unknown, fallback = 0): number {
  return isNumber(value) ? value : fallback;
}

export function safeBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

export function safeObject(value: unknown, fallback: UnknownRecord = {}): UnknownRecord {
  return isObject(value) ? value : fallback;
}

// Enhanced function types that improve IntelliSense without breaking existing code
export interface EnhancedSupabaseResponse<T = unknown> {
  data: T | null;
  error: {
    message: string;
    code?: string;
    details?: string;
    hint?: string;
  } | null;
}

// Gradual migration helpers
export type LooseUserProfile = {
  id: string;
  email: string;
} & Partial<Omit<EnhancedProfileData, 'id' | 'email'>>;

// Event handler types that are more specific than 'any' but still flexible
export type SafeEventHandler = (event: Event | UnknownRecord) => void | Promise<void>;
export type SafeChangeHandler = (value: string | number | boolean) => void | Promise<void>;
export type SafeClickHandler = (event?: MouseEvent | UnknownRecord) => void | Promise<void>;

// Database operation types
export interface DatabaseOperation<T = unknown> {
  operation: string;
  table: string;
  data?: UnknownRecord;
  filters?: UnknownRecord;
  result?: T;
  error?: EnhancedError;
}

// Enhanced environment types
export interface EnhancedEnvironment {
  NODE_ENV: 'development' | 'production' | 'test';
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  [key: string]: string | undefined;
}

// Utility to safely access environment variables
export function getEnvVar(key: string, fallback?: string): string {
  const value = process.env[key];
  if (!value && !fallback) {
    throw new Error(`Environment variable ${key} is required`);
  }
  return value || fallback || '';
}

// Safe async utilities with better typing
export async function safeAsyncOperation<T>(
  operation: () => Promise<T>,
  fallback?: T
): Promise<SafeResult<T>> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { 
      success: false, 
      error: errorMessage,
      data: fallback 
    };
  }
}
