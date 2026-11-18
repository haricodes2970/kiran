# Kiran's Infotech — Production Security Checklist

| Domain | Control | Verification Status |
| :--- | :--- | :--- |
| **Secrets & Env** | `validateRuntimeEnvironment()` rejects default `JWT_SECRET`, `DEMO_MODE=true`, and missing/localhost `DATABASE_URL` when `NODE_ENV=production`. `.env` excluded in `.gitignore`. | Implemented & Unit Tested |
| **Database Access** | Prisma parameterized queries only; embedded PGlite fallback blocked in production; `sslmode=require` and pooling recommended. | Implemented & Unit Tested |
| **Auth & Cookies** | `bcryptjs` (cost 12) password hashing; JWT + `httpOnly`, `sameSite: 'lax'`, `secure: true` (in prod) cookies. | Implemented & E2E Tested |
| **Authorization & IDOR** | `RolesGuard` (`@Roles(RoleName.ADMIN)`) on all `/admin/*` endpoints; ownership checks (`customerId === user.id`) on orders, repairs, enquiries, addresses. | Implemented & E2E Tested |
| **Sensitive Data Stripping** | `costPrice`, `acquisitionCost`, `refurbishmentCost`, `internalNote`, `internalNotes`, `passwordHash` stripped from public & customer responses. | Implemented & Unit/E2E Tested |
| **Webhook Security** | Raw body enabled (`rawBody: true`); HMAC-SHA256 timing-safe verification on WhatsApp (`X-Hub-Signature-256`) and Razorpay (`X-Razorpay-Signature`). | Implemented & Unit Tested |
| **File Upload Security** | Admin-only endpoint; 5MB limit; MIME allowlist (`image/jpeg`, `image/png`, `image/webp`); binary magic-byte header check. | Implemented & Unit Tested |
| **HTTP Hardening** | `helmet()` security headers, `@nestjs/throttler` rate limiting (120 req/min), strict `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })`. | Implemented |
| **Demo Seed Guard** | `prisma/seed.ts` aborts with `SAFETY ABORT` when `NODE_ENV=production`. | Implemented & E2E Tested |
