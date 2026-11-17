# Kiran's Infotech — Full-Stack Business Platform

A complete computer hardware sales, 40-point certified refurbished laptop marketplace, second-hand laptop buyback, and IT hardware repair/upgrade service platform for **Kiran's Infotech**.

---

## 1. Architecture & Tech Stack

- **Monorepo Layout:** npm workspaces (`packages/shared`, `apps/api`, `apps/web`)
- **Frontend (`apps/web`):** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons
- **Backend (`apps/api`):** NestJS 10 REST API (`/api/v1`), Swagger/OpenAPI (`/api/docs`), `class-validator` DTO validation, JWT + `httpOnly` cookie sessions, bcrypt password hashing, Helmet + Throttler rate limiting
- **Database (`apps/api/prisma`):** PostgreSQL 16 + Prisma ORM (`26` relational tables, `13` enums, `Decimal(10, 2)` financial fields), with automatic embedded PGlite Postgres 16 fallback when no external PostgreSQL server is running locally

---

## 2. Quick Start (Zero-Friction Local Run)

```bash
# 1. Install workspace dependencies
npm install

# 2. Generate Prisma client & seed demo data
npm run db:generate
npm run db:seed

# 3. Start Backend API (http://localhost:4000/api/v1 & Swagger at http://localhost:4000/api/docs)
npm run dev:api

# 4. In a second terminal, start Next.js Storefront & Portals (http://localhost:3000)
npm run dev:web
```

---

## 3. Demo Accounts (Non-Production Only)

| Role | Email | Password | Portal Route |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@kiransinfotech.demo` | `Admin@Kiran2026!` | `/admin` |
| **Customer 1** | `rahul.sharma@example.demo` | `Customer@2026!` | `/account` |
| **Customer 2** | `priya.patel@example.demo` | `Customer@2026!` | `/account` |

*(One-click demo sign-in buttons are also available on `/login` when `DEMO_MODE=true`.)*

---

## 4. Verification & Testing

```bash
# Typecheck all workspaces (@kirans/shared, @kirans/api, @kirans/web)
npm run typecheck

# Production build across all workspaces
npm run build

# Run backend unit tests
npm test

# Run backend end-to-end API workflow suite (9 end-to-end scenarios)
npm run test:e2e
```

---

## 5. Documentation Index

- [Project Context](docs/PROJECT_CONTEXT.md)
- [Implementation Plan](docs/IMPLEMENTATION_PLAN.md)
- [Architecture Decisions (ADRs)](docs/DECISIONS.md)
- [Database Design](docs/DATABASE_DESIGN.md)
- [REST API Reference](docs/API_REFERENCE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Testing Strategy](docs/TESTING.md)
- [Client Demo Guide](docs/DEMO_GUIDE.md)
