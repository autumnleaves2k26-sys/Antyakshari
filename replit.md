# Antyakshari — Event Registration Platform

A full-stack event registration website for "Antyakshari — more than a jamming", a live music event on 31 May 2026 by Autumn Leaves Events.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port varies)
- `pnpm --filter @workspace/antyakshari run dev` — run the frontend (port varies)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, shadcn/ui, Framer Motion, Wouter routing
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/db/src/schema/registrations.ts` — registrations table schema
- `lib/db/src/schema/participants.ts` — participants table schema
- `artifacts/api-server/src/routes/registrations.ts` — registration + payment screenshot endpoints
- `artifacts/api-server/src/routes/admin.ts` — admin login, list, approve/reject, stats
- `artifacts/api-server/src/routes/passes.ts` — QR validation and mark-used
- `artifacts/antyakshari/src/pages/` — all frontend pages
- `artifacts/antyakshari/src/components/Navbar.tsx` — site-wide navbar

## Architecture decisions

- Contract-first: OpenAPI spec drives both frontend hooks (Orval/React Query) and backend Zod validation
- Admin auth uses a simple Bearer token stored in localStorage; token and password are env vars (ADMIN_PASSWORD, ADMIN_TOKEN)
- Passes are generated server-side on approval: format `ANT-2026-XXX-YYYY`, each with a unique QR token
- Single-database: all registration and participant data in Replit PostgreSQL via Drizzle ORM
- Dark warm theme throughout: matte black + warm orange/gold, Playfair Display serif headings

## Product

- **Homepage** (`/`) — cinematic hero with event details, about section, highlights, pricing, rules, venue, footer
- **Register** (`/register`) — multi-step form: personal info → participant details → payment → confirmation
- **Booking Status** (`/booking/:bookingId`) — view registration status and passes if approved
- **Admin Login** (`/admin`) — password-protected admin entry
- **Admin Dashboard** (`/admin/dashboard`) — stats, tabbed list of registrations, approve/reject actions
- **QR Scan** (`/scan`) — manual QR token entry for pass validation at the door

## User preferences

- Event date: 31 May 2026
- Organizer: Autumn Leaves Events — "We Plan Your Party"
- Theme: warm orange (#e8813a), soft gold (#c9a84c), matte black, cream
- Admin password (default): `antyakshari2026`

## Gotchas

- Always run codegen after changing `lib/api-spec/openapi.yaml`
- Admin routes require `Authorization: Bearer <ADMIN_TOKEN>` header; the frontend reads `adminToken` from localStorage
- After DB schema changes, run `pnpm --filter @workspace/db run push`
- The `@assets/` Vite alias points to `attached_assets/` at the workspace root

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
