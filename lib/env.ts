/**
 * Environment variable validation
 * Run this at build time to catch missing variables early
 */

const requiredEnvVars = ['DATABASE_URL'];
const optionalEnvVars = ['NODE_ENV'];

export function validateEnv() {
  const missing: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
      `Please set them in your Vercel project settings under Settings → Environment Variables.`
    );
  }

  console.log('[v0] Environment variables validated successfully');
  return {
    databaseUrl: process.env.DATABASE_URL!,
    nodeEnv: process.env.NODE_ENV || 'production',
  };
}

// Validate on import
if (typeof window === 'undefined') {
  try {
    validateEnv();
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[v0] Environment validation failed:', error);
      throw error;
    }
  }
}
