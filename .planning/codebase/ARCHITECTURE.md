# System Architecture & Data Flow (`.planning/codebase/ARCHITECTURE.md`)

## 1. Shared Backend Principle
All three user-facing surfaces (Public Storefront, Customer Portal, Admin Dashboard) communicate through the shared NestJS REST API (`/api/v1`) backed by PostgreSQL (`apps/api/prisma/schema.prisma`).

## 2. Backend Module Map (`apps/api/src/modules/`)
- `health` (`GET /api/v1/health`) — Database connectivity & feature flags (`demoMode`, `guestRepairBookingAllowed`, `onlinePaymentEnabled`).
- `auth` (`/api/v1/auth/*`, `/api/v1/me/*`) — Registration, login, logout, mobile OTP, Google OAuth status boundary, customer profile, and address CRUD.
- `categories` (`/api/v1/categories`, `/api/v1/admin/categories`) — Public active categories with published product counts; Admin category CRUD.
- `products` (`/api/v1/products`, `/api/v1/admin/products`) — Public search, filtering, sorting, pagination, and slug lookup (`costPrice` stripped); Admin CRUD, publish/unpublish, archive, specs, and images.
- `inventory` (`/api/v1/admin/inventory`) — Transactional stock adjustments, low-stock / out-of-stock filtering, and immutable `InventoryTransaction` audit trail.
- `refurbished` (`/api/v1/refurbished`, `/api/v1/used-device-submissions`, `/api/v1/admin/refurbished-devices`) — 9-stage refurbished device lifecycle, 40-point `DeviceInspection` reports, single-sale protection, and customer used-laptop buyback submissions.
- `services` (`/api/v1/services`, `/api/v1/admin/services`) — Hardware repair & upgrade service catalogue and Admin CRUD.
- `repairs` (`/api/v1/repair-bookings`, `/api/v1/me/repair-bookings`, `/api/v1/admin/repair-bookings`) — Repair booking (`REP-...`), status timeline separating public messages from private technician notes, digital `RepairQuotation` (`QUO-...`), and customer approval.
- `enquiries` (`/api/v1/enquiries`, `/api/v1/me/enquiries`, `/api/v1/admin/enquiries`) — Authenticated product/service enquiries (`ENQ-...`) and Admin follow-up workflow.
- `orders` (`/api/v1/orders`, `/api/v1/me/orders`, `/api/v1/admin/orders`) — Cart order requests (`ORD-...`) with transactional stock decrement, immutable price snapshots, and stock restoration on cancellation.
- `admin` (`/api/v1/site-content`, `/api/v1/admin/dashboard/overview`, `/api/v1/admin/customers`, `/api/v1/admin/reports/summary`, `/api/v1/admin/audit-logs`) — Live DB metrics, customer directory, CMS blocks, financial/operational reports, and audit logs.
