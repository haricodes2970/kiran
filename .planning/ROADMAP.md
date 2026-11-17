# Kiran's Infotech — GSD Phase Roadmap (`.planning/ROADMAP.md`)

## Completed Phases (Backend Baseline)
- [x] **Phase 0: Audit, Architecture & Docs** (`87063d3`)
- [x] **Phase 1: Monorepo, PostgreSQL Schema & Demo Seed** (`a3b1086`, `896ff3f`)
- [x] **Phase 2: Authentication, RBAC & Profile APIs** (`bca4590`)
- [x] **Phase 3: Catalogue, Inventory & Refurbished Lifecycle APIs** (`b40f17e`)
- [x] **Phase 4: Services, Repairs, Enquiries, Orders & Admin Analytics APIs** (`519a841`, `86b485e`)

---

## Active Frontend & Integration Phases (`apps/web`)

### Phase 5 (FE-A/B/C/D): Frontend Foundation, Design System, Homepage & Product Catalogue
- **Routes:** `/`, `/products`, `/products/[slug]`, `/categories/[slug]`, `/about`, `/contact`, `/cart`
- **Deliverables:** AppProvider auth/cart state, Navbar, Footer, Floating WhatsApp CTA, Homepage, Product Catalogue with search/filters/sorting/pagination, Product Detail with specs/stock/enquiry/WhatsApp/cart, Category detail route, Cart & Order Request checkout.

### Phase 6 (FE-E/F/I): Refurbished Marketplace, Hardware Services, Repair Booking & Used Laptop Buyback
- **Routes:** `/refurbished`, `/refurbished/[slug]`, `/services`, `/services/[slug]`, `/sell-laptop`
- **Deliverables:** Certified Refurbished listing & 40-Point Inspection Report detail page, Hardware Services catalogue & service detail page, Repair Booking form with `REP-...` reference generation, and Used Laptop Sell-to-Us submission page.

### Phase 7 (FE-G): Authentication & Registered Customer Dashboard
- **Routes:** `/login`, `/register`, `/verify-otp`, `/account`, `/account/profile`, `/account/orders`, `/account/enquiries`, `/account/repairs`
- **Deliverables:** Email/Password login, Registration, Mobile OTP verification, quick Demo Account switcher for client evaluation, Customer Overview, Profile & Address Book, Order History, Enquiry History, and Repair Status Timeline with Digital Quotation Approval.

### Phase 8 (FE-H): Protected Administrative Dashboard
- **Routes:** `/admin`, `/admin/products`, `/admin/categories`, `/admin/inventory`, `/admin/refurbished`, `/admin/services`, `/admin/repairs`, `/admin/orders`, `/admin/enquiries`, `/admin/customers`, `/admin/content`, `/admin/reports`, `/admin/settings`
- **Deliverables:** Role-protected Admin shell & sidebar, Live Database Metrics overview, Product CRUD & Publish/Unpublish, Category CRUD, Transactional Inventory Adjustment & Ledger, 9-Stage Refurbished Device & Inspection Manager + Used-Device Buyback Reviewer, Service CRUD, Repair Diagnostics/Quotation/Status Manager, Order & Payment Status Manager, Enquiry Follow-up Manager, Customer Directory, Site Content Manager, and Financial/Operational Reports.

### Phase 9: End-to-End Verification, Ralph Loop Checks & CI
- **Deliverables:** Zero TypeScript errors (`npm run typecheck`), clean Next.js production build (`npm run build`), backend unit + E2E tests passing, and end-to-end verification of shared admin-to-customer live data flows.
