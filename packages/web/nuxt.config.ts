export default defineNuxtConfig({
  compatibilityDate: "2024-12-01",
  devtools: { enabled: true },

  future: {
    compatibilityVersion: 4,
  },

  srcDir: "src/",
  ssr: false,

  modules: [
    "@nuxtjs/tailwindcss",
    "@pinia/nuxt",
    "@vueuse/nuxt",
    "@nuxt/icon",
    "@nuxt/eslint",
  ],

  tailwindcss: {
    cssPath: ["~/assets/css/tailwind.css", { injectPosition: "first" }],
    configPath: "tailwind.config.ts",
    exposeConfig: {
      level: 2,
    },
    viewer: true,
  },

  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api/v1",
    },
  },

  app: {
    head: {
      title: "Poduim",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "description", content: "Gestionnaire de tournois de baby-foot" },
      ],
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
  },

  typescript: {
    strict: true,
    typeCheck: true,
  },

  imports: {
    dirs: ["composables/**", "stores/**", "utils/**"],
  },

  components: {
    dirs: [
      {
        path: "~/components",
        pathPrefix: false,
      },
    ],
  },

  vite: {
    optimizeDeps: {
      include: ["@poduim/shared", "clsx", "tailwind-merge", "class-variance-authority"],
    },
  },
});
