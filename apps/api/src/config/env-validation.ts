import { Logger } from '@nestjs/common';

const DEFAULT_DEV_JWT_SECRETS = new Set([
  'kirans-infotech-dev-jwt-secret-key-2026',
  'replace-with-at-least-32-char-random-secret-in-env',
]);

export interface DatabaseConfigAnalysis {
  valid: boolean;
  isLocalhost: boolean;
  hasSslParam: boolean;
  hasPoolParam: boolean;
  warnings: string[];
  errors: string[];
}

export function analyzeDatabaseUrl(dbUrl: string | undefined): DatabaseConfigAnalysis {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (!dbUrl || !dbUrl.trim()) {
    errors.push('DATABASE_URL is not set.');
    return {
      valid: false,
      isLocalhost: false,
      hasSslParam: false,
      hasPoolParam: false,
      warnings,
      errors,
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(dbUrl);
  } catch {
    errors.push('DATABASE_URL is not a valid URL.');
    return {
      valid: false,
      isLocalhost: false,
      hasSslParam: false,
      hasPoolParam: false,
      warnings,
      errors,
    };
  }

  if (parsed.protocol !== 'postgresql:' && parsed.protocol !== 'postgres:') {
    errors.push(`Unsupported DATABASE_URL protocol "${parsed.protocol}". Expected postgresql://.`);
  }

  const host = parsed.hostname.toLowerCase();
  const isLocalhost = host === 'localhost' || host === '127.0.0.1' || host === '::1';
  const sslMode = parsed.searchParams.get('sslmode');
  const hasSslParam = Boolean(sslMode && sslMode !== 'disable');
  const hasPoolParam =
    parsed.searchParams.has('connection_limit') ||
    parsed.searchParams.has('pgbouncer') ||
    host.includes('pooler');

  if (!isLocalhost && !hasSslParam) {
    warnings.push(
      'External DATABASE_URL does not specify sslmode=require (or verify-full). Enable TLS in production.',
    );
  }
  if (!isLocalhost && !hasPoolParam) {
    warnings.push(
      'External DATABASE_URL does not specify connection_limit or pgbouncer pooling parameters.',
    );
  }

  return {
    valid: errors.length === 0,
    isLocalhost,
    hasSslParam,
    hasPoolParam,
    warnings,
    errors,
  };
}

export function validateRuntimeEnvironment(
  env: NodeJS.ProcessEnv = process.env,
): void {
  const logger = new Logger('EnvValidation');
  const isProd = env.NODE_ENV === 'production';

  const dbAnalysis = analyzeDatabaseUrl(env.DATABASE_URL);
  for (const w of dbAnalysis.warnings) {
    if (isProd) logger.warn(w);
  }

  if (!isProd) {
    return;
  }

  const fatalErrors: string[] = [...dbAnalysis.errors];

  if (dbAnalysis.isLocalhost && env.ALLOW_LOCALHOST_DB_IN_PROD !== 'true') {
    fatalErrors.push(
      'Production DATABASE_URL cannot point to localhost/127.0.0.1 (embedded fallback is disabled in production).',
    );
  }

  if (env.DEMO_MODE === 'true') {
    fatalErrors.push('DEMO_MODE must be "false" when NODE_ENV=production.');
  }

  const jwtSecret = env.JWT_SECRET || '';
  if (jwtSecret.length < 32 || DEFAULT_DEV_JWT_SECRETS.has(jwtSecret)) {
    fatalErrors.push(
      'JWT_SECRET must be at least 32 characters and must not use a default development placeholder in production.',
    );
  }

  if (!env.CORS_ORIGIN || env.CORS_ORIGIN.includes('localhost')) {
    logger.warn(
      'CORS_ORIGIN is unset or includes localhost in production. Restrict CORS_ORIGIN to the production frontend domain.',
    );
  }

  if (fatalErrors.length > 0) {
    throw new Error(
      `Production environment validation failed:\n- ${fatalErrors.join('\n- ')}`,
    );
  }
}
