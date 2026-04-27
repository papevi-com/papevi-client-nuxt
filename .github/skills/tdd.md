---
name: tdd
description: >-
  TDD red-green-refactor workflow for this repository: how to write failing tests
  first, implement to make them pass, then refactor. Includes Vitest patterns,
  mocking conventions, and the test file layout.
---

# TDD red-green-refactor

Every feature or bug-fix must follow this cycle:

1. **Red** — write a failing test that describes the expected behaviour.
   Run `npm run test` and confirm the test fails before writing any implementation.
2. **Green** — write the minimal implementation that makes the test pass.
   Run `npm run test` again and confirm all tests pass.
3. **Refactor** — clean up the code while keeping all tests green.
   Run the full quality suite (`build`, `test`, `lint`, `format:check`) after refactoring.

## Test file layout

Test files live alongside the code they test:

```
app/composables/useApi.ts
app/composables/useApi.test.ts
app/repositories/useProductsRepository.ts
app/repositories/useProductsRepository.test.ts
```

## Writing tests

- Use `vitest` with `happy-dom` environment (configured in `vitest.config.ts`).
- Use `vi.hoisted` for mock variable declarations and `vi.mock` for module mocking.
  Both are automatically hoisted before imports by Vitest's transform, so all
  imports can stay at the top of the test file.
- Mock external modules (`ofetch`, `#app`) at the unit boundary; never make real
  HTTP calls in tests.
- Test files use `import` at the top, followed by `vi.hoisted` and `vi.mock`,
  then `describe`/`it` blocks.

## Example pattern

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

## Quality commands

```bash
npm run test         # run all tests once
npm run test:watch   # watch mode during development
```
