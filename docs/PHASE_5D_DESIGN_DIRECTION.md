# Phase 5D — Proposed Design Direction & Implementation Plan

**Target:** Transform Kiran's Infotech from a clean AI-templated storefront into an intentional, art-directed hardware retail platform combining **Apple's product clarity**, **Nothing's disciplined technical typography**, and **Amazon's conversion-focused purchase UX**.

---

## 1. Locked Design Brief (Per `designing-frontend-interfaces`)

- **Purpose:** Help customers discover computer hardware, compare inspected refurbished laptops, book repair/upgrade services, and submit Order Requests without friction.
- **Audience:** Retail buyers, students, and SME IT buyers across desktop and mobile in India.
- **Tone:** Precision Hardware Retail — crisp, technical, trustworthy, zero fluff.
- **Palette:**
  - Light: `#EAF3FF` soft-blue canvas, `#FFFFFF` / `#F4F8FF` crisp surfaces, `#14233B` ink, `#2563EB` electric blue, `#F59E0B` shopping amber.
  - Dark: `#0B1930` deep navy canvas, `#12243E` / `#172B49` surfaces, `#F4F8FF` ink, `#60A5FA` electric blue, `#FBBF24` shopping amber.
- **Typography:** `Space Grotesk` (tight technical headings), `Inter` (clean body/UI), `JetBrains Mono` (SKUs, INR specs, condition grades).
- **Restraint:** **No** corner blur-blobs, **no** `01 //` boilerplate eyebrows, **no** stacked floating pills under the navbar, **no** backdrop-blur on every grid card (glass reserved for navigation, search, sticky filters, and floating controls).

---

## 2. Page-by-Page Improvement Plan

1. **Global Shell & Navigation (`navbar.tsx`, `footer.tsx`, `globals.css`):**
   - Consolidate the double-row floating header into a single crisp liquid-glass bar with compact inline `DEMO` indicator and `Track Repair` link, eliminating floating pill clutter.
   - Standardize card corner radius to `10px–12px` (`rounded-xl`) and reserve `rounded-full` for CTAs/chips.
   - Remove unnecessary `.glass-card` backdrop blur from repetitive grid items; use crisp `bg-panel border border-subtle` surfaces with subtle hover border illumination (`hover:border-accent`).
2. **Homepage (`/`):**
   - **Hero:** Remove floating eyebrow pill above `<h1>`; tighten headline + 1-sentence value prop + `Explore Hardware` / `Certified Refurbished` CTAs; upgrade the Hero Laptop Stage so the laptop photo sits seamlessly in a full-bleed dark-or-neutral frame (no white box-inside-dark-box contrast jar).
   - **Category Discovery:** Replace 8 tall identical cards with a compact, scannable **8-tile horizontal/2×4 hardware index** with crisp thumbnails, title, and item count.
   - **Featured Hardware:** Highlight real specs/brand/SKU + **Add to Cart** (warm amber) with inline `"View Order Cart →"` progression after adding.
   - **Refurbished Showcase:** Present as a **technical spec-sheet grid** (Nothing-inspired mono spec rows: CPU, RAM/SSD, Battery %, Condition Grade, Warranty if listed) on `#0B1930` / `#071122`.
   - **Services & Why Kiran's Infotech:** Replace 5 generic micro-cards in `WhyUs` with a clean **2-column editorial capability split**; tighten service cards with clear turnaround + `Book Service`.
   - **Copy (`unslop` pass):** Remove all em-dash filler, numbered `01 //` eyebrows, and generic SaaS headings.
3. **Catalogue & Product Detail (`/products`, `/products/[slug]`):**
   - Add mobile collapsible **Filter Drawer** button on `/products` so products appear immediately above the fold on 375px/320px viewports.
   - Upgrade `/products/[slug]` with an Amazon-inspired sticky **Order Request Buy Box** (Price, Stock, Qty, `Add to Cart`, `Proceed to Order Cart`, `WhatsApp Enquiry`) alongside the spec table.
4. **Refurbished, Services & Contact (`/refurbished`, `/services`, `/contact`):**
   - `/services`: Add compact **Jump to Repair Booking** summary bar at top + cleaner form grouping.
   - `/contact`: Consolidate missing CMS fields cleanly into a single notice rather than 3 sparse cards when address/phone/email are unconfigured.
5. **Cart, Auth & Customer Portal (`/cart`, `/login`, `/register`, `/verify-otp`, `/account/*`):**
   - Align border radii (`rounded-xl`), spacing, and button hierarchy (`amber-500` for Order Request submission, `brand-600` for account/service actions) with the unified token system.

---

## 3. Implementation Priorities & Verification Strategy

- **Priority 1 (System & Shell):** Tighten `globals.css` radii/glass restraint + clean single-row `Navbar` + `unslop` copy pass.
- **Priority 2 (Homepage & Merchandising):** Redesign Hero product frame, compact Category index, spec-sheet Refurbished section, and editorial WhyUs.
- **Priority 3 (Catalogue, Detail & Sub-Routes):** Mobile filter drawer on `/products`, sticky Order Request Buy Box on `/products/[slug]`, and `/contact` / `/services` / `/account` polish.
- **Verification Strategy (Per `reviewing-interface-quality` + `playwright-expert` + `building-accessible-interfaces`):**
  - Run `npm run typecheck`, `npm --workspace=apps/web run build`, `npm --workspace=apps/api run test`, and `npm run test:e2e`.
  - Capture Playwright screenshots across Light & Dark modes at `1440×900`, `1024×768`, `768×1024`, `375×812`, `320×568` + run computed-style contrast/radius/overflow audits + keyboard-only navigation pass.
