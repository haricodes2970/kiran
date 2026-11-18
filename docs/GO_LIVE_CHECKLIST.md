# Go-Live Cutover Checklist (Phase 4I)

## Pre-Cutover
- [ ] `docs/CLIENT_APPROVAL_FORM.md` signed by Kiran's Infotech.
- [ ] `NODE_ENV=production`, `DEMO_MODE=false`, `ONLINE_PAYMENT_ENABLED=false`.
- [ ] Production PostgreSQL provisioned in Singapore with automated daily backups / PITR enabled.
- [ ] `prisma migrate deploy` succeeded; zero `isDemo=true` rows in production DB.
- [ ] Real catalog, refurbished devices, services, and inventory imported via `import-csv.ts --commit`.
- [ ] Strong unique `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` configured (>= 32 chars).
- [ ] Staging verification passed (full build, health check, order request flow, repair booking flow, admin login).

## Cutover & DNS
- [ ] Point apex/www DNS to Vercel Pro; point `api.<client-domain>` CNAME to Render.
- [ ] Verify HTTPS certificates active on both web and API domains.
- [ ] Verify `CORS_ORIGIN` matches live HTTPS domain(s) exactly.

## Post-Cutover Smoke Checks
- [ ] `GET /api/v1/health` returns `200 OK`.
- [ ] Submit one test Order Request (`PENDING_CONFIRMATION`) -> verify admin dashboard shows it -> cancel test order -> verify inventory restored.
- [ ] Submit one test Repair Booking -> verify reference generated -> clean up test record.
- [ ] Confirm uptime monitor (e.g., UptimeRobot / Better Stack) pinging `/api/v1/health` every 5 minutes.
