# StatusZap

StatusZap is a fullstack SaaS for service order tracking with WhatsApp-friendly public links.

## Architecture

This repository is a simple monorepo:

```text
apps/
  frontend/   React + TypeScript + Vite
  backend/    Spring Boot + PostgreSQL
docs/         Deployment, CI/CD and release process
.github/      GitHub Actions and Dependabot
```

Recommended production topology:

- Frontend: Vercel, independent deploy.
- Backend: Docker on Railway, Render, Coolify, EC2 or a small VPS.
- Database: managed PostgreSQL.
- Uploads: local Docker volume initially; migrate to object storage when usage grows.

## Local Setup

```bash
cp .env.example .env
npm run prepare
docker compose up --build
```

Frontend: `http://localhost:4200`

Backend: `http://localhost:8080`

Health: `http://localhost:8080/actuator/health`

## Development Commands

```bash
npm run frontend:dev
npm run frontend:lint
npm run frontend:typecheck
npm run frontend:test
npm run backend:test
```

## Branch Strategy

- `main`: production branch.
- `develop`: staging branch.
- `feature/*`: regular feature work.
- `release/*`: release candidates.
- `hotfix/*`: urgent production fixes.

Use Conventional Commits, for example:

```text
feat: add onboarding page
fix(api): validate webhook signature
ci: add release workflow
```

## Documentation

- [Deployment](docs/deployment.md)
- [CI/CD](docs/ci-cd.md)
- [Release Flow](docs/release-flow.md)
