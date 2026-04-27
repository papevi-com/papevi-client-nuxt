// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/test-utils/module"],

  // Server-side runtime config; values are populated from environment variables.
  // API_TOKEN → runtimeConfig.apiToken (never exposed to the browser)
  runtimeConfig: {
    apiToken: "",
  },
});
