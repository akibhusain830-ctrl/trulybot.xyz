// Re-export or alias for compatibility with existing imports
// Minimal getEnv utility for compatibility
export function getEnv(key: string): string {
	const value = process.env[key];
	if (!value) throw new Error(`Missing environment variable: ${key}`);
	return value;
}

export function validateEnv() {
	const requiredEnvVars = [
		'NEXT_PUBLIC_SUPABASE_URL',
		'NEXT_PUBLIC_SUPABASE_ANON_KEY',
		'OPENAI_API_KEY'
	];
	const missing = requiredEnvVars.filter((envVar) => !process.env[envVar]);
	if (missing.length > 0) {
		throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
	}
}
