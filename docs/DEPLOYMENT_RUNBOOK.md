# Production Deployment Runbook (Phase 4B)

**Target Architecture:** Vercel Pro (`apps/web`) + Render Web Service (`apps/api`, Singapore) + Neon PostgreSQL (Singapore)  
**Fallback Architecture:** Railway Pro (`apps/web`, `apps/api`, Managed PostgreSQL in Singapore)

---

## 1. Pre-Deployment Checklist

1. Client approval signed in `docs/CLIENT_APPROVAL_FORM.md`.
2. Production environment variables configured per `docs/PRODUCTION_ENVIRONMENT.md` (no `.env` committed to Git).
3. `DEMO_MODE=false`, `ONLINE_PAYMENT_ENABLED=false` (Order Request Only), `LIVE_EMAIL_ENABLED=false` / `LIVE_WHATSAPP_ENABLED=false` until client activates each channel.
4. Full CI verification green (`npm run typecheck`, unit tests, E2E tests, `apps/api` build, `apps/web` build).

---

## 2. Database Provisioning & Migration Sequence

1. Create managed PostgreSQL database in Singapore (`ap-southeast-1`) and obtain pooled `DATABASE_URL` and direct `DIRECT_URL` (if using PgBouncer/Neon pooler).
2. Create a pre-migration database snapshot/branch (Neon branch `pre-deploy-<YYYYMMDD>` or `pg_dump` backup).
3. Run Prisma migrations against production:
   ```bash
   npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma
   ```
4. Verify schema status:
   ```bash
   npx prisma migrate status --schema=apps/api/prisma/schema.prisma
   ```
5. Bootstrap initial production admin account securely (via one-time setup script or direct password reset — never ship demo passwords).

---

## 3. Backend API Deployment (`apps/api` on Render)

- **Root Directory:** `.` (monorepo root)
- **Build Command:**
  ```bash
  npm ci && npx prisma generate --schema=apps/api/prisma/schema.prisma && npm --workspace=apps/api run build
  ```
- **Pre-Deploy Command:**
  ```bash
  npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma
  ```
- **Start Command:**
  ```bash
  node apps/api/dist/src/main.js
  ```
- **Health Check Path:** `/api/v1/health`
- **Graceful Shutdown:** `app.enableShutdownHooks()` is enabled in `apps/api/src/main.ts` so `SIGTERM`/`SIGINT` drains active HTTP requests and closes Prisma connections cleanly.

---

## 4. Frontend Storefront Deployment (`apps/web` on Vercel Pro)

- **Root Directory:** `apps/web` (or monorepo root with workspace build)
- **Build Command:** `npm run build`
- **Environment Variable:** `NEXT_PUBLIC_API_URL=https://api.<client-domain>/api/v1`
- **Custom Domain & TLS:** Bind `<client-domain>` and `www.<client-domain>` in Vercel; bind `api.<client-domain>` in Render with automatic Let's Encrypt TLS.

---

## 5. Post-Deploy Smoke Verification

1. `GET https://api.<client-domain>/api/v1/health` returns `200 OK` with `database: "connected"`.
2. Public storefront loads products, refurbished laptops, and services with `isDemo=false`.
3. Test account submits an **Order Request** and receives `PENDING_CONFIRMATION` reference without online payment prompt.
4. Verify `CORS_ORIGIN` rejects unauthorized origins and Swagger docs are disabled or restricted if `NODE_ENV=production`.
