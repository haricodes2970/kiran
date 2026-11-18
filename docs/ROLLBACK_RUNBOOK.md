# Production Rollback & Recovery Runbook (Phase 4B)

## 1. Application Rollback (Zero-Downtime)

- **Frontend (`apps/web` on Vercel Pro):**
  1. Open Vercel Project -> **Deployments**.
  2. Locate the previous known-good production deployment.
  3. Click **Promote to Production** (takes effect in seconds).
- **Backend (`apps/api` on Render):**
  1. Open Render Service -> **Events / Deploys**.
  2. Select the previous healthy deploy and click **Rollback to this deploy**.
  3. Confirm `/api/v1/health` returns `200 OK`.

---

## 2. Database Rollback & Restoration

> **Rule:** Never run `prisma migrate reset` on production.

### Case A: Code-only regression (Schema backwards-compatible)
- Roll back API/Web deployments only; leave the database untouched.

### Case B: Bad migration or accidental data corruption
1. Put API into maintenance mode (scale instance count to `0` or temporarily point `DATABASE_URL` to maintenance).
2. **Neon PITR / Branch Restore (Primary):**
   - Restore to the pre-deploy timestamp (`pre-deploy-<YYYYMMDD>`) via Neon Console -> **Branches / Restore**.
   - Update `DATABASE_URL` if a new branch endpoint was created, or promote restored branch.
3. **Logical Backup Restore (`pg_restore` / `psql`):**
   ```bash
   pg_restore --clean --if-exists --no-owner --dbname="$PRODUCTION_DATABASE_URL" backup_YYYYMMDD.dump
   ```
4. Verify table row counts (`users`, `products`, `orders`, `repair_bookings`) and run `npx prisma migrate status --schema=apps/api/prisma/schema.prisma`.
5. Restart API service and run post-deploy smoke checks.
