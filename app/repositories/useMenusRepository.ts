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
