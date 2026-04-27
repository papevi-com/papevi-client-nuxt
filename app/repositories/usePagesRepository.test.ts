import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePagesRepository } from "./usePagesRepository";

const { mockApiFetch, mockUseApi } = vi.hoisted(() => ({
  mockApiFetch: vi.fn(),
  mockUseApi: vi.fn(),
}));

vi.mock("../composables/useApi", () => ({
  useApi: mockUseApi,
}));

describe("usePagesRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseApi.mockReturnValue(mockApiFetch);
  });

  describe("findAll", () => {
    it("calls the /pages endpoint", async () => {
      mockApiFetch.mockResolvedValue([]);

      await usePagesRepository().findAll();

      expect(mockApiFetch).toHaveBeenCalledWith("/pages");
    });

    it("returns the list of pages returned by the API", async () => {
      const fixture = [{ content: "", id: "1", slug: "home", title: "Home" }];
      mockApiFetch.mockResolvedValue(fixture);

      const result = await usePagesRepository().findAll();

      expect(result).toEqual(fixture);
    });
  });

  describe("findBySlug", () => {
    it("calls the correct /pages/:slug endpoint", async () => {
      mockApiFetch.mockResolvedValue({
        content: "",
        id: "1",
        slug: "home",
        title: "Home",
      });

      await usePagesRepository().findBySlug("home");

      expect(mockApiFetch).toHaveBeenCalledWith("/pages/home");
    });

    it("returns the single page returned by the API", async () => {
      const fixture = { content: "", id: "1", slug: "home", title: "Home" };
      mockApiFetch.mockResolvedValue(fixture);

      const result = await usePagesRepository().findBySlug("home");

      expect(result).toEqual(fixture);
    });
  });
});
