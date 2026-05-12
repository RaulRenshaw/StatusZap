# Release Flow

## Branches

- `feature/*` branches start from `develop`.
- `release/*` branches start from `develop`.
- `hotfix/*` branches start from `main`.
- `main` is production.
- `develop` is staging.

## Standard Feature Flow

```bash
git checkout develop
git pull
git checkout -b feature/my-change
```

Open a pull request back to `develop`. CI must pass before merge.

## Staging

Every merge to `develop` triggers staging deploy through the configured hooks.

## Release Candidate

Create a release branch:

```bash
git checkout develop
git pull
git checkout -b release/0.2.0
git push -u origin release/0.2.0
```

The release candidate workflow creates a prerelease tag like:

```text
v0.2.0-rc.123
```

Only bug fixes and release hardening should go into `release/*`.

## Production Release

Merge the release branch to `main`. The release workflow uses release-please to create the GitHub release and changelog from Conventional Commits.

After `main` is updated, production deploy runs through the configured deploy hooks.

## Hotfix

```bash
git checkout main
git pull
git checkout -b hotfix/short-description
```

Open a pull request to `main`, then merge the same fix back to `develop`.

## Rollback

Frontend rollback is done in Vercel by promoting the previous deployment.

Backend rollback depends on the host:

- Railway/Render: redeploy the previous successful deploy.
- Docker Host/Coolify: set the previous image tag and run `docker compose -f docker-compose.prod.yml up -d`.
