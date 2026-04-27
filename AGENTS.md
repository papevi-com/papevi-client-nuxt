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
2. **Docs** — consult the Papevi API docs (`https://papevi.com/docs`), Nuxt 4 docs (`https://nuxt.com/docs`), and Vue 3 docs (`https://vuejs.org/guide`) where applicable.
3. **Plan** — outline the minimal, targeted change set before writing code.
4. **Implement** — apply changes using the TDD red-green-refactor cycle (invoke skill: `tdd`).
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

## Skills

Detailed how-to guides are available as on-demand skills:

| Skill                    | File                                       | When to invoke                                                   |
| ------------------------ | ------------------------------------------ | ---------------------------------------------------------------- |
| `tdd`                    | `.github/skills/tdd.md`                    | Writing tests, mocking patterns, red-green-refactor cycle        |
| `api-repository-pattern` | `.github/skills/api-repository-pattern.md` | Adding API calls, new resources, repository structure            |
| `nuxt-conventions`       | `.github/skills/nuxt-conventions.md`       | Nuxt 4 directory layout, auto-imports, data fetching, lint rules |

---

## Environment variables

| Variable    | Description                                                  |
| ----------- | ------------------------------------------------------------ |
| `API_TOKEN` | Bearer token for `https://api.papevi.com` (server-side only) |

Copy `.env.example` to `.env` and fill in values before running locally.
