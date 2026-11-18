# Production Security Audit & Hardening Report (Phase 4G)

**Audit Date:** 2026-11-18  
**Scope:** Backend (`apps/api`), Frontend (`apps/web`), Database (`apps/api/prisma/schema.prisma`), Integrations, Environment Validation.

---

## 1. Findings & Remediations Applied

| ID | Area | Finding | Severity | Status & Fix |
| --- | --- | --- | --- | --- |
| SEC-01 | Email Idempotency | `EmailService` previously stored `sentKeys` only in an in-memory `Set<string>`, losing deduplication across API restarts or horizontal instances. | Medium | **FIXED:** `EmailService.sendEventEmail()` now checks and persists `EMAIL_SENT_IDEMPOTENCY` keys in PostgreSQL `AuditLog` when `PrismaService` is present, with in-memory `Set` as fast-path cache. Covered by unit test. |
| SEC-02 | Order Idempotency | Double-clicks or retried `POST /api/v1/orders` requests could create duplicate order requests and double-decrement inventory. | Medium | **FIXED:** `CreateOrderDto` accepts optional `idempotencyKey`, checked and persisted atomically inside `OrdersService.createOrder()` `$transaction` via `AuditLog` (`ORDER_IDEMPOTENCY`). Covered by unit test. |
| SEC-03 | Process Lifecycle | NestJS lacked explicit shutdown hooks for `SIGTERM` / `SIGINT` during rolling container deploys. | Low | **FIXED:** Added `app.enableShutdownHooks()` in `apps/api/src/main.ts`. |
| SEC-04 | Path Safety / Shell Injection | Workspace path contains an apostrophe (`Kiran'sInfoTech`); shell interpolation can break or inject commands. | High | **VERIFIED:** Embedded PostgreSQL/scripts avoid unsafe shell string interpolation; new `apps/api/scripts/import-csv.ts` runs strictly in Node without shell invocation. |

---

## 2. Verified Controls

1. **Authentication & RBAC:** JWT access + refresh tokens with `bcrypt` password hashing, `JwtAuthGuard`, `RolesGuard`, and role separation (`CUSTOMER`, `ADMIN`, `STAFF`).
2. **Environment Guardrails (`validateRuntimeEnvironment`):** Rejects weak/default `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` and forbids embedded PGlite fallback when `NODE_ENV=production`.
3. **XSS & Validation:** Global `ValidationPipe` (`whitelist: true`, `transform: true`), HTML escaping in `email.templates.ts` (unit-tested against `<script>` injection).
4. **Secrets Hygiene:** `.env` and `.pglite/` are gitignored; no secrets exposed in `NEXT_PUBLIC_*` frontend variables.
5. **Rate Limiting & CORS:** NestJS `ThrottlerModule` enabled; `CORS_ORIGIN` enforced from environment.
6. **Payment Isolation:** `ONLINE_PAYMENT_ENABLED=false` ensures no unapproved payment capture paths are active.
