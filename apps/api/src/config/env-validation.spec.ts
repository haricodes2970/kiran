import {
  analyzeDatabaseUrl,
  validateRuntimeEnvironment,
} from './env-validation';
import { ensurePostgresAvailable } from '../prisma/embedded-pg';

describe('Production Database & Environment Validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('validates external PostgreSQL URL with SSL and pooling parameters', () => {
    const res = analyzeDatabaseUrl(
      'postgresql://user:pass@ep-cool-pooler.ap-south-1.aws.neon.tech/kirans?sslmode=require&pgbouncer=true&connection_limit=10',
    );
    expect(res.valid).toBe(true);
    expect(res.isLocalhost).toBe(false);
    expect(res.hasSslParam).toBe(true);
    expect(res.hasPoolParam).toBe(true);
    expect(res.warnings).toHaveLength(0);
  });

  it('warns when external PostgreSQL URL omits sslmode or pooling parameters', () => {
    const res = analyzeDatabaseUrl(
      'postgresql://user:pass@db.example.com:5432/kirans',
    );
    expect(res.valid).toBe(true);
    expect(res.warnings.length).toBe(2);
  });

  it('rejects missing DATABASE_URL, localhost DB, DEMO_MODE=true, or weak JWT_SECRET in production', () => {
    expect(() =>
      validateRuntimeEnvironment({
        NODE_ENV: 'production',
        DEMO_MODE: 'true',
        DATABASE_URL: 'postgresql://postgres:postgres@127.0.0.1:5432/kirans',
        JWT_SECRET: 'kirans-infotech-dev-jwt-secret-key-2026',
      } as NodeJS.ProcessEnv),
    ).toThrow(/Production environment validation failed/);
  });

  it('accepts valid production configuration', () => {
    expect(() =>
      validateRuntimeEnvironment({
        NODE_ENV: 'production',
        DEMO_MODE: 'false',
        DATABASE_URL:
          'postgresql://app:strongpass@db.neon.tech:5432/kirans?sslmode=require&connection_limit=10',
        JWT_SECRET: 'a-very-secure-production-secret-key-at-least-32-chars',
        CORS_ORIGIN: 'https://kiransinfotech.com',
      } as NodeJS.ProcessEnv),
    ).not.toThrow();
  });

  it('refuses embedded PGlite fallback when NODE_ENV=production and DATABASE_URL is missing', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.DATABASE_URL;
    await expect(ensurePostgresAvailable()).rejects.toThrow(
      /Embedded PostgreSQL fallback is disabled/,
    );
  });
});
