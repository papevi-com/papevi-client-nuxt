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

Always wrap repository calls in `useAsyncData` — **never** call a repository method
directly in a page setup without it. `useAsyncData` runs the fetch once on the
server, embeds the result in the SSR payload, and reuses it on the client so no
duplicate network request is made.

```ts
// app/pages/index.vue — fetch all pages
const { data: pages } = await useAsyncData("pages", () => usePagesRepository().findAll());

// app/pages/[slug].vue — fetch a single page by route param
const route = useRoute();
const { data: page } = await useAsyncData(`page-${route.params.slug}`, () =>
  usePagesRepository().findBySlug(route.params.slug as string),
);

// app/app.vue — fetch the main navigation menu once
const { data: menu } = await useAsyncData("menu-main", () =>
  useMenusRepository().findBySlug("main"),
);
```

Keys must be **stable and unique** across the app — a colliding key will return
the wrong cached data.

## Linter rules disabled for Nuxt compatibility

These rules are turned off in `.oxlintrc.json` because they conflict with Nuxt conventions:

| Rule                           | Reason                                            |
| ------------------------------ | ------------------------------------------------- |
| `capitalized-comments`         | Vue/Nuxt comments conventionally start lowercase  |
| `import/no-named-export`       | Nuxt composables use named exports                |
| `import/prefer-default-export` | Same reason                                       |
| `unicorn/filename-case`        | Nuxt composable files use camelCase (`useApi.ts`) |
