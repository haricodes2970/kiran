# Kiran's Infotech — Production PostgreSQL Guide

## 1. Architecture & Embedded Fallback Guardrail

- **Development / Local Test:** When `NODE_ENV !== 'production'` and `127.0.0.1:5432` has no PostgreSQL server listening, `apps/api/src/prisma/embedded-pg.ts` starts an embedded PGlite PostgreSQL 16 instance in `.pglite/kirans_pgdata` (or `memory://` in E2E tests).
- **Production (`NODE_ENV=production`):** Embedded fallback is **strictly disabled**. `validateRuntimeEnvironment()` (`apps/api/src/config/env-validation.ts`) and `ensurePostgresAvailable()` abort startup immediately if `DATABASE_URL` is missing, invalid, or points to `localhost`/`127.0.0.1`.

---

## 2. Connection Pooling & SSL Configuration

Recommended managed PostgreSQL providers: **Neon**, **Supabase**, or **AWS RDS PostgreSQL 16**.

### Recommended Production `DATABASE_URL` Format
```text
postgresql://<db_user>:<db_password>@<pooler-host>:5432/kirans_infotech?sslmode=require&pgbouncer=true&connection_limit=10
```
- **SSL/TLS:** Always require `sslmode=require` (or `sslmode=verify-full` with CA cert) for managed cloud databases.
- **Connection Pooling:** Use the provider's PgBouncer/pooler endpoint (`pgbouncer=true`) with `connection_limit=10` (adjust per container concurrency) so Prisma does not exhaust max PostgreSQL connections during traffic spikes or horizontal scaling.
- **Direct URL for Migrations:** If using PgBouncer in transaction mode, run `prisma migrate deploy` against the direct (non-pooled) connection string.

---

## 3. Production Migration & Seed Safety

1. **Deploy Migrations (Non-Destructive):**
   ```bash
   DATABASE_URL="<direct-postgres-url>" npm --workspace=apps/api run prisma:migrate:deploy
   ```
   Never run `prisma migrate reset` or `prisma db push --force-reset` against production.
2. **Initial Admin Bootstrap:**
   Configure `ADMIN_BOOTSTRAP_TOKEN` in environment variables and call `POST /api/v1/auth/bootstrap-admin` once, then remove or rotate `ADMIN_BOOTSTRAP_TOKEN`.
3. **Demo Seed Safety:**
   - `apps/api/src/main.ts` only auto-seeds when `NODE_ENV !== 'production' && DEMO_MODE !== 'false'`.
   - `apps/api/prisma/seed.ts` throws `SAFETY ABORT` if `NODE_ENV === 'production'` unless `ALLOW_DEMO_SEED_IN_PROD=true` is explicitly set.

---

## 4. Backup, Restore & Rollback Procedures

- **Automated Backups:** Enable daily automated snapshots + Point-in-Time Recovery (PITR) WAL archiving on the managed PostgreSQL provider (minimum 7–30 day retention).
- **Manual Pre-Migration Logical Backup:**
  ```bash
  pg_dump "$DIRECT_DATABASE_URL" --format=custom --no-owner --no-acl -f backup_$(date +%Y%m%d_%H%M%S).dump
  ```
- **Restore Procedure:**
  ```bash
  pg_restore --dbname="$DIRECT_DATABASE_URL" --clean --if-exists --no-owner --no-acl backup_YYYYMMDD_HHMMSS.dump
  ```
- **Migration Rollback:** Prefer forward-only additive migrations. If a migration fails or breaks compatibility, restore the pre-migration snapshot and redeploy the previous API container image.
