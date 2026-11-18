# Kiran's Infotech — Phase 3 Implementation Plan
**Production Infrastructure & Business Integrations**

---

## 1. Infrastructure Audit Summary

Audited current repository state (`main` @ `b9b88d0`):
- **Database (`apps/api/src/prisma/`):** Prisma schema has 26 normalized models and 13 enums. Currently `ensurePostgresAvailable()` in `embedded-pg.ts` falls back to embedded PGlite when `127.0.0.1:5432` is unreachable; in production, this must **never** happen and `DATABASE_URL` + `JWT_SECRET` must be strictly validated at boot.
- **Notifications / Email:** `Notification` table exists in Prisma, but no email provider abstraction, HTML/text templates, retry logic, or deduplication service exists yet.
- **WhatsApp:** Frontend has click-to-chat CTA (`buildWhatsAppUrl` in `apps/web/src/lib/api.ts`). Backend lacks a Meta WhatsApp Cloud API adapter, webhook challenge/signature verification, template mapping, and opt-in consent boundary.
- **Media / File Storage:** `ProductImage` and `RefurbishedDevice.imageUrls` store URLs, but there is no server-side upload endpoint, magic-byte/MIME/size validation, or Cloudinary storage adapter.
- **Payments:** `Order` and `Payment` tables exist with `ONLINE_PAYMENT_ENABLED=false` order-request workflow. No Razorpay architecture assessment or signature-verification boundary exists yet.
- **Hosting & Security:** `DEPLOYMENT.md` covers basic commands; needs full production hosting/cost/DNS/backup/rollback architecture and security checklist.

---

## 2. Workstreams & Execution Order

| # | Workstream | Proceeds Without Client Credentials? | Requires Client Approval / Credentials for Live Activation? |
| :--- | :--- | :--- | :--- |
| **1** | **Production Database Readiness** (`env-validation.ts`, `embedded-pg.ts` prod guard, `docs/PRODUCTION_DATABASE.md`) | **Yes** (code, validation, migration/backup docs, unit tests) | **Yes** — Provisioning managed PostgreSQL & `DATABASE_URL` |
| **2** | **Email Integration** (`NotificationsModule`, `EmailProvider`, `SandboxEmailAdapter`, `ResendEmailAdapter`, templates, retry/dedup, `docs/EMAIL_INTEGRATION.md`) | **Yes** (adapter, templates, sandbox mode, unit tests) | **Yes** — Resend/SMTP credentials & verified business sender email |
| **3** | **WhatsApp Business Integration** (`WhatsappModule`, `WhatsAppProvider`, `MetaCloudWhatsAppAdapter`, webhook signature verification, `docs/WHATSAPP_INTEGRATION.md`) | **Yes** (adapter, webhook HMAC verification, sandbox mode, tests) | **Yes** — Official WhatsApp Business number, Meta Access Token, Phone Number ID, App Secret, approved templates |
| **4** | **File & Image Storage** (`StorageModule`, `StorageProvider`, `CloudinaryStorageAdapter`, magic-byte/MIME/size validation, `docs/FILE_STORAGE.md`) | **Yes** (adapter, upload validation, sandbox mode, unit tests) | **Yes** — Cloudinary account credentials |
| **5** | **Hosting & Domain Architecture** (`docs/HOSTING_AND_DOMAIN.md`) | **Yes** (architecture, cost estimates, DNS/SSL/CORS/rollback docs) | **Yes** — Hosting account approval, domain purchase/DNS, live deploy |
| **6** | **Payment Gateway Readiness** (`PaymentsModule` boundary, Razorpay HMAC verifier, `docs/PAYMENT_GATEWAY_ASSESSMENT.md`) | **Yes** (architecture assessment, signature verifier boundary, tests) | **Yes** — Client approval to enable online payments & Razorpay KYC |
| **7** | **Security Review & Client Approvals** (`docs/PRODUCTION_SECURITY_CHECKLIST.md`, `docs/CLIENT_APPROVALS.md`) | **Yes** | **Yes** — Sign-off checklist |

---

## 3. Architectural Risks & Mitigations

1. **Silent Embedded DB Fallback in Production:** If `DATABASE_URL` is misconfigured in production, falling back to `.pglite` would cause data loss on container restart.
   - *Mitigation:* Hard-fail in `ensurePostgresAvailable()` and `validateProductionConfig()` when `NODE_ENV === 'production'`.
2. **Webhook Spoofing (WhatsApp / Razorpay):** Unverified POST webhooks allow forged delivery or payment events.
   - *Mitigation:* Enable `rawBody: true` in NestJS and verify `X-Hub-Signature-256` / `X-Razorpay-Signature` using `crypto.timingSafeEqual`.
3. **Malicious File Uploads:** Trusting client `Content-Type` or extension allows polyglot/SVG XSS uploads.
   - *Mitigation:* Enforce admin-only upload guard, 5MB limit, MIME allowlist (`image/jpeg`, `image/png`, `image/webp`), and binary magic-byte inspection.
4. **Accidental Live Messaging in Dev/Demo:** Sending real emails or WhatsApp messages to demo seed addresses/numbers.
   - *Mitigation:* Default `EMAIL_ENABLED=false` and `WHATSAPP_CLOUD_ENABLED=false`; route to sandbox adapters unless explicitly enabled in production.
