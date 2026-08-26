# QHub

QHub is a community-driven Q&A web application built with Next.js (App Router), React, TypeScript, Tailwind CSS, and MongoDB. It includes authentication (NextAuth), a rich editor, and optional AI integrations.

This README focuses on developer onboarding: setup, environment, scripts, testing, and CI details.

---

## Quickstart (local development)

1. Install Node (recommended >= 24). Use `nvm` or similar to manage versions.
2. Install [pnpm](https://pnpm.io/installation) (>= 10) if you don't have it, e.g. `corepack enable` or `npm install -g pnpm`.
3. Install dependencies:

```bash
pnpm install --frozen-lockfile
```

4. Set up local environment variables by creating `.env.local` (see Environment variables below).

5. Start the development server:

```bash
pnpm dev
# Open http://localhost:3000
```

Notes: `pnpm install --frozen-lockfile` is preferred in CI for reproducible installs. Use `pnpm install` when adding/updating packages locally.

---

## Project layout (high-level)

- `app/` — Next.js App Router pages, layouts, and server components.
- `components/` — React components used across the app.
- `lib/` — utilities, DB connector, logger and API wrappers.
- `database/` — Mongoose models.
- `public/` — static assets.
- `docs/` — ADRs and backlog (architecture decisions and tasks).

---

## Environment variables

Create `.env.local` for local development. Do NOT commit secrets.

Minimum required variables:

- `MONGODB_URI` — MongoDB connection string.
- `NEXTAUTH_SECRET` or `AUTH_SECRET` — session signing secret for NextAuth.

Optional provider & AI variables (only if using these features):

- `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`
- `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`
- `OPENAI_API_KEY`, `OLLAMA_API_KEY`

Example `.env.local` (never commit):

```
MONGODB_URI="mongodb+srv://user:password@cluster.example.com/qhub"
NEXTAUTH_SECRET="a_long_random_secret"
AUTH_GITHUB_ID="..."
AUTH_GITHUB_SECRET="..."
OPENAI_API_KEY="sk-..."
```

CI: Set the same variables in your CI provider's secrets (e.g., GitHub Actions Secrets).

---

## Scripts

Important pnpm scripts (defined in `package.json`):

- `pnpm dev` — Start Next dev server.
- `pnpm build` — Create production build.
- `pnpm start` — Start production server after build.
- `pnpm lint` — Run ESLint.
- `pnpm lint:fix` — Run ESLint with `--fix`.
- `pnpm type-check` — Run TypeScript type-check (`tsc --noEmit`).
- `pnpm format` — Run Prettier to format files.
- `pnpm test:e2e` — Run Playwright tests (if present).

Run `pnpm run` to see all available scripts.

---

## Developer tooling and conventions

- ESLint + Prettier configured. Use `pnpm lint:fix` and `pnpm format` before committing.
- Husky + lint-staged are installed to run linters/formatters on staged files automatically.
- TypeScript: `strict` mode is enabled — keep types up-to-date when changing public interfaces.

---

## Database

- `lib/mongoose.ts` contains the DB connect helper and a global cache pattern to reuse Mongoose connections in serverless environments.
- The app expects `MONGODB_URI` to be provided. For local development you can use a local Mongo instance or a hosted dev DB.

---

## Testing

- End-to-end: Playwright is available in devDependencies. Currently no Playwright tests are included by default. You can scaffold tests in `tests/` and run them with `pnpm test:e2e`.
- Unit tests: Not included by default. Consider adding `vitest` or `jest` for component and utility tests.

---

## CI / GitHub Actions

- A CI workflow is included at `.github/workflows/ci.yml` that runs build, lint, and type-check steps.
- Playwright tests were removed from the default CI flow to avoid failures when tests are not present. Add them back or gate them behind a dedicated workflow when you add tests.

---

## Adding a new feature / PR checklist

1. Branch from `main` and use descriptive branch names (e.g., `feat/add-login` or `fix/db-timeout`).
2. Run `pnpm lint` and `pnpm type-check` locally.
3. Add/adjust unit and e2e tests where relevant.
4. Ensure `README`, `docs/` or ADRs are updated for architectural changes.

---

## Contributing

1. Fork or create a branch on the main repo.
2. Follow the PR checklist above.
3. Run Husky hooks locally (`pnpm run prepare` installs them) — commit will run linters on staged files.
4. Open a PR and reference relevant backlog/ADR items from `docs/`.

---

## Troubleshooting

- Build-time error referencing `MONGODB_URI` during `next build` usually means some module attempts to connect at import time. The recommended pattern is to validate and connect at runtime (see `lib/mongoose.ts`).
- If CI shows Node version warnings, ensure your workflow `.github/workflows/ci.yml` sets the correct `node-version` and that `engines` in `package.json` reflects the intended version.

---

## Where to find things

- Backlog and ADRs: `docs/` (e.g., `docs/ADR-2026-08-12-qhub-technical-backlog.md`, `docs/backlog-2026-08-12.md`)
- DB models: `database/`
- Shared utils: `lib/`
