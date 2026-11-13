import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

// Load backend/.env if present (local dev). The path resolves the same from src/ and dist/.
// Variables already set in the shell win, so `DATABASE_URL=... npm run seed` overrides the file.
// On Render there is no .env; env vars come from the dashboard / Blueprint.
const envFile = fileURLToPath(new URL('../.env', import.meta.url));
if (existsSync(envFile)) {
  process.loadEnvFile(envFile);
}

const booleanString = z
  .enum(['true', 'false'])
  .default('false')
  .transform((v) => v === 'true');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1),
  DATABASE_URL_TEST: z.string().min(1).optional(),
  DATABASE_SSL: booleanString,
  CORS_ORIGIN: z
    .string()
    .default('http://localhost:5173')
    .transform((v) =>
      v
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
});

function loadConfig() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Invalid environment configuration:\n${z.prettifyError(parsed.error)}`);
  }
  const env = parsed.data;

  // Vitest sets NODE_ENV=test. Tests must never run against the dev/hosted database,
  // because they truncate tables.
  if (env.NODE_ENV === 'test' && !env.DATABASE_URL_TEST) {
    throw new Error('DATABASE_URL_TEST must be set when NODE_ENV=test');
  }

  return {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    databaseUrl: env.NODE_ENV === 'test' ? env.DATABASE_URL_TEST! : env.DATABASE_URL,
    databaseSsl: env.DATABASE_SSL,
    corsOrigins: env.CORS_ORIGIN,
  } as const;
}

export const config = loadConfig();
export type Config = typeof config;
