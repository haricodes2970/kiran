# Kiran's Infotech — Client Demo Readiness Report

**Branch:** `feat/phase5-visual-enhancement`  
**Mode:** `ORDER_REQUEST_ONLY` (no live online payments; final payment & fulfilment confirmed by store)

---

## 1. Completed Routes & Features

- **Public Storefront:**
  - `/` — Editorial product-led Hero (real laptop showcase, specs, INR pricing, warm amber Add to Cart), 8-category hardware index, Featured Hardware, Inspected Refurbished spec-sheet showcase, Services directory, 2-column editorial Why Kiran's Infotech, Final CTA, and Footer.
  - `/products` & `/products/[slug]` — Search, category/brand/condition/price/stock filtering, sorting, pagination, responsive mobile Filter Drawer, grouped technical specifications, sticky desktop Buy Box, and compact mobile purchase bar.
  - `/refurbished` & `/refurbished/[slug]` — Condition-graded, serial-tracked single-unit laptops with battery health, warranty terms (when listed), and recorded Technician Hardware Inspection Reports.
  - `/services` & `/services/[slug]` — Service category filters, turnaround & indicative pricing, quick `Book a Repair Request` & `Track Existing Repair` navigation, and online repair booking intake (`REP-YYYYMMDD-XXXX`).
  - `/sell-laptop`, `/contact`, `/about` — Used-laptop buyback submission form, consolidated CMS-driven store contact panel (with honest notice when direct address/phone/email are unconfigured), and WhatsApp enquiry links.
- **Commerce & Authentication (Milestone E):**
  - `/cart` — Stock-capped `-`/`+` quantity steppers, refurbished single-unit lock, `Store Pickup` vs `Delivery` selector, auto-filled authenticated user details, GST breakdown, inline validation, and Order Request confirmation.
  - `/login`, `/register`, `/verify-otp` — Email/password sign-in with Show/Hide toggle, live registration password guidance, 2-step mobile OTP flow with masked destination, Change number, and 30s resend cooldown. Demo quick-login and OTP hints are strictly gated behind `NEXT_PUBLIC_DEMO_MODE=true`.
- **Customer Portal (`/account/*`):**
  - Shared `AccountShell` with auth guard, identity header, Sign Out, and `Device Passport · Future Feature` preview badge.
  - `/account` — Summary metrics, quick actions, and recent repair/order activity.
  - `/account/orders` — Client-side search & `OrderStatus` filter, expandable fulfilment details, separate `OrderStatus` and `PaymentStatus` badges.
  - `/account/profile` — Personal & Business/GSTIN profile update (`PATCH /me/profile`), Saved Addresses (`GET`, `POST`, `DELETE /me/addresses`), and Account Session/Sign Out.
  - `/account/repairs` & `/account/enquiries` — Live repair status/quotation tracking and enquiry history.
- **Admin Console (`/admin/*`):**
  - Role-gated Executive Operations Dashboard, Products, Categories, Inventory, Refurbished, Services, Orders, Repairs, Enquiries, Customers, Site Content, Reports, and Settings.

---

## 2. Critical Workflows Verified End-to-End

1. **Catalogue → Detail → Cart → Order Request → Order History:** Verified adding `ASUS Vivobook 16X Creator Laptop` (`KI-LAP-004`), submitting order request in `/cart` (`ORD-20261120-4562`), and finding + filtering + expanding it in `/account/orders`.
2. **Services → Repair Booking:** Verified selecting a service on `/services`, submitting a repair booking, and receiving a live `REP-...` booking reference.
3. **Auth → Account → Profile & Addresses:** Verified password visibility toggle, demo quick-login (`NEXT_PUBLIC_DEMO_MODE=true`), adding & deleting a saved address on `/account/profile`, and 2-step `/verify-otp` masked phone display.
4. **Admin Console:** Verified admin sign-in routing to `/admin` (`Executive Operations Dashboard`) with zero console errors.

---

## 3. Tests Run & Actual Results

