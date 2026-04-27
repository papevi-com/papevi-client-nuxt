import { $fetch } from "ofetch";
import { useRuntimeConfig } from "#app";

export const useApi = () => {
  const config = useRuntimeConfig();
  return $fetch.create({
    baseURL: "https://api.papevi.com",
    headers: {
      Authorization: `Bearer ${config.apiToken}`,
    },
  });
};
