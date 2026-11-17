# Kiran's Infotech — Project Context

## 1. Business Overview

**Business Name:** Kiran's Infotech

Kiran's Infotech is a computer hardware sales, refurbished laptop resale, second-hand device acquisition, and IT hardware repair/upgrade service business. The platform unifies its physical retail and service operations into a single full-stack digital storefront and operational management system.

### Core Business Lines
1. **New Hardware & Accessories:** Laptops, desktop systems, monitors, keyboards, mice, RAM modules, SSDs, HDDs, storage devices, and computer peripherals.
2. **Refurbished Devices Marketplace:** Individually inspected second-hand and refurbished laptops and desktops with transparent physical condition, battery assessment, inspection details, refurbishment lifecycle tracking, and warranty coverage.
3. **Hardware Repair & Upgrade Services:** Laptop repair, desktop/CPU repair, printer repair and troubleshooting, RAM upgrades, HDD-to-SSD upgrades, SSD installation, component replacement, and preventive maintenance.
4. **Used-Device Acquisition (Sell to Us):** Intake workflow for customers submitting second-hand laptops for evaluation, inspection, and acquisition by Kiran's Infotech.

---

## 2. Product Vision & Core Principle

The platform provides three connected interfaces backed by a single shared API and database:
1. **Public Customer Website:** Browse products, refurbished laptops, and hardware services; search and filter catalogue; initiate WhatsApp enquiries.
2. **Registered Customer Portal:** Manage profile and addresses, submit product enquiries, place cart order requests, book hardware repairs, review repair quotations, and track order and repair status history.
3. **Administrative Dashboard:** Full operational control over products, categories, stock movements, refurbished device lifecycle, services, repair bookings and quotations, customer enquiries, orders, site content, and real-time operational analytics.

**Core Architectural Invariant:**
> When an administrator creates or updates business data (publishing a product, adjusting stock, updating a service, or progressing a repair status), the customer-facing storefront and customer dashboard reflect those changes immediately from the shared database.

---

## 3. Core Modules

| Module | Scope |
| :--- | :--- |
| **Auth & Users** | Email/password registration and login, JWT/httpOnly cookie sessions, RBAC (`CUSTOMER`, `ADMIN`, `STAFF`), Google OAuth and Mobile OTP boundaries, secure admin bootstrap. |
| **Catalogue** | Categories (hierarchical), Products, Product Images, Product Specifications, search, brand/price/condition/availability filters, sorting, pagination, publication controls. |
| **Inventory** | Stock quantities, reserved quantities, low-stock thresholds, transactional stock adjustments, immutable `InventoryTransaction` audit trail. |
| **Refurbished Lifecycle** | 9-stage lifecycle (`PURCHASED` -> `RECEIVED` -> `INSPECTION_PENDING` -> `UNDER_INSPECTION` -> `REFURBISHMENT` -> `QUALITY_CHECK` -> `READY_FOR_SALE` -> `PUBLISHED` -> `SOLD`), `DeviceInspection` reports, acquisition cost privacy, single-sale protection, and customer used-laptop sell submissions. |
| **Services** | Service categories, service catalogue (`FIXED`, `STARTING_FROM`, `QUOTE_REQUIRED` pricing), turnaround time, availability. |
| **Repairs** | Customer repair bookings with unique reference (`REP-YYYYMMDD-XXXX`), admin diagnostic notes, `RepairQuotation` creation and customer approval, append-only `RepairUpdate` status history separating customer-visible updates from private internal notes. |
| **Orders & Cart** | Cart validation, order request submission (`ORD-YYYYMMDD-XXXX`), immutable product name/SKU/unit-price snapshots in `OrderItem`, transactional stock decrement/reservation, order & payment status lifecycle. |
| **Enquiries** | Authenticated product/service enquiries, source tracking, admin status workflow (`NEW`, `IN_PROGRESS`, `FOLLOWED_UP`, `CONVERTED`, `CLOSED`), internal notes. |
| **Site Content & Reports** | Admin-editable banners, business contact details, operating hours, featured items, real-time database-driven dashboard metrics, sales/inventory/repair reports, and `AuditLog`. |

---

## 4. User Roles

| Role | Access Scope |
| :--- | :--- |
| **Guest** | Browse published products, categories, refurbished laptops, and services; search/filter; use WhatsApp click-to-chat links. |
| **Customer (`CUSTOMER`)** | All guest capabilities plus authenticated product enquiries, cart & order requests, repair bookings, used-laptop sell requests, and isolated access to own orders, enquiries, repairs, and profile. |
| **Administrator (`ADMIN`)** | Full CRUD across catalogue, inventory, refurbished devices, services, repairs, orders, enquiries, customers, site content, reports, and audit logs. |
| **Staff (`STAFF` - extensible)** | Operational role reserved for technician assignment in later phases. |

---

## 5. Technology Stack & Architecture

- **Monorepo Layout:** npm/pnpm workspaces (`apps/api`, `apps/web`, `packages/shared`)
- **Backend (`apps/api`):** NestJS 10+, TypeScript, REST API (`/api/v1`), `class-validator` / `class-transformer` DTO validation, Swagger/OpenAPI (`/api/docs`), JWT + httpOnly cookies, bcrypt password hashing, Helmet + Throttler rate limiting.
- **Database & ORM:** PostgreSQL with Prisma ORM (`apps/api/prisma/schema.prisma`), decimal financial types (`Decimal(10, 2)`), transactional stock and order operations, deterministic demo seed script (`DEMO_MODE=true`).
- **Frontend (`apps/web`):** Next.js 14+ (App Router), React 18, TypeScript, Tailwind CSS, shadcn/ui component primitives, Lucide icons.

---

## 6. Development Phases

1. **Milestone 0:** Project Audit, Requirements Extraction, Architecture & Documentation (`docs/`).
2. **Milestone 1:** Monorepo Foundation, Prisma PostgreSQL Schema, Migrations, and Deterministic Demo Seeding.
3. **Milestone 2:** Backend Authentication, RBAC Guards, Ownership Protection, and User Profile APIs.
4. **Milestone 3 & 4:** Backend Catalogue, Categories, Inventory Transactions, Refurbished Device Lifecycle, and Admin Overview Metrics.
5. **Milestone 5 & 6:** Backend Services, Repair Bookings/Quotations/Updates, Enquiries, Orders, Site Content, Reports, and Comprehensive Backend Tests.
6. **Milestone 7 & 8:** Next.js Storefront, Customer Portal, Admin Dashboard, Integrations (WhatsApp, OAuth/OTP boundaries), CI/CD, and End-to-End Verification.

---

## 7. Outstanding Client Decisions (Configurable Defaults Implemented)

| Decision Item | Default Configurable Implementation | Config / Mechanism |
| :--- | :--- | :--- |
| Guest repair booking allowed? | Authenticated by default; guest toggle supported | `ALLOW_GUEST_REPAIR_BOOKING` env flag |
| Enquiry-only vs online payment? | Order-request checkout (`PAYMENT_PENDING` / `COD_OR_PAY_AT_STORE`); payment provider modular | `ONLINE_PAYMENT_ENABLED` env flag |
| Delivery vs in-store pickup? | Both `DELIVERY` and `STORE_PICKUP` supported on orders | Order `fulfilmentType` enum |
| GST invoice fields? | Tax amount and optional GSTIN fields included on Order | Configurable tax rate (default 18% GST inclusive/exclusive breakdown) |
| Official WhatsApp number & address? | Configurable via `SiteContent` and `.env` | `NEXT_PUBLIC_WHATSAPP_NUMBER` + Admin Settings |
