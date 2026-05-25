# Tinner Monorepo

Monorepo for Tinner app with:

- `apps/backend`: NestJS + Prisma + PostgreSQL backend.
- `apps/mobile`: Expo React Native mobile app.
- `packages/types`: shared DTO and enums.
- `packages/api-client`: typed API client used by mobile.
- `Figma Frontend`: original Figma-exported reference UI.

## Prerequisites

- Node.js 22+
- pnpm 10+
- Docker (recommended for local PostgreSQL)

## Quick start

1. Install dependencies:

```bash
pnpm install
```

2. Start PostgreSQL:

```bash
docker compose up -d postgres
```

3. Configure backend env:

```bash
cp apps/backend/.env.example apps/backend/.env
```

4. Apply migration and seed:

```bash
pnpm --filter @tinner/backend prisma:generate
pnpm --filter @tinner/backend prisma:migrate
pnpm --filter @tinner/backend prisma:seed
```

5. Run backend:

```bash
pnpm dev:backend
```

6. Run mobile app (another terminal):

```bash
pnpm dev:mobile
```

Set `EXPO_PUBLIC_API_BASE_URL` in `apps/mobile/.env` if your API host is not `http://10.0.2.2:3000`.

## API documentation

- **OpenAPI spec (YAML):** [`docs/openapi.yaml`](docs/openapi.yaml) — regenerate after API changes with `pnpm openapi:generate` (no database required).
- **Swagger UI:** with backend running, open [http://localhost:3000/api/docs](http://localhost:3000/api/docs).
- See [`docs/README.md`](docs/README.md) for endpoint overview.

## Docker scripts

- Start full local stack (Postgres + Backend): `pnpm docker:up`
- Stop local stack: `pnpm docker:down`
- Tail logs: `pnpm docker:logs`
- Validate production backend image build: `pnpm deploy:render:validate`

The backend container runs Prisma migrations automatically before starting NestJS.

## Deploy backend on Render

1. Push this repo to GitHub.
2. Create a Render Blueprint service using `render.yaml` (or create a Docker Web Service manually).
3. Set secret env vars in Render:
   - `DATABASE_URL`
   - `JWT_ACCESS_SECRET`
   - `JWT_REFRESH_SECRET`
   - `GOOGLE_MAPS_API_KEY`
4. Health check endpoint is `GET /api/v1/health`.

## Deploy web frontend on Vercel

If you also deploy the reference web UI (`Figma Frontend`) to Vercel:

1. Import the repo on Vercel.
2. Set Root Directory to `Figma Frontend`.
3. Vercel uses `Figma Frontend/vercel.json`:
   - build command: `pnpm build`
   - output directory: `dist`

## Build APK for submission

The mobile app has EAS profiles configured in `apps/mobile/eas.json` (`preview`, `production`).

1. Login EAS:

```bash
npx eas-cli login
```

2. Set production API host for EAS build profile (`preview` and `production`):

```bash
npx eas-cli env:create --scope project --name EXPO_PUBLIC_API_BASE_URL --value https://<your-render-service>.onrender.com
```

3. Build preview APK:

```bash
pnpm --filter @tinner/mobile apk:build-preview
```

4. Build production APK:

```bash
pnpm deploy:apk
```

The generated APK download link is returned by EAS after build finishes.
