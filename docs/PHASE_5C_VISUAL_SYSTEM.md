# Phase 5C — Storefront Visual System, Liquid Glass & Interaction Architecture

**Branch:** `feat/phase5-visual-enhancement`  
**Status:** Verified across Light (`#EAF3FF`) and Dark (`#0B1930`) themes on Desktop (`1440px`, `1024px`), Tablet (`768px`), and Mobile (`375px`, `320px`).

---

## 1. Root Cause of Prior Dark-Mode Contrast Failures

- `PublicShell` applied dark canvas classes (`dark:bg-[#0B1930]`) globally, while Phase 2 storefront sub-routes (`/products`, `/refurbished`, `/services`, `/sell-laptop`, `/contact`, `/cart`, `/login`, `/register`, `/verify-otp`, `/account/*`) still used hardcoded light utility classes (`text-slate-900`, `bg-white`, `border-slate-200`).
- On `/contact` and other pages, dark `#0F172A` headings rendered directly over `#0B1930`, dropping contrast below readable thresholds, while cards remained opaque white.
- `ThemeProvider` previously updated `document.documentElement.classList` only inside `useEffect`, causing a brief light-to-dark flash before hydration.

---

## 2. Semantic Design Token System (`globals.css` + `tailwind.config.js`)

| Semantic Token | CSS Variable | Light (`#EAF3FF`) | Dark (`#0B1930`) | Tailwind Utility |
| --- | --- | --- | --- | --- |
| Page Canvas | `--bg-page` | `#EAF3FF` | `#0B1930` | `bg-page` |
| Primary Surface | `--bg-surface` | `#FFFFFF` | `#12243E` | `bg-panel` |
| Secondary Surface | `--bg-surface-2` | `#F4F8FF` | `#172B49` | `bg-panel-2` |
| Primary Text | `--text-primary` | `#14233B` | `#F4F8FF` | `text-fg` |
| Secondary Text | `--text-secondary` | `#526783` | `#B8CBE8` | `text-muted` |
| Brand Accent | `--brand` | `#2563EB` | `#60A5FA` | `text-accent`, `bg-accent` |
| Highlight Blue | `--highlight` | `#60A5FA` | `#93C5FD` | `text-highlight` |
| Shopping Amber | `--amber` | `#F59E0B` | `#FBBF24` | `bg-commerce`, `text-commerce` |
| Subtle Border | `--border-subtle` | `rgba(180,208,244,0.85)` | `rgba(96,165,250,0.25)` | `border-subtle` |

- **FOUC Prevention:** An inline `<script>` in `apps/web/src/app/layout.tsx` `<head>` applies `dark` synchronously before first paint based on `localStorage.ki_theme_v1` or `prefers-color-scheme: dark`, while explicitly skipping `/admin/*`.

---

## 3. Liquid Glass System & Interaction Components

- **CSS Utilities (`globals.css`) & React Wrappers (`components/ui/glass.tsx`):** `.glass-nav`, `.glass-card`, `.glass-filter`, `.glass-modal`, `.glass-pill`, `.glass-search`, `.glass-input`.
- **Fallback Strategy:** Base solid-translucent styles (`~92-95%` opacity) apply everywhere; `@supports (backdrop-filter: blur(1px))` upgrades to frosted-ice (light) and illuminated deep-blue glass (dark) with `backdrop-filter: blur(10px–20px)` and inner top highlights. Product photography frames remain unblurred (`bg-white`).
- **Interactions:**
  - `ThemeToggle` (`components/ui/theme-toggle.tsx`): Animated sun/moon rotation/scale crossfade with `prefers-reduced-motion` support.
  - `AddToCartButton` (`components/ui/add-to-cart-button.tsx`): Warm amber primary commerce CTA with tactile press and `"Added to Order Cart"` confirmation feedback.
  - `Navbar` (`components/layout/navbar.tsx`): Scroll-reactive glass elevation and separated brand assets (`kirans-mark.png` + theme-matched `kirans-wordmark-dark.png` / `kirans-wordmark.png`).
  - `IntroExperience` (`components/intro/intro-experience.tsx`): First-visit session-gated Flow AI intro (`kirans-infotech-intro.mp4`), muted `playsInline`, `Skip Intro` + `Enter`/`Escape`, `/admin/*` & reduced-motion bypass, missing-video graceful dismissal.

---

## 4. Public / Admin Isolation & Content Integrity

- `/admin/*` routes are isolated in `PublicShell` (never receive storefront navbar, footer, intro video, or dark class).
- `/contact` and `Footer` read `business_info` from `/site-content`, suppress demo placeholder phones/emails/addresses (`90000 00000`, `example.com`), and avoid unverified marketing claims.
- `ORDER_REQUEST_ONLY` preserved across all catalogue, detail, refurbished, and cart flows.
