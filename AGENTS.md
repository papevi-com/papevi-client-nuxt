# AGENTS.md

Guidance for AI agents (GitHub Copilot, OpenAI Codex, etc.) working in this repository.

---

## Project overview

`papevi-client-nuxt` is the Nuxt 4 frontend for [papevi.com](https://papevi.com).
It is a TypeScript, Vue 3, Nuxt 4 application that consumes `https://api.papevi.com`
using a server-side bearer token (`API_TOKEN`).

Key files:

| Path                | Purpose                                       |
| ------------------- | --------------------------------------------- |
| `app/app.vue`       | Root Vue component                            |
| `app/composables/`  | Reusable composables (auto-imported by Nuxt)  |
| `app/repositories/` | Data-access layer — one file per API resource |
| `nuxt.config.ts`    | Nuxt configuration (runtime config, modules)  |
| `vitest.config.ts`  | Vitest configuration                          |
| `.oxlintrc.json`    | oxlint rule configuration                     |
| `.env.example`      | Required environment variables                |

---

## Workflow for every task

Follow this sequence on every task, no matter how small:

1. **Understand** — read the relevant source files; use `grep`/`glob`/`view` to explore before touching anything.
2. **Docs** — consult current Nuxt 4 docs (`https://nuxt.com/docs`) and Vue 3 docs (`https://vuejs.org/guide`) where applicable.
3. **Plan** — outline the minimal, targeted change set before writing code.
4. **Implement** — apply changes using the TDD red-green-refactor cycle (see below).
5. **Validate** — run all quality commands (see below) and fix every failure before finishing.

---

## Quality commands

Always run all four commands before considering a task complete.
A task is not done unless every command exits with code 0.

```bash
npm run build        # Nuxt build — catches type errors and bad imports
npm run test         # Vitest unit tests
npm run lint         # oxlint — zero warnings and zero errors required
npm run format:check # oxfmt — zero formatting differences required
```

Additional commands:

```bash
npm run lint:fix     # Auto-fix lint issues
npm run format       # Auto-fix formatting
npm run test:watch   # Watch mode during development
npm run dev          # Local dev server
```

Setup (once):

```bash
npm install
cp .env.example .env  # then set API_TOKEN
```

---

## TDD red-green-refactor

Every feature or bug-fix must follow this cycle:

1. **Red** — write a failing test that describes the expected behaviour.
   Run `npm run test` and confirm the test fails before writing any implementation.
2. **Green** — write the minimal implementation that makes the test pass.
   Run `npm run test` again and confirm all tests pass.
3. **Refactor** — clean up the code while keeping all tests green.
   Run the full quality suite (`build`, `test`, `lint`, `format:check`) after refactoring.

Test files live alongside the code they test:

```
app/composables/useApi.ts
app/composables/useApi.test.ts
app/repositories/useProductsRepository.ts
app/repositories/useProductsRepository.test.ts
```

### Writing tests

- Use `vitest` with `happy-dom` environment (configured in `vitest.config.ts`).
- Use `vi.hoisted` for mock variable declarations and `vi.mock` for module mocking.
  Both are automatically hoisted before imports by Vitest's transform, so all
  imports can stay at the top of the test file.
- Mock external modules (`ofetch`, `#app`) at the unit boundary; never make real
  HTTP calls in tests.
- Test files should use `import` at the top, followed by `vi.hoisted` and `vi.mock`,
  then `describe`/`it` blocks.

Example pattern:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMyComposable } from "./useMyComposable";

const { mockDep } = vi.hoisted(() => ({ mockDep: vi.fn() }));
vi.mock("some-module", () => ({ dep: mockDep }));

describe("useMyComposable", () => {
  beforeEach(() => vi.clearAllMocks());

  it("does the right thing", () => {
    mockDep.mockReturnValue("value");
    const result = useMyComposable();
    expect(result).toBe("expected");
  });
});
```

---

## API architecture — Repository pattern

All HTTP calls to `https://api.papevi.com` follow a two-layer pattern:

```
Component / Page
      │
      ▼
Repository composable   (app/repositories/use<Resource>Repository.ts)
      │  calls
      ▼
useApi composable        (app/composables/useApi.ts)
      │  wraps
      ▼
$fetch (ofetch)          configured with baseURL + Authorization header
```

### `useApi` — transport layer

`app/composables/useApi.ts` creates a typed `$fetch` instance pre-configured
with the papevi API base URL and the server-side bearer token:

```ts
import { $fetch } from "ofetch";
import { useRuntimeConfig } from "#app";

export const useApi = () => {
  const config = useRuntimeConfig();
  return $fetch.create({
    baseURL: "https://api.papevi.com",
    headers: { Authorization: `Bearer ${config.apiToken}` },
  });
};
```

The token comes from `runtimeConfig.apiToken` which is populated from the
`API_TOKEN` environment variable. It is **never** exposed to the browser.

### Repository composables — data-access layer

One file per API resource, e.g. `app/repositories/useProductsRepository.ts`:

```ts
import { useApi } from "../composables/useApi";

export interface Product {
  id: string;
  name: string;
  [key: string]: unknown;
}

export const useProductsRepository = () => {
  const api = useApi();
  return {
    findAll: (): Promise<Product[]> => api<Product[]>("/products"),
    findById: (id: string): Promise<Product> => api<Product>(`/products/${id}`),
  };
};
```

Rules:

- Pages and components **must not** call `$fetch` or `useApi` directly; always
  go through a repository composable.
- Repository composables **must not** contain business logic; keep them as thin
  data-mappers.
- Add a `use<Resource>Repository.test.ts` alongside every new repository.

### Adding a new resource

1. Create `app/repositories/use<Resource>Repository.test.ts` (red step).
2. Implement `app/repositories/use<Resource>Repository.ts` (green step).
3. Run the full quality suite.

---

## Nuxt 4 conventions

- Source lives in `app/` (Nuxt 4 default `srcDir`).
- Composables in `app/composables/` are **auto-imported** by Nuxt.
- Pages in `app/pages/` are **auto-imported** as routes (add the directory when
  file-based routing is needed).
- Use explicit imports from `#app` or `ofetch` in composables that need to be
  unit-tested — this avoids requiring the full Nuxt runtime in tests.
- Runtime config (`runtimeConfig`) is the correct place for secrets and
  environment-specific values; never hard-code them.
- Prefer `useFetch` / `useAsyncData` in pages/components for SSR-aware data
  fetching; use repository composables for the actual API calls.

---

## Environment variables

| Variable    | Description                                                  |
| ----------- | ------------------------------------------------------------ |
| `API_TOKEN` | Bearer token for `https://api.papevi.com` (server-side only) |

Copy `.env.example` to `.env` and fill in values before running locally.

---

## Linter and formatter

| Tool   | Config              | Command                |
| ------ | ------------------- | ---------------------- |
| oxlint | `.oxlintrc.json`    | `npm run lint`         |
| oxfmt  | (built-in defaults) | `npm run format:check` |

Rules disabled for Nuxt compatibility (see `.oxlintrc.json`):

- `capitalized-comments` — Nuxt/Vue comments conventionally start lowercase.
- `import/no-named-export` — Nuxt composables use named exports by convention.
- `import/prefer-default-export` — same reason.
- `unicorn/filename-case` — Nuxt composable files use camelCase (`useApi.ts`).
