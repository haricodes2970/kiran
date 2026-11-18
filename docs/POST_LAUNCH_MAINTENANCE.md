# Post-Launch Maintenance Plan (Phase 4I)

## 1. Daily Automated Checks
- **Uptime Monitoring:** External HTTP monitor checks `GET /api/v1/health` every 5 minutes and alerts on non-200 responses.
- **Database Backups:** Managed Neon PITR / automated daily PostgreSQL snapshots retained per plan.

## 2. Weekly Operations
- Review Render API error logs for `5xx` responses or deferred email/WhatsApp warnings.
- Review `lowStockThreshold` inventory items and pending `PENDING_CONFIRMATION` order requests older than 24 hours.

## 3. Monthly / Quarterly Maintenance
- Run `npm audit` and apply security patch updates for Next.js, NestJS, and Prisma in staging before production.
- Perform a quarterly **backup restoration drill** into a temporary Neon branch/staging DB and verify row counts + `/api/v1/health`.
- Rotate `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` and third-party API keys annually or immediately if staff access changes.
