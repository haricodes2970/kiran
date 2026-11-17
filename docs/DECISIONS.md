# Architecture Decision Records (ADRs) & Project Decisions

Append-only log of architectural and product decisions made during implementation.

---

## ADR-001: Modular Monolith in a Monorepo (`apps/api` + `apps/web` + `packages/shared`)
- **Date:** 2026-11-17
- **Status:** Accepted
- **Context:** The platform requires a public storefront, customer portal, and admin dashboard sharing business rules and a single PostgreSQL database.
- **Decision:** Use a single repository with workspace packages: `apps/api` (NestJS modular monolith REST API), `apps/web` (Next.js 14 App Router frontend), and `packages/shared` (shared TypeScript DTO interfaces, enums, and constants).
- **Reason:** Enforces a clean API boundary (`/api/v1`) with server-side validation and authorization in NestJS while avoiding microservice complexity.

## ADR-002: Refurbished Devices Model Linked Optionally to Product Catalogue
- **Date:** 2026-11-17
- **Status:** Accepted
- **Context:** Technical requirements note that refurbished devices need individual serial/asset tracking, 9-stage refurbishment lifecycle, acquisition cost privacy, and `DeviceInspection` records, while also being discoverable by customers.
- **Decision:** Model `RefurbishedDevice` as a dedicated first-class entity with its own 9-stage `RefurbishedStatus` enum (`PURCHASED`, `RECEIVED`, `INSPECTION_PENDING`, `UNDER_INSPECTION`, `REFURBISHMENT`, `QUALITY_CHECK`, `READY_FOR_SALE`, `PUBLISHED`, `SOLD`), one-to-many `DeviceInspection` records, specification JSON/entries, images, and an optional foreign key `productId` linking to a base `Product` when applicable.
- **Reason:** Prevents a unique second-hand laptop from being sold twice, keeps acquisition costs (`acquisitionCost`) strictly isolated from public catalogue queries, and supports the full intake-to-sale lifecycle.

## ADR-003: Configurable Defaults for Pending Client Policy Decisions
- **Date:** 2026-11-17
- **Status:** Accepted
- **Context:** Eight client business decisions are marked pending in the PRD (guest repair booking, online payment vs order request, delivery vs pickup, GST fields, WhatsApp number, etc.).
- **Decision:**
  1. **Guest Repair Booking:** Controlled via `ALLOW_GUEST_REPAIR_BOOKING` (defaults to `false` so repair bookings link to an authenticated customer account, while allowing guest contact capture when toggled `true`).
  2. **Checkout / Payment:** Implemented as an **Order Request workflow** (`OrderStatus.PENDING_CONFIRMATION`, `PaymentStatus.PENDING`) with modular payment records (`Payment`) ready for Razorpay activation once `ONLINE_PAYMENT_ENABLED=true`.
  3. **Fulfilment:** Support both `STORE_PICKUP` and `DELIVERY` on orders.
  4. **Demo Data Safety:** Every seeded entity carries an `isDemo: Boolean` flag and the seed script refuses to run when `NODE_ENV=production` unless `ALLOW_DEMO_SEED_IN_PROD=true` is explicitly set.

## ADR-004: Embedded / Local PostgreSQL Support for Zero-Friction Development & Testing
- **Date:** 2026-11-17
- **Status:** Accepted
- **Context:** Developers, CI pipelines, and sandboxed environments may not always have an external PostgreSQL daemon running on port 5432.
- **Decision:** Use PostgreSQL as the primary database schema with Prisma ORM, and support both standard external PostgreSQL (`DATABASE_URL`) and local embedded PostgreSQL (`pglite` / pg-compatible server helper) for automated tests and zero-dependency local startup.
