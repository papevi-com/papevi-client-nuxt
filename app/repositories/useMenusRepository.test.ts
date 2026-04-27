import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMenusRepository } from "./useMenusRepository";

const { mockApiFetch, mockUseApi } = vi.hoisted(() => ({
  mockApiFetch: vi.fn(),
  mockUseApi: vi.fn(),
}));

vi.mock("../composables/useApi", () => ({
  useApi: mockUseApi,
}));

describe("useMenusRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseApi.mockReturnValue(mockApiFetch);
  });

  describe("findAll", () => {
    it("calls the /menus endpoint", async () => {
      mockApiFetch.mockResolvedValue([]);

      await useMenusRepository().findAll();

      expect(mockApiFetch).toHaveBeenCalledWith("/menus");
    });

    it("returns the list of menus returned by the API", async () => {
      const fixture = [{ id: "1", items: [], slug: "main" }];
      mockApiFetch.mockResolvedValue(fixture);

      const result = await useMenusRepository().findAll();

      expect(result).toEqual(fixture);
    });
  });

  describe("findBySlug", () => {
    it("calls the correct /menus/:slug endpoint", async () => {
      mockApiFetch.mockResolvedValue({ id: "1", items: [], slug: "main" });

      await useMenusRepository().findBySlug("main");

      expect(mockApiFetch).toHaveBeenCalledWith("/menus/main");
    });

    it("returns the single menu returned by the API", async () => {
      const fixture = {
        id: "1",
        items: [{ id: "10", label: "Home", url: "/" }],
        slug: "main",
      };
      mockApiFetch.mockResolvedValue(fixture);

      const result = await useMenusRepository().findBySlug("main");

      expect(result).toEqual(fixture);
    });
  });
});
