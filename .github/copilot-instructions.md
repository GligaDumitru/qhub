<!-- Copilot Cloud onboarding instructions for the qhub repository -->

# qhub — Copilot cloud agent instructions

Purpose: help a cloud agent quickly understand, build, and validate changes in this repository so suggested PRs are high-quality and CI-friendly.

Summary

- This repository is a Next.js (app router) web application named `qhub` (React 19, Next 16). It uses TypeScript, Tailwind, Mongoose/MongoDB, NextAuth/Auth.js, Jest, and Playwright for tests. The codebase lives at the repository root with the `app/`, `components/`, `lib/`, and `database/` directories (API routes live under `app/api/`, not a top-level `api/`).

Quick facts

- Size: medium (typical Next.js app with many folders under `app/` and `components/`).
- Languages & runtimes: TypeScript, Node.js (use Node 24+, per `engines` in package.json), React 19, Next.js 16.
- Package manager: pnpm (pnpm-lock.yaml present, `packageManager` pinned in package.json). Use `pnpm install --frozen-lockfile` in CI and `pnpm install` locally when modifying deps.

Always-trust these basics before searching:

- Run `pnpm install --frozen-lockfile` (CI) or `pnpm install` (local) before building.
- Use Node 24+ per the project's `engines` field.
- Do not commit any `.env*` files or secrets; the repo already contains `.env.local` with secrets — never include these in PRs.

Bootstrap / Build / Run / Lint / Test

- Bootstrap (fresh clone):
  1. `pnpm install --frozen-lockfile` # ensures exact deps from pnpm-lock.yaml
  2. copy or create a local env file (see "Environment variables" below)

- Development server (fast feedback):
  - `pnpm dev` # runs `next dev`, serves at http://localhost:3000

- Production build & start:
  - `pnpm build` # runs `next build`. Failures here are the primary PR rejection cause.
  - `pnpm start` # runs `next start` after build

- Lint & type-check:
  - `pnpm lint` # eslint (eslint.config.mjs present)
  - `pnpm type-check` # tsc --noEmit

- Tests:
  - Unit tests (Jest): `pnpm test`. Colocated with source (e.g. `lib/utils.test.ts`).
  - E2E (Playwright): `pnpm test:e2e`. If tests require a running app, start `pnpm dev` in a separate terminal first.

Environment variables (required runtime vars — set locally for dev and CI secrets in CI):

- `MONGODB_URI` — MongoDB connection string (the app throws if not present).
- `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` (or equivalent provider env names) — OAuth providers used by NextAuth/Auth.js.
- `AUTH_SECRET` or `NEXTAUTH_SECRET` — session signing secret.
- `OPENAI_API_KEY`, `OLLAMA_API_KEY`, etc. — API keys used by optional AI integrations; missing keys may disable features but should not block build.

Project layout (high-priority places to look for changes)

- Root files: `package.json`, `README.md`, `CLAUDE.md`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `.env.local` (example, do not commit).
- App entry: `app/` (app router pages and layouts). For page changes start here.
- API routes and server handlers: `app/api/*/route.ts`. Most logic lives in `lib/actions/*.ts` server actions instead — only add an API route when something outside a Server Component needs an HTTP boundary.
- Database models: `database/` (mongoose models like `user.model.ts`, `account.model.ts`, `question.model.ts`). Changes that touch schemas likely require migrations/consideration.
- Shared logic: `lib/` (api client wrappers, mongoose connection `lib/mongoose.ts`, utils). Use `lib/mongoose.ts` to understand DB startup requirements.
- Components: `components/`, `ui/`, and `editor/` for UI changes.

Validation & CI guidance

- CI runs at `.github/workflows/ci.yml` (install, build, lint, type-check). When preparing a PR, validate locally with the same sequence:
  1. `pnpm install --frozen-lockfile`
  2. `pnpm build` — fix TypeScript/Next errors.
  3. `pnpm lint` — fix ESLint issues.
  4. `pnpm type-check`
  5. `pnpm test` (unit) and `pnpm test:e2e` (Playwright, if e2e tests exist in the tree; start `pnpm dev` first if they need a running server).

Common pitfalls and notes

- Database: `lib/mongoose.ts` throws if `MONGODB_URI` is missing. For unit-level validation prefer a mocked DB or an in-memory Mongo instance. Do not run `next build` against a remote production DB unless intended.
- Secrets: `.env.local` in this repo contains real-looking secrets — treat it as sensitive and do not leak or include in PRs.
- Package manager: `pnpm-lock.yaml` means CI and local installs should use pnpm (`pnpm install --frozen-lockfile` / `pnpm install`), not npm or yarn.
- Node version mismatches produce cryptic build errors; default to Node 24+ per `engines`.

- Types: Do NOT use the `any` type in new code or suggested patches. Prefer explicit types, `Partial<T>`, `unknown`, `Record<string, unknown>`, or concrete interfaces. If a generated suggestion uses `any`, replace it with a specific type or `unknown` and explain why a broader type is necessary in the PR description.

What to do when you start working on a PR

1. Trust these instructions and the file locations above.
2. Run the local validation sequence (`pnpm install --frozen-lockfile` -> `pnpm build` -> `pnpm lint` -> `pnpm type-check` -> `pnpm test`).
3. Only search the repo if the instructions above are incomplete or an error indicates files/configs not documented here.

If you encounter an unexpected failure

- Re-run the exact failing command locally, capture the stderr, and then search the repo for the relevant file (use `grep` for terms in the error). If files referenced by the error are not listed above, update this onboarding file and continue.

Contacts and etiquette

- Do not commit secrets or `.env` files. Keep PRs focused and small; run the full local validation sequence before opening a PR.

End of instructions.