- `npm run typecheck`: **PASS** (`@kirans/shared`, `@kirans/api`, `@kirans/web`)
- `NEXT_PUBLIC_DEMO_MODE=true npm --workspace=apps/web run build`: **PASS** (`32/32` routes compiled)
- `npm --workspace=apps/api run test`: **PASS** (`8` suites, `28` tests passed)
- **Playwright End-to-End & Visual Verification (`1440px` & `375px`, Light & Dark):** **PASS** (`errCount: 0`, zero horizontal overflow across tested desktop & mobile viewports)

---

## 4. Remaining Limitations & Known Scope Boundaries

- **Saved Address Editing:** Backend `profile.controller.ts` supports `GET`, `POST`, and `DELETE /me/addresses` only (no `PATCH /me/addresses/:id`). Address editing is deferred until backend `PATCH` support is added.
- **Customer Order Filtering:** `GET /me/orders` returns all customer orders without server-side query params; search and status filtering run client-side.
- **Password Recovery / Change:** No `/auth/forgot-password` or `/auth/change-password` endpoints exist in the current API.
- **Sandbox Integrations:** Razorpay, WhatsApp Cloud API, and live SMTP are in sandbox/stub mode without live client credentials.
- **Demo Data:** All seeded products, refurbished laptops, services, and sample accounts (`isDemo: true`) are demonstration fixtures, not verified client inventory.

---

## 5. Demo Accounts (Only Active When `NEXT_PUBLIC_DEMO_MODE=true`)

- **Admin:** `admin@kiransinfotech.demo` / `Admin@Kiran2026!`
- **Customer 1:** `rahul.sharma@example.demo` / `Customer@2026!`
- **Customer 2:** `priya.patel@example.demo` / `Customer@2026!`
- **Demo OTP:** Phone `+919820100101` with OTP `123456` (when backend `DEMO_MODE !== 'false'`)

> **Security Note:** Never set `NEXT_PUBLIC_DEMO_MODE=true` or `DEMO_MODE=true` in production deployments.

---

## 6. Commands to Start Backend & Frontend

```bash
# Terminal 1 — Backend API (http://localhost:4000/api/v1)
npm run dev:api

# Terminal 2 — Frontend Demo Build & Server (http://localhost:3000)
NEXT_PUBLIC_DEMO_MODE=true npm --workspace=apps/web run build
npm --workspace=apps/web run start
```

---

## 7. Suggested 5–10 Minute Client Walkthrough

1. **Homepage (`/`):** Show Light/Dark Liquid Glass toggle, `Technology That Moves You Forward.` hero with live ASUS laptop specs & warm amber `Add to Cart`, 8 categories, featured hardware, and refurbished spec-sheet cards.
2. **Product Discovery (`/products` & `/products/[slug]`):** Demonstrate search/sort/filter (and mobile drawer on narrow viewport), grouped specs, stock-capped quantity selector, and sticky Buy Box.
3. **Refurbished Marketplace (`/refurbished`):** Highlight condition grades, serial tracking, battery health %, and Technician Inspection Report.
4. **Order Request Checkout (`/cart`):** Show `-`/`+` steppers, `Store Pickup` vs `Delivery`, GST breakdown, and submitting an Order Request without online payment.
5. **Customer Portal (`/account`, `/account/orders`, `/account/profile`):** Show live order reference, status filtering, repair tracking (`/account/repairs`), and profile/address management.
6. **Services & Admin (`/services`, `/admin`):** Demonstrate quick repair booking intake and switch to `/admin` to show executive metrics, order/repair management, and public/admin isolation.

---

## 8. Client Data & Credentials Needed for Production Launch

1. **Verified Catalogue & Inventory:** Final SKUs, categories, pricing (INR), stock counts, warranty terms, and high-res product/refurbished photos.
2. **Business Contact & CMS Details:** Confirmed store address, phone number, email, operating hours, and WhatsApp Business number.
3. **Production Infrastructure & Secrets:** Managed PostgreSQL `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `NODE_ENV=production`, `DEMO_MODE=false`, and `NEXT_PUBLIC_DEMO_MODE=false`.
4. **Optional Live Integrations (when ready):** SMTP credentials, Cloudinary/S3 media keys, WhatsApp Cloud API token, and Razorpay keys (if moving beyond `ORDER_REQUEST_ONLY`).
