# CI/CD

## Workflows

`CI` runs on pull requests and on these branches:

- `main`
- `develop`
- `feature/*`
- `release/*`
- `hotfix/*`

It validates:

- branch naming
- frontend lint
- frontend typecheck
- frontend tests
- frontend build
- npm audit at high severity
- backend tests
- backend Docker build
- frontend Docker build
- compose file syntax

`CD` runs on:

- `develop` for staging
- `main` for production
- manual dispatch for either environment

The deploy strategy uses provider deploy hooks to stay simple:

- `VERCEL_STAGING_DEPLOY_HOOK_URL`
- `VERCEL_PRODUCTION_DEPLOY_HOOK_URL`
- `BACKEND_STAGING_DEPLOY_HOOK_URL`
- `BACKEND_PRODUCTION_DEPLOY_HOOK_URL`

## GitHub Environments

Create two GitHub environments:

- `staging`
- `production`

Recommended production protection:

- required reviewers
- prevent self-review
- wait timer if needed

## Branch Protection

Protect `main` and `develop` with:

- require pull request before merge
- require CI to pass
- require branch to be up to date
- disallow force pushes
- require linear history if the team prefers squash merges

## Local Hooks

Install local hooks once:

```bash
npm run prepare
```

Hooks enforce:

- Conventional Commit subject format
- frontend lint/typecheck/tests before push
- backend tests before push
