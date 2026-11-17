# Technology Stack & Dependencies (`.planning/codebase/STACK.md`)

## Workspace Architecture
- **Monorepo:** npm workspaces (`packages/shared`, `apps/api`, `apps/web`)
- **Node.js Runtime:** `v22.23.1` (`>=20.0.0`)
- **TypeScript:** `^5.6.3` (strict mode across workspaces)

## Backend (`apps/api`)
- **Framework:** NestJS `^10.4.7` (`@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`)
- **Database & ORM:** PostgreSQL 16 + Prisma ORM `^5.22.0` (`@prisma/client`, `prisma`)
- **Embedded Local/Test Postgres:** `@electric-sql/pglite` `0.3.1` with custom SSL-aware TCP wire-protocol bridge (`apps/api/src/prisma/embedded-pg.ts`)
- **Authentication & Security:** `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `bcryptjs`, `cookie-parser`, `helmet`, `@nestjs/throttler`
- **Validation & API Docs:** `class-validator`, `class-transformer`, `@nestjs/swagger` (`/api/docs`)
- **Testing:** Jest `^29.7.0`, `ts-jest`, `supertest` `^7.0.0`

## Frontend (`apps/web`)
- **Framework:** Next.js `^14.2.15` (App Router) + React `^18.3.1`
- **Styling & Icons:** Tailwind CSS `^3.4.14`, `lucide-react` `^0.454.0`
