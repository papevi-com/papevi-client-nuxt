import { beforeEach, describe, expect, it, vi } from "vitest";
import { useApi } from "./useApi";

const { mockCreate, mockUseRuntimeConfig } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockUseRuntimeConfig: vi.fn(),
}));

vi.mock("ofetch", () => ({
  $fetch: { create: mockCreate },
}));

vi.mock("#app", () => ({
  useRuntimeConfig: mockUseRuntimeConfig,
}));

describe("useApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a $fetch instance with the papevi base URL", () => {
    mockUseRuntimeConfig.mockReturnValue({ apiToken: "test-token" });

    useApi();

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: "https://api.papevi.com",
      }),
    );
  });

  it("includes the bearer token from runtimeConfig in the Authorization header", () => {
    mockUseRuntimeConfig.mockReturnValue({ apiToken: "my-secret" });

    useApi();

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer my-secret",
        }),
      }),
    );
  });
});
