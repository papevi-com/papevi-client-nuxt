---
name: api-repository-pattern
description: >-
  The two-layer API architecture used in this project: the useApi transport
  composable and per-resource repository composables. Covers useApi, the
  repository pattern, rules, and how to add a new API resource.
---

# API architecture — Repository pattern

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
