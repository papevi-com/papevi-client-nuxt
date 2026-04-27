---
name: api-repository-pattern
description: >-
  The two-layer API architecture used in this project: the useApi transport
  composable and per-resource repository composables. Covers useApi, the
  repository pattern, rules, and how to add a new API resource.
---

# API architecture — Repository pattern

> **API reference**: always consult the full endpoint and schema documentation at
> **https://papevi.com/docs** before implementing or modifying a repository.

All HTTP calls to `https://api.papevi.com` follow a two-layer pattern:

```
Page / Component
      │  useAsyncData("key", …)   ← SSR cache + deduplication lives here
      ▼
Repository composable   (app/repositories/use<Resource>Repository.ts)
      │  calls
      ▼
useApi composable        (app/composables/useApi.ts)
      │  wraps
      ▼
$fetch (ofetch)          configured with baseURL + Authorization header
```

## `useApi` — transport layer

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

The token comes from `runtimeConfig.apiToken`, which is populated from the
`API_TOKEN` environment variable. It is **never** exposed to the browser.

## Repository composables — data-access layer

One file per API resource. Real examples used in this project:

### Pages — `app/repositories/usePagesRepository.ts`

```ts
import { useApi } from "../composables/useApi";

export interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
  [key: string]: unknown;
}

export const usePagesRepository = () => {
  const api = useApi();
  return {
    findAll: (): Promise<Page[]> => api<Page[]>("/pages"),
    findBySlug: (slug: string): Promise<Page> => api<Page>(`/pages/${slug}`),
  };
};
```

### Menus — `app/repositories/useMenusRepository.ts`

```ts
import { useApi } from "../composables/useApi";

interface MenuItem {
  id: string;
  label: string;
  url: string;
  children?: MenuItem[];
  [key: string]: unknown;
}

export interface Menu {
  id: string;
  slug: string;
  items: MenuItem[];
  [key: string]: unknown;
}

export const useMenusRepository = () => {
  const api = useApi();
  return {
    findAll: (): Promise<Menu[]> => api<Menu[]>("/menus"),
    findBySlug: (slug: string): Promise<Menu> => api<Menu>(`/menus/${slug}`),
  };
};
```

> Refer to **https://papevi.com/docs** for the full field schemas of each resource.

## Caching

Repository composables are intentionally **stateless and uncached** — they fire a fresh
`$fetch` on every call. Caching is handled one layer up by Nuxt's `useAsyncData`
in pages and components.

`useAsyncData` provides:

- **SSR deduplication** — the request runs once on the server; the result is
  serialized into the HTML payload so the client never issues a second HTTP request
  for the same key on initial load.
- **Key-based deduplication** — concurrent calls with the same key share a single
  in-flight request.
- **Navigation cache** — during client-side navigation, data fetched with a key that
  is still live in the Nuxt payload is reused without a network round-trip.

**Always wrap repository calls in `useAsyncData` with a stable, unique key:**

```ts
// app/pages/menus.vue
const { data: menus } = await useAsyncData("menus", () => useMenusRepository().findAll());

// app/pages/[slug].vue
const route = useRoute();
const { data: page } = await useAsyncData(`page-${route.params.slug}`, () =>
  usePagesRepository().findBySlug(route.params.slug as string),
);
```

> **Never** call a repository method outside `useAsyncData` (or `useFetch`) in a
> page or component — you will bypass SSR and spam the API on every render.

## Rules

- Pages and components **must not** call `$fetch` or `useApi` directly; always
  go through a repository composable.
- Repository composables **must not** contain business logic; keep them as thin
  data-mappers.
- Add a `use<Resource>Repository.test.ts` alongside every new repository.

## Adding a new resource

1. Create `app/repositories/use<Resource>Repository.test.ts` (red step — see `tdd` skill).
2. Implement `app/repositories/use<Resource>Repository.ts` (green step).
3. Run the full quality suite:
   ```bash
   npm run build && npm run test && npm run lint && npm run format:check
   ```
