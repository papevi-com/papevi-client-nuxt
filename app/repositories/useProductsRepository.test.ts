import { beforeEach, describe, expect, it, vi } from "vitest";
import { useProductsRepository } from "./useProductsRepository";

const { mockApiFetch, mockUseApi } = vi.hoisted(() => ({
  mockApiFetch: vi.fn(),
  mockUseApi: vi.fn(),
}));

vi.mock("../composables/useApi", () => ({
  useApi: mockUseApi,
}));

describe("useProductsRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseApi.mockReturnValue(mockApiFetch);
  });

  describe("findAll", () => {
    it("calls the /products endpoint", async () => {
      mockApiFetch.mockResolvedValue([]);

      await useProductsRepository().findAll();

      expect(mockApiFetch).toHaveBeenCalledWith("/products");
    });

    it("returns the list of products returned by the API", async () => {
      const fixture = [{ id: "1", name: "Widget" }];
      mockApiFetch.mockResolvedValue(fixture);

      const result = await useProductsRepository().findAll();

      expect(result).toEqual(fixture);
    });
  });

  describe("findById", () => {
    it("calls the correct /products/:id endpoint", async () => {
      mockApiFetch.mockResolvedValue({ id: "42", name: "Gadget" });

      await useProductsRepository().findById("42");

      expect(mockApiFetch).toHaveBeenCalledWith("/products/42");
    });

    it("returns the single product returned by the API", async () => {
      const fixture = { id: "42", name: "Gadget" };
      mockApiFetch.mockResolvedValue(fixture);

      const result = await useProductsRepository().findById("42");

      expect(result).toEqual(fixture);
    });
  });
});
