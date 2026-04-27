---
name: nuxt-conventions
description: >-
  Nuxt 4 project conventions for this repository: directory layout, auto-imports,
  runtime config, data fetching patterns, and linter rules that are disabled for
  Nuxt compatibility.
---

# Nuxt 4 conventions

## Directory layout

- Source lives in `app/` (Nuxt 4 default `srcDir`).
- Composables in `app/composables/` are **auto-imported** by Nuxt.
- Pages in `app/pages/` are **auto-imported** as routes (add the directory when
  file-based routing is needed).

## Imports in composables

Use explicit imports from `#app` or `ofetch` in composables that need to be
unit-tested — this avoids requiring the full Nuxt runtime in tests.

```ts
import { $fetch } from "ofetch";
import { useRuntimeConfig } from "#app";
```

## Runtime config and secrets

`runtimeConfig` is the correct place for secrets and environment-specific values;
never hard-code them.

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    apiToken: "", // populated from API_TOKEN env var — server-side only
  },
});
```

## Data fetching in pages/components

Prefer `useFetch` / `useAsyncData` in pages and components for SSR-aware data
fetching; use repository composables for the actual API calls.

```ts
// app/pages/products.vue
const { data } = await useFetch(() => useProductsRepository().findAll());
```

## Linter rules disabled for Nuxt compatibility

These rules are turned off in `.oxlintrc.json` because they conflict with Nuxt conventions:

| Rule                           | Reason                                            |
| ------------------------------ | ------------------------------------------------- |
| `capitalized-comments`         | Vue/Nuxt comments conventionally start lowercase  |
| `import/no-named-export`       | Nuxt composables use named exports                |
| `import/prefer-default-export` | Same reason                                       |
| `unicorn/filename-case`        | Nuxt composable files use camelCase (`useApi.ts`) |
