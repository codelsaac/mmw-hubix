import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),

  // NextAuth
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  NEXTAUTH_SECRET: z
    .string()
    .min(32, 'NEXTAUTH_SECRET must be at least 32 characters long'),

  // Optional: AI Chat
  OPENROUTER_API_KEY: z.string().optional(),

  // Optional: Sentry Error Monitoring
  SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  SENTRY_ENVIRONMENT: z.string().optional(),
  SENTRY_TRACES_SAMPLE_RATE: z.string().optional(),
  SENTRY_REPLAYS_SESSION_SAMPLE_RATE: z.string().optional(),
  SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE: z.string().optional(),

  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validate environment variables
 * Throws an error in production if validation fails
 */
export function validateEnv(): Env {
  try {
    const parsed = envSchema.parse(process.env);
    console.log('✅ Environment variables validated successfully');
    return parsed;
  } catch (error) {
    console.error('❌ Invalid environment variables:');
    
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    }

    // In production, throw error to prevent app from starting with invalid config
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Environment validation failed. Please check your .env configuration.');
    }

    // In development, just warn
    console.warn('⚠️ Application may not function correctly with invalid environment variables.');
    return process.env as Env;
  }
}

/**
 * Get validated environment variables
 */
export function getEnv(): Env {
  return validateEnv();
}

/**
 * Check if a specific environment variable is set
 */
export function hasEnvVar(key: keyof Env): boolean {
  return !!process.env[key];
}

/**
 * Get environment variable with fallback
 */
export function getEnvVar(key: keyof Env, fallback?: string): string {
  return process.env[key] || fallback || '';
}

// Validate on import (server-side only)
if (typeof window === 'undefined') {
  validateEnv();
}
