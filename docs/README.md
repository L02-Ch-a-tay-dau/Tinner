# Tinner API documentation

OpenAPI specification for the NestJS backend.

## Files

| File | Description |
|------|-------------|
| [`openapi.yaml`](openapi.yaml) | OpenAPI 3.x spec (generated; commit after API changes) |

## Regenerate spec

From repo root (no database required):

```bash
pnpm openapi:generate
```

Runs [`apps/backend/scripts/generate-openapi.ts`](../apps/backend/scripts/generate-openapi.ts).

## Interactive Swagger UI

With the backend running:

```bash
pnpm dev:backend
```

Open [http://localhost:3000/api/docs](http://localhost:3000/api/docs). Use **Authorize** with `Bearer <accessToken>` from `POST /api/v1/auth/login`.

## API overview

Base path: `/api/v1`

| Tag | Endpoints | Auth |
|-----|-----------|------|
| health | `GET /health` | Public |
| auth | `POST /register`, `/login`, `/refresh`; `POST /logout`, `GET /me` | Public except logout/me |
| dishes | `GET /dishes` | JWT |
| suggestions | `GET /suggestions?lat=&lng=&dishType=` | JWT |
| filters | `GET /filters`, `PUT /filters` | JWT |
| interactions | `POST /like`, `/save`; `GET /saved`; `DELETE /saved/:id` | JWT |
