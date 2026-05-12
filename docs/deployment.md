# Deployment

## Production Model

StatusZap uses independent deploys:

- Frontend on Vercel from `apps/frontend`.
- Backend as a Docker service from `apps/backend`.
- PostgreSQL as a managed database.

This keeps cost and complexity low while allowing each side to scale separately.

## Required Backend Environment

Set these in Railway, Render, Coolify, EC2 or your VPS `.env`:

```env
SPRING_PROFILES_ACTIVE=prod
PORT=8080
DB_URL=jdbc:postgresql://host:5432/statuszap
DB_USER=statuszap
DB_PASS=replace-me
JWT_SECRET=replace-with-32-plus-random-characters
FRONT_URL=https://app.statuszap.com
API_URL=https://api.statuszap.com
STORAGE_DIR=/app/uploads
STORAGE_URL=https://api.statuszap.com/uploads
DDL_AUTO=validate
```

Until database migrations are introduced, use `DDL_AUTO=update` only for an initial controlled bootstrap, then return to `validate`.

## Vercel Frontend

Configure Vercel with:

- Root directory: `apps/frontend`
- Build command: `npm run typecheck && npm run build`
- Output directory: `dist`
- Environment:
  - `VITE_API_URL=https://api.statuszap.com/api`
  - `VITE_APP_URL=https://app.statuszap.com`

## Docker Host or VPS

For a single Docker host:

```bash
cp .env.example .env
docker compose -f docker-compose.prod.yml up --build -d
```

Rollback:

```bash
docker compose -f docker-compose.prod.yml up -d
```

If using image tags, set `BACKEND_IMAGE` and `FRONTEND_IMAGE` to the previous known-good tag and run `up -d`.

## Health Checks

Backend:

- `/actuator/health`
- `/actuator/health/liveness`
- `/actuator/health/readiness`

Frontend Docker:

- `/healthz`

## Remaining Production Risks

- Add Flyway before serious production data growth.
- Move uploads to object storage when multiple backend instances are needed.
- Add refresh tokens and token revocation for stronger session control.
