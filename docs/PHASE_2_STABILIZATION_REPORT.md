# Kiran's Infotech — Phase 2 Stabilization & Verification Report

## 1. Root Cause Analysis of Confirmed Issues

### Issue A: Shell Quoting Crash (`/bin/sh: -c: line 1: unexpected EOF while looking for matching '''`)
- **Proven Root Cause:**
  1. `apps/api/package.json` previously defined `"start:dev": "nest start --watch"`.
  2. Inside `@nestjs/cli/actions/start.action.js` (lines 30–31 and 68–96), `StartAction` resolves `tsconfig.outDir` (`./dist`) to an **absolute filesystem path**: `/home/hari007/Projects/Clients/Kiran'sInfoTech/apps/api/dist`.
  3. Line 86 of `@nestjs/cli/actions/start.action.js` only wraps `outputFilePath` in quotes if it contains a space character (`outputFilePath.indexOf(' ') >= 0`), ignoring apostrophes (`'`).
  4. Line 93 invokes `child_process.spawn('node', processArgs, { stdio: 'inherit', shell: true })`. Because `shell: true` passes the unquoted path `/home/hari007/Projects/Clients/Kiran'sInfoTech/apps/api/dist/src/main` to `/bin/sh -c`, the single apostrophe in `Kiran'sInfoTech` causes `/bin/sh` to fail immediately with `unexpected EOF while looking for matching '''`.
- **Fix Applied:**
  - Created `apps/api/scripts/start-api.js`, which compiles TypeScript via `spawnSync(process.execPath, [tscBin, '-p', ...], { shell: false })` and launches the compiled entry point `dist/src/main.js` via `spawn(process.execPath, ['--enable-source-maps', entryFile], { shell: false })`.
  - Updated `apps/api/package.json` scripts (`start`, `start:dev`, `start:prod`, `build`) to use `shell: false` Node execution and the exact compiled path `dist/src/main.js`.

### Issue B: Database Initialization Ordering on Cold API Startup
- **Proven Root Cause:**
  1. In `apps/api/src/main.ts`, `const count = await prisma.category.count()` was called immediately after `NestFactory.create(AppModule)` **before** `await app.init()` or `await app.listen()` had invoked `PrismaService.onModuleInit()` (`ensurePostgresAvailable()`).
  2. In `apps/api/src/prisma/prisma.service.ts`, the fallback `DATABASE_URL` in `super(...)` omitted `sslmode=disable`.
  3. In `apps/api/src/prisma/embedded-pg.ts`, `findMigrationSqlPath()` needed the 3-level relative path (`../../../prisma/migrations/...`) when executing from `apps/api/dist/src/prisma`.
- **Fix Applied:**
  - Updated `apps/api/src/main.ts` to call `await ensurePostgresAvailable()` and `await app.init()` before querying `prisma.category.count()`.
  - Updated `apps/api/src/prisma/prisma.service.ts` fallback URL to include `sslmode=disable`.
  - Added `GET /api/v1` root handler in `HealthController` alongside `GET /api/v1/health`.

### Issue C: Frontend `Failed to fetch` Runtime Error Handling
- **Proven Root Cause:**
  1. Because the backend API failed to start due to Issues A & B, browser requests to `http://localhost:4000/api/v1/*` threw `TypeError: Failed to fetch`.
  2. Eleven frontend pages (`products`, `refurbished`, `services`, and eight `/admin/*` pages) had `async` data loaders inside `useEffect` without a `catch` block, causing unhandled promise rejections in Next.js when the API was unreachable.
- **Fix Applied:**
  - Added Next.js `/api/v1/:path*` rewrite proxy in `apps/web/next.config.js` and automatic proxy fallback + descriptive error formatting in `apps/web/src/lib/api.ts`.
  - Expanded CORS in `apps/api/src/bootstrap.ts` to allow both `localhost` and `127.0.0.1` origins on any local port in development.
  - Added `try/catch` error handling across all frontend data loaders so no route can crash with an unhandled rejection.

---

## 2. Verification Results

- **Port 4000 Listener Check (`ss -ltnp | grep ':4000'`):** Verified `LISTEN 0 511 0.0.0.0:4000` (`node-22`).
- **HTTP Root Check (`curl -i http://localhost:4000/api/v1`):** Verified `HTTP/1.1 200 OK` with `{"status":"ok","database":"connected","demoMode":true}`.
- **TypeScript Check (`npm run typecheck`):** Passed (`@kirans/shared`, `@kirans/api`, `@kirans/web` — 0 errors).
- **Backend Unit Tests (`npm --workspace=apps/api run test`):** Passed (`2/2` suites, `7/7` tests).
- **Backend E2E Workflow Suite (`npm run test:e2e`):** Passed (`1/1` suite, `9/9` comprehensive end-to-end customer, admin, and security scenarios).
- **Frontend Production Build (`npm --workspace=apps/web run build`):** Passed (`32/32` routes compiled).
