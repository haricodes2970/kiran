# Kiran's Infotech — REST API Reference (`/api/v1`)

All endpoints are prefixed with `/api/v1`. Interactive Swagger/OpenAPI documentation is served at `/api/docs`.

## 1. Conventions

- **Authentication:** Bearer JWT (`Authorization: Bearer <token>`) or `httpOnly` cookie (`kiran_token`).
- **Response Envelope (Lists):**
  ```json
  {
    "data": [...],
    "meta": {
      "total": 28,
      "page": 1,
      "limit": 12,
      "totalPages": 3
    }
  }
  ```
- **Error Envelope:**
  ```json
  {
    "statusCode": 400,
    "error": "BAD_REQUEST",
    "message": "Validation failed",
    "details": [{ "field": "email", "message": "email must be an email" }],
    "path": "/api/v1/auth/register",
    "timestamp": "2026-11-17T13:00:00.000Z"
  }
  ```

---

## 2. Endpoints Overview

### Health & Public Configuration
- `GET /api/v1/health` — Database and service health status + `demoMode` flag.
- `GET /api/v1/site-content` — All published site content blocks (hero, contact, hours, WhatsApp config, trust badges, testimonials).
- `GET /api/v1/site-content/:key` — Specific published content block by key.

### Authentication & Profile
- `POST /api/v1/auth/register` — Register customer account (`name`, `email`, `phone`, `password`).
- `POST /api/v1/auth/login` — Authenticate with `email` and `password`.
- `POST /api/v1/auth/logout` — Clear session cookie.
- `POST /api/v1/auth/otp/request` — Request mobile OTP (provider boundary / demo mode verification).
- `POST /api/v1/auth/otp/verify` — Verify mobile OTP and issue JWT session.
- `GET /api/v1/auth/me` — Current authenticated user profile and roles.
- `PATCH /api/v1/me/profile` — Update own profile (`name`, `phone`, `companyName`, `gstNumber`).
- `GET /api/v1/me/addresses` — List own saved addresses.
- `POST /api/v1/me/addresses` — Add address.
- `PATCH /api/v1/me/addresses/:id` — Update own address.
- `DELETE /api/v1/me/addresses/:id` — Delete own address.

### Public Catalogue & Refurbished Marketplace
- `GET /api/v1/categories` — List active categories with product counts.
- `GET /api/v1/categories/:slug` — Category details.
- `GET /api/v1/products` — Paginated published products (`search`, `categorySlug`, `brand`, `condition`, `minPrice`, `maxPrice`, `inStock`, `featured`, `sortBy`, `page`, `limit`). Never exposes `costPrice`.
- `GET /api/v1/products/brands` — Distinct brands for published products.
- `GET /api/v1/products/:slug` — Published product detail with images, specifications, category, and stock availability.
- `GET /api/v1/refurbished` — Paginated published refurbished devices (`search`, `brand`, `conditionGrade`, `minPrice`, `maxPrice`, `sortBy`, `page`, `limit`). Never exposes `acquisitionCost` or `refurbishmentCost`.
- `GET /api/v1/refurbished/:slug` — Refurbished device detail including latest verified `DeviceInspection` checklist.
- `GET /api/v1/services` — List active hardware repair & upgrade services grouped/filterable by category.
- `GET /api/v1/services/:slug` — Service details.

### Customer Actions (Authenticated)
- `POST /api/v1/enquiries` — Submit product/service/general enquiry.
- `GET /api/v1/me/enquiries` — List own enquiries.
- `POST /api/v1/repair-bookings` — Submit repair booking request (generates `REP-YYYYMMDD-XXXX`).
- `GET /api/v1/me/repair-bookings` — List own repair bookings with customer-visible updates and quotations.
- `GET /api/v1/me/repair-bookings/:reference` — Detailed repair tracking by reference (ownership verified; internal notes excluded).
- `POST /api/v1/me/repair-bookings/:id/quotations/:quotationId/respond` — Approve or reject a repair quotation (`APPROVED` / `REJECTED`).
- `POST /api/v1/orders` — Submit cart order request or refurbished device purchase request (validates stock, creates price snapshots, decrements/reserves stock transactionally).
- `GET /api/v1/me/orders` — List own orders.
- `GET /api/v1/me/orders/:reference` — Order detail by reference (ownership verified).
- `POST /api/v1/used-device-submissions` — Submit second-hand laptop for business evaluation.
- `GET /api/v1/me/used-device-submissions` — List own second-hand laptop submissions.

### Administration (`/api/v1/admin/*` — Requires `ADMIN` Role)
- `GET /api/v1/admin/dashboard/overview` — Live database metrics (products, stock alerts, orders, revenue, enquiries, pending repairs, recent activity).
- `GET /api/v1/admin/products` — All products (including drafts, archived, and `costPrice`).
- `POST /api/v1/admin/products` — Create product + initial inventory + images + specs.
- `PATCH /api/v1/admin/products/:id` — Update product, status (`DRAFT`, `PUBLISHED`, `ARCHIVED`), specs, images.
- `DELETE /api/v1/admin/products/:id` — Archive/soft-delete product.
- `GET /api/v1/admin/categories` / `POST` / `PATCH /:id` / `DELETE /:id` — Category management.
- `GET /api/v1/admin/inventory` — Inventory overview with low-stock / out-of-stock filters.
- `POST /api/v1/admin/inventory/adjustments` — Transactional stock adjustment with reason and audit trail.
- `GET /api/v1/admin/inventory/:productId/transactions` — Stock movement history.
- `GET /api/v1/admin/refurbished-devices` / `POST` / `PATCH /:id` — Full 9-stage refurbished device management including acquisition cost.
- `POST /api/v1/admin/refurbished-devices/:id/inspections` — Record device inspection report.
- `GET /api/v1/admin/used-device-submissions` / `PATCH /:id` — Review customer used-laptop sell requests and optionally convert to a `RefurbishedDevice`.
- `GET /api/v1/admin/services` / `POST` / `PATCH /:id` / `DELETE /:id` — Service CRUD.
- `GET /api/v1/admin/repair-bookings` / `GET /:id` — View all repair requests including internal notes.
- `PATCH /api/v1/admin/repair-bookings/:id/status` — Update repair status, diagnostic notes, customer-visible message, and internal note.
- `POST /api/v1/admin/repair-bookings/:id/quotations` — Prepare repair quotation for customer approval.
- `GET /api/v1/admin/orders` / `GET /:id` / `PATCH /:id/status` — Order status, fulfilment, payment status, and cancellation management.
- `GET /api/v1/admin/enquiries` / `PATCH /:id` — Enquiry status, follow-up, and internal notes management.
- `GET /api/v1/admin/customers` / `GET /:id` — Customer directory and full linked order, repair, and enquiry history (password hashes excluded).
- `PUT /api/v1/admin/site-content/:key` — Create or update homepage/business content blocks.
- `GET /api/v1/admin/reports/summary` — Financial and operational reports distinguishing revenue, known acquisition/cost basis, inventory valuation, repairs, and enquiry conversions.
- `GET /api/v1/admin/audit-logs` — Paginated audit log of sensitive administrative actions.
