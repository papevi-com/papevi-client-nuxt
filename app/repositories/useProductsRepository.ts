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
