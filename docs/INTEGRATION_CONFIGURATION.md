# Kiran's Infotech — Integration Configuration & Status Matrix

This document provides an honest, audited breakdown of every external and internal integration in the platform, clearly distinguishing what is **Implemented**, **Locally Tested**, **Awaiting Client Credentials**, **Not Implemented**, or **Requires Client Approval**.

---

## 1. Integration Status Matrix

| Integration / Subsystem | Implementation Status | Verification Status | Notes & Configuration Boundary |
| :--- | :--- | :--- | :--- |
| **PostgreSQL + Prisma ORM (`26` entities)** | **Implemented** | **Locally Tested** (Unit + 9 E2E suites) | Uses native PostgreSQL schema (`apps/api/prisma/schema.prisma`). Connects to external PostgreSQL via `DATABASE_URL` or auto-starts embedded PGlite Postgres 16 in local dev/test. |
| **Email & Password Authentication (JWT + Cookies)** | **Implemented** | **Locally Tested** | Uses `bcryptjs` (cost 12), signed JWTs, and `httpOnly` cookies (`kiran_token`). |
| **Mobile OTP Authentication** | **Implemented (Boundary)** | **Locally Tested (Demo Provider)** | `POST /api/v1/auth/otp/request` and `/verify` implemented with expiry and 5-attempt lockout. Uses deterministic code `123456` when `DEMO_MODE=true`; **Awaiting Client Credentials** for live SMS gateway dispatch. |
| **Google OAuth 2.0** | **Integration Boundary Only** | **Locally Tested (Status Endpoint)** | `GET /api/v1/auth/google/status` reports configuration readiness. **Awaiting Client Credentials** (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`). |
| **WhatsApp Click-to-Chat** | **Implemented** | **Locally Tested** | Floating CTA, product-specific, refurbished-specific, and service-specific `https://wa.me/` links with URL-encoded context. **Awaiting Client Phone Number** (`NEXT_PUBLIC_WHATSAPP_NUMBER`). |
| **WhatsApp Business Cloud API Automation** | **Not Implemented (Phase 3)** | **Requires Client Approval** | Out of scope for Phase 1/2 MVP per PRD Section 5.7; requires Meta Business verification. |
| **Product & Inspection Image URLs** | **Implemented** | **Locally Tested** | Supports external/CDN image URLs stored in `ProductImage` and `RefurbishedDevice.imageUrls`. Direct binary upload to Cloudinary is **Awaiting Client Credentials**. |
| **Order Request Checkout** | **Implemented** | **Locally Tested** | Full cart, stock validation, transactional stock decrement, price snapshots, and stock restoration on cancellation. |
| **Online Payment Gateway (Razorpay)** | **Not Implemented (Modular Boundary)** | **Requires Client Approval** | Controlled by `ONLINE_PAYMENT_ENABLED=false`. `Payment` table and status lifecycle (`PENDING`, `PAID`, `REFUNDED`) are in place once gateway is approved. |
| **Transactional Email Notifications** | **Not Implemented (Env Boundary)** | **Awaiting Client Credentials** | In-app `Notification` model and `RepairUpdate` / `Enquiry` timeline updates are live; SMTP dispatch awaits client credentials. |
