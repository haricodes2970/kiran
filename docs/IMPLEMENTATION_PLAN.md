# Kiran's Infotech — Implementation Plan

## Execution Strategy

We follow an incremental, backend-first vertical slice methodology:
1. Complete the **Backend API (`apps/api`) and Database Layer (`prisma/`)** first, ensuring every business entity, validation rule, security invariant, seed script, and automated unit/integration test is verified.
2. Build the **Frontend Application (`apps/web`)** connected directly to the live NestJS REST API (`/api/v1`).
3. Verify end-to-end workflows, configure GitHub Actions CI, and maintain frequent, atomic commits pushed to `https://github.com/haricodes2970/kiran`.

---

## Milestones

### Milestone 0 — Project Audit and Planning (Completed)
- Inspect workspace and extract all three specification documents (`01_Kirans_Infotech_Business_PRD.docx`, `02_Kirans_Infotech_Technical_Requirements.docx`, `03_Kirans_Infotech_Development_Backlog.docx`).
- Initialize Git repository (`main`) and verify remote `https://github.com/haricodes2970/kiran.git`.
- Create core technical documentation (`PROJECT_CONTEXT.md`, `IMPLEMENTATION_PLAN.md`, `DECISIONS.md`, `DATABASE_DESIGN.md`, `API_REFERENCE.md`, `DEPLOYMENT.md`, `TESTING.md`, `DEMO_GUIDE.md`).

### Milestone 1 — Monorepo Foundation, Database Schema & Seed
- Initialize workspace `package.json` with `apps/api`, `apps/web`, and `packages/shared`.
- Configure NestJS backend in `apps/api` with TypeScript, ConfigModule, Swagger/OpenAPI, global `ValidationPipe`, RFC-style error filter, and health check endpoint (`/api/v1/health`).
- Define complete Prisma schema (`apps/api/prisma/schema.prisma`) covering all 25+ domain models and enums.
- Configure PostgreSQL database connection and run initial migration.
- Implement deterministic demo seed script (`apps/api/prisma/seed.ts`) with `isDemo: true` markers (8 categories, 20 new products, 8 refurbished laptops with inspections, 10 services, 10 demo customers, 10 orders, 8 repair bookings, 10 enquiries, site content) guarded against production execution.

### Milestone 2 — Authentication, Authorization & Customer Profile
- Implement `AuthModule` (`/api/v1/auth/register`, `/api/v1/auth/login`, `/api/v1/auth/logout`, `/api/v1/auth/me`, `/api/v1/auth/bootstrap-admin`, plus modular `/api/v1/auth/otp/request`, `/api/v1/auth/otp/verify`, and Google OAuth boundary).
- Implement `JwtAuthGuard`, `OptionalJwtAuthGuard`, and `RolesGuard` (`@Roles(RoleName.ADMIN)`).
- Implement `UsersModule` and customer profile/address endpoints (`/api/v1/me/profile`, `/api/v1/me/addresses`).

### Milestone 3 & 4 — Catalogue, Categories, Inventory & Refurbished Devices
- Implement `CategoriesModule` (public list/detail + admin CRUD).
- Implement `ProductsModule` (public search, filter by category/brand/price/condition/availability, sort, pagination, slug detail; admin CRUD, publish/unpublish, archive, images & specifications management; strict stripping of `costPrice` on public responses).
- Implement `InventoryModule` (transactional stock adjustments, low-stock detection, `InventoryTransaction` ledger).
- Implement `RefurbishedModule` (public available refurbished listings & inspection report view; admin 9-stage lifecycle transitions, `DeviceInspection` management, single-sale protection, and customer used-laptop sell submission intake).

### Milestone 5 & 6 — Services, Repairs, Enquiries, Orders, Admin Analytics & Content
- Implement `ServicesModule` (service categories and services public read + admin CRUD).
- Implement `RepairsModule` (customer repair booking with `REP-YYYYMMDD-XXXX` reference, customer repair tracking filtering out private internal notes, admin repair management, diagnostic notes, `RepairQuotation` workflow, and customer quotation approval).
- Implement `EnquiriesModule` (authenticated customer enquiry creation, customer own enquiries list, admin enquiry management with status transitions and internal notes).
- Implement `OrdersModule` (authenticated order request creation with transactional stock check/decrement and price snapshots, customer order history, admin order status & payment status management with stock restoration on cancellation).
- Implement `AdminModule` / `ReportsModule` / `ContentModule` (real-time dashboard overview metrics from DB aggregates, sales/inventory/repair reports, customer directory, `SiteContent` CRUD, and `AuditLog` tracking).
- Write and run comprehensive unit and integration/e2e tests across all backend modules.

### Milestone 7 — Frontend Application (`apps/web`)
- Scaffold Next.js 14 App Router application with Tailwind CSS, shadcn/ui design system, and typed API client.
- Build public storefront: Homepage, Product Catalogue & Detail pages, Refurbished Laptop Marketplace & Inspection views, Hardware Services & Repair Booking, Sell Used Laptop page, About/Contact, and contextual WhatsApp click-to-chat integration.
- Build Customer Portal (`/account/*`): Overview, Orders, Repair Tracking & Quotation Approval, Enquiries, Profile & Addresses.
- Build Admin Dashboard (`/admin/*`): Live Analytics Overview, Products CRUD, Categories, Inventory Ledger, Refurbished Lifecycle Manager, Services CRUD, Repairs & Quotations Manager, Orders Manager, Enquiries Manager, Customers Directory, Content/Settings Manager, and Reports.

### Milestone 8 — Testing, CI/CD & Final Verification
- Add GitHub Actions CI workflow (`.github/workflows/ci.yml`) for linting, typechecking, building, and testing both backend and frontend.
- Verify responsive layouts, SEO metadata, error/empty/loading states, and demo rehearsal checklist.
