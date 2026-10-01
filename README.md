# Massar Fleet API

NestJS + TypeORM + PostgreSQL REST API for the Massar Fleet mission-management frontend.

## Run locally

1. Copy `.env.example` to `.env` and keep the local values, or set your own PostgreSQL URL and secrets (secrets must be at least 32 characters).
2. Start PostgreSQL: `docker compose up -d postgres`.
3. Install packages: `npm install`.
4. Create the schema: `npm run migration:run`.
5. Load the frontend-compatible demo data: `npm run seed`.
6. Start the API: `npm run start:dev`.

The API is available at `http://localhost:3000/api`; Swagger UI is at `http://localhost:3000/api/docs`.

All seeded users use the password `Massar123!`. Login accepts either email, matricule, or `identifier` and returns an access token plus a refresh token. Store the access token in memory (or a secure application-managed session), send it as `Authorization: Bearer <token>`, and keep the refresh token in an httpOnly, Secure, SameSite cookie in production. The API does not return password hashes.

## Docker

`docker compose up -d postgres` starts only the persisted database. To run the API container too, create `.env`, build with `docker compose build api`, and run `docker compose up -d`; run the migration and seed commands from a one-off Node container or from the host before first start. A production deployment should run migrations as a release step and set `RUN_MIGRATIONS=true` only when that release process owns schema changes.

## Frontend migration guide

Replace imports from `src/data/mock.ts` and `src/data/telemetry.ts` with an API client configured with `VITE_API_BASE_URL=http://localhost:3000/api`. List endpoints return `{ data, meta }`; mission responses preserve the frontend fields (`employee`, `matricule`, `structure`, `departure`, `destination`, `route`, and the existing status strings). The driver response keeps `status` as the computed effective status and adds `storedStatus`/`effectiveStatus`. Notifications include nullable `userId` for broadcasts.

Use `POST /auth/login`, `POST /auth/refresh`, and `POST /auth/logout`. Refresh tokens are rotated and invalidated on logout. All other routes require a bearer access token.

## API highlights

- Mission state machine: `submit-for-validation`, `validate`, `reject`, `assign`, `confirm`, `start`, `complete`, and `cancel`. Invalid transitions return HTTP 409.
- CRUD and filters for users, drivers, vehicles, and missions; all list routes support pagination and return consistent metadata.
- Persisted vehicle telemetry at `/vehicles/:id/telemetry`, maintenance/fuel sub-resources, and wear updates.
- CSV downloads at `/missions/export`, `/vehicles/export`, and `/drivers/export`.
- Dashboard aggregation at `/dashboard/stats`.
- Consistent errors: `{ statusCode, message, error, path, timestamp }`.

## Configuration

`DB_SYNCHRONIZE` is intentionally false by default. Use checked-in TypeORM migrations for schema changes. `CORS_ORIGINS` accepts a comma-separated list for the Vite dev server and production frontend URL.
