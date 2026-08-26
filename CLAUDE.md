# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

Package manager is **pnpm** (not npm/yarn — `packageManager` is pinned in `package.json`).

```bash
pnpm install --frozen-lockfile  # CI-style install
pnpm dev                        # next dev, http://localhost:3000
pnpm build                      # next build (primary PR gate — most breakage shows up here)
pnpm lint                       # eslint
pnpm lint:fix                   # eslint --fix .
pnpm type-check                 # tsc --noEmit
pnpm format                     # prettier --write .

pnpm test                       # jest
pnpm test -- path/to/file.test.ts        # single file
pnpm test -- -t "test name"              # single test by name
pnpm test:watch
pnpm test:coverage

pnpm test:e2e                   # playwright test (no e2e tests currently checked in)
```

`typescript` and `eslint` are intentionally held below their npm "latest" (`^5.9.x` / `^9.x`) — `@typescript-eslint` doesn't yet support TypeScript 7 (the Go-native compiler), and `eslint-config-next`'s own plugin peer deps still cap at `eslint ^9`. Check `npm view eslint-config-next dependencies` / `@typescript-eslint/parser peerDependencies` before bumping either.

Husky pre-commit runs `lint-staged` (eslint --fix + prettier on staged files). Hooks use Husky v9 format (no `_/husky.sh` shim).

## Architecture

### Two parallel data-access paths

Most read/write logic lives in **`lib/actions/*.ts`** — Next.js Server Actions (`"use server"`) called directly from Server Components. They import Mongoose models from `database/` directly, no HTTP involved.

A separate, smaller **REST layer** (`app/api/*/route.ts`, wrapped by `lib/api.ts` on the client) exists only where a real HTTP boundary is needed:

- Client Components that can't call server actions directly (e.g. `api.ai.getAnswer` from `AnswerForm`'s "Generate AI Answer" button, which hits `app/api/ai/answers/route.ts`).
- `auth.ts` (NextAuth callbacks) — these run in a context where the account/user lookups go through `api.accounts.getByProvider` / `api.users.getById` (HTTP) rather than through `lib/actions`, and resolve `session.user.id`/`token.sub` to the internal Mongo user id.

When adding a feature, default to a server action; only add an `app/api` route if something outside a Server Component genuinely needs it.

### Server action helper pattern

`lib/handlers/action.ts` (`action()`) is the entry point most `lib/actions/*` functions call first: it validates `params` against a Zod `schema`, optionally requires a session (`authorize: true`, throws-as-return `UnauthorizedError`), and calls `dbConnect()` — all in one step. It **returns an `Error` instance on failure rather than throwing**, so callers check `if (validationResult instanceof Error)` and pass it to `handleError()`.

`lib/handlers/error.ts` (`handleError`) + the `RequestError` subclasses in `lib/http-errors.ts` (`ValidationError`, `NotFoundError`, `UnauthorizedError`, `ForbiddenError`, `InternalServerError`) are the shared error path for both server actions (`responseType: "server"`) and API routes (`responseType: "api"`, returns a `NextResponse`).

### Global ambient types

`types/global.d.ts` and `types/action.d.ts` declare types with no exports — they're available everywhere without importing: `ActionResponse<T>`, `SuccessResponse<T>`, `ErrorResponse`, `PaginatedResponse<T>`, domain interfaces (`Question`, `Answer`, `User`, `Tag`, `Job`, ...), and action-param interfaces (`CreateQuestionParams`, `UpdateUserParams`, ...). Don't import these — just use them.

### Database

`lib/mongoose.ts` holds a global-cached connection singleton (serverless-safe) and side-effect-imports `database/index.ts` so every model is registered before any query runs. `database/index.ts` is a barrel re-exporting all `*.model.ts` files. Question↔Tag is a many-to-many via the join model `tag-question.model.ts`, not embedded arrays. Multi-step writes (e.g. `createQuestion`) use `mongoose.startSession()` transactions.

Avoid `any` in new/changed code — prefer explicit types, `Partial<T>`, `unknown`, or the ambient interfaces above.

### Auth

NextAuth v5 (`auth.ts`): GitHub, Google, and Credentials providers. The `jwt`/`session` callbacks look up the internal account/user via the REST layer and rewrite `token.sub`/`session.user.id` to the Mongo `_id` — the OAuth provider's own id is never used downstream.

### UI

`components/ui/*` is shadcn/ui (`new-york` style, lucide-react icons — see `components.json` for path aliases) and is kept flat, matching what the shadcn CLI writes — don't folderize these. Everywhere else, every folder directly under `components/` is a lowercase category (`cards/`, `forms/`, `navigation/`, `shared/`, `user/`, ...), and every component lives one level deeper in its own PascalCase folder: `ComponentName/ComponentName.tsx` plus `ComponentName/index.ts` re-exporting the default, so `@/components/.../ComponentName` still resolves. Don't nest a category folder inside a component folder (or vice versa) — if a "component" folder needs sub-parts (like `navigation/Navbar/` needing `NavLinks`), promote the sub-parts to sibling component folders in the same category rather than nesting them, so casing stays a reliable category-vs-component signal at every level. Colocate a component's test as `ComponentName/ComponentName.test.tsx`. Use `@/components/...` absolute imports between components (not relative `../`), since relative paths break the moment a file moves folders. The MDX editor (`components/editor/Editor/Editor.tsx`, wraps `@mdxeditor/editor`) is always dynamically imported with `ssr: false` (see usage in `AnswerForm.tsx` / `QuestionForm.tsx`) since it's not SSR-safe.

### Routing

`app/(auth)/*` (sign-in/sign-up, own layout) and `app/(root)/*` (everything else, shared shell) are separate route groups — check which layout a new page needs before placing it.
