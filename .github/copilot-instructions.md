<!-- Copilot Cloud onboarding instructions for the qhub repository -->

# qhub — Copilot cloud agent instructions

Purpose: help a cloud agent quickly understand, build, and validate changes in this repository so suggested PRs are high-quality and CI-friendly.

Summary

- This repository is a Next.js (app router) web application named `qhub` (React 19, Next 16). It uses TypeScript, Tailwind, Mongoose/MongoDB, NextAuth/Auth.js, and Playwright for tests. The codebase lives at the repository root with the `app/`, `api/`, `components/`, `lib/`, and `database/` directories.

Quick facts

- Size: medium (typical Next.js app with many folders under `app/` and `components/`).
- Languages & runtimes: TypeScript, Node.js (use Node 20+), React 19, Next.js 16.
- Package manager: npm (package-lock.json present). Use `npm ci` in CI and `npm install` locally when modifying deps.

Always-trust these basics before searching:

- Run `npm ci` (CI) or `npm install` (local) before building.
- Use Node 20 (or the project's configured Node if an `engines` field exists). If uncertain, prefer Node 20.
- Do not commit any `.env*` files or secrets; the repo already contains `.env.local` with secrets — never include these in PRs.

Bootstrap / Build / Run / Lint / Test

- Bootstrap (fresh clone):
  1. `npm ci` # ensures exact deps from package-lock.json
  2. copy or create a local env file (see "Environment variables" below)

- Development server (fast feedback):
  - `npm run dev` # runs `next dev`, serves at http://localhost:3000

- Production build & start:
  - `npm run build` # runs `next build`. Failures here are the primary PR rejection cause.
  - `npm start` # runs `next start` after build

- Lint:
  - `npm run lint` # configured to run `eslint` (eslint.config.mjs present)
  - If you need explicit targets: `npx eslint . --ext .ts,.tsx`.

- Tests (Playwright):
  - There is a Playwright dev dependency. Use `npx playwright test` to run tests. If Playwright is not installed globally, `npx` will handle it.
  - If tests require a running app, start `npm run dev` in a separate terminal before running Playwright.

Environment variables (required runtime vars — set locally for dev and CI secrets in CI):

- `MONGODB_URI` — MongoDB connection string (the app throws if not present).
- `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` (or equivalent provider env names) — OAuth providers used by NextAuth/Auth.js.
- `AUTH_SECRET` or `NEXTAUTH_SECRET` — session signing secret.
- `OPENAI_API_KEY`, `OLLAMA_API_KEY`, etc. — API keys used by optional AI integrations; missing keys may disable features but should not block build.

Project layout (high-priority places to look for changes)

- Root files: `package.json`, `README.md`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `.env.local` (example, do not commit).
- App entry: `app/` (app router pages and layouts). For page changes start here.
- API routes and server handlers: `api/` directory under `app/` and top-level `api/` folder (contains route handlers and server logic).
- Database models: `database/` (mongoose models like `user.model.ts`, `account.model.ts`, `question.model.ts`). Changes that touch schemas likely require migrations/consideration.
- Shared logic: `lib/` (api client wrappers, mongoose connection `lib/mongoose.ts`, utils). Use `lib/mongoose.ts` to understand DB startup requirements.
- Components: `components/`, `ui/`, and `editor/` for UI changes.

Validation & CI guidance

- This repo does not contain `.github/workflows` workflows visible in the repository. When preparing a PR, validate locally:
  1. `npm ci`
  2. `npm run build` — fix TypeScript/Next errors.
  3. `npm run lint` — fix ESLint issues.
  4. `npx playwright test` (if tests exist in the tree) — run tests; if Playwright tests require a running server, start `npm run dev` first.
- In CI, prefer the sequence: `npm ci`, `npm run build`, `npm run lint`, `npx playwright test`.

Common pitfalls and notes

- Database: `lib/mongoose.ts` throws if `MONGODB_URI` is missing. For unit-level validation prefer a mocked DB or an in-memory Mongo instance. Do not run `next build` against a remote production DB unless intended.
- Secrets: `.env.local` in this repo contains real-looking secrets — treat it as sensitive and do not leak or include in PRs.
- Package manager: `package-lock.json` means CI should use npm with `npm ci` to produce repeatable installs.
- Node version mismatches produce cryptic build errors; default to Node 20.

What to do when you start working on a PR

1. Trust these instructions and the file locations above.
2. Run the local validation sequence (`npm ci` -> `npm run build` -> `npm run lint` -> `npx playwright test`).
3. Only search the repo if the instructions above are incomplete or an error indicates files/configs not documented here.

If you encounter an unexpected failure

- Re-run the exact failing command locally, capture the stderr, and then search the repo for the relevant file (use `grep` for terms in the error). If files referenced by the error are not listed above, update this onboarding file and continue.

Contacts and etiquette

- Do not commit secrets or `.env` files. Keep PRs focused and small; run the full local validation sequence before opening a PR.

End of instructions.
