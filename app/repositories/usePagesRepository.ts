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
